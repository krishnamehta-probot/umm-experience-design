import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import type { ServiceMark } from '@/content/cxUiDesign'

/* ============================================================================
   CLOUD AND DATA — PAGE CONTENT

   Word for word from Krish's Cloud & Data content doc (15 Oct 2026, updated
   16 Oct: the hero, the industries, the connected architecture, FAQ 07):
   https://docs.google.com/document/d/1RQQgCgX1AtTp_tBAeveRw1NMyxLZgD7jfG6EOQk7YbI
   Visual reference: https://umm-cloud-data.ai-umm.chatgpt.site

   The third service page on the CX page's locked design: every export here
   has the same keys and value types as the matching one in cxUiDesign.ts or
   aiAutomation.ts, because this page reuses their section components.
   ========================================================================== */

export const meta = {
  service: 'Cloud & Data',
  title: 'Cloud & Data | UMM',
  locations: 'Dallas · London · Dubai · Nairobi · Shenzhen',
  contactEmail: 'ping@umm.digital',
}

export const nav = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'stages', label: 'Your stage' },
  { id: 'architecture', label: 'How it works' },
  { id: 'process', label: 'Our process' },
]

/* ── 1 · Hero and capability strip ───────────────────────────────────────── */

export const hero = {
  eyebrow: 'Cloud & Data',
  lines: ['Your cloud.', 'Your data.'],
  accent: 'Working intelligently.',
  tail: '',
  lead: 'Connect cloud infrastructure, enterprise data, and AI-powered automation. We design, migrate, and operate the foundation behind your applications—with engineers directing the architecture and agents supporting delivery.',
  primaryCta: 'Discuss your cloud & data priorities',
  secondaryCta: 'Explore the connected architecture',
  secondaryHref: '#architecture',
}

/** From foundation to insight: the capabilities, on the ribbon */
export const ribbon = ['Cloud architecture', 'Data engineering', 'Analytics & insight', 'Security & governance']

/* ── 2 · Why the foundation matters ──────────────────────────────────────── */

export const why = {
  chip: 'Why the foundation matters',
  line1: 'Moving to the cloud is a start.',
  line2: 'Making it useful is the work.',
  /** the word in the headline the stickers merge into */
  one: 'work.',
  /** Ten pieces of an estate, as stickers that fly together into "work".
   *  x/y place each on the stage (%), r is its tilt. */
  teams: [
    { name: 'Servers', x: 12, y: 18, r: -8, tone: 'citrus' as Tone },
    { name: 'Pipelines', x: 35, y: 10, r: 6, tone: 'sky' as Tone },
    { name: 'Dashboards', x: 62, y: 20, r: -5, tone: 'blossom' as Tone },
    { name: 'Backups', x: 87, y: 13, r: 11, tone: 'sun' as Tone },
    { name: 'Access', x: 21, y: 48, r: 7, tone: 'coral' as Tone },
    { name: 'Costs', x: 79, y: 47, r: -9, tone: 'citrus' as Tone },
    { name: 'Warehouses', x: 50, y: 56, r: 4, tone: 'sky' as Tone },
    { name: 'Monitoring', x: 9, y: 80, r: -6, tone: 'sun' as Tone },
    { name: 'APIs', x: 60, y: 84, r: 8, tone: 'blossom' as Tone },
    { name: 'Recovery', x: 88, y: 78, r: -10, tone: 'coral' as Tone },
  ],
  lead: 'The value comes from how applications run, how information moves and how confidently people can use it. We bring those decisions into the same plan.',
  /** numbered 01–03 on the page */
  pairs: [
    {
      title: 'Make the environment easier to run.',
      body: 'Understand dependencies, define ownership and plan capacity, recovery and monitoring around the workloads that matter.',
      shape: 'flower-9' as ShapeName,
      tone: 'sky' as Tone,
    },
    {
      title: 'Give the numbers a common meaning.',
      body: 'Connect sources with agreed definitions and quality checks so teams can spend less time reconciling different versions of the same answer.',
      shape: 'polygon-3' as ShapeName,
      tone: 'citrus' as Tone,
    },
    {
      title: 'Keep cost and control in view.',
      body: 'Make access, usage and spend visible, with practical policies and regular reviews as the environment changes.',
      shape: 'misc-9' as ShapeName,
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 3 · Selected work (the film) ─────────────────────────────────────────── */

export const film = {
  label: 'Selected work',
  eyebrow: 'Selected work',
  title: 'Connected information. Practical applications.',
  chip: 'Practical applications.',
  explore: { label: 'Explore all projects', href: 'https://umm.digital/case-studies/' },
  view: 'View the project',
  /** Three projects, about seven seconds each, then the last frame: the
   *  three as cards, each a link to its case study. Images live in
   *  /public/work/<id>/. */
  projects: [
    {
      id: 'zceppa',
      client: 'Zceppa',
      type: 'Data integration & insight',
      title: 'Customer feedback. A connected view.',
      chip: 'A connected view.',
      body: 'Review-platform integrations, sentiment analysis and reporting brought customer feedback into one platform for businesses managing multiple locations.',
      short: 'Customer feedback from every location, in one platform.',
      href: 'https://umm.digital/casestudies/zceppa/',
      tone: 'citrus' as Tone,
    },
    {
      id: 'mohawk',
      client: 'Mohawk PriceFx',
      type: 'Data access & synchronization',
      title: 'Pricing data that travels with the team.',
      chip: 'with the team.',
      body: 'Connected web and offline applications combined pricing-data access, enterprise authentication and validated synchronization when connectivity returned.',
      short: 'Pricing data online and offline, synchronized when connectivity returns.',
      href: 'https://umm.digital/casestudies/mohawk-pricefx/',
      tone: 'coral' as Tone,
    },
    {
      id: 'qcare',
      client: 'QCare',
      type: 'Operations & reporting',
      title: 'Everyday operations. A more useful overview.',
      chip: 'useful overview.',
      body: 'A web and mobile platform brought accommodation workflows, resident requests and operational reporting together for property-management teams.',
      short: 'Accommodation workflows and reporting for property teams.',
      href: 'https://umm.digital/casestudies/qcare/',
      tone: 'blossom' as Tone,
    },
  ],
  site: 'umm.digital',
}

/* ── 4 · Cloud and data services ──────────────────────────────────────────── */

const SCOPE = 'We agree the scope, responsibilities and success measures around your cloud and data priorities.'

export const services = {
  chip: 'What we help you connect',
  line1: 'The foundation beneath',
  line2: 'your next decision.',
  accent: 'next decision.',
  lead: 'Cloud, data and operations. Designed to work together.',
  /** Under the list on every card's back. */
  scope: SCOPE,
  includesLabel: 'What the work can include',
  hint: "See what's included",
  cta: { label: 'Discuss this service', href: '#contact' },
  items: [
    {
      step: 'Plan',
      title: 'Cloud strategy, architecture & migration',
      body: 'Define what should move, what should stay and how to get there. Build a phased plan around workload needs, dependencies, cost and operational continuity.',
      tags: ['Readiness', 'Architecture', 'Migration'],
      more: '',
      includes: [
        'Cloud and workload readiness assessment',
        'Target architecture and dependency mapping',
        'Migration sequencing and validation plan',
        'Cost, capacity and recovery requirements',
      ],
      mark: 'research' as ServiceMark,
      tone: 'sky' as Tone,
    },
    {
      step: 'Connect',
      title: 'Data engineering & platform modernization',
      body: 'Bring information from different systems into a structure people and applications can use. Make the flows, definitions and quality checks explicit.',
      tags: ['Pipelines', 'Models', 'Integration'],
      more: '',
      includes: [
        'Source integration and data pipelines',
        'Warehouse or lakehouse design',
        'Data modeling and transformation',
        'Quality checks, lineage and pipeline monitoring',
      ],
      mark: 'interface' as ServiceMark,
      tone: 'citrus' as Tone,
    },
    {
      step: 'Build',
      title: 'Cloud-native applications & platforms',
      body: 'Design services for the way they need to run and evolve. Choose deployment and scaling patterns that fit the workload and your team’s ability to operate it.',
      tags: ['Services', 'Deployment', 'Resilience'],
      more: '',
      includes: [
        'Application architecture and modernization',
        'Container or serverless implementation',
        'Automated environment and release setup',
        'Performance, resilience and observability',
      ],
      mark: 'journey' as ServiceMark,
      tone: 'blossom' as Tone,
    },
    {
      step: 'Understand',
      title: 'Analytics & business intelligence',
      body: 'Turn connected data into a clearer view of the business. Build reporting around agreed questions, consistent measures and the decisions people need to make.',
      tags: ['Definitions', 'Dashboards', 'Decisions'],
      more: '',
      includes: [
        'Business questions and KPI definitions',
        'Data models for reporting and analysis',
        'Dashboards and self-service reporting',
        'Analytics adoption and ownership guidance',
      ],
      mark: 'testing' as ServiceMark,
      tone: 'sun' as Tone,
    },
    {
      step: 'Govern',
      title: 'Cloud security & data governance',
      body: 'Define who can access what, how information is protected and how controls are reviewed. Fit the approach to your data, responsibilities and requirements.',
      tags: ['Identity', 'Policies', 'Accountability'],
      more: '',
      includes: [
        'Identity and access-control design',
        'Data classification and ownership',
        'Encryption, retention and control requirements',
        'Configuration review, monitoring and evidence',
      ],
      mark: 'data' as ServiceMark,
      tone: 'lilac' as Tone,
    },
    {
      step: 'Optimize',
      title: 'Cloud economics & ongoing optimization',
      body: 'Understand where spend comes from and what the business gets for it. Review resource use and operating patterns before making changes to cost or capacity.',
      tags: ['Usage', 'Cost', 'Performance'],
      more: '',
      includes: [
        'Cost allocation and usage visibility',
        'Resource and workload optimization review',
        'Budget alerts and ownership routines',
        'Performance and cost review backlog',
      ],
      mark: 'brand' as ServiceMark,
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 4b · Where the foundation makes a difference ─────────────────────────── */

export const industries = {
  eyebrow: 'Where the foundation makes a difference',
  line1: 'Different businesses.',
  line2: 'Connected possibilities.',
  items: [
    {
      sector: 'Property & Living',
      title: 'A clearer operational picture.',
      body: 'Connect resident services, property workflows, and reporting across locations.',
      tone: 'sky' as Tone,
    },
    {
      sector: 'Manufacturing & Distribution',
      title: 'Information that travels with the work.',
      body: 'Connect pricing, enterprise applications, and data access across business systems.',
      tone: 'citrus' as Tone,
    },
    {
      sector: 'Multi location businesses',
      title: 'One view across customer signals.',
      body: 'Bring feedback and operational information together for consistent analysis.',
      tone: 'blossom' as Tone,
    },
  ],
}

/* ── 5 · Business stages ──────────────────────────────────────────────────── */

export const stages = {
  chip: 'Where your business is now',
  line1: 'A foundation that fits',
  line2: 'your next stage.',
  accent: 'next stage.',
  lead: 'Build around your workload, your people and your priorities.',
  items: [
    {
      tab: 'Startups',
      flow: ['Start lean', 'Build clearly'],
      title: 'A practical foundation. Room to grow.',
      body: 'Choose an environment that supports the first product without unnecessary complexity. Establish essential access controls, backups, cost visibility and useful product data from the start.',
      services: ['Right-sized cloud setup', 'Core data flows', 'Early operating controls'],
      cta: { label: 'Discuss your foundation', href: 'https://umm.digital/contact/' },
      tone: 'sky' as Tone,
    },
    {
      tab: 'Scale-ups',
      flow: ['Connect', 'Standardise', 'Improve'],
      title: 'Bring your systems into the same picture.',
      body: 'As tools and teams multiply, strengthen the connections between them. Modernize data flows, agree reporting definitions and address cloud costs and performance bottlenecks.',
      services: ['Connected data sources', 'Consistent business reporting', 'Cost and capacity reviews'],
      cta: { label: 'Discuss your next stage', href: 'https://umm.digital/contact/' },
      tone: 'citrus' as Tone,
    },
    {
      tab: 'Enterprises',
      flow: ['Map', 'Modernize', 'Govern'],
      title: 'Move a complex estate with a considered plan.',
      body: 'Work across legacy systems, multiple environments and distributed ownership. Plan migration in stages, establish common controls and align the data platform with business priorities.',
      services: ['Hybrid and cloud architecture', 'Data ownership and governance', 'Phased modernization'],
      cta: { label: 'Discuss your transformation', href: 'https://umm.digital/contact/' },
      tone: 'blossom' as Tone,
    },
  ],
}

/* ── 6 · The thinking behind the infrastructure ───────────────────────────── */

export type ArchWorkflow = {
  id: 'provisioning' | 'migration' | 'operations'
  /** the tab under the board */
  label: string
  /** the pill in the intelligence layer */
  short: string
  eyebrow: string
  title: string
  body: string
  ai: string
  decision: string
  evidence: string[]
  outcome: string
}

export const architecture: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  board: {
    label: string
    eyebrow: string
    tag: string
    layerEyebrow: string
    layerTitle: string
    layerNote: string
    assist: string
    systemsLabel: string
    systems: { title: string; items: string }[]
    systemsLink: string
    platformLabel: string
    movement: string
    runtime: { title: string; body: string }
    data: { title: string; body: string }
    observe: { title: string; items: string }
    providers: string[]
    outcomesLink: string
    outcomesLabel: string
    outcomes: string[]
    loop: string
    oversightLabel: string
    oversight: string[]
    workflowsLabel: string
    aiLabel: string
    decisionLabel: string
    evidenceLabel: string
    outcomeLabel: string
    reset: string
    disclaimer: string
  }
  workflows: ArchWorkflow[]
  principles: { step: string; title: string; body: string }[]
} = {
  chip: 'The thinking behind the infrastructure',
  line1: 'Connected by design.',
  line2: 'Intelligent in operation.',
  accent: 'Intelligent in operation.',
  lead: 'See how your systems, cloud, and data work together—with AI built into delivery. See the decisions behind its design.',
  board: {
    label: 'The connected cloud and data architecture',
    eyebrow: 'The connected cloud & data architecture',
    tag: 'Human-led · AI-enabled',
    layerEyebrow: 'Intelligence layer',
    layerTitle: 'AI orchestration',
    layerNote: 'Shared context. Scoped tasks. Reviewed actions.',
    assist: 'Configuration, migration, and operational assistance',
    systemsLabel: 'Your existing systems',
    systems: [
      { title: 'Business applications', items: 'ERP · CRM · operational tools' },
      { title: 'Enterprise data', items: 'Databases · files · events' },
      { title: 'Engineering context', items: 'Repositories · policies · runbooks' },
    ],
    systemsLink: 'APIs and events',
    platformLabel: 'Connected platform',
    movement: 'Integration and data movement',
    runtime: { title: 'Cloud runtime', body: 'Compute, networking, containers, and services' },
    data: { title: 'Data platform', body: 'Pipelines, warehouses, and lakehouses' },
    observe: { title: 'Observability and FinOps', items: 'Health · performance · usage · cost' },
    providers: ['AWS', 'Microsoft Azure', 'Google Cloud'],
    outcomesLink: 'Connected experiences',
    outcomesLabel: 'What it enables',
    outcomes: ['Applications ready to evolve.', 'Trusted data. Clearer decisions.', 'Visible performance. Informed action.'],
    loop: 'Production signals return to the intelligence layer, informing the next change.',
    oversightLabel: 'Engineer oversight',
    oversight: ['Identity and access', 'Data governance', 'Approval gates', 'Audit and recovery'],
    workflowsLabel: 'Selectable workflow views',
    aiLabel: 'What AI supports',
    decisionLabel: 'Engineer decision',
    evidenceLabel: 'Evidence',
    outcomeLabel: 'Delivery outcome',
    reset: 'Reset architecture',
    disclaimer: 'Illustrative architecture. Components and automation boundaries are selected for each engagement.',
  },
  workflows: [
    {
      id: 'provisioning',
      label: 'Cloud provisioning',
      short: 'Provisioning',
      eyebrow: 'Provisioning path',
      title: 'From requirements to a ready environment.',
      body: 'Turn workload needs into a cloud configuration that can be reviewed, tested, and operated.',
      ai: 'Translate engineering context into draft infrastructure configuration, policy checks, and deployment plans.',
      decision: 'An authorized engineer approves the plan and its expected impact.',
      evidence: ['Configuration diff', 'Policy checks', 'Deployment plan', 'Environment health'],
      outcome: 'A reviewed and verified cloud environment',
    },
    {
      id: 'migration',
      label: 'Data migration',
      short: 'Data migration',
      eyebrow: 'Data migration path',
      title: 'Move the data. Preserve its meaning.',
      body: 'Connect source understanding, AI-assisted mapping, and reconciliation before the migration is accepted.',
      ai: 'Assist source profiling, schema mapping, transformation logic, and source-to-target reconciliation.',
      decision: 'Reconciliation criteria are met and the recovery approach is approved.',
      evidence: ['Mapping review', 'Reconciliation report', 'Exception log', 'Cutover checklist'],
      outcome: 'Validated data in the target environment',
    },
    {
      id: 'operations',
      label: 'Cloud operations',
      short: 'Operations',
      eyebrow: 'Operations feedback loop',
      title: 'Turn operational signals into informed action.',
      body: 'Connect monitoring, investigation, and approved remediation to keep the platform improving.',
      ai: 'Connect observability signals to investigation context, proposed remediation, and post-change verification.',
      decision: 'The proposed action has a named owner, defined scope, and recovery steps.',
      evidence: ['Alert context', 'Change record', 'Health checks', 'Usage and cost trends'],
      outcome: 'A verified response and a clearer improvement plan',
    },
  ],
  principles: [
    {
      step: 'Design the foundation',
      title: 'Fit the workload.',
      body: 'Choose architecture around dependencies, performance, recovery needs and the team that will operate it.',
    },
    {
      step: 'Make data useful',
      title: 'Keep the context.',
      body: 'Connect information with clear definitions, quality checks and a traceable path back to its source.',
    },
    {
      step: 'Operate with intent',
      title: 'Give ownership a place.',
      body: 'Build access, monitoring, cost review and operational responsibilities into the way the platform runs.',
    },
  ],
}

/* ── 6b · Platforms follow the requirement (the tools wheel) ──────────────── */

export const tools = {
  chip: 'Platforms follow the requirement',
  line1: 'The right environment.',
  line2: 'For the work it needs to do.',
  accent: 'needs to do.',
  lead: 'We assess your workloads, existing estate and team capability before choosing platforms and services. Architecture decisions should account for operation, cost and future change.',
  groups: [
    {
      label: 'CLOUD PLATFORMS',
      tone: 'sky' as Tone,
      items: ['AWS', 'Microsoft Azure', 'Google Cloud'],
    },
    {
      label: 'DATA ENGINEERING',
      tone: 'citrus' as Tone,
      items: ['Apache Spark', 'Airflow', 'Databricks', 'Snowflake'],
    },
    {
      label: 'ANALYTICS & REPORTING',
      tone: 'blossom' as Tone,
      items: ['Power BI', 'Tableau', 'Looker', 'Grafana'],
    },
    {
      label: 'PLATFORM OPERATIONS',
      tone: 'sun' as Tone,
      items: ['Terraform', 'Docker', 'Kubernetes', 'GitLab CI/CD'],
    },
  ],
}

/* ── 7 · How the work takes shape ─────────────────────────────────────────── */

export const process = {
  chip: 'How the work takes shape',
  line1: 'A considered move.',
  line2: 'A foundation that lasts.',
  accent: 'that lasts.',
  lead: 'Clear decisions before migration. Clear ownership after launch.',
  /** the axis mark where the platform is ready to run */
  ready: 'Ready to run',
  steps: [
    {
      title: 'Assess',
      body: 'Map workloads, sources, dependencies and the operating needs of your teams.',
      get: 'A shared view of the estate',
    },
    {
      title: 'Design',
      body: 'Agree architecture, data definitions, controls and migration priorities.',
      get: 'A practical delivery roadmap',
    },
    {
      title: 'Build & move',
      body: 'Implement the platform and migrate in tested, manageable stages.',
      get: 'Validated workloads and flows',
    },
    {
      title: 'Connect & verify',
      body: 'Reconcile data, test access and recovery, and confirm reporting definitions.',
      get: 'Evidence for operational readiness',
    },
    {
      title: 'Run & improve',
      body: 'Review reliability, quality and cost with named owners and a clear backlog.',
      get: 'An ongoing improvement rhythm',
    },
  ],
}

/* ── 7b · Start with the priority in front of you ─────────────────────────── */

export const engagement: {
  title: string
  href: string
  items: { title: string; body: string; tone: Tone }[]
} = {
  title: 'Start with the priority in front of you.',
  href: 'https://umm.digital/contact/',
  items: [
    {
      title: 'Assessment & strategy',
      body: 'Understand the current estate and define a practical next step.',
      tone: 'sky' as Tone,
    },
    {
      title: 'Migration & modernization',
      body: 'Deliver a defined cloud, application or data-platform initiative.',
      tone: 'citrus' as Tone,
    },
    {
      title: 'Cloud & data partnership',
      body: 'Add ongoing engineering and platform support alongside your team.',
      tone: 'blossom' as Tone,
    },
    {
      title: 'Cost & performance review',
      body: 'Focus on usage, reliability and a prioritized optimization plan.',
      tone: 'sun' as Tone,
    },
  ],
}

/* ── 8 · Contact and common questions ─────────────────────────────────────── */

export const faq = [
  {
    question: 'Where should we begin?',
    answer:
      'Start with the workload, data or business decision that needs attention. We assess the current environment and agree priorities, responsibilities and an appropriate scope before recommending a wider program.',
  },
  {
    question: 'Will migration interrupt our operations?',
    answer:
      'The migration plan depends on your systems and tolerance for interruption. We assess dependencies, test the move and agree cutover, validation and recovery procedures. Any required maintenance window is planned with your team.',
  },
  {
    question: 'Can cloud and on-premises systems work together?',
    answer:
      'Yes. We can design connections across existing environments, with attention to identity, network access, data movement and operating responsibilities. The architecture follows your requirements rather than assuming everything must move at once.',
  },
  {
    question: 'How do you approach security and governance?',
    answer:
      'We assess data sensitivity, access needs and applicable requirements, then define controls, ownership and review routines. Security and compliance obligations are evaluated for the specific project and operating environment.',
  },
  {
    question: 'Can you help us understand our cloud costs?',
    answer:
      'Yes. We review usage, allocation and workload patterns to identify areas for investigation and optimization. Recommendations consider performance and reliability alongside cost; savings depend on the starting point and agreed changes.',
  },
  {
    question: 'What happens after the platform is live?',
    answer:
      'We agree the support model before handover. This may include monitoring, pipeline maintenance, quality checks, cost reviews and improvements, with named owners and an agreed response process.',
  },
  {
    question: 'How do you use AI in cloud and data delivery?',
    answer:
      'AI assists tasks such as configuration drafting, schema mapping, validation, and operational investigation. Engineers set requirements, review outputs, and approve consequential changes. Automation is scoped to your environment, with clear access controls and verification steps.',
  },
]

export const closing = {
  eyebrow: 'Your next cloud and data priority',
  lines: ['A clearer view.', 'A stronger foundation.'],
  /** the last line, set in the chip, as the hero's is */
  accent: 'Let’s build it.',
  lead: 'Tell us what needs to move, what needs to connect or which questions your data cannot answer yet. We will help define the next practical step.',
  primaryCta: { label: 'Discuss your cloud & data priorities', href: 'https://umm.digital/contact/' },
  faqLabel: 'A few things you may want to know',
}
