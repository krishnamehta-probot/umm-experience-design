/* ============================================================================
   CASES — the case studies the homepage heroes show (Ring.ts)

   Twelve of UMM's case studies, by their slug on umm.digital and their
   titles there; public/home/cases holds each one's render, as the live
   site's case-study card shows it, and its client's logo (-logo.webp). The
   hero does not show the logos (3 Nov: putting clients' logos up front is not done), only
   the field each piece of work was in (INDUSTRY).
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

/** the field each case study's work was in, named without the client */
export const INDUSTRY: Record<string, string> = {
  'mohawk-recover': 'Sustainability',
  'biocon-group': 'Biotech',
  'lyca-eshop': 'E-commerce',
  'penny-co': 'Fintech',
  habari: 'Telecom',
  iadeptive: 'AI & DevOps',
  'aladdin-commercial': 'Commercial flooring',
  kulkuf: 'Blockchain',
  'coco-coir': 'Home goods',
  yiksi: 'Mobile money',
  'academy-of-beauty': 'Education',
  steward: 'Energy',
}

/** the renders' proportions (the live cards, 1024 x 829) */
export const CASE_ASPECT = 1024 / 829
