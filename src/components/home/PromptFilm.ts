import { reducedMotion } from './gl'
import type { MarkEngine, MarkHost } from './mark'
import { ReelPlayer, clamp01, easeInOut, holdRunway, makeReel, releaseRunway, runwayAt } from './reel'

/* ============================================================================
   PROMPT FILM — the film opening out of the send button (/home-prompt)

   The prompt hero's send button is a small black circle. Scrolling holds
   the hero while that circle opens out from the button, the film coming up
   inside it, until the film fills the screen and plays from its start;
   asking opens it the same way.

   The film lies over the whole screen in the page's layer and is cut to a
   circle about the button's middle (the stage); the button itself is drawn
   over it, transparent but for its arrow.
   ========================================================================== */

/** how far the hero holds while the circle opens, in screen heights */
const RUNWAY = 1.2

export class PromptFilm implements MarkEngine {
  private host: MarkHost
  private film = document.createElement('div')
  private video = makeReel()
  private reel = new ReelPlayer(this.video)
  private calm = reducedMotion()
  private leaveAt = -1
  private grown = false
  private raf = 0
  private dead = false
  private ro: ResizeObserver

  constructor(host: MarkHost) {
    this.host = host
    this.film.className = 'hx__circle'
    this.film.setAttribute('aria-hidden', 'true')
    this.film.appendChild(this.video)
    host.layer.appendChild(this.film)

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
    this.reel.dispose()
    releaseRunway(this.host.run, this.host.page)
    this.film.remove()
  }

  private layout = () => {
    holdRunway(this.host.run, this.host.page, this.calm ? 0 : RUNWAY)
    this.queue()
  }

  private queue = () => {
    if (!this.raf && !this.dead) this.raf = requestAnimationFrame(this.paint)
  }

  private onVisible = () => this.reel.visible(!document.hidden)

  private paint = () => {
    this.raf = 0
    if (this.dead) return
    const { run, page, stage } = this.host
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const pr = page.getBoundingClientRect()
    const br = stage.getBoundingClientRect()

    let p = runwayAt(run, page)
    let more = false
    if (this.leaveAt >= 0) {
      const l = clamp01((performance.now() - this.leaveAt) / 1300)
      p = Math.max(p, easeInOut(l))
      more = l < 1
    }
    const k = easeInOut(clamp01(p / 0.9))

    page.style.setProperty('--fade', (1 - clamp01(p * 2.4)).toFixed(3))
    if (p > 0.002 !== this.grown) {
      this.grown = p > 0.002
      page.toggleAttribute('data-growing', this.grown)
    }

    /* the film over the screen, cut to a circle about the button that opens
       until it reaches the furthest corner */
    const f = this.film.style
    f.left = `${-pr.left}px`
    f.top = `${-pr.top}px`
    f.width = `${vw}px`
    f.height = `${vh}px`
    f.zIndex = this.grown ? '30' : ''
    const cx = br.left + br.width / 2
    const cy = br.top + br.height / 2
    const r0 = br.width / 2
    const r1 = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 2
    const r = r0 + (r1 - r0) * k
    const clip = `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`
    f.clipPath = clip
    f.setProperty('-webkit-clip-path', clip)
    /* black at rest, the film coming up as the circle opens */
    this.video.style.opacity = clamp01(k * 5).toFixed(3)

    if (!this.calm) this.reel.update(p)
    if (more) this.queue()
  }
}
