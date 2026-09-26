import type { ReactNode } from 'react'
import { IconCheck, IconNode } from '../icons'
import type { Tone } from './tone'

/* --- Tag ----------------------------------------------------------------- */

export function Tag({
  children,
  variant = 'default',
  tone,
}: {
  children: ReactNode
  variant?: 'default' | 'tone' | 'solid'
  tone?: Tone
}) {
  const cls = [
    'umm-tag',
    variant === 'tone' && 'umm-tag--tone',
    variant === 'solid' && 'umm-tag--solid',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls} data-umm-tone={tone}>
      {children}
    </span>
  )
}

/* --- Ordinal ------------------------------------------------------------- */

export function Ordinal({
  value,
  size = 'lg',
  filled = false,
}: {
  value: number | string
  size?: 'lg' | 'sm' | 'mono'
  filled?: boolean
}) {
  const text = typeof value === 'number' ? String(value).padStart(2, '0') : value
  const cls = [
    'umm-ordinal',
    size === 'sm' && 'umm-ordinal--sm',
    size === 'mono' && 'umm-ordinal--mono',
    filled && 'umm-ordinal--filled',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls} aria-hidden="true">
      {text}
    </span>
  )
}

/* --- Definition list ----------------------------------------------------- */

export type DefEntry = { term: string; desc: ReactNode; emphasis?: boolean }

export function DefList({ entries }: { entries: DefEntry[] }) {
  return (
    <dl className="umm-deflist">
      {entries.map((entry) => (
        <div className="umm-deflist__row" key={entry.term}>
          <dt className="umm-deflist__term">{entry.term}</dt>
          <dd className="umm-deflist__desc">
            {entry.emphasis ? <strong>{entry.desc}</strong> : entry.desc}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* --- Outcome ------------------------------------------------------------- */

export function Outcome({
  label = 'You receive',
  children,
}: {
  label?: string
  children: ReactNode
}) {
  return (
    <div className="umm-outcome">
      <span className="umm-outcome__label">{label}</span>
      <p className="umm-outcome__value">{children}</p>
    </div>
  )
}

/* --- Board --------------------------------------------------------------- */

export type BoardRow = { label: string; value: string }

export function Board({ title, rows }: { title: string; rows: BoardRow[] }) {
  return (
    <div className="umm-board">
      <div className="umm-board__head">
        <span>{title}</span>
        <IconNode size={16} />
      </div>
      {rows.map((row) => (
        <div className="umm-board__row" key={row.label}>
          <span className="umm-board__label">{row.label}</span>
          <span className="umm-board__value">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

/* --- Note ---------------------------------------------------------------- */

export function Note({
  children,
  bare = false,
}: {
  children: ReactNode
  bare?: boolean
}) {
  return (
    <p className={`umm-note ${bare ? 'umm-note--bare' : ''}`}>
      <IconNode size={16} />
      <span>{children}</span>
    </p>
  )
}

/* --- Tick list ----------------------------------------------------------- */

export function TickList({ items }: { items: string[] }) {
  return (
    <ul className="umm-ticks">
      {items.map((item) => (
        <li className="umm-ticks__item" key={item}>
          <IconCheck size={16} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
