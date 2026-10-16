/* ============================================================================
   UX & DIGITAL COMMERCE · SMALL DRAWINGS

   The "built around your business" band's pictures (v2/Industries `art`):
   each kind of business as the purchase it runs on. Strokes in
   currentColor; the wire style is industries.css.
   ========================================================================== */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** Brands & retail: a product found, into the bag */
const Retail = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <rect x="8" y="8" width="44" height="50" rx="5" />
      <rect x="15" y="15" width="30" height="24" rx="3" />
      <path d="M15 46h20M15 52h12" />
      <path className="cx-ind__wire" d="M54 32h24" />
      <path d="M82 26h28l-2 30H84z" />
      <path d="M90 26v-4a6 6 0 0 1 12 0v4" />
    </g>
  </svg>
)

/** Manufacturing & distribution: a bulk order, approved */
const Bulk = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M8 20 26 12l18 8v20l-18 8-18-8z" />
      <path d="M8 20l18 8 18-8M26 28v20" />
      <path className="cx-ind__wire" d="M46 32h26" />
      <rect x="74" y="12" width="38" height="44" rx="5" />
      <path d="M81 22h22M81 30h22M81 38h12" />
      <path d="m95 46 4 4 8-9" />
    </g>
  </svg>
)

/** Subscription businesses: a plan that renews */
const Subscription = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <rect x="8" y="10" width="46" height="44" rx="6" />
      <path d="M16 22h20M16 30h30M16 42h12" />
      <path className="cx-ind__wire" d="M58 32h14" />
      <path d="M78 32a16 16 0 1 0 5-11.6" />
      <path d="M78 16v7h7" />
      <path d="M94 26v7l5 3" />
    </g>
  </svg>
)

/** Services & experiences: a slot booked */
const Booking = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <rect x="8" y="10" width="54" height="46" rx="5" />
      <path d="M8 22h54M20 6v8M50 6v8M18 32h6M30 32h6M42 32h6M18 44h6M30 44h6" />
      <path className="cx-ind__wire" d="M64 38h14" />
      <circle cx="96" cy="38" r="14" />
      <path d="m89 38 5 5 9-10" />
    </g>
    <rect x="41" y="40" width="9" height="9" rx="2" fill="currentColor" />
  </svg>
)

export const UX_INDUSTRY_ART = [Retail, Bulk, Subscription, Booking]
