import '@/styles/cloud-ind.css'

/* ============================================================================
   CLOUD & DATA · SMALL DRAWINGS

   The industries band's pictures (v2/Industries `art`). 16 Oct, Krish:
   "these animations can be much cooler", look at the ones on umm.digital's
   home page. Those are black line drawings of hands at work, a cuff solid
   or striped, the objects white, a scatter of confetti, each a short
   bouncy loop. These are drawn the same way, one small scene per sector:

     - Property & Living: a hand sets a building into the row, its windows
       light up, a status card pops above
     - Manufacturing & Distribution: one hand passes a crate, its data tag
       on it, to another, while the plant smokes behind
     - Multi-location businesses: three pins send their signals into the
       phone a hand holds, its chart growing

   Lines in currentColor (ink), fills paper; motion is cloud-ind.css.
   ========================================================================== */

const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** filled paper, outlined */
const SOLID = { ...LINE, fill: 'var(--umm-paper)' } as const

/** A hand pointing along +x, wrist at the origin: the cuff behind, three
 *  fingers and a thumb in front, in the site's style. */
function Hand({ cuff = 'ink' }: { cuff?: 'ink' | 'stripe' }) {
  return (
    <g>
      <path {...SOLID} d="M-30 -8.6h22v17.2h-22z" />
      <rect
        {...LINE}
        x="-12"
        y="-11"
        width="12"
        height="22"
        rx="3"
        fill={cuff === 'ink' ? 'currentColor' : 'var(--umm-paper)'}
      />
      {cuff === 'stripe' && <path {...LINE} d="M-8.6 -10.6v21.2M-5 -10.8v21.6M-1.6 -10.6v21.2" />}
      <path
        {...SOLID}
        d="M0 -9C6 -10 9 -10.6 12 -10.4H22c3.6 0 3.6 6 0 6c3.2 0 3.2 6 -.4 6c3 0 3 5.8 -.6 5.8H12C8 9.8 4 10.2 0 9.4z"
      />
      <path {...LINE} d="M13 -4.4h8.6M13 1.6h8M12.6 7.4h7" />
      <path {...SOLID} d="M5 -10.2C8 -15.6 14 -16.8 18.6 -14.8c2 .9 1.4 3.4 -.8 3.6L12 -10.4" />
    </g>
  )
}

/** small confetti that pops round a point */
function Burst({ className, x, y }: { className: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`cd-ind__burst ${className}`} {...LINE}>
        <path d="M0 -9v-5M7 -6l3.4 -3.4M-7 -6l-3.4 -3.4M9 1h5M-9 1h-5" />
      </g>
    </g>
  )
}

/** Property & Living: a hand sets a building into the row */
const Property = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind cd-ind--property">
    <path {...LINE} d="M4 88h152" />
    {/* the row */}
    <path {...SOLID} d="M12 88V44h26v44z" />
    <path {...SOLID} d="M42 88V28h28v60z" />
    <path {...SOLID} d="M108 88V60l16-13 16 13v28z" />
    <g className="cd-ind__wins">
      {[
        [18, 52],
        [28, 52],
        [18, 64],
        [28, 64],
        [48, 36],
        [60, 36],
        [48, 48],
        [60, 48],
        [48, 60],
        [60, 60],
        [120, 64],
      ].map(([x, y], i) => (
        <rect key={i} {...LINE} x={x} y={y} width="6" height="7" rx="1" style={{ ['--i' as string]: i }} />
      ))}
    </g>
    <path {...LINE} d="M120 88v-11h8v11" />
    {/* the one being set in, and the hand that brings it */}
    <g className="cd-ind__drop">
      <path {...SOLID} d="M76 88V52h26v36z" />
      <path {...LINE} d="M82 60h5M91 60h5M82 70h5M91 70h5M82 80h5M91 80h5" />
    </g>
    <g className="cd-ind__lift">
      <g transform="translate(89 26) rotate(90) scale(0.9)">
        <Hand cuff="stripe" />
      </g>
    </g>
    <Burst className="cd-ind__burst--land" x={89} y={46} />
    {/* the status card */}
    <g className="cd-ind__card">
      <rect {...SOLID} x="118" y="8" width="34" height="22" rx="4" />
      <path {...LINE} d="M124 19l3.4 3.4 6.6 -7M138 16h8M138 22h6" />
    </g>
    <path className="cd-ind__fleck" {...LINE} d="M8 18l2 -2M14 26h3M100 14l1.6 2.4" />
  </svg>
)

/** Manufacturing & Distribution: a crate passed from hand to hand */
const Plant = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind cd-ind--plant">
    {/* the plant behind, smoking */}
    <g transform="translate(0 8)">
      <path {...SOLID} d="M50 40V22l10 7v-7l10 7v-7l10 7v11z" />
      <path {...SOLID} d="M84 40V10h6v30z" />
      <path {...LINE} d="M46 40h48" />
      <g className="cd-ind__smoke">
        <circle {...SOLID} cx="87" cy="5" r="2.6" />
        <circle {...SOLID} cx="91" cy="2" r="2" style={{ ['--i' as string]: 1 }} />
      </g>
    </g>
    {/* the route */}
    <path {...LINE} className="cd-ind__route" d="M32 60C56 34 106 34 130 60" />
    {/* the hands */}
    <g transform="translate(4 74)">
      <Hand cuff="stripe" />
    </g>
    <g className="cd-ind__take">
      <g transform="translate(156 74) scale(-1 1)">
        <Hand cuff="ink" />
      </g>
    </g>
    {/* the crate and its tag */}
    <g className="cd-ind__crate">
      <g className="cd-ind__speed" {...LINE}>
        <path d="M14 52h-8M12 58h-10M14 64h-6" />
      </g>
      <rect {...SOLID} x="18" y="46" width="22" height="18" rx="2" />
      <path {...LINE} d="M18 52h22M29 46v6" />
      <rect {...LINE} x="22" y="55" width="9" height="5" rx="1" fill="currentColor" />
    </g>
    <Burst className="cd-ind__burst--catch" x={133} y={42} />
    <path className="cd-ind__fleck" {...LINE} d="M20 18l2 -2M26 30h3M128 20l2 2.4M140 34h3" />
  </svg>
)

/** Multi-location businesses: three pins, one phone */
const Locations = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind cd-ind--places">
    {/* the wires in */}
    <path {...LINE} className="cd-ind__route" d="M24 30H96M30 60H96M58 84C76 84 84 74 96 74" />
    {/* the pins */}
    {[
      [24, 30],
      [30, 60],
      [56, 84],
    ].map(([x, y], i) => (
      <g key={i} className="cd-ind__pin" style={{ ['--i' as string]: i }}>
        <path {...SOLID} transform={`translate(${x} ${y})`} d="M0 0C-1 -4 -8 -8 -8 -14a8 8 0 0 1 16 0C8 -8 1 -4 0 0z" />
        <circle {...LINE} cx={x} cy={y - 14} r="2.8" fill="currentColor" />
      </g>
    ))}
    {/* the signals travelling */}
    <g className="cd-ind__sigs">
      <circle className="cd-ind__sig cd-ind__sig--0" r="2.4" cx="24" cy="30" fill="currentColor" />
      <circle className="cd-ind__sig cd-ind__sig--1" r="2.4" cx="30" cy="60" fill="currentColor" />
      <circle className="cd-ind__sig cd-ind__sig--2" r="2.4" cx="72" cy="80" fill="currentColor" />
    </g>
    {/* the phone in a hand */}
    <g className="cd-ind__hold">
      {/* the arm, from under the phone out of the frame */}
      <path {...SOLID} d="M112 84l14 30h22l-12 -30z" />
      <path {...LINE} d="M115 92l20 -2 4 10 -20 2z" fill="currentColor" />
      <rect {...SOLID} x="98" y="12" width="40" height="76" rx="6" />
      <path {...LINE} d="M112 17h12" />
      <path {...LINE} d="M104 72h28" />
      <g className="cd-ind__bars">
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={106 + i * 7}
            y="40"
            width="4.4"
            height="32"
            rx="1"
            fill="currentColor"
            style={{ ['--i' as string]: i }}
          />
        ))}
      </g>
      <path {...LINE} d="M104 26h14M104 32h9" />
      {/* the fingers round its edge, the thumb over the other */}
      <path {...SOLID} d="M98 56h-4.6a3 3 0 0 0 0 6H98M98 63h-5a3 3 0 0 0 0 6H98M98 70h-4.4a3 3 0 0 0 0 6H98" />
      <path {...SOLID} d="M138 62c4 -2 6.4 -8 5 -12 -.8 -2.4 -3.6 -2 -4 .4L138 54" />
    </g>
    <g className="cd-ind__ping">
      <circle {...SOLID} cx="136" cy="14" r="6" />
      <path {...LINE} d="M136 11v3.4M136 17h0" />
    </g>
    <path className="cd-ind__fleck" {...LINE} d="M70 14l2 -2M80 44h3M8 80l2 2.4" />
  </svg>
)

export const CLOUD_INDUSTRY_ART = [Property, Plant, Locations]
