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
  /* three fixed lines; the third opens on the accent word, which carries the
     chip treatment */
  lines: ['Websites and apps', 'your customers actually'],
  accent: 'enjoy',
  tail: 'using.',
  lead: "UMM designs websites, apps and the customer journeys behind them, so buying, booking or getting help just works. Whether you're a startup with an idea or an enterprise with a hundred moving parts.",
  primaryCta: "Let's talk",
  secondaryCta: 'See our work',
}

export const ribbon = [
  'Customer research',
  'Customer journeys',
  'UI design',
  'UX strategy',
  'Digital branding',
  'Service design',
  'Usability testing',
  'Personalisation',
  'Customer feedback',
  'Ongoing improvement',
]

/* ── 2 · Why it matters ───────────────────────────────────────────────────── */

export const why = {
  chip: 'Why it matters',
  line1: 'Your customers see one company,',
  line2: 'not the ten teams behind it.',
  accent: 'ten teams',
  /** the words in line1 the ten teams merge into */
  one: 'one company',
  /** The ten teams, as stickers that fly together into "one company".
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
  lead: "AI and the apps on their phones have taught people to expect answers in seconds. When your website, app and support don't line up, customers don't complain. They just leave.",
  pairs: [
    {
      pain: 'They get stuck.',
      fix: 'We find out where.',
      body: 'We talk to your customers and watch them use your website and app. So we know exactly where they struggle, and which fixes matter most.',
      shape: 'rectangle-8' as ShapeName,
      tone: 'citrus' as Tone,
    },
    {
      pain: 'They get passed around.',
      fix: 'We join it into one path.',
      body: 'Website, app, store, support. We redesign the whole journey, and the work behind it, so it feels like one smooth trip, not five separate ones.',
      shape: 'moon-12' as ShapeName,
      tone: 'blossom' as Tone,
    },
    {
      pain: 'They give up halfway.',
      fix: 'We keep it getting better.',
      body: 'We test with real people, launch, and keep improving against goals we agree on day one, like more people finishing sign-up.',
      shape: 'moon-14' as ShapeName,
      tone: 'sky' as Tone,
    },
  ],
}

/* ── 3 · Our work, as a 30-second film ───────────────────────────────────── */

/** The film that replaced the "Proof, not promises" tabs (2 Oct). Its
 *  projects and numbers come from work.projects below, so a number is only
 *  ever written once. */
export const film = {
  label: 'Our work in 30 seconds',
  hook: { line1: "You've got", chip: '0.05 seconds', after: '.' },
  judge: "That's how fast people judge a website.",
  /** Lindgaard et al. (2006), "Attention web designers: you have 50
   *  milliseconds to make a good first impression!" */
  source: 'Lindgaard et al., 2006',
  board: 'Coco & Coir — Home',
  blank: 'Blank frame.',
  real: 'Real product.',
  /** which project, and which of its numbers, each hit shows */
  hits: [
    { screens: 'cocoandcoir', stat: 0 },
    { screens: 'fintuit', stat: 0 },
    { screens: 'healthx', stat: 0 },
    { screens: 'aladdin', stat: 0 },
    { screens: 'habari', stat: 2 },
  ],
  wall: ['Real work.', 'Real numbers.'],
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

export const services = {
  chip: '6 ways we help',
  line1: 'What we',
  line2: 'actually do.',
  accent: 'actually',
  lead: 'Six services. Each one tells you when you need it, what we do, and what you walk away with.',
  items: [
    {
      title: 'CX strategy & research',
      when: "You know something's off, but not what to fix first.",
      what: "Talk to your customers, look at every step they take today, and rank what to fix by value and effort.",
      get: 'A ranked plan of what to fix first, and a research report.',
      seeIt: { label: 'Fintuit', href: 'https://umm.digital/casestudies/fintuit/' },
      shape: 'star-1' as ShapeName,
      tone: 'sun' as Tone,
    },
    {
      title: 'Customer journey design',
      when: 'Customers bounce between your website, app and support, and get a different answer each time.',
      what: 'Map the whole journey from first click to final step, find where it breaks, and redesign the path.',
      get: 'A journey map, and a service blueprint: the plan for what happens behind each screen.',
      seeIt: { label: 'QCare', href: 'https://umm.digital/casestudies/qcare/' },
      shape: 'misc-11' as ShapeName,
      tone: 'sky' as Tone,
    },
    {
      title: 'Website & app design (UI/UX)',
      when: 'Your website or app is confusing, slow to use, or looks dated.',
      what: 'Design clear, good-looking screens, and test them with real users before anything gets built.',
      get: 'A clickable, tested prototype and design files your developers can build from.',
      seeIt: { label: 'Aladdin Commercial', href: 'https://umm.digital/casestudies/aladdin-commercial/' },
      shape: 'ellipse-10' as ShapeName,
      tone: 'blossom' as Tone,
    },
    {
      title: 'Digital branding',
      when: 'Your brand looks and sounds different on every screen.',
      what: 'Shape how your brand looks, sounds and moves online (colours, type, icons, tone of voice) and turn it into a kit your teams can use.',
      get: 'A digital brand kit and a design system for web and app.',
      /* open item: Krish to pick the branding project */
      seeIt: null as { label: string; href: string } | null,
      shape: 'star-11' as ShapeName,
      tone: 'citrus' as Tone,
    },
    {
      title: 'Personalisation & customer data',
      when: 'Your customer data sits in five places, so everyone gets the same generic message.',
      what: 'Pull your data into one view of each customer, and design where personal touches and AI genuinely help.',
      get: 'One view of each customer, and a personalisation plan.',
      seeIt: { label: 'Zceppa', href: 'https://umm.digital/casestudies/zceppa/' },
      shape: 'ellipse-5' as ShapeName,
      tone: 'coral' as Tone,
    },
    {
      title: 'Testing & ongoing improvement',
      when: "You've launched, but don't know if it's working, or who owns keeping it good.",
      what: 'Agree what success looks like, track it, keep testing improvements, and set your team up to run it after we leave.',
      get: 'A simple scorecard, a regular testing rhythm, and design standards your team can own.',
      seeIt: { label: 'Coco & Coir', href: 'https://umm.digital/casestudies/coco-coir/' },
      shape: 'misc-3' as ShapeName,
      tone: 'sun' as Tone,
    },
  ],
  signpost: {
    question: 'Looking for online shops, checkout or storefront builds?',
    before: 'That lives on our',
    page: 'UX & Digital Commerce',
    after: 'page. This page is about research, strategy, journeys and design.',
    href: null as string | null,
  },
}

/* ── 5 · Built for where you are ──────────────────────────────────────────── */

export const stages = {
  chip: 'Startups to enterprise',
  line1: 'Wherever you are,',
  line2: 'we start there.',
  accent: 'we start there.',
  lead: "Pick your stage to see what we'd do, what you'd get, and how we'd work together.",
  items: [
    {
      tab: 'Startups',
      title: 'Prove it fast',
      stat: '2–5×',
      statCaption: 'productivity boost within the first 90 days',
      challenge: 'You have an idea and need to prove it, without building too much too soon.',
      approach:
        'Turn your idea into wireframes, then a clickable prototype, then a finished design (and front-end) your developers can build. We focus on the one journey that matters most.',
      outcome: 'A tested product you can launch, learn from, and show to investors.',
      model: {
        name: 'One-journey redesign',
        body: 'We map, design and test one journey from start to finish. Joint design sessions and regular reviews. Scoped up front, per journey.',
      },
      seeIt: { label: 'Penny', href: 'https://umm.digital/casestudies/penny-co/' },
      shape: 'flower-6' as ShapeName,
      tone: 'sun' as Tone,
    },
    {
      tab: 'Growing companies',
      title: 'Revamp it for who you are now',
      stat: '30–50%',
      statCaption: 'lower running costs, and a path to keep growing',
      challenge:
        "You've grown fast. Your website and app haven't kept up, and your channels and data have drifted apart.",
      approach:
        "Revamp your website and app UI/UX to match the company you've become, and join your key journeys and data into one view.",
      outcome: 'A refreshed product, and journeys that feel like one relationship, not lots of hand-offs.',
      model: {
        name: 'CX check-up, then an improvement squad',
        body: 'A few weeks of research and workshops with your team (light time commitment) gets you a ranked plan and research findings. Then a designer, a researcher and an analyst keep testing and improving, in ongoing cycles, against a backlog and goals we agree.',
      },
      seeIt: { label: 'Coco & Coir', href: 'https://umm.digital/casestudies/coco-coir/' },
      shape: 'flower-1' as ShapeName,
      tone: 'blossom' as Tone,
    },
    {
      tab: 'Enterprises',
      title: 'Join it all up',
      stat: '$1M+',
      statCaption: 'saved every year through smarter, automated operations',
      challenge: 'Many teams, markets and systems, and customers feel every gap between them.',
      approach:
        'Join broken channels into one journey, set one design standard for every team, and help shape new digital products from the first idea.',
      outcome: 'A consistent experience your whole organisation can deliver, and keep delivering.',
      model: {
        name: 'Embedded team',
        body: 'UMM designers, researchers and a lead work inside your organisation, in your meetings and your tools, across a programme of journeys. Ongoing, reviewed regularly.',
      },
      seeIt: { label: 'Mohawk Recover', href: 'https://umm.digital/casestudies/mohawk-recover/' },
      shape: 'wheel-1' as ShapeName,
      tone: 'sky' as Tone,
    },
  ],
  footnote: 'Not sure which fits? Every project can start with a CX check-up.',
}

/* ── 6 · How we design ────────────────────────────────────────────────────── */

export const principles = {
  chip: 'Our rules',
  line1: "Good design isn't luck.",
  line2: "It's rules we never skip.",
  accent: 'never skip.',
  lead: "Every screen we make follows a few simple rules. That's why it looks good and works.",
  items: [
    {
      id: 'colour',
      title: 'Colour with a reason',
      body: 'Colours that guide the eye, show what to tap, and stay readable for everyone, including people with low vision.',
      tone: 'blossom' as Tone,
    },
    {
      id: 'thumbs',
      title: 'Made for thumbs',
      body: 'Buttons where your thumb naturally lands, and text big enough to read on the go.',
      tone: 'sky' as Tone,
    },
    {
      id: 'steps',
      title: 'Fewer steps, every time',
      body: 'If it takes ten taps, we find a way to do it in three.',
      tone: 'citrus' as Tone,
    },
    {
      id: 'same',
      title: 'Same look, everywhere',
      body: 'One set of buttons, colours and patterns across web and app, so nothing ever feels unfamiliar.',
      tone: 'sun' as Tone,
    },
    {
      id: 'tested',
      title: "Tested before it's built",
      body: 'We check designs with real users and your developers during design, not after. Quality is checked as we build, and we agree how success is measured after launch.',
      tone: 'coral' as Tone,
    },
  ],
}

/* Santosh-approved; keep word for word. */
export const tools = {
  chip: '25 tools',
  line1: 'We work within the systems',
  line2: 'you already have.',
  accent: 'have.',
  lead: 'We design and deliver inside your existing platforms rather than adding another silo. The tools below are grouped by how we use them.',
  groups: [
    {
      label: 'Experience & content',
      role: 'We build inside it',
      claim: 'Your content platform already works. We design the journeys that run through it.',
      tone: 'sun' as Tone,
      shape: 'polygon-6' as ShapeName,
      items: ['Adobe Experience Manager', 'Sitecore', 'Contentful', 'WordPress VIP'],
    },
    {
      label: 'CRM & service',
      role: 'We build inside it',
      claim: 'Sales, service and support on one record, so the customer only has to say it once.',
      tone: 'sky' as Tone,
      shape: 'ellipse-3' as ShapeName,
      items: ['Salesforce', 'Microsoft Dynamics 365', 'ServiceNow', 'Zendesk'],
    },
    {
      label: 'Customer data',
      role: 'We connect to it',
      claim: 'One profile per customer, assembled from the sources you already collect.',
      tone: 'blossom' as Tone,
      shape: 'ellipse-6' as ShapeName,
      items: ['Segment', 'Tealium', 'Salesforce Data 360', 'Adobe Real-Time CDP'],
    },
    {
      label: 'Journey & personalisation',
      role: 'We connect to it',
      claim: 'The right message at the right moment, triggered by what someone actually did.',
      tone: 'citrus' as Tone,
      shape: 'moon-12' as ShapeName,
      items: ['Adobe Journey Optimizer', 'Braze', 'Dynamic Yield', 'Optimizely'],
    },
    {
      label: 'Design & prototyping',
      role: 'We design with it',
      claim: 'Journeys drawn, prototyped and reviewed with your team before anything gets built.',
      tone: 'coral' as Tone,
      shape: 'star-7' as ShapeName,
      items: ['Figma', 'Miro'],
    },
    {
      label: 'Research & analytics',
      role: 'We design with it',
      claim: 'What people say, what people do, and the distance between the two.',
      tone: 'sun' as Tone,
      shape: 'ellipse-2' as ShapeName,
      items: ['Maze', 'UserTesting', 'Qualtrics', 'Medallia', 'Adobe Analytics', 'Google Analytics 4', 'Hotjar'],
    },
  ],
  note: 'These groupings reflect how we work. They do not imply a partnership, reseller status or certification unless stated separately.',
}

/* ── 7 · How we work + let's talk ─────────────────────────────────────────── */

export const process = {
  chip: 'How it works',
  line1: 'From first call to launch,',
  line2: 'in five steps.',
  accent: 'five steps.',
  lead: "Each step ends with something you can see and sign off. Nothing moves on until you're happy.",
  steps: [
    { title: 'Discover', body: "We talk to your customers and find what's not working today." },
    { title: 'Map', body: 'We map the whole journey and pick the fixes that matter most.' },
    { title: 'Design', body: 'We design the screens, and the service behind them.' },
    { title: 'Deliver', body: "We build it or hand it to your team, checked that it's easy to use and can actually be built." },
    { title: 'Improve', body: 'We measure against the goals we agreed, and keep making it better.' },
  ],
}

export const faq = [
  {
    question: 'What happens in a CX check-up?',
    answer:
      'We study a few of your most important customer journeys, look at how they work today, and agree what success looks like. You get a ranked plan of what to fix first, and a research report. Before we start, we confirm the scope, what we need from your team, and the time and cost.',
  },
  {
    question: 'Can we start with just one journey?',
    answer:
      "Yes, and lots of clients do. We map, design and test one journey from start to finish. It's the quickest way to see results before doing more.",
  },
  {
    question: 'Do you only design, or build too?',
    answer:
      'Both. We can design and hand over to your team, design and build it ourselves, or work alongside your developers. We agree which at the start, so everyone knows who does what.',
  },
  {
    question: 'Can you work with our in-house team?',
    answer:
      'Yes. We often work inside client teams, using your tools and ways of working. When we leave, your team can run it themselves.',
  },
  {
    question: 'What access or data do you need?',
    answer:
      "Usually a small group of customers to talk to, and access to the data for the journeys we're working on. We agree exactly what's needed, including privacy rules, before we start.",
  },
  {
    question: "How will we know it's working?",
    answer:
      'We agree the numbers up front, like sales, repeat customers, support calls or how much effort things take. Then we record where they are today, so we can show you the change.',
  },
  {
    question: 'Will this disrupt our business?',
    answer:
      'No. We roll changes out in stages, not all at once, and plan around anything that has to keep running.',
  },
]

export const closing = {
  line1: 'Tell us where your customers get stuck.',
  line2: "We'll show you the way out.",
  lead: "Start with a CX check-up. We'll show you where customers are struggling, and a clear plan to fix it.",
  primaryCta: 'Talk to us about your project',
  secondaryCta: 'See our work',
}
