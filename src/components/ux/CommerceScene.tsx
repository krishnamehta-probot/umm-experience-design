import type { CommerceModel } from '@/content/uxCommerce'

/* ============================================================================
   UX & DIGITAL COMMERCE · ONE ORDER'S JOURNEY (CommerceArchitecture's picture)

   On the ink board: the experiences on the left (a storefront, a phone, a
   B2B portal, a marketplace stall); the AI and personalization bar across
   the top, its beam into the commerce services; those services in the
   middle, four tiles (products and pricing, accounts, transactions,
   orders); the business operations on the right (ERP, warehouse, product
   information, CRM, analytics), their signals looping back to the AI bar;
   what holds across the architecture along the floor.

   `focus` is the card being read. The architecture's four light their
   layer with packets running into it; the four business models light
   what they lean on and run an order along their route:

     experience     the four experiences, packets into the services
     ai             the AI bar, intent rising to it, its beam down
     services       the four tiles, packets across them
     operations     the five systems, packets out to them, the loop
     retail         storefront → products → checkout → product data, warehouse
     b2b            B2B portal → accounts → pricing → orders → ERP
     subscriptions  phone → accounts → billing → CRM, analytics
     bookings       storefront → catalog → bookings → payment → CRM

   Motion: cloud-flow.css, the shared story.
   ========================================================================== */

export type CommerceFocus = 'experience' | 'ai' | 'services' | 'operations' | CommerceModel['id']

const L = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const RAISE = { ...L, fill: 'var(--umm-ink-raise)' } as const

const EXP_Y = [110, 172, 234, 296]
const OPS_Y = [104, 152, 200, 248, 296]
const TILE = [
  [392, 132],
  [508, 132],
  [392, 214],
  [508, 214],
]
const MID = TILE.map(([x, y]) => `${x + 50} ${y + 35}`)
const IN = EXP_Y.map((y) => `M172 ${y}C276 ${y} 276 214 380 214`)
const OUT = OPS_Y.map((y) => `M620 214C724 214 724 ${y} 828 ${y}`)
const into = (y: number) => `M172 ${y}C276 ${y} 276 214 380 214`
const outTo = (y: number) => `C724 214 724 ${y} 828 ${y}`

const SCENE: Record<
  CommerceFocus,
  { exp: number[]; svc: number[]; ops: number[]; ai?: boolean; loop?: boolean; routes: string[] }
> = {
  experience: { exp: [0, 1, 2, 3], svc: [], ops: [], routes: IN },
  ai: { exp: [], svc: [], ops: [], ai: true, routes: ['M172 110C290 110 300 40 400 40', 'M500 62V120'] },
  services: {
    exp: [],
    svc: [0, 1, 2, 3],
    ops: [],
    routes: [`M380 214L${MID[0]}L${MID[1]}L620 214`, `M380 214L${MID[2]}L${MID[3]}L620 214`],
  },
  operations: { exp: [], svc: [], ops: [0, 1, 2, 3, 4], loop: true, routes: OUT },
  retail: {
    exp: [0],
    svc: [0, 2],
    ops: [1, 2],
    ai: true,
    routes: [`${into(110)}L${MID[0]}L${MID[2]}L620 214${outTo(152)}`, `M620 214${outTo(200)}`],
  },
  b2b: {
    exp: [2],
    svc: [1, 0, 3],
    ops: [0],
    routes: [`${into(234)}L${MID[1]}L${MID[0]}L${MID[3]}L620 214${outTo(104)}`],
  },
  subscriptions: {
    exp: [1],
    svc: [1, 2],
    ops: [3, 4],
    ai: true,
    routes: [`${into(172)}L${MID[1]}L${MID[2]}L620 214${outTo(248)}`, `M620 214${outTo(296)}`],
  },
  bookings: {
    exp: [0],
    svc: [0, 3, 2],
    ops: [3],
    routes: [`${into(110)}L${MID[0]}L${MID[3]}L${MID[2]}L620 214${outTo(248)}`],
  },
}

/** the tiles' marks, at a tile's centre */
const TILE_MARK = [
  // products and pricing: a price tag
  (x: number, y: number) => `M${x - 14} ${y - 4}l10 -10h16v16l-10 10zM${x + 6} ${y - 8}h0`,
  // accounts: a person
  (x: number, y: number) =>
    `M${x} ${y - 6}m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M${x - 12} ${y + 14}c1 -7 6 -10 12 -10s11 3 12 10`,
  // transactions: a card
  (x: number, y: number) => `M${x - 16} ${y - 10}h32v20h-32zM${x - 16} ${y - 4}h32M${x - 10} ${y + 5}h8`,
  // orders: a box
  (x: number, y: number) =>
    `M${x - 14} ${y - 6}l14 -7 14 7v16l-14 7 -14 -7zM${x - 14} ${y - 6}l14 7 14 -7M${x} ${y + 1}v16`,
]

export function CommerceScene({ focus }: { focus: CommerceFocus }) {
  const s = SCENE[focus]
  const on = (lit: boolean) => (lit ? 'true' : undefined)
  const packets = s.routes.length > 1 ? 2 : 3
  return (
    <svg className="cd-sky uc-sky" viewBox="0 0 1000 350" aria-hidden="true" data-focus={focus}>
      <g className="cd-sky__pipes">
        {IN.map((d) => (
          <path key={d} {...L} d={d} />
        ))}
        {OUT.map((d) => (
          <path key={d} {...L} d={d} />
        ))}
      </g>

      {/* AI and personalization: a search bar that knows the shopper */}
      <g className="cd-sky__lit" data-on={on(!!s.ai)}>
        <path {...L} className="cd-sky__beam" d="M500 64V122" />
        <rect {...RAISE} x="400" y="18" width="200" height="44" rx="22" />
        <circle {...L} cx="426" cy="40" r="8" />
        <path {...L} d="M432 46l6 6M448 40h70" />
        <g className="cd-sky__spark">
          <path {...L} d="M570 30v20M560 40h20M563 33l14 14M577 33l-14 14" />
        </g>
      </g>

      {/* the loop: journey and transaction signals back to the AI bar */}
      <path {...L} className="cd-sky__loop" data-on={on(!!s.loop)} d="M944 104C988 104 988 40 900 40H606" />

      {/* the experiences */}
      <g className="cd-sky__lit" data-on={on(s.exp.includes(0))}>
        {/* the storefront */}
        <rect {...RAISE} x="62" y="88" width="108" height="44" rx="7" />
        <path {...L} d="M62 100h108M74 112h16v12h-16zM98 112h16v12h-16zM122 112h16v12h-16z" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.exp.includes(1))}>
        {/* the phone */}
        <rect {...RAISE} x="100" y="150" width="30" height="46" rx="6" />
        <path {...L} d="M110 156h10M108 166h14v14h-14zM110 188h10" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.exp.includes(2))}>
        {/* the B2B portal: a table of lines */}
        <rect {...RAISE} x="62" y="212" width="108" height="44" rx="7" />
        <path {...L} d="M62 224h108M74 234h40M74 244h52M132 234h26M132 244h26" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.exp.includes(3))}>
        {/* the marketplace: a stall and its awning */}
        <path {...RAISE} d="M72 284h88l-6 -10H78zM78 284v30h76v-30" />
        <path {...L} d="M94 274v10M116 274v10M138 274v10M106 298h20v16h-20z" />
      </g>

      {/* the commerce services */}
      <rect {...RAISE} className="cd-sky__cloud" x="380" y="122" width="240" height="176" rx="22" />
      {TILE.map(([x, y], i) => (
        <g key={i} className="cd-sky__lit" data-on={on(s.svc.includes(i))}>
          <rect {...RAISE} x={x} y={y} width="100" height="70" rx="12" />
          <path {...L} d={TILE_MARK[i](x + 50, y + 35)} />
        </g>
      ))}

      {/* the business operations */}
      {OPS_Y.map((y, i) => (
        <g key={y} className="cd-sky__lit" data-on={on(s.ops.includes(i))}>
          <rect {...RAISE} x="830" y={y - 18} width="112" height="36" rx="7" />
          {i === 0 && <path {...L} d={`M844 ${y - 6}h18v12h-18zM870 ${y - 6}h18v12h-18zM896 ${y - 6}h32v12h-32z`} />}
          {i === 1 && (
            <path {...L} d={`M848 ${y + 8}v-10l12 -6 12 6v10M884 ${y + 8}h14v-10h-14zM904 ${y + 8}h22v-10h-22z`} />
          )}
          {i === 2 && <path {...L} d={`M846 ${y - 8}h16v16h-16zM870 ${y - 4}h50M870 ${y + 4}h36`} />}
          {i === 3 && (
            <path {...L} d={`M860 ${y - 2}m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M876 ${y - 4}h44M876 ${y + 4}h30`} />
          )}
          {i === 4 && <path {...L} d={`M846 ${y + 8}l14 -8 12 5 20 -13 16 6 12 -6`} />}
        </g>
      ))}

      {/* what holds across the architecture, along the floor */}
      <g className="cd-sky__guard">
        <path {...L} d="M360 336H640" />
        {[410, 470, 530, 590].map((x, i) => (
          <g key={x} style={{ ['--i' as string]: i }} className="cd-sky__shield">
            <path {...RAISE} d={`M${x} 318l-11 4v7c0 6 4.6 10.6 11 12 6.4 -1.4 11 -6 11 -12v-7z`} />
            <path {...L} strokeWidth="1.6" d={`M${x - 4.5} 329l3 3 6 -6`} />
          </g>
        ))}
      </g>

      {/* the routes lit, and the orders running them */}
      <g key={focus}>
        {s.routes.map((d, r) => (
          <g key={d}>
            <path {...L} className="cd-sky__route" d={d} id={`uc-sky-route-${r}`} />
            {Array.from({ length: packets }, (_, k) => (
              <circle key={k} className="cd-sky__packet" r="5.5">
                <animateMotion
                  dur="2.8s"
                  begin={`-${(k * 2.8) / packets + r * 0.4}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath href={`#uc-sky-route-${r}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
