import { useJourney } from '@/lib/journey'

/* ============================================================================
   THE JOURNEY SPINE

   A persistent rail on the left edge that turns the act of scrolling into the
   act of travelling a journey. It is the page's answer to "show me where I am
   and what to focus on":

     - the line draws itself downward as the reader descends
     - each station lights as it is reached and stays lit once passed
     - a marker rides the line at the reader's exact position
     - the active station names itself; the rest stay quiet

   It is a real <nav> with real buttons, so it doubles as keyboard-operable
   section navigation rather than being decoration with a progress bar glued on.
   ========================================================================== */

export function JourneySpine() {
  const { stations, activeIndex, progress, goTo } = useJourney()
  const count = stations.length

  return (
    <nav
      className="umm-spine"
      aria-label="Page sections"
      // The rail is fixed, so it passes over the dark closing band. Inverting
      // it there is the difference between a rail that tracks the whole page
      // and one that vanishes at the end of it.
      data-over-ink={stations[activeIndex]?.dark ? 'true' : undefined}
      style={{ '--umm-spine-progress': progress } as React.CSSProperties}
    >
      <span className="umm-spine__count" aria-hidden="true">
        {String(activeIndex + 1).padStart(2, '0')}
        <i>/</i>
        {String(count).padStart(2, '0')}
      </span>

      <div className="umm-spine__rail">
        <span className="umm-spine__track" aria-hidden="true" />
        <span className="umm-spine__fill" aria-hidden="true" />
        <span className="umm-spine__marker" aria-hidden="true" />

        <ul className="umm-spine__stations">
          {stations.map((station, i) => {
            const y = (i + 0.5) / count
            const state =
              i < activeIndex ? 'passed' : i === activeIndex ? 'active' : 'ahead'
            return (
              <li
                key={station.id}
                className="umm-spine__station"
                data-state={state}
                style={{ '--umm-station-y': `${y * 100}%` } as React.CSSProperties}
              >
                <button
                  type="button"
                  onClick={() => goTo(station.id)}
                  aria-current={state === 'active' ? 'true' : undefined}
                >
                  <span className="umm-spine__dot" aria-hidden="true" />
                  <span className="umm-spine__label">{station.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

/**
 * The narrow-screen counterpart: a hairline fill across the top of the page.
 * Same progress value, so the two never disagree.
 */
export function JourneyBar() {
  const { progress } = useJourney()
  return (
    <div
      className="umm-journey-bar"
      aria-hidden="true"
      style={{ '--umm-spine-progress': progress } as React.CSSProperties}
    >
      <span />
    </div>
  )
}
