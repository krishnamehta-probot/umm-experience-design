/* ============================================================================
   INTEGRATED GROWTH · SMALL DRAWINGS

   The business-models band's pictures (v2/Industries `art`): each model as
   the journey its growth runs on. Strokes in currentColor; the wire and
   packet styles are industries.css.
   ========================================================================== */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** B2B & SaaS: a pipeline narrowing to a won account */
const Pipeline = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M8 10h56l-14 18v24H22V28z" />
      <path d="M14 18h44M24 28h24" />
      <path className="cx-ind__wire" d="M50 40h28" />
      <rect x="80" y="26" width="32" height="28" rx="5" />
      <path d="m88 40 5 5 10-11" />
    </g>
  </svg>
)

/** Retail & commerce: a basket returning for another order */
const Retail = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M10 18h8l6 26h28l6-18H22" />
      <circle cx="28" cy="52" r="3.5" />
      <circle cx="48" cy="52" r="3.5" />
      <path className="cx-ind__wire" d="M66 34c10-20 34-20 40 0s-26 22-36 6" />
      <path d="m68 46 2-6 6 2" />
    </g>
  </svg>
)

/** Education: a programme found, an application on its way */
const Education = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M8 22 34 10l26 12-26 12z" />
      <path d="M18 27v12c0 4 7 8 16 8s16-4 16-8V27M60 22v14" />
      <path className="cx-ind__wire" d="M62 44h18" />
      <rect x="82" y="20" width="30" height="38" rx="4" />
      <path d="M89 30h16M89 37h16M89 44h10" />
    </g>
  </svg>
)

/** Life sciences & technology: evidence behind the story */
const Science = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M22 8h16M26 8v18L12 52c-1.5 3 .5 6 4 6h28c3.5 0 5.5-3 4-6L34 26V8" />
      <path d="M18 42h24" />
      <path className="cx-ind__wire" d="M54 34h16" />
      <rect x="72" y="12" width="40" height="44" rx="5" />
      <path d="M79 46l7-9 6 5 12-14" />
    </g>
  </svg>
)

export const GROWTH_INDUSTRY_ART = [Pipeline, Retail, Education, Science]
