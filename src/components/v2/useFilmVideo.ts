import { useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
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
      if (fill.current) fill.current.style.transform = `scaleX(${Math.min(1, t / seconds)})`
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
      if (userPaused.current || done() || !v.paused) return
      section.dataset.state = 'rolling'
      play(v)
    }
    const stop = () => {
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

    return () => {
      mm.revert()
      near.disconnect()
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

  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const v = o.video.current
    if (!v) return
    const r = e.currentTarget.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    v.currentTime = p * o.seconds
    setEnded(p >= 1)
    setCards(p >= 1 || p * o.seconds >= o.cardsAt)
  }

  return { playing, ended, cards, idle, toggle, seek }
}
