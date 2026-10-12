import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import type { ServiceMark } from '@/content/cxUiDesign'

/* ============================================================================
   AI AND AUTOMATION — PAGE CONTENT

   Word for word from Krish's AI & Automation content deck, 12 Oct 2026.
   Visual reference: https://umm-ai-automation.ai-umm.chatgpt.site

   Exports marked MIRROR have the same keys and value types as the matching
   export in cxUiDesign.ts, because the AI page reuses the CX section
   components. The type checks at the bottom fail compilation if they drift.
   ========================================================================== */

export const meta = {
  service: 'AI & Automation',
  title: 'AI & Automation | UMM',
  locations: 'Dallas · London · Dubai · Nairobi · Shenzhen',
  contactEmail: 'ping@umm.digital',
}

export const nav = [
  { id: 'applications', label: 'Applications' },
  { id: 'services', label: 'Services' },
  { id: 'stages', label: 'Your stage' },
  { id: 'workflow', label: 'How AI works' },
  { id: 'process', label: 'Our process' },
]

/* ── 1 · Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: 'AI & Automation',
  /* three fixed lines; the third is the accent, which carries the chip
     treatment (tail is anything after the chip on that line) */
  lines: ['Put intelligence', 'to work.'],
  accent: 'Move business forward.',
  tail: '',
  lead: 'Turn manual processes, scattered knowledge and complex decisions into practical AI applications. UMM helps you identify the right use case, build the solution and connect it to the way your business works.',
  primaryCta: 'Discuss your AI use case',
  secondaryCta: 'See how it works',
}

export const ribbon = ['AI strategy', 'AI assistants', 'Workflow automation', 'Model operations']

/* ── 2 · Why it matters ───────────────────────────────────────────────────── */

export const why = {
  chip: 'Why AI needs a plan',
  line1: 'A capable model.',
  line2: 'A clear business purpose.',
  /** the word in the headline the stickers merge into */
  one: 'purpose.',
  /** The ten AI ideas, as stickers that fly together into "purpose".
   *  x/y place each on the stage (%), r is its tilt. */
  teams: [
    { name: 'Chatbots', x: 12, y: 18, r: -8, tone: 'citrus' as Tone },
    { name: 'Forecasting', x: 35, y: 10, r: 6, tone: 'blossom' as Tone },
    { name: 'Agents', x: 62, y: 20, r: -5, tone: 'sky' as Tone },
    { name: 'Copilots', x: 87, y: 13, r: 11, tone: 'sun' as Tone },
    { name: 'Document AI', x: 21, y: 48, r: 7, tone: 'coral' as Tone },
    { name: 'Search', x: 79, y: 47, r: -9, tone: 'citrus' as Tone },
    { name: 'Automation', x: 50, y: 56, r: 4, tone: 'sky' as Tone },
    { name: 'Vision', x: 9, y: 80, r: -6, tone: 'sun' as Tone },
    { name: 'Fine-tuning', x: 60, y: 84, r: 8, tone: 'blossom' as Tone },
    { name: 'Analytics', x: 88, y: 78, r: -10, tone: 'coral' as Tone },
  ],
  lead: 'Useful AI starts with the work that needs to change. The model, data and technology follow from that decision.',
  /** numbered 01–03 on the page */
  pairs: [
    {
      title: 'Start with a specific task.',
      body: 'Find the repetitive work, delayed decisions or information gaps that matter to your team. Set a baseline before you build.',
      shape: 'star-11' as ShapeName,
      tone: 'sun' as Tone,
    },
    {
      title: 'Connect the right context.',
      body: 'Bring together the relevant knowledge, data and system access, with explicit permissions and clear ownership.',
      shape: 'flower-1' as ShapeName,
      tone: 'lilac' as Tone,
    },
    {
      title: 'Make adoption part of delivery.',
      body: 'Design for the people doing the work. Agree how outputs are checked, exceptions are handled and improvements are measured.',
      shape: 'moon-11' as ShapeName,
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 3 · AI in practice (new section) ─────────────────────────────────────── */

export type AppDemo = {
  question?: string // assistant
  source?: string // assistant
  checks?: { label: string; value: string }[] // document
  note?: string // document
  lines?: string[] // decision
}

export type AppItem = {
  kind: 'assistant' | 'document' | 'decision'
  label: string
  area: string
  tag: string
  title: string
  /** the words of the title that become the chip in the film */
  chip: string
  body: string
  link: { label: string; href: string }
  tone: Tone
  demo: AppDemo
}

export const applications: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  items: AppItem[]
} = {
  chip: 'AI in practice',
  line1: 'Start with the work',
  line2: 'you want to improve.',
  accent: 'improve.',
  lead: 'Illustrative applications. Scoped around your data and systems.',
  items: [
    {
      kind: 'assistant',
      label: 'Knowledge assistant',
      area: 'Customer & employee support',
      tag: 'Illustrative use case',
      title: 'Answers grounded in your knowledge.',
      chip: 'your knowledge.',
      body: 'An assistant that retrieves approved information, shows its sources and routes unanswered questions to the right person.',
      link: { label: 'Explore AI assistants', href: '#services' },
      tone: 'blossom' as Tone,
      demo: { question: 'What is the returns policy?', source: 'Approved policy · Source attached' },
    },
    {
      kind: 'document',
      label: 'Document workflow',
      area: 'Finance & operations',
      tag: 'Illustrative use case',
      title: 'Less handling between systems.',
      chip: 'between systems.',
      body: 'Extract document details, validate them against business records and prepare the next action, with exceptions flagged for review.',
      link: { label: 'Try the workflow example', href: '#workflow' },
      tone: 'sky' as Tone,
      demo: {
        checks: [
          { label: 'Supplier', value: 'Matched' },
          { label: 'Reference', value: 'Found' },
          { label: 'Amount', value: 'Checked' },
        ],
        note: 'Human review for exceptions',
      },
    },
    {
      kind: 'decision',
      label: 'Decision support',
      area: 'Planning & performance',
      tag: 'Illustrative use case',
      title: 'See the signals that need attention.',
      chip: 'need attention.',
      body: 'Use forecasting and anomaly detection to help teams prioritise investigation, plan resources and make informed decisions.',
      link: { label: 'Explore AI development', href: '#services' },
      tone: 'citrus' as Tone,
      demo: { lines: ['A signal to investigate.', 'A decision your team owns.'] },
    },
  ],
}

/* ── 4 · What we do ───────────────────────────────────────────────────────── */

export const services = {
  chip: 'What we can help you do',
  line1: 'The right expertise.',
  line2: 'From idea to operation.',
  accent: 'idea to operation.',
  lead: 'Strategy, engineering and ongoing support. A defined scope for each engagement.',
  /** Under the list on every card's back. */
  scope: 'We agree the deliverables, responsibilities and measures around your use case.',
  includesLabel: 'What the work can include',
  hint: "See what's included",
  cta: { label: 'Discuss this service', href: '#contact' },
  items: [
    {
      step: 'Find the right start',
      title: 'AI strategy & advisory',
      body: 'Decide where AI belongs in your business, which opportunities are worth testing and what you need to deliver them.',
      tags: ['Assessment', 'Roadmap', 'Governance'],
      more: '',
      includes: [
        'AI opportunity and readiness assessment',
        'Prioritised use cases and success measures',
        'Build versus buy guidance',
        'A delivery roadmap and governance baseline',
      ],
      mark: 'research' as ServiceMark,
      tone: 'sun' as Tone,
    },
    {
      step: 'Support your people',
      title: 'Conversational AI & agents',
      body: 'Help customers and employees find answers and complete tasks, using your knowledge with clear limits and human escalation.',
      tags: ['Assistants', 'Knowledge', 'Actions'],
      more: '',
      includes: [
        'Assistant and agent architecture',
        'Knowledge retrieval and response evaluation',
        'Tool connections and permission boundaries',
        'Escalation paths and channel integration',
      ],
      mark: 'interface' as ServiceMark,
      tone: 'sky' as Tone,
    },
    {
      step: 'Connect the work',
      title: 'Intelligent workflow automation',
      body: 'Reduce repetitive handling across documents, approvals and system handovers. Use AI where interpretation adds value.',
      tags: ['Workflows', 'Documents', 'Integration'],
      more: '',
      includes: [
        'Current and future process maps',
        'Document extraction and validation workflows',
        'RPA or API-based automation',
        'Exception handling and approval rules',
      ],
      mark: 'journey' as ServiceMark,
      tone: 'blossom' as Tone,
    },
    {
      step: 'Prove the idea',
      title: 'AI prototypes & product development',
      body: 'Test feasibility with a focused prototype, then build the product or feature around evidence from real tasks and users.',
      tags: ['Proof of value', 'MVP', 'Product'],
      more: '',
      includes: [
        'A scoped proof of concept or MVP',
        'Representative test cases and benchmarks',
        'User feedback and feasibility findings',
        'A plan for production development',
      ],
      mark: 'testing' as ServiceMark,
      tone: 'citrus' as Tone,
    },
    {
      step: 'Work with your systems',
      title: 'AI integration & modernisation',
      body: 'Connect AI to the platforms your teams already use, with agreed data access, release plans and operational ownership.',
      tags: ['APIs', 'Platforms', 'Deployment'],
      more: '',
      includes: [
        'Data and integration architecture',
        'API and model connectors',
        'Access controls and continuity planning',
        'Phased deployment and handover',
      ],
      mark: 'data' as ServiceMark,
      tone: 'lilac' as Tone,
    },
    {
      step: 'Keep it performing',
      title: 'Model engineering & MLOps',
      body: 'Evaluate, tune and operate models as data and needs change. Make quality, cost and reliability visible to the people responsible.',
      tags: ['Evaluation', 'Monitoring', 'Refinement'],
      more: '',
      includes: [
        'Model selection, tuning and evaluation',
        'Versioning and deployment pipelines',
        'Quality, latency and cost monitoring',
        'Retraining and incident response plans',
      ],
      mark: 'brand' as ServiceMark,
      tone: 'coral' as Tone,
    },
  ],
  closing: {
    question: 'Not sure which opportunity deserves investment first?',
    link: 'Start with an AI assessment',
    href: '#contact',
  },
}

/* ── 5 · Built for where you are ──────────────────────────────────────────── */

export const stages = {
  chip: 'Where your business is now',
  line1: 'Different stages.',
  line2: 'Different AI priorities.',
  accent: 'AI priorities.',
  lead: 'A focused starting point. A foundation for what follows.',
  items: [
    {
      tab: 'Startups',
      flow: ['Test', 'Validate', 'Build'],
      title: 'Prove the use case before you scale the investment.',
      body: 'Start with one problem and a focused prototype. We help you test technical feasibility, understand the data requirements and decide what is ready to become part of your product.',
      services: ['Use case definition', 'Proof of concept or MVP', 'A practical build plan'],
      cta: { label: 'Discuss your AI idea', href: 'https://umm.digital/contact/' },
      tone: 'sun' as Tone,
    },
    {
      tab: 'Scale-ups',
      flow: ['Connect', 'Standardise', 'Expand'],
      title: 'Give growing teams more room to deliver.',
      body: 'As volumes rise, manual handovers become harder to manage. We help you standardise repeatable workflows, connect existing tools and introduce AI where it can reduce operational effort.',
      services: ['Workflow automation', 'Connected knowledge', 'Repeatable delivery'],
      cta: { label: 'Discuss your automation priorities', href: 'https://umm.digital/contact/' },
      tone: 'blossom' as Tone,
    },
    {
      tab: 'Enterprises',
      flow: ['Govern', 'Integrate', 'Operate'],
      title: 'Bring AI into operations with clear accountability.',
      body: 'Work across complex systems with agreed access, evaluation and governance. We help your teams move from isolated initiatives to AI applications with defined owners and ongoing oversight.',
      services: ['Systems integration', 'Governance and evaluation', 'Managed model operations'],
      cta: { label: 'Discuss your AI programme', href: 'https://umm.digital/contact/' },
      tone: 'sky' as Tone,
    },
  ],
}

/* ── 6 · How AI works (new section) ───────────────────────────────────────── */

export type WorkflowStep = { title: string; body: string; state: 'done' | 'flag' | 'hold' }

export type WorkflowScenario = {
  id: 'complete' | 'missing' | 'mismatch'
  label: string
  po: string
  amount: string
  /** which invoice field the checks flag, if any */
  flag?: 'po' | 'amount'
  steps: WorkflowStep[]
  outcome: 'ready' | 'hold'
  status: string
  note: string
}

export const workflow: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  demo: {
    label: string
    title: string
    tag: string
    doc: string
    supplier: string
    supplierNote: string
    invoiceNo: string
    poValue: string
    fields: { invoice: string; po: string; amount: string; poValue: string }
    flow: string
    scenariosLabel: string
  }
  scenarios: WorkflowScenario[]
  roles: string[]
  principles: { title: [string, string]; body: string; icon: 'data' | 'check' | 'pulse' }[]
} = {
  chip: 'Inside a working AI workflow',
  line1: 'Intelligence takes a step.',
  line2: 'Your rules set the limits.',
  accent: 'set the limits.',
  lead: 'Follow an invoice from arrival to review. Change the scenario to see why the route changes.',
  demo: {
    label: 'Interactive invoice workflow',
    title: 'Invoice processing',
    tag: 'Illustrative demo · No live data',
    doc: 'Invoice',
    supplier: 'Northline Supplies',
    supplierNote: 'Fictional supplier',
    invoiceNo: 'INV-2048',
    poValue: '$24,000',
    fields: {
      invoice: 'Invoice number',
      po: 'Purchase order',
      amount: 'Invoice amount',
      poValue: 'Purchase order value',
    },
    flow: 'Input document → Business records',
    scenariosLabel: 'Scenario',
  },
  scenarios: [
    {
      id: 'complete',
      label: 'Complete invoice',
      po: 'PO-1042',
      amount: '$24,000',
      steps: [
        {
          title: 'Read the document',
          body: 'Extract the supplier, reference and amount.',
          state: 'done',
        },
        {
          title: 'Check against your records',
          body: 'Supplier and purchase order match. Amounts agree.',
          state: 'done',
        },
        {
          title: 'Prepare for approval',
          body: 'The checks pass. Route to the designated approver.',
          state: 'done',
        },
      ],
      outcome: 'ready',
      status: 'Ready for human approval',
      note: 'A prepared record, with the original document and validation trail attached.',
    },
    {
      id: 'missing',
      label: 'Missing reference',
      po: 'Not provided',
      amount: '$24,000',
      flag: 'po',
      steps: [
        {
          title: 'Read the document',
          body: 'Extract the supplier, reference and amount.',
          state: 'done',
        },
        {
          title: 'Check against your records',
          body: 'The purchase order reference is missing. A record match cannot be confirmed.',
          state: 'flag',
        },
        {
          title: 'Request the missing information',
          body: 'Pause the workflow and assign the exception to the finance team.',
          state: 'hold',
        },
      ],
      outcome: 'hold',
      status: 'On hold · Reference required',
      note: 'No downstream action is taken. A reviewer requests the purchase order reference before the invoice can proceed.',
    },
    {
      id: 'mismatch',
      label: 'Amount mismatch',
      po: 'PO-1042',
      amount: '$28,000',
      flag: 'amount',
      steps: [
        {
          title: 'Read the document',
          body: 'Extract the supplier, reference and amount.',
          state: 'done',
        },
        {
          title: 'Check against your records',
          body: 'The supplier and order match, but the invoice exceeds the purchase order by $4,000.',
          state: 'flag',
        },
        {
          title: 'Route the discrepancy for review',
          body: 'Flag the amount difference for the designated finance reviewer.',
          state: 'hold',
        },
      ],
      outcome: 'hold',
      status: 'On hold · Amount mismatch',
      note: 'The original invoice and matched purchase order are attached for review. The workflow does not authorise payment.',
    },
  ],
  roles: ['AI extracts and interprets.', 'Rules validate and route.', 'People approve exceptions and payments.'],
  principles: [
    {
      title: ['Relevant data.', 'Defined access.'],
      body: 'Use the records the task needs, with permissions agreed before systems connect.',
      icon: 'data',
    },
    {
      title: ['Explicit checks.', 'Visible exceptions.'],
      body: 'Agree what can proceed, what must stop and who reviews uncertain or incomplete results.',
      icon: 'check',
    },
    {
      title: ['Measured quality.', 'Ongoing ownership.'],
      body: 'Track errors, processing time and cost, then use the findings to refine the workflow.',
      icon: 'pulse',
    },
  ],
}

/* ── 7 · Built for your environment ───────────────────────────────────────── */

/* The CX tools export has a `note`; this page does not carry one. */
export const tools = {
  chip: 'Built for your environment',
  line1: 'Choose the technology',
  line2: 'around the task.',
  accent: 'the task.',
  lead: 'Model quality is one part of the decision. We also assess data access, deployment constraints, integration effort and operating cost before recommending an approach.',
  groups: [
    {
      label: 'Models and AI frameworks',
      tone: 'sun' as Tone,
      items: ['Model selection', 'Custom model tuning', 'PyTorch', 'scikit-learn'],
    },
    {
      label: 'Knowledge and retrieval',
      tone: 'sky' as Tone,
      items: ['Document retrieval', 'Source attribution', 'Vector search', 'Permission-aware access'],
    },
    {
      label: 'Workflow integration',
      tone: 'blossom' as Tone,
      items: ['APIs and connectors', 'Business rules', 'RPA workflows', 'Approval routing'],
    },
    {
      label: 'Evaluation and operations',
      tone: 'citrus' as Tone,
      items: ['Evaluation datasets', 'Model versioning', 'Quality monitoring', 'Cost and latency review'],
    },
  ],
}

/* ── 8 · How we work + let's talk ─────────────────────────────────────────── */

export const process = {
  chip: 'How the work takes shape',
  line1: 'From a defined problem',
  line2: 'to working AI.',
  accent: 'working AI.',
  lead: 'Clear decisions at each stage. Evidence before expansion.',
  /** the axis mark where the build is ready to deploy */
  ready: 'Ready to deploy',
  steps: [
    {
      title: 'Frame',
      body: 'Agree the business problem, baseline, owners and conditions for success.',
      get: 'A defined use case',
    },
    {
      title: 'Prepare',
      body: 'Assess data quality, access, system constraints and relevant risks.',
      get: 'A feasible delivery plan',
    },
    {
      title: 'Build',
      body: 'Develop and evaluate the solution against representative tasks and failure cases.',
      get: 'A tested solution',
    },
    {
      title: 'Deploy',
      body: 'Integrate in stages, train the team and agree handover and continuity plans.',
      get: 'A controlled release',
    },
    {
      title: 'Improve',
      body: 'Monitor quality and cost, review exceptions and refine as needs change.',
      get: 'An ongoing improvement plan',
    },
  ],
}

/* ── 9 · Choose a starting point (new section) ────────────────────────────── */

export const engagement: {
  title: string
  href: string
  items: { title: string; body: string; tone: Tone }[]
} = {
  title: 'Choose the right starting point.',
  href: 'https://umm.digital/contact/',
  items: [
    {
      title: 'AI assessment',
      body: 'Clarify opportunities, readiness and investment priorities.',
      tone: 'sun' as Tone,
    },
    {
      title: 'Proof of value',
      body: 'Test one use case before committing to a wider build.',
      tone: 'sky' as Tone,
    },
    {
      title: 'Build and integration',
      body: 'Deliver an agreed solution into your operating environment.',
      tone: 'blossom' as Tone,
    },
    {
      title: 'Ongoing AI support',
      body: 'Keep models and workflows monitored, maintained and improving.',
      tone: 'citrus' as Tone,
    },
  ],
}

export const faq = [
  {
    question: 'Where should we start if we have several AI ideas?',
    answer:
      'Start with a focused assessment of business value, data readiness, delivery effort and risk. Together we can prioritise one use case and agree how to judge its value.',
  },
  {
    question: 'Do we need to have our data ready?',
    answer:
      'You do not need a finished data platform to begin the conversation. We assess what is available, what is usable and what preparation is needed before committing to a build.',
  },
  {
    question: 'Can you integrate with our existing tools?',
    answer:
      'We assess your APIs, permissions and technical constraints, then agree the integration approach. Some systems may need additional preparation or changes before they can support the workflow.',
  },
  {
    question: 'How are sensitive data and AI errors handled?',
    answer:
      'We agree access controls, data handling requirements, evaluation checks and review responsibilities for the use case. Human escalation and fallback routes are designed around the consequences of an incorrect result.',
  },
  {
    question: 'Can we start small and expand later?',
    answer:
      'Yes. A proof of value can test one task with a defined scope. Its results inform whether to refine, stop or expand into production.',
  },
  {
    question: 'How will we measure whether it works?',
    answer:
      'We establish a baseline and agree measures such as task accuracy, exception rates, processing time, adoption and operating cost. Financial return is assessed against the full cost of delivery and operation.',
  },
]

/* ── 10 · Closing ─────────────────────────────────────────────────────────── */

/* The email tile was dropped here, as on the CX page (8 Oct). */
export const closing = {
  eyebrow: 'Your next AI opportunity',
  lines: ['A process to simplify.', 'A possibility to test.'],
  /** the last line, set in the chip, as the hero's is */
  accent: 'Let’s make it work.',
  lead: 'Tell us where work slows down, what your team needs and which systems are involved. We will help you identify a useful starting point and the evidence needed to move forward.',
  primaryCta: { label: 'Discuss your AI use case', href: 'https://umm.digital/contact/' },
  faqLabel: 'A few things you may want to know',
}
