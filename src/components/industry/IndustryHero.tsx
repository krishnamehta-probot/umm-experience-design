import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton } from '@/components/primitives'
import { FILLS, WordFill, type Fill } from './WordFill'
import '@/styles/industry-hero.css'

/* ============================================================================
   INDUSTRY HERO — shared by the ten industry pages (Krish's pick, 2 Nov:
   "Momentum" over the ribbon, the dark ribbon and the coin)

   The headline is one sentence. Its last word is the hero itself: set full
   width under the first lines and drawn as a solid, lit object (WordFill) in
   glass, foil or pastel; foil by default. No scroll effect (Krish, 2 Nov): the hero is a
   plain first screen.

   `?options` shows a switch between the three fills, for review; `?fill=`
   opens on one.
   ========================================================================== */

type Link = { label: string; href: string }

export type IndustryHeroContent = {
  eyebrow: string
  /** the headline, line by line; the last line is the word drawn as the hero */
  lines: readonly string[]
  lead: string
  primary: Link
  secondary: Link
  strapline: string
}

const FONT = '600 {size} Mosvita, sans-serif'

export function IndustryHero({ content, fill = 'foil' }: { content: IndustryHeroContent; fill?: Fill }) {
  const root = useRef<HTMLElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const word = useRef<WordFill | null>(null)
  const params = new URLSearchParams(window.location.search)
  const options = params.has('options')
  const [current, setCurrent] = useState<Fill>(() => {
    const q = params.get('fill')
    return FILLS.some((f) => f.id === q) ? (q as Fill) : fill
  })
  const lines = content.lines.slice(0, -1)
  const last = content.lines[content.lines.length - 1]

  useEffect(() => {
    const el = root.current!
    const c = layer.current!
    const s = slot.current!
    delete el.dataset.flat
    try {
      word.current = new WordFill(c, current)
    } catch {
      el.dataset.flat = '' /* no WebGL: the word is set as plain type (CSS) */
    }

    /* the word runs the full width of the copy, as large as the screen allows */
    const measure = () => {
      const ctx = document.createElement('canvas').getContext('2d')!
      ctx.font = FONT.replace('{size}', '100px')
      if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-5.5px'
      const avail = s.parentElement!.clientWidth
      const size = Math.min((100 * avail) / ctx.measureText(last).width, window.innerHeight * 0.36)
      const pad = Math.round(size * 0.05)
      /* the word's box runs a bevel's width past the copy on both sides */
      s.style.height = `${size * 0.86}px`
      s.style.marginInline = `${-pad}px`
      el.style.setProperty('--ih-word', `${size}px`)
      const cr = c.getBoundingClientRect()
      const sr = s.getBoundingClientRect()
      word.current?.setWord(last, FONT, size, pad, { x: sr.left - cr.left, y: sr.top - cr.top, w: sr.width, h: sr.height })
    }
    let mraf = 0
    const remeasure = () => {
      cancelAnimationFrame(mraf)
      mraf = requestAnimationFrame(measure)
    }
    const ro = new ResizeObserver(remeasure)

    let cancelled = false
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return
      measure()
      ro.observe(el)
      requestAnimationFrame(() => (el.dataset.in = ''))
    })

    return () => {
      cancelled = true
      ro.disconnect()
      cancelAnimationFrame(mraf)
      word.current?.dispose()
      word.current = null
    }
    /* built once per word; the fill changes through setFill below */
  }, [last])

  useEffect(() => word.current?.setFill(current), [current])

  return (
    <section ref={root} className="ih" aria-labelledby="ih-title">
      <div className="ih__stage">
        <div ref={layer} className="ih__layer" />
        <MegaNav />
        <div className="ih__block">
          <div className="ih__grid">
            <div className="ih__head">
              <p className="ih__eyebrow">{content.eyebrow}</p>
              <h1 id="ih-title" className="ih__lines">
                {lines.map((l, i) => (
                  <span key={l} className="ih__line" style={{ '--i': i } as CSSProperties}>
                    <span>{l}</span>
                  </span>
                ))}
                <span className="hm-sr">{last}</span>
              </h1>
            </div>
            <div ref={slot} className="ih__word" aria-hidden="true">
              <span>{last}</span>
            </div>
            <div className="ih__side">
              <p className="ih__lead">{content.lead}</p>
              <div className="ih__actions">
                <SplitButton href={content.primary.href}>{content.primary.label}</SplitButton>
                <a className="ih__more" href={content.secondary.href}>
                  {content.secondary.label} <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
            <p className="ih__strap">{content.strapline}</p>
          </div>
        </div>

        {options && (
          <div className="ih__dock" role="group" aria-label="Fill">
            <span>Fill</span>
            {FILLS.map((f) => (
              <button key={f.id} type="button" aria-pressed={f.id === current} onClick={() => setCurrent(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
