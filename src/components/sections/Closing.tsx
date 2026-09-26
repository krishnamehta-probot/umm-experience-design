import { Chapter, SplitButton } from '../primitives'
import { TileField } from '../hero/TileField'
import { closing, meta, nav } from '@/content/experienceDesign'

/**
 * The page ends where it began: the same field of frosted glass over the same
 * two-colour bloom, turned over onto ink. Opening and closing on one image is
 * what makes the page feel like a single object rather than a stack of
 * sections, and the dark ground is what stops it reading as a second landing
 * page — the bloom glows out of it instead of sitting on it.
 *
 * Deliberately shorter than the hero's full viewport. A closing that fills the
 * screen invites you to stay; this one is a full stop.
 *
 * `data-umm-theme="ink"` re-points the semantic color roles for this subtree,
 * so every component inside renders correctly with no variant props.
 */
export function Closing() {
  return (
    <section className="umm-closing" id="contact" data-umm-theme="ink">
      <TileField tone="ink" />

      <div className="umm-container umm-closing__inner">
        <div data-umm-reveal>
          <Chapter>{closing.chapter}</Chapter>

          <h2 className="umm-closing__title">
            {closing.titleLead}{' '}
            <span className="umm-closing__accent">{closing.titleAccent}</span>
          </h2>

          <p className="umm-closing__lead">{closing.lead}</p>

          <div className="umm-closing__actions">
            <SplitButton href={`mailto:${meta.contactEmail}`}>
              {closing.primaryCta}
            </SplitButton>
            <SplitButton href="#proof" variant="outline">
              {closing.secondaryCta}
            </SplitButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="umm-footer" data-umm-theme="ink">
      <div className="umm-container umm-footer__inner">
        <a className="umm-wordmark" href="#top" aria-label="Unified Modern Minds — home">
          <span className="umm-wordmark__mark">UMM</span>
          <span className="umm-wordmark__full">
            Unified
            <br />
            Modern Minds
          </span>
        </a>

        <nav className="umm-footer__links" aria-label="Footer navigation">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>

        <p className="umm-footer__meta">{meta.locations}</p>
      </div>
    </footer>
  )
}
