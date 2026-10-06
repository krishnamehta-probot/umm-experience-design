import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ChipHead, withAccent } from './ChipHead'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { principles } from '@/content/cxUiDesign'

/* ============================================================================
   6a · HOW WE DESIGN — one checkout, fixed rule by rule

   "Rules we never skip", shown rather than listed. A phone holds a typical
   checkout with every rule broken: a washed-out Pay button tucked in the top
   corner, ten steps, a form asking for everything, four button styles that
   have never met. The section pins, and the scroll applies the rules to it
   one at a time, each with a callout naming what changed:

     1 Colour with a reason     Pay goes from 1.4:1 contrast to 19:1
     2 Made for thumbs          Pay moves down into the thumb's reach
     3 Fewer steps, every time  ten steps fold into three; the form shrinks
     4 Same look, everywhere    four button styles settle into one
     5 Tested before it's built taps land on Pay, and the stamp goes on

   The rules list on the left is the readout: each one ticks as it lands, and
   clicking one scrolls to it. Every change is a number (--k1 … --k5, 0 to 1)
   that CSS turns into colour, position and size, so scrolling up undoes it.

   Unpinned (phones) and reduced motion the list becomes the control: tap a
   rule to apply everything up to it. On phones it plays through once on its
   own when it comes into view; reduced motion starts on the finished screen.
   ========================================================================== */

const items = principles.items
const N = items.length
/* Scroll held on the broken screen before the first rule, and on the fixed
   one after the last. */
const HEAD = 0.1
const TAIL = 0.08
const LANE = (1 - HEAD - TAIL) / N
/* Share of its lane a rule spends landing; the rest it holds. */
const LAND = 0.6

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => {
  const c = clamp(t)
  return c * c * (3 - 2 * c)
}

/* The phone and its callouts are drawn at a fixed size and scaled to fit. */
const PHONE_W = 320
const PHONE_H = 660
const RIG_W = 600

export function Principles() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const wide = usePinned()
  const reduced = useReducedMotion()
  const pinMode = wide && !reduced
  const mode = pinMode ? 'scroll' : reduced ? 'still' : 'tap'

  /* Tap mode: how many rules are applied. */
  const [picked, setPicked] = useState(0)
  const touched = useRef(false)
  useEffect(() => {
    if (reduced) setPicked(N)
  }, [reduced])

  const lane = (progress - HEAD) / LANE
  const k = items.map((_, i) => (pinMode ? smooth((lane - i) / LAND) : i < picked ? 1 : 0))
  const active = pinMode ? (lane < 0 ? -1 : Math.min(N - 1, Math.floor(lane))) : picked - 1
  const applied = k.filter((v) => v > 0.5).length

  /* Phones: play it through once, the first time it is seen. */
  const rigSlot = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (mode !== 'tap') return
    const el = rigSlot.current
    if (!el) return
    let timer = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || touched.current || timer) return
        timer = window.setInterval(() => {
          setPicked((p) => {
            if (touched.current || p >= N) {
              window.clearInterval(timer)
              return p
            }
            return p + 1
          })
        }, 1500)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearInterval(timer)
    }
  }, [mode])

  /* Scale the drawing to its slot. */
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = rigSlot.current
    if (!el) return
    const fit = () => {
      const w = wide ? RIG_W : PHONE_W + 24
      /* room above for the status, and on phones below for the caption */
      const s = Math.min(el.clientWidth / w, el.clientHeight / (PHONE_H + (wide ? 70 : 140)), 1.15)
      setScale(Math.max(0.3, s))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [wide])

  const choose = (i: number) => {
    if (!pinMode) {
      touched.current = true
      // Tapping the last applied rule again takes it back off.
      setPicked((p) => (p === i + 1 ? i : i + 1))
      return
    }
    const el = ref.current
    if (!el) return
    const travel = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: el.offsetTop + travel * (HEAD + (i + LAND + 0.05) * LANE), behavior: 'smooth' })
  }

  const vars = Object.fromEntries(k.map((v, i) => [`--k${i + 1}`, v.toFixed(4)])) as CSSProperties
  const tone = active >= 0 ? items[active].tone : 'coral'
  const status =
    applied === 0 ? 'Before: every rule broken' : applied === N ? 'After: all five rules' : `${applied} of ${N} rules applied`

  return (
    <section
      className="umm-section umm-pin cx-fix"
      id="design"
      ref={ref}
      data-mode={mode}
      style={{ ...vars, ['--umm-pin-steps' as string]: N }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container cx-fix__inner">
          <div className="cx-fix__copy">
            <div className="cx-head cx-head--tight">
              <ChipHead
                line1={principles.line1}
                line2={withAccent(principles.line2, principles.accent)}
                chip={principles.chip}
                tone="coral"
                chipAt="66%"
                tilt={-10}
                lineRecipe={2}
                chipRecipe={0}
              />
              <p className="cx-lead">{principles.lead}</p>
            </div>
            <p className="cx-fix__hint">{pinMode ? principles.hint.scroll : principles.hint.tap}</p>

            <ol className="cx-fix__rules">
              {items.map((rule, i) => (
                <li key={rule.id} data-umm-tone={rule.tone}>
                  <button
                    type="button"
                    className="cx-fix__rule"
                    onClick={() => choose(i)}
                    data-done={k[i] > 0.5}
                    data-open={i === active}
                    aria-current={i === active ? 'step' : undefined}
                  >
                    <span className="cx-fix__tick" aria-hidden="true">
                      <svg viewBox="0 0 20 20">
                        <path d="M5 10.5 8.5 14 15 6.5" />
                      </svg>
                    </span>
                    <span className="cx-fix__n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="cx-fix__title">{rule.title}</span>
                    <span className="umm-sr-only">{k[i] > 0.5 ? ' (applied)' : ''}</span>
                  </button>
                  <div className="cx-fix__body">
                    <p>{rule.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="cx-fix__slot" ref={rigSlot} data-umm-tone={tone} style={{ ['--s' as string]: scale }}>
            <span className="cx-fix__glow" aria-hidden="true" />
            <div className="cx-fix__rig" role="img" aria-label={`A phone checkout screen. ${status}.`}>
              <p className="cx-fix__status" aria-live="polite">
                {status}
              </p>
              <Checkout />
              {items.map((rule, i) => (
                <span
                  key={rule.id}
                  className={`cx-fix__callout cx-fix__callout--${rule.id}`}
                  data-umm-tone={rule.tone}
                  data-on={i === active && k[i] > 0.2}
                  aria-hidden="true"
                >
                  {rule.fix}
                </span>
              ))}
            </div>
            {active >= 0 ? (
              <p className="cx-fix__caption" data-umm-tone={items[active].tone} aria-hidden="true">
                {items[active].fix}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

/** The checkout, drawn at 320 x 660. Every rule's change is in CSS, read
 *  from --k1 … --k5 on the section. */
function Checkout() {
  return (
    <div className="cx-phone" aria-hidden="true">
      <div className="cx-phone__screen">
        <div className="cx-phone__status">
          <span>9:41</span>
          <span className="cx-phone__bars">
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="cx-phone__head">
          <span className="cx-phone__title">Checkout</span>
        </div>

        {/* 3 · ten steps fold into three */}
        <div className="cx-phone__steps">
          <span className="cx-phone__stepnote">
            <span className="cx-x-before">Step 2 of 10</span>
            <span className="cx-x-after">Step 1 of 3</span>
          </span>
          <span className="cx-phone__track">
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} data-extra={i >= 3} data-done={i < 1} />
            ))}
          </span>
        </div>

        <div className="cx-phone__item">
          <span className="cx-phone__thumb" />
          <span className="cx-phone__name">
            Linen tote bag
            <small>Natural, one size</small>
          </span>
          <span className="cx-phone__price">$48.00</span>
          {/* 4 · one of the four button styles */}
          <span className="cx-btn cx-btn--edit">
            <span className="cx-btn__messy">EDIT</span>
            <span className="cx-btn__clean">Edit</span>
          </span>
        </div>

        <div className="cx-phone__form">
          <Field label="Email" value="sam@example.com" />
          <Field label="Full name" value="Sam Patel" extra />
          <Field label="Address" value="12 Mill Lane, Leeds" auto />
          <Field label="Postcode" value="LS1 4AP" extra />
          <Field label="Phone" value="07700 900123" extra />
        </div>

        <div className="cx-phone__row">
          <span className="cx-btn cx-btn--code">
            <span className="cx-btn__messy">Apply code</span>
            <span className="cx-btn__clean">Apply code</span>
          </span>
          <span className="cx-btn cx-btn--save">
            <span className="cx-btn__messy">save for later</span>
            <span className="cx-btn__clean">Save for later</span>
          </span>
        </div>

        <div className="cx-phone__total">
          <span>Total</span>
          <strong>$52.00</strong>
        </div>

        {/* 2 · the bar Pay settles into, in the thumb's reach */}
        <span className="cx-phone__dock" />
        <span className="cx-phone__zone" />

        {/* 1 + 2 · Pay: washed out and up in the corner, then readable and
            down where the thumb is */}
        <span className="cx-phone__pay">Pay now</span>

        {/* 5 · taps from testing land on Pay */}
        <span className="cx-phone__taps">
          {Array.from({ length: 4 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      </div>
      <span className="cx-phone__stamp">Tested ✓</span>
    </div>
  )
}

function Field({ label, value, extra, auto }: { label: string; value: string; extra?: boolean; auto?: boolean }) {
  return (
    <span className="cx-field" data-extra={extra || undefined}>
      <span className="cx-field__in">
        <span className="cx-field__label">{label}</span>
        <span className="cx-field__box">
          {value}
          {auto ? <em className="cx-field__auto">Found it</em> : null}
        </span>
      </span>
    </span>
  )
}
