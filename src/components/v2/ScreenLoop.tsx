import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

/* ============================================================================
   SCREEN LOOP — the 15-second case-study film, built from real screens

   Same five beats for every project, so the five read as a set (storyboard
   in docs/cx-ui-design-references.md, section 3):

     0–3s    the home screen glides into a tilted browser frame
     3–7s    a smooth scroll down the page that tells the story
     7–10s   three inner pages fan out from behind the frame
     10–13s  zoom into the one moment the headline number is about
     13–15s  the number lands on the frame as a tilted chip, then it resets

   Built as a GSAP timeline over <img> rather than an mp4: sharp at any
   size, ~420KB per project, and a beat can be retimed in one line. It plays
   only while it is on screen, and under reduced motion it is the home screen
   in the frame and nothing else.

   Screens live in /public/work/<folder>/ — home, strip, s1–s3, zoom — cut
   from the full-page captures by the script noted in docs/PROGRESS.md.
   ========================================================================== */

export type LoopFocus = { x: number; y: number; scale: number }

/** Where each project's zoom beat lands, in % of the zoom screen. */
export const FOCUS: Record<string, LoopFocus> = {
  aladdin: { x: 50, y: 58, scale: 1.9 },
  cocoandcoir: { x: 66, y: 40, scale: 1.8 },
  fintuit: { x: 50, y: 44, scale: 1.7 },
  habari: { x: 26, y: 46, scale: 1.75 },
  healthx: { x: 40, y: 50, scale: 1.7 },
}

const DURATION = 15

export function ScreenLoop({
  folder,
  url,
  stat,
  onDone,
  onProgress,
  repeat = false,
}: {
  folder: string
  /** Shown in the frame's address bar. */
  url: string
  stat: { value: string; label: string }
  /** Called when the 15 seconds complete (never when repeating, and never
   *  under reduced motion, where no timeline is built). */
  onDone?: () => void
  /** 0–1 through the current pass, every frame; drives the tab clock. */
  onProgress?: (p: number) => void
  repeat?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [stripH, setStripH] = useState(0)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const progressRef = useRef(onProgress)
  progressRef.current = onProgress
  const base = `/work/${folder}`
  const focus = FOCUS[folder] ?? { x: 50, y: 50, scale: 1.6 }

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !stripH || prefersReducedMotion()) return

    let tl: gsap.core.Timeline | undefined
    const ctx = gsap.context(() => {
      /* The frame's viewport is 16:10 of a 1200px-wide strip, i.e. 750px of
         it. How far the strip can travel is whatever is left below that. */
      const travel = -(1 - 750 / stripH) * 100 * 0.78

      gsap.set('.cx-loop__strip, .cx-loop__zoom, .cx-loop__stat', { autoAlpha: 0 })
      gsap.set('.cx-loop__card', { xPercent: 0, yPercent: 0, rotate: 0, scale: 0.9, autoAlpha: 0 })

      tl = gsap.timeline({
        repeat: repeat ? -1 : 0,
        paused: true,
        defaults: { ease: 'power3.inOut' },
        onComplete: () => doneRef.current?.(),
        onUpdate: function (this: gsap.core.Timeline) {
          progressRef.current?.(this.progress())
        },
      })

      /* 0–3: glide in */
      tl.fromTo(
        '.cx-loop__frame',
        { rotateY: -26, rotateX: 12, x: 90, y: 24, autoAlpha: 0 },
        { rotateY: -9, rotateX: 5, x: 0, y: 0, autoAlpha: 1, duration: 1.5, ease: 'power3.out' },
        0,
      )
        .to('.cx-loop__frame', { rotateY: -4, rotateX: 3, duration: 1.4, ease: 'sine.inOut' }, 1.5)

        /* 3–7: scroll the story page */
        .to('.cx-loop__strip', { autoAlpha: 1, duration: 0.45 }, 3)
        .fromTo('.cx-loop__strip', { yPercent: 0 }, { yPercent: travel, duration: 3.4, ease: 'power1.inOut' }, 3.3)

        /* 7–10: the inner pages fan out from behind the frame */
        .to('.cx-loop__frame', { scale: 0.84, x: '-14%', rotateY: 6, duration: 1.1 }, 7)
        .to(
          '.cx-loop__card',
          {
            autoAlpha: 1,
            scale: 1,
            xPercent: (i: number) => [62, 84, 56][i],
            yPercent: (i: number) => [-30, 6, 40][i],
            rotate: (i: number) => [7, -5, 10][i],
            duration: 1.2,
            stagger: 0.12,
            ease: 'back.out(1.4)',
          },
          7.1,
        )

        /* 10–13: collapse, then zoom into the moment the number is about */
        .to('.cx-loop__card', { xPercent: 0, yPercent: 0, rotate: 0, scale: 0.9, autoAlpha: 0, duration: 0.7, stagger: 0.06 }, 10)
        .to('.cx-loop__frame', { scale: 1, x: 0, rotateY: -5, rotateX: 4, duration: 0.9 }, 10.1)
        .to('.cx-loop__zoom', { autoAlpha: 1, duration: 0.4 }, 10.3)
        .fromTo(
          '.cx-loop__zoom',
          { scale: 1 },
          { scale: focus.scale, duration: 2.5, ease: 'power2.inOut', transformOrigin: `${focus.x}% ${focus.y}%` },
          10.5,
        )

        /* 13–15: the number lands, then everything resets for the next pass */
        .fromTo(
          '.cx-loop__stat',
          { autoAlpha: 0, scale: 0.4, rotate: 18 },
          { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.7, ease: 'back.out(2.2)' },
          13,
        )
        .to(['.cx-loop__zoom', '.cx-loop__strip', '.cx-loop__stat'], { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 14.4)
        .set({}, {}, DURATION)
    }, el)

    /* play only while on screen */
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? tl?.play() : tl?.pause()),
      { threshold: 0.35 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      ctx.revert()
    }
  }, [stripH, repeat, focus.scale, focus.x, focus.y])

  return (
    <div className="cx-loop" ref={ref}>
      <div className="cx-loop__stage">
        {[1, 2, 3].map((n) => (
          <figure className="cx-loop__card" key={n}>
            <img src={`${base}/s${n}.webp`} alt="" width={960} height={600} loading="lazy" decoding="async" />
          </figure>
        ))}

        <div className="cx-loop__frame">
          <div className="cx-loop__bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>{url}</span>
          </div>
          <div className="cx-loop__view">
            <img className="cx-loop__home" src={`${base}/home.webp`} alt="" width={1440} height={900} decoding="async" />
            <img
              className="cx-loop__strip"
              src={`${base}/strip.webp`}
              alt=""
              width={1200}
              decoding="async"
              onLoad={(e) => setStripH(e.currentTarget.naturalHeight)}
            />
            <img className="cx-loop__zoom" src={`${base}/zoom.webp`} alt="" width={1440} height={900} loading="lazy" decoding="async" />
          </div>
        </div>

        <span className="cx-loop__stat" aria-hidden="true">
          <b>{stat.value}</b> {stat.label}
        </span>
      </div>
    </div>
  )
}
