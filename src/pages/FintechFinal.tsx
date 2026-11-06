import { useEffect } from 'react'
import { FinalHero } from '@/components/industry/final/FinalHero'
import { FinalReality } from '@/components/industry/final/FinalReality'
import { FinalJourneys } from '@/components/industry/final/FinalJourneys'
import { FinalOps } from '@/components/industry/final/FinalOps'
import { FinalSystem } from '@/components/industry/final/FinalSystem'
import { FinalWork } from '@/components/industry/final/FinalWork'
import { FinalAudiences } from '@/components/industry/final/FinalAudiences'
import { FinalImpact } from '@/components/industry/final/FinalImpact'
import { FinalAi } from '@/components/industry/final/FinalAi'
import { FinalContact } from '@/components/industry/final/FinalContact'
import { meta } from '@/content/fintech'
import { useReveal } from '@/lib/useReveal'

/**
 * The final Fintech, Banking & Insurance page (Krish, 6 Nov), at its own
 * link, /fintech-final. He is taking it section by section from the two
 * modern pages (?page=panel and ?page=grid on /fintech-banking-insurance)
 * and briefing each; sections are added here as he briefs them.
 *
 *   01 hero     the eyebrow over the heading, the lead and UMM's actions;
 *               a sector card with a blue 3D element per sector, and the
 *               glass bank card
 *   02 reality  from Grid: heading, a studio tile with an element per
 *               pressure, the numbered pressures, the point of view
 *   03 journeys from Panel: heading and the connected view on the left, the
 *               six journeys expanding on the right, each with its own
 *               illustration
 *   04 operations  the service pages' cards: three pastel cards with the
 *               bitten corner, each peeling back to its points
 *   05 system   a guided tour of the reference architecture: a case
 *               travelling through the lanes step by step
 *   06 work     after Framer's ImageScroller: a pinned screen the cases
 *               take in turn, a thumbnail dock with a gliding outline
 *   07 audiences  four pastel panels; the chosen one opens wide
 *   08 impact   the industry pages' template: a dark sheet, each shift
 *               "From X to Y." struck and risen
 *   09 ai       three workflow cards, a case running through each
 *   10 contact  the hero's studio grey and flower, now in glass
 */
export function FintechFinal() {
  useEffect(() => {
    document.title = meta.title
  }, [])
  useReveal([])
  return (
    <div className="ind ff">
      <FinalHero />
      <main>
        <FinalReality />
        <FinalJourneys />
        <FinalOps />
        <FinalSystem />
        <FinalWork />
        <FinalAudiences />
        <FinalImpact />
        <FinalAi />
        <FinalContact />
      </main>
    </div>
  )
}
