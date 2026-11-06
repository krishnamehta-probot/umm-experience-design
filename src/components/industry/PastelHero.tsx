import { useEffect, useRef, type CSSProperties } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton } from '@/components/primitives'
import { WordFill } from './WordFill'
import type { HouseHeroContent } from './HouseHero'
import '@/styles/pastel-hero.css'

/* ============================================================================
   PASTEL HERO — two of the round-3 stills (2 Nov), kept as options

   The copy on the left at the house size; on the right, the three sectors
   drawn in the pastels:
     wallet  a fanned deck of pastel cards, Banking, Payments, Insurance,
             floating; "Momentum." in the moving foil
     rising  three pastel columns rising like a chart, a soft light sweeping
             across them; a plain ink headline
   ========================================================================== */

export type PastelLayout = 'wallet' | 'rising'

const TONES = ['sky', 'citrus', 'blossom'] as const

/** where `el` sits inside `root`, by layout alone: a line still rising (a
 *  transform) does not move it */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0
  let y = 0
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  return { x, y }
}

export function PastelHero({ content, layout }: { content: HouseHeroContent; layout: PastelLayout }) {
  const stage = useRef<HTMLDivElement>(null)
  const foilHost = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLSpanElement>(null)
  const base = useRef<HTMLElement>(null)
  const lines = content.lines.slice(0, -1)
  const last = content.lines[content.lines.length - 1]
  const foiled = layout === 'wallet'

  useEffect(() => {
    const st = stage.current!
    delete st.dataset.flat
    let foil: WordFill | null = null
    if (foiled) {
      try {
        foil = new WordFill(foilHost.current!, 'foil')
      } catch {
        st.dataset.flat = ''
      }
    }
    const measure = () => {
      if (!foil) return
      const el = slot.current!
      const size = parseFloat(getComputedStyle(el).fontSize)
      const pad = Math.round(size * 0.05)
      const w = offsetIn(el, st)
      const baseline = offsetIn(base.current!, st).y
      foil.setWord(
        last,
        '500 {size} Mosvita, sans-serif',
        size,
        pad,
        { x: w.x - pad, y: baseline - size * 0.77, w: el.offsetWidth + pad * 2, h: size * 0.86 },
        -0.034,
      )
    }
    let mraf = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(mraf)
      mraf = requestAnimationFrame(measure)
    })
    let cancelled = false
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return
      measure()
      ro.observe(st)
      requestAnimationFrame(() => (st.dataset.in = ''))
    })
    return () => {
      cancelled = true
      ro.disconnect()
      cancelAnimationFrame(mraf)
      foil?.dispose()
    }
  }, [foiled, last])

  return (
    <section className={`ph ph--${layout}`} aria-labelledby="ph-title">
      <div ref={stage} className="ph__stage">
        <MegaNav />
        <div className="ph__body">
          <div className="ph__copy">
            <p className="ph__eyebrow">{content.eyebrow}</p>
            <h1 id="ph-title" className="ph__title">
              {lines.map((l, i) => (
                <span key={l} className="ph__line" style={{ '--i': i } as CSSProperties}>
                  <span>{l}</span>
                </span>
              ))}
              <span className="ph__line" style={{ '--i': lines.length } as CSSProperties}>
                <span>
                  {foiled ? (
                    <>
                      <i ref={base} className="ph__base" />
                      <span ref={slot} className="ph__foil">
                        {last}
                      </span>
                    </>
                  ) : (
                    last
                  )}
                </span>
              </span>
            </h1>
            <p className="ph__lead">{content.lead}</p>
            <div className="ph__actions">
              <SplitButton href={content.primary.href}>{content.primary.label}</SplitButton>
              <a className="ph__more" href={content.secondary.href}>
                {content.secondary.label} <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          {layout === 'wallet' ? (
            <div className="ph__deck" aria-hidden="true">
              {content.sectors.map((s, i) => (
                <div key={s} className={`ph__card ph__card--${i + 1}`} style={{ '--tone': `var(--umm-${TONES[i % 3]})` } as CSSProperties}>
                  <b>{s}</b>
                  <span className="ph__chip" />
                  <small>{String(i + 1).padStart(2, '0')}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="ph__bars" aria-hidden="true">
              {content.sectors.map((s, i) => (
                <div
                  key={s}
                  className="ph__bar"
                  style={{ '--tone': `var(--umm-${TONES[i % 3]})`, '--h': `${52 + i * 18}%`, '--d': `${-0.8 * i}s` } as CSSProperties}
                >
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {foiled && <div ref={foilHost} className="ph__layer" aria-hidden="true" />}
      </div>
    </section>
  )
}
