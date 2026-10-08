import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import type { Tone } from '@/components/primitives'

/* ============================================================================
   CHIP HEAD — the section headline, in the hero's format

   8 Oct, final revision: every section heading now reads like the hero's.
   The eyebrow (an asterisk and a short line in small capitals) sits above,
   the headline is two plain lines, and the one or two words that carry it
   sit in a short straight chip, as "a business advantage." does in the
   hero. The big tilted chip lying across the two lines is gone.

   Earlier notes:
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
      <span className="cx-h__chip">{accent}</span>
      {text.slice(at + accent.length)}
    </>
  )
}

/** The hero's eyebrow: an asterisk and a short line in small capitals. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`cx-eyebrow ${className}`.trim()}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
      </svg>
      {children}
    </p>
  )
}

export function ChipHead({
  line1,
  line2,
  chip,
  tone,
  lineRecipe = 0,
  start = 'top 82%',
  as: Tag = 'h2',
  id,
  className = '',
}: {
  line1: ReactNode
  line2: ReactNode
  /** The eyebrow over the headline. */
  chip: string
  /** The colour of the short chip on the headline's key words. */
  tone: Tone
  lineRecipe?: number
  /** ScrollTrigger start for the reveal. */
  start?: string
  as?: 'h2' | 'h1'
  id?: string
  className?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const brow = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start, once: true },
      })
      if (brow.current) tl.from(brow.current, { opacity: 0, y: 12, duration: 0.6, ease: 'power3.out' })
      LINES[lineRecipe % LINES.length](tl, gsap.utils.toArray<Element>('.cx-h__i', el))
      const pill = el.querySelector('.cx-h__chip')
      if (pill)
        tl.from(
          pill,
          { scale: 0.6, opacity: 0, transformOrigin: '0% 60%', duration: 0.6, ease: 'back.out(2.2)' },
          '-=.5',
        )
    }, el)
    return () => ctx.revert()
  }, [lineRecipe, start])

  return (
    <>
      <div ref={brow}>
        <Eyebrow>{chip}</Eyebrow>
      </div>
      <Tag className={`cx-h ${className}`.trim()} ref={ref} id={id} data-umm-tone={tone}>
        <span className="cx-h__l">
          <span className="cx-h__i">{line1}</span>
        </span>
        <span className="cx-h__l">
          <span className="cx-h__i">{line2}</span>
        </span>
      </Tag>
    </>
  )
}
