// GitHub Projects v2（board #2）を read して Life Mirror 用の Brief に集約する。
// これは read の関所（外部状態の閲覧）。書き込みは一切しない — 状態を映すだけ。
// トークンは owner が collaborator の board を読める GitHub token（Worker secret GITHUB_TOKEN）。

export interface BoardItem {
  title: string
  url: string | null
  status: string
  repo: string | null   // "owner/repo"（linked issue のみ。draft は null）
  draft: boolean
  closed: boolean        // linked issue/PR が CLOSED/MERGED = board 上の陳腐エントリ
}

export interface BoardBrief {
  updated: string
  wip: number
  wipLimit: number
  counts: { inProgress: number; inReview: number; ready: number; blocked: number; backlog: number }
  inProgress: BoardItem[]  // いま回していること（owner 必須）
  inReview: BoardItem[]     // 承認/確認待ち（あなたの確認で Done に進む）
  ready: BoardItem[]        // 次に引ける（pull ポイント）。上位のみ
  blocked: BoardItem[]      // 止まっている（依存/ブロック）
  backlog: BoardItem[]      // 未整理の生キャプチャ。上位のみ
  stale: BoardItem[]        // CLOSED なのに active 列に残る = 逸脱（board 掃除の合図）
}

const QUERY = `query($login:String!,$number:Int!,$cursor:String){
  user(login:$login){ projectV2(number:$number){
    items(first:100, after:$cursor){
      pageInfo{ hasNextPage endCursor }
      nodes{
        content{ __typename
          ... on Issue{ title url state }
          ... on PullRequest{ title url state }
          ... on DraftIssue{ title }
        }
        s: fieldValueByName(name:"Status"){ ... on ProjectV2ItemFieldSingleSelectValue{ name } }
      }
    }
  } }
}`

const ACTIVE_COLUMNS = ['In Progress', 'In Review', 'Ready', 'Blocked']

export async function fetchBoard(
  token: string,
  opts: { login: string; number: number; now: string },
): Promise<BoardBrief> {
  const raw: any[] = []
  let cursor: string | null = null
  for (let page = 0; page < 6; page++) { // 最大 600 件。board 肥大への安全網
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': 'cloud-hub-life-mirror',
      },
      body: JSON.stringify({ query: QUERY, variables: { login: opts.login, number: opts.number, cursor } }),
    })
    if (!res.ok) throw new Error(`github ${res.status}: ${await res.text()}`)
    const json: any = await res.json()
    if (json.errors) throw new Error('github graphql: ' + JSON.stringify(json.errors))
    const items = json.data?.user?.projectV2?.items
    if (!items) throw new Error('board: project not found')
    raw.push(...(items.nodes ?? []))
    if (!items.pageInfo?.hasNextPage) break
    cursor = items.pageInfo.endCursor
  }

  const items: BoardItem[] = raw.map((n) => {
    const c = n.content ?? {}
    const url: string | null = c.url ?? null
    return {
      title: c.title ?? '(untitled)',
      url,
      status: n.s?.name ?? '(none)',
      repo: url ? repoOf(url) : null,
      draft: c.__typename === 'DraftIssue',
      closed: c.state === 'CLOSED' || c.state === 'MERGED',
    }
  })

  const active = items.filter((i) => !i.closed)
  const col = (s: string) => active.filter((i) => i.status === s)
  const inProgress = col('In Progress')
  const inReview = col('In Review')
  const ready = col('Ready')

  return {
    updated: opts.now,
    wip: inProgress.length,
    wipLimit: 5,
    counts: {
      inProgress: inProgress.length,
      inReview: inReview.length,
      ready: ready.length,
      blocked: col('Blocked').length,
      backlog: col('Backlog').length,
    },
    inProgress,
    inReview,
    ready: ready.slice(0, 6),
    blocked: col('Blocked'),
    backlog: col('Backlog').slice(0, 12),
    stale: items.filter((i) => i.closed && ACTIVE_COLUMNS.includes(i.status)),
  }
}

function repoOf(url: string): string | null {
  const m = url.match(/github\.com\/([^/]+\/[^/]+)/)
  return m ? m[1] : null
}
