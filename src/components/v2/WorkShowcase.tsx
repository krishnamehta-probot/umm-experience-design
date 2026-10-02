import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SplitButton } from '../primitives'
import { IconArrowUpRight } from '../icons'
import { ChipHead, withAccent } from './ChipHead'
import { ScreenLoop } from './ScreenLoop'
import { Shape } from './Shape'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { work } from '@/content/cxUiDesign'

/* ============================================================================
   3 · OUR WORK — proof, straight after the problem

   Five industry tabs over one fixed-height stage (Notion's tab stage), so
   switching from Retail to Finance never changes the page height. Each tab is
   one real project: its 15-second screen loop on the left, and on the right
   the number-first story (Ramp) — sector line, what we did, three results,
   the context strip and the link to the full case study.

   The tabs advance on their own, one loop each, the way a showreel does,
   until the reader picks one; from then on the reader is driving. The bar
   under the live tab is the loop's own clock.

   Under the stage: the honesty line and its button, then the logo strip
   (Stripe's placement: directly under the stories it vouches for).
   ========================================================================== */

/** "92%" → 92 + "%", "4X" → 4 + "X", "45" → 45 + "". */
function split(value: string) {
  const m = /^([\d.]+)(.*)$/.exec(value)
  return m ? { n: parseFloat(m[1]), suffix: m[2] } : { n: 0, suffix: value }
}

export function WorkShowcase() {
  const projects = work.projects
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const ref = useRef<HTMLElement>(null)
  const clockRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const p = projects[active]

  /* warm the next project's first screen so the switch never shows a gap */
  useEffect(() => {
    const next = projects[(active + 1) % projects.length]
    if (next.screens) new Image().src = `/work/${next.screens}/home.webp`
  }, [active, projects])

  /* the panel re-enters on every switch, and its numbers count up */
  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.cx-work__info > *', { opacity: 0, y: 16, duration: 0.6, stagger: 0.06, ease: 'power3.out' })
      gsap.utils.toArray<HTMLElement>('.cx-work__n b').forEach((b) => {
        const { n, suffix } = split(b.dataset.value ?? '')
        const o = { v: 0 }
        gsap.to(o, {
          v: n,
          duration: 1.3,
          ease: 'power2.out',
          delay: 0.15,
          onUpdate: () => {
            b.textContent = `${Math.round(o.v)}${suffix}`
          },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [active])

  const pick = (i: number) => {
    setAuto(false)
    setActive(i)
  }
  const next = () => auto && setActive((i) => (i + 1) % projects.length)

  /* arrow keys move along the tablist, as a tablist should */
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const dir = e.key === 'ArrowRight' ? 1 : -1
    const i = (active + dir + projects.length) % projects.length
    pick(i)
    ;(e.currentTarget.querySelectorAll('button')[i] as HTMLButtonElement)?.focus()
  }

  return (
    <section className="umm-section cx-work" id="work" ref={ref}>
      <div className="umm-container">
        <div className="cx-head">
          <ChipHead
            line1={work.line1}
            line2={withAccent(work.line2, work.accent)}
            chip={work.chip}
            tone="citrus"
            chipAt="45%"
            tilt={-7}
            lineRecipe={3}
            chipRecipe={2}
          />
          <p className="cx-lead">{work.lead}</p>
        </div>

        <div className="cx-work__tabs" role="tablist" aria-label="Industries" onKeyDown={onKey}>
          {projects.map((proj, i) => (
            <button
              key={proj.client}
              type="button"
              role="tab"
              id={`cx-work-tab-${i}`}
              aria-selected={i === active}
              aria-controls="cx-work-panel"
              tabIndex={i === active ? 0 : -1}
              className="cx-work__tab"
              data-umm-tone={proj.tone}
              onClick={() => pick(i)}
            >
              <Shape name={proj.shape} className="cx-work__tab-shape" />
              <span>{proj.tab}</span>
              {/* the live tab's bar is the loop's own clock while the reel runs,
                  so it pauses exactly when the film does */}
              {i === active && auto ? <i className="cx-work__clock" ref={clockRef} /> : null}
            </button>
          ))}
        </div>

        <div
          className="cx-work__stage"
          id="cx-work-panel"
          role="tabpanel"
          aria-labelledby={`cx-work-tab-${active}`}
          data-umm-tone={p.tone}
          ref={panelRef}
        >
          <div className="cx-work__film">
            {p.screens ? (
              <ScreenLoop
                key={p.client}
                folder={p.screens}
                url={new URL(p.href).hostname}
                stat={p.numbers[0]}
                onDone={next}
                onProgress={(t) => clockRef.current?.style.setProperty('--t', t.toFixed(4))}
                repeat={!auto}
              />
            ) : null}
          </div>

          <div className="cx-work__info">
            <p className="cx-work__sector">{p.sector}</p>
            <h3 className="cx-work__client">{p.client}</h3>
            <p className="cx-work__line">{p.sectorLine}</p>
            <p className="cx-work__did">{p.did}</p>

            <ul className="cx-work__numbers">
              {p.numbers.map((n) => (
                <li className="cx-work__n" key={n.label}>
                  <b data-value={n.value}>{n.value}</b>
                  <span>{n.label}</span>
                </li>
              ))}
            </ul>

            <dl className="cx-work__strip">
              <div>
                <dt>What we track</dt>
                <dd>{p.strip.track}</dd>
              </div>
              <div>
                <dt>Journey</dt>
                <dd>{p.strip.journey}</dd>
              </div>
              <div>
                <dt>You get</dt>
                <dd>{p.strip.get}</dd>
              </div>
            </dl>

            <a className="cx-work__more" href={p.href} target="_blank" rel="noreferrer">
              Read the full story
              <IconArrowUpRight size={16} strokeWidth={2} />
            </a>
          </div>
        </div>

        <div className="cx-work__foot">
          <p>{work.footnote}</p>
          <SplitButton href="#contact" variant="outline">
            {work.cta}
          </SplitButton>
        </div>

        <div className="cx-logos" aria-label={`${work.logosLead} ${work.logos.join(', ')}`}>
          <span className="cx-logos__lead">{work.logosLead}</span>
          <ul aria-hidden="true">
            {work.logos.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
