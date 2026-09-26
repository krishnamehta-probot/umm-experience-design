import { Icon, type IconProps } from './Icon'

export { Icon }
export type { IconProps }

/* ============================================================================
   THE UMM ICON SET
   Drawn on the grammar documented in Icon.tsx. Grouped by where they are used
   so the set stays navigable as it grows.
   ========================================================================== */

/* --- Wayfinding ---------------------------------------------------------- */

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
)

export const IconArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Icon>
)

export const IconArrowDownRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m7 7 10 10" />
    <path d="M17 7v10H7" />
  </Icon>
)

export const IconArrowDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v15" />
    <path d="m6 13 6 6 6-6" />
  </Icon>
)

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 9 7 7 7-7" />
  </Icon>
)

export const IconMenu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </Icon>
)

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6 18 18" />
    <path d="M18 6 6 18" />
  </Icon>
)

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
)

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Icon>
)

/** The journey node motif — a ring with a filled centre. */
export const IconNode = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
  </Icon>
)

/* --- Services ------------------------------------------------------------ */

/** CX strategy and assessment — a field being surveyed. */
export const IconCompass = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5.2-5.2 2 2-5.2z" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </Icon>
)

/** Journey mapping and redesign — a path through four moments. */
export const IconRoute = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 18c0-4 3-4 6-6s3-6 6-6" />
    <circle cx="4" cy="18" r="2" />
    <circle cx="20" cy="6" r="2" />
    <circle cx="11.5" cy="13" r="1.3" fill="currentColor" stroke="none" />
  </Icon>
)

/** Service and interaction design — interface planes over a service layer. */
export const IconLayers = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3 8 4.5-8 4.5-8-4.5z" />
    <path d="m4 12 8 4.5 8-4.5" />
    <path d="m4 16.5 8 4.5 8-4.5" />
  </Icon>
)

/** Data and personalisation — one person resolved from scattered signals. */
export const IconPersona = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    <circle cx="4" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="13" r="1" fill="currentColor" stroke="none" />
  </Icon>
)

/** Measurement and optimisation — a dial reading against a target. */
export const IconGauge = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 17a9 9 0 1 1 17 0" />
    <path d="m12 13 4.5-4" />
    <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
  </Icon>
)

/** Experience operations — a system that keeps running after launch. */
export const IconOrbit = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3a9 9 0 0 1 0 18" />
    <path d="M12 3a9 9 0 0 0 0 18" strokeDasharray="2.5 3" />
    <circle cx="12" cy="3" r="1.6" fill="currentColor" stroke="none" />
  </Icon>
)

/* --- Business stages ----------------------------------------------------- */

/** Enterprise — many teams, one standard. */
export const IconTower = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20h16" />
    <path d="M6 20V9l6-4 6 4v11" />
    <path d="M10 20v-5h4v5" />
    <path d="M9.5 11h5" />
  </Icon>
)

/** Growing company — channels rejoined. */
export const IconLink = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l2.8-2.8A4 4 0 0 0 12.8 5.5L11.4 7" />
    <path d="M14 10a4 4 0 0 0-5.7 0L5.5 12.8a4 4 0 0 0 5.7 5.7l1.4-1.4" />
  </Icon>
)

/** Startup — one flagship journey, proven fast. */
export const IconSpark = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3c0 4.5 1.5 6 4.5 6-3 0-4.5 1.5-4.5 6 0-4.5-1.5-6-4.5-6 3 0 4.5-1.5 4.5-6z" />
    <path d="M18.5 15.5c0 1.8.6 2.4 1.8 2.4-1.2 0-1.8.6-1.8 2.4 0-1.8-.6-2.4-1.8-2.4 1.2 0 1.8-.6 1.8-2.4z" />
  </Icon>
)

/* --- Technology ---------------------------------------------------------- */

/** Platforms we build within. */
export const IconStack = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="4" width="17" height="5" rx="1.5" />
    <rect x="3.5" y="15" width="17" height="5" rx="1.5" />
    <path d="M7 11.5h10" />
    <circle cx="7" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="7" cy="17.5" r="1" fill="currentColor" stroke="none" />
  </Icon>
)

/** Systems we connect to. */
export const IconPlug = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 3v5" />
    <path d="M15 3v5" />
    <path d="M6.5 8h11v3a5.5 5.5 0 0 1-11 0z" />
    <path d="M12 16.5V21" />
  </Icon>
)

/** Tools we design and research with. */
export const IconPen = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z" />
    <path d="m14.5 6.5 3 3" />
  </Icon>
)

/* --- Method -------------------------------------------------------------- */

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Icon>
)

export const IconMap = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3.5 6.5 5.5-2.5 6 2.5 5.5-2.5v13l-5.5 2.5-6-2.5-5.5 2.5z" />
    <path d="M9 4v13" />
    <path d="M15 6.5v13" />
  </Icon>
)

export const IconGrid = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <path d="M17 13.5v7" />
    <path d="M13.5 17h7" />
  </Icon>
)

export const IconShip = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v11" />
    <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
    <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
  </Icon>
)

export const IconLoop = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 11.5a8 8 0 0 0-13.7-5.2L4 8.5" />
    <path d="M4 12.5a8 8 0 0 0 13.7 5.2L20 15.5" />
    <path d="M4 4v4.5h4.5" />
    <path d="M20 20v-4.5h-4.5" />
  </Icon>
)

/* --- Evidence ------------------------------------------------------------ */

export const IconPrototype = (p: IconProps) => (
  <Icon {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M10.5 5.5h3" />
    <circle cx="12" cy="15" r="2" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconReport = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </Icon>
)

export const IconBlueprint = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
    <path d="M9 10v9" />
    <circle cx="15.5" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconRoadmap = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h9" />
    <path d="M4 12h14" />
    <path d="M4 17h6" />
    <circle cx="17" cy="7" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="17" r="1.6" fill="currentColor" stroke="none" />
  </Icon>
)

/* --- Assurance ----------------------------------------------------------- */

export const IconHandoff = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6.5" cy="7" r="3" />
    <circle cx="17.5" cy="7" r="3" />
    <path d="M3 20a3.5 3.5 0 0 1 7 0" />
    <path d="M14 20a3.5 3.5 0 0 1 7 0" />
    <path d="M10.5 13.5h3" />
    <path d="m12.2 12 1.5 1.5-1.5 1.5" />
  </Icon>
)

export const IconShield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
)

/* --- Sectors ------------------------------------------------------------- */

export const IconRetail = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 8h15l-1 12h-13z" />
    <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
  </Icon>
)

export const IconFinance = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 9 12 4l8.5 5" />
    <path d="M5.5 9v8" />
    <path d="M12 9v8" />
    <path d="M18.5 9v8" />
    <path d="M3.5 20h17" />
  </Icon>
)

export const IconHealth = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 12h4l2-4 3 8 2.5-4h5.5" />
  </Icon>
)

export const IconFactory = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 20V11l5.5 3.5V11l5.5 3.5V6h5.5v14z" />
    <path d="M3.5 20h17" />
  </Icon>
)

export const IconSignal = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6" />
    <path d="M15.8 8.2a5.4 5.4 0 0 1 0 7.6" />
    <path d="M5.4 18.6a9.4 9.4 0 0 1 0-13.2" />
    <path d="M18.6 5.4a9.4 9.4 0 0 1 0 13.2" />
  </Icon>
)

/* --- Registry -------------------------------------------------------------
   Lets the styleguide enumerate the set, and lets content files reference an
   icon by name rather than importing a component.
   ------------------------------------------------------------------------ */

export const iconRegistry = {
  arrowRight: IconArrowRight,
  arrowUpRight: IconArrowUpRight,
  arrowDownRight: IconArrowDownRight,
  arrowDown: IconArrowDown,
  chevronDown: IconChevronDown,
  menu: IconMenu,
  close: IconClose,
  plus: IconPlus,
  check: IconCheck,
  node: IconNode,
  compass: IconCompass,
  route: IconRoute,
  layers: IconLayers,
  persona: IconPersona,
  gauge: IconGauge,
  orbit: IconOrbit,
  tower: IconTower,
  link: IconLink,
  spark: IconSpark,
  stack: IconStack,
  plug: IconPlug,
  pen: IconPen,
  search: IconSearch,
  map: IconMap,
  grid: IconGrid,
  ship: IconShip,
  loop: IconLoop,
  prototype: IconPrototype,
  report: IconReport,
  blueprint: IconBlueprint,
  roadmap: IconRoadmap,
  handoff: IconHandoff,
  shield: IconShield,
  retail: IconRetail,
  finance: IconFinance,
  health: IconHealth,
  factory: IconFactory,
  signal: IconSignal,
} as const

export type IconName = keyof typeof iconRegistry
