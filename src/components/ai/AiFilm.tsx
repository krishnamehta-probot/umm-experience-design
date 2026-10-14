import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { applications, type AppDemo } from '@/content/aiAutomation'
import { SHAPES, type ShapeName, type ShapePart } from '@/components/v2/shapes.data'
import { Shape } from '@/components/v2/Shape'
import { FlyArrow, type Tone } from '@/components/primitives'
import { Vignette } from './AiApplications'
import '@/styles/ai-apps.css'
import '@/styles/ai-film.css'

/* ============================================================================
   AI IN PRACTICE — a 24-second film of three use cases

   The same player, frame and editing language as the CX page's film
   (ProofFilm.tsx): one GSAP timeline on a fixed 1920 x 1080 frame, scaled to
   the screen; the same kit of cuts (Cool Shape wipes, whip pans, flashes,
   shakes, slams, chip pops), 12 fps grain, the clover entrance on big
   screens, the 16:9 band on phones, reduced motion waiting on the cards.

     0:00  intro     the question as a title, slams word by word; "improve."
                     pops as a chip; three Cool Shapes spin through; the
                     three use cases flash in as names
     0:03  assistant a chat answers from approved documents, with its source,
                     and routes an unanswered question to a person
     0:09  document  an invoice is read, checked against the records, and
                     the checks light up one by one; a note routes the exception
     0:16  decision  a forecast draws itself; one reading spikes, the camera
                     pushes in, and two notes say what needs a human
     0:22  the cards the last frame: the three use cases, each a real link
                     to its section on the page

   Screen readers get the three use cases as a list of links.
   ========================================================================== */

const W = 1920
const H = 1080
export const FILM_SECONDS = 24

/** Big, landscape screens with motion allowed get the clover entrance. */
const OPEN =
  '(min-width: 721px) and (min-height: 540px) and (min-aspect-ratio: 5/4) and (prefers-reduced-motion: no-preference), ' +
  /* upright phones too (13 Oct): the clover covers the screen, then the
     whole frame plays as a band across it */
  '(max-aspect-ratio: 5/4) and (min-height: 560px) and (prefers-reduced-motion: no-preference)'
/** Upright phones (13 Oct): the film plays on a 1080 x 1920 frame of its own,
 *  the same scenes restacked for a tall screen (data-tall in the CSS). */
const TALL = '(max-aspect-ratio: 5/4) and (min-height: 560px) and (prefers-reduced-motion: no-preference)'
function useTall(on = true) {
  const [tall, setTall] = useState(() => on && typeof window !== 'undefined' && window.matchMedia(TALL).matches)
  useLayoutEffect(() => {
    if (!on) return
    const mq = window.matchMedia(TALL)
    const read = () => setTall(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [on])
  return tall
}
/** Scroll, in screen heights, over which the clover opens. */
const GROW = 1

const INK = '#100e14'
const PAPER = '#ffffff'
const CITRUS = '#f0ff70'
const BLOSSOM = '#ffc4f2'
const SKY = '#d1e7ff'

const toneHex = (t: Tone) => (t === 'blossom' ? BLOSSOM : t === 'citrus' ? CITRUS : SKY)

const P = applications.items
const TITLE = `${applications.line1} ${applications.line2}`
/** where each use case's seven seconds start */
const AT = [3.2, 9.4, 15.6]
const LEN = 6.2
const END = 21.8

/** the app window's view, in px (the stage is 940 wide) */
const VW = 940
const VH = 580
/** seconds per character: the chat types, the callouts type a little quicker */
const CHAT_STEP = 0.04
const CALL_STEP = 0.035

/** A Cool Shape as a CSS mask. Only solid shapes: one with a hole would
 *  leave a window of the old scene in the new one. */
const maskOf = (name: ShapeName) => {
  const paths = (SHAPES[name] as readonly ShapePart[])
    .map((p) => `<path d='${p.d}'${p.evenodd ? " fill-rule='evenodd'" : ''}/>`)
    .join('')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>${paths}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** A line split into words, with `chip` (if it ends the line) as one chip. */
function Words({ text, chip, className = 'cx-f-w' }: { text: string; chip?: string; className?: string }) {
  const at = chip ? text.lastIndexOf(chip) : -1
  const head = at >= 0 ? text.slice(0, at).trim() : text
  return (
    <>
      {head
        .split(' ')
        .filter(Boolean)
        .map((w, i) => (
          <span className={className} key={i}>
            {w}{' '}
          </span>
        ))}
      {at >= 0 && <span className={`${className} cx-f-chip`}>{chip}</span>}
    </>
  )
}

const fmt = (t: number) => `0:${String(Math.floor(t)).padStart(2, '0')}`

const Arrow = () => <FlyArrow size={18} strokeWidth={2} />

/* ---- the UI inside each app window (DOM and inline SVG) ------------------ */

const TICK = (
  <svg className="ai-f-tick" viewBox="0 0 24 24" aria-hidden="true">
    <path pathLength={1} d="M5 12.5 10 17.5 19 7" />
  </svg>
)

const PERSON = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="18" r="8" />
    <path d="M9 42c0-9 6.7-14 15-14s15 5 15 14z" />
  </svg>
)

const DOC_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />
  </svg>
)

const SEND_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)

/** the chat: a question types in, the answer streams, a second question routes to a person */
function AssistantUI() {
  return (
    <div className="ai-f-ui">
      <div className="ai-f-head">
        <span className="ai-f-head__dot" />
        <span className="ai-f-sk" style={{ width: 160 }} />
      </div>

      <div className="ai-f-bubble ai-f-bubble--me">
        <span className="ai-f-typed" />
        <span className="ai-f-caret" />
      </div>

      <div className="ai-f-think">
        <span />
        <span />
        <span />
      </div>

      <div className="ai-f-answer">
        {[92, 80, 88, 56].map((w) => (
          <span className="ai-f-sk" style={{ width: `${w}%` }} key={w} />
        ))}
        <span className="ai-f-src">{`↳ ${P[0].demo.source ?? ''}`}</span>
      </div>

      {[0, 1, 2].map((k) => (
        <div className={`ai-f-doc ai-f-doc--${k}`} key={k}>
          <span className="ai-f-doc__icon">{DOC_ICON}</span>
          <span className="ai-f-sk" style={{ width: '100%' }} />
          <span className="ai-f-sk" style={{ width: '78%' }} />
          <span className="ai-f-sk" style={{ width: '56%' }} />
          {k === 0 && <span className="ai-f-tickdisc">{TICK}</span>}
        </div>
      ))}

      <div className="ai-f-esc">
        <div className="ai-f-bubble">
          <span className="ai-f-sk" style={{ width: '70%' }} />
          <span className="ai-f-sk" style={{ width: '44%' }} />
        </div>
        <span className="ai-f-badge">?</span>
      </div>

      <div className="ai-f-composer">
        <span className="ai-f-sk ai-f-composer__ph" />
        <span className="ai-f-send">{SEND_ICON}</span>
      </div>

      <div className="ai-f-avatar">
        <svg viewBox="0 0 116 116" aria-hidden="true">
          <circle cx="58" cy="46" r="20" fill={INK} />
          <path d="M24 116C24 88 40 78 58 78s34 10 34 38z" fill={INK} />
        </svg>
      </div>
    </div>
  )
}

/** the invoice: a sheet is read, three regions send tokens to the checks panel, a note follows */
function DocumentUI({ demo }: { demo: AppDemo }) {
  const checks = demo.checks ?? []
  const lines: [number, number][] = [
    [94, 70],
    [120, 88],
    [146, 60],
    [172, 80],
    [198, 50],
    [224, 90],
  ]
  return (
    <div className="ai-f-ui">
      <div className="ai-f-sheet">
        <span className="ai-f-sheet__head" />
        {lines.map(([top, w]) => (
          <span className="ai-f-sk" style={{ top, width: `${w}%` }} key={top} />
        ))}
        <span className="ai-f-sheet__total" />
        <span className="ai-f-region ai-f-region--a" />
        <span className="ai-f-region ai-f-region--b" />
        <span className="ai-f-region ai-f-region--c" />
        <span className="ai-f-scan" />
      </div>

      <div className="ai-f-panel">
        <span className="ai-f-sk ai-f-panel__head" />
        {checks.map((c, k) => (
          <div className={`ai-f-row ai-f-row--${k}`} key={c.label}>
            <span className="ai-f-row__key">{c.label}</span>
            <span className="ai-f-row__val">
              {c.value}
              <span className="ai-f-tickdisc">{TICK}</span>
            </span>
          </div>
        ))}
      </div>

      <span className="ai-f-token" />
      <span className="ai-f-token" />
      <span className="ai-f-token" />

      <div className="ai-f-note">
        <span className="ai-f-note__icon">{PERSON}</span>
        {demo.note}
      </div>

      <svg className="ai-f-arrow" viewBox="0 0 940 580" aria-hidden="true">
        <path className="ai-f-arrow__line" pathLength={1} d="M620 412C616 440 612 452 610 474" />
        <path className="ai-f-arrow__head" d="M598 462L610 477L622 462" />
      </svg>
    </div>
  )
}

/** the forecast chart: a line draws itself, one reading spikes, two notes say what to do */
function DecisionUI() {
  return (
    <div className="ai-f-ui">
      <div className="ai-f-card" />
      <span className="ai-f-card__title" />
      <span className="ai-f-card__legend ai-f-card__legend--a" />
      <span className="ai-f-card__legend ai-f-card__legend--b" />
      {[170, 260, 350, 440].map((top) => (
        <span className="ai-f-grid" style={{ top }} key={top} />
      ))}

      <svg className="ai-f-chart" viewBox="0 0 940 580" aria-hidden="true">
        <path className="ai-f-chart__band" d="M720 300L800 266L860 240L860 312L800 344L720 336Z" />
        <path className="ai-f-chart__fc" d="M720 318L800 300L860 276" />
        <path
          className="ai-f-chart__solid"
          pathLength={1}
          d="M90 380L180 350L270 366L360 322L450 338L540 146L630 300L720 318"
        />
      </svg>

      <span className="ai-f-spike" />
      <span className="ai-f-mark__dot" />

      <div className="ai-f-call ai-f-call--a">
        <span className="ai-f-call__dot" />
        <span className="ai-f-typed" />
      </div>
      <div className="ai-f-call ai-f-call--b">
        <span className="ai-f-call__av">{PERSON}</span>
        <span className="ai-f-typed" />
        <span className="ai-f-tickdisc ai-f-check">{TICK}</span>
      </div>
    </div>
  )
}

export function AiFilm() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLSpanElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const syncRef = useRef<() => void>(() => {})
  const userPaused = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const tall = useTall()
  /** the frame's size: wide, or tall on an upright phone */
  const FW = tall ? H : W
  const FH = tall ? W : H

  /* ── the timeline ─────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const ctx = gsap.context(() => {
      const one = (s: string, root: Element = frame) => root.querySelector(s) as HTMLElement
      const many = (s: string, root: Element = frame) => [...root.querySelectorAll<HTMLElement>(s)]

      /* typed text is written from the timeline's own clock (see sync), so a
         seek lands on the right letters, the way the tweens do */
      const typers: ((t: number) => void)[] = []

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onUpdate: () => syncRef.current(),
        onComplete: () => {
          setPlaying(false)
          setEnded(true)
        },
      })
      tlRef.current = tl

      const sync = () => {
        const t = tl.time()
        typers.forEach((f) => f(t))
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${t / FILM_SECONDS})`
        if (timeRef.current) timeRef.current.textContent = `${fmt(t)} / ${fmt(FILM_SECONDS)}`
      }
      syncRef.current = sync

      const cam = one('.cx-f-cam')
      const flashEl = one('.cx-f-flash')
      const veil = one('.cx-f-veil')

      /* ── the editing kit ── */

      /** The next scene grows out of a Cool Shape in the middle of the frame,
       *  a ring of brand colour leading it. */
      const wipe = (from: Element, to: Element, t: number, shape: ShapeName, color: string, dur = 0.5) => {
        const mask = maskOf(shape)
        tl.set(veil, { autoAlpha: 1, backgroundColor: color, '--wipe': mask, '--m': '0px' }, t)
        tl.to(veil, { '--m': '4600px', duration: 0.42, ease: 'power3.in' }, t)
        const at = t + 0.16
        tl.set(to, { autoAlpha: 1, zIndex: 30, '--wipe': mask, '--m': '0px' }, at)
        tl.to(to, { '--m': '4600px', duration: dur, ease: 'power3.in' }, at)
        tl.set(to, { '--wipe': 'none', zIndex: 'auto' }, at + dur)
        tl.set(from, { autoAlpha: 0 }, at + dur)
        tl.set(veil, { autoAlpha: 0 }, at + dur)
      }

      /** Whip pan: both scenes travel together, smeared at the fastest point. */
      const whip = (from: Element, to: Element, t: number) => {
        const D = 0.44
        tl.to(from, { x: -FW, duration: D, ease: 'power3.inOut' }, t)
        tl.fromTo(to, { x: FW, autoAlpha: 1 }, { x: 0, duration: D, ease: 'power3.inOut', immediateRender: false }, t)
        tl.to([from, to], { filter: 'blur(30px)', duration: D / 2, ease: 'power2.in' }, t)
        tl.to([from, to], { filter: 'blur(0px)', duration: D / 2, ease: 'power2.out' }, t + D / 2)
        tl.set(from, { autoAlpha: 0 }, t + D)
      }

      const flash = (t: number, color = PAPER, dur = 2 / 30) => {
        tl.set(flashEl, { autoAlpha: 1, backgroundColor: color }, t)
        tl.set(flashEl, { autoAlpha: 0 }, t + dur)
      }

      const shake = (t: number, amp = 12) => {
        const path = [
          [1, -0.6],
          [-0.8, 0.9],
          [0.6, -0.4],
          [-0.4, 0.5],
          [0.2, -0.2],
        ]
        path.forEach(([x, y], i) =>
          tl.to(cam, { x: x * amp, y: y * amp, duration: 0.035, ease: 'none' }, t + i * 0.035),
        )
        tl.to(cam, { x: 0, y: 0, duration: 0.05, ease: 'none' }, t + path.length * 0.035)
      }

      /** words slamming in one by one, out of a blur */
      const slam = (words: Element[], t: number, step = 0.11) =>
        words.forEach((w, i) =>
          tl.from(
            w,
            { autoAlpha: 0, scale: 1.6, filter: 'blur(12px)', duration: 0.22, ease: 'power4.out' },
            t + i * step,
          ),
        )

      /** a word turning into a tilted chip */
      const chipPop = (el: Element, t: number, bg: string, tilt: number, fromFg: string) => {
        tl.fromTo(
          el,
          { backgroundColor: 'rgba(255,255,255,0)', color: fromFg, rotation: 0, scale: 1 },
          {
            backgroundColor: bg,
            color: INK,
            rotation: tilt,
            scale: 1.08,
            duration: 0.14,
            ease: 'power4.out',
            immediateRender: false,
          },
          t,
        )
        tl.to(el, { scale: 1, duration: 0.32, ease: 'back.out(3)' }, t + 0.14)
      }

      /** text typed out, one character per `step` seconds, with a caret that blinks while it types */
      const typeOn = (el: HTMLElement, text: string, t0: number, step: number, caret?: HTMLElement) => {
        const end = t0 + text.length * step
        typers.push((t) => {
          const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) / step)))
          el.textContent = text.slice(0, n)
          if (caret) {
            const on = t >= t0 && t < end + 0.3 && Math.floor((t - t0) / 0.45) % 2 === 0
            caret.style.opacity = on ? '1' : '0'
          }
        })
      }

      /** a token that flies on a curve from (sx, sy) to (ex, ey) and is absorbed */
      const flight = (tok: HTMLElement, sx: number, sy: number, ex: number, ey: number, t: number, dur: number) => {
        const cx = (sx + ex) / 2
        const cy = Math.min(sy, ey) - 120
        const p = { u: 0 }
        const place = () => {
          const u = p.u
          const v = 1 - u
          gsap.set(tok, { x: v * v * sx + 2 * v * u * cx + u * u * ex, y: v * v * sy + 2 * v * u * cy + u * u * ey })
        }
        gsap.set(tok, { xPercent: -50, yPercent: -50 })
        tl.fromTo(tok, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.15, ease: 'back.out(2)' }, t)
        tl.fromTo(p, { u: 0 }, { u: 1, duration: dur, ease: 'power2.inOut', onUpdate: place }, t)
        tl.to(tok, { autoAlpha: 0, scale: 0.4, duration: 0.15 }, t + dur - 0.05)
      }

      /* ── 0:00 intro ── */
      const intro = one('.cx-f-intro')
      const titleWords = many('.cx-f-intro__title .cx-f-w')
      slam(titleWords, 0.3, 0.12)
      chipPop(one('.cx-f-intro__title .cx-f-chip'), 0.3 + titleWords.length * 0.12 + 0.05, CITRUS, -3, PAPER)
      shake(0.3 + titleWords.length * 0.12 + 0.05, 10)
      tl.fromTo(
        one('.cx-f-intro__title'),
        { scale: 1 },
        { scale: 1.06, duration: 3, ease: 'none', immediateRender: false },
        0,
      )
      many('.cx-f-intro__shape').forEach((s, k) => {
        const from = [
          { x: -700, y: -260 },
          { x: 760, y: -300 },
          { x: 40, y: 520 },
        ][k]
        tl.fromTo(
          s,
          { ...from, scale: 0.3, rotation: -90, autoAlpha: 0 },
          { x: 0, y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.3)' },
          0.2 + k * 0.1,
        )
        tl.to(s, { rotation: k === 1 ? -60 : 60, duration: 2.2, ease: 'none' }, 1.1)
      })
      many('.cx-f-intro__name').forEach((n, k) => {
        tl.from(n, { autoAlpha: 0, y: 40, duration: 0.35, ease: 'back.out(2)' }, 1.6 + k * 0.16)
      })

      /* ── the three use cases ── */
      const scenes = many('.cx-f-proj')

      /** every scene: the glow, the index, the copy rising in, the window swinging in */
      const prelude = (sc: HTMLElement, i: number) => {
        const T = AT[i]
        tl.fromTo(
          one('.cx-f-proj__glow', sc),
          { scale: 1.25, opacity: 0.4 },
          { scale: 1, opacity: 1, duration: LEN, ease: 'none' },
          T - 0.4,
        )
        tl.from(one('.cx-f-proj__index', sc), { autoAlpha: 0, y: 30, duration: 0.4 }, T + 0.3)
        tl.from(many('.cx-f-proj__meta > *', sc), { autoAlpha: 0, x: -30, duration: 0.45, stagger: 0.08 }, T + 0.45)

        const words = many('.cx-f-proj__title .cx-f-w', sc)
        words.forEach((w, k) =>
          tl.from(w, { autoAlpha: 0, yPercent: 70, duration: 0.5, ease: 'power4.out' }, T + 0.65 + k * 0.06),
        )
        const tw = T + 0.65 + words.length * 0.06
        chipPop(one('.cx-f-proj__title .cx-f-chip', sc), tw + 0.15, toneHex(P[i].tone), -2.5, PAPER)
        shake(tw + 0.15, 9)
        tl.from(one('.cx-f-proj__body', sc), { autoAlpha: 0, y: 30, duration: 0.6 }, tw + 0.45)

        /* the copy drifts against the window: parallax */
        tl.fromTo(one('.cx-f-proj__copy', sc), { y: 0 }, { y: -16, duration: LEN - 0.4, ease: 'none' }, T + 0.4)

        /* the browser swings in, then drifts */
        const stage = one('.cx-f-proj__stage', sc)
        gsap.set(stage, { transformPerspective: 2200 })
        tl.fromTo(
          stage,
          { x: 620, rotationY: -42, rotationX: 6, autoAlpha: 0 },
          { x: 0, rotationY: -12, rotationX: 3, autoAlpha: 1, duration: 0.9, ease: 'power4.out' },
          T + 0.1,
        )
        tl.to(stage, { rotationY: -5, rotationX: 1, y: -12, duration: LEN - 1.1, ease: 'none' }, T + 1.0)
      }

      /* 0:03 assistant: a question types in, the answer streams, a second question goes to a person */
      const assistant = (sc: HTMLElement, i: number) => {
        const L = (t: number) => AT[i] + t
        const demo = P[i].demo
        const cursor = one('.cx-f-cursor', sc)
        const ring = one('.cx-f-ring', sc)
        const send = one('.ai-f-send', sc)
        const bubble = one('.ai-f-bubble--me', sc)
        const caret = one('.ai-f-caret', sc)
        const think = one('.ai-f-think', sc)
        const dots = many('.ai-f-think span', sc)
        const answer = one('.ai-f-answer', sc)
        const lines = many('.ai-f-answer .ai-f-sk', sc)
        const src = one('.ai-f-src', sc)
        const docs = many('.ai-f-doc', sc)
        const docR = [-6, 2.5, 9]
        const tick = one('.ai-f-doc--0 .ai-f-tickdisc', sc)
        const tickPath = one('.ai-f-doc--0 .ai-f-tick path', sc) as unknown as SVGPathElement
        const esc = one('.ai-f-esc', sc)
        const badge = one('.ai-f-badge', sc)
        const avatar = one('.ai-f-avatar', sc)
        const SEND = { x: 538, y: 526 }

        /* the cursor clicks send */
        gsap.set(cursor, { x: VW + 60, y: VH + 60 })
        tl.to(cursor, { x: SEND.x, y: SEND.y, duration: 0.6, ease: 'power2.inOut' }, L(0.25))
        tl.to(cursor, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, L(0.85))
        tl.to(send, { scale: 0.88, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, L(0.85))
        tl.fromTo(
          ring,
          { x: SEND.x, y: SEND.y, scale: 0.3, autoAlpha: 1 },
          { scale: 2.2, autoAlpha: 0, duration: 0.45, ease: 'power2.out', immediateRender: false },
          L(0.87),
        )
        tl.to(cursor, { x: VW + 60, y: VH + 60, duration: 0.5, ease: 'power2.in' }, L(1.25))

        /* the question */
        tl.fromTo(bubble, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, L(0.95))
        const q = demo.question ?? ''
        typeOn(one('.ai-f-typed', sc), q, L(1.05), CHAT_STEP, caret)

        /* the thinking row, then the retrieval: three documents fly in and fan out */
        tl.fromTo(
          think,
          { autoAlpha: 0, scale: 0.8 },
          { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' },
          L(2.2),
        )
        tl.to(dots, { y: -7, duration: 0.15, yoyo: true, repeat: 1, ease: 'sine.inOut', stagger: 0.08 }, L(2.45))
        tl.to(think, { autoAlpha: 0, duration: 0.15 }, L(2.9))
        docs.forEach((d, k) => {
          tl.fromTo(
            d,
            { x: 720, rotation: docR[k] - 18, autoAlpha: 0 },
            { x: 0, rotation: docR[k], autoAlpha: 1, duration: 0.7, ease: 'expo.out' },
            L(2.05 + k * 0.12),
          )
        })
        tl.fromTo(tick, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, L(2.95))
        tl.fromTo(
          tickPath,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.35, ease: 'power1.out' },
          L(3.0),
        )

        /* the answer grows and streams in, then its source pops on */
        tl.fromTo(
          answer,
          { autoAlpha: 0, y: 16, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' },
          L(2.95),
        )
        lines.forEach((ln, k) =>
          tl.fromTo(ln, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, L(3.25 + k * 0.12)),
        )
        tl.fromTo(
          src,
          { autoAlpha: 0, scale: 0.6 },
          { autoAlpha: 1, scale: 1, duration: 0.42, ease: 'back.out(2)' },
          L(3.96),
        )

        /* a question nobody can answer slides off to a person, who pulses */
        tl.fromTo(esc, { autoAlpha: 0, x: 70 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out' }, L(4.5))
        tl.fromTo(badge, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, L(4.72))
        tl.to(esc, { x: 420, y: 56, scale: 0.35, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, L(5.0))
        tl.to(avatar, { scale: 1.12, duration: 0.16, yoyo: true, repeat: 1, ease: 'sine.inOut' }, L(5.5))
      }

      /* 0:09 document: the invoice is read, three checks light up, a note follows */
      const documentScene = (sc: HTMLElement, i: number) => {
        const L = (t: number) => AT[i] + t
        const sheet = one('.ai-f-sheet', sc)
        const scan = one('.ai-f-scan', sc)
        const regions = [one('.ai-f-region--a', sc), one('.ai-f-region--b', sc), one('.ai-f-region--c', sc)]
        const panel = one('.ai-f-panel', sc)
        const rows = many('.ai-f-row', sc)
        const ticks = many('.ai-f-row .ai-f-tickdisc', sc)
        const tickPaths = many('.ai-f-row .ai-f-tick path', sc) as unknown as SVGPathElement[]
        const tokens = many('.ai-f-token', sc)
        const note = one('.ai-f-note', sc)
        const arrowLine = one('.ai-f-arrow__line', sc) as unknown as SVGPathElement
        const arrowHead = one('.ai-f-arrow__head', sc) as unknown as SVGPathElement

        /* the invoice drops in, rotated, and settles */
        tl.fromTo(
          sheet,
          { y: -560, rotation: -14, autoAlpha: 0 },
          { y: 0, rotation: -1.5, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.1)' },
          L(0.2),
        )
        tl.fromTo(panel, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, L(0.3))

        /* the scan beam sweeps top to bottom, twice */
        tl.fromTo(scan, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05, ease: 'none' }, L(1.2))
        tl.fromTo(scan, { y: -56 }, { y: 400, duration: 0.8, ease: 'none', repeat: 1 }, L(1.2))
        tl.fromTo(scan, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.05, ease: 'none' }, L(2.85))

        /* each region lights, and a token flies from it to its row */
        const HL = [1.3, 2.1, 2.85]
        const SRC = [
          [342, 192],
          [342, 244],
          [342, 406],
        ]
        const ROW_Y = [214, 288, 362]
        const FLY = [1.45, 2.25, 3.05]
        regions.forEach((r, k) =>
          tl.fromTo(r, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' }, L(HL[k])),
        )
        tokens.forEach((tok, k) => flight(tok, SRC[k][0], SRC[k][1], 532, ROW_Y[k], L(FLY[k]), 0.75))

        /* the matching row lights up and its tick draws */
        rows.forEach((row, k) => {
          const t = L(FLY[k] + 0.75)
          tl.to(row, { opacity: 1, backgroundColor: 'rgba(209,231,255,0.75)', duration: 0.3, ease: 'power2.out' }, t)
          tl.fromTo(ticks[k], { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.1)
          tl.fromTo(
            tickPaths[k],
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.35, ease: 'power1.out' },
            t + 0.18,
          )
        })

        /* the note pops below, an arrow draws from the panel to it, the panel pushes in */
        tl.fromTo(
          note,
          { autoAlpha: 0, scale: 0.6 },
          { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
          L(4.25),
        )
        tl.fromTo(
          arrowLine,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.45, ease: 'power2.inOut' },
          L(4.5),
        )
        tl.fromTo(arrowHead, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, L(4.9))
        tl.to(panel, { scale: 1.04, duration: 1.1, ease: 'power2.inOut' }, L(4.4))
      }

      /* 0:16 decision: a forecast draws, one reading spikes, the camera pushes in, two notes */
      const decision = (sc: HTMLElement, i: number) => {
        const L = (t: number) => AT[i] + t
        const demo = P[i].demo
        const view = one('.cx-f-proj__view', sc)
        const card = one('.ai-f-card', sc)
        const title = one('.ai-f-card__title', sc)
        const legends = many('.ai-f-card__legend', sc)
        const grids = many('.ai-f-grid', sc)
        const band = one('.ai-f-chart__band', sc)
        const fc = one('.ai-f-chart__fc', sc)
        const solid = one('.ai-f-chart__solid', sc) as unknown as SVGPathElement
        const dot = one('.ai-f-mark__dot', sc)
        const ring = one('.ai-f-spike', sc)
        const cursor = one('.cx-f-cursor', sc)
        const cring = one('.cx-f-ring', sc)
        const SPIKE = { x: 540, y: 146 }
        const [ca, cb] = many('.ai-f-call', sc)
        const check = one('.ai-f-check', sc)
        const checkPath = one('.ai-f-check path', sc) as unknown as SVGPathElement

        /* the card, its grid, and the title row */
        tl.fromTo(card, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, L(0.1))
        tl.fromTo(title, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, L(0.25))
        legends.forEach((l, k) => tl.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, L(0.35 + k * 0.1)))
        grids.forEach((g, k) =>
          tl.fromTo(g, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, L(0.3 + k * 0.1)),
        )

        /* the line draws itself, then the forecast and its band extend */
        tl.fromTo(solid, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' }, L(0.9))
        tl.fromTo([band, fc], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, L(2.6))

        /* the spike pops coral, with rings */
        tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, L(2.2))
        tl.fromTo(
          ring,
          { scale: 0.5, autoAlpha: 0.9 },
          { scale: 2.6, autoAlpha: 0, duration: 0.5, ease: 'power2.out', repeat: 2, repeatDelay: 0.05 },
          L(2.25),
        )

        /* the camera pushes in toward the spike; the cursor goes to it and clicks */
        gsap.set(view, { transformOrigin: `${SPIKE.x}px ${SPIKE.y}px` })
        tl.to(view, { scale: 1.12, duration: 1.2, ease: 'power2.inOut' }, L(2.4))
        gsap.set(cursor, { x: VW + 60, y: VH + 60 })
        tl.to(cursor, { x: SPIKE.x, y: SPIKE.y, duration: 0.75, ease: 'power2.inOut' }, L(2.5))
        tl.to(cursor, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, L(3.25))
        tl.fromTo(
          cring,
          { x: SPIKE.x, y: SPIKE.y, scale: 0.3, autoAlpha: 1 },
          { scale: 2.2, autoAlpha: 0, duration: 0.45, ease: 'power2.out', immediateRender: false },
          L(3.27),
        )
        tl.to(cursor, { x: VW + 60, y: VH + 60, duration: 0.5, ease: 'power2.in' }, L(3.7))

        /* the first note types; the second slides in from the right, types, and ends on a check */
        tl.fromTo(
          ca,
          { autoAlpha: 0, y: 24, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' },
          L(3.45),
        )
        typeOn(one('.ai-f-typed', ca), (demo.lines ?? [])[0] ?? '', L(3.55), CALL_STEP)
        tl.fromTo(cb, { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out' }, L(4.45))
        typeOn(one('.ai-f-typed', cb), (demo.lines ?? [])[1] ?? '', L(4.85), CALL_STEP)
        tl.fromTo(check, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, L(5.8))
        tl.fromTo(
          checkPath,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.25, ease: 'power1.out' },
          L(5.82),
        )
      }

      scenes.forEach((sc, i) => {
        prelude(sc, i)
        if (P[i].kind === 'assistant') assistant(sc, i)
        else if (P[i].kind === 'document') documentScene(sc, i)
        else decision(sc, i)
      })

      wipe(intro, scenes[0], AT[0] - 0.55, 'cross-1', BLOSSOM)
      whip(scenes[0], scenes[1], AT[1] - 0.44)
      wipe(scenes[1], scenes[2], AT[2] - 0.55, 'flower-13', CITRUS)

      /* ── 0:22 the cards: the last frame, and every card a link ── */
      const end = one('.cx-f-end')
      tl.to(scenes[2], { scale: 1.2, filter: 'blur(8px)', duration: 0.3, ease: 'power3.in' }, END - 0.3)
      flash(END, PAPER, 3 / 30)
      tl.set(scenes[2], { autoAlpha: 0 }, END + 0.05)
      tl.set(end, { autoAlpha: 1 }, END + 0.05)
      tl.to(one('.cx-f-grain'), { opacity: 0, duration: 0.4 }, END)
      tl.from(
        many('.cx-f-end__head > *'),
        { autoAlpha: 0, y: 50, duration: 0.6, stagger: 0.1, ease: 'power4.out' },
        END + 0.15,
      )
      many('.cx-f-end__card').forEach((c, k) => {
        const t = END + 0.35 + k * 0.16
        tl.from(c, { autoAlpha: 0, y: 160, rotation: [-4, 2, 4][k], duration: 0.85, ease: 'back.out(1.2)' }, t)
        tl.fromTo(one('.ai-f-end__art', c), { scale: 1.3 }, { scale: 1, duration: 1.4, ease: 'power3.out' }, t)
        tl.from(
          many('.cx-f-end__meta, .cx-f-end__title, .cx-f-end__body, .cx-f-end__view', c),
          { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.08 },
          t + 0.45,
        )
        tl.from(
          one('.cx-f-end__go', c),
          { autoAlpha: 0, scale: 0, rotation: -90, duration: 0.5, ease: 'back.out(2.4)' },
          t + 0.7,
        )
      })
      tl.from(one('.ai-f-end__lead'), { autoAlpha: 0, y: 24, duration: 0.5 }, END + 1.2)

      /* ── film grain, 12 fps ── */
      const grain = one('.cx-f-grain')
      const g = { t: 0 }
      tl.fromTo(
        g,
        { t: 0 },
        {
          t: FILM_SECONDS,
          duration: FILM_SECONDS,
          ease: 'none',
          immediateRender: false,
          onUpdate: () => {
            const f = Math.floor(g.t * 12)
            grain.style.transform = `translate(${((f * 137) % 300) - 150}px, ${((f * 71) % 300) - 150}px)`
          },
        },
        0,
      )
    }, frame)

    return () => {
      tlRef.current = null
      ctx.revert()
    }
  }, [tall, FW])

  /* ── fit the 1920 x 1080 frame to its window ──────────────────────────── */
  const fitRef = useRef<() => void>(() => {})
  useLayoutEffect(() => {
    const screen = screenRef.current
    const frame = frameRef.current
    if (!screen || !frame) return
    const fit = () => {
      const w = screen.clientWidth
      const h = screen.clientHeight
      if (!w || !h) return
      /* landscape fills the window (the frame keeps a safe area for the
         crop); portrait shows the whole frame */
      if (tall) {
        /* upright: the tall frame takes the screen's own proportions (the
           words are pinned to its top, the browser to its bottom), so it
           fills the screen edge to edge without cropping either */
        const fh = Math.round(Math.min(2600, Math.max(1500, (FW * h) / w)))
        frame.style.height = `${fh}px`
        frame.style.setProperty('--film-scale', String(Math.min(w / FW, h / fh)))
        return
      }
      frame.style.removeProperty('height')
      const s = w / h >= 1.25 ? Math.max(w / FW, h / FH) : Math.min(w / FW, h / FH)
      frame.style.setProperty('--film-scale', String(s))
    }
    fitRef.current = fit
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(screen)
    return () => ro.disconnect()
  }, [FW, FH, tall])

  /* ── how it arrives, and when it plays ─────────────────────────────────── */
  useLayoutEffect(() => {
    const section = sectionRef.current
    const tl = tlRef.current
    if (!section || !tl) return

    const start = () => {
      if (userPaused.current || tl.progress() >= 1 || tl.isActive()) return
      section.dataset.state = 'rolling'
      tl.play()
      setPlaying(true)
    }
    const stop = () => {
      if (!tl.isActive()) return
      tl.pause()
      setPlaying(false)
    }

    /* the screens are well below the fold; decode them before the first cut */
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        section.querySelectorAll('img').forEach((i) => i.decode().catch(() => undefined))
        near.disconnect()
      },
      { rootMargin: '1400px 0px' },
    )
    near.observe(section)

    const mm = gsap.matchMedia()
    mm.add(
      /* "always" is there because matchMedia only runs this when at least
         one condition matches; phones with motion allowed match neither of
         the other two and still need the band's autoplay */
      { open: OPEN, reduce: '(prefers-reduced-motion: reduce)', always: 'all' },
      (ctx) => {
        const { open, reduce } = ctx.conditions as { open: boolean; reduce: boolean }

        /* reduced motion: wait on the cards, play on request */
        if (reduce) {
          tl.progress(1)
          syncRef.current()
          setEnded(true)
          return
        }

        /* phones, short or portrait windows: a 16:9 band that plays when
           most of it is on screen */
        if (!open) {
          const io = new IntersectionObserver(([e]) => (e.intersectionRatio >= 0.55 ? start() : stop()), {
            threshold: [0, 0.55],
          })
          io.observe(section)
          return () => io.disconnect()
        }

        /* Big screens: section 2 hands over black to black, and the film
           arrives inside a sky clover, the shape of section 2's last point.
           The scroll grows the clover (exponentially, so it feels like one
           steady push) until it covers the screen; the film starts the
           instant it is full, and the page then holds a while. */
        section.dataset.mode = 'open'
        const pin = pinRef.current!
        const win = windowRef.current!
        const halo = haloRef.current!
        const tag = tagRef.current!
        const controls = controlsRef.current!
        const ease = gsap.parseEase('power1.inOut')
        const state = { p: 0 }
        let inZone = false
        win.style.setProperty('--clover', maskOf('clover-1'))

        const apply = () => {
          const vw = pin.clientWidth
          const vh = pin.clientHeight
          const s0 = Math.min(vw, vh) * 0.5
          const s1 = Math.max(vw, vh) * 2.6
          const e = ease(state.p)
          const s = s0 * Math.pow(s1 / s0, e)
          const full = state.p > 0.995
          win.style.setProperty('--ms', `${s}px`)
          win.dataset.full = full ? 'true' : 'false'
          halo.style.width = `${s * 1.07}px`
          halo.style.opacity = String(Math.max(0, 1 - e * 1.6))
          tag.style.top = `${vh / 2 + s / 2 + 30}px`
          tag.style.opacity = String(Math.max(0, 1 - state.p * 3))
          controls.dataset.shown = full ? 'true' : 'false'
          fitRef.current()
          if (full && inZone) start()
        }
        apply()

        gsap.to(state, {
          p: 1,
          ease: 'none',
          onUpdate: apply,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * GROW}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
        /* from fully open until most of it has scrolled away */
        ScrollTrigger.create({
          trigger: section,
          start: () => `top+=${window.innerHeight * GROW} top`,
          end: 'bottom 55%',
          invalidateOnRefresh: true,
          onToggle: (self) => {
            inZone = self.isActive
            if (!inZone) stop()
            else if (state.p > 0.995) start()
          },
        })
        window.addEventListener('resize', apply)

        return () => {
          window.removeEventListener('resize', apply)
          delete section.dataset.mode
          ;[win, halo, tag, controls].forEach((el) => el.removeAttribute('style'))
          delete controls.dataset.shown
          delete win.dataset.full
          fitRef.current()
        }
      },
      section,
    )

    return () => {
      mm.revert()
      near.disconnect()
    }
  }, [tall])

  /* While the film plays, the bar steps out of the way: it hides after two
     seconds without the mouse moving, and any movement (or a tap) brings it
     back. Paused or finished, it stays. */
  const [idle, setIdle] = useState(false)
  useLayoutEffect(() => {
    const pin = pinRef.current
    if (!pin) return
    if (!playing) {
      setIdle(false)
      return
    }
    let timer = 0
    const wake = () => {
      setIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdle(true), 2000)
    }
    wake()
    pin.addEventListener('pointermove', wake)
    pin.addEventListener('pointerdown', wake)
    pin.addEventListener('focusin', wake)
    return () => {
      window.clearTimeout(timer)
      pin.removeEventListener('pointermove', wake)
      pin.removeEventListener('pointerdown', wake)
      pin.removeEventListener('focusin', wake)
    }
  }, [playing])

  const toggle = () => {
    const tl = tlRef.current
    if (!tl) return
    sectionRef.current?.setAttribute('data-state', 'rolling')
    if (ended) {
      userPaused.current = false
      setEnded(false)
      tl.restart()
      setPlaying(true)
    } else if (playing) {
      userPaused.current = true
      tl.pause()
      setPlaying(false)
    } else {
      userPaused.current = false
      tl.play()
      setPlaying(true)
    }
  }

  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const tl = tlRef.current
    if (!tl) return
    const r = e.currentTarget.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    tl.progress(p)
    syncRef.current()
    setEnded(p >= 1)
  }

  return (
    <section
      className="cx-film"
      id="applications"
      ref={sectionRef}
      data-state="waiting"
      data-idle={idle && playing && !ended ? 'true' : undefined}
      data-umm-theme="ink"
      aria-labelledby="ai-film-title"
    >
      <h2 className="umm-sr-only" id="ai-film-title">
        {TITLE}
      </h2>
      <ul className="umm-sr-only">
        {P.map((item) => (
          <li key={item.label}>
            {item.label}: <a href={item.link.href}>{item.link.label}</a>
          </li>
        ))}
      </ul>

      <div className="cx-film__pin" ref={pinRef}>
        <div className="cx-film__halo" ref={haloRef} aria-hidden="true">
          <Shape name="clover-1" tone="sky" />
        </div>

        <div className="cx-film__window" ref={windowRef}>
          <div className="cx-film__screen" ref={screenRef}>
            <div className="cx-film__frame" ref={frameRef} data-tall={tall || undefined} aria-hidden="true">
              <div className="cx-f-cam">
                {/* 0:00 */}
                <div className="cx-f-scene cx-f-intro">
                  {(['cross-1', 'flower-13', 'clover-1'] as ShapeName[]).map((s, k) => (
                    <Shape
                      key={s}
                      name={s}
                      tone={(['citrus', 'blossom', 'sky'] as const)[k]}
                      className={`cx-f-intro__shape cx-f-intro__shape--${k}`}
                    />
                  ))}
                  <p className="cx-f-eyebrow">
                    <span className="cx-f-eyebrow__mark" />
                    {applications.chip}
                  </p>
                  <p className="cx-f-intro__title">
                    <Words text={TITLE} chip={applications.accent} />
                  </p>
                  <p className="cx-f-intro__names">
                    {P.map((item) => (
                      <span className="cx-f-intro__name" key={item.label}>
                        {item.label}
                      </span>
                    ))}
                  </p>
                </div>

                {/* 0:03 – 0:22: the three use cases */}
                {P.map((item, i) => (
                  <div className={`cx-f-scene cx-f-proj ai-f-scene ai-f-scene--${item.kind}`} key={item.label}>
                    <div className="cx-f-proj__glow" />
                    <span className="cx-f-proj__index">
                      {String(i + 1).padStart(2, '0')} / {String(P.length).padStart(2, '0')}
                    </span>
                    <div className="cx-f-proj__copy">
                      <p className="cx-f-proj__meta">
                        <span>{item.area}</span>
                        <span className="cx-f-proj__type">{item.label}</span>
                      </p>
                      <p className="cx-f-proj__title">
                        <Words text={item.title} chip={item.chip} />
                      </p>
                      <p className="cx-f-proj__body">{item.body}</p>
                    </div>
                    <div className="cx-f-proj__stage">
                      <div className="cx-f-proj__bar">
                        <i />
                        <i />
                        <i />
                        <span />
                      </div>
                      <div className="cx-f-proj__view">
                        {item.kind === 'assistant' && <AssistantUI />}
                        {item.kind === 'document' && <DocumentUI demo={item.demo} />}
                        {item.kind === 'decision' && <DecisionUI />}
                        {item.kind !== 'document' && (
                          <>
                            <span className="cx-f-ring" />
                            <svg className="cx-f-cursor" viewBox="0 0 32 36" aria-hidden="true">
                              <path d="M3 2 3 30 10.5 23 15.5 34 21 31.5 16 20.5 26.5 20.5Z" />
                            </svg>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 0:22 — the last frame */}
                <div className="cx-f-scene cx-f-end ai-f-end">
                  <div className="cx-f-end__head">
                    <p className="cx-f-end__eyebrow">{applications.chip}</p>
                    <p className="cx-f-end__h">{TITLE}</p>
                    <p className="ai-f-end__lead">{applications.lead}</p>
                  </div>
                  <div className="cx-f-end__cards">
                    {P.map((item) => (
                      <a className="cx-f-end__card" key={item.label} href={item.link.href} tabIndex={-1}>
                        <span className="cx-f-end__img ai-f-end__tone" data-umm-tone={item.tone}>
                          <span className="ai-f-end__art ai-app__vig">
                            <Vignette item={item} />
                          </span>
                          <span className="cx-f-end__go">
                            <Arrow />
                          </span>
                        </span>
                        <span className="cx-f-end__meta">
                          <span>{item.area}</span>
                          <span>{item.tag}</span>
                        </span>
                        <span className="cx-f-end__title">{item.title}</span>
                        <span className="cx-f-end__body">{item.body}</span>
                        <span className="cx-f-end__view">
                          {item.link.label}
                          <Arrow />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* the colour that leads a shape wipe */}
                <div className="cx-f-veil" />
              </div>

              <div className="cx-f-flash" />
              <div className="cx-f-grain" />
            </div>
          </div>
        </div>

        <span className="cx-film__tag" ref={tagRef} data-umm-tone="sky" aria-hidden="true">
          {applications.chip}
        </span>

        <div className="cx-film__controls" ref={controlsRef}>
          <button
            type="button"
            className="cx-film__play"
            onClick={toggle}
            aria-label={ended ? 'Play the film again' : playing ? 'Pause the film' : 'Play the film'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {ended ? (
                <path
                  d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : playing ? (
                <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
              ) : (
                <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
              )}
            </svg>
          </button>
          <div className="cx-film__bar" onClick={seek} role="presentation">
            <span className="cx-film__fill" ref={fillRef} />
          </div>
          <span className="cx-film__time" ref={timeRef}>
            0:00 / 0:24
          </span>
        </div>
      </div>

      {/* the scroll the clover opens over, and the hold after it */}
      <div className="cx-film__runway" aria-hidden="true" />
    </section>
  )
}
