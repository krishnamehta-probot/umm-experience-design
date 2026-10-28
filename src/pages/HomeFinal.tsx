import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { asciiChips, eyeFilm, homeHero } from '@/content/home'
import { IconArrowUpRight } from '@/components/icons'
import { AskBar, Pillars, useScene } from '@/components/home/HomeParts'
import { MegaNav } from '@/components/home/MegaNav'
import { Seg } from '@/components/home/LiveHero'
import { EFFECTS, type Effect } from '@/components/home/ascii/DeckStage'
import { PrintScene } from '@/components/home/ascii/PrintScene'
import type { SceneId } from '@/components/home/ascii/scenes'
import { reducedMotion } from '@/components/home/gl'
import { useDeck } from '@/components/home/useDeck'
import { useRage } from '@/components/home/useRage'
import uUrl from '@/assets/home/umm-u.svg'
import sparkleUrl from '@/assets/home/film-sparkle.svg'
import pinchUrl from '@/assets/home/film-pinch.svg'
import softUrl from '@/assets/home/film-soft.svg'
import '@/styles/home-final.css'

/* ============================================================================
   HOME · FINAL (/home-final)

   The version the boss chose on 26 Oct: Print, engraving, ink on the grey
   ground, the UMM mark. Nothing may sit on the mark, so the canvas is a
   stage of its own in a grid, and every piece of copy has its own box. The
   mark all but holds still (a slow drift, a small lean), and the ink is
   drawn toward the cursor (Magnetic) or makes way for it (Repel).

   Krish asked (27 Oct) for the layouts as options, so the Options dock has
   four (the boss's composition with the mark raised above the ask bar is
   the default), the grey or a pure white ground, four shapes for the film
   (the U, and the three sparkles Krish drew: sharp, pinched square, soft),
   three ways for it to come in, the two cursor effects, and a replay of the whole entrance. The
   choices are kept in ?layout=, ?ground=, ?shape=, ?film= and ?cursor=,
   and a link carrying them opens on them with or without the dock. The dock shows only with ?options, so the
   plain link is the page as it will ship.

   The film sits inside the U, the quarter-circle shape from the mark, as a
   still, and the scroll sets it going and grows it: the hero holds while
   the U opens out of its corner until the film covers the whole screen
   (useGrow). Scrolling back to the top pauses it again.

   The entrance, slow and in reading order: the nav, the mark printing
   itself in from the left, the ask bar, the questions one after another,
   the headline rising line by line, the pillars; the film's still comes
   in last. Asking prints RAGe's name and
   hands over to RAGe, as everywhere.
   ========================================================================== */

type Layout = 'stack' | 'ask' | 'split' | 'side'

const LAYOUTS: { id: Layout; label: string; hint: string }[] = [
  {
    id: 'stack',
    label: 'Mark on top',
    hint: 'The boss’s layout with the mark raised into its own band: the ask bar and questions under it, the headline bottom left, the film bottom right.',
  },
  {
    id: 'ask',
    label: 'Ask on top',
    hint: 'The ask bar and questions under the nav, the mark across the middle, the headline bottom left, the film bottom right.',
  },
  {
    id: 'split',
    label: 'Copy left',
    hint: 'The headline, ask bar and questions on the left; the mark on the right, with the film under it.',
  },
  {
    id: 'side',
    label: 'Mark left',
    hint: 'The mark top left and the film top right; the headline under the mark, the questions as a list beside it.',
  },
]

type Ground = 'grey' | 'white'

const GROUNDS: { id: Ground; label: string; hint: string }[] = [
  { id: 'grey', label: 'Grey', hint: 'The live homepage’s grey ground, #DEDEDE.' },
  { id: 'white', label: 'White', hint: 'Pure white: the engraving and the outlines of the questions carry the page.' },
]

type FilmIn = 'sweep' | 'unfold' | 'drop'

const FILMS: { id: FilmIn; label: string; hint: string }[] = [
  {
    id: 'sweep',
    label: 'Quarter sweep',
    hint: 'The shape opens like a fan about its own centre (the U: the big quarter, then the small one), the film’s still inside it.',
  },
  {
    id: 'unfold',
    label: 'Unfold',
    hint: 'The shape is drawn open from left to right, gliding into place, the film’s still inside it.',
  },
  {
    id: 'drop',
    label: 'Drop',
    hint: 'The shape falls from the top of the screen and lands with a small bounce, the film’s still inside it.',
  },
]

type Cursor = Extract<Effect, 'magnet' | 'repel'>

/** The two cursor effects offered here, the magnet first */
const CURSORS = (['magnet', 'repel'] as const).map((id) => ({ ...EFFECTS.find((e) => e.id === id)!, id }))

/** When the film comes in, once the rest of the page has (ms) */
const FILM_AT = 2200
/** The frame the U holds until the scroll sets the film going (s): in the
 *  live reel, the phones on black, which reads in a small U on the grey.
 *  Worth choosing again when the eye film lands at public/home/eye.mp4. */
const STILL_AT = 3.5

type Shape = 'u' | 'sparkle' | 'pinch' | 'soft'

/**
 * The shapes the film plays in, each with what the page needs of it:
 *   w, h        its drawing's size (the box's proportions follow it)
 *   size        the box's height as a share of the film's height: the
 *               sparkles are cut in at the sides, so they sit a little taller
 *   fx, fy      its deepest point, the place furthest from any edge, as a
 *   depth       share of the box, and how far that is in drawing units; the
 *               scroll grows the shape out of it, so the film covers the
 *               screen as the growing ends
 *   px, py      the centre the sweep entrance fans about, and the angle the
 *   from, to    fan starts at and turns through (0 is straight up, turning
 *               clockwise), covering the shape exactly
 */
const SHAPES: {
  id: Shape
  label: string
  hint: string
  url: string
  w: number
  h: number
  size: number
  fx: number
  fy: number
  depth: number
  px: string
  py: string
  from: number
  to: number
}[] = [
  {
    id: 'u',
    label: 'U',
    hint: 'The U from the mark: two quarter circles about one centre.',
    url: uUrl,
    w: 690,
    h: 460,
    size: 1,
    fx: 474 / 690,
    fy: 244 / 460,
    depth: 115,
    px: '33.333%',
    py: '0%',
    from: 90,
    to: 185,
  },
  {
    id: 'sparkle',
    label: 'Sparkle',
    hint: 'Four sharp points, the sides drawn in between them.',
    url: sparkleUrl,
    w: 400,
    h: 400,
    size: 1.12,
    fx: 0.5,
    fy: 0.5,
    depth: 80,
    px: '50%',
    py: '50%',
    from: 0,
    to: 360,
  },
  {
    id: 'pinch',
    label: 'Pinch',
    hint: 'A square with its four sides drawn in, its corners sharp.',
    url: pinchUrl,
    w: 400,
    h: 400,
    size: 1.06,
    fx: 0.5,
    fy: 0.5,
    depth: 116,
    px: '50%',
    py: '50%',
    from: 0,
    to: 360,
  },
  {
    id: 'soft',
    label: 'Soft sparkle',
    hint: 'Four rounded points over a fuller middle.',
    url: softUrl,
    w: 400,
    h: 400,
    size: 1.12,
    fx: 0.5,
    fy: 0.5,
    depth: 100,
    px: '50%',
    py: '50%',
    from: 0,
    to: 360,
  },
]

const shapeOf = (id: string | undefined) => SHAPES.find((x) => x.id === id) ?? SHAPES[0]

/** How far the hero holds while the U grows, in screen heights */
const RUNWAY = 1.3

const pick = <T extends string>(v: string | null, from: { id: T }[], or: T) =>
  from.some((x) => x.id === v) ? (v as T) : or

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** The film inside its shape, held on its still (STILL_AT). Its entrance
 *  waits `delay` ms and for the shape to be on screen (on a phone it can be
 *  below the fold), then plays; the film itself is set going by the scroll
 *  (useGrow). */
function Film({ mode, shape, delay }: { mode: FilmIn; shape: Shape; delay: number }) {
  const sh = shapeOf(shape)
  const ref = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const calm = reducedMotion()
    let ready = false
    let seen = false
    let done = false
    const timers: number[] = []
    const go = () => {
      if (done || !ready || !seen) return
      done = true
      io.disconnect()
      /* the drop starts above the top of the screen, wherever the shape sits */
      const r = el.getBoundingClientRect()
      el.style.setProperty('--fall', `${-Math.round(r.top + r.height + 24)}px`)
      setOn(true)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.intersectionRatio >= 0.4
        go()
      },
      { threshold: [0, 0.4, 1] },
    )
    io.observe(el)
    timers.push(
      window.setTimeout(
        () => {
          ready = true
          go()
        },
        calm ? 200 : delay,
      ),
    )
    return () => {
      io.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [mode, delay])

  return (
    <div
      className="hf__film"
      ref={ref}
      data-film={mode}
      data-shape={shape}
      data-on={on || undefined}
      style={
        {
          '--ar': sh.w / sh.h,
          '--hs': sh.size,
          '--px': sh.px,
          '--py': sh.py,
          '--fan-from': `${sh.from}deg`,
          '--fan-to': `${sh.to}deg`,
        } as CSSProperties
      }
    >
      <div className="hf__u" style={{ '--u': `url("${sh.url}")` } as CSSProperties}>
        {/* the eye film is not on the live site yet: drop it at
            public/home/eye.mp4 and it plays; until then, the live reel */}
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            if (v.paused && v.currentTime < 0.1) v.currentTime = Math.min(STILL_AT, Math.max(0, v.duration - 0.1))
          }}
        >
          <source src="/home/eye.mp4" type="video/mp4" />
          <source src={eyeFilm} type="video/webm" />
        </video>
      </div>
    </div>
  )
}

/**
 * The scroll growing the U. The hero is held (sticky, its foot on the
 * screen's foot when it is taller than the screen) across a runway of
 * RUNWAY screens, and over it the U opens out of its deepest point, which
 * drifts to the middle of the screen, at an even pace (each step of scroll
 * grows it by the same factor) until its ring is wider than the screen in
 * every direction. The film inside grows with it: it always fills the part
 * of the U's box that is on screen, so it fills the U as it rests and the
 * screen as it ends. The rest of the hero fades as the U passes over it.
 * The film plays from the first step of scroll, and pauses at the top.
 */
function useGrow(run: RefObject<HTMLElement | null>, page: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const calm = reducedMotion()
    let raf = 0
    let grown = false
    const U_KEYS = ['inset', 'left', 'top', 'width', 'height']
    const MASK_KEYS = ['mask-image', 'mask-size', 'mask-position'].flatMap((k) => [`-webkit-${k}`, k])

    const rest = (film: HTMLElement, u: HTMLElement, v: HTMLElement) => {
      if (!grown) return
      grown = false
      film.style.removeProperty('z-index')
      ;[...U_KEYS, ...MASK_KEYS].forEach((k) => u.style.removeProperty(k))
      U_KEYS.forEach((k) => v.style.removeProperty(k))
    }

    const paint = () => {
      raf = 0
      const sec = run.current
      const pg = page.current
      if (!sec || !pg) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      const pageH = pg.offsetHeight
      const pin = Math.min(0, vh - pageH)
      const runway = calm ? 0 : Math.round(vh * RUNWAY)
      sec.style.height = `${pageH + runway}px`
      pg.style.top = `${pin}px`
      const p = runway ? clamp01((pin - sec.getBoundingClientRect().top) / runway) : 0

      const film = pg.querySelector<HTMLElement>('.hf__film')
      const u = film?.querySelector<HTMLElement>('.hf__u')
      const v = u?.querySelector<HTMLVideoElement>('video')
      if (!film || !u || !v) return
      pg.style.setProperty('--fade', (1 - clamp01(p * 2.4)).toFixed(3))
      if (p > 0.005) {
        if (v.paused) v.play().catch(() => {})
      } else if (!v.paused) v.pause()
      if (p <= 0) {
        pg.removeAttribute('data-growing')
        rest(film, u, v)
        return
      }
      pg.setAttribute('data-growing', '')
      grown = true

      const k = easeInOut(clamp01(p / 0.92))
      const U = shapeOf(film.dataset.shape)
      const box = film.getBoundingClientRect()
      const w0 = box.width
      const h0 = box.height
      const w1 = (Math.hypot(vw, vh) / 2 / U.depth) * U.w * 1.08
      const w = w0 * Math.pow(w1 / w0, k)
      const h = (w * U.h) / U.w
      const d0x = box.left + U.fx * w0
      const d0y = box.top + U.fy * h0
      const mx = d0x + (vw / 2 - d0x) * k - U.fx * w
      const my = d0y + (vh / 2 - d0y) * k - U.fy * h
      /* the film fills what of the U's box is on screen */
      const x0 = Math.max(0, mx)
      const y0 = Math.max(0, my)
      const x1 = Math.min(vw, mx + w)
      const y1 = Math.min(vh, my + h)

      film.style.zIndex = '30'
      const s = u.style
      s.setProperty('inset', 'auto')
      s.setProperty('left', `${-box.left}px`)
      s.setProperty('top', `${-box.top}px`)
      s.setProperty('width', `${vw}px`)
      s.setProperty('height', `${vh}px`)
      for (const pre of ['-webkit-', '']) {
        s.setProperty(`${pre}mask-image`, 'var(--u)')
        s.setProperty(`${pre}mask-size`, `${w.toFixed(1)}px ${h.toFixed(1)}px`)
        s.setProperty(`${pre}mask-position`, `${mx.toFixed(1)}px ${my.toFixed(1)}px`)
      }
      const vs = v.style
      vs.setProperty('inset', 'auto')
      vs.setProperty('left', `${x0.toFixed(1)}px`)
      vs.setProperty('top', `${y0.toFixed(1)}px`)
      vs.setProperty('width', `${Math.max(0, x1 - x0).toFixed(1)}px`)
      vs.setProperty('height', `${Math.max(0, y1 - y0).toFixed(1)}px`)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }
    paint()
    const ro = new ResizeObserver(queue)
    if (page.current) ro.observe(page.current)
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [run, page])
}

/** The page itself. Mounted afresh to replay the entrance. */
function Hero({ film, shape, filmRun, cursor }: { film: FilmIn; shape: Shape; filmRun: number; cursor: Cursor }) {
  const rage = useRage({ leave: 1500 })
  const [canvas, engine] = useScene((c) => {
    const s = new PrintScene(c, 'logo', { style: 'engrave', palette: 'light', grain: 3, effect: cursor })
    if (!reducedMotion()) s.printIn(0.15, 2.2)
    return s
  })
  useEffect(() => {
    engine.current?.setEffect(cursor)
  }, [cursor, engine])
  /* the mark is the only scene; asking goes out through RAGe's name */
  useDeck<SceneId>({ engine, rage, chipScenes: ['logo'], exit: 'rage', rest: 'logo' })

  const run = useRef<HTMLElement>(null)
  const page = useRef<HTMLDivElement>(null)
  useGrow(run, page)

  /* the pieces come in once the first frame is painted */
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <section className="hf__run" ref={run}>
      <div className="hf__page" ref={page} data-phase={rage.phase} data-in={entered || undefined}>
        <MegaNav />

        <div className="hf__body">
          <div className="hf__stage">
            <canvas ref={canvas} className="hf__gl" aria-hidden="true" />
          </div>

          {/* each line rises out of its own mask */}
          <h1 className="hm-title hf__title">
            {homeHero.title.map((line) => (
              <span key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h1>

          <div className="hf__ask">
            <AskBar rage={rage} className="ha__ask hf__bar" />
            <ul className="hf__chips" aria-label="Ask RAGe">
              {asciiChips.map((c, i) => (
                <li key={c.q} style={{ '--i': i } as CSSProperties}>
                  <button type="button" className="ha__chip" disabled={rage.busy} onClick={() => rage.go(c.q)}>
                    <span>{c.q}</span>
                    <IconArrowUpRight className="ha__chip-go" size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* a film option picked in the dock plays its entrance again at once */}
          <Film key={`${film}-${shape}-${filmRun}`} mode={film} shape={shape} delay={filmRun ? 250 : FILM_AT} />
        </div>

        <Pillars className="hf__pillars" />
      </div>
    </section>
  )
}

export function HomeFinal() {
  const [layout, setLayout] = useState<Layout>(() =>
    pick(new URLSearchParams(window.location.search).get('layout'), LAYOUTS, 'stack'),
  )
  const [ground, setGround] = useState<Ground>(() =>
    pick(new URLSearchParams(window.location.search).get('ground'), GROUNDS, 'grey'),
  )
  const [shape, setShape] = useState<Shape>(() =>
    pick(new URLSearchParams(window.location.search).get('shape'), SHAPES, 'u'),
  )
  const [film, setFilm] = useState<FilmIn>(() =>
    pick(new URLSearchParams(window.location.search).get('film'), FILMS, 'sweep'),
  )
  const [cursor, setCursor] = useState<Cursor>(() =>
    pick(new URLSearchParams(window.location.search).get('cursor'), CURSORS, 'magnet'),
  )
  const [run, setRun] = useState(0)
  const [filmRun, setFilmRun] = useState(0)
  const [open, setOpen] = useState(false)
  const [review] = useState(() => new URLSearchParams(window.location.search).has('options'))

  useEffect(() => {
    if (!review) return
    window.history.replaceState(
      null,
      '',
      `/home-final?options&layout=${layout}&ground=${ground}&shape=${shape}&film=${film}&cursor=${cursor}`,
    )
  }, [review, layout, ground, shape, film, cursor])

  return (
    <main className="hm ha hf" data-layout={layout} data-ground={ground} data-palette="light" data-dark="false">
      <Hero key={run} film={film} shape={shape} filmRun={filmRun} cursor={cursor} />

      {review && (
        <aside className="ha-dock" data-open={open} aria-label="Homepage options">
          <button type="button" className="ha-dock__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? 'Hide options' : 'Options'}
          </button>
          {open && (
            <div className="ha-dock__body">
              <Seg label="Layout" items={LAYOUTS} value={layout} onPick={setLayout} />
              <Seg label="Background" items={GROUNDS} value={ground} onPick={setGround} />
              <Seg
                label="Film shape"
                items={SHAPES}
                value={shape}
                onPick={(x) => {
                  window.scrollTo({ top: 0, behavior: 'instant' })
                  setShape(x)
                  setFilmRun((n) => n + 1)
                }}
              />
              <Seg
                label="Film entrance"
                items={FILMS}
                value={film}
                onPick={(f) => {
                  window.scrollTo({ top: 0, behavior: 'instant' })
                  setFilm(f)
                  setFilmRun((n) => n + 1)
                }}
              />
              <Seg label="Cursor" items={CURSORS} value={cursor} onPick={setCursor} />
              <button
                type="button"
                className="hf-replay"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' })
                  setFilmRun(0)
                  setRun((n) => n + 1)
                }}
              >
                Replay the entrance
              </button>
            </div>
          )}
        </aside>
      )}
    </main>
  )
}
