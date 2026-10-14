import type { CSSProperties } from 'react'
import { ChipHead, withAccent } from './ChipHead'
import { usePinProgress } from '@/lib/usePinProgress'
import { PIN_V2, usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { tools as cxTools } from '@/content/cxUiDesign'

/* the note is optional: a plan can leave it out */
export type ToolsContent = Omit<typeof cxTools, 'note'> & { note?: string }

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

   The section pins and the scroll drives it directly (Krish, 14 Oct: "not
   at all smooth"): the wheel turns with the scroll, not in timed jumps,
   and between two groups the new tiles wipe in row by row over the old
   ones as far as the scroll has gone, so a fast scroll and a slow one look
   the same, only quicker. Clicking a group glides to it.

   Phones and reduced motion: nothing pins; each group is its label over its
   frame of tiles.
   ========================================================================== */

type Group = ToolsContent['groups'][number]

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

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

export function ToolsStack({ content: tools = cxTools }: { content?: ToolsContent }) {
  const groups = tools.groups
  const STOPS = groups.length
  const { ref, progress } = usePinProgress<HTMLElement>()
  const wide = usePinned(PIN_V2)
  const reduced = useReducedMotion()
  const pinMode = wide && !reduced
  const stop = pinMode ? stopAt(progress, STOPS) : 0
  /* where the wheel is, between groups: 0 resting on the first, 1 on the
     second, and so on (each rests mid-lane, as glideTo lands) */
  const pos = pinMode ? Math.min(STOPS - 1, Math.max(0, progress * STOPS - 0.5)) : 0
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
              lineRecipe={5}
            />
            <p className="cx-lead">{tools.lead}</p>
          </div>

          {pinMode ? (
            <div className="cx-kit__body">
              <div className="cx-kit__side">
                <ol className="cx-kit__wheel">
                  {groups.map((g, i) => (
                    <li key={g.label} style={spoke(i - pos)} data-on={i === stop} data-umm-tone={g.tone}>
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
              </div>

              <div className="cx-kit__frame">
                {groups.map((g, i) => (
                  <Tiles key={g.label} group={g} on={i === stop} d={i - pos} z={i} />
                ))}
              </div>
            </div>
          ) : (
            <ol className="cx-kit__cards">
              {groups.map((g) => (
                <li key={g.label} className="cx-kit__card">
                  <h3 className="cx-kit__label">{g.label}</h3>
                  <div className="cx-kit__frame">
                    <Tiles group={g} on />
                  </div>
                </li>
              ))}
            </ol>
          )}

          {tools.note ? <p className="cx-kit__note">{tools.note}</p> : null}
        </div>
      </div>
    </section>
  )
}

/* Between two groups (the scroll a lane apart), the next group's rows wipe
   in over this stretch of it, each row a little after the one above; the
   group underneath is let go only once it is covered. */
const IN_FROM = 0.68
const IN_TO = 0.32
const ROW_LAG = 0.22
/** how far past a group the wheel is when its covered tiles are let go */
const GONE = 0.72

/** One group's tools as tiles: its pastel, deepening a little row by row.
 *  `d` (pinned only) is how many places the wheel is from this group. */
function Tiles({ group, on, d, z }: { group: Group; on: boolean; d?: number; z?: number }) {
  const n = group.items.length
  /* coming (d > 0): how far its rows have wiped in. Going (d < 0) it stays
     whole under the next group's wipe, and is let go once covered */
  const wipe = d === undefined || d <= 0 ? 1 : clamp01((IN_FROM - d) / (IN_FROM - IN_TO))
  const shown = d === undefined || d > -GONE
  const live = d !== undefined
  return (
    <ul
      className="cx-kit__tiles"
      data-ramp={group.tone}
      data-on={on}
      aria-hidden={!on}
      inert={!on}
      style={
        live
          ? {
              visibility: wipe > 0 && shown ? 'visible' : 'hidden',
              zIndex: z,
              /* the tint between rows only once the rows are all in, or it
                 would cover the group underneath at the wipe's first frame */
              background: wipe < 1 ? 'transparent' : undefined,
            }
          : undefined
      }
    >
      {group.items.map((t, j) => {
        const r = clamp01(wipe * (1 + ROW_LAG * (n - 1)) - ROW_LAG * j)
        return (
          <li
            key={t}
            style={
              {
                ['--t' as string]: `${n > 1 ? (j / (n - 1)) * 100 : 0}%`,
                ...(live && { clipPath: `inset(0 ${(1 - r) * 100}% 0 0)` }),
              } as CSSProperties
            }
          >
            <span style={live ? { opacity: r, transform: `translateY(${(1 - r) * 50}%)` } : undefined}>{t}</span>
          </li>
        )
      })}
    </ul>
  )
}
