const j = (u: string) => fetch(u).then((r) => r.json())
const qs = (o: Record<string, string | number | undefined>) =>
  Object.entries(o).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')

export type Mode = 'hybrid' | 'fts' | 'semantic'
export interface Hit { path: string; title: string; category: string; created?: string; status?: string; snippet?: string; distance?: number; rrf?: number }
export interface Doc { path: string; title: string; category: string; created?: string; frontmatter: any; body: string }
export interface Facets {
  total: number
  byCategory: { category: string; n: number }[]
  byStatus: { status: string; n: number }[]
  byTag: { tag: string; n: number }[]
}

export const search = (q: string, mode: Mode, category?: string, limit = 40): Promise<Hit[]> =>
  j(`/api/search?${qs({ q, mode, category, limit })}`)
export const facets = (): Promise<Facets> => j('/api/facets')
export const getDoc = (path: string): Promise<Doc> => j(`/api/doc?${qs({ path })}`)
export const related = (path: string): Promise<Hit[]> => j(`/api/related?${qs({ path })}`)
export interface Heading { level: number; text: string; ord: number }
export const outline = (path: string): Promise<Heading[]> => j(`/api/outline?${qs({ path })}`)
export const list = (category?: string, status?: string, limit = 60): Promise<Hit[]> =>
  j(`/api/list?${qs({ category, status, limit })}`)

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
  recent: { path: string; title: string; created: string | null; category: string }[]
}
export const home = (): Promise<HomeData> => j('/api/home')

export interface BoardItem { title: string; url: string | null; status: string; repo: string | null; draft: boolean; closed: boolean }
export interface BoardBrief {
  updated: string
  wip: number
  wipLimit: number
  counts: { inProgress: number; inReview: number; ready: number; blocked: number; backlog: number }
  inProgress: BoardItem[]
  inReview: BoardItem[]
  ready: BoardItem[]
  stale: BoardItem[]
}
// board が未設定/失敗でも Home を壊さない（null を返す）
export const board = (): Promise<BoardBrief | null> =>
  fetch('/api/board').then((r) => (r.ok ? r.json() : null)).catch(() => null)

export interface Artifact { path: string; title: string; theme: string; created: string }
export const artifacts = (): Promise<Artifact[]> => j('/api/artifacts')
