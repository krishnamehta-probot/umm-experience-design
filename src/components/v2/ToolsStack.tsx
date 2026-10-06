import { Shape } from './Shape'
import { ChipHead, withAccent } from './ChipHead'
import { SHAPES, type ShapeName } from './shapes.data'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { tools } from '@/content/cxUiDesign'

/* ============================================================================
   6b · THE SYSTEMS YOU ALREADY HAVE — six groups, six colours

   Santosh approved this section's words as they stand; only the form is new.
   Each of the six tool groups is a full screen in its own brand colour, and
   within it the colour deepens from a light tint at the top to a deep shade
   at the bottom. The group's Cool Shape stands in it as a large piece of
   frosted glass, with a couple of solid shapes drifting behind it so the
   glass has something to blur.

   The section pins and each group is a magnetic stop (lib/useMagneticStops):
   the scroll picks the group, the next colour wipes up over the last as a
   full animation, and the page settles on the nearest group when the reader
   stops. Scrolling back up wipes it down again. The rail on the left is the
   readout and the control: clicking a group glides to it.

   Phones and reduced motion: nothing pins; the six groups stack as bands,
   each in its own colour.
   ========================================================================== */

const groups = tools.groups
const STOPS = groups.length

export function ToolsStack() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const wide = usePinned()
  const reduced = useReducedMotion()
  const pinMode = wide && !reduced
  const stop = pinMode ? stopAt(progress, STOPS) : 0
  const glideTo = useMagneticStops(ref, STOPS, pinMode)

  return (
    <section
      className="umm-section umm-pin cx-stack"
      id="tools"
      ref={ref}
      data-mode={pinMode ? 'scroll' : 'stack'}
      data-ramp={groups[stop].tone}
      style={{ ['--umm-pin-steps' as string]: STOPS }}
    >
      <div className="umm-pin__stage">
        {/* the colours, one per group, wiping up over each other */}
        {pinMode ? (
          <div className="cx-stack__grounds" aria-hidden="true">
            {groups.map((g, i) => (
              <div
                className="cx-ground"
                key={g.label}
                data-ramp={g.tone}
                data-shown={i <= stop}
                data-on={i === stop}
              >
                <Shape name={g.shape} className="cx-ground__drift cx-ground__drift--a" />
                <Shape name={g.shape} className="cx-ground__drift cx-ground__drift--b" />
                <GlassShape name={g.shape} className="cx-ground__glass" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="umm-container cx-stack__inner">
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

          <div className="cx-stack__body">
            {pinMode ? (
              <ol className="cx-stack__rail">
                {groups.map((g, i) => (
                  <li key={g.label}>
                    <button
                      type="button"
                      onClick={() => glideTo(i)}
                      data-on={i === stop}
                      aria-current={i === stop ? 'step' : undefined}
                    >
                      <span className="cx-stack__n">{String(i + 1).padStart(2, '0')}</span>
                      {g.label}
                    </button>
                  </li>
                ))}
              </ol>
            ) : null}

            <div className="cx-stack__panes">
              {groups.map((g, i) => (
                <article
                  className="cx-stack__pane"
                  key={g.label}
                  data-ramp={g.tone}
                  data-on={!pinMode || i === stop}
                  inert={pinMode && i !== stop}
                >
                  {pinMode ? null : <GlassShape name={g.shape} className="cx-stack__mark" />}
                  <p className="cx-stack__role">{g.role}</p>
                  <h3 className="cx-stack__label">{g.label}</h3>
                  <p className="cx-stack__claim">{g.claim}</p>
                  <ul className="cx-stack__tools">
                    {g.items.map((t, j) => (
                      <li key={t} style={{ ['--i' as string]: j }}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <p className="cx-stack__note">{tools.note}</p>
        </div>
      </div>
    </section>
  )
}

/** A Cool Shape as a piece of frosted glass: the shape's silhouette masks a
 *  blurred, lit pane, with a fine rim of light round its edge and a soft
 *  shadow below. */
function GlassShape({ name, className = '' }: { name: ShapeName; className?: string }) {
  const parts = SHAPES[name]
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>` +
    parts.map((p) => `<path d='${p.d}'${'evenodd' in p ? " fill-rule='evenodd'" : ''}/>`).join('') +
    `</svg>`
  const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return (
    <span className={`cx-glass ${className}`.trim()} aria-hidden="true">
      <Shape name={name} className="cx-glass__shadow" />
      <span className="cx-glass__body" style={{ maskImage: mask, WebkitMaskImage: mask }} />
      <svg className="cx-glass__rim" viewBox="0 0 200 200">
        {parts.map((p, i) => (
          <path key={i} d={p.d} fillRule={'evenodd' in p ? 'evenodd' : undefined} />
        ))}
      </svg>
    </span>
  )
}
