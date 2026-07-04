import type { ReactNode } from 'react'

/** 全オブジェクト共通の行（構造性・階層性・状態色）。記録/タスク/成果物/関連で反復使用。 */
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
      <span className="chev">›</span>
    </>
  )
  const cls = `obj ${status ? `s-${status}` : ''} ${selected ? 'sel' : ''}`
  return href
    ? <a className={cls} href={href} target="_blank" rel="noreferrer">{inner}</a>
    : <button className={cls} onClick={onClick}>{inner}</button>
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge b-${status} s-${status}`}>{status}</span>
}
