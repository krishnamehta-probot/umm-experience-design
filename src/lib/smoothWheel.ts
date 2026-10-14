import { useEffect } from 'react'

/* ============================================================================
   SMOOTH WHEEL — the page glides under a mouse wheel instead of jumping

   A mouse wheel moves the page in notches of about a hundred pixels, each one
   landing in a single frame, so the free scroll between the pinned sections
   read as a run of jolts (Krish, 14 Oct: "too direct and speedy … it should
   not be a jerk change in anything"). Here each wheel turn moves a target
   instead, and the page eases toward it, so a notch becomes a short slide
   and a run of notches one continuous glide.

   Pinned sections that step (lib/useMagneticStops) listen first, on the
   document while it captures, and take their gestures with preventDefault;
   whatever they take is left alone here. They also put up fences: a glide
   arriving at a section stops on its first stop (or its last, coming up),
   so a hard flick can never carry the page past one.

   Anything else that scrolls the page (a stop's glide, an anchor jump, the
   scrollbar, a keyboard) wins: the glide sees the page is not where it left
   it and lets go.

   Touch and trackpad pinch-zoom (ctrl + wheel) stay native.
   ========================================================================== */

/** Clamps a glide that would run from `from` to `to`. */
type Fence = (from: number, to: number) => number

const fences = new Set<Fence>()

/** Registers a fence on every glide; returns the remover. */
export function addFence(fence: Fence) {
  fences.add(fence)
  return () => {
    fences.delete(fence)
  }
}

/* How quickly the page closes on the target, per second. Lower is softer
   and slower to settle; about 5 settles a notch in roughly half a second. */
const RATE = 5.2

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
      // a pinned section took this one
      if (e.defaultPrevented) {
        stop()
        return
      }
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
      let to = Math.max(0, Math.min(max(), target + dy))
      for (const fence of fences) to = fence(window.scrollY, to)
      target = to
      if (!raf) raf = requestAnimationFrame(frame)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      stop()
    }
  }, [])
}
