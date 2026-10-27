import { useEffect, useRef, useState, type ReactNode } from 'react'
import { asciiChips, eyeFilm } from '@/content/home'
import { IconArrowUpRight } from '../icons'
import { AskBar, HomeNav, Pillars, Title } from './HomeParts'
import type { Rage } from './useRage'
import { measureAvoid } from './avoid'
import type { SceneId } from './ascii/scenes'

/* ============================================================================
   LIVE HERO — the current umm.digital hero, laid out exactly as it is, over
   the three versions' canvases (/home-ascii, -print, -particles). Each version brings its own canvas and its own
   options; the copy, the chips, the U with its film card and the hand-off to
   RAGe are the same everywhere.
   ========================================================================== */

export type Palette = 'light' | 'dark' | 'blue'

export const PALETTES: { id: Palette; label: string; hint: string }[] = [
  { id: 'light', label: 'Ink on grey', hint: 'Dark ink on the #DEDEDE ground, like the live homepage.' },
  { id: 'dark', label: 'White on black', hint: 'Light ink on black, for a night version.' },
  { id: 'blue', label: 'Eye blue', hint: 'The blue of the fibre-optic eye film, glowing on black.' },
]

/** What carries over when the showcase switches version. */
export type Shared = { scene: SceneId; palette: Palette }

/** Every version page takes these from the showcase: the version switch to
 *  put at the top of its dock, and the scene and colour to start on. */
export type VersionProps = { switcher: ReactNode; shared: Shared; onShared: (s: Shared) => void }

/** The U of the UMM mark, from the logo's own paths. */
export function MarkU() {
  return (
    <svg className="ha-u" viewBox="0 0 690 460" aria-hidden="true">
      <path d="M689.915 0C689.915 254.022 483.962 460 229.972 460V230C356.967 230 459.943 127.011 459.943 0H689.915Z" />
      <path d="M229.972 0V230C102.976 230 0 127.011 0 0H229.972Z" />
    </svg>
  )
}

type Option<T> = { id: T; label: string; hint?: string; sample?: string }

/** The buttons of one dock row. Hovering or focusing one previews it on the
 *  hero through `onPeek` (null when the pointer leaves), and the line under
 *  the row says what it does. */
function Options<T extends string | number>({
  items,
  value,
  onPick,
  onPeek,
}: {
  items: Option<T>[]
  value: T | null
  onPick: (v: T) => void
  onPeek?: (v: T | null) => void
}) {
  const [hover, setHover] = useState<T | null>(null)
  const peek = (v: T | null) => {
    setHover(v)
    onPeek?.(v)
  }
  const hint = items.find((it) => it.id === (hover ?? value))?.hint
  return (
    <>
      <div onPointerLeave={() => peek(null)} onBlur={() => peek(null)}>
        {items.map((it) => (
          <button
            key={String(it.id)}
            type="button"
            aria-pressed={value === it.id}
            onPointerEnter={() => peek(it.id)}
            onFocus={() => peek(it.id)}
            onClick={() => onPick(it.id)}
          >
            {it.label}
            {it.sample && (
              <span className="ha-dock__sample" aria-hidden="true">
                {it.sample}
              </span>
            )}
          </button>
        ))}
      </div>
      {items.some((it) => it.hint) && <p className="ha-dock__hint">{hint ?? ' '}</p>}
    </>
  )
}

/** One row of the options dock. */
export function Seg<T extends string | number>({
  label,
  items,
  value,
  onPick,
  onPeek,
}: {
  label: string
  items: Option<T>[]
  value: T
  onPick: (v: T) => void
  onPeek?: (v: T | null) => void
}) {
  return (
    <fieldset className="ha-dock__set">
      <legend>{label}</legend>
      <Options items={items} value={value} onPick={onPick} onPeek={onPeek} />
    </fieldset>
  )
}

/** The dock's scene row. */
export function SceneSet<T extends string>({
  items,
  value,
  onPick,
  onPeek,
  label = 'Scene',
}: {
  items: Option<T>[]
  value: T
  onPick: (v: T) => void
  onPeek?: (v: T | null) => void
  label?: string
}) {
  return (
    <fieldset className="ha-dock__set">
      <legend>{label}</legend>
      <Options items={items} value={value} onPick={onPick} onPeek={onPeek} />
    </fieldset>
  )
}

export function LiveHero({
  rage,
  palette,
  version,
  canvas,
  onChip,
  onChipLeave,
  dock,
  children,
}: {
  rage: Rage
  palette: Palette
  /** a class hook for version-specific styling */
  version: string
  /** the version's background: a canvas, usually */
  canvas: ReactNode
  /** a chip was hovered or focused: show its scene */
  onChip?: (i: number) => void
  onChipLeave?: () => void
  /** the dock's rows */
  dock: ReactNode
  children?: ReactNode
}) {
  const [open, setOpen] = useState(() => window.innerWidth >= 900)
  const root = useRef<HTMLElement>(null)

  /* tell the landing scene where the copy is, and again whenever it moves */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const run = () => {
      const cv = el.querySelector<HTMLElement>('.ha__gl')
      if (cv) measureAvoid(el, cv)
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(el)
    document.fonts?.ready.then(run)
    const late = window.setTimeout(run, 600)
    return () => {
      ro.disconnect()
      window.clearTimeout(late)
    }
  }, [])

  return (
    <main
      ref={root}
      className={`hm ha ha--${version}`}
      data-phase={rage.phase}
      data-palette={palette}
      data-dark={palette !== 'light'}
    >
      {canvas}
      <HomeNav />

      <div className="ha__center">
        <AskBar rage={rage} className="ha__ask" />
        <ul className="ha__chips" aria-label="Ask RAGe">
          {asciiChips.map((c, i) => (
            <li key={c.q}>
              <button
                type="button"
                className="ha__chip"
                disabled={rage.busy}
                onPointerEnter={() => onChip?.(i)}
                onPointerLeave={() => onChipLeave?.()}
                onFocus={() => onChip?.(i)}
                onClick={() => rage.go(c.q)}
              >
                <span>{c.q}</span>
                <IconArrowUpRight className="ha__chip-go" size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Title className="ha__title" />

      <div className="ha__film">
        <MarkU />
        <div className="ha__card">
          {/* the eye film is not on the live site yet: drop it at
              public/home/eye.mp4 and it plays; until then, the live reel */}
          <video autoPlay muted loop playsInline preload="metadata">
            <source src="/home/eye.mp4" type="video/mp4" />
            <source src={eyeFilm} type="video/webm" />
          </video>
        </div>
      </div>

      <Pillars className="ha__pillars" />
      {children}

      <aside className="ha-dock" data-open={open} aria-label="Hero options">
        <button type="button" className="ha-dock__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide options' : 'Options'}
        </button>
        {open && <div className="ha-dock__body">{dock}</div>}
      </aside>
    </main>
  )
}
