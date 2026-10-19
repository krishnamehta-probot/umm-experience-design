import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { commerce as commerce0 } from '@/content/uxCommerce'
import { Receipt, ShopPhone, type PhoneStep } from './ShopPhone'
import '@/styles/cloud-arch.css'
import '@/styles/ux-phone.css'

/* ============================================================================
   UX & DIGITAL COMMERCE · THE THINKING BEHIND THE INTERFACE

   The page's story: one order, from the first search to the systems that
   fulfil it, through the doc's four layers (experience, AI and
   personalization, commerce services, business operations), then four
   business models, then three principles.

   16 Oct, Krish: the four service pages' thinking sections had grown alike;
   this one became the shopper's phone. 16 Oct, later: "idea wise it's fine,
   quality wise it can be a lot better ... more customized and premium". So:

     - the phone is the one rich object: a rendered handset with a real shop
       in it (ShopPhone), standing in a white display case with a light in
       the pastel of the card being read, a thermal receipt tucked behind it
       printing a line per card
     - the case is held (sticky) on the left on wide screens, the cards pass
       on the right; on phones and tablets it stands once, whole, above the
       cards (19 Oct, Krish: not a strip with half the phone). On a phone the
       case and the cards are one panel: a smaller phone beside where you
       are, and under it one card at a time, playing by itself (useDeck)
     - the cards are quiet: no boxes until one is read, which lifts as a
       white card with its tone dot lit; everything else is type, hairlines
       and plain chips

     01–04  the layers: storefront, AI search, checkout, order tracking
     05–08  the business models: a product page, a bulk order, a plan,
            a booking

   Every word is in the cards, in the page's flow; the phone and receipt only
   repeat them (aria-hidden). Short windows don't hold the case at all.
   ========================================================================== */

/* the light per card: the page's blossom, then three supports, in turn */
const LIGHT: Tone[] = ['blossom', 'sky', 'sun', 'citrus']
const RULE_TONES: Tone[] = ['coral', 'sky', 'citrus']

/** "01 Experience" → ["01", "Experience"] */
const split = (label: string) => {
  const m = label.match(/^(\d+)\s+(.*)$/)
  return m ? [m[1], m[2]] : ['', label]
}

const num = (i: number) => String(i + 1).padStart(2, '0')
const toned = (t: Tone) => ({ ['--umm-tone' as string]: `var(--umm-${t})` }) as CSSProperties

/**
 * Which card is being read, and how far through it: the last card whose top
 * has passed the reading line (mid-screen beside the case; below the case on
 * a tablet). On a phone the cards run sideways, one at a time, and the card
 * is the one in the frame (its meter is the deck's clock, useDeck). The
 * fraction runs the case's meter as a CSS variable, written once a frame, so
 * React only hears about a new card.
 */
function useShopReading() {
  const [at, setAt] = useState(0)
  const holdRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const hold = holdRef.current
      const list = listRef.current
      if (!hold || !list) return
      let now = 0
      if (list.scrollWidth > list.clientWidth + 1) {
        /* sideways (phones): the card whose left edge has passed the frame's middle */
        const frame = list.getBoundingClientRect()
        const line = frame.left + frame.width * 0.5
        const lefts = cards.current.map((c) => (c ? c.getBoundingClientRect().left : Infinity))
        lefts.forEach((l, i) => {
          if (l < line) now = i
        })
      } else {
        const vh = window.innerHeight
        const below = window.innerWidth < 1000 && vh > 560
        const held = hold.getBoundingClientRect()
        const line = below ? Math.max(held.bottom, 0) + (vh - Math.max(held.bottom, 0)) * 0.3 : vh * 0.5
        const tops = cards.current.map((c) => (c ? c.getBoundingClientRect().top : Infinity))
        tops.forEach((t, i) => {
          if (t < line) now = i
        })
        const last = cards.current[cards.current.length - 1]
        const end = tops[now + 1] ?? (last ? last.getBoundingClientRect().bottom : tops[now] + 1)
        const p = Math.min(1, Math.max(0, (line - tops[now]) / Math.max(1, end - tops[now])))
        stageRef.current?.style.setProperty('--p', p.toFixed(3))
      }
      setAt((was) => (was === now ? was : now))
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    const list = listRef.current
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    list?.addEventListener('scroll', queue, { passive: true })
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      list?.removeEventListener('scroll', queue)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const cardRef = (i: number) => (el: HTMLElement | null) => {
    cards.current[i] = el
  }
  return { at, holdRef, stageRef, listRef, cardRef }
}

/**
 * The phone's deck (19 Oct, Krish: "scroll automatically", one card, nothing
 * cut). Where the cards run sideways, each holds for as long as its words
 * take to read, the meter filling meanwhile, then the next slides in, round
 * to the first again. A touch takes over; let go and the card under the
 * finger starts its own hold. It plays only in view, never with reduced
 * motion. The deck is as tall as the card in it (--deck-h), so a short card
 * leaves no gap and a long one is never clipped.
 */
function useDeck(listRef: RefObject<HTMLOListElement | null>, stageRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const slides = () => Array.from(list.children) as HTMLElement[]
    const across = () => list.scrollWidth > list.clientWidth + 1
    const index = () => Math.round(list.scrollLeft / Math.max(1, list.clientWidth))
    /** about 4 words a second, from 4.5 to 13 seconds */
    const hold = (el?: HTMLElement) => {
      const words = (el?.textContent ?? '').trim().split(/\s+/).length
      return Math.min(13000, Math.max(4500, words * 240))
    }

    let raf = 0
    let last = 0
    let elapsed = 0
    let shown = -1
    let inView = false
    let touching = false

    const fit = () => {
      const el = slides()[index()]
      if (el && across()) list.style.setProperty('--deck-h', `${el.offsetHeight}px`)
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = last ? Math.min(100, now - last) : 0
      last = now
      if (!across()) return
      const i = index()
      if (i !== shown) {
        shown = i
        elapsed = 0
        fit()
      }
      if (reduce.matches) {
        stageRef.current?.style.setProperty('--p', '1')
        return
      }
      if (!inView || touching || document.hidden) return
      elapsed += dt
      const all = slides()
      const span = hold(all[i])
      stageRef.current?.style.setProperty('--p', Math.min(1, elapsed / span).toFixed(3))
      if (elapsed >= span) {
        elapsed = 0
        const next = (i + 1) % all.length
        list.scrollTo({ left: next * list.clientWidth, behavior: 'smooth' })
      }
    }

    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.4 })
    io.observe(list)
    const ro = new ResizeObserver(fit)
    slides().forEach((el) => ro.observe(el))
    const down = () => (touching = true)
    const up = () => {
      touching = false
      elapsed = 0
    }
    list.addEventListener('pointerdown', down)
    list.addEventListener('touchstart', down, { passive: true })
    list.addEventListener('pointerup', up)
    list.addEventListener('pointercancel', up)
    list.addEventListener('touchend', up)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      list.removeEventListener('pointerdown', down)
      list.removeEventListener('touchstart', down)
      list.removeEventListener('pointerup', up)
      list.removeEventListener('pointercancel', up)
      list.removeEventListener('touchend', up)
      list.style.removeProperty('--deck-h')
    }
  }, [listRef, stageRef])
}

/**
 * The phone and receipt are drawn at a fixed size (the rig) and scaled to the
 * slot. The slot's CSS says how: --rig-w and --rig-h are the drawing, --fit is
 * "contain" in the case and "width" in the strip, where the phone is cropped.
 */
function useFit() {
  const slotRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = slotRef.current
    if (!el) return
    const fit = () => {
      const cs = getComputedStyle(el)
      const w = parseFloat(cs.getPropertyValue('--rig-w')) || 300
      const h = parseFloat(cs.getPropertyValue('--rig-h')) || 620
      const byWidth = cs.getPropertyValue('--fit').trim() === 'width'
      const s = byWidth ? el.clientWidth / w : Math.min(el.clientWidth / w, el.clientHeight / h, 1)
      el.style.setProperty('--s', String(Math.max(0.3, Math.round(s * 1000) / 1000)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [])
  return slotRef
}

export function CommerceArchitecture({ content = commerce0 }: { content?: typeof commerce0 }) {
  const { board, models, principles } = content
  const { at, holdRef, stageRef, listRef, cardRef } = useShopReading()
  useDeck(listRef, stageRef)
  const slotRef = useFit()

  /* the eight cards, in order: the layers, then the business models */
  const steps: PhoneStep[] = [
    { focus: 'experience', tone: LIGHT[0], name: split(board.experience.label)[1] },
    { focus: 'ai', tone: LIGHT[1], name: split(board.ai.label)[1] },
    { focus: 'services', tone: LIGHT[2], name: split(board.services.label)[1] },
    { focus: 'operations', tone: LIGHT[3], name: split(board.operations.label)[1] },
    ...models.map((m, i) => ({ focus: m.id, tone: LIGHT[i % LIGHT.length], name: m.label })),
  ]
  const now = steps[at]

  /* the content's own words, for the parts of the shop they name */
  const words = {
    channels: board.experience.items,
    ai: board.ai.items,
    services: board.services.items.map((s) => s.title),
    operations: board.operations.items,
    pricing: models[1]?.connects[1] ?? '',
    approvals: models[1]?.connects[2] ?? '',
    entitlements: models[2]?.connects[0] ?? '',
  }
  /* "… Every layer connected." closes the receipt */
  const footer = content.lead.split(/(?<=\.)\s+/).pop() ?? ''

  /** a card, lit while it is read */
  const card = (i: number, body: ReactNode) => (
    <li
      key={steps[i].focus}
      className="up__step"
      data-on={i === at || undefined}
      data-read={i < at || undefined}
      ref={cardRef(i)}
      style={toned(steps[i].tone)}
    >
      {body}
    </li>
  )

  /** the card's number and, for a model, its eyebrow */
  const meta = (i: number, eyebrow?: string) => (
    <p className="up__meta">
      <i className="up__dot" aria-hidden="true" />
      <span>{num(i)}</span>
      {eyebrow && <span className="up__meta-sep">{eyebrow}</span>}
    </p>
  )

  /** where the order goes next, under a layer */
  const link = (text: string, loop?: boolean) => (
    <p className="up__link" data-k={loop ? 'loop' : undefined}>
      <i aria-hidden="true" />
      {text}
    </p>
  )

  const chips = (items: string[], inline?: boolean) => (
    <ul className="up__chips" data-k={inline ? 'inline' : undefined}>
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  )

  return (
    <section className="umm-section cd-arch uc up" id="commerce" aria-labelledby="uc-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="uc-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="blossom"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <div className="up__board" role="group" aria-label={board.label}>
          <div className="up__story">
            {/* the display case: held while the cards pass */}
            <div className="up__hold" ref={holdRef}>
              <div className="up__stage" ref={stageRef} style={toned(now.tone)}>
                <div className="up__chrome">
                  <p className="up__caselabel">
                    <i aria-hidden="true" />
                    {board.label}
                  </p>
                  <div className="up__progress" aria-hidden="true">
                    <span className="up__meter">
                      {steps.map((s, i) => (
                        <i key={s.focus} data-k={i < at ? 'done' : i === at ? 'now' : undefined} />
                      ))}
                    </span>
                    <span className="up__count">
                      <b>{num(at)}</b> / {num(steps.length - 1)}
                    </span>
                  </div>
                </div>
                <div className="up__slot" ref={slotRef}>
                  <i className="up__glow" aria-hidden="true" />
                  <div className="up__rig">
                    <Receipt steps={steps} at={at} label={board.label} footer={footer} />
                    <ShopPhone steps={steps} at={at} words={words} />
                  </div>
                </div>
                <p className="up__now" aria-hidden="true">
                  <i />
                  <span key={now.focus}>{now.name}</span>
                </p>
              </div>
            </div>

            {/* the cards, in the page's flow (swiped one at a time on a phone) */}
            <ol className="up__steps" ref={listRef}>
              {card(
                0,
                <>
                  {meta(0)}
                  <h3 className="up__title">{split(board.experience.label)[1]}</h3>
                  {chips(board.experience.items)}
                  {link(board.experience.link)}
                </>,
              )}

              {card(
                1,
                <>
                  {meta(1)}
                  <h3 className="up__title">{split(board.ai.label)[1]}</h3>
                  <p className="up__lede">{board.ai.title}</p>
                  {chips(board.ai.items)}
                  {link(board.ai.link)}
                </>,
              )}

              {card(
                2,
                <>
                  {meta(2)}
                  <h3 className="up__title">{split(board.services.label)[1]}</h3>
                  <p className="up__body">{board.services.note}</p>
                  <ul className="up__svcs">
                    {board.services.items.map((s) => (
                      <li key={s.title}>
                        <span className="up__svc-title">{s.title}</span>
                        <span className="up__svc-sub">{s.body}</span>
                      </li>
                    ))}
                  </ul>
                  {link(board.services.link)}
                </>,
              )}

              {card(
                3,
                <>
                  {meta(3)}
                  <h3 className="up__title">{split(board.operations.label)[1]}</h3>
                  {chips(board.operations.items, true)}
                  {link(board.operations.loop, true)}
                </>,
              )}

              {/* the business models, under their heading */}
              <li className="up__divider">
                <p className="up__divider-eyebrow">{content.modelsEyebrow}</p>
                <p className="up__divider-title">{content.modelsTitle}</p>
              </li>

              {models.map((m, k) =>
                card(
                  4 + k,
                  <>
                    {meta(4 + k, m.eyebrow)}
                    <h3 className="up__title">{m.title}</h3>
                    <p className="up__body">{m.body}</p>
                    <dl className="up__spec">
                      <div>
                        <dt>{content.aiLabel}</dt>
                        <dd>{m.ai}</dd>
                      </div>
                      <div>
                        <dt>{content.connectsLabel}</dt>
                        <dd>
                          <ol className="up__chain">
                            {m.connects.map((c, j) => (
                              <li key={c} style={{ ['--i' as string]: j } as CSSProperties}>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ol>
                        </dd>
                      </div>
                    </dl>
                  </>,
                ),
              )}
            </ol>
          </div>

          {/* across the architecture */}
          <Across label={board.across.label} items={board.across.items} />
        </div>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li key={p.title} className="cd-arch__rule" data-umm-tone={RULE_TONES[i]}>
              <span className="cd-arch__rule-tag">
                {String(i + 1).padStart(2, '0')} / {p.step}
              </span>
              <h3 className="cd-arch__rule-title">{p.title}</h3>
              <p className="cd-arch__rule-body">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** What holds across the architecture: one hairline row, each item ticked as
 *  the row comes into view (the CX tick). */
function Across({ label, items }: { label: string; items: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className="up__across" ref={ref} data-seen={seen || undefined}>
      <p className="up__across-label">{label}</p>
      <ul className="up__checks">
        {items.map((a, i) => (
          <li key={a} style={{ ...toned(LIGHT[i % LIGHT.length]), ['--i' as string]: i } as CSSProperties}>
            <span className="up__tick" aria-hidden="true">
              <svg viewBox="0 0 20 20">
                <path d="M5 10.5 8.5 14 15 6.5" />
              </svg>
            </span>
            {a}
          </li>
        ))}
      </ul>
    </div>
  )
}
