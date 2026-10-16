import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import type { ServiceMark } from '@/content/cxUiDesign'

/* ============================================================================
   UX & DIGITAL COMMERCE — PAGE CONTENT

   Word for word from Krish's UX and Digital Commerce content doc, 16 Oct 2026:
   https://docs.google.com/document/d/1saZ2F3XKNk0U-uGTAsAdZ79SCHyX0wDbpsOq2L8Kr5k
   Visual reference: https://umm-ux-digital-commerce.ai-umm.chatgpt.site

   The sixth service page on the CX page's locked design: every export that
   feeds a shared section has the same keys and value types as the matching
   one in cloudData.ts. Labels the doc does not have (the stickers, the end
   cards' short lines, the roadmap's axis mark) are marked where they sit.
   ========================================================================== */

export const meta = {
  service: 'UX & Digital Commerce',
  title: 'UX & Digital Commerce | UMM',
  locations: 'Dallas · London · Dubai · Nairobi · Shenzhen',
  contactEmail: 'ping@umm.digital',
}

export const nav = [
  { id: 'work', label: 'Our work' },
  { id: 'services', label: 'Services' },
  { id: 'stages', label: 'Your stage' },
  { id: 'commerce', label: 'Commerce thinking' },
  { id: 'process', label: 'Our process' },
]

/* ── 1 · Hero and capability strip ───────────────────────────────────────── */

export const hero = {
  eyebrow: 'UX & Digital Commerce',
  lines: ['Intelligent commerce.'],
  accent: 'Connected end to end.',
  tail: '',
  lead: 'From ambitious brands to complex B2B enterprises, we connect experience design, AI-powered discovery, commerce platforms, and business systems. Build a buying experience that works as intelligently as the business behind it.',
  primaryCta: 'Let’s talk commerce',
  secondaryCta: 'Explore the commerce architecture',
  secondaryHref: '#commerce',
}

/** From first look to next order: the capabilities, on the ribbon */
export const ribbon = ['Experience design', 'Commerce platforms', 'Conversion & UX', 'Connected operations']

/* ── 2 · Why the experience matters ──────────────────────────────────────── */

export const why = {
  chip: 'Why the experience matters',
  line1: 'Interest gets them here.',
  line2: 'Clarity helps them stay.',
  /** the word in the headline the stickers merge into */
  one: 'stay.',
  /** Ten parts of a buying journey, as stickers that fly together into
   *  "stay." (labels of ours; the doc has none). x/y place each on the
   *  stage (%), r is its tilt. */
  teams: [
    { name: 'Search', x: 12, y: 18, r: -8, tone: 'coral' as Tone },
    { name: 'Filters', x: 35, y: 10, r: 6, tone: 'sky' as Tone },
    { name: 'Product pages', x: 62, y: 20, r: -5, tone: 'citrus' as Tone },
    { name: 'Reviews', x: 87, y: 13, r: 11, tone: 'sun' as Tone },
    { name: 'Cart', x: 21, y: 48, r: 7, tone: 'blossom' as Tone },
    { name: 'Checkout', x: 79, y: 47, r: -9, tone: 'coral' as Tone },
    { name: 'Payments', x: 50, y: 56, r: 4, tone: 'sky' as Tone },
    { name: 'Delivery', x: 9, y: 80, r: -6, tone: 'citrus' as Tone },
    { name: 'Returns', x: 60, y: 84, r: 8, tone: 'sun' as Tone },
    { name: 'Inventory', x: 88, y: 78, r: -10, tone: 'blossom' as Tone },
  ],
  lead: 'A good commerce experience answers the questions between interest and action. Whether someone is buying, subscribing, booking or placing a business order, design, technology and operations need to work together.',
  /** numbered 01–03 on the page */
  pairs: [
    {
      title: 'Help people find their fit.',
      body: 'Shape navigation, search and product information around how customers compare, evaluate and choose.',
      shape: 'flower-14' as ShapeName,
      tone: 'coral' as Tone,
    },
    {
      title: 'Make the next step feel clear.',
      body: 'Bring pricing, availability, delivery and returns into the decision, with accessible interactions across devices.',
      shape: 'polygon-3' as ShapeName,
      tone: 'sky' as Tone,
    },
    {
      title: 'Keep the promise after checkout.',
      body: 'Connect the storefront with inventory, orders and fulfillment so the experience supports the people running it, too.',
      shape: 'moon-10' as ShapeName,
      tone: 'citrus' as Tone,
    },
  ],
}

/* ── 3 · Selected work (the film) ─────────────────────────────────────────── */

export const film = {
  label: 'Selected work',
  eyebrow: 'Selected work',
  title: 'Built around the product. Designed for the person.',
  chip: 'Designed for the person.',
  explore: { label: 'Explore all projects', href: 'https://umm.digital/case-studies/' },
  view: 'View the project',
  /** Three projects, about seven seconds each, then the last frame: the
   *  three as cards, each a link to its case study. Images live in
   *  /public/work/<id>/. `short` is ours, for the end cards. */
  projects: [
    {
      id: 'tfp',
      client: 'Twins for Peace',
      type: 'Fashion & commerce',
      title: 'Purpose meets purchase.',
      chip: 'meets purchase.',
      body: 'A Shopify storefront connecting footwear and apparel collections with structured product browsing, responsive design and checkout.',
      short: 'A Shopify storefront for footwear and apparel.',
      href: 'https://umm.digital/casestudies/twins-for-peace/',
      tone: 'coral' as Tone,
    },
    {
      id: 'enda',
      client: 'Enda Sportswear',
      type: 'International commerce',
      title: 'Kenyan roots. Global reach.',
      chip: 'Global reach.',
      body: 'Brand storytelling and ecommerce development brought Enda’s performance footwear to international audiences through regional shopping journeys.',
      short: 'Performance footwear, shopped across regions.',
      href: 'https://umm.digital/casestudies/enda-sportswear/',
      tone: 'sky' as Tone,
    },
    {
      id: 'cocoandcoir',
      client: 'Coco & Coir',
      type: 'Home & lifestyle',
      title: 'Thoughtful products. Thoughtful shopping.',
      chip: 'Thoughtful shopping.',
      body: 'A Shopify experience bringing sustainable home products into a clear catalog, with streamlined checkout and tools for managing inventory and promotions.',
      short: 'Sustainable home products in a clear catalog.',
      href: 'https://umm.digital/casestudies/coco-coir/',
      tone: 'citrus' as Tone,
    },
  ],
  site: 'umm.digital',
}

/* ── 4 · UX and digital commerce services ─────────────────────────────────── */

const SCOPE = 'We agree the scope, responsibilities and success measures around your commerce priorities.'

export const services = {
  chip: 'What we help you create',
  line1: 'A better buying journey.',
  line2: 'Every part connected.',
  accent: 'Every part connected.',
  lead: 'From the first interaction to the systems behind the order.',
  /** Under the list on every card's back. */
  scope: SCOPE,
  includesLabel: 'What the work can include',
  hint: "See what's included",
  cta: { label: 'Discuss this service', href: '#contact' },
  items: [
    {
      step: 'Design',
      title: 'Interface design & design systems',
      body: 'Create a consistent experience across product pages, campaigns and checkout. Build reusable patterns around your brand and the people who use it.',
      tags: ['Components', 'Interaction', 'Accessibility'],
      more: '',
      includes: [
        'Interface and interaction design',
        'Reusable UI components and documentation',
        'Responsive product and collection templates',
        'Accessibility review and implementation guidance',
      ],
      mark: 'interface' as ServiceMark,
      tone: 'coral' as Tone,
    },
    {
      step: 'Refine',
      title: 'Conversion & behavioral UX',
      body: 'Understand where customers hesitate and why. Turn research and behavioral evidence into clearer journeys and focused experiments.',
      tags: ['Research', 'Journeys', 'Experiments'],
      more: '',
      includes: [
        'Journey and funnel assessment',
        'Product discovery and checkout UX',
        'Usability testing and research',
        'Prioritised experimentation roadmap',
      ],
      mark: 'research' as ServiceMark,
      tone: 'sky' as Tone,
    },
    {
      step: 'Build',
      title: 'Commerce platforms & storefront engineering',
      body: 'Build the storefront and the systems behind it. Select a platform and architecture that fit your catalog, markets and operating needs.',
      tags: ['Storefronts', 'Checkout', 'Integration'],
      more: '',
      includes: [
        'Commerce platform selection and architecture',
        'Storefront design and development',
        'Checkout and payment integration',
        'Replatforming and migration planning',
      ],
      mark: 'journey' as ServiceMark,
      tone: 'blossom' as Tone,
    },
    {
      step: 'Understand',
      title: 'Personalization & commerce analytics',
      body: 'Make the experience more relevant with clear measurement, useful segments and considered merchandising rules. Start with the data you can trust.',
      tags: ['Measurement', 'Relevance', 'Merchandising'],
      more: '',
      includes: [
        'Commerce event and measurement planning',
        'Customer segmentation and merchandising rules',
        'Product recommendation journeys',
        'Analytics dashboards and experiment evaluation',
      ],
      mark: 'data' as ServiceMark,
      tone: 'sun' as Tone,
    },
    {
      step: 'Connect',
      title: 'Commerce automation & operations',
      body: 'Bring order, stock and product information into the same flow. Reduce repetitive work while keeping ownership and exceptions visible.',
      tags: ['Orders', 'Inventory', 'Fulfilment'],
      more: '',
      includes: [
        'Order and inventory workflow design',
        'Product catalog and feed integration',
        'CRM, ERP and fulfillment connections',
        'Exception handling and operational reporting',
      ],
      mark: 'brand' as ServiceMark,
      tone: 'lilac' as Tone,
    },
    {
      step: 'Improve',
      title: 'Performance & continuous optimization',
      body: 'Keep the experience responsive as products, traffic and content change. Work through a prioritized backlog of UX, speed and quality improvements.',
      tags: ['Speed', 'Quality', 'Iteration'],
      more: '',
      includes: [
        'Storefront performance assessment',
        'Core Web Vitals improvement work',
        'Cross-device and journey quality checks',
        'Ongoing UX and commerce optimization',
      ],
      mark: 'testing' as ServiceMark,
      tone: 'citrus' as Tone,
    },
  ],
}

/* ── 4b · AI where it improves the experience ────────────────────────────── */

export const aiMoments = {
  eyebrow: 'AI where it improves the experience',
  line1: 'Small moments.',
  line2: 'Smarter commerce.',
  items: [
    {
      step: 'Discovery',
      title: 'Search that understands intent.',
      body: 'Help customers find relevant products through natural-language and semantic search, grounded in your actual catalog.',
      tone: 'blossom' as Tone,
    },
    {
      step: 'Catalog operations',
      title: 'Bring product data into shape.',
      body: 'Assist bulk onboarding, attribute extraction, categorization, and catalog enrichment—with validation before publishing.',
      tone: 'lilac' as Tone,
    },
    {
      step: 'Content & relevance',
      title: 'Useful content. Better context.',
      body: 'Support product descriptions, metadata, recommendations, and customer segmentation with brand direction and editorial review.',
      tone: 'citrus' as Tone,
    },
  ],
}

/* ── 4c · Built around your business ─────────────────────────────────────── */

export const industries = {
  eyebrow: 'Built around your business',
  items: [
    {
      title: 'Brands & retail',
      body: 'Product discovery, omnichannel experiences, and customer relationships.',
      tone: 'coral' as Tone,
    },
    {
      title: 'Manufacturing & distribution',
      body: 'Account pricing, bulk orders, approvals, and ERP integration.',
      tone: 'sky' as Tone,
    },
    {
      title: 'Subscription businesses',
      body: 'Plan selection, recurring billing, entitlements, and self-service.',
      tone: 'blossom' as Tone,
    },
    {
      title: 'Services & experiences',
      body: 'Availability, scheduling, booking, and customer communication.',
      tone: 'sun' as Tone,
    },
  ],
}

/* ── 5 · Business stages ──────────────────────────────────────────────────── */

export const stages = {
  chip: 'Where your business is now',
  line1: 'Built for your business.',
  line2: 'Ready for its next chapter.',
  accent: 'its next chapter.',
  lead: 'Startups. Scale-ups. Enterprises. The priorities change. The care stays.',
  items: [
    {
      tab: 'Startups',
      flow: ['Shape', 'Test', 'Launch'],
      title: 'Your first storefront. A clear reason to buy.',
      body: 'Translate your offer into a focused shopping experience. Prioritise the product story, essential commerce features and a foundation your team can manage.',
      services: ['Product and journey definition', 'A focused, usable storefront', 'Measurement from launch'],
      cta: { label: 'Discuss your launch', href: 'https://umm.digital/contact/' },
      tone: 'coral' as Tone,
    },
    {
      tab: 'Scale-ups',
      flow: ['Learn', 'Connect', 'Expand'],
      title: 'Keep the experience strong. As the business grows.',
      body: 'Improve the journeys that matter while connecting the tools behind them. Support a wider catalog, new markets and more demanding day-to-day operations.',
      services: ['Funnel and checkout improvements', 'Catalogue and system integration', 'Regional shopping journeys'],
      cta: { label: 'Discuss your next stage', href: 'https://umm.digital/contact/' },
      tone: 'sky' as Tone,
    },
    {
      tab: 'Enterprises',
      flow: ['Align', 'Modernise', 'Evolve'],
      title: 'Many brands and markets. One considered approach.',
      body: 'Bring shared design patterns, platform decisions and governance to a complex commerce estate. Modernise in stages with clear operational ownership.',
      services: ['Multi-brand experience systems', 'Commerce architecture and integration', 'Phased migration and experimentation'],
      cta: { label: 'Discuss your transformation', href: 'https://umm.digital/contact/' },
      tone: 'blossom' as Tone,
    },
  ],
}

/* ── 6 · The thinking behind the interface ───────────────────────────────── */

export type CommerceModel = {
  id: 'retail' | 'b2b' | 'subscriptions' | 'bookings'
  label: string
  eyebrow: string
  title: string
  body: string
  ai: string
  /** "What connects behind it", one step per arrow in the doc */
  connects: string[]
}

export const commerce: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  board: {
    label: string
    experience: { label: string; items: string[]; link: string }
    ai: { label: string; title: string; items: string[]; link: string }
    services: { label: string; note: string; items: { title: string; body: string }[]; link: string }
    operations: { label: string; items: string[]; loop: string }
    across: { label: string; items: string[] }
  }
  modelsEyebrow: string
  modelsTitle: string
  aiLabel: string
  connectsLabel: string
  models: CommerceModel[]
  principles: { step: string; title: string; body: string }[]
} = {
  chip: 'The thinking behind the interface',
  line1: 'A better experience.',
  line2: 'An intelligent system behind it.',
  accent: 'An intelligent system behind it.',
  lead: 'From the first search to the next order. Every layer connected.',
  board: {
    label: 'Connected commerce architecture',
    experience: {
      label: '01 Experience',
      items: ['Web storefront', 'Mobile experience', 'B2B portal', 'Marketplaces'],
      link: 'Customer intent, product discovery, and account context connect the experience to the intelligence layer.',
    },
    ai: {
      label: '02 AI and personalization',
      title: 'Make discovery more relevant.',
      items: ['Semantic search', 'Recommendations', 'Catalog enrichment', 'Customer segments'],
      link: 'APIs connect the experience to commerce services.',
    },
    services: {
      label: '03 Commerce services',
      note: 'Platform-native or composable, chosen for your needs.',
      items: [
        { title: 'Products and pricing', body: 'Catalogs · offers · availability' },
        { title: 'Accounts and access', body: 'Customers · roles · entitlements' },
        { title: 'Transactions', body: 'Cart · checkout · payments' },
        { title: 'Orders and lifecycle', body: 'Orders · renewals · bookings' },
      ],
      link: 'Orders, inventory, and customer data stay connected.',
    },
    operations: {
      label: '04 Business operations',
      items: ['ERP', 'Warehouse and fulfillment', 'Product information', 'CRM', 'Analytics'],
      loop: 'Journey and transaction signals inform personalization and improvement.',
    },
    across: {
      label: 'Across the architecture',
      items: ['Consent and permissions', 'Content review', 'Data quality', 'Operational ownership'],
    },
  },
  modelsEyebrow: 'One architecture. Different business needs.',
  modelsTitle: 'Explore the model behind your experience.',
  aiLabel: 'Where AI adds value',
  connectsLabel: 'What connects behind it',
  models: [
    {
      id: 'retail',
      label: 'Retail and DTC',
      eyebrow: 'Retail & direct to consumer',
      title: 'Turn intent into a relevant discovery.',
      body: 'Help shoppers move from a need to the right product, with clear information and a connected path to purchase.',
      ai: 'Semantic search interprets customer intent. Recommendations use relevant catalog and customer context, while reviewed content explains the product clearly.',
      connects: ['Product information', 'availability and pricing', 'checkout', 'warehouse and fulfillment'],
    },
    {
      id: 'b2b',
      label: 'B2B commerce',
      eyebrow: 'B2B & enterprise commerce',
      title: 'Make complex purchasing feel straightforward.',
      body: 'Support the way business buyers work: account access, negotiated pricing, repeat orders, and approval responsibilities.',
      ai: 'Assist product matching, attribute enrichment, and relevant suggestions across large or technical catalogs. Account rules determine what each buyer can see and order.',
      connects: ['Customer accounts', 'contract pricing', 'order approvals', 'ERP and inventory'],
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      eyebrow: 'Subscriptions & memberships',
      title: 'Build an ongoing relationship around clear value.',
      body: 'Make plans, renewal terms, and account controls easy to understand throughout the customer lifecycle.',
      ai: 'Use customer segments and engagement signals to inform relevant content and recommendations. Keep billing, renewal, and entitlement decisions governed by explicit rules.',
      connects: ['Plans and entitlements', 'recurring billing', 'account self-service', 'CRM and analytics'],
    },
    {
      id: 'bookings',
      label: 'Services and bookings',
      eyebrow: 'Services & bookings',
      title: 'Connect the right service to the right moment.',
      body: 'Help customers compare options, understand availability, and complete a booking with confidence.',
      ai: 'Assist natural-language discovery and relevant service suggestions. Availability, pricing, and booking confirmation come from the connected operational systems.',
      connects: ['Service catalog', 'scheduling and availability', 'payment', 'confirmations and CRM'],
    },
  ],
  principles: [
    {
      step: 'Start with intent',
      title: 'Design for the decision.',
      body: 'A retail purchase, a business order and a recurring subscription involve different questions. Shape the journey around the people making them.',
    },
    {
      step: 'Connect the journey',
      title: 'Make every step agree.',
      body: 'Bring content, pricing, availability and customer context together so the interface reflects what the business can deliver.',
    },
    {
      step: 'Keep learning',
      title: 'Measure what matters.',
      body: 'Agree success measures around the business model, then use research and experiments to improve the experience over time.',
    },
  ],
}

/* ── 6b · Your next commerce platform ─────────────────────────────────────── */

export const platforms = {
  eyebrow: 'Your next commerce platform',
  line1: 'Planning a launch?',
  line2: 'Ready to replatform?',
  lead: 'Choose the platform around your catalog, buying model, integrations, and operating team.',
  items: [
    {
      id: 'shopify',
      title: 'Shopify & Shopify Plus',
      body: 'Storefronts, platform extensions, and connected commerce operations.',
      cta: 'Discuss your Shopify build',
      tone: 'citrus' as Tone,
    },
    {
      id: 'adobe',
      title: 'Adobe Commerce / Magento',
      body: 'Complex catalogs, B2B purchasing, and enterprise integrations.',
      cta: 'Explore enterprise commerce',
      tone: 'coral' as Tone,
    },
    {
      id: 'amazon',
      title: 'Amazon storefronts',
      body: 'Brand storefront experiences, product content, and marketplace presence.',
      cta: 'Plan your marketplace experience',
      tone: 'sun' as Tone,
    },
  ],
  note: 'We also assess BigCommerce, WooCommerce, and custom headless experiences where they fit the requirement.',
}

/* ── 7 · How the work takes shape ─────────────────────────────────────────── */

export const process = {
  chip: 'How the work takes shape',
  line1: 'From customer insight.',
  line2: 'To a working storefront.',
  accent: 'a working storefront.',
  lead: 'Clear decisions at each step. Learning that continues after launch.',
  /** the axis mark where the store is ready to launch (ours) */
  ready: 'Ready to launch',
  steps: [
    {
      title: 'Understand',
      body: 'Review the customer journey, catalog, business model and existing systems.',
      get: 'A shared picture of the opportunity',
    },
    {
      title: 'Design',
      body: 'Prototype the key decisions and test the experience with users.',
      get: 'A journey ready to build',
    },
    {
      title: 'Build',
      body: 'Develop the storefront, content and integrations in agreed stages.',
      get: 'A connected commerce experience',
    },
    {
      title: 'Validate',
      body: 'Check payments, orders, accessibility and behavior across devices.',
      get: 'Evidence for launch readiness',
    },
    {
      title: 'Improve',
      body: 'Review customer behavior and work through a focused experiment backlog.',
      get: 'A rhythm for ongoing learning',
    },
  ],
}

export const engagement: {
  title: string
  href: string
  items: { title: string; body: string; tone: Tone }[]
} = {
  title: 'Start where the experience needs attention.',
  href: 'https://umm.digital/contact/',
  items: [
    {
      title: 'Experience & commerce assessment',
      body: 'Identify friction and agree the priorities for your next move.',
      tone: 'coral' as Tone,
    },
    {
      title: 'Storefront design & build',
      body: 'Bring a new store or a defined redesign from concept to launch.',
      tone: 'sky' as Tone,
    },
    {
      title: 'Replatforming & modernization',
      body: 'Plan and deliver a platform move around your operating needs.',
      tone: 'blossom' as Tone,
    },
    {
      title: 'Ongoing optimization partnership',
      body: 'Continue UX, performance and experimentation work with your team.',
      tone: 'citrus' as Tone,
    },
  ],
}

/* ── 8 · Contact and common questions ─────────────────────────────────────── */

export const faq = [
  {
    question: 'Where should we begin?',
    answer:
      'Start with the journey you want to improve. We review your storefront, customer behavior and operational context, then agree a focused scope and priorities.',
  },
  {
    question: 'Can you work with our existing commerce platform?',
    answer:
      'Yes. We assess your current platform, content and integrations before recommending improvements, a rebuild or a move. Platform capabilities and constraints shape the approach.',
  },
  {
    question: 'Do we need a headless commerce setup?',
    answer:
      'That depends on the experience, integrations and operating model you need. We compare the flexibility of a headless approach with its delivery and maintenance requirements before recommending an architecture.',
  },
  {
    question: 'How do you measure the impact of UX changes?',
    answer:
      'We agree the measures and establish a baseline before making changes. These may include journey completion, conversion, order value, performance and support demand. Where feasible, controlled experiments help distinguish a design effect from other changes.',
  },
  {
    question: 'Will a redesign interrupt orders or operations?',
    answer:
      'We plan releases around dependencies, testing and operational requirements. Any migration or cutover includes agreed validation, recovery procedures and communication about required maintenance windows.',
  },
  {
    question: 'What happens after launch?',
    answer:
      'We agree ownership and support before release. Ongoing work can include performance monitoring, UX improvements, experiments and integration maintenance, based on your priorities.',
  },
  {
    question: 'How does AI fit into the commerce experience?',
    answer:
      'We apply AI to defined needs such as semantic search, catalog enrichment, product content, and personalization. The implementation depends on your platform and data. Product accuracy, brand review, consent, and operational ownership remain part of the workflow.',
  },
]

export const closing = {
  eyebrow: 'Your next commerce chapter',
  lines: ['Make the journey worth choosing.'],
  /** the last line, set in the chip, as the hero's is */
  accent: 'Let’s build it.',
  lead: 'Tell us what you sell, who you sell to and where the experience could work harder. We’ll help shape the next practical step.',
  primaryCta: { label: 'Let’s talk commerce', href: 'https://umm.digital/contact/' },
  faqLabel: 'A few things you may want to know',
}
