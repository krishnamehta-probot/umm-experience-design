import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { commerce as commerce0 } from '@/content/uxCommerce'
import { Receipt, ShopPhone, type PhoneStep } from './ShopPhone'
import { lanePx, screenPx } from '@/lib/lane'
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

/** phones: the case and the cards are one panel, held, the scroll moving the cards (useScrollDeck) */
const PHONE = '(max-width: 639px)'

/**
 * Which card is being read, and how far through it: the last card whose top
 * has passed the reading line (mid-screen beside the case; below the case on
 * a tablet). On a phone the deck says (useScrollDeck). The fraction runs the
 * case's meter as a CSS variable, written once a frame, so React only hears
 * about a new card.
 */
function useShopReading() {
  const [at, setAt] = useState(0)
  const holdRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const phone = window.matchMedia(PHONE)
    let raf = 0
    const measure = () => {
      raf = 0
      const hold = holdRef.current
      if (!hold || phone.matches) return
      const vh = window.innerHeight
      const below = window.innerWidth < 1000 && vh > 560
      const held = hold.getBoundingClientRect()
      const line = below ? Math.max(held.bottom, 0) + (vh - Math.max(held.bottom, 0)) * 0.3 : vh * 0.5
      const tops = cards.current.map((c) => (c ? c.getBoundingClientRect().top : Infinity))
      let now = 0
      tops.forEach((t, i) => {
        if (t < line) now = i
      })
      const last = cards.current[cards.current.length - 1]
      const end = tops[now + 1] ?? (last ? last.getBoundingClientRect().bottom : tops[now] + 1)
      const p = Math.min(1, Math.max(0, (line - tops[now]) / Math.max(1, end - tops[now])))
      stageRef.current?.style.setProperty('--p', p.toFixed(3))
      setAt((was) => (was === now ? was : now))
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const cardRef = (i: number) => (el: HTMLElement | null) => {
    cards.current[i] = el
  }
  return { at, setAt, holdRef, stageRef, cardRef }
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * The phone's deck, on scroll (19 Oct, Krish: one card at a time, attached
 * to the phone, moving as you scroll, no words cut). The panel (the case
 * over the cards) is held in the middle of the screen while the section's
 * runway passes, and the runway is cut into one lane per card:
 *
 *   - a pause on the card as it arrives,
 *   - where a card is taller than the panel's room, its words rising past
 *     the case one for one with the scroll until its end is in view,
 *   - then the next card sliding in from the right.
 *
 * So nothing is ever cut: the scroll reads a long card to its end before it
 * moves on. When the scroll goes quiet partway through a slide, the page
 * glides to whichever card is nearer (never while a finger is down, and
 * never inside a card, where every stop is a place to read).
 */
function useScrollDeck(
  storyRef: RefObject<HTMLDivElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
  listRef: RefObject<HTMLOListElement | null>,
  stageRef: RefObject<HTMLDivElement | null>,
  setAt: (at: number) => void,
) {
  useEffect(() => {
    const story = storyRef.current
    const panel = panelRef.current
    const list = listRef.current
    if (!story || !panel || !list) return
    const phone = window.matchMedia(PHONE)
    const slides = Array.from(list.children) as HTMLElement[]
    /* the card each slide shows on the phone (the models' heading: the card before it) */
    const cardOf: number[] = []
    slides.reduce((n, el) => {
      const k = el.classList.contains('up__step') ? n + 1 : n
      cardOf.push(Math.max(0, k))
      return k
    }, -1)

    type Lane = { start: number; pause: number; rise: number; slide: number }
    let lanes: Lane[] = []
    /** each card's own height, the case's, and the most the panel may be */
    let heights: number[] = []
    let head = 0
    let most = 0
    let total = 0
    let top = 0
    let raf = 0
    let on = false

    /** measure the panel and every card, and cut the runway */
    const layout = () => {
      on = phone.matches
      if (!on) {
        story.style.removeProperty('height')
        panel.style.removeProperty('--panel-h')
        panel.style.removeProperty('--panel-top')
        slides.forEach((el) => el.style.removeProperty('transform'))
        return
      }
      const screen = screenPx()
      const lane = lanePx()
      head = (panel.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0
      heights = slides.map((el) => el.offsetHeight)
      /* held clear of the menu bar, which comes back as the page scrolls up */
      const bar = document.querySelector('.cx-nav')
      const clear = bar ? Math.round(bar.getBoundingClientRect().height + 18) : 72
      const h = Math.min(screen - clear - 8, head + Math.max(...heights))
      most = h
      top = Math.max(clear, Math.round((screen - h) / 2))
      panel.style.setProperty('--panel-top', `${top}px`)
      const room = h - head
      let at = 0
      lanes = slides.map((el, i) => {
        const l = {
          start: at,
          pause: lane * 0.35,
          rise: Math.max(0, el.offsetHeight - room),
          slide: i < slides.length - 1 ? lane * 0.55 : lane * 0.2,
        }
        at += l.pause + l.rise + l.slide
        return l
      })
      total = at
      story.style.height = `${Math.round(total + h)}px`
    }

    /** where the runway has got to: the slide, its rise, and the slide across */
    const read = () => {
      const s = Math.min(total, Math.max(0, top - story.getBoundingClientRect().top))
      let i = lanes.length - 1
      while (i > 0 && s < lanes[i].start) i--
      const l = lanes[i]
      const u = s - l.start
      const rise = Math.min(l.rise, Math.max(0, u - l.pause))
      const across = i < lanes.length - 1 ? Math.min(1, Math.max(0, (u - l.pause - l.rise) / l.slide)) : 0
      return { i, u, rise, across }
    }

    const paint = () => {
      raf = 0
      if (!on) return
      const { i, u, rise, across } = read()
      const x = i + easeInOut(across)
      /* the panel as tall as the card in it (up to the screen's room), its
         top still, so the phone never moves; between two cards, between
         their two heights */
      const fits = (k: number) => Math.min(most, head + heights[k])
      const next = Math.min(i + 1, slides.length - 1)
      panel.style.setProperty('--panel-h', `${fits(i) + (fits(next) - fits(i)) * easeInOut(across)}px`)
      slides.forEach((el, k) => {
        const lift = k < i ? lanes[k].rise : k === i ? rise : 0
        el.style.transform = `translate3d(${-x * 100}%, ${-lift}px, 0)`
      })
      const l = lanes[i]
      stageRef.current?.style.setProperty('--p', Math.min(1, u / (l.pause + l.rise + l.slide)).toFixed(3))
      setAt(cardOf[Math.round(x)] ?? 0)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }

    /* --- the settle: onto the nearer card when the scroll stops mid-slide --- */
    let idle = 0
    let tween = 0
    let touching = false
    const cancel = () => {
      if (tween) cancelAnimationFrame(tween)
      tween = 0
    }
    const glideBy = (d: number) => {
      cancel()
      if (Math.abs(d) < 2) return
      const from = window.scrollY
      const dur = Math.min(900, 380 + Math.abs(d) * 0.5)
      const t0 = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur)
        window.scrollTo({ top: from + d * easeInOut(t), behavior: 'instant' })
        tween = t < 1 ? requestAnimationFrame(step) : 0
      }
      tween = requestAnimationFrame(step)
    }
    const settle = () => {
      if (!on || touching) return
      const { i, u, across } = read()
      if (across <= 0.02 || across >= 0.98) return
      const l = lanes[i]
      const back = l.pause + l.rise - u
      const ahead = l.pause + l.rise + l.slide - u + lanes[i + 1].pause * 0.5
      glideBy(across < 0.5 ? back : ahead)
    }
    const onScroll = () => {
      queue()
      if (tween) return
      window.clearTimeout(idle)
      if (!touching) idle = window.setTimeout(settle, 170)
    }
    const down = () => {
      touching = true
      window.clearTimeout(idle)
      cancel()
    }
    const up = (e: TouchEvent) => {
      if (e.touches.length) return
      touching = false
      onScroll()
    }

    const relayout = () => {
      layout()
      queue()
    }
    relayout()
    const ro = new ResizeObserver(relayout)
    slides.forEach((el) => ro.observe(el))
    if (panel.firstElementChild) ro.observe(panel.firstElementChild)
    phone.addEventListener('change', relayout)
    window.addEventListener('resize', relayout)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', down, { passive: true })
    window.addEventListener('touchend', up)
    window.addEventListener('wheel', cancel, { passive: true })
    return () => {
      ro.disconnect()
      phone.removeEventListener('change', relayout)
      window.removeEventListener('resize', relayout)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', down)
      window.removeEventListener('touchend', up)
      window.removeEventListener('wheel', cancel)
      window.clearTimeout(idle)
      cancel()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [storyRef, panelRef, listRef, stageRef, setAt])
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
  const { at, setAt, holdRef, stageRef, cardRef } = useShopReading()
  const storyRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  useScrollDeck(storyRef, panelRef, listRef, stageRef, setAt)
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

  /** where the order goes next, under a layer: an arrow on to the next layer,
   *  or, under the last, a loop back to the first (19 Oct, Krish: drawn
   *  arrows in place of the bare hook and ring, which read as stray marks) */
  const link = (text: string, loop?: boolean) => (
    <p className="up__link" data-k={loop ? 'loop' : undefined}>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        {loop ? (
          <>
            <path d="M17 10a7 7 0 1 1-7-7c2 0 3.9.8 5.3 2.2L17 7" />
            <path d="M17 3v4h-4" />
          </>
        ) : (
          <>
            <path d="M4.5 3.5v6.25a3.5 3.5 0 0 0 3.5 3.5h8" />
            <path d="M13 10.25l3 3-3 3" />
          </>
        )}
      </svg>
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
          <div className="up__story" ref={storyRef}>
            {/* one panel on a phone (useScrollDeck); no box of its own elsewhere */}
            <div className="up__panel" ref={panelRef}>
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

              {/* the cards, in the page's flow (on a phone, one at a time as you scroll) */}
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
