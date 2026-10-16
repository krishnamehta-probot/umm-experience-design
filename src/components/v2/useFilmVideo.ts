import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react'
import { gsap } from '@/lib/gsap'
import { openFilm } from './filmOpen'

/* ============================================================================
   THE FILM, AS A VIDEO — the player both service pages' films share

   Krish, 15 Oct: the films were coded scenes (one GSAP timeline animating
   3D, blur and a dozen layers live), and that weight is what the page
   shook under on phones after the film. Now each film is exported to MP4
   (scripts/render-film.mjs steps the same coded timeline frame by frame:
   a wide 1920 x 1080 cut for laptops, a tall 1080 x 1920 one for upright
   phones) and the page just plays the file.

   The video sits inside the film's frame, so it is fitted, masked and
   opened (filmOpen.ts) exactly as the coded scenes were. Only the last
   frame stays live: once the video's cards have settled (`cardsAt`) the
   real cards, every one a link, take over on top of it, pixel for pixel.

   16 Oct, from testing on iPhones: the bar drags (mouse or finger), not
   just clicks; and where the phone refuses to play on its own (Low Power
   Mode), the film starts on the reader's next touch while it is on screen.
   ========================================================================== */

const fmt = (t: number) => `0:${String(Math.floor(t)).padStart(2, '0')}`

type El = RefObject<HTMLElement | null>

export function useFilmVideo(o: {
  /** false in the export, which seeks the coded timeline instead */
  on: boolean
  section: El
  pin: El
  win: El
  halo: El
  tag: El
  controls: El
  video: RefObject<HTMLVideoElement | null>
  fill: El
  time: El
  fit: () => void
  seconds: number
  /** when the cards in the video have settled and the live ones take over */
  cardsAt: number
  /** the screens that get the opening out of section 2's shape */
  open: string
  /** the video playing (wide or tall): the player starts over on a change */
  src: string
}) {
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [cards, setCards] = useState(false)
  const userPaused = useRef(false)
  /* the film is in view and should be rolling (start/stop below) */
  const wanted = useRef(false)
  /* the browser refused to play it without a gesture */
  const blocked = useRef(false)
  const opts = useRef(o)
  opts.current = o

  /* ── the clock: the bar, the time, and when the live cards take over ── */
  useLayoutEffect(() => {
    const v = o.video.current
    if (!o.on || !v) return
    const { fill, time, seconds, cardsAt } = opts.current
    /* React sets `muted` as a property only; iOS lets a video play on its
       own only when it is muted in the markup too */
    v.muted = true
    v.setAttribute('muted', '')
    let raf = 0
    const paint = () => {
      const t = v.currentTime
      const p = Math.min(1, t / seconds)
      if (fill.current) {
        fill.current.style.transform = `scaleX(${p})`
        const bar = fill.current.parentElement
        bar?.style.setProperty('--p', String(p))
        bar?.setAttribute('aria-valuenow', String(Math.round(t)))
        bar?.setAttribute('aria-valuetext', `${fmt(t)} of ${fmt(seconds)}`)
      }
      if (time.current) time.current.textContent = `${fmt(t)} / ${fmt(seconds)}`
      setCards(t >= cardsAt)
    }
    const loop = () => {
      paint()
      raf = requestAnimationFrame(loop)
    }
    const onPlaying = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }
    const onPause = () => {
      cancelAnimationFrame(raf)
      paint()
    }
    const onEnded = () => {
      cancelAnimationFrame(raf)
      paint()
      setPlaying(false)
      setEnded(true)
      setCards(true)
    }
    v.addEventListener('playing', onPlaying)
    v.addEventListener('pause', onPause)
    v.addEventListener('seeked', onPause)
    v.addEventListener('ended', onEnded)
    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('seeked', onPause)
      v.removeEventListener('ended', onEnded)
    }
  }, [o.on, o.src, o.video])

  /** Play, and if the browser refuses (an iPhone in Low Power Mode blocks
   *  autoplay), rest on the cards with the play button instead of a still
   *  first frame. */
  const play = (v: HTMLVideoElement) => {
    setPlaying(true)
    v.play().catch((e: unknown) => {
      /* a pause before it started (scrolled back out) is not a refusal */
      if ((e as Error)?.name !== 'NotAllowedError') return
      blocked.current = true
      setPlaying(false)
      setEnded(true)
      setCards(true)
    })
  }

  /* ── how it arrives, and when it plays ─────────────────────────────── */
  useLayoutEffect(() => {
    const section = o.section.current
    const v = o.video.current
    if (!o.on || !section || !v) return
    const { seconds } = opts.current
    setPlaying(false)
    setEnded(false)
    setCards(false)

    const done = () => v.ended || v.currentTime >= seconds - 0.05
    const start = () => {
      wanted.current = true
      if (userPaused.current || blocked.current || done() || !v.paused) return
      section.dataset.state = 'rolling'
      play(v)
    }
    const stop = () => {
      wanted.current = false
      if (v.paused) return
      v.pause()
      setPlaying(false)
    }

    /* the file is well below the fold: fetch it before the reader gets there */
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        v.preload = 'auto'
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
      { open: opts.current.open, reduce: '(prefers-reduced-motion: reduce)', always: 'all' },
      (ctx) => {
        const { open, reduce } = ctx.conditions as { open: boolean; reduce: boolean }

        /* reduced motion: wait on the cards, play on request */
        if (reduce) {
          setEnded(true)
          setCards(true)
          return
        }

        /* phones on their side, short windows: a 16:9 band that plays
           when most of it is on screen */
        if (!open) {
          const io = new IntersectionObserver(([e]) => (e.intersectionRatio >= 0.55 ? start() : stop()), {
            threshold: [0, 0.55],
          })
          io.observe(section)
          return () => io.disconnect()
        }

        /* big screens and upright phones: out of section 2's last shape */
        const { pin, win, halo, tag, controls } = opts.current
        return openFilm({
          section,
          pin: pin.current!,
          win: win.current!,
          halo: halo.current!,
          tag: tag.current!,
          controls: controls.current!,
          fit: () => opts.current.fit(),
          start,
          stop,
          rewind: () => {
            if (v.currentTime > 0 && v.currentTime < 3) {
              v.pause()
              v.currentTime = 0
              setPlaying(false)
            }
          },
        })
      },
      section,
    )

    /* refused (an iPhone in Low Power Mode): any touch, click or key while
       the film is in view counts as the gesture the phone wants, so it
       rolls from the top then. Not one on the controls: they do their own. */
    const controls = opts.current.controls
    const retry = (e: Event) => {
      if (!blocked.current || !wanted.current || userPaused.current) return
      if (controls.current?.contains(e.target as Node)) return
      blocked.current = false
      setEnded(false)
      setCards(false)
      v.currentTime = 0
      section.dataset.state = 'rolling'
      play(v)
    }
    const GESTURES = ['touchend', 'pointerup', 'keydown'] as const
    GESTURES.forEach((t) => window.addEventListener(t, retry, { capture: true, passive: true }))

    return () => {
      mm.revert()
      near.disconnect()
      GESTURES.forEach((t) => window.removeEventListener(t, retry, { capture: true }))
      wanted.current = false
      blocked.current = false
    }
  }, [o.on, o.src, o.section, o.video])

  /* While the film plays, the bar steps out of the way: it hides after two
     seconds without the mouse moving, and any movement (or a tap) brings it
     back. Paused or finished, it stays. */
  const [idle, setIdle] = useState(false)
  useLayoutEffect(() => {
    const pin = o.pin.current
    if (!pin || !o.on) return
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
  }, [playing, o.on, o.pin])

  const toggle = () => {
    const v = o.video.current
    if (!v) return
    o.section.current?.setAttribute('data-state', 'rolling')
    userPaused.current = false
    blocked.current = false
    if (ended) {
      setEnded(false)
      setCards(false)
      v.currentTime = 0
      play(v)
    } else if (playing) {
      userPaused.current = true
      v.pause()
      setPlaying(false)
    } else {
      play(v)
    }
  }

  /* ── the bar: click or drag to any point, arrows to step ─────────────── */
  const drag = useRef<{ resume: boolean } | null>(null)

  const seekTo = (t: number) => {
    const v = o.video.current
    if (!v) return
    const at = Math.min(o.seconds, Math.max(0, t))
    v.currentTime = at
    /* the bar follows the finger at once, not when the frame has decoded */
    const p = at / o.seconds
    const fill = o.fill.current
    if (fill) {
      fill.style.transform = `scaleX(${p})`
      fill.parentElement?.style.setProperty('--p', String(p))
    }
    if (o.time.current) o.time.current.textContent = `${fmt(at)} / ${fmt(o.seconds)}`
    setEnded(p >= 1)
    setCards(p >= 1 || at >= o.cardsAt)
  }

  const pointAt = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * o.seconds
  }

  const release = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    delete e.currentTarget.dataset.drag
    const v = o.video.current
    if (!v) return
    if (d.resume && v.currentTime < o.seconds - 0.05) {
      userPaused.current = false
      play(v)
    } else {
      setPlaying(false)
    }
  }

  const scrub = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      const v = o.video.current
      if (!v || e.button > 0) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      /* the film holds still under the finger, and carries on from where
         it is let go if it was playing */
      drag.current = { resume: !v.paused }
      if (!v.paused) v.pause()
      e.currentTarget.dataset.drag = 'true'
      o.section.current?.setAttribute('data-state', 'rolling')
      blocked.current = false
      seekTo(pointAt(e))
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (drag.current) seekTo(pointAt(e))
    },
    onPointerUp: release,
    onPointerCancel: release,
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      const v = o.video.current
      if (!v) return
      const step = ({ ArrowLeft: -5, ArrowRight: 5, Home: -o.seconds, End: o.seconds } as Record<string, number>)[e.key]
      if (step === undefined) return
      e.preventDefault()
      seekTo(v.currentTime + step)
    },
  }

  return { playing, ended, cards, idle, toggle, scrub }
}
