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
import { EngineeringFactory } from '@/components/eng/EngineeringFactory'
import { ENG_INDUSTRY_ART } from '@/components/eng/art'
import { ENG_FLAVOUR, FLAVOUR_CLASSES, STAGE_LIGHT } from '@/components/eng/flavour'
import { Industries } from '@/components/v2/Industries'
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
  industries,
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
 * Penny. Its own sections: the industries under the services and, since the
 * doc's 16 Oct version, the engineering factory (EngineeringFactory), the
 * page's story, in place of the release example.
 *
 * 16 Oct: the engineering flavour (components/eng/flavour.tsx), a trial
 * behind ENG_FLAVOUR. Its glass object is a gear; the
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
    if (ENG_FLAVOUR) document.documentElement.classList.add(...FLAVOUR_CLASSES)
    /* as on the CX page: measure the pins again once fonts and images land */
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      document.documentElement.classList.remove('cx-v2', 'eng-page', ...FLAVOUR_CLASSES)
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
        <Industries content={industries} art={ENG_INDUSTRY_ART} tone="sun" />
        <StagesV2 content={stages} light={STAGE_LIGHT} />
        <EngineeringFactory />
        <ToolsStack content={tools} />
        <ProcessClose process={process} closing={closing} faq={faq}>
          <Engagement content={engagement} />
        </ProcessClose>
      </main>
      <ToTop />
    </>
  )
}
