import { useEffect, useRef, useState } from 'react'

/**
 * The data pipeline's level, for Cloud's architecture (ConnectedArchitecture).
 *
 * The pipe hangs from the orb (originRef) and fills with the reader: its
 * water heads for a line a little under the middle of the screen and eases
 * toward it, so the level follows the scroll without ever running ahead,
 * and settles softly when the reader stops. Each joint is an anchor; it is
 * lit once the water has reached it. The platform's reservoir (tankRef)
 * fills as the water passes the platform's card.
 *
 * Positions are measured once per layout (resize, fonts, content). Scrolling
 * only reads the run's own top, once a frame, on a passive listener, and the
 * level is written straight to CSS variables on the run, so scrolling never
 * re-renders; only the lit anchors are React state, and they change a few
 * times. Every variable drives a transform, an opacity or a clip:
 *
 *   --cp-top    where the pipe starts (the orb's centre), px from the run's top
 *   --cp-len    the pipe's length, to the last joint
 *   --cp-fill   how far the water has come, px
 *   --cp-p      the same, 0 to 1
 *   --cp-tank   the reservoir's level, 0 to 1 (never quite empty or full)
 *   --cp-wave   the reservoir's wave, slid along as the water moves
 *   --cp-turn   the orb's mark, turned as the water moves
 *   --cp-dur    the motes' trip down the whole pipe, at under 40px a second
 *   data-flow   dry, run or full; data-vis while the run is on screen
 *
 * With reduced motion the pipe is simply full: every joint lit.
 */
export function usePipeFlow() {
  const runRef = useRef<HTMLDivElement>(null)
  const originRef = useRef<HTMLSpanElement>(null)
  const tankRef = useRef<HTMLLIElement>(null)
  const anchors = useRef<(HTMLElement | null)[]>([])
  const [lit, setLit] = useState(0)

  useEffect(() => {
    const run = runRef.current
    if (!run) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = (k: string, v: string) => run.style.setProperty(k, v)
    let ys: number[] = []
    let top = 0
    let len = 1
    let tank = { top: 0, height: 1 }
    let shown = -1
    let raf = 0

    /** where the pipe starts, where each joint sits on it, and its length */
    const layout = () => {
      const r = run.getBoundingClientRect()
      // positions are from the padding edge, where the pipe is placed
      const edge = r.top + run.clientTop
      const o = originRef.current?.getBoundingClientRect()
      top = o ? o.top + o.height / 2 - edge : 0
      ys = anchors.current.map((a) => {
        if (!a) return Infinity
        const b = a.getBoundingClientRect()
        return b.top + b.height / 2 - edge - top
      })
      len = Math.max(1, ...ys.filter(Number.isFinite))
      set('--cp-top', `${top.toFixed(1)}px`)
      set('--cp-len', `${len.toFixed(1)}px`)
      set('--cp-dur', `${Math.max(14, len / 34).toFixed(1)}s`)
      const t = tankRef.current
      if (t) {
        const b = t.getBoundingClientRect()
        tank = { top: b.top - edge - top, height: Math.max(1, b.height) }
      }
      shown = -1
    }

    const paint = (f: number) => {
      set('--cp-fill', `${f.toFixed(1)}px`)
      set('--cp-p', (f / len).toFixed(4))
      const level = Math.min(1, Math.max(0, (f - tank.top) / tank.height))
      set('--cp-tank', (0.16 + level * 0.66).toFixed(3))
      set('--cp-wave', `${((f * 0.42) % 48).toFixed(2)}px`)
      set('--cp-turn', `${(f * 0.06).toFixed(1)}deg`)
      run.dataset.flow = f <= 0.5 ? 'dry' : f >= len - 0.5 ? 'full' : 'run'
      let mask = 0
      ys.forEach((y, i) => {
        if (y <= f + 1) mask |= 1 << i
      })
      setLit((p) => (p === mask ? p : mask))
    }

    const frame = () => {
      raf = 0
      const r = run.getBoundingClientRect()
      const line = window.innerHeight * (window.innerWidth < 1000 ? 0.62 : 0.56)
      const target = still.matches ? len : Math.min(len, Math.max(0, line - r.top - run.clientTop - top))
      // ease toward the reader's line; jump on the first frame and with reduced motion
      const next = shown < 0 || still.matches ? target : shown + (target - shown) * 0.14
      const f = Math.abs(target - next) < 0.6 ? target : next
      if (f !== shown) {
        shown = f
        paint(f)
      }
      if (f !== target) raf = requestAnimationFrame(frame)
    }

    const queue = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const relayout = () => {
      layout()
      queue()
    }

    layout()
    frame()
    const watch = new ResizeObserver(relayout)
    watch.observe(run)
    const seen = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) run.dataset.vis = ''
        else delete run.dataset.vis
      },
      { rootMargin: '80px 0px' },
    )
    seen.observe(run)
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', relayout)
    still.addEventListener('change', relayout)
    document.fonts?.ready.then(relayout)
    return () => {
      watch.disconnect()
      seen.disconnect()
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', relayout)
      still.removeEventListener('change', relayout)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const anchorRef = (i: number) => (el: HTMLElement | null) => {
    anchors.current[i] = el
  }
  const isLit = (i: number) => (lit & (1 << i)) !== 0
  /** the last joint the water has reached, or -1 */
  const last = lit ? 31 - Math.clz32(lit) : -1

  return { runRef, originRef, tankRef, anchorRef, isLit, last }
}
