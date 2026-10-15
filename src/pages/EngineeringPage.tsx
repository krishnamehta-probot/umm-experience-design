import { useEffect } from 'react'
import { NavV2 } from '@/components/v2/NavV2'
import { HeroV2 } from '@/components/v2/HeroV2'
import { WhyBand } from '@/components/v2/WhyBand'
import { ServicesV2, type ServiceMarks } from '@/components/v2/ServicesV2'
import { StagesV2 } from '@/components/v2/StagesV2'
import { ToolsStack } from '@/components/v2/ToolsStack'
import { ProcessClose } from '@/components/v2/ProcessClose'
import { ToTop } from '@/components/v2/ToTop'
import { Engagement } from '@/components/ai/Engagement'
import { EngFilm } from '@/components/eng/EngFilm'
import { ReleaseFlow } from '@/components/eng/ReleaseFlow'
import { ScrollTrigger } from '@/lib/gsap'
import '@/styles/v2-phone.css'
import '@/styles/v2-scroll.css'
import build from '@/lottie/eng-services/build.json'
import modernise from '@/lottie/eng-services/modernise.json'
import connect from '@/lottie/eng-services/connect.json'
import release from '@/lottie/eng-services/release.json'
import validate from '@/lottie/eng-services/validate.json'
import operate from '@/lottie/eng-services/operate.json'
import {
  closing,
  engagement,
  faq,
  hero,
  meta,
  nav,
  process,
  ribbon,
  services,
  stages,
  tools,
  why,
} from '@/content/engineering'

/**
 * Digital Engineering — the fourth service page on the CX page's locked
 * design, built as the Cloud & Data page is: every CX section fed this page's
 * copy (src/content/engineering.ts), the film on QCare, Mohawk PriceFx and
 * Penny, and one new section, the release example (ReleaseFlow), on the same
 * board as Cloud's architecture example. Its glass object is a gear; the
 * strip and section 2's light are blossom.
 */
/** This page's own Lottie scenes (scripts/build_eng_service_marks.py), keyed
 *  by the marks the content's cards carry, each resting finished on frame 0. */
const MARKS: ServiceMarks = {
  research: build,
  interface: modernise,
  journey: connect,
  testing: release,
  data: validate,
  brand: operate,
}

export function EngineeringPage() {
  useEffect(() => {
    document.title = meta.title
    document.documentElement.classList.add('cx-v2', 'eng-page')
    /* as on the CX page: measure the pins again once fonts and images land */
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      document.documentElement.classList.remove('cx-v2', 'eng-page')
    }
  }, [])

  return (
    <>
      <a className="umm-skip-link" href="#work">
        Skip to selected work
      </a>
      <NavV2 items={nav} />
      <main className="cx-page">
        <div className="cx-intro">
          <HeroV2 content={hero} chipTone="sun" object="gear" />
          <WhyBand content={why} ribbon={ribbon} ribbonTone="blossom" lightTone="blossom" />
        </div>
        <EngFilm />
        <ServicesV2 content={services} marks={MARKS} still={0} />
        <StagesV2 content={stages} light="glass" />
        <ReleaseFlow />
        <ToolsStack content={tools} />
        <ProcessClose process={process} closing={closing} faq={faq}>
          <Engagement content={engagement} />
        </ProcessClose>
      </main>
      <ToTop />
    </>
  )
}
