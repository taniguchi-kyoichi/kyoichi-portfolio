import type { ReactNode } from 'react'
import type { BoardItem } from './api'

/** 日付を YYYY-MM-DD に正規化。ISO はそのまま、JS Date 文字列等はパースして整形。 */
export function fmtDate(s?: string | null): string {
  if (!s) return ''
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(s)
  if (iso) return iso[0]
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 全オブジェクト共通の行（構造性・階層性・状態色）。記録/タスク/成果物/関連で反復使用。
 *  href → 外部リンク / onClick → シート等 / どちらも無し → 非インタラクティブ（押せる見た目を出さない）。 */
export function ObjectRow({ title, meta, status, snippet, selected, onClick, href }: {
  title: string; meta?: ReactNode; status?: string; snippet?: string
  selected?: boolean; onClick?: () => void; href?: string
}) {
  const inner = (
    <>
      <span className="dot" />
      <span className="obj-main">
        <span className="obj-title">{title}</span>
        {meta && <span className="obj-meta">{meta}</span>}
        {snippet && <span className="obj-snippet" dangerouslySetInnerHTML={{ __html: snippet }} />}
      </span>
      <span className="chev" aria-hidden="true">›</span>
    </>
  )
  const cls = `obj ${status ? `s-${status}` : ''} ${selected ? 'sel' : ''}`
  if (href) return <a className={cls} href={href} target="_blank" rel="noreferrer">{inner}</a>
  if (onClick) return <button className={cls} onClick={onClick}>{inner}</button>
  return <div className={`${cls} static`}>{inner}</div>
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge b-${status} s-${status}`}>{status}</span>
}

/** board アイテム → オブジェクト行（App/Home 共用）。url 無し（下書き）は非インタラクティブ。 */
export function TaskRow({ it, status }: { it: BoardItem; status: string }) {
  const repo = it.repo ? it.repo.replace(/^no-problem-dev\//, '').replace(/^taniguchi-kyoichi\//, '') : '下書き'
  return <ObjectRow title={it.title} status={status} meta={<span>{repo}</span>} href={it.url ?? undefined} />
}
