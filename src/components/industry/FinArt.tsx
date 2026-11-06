import type { JSX } from 'react'
import type { FinArtName } from '@/content/fintech'
import type { Tone } from '@/components/primitives/tone'

/* ============================================================================
   FIN ART — the small drawings on the Fintech page's cards and panels

   Six, after the live draft's (5 Nov): the three people cards, the case
   under review, the shield, the policy search, the card beside "your
   financial world", and the payment on its way. Redrawn flat in the brand
   pastels and ink, each object on its own ground: nothing overlaps anything,
   the pieces sit side by side, joined by a dashed line, and each one floats
   slowly on its own beat. The words in them are the draft's.

   Drawn on a 360 × 220 board, centred in a panel of the card's tone; the
   panel can be any width, the drawing keeps its size from the panel's height.
   ========================================================================== */

function Tick({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      className="fa-tick"
      d={`M${x - 5 * s} ${y} l${3.5 * s} ${3.5 * s} l${6.5 * s} ${-7 * s}`}
      style={{ strokeWidth: 1.8 * s }}
    />
  )
}

function People() {
  const cards = [
    { x: 30, fill: 'fa-sky', label: 'Customer' },
    { x: 136, fill: 'fa-paper', label: 'Application' },
    { x: 242, fill: 'fa-citrus', label: 'Your team' },
  ]
  return (
    <>
      <line className="fa-dash" x1="12" y1="110" x2="348" y2="110" />
      <circle className="fa-ink" cx="12" cy="110" r="3.5" />
      <circle className="fa-ink" cx="348" cy="110" r="3.5" />
      {cards.map((c, i) => (
        <g key={c.label} className="fa-float" style={{ animationDelay: `${i * -2.3}s` }}>
          <rect className={`${c.fill} fa-edge`} x={c.x} y="52" width="88" height="116" rx="14" />
          <circle className={i === 1 ? 'fa-veil fa-edge' : 'fa-paper fa-edge'} cx={c.x + 44} cy="86" r="13" />
          <rect className="fa-bar" x={c.x + 22} y="112" width="44" height="4" rx="2" />
          <rect className="fa-bar fa-bar--quiet" x={c.x + 22} y="122" width="30" height="4" rx="2" />
          <text className="fa-t fa-t--label" x={c.x + 44} y="150" textAnchor="middle">
            {c.label}
          </text>
        </g>
      ))}
    </>
  )
}

function Review() {
  const lines = [94, 86, 94, 70, 90, 60]
  return (
    <>
      <line className="fa-dash" x1="162" y1="110" x2="180" y2="110" />
      <g className="fa-float">
        <rect className="fa-blossom fa-edge" x="36" y="34" width="126" height="152" rx="14" />
        <rect className="fa-bar" x="52" y="54" width="60" height="6" rx="3" />
        {lines.map((w, i) => (
          <rect key={i} className="fa-bar fa-bar--quiet" x="52" y={76 + i * 15} width={w} height="4" rx="2" />
        ))}
      </g>
      <g className="fa-float" style={{ animationDelay: '-3.4s' }}>
        <rect className="fa-paper fa-edge" x="180" y="66" width="146" height="88" rx="12" />
        <circle className="fa-citrus fa-edge" cx="202" cy="92" r="10" />
        <Tick x={202} y={92} />
        <text className="fa-t fa-t--title" x="219" y="96">
          Ready for review
        </text>
        <text className="fa-t fa-t--quiet" x="194" y="122">
          Evidence, organized
        </text>
        <text className="fa-t fa-t--quiet" x="194" y="135">
          around the case.
        </text>
      </g>
    </>
  )
}

function Shield() {
  return (
    <>
      <line className="fa-dash" x1="40" y1="112" x2="116" y2="112" />
      <line className="fa-dash" x1="244" y1="112" x2="320" y2="112" />
      <circle className="fa-citrus fa-edge" cx="40" cy="112" r="4.5" />
      <circle className="fa-citrus fa-edge" cx="320" cy="112" r="4.5" />
      <g className="fa-float">
        <path
          className="fa-sky fa-edge"
          d="M180 30 C200 42 220 47 238 47 L238 104 C238 148 212 177 180 194 C148 177 122 148 122 104 L122 47 C140 47 160 42 180 30 Z"
        />
        <path className="fa-tick fa-tick--big" d="M155 110 L174 129 L207 91" />
      </g>
    </>
  )
}

function Search() {
  return (
    <g className="fa-float">
      <rect className="fa-paper fa-edge" x="62" y="34" width="236" height="152" rx="16" />
      <rect className="fa-sky" x="78" y="50" width="204" height="30" rx="15" />
      <circle className="fa-stroke" cx="95" cy="64.5" r="5.5" />
      <line className="fa-stroke" x1="99" y1="68.5" x2="103" y2="72.5" />
      <text className="fa-t fa-t--body" x="110" y="69">
        What does my policy cover?
      </text>
      <rect className="fa-blossom" x="78" y="96" width="128" height="6" rx="3" />
      <rect className="fa-bar fa-bar--quiet" x="78" y="111" width="188" height="4" rx="2" />
      <rect className="fa-bar fa-bar--quiet" x="78" y="122" width="170" height="4" rx="2" />
      <rect className="fa-bar fa-bar--quiet" x="78" y="133" width="150" height="4" rx="2" />
      <rect className="fa-citrus fa-edge" x="78" y="148" width="128" height="22" rx="11" />
      <text className="fa-t fa-t--chip" x="88" y="162.5">
        Linked to the source ↗
      </text>
    </g>
  )
}

function World() {
  return (
    <>
      <g className="fa-float">
        <rect className="fa-ink" x="24" y="58" width="152" height="104" rx="14" />
        <rect className="fa-sun" x="40" y="76" width="24" height="18" rx="4" />
        <text className="fa-t fa-t--mark" x="160" y="88" textAnchor="end">
          umm.
        </text>
        <text className="fa-t fa-t--caps fa-t--on-ink" x="40" y="142">
          EVERYDAY FINANCE
        </text>
        <circle className="fa-citrus" cx="158" cy="138" r="7" />
      </g>
      <g className="fa-float" style={{ animationDelay: '-3.4s' }}>
        <rect className="fa-paper fa-edge" x="192" y="44" width="146" height="132" rx="14" />
        <text className="fa-t fa-t--caps" x="208" y="68">
          YOUR FINANCIAL WORLD
        </text>
        <line className="fa-rule" x1="208" y1="78" x2="322" y2="78" />
        <text className="fa-t fa-t--title" x="208" y="100">
          One connected
        </text>
        <text className="fa-t fa-t--title" x="208" y="115">
          experience.
        </text>
        <rect className="fa-citrus fa-edge" x="208" y="134" width="118" height="24" rx="12" />
        <text className="fa-t fa-t--chip" x="217" y="149.5">
          Ready for what’s next ↗
        </text>
      </g>
    </>
  )
}

function Payment() {
  return (
    <>
      <g className="fa-float">
        <rect className="fa-sky fa-edge" x="28" y="66" width="104" height="88" rx="14" />
        <circle className="fa-paper fa-edge" cx="52" cy="92" r="11" />
        <rect className="fa-bar" x="70" y="86" width="46" height="5" rx="2.5" />
        <rect className="fa-bar fa-bar--quiet" x="70" y="96" width="32" height="4" rx="2" />
        <rect className="fa-paper fa-edge" x="44" y="118" width="72" height="9" rx="4.5" />
        <rect className="fa-bar fa-bar--quiet" x="44" y="134" width="48" height="4" rx="2" />
      </g>
      <line className="fa-dash" x1="132" y1="110" x2="184" y2="110" />
      <circle className="fa-ink fa-run" cx="138" cy="110" r="3.5" />
      <g className="fa-float" style={{ animationDelay: '-3.4s' }}>
        <rect className="fa-paper fa-edge" x="184" y="66" width="152" height="88" rx="12" />
        <circle className="fa-citrus fa-edge" cx="206" cy="92" r="10" />
        <Tick x={206} y={92} />
        <text className="fa-t fa-t--title" x="223" y="96">
          Payment received
        </text>
        <text className="fa-t fa-t--quiet" x="198" y="122">
          A clear next step.
        </text>
        <text className="fa-t fa-t--quiet" x="198" y="135">
          At every step.
        </text>
      </g>
    </>
  )
}

const ART: Record<FinArtName, () => JSX.Element> = {
  people: People,
  review: Review,
  shield: Shield,
  search: Search,
  world: World,
  payment: Payment,
}

export function FinArt({ name, tone, className = '' }: { name: FinArtName; tone: Tone; className?: string }) {
  const Draw = ART[name]
  return (
    <div className={`fa ${className}`.trim()} data-umm-tone={tone} aria-hidden="true">
      <svg viewBox="0 0 360 220" focusable="false">
        <Draw />
      </svg>
    </div>
  )
}
