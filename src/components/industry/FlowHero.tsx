import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton } from '@/components/primitives'
import { FlowField, type FlowPalette } from './FlowField'
import type { HouseHeroContent } from './HouseHero'
import '@/styles/flow-hero.css'

/* ============================================================================
   FLOW HERO — the final candidate (Krish, 2 Nov: "something like that Stripe
   thing only but more nicer", with one options panel to settle it)

   A field of the brand's colours flowing like poured silk (FlowField) fills
   a shape across the top of the screen, and the copy sits on the white
   below it. The shape's edge is worked out from where the copy is, so the
   colour never runs behind a word (Krish: no overlapping), whatever the
   window.

   The options (set from the page's panel):
     shape    slant (Stripe's diagonal), wave (the diagonal as a slow wave),
              quarter (a quarter circle from the top-right corner, the UMM
              mark's shape), panel (a rounded panel beside the copy)
     palette  brand, night (the colours as light out of ink), cool, warm
     finish   smooth, silk (the folds catch a sheen), grain, silkgrain
     motion   calm, flow, lively
     copy     left, centre
   ========================================================================== */

export type FlowOptions = {
  shape: 'slant' | 'wave' | 'quarter' | 'panel'
  palette: FlowPalette
  finish: 'smooth' | 'silk' | 'grain' | 'silkgrain'
  motion: 'calm' | 'flow' | 'lively'
  copy: 'left' | 'centre'
}

const SPEED: Record<FlowOptions['motion'], number> = { calm: 0.5, flow: 1, lively: 1.8 }

/** where `el` sits inside `root`, by layout alone */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0
  let y = 0
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  return { x, y }
}

export function FlowHero({
  content,
  opts,
  aside,
}: {
  content: HouseHeroContent
  opts: FlowOptions
  /** something beside the words, on columns 9–12 and level with their foot
   *  (the route's payment card); the colour keeps clear of it too */
  aside?: ReactNode
}) {
  const stage = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const base = useRef<HTMLDivElement>(null)
  const flow = useRef<FlowField | null>(null)
  const optsRef = useRef(opts)
  optsRef.current = opts

  /* the colour field, made once */
  useEffect(() => {
    const st = stage.current!
    try {
      flow.current = new FlowField(field.current!, optsRef.current.palette)
    } catch {
      st.dataset.flat = '' /* no WebGL: a still CSS gradient in the same shape */
    }
    requestAnimationFrame(() => (st.dataset.in = ''))
    return () => {
      flow.current?.dispose()
      flow.current = null
    }
  }, [])

  useEffect(() => {
    flow.current?.setPalette(opts.palette)
    flow.current?.setSheen(opts.finish === 'silk' || opts.finish === 'silkgrain')
    flow.current?.setSpeed(SPEED[opts.motion])
  }, [opts.palette, opts.finish, opts.motion])

  /* the shape, kept clear of the copy and the base line */
  useEffect(() => {
    const st = stage.current!
    const fl = field.current!
    let t = 0
    const clip = () => {
      const W = st.clientWidth
      const H = st.clientHeight
      const c = copy.current!
      const at = offsetIn(c, st)
      const x1 = at.x
      const x2 = at.x + c.offsetWidth
      const y1 = at.y
      const nav = st.querySelector<HTMLElement>('.hm-nav')
      const navB = nav ? nav.offsetTop + nav.offsetHeight : 90
      const baseT = base.current!.offsetTop
      const m = Math.min(56, Math.max(28, W * 0.03))
      const floor = baseT - m
      /* the thing beside the words, when there is one and it shows */
      const sd = side.current
      const sideOn = !!sd && sd.offsetParent !== null && sd.offsetWidth > 0
      const sAt = sideOn ? offsetIn(sd, st) : { x: 0, y: 0 }
      const sx1 = sAt.x
      const sx2 = sAt.x + (sideOn ? sd.offsetWidth : 0)
      const sy1 = sAt.y
      const { shape } = optsRef.current
      let path = ''
      if (shape === 'slant' || shape === 'wave') {
        /* a line from just under the nav on the left (the logo and the nav
           sit wholly on the colour), falling to the right and passing a
           margin above the copy's top corners (and the card's) */
        let yL = navB + 14
        let tan = (y1 - m - yL) / Math.max(x2, 1)
        if (sideOn) tan = Math.min(tan, (sy1 - m - yL) / Math.max(sx2, 1))
        tan = Math.min(0.9, Math.max(0.05, tan))
        if (yL + x2 * tan > y1 - m) yL = y1 - m - x2 * tan
        if (sideOn && yL + sx2 * tan > sy1 - m) yL = sy1 - m - sx2 * tan
        const amp = shape === 'wave' ? H * 0.035 : 0
        const edge = (x: number) =>
          yL + x * tan + amp * Math.sin((x / W) * Math.PI * 2 * 1.1 + t * 0.35)
        /* the wave never dips into the copy's margin (or the card's) or
           past the base line */
        let over = 0
        for (let i = 0; i <= 40; i++) {
          const x = x1 + ((x2 - x1) * i) / 40
          over = Math.max(over, edge(x) - (y1 - m))
          if (sideOn) {
            const xs = sx1 + ((sx2 - sx1) * i) / 40
            over = Math.max(over, edge(xs) - (sy1 - m))
          }
        }
        const pts: string[] = []
        const N = shape === 'wave' ? 64 : 1
        for (let i = 0; i <= N; i++) {
          const x = (W * i) / N
          pts.push(`${x.toFixed(1)}px ${Math.min(floor, edge(x) - over).toFixed(1)}px`)
        }
        path = `polygon(0px 0px, ${W}px 0px, ${pts.reverse().join(', ')})`
      } else if (shape === 'quarter') {
        /* a quarter circle from the top-right corner, reaching to a margin
           off the copy's nearest corner */
        const nx = Math.min(Math.max(W, x1), x2)
        let R = Math.min(Math.hypot(W - nx, y1) - m, floor)
        if (sideOn) R = Math.min(R, Math.hypot(W - Math.min(W, sx2), sy1) - m)
        path = `circle(${Math.max(0, R).toFixed(1)}px at ${W}px 0px)`
      } else {
        /* a rounded panel: beside the copy when it is on the left, above it
           when it is centred */
        const g = Math.min(62, Math.max(16, W * 0.032))
        const r = Math.min(40, Math.max(22, W * 0.024))
        const top = navB + 8
        if (optsRef.current.copy === 'left' && W > 900) {
          const left = x2 + m * 1.6
          const bottom = sideOn ? Math.min(floor, sy1 - m) : floor
          path = `inset(${top}px ${g}px ${H - bottom}px ${left}px round ${r}px)`
        } else {
          path = `inset(${top}px ${g}px ${H - (y1 - m)}px ${g}px round ${r}px)`
        }
      }
      fl.style.clipPath = path
    }

    let raf = 0
    const tick = (now: number) => {
      t = now / 1000
      clip()
      raf = requestAnimationFrame(tick)
    }
    const moving = opts.shape === 'wave' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ro = new ResizeObserver(() => {
      flow.current?.resize()
      clip()
    })
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
      flow.current?.resize()
      clip()
      ro.observe(st)
      if (moving) raf = requestAnimationFrame(tick)
    })
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [opts.shape, opts.copy, !!aside])

  return (
    <section
      className="fh"
      aria-labelledby="fh-title"
      data-copy={opts.copy}
      data-finish={opts.finish}
      data-palette={opts.palette}
      data-shape={opts.shape}
    >
      <div ref={stage} className="fh__stage">
        <div ref={field} className="fh__field" aria-hidden="true">
          <div className="fh__grain" />
        </div>
        <MegaNav />

        <div className={`fh__body${aside ? ' fh__body--aside' : ''}`}>
          <div ref={copy} className="fh__copy">
            <p className="fh__eyebrow">{content.eyebrow}</p>
            <h1 id="fh-title" className="fh__title">
              {content.lines.map((l, i) => (
                <span key={l} className="fh__line" style={{ '--i': i } as CSSProperties}>
                  <span>{l}</span>
                </span>
              ))}
            </h1>
            <p className="fh__lead">{content.lead}</p>
            <div className="fh__actions">
              <SplitButton href={content.primary.href}>{content.primary.label}</SplitButton>
              <a className="fh__more" href={content.secondary.href}>
                {content.secondary.label} <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          {aside && (
            <div ref={side} className="fh__aside">
              {aside}
            </div>
          )}
        </div>

        <div ref={base} className="fh__base">
          <p>{content.strapline}</p>
          <p>{content.sectors.join(' / ')}</p>
        </div>
      </div>
    </section>
  )
}
