import { reducedMotion } from './gl'
import type { Focus, MarkEngine, MarkHost } from './mark'
import { ReelPlayer, clamp01, easeInOut, holdRunway, makeReel, releaseRunway, runwayAt } from './reel'

/* ============================================================================
   RING — UMM's work on a turning ring (/home-ring)

   Twelve of UMM's case studies, as the live site's case-study cards show
   them (the render, the client's logo; public/home/cases), stand on a ring
   seen a little from above where the wordmark used to be.

   The ring presents them one at a time: it turns a card to the front, holds
   it there long enough to read, then turns on to the next. The card at the
   front comes forward and shows its title; the others fall back and fade
   round the sides. Resting on the ring holds it, the cursor leans it a
   little, a question on the left or the right turns it that way quickly, it
   can be dragged and thrown round (settling on a card), a card at the side
   clicked comes to the front, and the front card clicked opens its case
   study.

   Scrolling settles the ring on the front card and grows that card, flat,
   to fill the screen, where it gives way to the film playing from its start
   (Krish, 31 Oct); asking grows it the same way. Off screen, it stops.
   ========================================================================== */

/** the case studies, by their slug on umm.digital, and their titles there */
const CASES: [string, string][] = [
  ['mohawk-recover', 'Reimagining Sustainability Through Digital Transformation'],
  ['biocon-group', 'Unified Digital Transformation for Global Biotech'],
  ['lyca-eshop', '15% increase in average order value'],
  ['penny-co', 'Engineering a High-Performance Digital Platform for a FinTech Innovator'],
  ['habari', 'A Digital Gateway for Tanzania’s Fastest Internet'],
  ['iadeptive', 'Positioning as a Technology Leader in AI & DevOps'],
  ['aladdin-commercial', 'Reengineering Product Discovery for Commercial Flooring Professionals'],
  ['kulkuf', 'Building a Digital Ecosystem for Blockchain and Digital Finance'],
  ['coco-coir', 'Crafting a Modern E-Commerce Experience for Sustainable Home Products'],
  ['yiksi', 'Building a Digital Gateway Between Mobile Money and the Crypto Economy'],
  ['academy-of-beauty', 'Building a Digital Experience for the Next Generation of Beauty Professionals'],
  ['steward', 'Building the Digital Foundation for Smarter Energy Management'],
]
/** the logos drawn in white, which sit on a dark tag instead */
const LIGHT = new Set(['penny-co', 'lyca-eshop', 'habari'])
/** the live cards' proportions (1024 x 829) */
const ASPECT = 1024 / 829
const N = CASES.length
const STEP = 360 / N
/** the card at the front first: Habari's red */
const START = 4
/** how far the hero holds while the card grows, in screen heights */
const RUNWAY = 1.2
/** how long a card holds the front (s), and while a question leans the ring */
const DWELL = 2.8
const DWELL_QUICK = 0.7
/** the turn's spring, critically damped */
const K = 28
const C = 2 * Math.sqrt(K)
/** how far the cursor leans the ring (deg) */
const LEAN = 6
/** how far the front card comes forward, as a share of the radius */
const POP = 0.07

const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
const smooth = (t: number) => t * t * (3 - 2 * t)
const ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg>'

export class Ring implements MarkEngine {
  private host: MarkHost
  private scene = document.createElement('div')
  private ring = document.createElement('div')
  private cards: HTMLAnchorElement[] = []
  private grow = document.createElement('div')
  private shot: HTMLElement | null = null
  private video = makeReel()
  private reel = new ReelPlayer(this.video)
  private calm = reducedMotion()
  private w = 300
  private h = 190
  private r = 600
  /* the turn (deg), where it is heading (a card square to the front), and
     its speed */
  private goal = -START * STEP
  private turn = -START * STEP
  private vel = 0
  /* how long the front card has left at the front */
  private hold = DWELL + 2.4
  private lean = 0
  private resting = false
  private pointer = { x: 0.5, on: false }
  private drag: { x: number; turn: number; t: number; v: number } | null = null
  /* a drag that moved, so its click is not a click on a card */
  private dragged = false
  private side: Focus['side'] | null = null
  private front = START
  /* the card showing its title */
  private marked = -1
  private leaveAt = -1
  private grown = false
  private inView = true
  private t0 = performance.now()
  private last = performance.now()
  private raf = 0
  private dead = false
  private ro: ResizeObserver
  private io: IntersectionObserver

  constructor(host: MarkHost) {
    this.host = host
    this.scene.className = 'hx__ring-scene'
    this.scene.setAttribute('aria-hidden', 'true')
    this.ring.className = 'hx__ring'
    CASES.forEach(([slug, title], i) => {
      const c = document.createElement('a')
      c.className = 'hx__ring-card'
      c.href = `https://umm.digital/casestudies/${slug}/`
      c.tabIndex = -1
      c.draggable = false
      const img = document.createElement('img')
      img.src = `/home/cases/${slug}.webp`
      img.alt = ''
      img.width = 1024
      img.height = 829
      img.decoding = 'async'
      img.draggable = false
      /* the client's logo on a small frosted tag, as legible on the dark
         renders as on the light ones */
      const tag = document.createElement('span')
      tag.className = 'hx__ring-tag'
      if (LIGHT.has(slug)) tag.dataset.dark = ''
      const logo = document.createElement('img')
      logo.src = `/home/cases/${slug}-logo.webp`
      logo.alt = ''
      logo.decoding = 'async'
      logo.draggable = false
      tag.appendChild(logo)
      /* the title, shown while the card is at the front */
      const cap = document.createElement('span')
      cap.className = 'hx__ring-cap'
      const kicker = document.createElement('span')
      kicker.className = 'hx__ring-kicker'
      kicker.textContent = `Case study · ${String(i + 1).padStart(2, '0')}/${N}`
      const name = document.createElement('span')
      name.className = 'hx__ring-title'
      name.textContent = title
      const go = document.createElement('span')
      go.className = 'hx__ring-go'
      go.innerHTML = ARROW
      cap.append(kicker, name, go)
      c.append(img, tag, cap)
      this.ring.appendChild(c)
      this.cards.push(c)
    })
    this.scene.addEventListener('click', this.onClick, true)
    this.scene.addEventListener('pointerenter', this.onRest)
    this.scene.addEventListener('pointerleave', this.onRest)
    this.scene.appendChild(this.ring)
    host.stage.appendChild(this.scene)

    /* the card that grows to the film, flat, over the page */
    this.grow.className = 'hx__ring-grow'
    this.grow.setAttribute('aria-hidden', 'true')
    this.grow.append(this.video)
    host.layer.appendChild(this.grow)

    this.ro = new ResizeObserver(this.layout)
    this.ro.observe(host.page)
    this.ro.observe(host.stage)
    this.io = new IntersectionObserver(([e]) => {
      this.inView = e.isIntersecting
      this.reel.visible(this.inView && !document.hidden)
      this.wake()
    })
    this.io.observe(host.run)
    window.addEventListener('resize', this.layout)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    host.stage.addEventListener('pointerdown', this.onDown)
    window.addEventListener('pointerup', this.onUp)
    window.addEventListener('pointercancel', this.onUp)
    document.addEventListener('visibilitychange', this.onVisible)
    this.layout()
    this.wake()
  }

  focus(q: Focus | null) {
    const side = q?.side ?? null
    if (side && side !== this.side) this.hold = Math.min(this.hold, 0.25)
    this.side = side
  }

  leave() {
    this.leaveAt = performance.now()
    this.wake()
  }

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
    window.removeEventListener('resize', this.layout)
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    this.host.stage.removeEventListener('pointerdown', this.onDown)
    window.removeEventListener('pointerup', this.onUp)
    window.removeEventListener('pointercancel', this.onUp)
    document.removeEventListener('visibilitychange', this.onVisible)
    this.scene.removeEventListener('click', this.onClick, true)
    this.scene.removeEventListener('pointerenter', this.onRest)
    this.scene.removeEventListener('pointerleave', this.onRest)
    this.reel.dispose()
    releaseRunway(this.host.run, this.host.page)
    this.scene.remove()
    this.grow.remove()
  }

  /* --- size ------------------------------------------------------------------ */

  private layout = () => {
    holdRunway(this.host.run, this.host.page, this.calm ? 0 : RUNWAY)
    const sr = this.host.stage.getBoundingClientRect()
    /* cards most of the band tall, the ring as wide as the band allows; on a
       phone the front card takes most of the width, its neighbours peeking
       in at the sides */
    this.h = Math.max(70, sr.height * 0.66)
    this.w = this.h * ASPECT
    const fit = (this.w / 2 / Math.tan(Math.PI / N)) * 1.12
    this.r = Math.min(fit, sr.width * (sr.width < 700 ? 1.3 : 0.62))
    if (this.r < fit) {
      this.w = (this.r / 1.12) * Math.tan(Math.PI / N) * 2
      this.h = this.w / ASPECT
    }
    const s = this.scene.style
    s.setProperty('--w', `${this.w.toFixed(1)}px`)
    s.setProperty('--h', `${this.h.toFixed(1)}px`)
    this.wake()
  }

  /* --- input ----------------------------------------------------------------- */

  private onMove = (e: PointerEvent) => {
    if (this.drag) {
      const now = performance.now()
      if (Math.abs(e.clientX - this.drag.x) > 6) this.dragged = true
      const turn = this.drag.turn + (e.clientX - this.drag.x) * 0.22
      this.drag.v = ((turn - this.turn) / Math.max(1, now - this.drag.t)) * 1000
      this.drag.t = now
      this.turn = turn
      return
    }
    if (e.pointerType !== 'mouse') return
    this.pointer = { x: e.clientX / window.innerWidth, on: true }
  }

  private onLeave = () => {
    this.pointer.on = false
  }

  /** the cursor resting on the ring holds the card at the front */
  private onRest = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') this.resting = e.type === 'pointerenter'
  }

  private onDown = (e: PointerEvent) => {
    if (this.grown || this.calm) return
    this.dragged = false
    this.drag = { x: e.clientX, turn: this.turn, t: performance.now(), v: 0 }
  }

  /** the front card opens its case study; one at the side comes to the
   *  front; nothing, if the ring was being dragged */
  private onClick = (e: MouseEvent) => {
    const card = (e.target as Element).closest<HTMLAnchorElement>('.hx__ring-card')
    const i = card ? this.cards.indexOf(card) : -1
    if (this.dragged || this.grown || (i >= 0 && i !== this.front)) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!this.dragged && !this.grown && i >= 0 && i !== this.front) this.bring(i)
    this.dragged = false
  }

  private onUp = () => {
    if (!this.drag) return
    /* let go: the throw carries on and settles on the card it reaches */
    const v = Math.max(-300, Math.min(300, this.drag.v))
    this.drag = null
    if (!this.dragged) return
    this.vel = v
    this.goal = Math.round((this.turn + v * 0.22) / STEP) * STEP
    this.hold = DWELL
  }

  private onVisible = () => {
    this.reel.visible(!document.hidden && this.inView)
    this.wake()
  }

  /** turn card `i` to the front, the short way round */
  private bring(i: number) {
    this.goal = this.turn + wrap(-i * STEP - this.turn)
    this.goal = Math.round(this.goal / STEP) * STEP
    this.hold = DWELL
    this.wake()
  }

  private wake = () => {
    if (!this.raf && !this.dead && !document.hidden && this.inView) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  /* --- the frame ------------------------------------------------------------- */

  private frame = (now: number) => {
    this.raf = 0
    if (this.dead || document.hidden || !this.inView) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const { run, page } = this.host

    let p = runwayAt(run, page)
    if (this.leaveAt >= 0) p = Math.max(p, easeInOut(clamp01((now - this.leaveAt) / 1300)))
    const k = easeInOut(clamp01(p / 0.9))
    const growing = p > 0.002

    /* the turn: a card at a time, held at the front, then on to the next;
       quickly the way a question leans; settled on the front card as the
       card grows */
    if (growing) {
      this.goal = Math.round(this.goal / STEP) * STEP
    } else if (!this.drag && !this.calm && Math.abs(this.goal - this.turn) < 0.5) {
      if (!this.resting) this.hold -= dt
      if (this.hold <= 0) {
        this.goal += this.side === 'left' ? -STEP : STEP
        this.hold = this.side ? DWELL_QUICK : DWELL
      }
    }
    if (this.calm) {
      this.turn = this.goal
    } else if (!this.drag) {
      for (let s = 0; s < 2; s++) {
        const h = dt / 2
        this.vel += (K * (this.goal - this.turn) - C * this.vel) * h
        this.turn += this.vel * h
      }
    }
    if (!this.drag) this.front = (((Math.round(-this.goal / STEP) % N) + N) % N)
    const settled = !this.drag && Math.abs(this.goal - this.turn) < 3

    /* in: the ring swings round into place; the cursor leans it a little */
    const lean = this.pointer.on && !this.calm && !growing ? (this.pointer.x - 0.5) * 2 * LEAN : 0
    this.lean += (lean - this.lean) * (1 - Math.exp(-dt * 2.5))
    const e = this.calm ? 1 : easeInOut(clamp01(((now - this.t0) / 1000 - 0.2) / 2.2))
    const shown = this.turn + this.lean + (1 - e) * -120
    this.ring.style.transform = `translateZ(${(-this.r).toFixed(1)}px) rotateX(-5deg) rotateY(${shown.toFixed(2)}deg)`
    this.scene.style.opacity = (e * (1 - clamp01(k * 3))).toFixed(3)

    /* the nearer a card faces, the brighter it reads, fading out before it
       turns edge on; the one facing comes forward */
    this.cards.forEach((c, i) => {
      const facing = Math.cos(((i * STEP + shown) * Math.PI) / 180)
      const o = clamp01((facing - 0.1) / 0.9) ** 1.5
      const pop = smooth(clamp01((facing - 0.93) / 0.07)) * POP * this.r
      c.style.transform = `rotateY(${(i * STEP).toFixed(2)}deg) translateZ(${(this.r + pop).toFixed(1)}px)`
      c.style.opacity = o.toFixed(3)
      c.style.visibility = o < 0.01 ? 'hidden' : ''
    })
    const at = settled && e > 0.9 && !growing ? this.front : -1
    if (at !== this.marked) {
      if (this.marked >= 0) this.cards[this.marked].removeAttribute('data-front')
      if (at >= 0) this.cards[at].setAttribute('data-front', '')
      this.marked = at
    }

    /* the growing card: from the front card's place to the screen */
    page.style.setProperty('--fade', (1 - clamp01(p * 2.4)).toFixed(3))
    const g = this.grow.style
    if (growing) {
      if (!this.grown) {
        this.grown = true
        page.setAttribute('data-growing', '')
        /* a flat copy of the front card, title and all, its title fading as
           it grows */
        this.shot?.remove()
        const shot = this.cards[this.front].cloneNode(true) as HTMLElement
        shot.removeAttribute('style')
        shot.removeAttribute('href')
        shot.removeAttribute('data-front')
        this.grow.appendChild(shot)
        this.shot = shot
        g.setProperty('--h', `${this.h.toFixed(1)}px`)
      }
      const vw = document.documentElement.clientWidth
      const vh = window.innerHeight
      const pr = page.getBoundingClientRect()
      const fr = this.cards[this.front].getBoundingClientRect()
      const x0 = fr.left - pr.left
      const y0 = fr.top - pr.top
      const x = x0 + (-pr.left - x0) * k
      const y = y0 + (-pr.top - y0) * k
      g.display = 'block'
      g.left = `${x.toFixed(1)}px`
      g.top = `${y.toFixed(1)}px`
      g.width = `${(fr.width + (vw - fr.width) * k).toFixed(1)}px`
      g.height = `${(fr.height + (vh - fr.height) * k).toFixed(1)}px`
      g.borderRadius = `${(18 * (1 - k)).toFixed(1)}px`
      g.setProperty('--cap', (1 - clamp01(k * 4)).toFixed(3))
      /* the card gives way to the film once it is full */
      if (this.shot) this.shot.style.opacity = this.reel.playing ? '0' : '1'
    } else if (this.grown) {
      this.grown = false
      page.removeAttribute('data-growing')
      g.display = 'none'
    }

    if (!this.calm) this.reel.update(p)
    this.raf = requestAnimationFrame(this.frame)
  }
}
