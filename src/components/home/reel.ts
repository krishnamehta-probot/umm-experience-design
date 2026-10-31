import { eyeFilm } from '@/content/home'

/* ============================================================================
   REEL — the film the homepage heroes grow into on the scroll

   Krish (31 Oct): a film playing while it is still small is no good, people
   miss what they never saw. So the reel holds a still until it fills the
   screen, then plays from its very start; scrolling back to the top sets it
   back to the still, and the next time it fills the screen it starts over.
   ========================================================================== */

/** the still: in the live reel, the collage of work tilted across the frame */
export const REEL_STILL = 19.5

export function makeReel(still = REEL_STILL) {
  const v = document.createElement('video')
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
  v.addEventListener('loadedmetadata', () => (v.currentTime = Math.min(still, v.duration - 0.1)), { once: true })
  return v
}

/** Plays the reel from its start once it fills the screen (`full` past
 *  `at`), pauses it below `off`, and puts the still back at the top. */
export class ReelPlayer {
  playing = false
  private fresh = true

  constructor(
    readonly video: HTMLVideoElement,
    private at = 0.85,
    private off = 0.6,
    private still = REEL_STILL,
  ) {}

  update(full: number) {
    const v = this.video
    if (full >= this.at && !this.playing) {
      if (this.fresh) {
        v.currentTime = 0
        this.fresh = false
      }
      this.playing = true
      v.play().catch(() => {})
    } else if (full < this.off && this.playing) {
      this.playing = false
      v.pause()
    }
    if (full <= 0.001 && !this.fresh && !this.playing) {
      this.fresh = true
      if (v.duration) v.currentTime = Math.min(this.still, v.duration - 0.1)
    }
  }

  /** the tab hidden or shown again */
  visible(shown: boolean) {
    if (!shown) this.video.pause()
    else if (this.playing) this.video.play().catch(() => {})
  }

  dispose() {
    const v = this.video
    v.pause()
    v.replaceChildren()
    v.removeAttribute('src')
    v.load()
  }
}

/* --- the runway the hero is held on while the film grows --------------------- */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** hold `page` (sticky) on `run` for `screens` screen heights of scroll */
export function holdRunway(run: HTMLElement, page: HTMLElement, screens: number) {
  const vh = window.innerHeight
  const pageH = page.offsetHeight
  run.style.height = `${pageH + Math.round(vh * screens)}px`
  page.style.top = `${Math.min(0, vh - pageH)}px`
}

/** how far down the runway the visitor is, 0 to 1 */
export function runwayAt(run: HTMLElement, page: HTMLElement) {
  const vh = window.innerHeight
  const pin = Math.min(0, vh - page.offsetHeight)
  const runway = run.offsetHeight - page.offsetHeight
  return runway > 0 ? clamp01((pin - run.getBoundingClientRect().top) / runway) : 0
}

/** let go of the runway */
export function releaseRunway(run: HTMLElement, page: HTMLElement) {
  run.style.removeProperty('height')
  page.style.removeProperty('top')
  page.style.removeProperty('--fade')
  page.removeAttribute('data-growing')
}
