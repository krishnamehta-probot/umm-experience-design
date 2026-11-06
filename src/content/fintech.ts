/* ============================================================================
   FINTECH, BANKING & INSURANCE — PAGE CONTENT (the first industry page)

   Word for word from the live draft, which Krish fixed on 5 Nov 2026 as the
   final structure and the final content:
   https://umm-financial-services.ai-umm.chatgpt.site

   Ten sections, in the draft's order. Removed by Krish from the hero (2 Nov):
   the page navigation (Financial journeys ↘ …) and "The next chapter ↓".
   The site's own footer follows the page, as on the service pages.

   `art` names one of the small drawings in FinArt.tsx; `tone` one of the
   five brand pastels.
   ========================================================================== */

import type { Tone } from '@/components/primitives/tone'

const U = 'https://umm.digital'

export type FinArtName = 'people' | 'review' | 'shield' | 'search' | 'world' | 'payment'

export type SectionHead = {
  eyebrow: string
  /** the heading's two lines; the second is set quieter */
  lines: [string, string]
  intro: string
}

export const meta = {
  industry: 'Fintech, Banking & Insurance',
  title: 'Fintech, Banking & Insurance | UMM',
}

/* ── 01 · Hero ───────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: 'Fintech, Banking & Insurance',
  lines: ['Finance moves fast.', 'Can your operations', 'keep up?'],
  lead: 'Instant payments. Digital-first banking. Customers who expect answers now. The next chapter of finance depends on what happens behind every account, transaction, and conversation.',
  primary: { label: 'Let’s talk', href: `${U}/contact/` },
  secondary: { label: 'See relevant work', href: '#work' },
  strapline: 'From customer intent to financial outcome.',
  sectors: ['Banking', 'Payments', 'Insurance'],
}

/* ── 02 · The reality ────────────────────────────────────────────────────── */

export const reality = {
  id: 'reality',
  head: {
    eyebrow: 'The reality',
    lines: ['The pressure is connected.', 'The response should be too.'],
    intro:
      'Financial institutions must improve customer journeys while navigating legacy systems, manual operations, growing scrutiny, and the cost of change.',
  } satisfies SectionHead,
  cards: [
    {
      title: 'Fragmented customer journeys',
      body: 'An application starts online, moves to a branch, and returns to a service team. Disconnected records turn a single request into repeated work.',
      art: 'people',
      tone: 'sky',
    },
    {
      title: 'Time lost in operations',
      body: 'Risk, underwriting, and finance teams spend too much time collecting documents, reconciling records, and chasing exceptions.',
      art: 'review',
      tone: 'citrus',
    },
    {
      title: 'Growth with accountability',
      body: 'New products and higher transaction volumes require clearer access controls, traceable decisions, and resilient financial operations.',
      art: 'shield',
      tone: 'blossom',
    },
  ] satisfies { title: string; body: string; art: FinArtName; tone: Tone }[],
  view: {
    eyebrow: 'Our point of view',
    lines: ['Finance doesn’t need more tools.', 'It needs better systems.'],
    body: 'A new app, AI model, or portal only helps when it fits the work around it. We connect products, operations, and information so the customer journey and the team behind it can move together.',
  },
}

/* ── 03 · Financial journeys ─────────────────────────────────────────────── */

export const journeys = {
  id: 'journeys',
  head: {
    eyebrow: 'Financial journeys',
    lines: ['Where finance is going.', 'What needs to work.'],
    intro:
      'New banking models raise the bar for every interaction. Explore the journeys that connect customer expectations with day-to-day financial operations.',
  } satisfies SectionHead,
  items: [
    {
      id: 'neo',
      label: 'Neo-banking & integrated banking',
      title: 'One financial life. Fewer disconnected experiences.',
      body: 'Digital-first banking brings accounts, payments, cards, and support into a joined-up experience. The challenge is keeping the customer view aligned with the institutions and partners behind it.',
      points: [
        'Account and wallet journeys with a clear view of balances and activity.',
        'Connections between customer experiences, partner banks, payment providers, and core records.',
        'Consistent status and support across products, channels, and partners.',
      ],
      art: 'world',
      tone: 'sky',
    },
    {
      id: 'kyc',
      label: 'Onboarding & KYC',
      title: 'Turn an application into an active relationship.',
      body: 'Every repeated form, missing document, or unexplained delay adds friction before the relationship has begun. Onboarding needs to keep customers and review teams moving together.',
      points: [
        'Saved applications, identity capture, and clear document requirements.',
        'Verification results, risk-based review queues, and requests for missing information.',
        'Account activation, customer updates, and ongoing KYC refresh journeys.',
      ],
      art: 'people',
      tone: 'citrus',
    },
    {
      id: 'payments',
      label: 'Payments & remittance',
      title: 'Keep money movement and operational visibility connected.',
      body: 'Build payment, wallet, and remittance experiences that give customers clear status and operations teams the context to resolve exceptions.',
      points: [
        'Transfer initiation, beneficiary journeys, and payment status.',
        'Connections to payment providers, transaction records, and settlement files.',
        'Reconciliation workspaces, exception ownership, and partner administration.',
      ],
      art: 'payment',
      tone: 'sun',
    },
    {
      id: 'lending',
      label: 'Lending & risk',
      title: 'Bring the application, evidence, and review into one workflow.',
      body: 'Connect borrower journeys with the information and policy checks a lending team needs to assess an application.',
      points: [
        'Loan applications and supporting-document collection.',
        'Evidence preparation, policy checks, and specialist review queues.',
        'Decision records, customer updates, and servicing workflows.',
      ],
      art: 'review',
      tone: 'blossom',
    },
    {
      id: 'insurance',
      label: 'Insurance & claims',
      title: 'Connect policyholders, brokers, and claims teams.',
      body: 'Build insurance journeys around policy information, case progress, and the specialist decisions that keep each request moving.',
      points: [
        'Policy discovery, quotation journeys, and customer or broker portals.',
        'Claims notification, document intake, and case preparation.',
        'Handler workspaces, exceptions, and policyholder status updates.',
      ],
      art: 'search',
      tone: 'coral',
    },
    {
      id: 'fraud',
      label: 'Fraud & financial operations',
      title: 'Make suspicious activity easier to investigate.',
      body: 'Connect transaction signals and customer context to investigation workflows, with clear escalation and recorded reviewer actions.',
      points: [
        'Transaction monitoring and rule or model outputs.',
        'Alert prioritization, linked evidence, and investigation workspaces.',
        'Case escalation, reviewer decisions, and operational reporting.',
      ],
      art: 'shield',
      tone: 'sky',
    },
  ] satisfies {
    id: string
    label: string
    title: string
    body: string
    points: string[]
    art: FinArtName
    tone: Tone
  }[],
  view: {
    eyebrow: 'The connected view',
    body: 'A customer sees an account, a transfer, or a claim. Your teams need the records, responsibilities, and next steps that keep the promise behind it.',
  },
}

/* ── 04 · Beyond the transaction ─────────────────────────────────────────── */

export const operations = {
  id: 'operations',
  head: {
    eyebrow: 'Beyond the transaction',
    lines: ['Keep the relationship moving.', 'Keep the operation in view.'],
    intro:
      'Acquisition is only the beginning. Service, activation, and operational reliability determine whether a financial relationship grows.',
  } satisfies SectionHead,
  cards: [
    {
      eyebrow: 'Customer support',
      title: 'An answer with the whole story.',
      body: 'A failed transfer, a blocked account, or an unclear claim needs more than a ticket number. Give service teams the relevant case history and a route to the person who can resolve it.',
      points: [
        'Shared context across chat, contact centre, and specialist teams.',
        'Approved answers linked to account, payment, or policy information.',
        'Complaint ownership, escalation, and visible resolution status.',
      ],
      art: 'search',
      tone: 'sky',
    },
    {
      eyebrow: 'Revenue operations / RevOps',
      title: 'From application to lasting adoption.',
      body: 'Connect acquisition, onboarding, activation, and retention so teams can see where relationships stall—and which follow-up is useful.',
      points: [
        'Connect CRM activity with application and product milestones.',
        'Identify incomplete onboarding, unused accounts, and renewal drop-offs.',
        'Coordinate timely follow-ups using consent and customer preferences.',
      ],
      art: 'people',
      tone: 'citrus',
    },
    {
      eyebrow: 'AI operations / AI Ops',
      title: 'Intelligence needs an operating rhythm.',
      body: 'AI-assisted finance needs ongoing oversight. Make service signals, AI output quality, and exceptions visible to the teams responsible for keeping work moving.',
      points: [
        'Bring service alerts and workflow exceptions into a prioritised queue.',
        'Monitor output quality, latency, and review outcomes.',
        'Assign owners for incidents, fallback paths, and approved changes.',
      ],
      art: 'shield',
      tone: 'blossom',
    },
  ] satisfies {
    eyebrow: string
    title: string
    body: string
    points: string[]
    art: FinArtName
    tone: Tone
  }[],
}

/* ── 05 · How it connects ────────────────────────────────────────────────── */

export type SystemJourney = {
  id: string
  label: string
  summary: string
  ai: { title: string; body: string }
  change: [string, string, string]
  experiences: [string, string]
  workflows: [string, string, string]
  systems: [string, string, string]
  steps: [string, string, string, string]
  exception: string
  context: string
}

export const system = {
  id: 'connects',
  head: {
    eyebrow: 'How it connects',
    lines: ['See the system', 'behind the experience.'],
    intro:
      'Choose a financial journey to see the customer touchpoints, operational decisions, and connected records—with AI assistance and oversight across the flow.',
  } satisfies SectionHead,
  /* the labels that stay the same whichever journey is chosen */
  labels: {
    reference: 'Reference architecture',
    ai: ['AI assistance', 'across the workflow'],
    aiOps: 'AI operations / Monitor output quality and service health · Route exceptions · Keep review ownership clear',
    changeHead: 'How AI changes this journey',
    change: ['The friction', 'AI contribution', 'Potential industry impact'],
    rows: ['Experiences', 'Financial workflows', 'Connected systems'],
    down1: 'Requests & permitted context',
    up1: 'Progress & outcomes',
    spine: ['Identity & access', 'APIs & workflow coordination'],
    down2: 'Service requests',
    up2: 'Results & exceptions',
    exchange: 'Controlled exchange of records, status, and evidence',
    controls: 'Controls throughout',
    controlsList: 'Permissions · Audit records · Monitoring · Recovery',
    stepsHead: 'How the work moves',
    stepsTag: 'Illustrative workflow',
    exception: 'Exception path',
    context: 'Context that travels with the case',
    note: 'Reference architecture and workflow, adapted to each engagement. These diagrams illustrate proposed connections; they are not client system diagrams.',
  },
  journeys: [
    {
      id: 'onboarding',
      label: 'Account onboarding',
      summary:
        'An application becomes an account only when customer information, verification, and review stay connected.',
      ai: {
        title: 'Prepare the application',
        body: 'Extract document fields and flag missing evidence; an onboarding specialist reviews exceptions.',
      },
      change: ['Manual application preparation', 'Extract details and flag gaps', 'A clearer path to account activation'],
      experiences: ['Customer application', 'Onboarding workspace'],
      workflows: ['Application & document intake', 'Identity & verification checks', 'Review & account provisioning'],
      systems: ['Customer & document records', 'KYC provider', 'Core banking / account system'],
      steps: ['Customer submits application', 'Information is validated', 'Review outcome recorded', 'Account status returned'],
      exception:
        'Missing documents or a verification exception → request more information or send to an onboarding specialist.',
      context: 'Application details, identity evidence, verification results, and review history.',
    },
    {
      id: 'kyc',
      label: 'KYC & ongoing review',
      summary:
        'Verification continues beyond the first application. Keep customer records, evidence, and review responsibilities aligned as circumstances change.',
      ai: {
        title: 'Prepare the KYC review',
        body: 'Compare submitted details and organise check results; the responsible reviewer decides the outcome.',
      },
      change: ['Evidence scattered across checks', 'Organise findings for specialist review', 'More focused KYC reviews'],
      experiences: ['Customer document journey', 'KYC specialist workspace'],
      workflows: ['Evidence collection & refresh', 'Verification & screening results', 'Specialist review & follow-up'],
      systems: ['Customer & entity records', 'Identity / screening providers', 'Case records & account system'],
      steps: [
        'Review or refresh is triggered',
        'Evidence and checks collected',
        'Specialist resolves exceptions',
        'Outcome and next review recorded',
      ],
      exception:
        'A mismatch, expired document, or screening alert → specialist review with supporting evidence; no automatic clearance.',
      context: 'Evidence sources, check results, customer correspondence, and the recorded review rationale.',
    },
    {
      id: 'payment',
      label: 'Payment & remittance',
      summary:
        'The transfer journey needs a shared view of initiation, processing, settlement, and any exception requiring attention.',
      ai: {
        title: 'Explain the payment exception',
        body: 'Summarise provider events and unmatched records; the operations team authorises corrective action.',
      },
      change: ['Disconnected payment exceptions', 'Connect events and summarise causes', 'Better visibility for payment resolution'],
      experiences: ['Transfer / wallet experience', 'Finance & partner workspace'],
      workflows: ['Transfer request & validation', 'Payment routing & status', 'Settlement & reconciliation'],
      systems: ['Customer & beneficiary records', 'Payment provider / rails', 'Transaction ledger & settlement files'],
      steps: [
        'Customer initiates transfer',
        'Validation and checks run',
        'Provider processes payment',
        'Status and records reconcile',
      ],
      exception:
        'A failed, delayed, or unmatched payment → investigation queue with transaction records and an assigned owner.',
      context: 'Beneficiary details, payment references, provider events, and settlement records.',
    },
    {
      id: 'claim',
      label: 'Insurance claim',
      summary:
        'A claims workflow brings the policy, submitted evidence, and handler review into the same case.',
      ai: {
        title: 'Prepare the claim',
        body: 'Organise evidence and retrieve policy passages; the handler retains coverage and settlement decisions.',
      },
      change: ['Claims handlers assembling records', 'Prepare evidence with policy context', 'More time for assessment and resolution'],
      experiences: ['Policyholder / broker portal', 'Claims handler workspace'],
      workflows: ['Claim notification & intake', 'Evidence & policy preparation', 'Handler review & case updates'],
      systems: ['Policy administration', 'Document & evidence store', 'Claims / payment systems'],
      steps: [
        'Claim and evidence submitted',
        'Policy and records retrieved',
        'Handler reviews the case',
        'Decision and next step shared',
      ],
      exception:
        'Incomplete evidence or a coverage question → request clarification or escalate to the responsible specialist.',
      context: 'Claim details, policy references, supporting documents, and handler notes.',
    },
    {
      id: 'support',
      label: 'Customer support',
      summary:
        'Resolve the customer’s question with the relevant financial context and a clear route to specialist help.',
      ai: {
        title: 'Support the conversation',
        body: 'Retrieve approved answers with sources; uncertain or sensitive requests move to a service specialist.',
      },
      change: [
        'Customers repeating their situation',
        'Retrieve relevant context and approved answers',
        'More informed service conversations',
      ],
      experiences: ['Chat / contact centre', 'Service agent workspace'],
      workflows: ['Request & identity context', 'Knowledge & case retrieval', 'Resolution & escalation'],
      systems: ['Customer / account records', 'Payment / policy / claim status', 'CRM & service case history'],
      steps: [
        'Customer raises a question',
        'Permitted context is retrieved',
        'Agent resolves or escalates',
        'Customer receives a clear update',
      ],
      exception:
        'A dispute, complaint, or uncertain answer → named specialist queue with the conversation and supporting records.',
      context: 'Customer permissions, prior contacts, financial status, cited guidance, and case ownership.',
    },
  ] satisfies SystemJourney[],
}

/* ── 06 · Relevant work ──────────────────────────────────────────────────── */

export const work = {
  id: 'work',
  head: {
    eyebrow: 'Relevant work',
    lines: ['Financial services.', 'Work you can see.'],
    intro:
      'A closer look at UMM’s work across remittance, financial product experiences, and digital finance. Each project links to its published case study.',
  } satisfies SectionHead,
  view: 'View project',
  roleLabel: 'UMM’s role',
  read: 'Read case study',
  cases: [
    {
      tag: 'Remittance / Custom platform',
      name: 'Lyca Remit',
      title: 'A custom platform for international money transfers.',
      body: 'UMM developed custom software for Lyca Remit, including catalog management, vendor oversight, and administration tools.',
      role: 'Custom platform development · Vendor management · Operational administration',
      href: `${U}/casestudies/lycaremit/`,
      image: '/industry/fintech/lyca.png',
      alt: 'Lyca Remit website shown in UMM’s published case study',
      tone: 'sky',
    },
    {
      tag: 'Banking / Digital experience',
      name: 'Fintuit',
      title: 'Clearer journeys across personal and business finance.',
      body: 'UMM designed and developed a financial product website, organizing accounts, loans, insurance, and payment offerings into customer journeys.',
      role: 'Experience design · Product information architecture · Responsive web development',
      href: `${U}/casestudies/fintuit/`,
      image: '/industry/fintech/fintuit.png',
      alt: 'Fintuit website shown in UMM’s published case study',
      tone: 'citrus',
    },
    {
      tag: 'Digital finance / Product ecosystem',
      name: 'Belfrics',
      title: 'Make a complex financial ecosystem easier to navigate.',
      body: 'UMM structured Belfrics’ digital experience around its blockchain and financial products, including exchange, identity, and remittance offerings.',
      role: 'Digital strategy · Product ecosystem architecture · Web experience',
      href: `${U}/casestudies/belfrics/`,
      image: '/industry/fintech/belfrics.png',
      alt: 'Belfrics website shown in UMM’s published case study',
      tone: 'blossom',
    },
  ] satisfies {
    tag: string
    name: string
    title: string
    body: string
    role: string
    href: string
    image: string
    alt: string
    tone: Tone
  }[],
}

/* ── 07 · Who we work with ───────────────────────────────────────────────── */

export const audiences = {
  id: 'audiences',
  head: {
    eyebrow: 'Who we work with',
    lines: ['Different businesses.', 'Distinct priorities.'],
    intro: 'A shared commitment to trust. A different starting point for every institution.',
  } satisfies SectionHead,
  items: [
    {
      id: 'banks',
      label: 'Banks',
      title: 'Improve everyday banking without losing sight of the relationships behind it.',
      body: 'Onboarding, account servicing, payment journeys, and employee assistance.',
      art: 'shield',
      tone: 'sky',
    },
    {
      id: 'fintechs',
      label: 'Fintechs',
      title: 'Make a new financial product easier to understand, use, and return to.',
      body: 'Wallets, payments, customer onboarding, and partner experiences.',
      art: 'world',
      tone: 'citrus',
    },
    {
      id: 'insurers',
      label: 'Insurers',
      title: 'Bring more clarity to moments that can feel complex or uncertain.',
      body: 'Policy servicing, claims preparation, broker journeys, and customer support.',
      art: 'search',
      tone: 'blossom',
    },
    {
      id: 'enterprises',
      label: 'Regulated enterprises',
      title: 'Make financial services a natural part of your wider customer experience.',
      body: 'Embedded payment journeys, customer portals, and connected operations.',
      art: 'people',
      tone: 'sun',
    },
  ] satisfies { id: string; label: string; title: string; body: string; art: FinArtName; tone: Tone }[],
}

/* ── 08 · How AI is impacting financial services ─────────────────────────── */

export const impact = {
  id: 'impact',
  head: {
    eyebrow: 'How AI is impacting financial services',
    lines: ['A shift in how finance', 'serves, decides, and operates.'],
    intro:
      'AI can change more than the speed of a task. Across banking, payments, and insurance, it can reshape how customers get help, how teams review information, and how institutions respond to risk.',
  } satisfies SectionHead,
  changeLabel: 'What this can change',
  cards: [
    {
      eyebrow: '01 / Customer relationships',
      title: 'From repeated questions to informed conversations.',
      body: 'AI can bring approved product knowledge and permitted customer context into the same conversation. For banks and insurers, this means support can begin with the customer’s situation instead of another explanation of it.',
      change: 'More relevant answers, smoother handoffs, and clearer next steps.',
      art: 'search',
      tone: 'sky',
    },
    {
      eyebrow: '02 / Banking and insurance decisions',
      title: 'From gathering evidence to assessing it.',
      body: 'In onboarding, lending, and claims, AI can extract information, surface gaps, and prepare evidence for review. Specialists can spend more of their time on judgement and exceptions, with the source material close at hand.',
      change: 'Less preparation work and more focused specialist review.',
      art: 'review',
      tone: 'blossom',
    },
    {
      eyebrow: '03 / Payments and financial risk',
      title: 'From isolated alerts to connected investigations.',
      body: 'AI can help connect transaction signals, group related activity, and explain payment exceptions. Operations and risk teams gain a fuller case to investigate rather than another disconnected alert.',
      change: 'Earlier visibility of patterns and more informed investigations.',
      art: 'world',
      tone: 'sun',
    },
    {
      eyebrow: '04 / The financial operating model',
      title: 'From manual queues to exception-led operations.',
      body: 'AI can assist with routing requests, preparing cases, and drafting routine updates. This creates room for teams to focus on complex cases while service owners monitor quality, accountability, and customer outcomes.',
      change: 'More capacity for complex work, with explicit human oversight.',
      art: 'people',
      tone: 'citrus',
    },
  ] satisfies {
    eyebrow: string
    title: string
    body: string
    change: string
    art: FinArtName
    tone: Tone
  }[],
  close: {
    title: 'The opportunity grows with the responsibility.',
    body: 'These gains depend on reliable information, appropriate permissions, and ongoing evaluation. Credit, coverage, compliance, and other consequential decisions need defined accountability, review, and a route to challenge the outcome.',
  },
}

/* ── 09 · AI in financial services ───────────────────────────────────────── */

export const ai = {
  id: 'ai',
  head: {
    eyebrow: 'AI in financial services',
    lines: ['Less time assembling.', 'More time resolving.'],
    intro:
      'AI earns its place when it helps a financial team complete real work. Begin with evidence preparation, relevant answers, and exception triage—then measure the change.',
  } satisfies SectionHead,
  measureLabel: 'Measure what changes',
  cards: [
    {
      title: 'Fraud investigation',
      flow: ['Transaction alerts', 'Evidence assembly', 'Investigator review'],
      body: 'Group related signals, summarize activity, and prepare case context for investigators. Keep decisions and escalation with the responsible team.',
      measures: ['Alert quality', 'Investigation time', 'Escalation outcomes'],
      tone: 'sky',
    },
    {
      title: 'Lending & underwriting',
      flow: ['Application documents', 'Evidence summary', 'Specialist assessment'],
      body: 'Extract submitted information, flag missing evidence, and assemble a source-linked review pack. Specialists retain credit, pricing, and acceptance decisions.',
      measures: ['Document completeness', 'Preparation time', 'Rework'],
      tone: 'citrus',
    },
    {
      title: 'Claims & policy servicing',
      flow: ['Claim or question', 'Relevant policy context', 'Handler response'],
      body: 'Prepare claim records or retrieve approved policy passages for service teams, with references and a clear path for exceptions.',
      measures: ['Intake quality', 'Answer accuracy', 'Handling time'],
      tone: 'blossom',
    },
  ] satisfies { title: string; flow: [string, string, string]; body: string; measures: string[]; tone: Tone }[],
  close: {
    title: 'Start with a workflow. Prove its value. Then extend.',
    body: 'Choose a useful first application, connect approved information, evaluate the outputs with your team, and embed the workflow into everyday tools.',
  },
}

/* ── The route: one payment, start to finish (5 Nov) ─────────────────────────
   The idea the page is built on: one payment is sent in the hero and
   travels down the page; each section is a stop on its way, stamped with
   the time it got there, and it lands in a receipt at the close. The words
   below are the route's own (the payment card, the stamps, the receipt);
   the page's copy above is untouched.

   `at` is the section a stop belongs to ("top" is the hero's card,
   "contact" the receipt); `dt` the seconds after sending, for its time;
   `state` how the payment looks there; `focus` the tab the section turns
   to when the payment arrives. */

export type RouteStop = {
  at: string
  status: string
  note: string
  dt: number
  tone: Tone
  state: 'ok' | 'held' | 'flag' | 'done'
  focus?: string
}

export const route = {
  card: {
    label: 'Send money',
    eta: 'Arrives in about a minute',
    amount: '£250.00',
    to: 'Amara K.',
    place: 'Nairobi, Kenya',
    send: 'Send £250',
    sent: 'Sent',
    follow: 'Follow it down the page',
  },
  receipt: {
    pending: 'On its way',
    done: 'Payment received',
    total: 'Door to door',
  },
  stops: [
    { at: 'top', status: 'Sent', note: '£250.00 to Amara K., Nairobi', dt: 0, tone: 'sky', state: 'ok' },
    { at: 'reality', status: 'Held', note: 'One record doesn’t match the others', dt: 3, tone: 'coral', state: 'held' },
    { at: 'journeys', status: 'Routed', note: 'Into payments & remittance', dt: 5, tone: 'citrus', state: 'ok', focus: 'payments' },
    { at: 'operations', status: 'Updated', note: 'Amara is told it’s on its way', dt: 6, tone: 'blossom', state: 'ok' },
    { at: 'connects', status: 'Verified', note: 'Validated and routed to the provider', dt: 14, tone: 'sun', state: 'ok', focus: 'payment' },
    { at: 'work', status: 'In transit', note: 'With the payment provider', dt: 19, tone: 'sky', state: 'ok' },
    { at: 'audiences', status: 'Accepted', note: 'The partner bank in Nairobi has it', dt: 26, tone: 'citrus', state: 'ok' },
    { at: 'impact', status: 'Flagged', note: 'Unusual amount for this account', dt: 29, tone: 'coral', state: 'flag' },
    { at: 'ai', status: 'Cleared', note: 'An investigator checked the evidence', dt: 58, tone: 'citrus', state: 'ok' },
    { at: 'contact', status: 'Received', note: 'Amara has the £250.00', dt: 64, tone: 'citrus', state: 'done' },
  ] as RouteStop[],
}

export type RouteContent = typeof route

/* ── 10 · Your next chapter ──────────────────────────────────────────────── */

export const contact = {
  id: 'contact',
  eyebrow: 'Your next chapter',
  lines: ['Build the next chapter', 'of financial services.'],
  body: 'Where is the gap between what your customers expect and what your operations can deliver? Let’s start there.',
  cta: { label: 'Talk to our team', href: `${U}/contact/` },
}
