import { IconCheck } from '../icons'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { hero } from '@/content/experienceDesign'

/* ============================================================================
   THE HERO JOURNEY DIAGRAM

   The page opens on an enterprise service claim, so the supporting visual has
   to be evidence rather than decoration. Instead of stock photography this is
   a drawn journey: one continuous path through four moments, with a pulse that
   keeps travelling it.

   Geometry is carried over from the approved prototype so the composition the
   boss signed off on is preserved exactly. The container is locked to the
   viewBox aspect ratio, which is what lets the HTML labels sit on the SVG
   nodes at every screen width without drifting.
   ========================================================================== */

const PATH =
  'M-20 430C120 430 96 120 280 148C438 172 376 402 548 354C650 326 650 105 800 102'

/** Node coordinates in viewBox space, and the same values as percentages. */
const NODES = [
  { x: 104, y: 339, place: 'below' },
  { x: 280, y: 148, place: 'above' },
  { x: 505, y: 360, place: 'below' },
  { x: 696, y: 156, place: 'above' },
] as const

const VB_W = 760
const VB_H = 520

export function JourneyDiagram() {
  const reduced = useReducedMotion()

  return (
    <div className="umm-diagram" data-umm-reveal data-umm-reveal-from="scale">
      <div className="umm-diagram__caption">
        <span className="umm-diagram__eyebrow">{hero.journey.label}</span>
        <strong>{hero.journey.title}</strong>
      </div>

      <div className="umm-diagram__stage">
        <span className="umm-diagram__orbit umm-diagram__orbit--one" aria-hidden="true" />
        <span className="umm-diagram__orbit umm-diagram__orbit--two" aria-hidden="true" />

        <svg
          className="umm-diagram__svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          fill="none"
          role="img"
          aria-label={`A customer journey drawn as one continuous path through four stages: ${hero.journey.nodes.join(', ')}.`}
        >
          {/* The faint full path, so the shape reads before the draw completes */}
          <path className="umm-diagram__ghost" d={PATH} />
          {/* The drawn path */}
          <path id="umm-journey-path" className="umm-diagram__path" d={PATH} />

          {NODES.map((node, i) => (
            <g key={i} className="umm-diagram__node" style={{ '--i': i } as React.CSSProperties}>
              <circle cx={node.x} cy={node.y} r="13" className="umm-diagram__halo" />
              <circle cx={node.x} cy={node.y} r="6" className="umm-diagram__core" />
            </g>
          ))}

          {/* The pulse that keeps travelling the journey. It rides the path
              inside the SVG so it scales with the viewBox rather than drifting
              off a CSS offset-path authored in unscaled user units. */}
          {reduced ? null : (
            <g className="umm-diagram__pulse">
              <circle r="9" className="umm-diagram__pulse-halo" />
              <circle r="4.5" className="umm-diagram__pulse-core" />
              <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
                <mpath href="#umm-journey-path" />
              </animateMotion>
            </g>
          )}
        </svg>

        {NODES.map((node, i) => (
          <span
            key={i}
            className="umm-diagram__label"
            data-place={node.place}
            style={
              {
                left: `${(node.x / VB_W) * 100}%`,
                top: `${(node.y / VB_H) * 100}%`,
                '--i': i,
              } as React.CSSProperties
            }
          >
            {hero.journey.nodes[i]}
          </span>
        ))}
      </div>

      <div className="umm-diagram__proof">
        <IconCheck size={15} />
        <span>
          <strong>Validated</strong> with users
        </span>
      </div>
    </div>
  )
}
