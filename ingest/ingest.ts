// cloud-hub H2 ingest — life の .md を Workers AI(bge-m3) で埋め込み D1 + Vectorize へ upsert。
// ローカル/CI 実行。認証は CLOUDFLARE_API_TOKEN(op run で注入)。公開 Worker に書込口は開けない。
//
//   op run --env-file=.env.cloudflare.tpl -- bun ingest/ingest.ts <file.md ...>
//   LIFE_ROOT 既定 /Users/kyoichi/life（doc.path はここからの相対パス）。
import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import matter from 'gray-matter'
import { selectScopedFiles, selectScopedArtifacts } from './scope.js'

const TOKEN = process.env.CLOUDFLARE_API_TOKEN
const ACCT = process.env.CLOUDFLARE_ACCOUNT_ID
const LIFE_ROOT = process.env.LIFE_ROOT || '/Users/kyoichi/life'
const D1_ID = 'cc2716ad-ea90-4d67-896b-04cf804f8c9c'
const VECTORIZE = 'life-index'
const MODEL = '@cf/baai/bge-m3'
const EMBED_BATCH = 50
if (!TOKEN || !ACCT) { console.error('CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID が必要（op run 経由）'); process.exit(1) }

const API = `https://api.cloudflare.com/client/v4/accounts/${ACCT}`
const H = { Authorization: `Bearer ${TOKEN}` }

async function cf(path: string, init: RequestInit): Promise<any> {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } })
  const j: any = await res.json().catch(() => ({}))
  if (!res.ok || j.success === false) throw new Error(`CF ${path} → ${res.status} ${JSON.stringify(j.errors || j).slice(0, 300)}`)
  return j
}

/** Workers AI bge-m3 で埋め込み（1024次元）。バッチで。 */
async function embed(texts: string[]): Promise<number[][]> {
  const out: number[][] = []
  for (let i = 0; i < texts.length; i += EMBED_BATCH) {
    const j = await cf(`/ai/run/${MODEL}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texts.slice(i, i + EMBED_BATCH) }),
    })
    out.push(...j.result.data)
  }
  return out
}

/** D1 に単一 SQL（? バインド）を実行。 */
async function d1(sql: string, params: unknown[] = []): Promise<void> {
  await cf(`/d1/database/${D1_ID}/query`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  })
}

/** 多行 INSERT をバッチで（呼び出し回数を大幅削減）。D1 は 1 文あたり最大 100 バインド変数。 */
async function insertRows(table: string, cols: string[], rows: unknown[][]): Promise<void> {
  if (!rows.length) return
  const perStmt = Math.max(1, Math.floor(90 / cols.length)) // 変数数 = cols*perStmt ≤ 90（安全側）
  const ph = `(${cols.map(() => '?').join(',')})`
  for (let i = 0; i < rows.length; i += perStmt) {
    const slice = rows.slice(i, i + perStmt)
    await d1(`INSERT INTO ${table}(${cols.join(',')}) VALUES ${slice.map(() => ph).join(',')}`, slice.flat())
  }
}

/** Vectorize へ NDJSON で upsert。 */
async function vectorizeUpsert(rows: { id: string; values: number[]; metadata: Record<string, unknown> }[]): Promise<void> {
  if (!rows.length) return
  const ndjson = rows.map((r) => JSON.stringify(r)).join('\n')
  await cf(`/vectorize/v2/indexes/${VECTORIZE}/upsert`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-ndjson' }, body: ndjson,
  })
}

/** D1 の SELECT。results を返す。 */
async function d1Rows<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const j = await cf(`/d1/database/${D1_ID}/query`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sql, params }),
  })
  return (j.result?.[0]?.results ?? []) as T[]
}

/** Vectorize から id 群を削除。 */
async function vectorizeDeleteByIds(ids: string[]): Promise<void> {
  if (!ids.length) return
  await cf(`/vectorize/v2/indexes/${VECTORIZE}/delete_by_ids`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }),
  })
}

/** path の doc を D1 + Vectorize から完全削除。 */
async function deleteDocByPath(path: string): Promise<void> {
  const rows = await d1Rows<{ id: string }>(`SELECT id FROM chunk WHERE path = ?`, [path])
  await vectorizeDeleteByIds(rows.map((r) => r.id))
  for (const t of ['doc', 'doc_fts', 'heading', 'link', 'chunk']) await d1(`DELETE FROM ${t} WHERE ${t === 'link' ? 'src' : 'path'} = ?`, [path])
}

const sha1 = (s: string) => createHash('sha1').update(s).digest('hex')

interface Heading { level: number; text: string; ord: number }
interface Chunk { id: string; ord: number; heading: string; text: string }
interface Doc {
  path: string; title: string; category: string; created: string
  status: string; tags: string[]; body: string; headings: Heading[]; links: string[]; chunks: Chunk[]
}

function splitBySize(text: string, max = 1500): string[] {
  if (text.length <= max) return [text]
  const parts: string[] = []
  const paras = text.split(/\n{2,}/)
  let cur = ''
  for (const p of paras) {
    if ((cur + '\n\n' + p).length > max && cur) { parts.push(cur); cur = p }
    else cur = cur ? cur + '\n\n' + p : p
    while (cur.length > max) { parts.push(cur.slice(0, max)); cur = cur.slice(max) }
  }
  if (cur.trim()) parts.push(cur)
  return parts
}

/** frontmatter の created を YYYY-MM-DD へ正規化。YAML が Date に解釈した値や full timestamp も揃える。 */
function toISODate(v: unknown): string {
  if (v == null || v === '') return ''
  if (v instanceof Date) return isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10)
  const s = String(v)
  const m = /^\d{4}-\d{2}-\d{2}/.exec(s)
  if (m) return m[0]
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toISOString().slice(0, 10)
}

function parseDoc(absPath: string): Doc {
  const raw = readFileSync(absPath, 'utf8')
  const { data, content } = matter(raw)
  const path = relative(LIFE_ROOT, absPath)
  const title = String(data.title ?? path.split('/').pop() ?? path)
  const category = path.split('/').slice(0, -1).join('/')
  const headings: Heading[] = []
  const links: string[] = []
  let ord = 0
  for (const line of content.split('\n')) {
    const h = line.match(/^(#{1,6})\s+(.*)/)
    if (h) headings.push({ level: h[1].length, text: h[2].trim(), ord: ord++ })
    for (const m of line.matchAll(/\[\[([^\]]+)\]\]/g)) links.push(m[1].trim())
  }
  // チャンク（見出し境界＋サイズ上限）。決定的 ID = sha1(path)#ord。
  const chunks: Chunk[] = []
  const sections: { heading: string; lines: string[] }[] = []
  let sec = { heading: '', lines: [] as string[] }
  for (const line of content.split('\n')) {
    const h = line.match(/^#{1,6}\s+(.*)/)
    if (h) { if (sec.lines.length) sections.push(sec); sec = { heading: h[1].trim(), lines: [] } }
    else sec.lines.push(line)
  }
  if (sec.lines.length) sections.push(sec)
  let cord = 0
  const ph = sha1(path)
  for (const s of sections) {
    const t = s.lines.join('\n').trim()
    if (!t) continue
    for (const piece of splitBySize(t)) chunks.push({ id: `${ph}#${cord}`, ord: cord++, heading: s.heading, text: piece })
  }
  return {
    path, title, category, created: toISODate(data.created), status: String(data.status ?? ''),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [], body: content, headings, links, chunks,
  }
}

async function ingestDoc(doc: Doc): Promise<number> {
  // 冪等: path 単位で全消し→入れ直し。
  for (const t of ['doc', 'doc_fts', 'heading', 'link', 'chunk']) await d1(`DELETE FROM ${t} WHERE ${t === 'link' ? 'src' : 'path'} = ?`, [doc.path])
  const hash = sha1(doc.body)
  await d1(
    `INSERT INTO doc(path,title,category,created,status,status_raw,tags,mtime,body_len,content_hash,body)
     VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
    [doc.path, doc.title, doc.category, doc.created, doc.status, doc.status, JSON.stringify(doc.tags), 0, doc.body.length, hash, doc.body],
  )
  await d1(`INSERT INTO doc_fts(path,title,body) VALUES(?,?,?)`, [doc.path, doc.title, doc.body])
  await insertRows('heading', ['path', 'level', 'text', 'ord'], doc.headings.map((h) => [doc.path, h.level, h.text, h.ord]))
  await insertRows('link', ['src', 'dst'], doc.links.map((l) => [doc.path, l]))
  await insertRows('chunk', ['id', 'path', 'heading', 'ord', 'text'], doc.chunks.map((c) => [c.id, doc.path, c.heading, c.ord, c.text]))
  // 埋め込み → Vectorize upsert。
  if (doc.chunks.length) {
    const vecs = await embed(doc.chunks.map((c) => c.text))
    await vectorizeUpsert(doc.chunks.map((c, i) => ({ id: c.id, values: vecs[i], metadata: { path: doc.path, heading: c.heading } })))
  }
  return doc.chunks.length
}

// ── HTML 成果物（artifact）— 埋め込みなし、丸ごと D1 に保持して hub が render する ──
async function ensureArtifactTable(): Promise<void> {
  await d1(`CREATE TABLE IF NOT EXISTS artifact(path TEXT PRIMARY KEY, title TEXT, theme TEXT, created TEXT, content_hash TEXT, html TEXT)`)
}

function parseArtifact(absPath: string): { path: string; title: string; theme: string; created: string; hash: string; html: string } {
  const html = readFileSync(absPath, 'utf8')
  const path = relative(LIFE_ROOT, absPath)
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || path.split('/').pop()!
  const title = t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  const seg = path.split('/')
  const theme = seg.length >= 2 ? seg[seg.length - 2] : seg[0]   // 直上ディレクトリ名
  const created = path.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? ''    // ファイル名の日付（無ければ空）
  return { path, title, theme, created, hash: sha1(html), html }
}

async function ingestArtifacts(): Promise<{ added: number; changed: number; unchanged: number; removed: number }> {
  await ensureArtifactTable()
  const rels = selectScopedArtifacts(LIFE_ROOT)
  const existing = new Map<string, string>()
  for (const r of await d1Rows<{ path: string; content_hash: string }>(`SELECT path, content_hash FROM artifact`)) existing.set(r.path, r.content_hash)
  const seen = new Set<string>()
  let added = 0, changed = 0, unchanged = 0, removed = 0
  for (const rel of rels) {
    const a = parseArtifact(resolve(LIFE_ROOT, rel))
    seen.add(a.path)
    if (existing.get(a.path) === a.hash) { unchanged++; continue }
    await d1(`DELETE FROM artifact WHERE path = ?`, [a.path])
    await d1(`INSERT INTO artifact(path,title,theme,created,content_hash,html) VALUES(?,?,?,?,?,?)`, [a.path, a.title, a.theme, a.created, a.hash, a.html])
    if (existing.has(a.path)) changed++; else added++
    console.log(`  [artifact] ✓ ${a.path} — ${a.title}`)
  }
  for (const p of existing.keys()) if (!seen.has(p)) { await d1(`DELETE FROM artifact WHERE path = ?`, [p]); removed++ }
  return { added, changed, unchanged, removed }
}

const args = process.argv.slice(2)
const scopeMode = args.includes('--scope')
// --scope: scope.ts の宣言的スコープ（コア知識）を対象に incremental。それ以外は明示ファイルパスを upsert。
const files = scopeMode
  ? selectScopedFiles(LIFE_ROOT).map((rel) => resolve(LIFE_ROOT, rel))
  : args.filter((a) => !a.startsWith('--')).map((a) => resolve(a))
if (!files.length) { console.error('usage: bun ingest/ingest.ts (--scope | <file.md ...>)'); process.exit(1) }

// incremental: 既存 content_hash と比較し、本文不変はスキップ（埋め込みを回避）。
const existing = new Map<string, string>()
for (const r of await d1Rows<{ path: string; content_hash: string }>(`SELECT path, content_hash FROM doc`)) existing.set(r.path, r.content_hash)

console.log(`ingest: ${files.length} files${scopeMode ? ' (scope=core, incremental)' : ''}, ${existing.size} already indexed`)
const seen = new Set<string>()
let added = 0, changed = 0, unchanged = 0, removed = 0, totalChunks = 0, fail = 0
for (let i = 0; i < files.length; i++) {
  try {
    const doc = parseDoc(files[i])
    seen.add(doc.path)
    if (existing.get(doc.path) === sha1(doc.body)) { unchanged++; continue }
    const n = await ingestDoc(doc)
    totalChunks += n
    if (existing.has(doc.path)) changed++; else added++
    if ((added + changed) % 10 === 0 || files.length < 20) console.log(`  [${i + 1}/${files.length}] ✓ ${doc.path} (${n} chunks)`)
  } catch (e) {
    fail++
    console.error(`  [${i + 1}/${files.length}] ✗ ${files[i]}: ${(e as Error).message}`)
  }
}
// scope 実行時のみ削除を反映（全体像が分かるため）。スコープ外/削除された path を index から除去。
if (scopeMode) {
  for (const p of existing.keys()) if (!seen.has(p)) { try { await deleteDocByPath(p); removed++ } catch (e) { console.error(`  ✗ delete ${p}: ${(e as Error).message}`) } }
}
console.log(`\ndone: +${added} added, ~${changed} changed, =${unchanged} unchanged, -${removed} removed, ${fail} failed, ${totalChunks} chunks embedded`)

// HTML 成果物の索引（scope 実行時のみ・埋め込みなしで軽い）。
if (scopeMode) {
  const a = await ingestArtifacts()
  console.log(`artifacts: +${a.added} added, ~${a.changed} changed, =${a.unchanged} unchanged, -${a.removed} removed`)
}

// 索引の鮮度を記録（hub が「索引: 最終 ingest」を映す）。
await d1(`CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT)`)
await d1(`INSERT INTO meta(key,value) VALUES('last_ingest',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [new Date().toISOString()])
