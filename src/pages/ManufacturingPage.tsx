import { useEffect } from 'react'
import { MfgHero } from '@/components/industry/mfg/MfgHero'
import { MfgReality } from '@/components/industry/mfg/MfgReality'
import { MfgEnable } from '@/components/industry/mfg/MfgEnable'
import { MfgModel } from '@/components/industry/mfg/MfgModel'
import { MfgArchitecture } from '@/components/industry/mfg/MfgArchitecture'
import { MfgWork } from '@/components/industry/mfg/MfgWork'
import { MfgAudiences } from '@/components/industry/mfg/MfgAudiences'
import { MfgAudiencesPanels } from '@/components/industry/mfg/MfgAudiencesPanels'
import { MfgImpact } from '@/components/industry/mfg/MfgImpact'
import { MfgRollout } from '@/components/industry/mfg/MfgRollout'
import { MfgContact } from '@/components/industry/mfg/MfgContact'
import { meta } from '@/content/manufacturing'
import { useReveal } from '@/lib/useReveal'
import '@/styles/fin-final.css'
import '@/styles/mfg.css'
import '@/styles/mfg-art.css'
import '@/styles/mfg-enable.css'
import '@/styles/mfg-model.css'
import '@/styles/mfg-arch.css'
import '@/styles/mfg-work.css'
import '@/styles/mfg-impact.css'

/**
 * The Manufacturing page (Krish, 12 Nov), at /manufacturing: the new flow
 * every industry page now follows, from the draft at
 * umm-industry-pages.ai-umm.chatgpt.site/manufacturing, designed in full in
 * the language of the final Fintech page.
 *
 *   01 opening     the line in UMM's clear glass, the planning queue on ink
 *   02 reality     three handoffs on flat pastel cards, each acted out; the
 *                  point of view drawn
 *   03 enable      procurement and the four capabilities dealt as one deck
 *                  as you scroll, revenue operations closing the chain
 *   04 model       the plant and its digital twin, side by side
 *   05 architecture  the value chain, the AI layer over it and the twin
 *                  loop, three workflows played through it
 *   06 work        Mohawk, its three engagements on a sideways track
 *   07 audiences   one order riding a belt through four stations, one per
 *                  operating context (?audiences=panels: the first version,
 *                  four panels, one opening wide)
 *   08 impact      the industry pages' dark sheet: six decisions, each
 *                  with what makes it work as a formula
 *   09 rollout     one line to many plants
 *   10 contact     the gears handing on the turn
 */
export function ManufacturingPage() {
  const panels = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('audiences') === 'panels'
  useEffect(() => {
    document.title = meta.title
  }, [])
  useReveal([])
  return (
    <div className="ind ff mf">
      <MfgHero />
      <main>
        <MfgReality />
        <MfgEnable />
        <MfgModel />
        <MfgArchitecture />
        <MfgWork />
        {panels ? <MfgAudiencesPanels /> : <MfgAudiences />}
        <MfgImpact />
        <MfgRollout />
        <MfgContact />
      </main>
    </div>
  )
}
