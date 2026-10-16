import { ProofFilm, type Flow } from '@/components/v2/ProofFilm'
import { film } from '@/content/uxCommerce'

/* ============================================================================
   UX & DIGITAL COMMERCE · SELECTED WORK — the CX film, with this page's work

   The same player, timing, cuts and last frame as the CX page's film
   (ProofFilm), on Twins for Peace, Enda Sportswear and Coco & Coir. Twins
   for Peace plays its shopping flow, as on the CX page (collection,
   product, bag, checkout); Enda and Coco & Coir as their stores scrolling
   (one long capture each). The page plays the exports, film/ux-wide.mp4
   and film/ux-tall.mp4 (scripts/render-film.mjs --film ux).
   ========================================================================== */

/** where each store rests (yPercent of the capture) */
const PAGES: Record<string, number[]> = {
  /* the shop, the story, the community, the bridge run */
  enda: [-16, -30, -44, -60],
  /* the hero, the first shelf, the second, the third */
  cocoandcoir: [-8, -24, -43, -62],
}

const FLOWS: Record<string, Flow> = {
  tfp: [
    { src: 's0', click: [0.164, 0.715] },
    { src: 's1', click: [0.231, 0.542] },
    { src: 's2', click: [0.5, 0.82] },
    { src: 's3' },
  ],
}

export function UxFilm({ mode = 'page', tall }: { mode?: 'page' | 'render'; tall?: boolean }) {
  return <ProofFilm mode={mode} tall={tall} content={film} flows={FLOWS} pages={PAGES} cut="ux" />
}
