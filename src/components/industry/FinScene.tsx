import { useEffect, useRef, type CSSProperties, type JSX } from 'react'
import type { FinArtName } from '@/content/fintech'
import type { Tone } from '@/components/primitives/tone'
import '@/styles/fin-scene.css'

/* ============================================================================
   FIN SCENES — the Fintech page's drawings, version 3 (Krish, 5 Nov:
   "a nice design, properly designed… nice animations going on")

   The draft's six drawings, given depth and life: soft shadows, gradients
   in the brand pastels, a floor under each, and each one acts out its own
   small story once it comes into view, then keeps moving slowly:

     people   a dot runs Customer → Application → Your team; each card
              hops as it passes
     review   the papers fan out, the "Ready for review" note slides in,
              its tick draws itself
     shield   the tick draws itself; rings go out from the shield
     search   the question types itself, the answer's lines fill in, the
              source chip pops
     world    the card's sheen sweeps across it; "your financial world"
              floats beside it
     payment  the payment runs from the sender to "Payment received"

   Each is drawn on a 36 × 22em board (1em = 10 design px) scaled to fit
   its box by container units, so the drawing keeps its proportions in any
   card or panel; the text is real text.
   ========================================================================== */

function Tick() {
  return (
    <svg className="sc-tick" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 12.5l4 4L18.5 8" />
    </svg>
  )
}

function People() {
  const cards = [
    { cls: 'sc-person--sky', label: 'Customer', x: 3 },
    { cls: 'sc-person--paper', label: 'Application', x: 13.6 },
    { cls: 'sc-person--citrus', label: 'Your team', x: 24.2 },
  ]
  return (
    <>
      <span className="sc-floor" />
      <span className="sc-line" />
      <span className="sc-end" style={{ left: '1.2em' }} />
      <span className="sc-end" style={{ left: '34.8em' }} />
      <span className="sc-runner" />
      {cards.map((c, i) => (
        <span
          key={c.label}
          className={`sc-person ${c.cls}`}
          style={{ left: `${c.x}em`, '--i': i, '--f': [0.18, 0.5, 0.82][i] } as CSSProperties}
        >
          <span className="sc-person__face" />
          <span className="sc-person__bar" />
          <span className="sc-person__bar sc-person__bar--quiet" />
          <span className="sc-person__label">{c.label}</span>
        </span>
      ))}
    </>
  )
}

function Review() {
  return (
    <>
      <span className="sc-floor" />
      <span className="sc-frame" />
      <span className="sc-end sc-end--citrus" style={{ left: '3em', top: '11em' }} />
      <span className="sc-end sc-end--citrus" style={{ left: '33em', top: '11em' }} />
      <span className="sc-paper sc-paper--1" />
      <span className="sc-paper sc-paper--2" />
      <span className="sc-paper sc-paper--3">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="sc-note">
        <span className="sc-check">
          <Tick />
        </span>
        <b>Ready for review</b>
        <small>Evidence, organized around the case.</small>
      </span>
    </>
  )
}

function Shield() {
  return (
    <>
      <span className="sc-floor" />
      <span className="sc-dash sc-dash--l" />
      <span className="sc-dash sc-dash--r" />
      <span className="sc-end sc-end--citrus" style={{ left: '4.6em', top: '11.2em' }} />
      <span className="sc-end sc-end--citrus" style={{ left: '31.4em', top: '11.2em' }} />
      <span className="sc-ring" style={{ '--i': 0 } as CSSProperties} />
      <span className="sc-ring" style={{ '--i': 1 } as CSSProperties} />
      <span className="sc-ring" style={{ '--i': 2 } as CSSProperties} />
      <svg className="sc-shield" viewBox="0 0 360 220" aria-hidden="true">
        <defs>
          <linearGradient id="sc-shield-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--umm-sky)' }} />
            <stop offset="1" style={{ stopColor: 'color-mix(in srgb, var(--umm-blossom) 70%, var(--umm-sky))' }} />
          </linearGradient>
        </defs>
        <path
          className="sc-shield__body"
          d="M180 26 C202 39 222 44 241 44 L241 103 C241 149 213 180 180 197 C147 180 119 149 119 103 L119 44 C138 44 158 39 180 26 Z"
        />
        <path
          className="sc-shield__rim"
          d="M180 38 C198 48 215 53 230 53 L230 103 C230 141 207 168 180 183 C153 168 130 141 130 103 L130 53 C145 53 162 48 180 38 Z"
        />
        <path className="sc-shield__tick" d="M154 110 L173 129 L207 91" />
      </svg>
    </>
  )
}

function Search() {
  return (
    <>
      <span className="sc-floor" />
      <span className="sc-win">
        <span className="sc-ask">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6" />
            <path d="M15 15l4.5 4.5" />
          </svg>
          <span className="sc-type">What does my policy cover?</span>
        </span>
        <span className="sc-ans sc-ans--hi" style={{ '--i': 0 } as CSSProperties} />
        <span className="sc-ans" style={{ '--i': 1, width: '18.6em' } as CSSProperties} />
        <span className="sc-ans" style={{ '--i': 2, width: '16.8em' } as CSSProperties} />
        <span className="sc-ans" style={{ '--i': 3, width: '13.4em' } as CSSProperties} />
        <span className="sc-source">Linked to the source ↗</span>
      </span>
    </>
  )
}

function World() {
  return (
    <>
      <span className="sc-floor" />
      <span className="sc-card">
        <span className="sc-card__chip" />
        <span className="sc-card__mark">umm.</span>
        <span className="sc-card__name">EVERYDAY FINANCE</span>
        <span className="sc-card__dot" />
      </span>
      <span className="sc-world">
        <small>YOUR FINANCIAL WORLD</small>
        <b>One connected experience.</b>
        <span className="sc-chip">Ready for what’s next ↗</span>
      </span>
    </>
  )
}

function Payment() {
  return (
    <>
      <span className="sc-floor" />
      <span className="sc-sender">
        <span className="sc-sender__face">A</span>
        <span className="sc-person__bar" style={{ left: '4.6em', top: '2.1em', width: '4em' }} />
        <span className="sc-person__bar sc-person__bar--quiet" style={{ left: '4.6em', top: '3.1em', width: '2.8em' }} />
        <span className="sc-sender__amount">£250.00</span>
      </span>
      <span className="sc-route" />
      <span className="sc-runner sc-runner--short" />
      <span className="sc-paid">
        <span className="sc-check">
          <Tick />
        </span>
        <b>Payment received</b>
        <small>A clear next step. At every step.</small>
      </span>
    </>
  )
}

const DRAW: Record<FinArtName, () => JSX.Element> = {
  people: People,
  review: Review,
  shield: Shield,
  search: Search,
  world: World,
  payment: Payment,
}

/** One drawing, in a box of the card's tone; it plays once it is a third in
 *  view, and keeps its slow motion after. `ground` paints the tone behind
 *  it; without it the drawing sits on whatever is under it. */
export function FinScene({
  name,
  tone,
  ground = false,
  className = '',
}: {
  name: FinArtName
  tone: Tone
  ground?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.play = ''
          io.disconnect()
        }
      },
      { threshold: 0.33 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const Draw = DRAW[name]
  return (
    <div
      ref={ref}
      className={`sc sc--${name}${ground ? ' sc--ground' : ''} ${className}`.trim()}
      data-umm-tone={tone}
      aria-hidden="true"
    >
      <div className="sc__board">
        <Draw />
      </div>
    </div>
  )
}
