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
import { GrowthFilm } from '@/components/growth/GrowthFilm'
import { GrowthSystem } from '@/components/growth/GrowthSystem'
import { Discovery, Gensify } from '@/components/growth/GrowthExtras'
import { GROWTH_INDUSTRY_ART } from '@/components/growth/art'
import { FLAVOUR_CLASSES, GROWTH_FLAVOUR, STAGE_LIGHT } from '@/components/growth/flavour'
import { Industries } from '@/components/v2/Industries'
import { ScrollTrigger } from '@/lib/gsap'
import '@/styles/v2-phone.css'
import '@/styles/v2-scroll.css'
import align from '@/lottie/growth-services/align.json'
import position from '@/lottie/growth-services/position.json'
import attract from '@/lottie/growth-services/attract.json'
import develop from '@/lottie/growth-services/develop.json'
import learn from '@/lottie/growth-services/learn.json'
import connect from '@/lottie/growth-services/connect.json'
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
} from '@/content/growth'

/**
 * Integrated Growth & Strategy — the fifth service page on the CX page's
 * locked design, built as the Cloud & Data page is: every CX section fed this
 * page's copy (src/content/growth.ts), the film on Enda Sportswear, Biocon
 * Group and iAdeptive. Its own sections (16 Oct, the doc's second version):
 * Gensify, the seventh service, as a wide card under the six; search, ads
 * and AI discovery; the business models; and the growth system
 * (GrowthSystem), the page's story, with the marketing factory, in place of
 * the growth model. The growth flavour (components/growth/flavour.tsx) is a
 * trial behind GROWTH_FLAVOUR. Its glass object is an
 * arrow rising to the right; the strip and section 2's light are sun.
 */
/** This page's own Lottie scenes (scripts/build_growth_service_marks.py), keyed
 *  by the marks the content's cards carry, each resting finished on frame 0. */
const MARKS: ServiceMarks = {
  research: align,
  interface: position,
  journey: attract,
  testing: develop,
  data: learn,
  brand: connect,
}

export function GrowthPage() {
  useEffect(() => {
    document.title = meta.title
    /* the doc's search description, for this page only */
    const tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const before = tag?.content
    if (tag) tag.content = meta.description
    document.documentElement.classList.add('cx-v2', 'growth-page')
    if (GROWTH_FLAVOUR) document.documentElement.classList.add(...FLAVOUR_CLASSES)
    /* as on the CX page: measure the pins again once fonts and images land */
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      document.documentElement.classList.remove('cx-v2', 'growth-page', ...FLAVOUR_CLASSES)
      if (tag && before !== undefined) tag.content = before
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
          <HeroV2 content={hero} chipTone="coral" object="arrow" />
          <WhyBand content={why} ribbon={ribbon} ribbonTone="sun" lightTone="sun" />
        </div>
        <GrowthFilm />
        <ServicesV2 content={services} marks={MARKS} still={0} />
        <Gensify />
        <Discovery />
        <Industries content={industries} art={GROWTH_INDUSTRY_ART} />
        <StagesV2 content={stages} light={STAGE_LIGHT} />
        <GrowthSystem />
        <ToolsStack content={tools} />
        <ProcessClose process={process} closing={closing} faq={faq}>
          <Engagement content={engagement} />
        </ProcessClose>
      </main>
      <ToTop />
    </>
  )
}
