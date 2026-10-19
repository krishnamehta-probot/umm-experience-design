import { ProofFilm } from '@/components/v2/ProofFilm'
import { film } from '@/content/growth'

/* ============================================================================
   INTEGRATED GROWTH & STRATEGY · SELECTED WORK — the CX film, this page's work

   The same player, timing, cuts and last frame as the CX page's film
   (ProofFilm), on Biocon Group, iAdeptive and Enda Sportswear (that order,
   Krish 19 Oct), each as its live homepage scrolling (one long capture, as
   Licuido does on CX). The page plays the exports, film/growth-wide.mp4 and
   film/growth-tall.mp4
   (scripts/render-film.mjs --film growth).
   ========================================================================== */

/** where each homepage rests (yPercent of the capture) */
const PAGES: Record<string, number[]> = {
  /* the shop, the story, the community, the bridge run */
  enda: [-16, -30, -44, -60],
  /* the differentiators, the impact, the firsts, the commitment */
  biocon: [-22, -39, -52, -68],
  /* the approach, the certifications, AI-driven solutions, insights */
  iadeptive: [-14, -33, -48, -73],
}

export function GrowthFilm({ mode = 'page', tall }: { mode?: 'page' | 'render'; tall?: boolean }) {
  return <ProofFilm mode={mode} tall={tall} content={film} flows={{}} pages={PAGES} cut="growth" />
}
