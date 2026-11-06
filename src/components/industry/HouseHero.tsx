import { lazy, Suspense, useRef, type CSSProperties } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton, type Tone } from '@/components/primitives'
import { FlutedLight } from '@/components/v2/FlutedLight'
import type { GlassShape } from '@/components/v2/GlassCube3D'
import type { IndustryHeroContent } from './IndustryHero'
import '@/styles/house-hero.css'

const GlassCube3D = lazy(() => import('@/components/v2/GlassCube3D'))

/* ============================================================================
   HOUSE HERO — the industry hero in the house language (Krish, 2 Nov)

   "Momentum" (IndustryHero) drew the headline's last word full width; Krish:
   the feel is missing, and a sudden giant word won't be accepted. The
   industry pages have to look like their own thing and still stay on the
   house path: headline at the house size, the last word in a pastel pill,
   a glass object of the industry's own, the site's nav and buttons.

   Three layouts (?hero= on the page). Krish found them too close to the
   service pages; they are kept as options:
     card    copy left; a glass bank card right, the three sectors as
             stickers floating round it
     centre  centred, like the homepage: a glass shield over the headline,
             the sectors along the foot as the homepage's slash row
     fluted  the hero framed as a dark rounded panel lit by the fluted light
             of the service pages' Why band, a glass coin in it
   ========================================================================== */

export type HouseLayout = 'card' | 'centre' | 'fluted'

export type HouseHeroContent = IndustryHeroContent & {
  /** the industry's sectors ("Banking / Payments / Insurance") */
  sectors: readonly string[]
}

const OBJECT: Record<HouseLayout, GlassShape> = { card: 'card', centre: 'shield', fluted: 'coin' }
const TAG_TONES: Tone[] = ['sky', 'citrus', 'blossom']

export function HouseHero({
  content,
  layout,
  tone = 'sky',
}: {
  content: HouseHeroContent
  layout: HouseLayout
  /** the pill's colour */
  tone?: Tone
}) {
  const light = useRef(0)
  const [first, ...rest] = content.lines
  const accent = rest[rest.length - 1]
  const lead = rest.slice(0, -1).join(' ')

  const glass = (
    <div className="hh__glass" aria-hidden="true">
      <Suspense fallback={null}>
        <GlassCube3D shape={OBJECT[layout]} />
      </Suspense>
    </div>
  )

  const copy = (
    <div className="hh__copy">
      <p className="hh__eyebrow">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
        </svg>
        {content.eyebrow}
      </p>
      <h1 className="hh__title" id="hh-title">
        <span className="hh__line" style={{ '--i': 0 } as CSSProperties}>
          <span>{first}</span>
        </span>
        {/* centred, the pill closes the second line; beside a glass object
            it is a line of its own, as on the service pages */}
        {layout === 'centre' ? (
          <span className="hh__line" style={{ '--i': 1 } as CSSProperties}>
            <span>
              {lead}{' '}
              <span className="hh__chip" data-umm-tone={tone}>
                {accent}
              </span>
            </span>
          </span>
        ) : (
          <>
            <span className="hh__line" style={{ '--i': 1 } as CSSProperties}>
              <span>{lead}</span>
            </span>
            <span className="hh__line hh__line--chip" style={{ '--i': 2 } as CSSProperties}>
              <span>
                <span className="hh__chip" data-umm-tone={tone}>
                  {accent}
                </span>
              </span>
            </span>
          </>
        )}
      </h1>
      <p className="hh__lead">{content.lead}</p>
      <div className="hh__actions">
        <SplitButton href={content.primary.href}>{content.primary.label}</SplitButton>
        <a className="hh__more" href={content.secondary.href}>
          {content.secondary.label} <span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>
  )

  return (
    <section className={`hh hh--${layout}`} aria-labelledby="hh-title">
      <div className="hh__stage">
        <MegaNav />

        {layout === 'card' && (
          <div className="hh__body">
            {copy}
            <div className="hh__object">
              {glass}
              {content.sectors.map((s, i) => (
                <span
                  key={s}
                  className="hh__tag"
                  data-umm-tone={TAG_TONES[i % TAG_TONES.length]}
                  style={{ '--i': i } as CSSProperties}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {layout === 'centre' && (
          <>
            <div className="hh__body">
              <div className="hh__object">{glass}</div>
              {copy}
            </div>
            <ul className="hh__row" aria-label="Sectors">
              {content.sectors.map((s) => (
                <li key={s}>{s} /</li>
              ))}
            </ul>
          </>
        )}

        {layout === 'fluted' && (
          <div className="hh__panel" data-umm-theme="ink">
            <FlutedLight progress={light} tone="sky" />
            {copy}
            <div className="hh__object">{glass}</div>
            <ul className="hh__sectors" aria-label="Sectors">
              {content.sectors.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
