import type { HTMLAttributes, ReactNode } from 'react'
import { IconArrowUpRight } from '../icons'
import type { Tone } from './tone'

type CardProps = {
  children: ReactNode
  /** Fill treatment. `tone` uses the full pastel, `wash` its 18% tint. */
  fill?: 'paper' | 'tone' | 'wash' | 'quiet'
  tone?: Tone
  lift?: boolean
  padding?: 'md' | 'lg'
  className?: string
} & HTMLAttributes<HTMLDivElement>

export function Card({
  children,
  fill = 'paper',
  tone,
  lift = false,
  padding = 'md',
  className = '',
  ...rest
}: CardProps) {
  const cls = [
    'umm-card',
    fill === 'tone' && 'umm-card--tone',
    fill === 'wash' && 'umm-card--wash',
    fill === 'quiet' && 'umm-card--quiet',
    lift && 'umm-card--lift',
    padding === 'lg' && 'umm-card--pad-lg',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls} data-umm-tone={tone} {...rest}>
      {children}
    </div>
  )
}

/**
 * The UMM signature surface: a card with a circular bite out of its
 * bottom-right corner and the action arrow seated in the bite. Lifted from the
 * brand cards on umm.digital and made systematic.
 *
 * Because the notch is produced with a CSS mask, the card cannot paint a
 * border — so a notch card must always carry a fill that distinguishes it from
 * the page ground. `tone` and `wash` both do.
 */
export function NotchCard({
  children,
  tone,
  fill = 'tone',
  className = '',
  ...rest
}: Omit<CardProps, 'lift'>) {
  const cls = [
    'umm-card',
    'umm-card--notch',
    fill === 'tone' && 'umm-card--tone',
    fill === 'wash' && 'umm-card--wash',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="umm-notch-wrap" data-umm-tone={tone}>
      <div className={cls} {...rest}>
        {children}
      </div>
      <span className="umm-notch-action" aria-hidden="true">
        <IconArrowUpRight size={22} />
      </span>
    </div>
  )
}
