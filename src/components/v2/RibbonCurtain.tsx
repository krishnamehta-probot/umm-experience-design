import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { ScrollTrigger } from '@/lib/gsap'

/* ============================================================================
   RIBBON CURTAIN — the hero's exit, and the top edge of section 2

   The dark Why section rises over the held hero, and this is its top edge:
   ink below a curve, nothing above it, with the ribbon riding the curve. So on
   the first screen the ribbon is already moving along the bottom of the hero
   with a sliver of black under it, and as the reader scrolls the ribbon is
   the line that wipes the hero away. When the section reaches the top of the
   screen the ribbon is a strip across the top of the black, and the page is
   already dark.

   At rest the curve is a wave: up on the left, down through the middle, up
   again on the right. While it rises:
     - the wave flattens out, so the black arrives with a level top edge
     - the words run faster the faster the reader scrolls, then settle

   One SVG, one curve. The ink fill, the band and the text baseline are all
   built from the same path data, so they can never drift apart while the
   curve changes shape.

   It scales with the window up to 1440 wide and no further: on a wider
   screen the viewBox widens instead, so the band stays 72px and the words
   42px rather than swelling to fill a 1920 monitor.

   Where it sits on the first screen is measured, not guessed: the wave's
   centre line rests at 78% of the screen height, and is pushed lower when
   the paragraph above (clearOf) reaches down that far, so the ribbon never
   covers it whatever the window's shape.
   ========================================================================== */

const W = 1440
/** Height of the lip in viewBox units: just deep enough for the wave's
 *  lowest point, so the section's content starts right under the strip.
 *  Below the curve it is solid ink and runs straight into the section's own
 *  ink ground. */
const H = 214
/** The wave's centre line, and how far it swings either side of it: full
 *  swing on the first screen, flat when the section arrives. */
const MID = 128
const SWING = 46
/** Half-waves across the path: up, down, up. */
const HALVES = 3
/** The path overruns the screen by this much each side, so its ends never show. */
const RUN = 220

/** Resting height of the wave's centre line, as a share of the screen. */
const REST_AT = 0.78
/** Clear space kept between the paragraph and the ribbon's top edge, px. */
const GAP = 28

/* Each half-wave is one cubic with both handles at the same height: 4/3 of
   the swing puts its peak at exactly the swing, and alternating the sign
   keeps the joins smooth. Built on the viewBox width, so the wave keeps its
   shape when a wide screen widens the viewBox. */
const K = 4 / 3
const curve = (a: number, w: number) => {
  const L = (w + RUN * 2) / HALVES
  let d = `M ${-RUN} ${MID}`
  for (let i = 0; i < HALVES; i++) {
    const x = -RUN + i * L
    const y = MID + (i % 2 ? 1 : -1) * a * K
    d += ` C ${x + L * 0.36} ${y}, ${x + L * 0.64} ${y}, ${x + L} ${MID}`
  }
  return d
}
const fill = (a: number, w: number) => `${curve(a, w)} L ${w + RUN} ${H} L ${-RUN} ${H} Z`

/** Height of the wave at x (viewBox units). */
const waveY = (x: number, a: number, w: number) => {
  const L = (w + RUN * 2) / HALVES
  const i = Math.min(HALVES - 1, Math.max(0, Math.floor((x + RUN) / L)))
  const x0 = -RUN + i * L
  for (let k = 0; k <= 48; k++) {
    const t = k / 48
    const u = 1 - t
    if (x0 + L * (3 * u * u * t * 0.36 + 3 * u * t * t * 0.64 + t * t * t) >= x) {
      return MID + (i % 2 ? 1 : -1) * a * K * 3 * u * t
    }
  }
  return MID
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number) => Math.min(1, Math.max(0, v))

export function RibbonCurtain({
  items,
  separator = '✦',
  speed = 0.75,
  clearOf,
}: {
  items: readonly string[]
  separator?: string
  /** viewBox units travelled per frame at rest */
  speed?: number
  /** selector of the text on the first screen the ribbon must not cover */
  clearOf?: string
}) {
  const reduced = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const pathId = `cx-curtain-${uid}`

  const rootRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<SVGPathElement>(null)
  const strokeRef = useRef<SVGUseElement>(null)
  const fillRef = useRef<SVGPathElement>(null)
  const textPathRef = useRef<SVGTextPathElement>(null)
  const measureRef = useRef<SVGTextElement>(null)

  const [spacing, setSpacing] = useState(0)
  /** viewBox width: 1440, or the window's width once that is wider */
  const [vbW, setVbW] = useState(W)

  const unit = useMemo(
    () => `${items.join(`  ${separator}  `)}  ${separator}  `,
    [items, separator],
  )
  /* enough repetitions to overrun the longest the curve ever gets */
  const run = useMemo(
    () => (spacing ? Array(Math.ceil((vbW + 960) / spacing) + 2).fill(unit).join('') : unit),
    [unit, spacing, vbW],
  )

  /* measure one repetition once the face has loaded */
  useEffect(() => {
    let cancelled = false
    const measure = () => {
      if (cancelled) return
      if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength())
      if (rootRef.current) setVbW(Math.max(W, rootRef.current.clientWidth))
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelled = true
      window.removeEventListener('resize', measure)
    }
  }, [unit])

  useEffect(() => {
    const root = rootRef.current
    const band = bandRef.current
    const ink = fillRef.current
    const text = textPathRef.current
    if (!root || !band || !ink || !text || !spacing) return

    /* Pull the section up into the hero by just enough: the ribbon's left end
       at REST_AT of the screen, or lower if that would cover the paragraph.
       Offsets rather than rects, so the hero's intro and sink transforms
       never skew the measurement. */
    const section = root.closest<HTMLElement>('section')
    const target = clearOf ? document.querySelector<HTMLElement>(clearOf) : null
    const screen = target?.closest<HTMLElement>('section') ?? null
    let pulled = NaN
    const place = () => {
      if (!section || !target || !screen) return
      let top = 0
      let left = 0
      for (let n: HTMLElement | null = target; n && n !== screen; n = n.offsetParent as HTMLElement | null) {
        top += n.offsetTop
        left += n.offsetLeft
      }
      const s = root.clientWidth / vbW
      const stroke = strokeRef.current ? parseFloat(getComputedStyle(strokeRef.current).strokeWidth) : 72
      const half = (stroke / 2) * s
      /* the highest the wave rises anywhere under the paragraph */
      let peak = Infinity
      for (let k = 0; k <= 40; k++) {
        peak = Math.min(peak, waveY((left + (target.offsetWidth * k) / 40) / s, SWING, vbW))
      }
      const restTop = screen.offsetHeight * REST_AT - MID * s
      const clearTop = top + target.offsetHeight + GAP + half - peak * s
      const pull = Math.round(Math.max(restTop, clearTop) - screen.offsetHeight)
      if (pull !== pulled) {
        pulled = pull
        section.style.marginTop = `${pull}px`
        ScrollTrigger.refresh()
      }
    }

    /* Where the lip sits in the document, i.e. how far the reader has to
       scroll for it to reach the top of the screen. Read off the section,
       not the lip: the lip may be in a part of the section that holds still
       on screen, and then its own position says nothing about the page. */
    let docTop = 0
    const locate = () => {
      place()
      docTop = (section ?? root).getBoundingClientRect().top + window.scrollY
    }
    locate()
    window.addEventListener('resize', locate)
    document.fonts?.ready.then(locate)

    const shape = (p: number) => {
      const a = lerp(SWING, 0, p)
      band.setAttribute('d', curve(a, vbW))
      ink.setAttribute('d', fill(a, vbW))
    }

    let offset = -spacing
    const wrap = (v: number) => {
      let n = v
      while (n <= -spacing) n += spacing
      while (n > 0) n -= spacing
      return n
    }
    text.setAttribute('startOffset', `${offset}px`)

    if (reduced) {
      const onScroll = () => shape(clamp(window.scrollY / Math.max(1, docTop)))
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', locate)
      }
    }

    let lastY = window.scrollY
    let boost = 0
    let lastP = -1
    let frame = 0
    let running = false

    const tick = () => {
      const y = window.scrollY
      const p = clamp(y / Math.max(1, docTop))
      if (Math.abs(p - lastP) > 0.0005) {
        shape(p)
        lastP = p
      }
      /* scroll speed feeds the run, then bleeds off so it settles */
      boost = Math.max(boost * 0.9, Math.min(6, Math.abs(y - lastY) * 0.15))
      lastY = y
      offset = wrap(offset - (speed + boost))
      text.setAttribute('startOffset', `${offset}px`)
      frame = requestAnimationFrame(tick)
    }

    /* only spend frames while the ribbon can be seen */
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true
        lastY = window.scrollY
        frame = requestAnimationFrame(tick)
      } else if (!entry.isIntersecting && running) {
        running = false
        cancelAnimationFrame(frame)
      }
    })
    io.observe(root)

    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', locate)
    }
  }, [spacing, speed, reduced, vbW, clearOf])

  return (
    <div className="cx-curtain" ref={rootRef}>
      <svg
        className="cx-curtain__svg"
        viewBox={`0 0 ${vbW} ${H}`}
        role="img"
        aria-label={items.join(', ')}
      >
        <defs>
          <path id={pathId} ref={bandRef} d={curve(SWING, vbW)} fill="none" />
        </defs>
        <path className="cx-curtain__ink" ref={fillRef} d={fill(SWING, vbW)} />
        <use href={`#${pathId}`} ref={strokeRef} className="cx-curtain__band" />

        <text
          ref={measureRef}
          className="cx-curtain__text"
          xmlSpace="preserve"
          aria-hidden="true"
          style={{ visibility: 'hidden', pointerEvents: 'none' }}
        >
          {unit}
        </text>
        <text className="cx-curtain__text" xmlSpace="preserve" aria-hidden="true">
          <textPath ref={textPathRef} href={`#${pathId}`} xmlSpace="preserve">
            {run}
          </textPath>
        </text>
      </svg>
    </div>
  )
}
