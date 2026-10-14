/* ============================================================================
   LANE — one step of scroll in the v2 pages' pinned sections, in pixels

   The length itself is CSS (--umm-lane in styles/v2-scroll.css), so it
   follows the screen exactly as the sections' heights do. Script that needs
   it in pixels (the film's opening, which has no section height of its own
   to read it from) measures it off a hidden probe.
   ========================================================================== */

let probe: HTMLElement | null = null

export function lanePx() {
  if (!probe || !probe.isConnected) {
    probe = document.createElement('div')
    probe.setAttribute('aria-hidden', 'true')
    probe.style.cssText =
      'position:absolute;top:0;left:0;width:0;visibility:hidden;pointer-events:none;height:var(--umm-lane, 80svh)'
    document.body.appendChild(probe)
  }
  return probe.offsetHeight || window.innerHeight * 0.8
}
