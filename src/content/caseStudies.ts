/* ============================================================================
   CASE STUDIES — the 29 on umm.digital/casestudies, for /casestudies

   Order, titles, industries (the live page's filter tabs), videos and logos
   are the live page's (5 Nov 2026). Each has, in public/casestudies:

     <slug>.webp        its card render, 1024 wide (the live card's poster)
     <slug>-s.webp      the same, 360 wide, for the small cards
     logo/<slug>.webp   its client's logo, as the live card sets it on top
     icon/<industry>.webp  the industry's Cool Shape, for the uniform cards

   Three videos are local (public/casestudies/video), as Krish asked for to
   start with (5 Nov); the rest play from umm.digital. `colors` are the
   render's three strongest colours, for the background to take up.
   `logoLight`: a white logo, which needs a dark ground under it.
   ========================================================================== */

export type CaseStudy = {
  slug: string
  client: string
  title: string
  industry: string
  video: string
  colors: [string, string, string]
  logoLight: boolean
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'kulkuf',
    client: 'Kulkuf',
    title: 'Building a Digital Commerce Experience for Smart Health Wearables',
    industry: 'Healthtech',
    video: '/casestudies/video/kulkuf.webm',
    colors: ['#01ebfd', '#004fae', '#002d70'],
    logoLight: false,
  },
  {
    slug: 'healthxafrica',
    client: 'HealthX Africa',
    title: 'Powering a Digital Gateway for Africa’s Healthcare Innovation Ecosystem',
    industry: 'Healthcare',
    video: '/casestudies/video/healthxafrica.webm',
    colors: ['#cf4805', '#fd8f0a', '#762503'],
    logoLight: false,
  },
  {
    slug: 'mohawk-pricefx',
    client: 'Mohawk Pricing',
    title: 'Empowering Enterprise Pricing Operations with Connected Digital Platforms',
    industry: 'Manufacturing',
    video: '/casestudies/video/mohawk-pricefx.webm',
    colors: ['#ad1612', '#d14739', '#fcf6f2'],
    logoLight: false,
  },
  {
    slug: 'belfrics',
    client: 'Belfrics',
    title: 'Building a Digital Ecosystem for Blockchain and Digital Finance',
    industry: 'Fintech',
    video: 'https://umm.digital/wp-content/uploads/2026/09/belfrics.webm',
    colors: ['#ff4a4c', '#6e090a', '#b1181a'],
    logoLight: false,
  },
  {
    slug: 'yiksi',
    client: 'Yiksi',
    title: 'Building a Digital Gateway Between Mobile Money and the Crypto Economy',
    industry: 'Fintech',
    video: 'https://umm.digital/wp-content/uploads/2026/09/yiksi-1.webm',
    colors: ['#2b0350', '#500a8f', '#782fc6'],
    logoLight: true,
  },
  {
    slug: 'steward',
    client: 'Utility Steward',
    title: 'Building the Digital Foundation for Smarter Energy Management',
    industry: 'Energy',
    video: 'https://umm.digital/wp-content/uploads/2026/09/grid-steward-1.webm',
    colors: ['#4f3401', '#ad7407', '#eda819'],
    logoLight: false,
  },
  {
    slug: 'enda-sportswear',
    client: 'Enda',
    title: 'Taking a Kenyan Performance Brand Global Through Digital Commerce',
    industry: 'Ecommerce',
    video: 'https://umm.digital/wp-content/uploads/2026/09/enda-cs.webm',
    colors: ['#4d4d4d', '#4d4d4d', '#4d4d4d'],
    logoLight: true,
  },
  {
    slug: 'academy-of-beauty',
    client: 'Academy of Beauty',
    title: 'Building a Digital Experience for the Next Generation of Beauty Professionals',
    industry: 'Beauty & Wellness',
    video: 'https://umm.digital/wp-content/uploads/2026/09/academy-cs.webm',
    colors: ['#fdf1f8', '#f5b3cd', '#c3869b'],
    logoLight: false,
  },
  {
    slug: 'mawingu',
    client: 'Mawingu',
    title: 'Building a Digital Presence for an African Connectivity Provider',
    industry: 'Telecom',
    video: 'https://umm.digital/wp-content/uploads/2026/09/mawingu-cs.webm',
    colors: ['#0390eb', '#4fb4f4', '#001472'],
    logoLight: false,
  },
  {
    slug: 'licuido',
    client: 'Licuido',
    title: 'Creating a Digital Platform for a Growing Technology Brand',
    industry: 'Fintech',
    video: 'https://umm.digital/wp-content/uploads/2026/09/0930-2-1.webm',
    colors: ['#021332', '#324c6d', '#0650ae'],
    logoLight: false,
  },
  {
    slug: 'twins-for-peace',
    client: 'Twins for Peace',
    title: 'Building a Purpose-Led Fashion Brand Through Digital Commerce',
    industry: 'Ecommerce',
    video: 'https://umm.digital/wp-content/uploads/2026/09/twinsforpeace-cs.webm',
    colors: ['#d02e2f', '#f1706f', '#f7afaf'],
    logoLight: false,
  },
  {
    slug: 'nvh-studios',
    client: 'NVH Studios',
    title: 'Transforming Creative Storytelling Through a Scalable Digital Experience',
    industry: 'Media',
    video: 'https://umm.digital/wp-content/uploads/2026/09/nvh.webm',
    colors: ['#323232', '#6e6e6e', '#aeaeae'],
    logoLight: true,
  },
  {
    slug: 'qcare',
    client: 'QCare',
    title: 'Digitizing Student Accommodation Operations for Scalable Property Management',
    industry: 'Real Estate',
    video: 'https://umm.digital/wp-content/uploads/2026/08/main-1.webm',
    colors: ['#f98a52', '#8d2909', '#cf5827'],
    logoLight: false,
  },
  {
    slug: 'playmonk',
    client: 'Playmonk',
    title: 'Building a Scalable Social Ecosystem for the eSports Industry',
    industry: 'Gaming',
    video: 'https://umm.digital/wp-content/uploads/2026/09/playmonk.mp4',
    colors: ['#d20914', '#32090b', '#d20914'],
    logoLight: false,
  },
  {
    slug: 'fintuit',
    client: 'Fintuit',
    title: 'Designing a Unified Digital Experience for a Modern Financial Platform',
    industry: 'Fintech',
    video: 'https://umm.digital/wp-content/uploads/2026/09/fintuit-1.webm',
    colors: ['#6ab304', '#98e727', '#2f4f03'],
    logoLight: false,
  },
  {
    slug: 'aladdin-commercial',
    client: 'Aladdin Commercial',
    title: 'Reengineering Product Discovery for Commercial Flooring Professionals',
    industry: 'Manufacturing',
    video: 'https://umm.digital/wp-content/uploads/2026/08/main-6.webm',
    colors: ['#348dd1', '#124894', '#69bae9'],
    logoLight: false,
  },
  {
    slug: 'coco-coir',
    client: 'Coco Coir',
    title: 'Crafting a Modern E-Commerce Experience for Sustainable Home Products',
    industry: 'Ecommerce',
    video: 'https://umm.digital/wp-content/uploads/2026/08/08263.webm',
    colors: ['#eefdcd', '#abd576', '#4c702e'],
    logoLight: false,
  },
  {
    slug: 'mohawk-recover',
    client: 'Mohawk ReCover',
    title: 'Reimagining Sustainability Through Digital Transformation',
    industry: 'Manufacturing',
    video: 'https://umm.digital/wp-content/uploads/2026/08/mohawk-recover-main-.webm',
    colors: ['#d42d2f', '#f0eeee', '#f4746c'],
    logoLight: false,
  },
  {
    slug: 'penny-co',
    client: 'Penny',
    title: 'Engineering a High-Performance Digital Platform for a FinTech Innovator',
    industry: 'Fintech',
    video: 'https://umm.digital/wp-content/uploads/2026/08/main-2.webm',
    colors: ['#343434', '#6e6e6e', '#afafaf'],
    logoLight: true,
  },
  {
    slug: 'habari',
    client: 'Habari',
    title: 'A Digital Gateway for Tanzania’s Fastest Internet',
    industry: 'Telecom',
    video: 'https://umm.digital/wp-content/uploads/2026/08/0826.webm',
    colors: ['#cf3a32', '#f7696d', '#320304'],
    logoLight: false,
  },
  {
    slug: 'zceppa',
    client: 'Zceppa',
    title: 'Transforming Review Intelligence and Customer Reputation Management',
    industry: 'Technology',
    video: 'https://umm.digital/wp-content/uploads/2026/08/main-4.webm',
    colors: ['#044d26', '#0c8f49', '#044d26'],
    logoLight: false,
  },
  {
    slug: 'vuka',
    client: 'Vuka',
    title: 'Democratizing Real Estate Investment Through Technology',
    industry: 'Real Estate',
    video: 'https://umm.digital/wp-content/uploads/2026/08/vuka-main.webm',
    colors: ['#4772f6', '#70aefe', '#1a2e8e'],
    logoLight: false,
  },
  {
    slug: 'iadeptive',
    client: 'iAdeptive',
    title: 'Positioning as a Technology Leader in AI & DevOps',
    industry: 'Technology',
    video: 'https://umm.digital/wp-content/uploads/2025/11/i-adeptive-1-1.mp4',
    colors: ['#4b1801', '#f6b04e', '#feefc9'],
    logoLight: false,
  },
  {
    slug: 'biocon-group',
    client: 'Biocon',
    title: 'Unified Digital Transformation for Global Biotech',
    industry: 'Biotech',
    video: 'https://umm.digital/wp-content/uploads/2025/11/biocon-group-1.mp4',
    colors: ['#16c3ee', '#472ea6', '#3272c7'],
    logoLight: false,
  },
  {
    slug: 'lyca-radio',
    client: 'Lyca Radio',
    title: 'Enhancing Radio Broadcasting with Cutting-Edge App Development',
    industry: 'Media',
    video: 'https://umm.digital/wp-content/uploads/2025/11/lyca-radio-2-1.mp4',
    colors: ['#d7d6d7', '#e5742d', '#4f0e0a'],
    logoLight: true,
  },
  {
    slug: 'lyca-eshop',
    client: 'Lyca eShop',
    title: '15% Increase in Average Order Value',
    industry: 'Telecom',
    video: 'https://umm.digital/wp-content/uploads/2025/11/lyca-eshop-f-1.mp4',
    colors: ['#124e14', '#31122e', '#12ac14'],
    logoLight: true,
  },
  {
    slug: 'qwetu',
    client: 'Qwetu',
    title: 'Innovating Student Housing in Africa',
    industry: 'Hospitality',
    video: 'https://umm.digital/wp-content/uploads/2025/11/qwetu-reel.mp4',
    colors: ['#f78f06', '#fcc82f', '#fce690'],
    logoLight: false,
  },
  {
    slug: 'lycaremit',
    client: 'Lyca Remit',
    title: 'Digital Platform for International Money Transfers',
    industry: 'Fintech',
    video: 'https://umm.digital/wp-content/uploads/2025/11/Lyca-remit-app-6.mp4',
    colors: ['#6edb4d', '#35b329', '#091031'],
    logoLight: true,
  },
  {
    slug: 'mohawk-benefits',
    client: 'Mohawk Benefits',
    title: 'Empowering Employees Through Digital Education',
    industry: 'Manufacturing',
    video: 'https://umm.digital/wp-content/uploads/2025/11/mohawk-benefits-reel-1.mp4',
    colors: ['#d02743', '#f18f68', '#702537'],
    logoLight: false,
  },
]

export const INDUSTRY_COUNT = new Set(CASE_STUDIES.map((c) => c.industry)).size

export const casePoster = (slug: string) => `/casestudies/${slug}.webp`
export const caseThumb = (slug: string) => `/casestudies/${slug}-s.webp`
export const caseLogo = (slug: string) => `/casestudies/logo/${slug}.webp`
export const caseLink = (slug: string) => `https://umm.digital/casestudies/${slug}/`

/** the industry's Cool Shape (public/casestudies/icon, drawn by
 *  scripts/render-industry-icons.mjs): bright, in UMM's pastels, or flat in
 *  a single pastel */
export const industryIcon = (industry: string, set: 'bright' | 'pastel' | 'single' = 'bright') =>
  `/casestudies/icon/${industry.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-')}${set === 'bright' ? '' : `-${set}`}.webp`

/** the live cards' proportions (1024 x 829) */
export const CASE_RATIO = 1024 / 829
