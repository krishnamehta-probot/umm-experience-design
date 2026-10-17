import { useEffect, useState, type CSSProperties } from 'react'
import type { DiscoveryChannel } from '@/content/growth'
import { Doodle } from './doodles'

/* ============================================================================
   INTEGRATED GROWTH · THE DISCOVERY PICTURES

   17 Oct, Krish on Search, ads & AI discovery: "this section looks too
   pale". Each card's picture is now drawn as the service cards' scenes
   are: white objects with an ink outline and a hard ink shadow, pastel
   accents, on the card's full tone. Each plays a small loop, phase by
   phase, while the grid is on screen, all of them on the doc's own
   question (discovery.query):

     SEO    the query types itself; the results come in; the brand's
            result lifts out of third place into first and gets a star
     Paid   the sponsored result drops in above the others; the pointer
            clicks it; a tick pops on
     AEO    the answer box under the question opens out; a star sticks on
     LLMO   the AI's reply writes itself, cites its source, and the source
            page pops up beside it

   Reduced motion holds each on its finished phase. Shapes only, besides
   the query; all decorative.
   ========================================================================== */

/** Steps through phases (name, ms) while `live`; holds `rest` for reduced
 *  motion. Starts from the first phase each time it comes on screen. */
function usePhase<T extends string>(
  phases: readonly (readonly [T, number])[],
  rest: T,
  live: boolean,
  reduced: boolean,
  lead: number,
) {
  const [k, setK] = useState(0)
  useEffect(() => {
    if (!live || reduced) return
    let n = 0
    setK(0)
    let timer = window.setTimeout(function next() {
      n = (n + 1) % phases.length
      setK(n)
      timer = window.setTimeout(next, phases[n][1])
    }, phases[0][1] + lead)
    return () => window.clearTimeout(timer)
  }, [live, reduced, phases, lead])
  return reduced ? rest : phases[k][0]
}

type PlaceProps = { live: boolean; reduced: boolean; query: string; lead: number }

/** The query, a letter to a box, so it can type itself. */
function Typed({ text }: { text: string }) {
  const chars = Array.from(text)
  return (
    <span className="gx-typed" style={{ '--len': chars.length } as CSSProperties}>
      {chars.map((ch, k) => (
        <span key={k} className="gx-typed__ch" style={{ '--k': k } as CSSProperties}>
          {ch}
        </span>
      ))}
      <span className="gx-typed__caret" />
    </span>
  )
}

function Glass() {
  return (
    <svg className="gx-glass" viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="9.2" cy="9.2" r="5.6" />
      <path d="m13.6 13.6 5 5" />
    </svg>
  )
}

/** A result: its icon, its title, its line. */
function Row({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <span className={`gx-row ${className}`.trim()} style={style}>
      <i className="gx-row__fav" />
      <span className="gx-row__lines">
        <b />
        <i />
      </span>
    </span>
  )
}

const SEO = [
  ['idle', 800],
  ['type', 1400],
  ['show', 900],
  ['rise', 2700],
  ['out', 650],
] as const

function SeoPlace({ live, reduced, query, lead }: PlaceProps) {
  const p = usePhase(SEO, 'rise', live, reduced, lead)
  return (
    <div
      className="gx-pic__in gx-seo"
      data-typed={p !== 'idle' && p !== 'out' ? '' : undefined}
      data-shown={p === 'show' || p === 'rise' ? '' : undefined}
      data-risen={p === 'rise' ? '' : undefined}
    >
      <div className="gx-obj gx-win">
        <span className="gx-win__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="gx-search">
          <Glass />
          <Typed text={query} />
        </span>
        <span className="gx-rank">
          <Row className="gx-rank__row" style={{ '--at': 0, '--to': 1 } as CSSProperties} />
          <Row className="gx-rank__row" style={{ '--at': 1, '--to': 2 } as CSSProperties} />
          <span className="gx-rank__row gx-rank__row--brand" style={{ '--at': 2, '--to': 0 } as CSSProperties}>
            <Row className="gx-row--brand" />
            <span className="gx-pop gx-rank__star">
              <Doodle kind="star" />
            </span>
          </span>
        </span>
      </div>
    </div>
  )
}

const ADS = [
  ['idle', 900],
  ['drop', 1000],
  ['aim', 900],
  ['click', 420],
  ['win', 2100],
  ['out', 650],
] as const

function AdsPlace({ live, reduced, query, lead }: PlaceProps) {
  const p = usePhase(ADS, 'win', live, reduced, lead)
  const ad = p === 'drop' || p === 'aim' || p === 'click' || p === 'win'
  return (
    <div
      className="gx-pic__in gx-ads"
      data-ad={ad ? '' : undefined}
      data-aim={(p === 'aim' || p === 'click' || p === 'win') && !reduced ? '' : undefined}
      data-press={p === 'click' ? '' : undefined}
      data-win={p === 'win' ? '' : undefined}
    >
      <span className="gx-obj gx-search gx-search--pill">
        <Glass />
        <span className="gx-search__q">{query}</span>
      </span>
      <span className="gx-ads__list">
        <span className="gx-ads__slot">
          <span className="gx-obj gx-ad">
            <span className="gx-ad__badge">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path className="gx-ad__horn" d="M4 10v4h3.2l6.3 4.2V5.8L7.2 10H4Z" />
                <path className="gx-ad__waves" d="M16.6 9.2c1.2 1.4 1.2 4.2 0 5.6M19 7c2.3 2.6 2.3 7.4 0 10" />
              </svg>
            </span>
            <span className="gx-row__lines">
              <b />
              <i />
            </span>
            <span className="gx-ad__go">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
            <span className="gx-ad__ring" />
            <span className="gx-pop gx-ad__ok">
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="16" />
                <path d="m12.5 20.5 5 5 10-11" />
              </svg>
            </span>
            <span className="gx-pop gx-ad__spark">
              <Doodle kind="sparkle" />
            </span>
          </span>
        </span>
        <Row className="gx-obj gx-row--plain" />
        <Row className="gx-obj gx-row--plain" />
      </span>
      <svg className="gx-cursor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3.5 18.5 11l-6.2 1.6-3.1 6.1L5 3.5Z" />
      </svg>
    </div>
  )
}

const AEO = [
  ['idle', 1100],
  ['open', 900],
  ['star', 2500],
  ['close', 750],
] as const

function AeoPlace({ live, reduced, query, lead }: PlaceProps) {
  const p = usePhase(AEO, 'star', live, reduced, lead)
  return (
    <div
      className="gx-pic__in gx-aeo"
      data-open={p === 'open' || p === 'star' ? '' : undefined}
      data-star={p === 'star' ? '' : undefined}
    >
      <span className="gx-obj gx-ask">
        <span className="gx-ask__q">?</span>
        <span className="gx-search__q">{query}</span>
      </span>
      <span className="gx-obj gx-answer">
        <span className="gx-answer__head">
          <span className="gx-answer__bulb">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3.5Z" />
            </svg>
          </span>
          <b />
          <svg className="gx-answer__chev" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
        <span className="gx-answer__body">
          <span className="gx-answer__inner">
            <i style={{ '--k': 0 } as CSSProperties} />
            <i style={{ '--k': 1 } as CSSProperties} />
            <i style={{ '--k': 2 } as CSSProperties} />
            <i style={{ '--k': 3 } as CSSProperties} />
            <span className="gx-answer__src" style={{ '--k': 4 } as CSSProperties}>
              <span className="gx-page" />
              <u />
            </span>
          </span>
        </span>
        <span className="gx-pop gx-answer__star">
          <Doodle kind="star" />
        </span>
      </span>
    </div>
  )
}

const LLMO = [
  ['idle', 800],
  ['think', 1100],
  ['write', 1000],
  ['cite', 2700],
  ['out', 650],
] as const

function LlmoPlace({ live, reduced, query, lead }: PlaceProps) {
  const p = usePhase(LLMO, 'cite', live, reduced, lead)
  return (
    <div
      className="gx-pic__in gx-llmo"
      data-reply={p === 'think' || p === 'write' || p === 'cite' ? '' : undefined}
      data-think={p === 'think' ? '' : undefined}
      data-lines={p === 'write' || p === 'cite' ? '' : undefined}
      data-cite={p === 'cite' ? '' : undefined}
    >
      <span className="gx-you">{query}</span>
      <span className="gx-ai">
        <Doodle kind="sparkle" />
      </span>
      <span className="gx-obj gx-reply">
        <span className="gx-reply__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="gx-reply__lines">
          <i style={{ '--k': 0 } as CSSProperties} />
          <i style={{ '--k': 1 } as CSSProperties} />
          <i style={{ '--k': 2 } as CSSProperties} />
        </span>
        <span className="gx-pop gx-cite">1</span>
      </span>
      <svg className="gx-link" viewBox="0 0 60 20" preserveAspectRatio="none" aria-hidden="true">
        <path d="M1 6.7C22 6.7 30 12.5 59 12.5" />
      </svg>
      <span className="gx-obj gx-source">
        <span className="gx-source__top">
          <i />
          <i />
          <i />
        </span>
        <b />
        <i />
        <i />
        <span className="gx-source__cite">1</span>
      </span>
    </div>
  )
}

/** The place each channel gets a brand found, drawn and set going. */
export function Place({ id, live, reduced, query, lead }: PlaceProps & { id: DiscoveryChannel['id'] }) {
  const props = { live, reduced, query, lead }
  return (
    <div className={`gx-pic gx-pic--${id}`} aria-hidden="true">
      {id === 'seo' ? (
        <SeoPlace {...props} />
      ) : id === 'ads' ? (
        <AdsPlace {...props} />
      ) : id === 'aeo' ? (
        <AeoPlace {...props} />
      ) : (
        <LlmoPlace {...props} />
      )}
    </div>
  )
}
