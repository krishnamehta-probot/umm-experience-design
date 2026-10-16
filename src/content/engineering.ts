import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import type { ServiceMark } from '@/content/cxUiDesign'

/* ============================================================================
   DIGITAL ENGINEERING — PAGE CONTENT

   Word for word from Krish's Digital Engineering content doc (15 Oct 2026,
   updated 16 Oct: the hero, the industries, the factory, the tools, FAQ 07):
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
  { id: 'factory', label: 'Our factory' },
  { id: 'process', label: 'Our process' },
]

/* ── 1 · Hero and capability strip ───────────────────────────────────────── */

export const hero = {
  eyebrow: 'Digital Engineering',
  lines: ['Expert engineers.', 'AI agents.'],
  accent: 'One delivery system.',
  tail: '',
  lead: 'From product requirements to production, UMM combines engineering expertise with AI-powered execution. Build new applications, modernize complex platforms, and connect the systems your business depends on.',
  primaryCta: 'Discuss your engineering project',
  secondaryCta: 'Explore our engineering factory',
  secondaryHref: '#factory',
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
  lead: 'AI expands what teams can build. Strong engineering turns that capacity into dependable software. We connect architecture, agent-assisted execution, and human review so progress reaches production.',
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
      body: 'A pricing platform combining a React web application with an Electron desktop app, enterprise authentication and controlled data synchronization.',
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
  lead: 'From a focused product release to a wider platform program.',
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
      step: 'Modernize',
      title: 'Platform architecture & modernization',
      body: 'Understand what to retain, refactor or replace. Design a practical path from current constraints to a platform that supports your next priorities.',
      tags: ['Architecture', 'Refactoring', 'Migration'],
      more: '',
      includes: [
        'Architecture and dependency assessment',
        'Modular application and platform design',
        'Legacy refactoring and modernization planning',
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
        'Threat modeling and access-control review',
        'Release criteria and defect prioritization',
      ],
      mark: 'data' as ServiceMark,
      tone: 'lilac' as Tone,
    },
    {
      step: 'Operate',
      title: 'Reliability & continuous improvement',
      body: 'Keep performance, failures and operating costs visible. Turn live evidence into a prioritized plan for a healthier platform.',
      tags: ['Monitoring', 'Reliability', 'Optimization'],
      more: '',
      includes: [
        'Monitoring, logging and alerting',
        'Performance and resource optimization',
        'Incident response and recovery planning',
        'Ongoing maintenance and improvement backlog',
      ],
      mark: 'brand' as ServiceMark,
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 4b · Engineering in context ─────────────────────────────────────────── */

export const industries = {
  eyebrow: 'Engineering in context',
  line1: 'Built around the way',
  line2: 'your industry works.',
  items: [
    {
      sector: 'Property & Living',
      title: 'Connected operations',
      body: 'Resident applications, booking journeys, service requests, and operational platforms.',
      tone: 'sky' as Tone,
    },
    {
      sector: 'Manufacturing & Distribution',
      title: 'Connected commercial systems',
      body: 'Pricing workflows, enterprise integrations, and applications that support work across environments.',
      tone: 'sun' as Tone,
    },
    {
      sector: 'Digital products & services',
      title: 'Platforms built to evolve',
      body: 'Customer portals, web and mobile products, and content platforms that teams can manage.',
      tone: 'blossom' as Tone,
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
      services: ['Platform modernization', 'Systems integration', 'Delivery automation'],
      cta: { label: 'Discuss your next stage', href: 'https://umm.digital/contact/' },
      tone: 'sun' as Tone,
    },
    {
      tab: 'Enterprises',
      flow: ['Map', 'Modernize', 'Govern'],
      title: 'Move complex systems forward. One considered change at a time.',
      body: 'Plan around existing dependencies, data and operating responsibilities. We support phased modernization, enterprise applications and integrations with clear release and ownership arrangements.',
      services: ['Enterprise applications', 'Phased migration', 'Reliability and governance'],
      cta: { label: 'Discuss your engineering program', href: 'https://umm.digital/contact/' },
      tone: 'blossom' as Tone,
    },
  ],
}

/* ── 6 · Inside our engineering factory ──────────────────────────────────── */

export type FactoryStage = {
  name: string
  title: string
  body: string
  direct: string
  assist: string
  gate: string
  artifact: string
}

export const factory: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  intro: string
  board: {
    label: string
    eyebrow: string
    tag: string
    contextLabel: string
    context: { tool: string; role: string }[]
    directLabel: string
    assistLabel: string
    gateLabel: string
    artifactLabel: string
    loop: string
    next: string
  }
  stages: FactoryStage[]
  principles: { step: string; title: string; body: string }[]
} = {
  chip: 'Inside our engineering factory',
  line1: 'Human judgment.',
  line2: 'AI-powered momentum.',
  accent: 'AI-powered momentum.',
  lead: 'A connected delivery model. From intent to production.',
  intro:
    'Our factory model connects requirements, design, code, and operations in one delivery workflow. Engineers set direction and own decisions. AI agents assist the work across the lifecycle, with checks and review built into each stage.',
  board: {
    label: 'Interactive engineering workflow',
    eyebrow: 'UMM / Engineering system',
    tag: 'Explore the delivery workflow',
    contextLabel: 'Shared context',
    context: [
      { tool: 'Jira', role: 'Requirements' },
      { tool: 'Figma', role: 'Product design' },
      { tool: 'GitHub', role: 'Code and history' },
    ],
    directLabel: 'Engineers direct',
    assistLabel: 'Agents assist',
    gateLabel: 'Review gate',
    artifactLabel: 'Delivery artifact',
    loop: 'Production feedback returns to the backlog.',
    next: 'Next',
  },
  stages: [
    {
      name: 'Define',
      title: 'Start with shared intent.',
      body: 'Translate the business goal into a delivery brief that people and agents can work from.',
      direct: 'Define priorities, architecture boundaries, and acceptance criteria.',
      assist: 'Organize requirements, explore repository context, and draft scoped tasks.',
      gate: 'The team agrees the scope and confirms the dependencies.',
      artifact: 'An approved delivery brief',
    },
    {
      name: 'Build',
      title: 'Multiply execution. Keep direction.',
      body: 'Move scoped implementation tasks forward in parallel, grounded in the same product and technical context.',
      direct: 'Set implementation direction, resolve trade-offs, and review proposed changes.',
      assist: 'Assist coding, integration, documentation, and preparation of pull requests.',
      gate: 'Code review confirms the change meets the intended design.',
      artifact: 'Reviewed implementation changes',
    },
    {
      name: 'Validate',
      title: 'Make quality part of the workflow.',
      body: 'Bring evidence to every release decision, from functional behavior to access and performance.',
      direct: 'Define test coverage, assess findings, and resolve release-blocking issues.',
      assist: 'Draft test cases, execute configured checks, and summarize failures for investigation.',
      gate: 'Required checks pass and unresolved risks are reviewed.',
      artifact: 'Test evidence and release readiness',
    },
    {
      name: 'Release',
      title: 'Ship with a clear decision trail.',
      body: 'Introduce approved changes through a controlled pipeline with a recovery plan.',
      direct: 'Approve the release, define rollout boundaries, and own recovery decisions.',
      assist: 'Assist release preparation, deployment checks, and post-release validation.',
      gate: 'An authorized engineer approves the production change.',
      artifact: 'A verified, controlled release',
    },
    {
      name: 'Evolve',
      title: 'Let production inform what comes next.',
      body: 'Connect operational evidence to the next delivery cycle so improvements address real needs.',
      direct: 'Prioritize improvements, assess impact, and direct incident response.',
      assist: 'Summarize monitoring signals, assist investigation, and propose follow-up tasks.',
      gate: 'The team validates findings before remediation or backlog changes.',
      artifact: 'An evidence-led improvement backlog',
    },
  ],
  principles: [
    {
      step: 'Capacity',
      title: 'Work moves in parallel.',
      body: 'Break down delivery into scoped tasks that engineers and agents can progress together.',
    },
    {
      step: 'Accountability',
      title: 'Expertise stays in control.',
      body: 'Engineers own architecture, review evidence, and approve consequential changes.',
    },
    {
      step: 'Continuity',
      title: 'Context travels with the work.',
      body: 'Requirements, decisions, tests, and production signals inform each next step.',
    },
  ],
}

/* ── 6b · Tools follow the requirement (the tools wheel) ──────────────────── */

export const tools = {
  chip: 'Connected to your engineering stack',
  line1: 'The tools you use.',
  line2: 'A more connected way to deliver.',
  accent: 'connected way to deliver.',
  lead: 'We select technologies around your product, existing systems, and operating needs. The factory model works within your delivery practices, including Agile.',
  groups: [
    {
      label: 'APPLICATIONS',
      tone: 'sky' as Tone,
      items: ['React', 'Angular', 'JavaScript', 'Node.js', 'Spring Boot'],
    },
    {
      label: 'CONTEXT & COLLABORATION',
      tone: 'sun' as Tone,
      items: ['Jira', 'Figma', 'GitHub'],
    },
    {
      label: 'INTEGRATION & DELIVERY',
      tone: 'blossom' as Tone,
      items: ['REST APIs', 'CI/CD', 'Infrastructure as code'],
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
      body: 'Engineers guide agent-assisted implementation, connect systems, and review changes throughout delivery.',
      get: 'Working software',
    },
    {
      title: 'Validate & release',
      body: 'Check quality, performance and access, then introduce the change in stages.',
      get: 'A controlled launch',
    },
    {
      title: 'Operate & evolve',
      body: 'Monitor, maintain and prioritize improvements using operational feedback.',
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
    { title: 'Defined project', body: 'Deliver a product, integration or modernization scope.', tone: 'sun' as Tone },
    { title: 'Embedded engineering', body: 'Add specialist support alongside your existing team.', tone: 'blossom' as Tone },
    { title: 'Ongoing platform support', body: 'Maintain, monitor and improve after release.', tone: 'citrus' as Tone },
  ],
}

/* ── 8 · Contact and common questions ─────────────────────────────────────── */

export const faq = [
  {
    question: 'Can you build a new product and modernize an existing one?',
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
      'We agree the support and ownership model before release. Depending on the engagement, this can include monitoring, maintenance, incident response and a prioritized improvement backlog.',
  },
  {
    question: 'How do AI agents fit into your engineering process?',
    answer:
      'Engineers define scope, architecture, and acceptance criteria. AI agents assist tasks such as implementation, test generation, and documentation. Our team reviews outputs and approves releases. Agent access and automation are scoped to the project and environment.',
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
