import { eyeFilm } from '@/content/home'
import { reducedMotion } from './gl'
import type { MarkEngine, MarkHost } from './mark'

/* ============================================================================
   PEEK — the film peeking up from the foot of the hero (/home-peek)

   Santosh did not take to the wordmark across the top (31 Oct), so this
   layout has none: the headline and the ask bar hold the screen, and the
   reel rises into the bottom of it as a wide card, cut off by the edge of
   the screen as if it carries on below. Scrolling holds the hero while the
   card grows, its corners squaring and its edges reaching the sides, until
   the film fills the screen. Asking grows it the same way, on the way to
   RAGe.

   The card's place at rest is the stage (the last row of the hero); the
   card itself lies over the page in its layer, so it can grow past the
   page's edges. The film either plays in the peek, muted, or (?film=still)
   holds a still until the card fills the screen.
   ========================================================================== */

/** how far the hero holds while the card grows, in screen heights */
const RUNWAY = 1.2
/** the card's corners at rest (px) */
const RADIUS = 28
/** the still the film holds, in the live reel the collage of work (s) */
const STILL_AT = 19.5
/** when a held film starts, and stops again on the way back up */
const PLAY_AT = 0.6
const PAUSE_AT = 0.45

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export class Peek implements MarkEngine {
  private host: MarkHost
  private card = document.createElement('div')
  private video = document.createElement('video')
  private calm = reducedMotion()
  private hold: boolean
  private playing = false
  private grown = false
  private leaveAt = -1
  private raf = 0
  private dead = false
  private ro: ResizeObserver

  constructor(host: MarkHost) {
    this.host = host
    this.hold = host.film === 'still' || this.calm
    this.card.className = 'hx__peek'
    this.card.setAttribute('aria-hidden', 'true')

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
    if (this.hold) {
      v.addEventListener('loadedmetadata', () => (v.currentTime = Math.min(STILL_AT, v.duration - 0.1)), { once: true })
    } else {
      this.playing = true
      v.play().catch(() => {})
    }
    this.card.appendChild(v)
    host.layer.appendChild(this.card)

    this.ro = new ResizeObserver(this.layout)
    this.ro.observe(host.page)
    this.ro.observe(host.stage)
    window.addEventListener('resize', this.layout)
    window.addEventListener('scroll', this.queue, { passive: true })
    document.addEventListener('visibilitychange', this.onVisible)
    this.layout()
  }

  focus() {}

  leave() {
    this.leaveAt = performance.now()
    this.queue()
  }

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    window.removeEventListener('resize', this.layout)
    window.removeEventListener('scroll', this.queue)
    document.removeEventListener('visibilitychange', this.onVisible)
    this.video.pause()
    this.video.replaceChildren()
    this.video.load()
    const { run, page } = this.host
    run.style.removeProperty('height')
    page.style.removeProperty('top')
    page.style.removeProperty('--fade')
    page.removeAttribute('data-growing')
    this.card.remove()
  }

  /* --- the runway ----------------------------------------------------------- */

  private layout = () => {
    const { run, page } = this.host
    const vh = window.innerHeight
    const pageH = page.offsetHeight
    run.style.height = `${pageH + (this.calm ? 0 : Math.round(vh * RUNWAY))}px`
    page.style.top = `${Math.min(0, vh - pageH)}px`
    this.queue()
  }

  private queue = () => {
    if (!this.raf && !this.dead) this.raf = requestAnimationFrame(this.paint)
  }

  private onVisible = () => {
    if (document.hidden) this.video.pause()
    else if (this.playing) this.video.play().catch(() => {})
  }

  /* --- the card ------------------------------------------------------------- */

  private paint = () => {
    this.raf = 0
    if (this.dead) return
    const { run, page, stage } = this.host
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const pr = page.getBoundingClientRect()
    const sr = stage.getBoundingClientRect()

    /* how far the card has grown: the scroll down the runway, or the way out */
    const pin = Math.min(0, vh - page.offsetHeight)
    const runway = run.offsetHeight - page.offsetHeight
    let p = runway > 0 ? clamp01((pin - run.getBoundingClientRect().top) / runway) : 0
    let more = false
    if (this.leaveAt >= 0) {
      const l = clamp01((performance.now() - this.leaveAt) / 1300)
      p = Math.max(p, easeInOut(l))
      more = l < 1
    }
    const k = easeInOut(clamp01(p / 0.9))

    page.style.setProperty('--fade', (1 - clamp01(p * 2.2)).toFixed(3))
    if (p > 0.002 !== this.grown) {
      this.grown = p > 0.002
      page.toggleAttribute('data-growing', this.grown)
    }

    /* at rest: the stage's box, run on past the foot of the screen so its
       lower corners never show; grown: the screen */
    const x0 = sr.left - pr.left
    const y0 = sr.top - pr.top
    const w0 = sr.width
    const h0 = Math.max(sr.height, vh - sr.top + RADIUS * 2)
    const x1 = -pr.left
    const y1 = -pr.top
    const x = x0 + (x1 - x0) * k
    const y = y0 + (y1 - y0) * k
    const w = w0 + (vw - w0) * k
    const h = h0 + (vh - h0) * k
    const c = this.card.style
    c.left = `${x.toFixed(1)}px`
    c.top = `${y.toFixed(1)}px`
    c.width = `${w.toFixed(1)}px`
    c.height = `${h.toFixed(1)}px`
    c.borderRadius = `${(RADIUS * (1 - k)).toFixed(1)}px`
    c.zIndex = this.grown ? '30' : ''
    /* the film is laid out as the full card would be, centred on the part
       of the card that is on screen: the peek shows the middle of the frame,
       and the growing only uncovers more of it */
    const fh = Math.max(h, w * 0.5625)
    const seen = Math.max(1, Math.min(h, vh - (y + pr.top)))
    this.video.style.height = `${fh.toFixed(1)}px`
    this.video.style.top = `${Math.min(0, (seen - fh) / 2).toFixed(1)}px`

    /* a held film plays once the card fills the screen */
    if (this.hold && !this.calm) {
      if (!this.playing && p >= PLAY_AT) {
        this.playing = true
        this.video.play().catch(() => {})
      } else if (this.playing && p < PAUSE_AT) {
        this.playing = false
        this.video.pause()
      }
    }

    if (more) this.queue()
  }
}
