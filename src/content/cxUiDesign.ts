import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'

/* ============================================================================
   CX AND UI DESIGN (v2) — PAGE CONTENT

   Word for word from docs/cx-ui-design-copy.md, which Krish approved on
   2 Oct 2026. Edit the deck first, then mirror the change here, so the two
   never drift. Every number below comes from a published UMM case study on
   umm.digital; the voice rules at the top of the deck apply to any edit.

   The tools content is Santosh's approved "systems you already have" section
   and is deliberately untouched.
   ========================================================================== */

export const meta = {
  service: 'CX and UI Design',
  title: 'CX and UI Design | UMM',
  locations: 'Dallas · London · Dubai · Nairobi · Shenzhen',
  contactEmail: 'ping@umm.digital',
}

export const nav = [
  { id: 'work', label: 'Our work' },
  { id: 'services', label: 'Services' },
  { id: 'stages', label: 'Your stage' },
  { id: 'design', label: 'How we design' },
  { id: 'process', label: 'How we work' },
]

/* ── 1 · Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: 'Customer experience & UI design',
  /* three fixed lines; the third is the accent, which carries the chip
     treatment (tail is anything after the chip on that line) */
  lines: ['Make your next', 'digital experience'],
  accent: 'a business advantage.',
  tail: '',
  lead: 'Give your customers a clearer path from interest to action. We bring customer insight, UI/UX design and digital branding together to create websites and apps that are easier to use, distinctly yours and built around your business goals.',
  primaryCta: 'Discuss your project',
  secondaryCta: 'See our work',
}

export const ribbon = [
  'Customer journeys',
  'Website & app design',
  'MVP prototyping',
  'Digital branding',
]

/* ── 2 · Why it matters ───────────────────────────────────────────────────── */

export const why = {
  chip: 'Why design matters',
  line1: 'When everything is digital,',
  line2: 'experience sets you apart.',
  /** the word in the headline the ten teams merge into */
  one: 'experience',
  /** The ten teams, as stickers that fly together into "experience".
   *  x/y place each on the stage (%), r is its tilt. */
  teams: [
    { name: 'Sales', x: 12, y: 18, r: -8, tone: 'citrus' as Tone },
    { name: 'Support', x: 35, y: 10, r: 6, tone: 'blossom' as Tone },
    { name: 'Billing', x: 62, y: 20, r: -5, tone: 'sky' as Tone },
    { name: 'IT', x: 87, y: 13, r: 11, tone: 'sun' as Tone },
    { name: 'Marketing', x: 21, y: 48, r: 7, tone: 'coral' as Tone },
    { name: 'Web team', x: 79, y: 47, r: -9, tone: 'citrus' as Tone },
    { name: 'App team', x: 50, y: 56, r: 4, tone: 'sky' as Tone },
    { name: 'Store', x: 9, y: 80, r: -6, tone: 'sun' as Tone },
    { name: 'Call centre', x: 60, y: 84, r: 8, tone: 'blossom' as Tone },
    { name: 'Delivery', x: 88, y: 78, r: -10, tone: 'coral' as Tone },
  ],
  lead: 'AI is changing how quickly digital products are made. Your advantage comes from how well they serve your customers and express your brand.',
  /** numbered 01–03 on the page */
  pairs: [
    {
      title: 'Understand what people need.',
      body: 'Research the questions, expectations and obstacles behind each interaction before deciding what to design.',
      shape: 'cross-1' as ShapeName,
      tone: 'citrus' as Tone,
    },
    {
      title: 'Make the next step obvious.',
      body: 'Give content and actions a clear order, so people can find, choose, buy or get help without unnecessary effort.',
      shape: 'flower-13' as ShapeName,
      tone: 'blossom' as Tone,
    },
    {
      title: 'Give the experience your identity.',
      body: 'Use a distinctive visual language and consistent interactions to make your brand recognisable across web and mobile.',
      shape: 'clover-1' as ShapeName,
      tone: 'sky' as Tone,
    },
  ],
}

/* ── 3 · Our work, as a 30-second film ───────────────────────────────────── */

/** The film that replaced the "Proof, not promises" tabs (2 Oct). Its
 *  projects and numbers come from work.projects below, so a number is only
 *  ever written once. */
export const film = {
  /** the chip under the opening window */
  label: 'Selected work',
  eyebrow: 'Selected work',
  /** the opening line; `chip` is the word that turns into a chip */
  title: 'The work makes the case.',
  chip: 'case.',
  explore: { label: 'Explore all projects', href: 'https://umm.digital/case-studies/' },
  view: 'View the project',
  /** Three projects, about seven seconds each, then the last frame: the
   *  three as cards, each a link to its case study. Images live in
   *  /public/work/<id>/ (card, bg, board, logo). */
  projects: [
    {
      id: 'biocon',
      client: 'Biocon Group',
      type: 'Web experience',
      title: 'One brand. Clear routes for different audiences.',
      chip: 'Clear routes',
      body: 'Website journeys and content architecture for investors, healthcare professionals and academic audiences.',
      short: 'For investors, healthcare professionals and academics.',
      href: 'https://umm.digital/casestudies/biocon-group/',
      tone: 'sky' as Tone,
    },
    {
      id: 'qcare',
      client: 'QCare',
      type: 'Web & mobile',
      title: 'Everyday resident services, brought together.',
      chip: 'brought together.',
      body: 'A connected web and mobile platform for resident requests, bookings and accommodation operations.',
      short: 'Requests, bookings and operations, on web and mobile.',
      href: 'https://umm.digital/casestudies/qcare/',
      tone: 'sun' as Tone,
    },
    {
      id: 'mohawk',
      client: 'Mohawk Pricefx',
      type: 'Business application',
      title: 'Pricing tools built around real workflows.',
      chip: 'real workflows.',
      body: 'Interfaces that bring pricing search, product information and approval tasks into a focused workflow.',
      short: 'Pricing search, product data and approvals in one flow.',
      href: 'https://umm.digital/casestudies/mohawk-pricefx/',
      tone: 'coral' as Tone,
    },
  ],
  site: 'umm.digital',
}

/* ── 3 · Our work (the tabbed version, retired 2 Oct; projects still used) ── */

export type Project = {
  sector: string
  tab: string
  client: string
  sectorLine: string
  did: string
  numbers: { value: string; label: string }[]
  strip: { track: string; journey: string; get: string }
  /** folder under /public/work, or null when no screens exist yet */
  screens: string | null
  href: string
  shape: ShapeName
  tone: Tone
}

export const work = {
  chip: 'Proof, not promises',
  line1: "Don't take our word for it.",
  line2: 'See the work.',
  accent: 'See the work.',
  lead: 'Real projects, real numbers. Pick an industry to see what we did and what changed.',
  projects: [
    {
      sector: 'Retail & commerce',
      tab: 'Retail',
      client: 'Coco & Coir',
      sectorLine:
        'Online, app and store joined into one journey, so browsing, buying and returning feel like one relationship.',
      did: 'Shoppers found it hard to browse and finish buying. We rebuilt the store around the products, with a shorter, clearer checkout.',
      numbers: [
        { value: '22%', label: 'fewer people quitting at checkout' },
        { value: '55%', label: 'smoother shopping flow' },
        { value: '35%', label: 'more engagement on product pages' },
      ],
      strip: { track: 'Tasks completed', journey: 'Browse → buy → return', get: 'A service blueprint' },
      screens: 'cocoandcoir',
      href: 'https://umm.digital/casestudies/coco-coir/',
      shape: 'misc-5',
      tone: 'coral',
    },
    {
      sector: 'Financial services',
      tab: 'Finance',
      client: 'Fintuit',
      sectorLine:
        'Opening, checking and running an account made simple, without loosening a single safety check.',
      did: "Fintuit's products were hard to explain. We sorted them into clear paths for personal and business customers, and designed the platform around them.",
      numbers: [
        { value: '4X', label: 'easier to find the right product' },
        { value: '60%', label: 'clearer customer journeys' },
        { value: '2X', label: 'digital banking experiences unified' },
      ],
      strip: { track: 'Applications finished', journey: 'Apply → first payment', get: 'A tested prototype' },
      screens: 'fintuit',
      href: 'https://umm.digital/casestudies/fintuit/',
      shape: 'ellipse-12',
      tone: 'sky',
    },
    {
      sector: 'Healthcare',
      tab: 'Healthcare',
      client: 'HealthX Africa',
      sectorLine:
        'Booking, appointments and follow-ups that patients and doctors can both rely on, even on a busy day.',
      did: 'HealthX Africa needed one place to show its programmes and partners across Africa. We built a searchable platform that works well on any phone.',
      numbers: [
        { value: '30%', label: 'more people signing up for digital care' },
        { value: '40%', label: 'more services explored' },
        { value: '80%', label: 'better mobile accessibility' },
      ],
      strip: { track: 'Tasks completed', journey: 'Referral → follow-up', get: 'A journey map' },
      /* captured from the live site on 2 Oct 2026, not supplied */
      screens: 'healthx',
      href: 'https://umm.digital/casestudies/healthxafrica/',
      shape: 'rectangle-5',
      tone: 'citrus',
    },
    {
      sector: 'Manufacturing & B2B',
      tab: 'Manufacturing & B2B',
      client: 'Aladdin Commercial',
      sectorLine:
        'Quoting, ordering and after-sales turned into a self-serve path your sales team can stand behind.',
      did: 'Flooring pros needed too many clicks to find and compare products. We rebuilt how they search, filter and compare.',
      numbers: [
        { value: '92%', label: 'faster product search' },
        { value: '70%', label: 'more product comparisons' },
        { value: '55%', label: 'more spec sheets downloaded' },
      ],
      strip: { track: 'Orders right first time', journey: 'Quote → reorder', get: 'A service blueprint' },
      screens: 'aladdin',
      href: 'https://umm.digital/casestudies/aladdin-commercial/',
      shape: 'wheel-4',
      tone: 'sun',
    },
    {
      sector: 'Telecoms & media',
      tab: 'Telecoms',
      client: 'Habari',
      sectorLine:
        'Signing up, upgrading and getting help made simple, so customers stop calling to finish what they started online.',
      did: "Habari's old site was hard to update and slow to load. We rebuilt it so their team can change it themselves and pages load fast.",
      numbers: [
        { value: '85%', label: 'less time to update the site' },
        { value: '60%', label: 'better website performance scores' },
        { value: '45', label: 'days from start to live' },
      ],
      strip: { track: 'Calls to support', journey: 'Sign-up → upgrade', get: 'A plan of what to fix first' },
      screens: 'habari',
      href: 'https://umm.digital/casestudies/habari/',
      shape: 'wheel-1',
      tone: 'blossom',
    },
  ] satisfies Project[],
  footnote:
    "Every number here comes from the client's own results. Want examples closer to your business? We'll walk you through more work, privately, under NDA if needed.",
  cta: 'Ask to see relevant work',
  logosLead: 'Trusted by teams at',
  logos: ['Nokia', 'Deloitte', 'TD Bank', 'Larsen & Toubro', 'Mohawk', 'Lyca', 'Akamai', 'Biocon'],
}

/* ── 4 · What we do ───────────────────────────────────────────────────────── */

/** The scene each service card plays on its back; see scripts/build_service_marks.py. */
export type ServiceMark = 'research' | 'journey' | 'interface' | 'brand' | 'data' | 'testing'

export const services = {
  chip: 'What we can help you do',
  line1: 'From the first question',
  line2: 'to the final interface.',
  accent: 'final interface.',
  lead: 'Research, design and development support. A clear scope for the challenge you bring.',
  /** Under the list on every card's back. */
  scope: 'We agree the deliverables around your goals, team and technology.',
  includesLabel: 'What the work can include',
  hint: "See what's included",
  cta: { label: 'Discuss this service', href: '#contact' },
  items: [
    {
      step: 'Understand',
      title: 'CX strategy & customer research',
      body: 'Find out what your customers need, where they struggle and which improvements deserve attention first.',
      tags: ['Research', 'UX audits', 'Priorities'],
      more: 'Start with a shared understanding of the people you serve and the business problem you need to solve. We turn research and experience reviews into a practical direction for the design work.',
      includes: [
        'Stakeholder and customer interviews',
        'UX and customer experience assessment',
        'Audience needs and task priorities',
        'A prioritised roadmap for design improvements',
      ],
      mark: 'research' as ServiceMark,
      tone: 'sun' as Tone,
    },
    {
      step: 'Connect',
      title: 'Customer journeys & interaction design',
      body: 'Connect the steps between discovering your business, using your product and getting support. Make each handover and action clear.',
      tags: ['Journey maps', 'Flows', 'Prototypes'],
      more: 'See how the experience fits together across your website, app and service touchpoints. We map the current journey, define a clearer future flow and test the key interactions.',
      includes: [
        'Current and proposed customer journey maps',
        'User flows and content structure',
        'Service handovers and interaction patterns',
        'Wireframes and clickable prototypes',
      ],
      mark: 'journey' as ServiceMark,
      tone: 'blossom' as Tone,
    },
    {
      step: 'Create',
      title: 'Website & app UI/UX design',
      body: 'Turn a new idea or an existing product into intuitive screens, responsive layouts and a front end ready for real use.',
      tags: ['Websites', 'Mobile apps', 'Front end'],
      more: 'Create a website or app that gives your business the right digital presence and helps people complete the tasks that matter. We support new products and redesigns, from structure and screens to implementation.',
      includes: [
        'Website and mobile app UI/UX design',
        'Responsive layouts and interactive prototypes',
        'Reusable interface components and development specifications',
        'Website or front-end development within the agreed scope',
      ],
      mark: 'interface' as ServiceMark,
      tone: 'sky' as Tone,
    },
    {
      step: 'Define',
      title: 'Digital branding & design systems',
      body: 'Give your business a recognisable digital identity, with colours, typography and reusable components that work together across every screen.',
      tags: ['Visual identity', 'UI kits', 'Guidelines'],
      more: 'Translate your brand into a digital identity people can recognise and your team can apply consistently. We connect visual direction with the practical components used in your websites and apps.',
      includes: [
        'Digital visual direction and brand expression',
        'Colour, typography, iconography and imagery guidelines',
        'UI components, states and reusable patterns',
        'A documented design system for your team',
      ],
      mark: 'brand' as ServiceMark,
      tone: 'citrus' as Tone,
    },
    {
      step: 'Make it relevant',
      title: 'Customer insight & personalisation',
      body: 'Use customer feedback and behaviour to shape more relevant content, recommendations and journeys, with clear reasons for each decision.',
      tags: ['Segments', 'Content rules', 'Journeys'],
      more: 'Use the signals you have to make the experience more relevant. We identify useful audience differences and design content and interactions that respond to them.',
      includes: [
        'Customer feedback and behaviour review',
        'Audience segments and needs',
        'Personalisation opportunities and content rules',
        'Designs for relevant content, recommendations and next steps',
      ],
      mark: 'data' as ServiceMark,
      tone: 'lilac' as Tone,
    },
    {
      step: 'Keep improving',
      title: 'Testing & experience optimisation',
      body: 'Test with people, review how the experience performs and turn what you learn into improvements your team can keep delivering.',
      tags: ['Usability tests', 'Measurement', 'Updates'],
      more: 'Make improvement part of how the experience is run. We combine usability testing, feedback and agreed measures with a clear plan for updates and ownership.',
      includes: [
        'Usability testing and prioritised findings',
        'A measurement plan linked to business goals',
        'An organised backlog of design improvements',
        'Component updates, review cadence and ownership guidance',
      ],
      mark: 'testing' as ServiceMark,
      tone: 'coral' as Tone,
    },
  ],
  closing: {
    question: 'Wondering what this looks like in practice?',
    link: 'Take a closer look at our work',
    href: 'https://umm.digital/case-studies/',
  },
}

/* ── 5 · Built for where you are ──────────────────────────────────────────── */

export const stages = {
  chip: 'Where your business is now',
  line1: 'Different stages.',
  line2: 'Different design priorities.',
  accent: 'design priorities.',
  lead: 'Start with the challenge that matters to your business today.',
  items: [
    {
      tab: 'Startups',
      flow: ['Idea', 'Prototype', 'Product'],
      title: 'Give your idea something people can try.',
      body: 'You have the idea. We help you define the essential features, map the user flow and create a clickable MVP prototype. Then we develop the visual design and front end for your first release.',
      services: ['MVP prototyping', 'Website & app UI/UX', 'Front-end development'],
      cta: { label: 'Discuss your product idea', href: 'https://umm.digital/contact/' },
      tone: 'sun' as Tone,
    },
    {
      tab: 'Scale-ups',
      flow: ['Reassess', 'Redesign', 'Relaunch'],
      title: 'Your business has moved on. Has your website?',
      body: 'If your digital experience still reflects an earlier version of your business, it is time for a rethink. We redesign website structure, content flow and mobile UI/UX around today\u2019s offer, audience and goals.',
      services: ['Website revamps', 'Mobile UX improvements', 'Brand consistency'],
      cta: { label: 'Discuss your redesign', href: 'https://umm.digital/contact/' },
      tone: 'blossom' as Tone,
    },
    {
      tab: 'Enterprises',
      flow: ['Map', 'Connect', 'Standardise'],
      title: 'Make every touchpoint feel like the same business.',
      body: 'Connect websites, apps and service touchpoints that have evolved in different directions. We map broken handovers, simplify complex tasks and establish shared design patterns across your teams and products.',
      services: ['Connected customer journeys', 'Enterprise UI/UX', 'Shared design systems'],
      cta: { label: 'Discuss your customer experience', href: 'https://umm.digital/contact/' },
      tone: 'sky' as Tone,
    },
  ],
}

/* ── 6 · How we design ────────────────────────────────────────────────────── */

export const principles = {
  chip: 'The thinking behind the interface',
  line1: 'Every design choice',
  line2: 'should earn its place.',
  accent: 'its place.',
  lead: 'Colour, hierarchy and interaction shape how people understand and use a product. Here is how we put those fundamentals to work.',
  /** under the lead: how to drive the demo, pinned (scroll) or not (tap) */
  hint: { scroll: 'Scroll to watch each one fix a checkout.', tap: 'Tap one to apply it to the checkout.' },
  /** the pill over the phone: before any rule, and once all five are in */
  demo: { label: 'Design in practice / Illustrative example', done: 'One clear accent. One obvious next step.' },
  items: [
    {
      id: 'colour',
      /** what it changes on the demo checkout, as its callout says */
      fix: 'Contrast 1.4 : 1 → 19 : 1',
      title: 'Colour that guides.',
      body: 'Use contrast and colour deliberately to direct attention, show status and express the brand.',
      tone: 'blossom' as Tone,
    },
    {
      id: 'thumbs',
      fix: 'Clear order: total, then Pay',
      title: 'Hierarchy that makes sense.',
      body: 'Give information a clear order so people know what matters and what they can do next.',
      tone: 'sky' as Tone,
    },
    {
      id: 'steps',
      fix: '10 steps → 3',
      title: 'Less to work through.',
      body: 'Use minimalism to remove unnecessary choices and steps while keeping the information people need.',
      tone: 'citrus' as Tone,
    },
    {
      id: 'same',
      fix: '4 button styles → 1',
      title: 'Consistency people can learn.',
      body: 'Reuse familiar components and behaviours across screens, so each new task feels easier to understand.',
      tone: 'sun' as Tone,
    },
    {
      id: 'tested',
      fix: 'Refined after testing with users',
      title: 'Usability checked with people.',
      body: 'Test prototypes with representative users, observe where they hesitate and refine the design before release.',
      tone: 'coral' as Tone,
    },
  ],
}

/* Santosh-approved; keep word for word. */
export const tools = {
  chip: 'Designed to fit your technology',
  line1: 'Built to work within the systems',
  line2: 'you already have.',
  accent: 'already have.',
  lead: 'Technology should connect the enterprise around the journey, not create another silo. We keep what works, modernise what does not, and connect everything that matters across the experience stack.',
  /** under the wheel: moves it on to the next group */
  explore: 'Explore the platforms',
  groups: [
    {
      label: 'Experience and Content Platforms',
      tone: 'sun' as Tone,
      items: ['Adobe Experience Manager', 'Sitecore', 'Contentful', 'Optimizely', 'WordPress VIP'],
    },
    {
      label: 'Commerce and Portals',
      tone: 'sky' as Tone,
      items: ['Salesforce Commerce', 'Adobe Commerce', 'SAP Commerce', 'Shopify Plus'],
    },
    {
      label: 'Customer Data Platforms',
      tone: 'blossom' as Tone,
      items: ['Segment', 'Tealium', 'Salesforce Data Cloud', 'Adobe Real-Time CDP'],
    },
    {
      label: 'CRM and Service',
      tone: 'citrus' as Tone,
      items: ['Salesforce', 'Microsoft Dynamics 365', 'ServiceNow', 'Zendesk'],
    },
    {
      label: 'Journey Orchestration and Automation',
      tone: 'coral' as Tone,
      items: ['Adobe Journey Optimizer', 'Salesforce Marketing Cloud', 'Braze', 'Twilio'],
    },
    {
      label: 'Analytics and Voice of Customer',
      tone: 'lilac' as Tone,
      items: ['Qualtrics', 'Medallia', 'Adobe Analytics', 'Google Analytics 4', 'Hotjar'],
    },
    {
      label: 'Personalisation and AI',
      tone: 'sun' as Tone,
      items: ['Einstein', 'Adobe Sensei', 'Dynamic Yield', 'Amplitude'],
    },
    {
      label: 'Design and Research',
      tone: 'sky' as Tone,
      items: ['Figma', 'Miro', 'Maze', 'UserTesting'],
    },
  ],
  note: 'These groupings reflect how we work. They do not imply a partnership, reseller status or certification unless stated separately.',
}

/* ── 7 · How we work + let's talk ─────────────────────────────────────────── */

export const process = {
  chip: 'How the work takes shape',
  line1: 'A clear path.',
  line2: 'A considered result.',
  accent: 'considered result.',
  lead: 'Four stages, with clear decisions and deliverables along the way.',
  /** the axis mark where Design or redesign ends */
  ready: 'Ready to build',
  steps: [
    {
      title: 'Assessment',
      body: 'Understand your business goals, users and current experience. Agree the problem, priorities and measures of success.',
      get: 'A focused design brief',
    },
    {
      title: 'Ideation',
      body: 'Explore possible approaches through flows, wireframes and early prototypes. Choose a direction before committing to detailed design.',
      get: 'An agreed concept',
    },
    {
      title: 'Design or redesign',
      body: 'Create the interface, content structure and reusable components. Prepare the design for development, or build the agreed front end.',
      get: 'Designs ready to build',
    },
    {
      title: 'Optimisation',
      body: 'Use testing, feedback and performance data to refine the experience. Give your team a practical plan for what to improve next.',
      get: 'An informed improvement plan',
    },
  ],
}

export const faq = [
  {
    question: 'Can you help if we only have an idea?',
    answer:
      'Yes. We can help you define the core features, map the user flow and create a clickable MVP prototype. It gives you something tangible to test before investing in a full build.',
  },
  {
    question: 'Can you redesign our current website or app?',
    answer:
      'Yes. We assess the current experience, identify what is worth keeping and redesign the structure, interface and content flow around your current business needs.',
  },
  {
    question: 'Do you also handle development?',
    answer:
      'We offer website and front-end development alongside design. We agree the build, integration and launch responsibilities at the start, including where your existing team or technology partners will be involved.',
  },
  {
    question: 'Can you work with our existing team and systems?',
    answer:
      'Yes. We can collaborate with your product, marketing, design and engineering teams, work within your technology environment and create shared components your team can continue using.',
  },
  {
    question: 'How do we decide the scope and timeline?',
    answer:
      'We start with your goals, existing materials and technical requirements. Together we define the deliverables, responsibilities, review points, timeline and fees before the work begins.',
  },
]

export const closing = {
  eyebrow: 'Your next design challenge',
  lines: ['An idea to launch.', 'An experience to rethink.'],
  /** the last line, set in the chip, as the hero's is */
  accent: 'Let\u2019s work on it.',
  lead: 'Tell us what you are building, what needs to change and where you want the business to go. We will help define the right starting point.',
  primaryCta: { label: 'Start a project conversation', href: 'https://umm.digital/contact/' },
  secondaryCta: { label: 'ping@umm.digital', href: 'mailto:ping@umm.digital' },
  faqLabel: 'A few things you may want to know',
}
