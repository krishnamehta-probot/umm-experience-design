import { useEffect } from 'react'
import { NavV2 } from '@/components/v2/NavV2'
import { HeroV2 } from '@/components/v2/HeroV2'
import { WhyBand } from '@/components/v2/WhyBand'
import { ServicesV2, type ServiceMarks } from '@/components/v2/ServicesV2'
import { StagesV2 } from '@/components/v2/StagesV2'
import { ToolsStack } from '@/components/v2/ToolsStack'
import { ProcessClose } from '@/components/v2/ProcessClose'
import { ToTop } from '@/components/v2/ToTop'
import { AiFilm } from '@/components/ai/AiFilm'
import { InvoiceFlow } from '@/components/ai/InvoiceFlow'
import { Engagement } from '@/components/ai/Engagement'
import { ScrollTrigger } from '@/lib/gsap'
import { useSmoothWheel } from '@/lib/smoothWheel'
import '@/styles/v2-phone.css'
import '@/styles/v2-scroll.css'
import strategy from '@/lottie/ai-services/strategy.json'
import agents from '@/lottie/ai-services/agents.json'
import workflowMark from '@/lottie/ai-services/workflow.json'
import prototype from '@/lottie/ai-services/prototype.json'
import integration from '@/lottie/ai-services/integration.json'
import mlops from '@/lottie/ai-services/mlops.json'
import { closing, faq, hero, meta, nav, process, ribbon, services, stages, tools, why } from '@/content/aiAutomation'

/**
 * AI & Automation — a second service page on the CX page's locked design.
 *
 * Krish, 12 Oct: the design is locked. Every section the CX page has is the
 * same component here, fed this page's copy (src/content/aiAutomation.ts):
 * nav, hero, the Why band (its stickers are AI ideas converging on one
 * purpose), services, stages, the tools wheel, the roadmap and the closing.
 * The CX page itself renders exactly as before (each component defaults to
 * the CX copy). Only where the AI copy has no CX section is there a new one,
 * built in the same language: "AI in practice", the invoice workflow and the
 * four ways to start under the roadmap.
 * The hero's glass object is the AI sparkle and the strip is lilac, so the
 * page doesn't read as a copy of CX.
 */
/** The AI services' own Lottie scenes (scripts/build_ai_service_marks.py),
 *  keyed by the marks the content's cards carry (wide 2 : 1 scenes from
 *  scripts/ai_marks/, each resting finished on frame 0): strategy → a maze
 *  solved after one dead end, agents → a chat buddy that listens, thinks,
 *  answers and hands over to a person, workflow → messy documents scanned
 *  into neat ones on a conveyor, one held back, prototype → a pencil sketch
 *  made real and clicked, integration → the AI piece clicked into a puzzle of
 *  systems, MLOps → a heartbeat that drifts, is tuned and recovers. */
const AI_MARKS: ServiceMarks = {
  research: strategy,
  interface: agents,
  journey: workflowMark,
  testing: prototype,
  data: integration,
  brand: mlops,
}

export function AiAutomationPage() {
  useSmoothWheel()
  useEffect(() => {
    document.title = meta.title
    document.documentElement.classList.add('cx-v2', 'ai-page')

    /* as on the CX page: measure the pins again once fonts and images land */
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      document.documentElement.classList.remove('cx-v2', 'ai-page')
    }
  }, [])

  return (
    <>
      <a className="umm-skip-link" href="#applications">
        Skip to AI in practice
      </a>
      <NavV2 items={nav} />

      <main className="cx-page">
        <div className="cx-intro">
          <HeroV2 content={hero} chipTone="citrus" object="sparkle" />
          <WhyBand content={why} ribbon={ribbon} ribbonTone="lilac" lightTone="lilac" />
        </div>
        <AiFilm />
        <ServicesV2 content={services} marks={AI_MARKS} still={0} />
        <StagesV2 content={stages} light="network" />
        <InvoiceFlow />
        <ToolsStack content={tools} />
        <ProcessClose process={process} closing={closing} faq={faq}>
          <Engagement />
        </ProcessClose>
      </main>
      <ToTop />
    </>
  )
}
