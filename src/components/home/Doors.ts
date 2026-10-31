import { reducedMotion } from './gl'
import { glowNow } from './Glow'
import type { Focus, MarkEngine, MarkHost } from './mark'
import { ReelPlayer, clamp01, easeInOut, holdRunway, makeReel, releaseRunway, runwayAt } from './reel'

/* ============================================================================
   DOORS — the hero as two doors, light leaking through the seam (/home-doors)

   The hero is two halves meeting down the middle of the screen (top and
   bottom on a phone), the headline split across the seam, the questions on
   the left on the left door and those on the right on the right, the ask
   bar laid over the seam like a handle. The doors stand a few pixels apart,
   and the shader's light (Glow.ts) shows through the crack and spills a
   little onto their inner edges, in whatever colour it has turned to.

   The crack widens as the cursor comes near it, and a door eases back when
   a question on it is rested on. Scrolling swings the doors open onto the
   film, which fills the screen and plays from its start; asking opens them
   too.

   The engine only sets numbers on the page (--hx-gap, --hx-nl, --hx-nr,
   --hx-open, --hx-leak, --hx-spill); home-flank.css turns them into the
   doors' movement, on either axis.
   ========================================================================== */

/** how far the hero holds while the doors open, in screen heights */
const RUNWAY = 1.3
/** the crack at rest, and at most with the cursor at it (px) */
const GAP = 8
const GAP_NEAR = 26
/** how far a door eases back when a question on it is rested on (px) */
const NUDGE = 34

export class Doors implements MarkEngine {
  private host: MarkHost
  private film = document.createElement('div')
  private video = makeReel()
  private reel = new ReelPlayer(this.video)
  private calm = reducedMotion()
  private pointer = { x: 0, y: 0, on: false }
  private side: Focus['side'] | null = null
  private gap = GAP
  private nl = 0
  private nr = 0
  private leaveAt = -1
  private grown = false
  private last = performance.now()
  private raf = 0
  private dead = false
  private ro: ResizeObserver

  constructor(host: MarkHost) {
    this.host = host
    this.film.className = 'hx__doors-film'
    this.film.setAttribute('aria-hidden', 'true')
    this.film.appendChild(this.video)
    host.layer.appendChild(this.film)

    this.ro = new ResizeObserver(this.layout)
    this.ro.observe(host.page)
    window.addEventListener('resize', this.layout)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.onVisible)
    this.layout()
    this.wake()
  }

  focus(q: Focus | null) {
    this.side = q?.side ?? null
  }

  leave() {
    this.leaveAt = performance.now()
  }

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    window.removeEventListener('resize', this.layout)
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisible)
    this.reel.dispose()
    const { run, page } = this.host
    releaseRunway(run, page)
    for (const k of ['--hx-gap', '--hx-nl', '--hx-nr', '--hx-open', '--hx-leak', '--hx-spill']) page.style.removeProperty(k)
    this.film.remove()
  }

  private layout = () => {
    holdRunway(this.host.run, this.host.page, this.calm ? 0 : RUNWAY)
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    this.pointer = { x: e.clientX, y: e.clientY, on: true }
  }

  private onLeave = () => {
    this.pointer.on = false
  }

  private onVisible = () => {
    this.reel.visible(!document.hidden)
    this.wake()
  }

  private wake = () => {
    if (!this.raf && !this.dead && !document.hidden) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  private frame = (now: number) => {
    this.raf = 0
    if (this.dead || document.hidden) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const { page, run } = this.host

    let p = runwayAt(run, page)
    if (this.leaveAt >= 0) p = Math.max(p, easeInOut(clamp01((now - this.leaveAt) / 1300)))
    const k = easeInOut(clamp01(p / 0.9))

    /* the crack: wider with the cursor near it (on whichever axis the seam
       runs), a door eased back for a question rested on */
    const vw = window.innerWidth
    const vh = window.innerHeight
    const across = vw > 760
    let near = 0
    if (this.pointer.on && !this.calm) {
      const d = across ? Math.abs(this.pointer.x - vw / 2) : Math.abs(this.pointer.y - vh / 2)
      near = Math.max(0, 1 - d / 240) ** 2
    }
    const s = this.calm ? 1 : 1 - Math.exp(-dt * 4)
    this.gap += (GAP + (GAP_NEAR - GAP) * near - this.gap) * s
    this.nl += ((this.side === 'left' ? NUDGE : 0) - this.nl) * s
    this.nr += ((this.side === 'right' ? NUDGE : 0) - this.nr) * s

    const st = page.style
    st.setProperty('--hx-gap', `${this.gap.toFixed(2)}px`)
    st.setProperty('--hx-nl', `${this.nl.toFixed(2)}px`)
    st.setProperty('--hx-nr', `${this.nr.toFixed(2)}px`)
    st.setProperty('--hx-open', k.toFixed(4))
    /* the light through the crack, in the shader's colour of the moment */
    const c = this.host.ground === 'glow' ? glowNow.a : [0.55, 0.55, 0.6]
    st.setProperty('--hx-leak', c.map((v) => Math.round(v * 255)).join(' '))
    st.setProperty('--hx-spill', ((this.gap + Math.max(this.nl, this.nr) * 0.6) / GAP_NEAR).toFixed(3))
    st.setProperty('--fade', (1 - clamp01(p * 2.6)).toFixed(3))
    if (p > 0.002 !== this.grown) {
      this.grown = p > 0.002
      page.toggleAttribute('data-growing', this.grown)
    }
    this.film.style.transform = `scale(${(1.14 - 0.14 * k).toFixed(4)})`

    /* the film plays, from its start, once the doors are open */
    if (!this.calm) this.reel.update(p)

    this.raf = requestAnimationFrame(this.frame)
  }
}
