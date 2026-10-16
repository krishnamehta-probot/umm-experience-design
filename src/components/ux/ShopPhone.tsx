import type { CSSProperties, ReactNode } from 'react'
import type { Tone } from '@/components/primitives'

/* ============================================================================
   UX & DIGITAL COMMERCE · THE SHOPPER'S PHONE (CommerceArchitecture's picture)

   16 Oct, Krish: make the thinking section something directly relatable to
   the service, and unlike the other pages' boards. The picture is a phone,
   held beside the cards, its shop changing with the card being read. Every
   screen is drawn from shapes (blocks, bars, pills, buttons): no words but
   the ones the cards already carry, and none at all inside the phone.

     experience     the storefront: a banner, categories, a product grid
     ai             AI search: typing, the assistant thinking, suggestions,
                    personalized picks lit
     services       cart and checkout: items, price lines, pay pressed
     operations     order tracking: a parcel on its route, steps advancing
     retail         a product page, its heart popping
     b2b            a bulk quote: price tiers, quantity steppers
     subscriptions  a plan picked, auto-renew switched on, the monthly cycle
     bookings       a calendar, a day and a slot picked

   Under it, beside it on the board, a receipt prints a line for each card
   read so far, the card's own name.

   Each screen's small motion starts when it slides in (ux-phone.css), and
   its resting state is the finished one, for reduced motion.
   ========================================================================== */

export type PhoneStep = { focus: string; tone: Tone; name: string }

const v = (o: Record<string, string | number>) => o as CSSProperties

/* --- the pieces a shop is drawn from -------------------------------------- */

const P: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1.2 12H6.2z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  next: <path d="M9 5l7 7-7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  spark: <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />,
  star: <path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />,
  truck: (
    <>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  cal: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 4v4M15 4v4" />
    </>
  ),
}

const I = ({ n, k }: { n: keyof typeof P; k?: string }) => (
  <svg viewBox="0 0 24 24" className="up__i" data-k={k}>
    {P[n]}
  </svg>
)

/** a line of text, drawn as a bar: w is its width in %, k its ink */
const B = ({ w, k }: { w: number; k?: 'ink' | 'paper' | 'bold' }) => (
  <i className="up__bar" data-k={k} style={v({ '--w': `${w}%` })} />
)

/** a product photo: a pastel ground with an object on it */
const Img = ({ tone, s, size }: { tone: Tone; s: number; size?: 'sm' }) => (
  <span className="up__img" data-umm-tone={tone} data-size={size}>
    <i className="up__obj" data-s={s} />
  </span>
)

/** the app bar: the shop's mark or a back button, the bag or a profile */
const Top = ({
  back,
  end = 'bag',
  children,
}: {
  back?: boolean
  end?: 'bag' | 'user' | 'none'
  children?: ReactNode
}) => (
  <div className="up__top">
    {back ? (
      <span className="up__btn">
        <I n="back" />
      </span>
    ) : (
      <i className="up__logo" />
    )}
    <span className="up__top-mid">{children}</span>
    {end === 'bag' && (
      <span className="up__btn up__bag">
        <I n="bag" />
        <i className="up__badge" />
      </span>
    )}
    {end === 'user' && (
      <span className="up__btn up__avatar">
        <I n="user" />
      </span>
    )}
  </div>
)

/** a quantity stepper: minus, the count as a bar, plus */
const Qty = ({ live }: { live?: boolean }) => (
  <span className="up__qty" data-live={live || undefined}>
    <I n="minus" />
    <i className="up__qty-n" />
    <span className="up__qty-plus">
      <I n="plus" />
    </span>
  </span>
)

/** a line in a cart or a quote: photo, name, detail, stepper */
const Line = ({ tone, s, i, live }: { tone: Tone; s: number; i: number; live?: boolean }) => (
  <li className="up__line" style={v({ '--i': i })}>
    <Img tone={tone} s={s} size="sm" />
    <span className="up__col">
      <B w={84} k="ink" />
      <B w={52} />
      <B w={30} k="bold" />
    </span>
    <Qty live={live} />
  </li>
)

/** price lines and their total */
const Sum = () => (
  <div className="up__sum">
    <span>
      <B w={34} />
      <B w={14} />
    </span>
    <span>
      <B w={26} />
      <B w={11} />
    </span>
    <span className="up__total">
      <B w={24} k="bold" />
      <B w={18} k="bold" />
    </span>
  </div>
)

/** a row in a list: an icon or a face, two lines, a chevron */
const Row = ({ icon, face, w = [64, 42] }: { icon?: keyof typeof P; face?: Tone; w?: number[] }) => (
  <div className="up__row">
    {face ? (
      <span className="up__btn up__face" data-umm-tone={face}>
        <I n="user" />
      </span>
    ) : (
      icon && (
        <span className="up__btn">
          <I n={icon} />
        </span>
      )
    )}
    <span className="up__col">
      <B w={w[0]} k="ink" />
      <B w={w[1]} />
    </span>
    <I n="next" />
  </div>
)

/** delivery or plan options, one picked */
const Options = ({ n, pick }: { n: number; pick: number }) => (
  <div className="up__plans">
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="up__plan" data-pick={i === pick || undefined}>
        <i className="up__radio" />
        <span className="up__col">
          <B w={[58, 46, 64][i % 3]} k="ink" />
          <B w={[84, 70, 76][i % 3]} />
        </span>
        <B w={[22, 18, 24][i % 3]} k="bold" />
      </div>
    ))}
  </div>
)

/* --- the eight screens --------------------------------------------------------- */

const STORE: [Tone, number][] = [
  ['sky', 0],
  ['sun', 1],
  ['citrus', 2],
  ['coral', 3],
]

const Store = () => (
  <>
    <Top>
      <span className="up__btn">
        <I n="search" />
      </span>
    </Top>
    <div className="up__banner" data-umm-tone="blossom">
      <span className="up__col">
        <B w={78} k="ink" />
        <B w={52} k="ink" />
        <i className="up__pill" />
      </span>
      <i className="up__sun" />
    </div>
    <div className="up__cats">
      {[0, 1, 2, 3].map((i) => (
        <i key={i} className="up__cat" data-on={i === 0 || undefined} />
      ))}
    </div>
    <div className="up__grid">
      {STORE.map(([tone, s], i) => (
        <div key={i} className="up__tile" style={v({ '--i': i })}>
          <Img tone={tone} s={s} />
          {i === 1 && (
            <span className="up__add">
              <I n="plus" k="plus" />
              <I n="check" k="check" />
            </span>
          )}
          <B w={82} />
          <B w={36} k="ink" />
        </div>
      ))}
    </div>
  </>
)

const Search = () => (
  <>
    <div className="up__search">
      <span className="up__btn">
        <I n="back" />
      </span>
      <span className="up__field">
        <I n="spark" k="spark" />
        <i className="up__typed" />
        <i className="up__caret" />
      </span>
    </div>
    <div className="up__answer">
      <span className="up__think">
        <i />
        <i />
        <i />
      </span>
      <ul className="up__sugs">
        {[64, 46, 72, 54].map((w, i) => (
          <li key={i} style={v({ '--i': i })}>
            <I n="search" />
            <B w={w} />
          </li>
        ))}
      </ul>
    </div>
    <div className="up__picks-head">
      <I n="spark" k="spark" />
      <B w={40} k="ink" />
    </div>
    <div className="up__grid up__grid--picks">
      {(
        [
          ['lilac', 3, true],
          ['sky', 1, false],
          ['sun', 0, false],
          ['blossom', 2, true],
        ] as [Tone, number, boolean][]
      ).map(([tone, s, hit], i) => (
        <div key={i} className="up__tile" data-hit={hit || undefined} style={v({ '--i': i })}>
          <Img tone={tone} s={s} />
          {hit && (
            <span className="up__glint">
              <I n="spark" />
            </span>
          )}
          <B w={78} />
          <B w={34} k="ink" />
        </div>
      ))}
    </div>
  </>
)

const Checkout = () => (
  <>
    <Top back end="none">
      <B w={44} k="ink" />
    </Top>
    <ul className="up__lines">
      <Line tone="sky" s={0} i={0} />
      <Line tone="sun" s={1} i={1} />
      <Line tone="coral" s={3} i={2} />
      <Line tone="citrus" s={2} i={3} />
    </ul>
    <Options n={2} pick={0} />
    <Sum />
    <div className="up__method">
      <i className="up__card" />
      <span className="up__col">
        <B w={60} k="ink" />
        <B w={38} />
      </span>
      <I n="next" />
    </div>
    <span className="up__pay">
      <span className="up__pay-label">
        <I n="lock" />
        <B w={34} k="paper" />
      </span>
      <span className="up__pay-done">
        <I n="check" />
      </span>
      <i className="up__tap" />
    </span>
  </>
)

const Track = () => (
  <>
    <Top back end="none">
      <B w={48} k="ink" />
    </Top>
    <div className="up__map">
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
        <g className="up__blocks">
          <rect x="6" y="6" width="58" height="34" rx="6" />
          <rect x="80" y="6" width="54" height="34" rx="6" />
          <rect x="150" y="56" width="44" height="48" rx="6" />
          <rect x="6" y="56" width="58" height="48" rx="6" />
          <rect x="80" y="56" width="54" height="48" rx="6" />
        </g>
        <path className="up__road" d="M0 48h200M0 116h200M72 0v140M142 0v140" />
        <path className="up__route" d="M28 116H72V48H142V26" />
        <circle className="up__from" cx="28" cy="116" r="5" />
        <g className="up__pin" transform="translate(142 26)">
          <path d="M0 0c-6-7-9-11-9-15a9 9 0 0 1 18 0c0 4-3 8-9 15z" />
          <circle cx="0" cy="-15" r="3.2" />
        </g>
        <g className="up__parcel">
          <rect x="-8" y="-8" width="16" height="16" rx="3.5" />
          <path d="M-8 -2h16M0 -8v6" />
        </g>
      </svg>
    </div>
    <div className="up__eta">
      <span className="up__eta-icon">
        <I n="truck" />
      </span>
      <span className="up__col">
        <B w={70} k="ink" />
        <B w={46} />
      </span>
    </div>
    <ol className="up__track">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} data-k={i < 2 ? 'done' : i === 2 ? 'now' : undefined} style={v({ '--i': i })}>
          <i className="up__dot">
            <I n="check" />
          </i>
          <span className="up__col">
            <B w={[58, 70, 50, 62][i]} k="ink" />
            <B w={[34, 28, 40, 30][i]} />
          </span>
        </li>
      ))}
    </ol>
    <Row face="sun" w={[56, 38]} />
    <span className="up__cta" data-k="line">
      <B w={34} k="ink" />
    </span>
  </>
)

const Product = () => (
  <>
    <div className="up__gallery" data-umm-tone="coral">
      <span className="up__btn">
        <I n="back" />
      </span>
      <span className="up__heart">
        <I n="heart" />
        <span className="up__burst">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <i key={i} style={v({ '--a': `${i * 60}deg` })} />
          ))}
        </span>
      </span>
      <i className="up__vase" />
      <span className="up__dots">
        <i data-on />
        <i />
        <i />
      </span>
    </div>
    <span className="up__col">
      <B w={74} k="ink" />
      <B w={48} />
    </span>
    <div className="up__rate">
      <span className="up__stars">
        {[0, 1, 2, 3, 4].map((i) => (
          <I key={i} n="star" />
        ))}
      </span>
      <B w={22} k="bold" />
    </div>
    <div className="up__swatches">
      {(['coral', 'sky', 'citrus', 'lilac'] as Tone[]).map((t, i) => (
        <i key={t} data-umm-tone={t} data-on={i === 0 || undefined} />
      ))}
    </div>
    <div className="up__sizes">
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} data-on={i === 2 || undefined} />
      ))}
    </div>
    <ul className="up__info">
      {(['truck', 'check'] as const).map((n, i) => (
        <li key={n}>
          <I n={n} />
          <span className="up__col">
            <B w={[66, 54][i]} k="ink" />
            <B w={[44, 62][i]} />
          </span>
          <I n="next" />
        </li>
      ))}
    </ul>
    <Row face="blossom" w={[48, 80]} />
    <span className="up__cta">
      <I n="bag" />
      <B w={30} k="paper" />
    </span>
  </>
)

const Quote = () => (
  <>
    <Top back end="user">
      <B w={42} k="ink" />
    </Top>
    <div className="up__tiers">
      <i className="up__tier-mark" />
      {[0, 1, 2].map((i) => (
        <span key={i} className="up__tier">
          <B w={56} />
          <B w={38} k="ink" />
        </span>
      ))}
    </div>
    <ul className="up__lines">
      <Line tone="sky" s={2} i={0} live />
      <Line tone="lilac" s={1} i={1} />
      <Line tone="citrus" s={0} i={2} />
      <Line tone="sun" s={3} i={3} />
    </ul>
    <Sum />
    <div className="up__approve">
      <span className="up__btn up__avatar">
        <I n="user" />
      </span>
      <span className="up__col">
        <B w={62} k="ink" />
        <B w={40} />
      </span>
      <span className="up__stamp">
        <I n="check" />
      </span>
    </div>
    <Row icon="cal" w={[54, 36]} />
    <span className="up__cta" data-k="line">
      <B w={36} k="ink" />
    </span>
  </>
)

const Plans = () => (
  <>
    <Top back end="none">
      <B w={44} k="ink" />
    </Top>
    <Options n={3} pick={1} />
    <div className="up__toggle-row">
      <span className="up__col">
        <B w={56} k="ink" />
        <B w={80} />
      </span>
      <i className="up__switch">
        <i />
      </i>
    </div>
    <div className="up__cycle">
      <svg viewBox="0 0 80 80" className="up__ring">
        <circle className="up__ring-track" cx="40" cy="40" r="30" />
        <circle className="up__ring-arc" cx="40" cy="40" r="30" pathLength="100" />
        <g className="up__ring-orbit">
          <circle cx="40" cy="10" r="5" />
        </g>
      </svg>
      <span className="up__ring-mid">
        <I n="cal" />
      </span>
      <span className="up__col">
        <B w={72} k="ink" />
        <B w={50} />
        <span className="up__months">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <i key={i} style={v({ '--i': i })} />
          ))}
        </span>
      </span>
    </div>
    <div className="up__method">
      <i className="up__card" />
      <span className="up__col">
        <B w={60} k="ink" />
        <B w={38} />
      </span>
      <I n="next" />
    </div>
    <Row icon="user" w={[50, 66]} />
    <span className="up__cta">
      <B w={34} k="paper" />
    </span>
  </>
)

/* the month: days before the 1st left blank, the past and the full days
   greyed, one day picked */
const DAYS = Array.from({ length: 35 }, (_, i) => {
  if (i < 2 || i > 31) return 'blank'
  if (i < 9 || [12, 13, 20, 26].includes(i)) return 'off'
  return i === 17 ? 'pick' : 'open'
})

const Calendar = () => (
  <>
    <Top back end="none">
      <B w={40} k="ink" />
    </Top>
    <div className="up__row">
      <Img tone="sun" s={2} size="sm" />
      <span className="up__col">
        <B w={72} k="ink" />
        <B w={46} />
      </span>
      <B w={16} k="bold" />
    </div>
    <div className="up__people">
      {(['coral', 'sky', 'citrus', 'lilac'] as Tone[]).map((t, i) => (
        <span key={t} className="up__btn up__face" data-umm-tone={t} data-on={i === 1 || undefined}>
          <I n="user" />
        </span>
      ))}
      <B w={26} k="ink" />
    </div>
    <div className="up__month">
      <I n="back" />
      <B w={34} k="ink" />
      <I n="next" />
    </div>
    <div className="up__cal">
      {Array.from({ length: 7 }, (_, i) => (
        <i key={`w${i}`} className="up__wd" />
      ))}
      {DAYS.map((k, i) => (
        <i key={i} className="up__day" data-k={k} style={v({ '--r': Math.floor(i / 7) })} />
      ))}
    </div>
    <div className="up__slots">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="up__slot" data-pick={i === 4 || undefined} data-off={i === 2 || undefined}>
          <B w={58} k="ink" />
        </span>
      ))}
    </div>
    <span className="up__cta">
      <I n="check" />
      <B w={30} k="paper" />
    </span>
  </>
)

const SCREENS: Record<string, () => ReactNode> = {
  experience: Store,
  ai: Search,
  services: Checkout,
  operations: Track,
  retail: Product,
  b2b: Quote,
  subscriptions: Plans,
  bookings: Calendar,
}

/* --- the phone ------------------------------------------------------------------ */

export function ShopPhone({ steps, at }: { steps: PhoneStep[]; at: number }) {
  return (
    <div className="up__phone" aria-hidden="true">
      <div className="up__screen">
        <i className="up__notch" />
        <span className="up__status">
          <i className="up__clock" />
          <span className="up__signal">
            <i />
            <i />
            <i />
          </span>
          <i className="up__battery" />
        </span>
        {steps.map((s, i) => {
          const Screen = SCREENS[s.focus]
          return (
            <div
              key={s.focus}
              className="up__app"
              data-screen={s.focus}
              data-pos={i < at ? 'past' : i > at ? 'next' : 'now'}
            >
              {Screen && <Screen />}
            </div>
          )
        })}
        <i className="up__home" />
      </div>
    </div>
  )
}

/* --- the receipt ---------------------------------------------------------------- */

export function Receipt({ steps, at }: { steps: PhoneStep[]; at: number }) {
  return (
    <div className="up__receipt" aria-hidden="true">
      <div className="up__paper">
        <div className="up__r-head">
          <i className="up__r-mark" />
          <i className="up__r-bar" style={v({ '--w': '64%' })} />
          <i className="up__r-bar" style={v({ '--w': '42%' })} />
        </div>
        <ol className="up__r-lines">
          {steps.slice(0, at + 1).map((s) => (
            <li key={s.focus} style={v({ '--tone': `var(--umm-${s.tone})` })}>
              <i className="up__r-dot" />
              <span>{s.name}</span>
              <I n="check" />
            </li>
          ))}
        </ol>
        <div className="up__r-foot">
          <span className="up__r-total">
            <i className="up__r-bar" data-k="ink" style={v({ '--w': '38%' })} />
            <i className="up__r-bar" data-k="ink" style={v({ '--w': '22%' })} />
          </span>
          <i className="up__barcode" />
        </div>
      </div>
    </div>
  )
}
