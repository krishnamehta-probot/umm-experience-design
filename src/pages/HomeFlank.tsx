import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { asciiChips, homeHero } from '@/content/home'
import { IconArrowUpRight } from '@/components/icons'
import { AskBar, Pillars } from '@/components/home/HomeParts'
import { MegaNav } from '@/components/home/MegaNav'
import { Seg } from '@/components/home/LiveHero'
import { useRage } from '@/components/home/useRage'
import { Glow, SHADERS, TONES, type Shader, type Tone } from '@/components/home/Glow'
import type { Focus, Ground, MarkEngine, MarkHost } from '@/components/home/mark'
import markUrl from '@/assets/home/umm-mark.svg'
import '@/styles/home-flank.css'

/* ============================================================================
   HOME · FLANK — three new heroes for Santosh's review (30 Oct)

   He did not take to /home-final. He wants the UMM mark kept and the
   questions to the left and right of the ask bar, not centred under it, and
   is open to anything for the mark itself. So all three share one layout
   (the mark across the top; the ask bar in the middle with three questions on
   each side; the headline and pillars along the foot) and differ in the mark:

     tiles   /home-tiles   the mark as a board of quarter-circle tiles that
                           turn over into a picture of each question
     glass   /home-glass   the mark as a thick piece of glass, lit by the cursor
     window  /home-window  the mark in black; scrolling dives into it, and the
                           film fades in and plays as it fills the screen

   On 31 Oct Santosh turned from the wordmark across the top, so a fourth
   layout drops it:

     peek    /home-peek    the headline and the ask bar hold the screen, and
                           the reel peeks up from its foot as a wide card that
                           grows to fill the screen as the visitor scrolls

   Each mark is its own module (Tiles.ts, GlassMark.ts, Window.ts, Peek.ts), loaded
   only for its own page. Under all three, a shader on white (Glow.ts, from
   Krish's reference of 30 Oct): a glow, a mesh, an aurora, silk or a halo,
   in one palette or turning through them all; or the live homepage's grey.
   They are kept in ?bg= and ?tone=, and ?options adds a dock to switch
   between everything.
   ========================================================================== */

export type Version = 'tiles' | 'glass' | 'window' | 'peek'

const VERSIONS: { id: Version; label: string; hint: string }[] = [
  {
    id: 'tiles',
    label: 'Kinetic tiles',
    hint: 'The mark as a board of quarter-circle tiles. Rest on a question and the tiles turn over into a picture of it, from that question’s side.',
  },
  {
    id: 'glass',
    label: 'Glass mark',
    hint: 'The mark as a thick piece of glass on the paper. The cursor is the light: the mark turns to it and its shadow moves.',
  },
  {
    id: 'window',
    label: 'Window',
    hint: 'The mark in black. Scroll to dive into it: as it fills the screen the film fades in inside it and plays.',
  },
  {
    id: 'peek',
    label: 'Film peek',
    hint: 'No wordmark: the headline and ask bar hold the screen, the reel peeks up from the foot as a card, and scrolling grows it to full screen.',
  },
]

type Film = 'play' | 'still'

const FILMS: { id: Film; label: string; hint: string }[] = [
  { id: 'play', label: 'Plays in the peek', hint: 'The reel plays, muted, in the card from the start.' },
  { id: 'still', label: 'Still until full', hint: 'The card holds a still of the reel and plays it once it fills the screen.' },
]

/** the shaders, and the live homepage's plain grey */
type Bg = Shader | 'none'

const BGS: { id: Bg; label: string; hint: string }[] = [
  ...SHADERS,
  { id: 'none', label: 'Grey', hint: 'No shader: the live homepage’s grey ground, #DEDEDE.' },
]

const pick = <T extends string>(v: string | null, from: { id: T }[], or: T) =>
  from.some((x) => x.id === v) ? (v as T) : or

export const VERSION_PATHS: Record<Version, string> = {
  tiles: '/home-tiles',
  glass: '/home-glass',
  window: '/home-window',
  peek: '/home-peek',
}

type Make = (host: MarkHost) => MarkEngine

const ENGINES: Record<Version, () => Promise<Make>> = {
  tiles: () => import('@/components/home/Tiles').then((m) => (h: MarkHost) => new m.Tiles(h)),
  glass: () => import('@/components/home/GlassMark').then((m) => (h: MarkHost) => new m.GlassMark(h)),
  window: () => import('@/components/home/Window').then((m) => (h: MarkHost) => new m.Window(h)),
  peek: () => import('@/components/home/Peek').then((m) => (h: MarkHost) => new m.Peek(h)),
}

/** How long a question must be rested on before the mark answers it (ms) */
const REST = 450

const SIDES = [
  { side: 'left', chips: asciiChips.slice(0, 3), from: 0 },
  { side: 'right', chips: asciiChips.slice(3), from: 3 },
] as const

function Hero({ version, bg, tone, film }: { version: Version; bg: Bg; tone: Tone; film: Film }) {
  const ground: Ground = bg === 'none' ? 'grey' : 'glow'
  const rage = useRage({ leave: 1500 })
  const run = useRef<HTMLElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const engine = useRef<MarkEngine | null>(null)
  /* the mark's own module could not start (no WebGL, say): the plain mark */
  const [flat, setFlat] = useState(false)

  useEffect(() => {
    let alive = true
    let made: MarkEngine | null = null
    ENGINES[version]()
      .then((make) => {
        if (!alive || !run.current || !page.current || !layer.current || !stage.current) return
        try {
          made = make({ run: run.current, page: page.current, layer: layer.current, stage: stage.current, ground, film })
          engine.current = made
        } catch {
          setFlat(true)
        }
      })
      .catch(() => alive && setFlat(true))
    return () => {
      alive = false
      made?.dispose()
      engine.current = null
    }
  }, [version, ground, film])

  /* the shader behind everything, unless the ground is the grey; a change
     of shader or palette is made in place */
  const glow = useRef<Glow | null>(null)
  const first = useRef({ bg, tone })
  useEffect(() => {
    const { bg: b, tone: t } = first.current
    if (ground !== 'glow' || b === 'none' || !layer.current || !page.current) return
    const pg = page.current
    try {
      glow.current = new Glow(layer.current, pg, () => pg.querySelector<HTMLElement>('.hx__bar'), b, t)
    } catch {
      return
    }
    return () => {
      glow.current?.dispose()
      glow.current = null
    }
  }, [ground])
  useEffect(() => {
    if (bg !== 'none') glow.current?.set(bg, tone)
  }, [bg, tone])

  useEffect(() => {
    if (rage.phase === 'leaving') engine.current?.leave()
  }, [rage.phase])

  /* the pieces come in once the first frame is painted */
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [])

  /* resting on a question (or tabbing to one) shows it to the mark */
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const show = (i: number, side: Focus['side'], el: HTMLElement, wait: number) => {
    const r = el.getBoundingClientRect()
    const q: Focus = { i, side, x: r.left + r.width / 2, y: r.top + r.height / 2 }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => engine.current?.focus(q), wait)
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    engine.current?.focus(null)
  }

  const chips = ({ side, chips: list, from }: (typeof SIDES)[number]) => (
    <ul className={`hx__chips hx__chips--${side}`} aria-label="Ask RAGe">
      {list.map((c, j) => (
        <li key={c.q} style={{ '--i': from + j } as CSSProperties}>
          <button
            type="button"
            className="ha__chip"
            disabled={rage.busy}
            onClick={() => rage.go(c.q)}
            onPointerEnter={(e: ReactPointerEvent<HTMLButtonElement>) =>
              e.pointerType === 'mouse' && show(from + j, side, e.currentTarget, REST)
            }
            onPointerLeave={hide}
            onFocus={(e) => e.currentTarget.matches(':focus-visible') && show(from + j, side, e.currentTarget, 0)}
            onBlur={hide}
          >
            <span>{c.q}</span>
            <IconArrowUpRight className="ha__chip-go" size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <section className="hx__run" ref={run}>
      <div className="hx__page" ref={page} data-phase={rage.phase} data-in={entered || undefined}>
        <div className="hx__layer" ref={layer} />
        <MegaNav />

        <div className="hx__body">
          <div className="hx__stage" ref={stage}>
            {flat && <img className="hx__flat" src={markUrl} alt="" />}
          </div>

          {chips(SIDES[0])}

          <div className="hx__ask">
            <AskBar rage={rage} className="ha__ask hx__bar" />
          </div>

          {chips(SIDES[1])}

          {/* each line rises out of its own mask */}
          <h1 className="hm-title hx__title">
            {homeHero.title.map((line) => (
              <span key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
        </div>

        <Pillars className="hx__pillars" />
      </div>
    </section>
  )
}

export function HomeFlank({ initial }: { initial: Version }) {
  const [version, setVersion] = useState<Version>(initial)
  const [bg, setBg] = useState<Bg>(() => {
    const q = new URLSearchParams(window.location.search)
    return q.get('ground') === 'grey' ? 'none' : pick(q.get('bg'), BGS, 'glow')
  })
  const [tone, setTone] = useState<Tone>(() => pick(new URLSearchParams(window.location.search).get('tone'), TONES, 'rotate'))
  /* a shader or palette shows while its option is hovered in the dock (the
     grey is not previewed: it changes the page beneath the mark) */
  const [peekBg, setPeekBg] = useState<Bg | null>(null)
  const [peekTone, setPeekTone] = useState<Tone | null>(null)
  const shown = peekBg && (peekBg === 'none') === (bg === 'none') ? peekBg : bg
  const [film, setFilm] = useState<Film>(() => pick(new URLSearchParams(window.location.search).get('film'), FILMS, 'play'))
  const [run, setRun] = useState(0)
  const [open, setOpen] = useState(false)
  const [review] = useState(() => new URLSearchParams(window.location.search).has('options'))

  useEffect(() => {
    const q = [
      review && 'options',
      bg !== 'glow' && `bg=${bg}`,
      tone !== 'rotate' && bg !== 'none' && `tone=${tone}`,
      version === 'peek' && film !== 'play' && `film=${film}`,
    ]
      .filter(Boolean)
      .join('&')
    window.history.replaceState(null, '', `${VERSION_PATHS[version]}${q ? `?${q}` : ''}`)
  }, [review, version, bg, tone, film])

  return (
    <main
      className="hm ha hx"
      data-version={version}
      data-ground={bg === 'none' ? 'grey' : 'glow'}
      data-palette="light"
      data-dark="false"
    >
      <Hero key={`${version}-${bg === 'none'}-${run}`} version={version} bg={shown} tone={peekTone ?? tone} film={film} />

      {review && (
        <aside className="ha-dock" data-open={open} aria-label="Homepage options">
          <button type="button" className="ha-dock__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? 'Hide options' : 'Options'}
          </button>
          {open && (
            <div className="ha-dock__body">
              <Seg
                label="Version"
                items={VERSIONS}
                value={version}
                onPick={(v) => {
                  window.scrollTo({ top: 0, behavior: 'instant' })
                  setVersion(v)
                }}
              />
              {version === 'peek' && (
                <Seg
                  label="Film"
                  items={FILMS}
                  value={film}
                  onPick={(f) => {
                    window.scrollTo({ top: 0, behavior: 'instant' })
                    setFilm(f)
                  }}
                />
              )}
              <Seg label="Shader" items={BGS} value={bg} onPick={setBg} onPeek={setPeekBg} />
              {bg !== 'none' && (
                <Seg label="Colour" items={TONES} value={tone} onPick={setTone} onPeek={setPeekTone} />
              )}
              <button
                type="button"
                className="hx-replay"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' })
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
