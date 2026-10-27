/* ============================================================================
   AVOID — where the copy sits, so the landing scene can flow around it

   LiveHero measures every piece of text on the hero (logo, nav, ask bar,
   each chip, the headline, the film card, each pillar) and writes the boxes
   here, in the canvas's own 0-to-1 space with y up. The landing scene in
   every version reads them and keeps its lines out of them.
   ========================================================================== */

export const MAX_AVOID = 24

export const avoid = {
  /** x0, y0, x1, y1 per box, in canvas uv */
  rects: new Float32Array(MAX_AVOID * 4),
  count: 0,
  /** the canvas's width over its height when measured */
  aspect: 1,
  /** bumped on every measure, so a scene knows to rebuild */
  version: 0,
}

/** The pieces of copy the landing scene keeps clear of. */
const SELECTOR = [
  '.hm-nav__logo',
  '.hm-nav__links',
  '.hm-nav__cta',
  '.ha-dock__toggle',
  '.ha__ask',
  '.ha__chip',
  '.ha__title span',
  '.ha__film',
  '.ha__pillars li',
].join(',')

/** Measures the copy inside `root` against `canvas`, `pad` px around each. */
export function measureAvoid(root: HTMLElement, canvas: HTMLElement, pad = 14) {
  const c = canvas.getBoundingClientRect()
  if (!c.width || !c.height) return
  let n = 0
  root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    if (n >= MAX_AVOID) return
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    avoid.rects.set(
      [
        (r.left - pad - c.left) / c.width,
        1 - (r.bottom + pad - c.top) / c.height,
        (r.right + pad - c.left) / c.width,
        1 - (r.top - pad - c.top) / c.height,
      ],
      n * 4,
    )
    n++
  })
  avoid.count = n
  avoid.aspect = c.width / c.height
  avoid.version++
}
