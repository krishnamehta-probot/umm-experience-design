import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import type { Tone } from '@/components/primitives'

/* ============================================================================
   UX & DIGITAL COMMERCE · THE SHOPPER'S PHONE (CommerceArchitecture's hero)

   16 Oct, Krish: the thinking section should be something directly relatable
   to the service. 16 Oct, later: the idea is right but the execution was a
   wireframe (grey bars, flat silhouettes); make it "100% more customized and
   premium". So the phone is now drawn to the CX checkout phone's standard
   (Principles.tsx, approved): a titanium handset, an island, side buttons,
   glass, and a real shop inside it, with words, prices and products drawn as
   shaded pastel objects on studio sweeps. As on the CX phone, the demo
   details inside the device (product names, prices, dates, the order
   number) are illustrative; the content file's own words name each screen's
   parts (the channels, "Semantic search", "Products and pricing", "ERP",
   "Contract pricing", "Order approvals", "Plans and entitlements" ...).

     experience     the storefront, on its four channels
     ai             a natural-language search, the AI's read of it, matches
     services       checkout, grouped by the four commerce services
     operations     the order on its way, each step from the system behind it
     retail         a product page; the colour changes, the vase with it
     b2b            a bulk order: contract tiers, quantities, an approval
     subscriptions  a plan picked, auto-renew on, what the plan includes
     bookings       a session, a day and a time

   Every screen is laid out all the time, so the one sliding in is complete
   on its first frame. Each one's small moment (a selection moving, a switch
   turning on, a stamp) plays once it has arrived ([data-pos='now']), from a
   believable "before" to the element's own style, which is the finished
   state: reduced motion just shows that.

   Beside the phone, a thermal receipt prints a line for each card read.
   ========================================================================== */

export type PhoneStep = { focus: string; tone: Tone; name: string }

const v = (o: Record<string, string | number>) => o as CSSProperties
const tone = (t: Tone) => v({ '--t': `var(--umm-${t})` })

/* --- glyphs, iOS-weight strokes ------------------------------------------- */

const G: Record<string, ReactNode> = {
  back: <path d="M15 4.5 7.5 12l7.5 7.5" />,
  next: <path d="M9 4.5 16.5 12 9 19.5" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8.5h14l-1.1 11.2a1.6 1.6 0 0 1-1.6 1.4H7.7a1.6 1.6 0 0 1-1.6-1.4z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  ),
  heart: <path d="M12 20s-7.6-4.6-7.6-10.3A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.6 2.5C19.6 15.4 12 20 12 20z" />,
  spark: <path d="M12 2.8l2 6.1 6.2 2.1-6.2 2.1-2 6.1-2-6.1-6.2-2.1 6.2-2.1z" />,
  check: <path d="M5 12.5l4.4 4.4L19 7.4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  home: <path d="M4 11.2 12 4.5l8 6.7V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
}

const Glyph = ({ n, k }: { n: keyof typeof G; k?: string }) => (
  <svg viewBox="0 0 24 24" className="up__g" data-n={n} data-k={k}>
    {G[n]}
  </svg>
)

/* --- products, drawn ---------------------------------------------------------
   A pastel object with a cylindrical body, a highlight, a lid or a rim, and a
   contact shadow; size is its box in px, every part is in em of it. */

type Kind = 'vase' | 'mug' | 'jar' | 'bottle' | 'bowl' | 'pot'

const Thing = ({ kind, t, size, k }: { kind: Kind; t: Tone; size: number; k?: string }) => (
  <span className="up__thing" data-kind={kind} data-k={k} style={v({ '--t': `var(--umm-${t})`, '--z': `${size}px` })}>
    <i className="up__t-floor" />
    <i className="up__t-body" />
    <i className="up__t-top" />
    <i className="up__t-part" />
  </span>
)

/** a studio shot: the object on a sweep tinted by its ground */
const Shot = ({ kind, t, ground, size, k }: { kind: Kind; t: Tone; ground?: Tone; size: number; k?: string }) => (
  <span className="up__shot" style={tone(ground ?? t)} data-k={k}>
    <Thing kind={kind} t={t} size={size} />
  </span>
)

const Stars = () => (
  <span className="up__stars">
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} viewBox="0 0 24 24">
        <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
      </svg>
    ))}
  </span>
)

/** the back control, with where it goes */
const Nav = ({ back, end }: { back: string; end?: ReactNode }) => (
  <div className="up__nav">
    <span className="up__back">
      <Glyph n="back" />
      {back}
    </span>
    {end}
  </div>
)

/* --- 01 · the storefront ------------------------------------------------------ */

const STORE: { kind: Kind; t: Tone; ground: Tone; name: string; price: string }[] = [
  { kind: 'vase', t: 'sky', ground: 'sky', name: 'Dune vase', price: '$64' },
  { kind: 'mug', t: 'sun', ground: 'sun', name: 'Tide mug', price: '$24' },
  { kind: 'bottle', t: 'coral', ground: 'coral', name: 'Glow serum', price: '$38' },
  { kind: 'jar', t: 'citrus', ground: 'citrus', name: 'Fig candle', price: '$32' },
]

function Store({ channels }: { channels: string[] }) {
  return (
    <>
      <div className="up__appbar">
        <span className="up__mark" />
        <b>Discover</b>
        <span className="up__round">
          <Glyph n="search" />
        </span>
        <span className="up__round">
          <Glyph n="bag" />
          <em className="up__badge">
            <span>1</span>
            <span>2</span>
          </em>
        </span>
      </div>
      <div className="up__channels">
        {channels.map((c, i) => (
          <span key={c} data-k={i === 0 ? 'was' : i === 1 ? 'on' : undefined}>
            {c}
          </span>
        ))}
      </div>
      <div className="up__banner" style={tone('blossom')}>
        <span className="up__banner-copy">
          <small>New season</small>
          <b>Ceramics for slow mornings</b>
          <em>Shop now</em>
        </span>
        <span className="up__banner-art">
          <Thing kind="vase" t="sky" size={92} />
          <Thing kind="bowl" t="sun" size={62} />
        </span>
      </div>
      <div className="up__sec">
        <b>Picked for you</b>
        <span>See all</span>
      </div>
      <div className="up__grid">
        {STORE.map((p, i) => (
          <div key={p.name} className="up__tile">
            <Shot kind={p.kind} t={p.t} ground={p.ground} size={74} />
            {i === 1 && (
              <span className="up__add">
                <Glyph n="plus" />
                <Glyph n="check" />
              </span>
            )}
            <b>{p.name}</b>
            <span>{p.price}</span>
          </div>
        ))}
      </div>
      <div className="up__tabs">
        {(['home', 'search', 'heart', 'user'] as const).map((n, i) => (
          <span key={n} data-on={i === 0 || undefined}>
            <Glyph n={n} />
          </span>
        ))}
      </div>
    </>
  )
}

/* --- 02 · AI search ------------------------------------------------------------ */

function Search({ items }: { items: string[] }) {
  const [semantic, recs, enrich, segments] = items
  return (
    <>
      <div className="up__searchbar">
        <span className="up__back">
          <Glyph n="back" />
        </span>
        <span className="up__field">
          <Glyph n="spark" />
          <span>a gift for a tea lover under $40</span>
        </span>
      </div>
      <div className="up__ai">
        <span className="up__ai-tag">
          <Glyph n="spark" />
          {semantic}
        </span>
        <p>Mugs, teapots and loose-leaf sets under $40, ready to gift.</p>
        <span className="up__filters">
          <i data-on>Under $40</i>
          <i>Gift wrap</i>
          <i>Ceramic</i>
        </span>
      </div>
      <div className="up__sec">
        <b>{recs}</b>
        <span>For you</span>
      </div>
      <div className="up__results">
        <div className="up__result" data-top>
          <Shot kind="mug" t="sky" size={70} />
          <em className="up__match">98% match</em>
          <b>Tide mug</b>
          <span>$24.00</span>
        </div>
        <div className="up__result">
          <Shot kind="jar" t="sun" size={70} />
          <em className="up__match">91% match</em>
          <b>Chamomile tin</b>
          <span>$18.00</span>
        </div>
      </div>
      <div className="up__group">
        <div className="up__row">
          <span className="up__row-k">{enrich}</span>
          <span className="up__row-v">Stoneware · 350 ml</span>
        </div>
        <div className="up__row">
          <span className="up__row-k">{segments}</span>
          <span className="up__row-v">Tea lovers</span>
        </div>
      </div>
    </>
  )
}

/* --- 03 · checkout, grouped by the commerce services -------------------------- */

function Checkout({ groups }: { groups: string[] }) {
  const [pricing, access, transactions, lifecycle] = groups
  return (
    <>
      <Nav back="Bag" />
      <b className="up__h">Checkout</b>
      <span className="up__glabel">{pricing}</span>
      <div className="up__group">
        <div className="up__item">
          <Shot kind="vase" t="sky" size={38} />
          <span className="up__item-name">
            <b>Dune vase</b>
            <small>Sky · Qty 1</small>
          </span>
          <b>$64.00</b>
        </div>
        <div className="up__item">
          <Shot kind="mug" t="sun" size={38} />
          <span className="up__item-name">
            <b>Tide mug</b>
            <small>Sun · Qty 2</small>
          </span>
          <b>$48.00</b>
        </div>
        <div className="up__row up__row--sm">
          <span className="up__row-k">Member price</span>
          <em className="up__pill">−$8.00</em>
        </div>
      </div>
      <span className="up__glabel">{access}</span>
      <div className="up__group">
        <div className="up__row">
          <span className="up__avatar" style={tone('blossom')}>
            SP
          </span>
          <span className="up__row-k">Sam Patel</span>
          <em className="up__pill" data-k="quiet">
            Signed in
          </em>
        </div>
      </div>
      <span className="up__glabel">{transactions}</span>
      <div className="up__group">
        <div className="up__row">
          <span className="up__cardmark" />
          <span className="up__row-k">Card •••• 4242</span>
          <Glyph n="next" k="chev" />
        </div>
      </div>
      <span className="up__glabel">{lifecycle}</span>
      <div className="up__group">
        <div className="up__row">
          <span className="up__row-k">Delivery</span>
          <span className="up__row-v">Thu 22 Oct</span>
          <Glyph n="next" k="chev" />
        </div>
      </div>
      <div className="up__dock">
        <span className="up__cta up__pay">
          <span>Pay $104.00</span>
          <span>
            <Glyph n="check" />
            Paid
          </span>
        </span>
      </div>
    </>
  )
}

/* --- 04 · the order on its way ------------------------------------------------ */

function Track({ systems }: { systems: string[] }) {
  const [erp, warehouse, info, crm, analytics] = systems
  const steps: [string, string | null, string][] = [
    ['Order confirmed', erp, 'done'],
    ['Packed and shipped', warehouse, 'done'],
    ['Out for delivery', crm, 'now'],
    ['Delivered', null, 'next'],
  ]
  return (
    <>
      <Nav back="Orders" end={<span className="up__nav-r">#4821</span>} />
      <b className="up__h">Arriving today</b>
      <span className="up__sub">Between 2 and 4 pm</span>
      <div className="up__map">
        <svg viewBox="0 0 248 116" preserveAspectRatio="xMidYMid slice">
          <rect className="up__map-ground" width="248" height="116" />
          <path className="up__map-water" d="M176 0h72v116h-38c-6-22 2-40-14-58S176 22 176 0z" />
          <rect className="up__map-park" x="14" y="66" width="62" height="40" rx="8" />
          <g className="up__map-blocks">
            <rect x="14" y="10" width="62" height="42" rx="5" />
            <rect x="90" y="10" width="58" height="42" rx="5" />
            <rect x="90" y="66" width="58" height="40" rx="5" />
          </g>
          <path className="up__map-road" d="M0 59h190M83 0v116M156 0v116" />
          <path className="up__map-ahead" d="M156 40V32h24" />
          <path className="up__map-route" d="M40 59H156V40" pathLength="100" />
          <circle className="up__map-from" cx="40" cy="59" r="4.5" />
          <g className="up__map-pin" transform="translate(186 34)">
            <path d="M0 0c-7-8-10-12-10-17a10 10 0 0 1 20 0c0 5-3 9-10 17z" />
            <circle cx="0" cy="-17" r="3.6" />
          </g>
          <g className="up__map-van">
            <circle r="11" className="up__map-halo" />
            <circle r="7.5" />
            <path d="M-3.2 -2.6h4.2v4.6h-4.2zM1 -0.8h1.8l1.4 1.4v1.4H1z" />
          </g>
        </svg>
      </div>
      <ol className="up__timeline">
        {steps.map(([label, from, k]) => (
          <li key={label} data-k={k}>
            <i>
              <Glyph n="check" />
            </i>
            <b>{label}</b>
            {from && <small>{from}</small>}
          </li>
        ))}
      </ol>
      <div className="up__group">
        <div className="up__row">
          <span className="up__row-k">{info}</span>
          <span className="up__row-v">Care guide</span>
          <Glyph n="next" k="chev" />
        </div>
        <div className="up__row">
          <span className="up__row-k">{analytics}</span>
          <Stars />
        </div>
      </div>
    </>
  )
}

/* --- 05 · a product page ---------------------------------------------------------- */

function Product() {
  return (
    <>
      <div className="up__gallery" style={tone('blossom')}>
        <span className="up__glass" data-at="l">
          <Glyph n="back" />
        </span>
        <span className="up__glass up__fav" data-at="r">
          <Glyph n="heart" />
        </span>
        <span className="up__hero">
          <Thing kind="vase" t="sky" size={176} k="was" />
          <Thing kind="vase" t="blossom" size={176} k="now" />
        </span>
        <span className="up__dots">
          <i data-on />
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="up__pdp">
        <div className="up__pdp-head">
          <b>Dune vase</b>
          <b>$64.00</b>
        </div>
        <span className="up__rating">
          <Stars />
          4.8 · 212 reviews
        </span>
        <div className="up__opt">
          <span className="up__opt-name">
            Colour
            <b>
              <span>Sky</span>
              <span>Blush</span>
            </b>
          </span>
          <span className="up__swatches">
            {(['sky', 'blossom', 'sun', 'citrus'] as Tone[]).map((t, i) => (
              <i key={t} style={tone(t)} data-k={i === 0 ? 'was' : i === 1 ? 'on' : undefined} />
            ))}
          </span>
        </div>
        <span className="up__stock">
          <i />
          In stock · ships tomorrow
        </span>
        <p className="up__blurb">Handmade stoneware, 24 cm. Holds dried or fresh stems.</p>
      </div>
      <div className="up__dock" data-k="row">
        <span className="up__round" data-k="line">
          <Glyph n="heart" />
        </span>
        <span className="up__cta">Add to bag · $64.00</span>
      </div>
    </>
  )
}

/* --- 06 · a bulk order ---------------------------------------------------------- */

function Quote({ pricing, approvals }: { pricing: string; approvals: string }) {
  const lines: { kind: Kind; t: Tone; name: string; sku: string; qty: string; was?: string }[] = [
    { kind: 'mug', t: 'sky', name: 'Tide mug', sku: 'TM-350 · $10.90', qty: '120', was: '48' },
    { kind: 'jar', t: 'sun', name: 'Chamomile tin', sku: 'CT-080 · $6.20', qty: '80' },
    { kind: 'bowl', t: 'citrus', name: 'Shore bowl', sku: 'SB-160 · $14.50', qty: '60' },
  ]
  return (
    <>
      <Nav
        back="Quotes"
        end={
          <span className="up__acct">
            <i style={tone('sky')}>S</i>
            Studio 14
          </span>
        }
      />
      <b className="up__h">Bulk order</b>
      <span className="up__glabel">{pricing}</span>
      <div className="up__tiers">
        <span data-k="was">
          <small>1–49</small>
          <b>$12.40</b>
        </span>
        <span data-k="on">
          <small>50–199</small>
          <b>$10.90</b>
        </span>
        <span>
          <small>200+</small>
          <b>$9.60</b>
        </span>
      </div>
      <div className="up__group">
        {lines.map((l) => (
          <div key={l.name} className="up__item" data-k="qty">
            <Shot kind={l.kind} t={l.t} size={36} />
            <span className="up__item-name">
              <b>{l.name}</b>
              <small>{l.sku}</small>
            </span>
            <span className="up__stepper">
              <Glyph n="minus" />
              <b>
                {l.was ? (
                  <>
                    <span>{l.was}</span>
                    <span>{l.qty}</span>
                  </>
                ) : (
                  l.qty
                )}
              </b>
              <Glyph n="plus" />
            </span>
          </div>
        ))}
      </div>
      <div className="up__group">
        <div className="up__row up__row--tall">
          <span className="up__item-name">
            <b>{approvals}</b>
            <small className="up__who">
              <i className="up__avatar" style={tone('sun')}>
                JR
              </i>
              Jo Rivera · Finance
            </small>
          </span>
          <em className="up__stamp">
            <span>Pending</span>
            <span>
              <Glyph n="check" />
              Approved
            </span>
          </em>
        </div>
      </div>
      <div className="up__dock">
        <span className="up__cta">Place order · $2,674.00</span>
      </div>
    </>
  )
}

/* --- 07 · a plan --------------------------------------------------------------------- */

function Plans({ entitlements }: { entitlements: string }) {
  const plans: [string, string, string, string?][] = [
    ['Monthly', 'Every 4 weeks', '$18', 'was'],
    ['Every 2 months', 'Most chosen', '$16', 'on'],
    ['Quarterly', 'Every 12 weeks', '$15'],
  ]
  return (
    <>
      <Nav back="Account" />
      <b className="up__h">Your plan</b>
      <div className="up__plans">
        {plans.map(([name, note, price, k]) => (
          <div key={name} className="up__plan" data-k={k}>
            <i className="up__radio" />
            <span className="up__item-name">
              <b>{name}</b>
              <small>{note}</small>
            </span>
            <b>
              {price}
              <small> / delivery</small>
            </b>
          </div>
        ))}
      </div>
      <span className="up__glabel">{entitlements}</span>
      <div className="up__group">
        {['Free delivery', 'Member prices', 'Pause or skip any time'].map((x) => (
          <div key={x} className="up__row up__row--sm">
            <i className="up__ok">
              <Glyph n="check" />
            </i>
            <span className="up__row-k">{x}</span>
          </div>
        ))}
      </div>
      <div className="up__group">
        <div className="up__row up__row--tall">
          <span className="up__item-name">
            <b>Auto-renew</b>
            <small>Next on 14 Dec</small>
          </span>
          <i className="up__switch" />
        </div>
      </div>
      <div className="up__dock">
        <span className="up__cta">Save plan</span>
      </div>
    </>
  )
}

/* --- 08 · a booking ---------------------------------------------------------------- */

/* October 2026: the 1st is a Thursday; today is the 16th; the 20th and 27th
   are full; the 23rd is picked */
const DAYS = Array.from({ length: 35 }, (_, i) => {
  const d = i - 2
  if (d < 1 || d > 31) return { d: 0, k: 'blank' }
  if (d < 16) return { d, k: 'past' }
  if (d === 16) return { d, k: 'today' }
  if (d === 20 || d === 27) return { d, k: 'full' }
  if (d === 23) return { d, k: 'pick' }
  return { d, k: d === 21 ? 'was' : 'open' }
})

function Booking() {
  return (
    <>
      <Nav back="Services" />
      <b className="up__h">Book a session</b>
      <div className="up__group">
        <div className="up__item">
          <Shot kind="pot" t="coral" ground="citrus" size={40} />
          <span className="up__item-name">
            <b>Pottery workshop</b>
            <small>2 hours · $45</small>
          </span>
          <Glyph n="next" k="chev" />
        </div>
      </div>
      <div className="up__cal">
        <div className="up__cal-head">
          <b>October 2026</b>
          <span>
            <Glyph n="back" />
            <Glyph n="next" />
          </span>
        </div>
        <div className="up__cal-grid">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <small key={i}>{d}</small>
          ))}
          {DAYS.map(({ d, k }, i) => (
            <span key={i} data-k={k}>
              {d || ''}
            </span>
          ))}
        </div>
      </div>
      <div className="up__slots">
        <span>10:00</span>
        <span data-k="was">12:30</span>
        <span data-k="on">15:00</span>
        <span data-k="off">17:30</span>
      </div>
      <div className="up__dock">
        <span className="up__cta">Confirm · Fri 23 Oct, 15:00</span>
      </div>
    </>
  )
}

/* --- the phone ------------------------------------------------------------------------ */

export type PhoneWords = {
  channels: string[]
  ai: string[]
  services: string[]
  operations: string[]
  pricing: string
  approvals: string
  entitlements: string
}

export function ShopPhone({ steps, at, words }: { steps: PhoneStep[]; at: number; words: PhoneWords }) {
  const screens: Record<string, ReactNode> = {
    experience: <Store channels={words.channels} />,
    ai: <Search items={words.ai} />,
    services: <Checkout groups={words.services} />,
    operations: <Track systems={words.operations} />,
    retail: <Product />,
    b2b: <Quote pricing={words.pricing} approvals={words.approvals} />,
    subscriptions: <Plans entitlements={words.entitlements} />,
    bookings: <Booking />,
  }
  /* which way the screens slide: on, or back when the reader scrolls up */
  const was = useRef(at)
  const dir = at >= was.current ? 'on' : 'back'
  useEffect(() => {
    was.current = at
  }, [at])
  return (
    <div className="up__phone" aria-hidden="true" data-dir={dir}>
      <span className="up__key" data-k="action" />
      <span className="up__key" data-k="up" />
      <span className="up__key" data-k="down" />
      <span className="up__key" data-k="power" />
      <div className="up__screen">
        {steps.map((s, i) => (
          <div
            key={s.focus}
            className="up__app"
            data-screen={s.focus}
            data-pos={i < at ? 'past' : i > at ? 'next' : 'now'}
          >
            {screens[s.focus]}
          </div>
        ))}
        <div className="up__status">
          <span>9:41</span>
          <span className="up__sys">
            <svg viewBox="0 0 18 12">
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
              <rect x="10" y="3" width="3" height="9" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            <svg viewBox="0 0 16 12">
              <path d="M8 11.2 5.6 8.7a3.4 3.4 0 0 1 4.8 0L8 11.2Z" />
              <path d="M3.4 6.5a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.6 4.6 0 0 0-6.6 0L3.4 6.5Z" />
              <path d="M1.2 4.3a9.6 9.6 0 0 1 13.6 0l-1.3 1.3a7.7 7.7 0 0 0-11 0L1.2 4.3Z" />
            </svg>
            <span className="up__batt">
              <i />
            </span>
          </span>
        </div>
        <span className="up__island" />
        <span className="up__homebar" />
      </div>
    </div>
  )
}

/* --- the receipt ---------------------------------------------------------------------- */

export function Receipt({
  steps,
  at,
  label,
  footer,
}: {
  steps: PhoneStep[]
  at: number
  label: string
  footer: string
}) {
  const n = (i: number) => String(i + 1).padStart(2, '0')
  return (
    <div className="up__receipt" aria-hidden="true">
      <div className="up__slip">
        <div className="up__slip-head">
          <i className="up__slip-mark" />
          <b>{label}</b>
          <span>16 Oct 2026 · 9:41</span>
          <span>Order #4821</span>
        </div>
        <ol className="up__slip-lines">
          {steps.slice(0, at + 1).map((s, i) => (
            <li key={s.focus} style={tone(s.tone)} data-last={i === at || undefined}>
              <span>
                <b>{s.name}</b>
                <small>{n(i)}</small>
                <i>
                  <Glyph n="check" />
                </i>
              </span>
            </li>
          ))}
        </ol>
        <div className="up__slip-foot">
          <span className="up__slip-total">
            <b>{n(at)}</b> / {n(steps.length - 1)}
          </span>
          <i className="up__barcode" />
          <span>{footer}</span>
        </div>
      </div>
    </div>
  )
}
