import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ============================================================================
   GSAP — registered once

   Every v2 section imports gsap from here rather than from the package, so
   ScrollTrigger is guaranteed to be registered before any section builds a
   trigger, whatever order the sections mount in.

   Each component builds its timelines inside gsap.context(…, scope) and
   reverts that context on unmount. React's StrictMode mounts effects twice in
   development; revert() is what stops that from leaving two copies of every
   trigger behind.
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** True when the visitor has asked the OS for less motion. Read at effect
 *  time, so a section built after the preference changes respects it. */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
