/* ============================================================================
   CLOUD & DATA · SMALL DRAWINGS

   The industries band's pictures (v2/Industries `art`): each sector drawn
   as a small system, its wire carrying a packet of data, slowly.
   Strokes in currentColor; the packet and wire styles are industries.css.
   ========================================================================== */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** Property & Living: three buildings on one line */
const Property = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M8 56V26h18v30M32 56V14h22v42M60 56V30h16v26" />
      <path d="M14 34h6M14 42h6M38 22h10M38 30h10M38 38h10M66 38h4M66 46h4" />
      <path className="cx-ind__wire" d="M4 60h108" />
      <path d="M84 56V40l10-8 10 8v16" />
    </g>
    <circle className="cx-ind__packet" r="2.6" cy="60" cx="0" />
  </svg>
)

/** Manufacturing & Distribution: a plant linked to two depots */
const Plant = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M8 56V30l12 8v-8l12 8v-8l12 8v18z" />
      <path d="M38 30V12h6v18" />
      <path className="cx-ind__wire" d="M44 44C62 44 66 22 84 22M44 50c18 0 22 12 40 12" />
      <rect x="86" y="14" width="22" height="16" rx="3" />
      <rect x="86" y="48" width="22" height="14" rx="3" />
    </g>
    <circle className="cx-ind__packet cx-ind__packet--curve" r="2.6" cx="0" cy="0" />
  </svg>
)

/** Multi-location businesses: three pins feeding one view */
const Locations = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M14 26c0-5 4-9 9-9s9 4 9 9c0 7-9 14-9 14s-9-7-9-14z" />
      <path d="M14 52c0-4 3-7 7-7s7 3 7 7c0 5-7 10-7 10" />
      <path d="M40 12c0-4 3-7 7-7s7 3 7 7c0 5-7 10-7 10s-7-5-7-10z" />
      <path className="cx-ind__wire" d="M30 32h38M27 54h41M50 22c8 0 10 10 18 10" />
      <rect x="70" y="18" width="42" height="40" rx="5" />
      <path d="M78 48V38M86 48V30M94 48V34M102 48V26" />
    </g>
  </svg>
)

export const CLOUD_INDUSTRY_ART = [Property, Plant, Locations]
