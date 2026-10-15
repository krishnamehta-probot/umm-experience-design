import { ProofFilm, type Flow } from '@/components/v2/ProofFilm'
import { film } from '@/content/cloudData'

/* ============================================================================
   CLOUD & DATA · SELECTED WORK — the CX film, with this page's projects

   The same player, timing, cuts and last frame as the CX page's film
   (ProofFilm), on Zceppa, Mohawk PriceFx and QCare. Zceppa plays as its
   live homepage scrolling (one long capture, as Licuido does on CX); Mohawk
   and QCare as screen flows, the cursor clicking what takes it to the next
   screen. The page plays the exports, film/cloud-wide.mp4 and
   film/cloud-tall.mp4 (scripts/render-film.mjs --film cloud).
   ========================================================================== */

/** Zceppa's homepage: the review tools, social sharing, the multi-location
 *  dashboard, then the integrations (yPercent of the capture) */
const PAGES: Record<string, number[]> = {
  zceppa: [-11.5, -21.5, -49.5, -70.5],
}

const FLOWS: Record<string, Flow> = {
  /* sign in with Microsoft, the pricing data, go offline, come back online
     to the prompt to request the latest data */
  mohawk: [
    { src: 's0', click: [0.5, 0.549] },
    { src: 's2', click: [0.765, 0.059] },
    { src: 's3', click: [0.707, 0.059] },
    { src: 's4' },
  ],
  /* the guest invites, inviting a guest, the notice board, the buildings */
  qcare: [
    { src: 's4', click: [0.915, 0.105] },
    { src: 's5', click: [0.77, 0.726] },
    { src: 's7', click: [0.096, 0.254] },
    { src: 's8' },
  ],
}

export function CloudFilm({ mode = 'page', tall }: { mode?: 'page' | 'render'; tall?: boolean }) {
  return <ProofFilm mode={mode} tall={tall} content={film} flows={FLOWS} pages={PAGES} cut="cloud" />
}
