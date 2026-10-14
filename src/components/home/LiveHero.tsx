import { useState, type ReactNode } from 'react'
import { asciiChips, eyeFilm } from '@/content/home'
import { AskBar, HomeNav, Pillars, Title } from './HomeParts'
import type { Rage } from './useRage'
import type { SceneId } from './ascii/scenes'

/* ============================================================================
   LIVE HERO — the current umm.digital hero, laid out exactly as it is, over
   the three versions' canvases (/home-ascii, -print, -particles). Each version brings its own canvas and its own
   options; the copy, the chips, the U with its film card and the hand-off to
   RAGe are the same everywhere.
   ========================================================================== */

export type Palette = 'light' | 'dark' | 'blue'

export const PALETTES: { id: Palette; label: string }[] = [
  { id: 'light', label: 'Ink on white' },
  { id: 'dark', label: 'White on black' },
  { id: 'blue', label: 'Eye blue' },
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

/** One row of the options dock. */
export function Seg<T extends string | number>({
  label,
  items,
  value,
  onPick,
}: {
  label: string
  items: { id: T; label: string }[]
  value: T
  onPick: (v: T) => void
}) {
  return (
    <fieldset className="ha-dock__set">
      <legend>{label}</legend>
      <div>
        {items.map((it) => (
          <button key={String(it.id)} type="button" aria-pressed={value === it.id} onClick={() => onPick(it.id)}>
            {it.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** The dock's scene row: Auto, then every scene. */
export function SceneSet<T extends string>({
  items,
  value,
  auto,
  onAuto,
  onPick,
  label = 'Scene',
}: {
  items: { id: T; label: string }[]
  value: T
  auto: boolean
  onAuto: () => void
  onPick: (v: T) => void
  label?: string
}) {
  return (
    <fieldset className="ha-dock__set">
      <legend>{label}</legend>
      <div>
        <button type="button" aria-pressed={auto} onClick={onAuto}>
          Auto
        </button>
        {items.map((s) => (
          <button key={s.id} type="button" aria-pressed={!auto && value === s.id} onClick={() => onPick(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
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
  return (
    <main
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
                {c.q}
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
