import { useEffect, useMemo, useRef, useState, type RefObject, type MouseEvent as ReactMouseEvent } from 'react'
import MarkdownIt from 'markdown-it'
import { search, facets, getDoc, related, list, home, board, artifacts, outline, type Hit, type Doc, type Mode, type HomeData, type BoardBrief, type Artifact, type Heading } from './api'
import { Home } from './Home'
import { ObjectRow, StatusBadge, TaskRow, fmtDate } from './components'

const md = new MarkdownIt({ html: false, linkify: true, breaks: false })
type View = 'home' | 'docs' | 'tasks' | 'artifacts'

const WD = ['日', '月', '火', '水', '木', '金', '土']
function fmtToday(s: string): string {
  const d = new Date(s + 'T00:00:00')
  return `${s.slice(5)} (${WD[d.getDay()]})`
}
const MODE_LABEL: Record<Mode, string> = { hybrid: '併用', fts: '全文', semantic: '意味' }

function Notice({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="notice">
      <span>{msg}</span>
      {onRetry && <button className="icon-btn sm" onClick={onRetry}>再試行</button>}
    </div>
  )
}

export function App() {
  const [view, setView] = useState<View>('home')
  const [nonce, setNonce] = useState(0)
  const retry = () => setNonce((n) => n + 1)

  const [homeData, setHomeData] = useState<HomeData | null>(null)
  const [homeErr, setHomeErr] = useState(false)
  const [boardData, setBoardData] = useState<BoardBrief | null>(null)
  const [cats, setCats] = useState<{ category: string; n: number }[]>([])
  const [statuses, setStatuses] = useState<{ status: string; n: number }[]>([])
  const [tags, setTags] = useState<{ tag: string; n: number }[]>([])
  const [total, setTotal] = useState(0)
  const [arts, setArts] = useState<Artifact[] | null>(null)
  const [artsErr, setArtsErr] = useState(false)

  const [q, setQ] = useState('')
  const [mode, setMode] = useState<Mode>('hybrid')
  const [category, setCategory] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [tag, setTag] = useState<string | undefined>()
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const [docsErr, setDocsErr] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const [sel, setSel] = useState<Doc | null>(null)
  const [rel, setRel] = useState<Hit[]>([])
  const [toc, setToc] = useState<Heading[]>([])
  const [artSel, setArtSel] = useState<Artifact | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setHomeErr(false)
    facets().then((f) => { setCats(f.byCategory); setStatuses(f.byStatus); setTags(f.byTag); setTotal(f.total) }).catch(() => {})
    home().then(setHomeData).catch(() => setHomeErr(true))
    board().then(setBoardData)
  }, [nonce])
  useEffect(() => {
    if (view === 'artifacts' && arts == null) { setArtsErr(false); artifacts().then(setArts).catch(() => setArtsErr(true)) }
  }, [view, arts, nonce])

  useEffect(() => {
    if (view !== 'docs') return
    const t = setTimeout(async () => {
      setLoading(true); setDocsErr(false)
      try { setHits(q.trim() ? await search(q, mode, category, status) : await list(category, status, tag)) }
      catch { setDocsErr(true) }
      finally { setLoading(false) }
    }, 180)
    return () => clearTimeout(t)
  }, [q, mode, category, status, tag, view, nonce])

  // キーボード（デスクトップ）: "/" で記録へ+フォーカス、Esc で閉じる
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault(); setView('docs'); setTimeout(() => inputRef.current?.focus(), 30)
      }
      if (e.key === 'Escape') { setSel(null); setArtSel(null) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // シートを開いたら閉じるボタンへフォーカス（キーボード/SR のため）
  useEffect(() => { if (sel || artSel) closeRef.current?.focus() }, [sel, artSel])

  function goStatus(s: string) { setStatus(s); setCategory(undefined); setQ(''); setView('docs') }
  async function openDoc(path: string) {
    setRel([]); setToc([])
    setSel(await getDoc(path))
    related(path).then(setRel).catch(() => {})
    outline(path).then(setToc).catch(() => {})
  }

  async function onBodyClick(e: ReactMouseEvent) {
    const a = (e.target as HTMLElement).closest('a')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.startsWith('wiki:')) { e.preventDefault(); setSel(null); setQ(decodeURIComponent(href.slice(5))); setView('docs'); return }
    if (href.startsWith('#')) return // 目次内アンカーはブラウザ既定に任せる
    if (/^(https?:|mailto:)/i.test(href) || !/\.md(#|$)/.test(href)) return
    e.preventDefault()
    const path = resolvePath(sel?.path ?? '', href.split('#')[0])
    try { const d = await getDoc(path); setRel([]); setToc([]); setSel(d); related(path).then(setRel); outline(path).then(setToc).catch(() => {}) }
    catch { setSel(null); setQ(path.split('/').pop()?.replace(/\.md$/, '') ?? ''); setView('docs') }
  }

  const [refreshing, setRefreshing] = useState(false)
  async function refresh() {
    setRefreshing(true)
    try {
      await Promise.all([
        home().then(setHomeData).catch(() => setHomeErr(true)),
        board().then(setBoardData),
        facets().then((f) => { setCats(f.byCategory); setStatuses(f.byStatus); setTags(f.byTag); setTotal(f.total) }),
        artifacts().then(setArts).catch(() => {}),
      ])
    } finally { setRefreshing(false) }
  }

  // [[wiki]]→wiki:リンク化 + 見出しに id 付与（目次アンカー用・文書順で h-0..）
  const bodyHtml = useMemo(() => {
    if (!sel) return ''
    const pre = sel.body.replace(/\[\[([^\]]+)\]\]/g, (_, n) => `[${n}](wiki:${encodeURIComponent(n)})`)
    let i = 0
    return md.render(pre).replace(/<h([1-6])>/g, (_, lv) => `<h${lv} id="h-${i++}">`)
  }, [sel])
  const tocItems = useMemo(() => toc.map((h, i) => ({ ...h, i })).filter((h) => h.level >= 2 && h.level <= 4), [toc])

  const NAV: { v: View; label: string; ic: string }[] = [
    { v: 'home', label: 'ホーム', ic: '🏠' },
    { v: 'docs', label: '記録', ic: '📄' },
    { v: 'tasks', label: 'タスク', ic: '☑' },
    { v: 'artifacts', label: '成果物', ic: '▦' },
  ]

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Life</span>
        {homeData && <span className="today">{fmtToday(homeData.today)}</span>}
        <span className="spacer" />
        <nav className="top-nav" aria-label="セクション">
          {NAV.map((n) => (
            <button key={n.v} className={view === n.v ? 'on' : ''} aria-current={view === n.v ? 'page' : undefined}
              onClick={() => setView(n.v)}>
              {n.label}{n.v === 'artifacts' && arts ? ` ${arts.length}` : ''}
            </button>
          ))}
        </nav>
        <button className="icon-btn" onClick={refresh} disabled={refreshing} aria-label="最新の状態に更新" title="最新の状態に更新（タスクはライブ）">
          {refreshing ? '更新中…' : '↻'}
        </button>
      </header>

      <main className="stage">
        {view === 'home' && (homeData
          ? <Home data={homeData} board={boardData} onStatus={goStatus} onOpen={openDoc} onTasks={() => setView('tasks')} />
          : homeErr ? <Notice msg="ホームを読み込めませんでした。" onRetry={retry} /> : <div className="loading">読み込み中…</div>)}

        {view === 'docs' && (
          <DocsView
            q={q} setQ={setQ} inputRef={inputRef}
            cats={cats} statuses={statuses} tags={tags} total={total}
            category={category} setCategory={setCategory} status={status} setStatus={setStatus} tag={tag} setTag={setTag}
            mode={mode} setMode={setMode} showDetail={showDetail} setShowDetail={setShowDetail}
            hits={hits} loading={loading} err={docsErr} onRetry={retry} sel={sel} onOpen={openDoc}
          />
        )}

        {view === 'tasks' && <TasksView board={boardData} />}

        {view === 'artifacts' && <ArtifactsView arts={arts} err={artsErr} onRetry={retry} onOpen={setArtSel} />}
      </main>

      <nav className="bottom-nav" aria-label="セクション">
        {NAV.map((n) => (
          <button key={n.v} className={view === n.v ? 'on' : ''} aria-current={view === n.v ? 'page' : undefined}
            aria-label={n.label} onClick={() => setView(n.v)}>
            <span className="ic" aria-hidden="true">{n.ic}</span>{n.label}
          </button>
        ))}
      </nav>

      {sel && (
        <>
          <div className="backdrop" onClick={() => setSel(null)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-label={sel.title}>
            <div className="sheet-head">
              <button ref={closeRef} className="close" onClick={() => setSel(null)} aria-label="閉じる" title="閉じる">✕</button>
              <span className="h">{sel.title}</span>
            </div>
            <div className="sheet-body">
              <div className="meta-line">
                {sel.frontmatter?.status && <StatusBadge status={sel.frontmatter.status} />}
                <span>{sel.category}</span>
                {sel.created && <span>· {fmtDate(sel.created)}</span>}
                <span className="faint">· {sel.path}</span>
              </div>
              {tocItems.length >= 3 && (
                <nav className="toc" aria-label="目次">
                  <div className="overline">目次</div>
                  {tocItems.map((h) => <a key={h.i} href={`#h-${h.i}`} data-lv={h.level}>{h.text}</a>)}
                </nav>
              )}
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
          <div className="sheet sheet-full" role="dialog" aria-modal="true" aria-label={artSel.title}>
            <div className="sheet-head">
              <button ref={closeRef} className="close" onClick={() => setArtSel(null)} aria-label="閉じる" title="閉じる">✕</button>
              <span className="h">{artSel.title}</span>
              <span className="spacer" />
              <span className="faint" style={{ fontSize: 'var(--t-xs)' }}>{artSel.theme}{artSel.created ? ` · ${fmtDate(artSel.created)}` : ''}</span>
            </div>
            <iframe className="art-frame" title={artSel.title}
              src={`/api/artifact?path=${encodeURIComponent(artSel.path)}`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-downloads" />
          </div>
        </>
      )}
    </div>
  )
}

function DocsView(p: {
  q: string; setQ: (s: string) => void; inputRef: RefObject<HTMLInputElement>
  cats: { category: string; n: number }[]; statuses: { status: string; n: number }[]; tags: { tag: string; n: number }[]; total: number
  category?: string; setCategory: (s: string | undefined) => void
  status?: string; setStatus: (s: string | undefined) => void
  tag?: string; setTag: (s: string | undefined) => void
  mode: Mode; setMode: (m: Mode) => void; showDetail: boolean; setShowDetail: (b: boolean) => void
  hits: Hit[]; loading: boolean; err: boolean; onRetry: () => void; sel: Doc | null; onOpen: (path: string) => void
}) {
  const validStatuses = p.statuses.filter((s) => s.status && s.status !== '(none)')
  const filtered = !!(p.category || p.status || p.tag)
  return (
    <div className="collection">
      <div className="collection-head">
        <h1>記録</h1>
        <span className="count">{p.loading ? '…' : p.q.trim() || filtered ? `${p.hits.length} 件` : `${p.total} 件`}</span>
      </div>
      <div className="search-bar">
        <input ref={p.inputRef} className="search-input" value={p.q} placeholder="記録を検索"
          onChange={(e) => p.setQ(e.target.value)} aria-label="記録を検索" />
        <div className="filters">
          <button className={`filter-chip ${!filtered ? 'on' : ''}`}
            onClick={() => { p.setCategory(undefined); p.setStatus(undefined); p.setTag(undefined) }}>すべて <span className="n">{p.total}</span></button>
          {validStatuses.map((s) => (
            <button key={s.status} className={`filter-chip ${p.status === s.status ? 'on' : ''}`}
              onClick={() => p.setStatus(p.status === s.status ? undefined : s.status)}>
              {s.status} <span className="n">{s.n}</span></button>
          ))}
          {p.cats.length > 0 && <span className="filter-sep" aria-hidden="true" />}
          {p.cats.map((c) => (
            <button key={c.category} className={`filter-chip ${p.category === c.category ? 'on' : ''}`}
              onClick={() => p.setCategory(p.category === c.category ? undefined : c.category)}>
              {c.category} <span className="n">{c.n}</span></button>
          ))}
          {p.tags.length > 0 && <span className="filter-sep" aria-hidden="true" />}
          {p.tags.map((t) => (
            <button key={t.tag} className={`filter-chip tag ${p.tag === t.tag ? 'on' : ''}`}
              onClick={() => p.setTag(p.tag === t.tag ? undefined : t.tag)}>
              #{t.tag} <span className="n">{t.n}</span></button>
          ))}
        </div>
        <div className="detail-toggle">
          <button className="icon-btn sm" onClick={() => p.setShowDetail(!p.showDetail)}>
            {p.showDetail ? '詳細を隠す' : '詳細'}</button>
          {p.showDetail && (
            <span className="seg" role="group" aria-label="検索方式">
              {(['hybrid', 'fts', 'semantic'] as Mode[]).map((m) => (
                <button key={m} className={m === p.mode ? 'on' : ''} onClick={() => p.setMode(m)}>{MODE_LABEL[m]}</button>
              ))}
            </span>
          )}
        </div>
      </div>

      {p.err ? <Notice msg="記録を読み込めませんでした。" onRetry={p.onRetry} />
        : p.loading ? <div className="loading">読み込み中…</div>
        : p.hits.length === 0 ? <div className="loading">該当なし</div>
        : p.hits.map((h) => (
          <ObjectRow key={h.path} title={h.title} status={h.status} selected={p.sel?.path === h.path}
            snippet={h.snippet ? escapeSnippet(h.snippet) : undefined}
            onClick={() => p.onOpen(h.path)}
            meta={<>
              <span>{h.category}</span>
              {h.created && <span>· {fmtDate(h.created)}</span>}
              {p.showDetail && h.distance != null && <span className="faint">· d={h.distance.toFixed(3)}</span>}
            </>} />
        ))}
    </div>
  )
}

function TasksView({ board }: { board: BoardBrief | null }) {
  if (board == null) return <Notice msg="タスクボードにまだ接続されていません。" />
  const { counts, wip, wipLimit } = board
  const groups: { label: string; note?: string; items: typeof board.inProgress; status: string }[] = [
    { label: 'いま回している', items: board.inProgress, status: 'in-progress' },
    { label: '承認待ち', note: 'あなたの確認で完了に進む', items: board.inReview, status: 'in-review' },
    { label: '次に引ける', items: board.ready, status: 'inbox' },
    { label: '止まっている', items: board.blocked, status: 'blocked' },
    { label: '未整理', items: board.backlog, status: 'inbox' },
  ]
  const empty = board.inProgress.length + board.inReview.length + board.ready.length === 0
  return (
    <div>
      <div className="collection-head"><h1>タスク</h1><span className="count">タスクボード</span></div>
      {empty && <p className="muted" style={{ marginBottom: 'var(--s4)' }}>いま動かせるタスクはありません。</p>}
      {groups.map((g) => g.items.length > 0 && (
        <div key={g.label} className="task-group">
          <div className="overline">{g.label}<span className="n"> {g.items.length}</span>{g.note && <span className="faint" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}> — {g.note}</span>}</div>
          {g.items.map((it, i) => <TaskRow key={i} it={it} status={g.status} />)}
        </div>
      ))}
      <div className="count-row" style={{ marginTop: 'var(--s6)' }}>
        <span className={wip > wipLimit ? 'over' : ''}>いま <b>{wip}/{wipLimit}</b></span>
        <span>次に引ける <b>{counts.ready}</b></span>
        <span>止まっている <b>{counts.blocked}</b></span>
        <span>未整理 <b>{counts.backlog}</b></span>
      </div>
      {board.stale.length > 0 && (
        <p className="faint" style={{ marginTop: 'var(--s3)', fontSize: 'var(--t-xs)' }}>
          ⚠ 完了済みなのに列に残る {board.stale.length} 件 — ボード掃除の合図</p>
      )}
    </div>
  )
}

function ArtifactsView({ arts, err, onRetry, onOpen }: { arts: Artifact[] | null; err: boolean; onRetry: () => void; onOpen: (a: Artifact) => void }) {
  if (err) return <Notice msg="成果物を読み込めませんでした。" onRetry={onRetry} />
  if (arts == null) return <div className="loading">読み込み中…</div>
  return (
    <div className="collection">
      <div className="collection-head"><h1>成果物</h1><span className="count">{arts.length}</span></div>
      {arts.length === 0 && <p className="muted">まだありません。スキルが自己完結 HTML を吐き、取り込みで載ります。</p>}
      {arts.map((a) => (
        <ObjectRow key={a.path} title={a.title} onClick={() => onOpen(a)}
          meta={<span>{a.theme}{a.created ? ` · ${fmtDate(a.created)}` : ''}</span>} />
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
