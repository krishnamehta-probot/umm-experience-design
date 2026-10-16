import { Burst, Hand, LINE, SOLID } from '@/components/v2/HandDrawn'
import '@/styles/ind-scenes.css'

/* ============================================================================
   DIGITAL ENGINEERING · SMALL DRAWINGS

   The industries band's pictures (v2/Industries `art`). 16 Oct, Krish: in
   the manner of umm.digital's home page drawings, as Cloud's and Growth's
   are: hands at work in black line, a solid or striped cuff, white
   objects, confetti, a short bouncy loop. One scene per sector, each the
   software at work:

     - Property & Living: a hand on a phone taps a service request; the
       wrench flies to the building, its windows light, a check pops
     - Manufacturing & Distribution: a hand plugs the integration in; sparks,
       the server's lights come on, its price tag swings
     - Digital products & services: a hand slots a new block into the
       page's layout, as in the site's arranging drawing

   The hand, lines and confetti are shared (v2/HandDrawn); motion is
   ind-scenes.css (and the shared cloud-ind.css).
   ========================================================================== */

/** Property & Living: a request from the phone, done at the building */
const Resident = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind sc-ind sc-ind--resident">
    {/* the building */}
    <path {...SOLID} d="M12 90V34h44v56z" />
    <path {...LINE} d="M6 90h60" />
    {[
      [20, 42],
      [36, 42],
      [20, 56],
      [36, 56],
      [20, 70],
      [36, 70],
    ].map(([x, y], i) => (
      <rect
        key={i}
        {...LINE}
        className="sc-ind__win"
        x={x}
        y={y}
        width="10"
        height="8"
        rx="1"
        style={{ ['--i' as string]: i }}
      />
    ))}
    <g className="sc-ind__done">
      <circle {...SOLID} cx="34" cy="20" r="8" />
      <path {...LINE} d="M30.2 20l2.6 2.6 5 -5.4" />
    </g>
    {/* the phone, held */}
    <g className="sc-ind__phone">
      <path {...SOLID} d="M108 84l10 26h22l-8 -26z" />
      <path {...LINE} d="M110 92l20 -2 3 8 -20 2z" fill="currentColor" />
      <rect {...SOLID} x="98" y="12" width="38" height="74" rx="6" />
      <path {...LINE} d="M111 17h12" />
      <rect {...LINE} x="104" y="26" width="26" height="14" rx="3" />
      <path {...LINE} d="M108 33h10" />
      <rect {...LINE} className="sc-ind__req" x="104" y="46" width="26" height="14" rx="3" />
      <path {...LINE} d="M109 56l6 -6M113 50a2.4 2.4 0 1 0 3 -3" />
      <circle {...LINE} className="sc-ind__ring" cx="117" cy="53" r="9" />
      <path {...SOLID} d="M98 60h-4.6a3 3 0 0 0 0 6H98M98 67h-5a3 3 0 0 0 0 6H98M98 74h-4.4a3 3 0 0 0 0 6H98" />
      <path {...SOLID} d="M136 62c4 -2 6.4 -8 5 -12 -.8 -2.4 -3.6 -2 -4 .4L136 54" />
    </g>
    {/* the request, on its way */}
    <g className="sc-ind__wrench">
      <circle {...SOLID} cx="108" cy="52" r="7" />
      <path {...LINE} d="M104.5 55.5l5 -5M108.5 50.5a2.2 2.2 0 1 0 2.8 -2.8" />
    </g>
    <Burst className="sc-ind__burst--done" x={34} y={30} />
    <path className="cd-ind__fleck" {...LINE} d="M70 16l2 -2M76 30h3M84 74l2 2.4" />
  </svg>
)

/** Manufacturing & Distribution: the integration plugged in */
const Systems = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind sc-ind sc-ind--plug">
    {/* the server, its socket and its price tag */}
    <rect {...SOLID} x="98" y="30" width="54" height="56" rx="5" />
    <path {...LINE} d="M106 44h30M106 58h30M106 72h30" />
    {[44, 58, 72].map((y, i) => (
      <circle key={y} className="sc-ind__led" cx="144" cy={y} r="2.6" style={{ ['--i' as string]: i }} />
    ))}
    <rect {...SOLID} x="90" y="50" width="10" height="18" rx="2" />
    <path {...LINE} d="M93 55h4M93 63h4" />
    <g className="sc-ind__tag">
      <path {...LINE} d="M140 30v-8" />
      <path {...SOLID} d="M132 6h16v10l-8 6 -8 -6z" />
      <path {...LINE} d="M136 11h8" />
    </g>
    {/* the hand with the plug, and its cable */}
    <g className="sc-ind__plugger">
      <path {...LINE} d="M-20 78C10 78 20 59 40 59" />
      <rect {...SOLID} x="40" y="52" width="22" height="14" rx="3" />
      <path {...LINE} d="M62 55h8M62 63h8" />
      <g transform="translate(26 74) rotate(-28)">
        <Hand cuff="stripe" />
      </g>
    </g>
    <Burst className="sc-ind__burst--plug" x={84} y={58} />
    <path className="cd-ind__fleck" {...LINE} d="M14 20l2 -2M22 34h3M80 16l2 2.4" />
  </svg>
)

/** Digital products & services: a new block, slotted into the layout */
const Product = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true" className="cd-ind sc-ind sc-ind--layout">
    {/* the page */}
    <rect {...SOLID} x="14" y="12" width="110" height="80" rx="5" />
    <path {...LINE} d="M14 24h110M22 18h0M28 18h0M34 18h0" />
    <rect {...LINE} x="22" y="30" width="94" height="12" rx="2" />
    <rect {...LINE} className="sc-ind__grow" x="22" y="48" width="42" height="36" rx="3" />
    <rect {...LINE} className="sc-ind__slot" x="70" y="48" width="46" height="36" rx="3" />
    {/* the block, and the hand that brings it */}
    <g className="sc-ind__block">
      <rect {...SOLID} x="70" y="48" width="46" height="36" rx="3" />
      <path {...LINE} d="M76 56h22M76 64h30M76 72h16" />
    </g>
    <g className="sc-ind__placer">
      <g transform="translate(112 66) rotate(-150)">
        <Hand cuff="ink" />
      </g>
    </g>
    <Burst className="sc-ind__burst--slot" x={93} y={50} />
    <path className="cd-ind__fleck" {...LINE} d="M136 22l2 -2M142 40h3M134 84l2 2.4" />
  </svg>
)

export const ENG_INDUSTRY_ART = [Resident, Systems, Product]
