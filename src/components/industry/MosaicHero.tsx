import { useEffect, useRef, type CSSProperties } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton } from '@/components/primitives'
import type { IndustryHeroContent } from './IndustryHero'
import '@/styles/mosaic-hero.css'

/* ============================================================================
   MOSAIC HERO — the industry hero (Krish, 2 Nov: "keep it nice, simple and
   perfectly aligned with our brand; no overlapping; everything on point")

   Two columns on one grid. Left, the copy: eyebrow and headline at the top,
   the paragraph and buttons at the foot. Right, a board of square tiles in
   the five pastels and ink, each holding a quarter circle, a half circle or
   a circle: the quarter circles the UMM mark and the homepage's tile mark
   are built from. The copy's top and foot sit exactly on the board's top and
   bottom edges. Nothing overlaps anything.

   Motion, slow and quiet: every few seconds one tile turns its shape a
   quarter, so a quarter circle swings to its next corner and the board keeps
   rearranging itself (the "momentum"). A still board for reduced motion.
   ========================================================================== */

export type MosaicContent = IndustryHeroContent & { sectors: readonly string[] }

type Paint = 'sky' | 'blossom' | 'citrus' | 'sun' | 'coral' | 'ink'
type Tile = {
  bg: Paint
  /** q: a quarter disc filling the cell from a corner; h: a half disc on an
   *  edge; c: a circle; s: plain */
  shape: 'q' | 'h' | 'c' | 's'
  fg?: Paint
  /** quarter turns: q starts in the top-left corner, h on the left edge */
  turn?: number
}

/* five across, four down, set by hand */
const BOARD: Tile[] = [
  { bg: 'sky', shape: 'q', fg: 'ink', turn: 2 },
  { bg: 'citrus', shape: 'h', fg: 'blossom', turn: 0 },
  { bg: 'ink', shape: 'q', fg: 'sun', turn: 3 },
  { bg: 'blossom', shape: 'c', fg: 'sky' },
  { bg: 'sun', shape: 'q', fg: 'coral', turn: 1 },

  { bg: 'coral', shape: 'q', fg: 'sky', turn: 1 },
  { bg: 'ink', shape: 'q', fg: 'citrus', turn: 0 },
  { bg: 'sky', shape: 'h', fg: 'sun', turn: 1 },
  { bg: 'citrus', shape: 'q', fg: 'ink', turn: 3 },
  { bg: 'blossom', shape: 'q', fg: 'coral', turn: 2 },

  { bg: 'sun', shape: 'c', fg: 'blossom' },
  { bg: 'sky', shape: 'q', fg: 'coral', turn: 3 },
  { bg: 'coral', shape: 'q', fg: 'ink', turn: 1 },
  { bg: 'ink', shape: 'q', fg: 'sky', turn: 0 },
  { bg: 'citrus', shape: 'h', fg: 'sky', turn: 2 },

  { bg: 'blossom', shape: 'q', fg: 'citrus', turn: 0 },
  { bg: 'sun', shape: 'h', fg: 'ink', turn: 3 },
  { bg: 'citrus', shape: 'q', fg: 'sky', turn: 2 },
  { bg: 'sky', shape: 'c', fg: 'coral' },
  { bg: 'coral', shape: 'q', fg: 'sun', turn: 3 },
]

const paint = (p: Paint) => (p === 'ink' ? 'var(--umm-ink)' : `var(--umm-${p})`)

export function MosaicHero({ content }: { content: MosaicContent }) {
  const stage = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const st = stage.current!
    requestAnimationFrame(() => (st.dataset.in = ''))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* one tile at a time turns a quarter; the order walks the board so the
       change travels rather than flickering at random */
    const tiles = [...board.current!.querySelectorAll<HTMLElement>('[data-turns]')]
    const order = tiles
      .map((el, i) => ({ el, k: ((i * 7) % tiles.length) + Math.random() * 0.01 }))
      .sort((a, b) => a.k - b.k)
      .map((t) => t.el)
    let step = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(board.current!)
    const id = window.setInterval(() => {
      if (!visible || document.hidden) return
      const el = order[step++ % order.length]
      el.style.setProperty('--turn', String(Number(el.style.getPropertyValue('--turn') || 0) + 1))
    }, 1700)
    return () => {
      window.clearInterval(id)
      io.disconnect()
    }
  }, [])

  return (
    <section className="mh" aria-labelledby="mh-title">
      <div ref={stage} className="mh__stage">
        <MegaNav />

        <div className="mh__body">
          <div className="mh__copy">
            <div className="mh__top">
              <p className="mh__eyebrow">{content.eyebrow}</p>
              <h1 id="mh-title" className="mh__title">
                {content.lines.map((l, i) => (
                  <span key={l} className="mh__line" style={{ '--i': i } as CSSProperties}>
                    <span>{l}</span>
                  </span>
                ))}
              </h1>
            </div>
            <div className="mh__foot">
              <p className="mh__lead">{content.lead}</p>
              <div className="mh__actions">
                <SplitButton href={content.primary.href}>{content.primary.label}</SplitButton>
                <a className="mh__more" href={content.secondary.href}>
                  {content.secondary.label} <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>

          <div ref={board} className="mh__board" aria-hidden="true">
            {BOARD.map((t, i) => (
              <span
                key={i}
                className="mh__tile"
                data-turns={t.shape === 'q' || t.shape === 'h' ? '' : undefined}
                style={
                  {
                    '--bg': paint(t.bg),
                    '--fg': t.fg ? paint(t.fg) : 'transparent',
                    '--turn': t.turn ?? 0,
                    '--i': i,
                  } as CSSProperties
                }
              >
                {t.shape !== 's' && <span className={`mh__shape mh__shape--${t.shape}`} />}
              </span>
            ))}
          </div>
        </div>

        <div className="mh__base">
          <p>{content.strapline}</p>
          <p>{content.sectors.join(' / ')}</p>
        </div>
      </div>
    </section>
  )
}
