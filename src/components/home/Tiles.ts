import { reducedMotion } from './gl'
import { fitMark, markPath, type Focus, type MarkEngine, type MarkHost } from './mark'

/* ============================================================================
   TILES — the UMM mark as a board of quarter-circle tiles (/home-tiles)

   The stage is a board of square cells. Each cell holds one tile: off (a dot
   on the paper), a full square, a quarter disc set in one of its corners, or
   the square with a quarter disc cut from one corner, or a half square (for
   the straight edges that fall across a cell). Any drawing can be set on
   the board by sampling it cell by cell and picking, for each cell, the tile
   whose four quarters best match it: the mark, and six pictures, one for each
   question.

   Every change of picture is a wave of flips, each tile turning over to show
   its new face, travelling out from wherever it began: from the left when a
   question on the left is rested on, from the right for one on the right.
   The tiles near the cursor tilt toward it, the dots under it lift into faint
   tiles, and now and then one tile turns over by itself.
   ========================================================================== */

const INK = [16, 14, 20]
const PAPER = [196, 194, 200]

/* the tiles: 0 off, 1 full, 2-5 a quarter disc in corner TL, TR, BR, BL,
   6-9 the square with that quarter disc cut away, 10-13 the left, top,
   right or bottom half */
const KINDS = 14
const CORNERS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]
/* the arc of each corner's quarter disc, from one edge round to the other */
const ARCS: [number, number][] = [
  [0, Math.PI / 2],
  [Math.PI / 2, Math.PI],
  [Math.PI, Math.PI * 1.5],
  [Math.PI * 1.5, Math.PI * 2],
]

/** how much of each quarter (TL, TR, BR, BL) of a cell each tile covers */
const COVER: number[][] = (() => {
  const n = 12
  const out: number[][] = []
  for (let k = 0; k < KINDS; k++) {
    const q = [0, 0, 0, 0]
    for (let j = 0; j < n * 2; j++) {
      for (let i = 0; i < n * 2; i++) {
        const x = ((i + 0.5) / n - 1) /* -1..1 */
        const y = ((j + 0.5) / n - 1)
        const quad = y < 0 ? (x < 0 ? 0 : 1) : x < 0 ? 3 : 2
        q[quad] += inside(k, x, y) ? 1 : 0
      }
    }
    out.push(q.map((v) => v / (n * n)))
  }
  return out
})()

function inside(k: number, x: number, y: number) {
  if (k === 0) return false
  if (k === 1) return true
  if (k >= 10) return [x < 0, y < 0, x > 0, y > 0][k - 10]
  const [cx, cy] = CORNERS[(k - 2) % 4]
  const near = (x - cx) ** 2 + (y - cy) ** 2 < 4
  return k < 6 ? near : !near
}

type Box = { x: number; y: number; w: number; h: number }

/* The six pictures, one per question (the order of asciiChips), each drawn in
   ink into the mark's own box. They are coarse on purpose: the board is
   about fourteen tiles tall. */
const PICTURES: ((c: CanvasRenderingContext2D, b: Box) => void)[] = [
  /* Architect data-rich solutions: a skyline, the tallest tower in the middle */
  (c, b) => {
    const u = b.h
    const hs = [0.42, 0.68, 0.5, 1, 0.78, 0.56, 0.36]
    const bw = u * 0.19
    const gap = u * 0.08
    const total = hs.length * bw + (hs.length - 1) * gap
    let x = b.x + (b.w - total) / 2
    for (const [i, h] of hs.entries()) {
      const top = b.y + b.h * (1 - h)
      c.beginPath()
      if (i % 2) {
        c.rect(x, top, bw, b.h * h)
      } else {
        /* every other tower with a quarter-round crown */
        c.moveTo(x, b.y + b.h)
        c.lineTo(x, top + bw)
        c.arc(x + bw, top + bw, bw, Math.PI, Math.PI * 1.5)
        c.lineTo(x + bw, b.y + b.h)
        c.closePath()
      }
      c.fill()
      x += bw + gap
    }
  },
  /* Accelerate your digital transformation: three chevrons, gathering pace */
  (c, b) => {
    const u = b.h
    const cy = b.y + b.h / 2
    const sizes = [0.5, 0.72, 1]
    const w = u * 0.15
    let x = b.x + b.w / 2 - u * 0.95
    c.lineWidth = w
    c.lineJoin = 'miter'
    c.lineCap = 'butt'
    for (const s of sizes) {
      const half = (u * s) / 2 - w / 2
      c.beginPath()
      c.moveTo(x, cy - half)
      c.lineTo(x + half, cy)
      c.lineTo(x, cy + half)
      c.stroke()
      x += u * 0.24 + half * 0.6
    }
  },
  /* Drive innovation through AI: the spark, a large one and a small one */
  (c, b) => {
    const u = b.h
    const star = (x: number, y: number, r: number) => {
      const k = r * 0.14
      c.beginPath()
      c.moveTo(x, y - r)
      c.quadraticCurveTo(x + k, y - k, x + r, y)
      c.quadraticCurveTo(x + k, y + k, x, y + r)
      c.quadraticCurveTo(x - k, y + k, x - r, y)
      c.quadraticCurveTo(x - k, y - k, x, y - r)
      c.fill()
    }
    const cx = b.x + b.w / 2
    star(cx - u * 0.12, b.y + u * 0.55, u * 0.45)
    star(cx + u * 0.48, b.y + u * 0.24, u * 0.22)
  },
  /* Build scalable solutions for the future: four squares, each larger */
  (c, b) => {
    const u = b.h
    const sizes = [0.24, 0.44, 0.68, 0.96]
    const gap = u * 0.1
    const total = sizes.reduce((a, s) => a + s * u, 0) + gap * (sizes.length - 1)
    let x = b.x + (b.w - total) / 2
    const base = b.y + b.h * 0.98
    for (const s of sizes) {
      c.fillRect(x, base - s * u, s * u, s * u)
      x += s * u + gap
    }
  },
  /* See how UMM delivers impact: a drop and its ripples */
  (c, b) => {
    const u = b.h
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    c.beginPath()
    c.arc(cx, cy, u * 0.13, 0, Math.PI * 2)
    c.fill()
    c.lineWidth = u * 0.09
    for (const r of [0.3, 0.45]) {
      c.beginPath()
      c.arc(cx, cy, u * r, 0, Math.PI * 2)
      c.stroke()
    }
  },
  /* Scale smarter with UMM's AI: the quarter, growing out of its corner */
  (c, b) => {
    const u = b.h
    const ox = b.x + b.w / 2 - u * 0.5
    const oy = b.y + b.h
    const bands: [number, number][] = [
      [0, 0.28],
      [0.4, 0.62],
      [0.74, 1],
    ]
    for (const [r0, r1] of bands) {
      c.beginPath()
      c.arc(ox, oy, r1 * u, -Math.PI / 2, 0)
      if (r0) c.arc(ox, oy, r0 * u, 0, -Math.PI / 2, true)
      else c.lineTo(ox, oy)
      c.closePath()
      c.fill()
    }
  },
]

const FLIP = 0.8 /* s, one tile turning over */
const SPEED = 1.15 /* s for a wave to cross the board */

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export class Tiles implements MarkEngine {
  private canvas = document.createElement('canvas')
  private ctx = this.canvas.getContext('2d')!
  private stage: HTMLElement
  private calm = reducedMotion()
  private dpr = 1
  private w = 0
  private h = 0
  private cell = 20
  private ox = 0
  private oy = 0
  private cols = 0
  private rows = 0
  private markBox: Box = { x: 0, y: 0, w: 0, h: 0 }
  private mark = new Uint8Array(0)
  private pics: (Uint8Array | null)[] = PICTURES.map(() => null)
  /* each tile: the face it shows, the face it turns to, and when it starts */
  private from = new Uint8Array(0)
  private to = new Uint8Array(0)
  private start = new Float32Array(0)
  private tilt = new Float32Array(0)
  private showing: 'mark' | number | 'none' = 'none'
  private origin = { x: 0, y: 0 }
  private pointer = { x: -1e4, y: -1e4, on: false }
  private soft = { x: -1e4, y: -1e4 }
  private nextTwinkle = 2.5
  private raf = 0
  private timer = 0
  private dead = false
  private last = 0
  private t0 = performance.now()
  private t = 0
  private ro: ResizeObserver
  private visible = true
  private io: IntersectionObserver

  constructor(host: MarkHost) {
    this.stage = host.stage
    this.canvas.className = 'hx__gl'
    this.canvas.setAttribute('aria-hidden', 'true')
    this.stage.appendChild(this.canvas)
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(this.stage)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      this.wake()
    })
    this.io.observe(this.stage)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.wake)
    this.resize()
    /* the mark turns in from the left, as the print did */
    this.origin = { x: -this.cell * 6, y: this.h / 2 }
    this.show('mark', this.calm ? 0 : 0.35)
    this.wake()
  }

  focus(q: Focus | null) {
    if (this.showing === 'none') return
    if (q) {
      const r = this.canvas.getBoundingClientRect()
      this.origin = { x: q.side === 'left' ? -this.cell * 4 : this.w + this.cell * 4, y: q.y - r.top }
      this.show(q.i)
    } else {
      this.show('mark')
    }
  }

  leave() {
    this.origin = { x: this.w / 2, y: this.h + this.cell * 6 }
    this.show('none', 0, 0.6)
  }

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    window.clearTimeout(this.timer)
    this.ro.disconnect()
    this.io.disconnect()
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.wake)
    this.canvas.remove()
  }

  /* --- the board ------------------------------------------------------------ */

  private resize() {
    const r = this.stage.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = r.width
    this.h = r.height
    this.canvas.width = Math.round(r.width * this.dpr)
    this.canvas.height = Math.round(r.height * this.dpr)

    /* the mark about fourteen tiles tall, its corner on a tile's corner */
    const m = fitMark(r.width, r.height, 0.94)
    const tall = Math.max(9, Math.min(15, Math.round(m.h / 25)))
    this.cell = m.h / tall
    this.ox = m.x - Math.ceil(m.x / this.cell) * this.cell
    this.oy = m.y - Math.ceil(m.y / this.cell) * this.cell
    this.cols = Math.ceil((r.width - this.ox) / this.cell)
    this.rows = Math.ceil((r.height - this.oy) / this.cell)
    this.markBox = { x: m.x - this.ox, y: m.y - this.oy, w: m.w, h: m.h }

    const n = this.cols * this.rows
    const was = this.showing
    this.mark = this.sample((c, b) => {
      c.translate(b.x, b.y)
      c.scale(b.h / 460, b.h / 460)
      c.fill(markPath())
    })
    this.pics = PICTURES.map(() => null)
    this.from = new Uint8Array(n)
    this.to = new Uint8Array(n)
    this.start = new Float32Array(n).fill(-1)
    this.tilt = new Float32Array(n)
    /* a resize lands on the picture at once, without a wave */
    if (was !== 'none') {
      const target = this.target(was)
      this.from.set(target)
      this.to.set(target)
    }
  }

  /** a drawing set on the board: the tile that best matches each cell */
  private sample(draw: (c: CanvasRenderingContext2D, b: Box) => void) {
    const S = 8
    const cv = document.createElement('canvas')
    cv.width = this.cols * S
    cv.height = this.rows * S
    const c = cv.getContext('2d', { willReadFrequently: true })!
    c.fillStyle = c.strokeStyle = '#000'
    c.scale(S / this.cell, S / this.cell)
    draw(c, this.markBox)
    const px = c.getImageData(0, 0, cv.width, cv.height).data
    const out = new Uint8Array(this.cols * this.rows)
    const half = S / 2
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const q = [0, 0, 0, 0]
        for (let y = 0; y < S; y++) {
          for (let x = 0; x < S; x++) {
            const a = px[((j * S + y) * cv.width + i * S + x) * 4 + 3] / 255
            q[y < half ? (x < half ? 0 : 1) : x < half ? 3 : 2] += a
          }
        }
        for (let k = 0; k < 4; k++) q[k] /= half * half
        let best = 0
        let err = Infinity
        for (let k = 0; k < KINDS; k++) {
          let e = 0
          for (let s = 0; s < 4; s++) e += (COVER[k][s] - q[s]) ** 2
          /* a slight lean toward plain squares and plain paper */
          if (k > 1) e += 0.02
          if (e < err) {
            err = e
            best = k
          }
        }
        out[j * this.cols + i] = best
      }
    }
    return out
  }

  private target(what: 'mark' | number | 'none') {
    if (what === 'none') return new Uint8Array(this.cols * this.rows)
    if (what === 'mark') return this.mark
    return (this.pics[what] ??= this.sample(PICTURES[what]))
  }

  /** set a picture going: each tile turns once the wave reaches it */
  private show(what: 'mark' | number | 'none', after = 0, pace = 1) {
    if (what === this.showing) return
    this.showing = what
    this.t = (performance.now() - this.t0) / 1000
    const target = this.target(what)
    const span = Math.hypot(this.w, this.h)
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const n = j * this.cols + i
        const x = this.ox + (i + 0.5) * this.cell
        const y = this.oy + (j + 0.5) * this.cell
        /* what the tile shows right now is where it turns from */
        const s = this.start[n]
        const now = s >= 0 && this.t >= s + FLIP / 2 ? this.to[n] : this.from[n]
        if (now === target[n] && s < 0) continue
        this.from[n] = now
        this.to[n] = target[n]
        if (this.calm) {
          this.from[n] = target[n]
          this.start[n] = -1
          continue
        }
        const d = Math.hypot(x - this.origin.x, y - this.origin.y) / span
        this.start[n] = this.t + after + d * SPEED * pace + Math.random() * 0.08
      }
    }
    this.wake()
  }

  /* --- input ---------------------------------------------------------------- */

  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect()
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, on: true }
    if (this.soft.x < -1e3) this.soft = { x: this.pointer.x, y: this.pointer.y }
    this.wake()
  }

  private onLeave = () => {
    this.pointer.on = false
  }

  private wake = () => {
    if (!this.raf && !this.dead && this.visible && !document.hidden) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  /* --- drawing -------------------------------------------------------------- */

  private frame = (now: number) => {
    this.raf = 0
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    this.t = (now - this.t0) / 1000
    const busy = this.draw(dt)
    if (busy) this.raf = requestAnimationFrame(this.frame)
    else if (!this.calm) {
      /* asleep until the next tile turns over by itself */
      window.clearTimeout(this.timer)
      this.timer = window.setTimeout(this.wake, Math.max(0, (this.nextTwinkle - this.t) * 1000))
    }
  }

  private draw(dt: number) {
    const { ctx, cell, cols, rows } = this
    const k = 1 - Math.exp(-dt * 6)
    this.soft.x += (this.pointer.x - this.soft.x) * k
    this.soft.y += (this.pointer.y - this.soft.y) * k

    /* now and then one tile of the picture turns over by itself */
    if (!this.calm && this.showing !== 'none' && this.t >= this.nextTwinkle) {
      this.nextTwinkle = this.t + 1.6 + Math.random() * 2.2
      const target = this.target(this.showing)
      for (let tries = 0; tries < 40; tries++) {
        const n = Math.floor(Math.random() * target.length)
        if (target[n] && this.start[n] < 0) {
          this.from[n] = this.to[n] = target[n]
          this.start[n] = this.t
          break
        }
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

    const reach = cell * 5.5
    const half = (cell - Math.max(1, cell * 0.06)) / 2
    let busy = false

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const n = j * cols + i
        const x = this.ox + (i + 0.5) * cell
        const y = this.oy + (j + 0.5) * cell

        /* the tilt toward the cursor */
        const dx = this.soft.x - x
        const dy = this.soft.y - y
        const d = Math.hypot(dx, dy)
        const want = this.pointer.on && d < reach ? (1 - d / reach) ** 2 * 0.55 : 0
        this.tilt[n] += (want - this.tilt[n]) * k
        const tl = this.tilt[n]
        if (Math.abs(want - tl) > 0.002) busy = true

        /* the flip */
        let face = this.from[n]
        let sx = 1
        let flipShade = 0
        const s = this.start[n]
        if (s >= 0) {
          const u = (this.t - s) / FLIP
          if (u >= 1) {
            this.from[n] = this.to[n]
            this.start[n] = -1
            face = this.to[n]
          } else {
            busy = true
            if (u > 0) {
              const th = ease(u) * Math.PI
              sx = Math.abs(Math.cos(th))
              face = th < Math.PI / 2 ? this.from[n] : this.to[n]
              flipShade = Math.sin(th) * 0.45
            }
          }
        }

        if (!face) {
          /* the paper: a dot, lifting into a faint tile under the cursor */
          ctx.fillStyle = `rgba(${INK[0]},${INK[1]},${INK[2]},${(0.13 + tl * 0.2).toFixed(3)})`
          if (tl > 0.04) {
            const r = half * Math.min(1, tl * 1.6)
            ctx.fillRect(x - r, y - r, r * 2, r * 2)
          } else {
            const r = Math.max(0.8, cell * 0.05)
            ctx.fillRect(x - r, y - r, r * 2, r * 2)
          }
          continue
        }

        const shade = Math.min(1, flipShade + tl * 0.7)
        const c = INK.map((v, m) => Math.round(v + (PAPER[m] - v) * shade))
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`
        ctx.save()
        ctx.translate(x, y)
        if (tl > 0.002) {
          const a = Math.atan2(dy, dx)
          ctx.rotate(a)
          ctx.scale(1 - tl, 1)
          ctx.rotate(-a)
        }
        if (sx < 1) ctx.scale(Math.max(0.001, sx), 1)
        this.tile(face, half)
        ctx.restore()
      }
    }
    return busy || (this.pointer.on && Math.hypot(this.pointer.x - this.soft.x, this.pointer.y - this.soft.y) > 0.5)
  }

  /** one tile, centred on the origin, `h` from its middle to its edge */
  private tile(kind: number, h: number) {
    const { ctx } = this
    ctx.beginPath()
    if (kind === 1) {
      ctx.rect(-h, -h, h * 2, h * 2)
    } else if (kind >= 10) {
      const side = kind - 10
      ctx.rect(side === 2 ? 0 : -h, side === 3 ? 0 : -h, side % 2 ? h * 2 : h, side % 2 ? h : h * 2)
    } else {
      const corner = (kind - 2) % 4
      const [cx, cy] = CORNERS[corner]
      const [a0, a1] = ARCS[corner]
      if (kind < 6) {
        ctx.moveTo(cx * h, cy * h)
        ctx.arc(cx * h, cy * h, h * 2, a0, a1)
      } else {
        ctx.arc(cx * h, cy * h, h * 2, a0, a1)
        ctx.lineTo(-cx * h, -cy * h)
      }
      ctx.closePath()
    }
    ctx.fill()
  }
}
