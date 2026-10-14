import { gsap, ScrollTrigger } from '@/lib/gsap'
import { lanePx } from '@/lib/lane'
import { SHAPES, type ShapeName, type ShapePart } from './shapes.data'

/* ============================================================================
   THE FILM OPENING — section 2's last shape becomes the film's window

   Shared by ProofFilm (CX) and AiFilm (AI). Krish, 14 Oct: the step from
   section 2 to the film went dark all of a sudden and then the film
   played. Now there is no gap: section 2's last point holds, and its shape
   (CX's sky clover, the AI page's coral moon) lifts off as the film's
   window. Across one lane of scroll, one scroll gesture (section 2 steps
   onto it, lib/useMagneticStops):

     0    – 0.05  the point's number fades off its shape; then the window
                   takes the shape's place, in the shape's colour
     0.05 – 0.45  it glides to the middle of the screen at half the screen's
                   size, a ring of its colour leading it; the point's words
                   lift away and section 2's light goes out behind it
     0.36 – 0.6   its colour clears to show the film inside
     0.36         the film starts rolling, under the clearing colour
     0.45 – 1     the shape grows until it covers the screen

   The film section is pulled up under section 2 (v2-scroll.css), so it is
   already held at the top of the screen when its lane starts, and section
   2 is still held behind it until the window is full.

   Without section 2 held (no such section, or it is stacked), the window
   simply opens from the middle of the screen over the same lane.
   ========================================================================== */

/** A Cool Shape as a CSS mask. Only solid shapes: one with a hole would
 *  leave a window of the old scene in the new one. */
export const maskOf = (name: ShapeName) => {
  const paths = (SHAPES[name] as readonly ShapePart[])
    .map((p) => `<path d='${p.d}'${p.evenodd ? " fill-rule='evenodd'" : ''}/>`)
    .join('')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>${paths}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** Where section 2's number has gone and the window lifts off the shape. */
const LIFT = 0.05

/** Where the window has glided to the middle. */
export const OPEN_PLAY = 0.45

/** Where the window's colour starts to clear. The film starts rolling here,
 *  so the window never shows its first frame standing still: that frame is
 *  the empty ink before the intro's shapes fly in, and read as a blackout. */
const REVEAL = 0.36

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Section 2's last point, while section 2 holds. */
function lastPoint() {
  const why = document.querySelector<HTMLElement>('.cx-why[data-mode="pin"]')
  const pair = why?.querySelector<HTMLElement>('.cx-why__pair:last-child')
  const shape = pair?.querySelector<SVGSVGElement>('.cx-why__shape')
  const name = pair?.querySelector<HTMLElement>('.cx-why__mark')?.dataset.shape as ShapeName | undefined
  if (!why || !shape || !name || !(name in SHAPES)) return null
  return { why, shape, name, tone: getComputedStyle(shape).color }
}

type Parts = {
  section: HTMLElement
  pin: HTMLElement
  win: HTMLElement
  halo: HTMLElement
  tag: HTMLElement
  controls: HTMLElement
  /** fit the frame to its window again */
  fit: () => void
  start: () => void
  stop: () => void
  /** back to the top of the film, if it has barely begun */
  rewind: () => void
}

/** Sets up the opening; returns its undo. */
export function openFilm({ section, pin, win, halo, tag, controls, fit, start, stop, rewind }: Parts) {
  const from = lastPoint()
  section.dataset.mode = 'open'
  if (from) {
    section.dataset.handoff = 'true'
    pin.style.setProperty('--hand-tone', from.tone)
  }
  pin.style.setProperty('--clover', maskOf(from?.name ?? 'clover-1'))

  const glide = gsap.parseEase('power2.inOut')
  const grow = gsap.parseEase('power1.inOut')
  const state = { p: 0 }
  let inZone = false
  let wasFull = false
  /* without a shape to clear, the window is open from the start: roll as
     soon as it is past the rewind point */
  const playAt = from ? REVEAL : 0.2

  const apply = () => {
    const box = pin.getBoundingClientRect()
    const vw = pin.clientWidth
    const vh = pin.clientHeight
    const p = state.p
    const mid = Math.min(vw, vh) * 0.5
    const end = Math.max(vw, vh) * 2.6

    /* where the window starts: on the shape, or in the middle at half size */
    let x0 = vw / 2
    let y0 = vh / 2
    let s0 = mid
    if (from) {
      const r = from.shape.getBoundingClientRect()
      x0 = r.left + r.width / 2 - box.left
      y0 = r.top + r.height / 2 - box.top
      s0 = r.width
    }

    const m = glide(clamp((p - LIFT) / (OPEN_PLAY - LIFT)))
    const g = grow(clamp((p - OPEN_PLAY) / (1 - OPEN_PLAY)))
    const x = lerp(x0, vw / 2, m)
    const y = lerp(y0, vh / 2, m)
    const s = p < OPEN_PLAY ? lerp(s0, mid, m) : mid * Math.pow(end / mid, g)
    const full = p > 0.995

    win.style.setProperty('--ms', `${s}px`)
    win.style.setProperty('--mpos', `${x - s / 2}px ${y - s / 2}px`)
    /* on the shape, the window shows only the shape's colour, so it takes
       over in one frame once the number has gone (LIFT) */
    win.style.setProperty('--win', String(from ? (p > LIFT ? 1 : 0) : 1))
    win.style.setProperty('--cover', String(from ? 1 - clamp((p - REVEAL) / 0.24) : 0))
    win.dataset.full = full ? 'true' : 'false'
    pin.dataset.full = full ? 'true' : 'false'

    halo.style.width = `${s * 1.07}px`
    halo.style.left = `${x}px`
    halo.style.top = `${y}px`
    /* the ring is solid (half see-through it greys on the dark): it shows
       once the colour starts to clear, and grows off the screen with the window */
    halo.style.opacity = String(from ? (p > LIFT ? 1 : 0) : 1 - clamp(g * 1.6))

    tag.style.left = `${x}px`
    tag.style.top = `${y + s / 2 + 30}px`
    tag.style.opacity = String(from ? clamp((p - 0.16) / 0.1) * (1 - clamp((p - 0.4) / 0.12)) : 1 - clamp(p * 3))

    controls.dataset.shown = full ? 'true' : 'false'
    from?.why.style.setProperty('--hand', String(p))
    if (full !== wasFull) {
      wasFull = full
      fit()
    }

    if (p >= playAt && inZone) start()
    if (p < 0.2) {
      stop()
      rewind()
    }
  }

  /* the film section moved up under section 2: every trigger below it on
     the page has to measure again */
  if (from) requestAnimationFrame(() => ScrollTrigger.refresh())
  apply()

  const opening = gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: apply,
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${lanePx()}`,
      /* the opening trails the scroll's glide by about two seconds, so
         one gesture plays it through at an unhurried pace */
      scrub: 2.2,
      invalidateOnRefresh: true,
    },
  })
  /* from the film starting until most of it has scrolled away */
  const zone = ScrollTrigger.create({
    trigger: section,
    start: () => `top+=${lanePx() * playAt} top`,
    end: 'bottom 55%',
    invalidateOnRefresh: true,
    onToggle: (self) => {
      inZone = self.isActive
      if (!inZone) stop()
      else if (state.p >= playAt) start()
    },
  })
  window.addEventListener('resize', apply)

  return () => {
    window.removeEventListener('resize', apply)
    opening.scrollTrigger?.kill()
    opening.kill()
    zone.kill()
    delete section.dataset.mode
    delete section.dataset.handoff
    ;[pin, win, halo, tag, controls].forEach((el) => el.removeAttribute('style'))
    delete controls.dataset.shown
    delete win.dataset.full
    delete pin.dataset.full
    from?.why.style.removeProperty('--hand')
    if (from) requestAnimationFrame(() => ScrollTrigger.refresh())
    fit()
  }
}
