/* ============================================================================
   THE UMM MARK — its four quarter-circle pieces as path data (umm-mark.svg),
   for the pages that draw the mark themselves (Tiles, GlassMark, Window).
   ========================================================================== */

export const MARK_W = 1437.32
export const MARK_H = 460

export const MARK_PATHS = [
  'M229.972 0V230C102.976 230 0 127.011 0 0H229.972Z',
  'M689.915 0C689.915 254.022 483.962 460 229.972 460V230C356.967 230 459.943 127.011 459.943 0H689.915Z',
  'M1034.87 0V230C907.876 230 804.9 332.989 804.9 460H574.929C574.929 205.978 780.881 0 1034.87 0Z',
  'M1437.32 0V230C1435.98 230 1434.64 230 1433.3 230.064C1348.4 231.469 1274.74 278.939 1236.1 348.578C1217.76 381.608 1207.35 419.558 1207.35 460H977.379C977.379 379.181 998.204 303.217 1034.87 237.219C1036.15 234.856 1037.49 232.428 1038.9 230.064C1084.7 150.842 1153.43 86.5694 1236.1 46.2556C1296.85 16.6111 1365.14 0 1437.32 0Z',
]

/** The whole mark as one canvas path, in its own units */
export function markPath(): Path2D {
  const p = new Path2D()
  for (const d of MARK_PATHS) p.addPath(new Path2D(d))
  return p
}

/** The deepest point of the u's big quarter ring (its middle, half way
 *  round), and how far it is from the ring's edges: the place to dive in */
export const MARK_DEEP = { x: 474, y: 244, r: 115 }

/** A question being pointed at: which, on which side of the ask bar, and
 *  its centre on the screen (client px) */
export type Focus = { i: number; side: 'left' | 'right'; x: number; y: number }

/** What each of the flanking-question pages (HomeFlank) asks of its mark */
export interface MarkEngine {
  /** a question is being rested on, or none is */
  focus(q: Focus | null): void
  /** the visitor has asked: the mark plays its way out */
  leave(): void
  dispose(): void
}

/** The ground under the hero: white with the magenta glow (Glow.ts), or
 *  the live homepage's grey */
export type Ground = 'glow' | 'grey'

/** The elements a mark draws in: its stage, the page (the hero), a layer
 *  over the whole page under its copy, and the runway the page is held on
 *  as the visitor scrolls; and the ground it stands on */
export type MarkHost = { stage: HTMLElement; page: HTMLElement; layer: HTMLElement; run: HTMLElement; ground: Ground }

/** Where the mark sits in a box: contained, centred, `fill` of it at most */
export function fitMark(w: number, h: number, fill = 0.94) {
  const s = Math.min((w * fill) / MARK_W, (h * fill) / MARK_H)
  return { s, x: (w - MARK_W * s) / 2, y: (h - MARK_H * s) / 2, w: MARK_W * s, h: MARK_H * s }
}
