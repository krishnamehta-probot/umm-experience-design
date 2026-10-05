/* ============================================================================
   CORNER PEEL — the geometry behind the service cards' turn

   A card is a sheet with a bite out of its bottom-right corner. Turning it
   peels the sheet back from that corner: a fold line sweeps across the card
   towards the top-left, everything between the corner and the fold lifts and
   turns over onto the rest of the sheet, and the far side of the card is
   uncovered underneath.

   Everything here is plain arithmetic on the card's size, so the component
   only has to measure, call these, and write the results into style. All
   coordinates are px from the card's top-left corner.
   ========================================================================== */

type Pt = [number, number]

export type PeelGeometry = {
  w: number
  h: number
  /** Outer corner radius. */
  r: number
  /** Side of the bite square. */
  n: number
  /** Radius of the bite's inside corner: half the bite, so the button
   *  circle centred in it sits an even distance from the curve. */
  nr: number
  /** Radius of the two small rounds where the bite meets the card's edges. */
  jr: number
  /** Unit direction the fold travels: from the bitten corner to the far one. */
  v: Pt
  /** Fold distance at which the sheet first lifts (the bite is empty). */
  d0: number
  /** Fold distance at which the whole sheet has turned. */
  d1: number
  /** CSS linear-gradient angle that runs along v. */
  angle: number
}

export function measurePeel(w: number, h: number, r: number, n: number): PeelGeometry {
  const nr = n / 2
  const jr = Math.min(20, n * 0.26)
  const len = Math.hypot(w, h) || 1
  const v: Pt = [-w / len, -h / len]
  const proj = (x: number, y: number) => (x - w) * v[0] + (y - h) * v[1]

  // The sheet's nearest edge to the corner is somewhere on the bite's
  // outline: sample it and start the fold just short of the closest point,
  // so the very first frame already moves paper.
  const arc = (cx: number, cy: number, rad: number, from: number, to: number) =>
    Array.from({ length: 9 }, (_, i) => {
      const a = ((from + ((to - from) * i) / 8) * Math.PI) / 180
      return proj(cx + rad * Math.cos(a), cy + rad * Math.sin(a))
    })
  const near = [
    ...arc(w - jr, h - n - jr, jr, 0, 90),
    ...arc(w - n + nr, h - n + nr, nr, 180, 270),
    ...arc(w - n - jr, h - jr, jr, 0, 90),
  ]
  const d0 = Math.max(0, Math.min(...near) - 1)
  // The far corner is rounded; its outermost point along v is the last
  // paper to turn.
  const d1 = proj(r, r) + r + 2
  const angle = ((Math.atan2(v[0], -v[1]) * 180) / Math.PI + 360) % 360

  return { w, h, r, n, nr, jr, v, d0, d1, angle }
}

/** The sheet's outline, bite included, as an SVG path for clip-path. */
export function sheetPath({ w, h, r, n, nr, jr }: PeelGeometry) {
  return (
    `M${r},0 H${w - r} A${r},${r} 0 0 1 ${w},${r} ` +
    `V${h - n - jr} A${jr},${jr} 0 0 1 ${w - jr},${h - n} ` +
    `H${w - n + nr} A${nr},${nr} 0 0 0 ${w - n},${h - n + nr} ` +
    `V${h - jr} A${jr},${jr} 0 0 1 ${w - n - jr},${h} ` +
    `H${r} A${r},${r} 0 0 1 0,${h - r} V${r} A${r},${r} 0 0 1 ${r},0 Z`
  )
}

/** Sutherland-Hodgman against one half-plane: keeps the part where f >= 0. */
function clip(poly: Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = []
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length]
    const fa = f(a)
    const fb = f(b)
    if (fa >= 0) out.push(a)
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb)
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  })
  return out
}

function polygon(pts: Pt[]) {
  if (pts.length < 3) return 'polygon(0 0, 0 0, 0 0)'
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`
}

export type PeelFrame = {
  /** clip-path for the part of the front still lying flat. */
  rest: string
  /** clip-path for the part that has lifted, in the sheet's own coordinates. */
  lifted: string
  /** Turns the lifted part over the fold line. */
  turn: string
  /** Where the fold is, measured from the bitten corner along v. */
  d: number
}

/**
 * One frame of the peel. `p` runs 0 (lying flat) to 1 (fully turned);
 * `lift` is how far short of flat the turned-over flap is held, in degrees,
 * which with the card's perspective is what makes it read as paper rather
 * than as a shape sliding over a shape.
 */
export function peelFrame(g: PeelGeometry, p: number, lift: number): PeelFrame {
  const d = g.d0 + (g.d1 - g.d0) * p
  const [vx, vy] = g.v
  const along = ([x, y]: Pt) => (x - g.w) * vx + (y - g.h) * vy
  // A few px past the card so no edge of the clip ever antialiases inside it.
  const box: Pt[] = [
    [-4, -4],
    [g.w + 4, -4],
    [g.w + 4, g.h + 4],
    [-4, g.h + 4],
  ]
  const mx = g.w + vx * d
  const my = g.h + vy * d
  return {
    rest: polygon(clip(box, (pt) => along(pt) - d)),
    lifted: polygon(clip(box, (pt) => d - along(pt))),
    // Rotating 180deg about the fold line lays the flap flat on the sheet,
    // mirrored across the fold; less than that holds it up off the paper.
    turn:
      `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px) ` +
      `rotate3d(${(-vy).toFixed(4)}, ${vx.toFixed(4)}, 0, ${(180 - lift).toFixed(1)}deg) ` +
      `translate(${(-mx).toFixed(1)}px, ${(-my).toFixed(1)}px)`,
    d,
  }
}
