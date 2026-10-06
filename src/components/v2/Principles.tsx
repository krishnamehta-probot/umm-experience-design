import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ChipHead, withAccent } from './ChipHead'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { principles } from '@/content/cxUiDesign'

/* ============================================================================
   6a · HOW WE DESIGN — one checkout, fixed rule by rule

   "Rules we never skip", shown rather than listed. A phone holds a real-
   looking checkout with every rule broken: a washed-out Pay button tucked in
   the top corner, ten steps, a form asking for everything, buttons in four
   styles that have never met. The section pins, and each rule is a stop on
   the scroll:

     0 Before                   every rule broken
     1 Colour with a reason     Pay goes from 1.4:1 contrast to 19:1
     2 Made for thumbs          Pay moves down into the thumb's reach
     3 Fewer steps, every time  ten steps fold into three; the form shrinks
     4 Same look, everywhere    four button styles settle into one
     5 Tested before it's built a usability-test result comes in on Pay

   The stops are magnetic. The scroll only chooses which stop is showing; the
   change itself plays as a full animation (--k1 … --k5, registered so CSS
   eases them), so a fast flick never skims past it. And when the reader stops
   scrolling, the page settles on the nearest stop, so every rule is seen at
   rest. Entering and leaving the section stay free: nothing is pulled back.

   The rules list on the left is the readout: each one ticks as it lands, and
   clicking one goes to its stop.

   Unpinned (phones) and reduced motion the list becomes the control: tap a
   rule to apply everything up to it. On phones it plays through once on its
   own when it comes into view; reduced motion starts on the finished screen.
   ========================================================================== */

const items = principles.items
const N = items.length
/** Stops: the broken screen, then one per rule. */
const STOPS = N + 1

/* The phone is drawn at a fixed size and scaled to fit. */
const PHONE_W = 300
const PHONE_H = 620
/** Phone plus the callouts beside it, on wide screens. */
const RIG_W = 570
/** The phone never takes more than this share of the slot's height. */
const MAX_FILL = 0.8

/** Scroll position (share of the section's travel) at which a stop rests. */
const anchor = (stop: number) => (stop + 0.5) / STOPS

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

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

  const stop = pinMode ? Math.min(STOPS - 1, Math.max(0, Math.floor(progress * STOPS))) : picked
  const k = items.map((_, i) => (i < stop ? 1 : 0))
  const active = stop - 1

  /* --- the magnet: settle on the nearest stop once the scroll goes quiet --- */
  const glide = useRef<(stop: number) => void>(() => {})
  useEffect(() => {
    const el = ref.current
    if (!pinMode || !el) return
    let idle = 0
    let tween = 0
    let gliding = false

    const geometry = () => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      travel: el.offsetHeight - window.innerHeight,
    })

    const cancel = () => {
      if (tween) cancelAnimationFrame(tween)
      tween = 0
      gliding = false
    }

    const glideTo = (to: number) => {
      cancel()
      const from = window.scrollY
      const d = to - from
      if (Math.abs(d) < 2) return
      const dur = Math.min(1000, 420 + Math.abs(d) * 0.5)
      const t0 = performance.now()
      gliding = true
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur)
        window.scrollTo({ top: from + d * easeInOut(t), behavior: 'instant' })
        if (t < 1) tween = requestAnimationFrame(step)
        else {
          tween = 0
          gliding = false
        }
      }
      tween = requestAnimationFrame(step)
    }

    glide.current = (s: number) => {
      const { top, travel } = geometry()
      glideTo(top + travel * anchor(s))
    }

    const settle = () => {
      const { top, travel } = geometry()
      if (travel <= 0) return
      const p = (window.scrollY - top) / travel
      // Free on the way in and out: only between the first and last stop.
      if (p <= anchor(0) || p >= anchor(STOPS - 1)) return
      glideTo(top + travel * anchor(Math.round(p * STOPS - 0.5)))
    }

    const onScroll = () => {
      if (gliding) return
      window.clearTimeout(idle)
      idle = window.setTimeout(settle, 160)
    }
    // Any hand on the controls wins over the glide.
    const interrupt = () => {
      if (gliding) cancel()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', interrupt, { passive: true })
    window.addEventListener('touchstart', interrupt, { passive: true })
    window.addEventListener('keydown', interrupt)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', interrupt)
      window.removeEventListener('touchstart', interrupt)
      window.removeEventListener('keydown', interrupt)
      window.clearTimeout(idle)
      cancel()
      glide.current = () => {}
    }
  }, [pinMode, ref])

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
        }, 1600)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearInterval(timer)
    }
  }, [mode])

  /* Scale the drawing to its slot, and keep it compact. */
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = rigSlot.current
    if (!el) return
    const fit = () => {
      const w = wide ? RIG_W : PHONE_W + 24
      const s = Math.min(el.clientWidth / w, (el.clientHeight * MAX_FILL) / PHONE_H, 1)
      setScale(Math.max(0.3, s))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [wide])

  const choose = (i: number) => {
    if (pinMode) {
      glide.current(i + 1)
      return
    }
    touched.current = true
    // Tapping the last applied rule again takes it back off.
    setPicked((p) => (p === i + 1 ? i : i + 1))
  }

  const vars = Object.fromEntries(k.map((v, i) => [`--k${i + 1}`, v])) as CSSProperties
  const tone = active >= 0 ? items[active].tone : 'coral'
  const status =
    stop === 0 ? 'Before: every rule broken' : stop === N ? 'After: all five rules' : `${stop} of ${N} rules applied`

  return (
    <section
      className="umm-section umm-pin cx-fix"
      id="design"
      ref={ref}
      data-mode={mode}
      style={{ ...vars, ['--umm-pin-steps' as string]: STOPS }}
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
                    data-done={k[i] === 1}
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
                    <span className="umm-sr-only">{k[i] === 1 ? ' (applied)' : ''}</span>
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
                <span className="cx-fix__meter" aria-hidden="true">
                  {items.map((rule, i) => (
                    <i key={rule.id} data-on={i < stop} data-umm-tone={rule.tone} />
                  ))}
                </span>
                {status}
              </p>
              <Phone />
              {items.map((rule, i) => (
                <span
                  key={rule.id}
                  className={`cx-fix__callout cx-fix__callout--${rule.id}`}
                  data-umm-tone={rule.tone}
                  data-on={i === active}
                  aria-hidden="true"
                >
                  <i />
                  {rule.fix}
                </span>
              ))}
            </div>
            {active >= 0 ? (
              <p className="cx-fix__caption" data-umm-tone={items[active].tone} aria-hidden="true">
                <i />
                {items[active].fix}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   The phone, drawn at 300 x 620: a modern handset (thin bezel, camera
   island, side buttons) running an ordinary iOS-style checkout. Every rule's
   change is in CSS, read from --k1 … --k5 on the section.
   ------------------------------------------------------------------------- */

function Phone() {
  return (
    <div className="cx-phone" aria-hidden="true">
      <span className="cx-phone__btn cx-phone__btn--action" />
      <span className="cx-phone__btn cx-phone__btn--up" />
      <span className="cx-phone__btn cx-phone__btn--down" />
      <span className="cx-phone__btn cx-phone__btn--power" />
      <div className="cx-phone__screen">
        <div className="cx-app">
          <div className="cx-app__status">
            <span>9:41</span>
            <span className="cx-app__icons">
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
              <span className="cx-app__battery">
                <i />
              </span>
            </span>
          </div>

          <div className="cx-app__nav">
            <span className="cx-app__back">
              <svg viewBox="0 0 10 16">
                <path d="M8 1.5 2 8l6 6.5" />
              </svg>
              Bag
            </span>
          </div>
          <span className="cx-app__title">Checkout</span>

          {/* 3 · ten steps fold into three */}
          <div className="cx-app__steps">
            <span className="cx-app__stepnote">
              <span className="cx-x-before">Step 2 of 10 · Contact details</span>
              <span className="cx-x-after">Step 1 of 3 · Details</span>
            </span>
            <span className="cx-app__track">
              {Array.from({ length: 10 }, (_, i) => (
                <i key={i} data-extra={i >= 3} data-done={i < 1} />
              ))}
            </span>
          </div>

          <span className="cx-app__label">Order</span>
          <div className="cx-app__group cx-app__item">
            <span className="cx-app__thumb">
              <span className="cx-app__jar">
                <i />
              </span>
            </span>
            <span className="cx-app__name">
              Amber candle
              <small>220 g · Qty 1</small>
            </span>
            <span className="cx-app__price">
              $38.00
              {/* 4 · one of the four button styles */}
              <span className="cx-btn cx-btn--edit">
                <span className="cx-btn__messy">EDIT</span>
                <span className="cx-btn__clean">Edit</span>
              </span>
            </span>
          </div>

          <span className="cx-app__label">Delivery</span>
          <div className="cx-app__group">
            <Row label="Email" value="sam@example.com" />
            <Row label="Full name" value="Sam Patel" extra />
            <Row label="Address" value="12 Mill Lane" auto />
            <Row label="Postcode" value="LS1 4AP" extra />
            <Row label="Phone" value="07700 900123" extra />
          </div>

          <div className="cx-app__row">
            <span className="cx-btn cx-btn--code">
              <span className="cx-btn__messy">Apply promo code</span>
              <span className="cx-btn__clean">Apply promo code</span>
            </span>
            <span className="cx-btn cx-btn--save">
              <span className="cx-btn__messy">save for later</span>
              <span className="cx-btn__clean">Save for later</span>
            </span>
          </div>

          <div className="cx-app__total">
            <span>Total</span>
            <strong>$40.00</strong>
          </div>
        </div>

        {/* 2 · the thumb's reach, and the bar Pay settles into */}
        <span className="cx-app__zone" />
        <span className="cx-app__dock" />

        {/* 1 + 2 · Pay: washed out and up in the corner, then readable and
            down where the thumb is */}
        <span className="cx-app__pay">
          <span className="cx-x-short">Pay</span>
          <span className="cx-x-long">Pay $40.00</span>
        </span>

        {/* 5 · where testers tapped, and the test result coming in */}
        <span className="cx-app__heat">
          <i />
          <i />
          <i />
        </span>
        <span className="cx-app__note">
          <span className="cx-app__note-icon">
            <svg viewBox="0 0 20 20">
              <path d="M5 10.5 8.5 14 15 6.5" />
            </svg>
          </span>
          <span className="cx-app__note-text">
            <b>Usability test</b>
            Checkout task passed with real users
          </span>
        </span>

        <span className="cx-app__island" />
        <span className="cx-app__home" />
      </div>
    </div>
  )
}

function Row({ label, value, extra, auto }: { label: string; value: string; extra?: boolean; auto?: boolean }) {
  return (
    <span className="cx-app__field" data-extra={extra || undefined}>
      <span className="cx-app__field-in">
        <span className="cx-app__field-label">{label}</span>
        <span className="cx-app__field-value">
          {auto ? <em className="cx-app__auto">Found</em> : null}
          {value}
        </span>
      </span>
    </span>
  )
}
