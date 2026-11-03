/* ============================================================================
   CASES — the case studies the homepage heroes show (Ring.ts, Marble.ts)

   Twelve of UMM's case studies, by their slug on umm.digital and their
   titles there; public/home/cases holds each one's render, as the live
   site's case-study card shows it, and its client's logo.
   ========================================================================== */

export const CASES: [string, string][] = [
  ['mohawk-recover', 'Reimagining Sustainability Through Digital Transformation'],
  ['biocon-group', 'Unified Digital Transformation for Global Biotech'],
  ['lyca-eshop', '15% increase in average order value'],
  ['penny-co', 'Engineering a High-Performance Digital Platform for a FinTech Innovator'],
  ['habari', 'A Digital Gateway for Tanzania’s Fastest Internet'],
  ['iadeptive', 'Positioning as a Technology Leader in AI & DevOps'],
  ['aladdin-commercial', 'Reengineering Product Discovery for Commercial Flooring Professionals'],
  ['kulkuf', 'Building a Digital Ecosystem for Blockchain and Digital Finance'],
  ['coco-coir', 'Crafting a Modern E-Commerce Experience for Sustainable Home Products'],
  ['yiksi', 'Building a Digital Gateway Between Mobile Money and the Crypto Economy'],
  ['academy-of-beauty', 'Building a Digital Experience for the Next Generation of Beauty Professionals'],
  ['steward', 'Building the Digital Foundation for Smarter Energy Management'],
]

export const caseUrl = (slug: string) => `https://umm.digital/casestudies/${slug}/`
export const caseImage = (slug: string) => `/home/cases/${slug}.webp`
export const caseLogo = (slug: string) => `/home/cases/${slug}-logo.webp`

/** the logos drawn in white, which sit on a dark tag instead */
export const LIGHT = new Set(['penny-co', 'lyca-eshop', 'habari'])

/** the renders' proportions (the live cards, 1024 x 829) */
export const CASE_ASPECT = 1024 / 829
