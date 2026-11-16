import { useEffect } from 'react'
import { MfgHero } from '@/components/industry/mfg/MfgHero'
import { MfgReality } from '@/components/industry/mfg/MfgReality'
import { MfgEnable } from '@/components/industry/mfg/MfgEnable'
import { MfgModel } from '@/components/industry/mfg/MfgModel'
import { MfgArchitecture } from '@/components/industry/mfg/MfgArchitecture'
import { MfgWork } from '@/components/industry/mfg/MfgWork'
import { MfgWorkSwatch } from '@/components/industry/mfg/MfgWorkSwatch'
import { MfgWorkLoop } from '@/components/industry/mfg/MfgWorkLoop'
import { MfgWorkCarpet } from '@/components/industry/mfg/MfgWorkCarpet'
import { MfgWorkFilm } from '@/components/industry/mfg/MfgWorkFilm'
import { MfgAudiences } from '@/components/industry/mfg/MfgAudiences'
import { MfgAudiencesPanels } from '@/components/industry/mfg/MfgAudiencesPanels'
import { MfgImpact } from '@/components/industry/mfg/MfgImpact'
import { MfgRollout } from '@/components/industry/mfg/MfgRollout'
import { MfgRolloutZoom } from '@/components/industry/mfg/MfgRolloutZoom'
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
import '@/styles/mfg-work-opts.css'
import '@/styles/mfg-impact.css'
import '@/styles/mfg-zoom.css'

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
 *   06 work        Mohawk's three engagements in their own case films, on
 *                  the Fintech page's pinned showcase (16 Nov, final). The
 *                  versions before: the swatch book (?work=swatch), one
 *                  tile's three lives (?work=loop), the carpet unrolling
 *                  (?work=carpet), the sideways track on Mohawk's red
 *                  (?work=red) or on ink (?work=ink)
 *   07 audiences   one order riding a belt through four stations, one per
 *                  operating context (?audiences=panels: the first version,
 *                  four panels, one opening wide)
 *   08 impact      the industry pages' dark sheet: six decisions, each
 *                  with what makes it work as a formula
 *   09 rollout     the zoom: pulling out from one machine to five plants,
 *                  a step at each scale (?rollout=estate: the plan before)
 *   10 contact     the gears handing on the turn
 */
export function ManufacturingPage() {
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const panels = q?.get('audiences') === 'panels'
  const work = q?.get('work') ?? 'film'
  const estate = q?.get('rollout') === 'estate'
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
        {work === 'loop' ? (
          <MfgWorkLoop />
        ) : work === 'carpet' ? (
          <MfgWorkCarpet />
        ) : work === 'red' || work === 'ink' ? (
          <MfgWork look={work === 'red' ? 'mohawk' : 'ink'} />
        ) : work === 'swatch' ? (
          <MfgWorkSwatch />
        ) : (
          <MfgWorkFilm />
        )}
        {panels ? <MfgAudiencesPanels /> : <MfgAudiences />}
        <MfgImpact />
        {estate ? <MfgRollout /> : <MfgRolloutZoom />}
        <MfgContact />
      </main>
    </div>
  )
}
