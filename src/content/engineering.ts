import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import type { ServiceMark } from '@/content/cxUiDesign'

/* ============================================================================
   DIGITAL ENGINEERING — PAGE CONTENT

   Word for word from Krish's Digital Engineering content doc, 15 Oct 2026:
   https://docs.google.com/document/d/1LwRv6AyBh1siHmtEDmb9kMCLxKWzP37m5QsauWcftO0
   Visual reference: https://umm-digital-engineering.ai-umm.chatgpt.site

   The fourth service page on the CX page's locked design: every export has
   the same keys and value types as the matching one in cloudData.ts, because
   this page reuses the same section components.
   ========================================================================== */

export const meta = {
  service: 'Digital Engineering',
  title: 'Digital Engineering | UMM',
  locations: 'Dallas · London · Dubai · Nairobi · Shenzhen',
  contactEmail: 'ping@umm.digital',
}

export const nav = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'stages', label: 'Your stage' },
  { id: 'release', label: 'How we release' },
  { id: 'process', label: 'Our process' },
]

/* ── 1 · Hero and capability strip ───────────────────────────────────────── */

export const hero = {
  eyebrow: 'Digital Engineering',
  lines: ['Build what’s next.', 'Make it work.'],
  accent: 'Keep it moving.',
  tail: '',
  lead: 'Your next product needs more than a launch. It needs a foundation your business can build on. UMM engineers web and mobile applications, connects systems and modernises platforms so your teams can deliver, adapt and grow.',
  primaryCta: 'Discuss your engineering project',
  secondaryCta: 'See our work',
}

/** From product to platform: the capabilities, on the ribbon */
export const ribbon = ['Product engineering', 'Platform architecture', 'Systems integration', 'Release engineering']

/* ── 2 · Why the foundation matters ──────────────────────────────────────── */

export const why = {
  chip: 'Why the foundation matters',
  line1: 'Your business changes.',
  line2: 'Your technology should keep pace.',
  /** the word in the headline the stickers merge into */
  one: 'pace.',
  /** Ten parts of a product, as stickers that fly together into "pace". */
  teams: [
    { name: 'Front ends', x: 12, y: 18, r: -8, tone: 'sky' as Tone },
    { name: 'APIs', x: 35, y: 10, r: 6, tone: 'blossom' as Tone },
    { name: 'Databases', x: 62, y: 20, r: -5, tone: 'citrus' as Tone },
    { name: 'Mobile', x: 87, y: 13, r: 11, tone: 'sun' as Tone },
    { name: 'Tests', x: 21, y: 48, r: 7, tone: 'coral' as Tone },
    { name: 'Releases', x: 79, y: 47, r: -9, tone: 'sky' as Tone },
    { name: 'Integrations', x: 50, y: 56, r: 4, tone: 'blossom' as Tone },
    { name: 'Security', x: 9, y: 80, r: -6, tone: 'sun' as Tone },
    { name: 'Monitoring', x: 60, y: 84, r: 8, tone: 'citrus' as Tone },
    { name: 'CMS', x: 88, y: 78, r: -10, tone: 'coral' as Tone },
  ],
  lead: 'A new feature should not mean rebuilding the platform. A new market should not multiply manual work. Good engineering creates room for the business to move.',
  pairs: [
    {
      title: 'Make change easier to deliver.',
      body: 'Separate responsibilities, clarify dependencies and create code your team can understand and maintain.',
      shape: 'polygon-1' as ShapeName,
      tone: 'sky' as Tone,
    },
    {
      title: 'Connect the work across systems.',
      body: 'Bring applications, data and business processes together through defined interfaces and dependable handovers.',
      shape: 'star-10' as ShapeName,
      tone: 'sun' as Tone,
    },
    {
      title: 'Plan for life after launch.',
      body: 'Build in testing, monitoring and operational ownership so issues can be identified and changes released with greater confidence.',
      shape: 'flower-14' as ShapeName,
      tone: 'blossom' as Tone,
    },
  ],
}

/* ── 3 · Selected work (the film) ─────────────────────────────────────────── */

export const film = {
  label: 'Selected work',
  eyebrow: 'Selected work',
  title: 'The engineering behind the experience.',
  chip: 'the experience.',
  explore: { label: 'Explore all projects', href: 'https://umm.digital/case-studies/' },
  view: 'View the project',
  projects: [
    {
      id: 'qcare',
      client: 'QCare',
      type: 'Web & mobile platforms',
      title: 'Connected services for student living.',
      chip: 'student living.',
      body: 'A web and mobile platform connecting property management, resident requests, bookings and operational reporting across student accommodation.',
      short: 'Property management, requests and bookings, connected.',
      href: 'https://umm.digital/casestudies/qcare/',
      tone: 'blossom' as Tone,
    },
    {
      id: 'mohawk',
      client: 'Mohawk PriceFx',
      type: 'Enterprise & offline software',
      title: 'Pricing operations, online and offline.',
      chip: 'and offline.',
      body: 'A pricing platform combining a React web application with an Electron desktop app, enterprise authentication and controlled data synchronisation.',
      short: 'A React web app and an Electron desktop app, kept in sync.',
      href: 'https://umm.digital/casestudies/mohawk-pricefx/',
      tone: 'coral' as Tone,
    },
    {
      id: 'penny',
      client: 'Penny',
      type: 'Front-end & CMS engineering',
      title: 'Approved designs. A working digital platform.',
      chip: 'digital platform.',
      body: 'Front-end engineering and a custom WordPress CMS that bring Penny’s supplied designs to life and support independent content updates.',
      short: 'Front-end engineering and a custom WordPress CMS.',
      href: 'https://umm.digital/casestudies/penny-co/',
      tone: 'sun' as Tone,
    },
  ],
  site: 'umm.digital',
}

/* ── 4 · Engineering services ─────────────────────────────────────────────── */

const SCOPE = 'We agree the deliverables, responsibilities and success measures around your project.'

export const services = {
  chip: 'What we can help you build',
  line1: 'The capability to build.',
  line2: 'The discipline to keep improving.',
  accent: 'keep improving.',
  lead: 'From a focused product release to a wider platform programme.',
  scope: SCOPE,
  includesLabel: 'What the work can include',
  hint: "See what's included",
  cta: { label: 'Discuss this service', href: '#contact' },
  items: [
    {
      step: 'Build',
      title: 'Web, mobile & product engineering',
      body: 'Bring a new product to life or extend an existing one with well-structured front ends, back ends and application services.',
      tags: ['Applications', 'APIs', 'Product delivery'],
      more: '',
      includes: [
        'Web and mobile application development',
        'Front-end and back-end engineering',
        'CMS and headless content integration',
        'Technical documentation and handover',
      ],
      mark: 'research' as ServiceMark,
      tone: 'sky' as Tone,
    },
    {
      step: 'Modernise',
      title: 'Platform architecture & modernisation',
      body: 'Understand what to retain, refactor or replace. Design a practical path from current constraints to a platform that supports your next priorities.',
      tags: ['Architecture', 'Refactoring', 'Migration'],
      more: '',
      includes: [
        'Architecture and dependency assessment',
        'Modular application and platform design',
        'Legacy refactoring and modernisation planning',
        'Phased migration and continuity planning',
      ],
      mark: 'interface' as ServiceMark,
      tone: 'sun' as Tone,
    },
    {
      step: 'Connect',
      title: 'APIs, data & systems integration',
      body: 'Connect the applications your business relies on, with clear data contracts, access controls and predictable handling when something fails.',
      tags: ['APIs', 'Data flows', 'Connected systems'],
      more: '',
      includes: [
        'Custom and third-party API integration',
        'CRM, ERP and platform connections',
        'Data migration and validation',
        'Event handling, retries and failure recovery',
      ],
      mark: 'journey' as ServiceMark,
      tone: 'blossom' as Tone,
    },
    {
      step: 'Release',
      title: 'Platform engineering & DevSecOps',
      body: 'Make releases repeatable through automated checks, consistent environments and deployment processes your team can operate.',
      tags: ['CI/CD', 'Environments', 'Release controls'],
      more: '',
      includes: [
        'Continuous integration and delivery pipelines',
        'Infrastructure as code and environment setup',
        'Automated testing and security checks',
        'Staged deployment and rollback procedures',
      ],
      mark: 'testing' as ServiceMark,
      tone: 'citrus' as Tone,
    },
    {
      step: 'Validate',
      title: 'Quality & security engineering',
      body: 'Check how the system behaves under real demands. Identify defects, access risks and performance limits before they become operational problems.',
      tags: ['Testing', 'Access', 'Performance'],
      more: '',
      includes: [
        'Unit, integration and end-to-end testing',
        'Performance and load testing',
        'Threat modelling and access-control review',
        'Release criteria and defect prioritisation',
      ],
      mark: 'data' as ServiceMark,
      tone: 'lilac' as Tone,
    },
    {
      step: 'Operate',
      title: 'Reliability & continuous improvement',
      body: 'Keep performance, failures and operating costs visible. Turn live evidence into a prioritised plan for a healthier platform.',
      tags: ['Monitoring', 'Reliability', 'Optimisation'],
      more: '',
      includes: [
        'Monitoring, logging and alerting',
        'Performance and resource optimisation',
        'Incident response and recovery planning',
        'Ongoing maintenance and improvement backlog',
      ],
      mark: 'brand' as ServiceMark,
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 5 · Business stages ──────────────────────────────────────────────────── */

export const stages = {
  chip: 'Where your business is now',
  line1: 'Different stages.',
  line2: 'Different engineering priorities.',
  accent: 'engineering priorities.',
  lead: 'Build the next step around the reality of your business.',
  items: [
    {
      tab: 'Startups',
      flow: ['Define', 'Build', 'Validate'],
      title: 'Get the first product right. Leave room for the next version.',
      body: 'Turn your core proposition into a focused MVP. We help define the technical scope, build the essential journeys and establish a maintainable foundation for learning after launch.',
      services: ['MVP development', 'Practical architecture', 'Release and handover'],
      cta: { label: 'Discuss your product idea', href: 'https://umm.digital/contact/' },
      tone: 'sky' as Tone,
    },
    {
      tab: 'Scale-ups',
      flow: ['Assess', 'Connect', 'Strengthen'],
      title: 'Help your platform catch up with your growth.',
      body: 'Resolve the bottlenecks behind slow releases, disconnected tools and increasing support effort. We strengthen the platform while keeping the next business priority in view.',
      services: ['Platform modernisation', 'Systems integration', 'Delivery automation'],
      cta: { label: 'Discuss your next stage', href: 'https://umm.digital/contact/' },
      tone: 'sun' as Tone,
    },
    {
      tab: 'Enterprises',
      flow: ['Map', 'Modernise', 'Govern'],
      title: 'Move complex systems forward. One considered change at a time.',
      body: 'Plan around existing dependencies, data and operating responsibilities. We support phased modernisation, enterprise applications and integrations with clear release and ownership arrangements.',
      services: ['Enterprise applications', 'Phased migration', 'Reliability and governance'],
      cta: { label: 'Discuss your engineering programme', href: 'https://umm.digital/contact/' },
      tone: 'blossom' as Tone,
    },
  ],
}

/* ── 6 · From commit to customer (new section) ────────────────────────────── */

export type GateState = 'done' | 'pass' | 'staged' | 'watch' | 'fail' | 'hold' | 'idle' | 'alert'

export type ReleaseScenario = {
  id: 'pass' | 'fail' | 'live'
  label: string
  /** each gate's status word and state, in gate order */
  gates: { status: string; state: GateState }[]
  statusLabel: string
  outcome: 'go' | 'stop'
  title: string
  body: string
  see: string
}

export const release: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  demo: {
    label: string
    heading: string
    context: string
    scenariosLabel: string
    from: string
    to: string
    gates: { name: string; body: string }[]
    seeLabel: string
    disclaimer: string
  }
  scenarios: ReleaseScenario[]
  principles: { title: string; body: string }[]
} = {
  chip: 'From commit to customer',
  line1: 'A release is more than',
  line2: 'a deploy button.',
  accent: 'deploy button.',
  lead: 'See how release controls respond when the conditions change.',
  demo: {
    label: 'Interactive release example',
    heading: 'Release / Customer portal',
    context: 'Illustrative engineering example',
    scenariosLabel: 'Choose a release scenario',
    from: 'v2.4',
    to: 'v2.5',
    gates: [
      { name: 'Review', body: 'Code and dependencies checked.' },
      { name: 'Test', body: 'Agreed release checks evaluated.' },
      { name: 'Roll out', body: 'Introduce the change in stages.' },
      { name: 'Monitor', body: 'Watch for unexpected behaviour.' },
    ],
    seeLabel: 'What your team can see',
    disclaimer:
      'Illustrates release decisions, not a live deployment. Controls and rollback plans are agreed for each system.',
  },
  scenarios: [
    {
      id: 'pass',
      label: 'Checks pass',
      gates: [
        { status: 'Complete', state: 'done' },
        { status: 'Passed', state: 'pass' },
        { status: 'Staged', state: 'staged' },
        { status: 'Monitoring', state: 'watch' },
      ],
      statusLabel: 'Controlled release',
      outcome: 'go',
      title: 'Ready to introduce the change.',
      body: 'The agreed checks pass. Release to a limited audience, monitor the result and expand only when the release criteria remain satisfied.',
      see: 'Test results, release history and the signals needed to decide whether to continue.',
    },
    {
      id: 'fail',
      label: 'A test fails',
      gates: [
        { status: 'Complete', state: 'done' },
        { status: 'Failed', state: 'fail' },
        { status: 'On hold', state: 'hold' },
        { status: 'Not started', state: 'idle' },
      ],
      statusLabel: 'Release paused',
      outcome: 'stop',
      title: 'Catch the problem before customers do.',
      body: 'An integration test fails. The release stays on hold while the team investigates, corrects the change and runs the required checks again. The existing version continues serving customers.',
      see: 'The failing test, the affected change and a clear owner for the correction.',
    },
    {
      id: 'live',
      label: 'An issue appears live',
      gates: [
        { status: 'Complete', state: 'done' },
        { status: 'Passed', state: 'pass' },
        { status: 'Expansion paused', state: 'hold' },
        { status: 'Issue detected', state: 'alert' },
      ],
      statusLabel: 'Recovery decision',
      outcome: 'stop',
      title: 'Stop expansion. Follow the recovery plan.',
      body: 'Monitoring identifies an unexpected issue in the limited rollout. Pause expansion, assess the impact and use the agreed recovery path: rollback where safe, or a controlled fix forward when data or dependencies prevent it.',
      see: 'The alert, affected release, recovery owner and checks needed to confirm service health.',
    },
  ],
  principles: [
    {
      title: 'Change in smaller steps.',
      body: 'Limit the scope of each release so it is easier to review, test and troubleshoot.',
    },
    {
      title: 'Make failure visible.',
      body: 'Use meaningful checks and monitoring to show where a release needs attention.',
    },
    {
      title: 'Prepare a recovery path.',
      body: 'Agree how to stop, roll back or fix forward, including the implications for data and dependencies.',
    },
  ],
}

/* ── 6b · Tools follow the requirement (the tools wheel) ──────────────────── */

export const tools = {
  chip: 'Tools follow the requirement',
  line1: 'Built around your stack.',
  line2: 'Chosen for your next step.',
  accent: 'your next step.',
  lead: 'We assess your current environment, team capability and operating needs before selecting frameworks, infrastructure and integration patterns.',
  groups: [
    {
      label: 'Application development',
      tone: 'sky' as Tone,
      items: ['React', 'Angular', 'Node.js', 'Spring Boot'],
    },
    {
      label: 'Integration and data',
      tone: 'sun' as Tone,
      items: ['REST APIs', 'Event-driven integration', 'Data validation', 'System connectors'],
    },
    {
      label: 'Build and release',
      tone: 'blossom' as Tone,
      items: ['CI/CD pipelines', 'Infrastructure as code', 'Staged releases', 'Security checks'],
    },
    {
      label: 'Quality and operations',
      tone: 'citrus' as Tone,
      items: ['Automated testing', 'Application monitoring', 'Performance testing', 'Incident response'],
    },
  ],
}

/* ── 7 · How the work takes shape ─────────────────────────────────────────── */

export const process = {
  chip: 'How the work takes shape',
  line1: 'Clear decisions.',
  line2: 'Working software.',
  accent: 'Working software.',
  lead: 'A shared view of scope, responsibility and progress.',
  /** the axis mark where the change is ready to release */
  ready: 'Ready to release',
  steps: [
    {
      title: 'Discover & define',
      body: 'Assess your goals, current systems, constraints and delivery priorities.',
      get: 'An agreed scope',
    },
    {
      title: 'Architect & plan',
      body: 'Define the structure, interfaces, dependencies and release approach.',
      get: 'A technical delivery plan',
    },
    {
      title: 'Build & integrate',
      body: 'Develop the application and connect it to the systems it depends on.',
      get: 'Working software',
    },
    {
      title: 'Validate & release',
      body: 'Check quality, performance and access, then introduce the change in stages.',
      get: 'A controlled launch',
    },
    {
      title: 'Operate & evolve',
      body: 'Monitor, maintain and prioritise improvements using operational feedback.',
      get: 'An improvement roadmap',
    },
  ],
}

export const engagement: {
  title: string
  href: string
  items: { title: string; body: string; tone: Tone }[]
} = {
  title: 'Start where the work needs you.',
  href: 'https://umm.digital/contact/',
  items: [
    { title: 'Technical assessment', body: 'Understand the system and agree the next priorities.', tone: 'sky' as Tone },
    { title: 'Defined project', body: 'Deliver a product, integration or modernisation scope.', tone: 'sun' as Tone },
    { title: 'Embedded engineering', body: 'Add specialist support alongside your existing team.', tone: 'blossom' as Tone },
    { title: 'Ongoing platform support', body: 'Maintain, monitor and improve after release.', tone: 'citrus' as Tone },
  ],
}

/* ── 8 · Contact and common questions ─────────────────────────────────────── */

export const faq = [
  {
    question: 'Can you build a new product and modernise an existing one?',
    answer:
      'Yes. We support new web and mobile products as well as existing platforms. The starting point is an assessment of your goals, dependencies and delivery constraints.',
  },
  {
    question: 'Will we need to replace our entire technology stack?',
    answer:
      'Not necessarily. We identify what can stay, what needs improvement and where replacement is justified. A phased approach can help manage dependencies and continuity requirements.',
  },
  {
    question: 'Can you work with our internal engineering team?',
    answer:
      'Yes. We can take ownership of an agreed scope or work alongside your team. We define responsibilities, review points, documentation and handover at the start.',
  },
  {
    question: 'How do you approach security and quality?',
    answer:
      'We agree requirements for the system, then apply relevant access controls, testing, code review and security checks. Compliance requirements are assessed for the specific project rather than assumed.',
  },
  {
    question: 'How are timelines and success measures defined?',
    answer:
      'We plan around scope, complexity, integrations and dependencies. Measures may include release frequency, response times, defects, availability and operating cost, with baselines agreed before delivery.',
  },
  {
    question: 'What happens after launch?',
    answer:
      'We agree the support and ownership model before release. Depending on the engagement, this can include monitoring, maintenance, incident response and a prioritised improvement backlog.',
  },
]

export const closing = {
  eyebrow: 'Your next engineering challenge',
  lines: ['A product to build.', 'A platform to improve.'],
  accent: 'Let’s engineer it.',
  lead: 'Tell us what you need to deliver, what is getting in the way and how your systems work today. We will help define the right scope and the next practical step.',
  primaryCta: { label: 'Discuss your engineering project', href: 'https://umm.digital/contact/' },
  faqLabel: 'A few things you may want to know',
}
