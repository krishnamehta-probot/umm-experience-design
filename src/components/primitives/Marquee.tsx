import { IconNode } from '../icons'

/**
 * A slow band of capability names between sections. Decorative reinforcement
 * of scope, so it is hidden from assistive technology — the same capabilities
 * are named in the services section as real content.
 *
 * The list is rendered twice and translated -50%, which is what makes the loop
 * seamless regardless of how many items there are.
 */
export function Marquee({
  items,
  duration = 52,
}: {
  items: string[]
  duration?: number
}) {
  return (
    <div
      className="umm-marquee"
      aria-hidden="true"
      style={{ '--umm-marquee-duration': `${duration}s` } as React.CSSProperties}
    >
      <div className="umm-marquee__track">
        {[0, 1].map((copy) => (
          <div key={copy} style={{ display: 'flex' }}>
            {items.map((item) => (
              <span className="umm-marquee__item" key={`${copy}-${item}`}>
                {item}
                <IconNode size={13} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
