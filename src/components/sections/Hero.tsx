import { SplitButton } from '../primitives'
import { TileField } from '../hero/TileField'
import { hero } from '@/content/experienceDesign'

export function Hero() {
  return (
    <section className="umm-hero" id="top" aria-labelledby="umm-hero-title">
      <TileField />
      <div className="umm-container umm-hero__inner">
        <h1 className="umm-hero__title" id="umm-hero-title">
          {hero.titleLines.map((line) => (
            <span className="umm-hero__line" key={line}>
              {line}
            </span>
          ))}
          <span className="umm-hero__line">
            {hero.titleLast}{' '}
            <span className="umm-hero__accent">{hero.titleAccent}</span>
          </span>
        </h1>
        <p className="umm-hero__lead">{hero.lead}</p>
        <div className="umm-hero__actions">
          <SplitButton href="#contact">{hero.primaryCta}</SplitButton>
          <SplitButton href="#proof" variant="outline">
            {hero.secondaryCta}
          </SplitButton>
        </div>
      </div>
    </section>
  )
}
