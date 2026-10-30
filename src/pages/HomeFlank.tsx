import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { asciiChips, homeHero } from '@/content/home'
import { IconArrowUpRight } from '@/components/icons'
import { AskBar, Pillars } from '@/components/home/HomeParts'
import { MegaNav } from '@/components/home/MegaNav'
import { Seg } from '@/components/home/LiveHero'
import { useRage } from '@/components/home/useRage'
import { Glow } from '@/components/home/Glow'
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
     window  /home-window  the mark cut out of the page, the film behind it;
                           scrolling dives through it into the film

   Each mark is its own module (Tiles.ts, GlassMark.ts, Window.ts), loaded
   only for its own page. Under all three, by default, the white ground with
   a magenta glow rising behind the ask bar (Glow.ts, Krish's reference of
   30 Oct); the live homepage's grey is the other ground, kept in ?ground=.
   ?options adds a dock to switch between them.
   ========================================================================== */

export type Version = 'tiles' | 'glass' | 'window'

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
    hint: 'The mark cut out of the page, the film playing behind it. Scroll to dive through the mark into the film.',
  },
]

const GROUNDS: { id: Ground; label: string; hint: string }[] = [
  { id: 'glow', label: 'Glow', hint: 'White, with a magenta glow rising behind the ask bar that leans toward the cursor.' },
  { id: 'grey', label: 'Grey', hint: 'The live homepage’s grey ground, #DEDEDE.' },
]

export const VERSION_PATHS: Record<Version, string> = {
  tiles: '/home-tiles',
  glass: '/home-glass',
  window: '/home-window',
}

type Make = (host: MarkHost) => MarkEngine

const ENGINES: Record<Version, () => Promise<Make>> = {
  tiles: () => import('@/components/home/Tiles').then((m) => (h: MarkHost) => new m.Tiles(h)),
  glass: () => import('@/components/home/GlassMark').then((m) => (h: MarkHost) => new m.GlassMark(h)),
  window: () => import('@/components/home/Window').then((m) => (h: MarkHost) => new m.Window(h)),
}

/** How long a question must be rested on before the mark answers it (ms) */
const REST = 450

const SIDES = [
  { side: 'left', chips: asciiChips.slice(0, 3), from: 0 },
  { side: 'right', chips: asciiChips.slice(3), from: 3 },
] as const

function Hero({ version, ground }: { version: Version; ground: Ground }) {
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

  /* the glow behind everything, when the ground is the glow */
  useEffect(() => {
    if (ground !== 'glow' || !layer.current || !page.current) return
    const pg = page.current
    let glow: Glow | null = null
    try {
      glow = new Glow(layer.current, pg, () => pg.querySelector<HTMLElement>('.hx__bar'))
    } catch {
      return
    }
    return () => glow?.dispose()
  }, [ground])

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
  const [ground, setGround] = useState<Ground>(() =>
    new URLSearchParams(window.location.search).get('ground') === 'grey' ? 'grey' : 'glow',
  )
  const [run, setRun] = useState(0)
  const [open, setOpen] = useState(false)
  const [review] = useState(() => new URLSearchParams(window.location.search).has('options'))

  useEffect(() => {
    const q = [review && 'options', ground === 'grey' && 'ground=grey'].filter(Boolean).join('&')
    window.history.replaceState(null, '', `${VERSION_PATHS[version]}${q ? `?${q}` : ''}`)
  }, [review, version, ground])

  return (
    <main className="hm ha hx" data-version={version} data-ground={ground} data-palette="light" data-dark="false">
      <Hero key={`${version}-${ground}-${run}`} version={version} ground={ground} />

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
              <Seg label="Ground" items={GROUNDS} value={ground} onPick={setGround} />
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
