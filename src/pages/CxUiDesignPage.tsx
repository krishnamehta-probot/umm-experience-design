import { useEffect } from 'react'
import { NavV2 } from '@/components/v2/NavV2'
import { HeroV2 } from '@/components/v2/HeroV2'
import { WhyBand } from '@/components/v2/WhyBand'
import { ProofFilm } from '@/components/v2/ProofFilm'
import { ServicesV2 } from '@/components/v2/ServicesV2'
import { StagesV2 } from '@/components/v2/StagesV2'
import { Principles } from '@/components/v2/Principles'
import { ToolsWheel } from '@/components/v2/ToolsWheel'
import { ProcessClose } from '@/components/v2/ProcessClose'
import { ScrollTrigger } from '@/lib/gsap'
import { meta } from '@/content/cxUiDesign'

/**
 * CX and UI Design — v2, the second iteration after Santosh's 30 Sep review.
 *
 * Seven sections in his order: hook, why it matters, real work (a 30-second
 * film), what we do,
 * by business stage, how we design (rules + tools), how we work + let's talk.
 * Copy: docs/cx-ui-design-copy.md. References: docs/cx-ui-design-references.md.
 * Progress: docs/PROGRESS.md. The v1 page lives on at /v1.
 */
export function CxUiDesignPage() {
  useEffect(() => {
    document.title = meta.title
    document.documentElement.classList.add('cx-v2')

    /* Pins are measured against the page as it stands. Fonts and the screens
       arrive after first layout and move everything below them, so measure
       again once they have. */
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      document.documentElement.classList.remove('cx-v2')
    }
  }, [])

  return (
    <>
      <a className="umm-skip-link" href="#work">
        Skip to our work
      </a>
      <NavV2 />

      <main className="cx-page">
        {/* The hero holds while the dark Why section rises over it, so the
            two share one wrapper: the hero's sticky hold ends with it. */}
        <div className="cx-intro">
          <HeroV2 />
          <WhyBand />
        </div>
        {/* "Our work" is now a 30-second film (it replaced the tabbed
            section on 2 Oct); it keeps the #work anchor */}
        <ProofFilm />
        <ServicesV2 />
        <StagesV2 />
        <Principles />
        <ToolsWheel />
        <ProcessClose />
      </main>
    </>
  )
}
