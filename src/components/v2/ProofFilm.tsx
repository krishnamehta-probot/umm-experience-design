import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { film as cxFilm } from '@/content/cxUiDesign'
import type { ShapeName } from './shapes.data'
import { Shape } from './Shape'
import { maskOf } from './filmOpen'
import { useFilmVideo } from './useFilmVideo'
import { FlyArrow } from '../primitives'

/* ============================================================================
   3 · SELECTED WORK — a 30-second film of three real projects

   Plays like a cut film, not a web section: one GSAP timeline, exactly 30
   seconds, on a fixed 1920 x 1080 frame scaled to the screen, so every cut
   lands on the same frame on a laptop, a monitor and in the MP4 export.

     0:00  intro     "The work makes the case." slams in word by word, the
                     three shapes from section 2 spin through, the three
                     client names flash
     0:03  TFP       the real work, playing like a screen recording in a
     0:10  Fintuit   browser beside the project's line: Twins for Peace's
     0:17  Licuido   live Shopify store (home → the Legacy collection →
                     products → Luther), Fintuit's banking site (personal
                     home → smart money → wealth → business, from the XD
                     prototype), Licuido's live homepage scrolling through
     0:25  the cards the last frame: the three projects as cards, the way
                     the approved design shows them (the case-study
                     images live only here). Every card is a real link to
                     its case study, with "Explore all projects".

   Cuts: Cool Shape wipes led by a ring of brand colour, whip pans with
   motion blur, flash frames, camera shake on the slams, slow push-ins,
   12 fps film grain.

   On big screens and upright phones the film arrives inside section 2's
   last shape (the sky clover): it lifts off that point, glides to the
   middle, starts the film inside it and grows until it fills the screen,
   all on one scroll gesture (filmOpen.ts). Phones on their side get a 16:9
   band that plays on screen. Reduced motion: it waits on the cards. Screen readers
   get the projects as a list of links.
   ========================================================================== */

const W = 1920
const H = 1080
export const FILM_SECONDS = 30

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

const INK = '#100e14'
const PAPER = '#ffffff'
const CITRUS = '#f0ff70'
const CORAL = '#ffc3c4'
const SKY = '#d1e7ff'

/** The project screens (public/work), from wherever the page is served:
 *  the site's root, or a relative base when the page is bundled elsewhere. */
const WORK = `${import.meta.env.BASE_URL}work/`
/** where each project's seven seconds start */
const AT = [3.2, 10.4, 17.6]
const LEN = 7.2
const END = 24.8
/** the cards in the video have settled (the explore button's pop is the
 *  last to land, at END + 2.15): the live cards take over from here */
const CARDS_AT = END + 2.3
/** the film's two cuts (scripts/render-film.mjs): film/<cut>-wide.mp4 and
 *  film/<cut>-tall.mp4 */
const VIDEO = `${import.meta.env.BASE_URL}film/`

/** Each project's real screens, in the order they play. A project in PAGES
 *  is its live homepage as one long capture (site.webp) that scrolls,
 *  resting at each stop (yPercent of the capture); the others are screen
 *  flows, with where the cursor clicks to get to the next one (share of the
 *  view). */
export type Flow = { src: string; click?: [number, number] }[]
export type FilmContent = typeof cxFilm
const CX_PAGES: Record<string, number[]> = {
  licuido: [-18.5, -37, -60.5, -74],
}
const CX_FLOWS: Record<string, Flow> = {
  tfp: [
    { src: 's0', click: [0.164, 0.715] },
    { src: 's1', click: [0.231, 0.542] },
    { src: 's2', click: [0.5, 0.82] },
    { src: 's3' },
  ],
  fintuit: [{ src: 'p0', click: [0.5, 0.54] }, { src: 'p1', click: [0.235, 0.457] }, { src: 'p2' }, { src: 'p3' }],
}

/** A line split into words, with `chip` (if it ends the line) as one chip. */
function Words({ text, chip, className = 'cx-f-w' }: { text: string; chip?: string; className?: string }) {
  const at = chip ? text.lastIndexOf(chip) : -1
  const head = at >= 0 ? text.slice(0, at).trim() : text
  return (
    <>
      {head.split(' ').filter(Boolean).map((w, i) => (
        <span className={className} key={i}>
          {w}{' '}
        </span>
      ))}
      {at >= 0 && <span className={`${className} cx-f-chip`}>{chip}</span>}
    </>
  )
}

const Arrow = () => <FlyArrow size={18} strokeWidth={2} />

/**
 * The film. The CX page's by default; the Cloud & Data page passes its own
 * three projects (`content`), their screens (`flows`, `pages`, by project
 * id) and the name of its exported cuts (`cut`). The timing, the cuts and
 * the last frame are the same for every page.
 */
export function ProofFilm({
  mode = 'page',
  tall: tallCut = false,
  content: film = cxFilm,
  flows: FLOWS = CX_FLOWS,
  pages: PAGES = CX_PAGES,
  cut = 'cx',
}: {
  mode?: 'page' | 'render'
  tall?: boolean
  content?: FilmContent
  flows?: Record<string, Flow>
  pages?: Record<string, number[]>
  cut?: string
}) {
  const P = film.projects
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const tallScreen = useTall(mode === 'page')
  /** the page follows the screen; the export is told which cut it makes */
  const tall = mode === 'render' ? tallCut : tallScreen
  /** the frame's size: wide, or tall on an upright phone */
  const FW = tall ? H : W
  const FH = tall ? W : H

  /* ── the timeline: the coded film, which the export records ─────────── */
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame || mode !== 'render') return

    const ctx = gsap.context(() => {
      const one = (s: string, root: Element = frame) => root.querySelector(s) as HTMLElement
      const many = (s: string, root: Element = frame) => [...root.querySelectorAll<HTMLElement>(s)]

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      tlRef.current = tl

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
        /* the reveal is its own set: carried as a from-only value in the
           fromTo, a pause or rewind across the cut could skip it, and the
           next scene slid in invisible (a black frame until the next cut) */
        tl.set(to, { autoAlpha: 1 }, t)
        tl.fromTo(to, { x: FW }, { x: 0, duration: D, ease: 'power3.inOut', immediateRender: false }, t)
        tl.to([from, to], { filter: 'blur(30px)', duration: D / 2, ease: 'power2.in' }, t)
        tl.to([from, to], { filter: 'blur(0px)', duration: D / 2, ease: 'power2.out' }, t + D / 2)
        tl.set(from, { autoAlpha: 0 }, t + D)
      }

      const flash = (t: number, color = PAPER, dur = 2 / 30) => {
        tl.set(flashEl, { autoAlpha: 1, backgroundColor: color }, t)
        tl.set(flashEl, { autoAlpha: 0 }, t + dur)
      }

      const shake = (t: number, amp = 12) => {
        const path = [[1, -0.6], [-0.8, 0.9], [0.6, -0.4], [-0.4, 0.5], [0.2, -0.2]]
        path.forEach(([x, y], i) => tl.to(cam, { x: x * amp, y: y * amp, duration: 0.035, ease: 'none' }, t + i * 0.035))
        tl.to(cam, { x: 0, y: 0, duration: 0.05, ease: 'none' }, t + path.length * 0.035)
      }

      /** words slamming in one by one, out of a blur */
      const slam = (words: Element[], t: number, step = 0.11) =>
        words.forEach((w, i) =>
          tl.from(w, { autoAlpha: 0, scale: 1.6, filter: 'blur(12px)', duration: 0.22, ease: 'power4.out' }, t + i * step),
        )

      /** a word turning into a tilted chip */
      const chipPop = (el: Element, t: number, bg: string, tilt: number, fromFg: string) => {
        tl.fromTo(
          el,
          { backgroundColor: 'rgba(255,255,255,0)', color: fromFg, rotation: 0, scale: 1 },
          { backgroundColor: bg, color: INK, rotation: tilt, scale: 1.08, duration: 0.14, ease: 'power4.out', immediateRender: false },
          t,
        )
        tl.to(el, { scale: 1, duration: 0.32, ease: 'back.out(3)' }, t + 0.14)
      }

      /* ── 0:00 intro ── */
      const intro = one('.cx-f-intro')
      const titleWords = many('.cx-f-intro__title .cx-f-w')
      slam(titleWords, 0.3, 0.12)
      chipPop(one('.cx-f-intro__title .cx-f-chip'), 0.3 + titleWords.length * 0.12 + 0.05, CITRUS, -3, PAPER)
      shake(0.3 + titleWords.length * 0.12 + 0.05, 10)
      tl.fromTo(one('.cx-f-intro__title'), { scale: 1 }, { scale: 1.06, duration: 3, ease: 'none', immediateRender: false }, 0)
      many('.cx-f-intro__shape').forEach((s, k) => {
        const from = [{ x: -700, y: -260 }, { x: 760, y: -300 }, { x: 40, y: 520 }][k]
        tl.fromTo(s, { ...from, scale: 0.3, rotation: -90, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.3)' }, 0.2 + k * 0.1)
        tl.to(s, { rotation: k === 1 ? -60 : 60, duration: 2.2, ease: 'none' }, 1.1)
      })
      many('.cx-f-intro__name').forEach((n, k) => {
        tl.from(n, { autoAlpha: 0, y: 40, duration: 0.35, ease: 'back.out(2)' }, 1.6 + k * 0.16)
      })

      /* ── 0:03 the three projects: the real work, playing ── */
      const scenes = many('.cx-f-proj')
      scenes.forEach((sc, i) => {
        const T = AT[i]
        const id = P[i].id
        tl.fromTo(one('.cx-f-proj__glow', sc), { scale: 1.25, opacity: 0.4 }, { scale: 1, opacity: 1, duration: LEN, ease: 'none' }, T - 0.4)
        tl.from(one('.cx-f-proj__index', sc), { autoAlpha: 0, y: 30, duration: 0.4 }, T + 0.3)
        tl.from(many('.cx-f-proj__meta > *', sc), { autoAlpha: 0, x: -30, duration: 0.45, stagger: 0.08 }, T + 0.45)

        const words = many('.cx-f-proj__title .cx-f-w', sc)
        words.forEach((w, k) => tl.from(w, { autoAlpha: 0, yPercent: 70, duration: 0.5, ease: 'power4.out' }, T + 0.65 + k * 0.06))
        const tw = T + 0.65 + words.length * 0.06
        chipPop(one('.cx-f-proj__title .cx-f-chip', sc), tw + 0.15, [SKY, CITRUS, CORAL][i], -2.5, PAPER)
        shake(tw + 0.15, 9)
        tl.from(one('.cx-f-proj__body', sc), { autoAlpha: 0, y: 30, duration: 0.6 }, tw + 0.45)

        /* the browser swings in, then drifts */
        const stage = one('.cx-f-proj__stage', sc)
        gsap.set(stage, { transformPerspective: 2200 })
        tl.fromTo(stage, { x: 620, rotationY: -42, rotationX: 6, autoAlpha: 0 }, { x: 0, rotationY: -12, rotationX: 3, autoAlpha: 1, duration: 0.9, ease: 'power4.out' }, T + 0.1)
        tl.to(stage, { rotationY: -5, rotationX: 1, y: -12, duration: LEN - 1.1, ease: 'none' }, T + 1.0)

        if (PAGES[id]) {
          /* the live homepage scrolls through, resting on each section */
          const page = one('.cx-f-proj__page', sc)
          PAGES[id].forEach((y, k) => {
            tl.to(page, { yPercent: y, duration: 0.85, ease: 'power2.inOut' }, T + 1.9 + k * 1.2)
          })
          return
        }

        /* a screen flow: the cursor clicks, the next screen comes up */
        const shots = many('.cx-f-proj__shot', sc)
        const cursor = one('.cx-f-cursor', sc)
        const ring = one('.cx-f-ring', sc)
        const VW = 940
        const VH = 580
        gsap.set(shots.slice(1), { autoAlpha: 0 })
        gsap.set(cursor, { x: VW + 60, y: VH + 60 })
        const flow = FLOWS[id]
        const step = (LEN - 2.2) / (flow.length - 1)
        flow.forEach((_, k) => {
          if (k === 0) return
          const at = T + 1.6 + (k - 1) * step
          const prev = flow[k - 1]
          if (prev.click) {
            const [cx, cy] = prev.click
            tl.to(cursor, { x: cx * VW, y: cy * VH, duration: 0.55, ease: 'power2.inOut' }, at - 0.75)
            tl.to(cursor, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, at - 0.18)
            tl.set(ring, { x: cx * VW, y: cy * VH }, at - 0.15)
            tl.fromTo(ring, { scale: 0.3, autoAlpha: 1 }, { scale: 2.2, autoAlpha: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, at - 0.15)
          }
          tl.fromTo(shots[k], { autoAlpha: 0, scale: 1.03, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, at)
          tl.set(shots[k - 1], { autoAlpha: 0 }, at + 0.35)
        })
        tl.to(cursor, { x: VW + 60, y: VH + 60, duration: 0.6, ease: 'power2.in' }, T + LEN - 1.2)
      })

      wipe(intro, scenes[0], AT[0] - 0.55, 'cross-1', SKY)
      whip(scenes[0], scenes[1], AT[1] - 0.44)
      wipe(scenes[1], scenes[2], AT[2] - 0.55, 'flower-13', CORAL)

      /* ── 0:25 the cards: the last frame, and every card a link ── */
      const end = one('.cx-f-end')
      tl.to(scenes[2], { scale: 1.2, filter: 'blur(8px)', duration: 0.3, ease: 'power3.in' }, END - 0.3)
      flash(END, PAPER, 3 / 30)
      tl.set(scenes[2], { autoAlpha: 0 }, END + 0.05)
      tl.set(end, { autoAlpha: 1 }, END + 0.05)
      tl.to(one('.cx-f-grain'), { opacity: 0, duration: 0.4 }, END)
      /* the head's words; the explore button has its own pop below (two
         from() tweens on one element left it hidden at the end) */
      tl.from(many('.cx-f-end__head > :not(.cx-f-end__explore)'), { autoAlpha: 0, y: 50, duration: 0.6, stagger: 0.1, ease: 'power4.out' }, END + 0.15)
      many('.cx-f-end__card').forEach((c, k) => {
        const t = END + 0.35 + k * 0.16
        tl.from(c, { autoAlpha: 0, y: 160, rotation: [-4, 2, 4][k], duration: 0.85, ease: 'back.out(1.2)' }, t)
        tl.fromTo(one('.cx-f-end__img img', c), { scale: 1.3 }, { scale: 1, duration: 1.4, ease: 'power3.out', immediateRender: false }, t)
        tl.from(many('.cx-f-end__meta, .cx-f-end__title, .cx-f-end__body, .cx-f-end__view', c), { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.08 }, t + 0.45)
      })
      tl.from(one('.cx-f-end__explore'), { autoAlpha: 0, scale: 0.6, duration: 0.55, ease: 'back.out(2)' }, END + 1.6)

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
  }, [tall, FW, mode])

  /* ── fit the 1920 x 1080 frame to its window ──────────────────────────── */
  const fitRef = useRef<() => void>(() => {})
  useLayoutEffect(() => {
    const screen = screenRef.current
    const frame = frameRef.current
    if (!screen || !frame) return
    const fit = () => {
      if (mode === 'render') return frame.style.setProperty('--film-scale', '1')
      const w = screen.clientWidth
      const h = screen.clientHeight
      if (!w || !h) return
      /* landscape fills the window (the frame keeps a safe area for the
         crop); portrait shows the whole frame */
      /* upright: the tall cut fills the screen, losing up to a tenth
         off its top and bottom (or sides) before it letterboxes on ink */
      const fill = Math.max(w / FW, h / FH)
      const whole = Math.min(w / FW, h / FH)
      const s = tall ? Math.min(fill, whole * 1.1) : w / h >= 1.25 ? fill : whole
      frame.style.setProperty('--film-scale', String(s))
    }
    fitRef.current = fit
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(screen)
    return () => ro.disconnect()
  }, [mode, FW, FH, tall])

  /* ── the export: the coded timeline, seeked frame by frame ───────────── */
  useLayoutEffect(() => {
    const section = sectionRef.current
    const tl = tlRef.current
    if (!section || !tl || mode !== 'render') return
    const imgs = [...section.querySelectorAll('img')]
    const ready = Promise.all(imgs.map((i) => i.decode().catch(() => undefined)))
    ;(window as unknown as { __film: unknown }).__film = {
      duration: FILM_SECONDS,
      ready,
      /* returns nothing on purpose: handing back the timeline would make
         the export script try to copy the whole object graph */
      seek: (t: number) => {
        tl.seek(t, false)
      },
    }
  }, [mode, tall])

  /* ── the page: the exported film, played as a video ─────────────────── */
  const src = `${VIDEO}${cut}-${tall ? 'tall' : 'wide'}.mp4`
  const { playing, ended, cards, idle, toggle, seek } = useFilmVideo({
    on: mode === 'page',
    section: sectionRef,
    pin: pinRef,
    win: windowRef,
    halo: haloRef,
    tag: tagRef,
    controls: controlsRef,
    video: videoRef,
    fill: fillRef,
    time: timeRef,
    fit: () => fitRef.current(),
    seconds: FILM_SECONDS,
    cardsAt: CARDS_AT,
    open: OPEN,
    src,
  })

  /* the cards in the last frame are real links for the mouse; keyboard and
     screen-reader users get the same links in the list above the film */
  const live = mode === 'page'

  return (
    <section
      className={`cx-film${mode === 'render' ? ' cx-film--render' : ''}`}
      style={mode === 'render' ? { width: FW, height: FH } : undefined}
      data-cut={cut}
      id="work"
      ref={sectionRef}
      data-state="waiting"
      data-idle={idle && playing && !ended ? 'true' : undefined}
      data-umm-theme="ink"
      aria-labelledby="cx-film-title"
    >
      <h2 className="umm-sr-only" id="cx-film-title">
        {film.title}
      </h2>
      <ul className="umm-sr-only">
        {P.map((p) => (
          <li key={p.id}>
            <a href={p.href}>
              {p.client}, {p.type}: {p.title}
            </a>
          </li>
        ))}
        <li>
          <a href={film.explore.href}>{film.explore.label}</a>
        </li>
      </ul>

      <div className="cx-film__pin" ref={pinRef}>
        {mode === 'page' && (
          <div className="cx-film__halo" ref={haloRef} aria-hidden="true" />
        )}

        <div className="cx-film__window" ref={windowRef}>

          {/* the last point's colour, clearing as the window glides (filmOpen) */}

          <div className="cx-film__cover" aria-hidden="true" />
          <div className="cx-film__screen" ref={screenRef}>
            <div
              className="cx-film__frame"
              ref={frameRef}
              data-tall={tall || undefined}
              data-cards={mode === 'page' && cards ? 'true' : undefined}
              aria-hidden="true"
            >
              {mode === 'page' && (
                <video
                  className="cx-f-video"
                  ref={videoRef}
                  key={src}
                  src={src}
                  muted
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                />
              )}
              <div className="cx-f-cam">
                {mode === 'render' && (
                  <>
                    {/* 0:00 */}
                    <div className="cx-f-scene cx-f-intro">
                      {(['cross-1', 'flower-13', 'clover-1'] as ShapeName[]).map((s, k) => (
                        <Shape key={s} name={s} tone={(['citrus', 'blossom', 'sky'] as const)[k]} className={`cx-f-intro__shape cx-f-intro__shape--${k}`} />
                      ))}
                      <p className="cx-f-eyebrow">
                        <span className="cx-f-eyebrow__mark" />
                        {film.eyebrow}
                      </p>
                      <p className="cx-f-intro__title">
                        <Words text={film.title} chip={film.chip} />
                      </p>
                      <p className="cx-f-intro__names">
                        {P.map((p) => (
                          <span className="cx-f-intro__name" key={p.id}>
                            {p.client}
                          </span>
                        ))}
                      </p>
                    </div>

                    {/* 0:03 – 0:25: the real work */}
                    {P.map((p, i) => (
                      <div className={`cx-f-scene cx-f-proj cx-f-proj--${p.id}`} key={p.id}>
                        <div className="cx-f-proj__glow" />
                        <span className="cx-f-proj__index">
                          {String(i + 1).padStart(2, '0')} / {String(P.length).padStart(2, '0')}
                        </span>
                        <div className="cx-f-proj__copy">
                          <p className="cx-f-proj__meta">
                            <span>{p.client}</span>
                            <span className="cx-f-proj__type">{p.type}</span>
                          </p>
                          <p className="cx-f-proj__title">
                            <Words text={p.title} chip={p.chip} />
                          </p>
                          <p className="cx-f-proj__body">{p.body}</p>
                        </div>
                        <div className="cx-f-proj__stage">
                          <div className="cx-f-proj__bar">
                            <i />
                            <i />
                            <i />
                            <span />
                          </div>
                          <div className="cx-f-proj__view">
                            {PAGES[p.id] ? (
                              <img className="cx-f-proj__page" src={`${WORK}${p.id}/site.webp`} alt="" decoding="async" />
                            ) : (
                              FLOWS[p.id].map((f) => (
                                <img className="cx-f-proj__shot" key={f.src} src={`${WORK}${p.id}/${f.src}.webp`} alt="" decoding="async" />
                              ))
                            )}
                            {!PAGES[p.id] && (
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

                  </>
                )}

                {/* 0:25 — the last frame: in the video, then live over it */}
                <div className="cx-f-scene cx-f-end">
                  <div className="cx-f-end__head">
                    <p className="cx-f-end__eyebrow">{film.eyebrow}</p>
                    <p className="cx-f-end__h">{film.title}</p>
                    <a
                      className="cx-f-end__explore"
                      href={film.explore.href}
                      target="_blank"
                      rel="noreferrer"
                      tabIndex={-1}
                    >
                      <span className="cx-f-end__pill">{film.explore.label}</span>
                      <span className="cx-f-end__orb">
                        <Arrow />
                      </span>
                    </a>
                  </div>
                  <div className="cx-f-end__cards">
                    {P.map((p) => (
                      <a
                        className="cx-f-end__card"
                        key={p.id}
                        href={live ? p.href : undefined}
                        target="_blank"
                        rel="noreferrer"
                        tabIndex={-1}
                      >
                        <span className="cx-f-end__img">
                          <img src={`${WORK}${p.id}/card.webp`} alt="" decoding="async" />
                        </span>
                        <span className="cx-f-end__meta">
                          <span>{p.client}</span>
                          <span>{p.type}</span>
                        </span>
                        <span className="cx-f-end__title">{p.title}</span>
                        <span className="cx-f-end__body">{p.short}</span>
                        <span className="cx-f-end__view">
                          {film.view}
                          <Arrow />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* the colour that leads a shape wipe */}
                {mode === 'render' && <div className="cx-f-veil" />}
              </div>

              {mode === 'render' && (
                <>
                  <div className="cx-f-flash" />
                  <div className="cx-f-grain" />
                </>
              )}
            </div>
          </div>
        </div>

        {mode === 'page' && (
          <span className="cx-film__tag" ref={tagRef} data-umm-tone="sky" aria-hidden="true">
            {film.label}
          </span>
        )}

        {mode === 'page' && (
          <div className="cx-film__controls" ref={controlsRef}>
            <button
              type="button"
              className="cx-film__play"
              onClick={toggle}
              aria-label={ended ? 'Play the film again' : playing ? 'Pause the film' : 'Play the film'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {ended ? (
                  <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              0:00 / 0:30
            </span>
          </div>
        )}
      </div>

      {/* the scroll the clover opens over, and the hold after it */}
      {mode === 'page' && <div className="cx-film__runway" aria-hidden="true" />}
    </section>
  )
}
