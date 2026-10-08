import { IconArrowDown, IconArrowUpRight } from '../icons'

/* ============================================================================
   FLY ARROW
   Every arrow on a call to action answers hover the same way, the hero's
   way: the arrow leaves through one side and a fresh one comes in from the
   other. Two arrows, one clipped cell; the hover is read off the nearest
   link or button (see .umm-fly in components.css), so any CTA gets it just
   by holding one of these.
   ========================================================================== */

export function FlyArrow({
  size = 16,
  strokeWidth = 2,
  dir = 'up-right',
  className = '',
}: {
  size?: number
  strokeWidth?: number
  /** up-right leaves top right and returns from bottom left; down drops out
   *  of the bottom and returns from the top. */
  dir?: 'up-right' | 'down'
  className?: string
}) {
  const Icon = dir === 'down' ? IconArrowDown : IconArrowUpRight
  return (
    <span className={`umm-fly umm-fly--${dir} ${className}`.trim()} aria-hidden="true">
      <Icon size={size} strokeWidth={strokeWidth} />
      <Icon size={size} strokeWidth={strokeWidth} />
    </span>
  )
}
