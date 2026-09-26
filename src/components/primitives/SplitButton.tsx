import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { IconArrowUpRight } from '../icons'

/* ============================================================================
   SPLIT BUTTON
   UMM's primary action shape: a fully-rounded pill and a separate circle
   holding the arrow, with a small gap between them. Both halves are inside one
   anchor, so the whole thing is a single link and a single hover target.

   On hover the gap opens a little further and the arrow leaves through the
   top-right of the circle while its replacement arrives from the bottom-left.
   That is why there are two arrows here and not one: the gesture only reads as
   departure if something is still there afterwards.
   ========================================================================== */

export function SplitButton({
  children,
  variant = 'solid',
  className = '',
  ...rest
}: {
  children: ReactNode
  /** solid = filled black. outline = hollow with a black stroke. */
  variant?: 'solid' | 'outline'
  className?: string
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`umm-split umm-split--${variant} ${className}`.trim()}
      {...rest}
    >
      <span className="umm-split__pill">{children}</span>
      <span className="umm-split__orb" aria-hidden="true">
        <span className="umm-split__arrow">
          <IconArrowUpRight size={20} strokeWidth={1.75} />
          <IconArrowUpRight size={20} strokeWidth={1.75} />
        </span>
      </span>
    </a>
  )
}
