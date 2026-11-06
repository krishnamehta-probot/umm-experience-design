import { lazy, Suspense, useState } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton } from '@/components/primitives'
import { Arrow, GlassObject, css, pad } from '../glass/kit'
import { hero } from '@/content/fintech'
import '@/styles/fin-final.css'

const Element3D = lazy(() => import('./Element3D'))
const IconObject3D = lazy(() => import('./IconObject3D'))
const FlowerObject3D = lazy(() => import('./FlowerObject3D'))

/* ============================================================================
   THE FINAL FINTECH PAGE — HERO (Krish, 6 Nov; /fintech-final)

   Krish is building the final page section by section from the two modern
   pages. The hero is Grid's ("yes i am liking it"), reworked on his notes:

     · the layout: on the left the eyebrow over the heading; on the right
       the lead with UMM's two actions under it (SplitButton, the pill and
       its circle); under them the two cards. No hairline frame, no
       "block system"; the four section links are gone ("no need")
     · the heading's second line in the blue of the 3D elements, not grey;
       the hero starts lower under the nav
     · the left card holds the three sector pills, and each sector has its
       own 3D element in the style of his references ("all three pills its
       kind of elements"): Banking his flower of discs, Payments a row of
       coins with a wave along it, Insurance a glass shield with a check.
       Glossy saturated blue is right for elements ("elements and icons
       are different"); they grow and turn into one another (Element3D).
       The pills, the round arrows, or a click on the element step on
     · the right card is the glass bank card again, on dark, with the
       strapline and UMM's round arrow

   Kept as options: ?object=pastel (the pastel flower) and ?object=discs
   (the fintech icon as four discs) on the left; ?right=layers (the blue
   glass layers) on the right; ?finish=glass (the elements in clear glass,
   as section 02 has them).
   ========================================================================== */

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg className="kit-arrow" viewBox="0 0 24 24" aria-hidden="true" style={back ? { rotate: '180deg' } : undefined}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

const KINDS = ['flower', 'coins', 'shield'] as const

export function FinalHero() {
  const c = hero
  const n = c.sectors.length
  const [si, setSi] = useState(0)
  const next = () => setSi((s) => (s + 1) % n)
  const prev = () => setSi((s) => (s + n - 1) % n)
  const params = new URLSearchParams(window.location.search)
  const object = params.get('object')
  const legacy = object === 'pastel' || object === 'discs'
  const layers = params.get('right') === 'layers'
  const finish = params.get('finish') === 'glass' ? 'glass' : 'blue'

  return (
    <section className="ff-hero" aria-labelledby="ff-title">
      <MegaNav />
      <div className="ff-hero__in">
        <div className="ff-hero__top">
          <div className="ff-hero__head">
            <p className="ff-eyebrow">{c.eyebrow}</p>
            <h1 id="ff-title" className="ff-hero__title">
              <span className="ff-up" style={css({ '--i': 0 })}>
                <span>{c.lines[0]}</span>
              </span>
              <span className="ff-up" style={css({ '--i': 1 })}>
                <span className="ff-blue">{c.lines.slice(1).join(' ')}</span>
              </span>
            </h1>
          </div>
          <div className="ff-hero__side">
            <p className="ff-hero__lead">{c.lead}</p>
            <div className="ff-hero__actions">
              <SplitButton href={c.primary.href}>{c.primary.label}</SplitButton>
              <SplitButton href={c.secondary.href} variant="outline">
                {c.secondary.label}
              </SplitButton>
            </div>
          </div>
        </div>

        <div className="ff-hero__tiles">
          {/* the left card: the sectors, each with its own element */}
          <div className={`ff-tile ${legacy ? 'ff-tile--light' : 'ff-tile--studio'}`}>
            {legacy ? (
              <div className={`ff-tile__obj${object === 'discs' ? '' : ' ff-tile__obj--big'}`}>
                <Suspense fallback={null}>
                  {object === 'discs' ? (
                    <IconObject3D formation={si} onPick={next} />
                  ) : (
                    <FlowerObject3D palette={si} onPick={next} />
                  )}
                </Suspense>
              </div>
            ) : (
              <Suspense fallback={null}>
                <Element3D kinds={[...KINDS]} active={si} ground="#e4e4e8" at={[0.6, 0.46]} shadow finish={finish} onPick={next} />
              </Suspense>
            )}
            <div className="ff-tile__head">
              <div className="ff-cardpills" role="group" aria-label={c.eyebrow}>
                {c.sectors.map((s, k) => (
                  <button key={s} type="button" className="ff-pill" aria-pressed={k === si} onClick={() => setSi(k)}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="ff-count">
                {pad(si)} <span>/ {pad(n - 1)}</span>
              </p>
            </div>
            <div className="ff-tile__foot">
              <p className="ff-tile__name" key={si}>
                {c.sectors[si]}
              </p>
              <div className="ff-ctrl">
                <button type="button" aria-label="Previous" onClick={prev}>
                  <Chevron back />
                </button>
                <button type="button" aria-label="Next" onClick={next}>
                  <Chevron />
                </button>
              </div>
            </div>
          </div>

          {/* the right card: the bank card in glass, on dark */}
          <div className={`ff-tile ${layers ? 'ff-tile--night' : 'ff-tile--ink'}`}>
            {layers ? (
              <Suspense fallback={null}>
                <Element3D kinds={['layers']} ground="#0b0a10" at={[0.62, 0.44]} onPick={next} />
              </Suspense>
            ) : (
              <GlassObject shape="card" className="ff-tile__glass" />
            )}
            <div className="ff-tile__foot">
              <p className="ff-tile__line">{c.strapline}</p>
              <a className="ff-orb" href={c.secondary.href} aria-label={c.secondary.label}>
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
