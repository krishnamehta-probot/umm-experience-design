import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import type { Tone } from '@/components/primitives'

/* ============================================================================
   CHIP HEAD — the section headline, from the AI & Automation artifact

   Two lines with a tilted pill lying across the seam between them. Three
   layers, stacked in reading order: line one underneath, the chip over it,
   and line two over the chip. So the chip genuinely sits *between* the lines
   instead of floating above both, which is what makes it read as a sticker
   slapped on the page rather than a label.

   Every headline is built the same way, but they do not all arrive the same
   way: seven identical rises down one page reads as a template. Each section
   picks a line recipe and a chip recipe, fixed rather than random, so a
   section moves the same way every visit. Transform and opacity only.
   ========================================================================== */

/* How the two lines arrive. Each moves the inner span, so the clip stays on
   the line and the text rises out of nothing rather than fading in place. */
const LINES = [
  /* 0 rise: up out of the clip, top line leading */
  (tl: gsap.core.Timeline, l: Element[]) =>
    tl.from(l, { yPercent: 118, duration: 0.92, stagger: 0.12, ease: 'power4.out' }),
  /* 1 fall: down out of the clip, bottom line leading */
  (tl: gsap.core.Timeline, l: Element[]) =>
    tl.from(l, {
      yPercent: -118,
      duration: 0.88,
      ease: 'power4.out',
      stagger: { each: 0.12, from: 'end' },
    }),
  /* 2 swipe: the lines come in from opposite sides */
  (tl: gsap.core.Timeline, l: Element[]) =>
    tl.from(l, {
      opacity: 0,
      duration: 0.82,
      stagger: 0.1,
      ease: 'power3.out',
      xPercent: (i: number) => (i % 2 ? 9 : -9),
    }),
  /* 3 unfurl: a skew that settles, so the line reads as hinged */
  (tl: gsap.core.Timeline, l: Element[]) =>
    tl.from(l, { yPercent: 105, skewY: 4, duration: 0.95, stagger: 0.11, ease: 'power4.out' }),
  /* 4 split: one line up, the other down, meeting on the baseline */
  (tl: gsap.core.Timeline, l: Element[]) =>
    tl.from(l, {
      duration: 0.9,
      stagger: 0.08,
      ease: 'power4.out',
      yPercent: (i: number) => (i % 2 ? -115 : 115),
    }),
  /* 5 push: scaled from its own left edge, growing into place */
  (tl: gsap.core.Timeline, l: Element[]) =>
    tl.from(l, {
      opacity: 0,
      scale: 1.09,
      transformOrigin: '0% 50%',
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
    }),
] as const

/* How the chip lands. Relative to the chip's resting tilt, so a recipe works
   whatever angle a section sets. */
const PILLS = [
  /* 0 drop */
  (tl: gsap.core.Timeline, t: Element) =>
    tl.from(t, { opacity: 0, scale: 0.7, rotate: '-=17', y: -22, duration: 0.66, ease: 'back.out(1.9)' }, '-=.55'),
  /* 1 swing */
  (tl: gsap.core.Timeline, t: Element) =>
    tl.from(t, { opacity: 0, x: -46, rotate: '+=22', duration: 0.62, ease: 'back.out(1.7)' }, '-=.55'),
  /* 2 pop */
  (tl: gsap.core.Timeline, t: Element) =>
    tl.from(t, { opacity: 0, scale: 0.45, rotate: '+=18', duration: 0.7, ease: 'back.out(2.2)' }, '-=.55'),
  /* 3 lift */
  (tl: gsap.core.Timeline, t: Element) =>
    tl.from(t, { opacity: 0, y: 32, rotate: '-=9', duration: 0.66, ease: 'back.out(1.8)' }, '-=.55'),
] as const

/** Sets the one phrase in a line that carries the argument. The phrase is
 *  matched in the copy rather than marked up in it, so the content file stays
 *  plain text a copywriter can edit. */
export function withAccent(text: string, accent?: string): ReactNode {
  if (!accent) return text
  const at = text.indexOf(accent)
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <em>{accent}</em>
      {text.slice(at + accent.length)}
    </>
  )
}

export function ChipHead({
  line1,
  line2,
  chip,
  tone,
  chipAt = '30%',
  tilt = -9,
  lineRecipe = 0,
  chipRecipe = 0,
  start = 'top 82%',
  as: Tag = 'h2',
  id,
  className = '',
}: {
  line1: ReactNode
  line2: ReactNode
  chip: string
  tone: Tone
  /** Horizontal position of the chip's centre along the headline. */
  chipAt?: string
  /** Resting tilt of the chip, in degrees. */
  tilt?: number
  lineRecipe?: number
  chipRecipe?: number
  /** ScrollTrigger start for the reveal. */
  start?: string
  as?: 'h1' | 'h2'
  id?: string
  className?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start, once: true },
      })
      LINES[lineRecipe % LINES.length](tl, gsap.utils.toArray<Element>('.cx-h__i', el))
      PILLS[chipRecipe % PILLS.length](tl, el.querySelector('.cx-chip__i')!)
    }, el)
    return () => ctx.revert()
  }, [lineRecipe, chipRecipe, start])

  return (
    <Tag className={`cx-h ${className}`.trim()} ref={ref} id={id}>
      <span className="cx-h__l">
        <span className="cx-h__i">{line1}</span>
      </span>
      {/* The outer span only centres; the inner one tilts and is the thing
          GSAP animates, so the centring transform is never re-parsed into
          pixels and doubled. */}
      <span
        className="cx-chip"
        aria-hidden="true"
        style={{ left: chipAt, '--tilt': `${tilt}deg` } as CSSProperties}
      >
        <span className="cx-chip__i" data-umm-tone={tone}>
          {chip}
        </span>
      </span>
      <span className="cx-h__l cx-h__l--2">
        <span className="cx-h__i">{line2}</span>
      </span>
    </Tag>
  )
}
