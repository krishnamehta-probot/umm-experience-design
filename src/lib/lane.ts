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

/* ============================================================================
   SCREEN — the held stage's height, in pixels

   The pinned stages are 100svh tall, and so is the screen their travel is
   measured against. On a phone window.innerHeight is not that: Safari's
   address bar collapses and comes back as the page scrolls, and
   innerHeight grows and shrinks ~80px with it while the layout stays put.
   Travel read off innerHeight jumped with every change of direction, and
   the sections jumped a step with it (testers, 15 Oct: "the pages are
   shaky" on iPhone). On a desktop the two are the same number.
   ========================================================================== */

let screenProbe: HTMLElement | null = null

export function screenPx() {
  if (!screenProbe || !screenProbe.isConnected) {
    screenProbe = document.createElement('div')
    screenProbe.setAttribute('aria-hidden', 'true')
    screenProbe.style.cssText =
      'position:absolute;top:0;left:0;width:0;visibility:hidden;pointer-events:none;height:100svh'
    document.body.appendChild(screenProbe)
  }
  return screenProbe.offsetHeight || window.innerHeight
}
