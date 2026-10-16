import { useEffect, useState } from 'react'

/* The breakpoint at which a pinned section actually pins. Below it the stage
   is not sticky, so the scroll cannot move between steps and anything that
   reads scroll progress as a selection has to fall back to a real control. */
const PIN_AT = '(min-width: 900px)'
/* v2's pages (CX and AI) pin on phones too: any screen tall enough to hold a
   stage, which is every phone held upright. Phones on their side, too short
   for a stage, keep the stacked fallback. 16 Oct: and so do laptop windows
   under 500px tall (a browser zoomed right in), where no stage can hold its
   content; the sections then read in order, nothing held or cut. */
export const PIN_V2 = '(min-width: 900px) and (min-height: 500px), (max-width: 899px) and (min-height: 560px)'

/**
 * Whether pinned sections are pinning at this size.
 *
 * Matters because the tab strips in Stages and Engagement are a *readout* of
 * the scroll when the section pins. Unpinned they would be a readout of
 * nothing — every step but the first unreachable — so below the breakpoint
 * they become the control instead.
 */
export function usePinned(query = PIN_AT) {
  const [pinned, setPinned] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const read = () => setPinned(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [query])

  return pinned
}
