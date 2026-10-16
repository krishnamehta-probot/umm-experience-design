import { Burst, Hand, LINE, SOLID } from '@/components/v2/HandDrawn'
import '@/styles/ind-scenes.css'

/* ============================================================================
   UX & DIGITAL COMMERCE · SMALL DRAWINGS

   The business types band's pictures (v2/Industries `art`). 16 Oct, Krish:
   in the manner of umm.digital's home page drawings, as the other service
   pages' are: hands at work in black line, a solid or striped cuff, white
   objects, confetti, a short bouncy loop. One scene per business:

     - Brands & retail: a hand holds the phone, the heart on a product is
       tapped, the product flies into the bag
     - Manufacturing & distribution: boxes stack onto the pallet one by one;
       a hand stamps the order approved
     - Subscription businesses: the months tick by on the calendar, a finger
       turns the plan on, the renewal comes round
     - Services & experiences: a finger taps a free slot, it fills and is
       ticked, the confirmation bell rings

   The hand, lines and confetti are shared (v2/HandDrawn); motion is
   ind-scenes.css (and the shared cloud-ind.css).
   ========================================================================== */

/** Brands & retail: loved, and into the bag */
const Retail = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind sc-ind sc-ind--retail">
    {/* the phone in a hand */}
    <path {...SOLID} d="M40 84l10 26h22l-8 -26z" />
    <path {...LINE} d="M42 92l20 -2 3 8 -20 2z" fill="currentColor" />
    <rect {...SOLID} x="30" y="10" width="40" height="76" rx="6" />
    <path {...LINE} d="M44 15h12" />
    <rect {...LINE} x="36" y="22" width="28" height="28" rx="3" />
    <path {...LINE} d="M42 42l6 -8 5 5 4 -4 4 7" />
    <path {...LINE} d="M36 58h18M36 65h12" />
    <path
      {...LINE}
      className="sc-ind__heart"
      d="M60 70c-3 -2.4 -5 -4 -5 -6a2.6 2.6 0 0 1 5 -1 2.6 2.6 0 0 1 5 1c0 2 -2 3.6 -5 6z"
    />
    <circle {...LINE} className="sc-ind__ring" cx="60" cy="66" r="8" />
    <path {...SOLID} d="M30 56h-4.6a3 3 0 0 0 0 6H30M30 63h-5a3 3 0 0 0 0 6H30M30 70h-4.4a3 3 0 0 0 0 6H30" />
    <path {...SOLID} d="M70 62c4 -2 6.4 -8 5 -12 -.8 -2.4 -3.6 -2 -4 .4L70 54" />
    <Burst className="sc-ind__burst--heart" x={60} y={64} />
    {/* the product, flying to the bag */}
    <g className="sc-ind__fly">
      <rect {...SOLID} x="44" y="28" width="14" height="14" rx="2" />
    </g>
    {/* the bag */}
    <g className="sc-ind__bag">
      <path {...LINE} d="M118 56v-6a9 9 0 0 1 18 0v6" />
      <path {...SOLID} d="M108 90l3 -36h32l3 36z" />
    </g>
    <path className="cd-ind__fleck" {...LINE} d="M90 16l2 -2M98 32h3M150 30l2 2.4" />
  </svg>
)

/** Manufacturing & distribution: the bulk order, stacked and approved */
const Bulk = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind sc-ind sc-ind--bulk">
    {/* the order */}
    <rect {...SOLID} x="10" y="22" width="44" height="64" rx="4" />
    <path {...LINE} d="M18 32h24M18 42h28M18 50h20M18 58h26" />
    <g className="sc-ind__approved">
      <circle {...SOLID} cx="34" cy="72" r="9" />
      <path {...LINE} d="M30 72l3 3 5.4 -6" />
    </g>
    <g className="sc-ind__stamper">
      <g transform="translate(34 30) rotate(90) scale(0.85)">
        <Hand cuff="stripe" />
      </g>
    </g>
    <Burst className="sc-ind__burst--stamp" x={34} y={68} />
    {/* the pallet and the boxes landing on it */}
    <path {...LINE} d="M66 90h80M70 90v-4h72v4" />
    {[
      [72, 66],
      [96, 66],
      [120, 66],
      [84, 46],
      [108, 46],
      [96, 26],
    ].map(([x, y], i) => (
      <g key={i} className="sc-ind__box" style={{ ['--i' as string]: i }}>
        <rect {...SOLID} x={x} y={y} width="22" height="20" rx="2" />
        <path {...LINE} d={`M${x} ${y + 6}h22M${x + 11} ${y}v6`} />
      </g>
    ))}
    <path className="cd-ind__fleck" {...LINE} d="M62 16l2 -2M70 30h3M148 20l2 2.4" />
  </svg>
)

/** Subscription businesses: the months, the plan on, the renewal */
const Subscription = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind sc-ind sc-ind--sub">
    {/* the calendar, its months ticking by */}
    <rect {...SOLID} x="14" y="16" width="74" height="70" rx="5" />
    <path {...LINE} d="M14 30h74M30 10v12M72 10v12" />
    {Array.from({ length: 12 }, (_, i) => (
      <rect
        key={i}
        {...LINE}
        className="sc-ind__month"
        x={22 + (i % 4) * 16}
        y={38 + Math.floor(i / 4) * 15}
        width="10"
        height="10"
        rx="2"
        style={{ ['--i' as string]: i }}
      />
    ))}
    {/* the renewal, coming round */}
    <g className="sc-ind__renew">
      <circle {...SOLID} cx="124" cy="30" r="13" />
      <path {...LINE} d="M117 30a7 7 0 1 0 2.4 -5.3M117 22v5h5" />
    </g>
    {/* the plan's switch, and the finger that turns it on */}
    <rect {...SOLID} className="sc-ind__track" x="102" y="60" width="40" height="20" rx="10" />
    <circle {...SOLID} className="sc-ind__knob" cx="112" cy="70" r="7" />
    <g className="sc-ind__finger">
      <g transform="translate(150 104) rotate(-118)">
        <Hand cuff="ink" />
      </g>
    </g>
    <path className="cd-ind__fleck" {...LINE} d="M96 16l2 -2M100 44h3M150 50l2 2.4" />
  </svg>
)

/** Services & experiences: a slot, booked and confirmed */
const Booking = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind sc-ind sc-ind--book">
    {/* the week's slots */}
    <rect {...SOLID} x="12" y="14" width="90" height="74" rx="5" />
    <path {...LINE} d="M12 28h90" />
    {Array.from({ length: 9 }, (_, i) => {
      const x = 20 + (i % 3) * 26
      const y = 36 + Math.floor(i / 3) * 16
      return (
        <rect
          key={i}
          {...LINE}
          className={i === 4 ? 'sc-ind__slot-pick' : undefined}
          x={x}
          y={y}
          width="22"
          height="12"
          rx="2"
          fill={i === 0 || i === 7 ? 'currentColor' : 'var(--umm-paper)'}
          opacity={i === 0 || i === 7 ? 0.25 : 1}
        />
      )
    })}
    <path {...LINE} className="sc-ind__slot-tick" strokeWidth="2" d="M52 58l3 3 6 -6.4" />
    {/* the confirmation bell */}
    <g className="sc-ind__bell">
      <path {...SOLID} d="M118 40c0 -10 5 -16 12 -16s12 6 12 16v8l4 6h-32l4 -6z" />
      <path {...LINE} d="M126 58a4 4 0 0 0 8 0M130 20v4" />
    </g>
    <Burst className="sc-ind__burst--bell" x={130} y={30} />
    {/* the finger that books it */}
    <g className="sc-ind__tapper">
      <g transform="translate(110 78) rotate(-160)">
        <Hand cuff="stripe" />
      </g>
    </g>
    <path className="cd-ind__fleck" {...LINE} d="M150 76l2 -2M140 86h3M110 10l2 2.4" />
  </svg>
)

export const UX_INDUSTRY_ART = [Retail, Bulk, Subscription, Booking]
