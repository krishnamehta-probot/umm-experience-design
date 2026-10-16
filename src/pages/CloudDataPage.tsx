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
import { CloudFilm } from '@/components/cloud/CloudFilm'
import { ConnectedArchitecture } from '@/components/cloud/ConnectedArchitecture'
import { Industries } from '@/components/v2/Industries'
import { CLOUD_INDUSTRY_ART } from '@/components/cloud/art'
import { CLOUD_FLAVOUR, FLAVOUR_CLASSES, STAGE_LIGHT } from '@/components/cloud/flavour'
import { ScrollTrigger } from '@/lib/gsap'
import '@/styles/v2-phone.css'
import '@/styles/v2-scroll.css'
import plan from '@/lottie/cloud-services/plan.json'
import connect from '@/lottie/cloud-services/connect.json'
import build from '@/lottie/cloud-services/build.json'
import understand from '@/lottie/cloud-services/understand.json'
import govern from '@/lottie/cloud-services/govern.json'
import optimize from '@/lottie/cloud-services/optimize.json'
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
} from '@/content/cloudData'

/**
 * Cloud & Data — the third service page on the CX page's locked design.
 *
 * As the AI page: every section the CX page has is the same component here,
 * fed this page's copy (src/content/cloudData.ts): nav, hero, the Why band
 * (its stickers are the pieces of an estate converging on the work), the
 * film (CX's, on Zceppa, Mohawk PriceFx and QCare), services, stages, the
 * tools wheel, the roadmap with the starting points under it, and the
 * closing. Its own sections: the industries under the services
 * (Industries) and the connected architecture (ConnectedArchitecture).
 * The hero's glass object is a cloud, the strip and section 2's light are
 * citrus, so the page doesn't read as a copy of CX or AI.
 *
 * 16 Oct: the cloud flavour (components/cloud/flavour.tsx), a trial behind
 * CLOUD_FLAVOUR: cloud and data motifs through the whole page.
 */


/** The cloud services' own Lottie scenes (scripts/build_cloud_service_marks.py),
 *  keyed by the marks the content's cards carry, each resting finished on
 *  frame 0. */
const CLOUD_MARKS: ServiceMarks = {
  research: plan,
  interface: connect,
  journey: build,
  testing: understand,
  data: govern,
  brand: optimize,
}

export function CloudDataPage() {
  useEffect(() => {
    document.title = meta.title
    document.documentElement.classList.add('cx-v2', 'cloud-page')
    if (CLOUD_FLAVOUR) document.documentElement.classList.add(...FLAVOUR_CLASSES)
    /* as on the CX page: measure the pins again once fonts and images land */
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      document.documentElement.classList.remove('cx-v2', 'cloud-page', ...FLAVOUR_CLASSES)
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
          <HeroV2 content={hero} chipTone="sky" object="cloud" />
          <WhyBand content={why} ribbon={ribbon} ribbonTone="citrus" lightTone="citrus" />
        </div>
        <CloudFilm />
        <ServicesV2 content={services} marks={CLOUD_MARKS} still={0} />
        <Industries content={industries} art={CLOUD_INDUSTRY_ART} />
        <StagesV2 content={stages} light={STAGE_LIGHT} />
        <ConnectedArchitecture />
        <ToolsStack content={tools} />
        <ProcessClose process={process} closing={closing} faq={faq}>
          <Engagement content={engagement} />
        </ProcessClose>
      </main>
      <ToTop />
    </>
  )
}
