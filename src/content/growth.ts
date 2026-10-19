import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import type { ServiceMark } from '@/content/cxUiDesign'

/* ============================================================================
   INTEGRATED GROWTH & STRATEGY — PAGE CONTENT

   Word for word from Krish's Integrated Growth and Strategy content doc
   (15 Oct 2026; updated 16 Oct: gensification, search and AI discovery,
   the growth system, the marketing factory, the toolkit, FAQ 07–11):
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
  lines: ['Gensify your marketing.'],
  accent: 'Engineer your growth.',
  tail: '',
  lead: 'Strategy, creativity, and AI working as one growth system. We connect SEO, paid ads, answer engine optimization (AEO), and large language model optimization (LLMO) with content production and lifecycle automation—so discovery, demand, and customer relationships move together.',
  primaryCta: 'Build your growth system',
  secondaryCta: 'Explore the growth architecture',
  secondaryHref: '#growth',
}

/** One commercial direction: the capabilities, on the ribbon */
export const ribbon = ['Growth strategy', 'Demand generation', 'Conversion & retention', 'Measurement & insight']

/* ── 2 · Why connection matters ───────────────────────────────────────────── */

export const why = {
  chip: 'Why connection matters',
  line1: 'Marketing has changed.',
  line2: 'Your operating model should, too.',
  /** the word in the headline the stickers merge into */
  one: 'model',
  /** Ten channels and teams, as stickers that fly together into "model". */
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
    { name: 'AI agents', x: 88, y: 78, r: -10, tone: 'blossom' as Tone },
  ],
  lead: 'Gensification means integrating generative AI and agentic workflows into the way marketing is planned, created, activated, and improved. We bring strategic planning, digital marketing, AI intelligence, and creative production into one accountable system.',
  pairs: [
    {
      title: 'Strategy sets the direction.',
      body: 'Define the market, customer, proposition, and commercial priority. Give people and AI workflows the same brief.',
      shape: 'triangle-5' as ShapeName,
      tone: 'sun' as Tone,
    },
    {
      title: 'People and agents move the work.',
      body: 'Specialists direct research, content, and campaign workflows. AI assists production and analysis; your brand standards guide what gets released.',
      shape: 'flower-15' as ShapeName,
      tone: 'sky' as Tone,
    },
    {
      title: 'Every response informs the next move.',
      body: 'Connect campaign signals with CRM and customer outcomes. Use that evidence to refine audiences, creative, and follow-up.',
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
      body: 'Audience-specific websites, academic recruitment campaigns, and email automation connected Biocon’s brand communication with clearer inquiry journeys.',
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
      body: 'Positioning and structured solution content translated iAdeptive’s AI and DevOps capabilities into a clearer digital experience for technical buyers.',
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
  cta: { label: 'Discuss this service', href: 'https://umm.digital/contact/' },
  items: [
    {
      step: 'Align',
      title: 'Growth strategy & commercial planning',
      body: 'Turn business ambitions into a set of choices: the audiences to pursue, the opportunities to prioritize and the investment needed to test them.',
      tags: ['Priorities', 'Markets', 'Roadmap'],
      more: '',
      includes: [
        'Business and market assessment',
        'Audience and opportunity prioritization',
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
      title: 'Demand generation & search visibility',
      body: 'Connect SEO, Google and Meta ads, AEO, and LLMO to the way your audience discovers and evaluates solutions. Align organic visibility, paid campaigns, and AI search with a clear path to conversion.',
      tags: ['SEO', 'Paid ads', 'AEO', 'LLMO'],
      more: '',
      includes: [
        'Technical SEO, on-page optimization, and search content strategy',
        'Google Ads, Meta, and LinkedIn campaign planning and management',
        'AEO question mapping and answer-led content',
        'LLMO brand representation and sampled AI visibility reviews',
        'Landing-page alignment, conversion tracking, and CRM outcome feedback',
      ],
      mark: 'journey' as ServiceMark,
      tone: 'sky' as Tone,
    },
    {
      step: 'Develop',
      title: 'Conversion & customer lifecycle',
      body: 'Help more interested people take the next step, then give customers a reason to stay. Address friction across inquiry, onboarding, purchase and repeat engagement.',
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

/* ── 4b · Gensify: the seventh service, as a wide card under the six ──────── */

export const gensify = {
  step: 'Gensify',
  title: 'AI-integrated marketing & content generation',
  body: 'Combine human creative direction with AI-assisted audience and keyword research, content briefs, ad variants, image and video production, and lifecycle messaging. Connect production to SEO, paid campaigns, and customer insights.',
  flowLabel: 'From a shared brief to reviewed assets',
  flow: ['Audience research', 'Campaign concepts', 'Content variants', 'Image & video', 'Brand review', 'Channel adaptation'],
  note: 'Specialists review facts, originality, brand voice, and intent. Performance signals guide the next brief and creative test.',
  tags: ['Creative direction', 'AI production', 'Quality control'],
  includesLabel: 'What the work can include',
  includes: [
    'AI-assisted audience, keyword, and topic research',
    'Search content briefs and reviewed content production',
    'Ad copy, image, and video creative variations',
    'AI-assisted segmentation and lifecycle workflows',
    'Editorial approval and performance feedback loops',
  ],
  scope: 'We agree the scope, responsibilities and measures around your growth priorities.',
  cta: { label: 'Discuss this service', href: 'https://umm.digital/contact/' },
}

/* ── 4c · Search, ads & AI discovery ─────────────────────────────────────── */

export type DiscoveryChannel = {
  id: 'seo' | 'ads' | 'aeo' | 'llmo'
  label: string
  title: string
  body: string
  points: string[]
  cta: string
  tone: Tone
}

export const discovery: {
  eyebrow: string
  line1: string
  line2: string
  accent: string
  lead: string
  /** the question every card's picture answers, in its own place */
  query: string
  channels: DiscoveryChannel[]
  note: string
} = {
  eyebrow: 'Search, ads & AI discovery',
  line1: 'Be found.',
  line2: 'Be understood. Be considered.',
  accent: 'Be considered.',
  lead: 'From search results and paid campaigns to the answers customers ask AI for.',
  query: 'growth system',
  channels: [
    {
      id: 'seo',
      label: 'SEO',
      title: 'Build your organic foundation.',
      body: 'Make your website accessible, relevant, and useful across the searches that matter to your business.',
      points: [
        'Technical SEO, crawlability, indexing, and site performance',
        'On-page optimization, internal linking, and relevant schema',
        'Search intent, topic research, and expert-led content',
        'Local or ecommerce SEO where relevant',
      ],
      cta: 'Strengthen organic discovery',
      tone: 'citrus',
    },
    {
      id: 'ads',
      label: 'Paid ads',
      title: 'Turn attention into qualified demand.',
      body: 'Connect media strategy, creative, landing pages, and customer outcomes in a measurable acquisition program.',
      points: [
        'Google Search, Shopping, and Performance Max where suitable',
        'Meta and LinkedIn campaigns matched to your audience',
        'Remarketing, audience exclusions, and creative testing',
        'Conversion tracking, lead-quality feedback, and budget reviews',
      ],
      cta: 'Connect your paid campaigns',
      tone: 'sun',
    },
    {
      id: 'aeo',
      label: 'AEO',
      title: 'Answer the questions behind the search.',
      body: 'Answer engine optimization makes your expertise easier to find and understand in question-led search and answer experiences.',
      points: [
        'Customer question and intent mapping',
        'Clear answers, comparisons, guides, and useful FAQs',
        'Original evidence and identifiable expert sources',
        'Relevant structured data that reflects visible content',
      ],
      cta: 'Build an answer-led content plan',
      tone: 'lilac',
    },
    {
      id: 'llmo',
      label: 'LLMO',
      title: 'Make your expertise clear in AI discovery.',
      body: 'Large language model optimization focuses on how your brand and content are represented in AI-generated answers and recommendations.',
      points: [
        'Consistent brand, product, and entity information',
        'Accessible source pages and credible supporting evidence',
        'Sampled brand mentions and citations across AI answers',
        'Content improvements informed by visibility gaps',
      ],
      cta: 'Assess your AI visibility',
      tone: 'sky',
    },
  ],
  note: 'SEO, AEO, and LLMO share foundations: accessible pages, useful original content, and trustworthy information. We measure visibility and qualified outcomes; rankings, AI mentions, and citations cannot be guaranteed.',
}

/* ── 4d · Different business models ──────────────────────────────────────── */

export const industries = {
  eyebrow: 'Different business models. Different growth priorities.',
  items: [
    { title: 'B2B & SaaS', body: 'Account journeys, qualified pipeline, lead nurture, and sales alignment.', tone: 'sky' as Tone },
    { title: 'Retail & commerce', body: 'Product discovery, acquisition, retention, and repeat engagement.', tone: 'sun' as Tone },
    { title: 'Education', body: 'Program discovery, applicant journeys, and inquiry follow-up.', tone: 'coral' as Tone },
    {
      title: 'Life sciences & technology',
      body: 'Specialist audiences, evidence-led storytelling, and reviewed communications.',
      tone: 'citrus' as Tone,
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
      services: ['Channel and journey alignment', 'Lifecycle programs', 'Shared performance reporting'],
      cta: { label: 'Discuss your next stage', href: 'https://umm.digital/contact/' },
      tone: 'sky' as Tone,
    },
    {
      tab: 'Enterprises',
      flow: ['Align', 'Govern', 'Expand'],
      title: 'Keep a shared direction across teams and markets.',
      body: 'Coordinate commercial priorities across business units, platforms and partners. Establish common measures and decision-making while allowing for local customers and market conditions.',
      services: ['Cross-market strategy', 'Measurement and governance', 'Connected growth operations'],
      cta: { label: 'Discuss your growth program', href: 'https://umm.digital/contact/' },
      tone: 'coral' as Tone,
    },
  ],
}

/* ── 6 · The thinking behind the growth ───────────────────────────────────── */

export type GrowthWorkflow = {
  id: 'discovery' | 'paid' | 'lifecycle' | 'content'
  label: string
  eyebrow: string
  title: string
  body: string
  /** "What the workflow does", one step per arrow in the doc */
  does: string[]
  controls: string
}

export const growthSystem: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead: string
  board: {
    label: string
    eyebrow: string
    tag: string
    direction: { label: string; title: string; items: string[] }
    signals: { label: string; nodes: { title: string; body: string }[]; link: string }
    engine: { label: string; title: string; sub: string; modules: { title: string; body: string }[]; guard: string[] }
    channels: { label: string; nodes: { title: string; body: string }[]; link: string }
    measure: { label: string; title: string; chain: string[]; loop: string }
    across: { label: string; items: string[] }
  }
  workflowsLabel: string
  workflowsLead: string
  doesLabel: string
  controlsLabel: string
  workflows: GrowthWorkflow[]
  factory: {
    eyebrow: string
    line1: string
    line2: string
    lead: string
    steps: { label: string; title: string; body: string }[]
  }
} = {
  chip: 'The thinking behind the growth',
  line1: 'Your marketing.',
  line2: 'Built to learn.',
  accent: 'Built to learn.',
  lead: 'A connected automation architecture. From customer signal to the next decision.',
  board: {
    label: 'The UMM growth system',
    eyebrow: 'The UMM growth system',
    tag: 'Human direction + AI execution',
    direction: {
      label: 'Commercial direction',
      title: 'One brief. Shared priorities.',
      items: ['Audience and positioning', 'Brand context', 'Business goals', 'Budgets and permissions'],
    },
    signals: {
      label: '01 Customer signals',
      nodes: [
        { title: 'CRM & sales', body: 'Lead stages, account context, customer outcomes' },
        { title: 'Web & commerce', body: 'Intent, engagement, transactions, product interest' },
        { title: 'Brand & search knowledge', body: 'Customer questions, search intent, expert sources, approved claims' },
      ],
      link: 'Permissioned data connects these sources to the intelligence and orchestration layer.',
    },
    engine: {
      label: '02 Intelligence and orchestration',
      title: 'The growth engine.',
      sub: 'Connect the context. Coordinate the action.',
      modules: [
        { title: 'Audience intelligence', body: 'Segment, qualify, and identify relevant next steps' },
        { title: 'Creative production', body: 'Research, draft, adapt, and review campaign assets' },
        { title: 'Journey orchestration', body: 'Route leads, trigger nurture, and sync eligible audiences' },
        { title: 'Experiment planning', body: 'Test search, creative, landing pages, and paid-media hypotheses' },
      ],
      guard: ['Human review', 'Brand standards', 'Release controls'],
    },
    channels: {
      label: '03 Channel activation',
      nodes: [
        { title: 'Google · Meta · LinkedIn Ads', body: 'Paid search, paid social, eligible audiences, and remarketing' },
        { title: 'Email · CRM · Sales', body: 'Newsletters, nurture, routing, and follow-up' },
        { title: 'SEO · AEO · LLMO', body: 'Organic search, AI discovery, and useful source content' },
      ],
      link: 'Approved actions connect the engine to channel activation.',
    },
    measure: {
      label: '04 Measurement and feedback',
      title: 'Responses return as intelligence.',
      chain: [
        'Search visibility',
        'sampled AI mentions',
        'campaign performance',
        'CRM outcomes',
        'shared reporting',
        'the next content, audience, and investment decision',
      ],
      loop: 'Feedback returns to the brief and the growth engine.',
    },
    across: {
      label: 'Across the architecture',
      items: ['Consent and suppression', 'Data quality', 'Access controls', 'Accountable owners'],
    },
  },
  workflowsLabel: 'Follow a workflow through the system',
  workflowsLead: 'Choose a priority to see the connections.',
  doesLabel: 'What the workflow does',
  controlsLabel: 'What people control',
  workflows: [
    {
      id: 'discovery',
      label: 'SEO, AEO and LLMO',
      eyebrow: 'From customer questions to search and AI discovery',
      title: 'Connect what people ask with what your brand knows.',
      body: 'Bring SEO, AEO, and LLMO into one discovery program, grounded in your expertise and the questions that shape buying decisions.',
      does: [
        'Search demand and customer questions',
        'technical and content assessment',
        'expert-led answers and source pages',
        'organic search and AI discovery',
        'visibility, sampled citations, and qualified visits inform the next improvement',
      ],
      controls:
        'Specialists prioritize topics, review factual accuracy, validate relevant schema, and evaluate results. AI visibility is sampled and variable; inclusion is not guaranteed.',
    },
    {
      id: 'paid',
      label: 'Paid ads and remarketing',
      eyebrow: 'From customer context to relevant demand',
      title: 'Let customer signals sharpen your targeting.',
      body: 'Connect CRM outcomes with campaign decisions, so audience planning learns from the customers and opportunities that matter.',
      does: [
        'CRM and website signals',
        'audience analysis',
        'eligibility and suppression checks',
        'approved Google Ads or Meta audience sync',
        'campaign responses and qualified outcomes return to reporting',
      ],
      controls:
        'People approve audience definitions, creative, budget, and activation rules. Consent and platform eligibility determine which records can be used.',
    },
    {
      id: 'lifecycle',
      label: 'Lead nurture and lifecycle',
      eyebrow: 'From first inquiry to an ongoing relationship',
      title: 'Keep the next step connected to the customer.',
      body: 'Use customer context to coordinate timely follow-up across marketing and sales, from early interest to retention and expansion.',
      does: [
        'Lead or customer event',
        'CRM context',
        'segment and journey rules',
        'reviewed email, newsletter, sales task, or consented AI-assisted calling workflow',
        'response and lifecycle status return to the CRM',
      ],
      controls:
        'Teams set routing, message approval, contact preferences, frequency, and escalation rules. Sales owns the conversation when a human response is needed.',
    },
    {
      id: 'content',
      label: 'Content and campaign production',
      eyebrow: 'From brand knowledge to campaign learning',
      title: 'Scale the production. Keep the creative judgment.',
      body: 'Turn a shared strategy into a coordinated stream of useful content, with AI supporting production and specialists protecting the idea.',
      does: [
        'Brand brief and approved sources',
        'AI-assisted research and concepts',
        'copy, image, and video variants',
        'editorial review',
        'channel adaptation and approved publishing',
        'performance informs the next brief',
      ],
      controls:
        'People own the concept, factual accuracy, originality, brand voice, and release. AI output is reviewed before it becomes public-facing content.',
    },
  ],
  factory: {
    eyebrow: 'The marketing factory model',
    line1: 'Creative direction.',
    line2: 'Repeatable delivery.',
    lead: 'We organize marketing as a connected production system: specialists shape the brief, AI workflows assist the work, and approved assets move into channels with feedback built in.',
    steps: [
      { label: 'Brief', title: 'Strategy & brand context', body: 'People define the audience, message, objective, and constraints.' },
      { label: 'Produce', title: 'AI-assisted creation', body: 'Agents support research, copy, imagery, video, and format variations.' },
      { label: 'Review', title: 'Specialist judgment', body: 'Teams check facts, originality, brand fit, and channel readiness.' },
      { label: 'Activate & learn', title: 'A connected release', body: 'Approved workflows publish, measure, and return learning to the next brief.' },
    ],
  },
}

/* ── 6b · A visible connected toolkit (the tools wheel) ───────────────────── */

export const tools = {
  chip: 'A visible connected toolkit',
  line1: 'Creative tools.',
  line2: 'Commercial infrastructure.',
  accent: 'Commercial infrastructure.',
  lead: 'We select and connect platforms around your current stack, permissions, and growth priorities. Each tool has a defined role in the workflow.',
  groups: [
    {
      label: 'AI & Creative Production',
      tone: 'blossom' as Tone,
      items: ['OpenAI', 'Gemini', 'Higgsfield', 'Veo'],
      about: 'Research, drafting, creative exploration, and image or video production.',
    },
    {
      label: 'Demand & Distribution',
      tone: 'sun' as Tone,
      items: ['Google Ads', 'Meta', 'LinkedIn', 'Semrush'],
      about: 'Paid search and social, SEO research, competitor insights, and campaign planning.',
    },
    {
      label: 'Customer & Workflows',
      tone: 'sky' as Tone,
      items: ['HubSpot', 'Salesforce', 'n8n', 'Make'],
      about: 'Customer context, lifecycle communication, routing, and platform connections.',
    },
    {
      label: 'Measurement & Learning',
      tone: 'citrus' as Tone,
      items: ['Search Console', 'GA4', 'Looker Studio', 'Power BI'],
      about: 'Organic search performance, conversion measurement, CRM outcomes, and AI visibility review.',
    },
  ],
  note: 'Audience activation depends on consent, platform eligibility, and available integrations. AI-assisted recommendations operate within agreed business rules.',
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
      title: 'Prioritize',
      body: 'Choose the opportunities to pursue and the assumptions to test first.',
      get: 'A focused growth roadmap',
    },
    {
      title: 'Activate',
      body: 'Connect specialists, AI production workflows, campaigns, and customer journeys around the brief.',
      get: 'A connected delivery plan',
    },
    {
      title: 'Learn',
      body: 'Bring campaign responses and CRM outcomes into the next creative and commercial decision.',
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
      body: 'Connect teams, journeys and systems around a wider program.',
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
      'Yes. We can develop the plan, support selected workstreams or coordinate an ongoing program. The scope sets out which campaigns, content, experiences, technology and reporting activities are included.',
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
      'We agree a baseline and measures that reflect the business model. These may include qualified inquiries, conversion, acquisition cost, retention and customer value. We also document attribution limits and the time needed to observe change.',
  },
  {
    question: 'How quickly can we expect results?',
    answer:
      'Timing depends on the starting point, buying cycle, channels, and scope. We agree delivery milestones and review periods, then assess commercial progress against a baseline. Forecasts use your data and stated assumptions.',
  },
  {
    question: 'What do you mean by gensification?',
    answer:
      'Integrating generative AI and agentic workflows into marketing operations. We connect brand knowledge, customer context, content production, channel activity, and measurement, with specialists directing the work and reviewing releases.',
  },
  {
    question: 'How do you keep AI content useful and on brand?',
    answer:
      'We start with a clear brief, source material, brand guidance, and a defined audience. People review facts, originality, tone, and relevance before release. The aim is purposeful creative work, supported by a repeatable production process.',
  },
  {
    question: 'How do SEO, AEO, and LLMO work together?',
    answer:
      'SEO builds the technical and content foundation for discovery. AEO focuses on answering customer questions clearly. LLMO examines how your brand and expertise appear in AI-generated answers. We coordinate these overlapping disciplines around useful content, credible evidence, accessible pages, and measurable customer journeys.',
  },
  {
    question: 'Do you manage paid ads as well as organic search?',
    answer:
      'Yes. Scope can include Google Ads, Meta, and LinkedIn, alongside SEO and AI discovery work. We align campaign structure, audiences, creative, landing pages, tracking, and budget decisions with your business model and lead or customer quality.',
  },
  {
    question: 'How do you measure visibility in AI answers?',
    answer:
      'We review a defined set of relevant questions across selected AI experiences and record brand mentions, citations, and linked sources where available. These are sampled observations that vary by query, platform, and time. We assess them alongside organic performance, referral traffic where identifiable, and qualified outcomes.',
  },
]

export const closing = {
  eyebrow: 'Your next growth priority',
  lines: ['Ready to gensify your marketing?'],
  accent: 'Let’s build the system.',
  lead: 'Bring your growth priorities, your current stack, and the workflows holding your team back. We’ll define where strategy, creativity, and AI can work together.',
  primaryCta: { label: 'Let’s plan your next stage', href: 'https://umm.digital/contact/' },
  faqLabel: 'A few things you may want to know',
}
