import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton } from '@/components/primitives'
import type { HouseHeroContent } from './HouseHero'
import '@/styles/fin-hero.css'

/* ============================================================================
   FIN HERO — the Fintech page's hero, version 3 (Krish, 5 Nov: "remove that
   flow for the hero section… I want a nice design, properly designed")

   The words on the left; on the right the draft's scene, made in UMM's
   language: a glass tile in the brand pastels, the bank card tilted in
   front of it, "your financial world" beside it, "Payment received" below,
   joined by a dashed route with a dot running round it. The pieces arrive
   one by one, then float on their own beats, and lean a little after the
   pointer, each by its depth. Soft brand washes under the scene; none under
   the words.
   ========================================================================== */

type Layer = { cls: string; depth: number; delay: number }

const L = (cls: string, depth: number, delay: number): Layer => ({ cls, depth, delay })

function Piece({ layer, children }: { layer: Layer; children: ReactNode }) {
  return (
    <div className={`fnh-l ${layer.cls}`} style={{ '--d': layer.depth, '--t': `${layer.delay}s` } as CSSProperties}>
      <div className="fnh-l__in">{children}</div>
    </div>
  )
}

function Art({ caption }: { caption: string }) {
  const ref = useRef<HTMLDivElement>(null)

  /* the pieces lean after the pointer, each by its depth */
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    let raf = 0
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = (e.clientY / window.innerHeight) * 2 - 1
        el.style.setProperty('--px', x.toFixed(3))
        el.style.setProperty('--py', y.toFixed(3))
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="fnh__art" aria-hidden="true">
      <div className="fnh-board">
        <span className="fnh-floor" />
        <Piece layer={L('fnh-l--slab', 0.8, 0.1)}>
          <span className="fnh-slab" />
        </Piece>
        <Piece layer={L('fnh-l--route', 1.2, 0.7)}>
          <svg className="fnh-route" viewBox="0 0 600 560">
            <rect className="fnh-route__line" x="70" y="160" width="470" height="250" rx="28" />
            <circle className="fnh-route__end" cx="70" cy="285" r="7" />
            <circle className="fnh-route__end" cx="540" cy="285" r="7" />
            <circle className="fnh-route__run" r="6">
              <animateMotion dur="9s" repeatCount="indefinite" path="M98 160 H512 A28 28 0 0 1 540 188 V382 A28 28 0 0 1 512 410 H98 A28 28 0 0 1 70 382 V188 A28 28 0 0 1 98 160 Z" />
            </circle>
          </svg>
        </Piece>
        <Piece layer={L('fnh-l--card', 1.8, 0.35)}>
          <span className="fnh-card">
            <span className="fnh-card__rings" />
            <span className="fnh-card__chip" />
            <svg className="fnh-card__wave" viewBox="0 0 24 24">
              <path d="M8 7.5a6.5 6.5 0 0 1 0 9M11.5 5a10 10 0 0 1 0 14M15 2.8a13 13 0 0 1 0 18.4" />
            </svg>
            <span className="fnh-card__mark">umm.</span>
            <span className="fnh-card__name">EVERYDAY FINANCE</span>
            <span className="fnh-card__dot" />
          </span>
        </Piece>
        <Piece layer={L('fnh-l--world', 2.6, 0.6)}>
          <span className="fnh-world">
            <small>YOUR FINANCIAL WORLD</small>
            <b>One connected experience.</b>
            <span className="fnh-chip">Ready for what’s next ↗</span>
          </span>
        </Piece>
        <Piece layer={L('fnh-l--paid', 3, 0.85)}>
          <span className="fnh-paid">
            <span className="fnh-paid__check">
              <svg viewBox="0 0 24 24">
                <path d="M6 12.5l4 4L18.5 8" />
              </svg>
            </span>
            <b>Payment received</b>
            <small>A clear next step. At every step.</small>
          </span>
        </Piece>
        <span className="fnh-caption">{caption}</span>
      </div>
    </div>
  )
}

export function FinHero({ content }: { content: HouseHeroContent }) {
  const stage = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const st = stage.current!
    const raf = requestAnimationFrame(() => (st.dataset.in = ''))
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <section className="fnh" aria-labelledby="fnh-title">
      <div ref={stage} className="fnh__stage">
        <MegaNav />
        <div className="fnh__body">
          <div className="fnh__copy">
            <p className="f3-pill fnh__pill" data-umm-tone="sky">
              {content.eyebrow}
            </p>
            <h1 id="fnh-title" className="fnh__title">
              {content.lines.map((l, i) => (
                <span key={l} className={`fnh__line${i ? ' fnh__line--soft' : ''}`} style={{ '--i': i } as CSSProperties}>
                  <span>{l}</span>
                </span>
              ))}
            </h1>
            <p className="fnh__lead">{content.lead}</p>
            <div className="fnh__actions">
              <SplitButton href={content.primary.href}>{content.primary.label}</SplitButton>
              <a className="fnh__more" href={content.secondary.href}>
                {content.secondary.label} <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <Art caption={content.strapline} />
        </div>
        <div className="fnh__base">
          <p>{content.sectors.join(' / ')}</p>
        </div>
      </div>
    </section>
  )
}
