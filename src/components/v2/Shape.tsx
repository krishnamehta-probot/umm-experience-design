import type { CSSProperties } from 'react'
import { SHAPES, type ShapeName } from './shapes.data'
import type { Tone } from '@/components/primitives'

/* ============================================================================
   SHAPE

   One Cool Shapes silhouette, filled with a single flat colour. The colour is
   currentColor, so the caller decides it: pass a brand `tone` to fill it with
   that pastel, or leave it out and the shape takes the text colour (ink on a
   pastel card, paper on a dark band).

   Always decorative. Anything the shape "means" is said in the text beside it.
   ========================================================================== */

export function Shape({
  name,
  tone,
  size,
  className = '',
  style,
}: {
  name: ShapeName
  tone?: Tone
  /** Any CSS length. Leave it out to size the shape from CSS. */
  size?: number | string
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      className={`cx-shape ${className}`.trim()}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      style={{
        ...(size !== undefined ? { width: size, height: size } : null),
        ...(tone ? { color: `var(--umm-${tone})` } : null),
        ...style,
      }}
    >
      {SHAPES[name].map((part, i) => (
        <path
          key={i}
          d={part.d}
          fill="currentColor"
          fillRule={'evenodd' in part ? 'evenodd' : undefined}
          clipRule={'evenodd' in part ? 'evenodd' : undefined}
        />
      ))}
    </svg>
  )
}
