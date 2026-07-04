// KB API Worker。ローカル tools/life-index/src/api.ts の read 経路を D1+Vectorize+Workers AI へ移植。
// write(索引更新)は GitHub Action の ingest 経路（別途 H2）。ここは read の関所。
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  ftsSearch, semanticSearch, hybridSearch, related, buildHome, embedQuery, requireAccess, fetchBoard,
  type D1Like, type VectorizeLike, type AiBinding,
} from '@cloud-hub/shared'

export interface Env {
  DB: D1Database
  VX: VectorizeIndex
  AI: AiBinding
  ACCESS_TEAM_DOMAIN: string
  ACCESS_AUD: string
  INTERNAL_SECRET: string  // service binding(mcp→api)用の共有シークレット。Worker secret + 1Password
  GITHUB_TOKEN?: string    // board 読み取り用（Worker secret）。無ければ /api/board は 503
  BOARD_OWNER: string
  BOARD_NUMBER: string
}

const app = new Hono<{ Bindings: Env }>()

// 認証対象外の生存確認（/api/* ミドルウェアの外）。デプロイ疎通用。
app.get('/health', (c) => c.json({ ok: true, service: 'cloud-hub-api' }))

app.use('/api/*', cors())

// origin JWT 検証（edge を迂回した直アクセスの backstop）。service binding 経由の in-account 呼び出しは
// Access を通らないので、内部呼び出しは X-Internal ヘッダ+相互合意で通す設計（mcp からの service binding 用）。
app.use('/api/*', async (c, next) => {
  // service binding（in-account, Access 迂回）は共有シークレット一致で通す。header の固定値ではない＝spoof 不可。
  const sec = c.env.INTERNAL_SECRET
  if (sec && c.req.header('X-Internal-Service') === sec) return next()
  const cfg = { teamDomain: c.env.ACCESS_TEAM_DOMAIN, aud: c.env.ACCESS_AUD }
  try { await requireAccess(c.req.raw, cfg) } catch (e) { return e as Response }
  return next()
})

// エラーは console へ（wrangler tail で観測）。レスポンスにスタックを漏らさない。
app.onError((err, c) => {
  console.error('api error:', (err as Error)?.stack || err)
  return c.text('Internal Server Error', 500)
})

const num = (v: string | undefined, d?: number) => (v ? Number(v) : d)

app.get('/api/search', async (c) => {
  const { q, mode, category, status, dateFrom, dateTo, limit } = c.req.query()
  if (!q) return c.json([])
  const db = c.env.DB as unknown as D1Like
  const vx = c.env.VX as unknown as VectorizeLike
  const opts = { category, status, dateFrom, dateTo, limit: num(limit, 20) }
  if (mode === 'fts') return c.json(await ftsSearch(db, q, opts))
  const qvec = await embedQuery(c.env.AI, q)
  if (mode === 'semantic') return c.json(await semanticSearch(db, vx, qvec, opts))
  return c.json(await hybridSearch(db, vx, q, qvec, opts))
})

app.get('/api/list', async (c) => {
  const { category, status, tag, limit } = c.req.query()
  const args: unknown[] = []
  let sql = `SELECT path, title, category, created, status, status_raw FROM doc`
  const where: string[] = []
  if (category) { where.push(`category LIKE ?`); args.push(category + '%') }
  if (status)   { where.push(`status = ?`); args.push(status) }
  if (tag)      { where.push(`tags LIKE ?`); args.push(`%"${tag}"%`) }
  if (where.length) sql += ` WHERE ` + where.join(' AND ')
  sql += ` ORDER BY created DESC, path LIMIT ?`; args.push(num(limit, 50))
  const { results } = await c.env.DB.prepare(sql).bind(...args).all()
  return c.json(results)
})

app.get('/api/facets', async (c) => {
  const byCategory = (await c.env.DB.prepare(`SELECT category, COUNT(*) n FROM doc GROUP BY category ORDER BY n DESC`).all()).results
  const byStatus = (await c.env.DB.prepare(`SELECT COALESCE(status,'(none)') status, COUNT(*) n FROM doc GROUP BY status ORDER BY n DESC`).all()).results
  const total = (await c.env.DB.prepare(`SELECT COUNT(*) n FROM doc`).first<any>())?.n ?? 0
  // tags は JSON 配列で doc.tags に保持済み → ここで集計（再取込不要）。上位のみ返す。
  const tagRows = (await c.env.DB.prepare(`SELECT tags FROM doc WHERE tags IS NOT NULL AND tags NOT IN ('', '[]')`).all<{ tags: string }>()).results
  const tagCount = new Map<string, number>()
  for (const r of tagRows) { try { for (const t of JSON.parse(r.tags) as string[]) tagCount.set(t, (tagCount.get(t) ?? 0) + 1) } catch { /* 壊れた tags はスキップ */ } }
  const byTag = [...tagCount.entries()].map(([tag, n]) => ({ tag, n })).sort((a, b) => b.n - a.n).slice(0, 24)
  return c.json({ total, byCategory, byStatus, byTag })
})

app.get('/api/doc', async (c) => {
  const path = c.req.query('path')!
  const meta = await c.env.DB.prepare(`SELECT * FROM doc WHERE path = ?`).bind(path).first<any>()
  if (!meta) return c.json({ error: 'not found', path }, 404)
  meta.tags = JSON.parse(meta.tags || '[]')
  return c.json({ ...meta, body: meta.body ?? '' }) // 本文は D1 の doc.body（クラウドは FS が無い）
})

app.get('/api/outline', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT level, text, ord FROM heading WHERE path = ? ORDER BY ord`).bind(c.req.query('path')!).all()
  return c.json(results)
})

app.get('/api/related', async (c) => {
  const path = c.req.query('path')
  if (!path) return c.json([])
  const limit = num(c.req.query('limit'), 10)
  return c.json(await related(c.env.DB as unknown as D1Like, c.env.VX as unknown as VectorizeLike, path, { limit }))
})

app.get('/api/home', async (c) => {
  const d = new Date()
  const today = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
  return c.json(await buildHome(c.env.DB as unknown as D1Like, today))
})

// board（GitHub Projects #2）の Brief。read のみ。トークンが無い環境では 503（Home は board 無しで描画継続）。
app.get('/api/board', async (c) => {
  const token = c.env.GITHUB_TOKEN
  if (!token) return c.json({ error: 'board unavailable (no GITHUB_TOKEN)' }, 503)
  const brief = await fetchBoard(token, {
    login: c.env.BOARD_OWNER || 'taniguchi-kyoichi',
    number: Number(c.env.BOARD_NUMBER || '2'),
    now: new Date().toISOString(),
  })
  c.header('Cache-Control', 'private, max-age=60')
  return c.json(brief)
})

// HTML 成果物ギャラリー: 一覧（メタのみ）と本文（text/html で iframe render 用）。
app.get('/api/artifacts', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT path, title, theme, created FROM artifact ORDER BY created DESC, path`,
    ).all()
    return c.json(results)
  } catch { return c.json([]) } // ingest 前は artifact テーブル未作成 → 空
})

app.get('/api/artifact', async (c) => {
  const path = c.req.query('path')
  if (!path) return c.text('missing path', 400)
  const row = await c.env.DB.prepare(`SELECT html FROM artifact WHERE path = ?`).bind(path).first<{ html: string }>()
  if (!row) return c.text('not found', 404)
  return c.body(row.html, 200, { 'Content-Type': 'text/html; charset=utf-8' })
})

app.get('/api/health', (c) => c.json({ ok: true, service: 'cloud-hub-api' }))

export default app
