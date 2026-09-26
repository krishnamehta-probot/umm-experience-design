import type { ReactNode } from 'react'

/**
 * The eyebrow that opens a section. Two jobs: name the chapter of the journey,
 * and give the reveal animation something to draw.
 */
export function Chapter({ children }: { children: ReactNode }) {
  return (
    <div className="umm-chapter">
      <span className="umm-chapter__dot" aria-hidden="true" />
      <span className="umm-chapter__label">{children}</span>
    </div>
  )
}

/**
 * Highlights the single word in a heading that carries the argument. The
 * underline sweeps in after the heading has settled.
 */
export function AccentWord({ children }: { children: ReactNode }) {
  return <span className="umm-accent-word">{children}</span>
}

type SectionHeadProps = {
  chapter?: string
  title: ReactNode
  lead?: ReactNode
  wide?: boolean
  className?: string
}

export function SectionHead({
  chapter,
  title,
  lead,
  wide,
  className = '',
}: SectionHeadProps) {
  return (
    <div
      className={`umm-section-head ${wide ? 'umm-section-head--wide' : ''} ${className}`}
      data-umm-reveal
    >
      {chapter ? <Chapter>{chapter}</Chapter> : null}
      <h2 className="umm-section-head__title">{title}</h2>
      {lead ? <p className="umm-section-head__lead">{lead}</p> : null}
    </div>
  )
}
