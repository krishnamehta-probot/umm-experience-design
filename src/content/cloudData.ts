import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import type { ServiceMark } from '@/content/cxUiDesign'

/* ============================================================================
   CLOUD AND DATA — PAGE CONTENT

   Word for word from Krish's Cloud & Data content doc, 15 Oct 2026:
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
  lines: ['A stronger cloud.', 'A clearer picture.'],
  accent: 'A better next move.',
  tail: '',
  lead: 'Your infrastructure should support the way you work. Your data should help you decide what comes next. UMM connects cloud architecture, data engineering and analytics so your business can move forward with a clearer view of performance, cost and control.',
  primaryCta: 'Discuss your cloud & data priorities',
  secondaryCta: 'See what happens underneath',
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

/* ── 6 · The thinking behind the infrastructure (new section) ─────────────── */

export type ArchNode = { place: string; title: string; body: string }
export type ArchView = {
  nodes: [ArchNode, ArchNode, ArchNode]
  means: string
  decision: string
  checks: string[]
}
export type ArchScenario = {
  id: 'freshness' | 'demand' | 'economics'
  label: string
  title: string
  prompt: string
  challenge: ArchView
  response: ArchView
}

export const architecture: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  demo: {
    label: string
    eyebrow: string
    tag: string
    scenariosLabel: string
    viewsLabel: string
    views: { challenge: string; response: string }
    meansLabel: string
    decisionLabel: string
    checksLabel: string
    reset: string
    disclaimer: string
  }
  scenarios: ArchScenario[]
  principles: { step: string; title: string; body: string }[]
} = {
  chip: 'The thinking behind the infrastructure',
  line1: 'What happens underneath',
  line2: 'changes what happens next.',
  accent: 'happens next.',
  lead: 'Follow the system. See the decisions behind its design.',
  demo: {
    label: 'Interactive architecture examples',
    eyebrow: 'From foundation to decision',
    tag: 'Interactive architecture example',
    scenariosLabel: 'Scenario',
    viewsLabel: 'Compare',
    views: { challenge: 'The challenge', response: 'The designed response' },
    meansLabel: 'What this means',
    decisionLabel: 'The design decision',
    checksLabel: 'What we would check',
    reset: 'Reset example',
    disclaimer:
      'Illustrative scenarios, not a live monitoring system. Cost examples use USD. Allocation alone does not reduce spend.',
  },
  scenarios: [
    {
      id: 'freshness',
      label: 'Data freshness',
      title: 'The dashboard looks current. Is the data?',
      prompt: 'A source feed has stopped refreshing. Follow the path from the source to the decision.',
      challenge: {
        nodes: [
          { place: 'Source system', title: 'Feed delayed', body: 'A scheduled update did not arrive.' },
          { place: 'Data platform', title: 'Last run completed', body: 'The pipeline finished using an older extract.' },
          { place: 'Business view', title: 'Freshness unclear', body: 'The report does not make the source age visible.' },
        ],
        means:
          'A successful job is not the whole story. A current-looking dashboard can still contain older information.',
        decision: 'Check the age of the source data as well as the pipeline run.',
        checks: ['Source timestamp', 'Refresh history', 'Report lineage'],
      },
      response: {
        nodes: [
          { place: 'Source system', title: 'Freshness check', body: 'Compare arrival time with the agreed update window.' },
          { place: 'Data platform', title: 'Quality gate', body: 'Flag the delayed feed and notify its named owner.' },
          { place: 'Business view', title: 'Context visible', body: 'Show the latest available timestamp with the report.' },
        ],
        means:
          'Make the limits of the data visible. Teams can distinguish a current report from one waiting on a delayed source.',
        decision: 'Define freshness expectations, escalation routes and how stale data is presented.',
        checks: ['Freshness rule', 'Alert owner', 'Visible refresh time'],
      },
    },
    {
      id: 'demand',
      label: 'Demand & resilience',
      title: 'Demand changes. Can the platform respond?',
      prompt:
        'An application receives a sudden increase in requests. Trace the decisions that support a controlled response.',
      challenge: {
        nodes: [
          { place: 'Application', title: 'Requests increase', body: 'Incoming work exceeds the usual pattern.' },
          { place: 'Cloud platform', title: 'Capacity pressure', body: 'A fixed allocation reaches its operating limit.' },
          { place: 'Operations', title: 'Response unclear', body: 'No agreed scaling boundary or recovery trigger.' },
        ],
        means:
          'Capacity needs an operating plan. A traffic spike can expose dependencies beyond the application itself.',
        decision: 'Understand bottlenecks, workload behavior and acceptable service limits.',
        checks: ['Request volume', 'Latency', 'Dependency health'],
      },
      response: {
        nodes: [
          { place: 'Application', title: 'Demand measured', body: 'Observe traffic, response time and error signals.' },
          {
            place: 'Cloud platform',
            title: 'Bounded scaling',
            body: 'Apply tested capacity rules and queue work where appropriate.',
          },
          { place: 'Operations', title: 'Owners ready', body: 'Use alerts, runbooks and recovery procedures.' },
        ],
        means:
          'Plan the response before the spike. The team has a defined way to scale, investigate and recover within agreed limits.',
        decision: 'Validate scaling behavior alongside database, network and service dependencies.',
        checks: ['Load-test results', 'Scaling limits', 'Recovery runbook'],
      },
    },
    {
      id: 'economics',
      label: 'Cloud economics',
      title: 'The bill is rising. What is driving it?',
      prompt:
        'A fictional monthly cloud bill totals $1,200. The useful question is which workloads account for it and who can act.',
      challenge: {
        nodes: [
          { place: 'Monthly spend', title: '$1,200 total', body: 'An illustrative bill with limited workload context.' },
          { place: 'Allocation', title: '$240 unassigned', body: 'Part of the spend has no mapped business owner.' },
          { place: 'Business view', title: 'Value unclear', body: 'Spend is visible, but responsibility is not.' },
        ],
        means: 'A total does not explain the cost. Unassigned spend makes it harder to decide what to investigate.',
        decision: 'Connect usage and cost to workloads and accountable owners.',
        checks: ['Billing export', 'Resource inventory', 'Ownership tags'],
      },
      response: {
        nodes: [
          { place: 'Monthly spend', title: '$1,200 total', body: 'The example bill stays the same after allocation.' },
          {
            place: 'Allocation',
            title: '$960 + $240',
            body: 'Existing workloads plus the newly assigned resource group.',
          },
          { place: 'Business view', title: 'Review assigned', body: 'The $240 group now has an owner and a review action.' },
        ],
        means:
          'Visibility comes before optimization. The team can investigate the resource group with its operational context intact.',
        decision: 'Review utilization and dependencies before making cost or capacity changes.',
        checks: ['Allocation coverage', 'Usage pattern', 'Review backlog'],
      },
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
      label: 'Cloud platforms',
      tone: 'sky' as Tone,
      items: ['AWS', 'Microsoft Azure', 'Google Cloud'],
    },
    {
      label: 'Data engineering',
      tone: 'citrus' as Tone,
      items: ['Apache Spark', 'Airflow', 'Databricks', 'Snowflake'],
    },
    {
      label: 'Analytics and reporting',
      tone: 'blossom' as Tone,
      items: ['Power BI', 'Tableau', 'Looker', 'Grafana'],
    },
    {
      label: 'Platform operations',
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
