import { useEffect, useState } from 'react'

/* The breakpoint at which a pinned section actually pins. Below it the stage
   is not sticky, so the scroll cannot move between steps and anything that
   reads scroll progress as a selection has to fall back to a real control. */
const PIN_AT = '(min-width: 900px)'

/**
 * Whether pinned sections are pinning at this size.
 *
 * Matters because the tab strips in Stages and Engagement are a *readout* of
 * the scroll when the section pins. Unpinned they would be a readout of
 * nothing — every step but the first unreachable — so below the breakpoint
 * they become the control instead.
 */
export function usePinned() {
  const [pinned, setPinned] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia(PIN_AT)
    const read = () => setPinned(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])

  return pinned
}
