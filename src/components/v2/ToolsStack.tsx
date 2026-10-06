import type { CSSProperties } from 'react'
import { Shape } from './Shape'
import { ChipHead, withAccent } from './ChipHead'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { tools } from '@/content/cxUiDesign'

/* ============================================================================
   6b · THE SYSTEMS YOU ALREADY HAVE — six groups, six colours

   Santosh approved this section's words as they stand; only the form is new.
   It reads the way the rules above it do: the groups are a list on the
   right (hairline rows, a mono number, the open one showing its claim), and
   the picture on the left is one rounded tile in the open group's pastel,
   light at the top and deepening towards the bottom. In the tile stands the
   group's Cool Shape, flat in a deeper pastel, and the group's tools
   land on it as white stickers.

   The section pins and each group is a magnetic stop (lib/useMagneticStops),
   on the same rhythm as the rules: the scroll picks the group, the tile's
   colour glides to the next pastel, the old shape turns away as the new one
   turns in, and the tools drop on one after another. Clicking a row glides
   to it.

   Phones and reduced motion: nothing pins; each group is its own tile with
   its text under it.
   ========================================================================== */

const groups = tools.groups
const STOPS = groups.length
type Group = (typeof groups)[number]

/** A few hand-set sticker tilts, so the tools never land in a grid. */
const TILT = [-4, 3, -2, 5, -5, 2, -3]

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
              <Tile shown={groups} on={stop} />

              <ol className="cx-kit__list">
                {groups.map((g, i) => (
                  <li key={g.label} data-umm-tone={g.tone}>
                    <button
                      type="button"
                      className="cx-kit__row"
                      onClick={() => glideTo(i)}
                      data-open={i === stop}
                      data-done={i < stop}
                      aria-current={i === stop ? 'step' : undefined}
                    >
                      <span className="cx-kit__dot" aria-hidden="true" />
                      <span className="cx-kit__n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="cx-kit__label">{g.label}</span>
                      <span className="cx-kit__count">{g.items.length} tools</span>
                    </button>
                    <div className="cx-kit__more">
                      <div>
                        <p className="cx-kit__role">{g.role}</p>
                        <p className="cx-kit__claim">{g.claim}</p>
                        <p className="umm-sr-only">Tools: {g.items.join(', ')}.</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <ol className="cx-kit__cards">
              {groups.map((g, i) => (
                <li key={g.label} className="cx-kit__card">
                  <Tile shown={[g]} on={0} />
                  <div className="cx-kit__text">
                    <p className="cx-kit__n">{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="cx-kit__label">{g.label}</h3>
                    <p className="cx-kit__role">{g.role}</p>
                    <p className="cx-kit__claim">{g.claim}</p>
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

/** The picture: a rounded tile in the open group's pastel, its Cool Shape,
 *  and its tools as stickers. Every group's shape and stickers are drawn;
 *  only the open group's are up. */
function Tile({ shown, on }: { shown: readonly Group[]; on: number }) {
  return (
    <div className="cx-kit__tile" data-ramp={shown[on].tone} aria-hidden="true">
      <span className="cx-kit__count-big">
        {String(shown[on].items.length).padStart(2, '0')}
        <small>{shown[on].items.length === 1 ? 'tool' : 'tools'}</small>
      </span>

      {shown.map((g, i) => (
        <div className="cx-kit__set" key={g.label} data-on={i === on} data-ramp={g.tone}>
          <span className="cx-kit__shape">
            <Shape name={g.shape} className="cx-kit__fill" />
          </span>
          <ul className="cx-kit__stickers">
            {g.items.map((t, j) => (
              <li key={t} style={{ ['--i' as string]: j, ['--tilt' as string]: `${TILT[j % TILT.length]}deg` } as CSSProperties}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
