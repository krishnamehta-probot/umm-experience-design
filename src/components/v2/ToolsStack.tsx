import type { CSSProperties } from 'react'
import { ChipHead, withAccent } from './ChipHead'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { tools } from '@/content/cxUiDesign'

/* ============================================================================
   6b · THE SYSTEMS YOU ALREADY HAVE — the tools wheel

   Santosh approved this section's words as they stand; only the form is new.
   The form is the AI & Automation page's tools section, which Krish pointed
   to: the six groups curve down the left on a wheel (the open one forward
   and full size, its neighbours tilting back and fading), and on the right
   a dark frame holds the open group's tools as a register of tiles, equal
   rows that fill the frame whether there are two tools or seven. The tiles
   are the group's pastel, each a little deeper than the one above, with a
   soft sheen across it.

   The section pins and each group is a magnetic stop (lib/useMagneticStops),
   on the same rhythm as the rules: the scroll turns the wheel one place, the
   old tiles slip away and the new ones wipe in one after another. Clicking
   a group glides to it.

   Phones and reduced motion: nothing pins; each group is its label over its
   frame of tiles.
   ========================================================================== */

const groups = tools.groups
const STOPS = groups.length
type Group = (typeof groups)[number]

/** The wheel: where an option sits for d places off the line. */
function spoke(d: number): CSSProperties {
  const ad = Math.abs(d)
  const c = Math.min(ad, 3.2)
  return {
    ['--y' as string]: `${Math.sign(d) * c}`,
    ['--x' as string]: `${Math.pow(c, 1.35)}`,
    ['--r' as string]: `${-d * 9}deg`,
    ['--s' as string]: `${1 - Math.min(0.42, ad * 0.14)}`,
    ['--o' as string]: `${ad > 3.2 ? 0 : Math.max(0.14, 1 - ad * 0.32)}`,
  }
}

export function ToolsStack() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const wide = usePinned()
  const reduced = useReducedMotion()
  const pinMode = wide && !reduced
  const stop = pinMode ? stopAt(progress, STOPS) : 0
  const glideTo = useMagneticStops(ref, STOPS, pinMode)

  return (
    <section
      className="umm-section umm-pin cx-kit"
      id="tools"
      ref={ref}
      data-mode={pinMode ? 'scroll' : 'stack'}
      style={{ ['--umm-pin-steps' as string]: STOPS }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container cx-kit__inner">
          <div className="cx-head cx-head--tight">
            <ChipHead
              line1={tools.line1}
              line2={withAccent(tools.line2, tools.accent)}
              chip={tools.chip}
              tone="citrus"
              chipAt="48%"
              tilt={-8}
              lineRecipe={5}
              chipRecipe={2}
            />
            <p className="cx-lead">{tools.lead}</p>
          </div>

          {pinMode ? (
            <div className="cx-kit__body">
              <div className="cx-kit__side">
                <ol className="cx-kit__wheel">
                  {groups.map((g, i) => (
                    <li key={g.label} style={spoke(i - stop)} data-on={i === stop} data-umm-tone={g.tone}>
                      <button
                        type="button"
                        onClick={() => glideTo(i)}
                        aria-current={i === stop ? 'step' : undefined}
                        tabIndex={Math.abs(i - stop) > 3 ? -1 : 0}
                      >
                        {g.label}
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="cx-kit__claims" aria-live="polite">
                  {groups.map((g, i) => (
                    <p key={g.label} className="cx-kit__claim" data-on={i === stop} hidden={i !== stop}>
                      <span className="cx-kit__role" data-umm-tone={g.tone}>
                        {g.role}
                      </span>
                      {g.claim}
                    </p>
                  ))}
                </div>
              </div>

              <div className="cx-kit__frame">
                {groups.map((g, i) => (
                  <Tiles key={g.label} group={g} on={i === stop} />
                ))}
              </div>
            </div>
          ) : (
            <ol className="cx-kit__cards">
              {groups.map((g) => (
                <li key={g.label} className="cx-kit__card">
                  <h3 className="cx-kit__label">{g.label}</h3>
                  <p className="cx-kit__claim">
                    <span className="cx-kit__role" data-umm-tone={g.tone}>
                      {g.role}
                    </span>
                    {g.claim}
                  </p>
                  <div className="cx-kit__frame">
                    <Tiles group={g} on />
                  </div>
                </li>
              ))}
            </ol>
          )}

          <p className="cx-kit__note">{tools.note}</p>
        </div>
      </div>
    </section>
  )
}

/** One group's tools as tiles: its pastel, deepening a little row by row. */
function Tiles({ group, on }: { group: Group; on: boolean }) {
  const n = group.items.length
  return (
    <ul className="cx-kit__tiles" data-ramp={group.tone} data-on={on} aria-hidden={!on} inert={!on}>
      {group.items.map((t, j) => (
        <li
          key={t}
          style={{ ['--i' as string]: j, ['--t' as string]: `${n > 1 ? (j / (n - 1)) * 100 : 0}%` } as CSSProperties}
        >
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}
