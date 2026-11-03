import { reducedMotion } from './gl'
import type { MarkEngine, MarkHost } from './mark'
import { ReelPlayer, makeReel } from './reel'

/* ============================================================================
   PEEK — the film peeking up from the foot of the hero (/home-peek)

   Santosh did not take to the wordmark across the top (31 Oct), so this
   layout has none: the headline and the ask bar hold the screen, and the
   reel rises into the bottom of it as a wide card, cut off by the edge of
   the screen as if it carries on below. Scrolling holds the hero while the
   card grows, its corners squaring and its edges reaching the sides, until
   the film fills the screen. Asking grows it the same way, on the way to
   RAGe.

   Krish (3 Nov): the peek has to make people want to scroll, the film still
   only playing once it fills the screen. So at rest the card is a screen
   leaning back as it rises out of the page: the film's opening still in it
   (public/home/reel-still.webp, so it is never an empty black slab), drifting
   slowly, its colours glowing onto the page round it, leaning a little to
   the cursor. A frosted play button sits on it, "Scroll to watch the film",
   and takes the visitor down to it on a click. Scrolling stands the card
   up, then grows it to the screen.

   The card's place at rest is the stage (the last row of the hero); the
   card itself lies over the page in its layer, so it can grow past the
   page's edges. The film plays from its start once the card fills the
   screen (reel.ts).
   ========================================================================== */

/** how far the hero holds while the card grows, in screen heights */
const RUNWAY = 1.2
/** the card's corners at rest (px) */
const RADIUS = 28
/** how far the card leans back at rest, and with the cursor on its button
 *  (deg); how far it turns to the cursor */
const TILT = 16
const TILT_NEAR = 8
const LEAN = 5
const STILL = '/home/reel-still.webp'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export class Peek implements MarkEngine {
  private host: MarkHost
  private card = document.createElement('div')
  private film = document.createElement('div')
  private still = document.createElement('img')
  private glow = document.createElement('div')
  private play = document.createElement('div')
  private video = makeReel()
  private reel = new ReelPlayer(this.video)
  private calm = reducedMotion()
  private grown = false
  private leaveAt = -1
  /* the cursor across the screen (0 to 1), and the lean eased toward it */
  private pointer = { x: 0.5, on: false }
  private lean = 0
  private near = false
  private tilt = TILT
  private last = performance.now()
  private raf = 0
  private dead = false
  private ro: ResizeObserver

  constructor(host: MarkHost) {
    this.host = host
    this.card.className = 'hx__peek'
    this.card.setAttribute('aria-hidden', 'true')
    this.film.className = 'hx__peek-film'
    this.still.className = 'hx__peek-still'
    this.still.src = STILL
    this.still.alt = ''
    this.still.decoding = 'async'
    this.film.append(this.video, this.still)
    this.card.appendChild(this.film)
    /* the still's colours, blurred, glowing onto the page under the card */
    this.glow.className = 'hx__peek-glow'
    this.glow.setAttribute('aria-hidden', 'true')
    this.glow.style.backgroundImage = `url(${STILL})`
    host.layer.append(this.glow, this.card)

    /* the invitation, on the card: a frosted play button and its line */
    this.play.className = 'hx__peek-play'
    this.play.innerHTML =
      '<button type="button" class="hx__peek-btn" aria-label="Watch the film"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></button><span class="hx__peek-say">Scroll to watch the film</span>'
    const btn = this.play.querySelector('button')!
    btn.addEventListener('click', this.onPlay)
    btn.addEventListener('pointerenter', this.onNear)
    btn.addEventListener('pointerleave', this.onFar)
    host.stage.appendChild(this.play)

    this.ro = new ResizeObserver(this.layout)
    this.ro.observe(host.page)
    this.ro.observe(host.stage)
    window.addEventListener('resize', this.layout)
    window.addEventListener('scroll', this.queue, { passive: true })
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
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
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisible)
    this.reel.dispose()
    const { run, page } = this.host
    run.style.removeProperty('height')
    page.style.removeProperty('top')
    page.style.removeProperty('--fade')
    page.removeAttribute('data-growing')
    this.card.remove()
    this.glow.remove()
    this.play.remove()
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
    if (!this.raf && !this.dead) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.paint)
    }
  }

  private onVisible = () => this.reel.visible(!document.hidden)

  /* --- input ---------------------------------------------------------------- */

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || this.calm) return
    this.pointer = { x: e.clientX / window.innerWidth, on: true }
    this.queue()
  }

  private onLeave = () => {
    this.pointer.on = false
    this.queue()
  }

  private onNear = () => {
    this.near = true
    this.queue()
  }

  private onFar = () => {
    this.near = false
    this.queue()
  }

  /** down the runway to the film, which plays once it fills the screen */
  private onPlay = () => {
    const { run, page } = this.host
    const top = run.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + run.offsetHeight - page.offsetHeight, behavior: this.calm ? 'auto' : 'smooth' })
  }

  /* --- the card ------------------------------------------------------------- */

  private paint = () => {
    this.raf = 0
    if (this.dead) return
    const now = performance.now()
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
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
      const l = clamp01((now - this.leaveAt) / 1300)
      p = Math.max(p, easeInOut(l))
      more = l < 1
    }
    const k = easeInOut(clamp01(p / 0.9))
    /* the card stands up over the first half of the runway */
    const up = easeInOut(clamp01(p / 0.5))

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

    /* leaning back at rest (less with the cursor on the play button), a
       little toward the cursor; standing up as the scroll begins */
    const e = 1 - Math.exp(-dt * 4)
    const tiltTo = this.calm ? 0 : this.near ? TILT_NEAR : TILT
    this.tilt += (tiltTo - this.tilt) * e
    const leanTo = this.pointer.on ? (this.pointer.x - 0.5) * 2 * LEAN : 0
    this.lean += (leanTo - this.lean) * e
    const rx = this.tilt * (1 - up)
    const ry = this.lean * (1 - up)
    c.transform = `perspective(1500px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
    const settling = Math.abs(tiltTo - this.tilt) > 0.02 || Math.abs(leanTo - this.lean) > 0.02

    /* the glow under the card, fading as it grows */
    const gs = this.glow.style
    gs.left = c.left
    gs.top = c.top
    gs.width = c.width
    gs.height = c.height
    gs.transform = c.transform
    gs.opacity = ((this.near ? 0.75 : 0.55) * (1 - clamp01(p * 3))).toFixed(3)

    /* the film is laid out as the full card would be, centred on the part
       of the card that is on screen: the peek shows the middle of the frame,
       and the growing only uncovers more of it */
    const fh = Math.max(h, w * 0.5625)
    const seen = Math.max(1, Math.min(h, vh - (y + pr.top)))
    this.film.style.height = `${fh.toFixed(1)}px`
    this.film.style.top = `${Math.min(0, (seen - fh) / 2).toFixed(1)}px`

    /* the film plays, from its start, once the card fills the screen; until
       then its opening still */
    if (!this.calm) this.reel.update(p)
    this.card.toggleAttribute('data-playing', this.reel.playing)

    if (more || settling) this.queue()
  }
}
