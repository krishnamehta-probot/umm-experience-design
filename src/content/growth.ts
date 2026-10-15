import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import type { ServiceMark } from '@/content/cxUiDesign'

/* ============================================================================
   INTEGRATED GROWTH & STRATEGY — PAGE CONTENT

   Word for word from Krish's Integrated Growth and Strategy content doc,
   15 Oct 2026:
   https://docs.google.com/document/d/1F48Qv0qvqC4WeRvFIVdO225VRaMsTBJqquW6HKQWCoQ
   Visual reference: https://umm-integrated-growth-strategy.ai-umm.chatgpt.site

   The fifth service page on the CX page's locked design: every export has
   the same keys and value types as the matching one in cloudData.ts.
   ========================================================================== */

export const meta = {
  service: 'Integrated Growth & Strategy',
  title: 'Integrated Growth and Strategy | UMM Digital',
  description:
    'Connect positioning, demand, conversion and retention with UMM. An integrated growth strategy built around commercial priorities, customer journeys and clear measures.',
  locations: 'Dallas · London · Dubai · Nairobi · Shenzhen',
  contactEmail: 'ping@umm.digital',
}

export const nav = [
  { id: 'work', label: 'Our work' },
  { id: 'services', label: 'Services' },
  { id: 'stages', label: 'Your stage' },
  { id: 'growth', label: 'Growth thinking' },
  { id: 'process', label: 'Our process' },
]

/* ── 1 · Hero and capability strip ───────────────────────────────────────── */

export const hero = {
  eyebrow: 'Integrated Growth & Strategy',
  lines: ['One growth goal.', 'Every move'],
  accent: 'working together.',
  tail: '',
  lead: 'Growth gets harder when your brand, campaigns, customer journeys and data pull in different directions. UMM brings them into one plan, so your team knows what to prioritise, what to test and where to invest next.',
  primaryCta: 'Let’s plan your next stage',
  secondaryCta: 'See how growth connects',
}

/** One commercial direction: the capabilities, on the ribbon */
export const ribbon = ['Growth strategy', 'Demand generation', 'Conversion & retention', 'Measurement & insight']

/* ── 2 · Why connection matters ───────────────────────────────────────────── */

export const why = {
  chip: 'Why connection matters',
  line1: 'Busy channels. Different targets.',
  line2: 'One business.',
  /** the word in the headline the stickers merge into */
  one: 'business.',
  /** Ten channels and teams, as stickers that fly together into "business". */
  teams: [
    { name: 'Search', x: 12, y: 18, r: -8, tone: 'sun' as Tone },
    { name: 'Social', x: 35, y: 10, r: 6, tone: 'coral' as Tone },
    { name: 'Email', x: 62, y: 20, r: -5, tone: 'sky' as Tone },
    { name: 'Brand', x: 87, y: 13, r: 11, tone: 'citrus' as Tone },
    { name: 'Sales', x: 21, y: 48, r: 7, tone: 'blossom' as Tone },
    { name: 'Content', x: 79, y: 47, r: -9, tone: 'sun' as Tone },
    { name: 'CRM', x: 50, y: 56, r: 4, tone: 'coral' as Tone },
    { name: 'Paid media', x: 9, y: 80, r: -6, tone: 'citrus' as Tone },
    { name: 'Analytics', x: 60, y: 84, r: 8, tone: 'sky' as Tone },
    { name: 'Retention', x: 88, y: 78, r: -10, tone: 'blossom' as Tone },
  ],
  lead: 'A campaign can hit its targets while the business misses its own. We start with the commercial goal, then work across the decisions and customer moments that influence it.',
  pairs: [
    {
      title: 'Give every team the same direction.',
      body: 'Agree who you want to reach, why they should choose you and which outcomes deserve attention.',
      shape: 'triangle-5' as ShapeName,
      tone: 'sun' as Tone,
    },
    {
      title: 'Find the constraint before adding spend.',
      body: 'Look beyond channel reports to understand where demand loses momentum, from the first visit to the next purchase.',
      shape: 'flower-15' as ShapeName,
      tone: 'sky' as Tone,
    },
    {
      title: 'Turn evidence into the next decision.',
      body: 'Set a baseline, test a focused change and use the result to decide what to improve, expand or stop.',
      shape: 'moon-10' as ShapeName,
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 3 · Selected work (the film) ─────────────────────────────────────────── */

export const film = {
  label: 'Selected work',
  eyebrow: 'Selected work',
  title: 'Different markets. Connected ambition.',
  chip: 'ambition.',
  explore: { label: 'Explore all projects', href: 'https://umm.digital/case-studies/' },
  view: 'View the project',
  projects: [
    {
      id: 'enda',
      client: 'Enda Sportswear',
      type: 'Brand & market expansion',
      title: 'A Kenyan running brand. A wider world of customers.',
      chip: 'of customers.',
      body: 'Brand positioning, international ecommerce journeys and ongoing digital initiatives brought Enda’s heritage and performance story into a connected global commerce experience.',
      short: 'Enda’s heritage and performance story, in global commerce.',
      href: 'https://umm.digital/casestudies/enda-sportswear/',
      tone: 'sky' as Tone,
    },
    {
      id: 'biocon',
      client: 'Biocon Group',
      type: 'Campaigns & customer journeys',
      title: 'Different audiences. A connected digital direction.',
      chip: 'direction.',
      body: 'Audience-specific web experiences, academic recruitment campaigns and email automation connected brand communication with enquiry journeys across Biocon’s businesses.',
      short: 'Web experiences, campaigns and email automation, connected.',
      href: 'https://umm.digital/casestudies/biocon-group/',
      tone: 'citrus' as Tone,
    },
    {
      id: 'iadeptive',
      client: 'iAdeptive',
      type: 'Positioning & B2B experience',
      title: 'Complex technology. A clearer reason to choose.',
      chip: 'to choose.',
      body: 'A focused digital presence made AI and DevOps services easier for technical buyers to understand, with structured solution content and clear paths to enquire.',
      short: 'AI and DevOps services, easier for technical buyers.',
      href: 'https://umm.digital/casestudies/iadeptive/',
      tone: 'coral' as Tone,
    },
  ],
  site: 'umm.digital',
}

/* ── 4 · Growth services ──────────────────────────────────────────────────── */

const SCOPE = 'We agree the scope, responsibilities and measures around your growth priorities.'

export const services = {
  chip: 'What we bring to the plan',
  line1: 'The right capabilities.',
  line2: 'A shared direction.',
  accent: 'shared direction.',
  lead: 'Start with the priority. Connect the capabilities around it.',
  scope: SCOPE,
  includesLabel: 'What the work can include',
  hint: "See what's included",
  cta: { label: 'Discuss this service', href: '#contact' },
  items: [
    {
      step: 'Align',
      title: 'Growth strategy & commercial planning',
      body: 'Turn business ambitions into a set of choices: the audiences to pursue, the opportunities to prioritise and the investment needed to test them.',
      tags: ['Priorities', 'Markets', 'Roadmap'],
      more: '',
      includes: [
        'Business and market assessment',
        'Audience and opportunity prioritisation',
        'Growth roadmap and investment scenarios',
        'Shared goals, owners and review cadence',
      ],
      mark: 'research' as ServiceMark,
      tone: 'sun' as Tone,
    },
    {
      step: 'Position',
      title: 'Brand & market positioning',
      body: 'Give the right customers a clear reason to choose you. Connect audience needs, competitive context and your strengths in a proposition your teams can use.',
      tags: ['Audience', 'Proposition', 'Messaging'],
      more: '',
      includes: [
        'Customer and competitor research',
        'Positioning and value proposition',
        'Messaging architecture and brand narrative',
        'Go-to-market communication plan',
      ],
      mark: 'interface' as ServiceMark,
      tone: 'blossom' as Tone,
    },
    {
      step: 'Attract',
      title: 'Demand generation & channel strategy',
      body: 'Build a considered route to qualified demand. Align search, content, media and campaign journeys with the way your audience finds and evaluates solutions.',
      tags: ['Search', 'Content', 'Paid media'],
      more: '',
      includes: [
        'Organic search and content priorities',
        'Paid media and channel planning',
        'Campaign and landing-page alignment',
        'Lead quality and acquisition measurement',
      ],
      mark: 'journey' as ServiceMark,
      tone: 'sky' as Tone,
    },
    {
      step: 'Develop',
      title: 'Conversion & customer lifecycle',
      body: 'Help more interested people take the next step, then give customers a reason to stay. Address friction across enquiry, onboarding, purchase and repeat engagement.',
      tags: ['Conversion', 'Retention', 'Expansion'],
      more: '',
      includes: [
        'Customer journey and conversion review',
        'Landing-page and onboarding experiments',
        'Retention, reactivation and loyalty planning',
        'Lifecycle communication and expansion opportunities',
      ],
      mark: 'testing' as ServiceMark,
      tone: 'citrus' as Tone,
    },
    {
      step: 'Learn',
      title: 'Analytics, attribution & growth measurement',
      body: 'Build a useful view of performance across the journey. Agree what the numbers mean, where the data has limits and which decisions the reporting should support.',
      tags: ['Baselines', 'Experiments', 'Decisions'],
      more: '',
      includes: [
        'Measurement plan and KPI definitions',
        'Tracking and data-quality assessment',
        'Reporting and attribution approach',
        'Experiment design and performance reviews',
      ],
      mark: 'data' as ServiceMark,
      tone: 'lilac' as Tone,
    },
    {
      step: 'Connect',
      title: 'Growth operations & automation',
      body: 'Keep follow-up, handovers and reporting moving as the business expands. Connect the workflows and responsibilities behind a consistent customer experience.',
      tags: ['CRM', 'Workflows', 'Ownership'],
      more: '',
      includes: [
        'CRM and lead-management review',
        'Lead routing and nurture workflows',
        'Marketing platform and data connections',
        'Reporting automation and operating playbooks',
      ],
      mark: 'brand' as ServiceMark,
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 5 · Business stages ──────────────────────────────────────────────────── */

export const stages = {
  chip: 'Where your business is now',
  line1: 'Your next stage.',
  line2: 'Your growth priorities.',
  accent: 'growth priorities.',
  lead: 'The plan should fit your business, not just your ambition.',
  items: [
    {
      tab: 'Startups',
      flow: ['Focus', 'Validate', 'Learn'],
      title: 'Find your audience. Test your route to market.',
      body: 'Clarify who the product is for and what makes it relevant. Build a focused launch plan, test early demand and learn before committing to a broader channel mix.',
      services: ['Positioning and proposition', 'Launch priorities', 'Early demand tests'],
      cta: { label: 'Discuss your go-to-market plan', href: 'https://umm.digital/contact/' },
      tone: 'sun' as Tone,
    },
    {
      tab: 'Scale-ups',
      flow: ['Connect', 'Improve', 'Repeat'],
      title: 'Make growth less dependent on the next campaign.',
      body: 'Bring acquisition, conversion and retention into one operating plan. Identify the constraints, strengthen follow-up and establish a repeatable way to test and improve.',
      services: ['Channel and journey alignment', 'Lifecycle programmes', 'Shared performance reporting'],
      cta: { label: 'Discuss your next stage', href: 'https://umm.digital/contact/' },
      tone: 'sky' as Tone,
    },
    {
      tab: 'Enterprises',
      flow: ['Align', 'Govern', 'Expand'],
      title: 'Keep a shared direction across teams and markets.',
      body: 'Coordinate commercial priorities across business units, platforms and partners. Establish common measures and decision-making while allowing for local customers and market conditions.',
      services: ['Cross-market strategy', 'Measurement and governance', 'Connected growth operations'],
      cta: { label: 'Discuss your growth programme', href: 'https://umm.digital/contact/' },
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 6 · Where growth adds up (new section) ───────────────────────────────── */

export type Lever = {
  step: string
  title: string
  label: string
  min: number
  max: number
  step_: number
  value: number
  /** how the value is shown: a count, or a percentage */
  unit: 'count' | 'pct'
}

export const growthModel: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  demo: {
    label: string
    eyebrow: string
    title: string
    reset: string
    aovLabel: string
    aov: number
    resultTag: string
    revenueLabel: string
    baselineLabel: string
    firstLabel: string
    repeatLabel: string
    firstOrdersLabel: string
    repeatOrdersLabel: string
    baselineNote: string
    changedNote: string
    howLabel: string
    how: string
    disclaimer: string
  }
  levers: [Lever, Lever, Lever]
  principles: { step: string; title: string; body: string }[]
} = {
  chip: 'Where growth adds up',
  line1: 'More traffic is',
  line2: 'only one lever.',
  accent: 'one lever.',
  lead: 'Try the model. See how demand, conversion and repeat orders connect.',
  demo: {
    label: 'Interactive growth model',
    eyebrow: 'A simple commerce example',
    title: 'Move one lever. Then connect all three.',
    reset: 'Reset example',
    aovLabel: 'Fixed average order value',
    aov: 2500,
    resultTag: 'Illustrative model',
    revenueLabel: 'Modelled revenue for the period',
    baselineLabel: 'Baseline example',
    firstLabel: 'First orders revenue',
    repeatLabel: 'Repeat orders revenue',
    firstOrdersLabel: 'First orders',
    repeatOrdersLabel: 'Repeat orders',
    baselineNote: 'Growth decisions need a view of the whole journey.',
    changedNote: 'compared with the baseline example',
    howLabel: 'How the model works',
    how: 'Visits × conversion rate × (1 + repeat purchase rate) × average order value. Each converted visit represents a new customer; a repeat customer places one additional order within the same period.',
    disclaimer:
      'This is an arithmetic illustration, not a forecast or a client result. Inputs change independently. Costs, margins, refunds, capacity, timing and attribution are excluded. A real plan tests these assumptions against your data.',
  },
  levers: [
    {
      step: '01',
      title: 'Bring people in',
      label: 'Visits during the modelled period',
      min: 5000,
      max: 25000,
      step_: 500,
      value: 10000,
      unit: 'count',
    },
    {
      step: '02',
      title: 'Help them choose',
      label: 'Share of visits resulting in a first order',
      min: 1,
      max: 5,
      step_: 0.1,
      value: 2,
      unit: 'pct',
    },
    {
      step: '03',
      title: 'Give them a reason to return',
      label: 'Share of those customers placing one repeat order',
      min: 0,
      max: 60,
      step_: 5,
      value: 20,
      unit: 'pct',
    },
  ],
  principles: [
    {
      step: 'Before the campaign',
      title: 'Find the limiting factor.',
      body: 'Check demand quality, customer friction and follow-up before deciding that more spend is the answer.',
    },
    {
      step: 'Before the scale-up',
      title: 'Test the economics.',
      body: 'Look at acquisition cost, margin and customer value alongside revenue to understand whether growth is worth repeating.',
    },
    {
      step: 'Before the next plan',
      title: 'Use what you learn.',
      body: 'Turn campaign, journey and customer evidence into a clear decision about the next priority.',
    },
  ],
}

/* ── 6b · A connected view of performance (the tools wheel) ───────────────── */

export const tools = {
  chip: 'A connected view of performance',
  line1: 'Your platforms.',
  line2: 'A more useful conversation.',
  accent: 'useful conversation.',
  lead: 'We start with your current tools, data quality and team workflows. The goal is to make information usable across marketing, sales and customer teams.',
  groups: [
    {
      label: 'Analytics and reporting',
      tone: 'sun' as Tone,
      items: ['Google Analytics 4', 'Looker Studio', 'Power BI', 'Mixpanel'],
    },
    {
      label: 'CRM and lifecycle',
      tone: 'sky' as Tone,
      items: ['HubSpot', 'Salesforce', 'Zoho', 'Marketo'],
    },
    {
      label: 'Media and search',
      tone: 'coral' as Tone,
      items: ['Google Ads', 'Meta Business Suite', 'LinkedIn Campaign Manager', 'Semrush'],
    },
    {
      label: 'Workflow automation',
      tone: 'citrus' as Tone,
      items: ['Zapier', 'Make', 'n8n', 'Airtable'],
    },
  ],
}

/* ── 7 · How the plan becomes progress ────────────────────────────────────── */

export const process = {
  chip: 'How the plan becomes progress',
  line1: 'A clear priority.',
  line2: 'A practical next move.',
  accent: 'next move.',
  lead: 'Strategy that stays connected to execution and learning.',
  /** the axis mark where the approach is ready to expand */
  ready: 'Ready to expand',
  steps: [
    {
      title: 'Assess',
      body: 'Understand the business goal, audience, journey and current performance.',
      get: 'A shared starting point',
    },
    {
      title: 'Prioritise',
      body: 'Choose the opportunities to pursue and the assumptions to test first.',
      get: 'A focused growth roadmap',
    },
    {
      title: 'Activate',
      body: 'Coordinate the people, campaigns, experiences and workflows needed.',
      get: 'A connected delivery plan',
    },
    {
      title: 'Learn',
      body: 'Review results against the baseline and investigate what changed.',
      get: 'Evidence for the next decision',
    },
    {
      title: 'Expand',
      body: 'Extend validated approaches with agreed budgets, ownership and measures.',
      get: 'A repeatable operating rhythm',
    },
  ],
}

export const engagement: {
  title: string
  href: string
  items: { title: string; body: string; tone: Tone }[]
} = {
  title: 'The right way to work together.',
  href: 'https://umm.digital/contact/',
  items: [
    {
      title: 'Strategy & advisory',
      body: 'Clarify the opportunity, priorities and plan with your leadership team.',
      tone: 'sun' as Tone,
    },
    {
      title: 'Growth transformation',
      body: 'Connect teams, journeys and systems around a wider programme.',
      tone: 'sky' as Tone,
    },
    {
      title: 'Integrated partnership',
      body: 'Bring ongoing activation, testing and measurement into a shared rhythm.',
      tone: 'coral' as Tone,
    },
    {
      title: 'Fractional leadership',
      body: 'Add senior growth direction and accountability alongside your team.',
      tone: 'citrus' as Tone,
    },
  ],
}

/* ── 8 · Contact and common questions ─────────────────────────────────────── */

export const faq = [
  {
    question: 'Where does a growth engagement begin?',
    answer:
      'With the business outcome you want to improve. We review your audience, current performance, customer journey and team setup to identify a useful starting point and agree the first priorities.',
  },
  {
    question: 'Can you help with both strategy and execution?',
    answer:
      'Yes. We can develop the plan, support selected workstreams or coordinate an ongoing programme. The scope sets out which campaigns, content, experiences, technology and reporting activities are included.',
  },
  {
    question: 'Can you work with our existing team and agencies?',
    answer:
      'Yes. We agree responsibilities, shared measures and a review cadence with your internal teams and partners. That keeps strategy and delivery connected across the people already doing the work.',
  },
  {
    question: 'Will we need new marketing technology?',
    answer:
      'Not automatically. We assess what your current tools can support, where data or handovers break down and whether a change would solve a clear problem before recommending additional platforms.',
  },
  {
    question: 'How do you measure progress?',
    answer:
      'We agree a baseline and measures that reflect the business model. These may include qualified enquiries, conversion, acquisition cost, retention and customer value. We also document attribution limits and the time needed to observe change.',
  },
  {
    question: 'How quickly can we expect results?',
    answer:
      'Timing depends on the starting point, buying cycle, channels and scope. We separate early delivery milestones from commercial outcomes, then agree realistic review periods. The interactive example above is an illustration, not a results promise.',
  },
]

export const closing = {
  eyebrow: 'Your next growth priority',
  lines: ['You know where you want to go.'],
  accent: 'Let’s make a plan.',
  lead: 'Tell us what growth means for your business, where progress is slowing and what you have tried. We will help you identify the next move and the work around it.',
  primaryCta: { label: 'Let’s plan your next stage', href: 'https://umm.digital/contact/' },
  faqLabel: 'A few things you may want to know',
}
