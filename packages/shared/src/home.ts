// Life Mirror ホームのデータ組立（クラウド版）。ローカル tools/life-index/src/home.ts を D1 ベースへ移植。
// 参照元（intent.md / value-trajectory.md / knowledge/days/*）は全て ingest 済みなので D1 の body/created から再構成する。
import type { D1Like } from './search.js'

export interface HomeData {
  today: string
  intent: { deep: string[]; livingInterests: string[] }
  trajectory: { updated: string | null; daysSince: number | null; stale: boolean }
  loop: {
    lastDay: string | null; daysSinceDay: number | null; lastDayHasLog: boolean
    lastReflection: string | null; daysSinceReflection: number | null
    lastPlanDate: string | null; lastPlanMit: string | null
  }
  weekly: { last: string | null; daysSince: number | null; due: boolean }
  index: { lastIngest: string | null; daysSince: number | null }
  states: Record<string, number>
  recent: { path: string; title: string; created: string | null; category: string; status: string | null }[]
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / 86400000)
const toISODate = (v: unknown): string | null => { const m = String(v ?? '').match(/\d{4}-\d{2}-\d{2}/); return m ? m[0] : null }

/** intent.md 本文から Deep Intent 見出しと「今の関心」の箇条書きを抽出（ローカルと同ロジック）。 */
function parseIntentBody(body: string): HomeData['intent'] {
  const deep: string[] = [], living: string[] = []
  let section = '', inInterest = false
  for (const line of body.split('\n')) {
    const h2 = line.match(/^##\s+(.+)/)
    if (h2) { section = h2[1]; inInterest = false; continue }
    if (/^###\s+/.test(line)) {
      const t = line.replace(/^###\s+/, '').trim()
      if (section.startsWith('Deep Intent')) deep.push(t)
      inInterest = section.startsWith('Living Intent') && /今の関心/.test(t)
      continue
    }
    if (inInterest) { const b = line.match(/^\s*[-*]\s+(.+)/); if (b) living.push(b[1].trim()) }
  }
  return { deep, livingInterests: living }
}

function extractMit(planBody: string): string | null {
  const lines = planBody.split('\n')
  const i = lines.findIndex((l) => /最重要|MIT/.test(l) && /^#{1,3}\s/.test(l))
  if (i < 0) return null
  for (let j = i + 1; j < lines.length; j++) {
    const t = lines[j].trim()
    if (!t) continue
    if (/^#{1,3}\s/.test(t)) break
    return t.replace(/^→\s*/, '').replace(/\*\*/g, '')
  }
  return null
}

export async function buildHome(db: D1Like, today: string): Promise<HomeData> {
  const bodyOf = async (path: string): Promise<string | null> =>
    (await db.prepare(`SELECT body FROM doc WHERE path = ?`).bind(path).first<{ body: string }>())?.body ?? null

  const intentBody = await bodyOf('.claude/contexts/intent.md')
  const intent = intentBody ? parseIntentBody(intentBody) : { deep: [], livingInterests: [] }

  const traj = await db.prepare(`SELECT created FROM doc WHERE path = ?`).bind('knowledge/value-trajectory.md').first<{ created: string }>()
  const updated = traj ? toISODate(traj.created) : null
  const daysSince = updated ? daysBetween(today, updated) : null
  const trajectory = { updated, daysSince, stale: daysSince == null || daysSince > 45 }

  // 日次ループ: knowledge/days/YYYY-MM-DD/ 直下の plan/log/reflection の有無を D1 path から判定。
  const dayRows = (await db.prepare(`SELECT path FROM doc WHERE path LIKE 'knowledge/days/%'`).all<{ path: string }>()).results
  const dayFiles = new Map<string, Set<string>>()
  for (const r of dayRows) {
    const m = r.path.match(/^knowledge\/days\/(\d{4}-\d{2}-\d{2})\/([^/]+\.md)$/)
    if (m) { if (!dayFiles.has(m[1])) dayFiles.set(m[1], new Set()); dayFiles.get(m[1])!.add(m[2]) }
  }
  const days = [...dayFiles.keys()].sort()
  const lastDay = days.at(-1) ?? null
  let lastPlanDate: string | null = null, lastPlanMit: string | null = null
  for (const d of [...days].reverse()) if (dayFiles.get(d)!.has('plan.md')) {
    lastPlanDate = d; lastPlanMit = extractMit((await bodyOf(`knowledge/days/${d}/plan.md`)) ?? ''); break
  }
  let lastReflection: string | null = null
  for (const d of [...days].reverse()) if (dayFiles.get(d)!.has('reflection.md')) { lastReflection = d; break }
  const loop = {
    lastDay, daysSinceDay: lastDay ? daysBetween(today, lastDay) : null,
    lastDayHasLog: lastDay ? dayFiles.get(lastDay)!.has('log.md') : false,
    lastReflection, daysSinceReflection: lastReflection ? daysBetween(today, lastReflection) : null,
    lastPlanDate, lastPlanMit,
  }

  // 週次リズム: knowledge/weekly/ の最新 doc の経過日数。7日以上 or 未実施なら due（静かにナッジ）。
  const wk = await db.prepare(
    `SELECT created FROM doc WHERE path LIKE 'knowledge/weekly/%' AND created IS NOT NULL AND created != '' ORDER BY created DESC LIMIT 1`,
  ).first<{ created: string }>()
  const wkDate = wk ? toISODate(wk.created) : null
  const wkDays = wkDate ? daysBetween(today, wkDate) : null
  const weekly = { last: wkDate, daysSince: wkDays, due: wkDate == null || (wkDays != null && wkDays >= 7) }

  const stRows = (await db.prepare(`SELECT COALESCE(status,'') status, COUNT(*) n FROM doc GROUP BY status`).all<{ status: string; n: number }>()).results
  const states: Record<string, number> = {}
  for (const s of stRows) if (s.status) states[s.status] = s.n

  const recent = (await db.prepare(
    `SELECT path,title,created,category,status FROM doc WHERE created IS NOT NULL AND created != '' ORDER BY created DESC, path LIMIT 8`,
  ).all<HomeData['recent'][number]>()).results

  // 索引の鮮度（meta.last_ingest）。ingest 前は meta 未作成 → null で耐える。
  let lastIngest: string | null = null
  try { lastIngest = (await db.prepare(`SELECT value FROM meta WHERE key = 'last_ingest'`).first<{ value: string }>())?.value ?? null } catch { /* meta 未作成 */ }
  const idxDate = lastIngest ? toISODate(lastIngest) : null
  const index = { lastIngest, daysSince: idxDate ? daysBetween(today, idxDate) : null }

  return { today, intent, trajectory, loop, weekly, index, states, recent }
}
