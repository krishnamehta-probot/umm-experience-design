import { useEffect } from 'react'

/* ============================================================================
   SMOOTH WHEEL — the page glides under a mouse wheel instead of jumping

   A mouse wheel moves the page in notches of about a hundred pixels, each one
   landing in a single frame, so the free scroll between the pinned sections
   read as a run of jolts (Krish, 14 Oct: "too direct and speedy … it should
   not be a jerk change in anything"). Here each wheel turn moves a target
   instead, and the page eases toward it, so a notch becomes a short slide
   and a run of notches one continuous glide.

   The page always goes exactly as far as the wheel says, fast or slow,
   pinned section or not (Krish, 14 Oct: "whatever I scroll … smooth scroll
   as per what we scroll"); only the arrival is eased.

   Anything else that scrolls the page (a stop's glide, an anchor jump, the
   scrollbar, a keyboard) wins: the glide sees the page is not where it left
   it and lets go.

   Touch and trackpad pinch-zoom (ctrl + wheel) stay native.
   ========================================================================== */

/* How quickly the page closes on the target, per second. Lower is softer
   and laggier; about 7 settles a notch in roughly a third of a second. */
const RATE = 7

export function useSmoothWheel() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let target = window.scrollY
    let pos = window.scrollY
    let last = 0

    const max = () => document.documentElement.scrollHeight - window.innerHeight

    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    const frame = (now: number) => {
      // something else moved the page: it has the scroll now
      if (Math.abs(window.scrollY - Math.round(pos)) > 2) {
        stop()
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      pos += (target - pos) * (1 - Math.exp(-RATE * dt))
      if (Math.abs(target - pos) < 0.5) pos = target
      window.scrollTo({ top: pos, behavior: 'instant' })
      if (pos === target) raf = 0
      else raf = requestAnimationFrame(frame)
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      if (e.defaultPrevented) return
      // something inside scrolls on its own: leave it be
      for (let n = e.target as HTMLElement | null; n && n !== document.body; n = n.parentElement) {
        if (n.scrollHeight > n.clientHeight && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) return
      }
      e.preventDefault()
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY
      if (!raf) {
        pos = target = window.scrollY
        last = performance.now()
      }
      target = Math.max(0, Math.min(max(), target + dy))
      if (!raf) raf = requestAnimationFrame(frame)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      stop()
    }
  }, [])
}
