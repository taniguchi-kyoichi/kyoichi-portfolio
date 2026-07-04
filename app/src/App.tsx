import { useEffect, useMemo, useRef, useState, type RefObject, type MouseEvent as ReactMouseEvent } from 'react'
import MarkdownIt from 'markdown-it'
import { search, facets, getDoc, related, list, home, board, artifacts, type Hit, type Doc, type Mode, type HomeData, type BoardBrief, type BoardItem, type Artifact } from './api'
import { Home } from './Home'
import { ObjectRow, StatusBadge } from './components'

const md = new MarkdownIt({ html: false, linkify: true, breaks: false })
type View = 'home' | 'docs' | 'tasks' | 'artifacts'

const WD = ['日', '月', '火', '水', '木', '金', '土']
function fmtToday(s: string): string {
  const d = new Date(s + 'T00:00:00')
  return `${s.slice(5)} (${WD[d.getDay()]})`
}

export function App() {
  const [view, setView] = useState<View>('home')

  const [homeData, setHomeData] = useState<HomeData | null>(null)
  const [boardData, setBoardData] = useState<BoardBrief | null>(null)
  const [cats, setCats] = useState<{ category: string; n: number }[]>([])
  const [statuses, setStatuses] = useState<{ status: string; n: number }[]>([])
  const [total, setTotal] = useState(0)
  const [arts, setArts] = useState<Artifact[] | null>(null)

  const [q, setQ] = useState('')
  const [mode, setMode] = useState<Mode>('hybrid')
  const [category, setCategory] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const [sel, setSel] = useState<Doc | null>(null)
  const [rel, setRel] = useState<Hit[]>([])
  const [artSel, setArtSel] = useState<Artifact | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    facets().then((f) => { setCats(f.byCategory); setStatuses(f.byStatus); setTotal(f.total) })
    home().then(setHomeData)
    board().then(setBoardData)
  }, [])
  useEffect(() => { if (view === 'artifacts' && arts == null) artifacts().then(setArts) }, [view, arts])

  useEffect(() => {
    if (view !== 'docs') return
    const t = setTimeout(async () => {
      setLoading(true)
      try { setHits(q.trim() ? await search(q, mode, category) : await list(category, status)) }
      finally { setLoading(false) }
    }, 180)
    return () => clearTimeout(t)
  }, [q, mode, category, status, view])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) { e.preventDefault(); goDocs() }
      if (e.key === 'Escape') { setSel(null); setArtSel(null) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  function goDocs() { setView('docs'); setTimeout(() => inputRef.current?.focus(), 30) }
  function goStatus(s: string) { setStatus(s); setCategory(undefined); setQ(''); setView('docs') }
  async function openDoc(path: string) { setRel([]); setSel(await getDoc(path)); related(path).then(setRel) }

  // 本文中の内部リンク（相対 .md / [[wiki]]）をアプリ内ナビゲーションに。失敗時は検索へフォールバック。
  async function onBodyClick(e: ReactMouseEvent) {
    const a = (e.target as HTMLElement).closest('a')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.startsWith('wiki:')) {
      e.preventDefault(); setSel(null); setQ(decodeURIComponent(href.slice(5))); setView('docs'); return
    }
    if (/^(https?:|mailto:|#)/i.test(href) || !/\.md(#|$)/.test(href)) return // 外部/アンカーはそのまま
    e.preventDefault()
    const path = resolvePath(sel?.path ?? '', href.split('#')[0])
    try { const d = await getDoc(path); setRel([]); setSel(d); related(path).then(setRel) }
    catch { setSel(null); setQ(path.split('/').pop()?.replace(/\.md$/, '') ?? ''); setView('docs') }
  }

  const [refreshing, setRefreshing] = useState(false)
  async function refresh() {
    setRefreshing(true)
    try {
      await Promise.all([
        home().then(setHomeData), board().then(setBoardData),
        facets().then((f) => { setCats(f.byCategory); setStatuses(f.byStatus); setTotal(f.total) }),
        artifacts().then(setArts),
      ])
    } finally { setRefreshing(false) }
  }

  // [[wiki]] を wiki: リンクに変換してから描画（内部ナビの対象にする）
  const bodyHtml = useMemo(() =>
    sel ? md.render(sel.body.replace(/\[\[([^\]]+)\]\]/g, (_, n) => `[${n}](wiki:${encodeURIComponent(n)})`)) : '',
    [sel])
  const NAV: { v: View; label: string; ic: string }[] = [
    { v: 'home', label: 'ホーム', ic: '🏠' },
    { v: 'docs', label: '記録', ic: '📄' },
    { v: 'tasks', label: 'タスク', ic: '✓' },
    { v: 'artifacts', label: '成果物', ic: '▤' },
  ]

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Life</span>
        {homeData && <span className="today">{fmtToday(homeData.today)}</span>}
        <span className="spacer" />
        <nav className="top-nav">
          {NAV.map((n) => (
            <button key={n.v} className={view === n.v ? 'on' : ''} onClick={() => setView(n.v)}>
              {n.label}{n.v === 'artifacts' && arts ? ` ${arts.length}` : ''}
            </button>
          ))}
        </nav>
        <button className="icon-btn" onClick={refresh} disabled={refreshing} title="最新の状態に更新（board はライブ）">
          {refreshing ? '更新中…' : '↻'}
        </button>
      </header>

      <main className="stage">
        {view === 'home' && (homeData
          ? <Home data={homeData} board={boardData} onStatus={goStatus} onOpen={openDoc} onTasks={() => setView('tasks')} />
          : <div className="loading">…</div>)}

        {view === 'docs' && (
          <DocsView
            q={q} setQ={setQ} inputRef={inputRef}
            cats={cats} statuses={statuses} total={total}
            category={category} setCategory={setCategory} status={status} setStatus={setStatus}
            mode={mode} setMode={setMode} showDetail={showDetail} setShowDetail={setShowDetail}
            hits={hits} loading={loading} sel={sel} onOpen={openDoc}
          />
        )}

        {view === 'tasks' && <TasksView board={boardData} />}

        {view === 'artifacts' && <ArtifactsView arts={arts} onOpen={setArtSel} />}
      </main>

      <nav className="bottom-nav">
        {NAV.map((n) => (
          <button key={n.v} className={view === n.v ? 'on' : ''} onClick={() => n.v === 'docs' ? goDocs() : setView(n.v)}>
            <span className="ic">{n.ic}</span>{n.label}
          </button>
        ))}
      </nav>

      {sel && (
        <>
          <div className="backdrop" onClick={() => setSel(null)} />
          <div className="sheet">
            <div className="sheet-head">
              <button className="close" onClick={() => setSel(null)} title="閉じる">✕</button>
              <span className="h">{sel.title}</span>
            </div>
            <div className="sheet-body">
              <div className="meta-line">
                {sel.frontmatter?.status && <StatusBadge status={sel.frontmatter.status} />}
                <span>{sel.category}</span>
                {sel.created && <span>· {sel.created}</span>}
                <span className="faint">· {sel.path}</span>
              </div>
              <article className="md" onClick={onBodyClick} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              {rel.length > 0 && (
                <aside className="related">
                  <div className="overline">関連する記録</div>
                  {rel.map((r) => (
                    <ObjectRow key={r.path} title={r.title} status={r.status}
                      meta={<span>{r.category}</span>} onClick={() => openDoc(r.path)} />
                  ))}
                </aside>
              )}
            </div>
          </div>
        </>
      )}

      {artSel && (
        <>
          <div className="backdrop" onClick={() => setArtSel(null)} />
          <div className="sheet">
            <div className="sheet-head">
              <button className="close" onClick={() => setArtSel(null)} title="閉じる">✕</button>
              <span className="h">{artSel.title}</span>
            </div>
            <iframe className="art-frame" title={artSel.path}
              src={`/api/artifact?path=${encodeURIComponent(artSel.path)}`}
              sandbox="allow-scripts allow-popups allow-downloads" />
          </div>
        </>
      )}
    </div>
  )
}

function DocsView(p: {
  q: string; setQ: (s: string) => void; inputRef: RefObject<HTMLInputElement>
  cats: { category: string; n: number }[]; statuses: { status: string; n: number }[]; total: number
  category?: string; setCategory: (s: string | undefined) => void
  status?: string; setStatus: (s: string | undefined) => void
  mode: Mode; setMode: (m: Mode) => void; showDetail: boolean; setShowDetail: (b: boolean) => void
  hits: Hit[]; loading: boolean; sel: Doc | null; onOpen: (path: string) => void
}) {
  return (
    <div className="collection">
      <div className="collection-head">
        <h1>記録</h1>
        <span className="count">{p.loading ? '…' : `${p.hits.length} 件`}</span>
      </div>
      <div className="search-bar">
        <input ref={p.inputRef} className="search-input" value={p.q} placeholder="記録を検索"
          onChange={(e) => p.setQ(e.target.value)} autoFocus />
        <div className="filters">
          <button className={`filter-chip ${!p.category && !p.status ? 'on' : ''}`}
            onClick={() => { p.setCategory(undefined); p.setStatus(undefined) }}>すべて <span className="n">{p.total}</span></button>
          {p.statuses.filter((s) => s.status !== '(none)').map((s) => (
            <button key={s.status} className={`filter-chip ${p.status === s.status ? 'on' : ''}`}
              onClick={() => p.setStatus(p.status === s.status ? undefined : s.status)}>
              {s.status} <span className="n">{s.n}</span></button>
          ))}
          {p.cats.map((c) => (
            <button key={c.category} className={`filter-chip ${p.category === c.category ? 'on' : ''}`}
              onClick={() => p.setCategory(p.category === c.category ? undefined : c.category)}>
              {c.category} <span className="n">{c.n}</span></button>
          ))}
        </div>
        <div className="detail-toggle">
          <button className="icon-btn" style={{ height: 26 }} onClick={() => p.setShowDetail(!p.showDetail)}>
            {p.showDetail ? '詳細を隠す' : '詳細'}</button>
          {p.showDetail && (
            <span className="seg">
              {(['hybrid', 'fts', 'semantic'] as Mode[]).map((m) => (
                <button key={m} className={m === p.mode ? 'on' : ''} onClick={() => p.setMode(m)}>{m}</button>
              ))}
            </span>
          )}
        </div>
      </div>

      {p.loading && <div className="loading">…</div>}
      {!p.loading && p.hits.length === 0 && <div className="loading">該当なし</div>}
      {p.hits.map((h) => (
        <ObjectRow key={h.path} title={h.title} status={h.status} selected={p.sel?.path === h.path}
          snippet={h.snippet ? escapeSnippet(h.snippet) : undefined}
          onClick={() => p.onOpen(h.path)}
          meta={<>
            {h.status && <StatusBadge status={h.status} />}
            <span>{h.category}</span>
            {h.created && <span>· {h.created}</span>}
            {p.showDetail && h.distance != null && <span className="faint">· d={h.distance.toFixed(3)}</span>}
          </>} />
      ))}
    </div>
  )
}

function TaskRow({ it, status }: { it: BoardItem; status: string }) {
  const repo = it.repo ? it.repo.replace(/^no-problem-dev\//, '').replace(/^taniguchi-kyoichi\//, '') : '下書き'
  return <ObjectRow title={it.title} status={status} meta={<span>{repo}</span>}
    href={it.url ?? undefined} onClick={it.url ? undefined : () => {}} />
}

function TasksView({ board }: { board: BoardBrief | null }) {
  if (board == null) return <div className="loading">board は未接続</div>
  const { counts, wip, wipLimit } = board
  const groups: { label: string; note?: string; items: BoardItem[]; status: string }[] = [
    { label: 'いま回している', items: board.inProgress, status: 'in-progress' },
    { label: '承認待ち', note: 'あなたの確認で Done に進む', items: board.inReview, status: 'in-progress' },
    { label: '次に引ける', items: board.ready, status: 'inbox' },
  ]
  return (
    <div>
      <div className="collection-head"><h1>タスク</h1><span className="count">board #2</span></div>
      {groups.map((g) => g.items.length > 0 && (
        <div key={g.label} className="task-group">
          <div className="overline">{g.label}<span className="n"> {g.items.length}</span>{g.note && <span className="muted" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}> — {g.note}</span>}</div>
          {g.items.map((it, i) => <TaskRow key={i} it={it} status={g.status} />)}
        </div>
      ))}
      {board.inProgress.length === 0 && board.ready.length > 0 && (
        <p className="muted" style={{ marginTop: 'var(--s3)' }}>アクティブは無し。次を <b>Ready</b> から引くタイミング。</p>
      )}
      <div className="count-row" style={{ marginTop: 'var(--s6)' }}>
        <span className={wip > wipLimit ? 'over' : ''}>WIP <b>{wip}/{wipLimit}</b></span>
        <span>Ready <b>{counts.ready}</b></span>
        <span>Blocked <b>{counts.blocked}</b></span>
        <span>Backlog <b>{counts.backlog}</b></span>
      </div>
      {board.stale.length > 0 && (
        <p className="faint" style={{ marginTop: 'var(--s3)', fontSize: 'var(--t-xs)' }}>
          ⚠ CLOSED なのに列に残る {board.stale.length} 件 — board 掃除の合図</p>
      )}
    </div>
  )
}

function ArtifactsView({ arts, onOpen }: { arts: Artifact[] | null; onOpen: (a: Artifact) => void }) {
  if (arts == null) return <div className="loading">…</div>
  return (
    <div className="collection">
      <div className="collection-head"><h1>成果物</h1><span className="count">{arts.length}</span></div>
      {arts.length === 0 && <p className="muted">まだありません。スキルが自己完結 HTML を吐き、ingest で載ります。</p>}
      {arts.map((a) => (
        <ObjectRow key={a.path} title={a.title} status="done" onClick={() => onOpen(a)}
          meta={<span>{a.theme}{a.created ? ` · ${a.created}` : ''}</span>} />
      ))}
    </div>
  )
}

/** 本文リンクの href を repo 相対パスへ解決。'.'始まりは base ディレクトリ基準、それ以外は repo ルート基準。 */
function resolvePath(base: string, href: string): string {
  const baseDir = base.includes('/') ? base.slice(0, base.lastIndexOf('/')) : ''
  const parts = href.startsWith('.') ? baseDir.split('/').filter(Boolean) : []
  for (const seg of href.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') parts.pop()
    else parts.push(seg)
  }
  return parts.join('/')
}

function escapeSnippet(s: string): string {
  const esc = s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))
  return esc.replace(/⟦/g, '<mark>').replace(/⟧/g, '</mark>')
}
