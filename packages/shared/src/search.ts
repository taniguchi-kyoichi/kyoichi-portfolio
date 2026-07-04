// D1(FTS5 trigram) + Vectorize(bge-m3 KNN) の検索。ローカル db.ts の ftsSearch/semanticSearch/hybridSearch を
// D1 + Vectorize 向けに移植。RRF 融合ロジックは同一。

export interface SearchOpts { category?: string; status?: string; dateFrom?: string; dateTo?: string; limit?: number }

export interface D1Stmt {
  bind(...args: unknown[]): D1Stmt
  all<T = unknown>(): Promise<{ results: T[] }>
  first<T = unknown>(): Promise<T | null>
}
export interface D1Like {
  prepare(sql: string): D1Stmt
}
export interface VectorizeLike {
  query(vector: number[], opts: { topK: number; returnMetadata?: 'all' | 'indexed' | 'none' }): Promise<{
    matches: { id: string; score: number; metadata?: Record<string, unknown> }[]
  }>
  getByIds(ids: string[]): Promise<{ id: string; values?: number[]; metadata?: Record<string, unknown> }[]>
}

/** 全文（trigram FTS・bm25 ランク）。ローカル ftsSearch と同一 SQL 形（? バインドに変換）。 */
export async function ftsSearch(db: D1Like, q: string, opts: SearchOpts = {}) {
  const match = `"${q.replace(/"/g, '""')}"`
  const args: unknown[] = [match]
  let sql = `
    SELECT d.path, d.title, d.category, d.created, d.status,
           snippet(doc_fts, 2, '⟦', '⟧', ' … ', 12) AS snippet,
           bm25(doc_fts) AS score
    FROM doc_fts JOIN doc d ON d.path = doc_fts.path
    WHERE doc_fts MATCH ?`
  if (opts.category) { sql += ` AND d.category LIKE ?`; args.push(opts.category + '%') }
  if (opts.status)   { sql += ` AND d.status = ?`; args.push(opts.status) }
  if (opts.dateFrom) { sql += ` AND d.created >= ?`; args.push(opts.dateFrom) }
  if (opts.dateTo)   { sql += ` AND d.created <= ?`; args.push(opts.dateTo) }
  sql += ` ORDER BY score LIMIT ?`; args.push(opts.limit ?? 20)
  const { results } = await db.prepare(sql).bind(...args).all()
  return results as any[]
}

/** 意味検索。Vectorize KNN（chunk 粒度）→ metadata.path で doc 単位に min 距離集約 → D1 でメタ enrich。 */
export async function semanticSearch(db: D1Like, vx: VectorizeLike, qvec: number[], opts: SearchOpts = {}) {
  // Vectorize v2: returnMetadata:'all' の topK 上限は 50。chunk→doc 集約に十分。
  const topK = Math.min((opts.limit ?? 20) * 6, 50)
  const { matches } = await vx.query(qvec, { topK, returnMetadata: 'all' })
  const best = new Map<string, { path: string; heading?: string; distance: number }>()
  for (const m of matches) {
    const path = String(m.metadata?.path ?? '')
    if (!path) continue
    const distance = 1 - m.score // cosine similarity → distance に揃える（ローカルと符号を合わせる）
    if (!best.has(path) || distance < best.get(path)!.distance)
      best.set(path, { path, heading: m.metadata?.heading as string | undefined, distance })
  }
  return enrich(db, [...best.values()].sort((a, b) => a.distance - b.distance), opts)
}

async function enrich(db: D1Like, entries: { path: string; distance: number; heading?: string }[], opts: SearchOpts) {
  const out: any[] = []
  for (const e of entries) {
    const m = await db.prepare(`SELECT path,title,category,created,status FROM doc WHERE path = ?`).bind(e.path).first<any>()
    if (!m) continue
    if (opts.category && !String(m.category).startsWith(opts.category)) continue
    if (opts.status && m.status !== opts.status) continue
    if (opts.dateFrom && (m.created ?? '') < opts.dateFrom) continue
    if (opts.dateTo && (m.created ?? '') > opts.dateTo) continue
    out.push({ ...m, distance: e.distance, matchedHeading: e.heading })
  }
  return out.slice(0, opts.limit ?? 20)
}

/** 類似文書。対象 doc の先頭チャンクの埋め込みで KNN → 近傍 doc を集約（自身を除外）。ローカル db.ts.related と同義。 */
export async function related(db: D1Like, vx: VectorizeLike, path: string, opts: { limit?: number } = {}) {
  const { results } = await db.prepare(`SELECT id FROM chunk WHERE path = ? ORDER BY ord LIMIT 5`).bind(path).all<{ id: string }>()
  const ids = results.map((r) => r.id)
  if (!ids.length) return []
  const vecs = await vx.getByIds(ids)
  const agg = new Map<string, number>()
  for (const v of vecs) {
    if (!v.values) continue
    const { matches } = await vx.query(v.values, { topK: 12, returnMetadata: 'all' })
    for (const m of matches) {
      const p = String(m.metadata?.path ?? '')
      if (!p || p === path) continue
      const distance = 1 - m.score
      if (!agg.has(p) || distance < agg.get(p)!) agg.set(p, distance)
    }
  }
  const entries = [...agg.entries()].map(([p, d]) => ({ path: p, distance: d })).sort((a, b) => a.distance - b.distance)
  return enrich(db, entries, { limit: opts.limit ?? 10 })
}

/** ハイブリッド: FTS と意味検索を Reciprocal Rank Fusion で融合（ローカルと同一 K=60）。 */
export async function hybridSearch(db: D1Like, vx: VectorizeLike, q: string, qvec: number[], opts: SearchOpts = {}) {
  const N = (opts.limit ?? 20) * 3
  const [fts, sem] = await Promise.all([
    ftsSearch(db, q, { ...opts, limit: N }),
    semanticSearch(db, vx, qvec, { ...opts, limit: N }),
  ])
  const K = 60
  const score = new Map<string, { path: string; rrf: number; row: any }>()
  const add = (rows: any[]) => rows.forEach((r, i) => {
    const cur = score.get(r.path) ?? { path: r.path, rrf: 0, row: r }
    cur.rrf += 1 / (K + i + 1); cur.row = { ...cur.row, ...r }
    score.set(r.path, cur)
  })
  add(fts); add(sem)
  return [...score.values()].sort((a, b) => b.rrf - a.rrf).slice(0, opts.limit ?? 20).map((s) => ({ ...s.row, rrf: s.rrf }))
}
