import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { asciiChips, homeHero } from '@/content/home'
import { IconArrowUpRight } from '@/components/icons'
import { AskBar, Pillars } from '@/components/home/HomeParts'
import { MegaNav } from '@/components/home/MegaNav'
import { Seg } from '@/components/home/LiveHero'
import { useRage, type Rage } from '@/components/home/useRage'
import { reducedMotion } from '@/components/home/gl'
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

   He then asked (31 Oct) for three heroes each a different idea outright,
   none of them the wordmark across the top, every one ending in the film
   full screen, playing from its start (reel.ts):

     doors   /home-doors   the hero as two doors, the headline split across
                           the seam and the coloured light leaking through
                           it; the questions on the left door and the right;
                           scrolling swings them open onto the film
     prompt  /home-prompt  the hero as one giant prompt that types the
                           questions itself and takes the visitor's own; the
                           film opens out of its round send button
     ring    /home-ring    UMM's work on a turning ring of cards across the
                           top; scrolling grows the front card into the film

   Krish took to the ring (31 Oct) and asked for it laid out three more ways
   (Ring.ts, its looks):

     ring-hero     /home-ring-hero     the ring as the hero: the full width,
                                       large cards running off both edges,
                                       the headline on one line above it and
                                       the front card's title under it
     ring-inside   /home-ring-inside   inside the ring: the cards curve round
                                       the visitor, the headline in the middle
     ring-horizon  /home-ring-horizon  the headline and ask bar on top, the
                                       ring low and half under the fold

   Each mark is its own module (Tiles.ts, GlassMark.ts, Window.ts, Peek.ts,
   Doors.ts, PromptFilm.ts, Ring.ts), loaded
   only for its own page. Under all three, a shader on white (Glow.ts, from
   Krish's reference of 30 Oct): a glow, a mesh, an aurora, silk or a halo,
   in one palette or turning through them all; or the live homepage's grey.
   They are kept in ?bg= and ?tone=, and ?options adds a dock to switch
   between everything.
   ========================================================================== */

export type Version =
  | 'doors'
  | 'prompt'
  | 'ring'
  | 'ring-hero'
  | 'ring-inside'
  | 'ring-horizon'
  | 'tiles'
  | 'glass'
  | 'window'
  | 'peek'

/** the ring's three later layouts: no pillars, the ring has their room */
const RING_LAYOUTS: Version[] = ['ring-hero', 'ring-inside', 'ring-horizon']

const VERSIONS: { id: Version; label: string; hint: string }[] = [
  {
    id: 'doors',
    label: 'Doors',
    hint: 'Two doors, the headline split across the seam and coloured light leaking through it. Scroll and they swing open onto the film.',
  },
  {
    id: 'prompt',
    label: 'Prompt',
    hint: 'One giant prompt that types the questions by itself and takes your own. Scroll and the film opens out of its send button.',
  },
  {
    id: 'ring',
    label: 'Work ring',
    hint: 'UMM’s work on a slowly turning ring of cards; drag it round. Scroll and the front card grows into the film.',
  },
  {
    id: 'ring-hero',
    label: 'Ring · hero',
    hint: 'The ring as the hero: full width, large cards running off both edges, the front card’s title under it.',
  },
  {
    id: 'ring-inside',
    label: 'Ring · inside',
    hint: 'Inside the ring: the cards curve round you on both sides, the headline in the middle.',
  },
  {
    id: 'ring-horizon',
    label: 'Ring · horizon',
    hint: 'The headline and ask bar on top; the ring low on the screen, half under the fold, seen from above.',
  },
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

/** the shaders, and the live homepage's plain grey */
type Bg = Shader | 'none'

const BGS: { id: Bg; label: string; hint: string }[] = [
  ...SHADERS,
  { id: 'none', label: 'Grey', hint: 'No shader: the live homepage’s grey ground, #DEDEDE.' },
]

const pick = <T extends string>(v: string | null, from: { id: T }[], or: T) =>
  from.some((x) => x.id === v) ? (v as T) : or

export const VERSION_PATHS: Record<Version, string> = {
  doors: '/home-doors',
  prompt: '/home-prompt',
  ring: '/home-ring',
  'ring-hero': '/home-ring-hero',
  'ring-inside': '/home-ring-inside',
  'ring-horizon': '/home-ring-horizon',
  tiles: '/home-tiles',
  glass: '/home-glass',
  window: '/home-window',
  peek: '/home-peek',
}

type Make = (host: MarkHost) => MarkEngine

const ENGINES: Record<Version, () => Promise<Make>> = {
  doors: () => import('@/components/home/Doors').then((m) => (h: MarkHost) => new m.Doors(h)),
  prompt: () => import('@/components/home/PromptFilm').then((m) => (h: MarkHost) => new m.PromptFilm(h)),
  ring: () => import('@/components/home/Ring').then((m) => (h: MarkHost) => new m.Ring(h)),
  'ring-hero': () => import('@/components/home/Ring').then((m) => (h: MarkHost) => new m.Ring(h, 'hero')),
  'ring-inside': () => import('@/components/home/Ring').then((m) => (h: MarkHost) => new m.Ring(h, 'inside')),
  'ring-horizon': () => import('@/components/home/Ring').then((m) => (h: MarkHost) => new m.Ring(h, 'horizon')),
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

function Hero({ version, bg, tone }: { version: Version; bg: Bg; tone: Tone }) {
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
          made = make({ run: run.current, page: page.current, layer: layer.current, stage: stage.current, ground })
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
  }, [version, ground])

  /* the shader behind everything, unless the ground is the grey; a change
     of shader or palette is made in place */
  const glow = useRef<Glow | null>(null)
  const first = useRef({ bg, tone })
  useEffect(() => {
    const { bg: b, tone: t } = first.current
    if (ground !== 'glow' || b === 'none' || !layer.current || !page.current) return
    const pg = page.current
    try {
      glow.current = new Glow(layer.current, pg, () => pg.querySelector<HTMLElement>('.hx__bar, .hx__big-field'), b, t)
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
  /* the question rested on, for the prompt to type */
  const [hot, setHot] = useState<string | null>(null)
  const show = (i: number, side: Focus['side'], el: HTMLElement, wait: number) => {
    const r = el.getBoundingClientRect()
    const q: Focus = { i, side, x: r.left + r.width / 2, y: r.top + r.height / 2 }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      engine.current?.focus(q)
      setHot(asciiChips[i].q)
    }, wait)
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    engine.current?.focus(null)
    setHot(null)
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

        {version === 'doors' ? (
          <div className="hx__doors" ref={stage}>
            <div className="hx__door hx__door--a">
              <p className="hx__half" aria-hidden="true">
                <span>{homeHero.title[0]}</span>
              </p>
              <p className="hx__whole" aria-hidden="true">
                {homeHero.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              {chips(SIDES[0])}
            </div>
            <div className="hx__door hx__door--b">
              <p className="hx__half" aria-hidden="true">
                <span>{homeHero.title[1]}</span>
              </p>
              {chips(SIDES[1])}
            </div>
            <h1 className="hm-sr">{homeHero.title.join(' ')}</h1>
            <div className="hx__ask hx__seam">
              <AskBar rage={rage} className="ha__ask hx__bar" />
            </div>
          </div>
        ) : version === 'prompt' ? (
          <PromptBody rage={rage} stage={stage} hot={hot} chips={chips} />
        ) : (
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
        )}

        {version !== 'doors' && version !== 'prompt' && !RING_LAYOUTS.includes(version) && (
          <Pillars className="hx__pillars" />
        )}
      </div>
    </section>
  )
}

/** The prompt's own words while it waits: the bar's question, then each of
 *  the six, typed, held and taken back in turn; a question rested on is
 *  typed at once and held. */
function useDemo(active: boolean, hot: string | null) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!active) return
    const seq = hot ? [hot] : [homeHero.placeholder, ...asciiChips.map((c) => c.q)]
    if (reducedMotion()) {
      setText(seq[0])
      return
    }
    let alive = true
    let t = 0
    let i = 0
    const later = (fn: () => void, ms: number) => {
      t = window.setTimeout(() => alive && fn(), ms)
    }
    const type = (s: string, n: number) => {
      setText(s.slice(0, n))
      if (n < s.length) later(() => type(s, n + 1), hot ? 14 : 42 + Math.random() * 34)
      else if (!hot) later(() => untype(s, n), 2100)
    }
    const untype = (s: string, n: number) => {
      setText(s.slice(0, n))
      if (n > 0) later(() => untype(s, n - 1), 13)
      else {
        i = (i + 1) % seq.length
        later(() => type(seq[i], 1), 420)
      }
    }
    later(() => type(seq[0], 1), hot ? 0 : 900)
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [active, hot])
  return text
}

/** The prompt hero: a line of the headline, the giant prompt with its round
 *  send button (a window onto the film, PromptFilm.ts), the questions left
 *  and right under it. */
function PromptBody({
  rage,
  stage,
  hot,
  chips,
}: {
  rage: Rage
  stage: RefObject<HTMLDivElement | null>
  hot: string | null
  chips: (s: (typeof SIDES)[number]) => ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const demo = useDemo(!rage.value && !focused, hot)
  return (
    <div className="hx__prompt">
      <h1 className="hx__eyebrow">
        <span>{homeHero.title.join(' ')}</span>
      </h1>
      <form
        className="hx__big"
        data-phase={rage.phase}
        onSubmit={(e) => {
          e.preventDefault()
          if (rage.phase === 'idle') rage.go(rage.value, { typed: true })
        }}
      >
        <label className="hm-sr" htmlFor="hx-big">
          {homeHero.placeholder}
        </label>
        <div className="hx__big-field">
          <textarea
            id="hx-big"
            className="hx__big-input"
            rows={2}
            value={rage.value}
            spellCheck={false}
            autoComplete="off"
            readOnly={rage.phase !== 'idle'}
            onChange={(e) => rage.setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          {!rage.value && (
            <div className="hx__big-demo" data-focused={focused || undefined} aria-hidden="true">
              {focused ? homeHero.placeholder : demo}
              {!focused && <span className="hx__caret" />}
            </div>
          )}
        </div>
        <div className="hx__big-go-wrap" ref={stage}>
          <button type="submit" className="hx__big-go" aria-label="Ask RAGe">
            <IconArrowUpRight size={30} strokeWidth={1.75} />
          </button>
        </div>
      </form>
      <div className="hx__prompt-chips">
        {chips(SIDES[0])}
        {chips(SIDES[1])}
      </div>
    </div>
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
  const [run, setRun] = useState(0)
  const [open, setOpen] = useState(false)
  const [review] = useState(() => new URLSearchParams(window.location.search).has('options'))

  useEffect(() => {
    const q = [
      review && 'options',
      bg !== 'glow' && `bg=${bg}`,
      tone !== 'rotate' && bg !== 'none' && `tone=${tone}`,
    ]
      .filter(Boolean)
      .join('&')
    window.history.replaceState(null, '', `${VERSION_PATHS[version]}${q ? `?${q}` : ''}`)
  }, [review, version, bg, tone])

  return (
    <main
      className="hm ha hx"
      data-version={version}
      data-ground={bg === 'none' ? 'grey' : 'glow'}
      data-palette="light"
      data-dark="false"
    >
      <Hero key={`${version}-${bg === 'none'}-${run}`} version={version} bg={shown} tone={peekTone ?? tone} />

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
