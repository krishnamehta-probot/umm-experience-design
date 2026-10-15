import { ProofFilm, type Flow } from '@/components/v2/ProofFilm'
import { film } from '@/content/engineering'

/* ============================================================================
   DIGITAL ENGINEERING · SELECTED WORK — the CX film, with this page's projects

   The same player, timing, cuts and last frame as the CX page's film
   (ProofFilm), on QCare, Mohawk PriceFx and Penny. QCare and Mohawk play
   their screen flows (as on the Cloud & Data page); Penny plays its live
   homepage scrolling. The page plays the exports, film/eng-wide.mp4 and
   film/eng-tall.mp4 (scripts/render-film.mjs --film eng).
   ========================================================================== */

/** Penny's homepage: the numbers, why Penny, the resources, the questions */
const PAGES: Record<string, number[]> = {
  penny: [-23, -33, -53, -69],
}

const FLOWS: Record<string, Flow> = {
  /* the guest invites, inviting a guest, the notice board, the buildings */
  qcare: [
    { src: 's4', click: [0.915, 0.105] },
    { src: 's5', click: [0.77, 0.726] },
    { src: 's7', click: [0.096, 0.254] },
    { src: 's8' },
  ],
  /* sign in with Microsoft, the pricing data, go offline, come back online
     to the prompt to request the latest data */
  mohawk: [
    { src: 's0', click: [0.5, 0.549] },
    { src: 's2', click: [0.765, 0.059] },
    { src: 's3', click: [0.707, 0.059] },
    { src: 's4' },
  ],
}

export function EngFilm({ mode = 'page', tall }: { mode?: 'page' | 'render'; tall?: boolean }) {
  return <ProofFilm mode={mode} tall={tall} content={film} flows={FLOWS} pages={PAGES} cut="eng" />
}
