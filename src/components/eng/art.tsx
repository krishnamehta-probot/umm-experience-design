/* ============================================================================
   DIGITAL ENGINEERING · SMALL DRAWINGS

   The industries band's pictures (v2/Industries `art`): each sector as the
   software it runs on. Strokes in currentColor; the wire and packet styles
   are industries.css.
   ========================================================================== */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** Property & Living: a resident app with its booking calendar */
const Resident = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <rect x="10" y="4" width="30" height="56" rx="6" />
      <path d="M21 9h8M16 20h18M16 27h12" />
      <rect x="16" y="34" width="18" height="14" rx="2" />
      <path className="cx-ind__wire" d="M44 32h22" />
      <rect x="70" y="10" width="42" height="42" rx="5" />
      <path d="M70 22h42M80 6v8M102 6v8M78 30h4M88 30h4M98 30h4M78 40h4M88 40h4" />
    </g>
    <rect x="96" y="36" width="8" height="8" rx="2" fill="currentColor" />
    <circle className="cx-ind__packet" r="2.6" cy="32" cx="40" />
  </svg>
)

/** Manufacturing & Distribution: two systems joined through an API */
const Systems = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <rect x="6" y="12" width="38" height="40" rx="5" />
      <path d="M6 22h38M13 31h20M13 39h14" />
      <rect x="76" y="12" width="38" height="40" rx="5" />
      <path d="M76 22h38M83 31h22M83 39h10" />
      <path className="cx-ind__wire" d="M44 32h32" />
      <path d="m54 26-5 6 5 6M66 26l5 6-5 6" />
    </g>
  </svg>
)

/** Digital products & services: one product on the web and on a phone */
const Product = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <rect x="6" y="8" width="70" height="48" rx="5" />
      <path d="M6 18h70M12 13h.01M17 13h.01M22 13h.01M14 26h30M14 34h22" />
      <rect x="50" y="26" width="18" height="22" rx="3" />
      <rect x="86" y="14" width="26" height="46" rx="5" />
      <path d="M93 20h12M92 28h14M92 34h10" />
      <path className="cx-ind__wire" d="M76 40h10" />
    </g>
  </svg>
)

export const ENG_INDUSTRY_ART = [Resident, Systems, Product]
