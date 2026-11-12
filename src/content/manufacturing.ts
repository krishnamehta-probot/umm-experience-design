/* ============================================================================
   MANUFACTURING — PAGE CONTENT (the new industry-page flow, 12 Nov 2026)

   Word for word from the draft Krish gave as the new structure for every
   industry page:
   https://umm-industry-pages.ai-umm.chatgpt.site/manufacturing/

   Ten sections in the draft's order, including what the draft only shows on
   a click (the audience tabs, "What makes this work", the architecture's
   inspector and its three workflows). The types below are the shape every
   industry page now takes; another industry writes the same fields.

   `art` names one of the page's drawings (MfgArt.tsx); `tone` one of the
   brand pastels.
   ========================================================================== */

const U = 'https://umm.digital'

export type Tone = 'sky' | 'blossom' | 'sun' | 'citrus' | 'coral' | 'lilac'

export type Head = {
  eyebrow: string
  /** the heading's two lines; the second is set in the blue */
  lines: [string, string]
  intro: string
}

export type Link = { label: string; href: string }

export const meta = {
  industry: 'Manufacturing',
  title: 'Manufacturing | UMM',
}

/* ── 01 · Opening ────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: 'Manufacturing',
  lines: ['Demand changes overnight.', 'Can your factory change course?'] as [string, string],
  lead: 'When orders shift, decisions about materials, capacity and quality have to move together. Your customers still expect the date you promised.',
  primary: { label: 'Let’s talk', href: `${U}/contact/` },
  links: [
    { label: 'See the AI architecture', href: '#architecture' },
    { label: 'Relevant work', href: '#work' },
  ],
  chips: [
    { label: 'Quality gate / Lot 024', value: 'Review required' },
    { label: 'Planning queue', value: '2 orders to review' },
  ],
  caption: 'Illustrated workflow / Quality to planning',
}

/* ── 02 · The reality ────────────────────────────────────────────────────── */

export const reality = {
  id: 'reality',
  head: {
    eyebrow: 'The reality',
    lines: ['The order looks ready.', 'The lot is on hold.'],
    intro:
      'Production, quality and sales can each have an accurate record and still give the customer three different answers. The gap is the handoff.',
  } satisfies Head,
  cards: [
    {
      tag: 'Line 02 / Shift plan',
      title: 'A late part changes the sequence.',
      body: 'Two jobs need the same component. Stock is due tomorrow, but only one customer can wait. The planner needs the order commitments as well as the stock count.',
      art: 'sequence',
      tone: 'sky',
    },
    {
      tag: 'Quality hold',
      title: 'A quality hold travels slowly.',
      body: 'An inspector stops a lot. If dispatch still sees available stock, it can promise units that nobody has authority to release.',
      art: 'hold',
      tone: 'sun',
    },
    {
      tag: 'Asset / 0042',
      title: 'The machine outlives the paperwork.',
      body: 'A field technician arrives at a machine that has been rebuilt twice. The original manual alone cannot tell them which part is fitted today.',
      art: 'asset',
      tone: 'blossom',
    },
  ] as const,
  view: {
    eyebrow: 'Our point of view',
    title: 'Follow the order past the screen.',
    body: 'Start with the decision a person must make: release the lot, resequence a run or call the buyer. Work backwards to the evidence that person needs and forwards to the team that must act next.',
    /* the three decisions the body names, for the drawing */
    decisions: ['Release the lot', 'Resequence a run', 'Call the buyer'],
    sides: ['The evidence', 'The team that acts next'],
  },
}

/* ── 03 · What UMM enables ───────────────────────────────────────────────── */

export const enable = {
  id: 'possibilities',
  head: {
    eyebrow: 'What UMM enables',
    lines: ['What we enable', 'for manufacturing.'],
    intro:
      'The systems manufacturers ask for: production planning, quality decisions, supply chain control and connected equipment—built around the realities of the plant.',
  } satisfies Head,
  start: {
    eyebrow: 'Start with procurement',
    title: 'The production plan starts with the material.',
    body: 'Supplier commitments, purchase orders and incoming material status establish what the plant can make and when. We connect procurement visibility to planning before a job reaches the line.',
  },
  capabilities: [
    {
      eyebrow: '01 / Capability',
      title: 'Smart Production Operations',
      sub: 'Plan and run production with a shared view of the plant.',
      points: [
        'MES, SCADA and PLC modernisation with line-level and plant-level visibility.',
        'Production planning software that accounts for materials, capacity and changeovers.',
        'Digital twins and simulation to compare changes before execution.',
        'Maintenance workflows informed by IoT and equipment condition.',
      ],
      art: 'production',
      tone: 'sky',
    },
    {
      eyebrow: '02 / Capability',
      title: 'Decision Support for Quality and Supply',
      sub: 'Bring quality, planning and supply decisions into the same operating picture.',
      points: [
        'Quality monitoring that joins images, measurements and production context.',
        'Planning that responds to real operating constraints.',
        'AI-assisted supply chain control linking orders, stock, capacity and delivery.',
        'Traceability from material and batch through product release.',
      ],
      art: 'decision',
      tone: 'citrus',
    },
    {
      eyebrow: '03 / Capability',
      title: 'Connected Products and Services',
      sub: 'Turn equipment data into better service and new revenue opportunities.',
      points: [
        'Remote monitoring and diagnostics for industrial OEMs.',
        'Service portals connecting customers, field teams and support.',
        'Serial-specific history, compatible spares and maintenance knowledge.',
        'Usage-aware service offerings supported by actual equipment data.',
      ],
      art: 'connected',
      tone: 'blossom',
    },
    {
      eyebrow: '04 / Capability',
      title: 'Industrial Data and Platform Foundations',
      sub: 'Connect edge, plant and enterprise without losing industrial context.',
      points: [
        'Data platforms connecting edge, plant and cloud with clear ownership.',
        'OT and IT security patterns suited to industrial operations.',
        'Shared asset, part, lot and revision context across systems.',
        'Logging, traceability and compliance evidence built into the platform.',
      ],
      art: 'platform',
      tone: 'lilac',
    },
  ] as const,
  close: {
    body: 'Revenue operations complete the flow: approved pricing, delivered quantities, invoicing and collections stay connected to the same customer order.',
    link: { label: 'See the connected architecture', href: '#architecture' },
  },
}

/* ── 04 · The next manufacturing model ───────────────────────────────────── */

export const model = {
  id: 'operations',
  head: {
    eyebrow: 'The next manufacturing model',
    lines: ['Test the change.', 'Before changing the plant.'],
    intro:
      'IoT makes the physical operation observable. A digital twin adds a model of its behaviour. AI can use that context to compare production choices before a planner commits them.',
  } satisfies Head,
  steps: [
    {
      verb: 'Observe',
      title: 'Connect the physical plant',
      body: 'Machine events, cycle times, energy readings and quality measurements are matched to the asset, part and production order.',
    },
    {
      verb: 'Simulate',
      title: 'Build the digital twin',
      body: 'Represent capacity, routing, buffers and constraints. Test a different sequence, shift pattern or material arrival against the same operating assumptions.',
    },
    {
      verb: 'Act & learn',
      title: 'Return a feasible plan',
      body: 'A planner reviews predicted throughput, lateness and resource use. Approved changes enter planning and execution systems; actual results update the model.',
    },
  ],
  /* the drawing's two sides */
  sides: ['Physical plant', 'Digital twin'],
  reference: {
    eyebrow: 'Industry reference',
    body: 'Siemens describes digital twins as models for simulating products, machines and production before physical changes. Walmart’s retail digital-twin work also shows how simulation can support operational decisions.',
    links: [
      {
        label: 'Read the industrial reference',
        href: 'https://www.siemens.com/en-us/company/digital-twin/comprehensive-digital-twin-for-industry/',
      },
      { label: 'Walmart’s operational example', href: 'https://corporate.walmart.com/news/2025/07/24/retail-rewired' },
    ],
  },
}

/* ── 05 · The manufacturing architecture ─────────────────────────────────── */

export type NodeId =
  | 'sourcing'
  | 'planning'
  | 'logistics'
  | 'finance'
  | 'procure'
  | 'produce'
  | 'supply'
  | 'revenue'
  | 'physical'
  | 'iot'
  | 'twin'
  | 'approve'

/** what the inspector shows for a node: what it does, what it reads, what it returns */
export type Inspect = { title: string; body: string; reads: string; returns: string }

export const architecture = {
  id: 'architecture',
  head: {
    eyebrow: 'The manufacturing architecture',
    lines: ['One operating flow.', 'AI at every decision.'],
    intro:
      'Procurement → production → supply chain → revenue operations. Follow how operational data reaches AI, and how an approved decision returns to the business.',
  } satisfies Head,
  label: 'Manufacturing / Connected value chain',
  interactive: 'Interactive architecture',
  run: 'Run example',
  ai: {
    label: 'AI layer',
    title: 'Intelligence across the entire operation',
    note: ['Operational facts in.', 'Recommendations and approved actions out.'],
    capLabel: 'AI capability',
    agents: [
      { id: 'sourcing', title: 'Supplier intelligence', body: 'Predict material risk' },
      { id: 'planning', title: 'Production intelligence', body: 'Simulate feasible plans' },
      { id: 'logistics', title: 'Supply chain intelligence', body: 'Optimise stock & routing' },
      { id: 'finance', title: 'Revenue intelligence', body: 'Reconcile & prioritise' },
    ],
  },
  /** what travels up to the AI and back down to the business, per stage */
  transfer: [
    ['Supplier signals', 'Sourcing priorities'],
    ['IoT & production actuals', 'Simulated plans'],
    ['Stock & transport events', 'Allocation decisions'],
    ['Terms & delivery evidence', 'Invoice exceptions'],
  ],
  stages: [
    {
      id: 'procure',
      eyebrow: '01 / Procurement',
      verb: 'Supply',
      title: 'Secure the inputs',
      body: 'Purchase orders · supplier commitments · incoming materials',
      systems: ['ERP purchasing', 'Supplier portal', 'Material requirements'],
      art: 'supplier',
    },
    {
      id: 'produce',
      eyebrow: '02 / Production',
      verb: 'Plan / Make / Verify',
      title: 'Plan. Make. Verify.',
      body: 'Scheduling · machine execution · inspection and release',
      systems: ['APS planning', 'MES / SCADA / PLC', 'Quality & traceability'],
      art: 'plant',
    },
    {
      id: 'supply',
      eyebrow: '03 / Supply chain',
      verb: 'Deliver',
      title: 'Deliver the promise',
      body: 'Inventory allocation · warehousing · transport and delivery',
      systems: ['WMS / inventory', 'Transport management', 'Customer order status'],
      art: 'truck',
    },
    {
      id: 'revenue',
      eyebrow: '04 / Revenue operations',
      verb: 'Reconcile',
      title: 'Close the commercial loop',
      body: 'Approved prices · delivery evidence · invoicing and collections',
      systems: ['CRM / pricing', 'ERP finance', 'Receivables'],
      art: 'invoice',
    },
  ],
  context: {
    title: 'Shared operational context',
    body: 'Order · material · asset · batch · customer · timestamp',
    note: 'Actual outcomes feed the next decision',
  },
  twin: {
    eyebrow: 'Inside production / The digital twin loop',
    lines: ['Observe the plant.', 'Rehearse the change.'],
    body: 'A digital twin represents the assets, routing and constraints of the real operation. It tests the consequences of a proposed change before production commits.',
    tiles: [
      { id: 'physical', eyebrow: 'Physical plant', title: 'Machines & materials', body: 'Actual cycle times, energy and equipment condition' },
      { id: 'iot', eyebrow: 'IoT / Edge', title: 'Contextualised signals', body: 'Asset IDs · time · units · job references' },
      { id: 'twin', eyebrow: 'Digital twin + AI', title: 'Model & compare', body: 'Capacity · buffers · routing · what-if scenarios' },
      { id: 'approve', eyebrow: 'Planning / APS → MES', title: 'Approve & execute', body: 'Planner chooses a feasible plan; actuals return to the model' },
    ],
    caption: 'Continuous feedback: observe → simulate → approve → measure',
  },
  workflow: {
    eyebrow: 'See the architecture work',
    play: 'Play workflow',
    note: 'Illustrative flow · no live business data',
    label: 'Illustrative business workflow',
    flows: [
      {
        id: 'supplier',
        name: 'A supplier date changes',
        title: 'A delayed material changes more than the purchase order.',
        intro: 'Follow the supplier update through AI review, the digital twin and the revised production promise.',
        steps: [
          { type: 'Signal', title: 'The supplier revises an arrival date.', copy: 'The purchase order and affected material requirements enter the shared context.', nodes: ['procure'] },
          { type: 'AI interpretation', title: 'Supplier intelligence identifies the affected jobs.', copy: 'The AI capability links the notice to open requirements and prioritises the buyer’s review.', nodes: ['procure', 'sourcing'] },
          { type: 'AI + digital twin', title: 'Production intelligence compares feasible sequences.', copy: 'The twin checks available material, capacity and changeover constraints. It surfaces options and assumptions, not an automatic plant command.', nodes: ['planning', 'produce', 'twin', 'iot'] },
          { type: 'Approval', title: 'The planner releases the selected schedule.', copy: 'The approved sequence enters APS and MES; the buyer confirms the revised supply commitment.', nodes: ['approve', 'produce'] },
          { type: 'Fulfilment', title: 'The delivery promise follows the new plan.', copy: 'Supply teams confirm allocation and delivery changes; actual production outcomes return to the operating context.', nodes: ['logistics', 'supply', 'physical'] },
        ],
      },
      {
        id: 'demand',
        name: 'Demand rises before the next shift',
        title: 'Can the plant accept the additional demand?',
        intro: 'Compare production choices before committing a delivery date.',
        steps: [
          { type: 'Demand', title: 'A new order changes the production requirement.', copy: 'Demand, available stock and due dates enter planning together.', nodes: ['procure', 'produce'] },
          { type: 'AI + simulation', title: 'The twin compares capacity and sequence options.', copy: 'AI-assisted planning considers material, routing, labour and changeovers against the existing commitments.', nodes: ['planning', 'twin', 'iot'] },
          { type: 'Approval', title: 'The planner chooses a feasible option.', copy: 'The selected schedule is approved in planning; capacity assumptions remain visible.', nodes: ['approve', 'produce'] },
          { type: 'Customer promise', title: 'Sales receives a supported commitment.', copy: 'Production and supply dates inform the customer promise and approved commercial terms.', nodes: ['supply', 'revenue', 'finance'] },
        ],
      },
      {
        id: 'invoice',
        name: 'Delivery and invoice disagree',
        title: 'A delivered order and invoice show different quantities.',
        intro: 'See how revenue intelligence connects operational evidence to commercial resolution.',
        steps: [
          { type: 'Evidence', title: 'Delivery confirmation reaches finance.', copy: 'The shipment, received quantity and approved customer terms are matched to the order.', nodes: ['supply', 'revenue'] },
          { type: 'AI review', title: 'Revenue intelligence highlights the mismatch.', copy: 'The discrepancy is explained with the underlying lines and evidence; no invoice is silently rewritten.', nodes: ['finance', 'revenue'] },
          { type: 'Approval', title: 'Finance resolves the exception.', copy: 'An authorised adjustment updates the invoice and account, with the reason recorded.', nodes: ['revenue'] },
          { type: 'Feedback', title: 'The cause informs the next transaction.', copy: 'Recurring pricing or quantity issues return to the responsible process owner.', nodes: ['finance', 'procure', 'supply'] },
        ],
      },
    ] as { id: string; name: string; title: string; intro: string; steps: { type: string; title: string; copy: string; nodes: NodeId[] }[] }[],
  },
  inspector: {
    label: 'Selected architecture component',
    empty: {
      title: 'Select an AI capability or business stage.',
      body: 'See the records it uses, the decision it supports and the result it returns.',
      reads: 'Authoritative business and plant records',
      returns: 'A recommendation or controlled transaction',
    },
    readsLabel: 'Reads',
    returnsLabel: 'Returns',
    nodes: {
      sourcing: { title: 'Supplier intelligence', body: 'Identifies supplier changes that affect open production demand.', reads: 'Supplier dates, purchase orders, material demand', returns: 'Prioritised buyer review and alternate-source options' },
      planning: { title: 'Production intelligence', body: 'Compares feasible schedules using operational constraints and a calibrated digital twin.', reads: 'Orders, available capacity, machine actuals, process constraints', returns: 'Planner-reviewed schedule recommendation' },
      logistics: { title: 'Supply chain intelligence', body: 'Ranks allocation and delivery options against customer commitments.', reads: 'Sellable stock, orders, production dates, transport events', returns: 'Approved allocation, routing or revised delivery promise' },
      finance: { title: 'Revenue intelligence', body: 'Finds discrepancies across approved terms, delivered quantities and invoice records.', reads: 'Customer terms, approved prices, shipment and invoice lines', returns: 'Finance review queue and authorised correction' },
      procure: { title: 'Secure the inputs', body: 'Purchase orders · supplier commitments · incoming materials', reads: 'ERP purchasing · Supplier portal · Material requirements', returns: 'Confirmed purchase and supplier commitment' },
      produce: { title: 'Plan. Make. Verify.', body: 'Scheduling · machine execution · inspection and release', reads: 'APS planning · MES / SCADA / PLC · Quality & traceability', returns: 'Released job, production actuals and quality evidence' },
      supply: { title: 'Deliver the promise', body: 'Inventory allocation · warehousing · transport and delivery', reads: 'WMS / inventory · Transport management · Customer order status', returns: 'Confirmed allocation, shipment and delivery evidence' },
      revenue: { title: 'Close the commercial loop', body: 'Approved prices · delivery evidence · invoicing and collections', reads: 'CRM / pricing · ERP finance · Receivables', returns: 'Approved invoice, account status and reconciliation' },
      physical: { title: 'Physical plant', body: 'The actual assets and material flow are the reference for the model.', reads: 'Machine events, process measurements, inspection evidence', returns: 'Observed production behaviour' },
      iot: { title: 'IoT / edge context', body: 'Connect raw signals to the asset and job that produced them.', reads: 'Sensor values, timestamps, units and asset identity', returns: 'Contextualised events for analytics and the digital twin' },
      twin: { title: 'Digital twin + AI', body: 'Evaluate a proposed production change against a model calibrated to actual operation.', reads: 'Routing, capacity, buffers, material availability and observed performance', returns: 'Comparison of feasible plans and their assumptions' },
      approve: { title: 'Planner approval & execution', body: 'Simulation informs the choice; approved systems execute it.', reads: 'Scenario comparison and current operating constraints', returns: 'Released schedule and measured actuals' },
    } as Record<NodeId, Inspect>,
  },
  governance: {
    label: 'Governance across the architecture',
    items: ['Permissioned data', 'Approved business rules', 'Human escalation', 'Decision logs & evaluation'],
  },
}

/* ── 06 · Relevant work ──────────────────────────────────────────────────── */

export const work = {
  id: 'work',
  head: {
    eyebrow: 'Relevant work',
    lines: ['Manufacturing work', 'you can see.'],
    intro:
      'Mohawk Industries: connected operations across sustainability, commercial pricing and employee experience. Three distinct engagements, each with a clear business purpose.',
  } satisfies Head,
  featured: {
    eyebrow: 'Featured manufacturer',
    name: 'Mohawk Industries',
    body: 'Enterprise change reaches beyond the production line. It includes the recovered material, the approved dealer price and the information employees need.',
    areas: ['Recovery & sustainability', 'Commercial operations', 'Employee experience'],
  },
  roleLabel: 'UMM’s role',
  read: 'Read case study',
  cases: [
    {
      tag: 'Drawing / Rev. 04',
      eyebrow: 'Enterprise operations',
      name: 'Mohawk Recover',
      title: 'Recovery operations, connected from request to recycling.',
      body: 'UMM connected recovery requests, scheduling, logistics and reporting in a custom platform, helping teams trace activity through the recovery process.',
      role: ['Request and scheduling workflows', 'Logistics coordination', 'Recovery traceability', 'Sustainability reporting'],
      href: `${U}/casestudies/mohawk-recover/`,
      art: 'recover',
      tone: 'citrus',
    },
    {
      tag: 'Quote / Revision B',
      stamp: 'Approved',
      eyebrow: 'Pricing in the field',
      name: 'Mohawk PriceFX',
      title: 'Approved guidance where sales actually happens.',
      body: 'UMM built price-list search, creation, review and approval workflows, alongside a Windows application that keeps authorised pricing information available offline.',
      role: ['Pricing workflow design', 'Approvals', 'Offline application'],
      href: `${U}/casestudies/mohawk-pricefx/`,
      art: 'pricing',
      tone: 'sky',
    },
    {
      tag: 'Asset / 0042',
      eyebrow: 'Employee experience',
      name: 'Mohawk Benefits',
      title: 'Benefits information employees can navigate.',
      body: 'UMM organised and presented employee benefits information around the questions people needed to answer.',
      role: ['Information architecture', 'Navigation', 'Visual design'],
      href: `${U}/casestudies/mohawk-benefits/`,
      art: 'benefits',
      tone: 'blossom',
    },
  ],
}

/* ── 07 · Who we work with ───────────────────────────────────────────────── */

export const audiences = {
  id: 'audiences',
  head: {
    eyebrow: 'Who we work with',
    lines: ['Same order book.', 'Different constraints.'],
    intro:
      'A batch manufacturer releases material differently from an equipment maker releasing a configured machine. Choose the operating context closest to yours.',
  } satisfies Head,
  /* the order riding the belt through the four stations (the opening's) */
  order: 'SO-4471',
  items: [
    {
      name: 'Discrete manufacturers',
      title: 'Keep the right revision on the right line.',
      body: 'For plants building variants and assemblies: link changeovers, parts availability and quality checks to the job being released.',
      art: 'schedule',
      station: 'st-discrete',
      tone: 'sky',
    },
    {
      name: 'Process manufacturers',
      title: 'Know the status of each batch.',
      body: 'For batch and process teams: bring material condition, inspection evidence and release authority together before the next run.',
      art: 'quality',
      station: 'st-process',
      tone: 'sun',
    },
    {
      name: 'Industrial OEMs',
      title: 'Support the equipment after it leaves the plant.',
      body: 'For equipment makers: connect the as-built unit with field modifications, spares and warranty history.',
      art: 'service',
      station: 'st-oem',
      tone: 'blossom',
    },
    {
      name: 'Contract manufacturers & suppliers',
      title: 'Protect each customer’s specification.',
      body: 'For shared lines and tier suppliers: preserve customer-specific drawings, acceptance criteria and delivery commitments through each handoff.',
      art: 'records',
      station: 'st-contract',
      tone: 'citrus',
    },
  ] as const,
}

/* ── 08 · How AI is impacting the industry ───────────────────────────────── */

export type ImpactCard = {
  area: string
  title: string
  body: string
  /** "What makes this work" */
  info: string
  owner: string
  measures: string
  tone: Tone
}

export const impact = {
  id: 'how',
  head: {
    eyebrow: 'How AI is impacting the industry',
    lines: ['AI changes the decisions.', 'Across the whole operation.'],
    intro:
      'The opportunity spans procurement, production, supply chain and revenue. Each use needs the right operational context and a clear route from insight to approved action.',
  } satisfies Head,
  labels: {
    works: 'What makes this work',
    info: 'Connected information',
    owner: 'Decision owner',
    measure: 'Measure the effect',
  },
  cards: [
    {
      area: 'Procurement',
      title: 'Anticipate material risk.',
      body: 'Connect supplier notices, lead-time patterns and material demand to prioritise expediting or alternate-source reviews.',
      info: 'Supplier dates + purchase orders + bills of material',
      owner: 'Buyer approves supplier or purchase changes.',
      measures: 'Material-related stoppages · supplier delivery reliability',
      tone: 'sky',
    },
    {
      area: 'Planning & digital twins',
      title: 'Compare the plan before releasing it.',
      body: 'Simulate capacity and changeovers, then rank feasible schedules against delivery priorities and resource limits.',
      info: 'Orders + routings + capacity + IoT actuals',
      owner: 'Planner approves the production schedule.',
      measures: 'Schedule adherence · throughput · changeover time',
      tone: 'lilac',
    },
    {
      area: 'Quality',
      title: 'Detect variation earlier.',
      body: 'Combine vision inspection and process signals to flag patterns while there is still time to adjust the process.',
      info: 'Inspection images + tolerances + process conditions',
      owner: 'Quality teams own disposition and release.',
      measures: 'First-pass yield · scrap · missed defects',
      tone: 'sun',
    },
    {
      area: 'Asset reliability',
      title: 'Maintain against condition.',
      body: 'Use equipment signals and service history to prioritise interventions around a feasible production window.',
      info: 'Vibration + temperature + maintenance history',
      owner: 'Maintenance owns work orders and safe isolation.',
      measures: 'Unplanned downtime · repeat failures',
      tone: 'coral',
    },
    {
      area: 'Supply chain control',
      title: 'Replan around changing demand.',
      body: 'Compare inventory placement, transport and delivery options using current production and customer commitments.',
      info: 'Inventory + production dates + carrier events',
      owner: 'Supply teams approve reroutes and revised promises.',
      measures: 'On-time delivery · inventory exposure · freight cost',
      tone: 'citrus',
    },
    {
      area: 'Revenue operations',
      title: 'Find the gap between delivered and billed.',
      body: 'Match quotes, shipped quantities and customer terms to flag invoice discrepancies and prioritise resolution.',
      info: 'Approved prices + shipment evidence + invoice lines',
      owner: 'Finance approves corrections and commercial exceptions.',
      measures: 'Invoice accuracy · dispute cycle time',
      tone: 'blossom',
    },
  ] as ImpactCard[],
}

/* ── 09 · From pilots to operating impact ────────────────────────────────── */

export const rollout = {
  id: 'ai',
  head: {
    eyebrow: 'From pilots to operating impact',
    lines: ['Make AI part of', 'how production runs.'],
    intro: 'A repeatable route from one operational improvement to multiple lines and plants.',
  } satisfies Head,
  steps: [
    {
      title: 'Choose the production lever',
      body: 'Select a measurable constraint: scrap, changeover time, downtime or energy per unit. Establish the baseline with the plant owner.',
    },
    {
      title: 'Connect the right plant data',
      body: 'Join machine signals, quality records and production orders with consistent asset, lot and time references.',
    },
    {
      title: 'Validate across operating conditions',
      body: 'Check different shifts, materials and machine states. Use simulation or shadow operation before changing production decisions.',
    },
    {
      title: 'Embed and repeat',
      body: 'Put recommendations into planning, MES or maintenance workflows. Assign approval, monitoring and rollback, then adapt the pattern to the next line.',
    },
  ],
}

/* ── 10 · Work with UMM ──────────────────────────────────────────────────── */

export const contact = {
  id: 'contact',
  eyebrow: 'Work with UMM',
  lines: ['Which handoff holds', 'your plant back?'] as [string, string],
  body: 'Bring a delayed order, a quality hold or a repeat service visit. Let’s trace where the decision stalls.',
  cta: { label: 'Talk to our team', href: `${U}/contact/` },
  tag: 'Line 02 / Shift plan',
}
