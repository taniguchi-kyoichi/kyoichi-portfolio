import type { HomeData, BoardBrief } from './api'
import { ObjectRow, TaskRow, fmtDate } from './components'

const WD = ['日', '月', '火', '水', '木', '金', '土']
function fmtDay(s: string): string {
  const d = new Date(s + 'T00:00:00')
  return `${Number(s.slice(5, 7))}月${Number(s.slice(8, 10))}日 (${WD[d.getDay()]})`
}
function ago(n: number | null): string {
  if (n == null) return '—'
  if (n === 0) return '今日'
  if (n === 1) return '昨日'
  return `${n}日前`
}

export function Home({ data, board, onStatus, onOpen, onTasks }: {
  data: HomeData
  board: BoardBrief | null
  onStatus: (s: string) => void
  onOpen: (path: string) => void
  onTasks: () => void
}) {
  const { intent, trajectory, loop, states, recent } = data
  const weekly = data.weekly ?? { last: null, daysSince: null, due: false }
  const index = data.index ?? { lastIngest: null, daysSince: null }
  const loopGap = loop.daysSinceDay
  const loopDrift = loopGap != null && loopGap >= 2

  const stateLine = loopDrift
    ? `日次が ${ago(loopGap)}。今夜ひと touch で戻せる。`
    : weekly.due || weekly.last == null
      ? '週次を締めるタイミング。'
      : 'リズムは生きている。'

  return (
    <div className="home">
      <div className="home-head">
        <div className="home-date">{fmtDay(data.today)}</div>
        <div className="home-state">{stateLine}</div>
        <div className="home-fresh">
          タスク <b>ライブ</b>
          {index.lastIngest && <> · 索引 <b>{ago(index.daysSince)}</b></>}
          {index.daysSince != null && index.daysSince >= 7 && <span className="stale"> · 索引が古い</span>}
        </div>
      </div>

      <div className="home-cols">
        {/* 現在地 */}
        <section className="card span-2">
          <div className="card-head"><div className="overline">現在地</div></div>
          <div className="home-intent">
            {intent.deep.map((d) => <span key={d} className="chip accent">{d}</span>)}
          </div>
          {intent.livingInterests.length > 0 && (
            <div className="kv">
              <span className="k">今の関心</span>
              <ul className="bullet">
                {intent.livingInterests.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </section>

        {/* 今の進行（タスクへの入口）— board 未接続でも導線は残す */}
        <section className={`card span-2 ${board && (board.wip > board.wipLimit || board.stale.length) ? 'attn' : ''}`}>
          <div className="card-head">
            <div className="overline">今の進行</div>
            <button className="link" onClick={onTasks}>タスクをすべて →</button>
          </div>
          {board == null ? (
            <p className="muted">タスクボードにまだ接続されていません。</p>
          ) : board.inProgress.length ? (
            <div className="mini-list">
              {board.inProgress.map((it, i) => <TaskRow key={i} it={it} status="in-progress" />)}
            </div>
          ) : (
            <p className="muted">いま動かしているものは無し。次を <b>「次に引ける」</b> から引くタイミング。</p>
          )}
          {board && (
            <div className="count-row">
              <span className={board.wip > board.wipLimit ? 'over' : ''}>いま <b>{board.wip}/{board.wipLimit}</b></span>
              <span>次に引ける <b>{board.counts.ready}</b></span>
              <span>止まっている <b>{board.counts.blocked}</b></span>
              <span>未整理 <b>{board.counts.backlog}</b></span>
            </div>
          )}
        </section>

        {/* リズム（日次+週次を1群に＝近接） */}
        <section className="card">
          <div className="card-head"><div className="overline">リズム</div></div>
          <div className={`rhythm-row ${loopDrift ? 'attn' : ''}`}>
            <span className="dot" />
            <div className="rbody">
              <div className="rlead">日次ループ</div>
              <div className="rnote">
                {loopDrift
                  ? <>最後が <b>{ago(loopGap)}</b>。<code>/daily-log</code> で1タッチ。</>
                  : <>生きている（最後: {ago(loopGap)}）。</>}
              </div>
            </div>
          </div>
          <div className={`rhythm-row ${weekly.due || weekly.last == null ? 'attn' : ''}`}>
            <span className="dot" />
            <div className="rbody">
              <div className="rlead">週次レビュー</div>
              <div className="rnote">
                {weekly.last == null
                  ? <>未実施。<code>/weekly</code> で今週を1本。</>
                  : weekly.due
                    ? <>前回から <b>{ago(weekly.daysSince)}</b>。締めるタイミング。</>
                    : <>生きている（最後: {ago(weekly.daysSince)}）。</>}
              </div>
            </div>
          </div>
          {loop.lastPlanMit && (
            <div className="mit kv">
              <span className="k">直近の MIT（{loop.lastPlanDate}）</span>
              <span className="v">{loop.lastPlanMit}</span>
            </div>
          )}
        </section>

        {/* 状態（記録コレクションへの入口） */}
        <section className="card">
          <div className="card-head"><div className="overline">滞留 / 状態</div></div>
          <div className="state-grid">
            {(['inbox', 'draft', 'in-progress', 'blocked', 'done', 'archived'] as const).map((s) => (
              states[s] ? (
                <button key={s} className={`state-chip s-${s}`} onClick={() => onStatus(s)}>
                  {s} <b>{states[s]}</b>
                </button>
              ) : null
            ))}
          </div>
          {trajectory.stale && (
            <div className="faint fs-xs">
              value-trajectory 陳腐化（更新 {ago(trajectory.daysSince)}）
            </div>
          )}
        </section>

        {/* 直近の記録 */}
        <section className="card span-2">
          <div className="card-head"><div className="overline">直近の記録</div></div>
          <div className="mini-list">
            {recent.map((r) => (
              <ObjectRow key={r.path} title={r.title} status={r.status ?? undefined}
                meta={<span>{r.category}{r.created ? ` · ${fmtDate(r.created)}` : ''}</span>}
                onClick={() => onOpen(r.path)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
