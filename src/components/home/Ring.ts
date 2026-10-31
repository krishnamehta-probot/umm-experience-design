import { reducedMotion } from './gl'
import type { Focus, MarkEngine, MarkHost } from './mark'
import { ReelPlayer, clamp01, easeInOut, holdRunway, makeReel, releaseRunway, runwayAt } from './reel'

/* ============================================================================
   RING — UMM's work on a turning ring (/home-ring)

   Twelve of UMM's case studies, as the live site's case-study cards show
   them (the render, the client's logo; public/home/cases), stand on a ring
   seen a little from above, turning slowly where the wordmark used to be:
   the nearest cards large and bright, those round the back hidden. The
   cursor leans the turn its way, resting on a question on the left or the
   right spins it that way, the ring can be dragged round, and a card clicked
   opens its case study.

   Scrolling stops the ring with a card at the front and grows that card,
   flat, to fill the screen, where it gives way to the film playing from its
   start (Krish, 31 Oct); asking grows it the same way.
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
const CARDS = CASES.map(([slug]) => `/home/cases/${slug}.webp`)
/** the logos drawn in white, which sit on a dark tag instead */
const LIGHT = new Set(['penny-co', 'lyca-eshop', 'habari'])
/** the live cards' proportions (1024 x 829) */
const ASPECT = 1024 / 829
const N = CARDS.length
const STEP = 360 / N
/** how far the hero holds while the card grows, in screen heights */
const RUNWAY = 1.2
/** the turn at rest (deg/s), and how much the cursor or a question adds */
const SPIN = 5
const LEAN = 9
const PUSH = 34

const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180

export class Ring implements MarkEngine {
  private host: MarkHost
  private scene = document.createElement('div')
  private ring = document.createElement('div')
  private cards: HTMLAnchorElement[] = []
  private grow = document.createElement('div')
  private growImg = document.createElement('img')
  private video = makeReel()
  private reel = new ReelPlayer(this.video)
  private calm = reducedMotion()
  private w = 300
  private h = 190
  private r = 600
  private turn = -140
  private speed = SPIN
  private pointer = { x: 0, on: false }
  private drag: { x: number; turn: number; t: number; v: number } | null = null
  /* a drag that moved, so its click is not a click on a card */
  private dragged = false
  private side: Focus['side'] | null = null
  private front = 0
  private leaveAt = -1
  private grown = false
  private t0 = performance.now()
  private last = performance.now()
  private raf = 0
  private dead = false
  private ro: ResizeObserver

  constructor(host: MarkHost) {
    this.host = host
    this.scene.className = 'hx__ring-scene'
    this.scene.setAttribute('aria-hidden', 'true')
    this.ring.className = 'hx__ring'
    for (const [slug, title] of CASES) {
      const c = document.createElement('a')
      c.className = 'hx__ring-card'
      c.href = `https://umm.digital/casestudies/${slug}/`
      c.title = title
      c.tabIndex = -1
      c.draggable = false
      const img = document.createElement('img')
      img.src = `/home/cases/${slug}.webp`
      img.alt = ''
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
      c.append(img, tag)
      this.ring.appendChild(c)
      this.cards.push(c)
    }
    this.scene.addEventListener('click', this.onClick, true)
    this.scene.appendChild(this.ring)
    host.stage.appendChild(this.scene)

    /* the card that grows to the film, flat, over the page */
    this.grow.className = 'hx__ring-grow'
    this.grow.setAttribute('aria-hidden', 'true')
    this.growImg.alt = ''
    this.grow.append(this.video, this.growImg)
    host.layer.appendChild(this.grow)

    if (this.calm) this.turn = 0
    this.ro = new ResizeObserver(this.layout)
    this.ro.observe(host.page)
    this.ro.observe(host.stage)
    window.addEventListener('resize', this.layout)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    host.stage.addEventListener('pointerdown', this.onDown)
    window.addEventListener('pointerup', this.onUp)
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
    this.host.stage.removeEventListener('pointerdown', this.onDown)
    window.removeEventListener('pointerup', this.onUp)
    document.removeEventListener('visibilitychange', this.onVisible)
    this.scene.removeEventListener('click', this.onClick, true)
    this.reel.dispose()
    releaseRunway(this.host.run, this.host.page)
    this.scene.remove()
    this.grow.remove()
  }

  /* --- size ------------------------------------------------------------------ */

  private layout = () => {
    holdRunway(this.host.run, this.host.page, this.calm ? 0 : RUNWAY)
    const sr = this.host.stage.getBoundingClientRect()
    /* cards most of the band tall, the ring as wide as the band allows */
    this.h = Math.max(70, sr.height * 0.66)
    this.w = this.h * ASPECT
    const fit = (this.w / 2 / Math.tan(Math.PI / N)) * 1.12
    this.r = Math.min(fit, sr.width * (sr.width < 700 ? 0.95 : 0.62))
    if (this.r < fit) {
      this.w = (this.r / 1.12) * Math.tan(Math.PI / N) * 2
      this.h = this.w / ASPECT
    }
    const s = this.scene.style
    s.setProperty('--w', `${this.w.toFixed(1)}px`)
    s.setProperty('--h', `${this.h.toFixed(1)}px`)
    this.cards.forEach((c, i) => {
      c.style.transform = `rotateY(${(i * STEP).toFixed(2)}deg) translateZ(${this.r.toFixed(1)}px)`
    })
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

  private onDown = (e: PointerEvent) => {
    if (this.grown || this.calm) return
    this.dragged = false
    this.drag = { x: e.clientX, turn: this.turn, t: performance.now(), v: 0 }
  }

  /** a card opens its case study, unless the ring was being dragged */
  private onClick = (e: MouseEvent) => {
    if (this.dragged || this.grown) {
      e.preventDefault()
      e.stopPropagation()
    }
    this.dragged = false
  }

  private onUp = () => {
    if (!this.drag) return
    /* let go: the ring carries the throw, easing back to its own turn */
    this.speed = Math.max(-240, Math.min(240, this.drag.v))
    this.drag = null
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

  /* --- the frame ------------------------------------------------------------- */

  private frame = (now: number) => {
    this.raf = 0
    if (this.dead || document.hidden) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const { run, page } = this.host

    let p = runwayAt(run, page)
    if (this.leaveAt >= 0) p = Math.max(p, easeInOut(clamp01((now - this.leaveAt) / 1300)))
    const k = easeInOut(clamp01(p / 0.9))

    /* the turn: its own, leant by the cursor or a question, or a throw
       easing back; stopped with the nearest card to the front as it grows */
    if (p > 0.002) {
      const target = -this.front * STEP
      this.turn += wrap(target - this.turn) * (1 - Math.exp(-dt * 6))
    } else if (!this.drag && !this.calm) {
      const lean = this.side === 'left' ? -PUSH : this.side === 'right' ? PUSH : this.pointer.on ? (this.pointer.x - 0.5) * 2 * LEAN : 0
      this.speed += (SPIN + lean - this.speed) * (1 - Math.exp(-dt * 1.6))
      this.turn += this.speed * dt
    }
    if (p <= 0.002) this.front = (((Math.round(-this.turn / STEP) % N) + N) % N)

    /* in: the ring swings round into place */
    const e = this.calm ? 1 : easeInOut(clamp01(((now - this.t0) / 1000 - 0.2) / 2.2))
    const shown = this.turn + (1 - e) * -120
    this.ring.style.transform = `translateZ(${(-this.r).toFixed(1)}px) rotateX(-5deg) rotateY(${shown.toFixed(2)}deg)`
    this.scene.style.opacity = (e * (1 - clamp01(k * 3))).toFixed(3)

    /* the nearer a card faces, the larger and brighter it reads */
    this.cards.forEach((c, i) => {
      const facing = Math.cos(((i * STEP + shown) * Math.PI) / 180)
      c.style.opacity = (0.18 + 0.82 * clamp01((facing + 0.35) / 1.35) ** 1.6).toFixed(3)
    })

    /* the growing card: from the front card's place to the screen */
    page.style.setProperty('--fade', (1 - clamp01(p * 2.4)).toFixed(3))
    const g = this.grow.style
    if (p > 0.002) {
      if (!this.grown) {
        this.grown = true
        page.setAttribute('data-growing', '')
        this.growImg.src = CARDS[this.front]
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
      g.borderRadius = `${(14 * (1 - k)).toFixed(1)}px`
      /* the card's own frame gives way to the film once it is full */
      this.growImg.style.opacity = this.reel.playing ? '0' : '1'
    } else if (this.grown) {
      this.grown = false
      page.removeAttribute('data-growing')
      g.display = 'none'
    }

    if (!this.calm) this.reel.update(p)
    this.raf = requestAnimationFrame(this.frame)
  }
}
