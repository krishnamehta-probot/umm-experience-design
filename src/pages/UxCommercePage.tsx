import { useEffect } from 'react'
import { NavV2 } from '@/components/v2/NavV2'
import { HeroV2 } from '@/components/v2/HeroV2'
import { WhyBand } from '@/components/v2/WhyBand'
import { ServicesV2 } from '@/components/v2/ServicesV2'
import { StagesV2 } from '@/components/v2/StagesV2'
import { Industries } from '@/components/v2/Industries'
import { ProcessClose } from '@/components/v2/ProcessClose'
import { ToTop } from '@/components/v2/ToTop'
import { Engagement } from '@/components/ai/Engagement'
import { UxFilm } from '@/components/ux/UxFilm'
import { AiMoments, Platforms } from '@/components/ux/UxExtras'
import { CommerceArchitecture } from '@/components/ux/CommerceArchitecture'
import { UX_INDUSTRY_ART } from '@/components/ux/art'
import { FLAVOUR_CLASSES, STAGE_LIGHT, UX_FLAVOUR } from '@/components/ux/flavour'
import { ScrollTrigger } from '@/lib/gsap'
import '@/styles/v2-phone.css'
import '@/styles/v2-scroll.css'
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
  why,
} from '@/content/uxCommerce'

/**
 * UX & Digital Commerce — the sixth service page on the CX page's locked
 * design (16 Oct), built as the others are: every CX section fed this
 * page's copy (src/content/uxCommerce.ts), the film on Twins for Peace,
 * Enda Sportswear and Coco & Coir, the services with the CX page's marks
 * (the same kind of work). Its own sections: AI where it improves the
 * experience and the businesses it serves, under the services; the
 * commerce architecture (CommerceArchitecture), the page's story; and the
 * next commerce platform, where the others have their toolkit. Its glass
 * object is a shopping bag. The commerce flavour (components/ux/flavour.tsx)
 * is a trial behind UX_FLAVOUR.
 */
export function UxCommercePage() {
  useEffect(() => {
    document.title = meta.title
    document.documentElement.classList.add('cx-v2', 'ux-page')
    if (UX_FLAVOUR) document.documentElement.classList.add(...FLAVOUR_CLASSES)
    /* as on the CX page: measure the pins again once fonts and images land */
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      document.documentElement.classList.remove('cx-v2', 'ux-page', ...FLAVOUR_CLASSES)
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
          <HeroV2 content={hero} chipTone="coral" object="bag" />
          <WhyBand content={why} ribbon={ribbon} ribbonTone="coral" lightTone="blossom" />
        </div>
        <UxFilm />
        <ServicesV2 content={services} />
        <AiMoments />
        <Industries content={industries} art={UX_INDUSTRY_ART} />
        <StagesV2 content={stages} light={STAGE_LIGHT} />
        <CommerceArchitecture />
        <Platforms />
        <ProcessClose process={process} closing={closing} faq={faq}>
          <Engagement content={engagement} />
        </ProcessClose>
      </main>
      <ToTop />
    </>
  )
}
