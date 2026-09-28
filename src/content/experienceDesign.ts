import type { IconName } from '@/components/icons'
import type { Station } from '@/lib/journey'
import type { Tone } from '@/components/primitives'

/* ============================================================================
   EXPERIENCE DESIGN / CX — PAGE CONTENT

   Copy is lifted verbatim from the signed-off structure at
   umm-alternate-option.lovable.app. Keeping it in one typed module means the
   page components stay purely presentational and the words can be handed to a
   copywriter, translated, or moved into a CMS without touching any markup.

   The only authored additions are the four extra sector panels: the approved
   prototype expanded Retail alone, so Financial services, Healthcare,
   Manufacturing & B2B and Telecoms & media are written here in the same voice
   and flagged in the project README for sign-off.
   ========================================================================== */

export const meta = {
  service: 'Experience Design / CX',
  title: 'Customer Experience Design Services',
  locations: 'Dallas · London · Dubai · Nairobi · Shenzhen',
  contactEmail: 'ping@umm.digital',
}

/** The stations the journey engine walks. Order defines the page order. */
export const stations: Station[] = [
  { id: 'top', label: 'Start' },
  { id: 'why', label: 'Why it matters' },
  { id: 'services', label: 'Services' },
  { id: 'stages', label: 'Every stage' },
  { id: 'tech', label: 'Technology' },
  { id: 'sectors', label: 'Sectors' },
  { id: 'delivery', label: 'How we work' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'proof', label: 'Evidence' },
  { id: 'faq', label: 'Questions' },
  { id: 'contact', label: 'Begin', dark: true },
]

export const nav = [
  { id: 'services', label: 'Services' },
  { id: 'stages', label: 'For every stage' },
  { id: 'tech', label: 'Technology' },
  { id: 'delivery', label: 'How we work' },
  { id: 'faq', label: 'FAQs' },
]

export const hero = {
  chapter: 'Experience Design / CX',
  /* The title is set as fixed lines rather than left to wrap: the hero reads
     as three lines at every width, and the type scales to keep it that way. */
  titleLines: ['Design customer', 'experiences your'],
  titleLast: 'enterprise can',
  titleAccent: 'deliver.',
  lead: 'UMM helps businesses improve how customers use their products and services. We combine research, journey mapping, UX and service design to simplify interactions across websites, apps, portals and support channels.',
  primaryCta: 'Discuss our CX project',
  secondaryCta: 'View our work',
  journey: {
    label: 'Account onboarding',
    title: 'One clear path, mapped end to end.',
    nodes: ['Discover', 'Design', 'Test', 'Improve'],
    proof: 'Validated with users',
  },
  scrollCue: 'Scroll to explore',
}


export const capabilities = [
  'Customer research',
  'Journey mapping',
  'Service design',
  'Usability testing',
  'UX strategy',
  'Personalisation',
  'Voice of Customer',
  'Experience operations',
]

export const why = {
  chapter: 'Why it matters',
  titleLead: 'Your customer sees one experience. Your',
  titleAccent: 'teams',
  titleTail: 'see many.',
  lead: 'Customers judge you on how easy you are to deal with, not on how you are organised inside.',
  steps: [
    {
      eyebrow: 'Understand the customer',
      title: 'Find where value leaks',
      body: 'Research what people are trying to do, where they get stuck, and which journeys matter most to the business.',
      icon: 'search' as IconName,
    },
    {
      eyebrow: 'Design the journey',
      title: 'Rebuild it as one path',
      body: 'Map the end-to-end journey, then design the interactions and the service behind them so the whole path works.',
      icon: 'route' as IconName,
    },
    {
      eyebrow: 'Improve and measure',
      title: 'Keep it getting better',
      body: 'Test with real users, launch, and keep improving against measures you agree up front, such as task completion.',
      icon: 'loop' as IconName,
    },
  ],
}

export type Service = {
  title: string
  icon: IconName
  tone: Tone
  when: string
  what: string
  receive: string
}

export const services = {
  chapter: 'Services',
  titleLead: 'What we do, and what you',
  titleAccent: 'receive',
  lead: 'Each service answers the same three questions: when you would need it, what we do, and what you get at the end.',
  items: [
    {
      title: 'CX strategy and assessment',
      icon: 'compass',
      tone: 'blossom',
      when: "You’re unsure which journeys to improve first, or where the experience is losing value.",
      what: 'Research customers, review current journeys, and prioritise by value and effort.',
      receive: 'A prioritised roadmap and a research report.',
    },
    {
      title: 'Journey mapping and redesign',
      icon: 'route',
      tone: 'citrus',
      when: 'A key journey feels disjointed to customers across channels and teams.',
      what: 'Map the journey end to end, find the break points, and redesign the path.',
      receive: 'A journey map and a service blueprint.',
    },
    {
      title: 'Service and interaction design',
      icon: 'layers',
      tone: 'sun',
      when: 'Screens, content or support steps are hard to use or inconsistent.',
      what: 'Design the interfaces and the service behind them, then test with users.',
      receive: 'A validated prototype and design specifications.',
    },
    {
      title: 'Data and personalisation',
      icon: 'persona',
      tone: 'sky',
      when: 'Customer data is scattered, so interactions cannot be made relevant.',
      what: 'Bring data into one view and design where personalisation and AI genuinely help.',
      receive: 'A single customer view and a personalisation plan.',
    },
    {
      title: 'Measurement and optimisation',
      icon: 'gauge',
      tone: 'coral',
      when: "You’ve launched, but don’t know whether the experience is improving.",
      what: 'Agree measures, instrument journeys, and run a continuous cycle of testing.',
      receive: 'A measurement framework and a testing cadence.',
    },
    {
      title: 'Experience operations',
      icon: 'orbit',
      tone: 'blossom',
      when: 'Journeys need clear ownership and a way to keep improving after launch.',
      what: 'Set up journey ownership, rituals and design standards your teams can run.',
      receive: 'An operating model and design standards.',
    },
  ] satisfies Service[],
  /* The scope signpost under the grid. Split rather than held as one string
     so the sister page can be named as a link the moment its URL is known --
     set `href` and the component renders an anchor instead of emphasis. */
  boundary: {
    question:
      'Looking for commerce interfaces, checkout, storefront development or merchandising?',
    before: 'That work lives on our',
    page: 'UX & Digital Commerce',
    after:
      'page. This page covers customer research, CX strategy, journeys, service design and experience improvement.',
    href: null as string | null,
  },
}

export const stages = {
  chapter: 'For every stage',
  titleLead: 'Right-sized for enterprises, growing companies and',
  titleAccent: 'startups',
  lead: 'We work with enterprise teams and growing organisations facing complex customer journeys.',
  /* Figures supplied by UMM. Digits in `stat` count up as the stage arrives. */
  items: [
    {
      type: 'Startups',
      tab: 'Startups',
      title: 'Prove it fast',
      icon: 'spark' as IconName,
      tone: 'sun' as Tone,
      stat: '2–5×',
      statCaption: 'productivity boost within the first 90 days',
      challenge: 'One flagship journey to get right, without over-building.',
      approach: 'Focused research, one designed journey, and a light way to measure it.',
      outcome: 'A validated journey you can ship and learn from quickly.',
    },
    {
      type: 'Growing companies (SMEs)',
      tab: 'Growing companies',
      title: 'Connect it',
      icon: 'link' as IconName,
      tone: 'blossom' as Tone,
      stat: '30–50%',
      statCaption: 'reduction in operational costs, and a path to continuous growth',
      challenge: 'Channels and data grew apart as you scaled, so journeys feel disjointed.',
      approach: 'Unify the priority journeys and the data behind them into one view.',
      outcome: 'Journeys that feel like one relationship, not many handoffs.',
    },
    {
      type: 'Enterprises',
      tab: 'Enterprises',
      title: 'Govern it at scale',
      icon: 'tower' as IconName,
      tone: 'sky' as Tone,
      stat: '$1M+',
      statCaption: 'saved annually through smarter, automated operations',
      challenge: 'Consistency and ownership across many teams, markets and touchpoints.',
      approach: 'One design standard, clear journey ownership, and an operating model teams can run.',
      outcome: 'A consistent experience your whole organisation can deliver.',
    },
  ],
}

export const tech = {
  chapter: 'Technology',
  titleLead: 'We work within the systems you already',
  titleAccent: 'have.',
  lead: 'We design and deliver inside your existing platforms rather than adding another silo. The tools below are grouped by how we use them.',
  columns: [
    {
      title: 'Implementation experience',
      icon: 'stack' as IconName,
      body: 'Platforms we design and build experiences within.',
      groups: [
        {
          label: 'Experience & content',
          items: [
            'Adobe Experience Manager',
            'Sitecore',
            'Contentful',
            'WordPress VIP',
          ],
        },
        {
          label: 'CRM & service',
          items: ['Salesforce', 'Microsoft Dynamics 365', 'ServiceNow', 'Zendesk'],
        },
      ],
    },
    {
      title: 'Integration experience',
      icon: 'plug' as IconName,
      body: 'Data, journey and personalisation platforms we connect to.',
      groups: [
        {
          label: 'Customer data',
          items: ['Segment', 'Tealium', 'Salesforce Data 360', 'Adobe Real-Time CDP'],
        },
        {
          label: 'Journey & personalisation',
          items: [
            'Adobe Journey Optimizer',
            'Braze',
            'Dynamic Yield',
            'Optimizely',
          ],
        },
      ],
    },
    {
      title: 'Design & research tools',
      icon: 'pen' as IconName,
      body: 'Tools we use to design, test and understand.',
      groups: [
        { label: 'Design & prototyping', items: ['Figma', 'Miro'] },
        {
          label: 'Research & analytics',
          items: [
            'Maze',
            'UserTesting',
            'Qualtrics',
            'Medallia',
            'Adobe Analytics',
            'Google Analytics 4',
            'Hotjar',
          ],
        },
      ],
    },
  ],
  note: 'These groupings reflect how we work. They do not imply a partnership, reseller status or certification unless stated separately.',
}

export const sectors = {
  chapter: 'Sector context',
  titleLead: 'The same disciplines, applied to your',
  titleAccent: 'context',
  items: [
    {
      id: 'retail',
      label: 'Retail & commerce',
      icon: 'retail' as IconName,
      tone: 'sun' as Tone,
      body: 'Connect online, app and store into one journey, so browsing, buying and returning feel like a single relationship.',
      points: [
        'Connected online and in-store experience',
        'Onboarding and support journeys designed in',
        'Measures agreed before design begins',
      ],
      board: [
        { label: 'What we measure', value: 'Task completion' },
        { label: 'Journey scope', value: 'Browse to return' },
        { label: 'Typical output', value: 'Service blueprint' },
      ],
    },
    {
      id: 'financial',
      label: 'Financial services',
      icon: 'finance' as IconName,
      tone: 'sky' as Tone,
      body: 'Make regulated journeys — opening, verifying and servicing an account — feel straightforward without loosening a single control.',
      points: [
        'Identity and onboarding checks designed in',
        'Complex products explained in plain language',
        'Accessibility and evidence built into the work',
      ],
      board: [
        { label: 'What we measure', value: 'Application completion' },
        { label: 'Journey scope', value: 'Apply to first payment' },
        { label: 'Typical output', value: 'Validated prototype' },
      ],
    },
    {
      id: 'healthcare',
      label: 'Healthcare',
      icon: 'health' as IconName,
      tone: 'citrus' as Tone,
      body: 'Design access, appointment and follow-up journeys that patients and clinicians can both rely on under pressure.',
      points: [
        'Patient and clinician needs researched together',
        'Access and follow-up treated as one path',
        'Privacy requirements agreed before design',
      ],
      board: [
        { label: 'What we measure', value: 'Task completion' },
        { label: 'Journey scope', value: 'Referral to follow-up' },
        { label: 'Typical output', value: 'Journey map' },
      ],
    },
    {
      id: 'manufacturing',
      label: 'Manufacturing & B2B',
      icon: 'factory' as IconName,
      tone: 'blossom' as Tone,
      body: 'Turn quoting, ordering and aftersales into a self-serve path your sales and service teams can stand behind.',
      points: [
        'Account and quoting journeys mapped end to end',
        'Self-serve designed alongside assisted service',
        'Dealer and distributor steps included',
      ],
      board: [
        { label: 'What we measure', value: 'Order accuracy' },
        { label: 'Journey scope', value: 'Quote to reorder' },
        { label: 'Typical output', value: 'Service blueprint' },
      ],
    },
    {
      id: 'telecoms',
      label: 'Telecoms & media',
      icon: 'signal' as IconName,
      tone: 'coral' as Tone,
      body: 'Simplify signing up, upgrading and getting help, so customers stop calling to finish something they started online.',
      points: [
        'Upgrade and support journeys connected',
        'Billing and plan changes made legible',
        'Support demand measured from the start',
      ],
      board: [
        { label: 'What we measure', value: 'Support demand' },
        { label: 'Journey scope', value: 'Sign-up to upgrade' },
        { label: 'Typical output', value: 'Prioritised roadmap' },
      ],
    },
  ],
}

export const delivery = {
  chapter: 'How we work',
  titleLead: 'A clear method, and clarity on who',
  titleAccent: 'builds it',
  lead: 'Five stages, run in order, each ending in something you can review. Nothing moves on until the last one has been agreed.',
  steps: [
    {
      title: 'Discover',
      eyebrow: 'Research',
      icon: 'search' as IconName,
      body: 'Research customers and find where value is lost today.',
    },
    {
      title: 'Map',
      eyebrow: 'Prioritisation',
      icon: 'map' as IconName,
      body: 'Map journeys end to end and prioritise by impact.',
    },
    {
      title: 'Design',
      eyebrow: 'Experience & service',
      icon: 'grid' as IconName,
      body: 'Design the experience and the service behind it.',
    },
    {
      title: 'Deliver',
      eyebrow: 'Build or hand over',
      icon: 'ship' as IconName,
      body: 'Build or hand over, with usability and feasibility checked.',
    },
    {
      title: 'Optimise',
      eyebrow: 'After launch',
      icon: 'loop' as IconName,
      body: 'Measure against agreed goals and keep improving.',
    },
  ],
  responsibilities: [
    {
      title: 'Who implements the work',
      icon: 'handoff' as IconName,
      body: 'We can design and hand over to your team, design and build the experience ourselves, or work alongside your implementation team. We agree this at the start so responsibilities are clear.',
    },
    {
      title: 'Where quality is checked',
      icon: 'shield' as IconName,
      body: 'Usability validation and technical feasibility happen during design, not after. Implementation quality is checked as we build, and we agree how improvement will be measured after launch.',
    },
  ],
}

export const engagement = {
  chapter: 'Engagement models',
  titleLead: 'Ways to work with',
  titleAccent: 'us',
  lead: "Choose the model that fits the stage you’re at. Each sets out scope, what you receive, how we collaborate, and an indicative duration.",
  items: [
    {
      title: 'CX assessment',
      tab: 'Assessment',
      tone: 'blossom' as Tone,
      lead: 'A focused review to decide where to start and why.',
      scope: 'Research a set of priority journeys and current experience.',
      receive: 'A prioritised roadmap and research findings.',
      collaboration: 'Workshops with your team; light time commitment.',
      duration: 'A few weeks.',
    },
    {
      title: 'Journey redesign',
      tab: 'Redesign',
      tone: 'citrus' as Tone,
      lead: 'Design and validate one or more priority journeys.',
      scope: 'Map, design and test a defined journey end to end.',
      receive: 'A validated prototype and service blueprint.',
      collaboration: 'Joint design sessions; regular reviews.',
      duration: 'Per journey, scoped up front.',
    },
    {
      title: 'Embedded experience partnership',
      tab: 'Embedded',
      tone: 'sky' as Tone,
      lead: 'A UMM design and research team works within your organisation over time.',
      scope: 'Ongoing design across a programme of journeys.',
      receive: 'Designers, researchers and a lead, alongside your teams.',
      collaboration: 'Embedded in your rituals and tools.',
      duration: 'Ongoing, reviewed periodically.',
    },
    {
      title: 'Optimisation pod',
      tab: 'Optimisation',
      tone: 'sun' as Tone,
      lead: 'A small team that keeps testing and improving live journeys.',
      scope: 'Continuous measurement, testing and refinement.',
      receive: 'A designer, a researcher and an analyst.',
      collaboration: 'Works to an agreed backlog and measures.',
      duration: 'Ongoing cycles.',
    },
  ],
}

export const proof = {
  chapter: 'How we evidence work',
  titleLead: 'Proof, without inventing the',
  titleAccent: 'numbers',
  paragraphs: [
    "We hold ourselves to the same discipline we bring to client work: we don’t attribute revenue or retention changes to design without evidence.",
    "In a working session we’ll walk you through relevant examples, the deliverables we produced, and results with their measurement period and context, shared under NDA where needed.",
  ],
  cta: 'Ask to see relevant work',
  artifacts: [
    {
      title: 'Validated prototype',
      icon: 'prototype' as IconName,
      tone: 'blossom' as Tone,
      body: 'A tested design of the journey, not just a mockup.',
    },
    {
      title: 'Research report',
      icon: 'report' as IconName,
      tone: 'citrus' as Tone,
      body: 'What customers do, and where they get stuck.',
    },
    {
      title: 'Service blueprint',
      icon: 'blueprint' as IconName,
      tone: 'sun' as Tone,
      body: 'The interactions and the internal processes behind them.',
    },
    {
      title: 'Prioritised roadmap',
      icon: 'roadmap' as IconName,
      tone: 'sky' as Tone,
      body: 'Which journeys to improve first, and why.',
    },
  ],
}

export const faq = {
  chapter: 'Common questions',
  titleLead: 'Questions buyers usually',
  titleAccent: 'ask',
  items: [
    {
      question: 'What does a CX assessment include?',
      answer:
        "We research a set of priority journeys, review the current experience, and agree the measures that matter. You receive a prioritised roadmap and a research report. We’ll confirm scope, deliverables, the involvement we need from your team, and any time or fee commitment before we begin.",
    },
    {
      question: 'Can we start with one journey?',
      answer:
        "Yes. Many engagements start with a single priority journey, mapped, designed and tested end to end. It’s often the fastest way to prove value before scaling to more journeys.",
    },
    {
      question: 'Do you provide design only, or implementation as well?',
      answer:
        'Both. We can design and hand over to your team, design and build the experience ourselves, or work alongside your implementation team. We agree which arrangement fits at the start of the engagement.',
    },
    {
      question: 'Can you work with our internal design and engineering teams?',
      answer:
        'Yes. We regularly work embedded within client teams, using your rituals and tools, and can set up journey ownership and design standards your teams can run after we leave.',
    },
    {
      question: 'What customer access or data will you need?',
      answer:
        "Typically access to a sample of customers or users for research, and to the relevant journey data and analytics. We agree exactly what’s needed, and any privacy and continuity requirements, before work starts.",
    },
    {
      question: 'How will we measure improvement?',
      answer:
        'We agree the measures up front. Conversion, retention, support demand and customer effort are distinct measures, so we define each relevant one and agree a baseline.',
    },
    {
      question: 'Will this disrupt our current operations?',
      answer:
        'We plan for continuity. We use phased releases and migration planning, and agree continuity requirements with you, so change is introduced in steps rather than all at once.',
    },
  ],
}

export const closing = {
  chapter: "Let’s begin",
  /* Set as two fixed lines rather than left to wrap, and broken at the full
     stop: the two sentences are the two halves of the argument, so the break
     that reads best is the one that was already in the sentence. */
  titleLines: ['Every brand makes a promise.'],
  titleLast: 'The experience is where it is',
  titleAccent: 'kept.',
  lead: "Start with a CX assessment. We’ll show you where the experience is losing value, and a prioritised plan to improve it.",
  primaryCta: 'Discuss your CX project',
  secondaryCta: 'View our work',
}

/* ----------------------------------------------------------------------------
   TECHNOLOGY — the swapping stack.

   The same platforms as `tech.columns`, re-cut into the six groups that
   actually differ in *how* we touch them. The role verb is the argument of the
   section: we build inside, connect to, or design with what you already own.
   Monograms rather than vendor logos — the note below the section says these
   groupings imply no partnership, and a wall of real marks would contradict it.
   -------------------------------------------------------------------------- */

export const techStack = {
  categories: [
    { id: 'implementation', label: 'Implementation', role: 'We build inside it' },
    { id: 'integration', label: 'Integration', role: 'We connect to it' },
    { id: 'craft', label: 'Design & research', role: 'We design with it' },
  ],
  groups: [
    {
      id: 'content',
      category: 'implementation',
      label: 'Experience & content',
      claim: 'Your content platform already works. We design the journeys that run through it.',
      tone: 'sun' as Tone,
      items: [
        { name: 'Adobe Experience Manager', mono: 'AEM' },
        { name: 'Sitecore', mono: 'SC' },
        { name: 'Contentful', mono: 'CF' },
        { name: 'WordPress VIP', mono: 'VIP' },
      ],
    },
    {
      id: 'crm',
      category: 'implementation',
      label: 'CRM & service',
      claim: 'Sales, service and support on one record, so the customer only has to say it once.',
      tone: 'sky' as Tone,
      items: [
        { name: 'Salesforce', mono: 'SF' },
        { name: 'Microsoft Dynamics 365', mono: 'D365' },
        { name: 'ServiceNow', mono: 'SN' },
        { name: 'Zendesk', mono: 'ZD' },
      ],
    },
    {
      id: 'cdp',
      category: 'integration',
      label: 'Customer data',
      claim: 'One profile per customer, assembled from the sources you already collect.',
      tone: 'blossom' as Tone,
      items: [
        { name: 'Segment', mono: 'SG' },
        { name: 'Tealium', mono: 'TL' },
        { name: 'Salesforce Data 360', mono: 'D360' },
        { name: 'Adobe Real-Time CDP', mono: 'CDP' },
      ],
    },
    {
      id: 'journey',
      category: 'integration',
      label: 'Journey & personalisation',
      claim: 'The right message at the right moment, triggered by what someone actually did.',
      tone: 'sun' as Tone,
      items: [
        { name: 'Adobe Journey Optimizer', mono: 'AJO' },
        { name: 'Braze', mono: 'BZ' },
        { name: 'Dynamic Yield', mono: 'DY' },
        { name: 'Optimizely', mono: 'OP' },
      ],
    },
    {
      id: 'design',
      category: 'craft',
      label: 'Design & prototyping',
      claim: 'Journeys drawn, prototyped and reviewed with your team before anything gets built.',
      tone: 'citrus' as Tone,
      items: [
        { name: 'Figma', mono: 'FG' },
        { name: 'Miro', mono: 'MR' },
      ],
    },
    {
      id: 'research',
      category: 'craft',
      label: 'Research & analytics',
      claim: 'What people say, what people do, and the distance between the two.',
      tone: 'coral' as Tone,
      items: [
        { name: 'Maze', mono: 'MZ' },
        { name: 'UserTesting', mono: 'UT' },
        { name: 'Qualtrics', mono: 'QT' },
        { name: 'Medallia', mono: 'MD' },
        { name: 'Adobe Analytics', mono: 'AA' },
        { name: 'Google Analytics 4', mono: 'GA4' },
        { name: 'Hotjar', mono: 'HJ' },
      ],
    },
  ],
}
