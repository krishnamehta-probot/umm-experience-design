import * as THREE from 'three'
import { CITIES, geo, GLOBE_R, isLand, routeCurves } from './globe'
import { waveGrid, waveY } from './wave'

/* ============================================================================
   DOT FORMS — what the dot wave becomes when a chip is hovered

   One medium for the whole hero: fine dots. On arrival they lie in the dot
   wave; hovering a chip gathers them into a form that pictures the chip:

     lattice  "Architect data-rich solutions"   a crystal lattice of data
     warp     "Accelerate your transformation"  streaks rushing toward you
     spark    "Drive innovation through AI"     a core with neural filaments
     grid     "Build scalable solutions"        squares multiplying outward
     globe    "See how UMM delivers impact"     the earth, arcs between cities
     land     "Scale smarter"                   the wave rising into mountains

   Each builder returns the dots' positions and one number per dot (`t`)
   that the shaders use for that form's motion. Positions are in world units
   for a camera at z = 8; the object forms are centred on the origin and the
   scene places them, the field forms fill the frame as they are.
   ========================================================================== */

export type Form = { pos: Float32Array; t: Float32Array }

const rnd = Math.random

function form(n: number, fill: (set: (i: number, x: number, y: number, z: number, t?: number) => void) => void): Form {
  const pos = new Float32Array(n * 3)
  const t = new Float32Array(n)
  fill((i, x, y, z, v = 0) => {
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
    t[i] = v
  })
  return { pos, t }
}

/** A cube of nodes joined along every axis. t is 1 on a node, 0 on a link. */
export const LATTICE = { side: 6, step: 0.36 }
export function lattice(n: number) {
  const { side, step } = LATTICE
  const off = ((side - 1) * step) / 2
  const node = (a: number) => a * step - off
  return form(n, (set) => {
    for (let i = 0; i < n; i++) {
      const [a, b, c] = [0, 0, 0].map(() => Math.floor(rnd() * side))
      if (rnd() < 0.22) {
        const j = () => (rnd() - 0.5) * 0.035
        set(i, node(a) + j(), node(b) + j(), node(c) + j(), 1)
        continue
      }
      /* a point on the link from this node to its neighbour along one axis */
      const axis = Math.floor(rnd() * 3)
      const f = rnd() * step
      const p = [node(a), node(b), node(c)]
      if ([a, b, c][axis] === side - 1) p[axis] -= f
      else p[axis] += f
      set(i, p[0], p[1], p[2], 0)
    }
  })
}

/** Streaks spread around the line of sight, deep into the distance. t is
 *  the streak's own random number. Each streak is six dots along z. */
export function warp(n: number) {
  return form(n, (set) => {
    for (let i = 0; i < n; i += 6) {
      const a = rnd() * Math.PI * 2
      const r = 0.7 + Math.pow(rnd(), 0.7) * 7
      const z = -30 + rnd() * 36
      const id = rnd()
      for (let k = 0; k < 6 && i + k < n; k++) set(i + k, Math.cos(a) * r, Math.sin(a) * r * 0.62, z + k * 0.12, id)
    }
  })
}

/** A dense core with curling filaments reaching out to points of light.
 *  t is how far along its filament a dot is: 0 in the core, 1 at the tip. */
export function spark(n: number) {
  const fils = Array.from({ length: 46 }, () => {
    const dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize()
    const side = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).cross(dir).normalize()
    const len = 1.0 + rnd() * 0.8
    return new THREE.QuadraticBezierCurve3(
      dir.clone().multiplyScalar(0.28),
      dir.clone().multiplyScalar(len * 0.55).add(side.multiplyScalar(0.35)),
      dir.clone().multiplyScalar(len),
    )
  })
  return form(n, (set) => {
    for (let i = 0; i < n; i++) {
      const r = rnd()
      if (r < 0.24) {
        /* the core: dense in the middle, thinning out */
        const v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(0.3 * Math.pow(rnd(), 1.8))
        set(i, v.x, v.y, v.z, 0)
      } else if (r < 0.9) {
        const f = rnd()
        const q = fils[i % fils.length].getPoint(f)
        set(i, q.x, q.y, q.z, 0.15 + f * 0.85)
      } else {
        const q = fils[i % fils.length].getPoint(1)
        const j = () => (rnd() - 0.5) * 0.06
        set(i, q.x + j(), q.y + j(), q.z + j(), 1)
      }
    }
  })
}

/** Square outlines on the wave's plane, flat, around the middle of the
 *  frame. t is the square's ring, 0 in the middle to 1 at the edge, so the
 *  grid can appear from the centre outward. */
export const GRID = { size: 0.9, rings: 9, cz: -5 }
export function grid(n: number) {
  const { size, rings, cz } = GRID
  return form(n, (set) => {
    for (let i = 0; i < n; i++) {
      const gx = Math.floor(rnd() * (rings * 2 + 1)) - rings
      const gz = Math.floor(rnd() * (rings * 2 + 1)) - rings
      const ring = Math.max(Math.abs(gx), Math.abs(gz)) / rings
      /* a point on the square's outline, inset from its neighbours */
      const inset = size * 0.42
      const e = Math.floor(rnd() * 4)
      const f = (rnd() - 0.5) * 2 * inset
      const [ox, oz] = e === 0 ? [f, -inset] : e === 1 ? [inset, f] : e === 2 ? [f, inset] : [-inset, f]
      const x = gx * size + ox
      const z = cz + gz * size + oz
      set(i, x, waveY(z), z, ring)
    }
  })
}

/** The earth in dots: land dense, sea sparse, cities and data arcs. t is 0
 *  on the surface, 2 on a city, and 3 + the arc's index + its progress
 *  (0 to 1) along an arc. */
export function globe(n: number) {
  const arcs = routeCurves()
  const cities = CITIES.map(([la, lo]) => geo(la, lo, GLOBE_R))
  return form(n, (set) => {
    let i = 0
    const surf = Math.floor(n * 0.66)
    for (let tries = 0; i < surf && tries < n * 40; tries++) {
      const v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize()
      if (isLand(v) || rnd() < 0.07) {
        v.multiplyScalar(GLOBE_R)
        set(i++, v.x, v.y, v.z, 0)
      }
    }
    for (const end = i + Math.floor(n * 0.06); i < end; i++) {
      const c = cities[i % cities.length]
      const v = c.clone().add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.06)).setLength(GLOBE_R * 1.004)
      set(i, v.x, v.y, v.z, 2)
    }
    for (; i < n; i++) {
      const k = i % arcs.length
      const f = rnd()
      const q = arcs[k].getPoint(f)
      set(i, q.x, q.y, q.z, 3 + k + f * 0.999)
    }
  })
}

/** The wave's own grid, for the landing and for the land (the shaders lift
 *  it). t is 0. */
export function field(n: number, step = Math.sqrt(640 / n)) {
  const g = waveGrid(step, n)
  return form(n, (set) => {
    const m = g.length / 3
    for (let i = 0; i < n; i++) {
      const j = i % m
      set(i, g[j * 3], g[j * 3 + 1], g[j * 3 + 2])
    }
  })
}
