import { eyeFilm } from '@/content/home'
import { reducedMotion } from './gl'
import { MARK_DEEP, MARK_H, MARK_W, fitMark, markPath, type Focus, type MarkEngine, type MarkHost } from './mark'

/* ============================================================================
   WINDOW — the UMM mark cut out of the page, the film behind it (/home-window)

   The page is a sheet of paper with the mark cut clean through it, and the
   film lies behind the sheet, seen only through the letters: held on a
   still at rest, it plays once the dive has brought it to the middle of the
   screen (Krish, 30 Oct), and holds again on the way back up. The cut has
   depth: its edge throws a soft shadow into the letters on the side the light
   comes from and catches a thin line of light on the far side, and the film
   sits a little further back than the paper, so it shifts against the
   letters as the cursor moves. The cursor is the light.

   Scrolling dives into the mark: the hero holds while the letters grow out of
   the deepest point of the u's quarter ring, which drifts to the middle of
   the screen, until the film fills the screen. Asking dives the same way, on
   the way to RAGe.
   ========================================================================== */

const INK = '#100e14'
/** how far the hero holds while the visitor dives, in screen heights */
const RUNWAY = 1.3
/** the still the film holds until the dive (s): in the live reel, the
 *  collage of work tilted across the frame, which fills every letter */
const STILL_AT = 19.5
/** how far into the dive the film plays, and pauses again on the way back */
const PLAY_AT = 0.55
const PAUSE_AT = 0.4

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** a canvas of `colour` everywhere but the mark, the mark's edge softened by
 *  `blur` (device px), the mark at `s` device px per unit, with `pad` around */
function inverse(s: number, pad: number, blur: number, colour: string) {
  const cv = document.createElement('canvas')
  cv.width = Math.ceil(MARK_W * s + pad * 2)
  cv.height = Math.ceil(MARK_H * s + pad * 2)
  const c = cv.getContext('2d')!
  c.fillStyle = colour
  c.fillRect(0, 0, cv.width, cv.height)
  c.globalCompositeOperation = 'destination-out'
  if (blur > 0) {
    /* the mark drawn far off the canvas, its blurred shadow thrown back */
    c.shadowColor = '#000'
    c.shadowBlur = blur
    c.shadowOffsetX = cv.width * 4
    c.setTransform(s, 0, 0, s, pad - cv.width * 4, pad)
  } else {
    c.setTransform(s, 0, 0, s, pad, pad)
  }
  c.fill(markPath())
  return cv
}

export class Window implements MarkEngine {
  private canvas = document.createElement('canvas')
  private ctx = this.canvas.getContext('2d')!
  private video = document.createElement('video')
  private path = markPath()
  private host: MarkHost
  private calm = reducedMotion()
  private dpr = 1
  /* the mark at rest, in the page's px */
  private rest = { x: 0, y: 0, s: 1 }
  private shade: HTMLCanvasElement | null = null
  private shine: HTMLCanvasElement | null = null
  private pad = 0
  private pointer = { x: 0, y: 0, on: false }
  private look: { x: number; y: number } | null = null
  private light = { x: 0, y: 0 }
  private par = { x: 0, y: 0 }
  private t0 = performance.now()
  private last = performance.now()
  private leaveAt = -1
  private raf = 0
  private dead = false
  private grown = false
  private playing = false
  private ro: ResizeObserver

  constructor(host: MarkHost) {
    this.host = host
    this.canvas.className = 'hx__window'
    this.canvas.setAttribute('aria-hidden', 'true')
    host.layer.appendChild(this.canvas)

    const v = this.video
    v.muted = true
    v.loop = true
    v.playsInline = true
    v.preload = 'auto'
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    for (const [src, type] of [
      ['/home/eye.mp4', 'video/mp4'],
      [eyeFilm, 'video/webm'],
    ]) {
      const s = document.createElement('source')
      s.src = src
      s.type = type
      v.appendChild(s)
    }
    v.addEventListener('loadedmetadata', () => (v.currentTime = Math.min(STILL_AT, v.duration - 0.1)), { once: true })

    this.ro = new ResizeObserver(() => this.layout())
    this.ro.observe(host.page)
    this.ro.observe(host.stage)
    window.addEventListener('resize', this.layout)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.onVisible)
    this.layout()
    this.wake()
  }

  focus(q: Focus | null) {
    if (!q) {
      this.look = null
      return
    }
    const r = this.canvas.getBoundingClientRect()
    this.look = { x: q.x - r.left, y: q.y - r.top }
  }

  leave() {
    this.leaveAt = (performance.now() - this.t0) / 1000
  }

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    window.removeEventListener('resize', this.layout)
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisible)
    this.video.pause()
    this.video.removeAttribute('src')
    this.video.replaceChildren()
    this.video.load()
    const { run, page } = this.host
    run.style.removeProperty('height')
    page.style.removeProperty('top')
    page.style.removeProperty('--fade')
    page.removeAttribute('data-growing')
    this.canvas.remove()
  }

  /* --- the runway and the mark at rest ------------------------------------- */

  private layout = () => {
    const { run, page, stage } = this.host
    const vh = window.innerHeight
    const pageH = page.offsetHeight
    run.style.height = `${pageH + (this.calm ? 0 : Math.round(vh * RUNWAY))}px`
    page.style.top = `${Math.min(0, vh - pageH)}px`

    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pw = page.offsetWidth
    this.canvas.width = Math.round(pw * this.dpr)
    this.canvas.height = Math.round(pageH * this.dpr)

    /* the stage's place in the page, ignoring the page's own hold */
    const pr = page.getBoundingClientRect()
    const sr = stage.getBoundingClientRect()
    const m = fitMark(sr.width, sr.height, 0.94)
    this.rest = { x: sr.left - pr.left + m.x, y: sr.top - pr.top + m.y, s: m.s }
    const ds = m.s * this.dpr
    this.pad = Math.ceil(60 * this.dpr)
    this.shade = inverse(ds, this.pad, 22 * this.dpr, 'rgba(8,6,12,0.9)')
    this.shine = inverse(ds, this.pad, 1.2 * this.dpr, 'rgba(255,255,255,0.95)')
    if (!this.pointer.on) this.light = { x: this.rest.x + MARK_W * m.s * 0.2, y: this.rest.y - 120 }
    this.wake()
  }

  /* --- input ---------------------------------------------------------------- */

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = this.canvas.getBoundingClientRect()
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, on: true }
  }

  private onLeave = () => {
    this.pointer.on = false
  }

  private onVisible = () => {
    if (document.hidden) this.video.pause()
    else if (this.playing) this.video.play().catch(() => {})
    this.wake()
  }

  private wake = () => {
    if (!this.raf && !this.dead && !document.hidden) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  /* --- drawing -------------------------------------------------------------- */

  private frame = (now: number) => {
    this.raf = 0
    if (this.dead || document.hidden) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const t = (now - this.t0) / 1000
    const { ctx, canvas, rest, host, video } = this
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pr = host.page.getBoundingClientRect()

    /* how far into the dive: the scroll down the runway, or the way out */
    const pin = Math.min(0, vh - host.page.offsetHeight)
    const runway = host.run.offsetHeight - host.page.offsetHeight
    let p = runway > 0 ? clamp01((pin - host.run.getBoundingClientRect().top) / runway) : 0
    if (this.leaveAt >= 0) p = Math.max(p, easeInOut(clamp01((t - this.leaveAt) / 1.3)))
    const k = easeInOut(clamp01(p / 0.92))

    /* the film plays only once it is in the middle of the screen */
    if (!this.playing && p >= PLAY_AT && !this.calm) {
      this.playing = true
      video.play().catch(() => {})
    } else if (this.playing && p < PAUSE_AT) {
      this.playing = false
      video.pause()
    }

    host.page.style.setProperty('--fade', (1 - clamp01(p * 2.4)).toFixed(3))
    if (p > 0.002) {
      if (!this.grown) host.page.setAttribute('data-growing', '')
      this.grown = true
    } else if (this.grown) {
      host.page.removeAttribute('data-growing')
      this.grown = false
    }

    /* the light: the question being rested on, else the cursor, else a
       slow drift above the mark */
    const mw = MARK_W * rest.s
    const mh = MARK_H * rest.s
    const drift = {
      x: rest.x + mw * (0.5 + Math.sin(t * 0.19) * 0.45),
      y: rest.y - mh * (0.25 + Math.sin(t * 0.13 + 2) * 0.2),
    }
    const at = this.look ?? (this.pointer.on ? this.pointer : this.calm ? this.light : drift)
    const kl = 1 - Math.exp(-dt * 2.5)
    this.light.x += (at.x - this.light.x) * kl
    this.light.y += (at.y - this.light.y) * kl

    /* the mark now: grown out of the u's deepest point toward the middle */
    const cx = vw / 2 - pr.left
    const cy = vh / 2 - pr.top
    const d0x = rest.x + MARK_DEEP.x * rest.s
    const d0y = rest.y + MARK_DEEP.y * rest.s
    const s1 = (Math.hypot(vw, vh) / 2 / MARK_DEEP.r) * 1.08
    const s = rest.s * Math.pow(s1 / rest.s, k)
    const ox = d0x + (cx - d0x) * k - MARK_DEEP.x * s
    const oy = d0y + (cy - d0y) * k - MARK_DEEP.y * s

    /* the film sits behind the paper: it shifts against the cut */
    const lx = (this.light.x - (rest.x + mw / 2)) / Math.max(1, mw / 2)
    const ly = (this.light.y - (rest.y + mh / 2)) / Math.max(1, mh)
    const kp = 1 - Math.exp(-dt * 1.8)
    this.par.x += (Math.max(-1.2, Math.min(1.2, lx)) * -0.025 * vw - this.par.x) * kp
    this.par.y += (Math.max(-1.2, Math.min(1.2, ly)) * -0.03 * vh - this.par.y) * kp

    /* in: the letters print in ink, then open onto the film */
    const ink = this.calm ? 1 : easeOut(clamp01((t - 0.15) / 0.9))
    const open = this.calm ? 1 : easeOut(clamp01((t - 1.1) / 1.6))

    const d = this.dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.style.zIndex = p > 0.002 ? '30' : ''

    ctx.save()
    ctx.setTransform(d * s, 0, 0, d * s, d * ox, d * oy)
    ctx.clip(this.path)
    ctx.setTransform(d, 0, 0, d, 0, 0)

    ctx.globalAlpha = ink
    ctx.fillStyle = INK
    ctx.fillRect(ox, oy, MARK_W * s, MARK_H * s)

    if (video.readyState >= 2 && video.videoWidth) {
      /* the film covers the screen, a touch larger at rest for the shift */
      const zoom = 1 + 0.07 * (1 - k)
      const cover = Math.max(vw / video.videoWidth, vh / video.videoHeight) * zoom
      const fw = video.videoWidth * cover
      const fh = video.videoHeight * cover
      ctx.globalAlpha = open
      ctx.drawImage(
        video,
        -pr.left + (vw - fw) / 2 + this.par.x * (1 - k),
        -pr.top + (vh - fh) / 2 + this.par.y * (1 - k),
        fw,
        fh,
      )
    }

    /* the cut's edge: a soft shadow on the side of the light, a thin line of
       light on the far side; both go as the letters grow past the screen */
    const depth = (1 - clamp01(k * 4)) * ink
    if (depth > 0.01 && this.shade && this.shine) {
      const dx = rest.x + mw / 2 - this.light.x
      const dy = rest.y + mh / 2 - this.light.y
      const len = Math.hypot(dx, dy) || 1
      const reach = Math.max(8, Math.min(24, len * 0.035))
      const ux = (dx / len) * reach
      const uy = (dy / len) * reach
      const g = s / rest.s
      const pad = this.pad / d
      ctx.globalAlpha = 0.75 * depth
      ctx.drawImage(this.shade, ox + (ux - pad) * g, oy + (uy - pad) * g, (this.shade.width / d) * g, (this.shade.height / d) * g)
      ctx.globalAlpha = 0.55 * depth
      ctx.drawImage(
        this.shine,
        ox + (-ux * 0.12 - pad) * g,
        oy + (-uy * 0.12 - pad) * g,
        (this.shine.width / d) * g,
        (this.shine.height / d) * g,
      )
    }
    ctx.restore()

    this.raf = requestAnimationFrame(this.frame)
  }
}
