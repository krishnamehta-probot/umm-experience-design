/* ============================================================================
   HOME — hero content, shared by the three hero versions

   The homepage does not answer anything itself. Every question, picked or
   typed, is handed to RAGe, UMM's own question-and-answer model, which reads
   it from ?query= and submits it on arrival.
   ========================================================================== */

export const homeNav = {
  links: [
    { label: 'UMM AI', href: 'https://umm.digital/rage/', spark: true },
    { label: 'Expertise', href: '#' },
    { label: 'Re>Think', href: '#' },
    { label: 'Industries', href: '#' },
    { label: 'Resources', href: '#' },
    { label: 'About', href: '#' },
  ],
  cta: { label: 'Get in touch', href: 'https://umm.digital/contact-us/' },
}

/** The live site's nav, word for word (umm.digital, 28 Oct): five titles,
 *  each opening its own panel of a wordmark, a render and its links. A
 *  link turns to `accent` on hover (UMM AI and About keep their colour, as
 *  on the live site). The artwork is the live site's own, in public/nav. */
type MenuLink = { label: string; href: string; icon: string }
export type SiteMenu = {
  label: string
  icon?: string
  kind?: 'ai'
  mark: string
  render: string
  accent?: string
  cols: MenuLink[][]
  card?: { href: string; img: string; alt: string }
}

const U = 'https://umm.digital'
export const siteMenu: SiteMenu[] = [
  {
    label: 'UMM AI',
    icon: '/nav/umm-ai.svg',
    kind: 'ai',
    mark: '/nav/mark-ai.svg',
    render: '/nav/render-ai.webp',
    cols: [
      [
        { label: 'AI Consulting', href: `${U}/ai-consulting/`, icon: '/nav/ai1.svg' },
        { label: 'AI Platforms', href: `${U}/ai-platforms/`, icon: '/nav/ai3.svg' },
        { label: 'Winning with AI', href: `${U}/winning-with-ai/`, icon: '/nav/ai4.svg' },
      ],
    ],
    card: { href: `${U}/rage/`, img: '/nav/rage-card.webp', alt: 'RAGe ai: your AI guide to everything UMM' },
  },
  {
    label: 'Expertise',
    mark: '/nav/mark-wedo.svg',
    render: '/nav/render-expertise.webp',
    accent: '#4ECCFF',
    cols: [
      [
        { label: 'AI & Automation', href: `${U}/service/ai-automation/`, icon: '/nav/e1.svg' },
        { label: 'UX & Digital Commerce', href: `${U}/service/ux-digital-commerce/`, icon: '/nav/e2.svg' },
        { label: 'Digital Engineering', href: `${U}/service/digital-engineering/`, icon: '/nav/e3.svg' },
        { label: 'Cloud & Data', href: `${U}/service/cloud-data/`, icon: '/nav/e4.svg' },
      ],
      [
        { label: 'Customer Experience & UI Design', href: `${U}/service/experience-design-cx/`, icon: '/nav/e5.svg' },
        { label: 'Integrated Growth & Strategy', href: `${U}/service/integrated-growth-strategy/`, icon: '/nav/e6.svg' },
      ],
    ],
  },
  {
    label: 'Industries',
    mark: '/nav/mark-sector.svg',
    render: '/nav/render-industries.png',
    accent: '#FF6600',
    cols: [
      [
        { label: 'Fintech, Banking & Insurance', href: `${U}/fintech-banking-insurance/`, icon: '/nav/s1.svg' },
        { label: 'Manufacturing', href: `${U}/manufacturing/`, icon: '/nav/s2.svg' },
        { label: 'Telecom & Media', href: `${U}/telecom/`, icon: '/nav/s3.svg' },
        { label: 'Retail & Ecommerce', href: `${U}/retail-and-ecommerce/`, icon: '/nav/s4.svg' },
        { label: 'Education', href: `${U}/education/`, icon: '/nav/s5.svg' },
      ],
      [
        { label: 'Deep-tech & AI', href: `${U}/deep-tech-and-ai/`, icon: '/nav/s6.svg' },
        { label: 'Software & SAAS', href: `${U}/software-and-saas/`, icon: '/nav/s7.svg' },
        { label: 'Capital Markets, PE/VC', href: `${U}/capital-markets-pe-vc/`, icon: '/nav/s8.svg' },
        { label: 'Bio-Tech & Life Science', href: `${U}/bio-tech-and-life-science/`, icon: '/nav/s9.svg' },
        { label: 'Government', href: `${U}/government/`, icon: '/nav/s10.svg' },
      ],
    ],
  },
  {
    label: 'Resources',
    mark: '/nav/mark-know.svg',
    render: '/nav/render-resources.webp',
    accent: '#FFC400',
    cols: [[{ label: 'Case Studies', href: `${U}/case-studies/`, icon: '/nav/k1.svg' }]],
  },
  {
    label: 'About',
    mark: '/nav/mark-minds.svg',
    render: '/nav/render-about.webp',
    cols: [
      [
        { label: 'Journey', href: `${U}/about/`, icon: '/nav/m1.svg' },
        { label: 'Life@umm', href: `${U}/about/culture/`, icon: '/nav/m2.svg' },
      ],
    ],
  },
]

export const siteCta = { label: 'Get in Touch', href: `${U}/contact/` }

export const homeHero = {
  title: ['AI-first engineering,', 'built to deliver.'],
  placeholder: 'What can we help you achieve?',
  pillars: ['Strategy', 'Experience', 'Product', 'AI First'],
}

export const rage = {
  name: 'RAGe',
  tagline: 'Get to know UMM’s world instantly. Just ask!',
  url: (q: string) => `https://umm.digital/rage/?query=${encodeURIComponent(q)}`,
}

/** The six chips exactly as the live hero words them, each with the form
 *  the landing's dots gather into on hover, picturing what the chip says
 *  (forms.ts). */
export const asciiChips = [
  { q: 'Architect data-rich solutions for tomorrow’s leaders', scene: 'lattice' },
  { q: 'Accelerate your digital transformation', scene: 'warp' },
  { q: 'Drive innovation through AI-powered solutions', scene: 'spark' },
  { q: 'Build scalable solutions for the future', scene: 'grid' },
  { q: 'See how UMM delivers impact', scene: 'globe' },
  { q: 'Scale smarter with UMM’s AI-powered solutions', scene: 'land' },
] as const

/** The live site's reel, the fallback for the hero's bottom-right card until
 *  the eye film is added at public/home/eye.mp4. */
export const eyeFilm = 'https://umm.digital/wp-content/uploads/2026/08/home-f-1.webm'
