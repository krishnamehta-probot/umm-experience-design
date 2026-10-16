import { Burst, Hand, LINE, SOLID } from '@/components/v2/HandDrawn'
import '@/styles/growth-ind.css'

/* ============================================================================
   INTEGRATED GROWTH · SMALL DRAWINGS

   The business-models band's pictures (v2/Industries `art`). 16 Oct,
   Krish: in the manner of umm.digital's home page drawings, as Cloud's
   are: hands at work in black line, a solid or striped cuff, white
   objects, confetti, a short bouncy loop. One scene per model:

     - B2B & SaaS: leads drop through a funnel; two hands meet in a fist
       bump as one comes out qualified, a check pops over them
     - Retail & commerce: a hand drops a product into the bag, the bag
       bounces, the repeat arrow comes round
     - Education: a hand with a pencil ticks the application row by row,
       a cap lands on it, the follow-up flies off
     - Life sciences & technology: a hand swirls a flask, bubbles rising;
       the evidence chart draws itself; a review stamp lands on it

   The hand, lines and confetti are shared (v2/HandDrawn); motion is
   growth-ind.css (and the shared cloud-ind.css).
   ========================================================================== */

/** B2B & SaaS: a qualified lead, and a deal */
const Pipeline = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind gr-ind gr-ind--b2b">
    {/* the leads, and the funnel they fall through */}
    {[68, 80, 92].map((x, i) => (
      <circle
        key={x}
        {...LINE}
        className={`gr-ind__lead${i === 1 ? ' gr-ind__lead--won' : ''}`}
        cx={x}
        cy="4"
        r="3.2"
        fill={i === 1 ? 'currentColor' : 'var(--umm-paper)'}
        style={{ ['--i' as string]: i }}
      />
    ))}
    <path {...SOLID} d="M56 12h48l-15 16v12H71V28z" />
    <path {...LINE} d="M62 19h36" />
    {/* the two hands */}
    <g className="gr-ind__left">
      <g transform="translate(2 72)">
        <Hand cuff="stripe" />
      </g>
    </g>
    <g className="gr-ind__right">
      <g transform="translate(158 72) scale(-1 1)">
        <Hand cuff="ink" />
      </g>
    </g>
    <Burst className="gr-ind__burst--bump" x={80} y={70} />
    <g className="gr-ind__won">
      <circle {...SOLID} cx="80" cy="50" r="8" />
      <path {...LINE} d="M76.2 50l2.6 2.6 5 -5.4" />
    </g>
    <path className="cd-ind__fleck" {...LINE} d="M20 22l2 -2M28 34h3M132 20l2 2.4M140 36h3" />
  </svg>
)

/** Retail & commerce: into the bag, and round again */
const Retail = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind gr-ind gr-ind--retail">
    {/* the product, and the hand that brings it */}
    <g className="gr-ind__product">
      <rect {...SOLID} x="70" y="30" width="20" height="18" rx="2" />
      <path {...LINE} d="M70 36h20M80 30v6" />
    </g>
    <g className="gr-ind__drop-hand">
      <g transform="translate(80 4) rotate(90) scale(0.85)">
        <Hand cuff="ink" />
      </g>
    </g>
    {/* the bag */}
    <g className="gr-ind__bag">
      <path {...LINE} d="M68 58v-7a12 12 0 0 1 24 0v7" />
      <path {...SOLID} d="M56 92l4 -36h40l4 36z" />
      <path {...LINE} d="M68 60v3M92 60v3" />
    </g>
    <path {...LINE} d="M30 92h100" />
    <Burst className="gr-ind__burst--bag" x={80} y={52} />
    {/* round again: the repeat arrow */}
    <g className="gr-ind__again">
      <circle {...SOLID} cx="126" cy="44" r="12" />
      <path {...LINE} d="M120 44a6 6 0 1 0 2 -4.6M120 37v4h4" />
    </g>
    <path className="cd-ind__fleck" {...LINE} d="M24 30l2 -2M32 46h3M140 72l2 2.4M30 70h3" />
  </svg>
)

/** Education: the application, ticked row by row */
const Education = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind gr-ind gr-ind--edu">
    {/* the form */}
    <rect {...SOLID} x="34" y="20" width="62" height="74" rx="4" />
    <path {...LINE} d="M42 30h30" />
    {[42, 58, 74].map((y, i) => (
      <g key={y}>
        <rect {...LINE} x="42" y={y} width="9" height="9" rx="2" />
        <path {...LINE} d={`M56 ${y + 3}h32M56 ${y + 8}h22`} />
        <path
          {...LINE}
          strokeWidth="2"
          className="gr-ind__tick"
          d={`M43.5 ${y + 4.5}l2.6 2.6 5.4 -6`}
          style={{ ['--i' as string]: i }}
        />
      </g>
    ))}
    {/* the cap that lands on it */}
    <g className="gr-ind__cap">
      <path {...SOLID} d="M65 4l22 9 -22 9 -22 -9z" />
      <path {...SOLID} d="M51 16v8c0 3 6 5 14 5s14 -2 14 -5v-8l-14 6z" />
      <path {...LINE} d="M87 13v10" />
    </g>
    {/* the follow-up, flying off */}
    <g className="gr-ind__mail">
      <rect {...SOLID} x="112" y="14" width="26" height="18" rx="2" />
      <path {...LINE} d="M112 15l13 9 13 -9" />
      <path {...LINE} className="gr-ind__mail-lines" d="M104 20h-8M104 26h-12" />
    </g>
    {/* the hand and its pencil */}
    <g className="gr-ind__writer">
      <path {...SOLID} d="M0 0l3 -7 16 -12 4 4 -16 12z" />
      <path {...LINE} d="M3 -7l4 4" />
      <g transform="translate(46 -16) rotate(200)">
        <Hand cuff="stripe" />
      </g>
    </g>
    <path className="cd-ind__fleck" {...LINE} d="M14 30l2 -2M20 50h3M146 60l2 2.4M128 80h3" />
  </svg>
)

/** Life sciences & technology: evidence, reviewed */
const Science = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind gr-ind gr-ind--sci">
    {/* the flask, swirled by the hand that holds it */}
    <g className="gr-ind__flask">
      <path {...SOLID} d="M42 18v20L26 76c-1.6 4 1 7 5 7h34c4 0 6.6 -3 5 -7L54 38V18z" />
      <path
        className="gr-ind__liquid"
        d="M33.4 62h29.2l5.8 13.6c1 2.6 -.6 4.4 -3.2 4.4H31c-2.6 0 -4.2 -1.8 -3.2 -4.4z"
      />
      <path {...LINE} d="M38 18h20" />
      {[
        [42, 70],
        [50, 66],
        [56, 72],
      ].map(([x, y], i) => (
        <circle key={i} {...SOLID} className="gr-ind__bubble" cx={x} cy={y} r="2.4" style={{ ['--i' as string]: i }} />
      ))}
      <g transform="translate(4 64)">
        <Hand cuff="ink" />
      </g>
    </g>
    {/* the evidence chart */}
    <rect {...SOLID} x="86" y="20" width="62" height="56" rx="5" />
    <path {...LINE} d="M94 66h46M94 66V30" />
    <path {...LINE} className="gr-ind__trend" d="M96 60l12 -8 10 4 18 -20" />
    {/* the review stamp */}
    <g className="gr-ind__stamp">
      <circle {...SOLID} cx="138" cy="70" r="11" />
      <circle {...LINE} cx="138" cy="70" r="7.5" />
      <path {...LINE} d="M134 70l3 3 5.4 -6" />
    </g>
    <Burst className="gr-ind__burst--stamp" x={138} y={66} />
    <path className="cd-ind__fleck" {...LINE} d="M12 26l2 -2M18 40h3M76 14l2 2.4" />
  </svg>
)

export const GROWTH_INDUSTRY_ART = [Pipeline, Retail, Education, Science]
