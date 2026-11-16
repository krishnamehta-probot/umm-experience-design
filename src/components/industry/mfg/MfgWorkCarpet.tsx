import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { SplitButton } from '@/components/primitives'
import { work } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { MfgArt } from './MfgArt'
import { Head } from './Head'
import { useProgress } from './hooks'
import { Weave } from './WorkParts'

/* ============================================================================
   THE MANUFACTURING PAGE — 06 · RELEVANT WORK, option: the carpet unrolling
   (?work=carpet; Krish, 16 Nov: "make it interactive that it can be
   remembered")

   A Mohawk runner, rolled up. The section pins and, as the reader scrolls,
   the roll travels right and lays the runner down behind it: first Mohawk
   itself, then the three engagements, each a length of its own pastel
   woven in its own construction, its drawing and words on it, the stitched
   edge round each length and a fringe at the end. Once the roll reaches
   the edge of the screen the runner slides under it while it keeps
   unrolling, getting thinner as it goes. Each length's words settle once it
   is down.

   On a phone the lengths are simply laid one under another.
   ========================================================================== */

type Geo = { w: number; v: number; x0: number; starts: number[]; widths: number[] }

export function MfgWorkCarpet() {
  const c = work
  const { ref, p } = useProgress<HTMLElement>()
  const stage = useRef<HTMLDivElement>(null)
  const runner = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState<Geo | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const s = stage.current
      const r = runner.current
      if (!s || !r) return
      const segs = [...r.children] as HTMLElement[]
      setGeo({
        w: r.scrollWidth,
        v: s.clientWidth - r.offsetLeft,
        x0: r.offsetLeft,
        starts: segs.map((el) => el.offsetLeft),
        widths: segs.map((el) => el.offsetWidth),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (stage.current) ro.observe(stage.current)
    if (runner.current) ro.observe(runner.current)
    return () => ro.disconnect()
  }, [])

  /* how much is laid down: Mohawk's own length to begin with, then the rest */
  const q = Math.min(1, Math.max(0, (p - 0.03) / 0.94))
  const start = geo ? geo.starts[1] + 90 : 0
  const laid = geo ? start + q * (geo.w - start) : 0
  /* the roll keeps clear of the screen's right edge; past it the runner slides */
  const room = geo ? geo.v - 90 : 0
  const shift = geo ? Math.max(0, laid - room) : 0
  const roll = 1 - q
  /* the roll shows the length still rolled up */
  const tones = ['sun', ...c.cases.map((x) => x.tone)]
  const cur = geo ? geo.starts.findIndex((s0, k) => laid < s0 + geo.widths[k] - 1) : 1
  const tone = tones[cur < 0 ? tones.length - 1 : Math.min(cur, tones.length - 1)]

  return (
    <section id={c.id} ref={ref} className="wcp" aria-labelledby="mw-title">
      <div className="wcp__pin">
        <Head id="mw-title" head={c.head} />

        <div ref={stage} className="wcp__stage" data-ready={geo ? '' : undefined}>
          <div
            ref={runner}
            className="wcp__runner"
            style={{
              translate: `${-shift}px 0`,
              clipPath: geo ? `inset(-40px ${Math.max(0, geo.w - laid)}px -40px 0)` : undefined,
            }}
          >
            <article className="wcp__seg wcp__seg--intro" data-tone="sun" data-open="">
              <Weave kind="basket" />
              <p className="ff-glass">{c.featured.eyebrow}</p>
              <img src={c.featured.logo} alt="Mohawk" />
              <h3 className="wcp__name">{c.featured.name}</h3>
              <p className="wcp__body">{c.featured.body}</p>
            </article>

            {c.cases.map((x, k) => {
              const open = geo ? laid >= geo.starts[k + 1] + geo.widths[k + 1] * 0.55 : true
              return (
                <article key={x.name} className="wcp__seg" data-tone={x.tone} data-open={open ? '' : undefined}>
                  <Weave kind={x.weave} />
                  <div className="wcp__art">
                    <span className="ff-glass">{x.tag}</span>
                    <MfgArt name={x.art} />
                  </div>
                  <div className="wcp__words">
                    <p className="mw-case__k">
                      <span>{pad(k)}</span>
                      {x.eyebrow}
                    </p>
                    <h3 className="wcp__name">{x.name}</h3>
                    <p className="mw-case__title">{x.title}</p>
                    <p className="mw-case__body">{x.body}</p>
                    <div className="mw-case__role">
                      <p>{c.roleLabel}</p>
                      <ul>
                        {x.role.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <SplitButton className="mw-case__go" href={x.href} target="_blank" rel="noopener">
                      {c.read}
                    </SplitButton>
                  </div>
                </article>
              )
            })}
            <i className="wcp__fringe" aria-hidden="true" />
          </div>

          {/* the roll, at the edge of what is laid down */}
          {geo && (
            <span
              className="wcp__roll"
              data-tone={tone}
              aria-hidden="true"
              style={{ left: geo.x0 + laid - shift, '--d': `${56 + 64 * roll}px`, '--turn': `${q * 1080}deg` } as CSSProperties}
            >
              <svg viewBox="-50 -50 100 100">
                <circle r="48" />
                <path d="M0 0c4 0 6 3 6 6s-4 11-12 11-18-6-18-17 10-23 24-23 30 11 30 29" />
              </svg>
              <span className="wcp__hint" data-gone={q > 0.04 || undefined}>
                {c.carpet.hint}
              </span>
            </span>
          )}
        </div>

        <div className="mw__foot" aria-hidden="true">
          <i className="mw__bar" style={{ '--q': q } as CSSProperties} />
          <span>
            {pad(Math.max(0, Math.round(q * c.cases.length) - 1))} <em>/ {pad(c.cases.length - 1)}</em>
          </span>
        </div>
      </div>
    </section>
  )
}
