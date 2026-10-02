import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { film, hero, work, type Project } from '@/content/cxUiDesign'
import { SHAPES, type ShapeName, type ShapePart } from './shapes.data'
import { Shape } from './Shape'

/* ============================================================================
   3 · OUR WORK — a 30-second film

   Replaces the tabbed "Proof, not promises" section (Krish, 2 Oct). It plays
   like a cut film, not a web section: one GSAP timeline, exactly 30 seconds,
   on a fixed 1920 x 1080 frame that is scaled to the screen, so every cut
   lands on the same frame on a laptop, a monitor and in the MP4 export.

     0:00  hook        "You've got 0.05 seconds." typed, then the research
                       line slams in word by word
     0:04  blank→built a cursor drags out an empty frame that snaps into
                       Coco & Coir's real homepage; our screens fly past
     0:08  five hits   one real project and its number every 3 seconds,
                       each cut differently (whip, shape wipe, punch-in)
     0:23  the wall    every screen on a tilted wall, the five industries
                       flash past, "Real work. Real numbers."
     0:26  end card    the hero line, then umm and Let's talk

   Editing kit (all on the one timeline, so seeking and the export are exact):
   Cool Shape wipes (the next scene grows out of a brand shape), whip pans
   with motion blur, flash frames, camera shake on every number slam, slow
   push-ins, and 12 fps film grain.

   It plays when most of it is on screen and pauses when it isn't. Reduced
   motion: it waits on its end card with a play button. Screen readers get
   the projects and numbers as text.
   ========================================================================== */

const W = 1920
const H = 1080
export const FILM_SECONDS = 30

/** Big, landscape screens with motion allowed get the opening window. */
const OPEN =
  '(min-width: 721px) and (min-height: 540px) and (min-aspect-ratio: 5/4) and (prefers-reduced-motion: no-preference)'
/** Scroll, in screen heights, over which the window opens. */
const GROW = 0.9

const INK = '#100e14'
const PAPER = '#ffffff'
const CITRUS = '#f0ff70'
const BLOSSOM = '#ffc4f2'

type Hit = Project & { value: number; suffix: string; label: string }

const HITS: Hit[] = film.hits.map(({ screens, stat }) => {
  const p = work.projects.find((x) => x.screens === screens)!
  const n = p.numbers[stat]
  const [, value, suffix] = /^(\d+)(.*)$/.exec(n.value)!
  return { ...p, value: Number(value), suffix, label: n.label }
})

/* the screens that fly past the camera, and where each one flies */
const TUNNEL = ['fintuit', 'healthx', 'aladdin', 'habari'].flatMap((p) =>
  ['s1', 's2', 's3'].map((s) => `/work/${p}/${s}.webp`),
)
const TUNNEL_AT: [number, number][] = [
  [-620, -300], [560, -260], [-240, 320], [700, 280], [-760, 140], [180, -380],
  [-420, -40], [460, 40], [-60, -260], [820, -60], [-820, -320], [300, 360],
]

/* the wall: a row of homepages, then a row of each inner page */
const WALL = ['home', 's1', 's2', 's3'].flatMap((s) =>
  work.projects.filter((p) => p.screens).map((p) => `/work/${p.screens}/${s}.webp`),
)

/** A Cool Shape as a CSS mask, for the shape wipes. Only solid shapes:
 *  one with a hole would leave a window of the old scene in the new one. */
const maskOf = (name: ShapeName) => {
  const paths = (SHAPES[name] as readonly ShapePart[])
    .map((p) => `<path d='${p.d}'${p.evenodd ? " fill-rule='evenodd'" : ''}/>`)
    .join('')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>${paths}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const chars = (s: string) =>
  [...s].map((c, i) => (
    <span className="cx-f-ch" key={i}>
      {c}
    </span>
  ))

const fmt = (t: number) => `0:${String(Math.floor(t)).padStart(2, '0')}`

function Browser({ src, className = '' }: { src: string; className?: string }) {
  return (
    <div className={`cx-f-browser ${className}`}>
      <div className="cx-f-browser__bar">
        <i />
        <i />
        <i />
        <span />
      </div>
      <div className="cx-f-browser__view">
        <img className="cx-f-browser__page" src={src} alt="" decoding="async" />
      </div>
    </div>
  )
}

export function ProofFilm({ mode = 'page' }: { mode?: 'page' | 'render' }) {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLSpanElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const userPaused = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)

  /* ── the timeline ─────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(frame)
      const one = (s: string) => q(s)[0] as HTMLElement

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onUpdate: () => {
          const t = tl.time()
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${t / FILM_SECONDS})`
          if (timeRef.current) timeRef.current.textContent = `${fmt(t)} / ${fmt(FILM_SECONDS)}`
        },
        onComplete: () => {
          setPlaying(false)
          setEnded(true)
        },
      })
      tlRef.current = tl

      const cam = one('.cx-f-cam')
      const flashEl = one('.cx-f-flash')

      /* ── the editing kit ── */

      /** The next scene grows out of a Cool Shape in the middle of the frame.
       *  With a colour, a brand-colour shape opens first and the scene opens
       *  inside it a beat later, so a ring of colour leads the cut. */
      const veil = one('.cx-f-veil')
      const wipe = (from: Element, to: Element, t: number, shape: ShapeName, color?: string, dur = 0.5) => {
        const mask = maskOf(shape)
        let at = t
        if (color) {
          tl.set(veil, { autoAlpha: 1, backgroundColor: color, '--wipe': mask, '--m': '0px' }, t)
          tl.to(veil, { '--m': '4600px', duration: 0.42, ease: 'power3.in' }, t)
          at = t + 0.16
        }
        tl.set(to, { autoAlpha: 1, zIndex: 30, '--wipe': mask, '--m': '0px' }, at)
        tl.to(to, { '--m': '4600px', duration: dur, ease: 'power3.in' }, at)
        tl.set(to, { '--wipe': 'none', zIndex: 'auto' }, at + dur)
        tl.set(from, { autoAlpha: 0 }, at + dur)
        if (color) tl.set(veil, { autoAlpha: 0 }, at + dur)
      }

      /** Whip pan: both scenes travel together, like the camera swinging
       *  between them, smeared at the fastest point. */
      const whip = (from: Element, to: Element, t: number, axis: 'x' | 'y' = 'x') => {
        const D = 0.44
        const out = axis === 'x' ? { x: -W } : { y: -H }
        const inn = axis === 'x' ? { x: W } : { y: H }
        tl.to(from, { ...out, duration: D, ease: 'power3.inOut' }, t)
        tl.fromTo(to, { ...inn, autoAlpha: 1 }, { x: 0, y: 0, duration: D, ease: 'power3.inOut', immediateRender: false }, t)
        tl.to([from, to], { filter: 'blur(30px)', duration: D / 2, ease: 'power2.in' }, t)
        tl.to([from, to], { filter: 'blur(0px)', duration: D / 2, ease: 'power2.out' }, t + D / 2)
        tl.set(from, { autoAlpha: 0 }, t + D)
      }

      const flash = (t: number, color = PAPER, dur = 2 / 30) => {
        tl.set(flashEl, { autoAlpha: 1, backgroundColor: color }, t)
        tl.set(flashEl, { autoAlpha: 0 }, t + dur)
      }

      /** a short, decaying camera shake */
      const shake = (t: number, amp = 14) => {
        const path = [[1, -0.6], [-0.8, 0.9], [0.6, -0.4], [-0.4, 0.5], [0.2, -0.2]]
        path.forEach(([x, y], i) => tl.to(cam, { x: x * amp, y: y * amp, duration: 0.035, ease: 'none' }, t + i * 0.035))
        tl.to(cam, { x: 0, y: 0, duration: 0.05, ease: 'none' }, t + path.length * 0.035)
      }

      /** a number counting up, fast then settling */
      const count = (el: Element, to: number, t: number, dur: number, also?: (v: number) => void) => {
        const o = { v: 0 }
        tl.fromTo(
          o,
          { v: 0 },
          {
            v: to,
            duration: dur,
            ease: 'expo.out',
            immediateRender: false,
            onUpdate: () => {
              const v = Math.round(o.v)
              el.textContent = String(v)
              also?.(v)
            },
          },
          t,
        )
      }

      /** a word turning into a tilted chip */
      const chipPop = (el: Element, t: number, bg: string, fg: string, tilt: number, fromFg: string) => {
        tl.fromTo(
          el,
          { backgroundColor: 'rgba(255,255,255,0)', color: fromFg, rotation: 0, scale: 1 },
          { backgroundColor: bg, color: fg, rotation: tilt, scale: 1.1, duration: 0.14, ease: 'power4.out', immediateRender: false },
          t,
        )
        tl.to(el, { scale: 1, duration: 0.32, ease: 'back.out(3)' }, t + 0.14)
      }

      /* ── 0:00 hook ── */
      const hook = one('.cx-f-hook')
      const typed = q('.cx-f-hook .cx-f-ch')
      const caret = one('.cx-f-caret')
      gsap.set(typed, { display: 'none' })
      tl.set(caret, { opacity: 0 }, 0.16)
      tl.set(caret, { opacity: 1 }, 0.3)
      const TYPE = 0.38
      const STEP = 0.045
      typed.forEach((c, i) => tl.set(c, { display: 'inline' }, TYPE + i * STEP))
      const typedEnd = TYPE + typed.length * STEP
      for (let b = 0; b < 2; b++) {
        tl.set(caret, { opacity: 0 }, typedEnd + 0.22 + b * 0.3)
        tl.set(caret, { opacity: 1 }, typedEnd + 0.37 + b * 0.3)
      }
      chipPop(one('.cx-f-type__chip'), typedEnd + 0.06, CITRUS, INK, -3, PAPER)
      shake(typedEnd + 0.06, 10)
      tl.fromTo(one('.cx-f-type'), { scale: 1 }, { scale: 1.07, duration: 2.3, ease: 'none', immediateRender: false }, 0)

      /* ── 0:02 the research line, word by word ── */
      const judge = one('.cx-f-judge')
      tl.set(hook, { autoAlpha: 0 }, 2.2)
      tl.set(judge, { autoAlpha: 1 }, 2.2)
      const words = q('.cx-f-judge .cx-f-word')
      words.forEach((w, i) => {
        tl.from(w, { autoAlpha: 0, scale: 1.7, filter: 'blur(12px)', duration: 0.2, ease: 'power4.out' }, 2.24 + i * 0.12)
      })
      chipPop(words[words.length - 1], 3.16, BLOSSOM, INK, -2.5, INK)
      shake(3.16, 8)
      tl.from(one('.cx-f-source'), { autoAlpha: 0, y: 14, duration: 0.4 }, 3.0)
      tl.fromTo(one('.cx-f-judge__line'), { scale: 1 }, { scale: 1.04, duration: 1.9, ease: 'none', immediateRender: false }, 2.2)

      /* ── 0:04 blank frame → real product ── */
      const build = one('.cx-f-build')
      wipe(judge, build, 3.6, 'flower-6', BLOSSOM)
      const cursor = one('.cx-f-cursor')
      const sel = one('.cx-f-select')
      const dim = one('.cx-f-select__dim')
      const board = one('.cx-f-board')
      const blank = one('.cx-f-build__blank')
      const real = one('.cx-f-build__real')
      const BX = 640
      const BY = 210
      const BW = 1120
      const BH = 700
      gsap.set(cursor, { x: 1780, y: 1020 })
      gsap.set(sel, { autoAlpha: 0 })
      tl.from(blank, { autoAlpha: 0, y: 30, duration: 0.5 }, 3.95)
      tl.to(cursor, { x: BX - 6, y: BY - 4, duration: 0.55, ease: 'power2.inOut' }, 3.75)
      const DRAG = 4.32
      const DRAGD = 0.7
      tl.set(sel, { autoAlpha: 1 }, DRAG)
      tl.to(cursor, { x: BX + BW - 6, y: BY + BH - 4, duration: DRAGD, ease: 'power2.inOut' }, DRAG)
      const box = { w: 0, h: 0 }
      tl.fromTo(
        box,
        { w: 0, h: 0 },
        {
          w: BW,
          h: BH,
          duration: DRAGD,
          ease: 'power2.inOut',
          immediateRender: false,
          onUpdate: () => {
            sel.style.width = `${box.w}px`
            sel.style.height = `${box.h}px`
            dim.textContent = `${Math.round((box.w * 1440) / BW)} × ${Math.round((box.h * 900) / BH)}`
          },
        },
        DRAG,
      )
      const SNAP = DRAG + DRAGD + 0.06
      flash(SNAP, PAPER, 0.05)
      tl.fromTo(
        one('.cx-f-board__shot'),
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.32, ease: 'power4.out', immediateRender: false },
        SNAP,
      )
      tl.fromTo(board, { scale: 1 }, { scale: 1.035, duration: 0.12, ease: 'power2.out', immediateRender: false }, SNAP)
      tl.to(board, { scale: 1, duration: 0.42, ease: 'back.out(3)' }, SNAP + 0.12)
      tl.to(sel, { autoAlpha: 0, duration: 0.2 }, SNAP + 0.1)
      shake(SNAP, 8)
      tl.to(blank, { opacity: 0.32, duration: 0.3 }, SNAP)
      tl.from(real, { autoAlpha: 0, y: 30, duration: 0.45 }, SNAP + 0.15)
      tl.to(cursor, { x: 1960, y: 1140, duration: 0.5, ease: 'power2.in' }, SNAP + 0.3)

      /* ── 0:06 our screens fly past ── */
      const TUN = 5.95
      tl.to([blank, real, one('.cx-f-board__name')], { autoAlpha: 0, x: -60, duration: 0.3, ease: 'power2.in' }, TUN - 0.1)
      tl.to(one('.cx-f-build__dark'), { opacity: 1, duration: 0.45, ease: 'power2.inOut' }, TUN)
      tl.to(board, { scale: 2.6, autoAlpha: 0, filter: 'blur(10px)', duration: 0.65, ease: 'power3.in' }, TUN)
      q('.cx-f-tunnel__card').forEach((c, i) => {
        const [x, y] = TUNNEL_AT[i]
        const at = TUN + 0.25 + i * 0.06
        tl.set(c, { autoAlpha: 1 }, at)
        tl.fromTo(
          c,
          { x: x * 1.3, y: y * 1.3, z: -2600, rotationY: x > 0 ? -18 : 18 },
          { z: 1050, duration: 1.0, ease: 'power1.in', immediateRender: false },
          at,
        )
        tl.set(c, { autoAlpha: 0 }, at + 1.0)
      })

      /* ── 0:08 five hits, three seconds each ── */
      const hits = q('.cx-f-hit')
      const HIT0 = 8
      const LEN = 3
      wipe(build, hits[0], HIT0 - 0.6, HITS[0].shape, CITRUS)

      HITS.forEach((h, i) => {
        const el = hits[i]
        const T = HIT0 + i * LEN
        const numBox = el.querySelector('.cx-f-hit__num')!
        const cells = el.querySelectorAll<HTMLElement>('.cx-f-days i')

        gsap.set(numBox, { autoAlpha: 0 })
        tl.from(el.querySelector('.cx-f-hit__index'), { autoAlpha: 0, x: -30, duration: 0.4 }, T + 0.05)
        tl.fromTo(
          numBox,
          { scale: 1.3, filter: 'blur(14px)', autoAlpha: 0 },
          { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: 0.45, immediateRender: false },
          T + 0.1,
        )
        count(el.querySelector('.cx-f-hit__n')!, h.value, T + 0.1, 1.0, (v) =>
          cells.forEach((c, k) => {
            c.style.background = k < v ? INK : ''
          }),
        )
        /* the slam */
        tl.to(numBox, { scale: 1.07, duration: 0.06, ease: 'power2.out' }, T + 1.12)
        tl.to(numBox, { scale: 1, duration: 0.35, ease: 'back.out(4)' }, T + 1.18)
        shake(T + 1.12, 14)
        tl.from(el.querySelector('.cx-f-hit__label'), { autoAlpha: 0, y: 40, duration: 0.45 }, T + 1.2)
        el.querySelectorAll('.cx-f-chip').forEach((c, k) => {
          tl.from(c, { autoAlpha: 0, scale: 0.5, rotation: k ? 14 : -14, duration: 0.45, ease: 'back.out(2.4)' }, T + 1.5 + k * 0.1)
        })
        const shape = el.querySelector('.cx-f-hit__shape')
        tl.fromTo(shape, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, T + 0.2)
        tl.fromTo(shape, { rotation: -30 }, { rotation: 70, duration: 3.2, ease: 'none' }, T - 0.2)

        /* each hit's own picture. These fromTo()s render their start state up
           front (no immediateRender: false), so nothing shows in its final
           spot while the cut into this hit is still playing. */
        const browser = el.querySelector('.cx-f-browser')
        const page = el.querySelector('.cx-f-browser__page')
        if (i === 0) {
          gsap.set(browser, { transformPerspective: 1800, rotationX: 5 })
          tl.fromTo(browser, { x: 520, rotationY: -40, autoAlpha: 0 }, { x: 0, rotationY: -16, autoAlpha: 1, duration: 0.7, ease: 'power4.out' }, T - 0.05)
          tl.fromTo(page, { yPercent: 0 }, { yPercent: -42, duration: 2.3, ease: 'power1.inOut' }, T + 0.5)
        } else if (i === 1) {
          gsap.set(browser, { transformPerspective: 1800, rotationX: 5 })
          tl.fromTo(browser, { y: -760, rotation: -14, rotationY: 16, autoAlpha: 0 }, { y: 0, rotation: 0, rotationY: 16, autoAlpha: 1, duration: 0.75, ease: 'back.out(1.4)' }, T - 0.1)
          tl.fromTo(page, { yPercent: 0 }, { yPercent: -36, duration: 2.3, ease: 'power1.inOut' }, T + 0.5)
        } else if (i === 2) {
          el.querySelectorAll('.cx-f-card').forEach((c, k) => {
            const fan = [-1, 0, 1][k]
            tl.fromTo(
              c,
              { x: 0, y: 300, rotation: 0, autoAlpha: 0 },
              { x: fan * 230, y: fan === 0 ? -30 : 40, rotation: fan * 9, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.6)' },
              T - 0.05 + k * 0.08,
            )
          })
        } else if (i === 3) {
          /* the screen pans inside the numerals */
          tl.fromTo(
            numBox,
            { backgroundPosition: '0% 10%' },
            { backgroundPosition: '100% 70%', duration: 3.2, ease: 'none' },
            T - 0.2,
          )
        } else {
          gsap.set(browser, { transformPerspective: 1800 })
          tl.fromTo(browser, { y: 520, rotationX: 30, rotation: 6, autoAlpha: 0 }, { y: 0, rotationX: 8, rotation: -4, autoAlpha: 1, duration: 0.75, ease: 'power4.out' }, T)
          tl.fromTo(page, { yPercent: 0 }, { yPercent: -30, duration: 2.2, ease: 'power1.inOut' }, T + 0.5)
        }
      })

      /* the cuts between hits, each a different move */
      whip(hits[0], hits[1], HIT0 + LEN - 0.45, 'x')
      wipe(hits[1], hits[2], HIT0 + 2 * LEN - 0.6, HITS[2].shape, BLOSSOM)
      /* punch-in: push into hit 3, white frame, land on hit 4 from wide */
      const PUNCH = HIT0 + 3 * LEN - 0.4
      tl.to(hits[2], { scale: 1.25, filter: 'blur(8px)', duration: 0.26, ease: 'power3.in' }, PUNCH)
      flash(PUNCH + 0.26, PAPER, 3 / 30)
      tl.set(hits[2], { autoAlpha: 0 }, PUNCH + 0.3)
      tl.set(hits[3], { autoAlpha: 1 }, PUNCH + 0.3)
      tl.fromTo(hits[3], { scale: 0.86 }, { scale: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, PUNCH + 0.3)
      whip(hits[3], hits[4], HIT0 + 4 * LEN - 0.45, 'y')

      /* ── 0:23 the wall ── */
      const wall = one('.cx-f-wall')
      const WALL_AT = HIT0 + 5 * LEN - 0.6
      wipe(hits[4], wall, WALL_AT, 'star-3', CITRUS, 0.45)
      tl.fromTo(one('.cx-f-wall__zoom'), { scale: 1.9 }, { scale: 1, duration: 4, ease: 'power2.out', immediateRender: false }, WALL_AT)
      tl.fromTo(one('.cx-f-wall__grid'), { y: 340 }, { y: -300, duration: 4, ease: 'none', immediateRender: false }, WALL_AT)
      q('.cx-f-wall__tile').forEach((t, i) => {
        const ring = Math.abs((i % 5) - 2) + Math.abs(Math.floor(i / 5) - 1.5)
        tl.from(t, { autoAlpha: 0, rotationX: -80, duration: 0.5 }, WALL_AT + 0.05 + ring * 0.07)
      })
      const sectors = q('.cx-f-wall__word')
      sectors.forEach((w, k) => {
        const at = 23.25 + k * 0.32
        tl.set(w, { autoAlpha: 1 }, at)
        tl.fromTo(w, { scale: 1.25 }, { scale: 1, duration: 0.3, ease: 'power3.out', immediateRender: false }, at)
        tl.set(w, { autoAlpha: 0 }, at + 0.3)
      })
      tl.to(one('.cx-f-wall__shade'), { opacity: 1, duration: 0.4 }, 24.8)
      const wallLines = q('.cx-f-wall__line > span')
      tl.from(wallLines[0], { autoAlpha: 0, y: 60, duration: 0.45, ease: 'power4.out' }, 24.95)
      tl.from(wallLines[1], { autoAlpha: 0, y: 60, duration: 0.45, ease: 'power4.out' }, 25.25)
      chipPop(one('.cx-f-wall__chip'), 25.6, CITRUS, INK, -3, PAPER)
      shake(25.6, 12)

      /* ── 0:26 end card ── */
      const end = one('.cx-f-end')
      flash(26.35, PAPER, 0.1)
      tl.set(wall, { autoAlpha: 0 }, 26.45)
      tl.set(end, { autoAlpha: 1 }, 26.45)
      q('.cx-f-end__line').forEach((l, k) => {
        tl.from(l, { autoAlpha: 0, yPercent: 60, duration: 0.55, ease: 'power4.out' }, 26.5 + k * 0.12)
      })
      tl.from(one('.cx-f-end__chip'), { autoAlpha: 0, scale: 0.4, rotation: 20, duration: 0.5, ease: 'back.out(2.2)' }, 26.95)
      q('.cx-f-end__shape').forEach((s, k) => {
        tl.from(s, { autoAlpha: 0, scale: 0, duration: 0.5, ease: 'back.out(2)' }, 27.1 + k * 0.1)
        tl.fromTo(s, { rotation: 0 }, { rotation: k ? -50 : 50, duration: 2.9, ease: 'none', immediateRender: false }, 27.1)
      })
      tl.to(one('.cx-f-end__title'), { autoAlpha: 0, y: -60, duration: 0.35, ease: 'power2.in' }, 28.25)
      tl.from(one('.cx-f-end__logo'), { autoAlpha: 0, scale: 0.6, filter: 'blur(16px)', duration: 0.55, ease: 'back.out(1.8)' }, 28.45)
      tl.from(one('.cx-f-end__cta'), { autoAlpha: 0, y: 30, duration: 0.45 }, 28.75)
      tl.from(one('.cx-f-end__url'), { autoAlpha: 0, duration: 0.4 }, 28.95)

      /* ── film grain, 12 fps, for the whole 30 seconds ── */
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
  }, [])

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
      const s = w / h >= 1.25 ? Math.max(w / W, h / H) : Math.min(w / W, h / H)
      frame.style.setProperty('--film-scale', String(s))
    }
    fitRef.current = fit
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(screen)
    return () => ro.disconnect()
  }, [mode])

  /* ── how it arrives, and when it plays ─────────────────────────────────── */
  useLayoutEffect(() => {
    const section = sectionRef.current
    const tl = tlRef.current
    if (!section || !tl) return

    if (mode === 'render') {
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
      return
    }

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

        /* reduced motion: wait on the end card, play on request */
        if (reduce) {
          tl.progress(1)
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

        /* Big screens: section 2 hands over black to black, a small window
           holding the film's first frame rises into the centre, and the
           scroll opens it until its corners meet the screen. The film
           starts the instant it is full; the page then holds a while so it
           never plays half scrolled. */
        section.dataset.mode = 'open'
        const pin = pinRef.current!
        const win = windowRef.current!
        const tag = tagRef.current!
        const controls = controlsRef.current!
        const ease = gsap.parseEase('power2.inOut')
        const state = { p: 0 }
        let inZone = false

        const apply = () => {
          const vw = pin.clientWidth
          const vh = pin.clientHeight
          const w0 = Math.min(vw * 0.5, (vh * 0.56 * 16) / 9)
          const h0 = (w0 * 9) / 16
          const e = ease(state.p)
          const h = h0 + (vh - h0) * e
          win.style.width = `${w0 + (vw - w0) * e}px`
          win.style.height = `${h}px`
          win.style.borderRadius = `${26 * (1 - e)}px`
          win.style.setProperty('--edge', String(1 - e))
          tag.style.top = `${vh / 2 + h / 2 + 26}px`
          tag.style.opacity = String(Math.max(0, 1 - state.p * 2.5))
          const full = state.p > 0.995
          controls.style.opacity = full ? '1' : '0'
          controls.style.visibility = full ? 'visible' : 'hidden'
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
            scrub: 0.5,
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
          ;[win, tag, controls].forEach((el) => el.removeAttribute('style'))
          fitRef.current()
        }
      },
      section,
    )

    return () => {
      mm.revert()
      near.disconnect()
    }
  }, [mode])

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
    setEnded(p >= 1)
  }

  const [l1, l2] = hero.lines

  return (
    <section
      className={`cx-film${mode === 'render' ? ' cx-film--render' : ''}`}
      id="work"
      ref={sectionRef}
      data-state="waiting"
      data-umm-theme="ink"
      aria-labelledby="cx-film-title"
    >
      <h2 className="umm-sr-only" id="cx-film-title">
        {film.label}
      </h2>
      <ul className="umm-sr-only">
        {HITS.map((h) => (
          <li key={h.client}>
            {h.client}, {h.sector}: {h.value}
            {h.suffix} {h.label}.
          </li>
        ))}
      </ul>

      <div className="cx-film__pin" ref={pinRef}>
        <div className="cx-film__window" ref={windowRef}>
          <div className="cx-film__screen" ref={screenRef}>
            <div className="cx-film__frame" ref={frameRef} aria-hidden="true">
              <div className="cx-f-cam">
                {/* 0:00 */}
                <div className="cx-f-scene cx-f-hook">
                  <p className="cx-f-type">
                    {chars(film.hook.line1)}
                    <br />
                    <span className="cx-f-type__chip">{chars(film.hook.chip)}</span>
                    {chars(film.hook.after)}
                    <span className="cx-f-caret" />
                  </p>
                </div>

                <div className="cx-f-scene cx-f-judge">
                  <p className="cx-f-judge__line">
                    {film.judge.split(' ').map((w, i, all) => (
                      <span className={`cx-f-word${i === all.length - 1 ? ' cx-f-word--chip' : ''}`} key={i}>
                        {w}
                      </span>
                    ))}
                  </p>
                  <p className="cx-f-source">{film.source}</p>
                </div>

                {/* 0:04 */}
                <div className="cx-f-scene cx-f-build">
                  <p className="cx-f-build__label cx-f-build__blank">{film.blank}</p>
                  <p className="cx-f-build__label cx-f-build__real">{film.real}</p>
                  <div className="cx-f-board">
                    <span className="cx-f-board__name">{film.board}</span>
                    <img className="cx-f-board__shot" src="/work/cocoandcoir/home.webp" alt="" decoding="async" />
                    <div className="cx-f-select">
                      <span className="cx-f-select__dim">0 × 0</span>
                    </div>
                  </div>
                  <svg className="cx-f-cursor" viewBox="0 0 32 36" aria-hidden="true">
                    <path d="M3 2 3 30 10.5 23 15.5 34 21 31.5 16 20.5 26.5 20.5Z" />
                  </svg>
                  <div className="cx-f-build__dark" />
                  <div className="cx-f-tunnel">
                    {TUNNEL.map((src) => (
                      <div className="cx-f-tunnel__card" key={src}>
                        <img src={src} alt="" decoding="async" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 0:08 */}
                {HITS.map((h, i) => (
                  <div className={`cx-f-scene cx-f-hit cx-f-hit--${'abcde'[i]}`} data-umm-tone={h.tone} key={h.client}>
                    <span className="cx-f-hit__index">
                      {String(i + 1).padStart(2, '0')} / 05 · {h.sector}
                    </span>
                    <Shape name={h.shape} className="cx-f-hit__shape" />
                    <div
                      className="cx-f-hit__num"
                      style={i === 3 ? { backgroundImage: `url(/work/${h.screens}/home.webp)` } : undefined}
                    >
                      <span className="cx-f-hit__n">0</span>
                      <span className="cx-f-hit__suffix">{h.suffix}</span>
                    </div>
                    <p className="cx-f-hit__label">{h.label}</p>
                    {i === 4 && (
                      <div className="cx-f-days">
                        {Array.from({ length: h.value }, (_, k) => (
                          <i key={k} />
                        ))}
                      </div>
                    )}
                    <div className="cx-f-hit__chips">
                      <span className="cx-f-chip cx-f-chip--ink">{h.client}</span>
                      <span className="cx-f-chip">{h.sector}</span>
                    </div>
                    {i === 2 ? (
                      <div className="cx-f-cards">
                        {['s1', 's2', 's3'].map((s) => (
                          <div className="cx-f-card" key={s}>
                            <img src={`/work/${h.screens}/${s}.webp`} alt="" decoding="async" />
                          </div>
                        ))}
                      </div>
                    ) : i !== 3 ? (
                      <Browser src={`/work/${h.screens}/strip.webp`} />
                    ) : null}
                  </div>
                ))}

                {/* 0:23 */}
                <div className="cx-f-scene cx-f-wall">
                  <div className="cx-f-wall__zoom">
                    <div className="cx-f-wall__plane">
                      <div className="cx-f-wall__grid">
                        {WALL.map((src) => (
                          <div className="cx-f-wall__tile" key={src}>
                            <img src={src} alt="" decoding="async" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="cx-f-wall__shade" />
                  {work.projects.map((p) => (
                    <p className="cx-f-wall__word" key={p.tab}>
                      {p.tab.split(' &')[0]}.
                    </p>
                  ))}
                  <p className="cx-f-wall__line">
                    <span>{film.wall[0]}</span>
                    <span>
                      <span className="cx-f-wall__chip">{film.wall[1]}</span>
                    </span>
                  </p>
                </div>

                {/* 0:26 */}
                <div className="cx-f-scene cx-f-end">
                  <Shape name="flower-6" tone="blossom" className="cx-f-end__shape cx-f-end__shape--a" />
                  <Shape name="star-3" tone="sky" className="cx-f-end__shape cx-f-end__shape--b" />
                  <p className="cx-f-end__title">
                    <span className="cx-f-end__line">{l1}</span>
                    <span className="cx-f-end__line">{l2}</span>
                    <span className="cx-f-end__line">
                      <span className="cx-f-end__chip">{hero.accent}</span> {hero.tail}
                    </span>
                  </p>
                  <div className="cx-f-end__brand">
                    <span className="cx-f-end__logo">umm</span>
                    <span className="cx-f-end__cta">
                      {hero.primaryCta}
                      <span className="cx-f-end__dot">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </span>
                    </span>
                    <span className="cx-f-end__url">{film.site}</span>
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

      {/* the scroll the window opens over, and the hold after it */}
      {mode === 'page' && <div className="cx-film__runway" aria-hidden="true" />}
    </section>
  )
}
