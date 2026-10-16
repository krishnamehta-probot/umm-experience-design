import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { factory as engFactory } from '@/content/engineering'
import '@/styles/cloud-arch.css'
import '@/styles/eng-pr.css'

/* ============================================================================
   DIGITAL ENGINEERING · INSIDE OUR ENGINEERING FACTORY

   16 Oct, the doc's second version: the factory is the page's one story.
   The shared context (Jira, Figma, GitHub) feeds five stages, Define →
   Build → Validate → Release → Evolve, each with its intent, who directs
   (engineers), who assists (agents), the review gate it must pass and its
   delivery artifact; production feedback returns to the backlog. Then the
   three principles, as the other boards' rule cards.

   16 Oct, Krish: the four service pages' thinking sections looked alike, so
   each now shows something its service would recognise. Engineering's is a
   pull request history (eng-pr.css). The ink board is a code tool's window:
   a window bar with the repo (the board's eyebrow), the shared context as
   connected integrations, then the five stages as pull requests on a
   branch, drawn as a git graph down the left of the list, inside the board.
   Each card reads like a PR: the stage's title and intent as its title and
   description, engineers directing and agents assisting beside it, the
   review gate as its required check, the delivery artifact as the file it
   merges.

   The graph draws itself as the reader scrolls (a reading line at 62% of
   the window, measured once per frame, passive listener; the scroll stays
   native). A commit lights as its card is reached and the card's check
   ticks citrus. Release merges the branch into the main line; Evolve opens
   a new branch whose loop runs back up to the top, as production feedback
   returns to the backlog. Nothing pins, every word is in the page's flow.
   On a phone the graph keeps a narrow lane at the left of the cards.
   ========================================================================== */

const TONES: Tone[] = ['blossom', 'sky', 'citrus', 'sun', 'coral']
const RULE_TONES: Tone[] = ['sky', 'sun', 'blossom']
/* the reading line, as a share of the window's height */
const LINE = 0.62

const ICON = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const Repo = () => (
  <svg {...ICON}>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
    <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" />
  </svg>
)
const BranchMark = () => (
  <svg {...ICON}>
    <circle cx="6" cy="5.5" r="2.3" />
    <circle cx="6" cy="18.5" r="2.3" />
    <circle cx="18" cy="6.5" r="2.3" />
    <path d="M6 8v8M18 9c0 5.5-12 2.5-12 7" />
  </svg>
)
const PullRequest = () => (
  <svg {...ICON}>
    <circle cx="6" cy="5.5" r="2.3" />
    <circle cx="6" cy="18.5" r="2.3" />
    <circle cx="18" cy="18.5" r="2.3" />
    <path d="M6 8v8M18 16.2V10a3 3 0 0 0-3-3h-4.5" />
    <path d="m12.5 4.8-2.2 2.2 2.2 2.2" />
  </svg>
)
const Merge = () => (
  <svg {...ICON}>
    <circle cx="6" cy="5.5" r="2.3" />
    <circle cx="6" cy="18.5" r="2.3" />
    <circle cx="18" cy="13" r="2.3" />
    <path d="M6 8v8M6 8c0 3.5 3.5 5 9.7 5" />
  </svg>
)
/* the shared context's three tools, as generic marks: a ticket, a pen, a commit */
const Ticket = () => (
  <svg {...ICON}>
    <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6z" />
    <path d="M14 5v2.5M14 11v2M14 16.5V19" />
  </svg>
)
const Pen = () => (
  <svg {...ICON}>
    <path d="M12 3.5 5.5 10l3 9h7l3-9z" />
    <circle cx="12" cy="11.2" r="1.7" />
    <path d="M12 3.5v6" />
  </svg>
)
const Commit = () => (
  <svg {...ICON}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M3 12h5.8M15.2 12H21" />
  </svg>
)
const CONTEXT_ICONS = [Ticket, Pen, Commit]

const Person = () => (
  <svg {...ICON}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-6 7-6s6.2 2.4 7 6" />
  </svg>
)
const Spark = () => (
  <svg {...ICON}>
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
)
const Shield = () => (
  <svg {...ICON}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z" />
  </svg>
)
const File = () => (
  <svg {...ICON}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
)
const Loop = () => (
  <svg {...ICON}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </svg>
)
/* the required check: a pending ring that turns into a citrus tick */
const Tick = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path className="ep__tick-mark" d="M6.5 12.5l3.6 3.6 7.4-7.6" pathLength={1} />
  </svg>
)

/* which mark heads each stage's card: open PRs, the merge, the new branch */
const stageMark = (i: number, n: number) => (i === n - 1 ? BranchMark : i === n - 2 ? Merge : PullRequest)

type Geo = { w: number; h: number; ys: number[]; loop: number }

/* the git graph, from the measured rows: main, the feature branch that
   merges at Release, the branch Evolve opens, and the loop back to the top */
function graph({ w, h, ys, loop }: Geo) {
  const xM = Math.round(w * 0.22)
  const xB = Math.round(w * 0.52)
  const xL = Math.round(w * 0.82)
  const n = ys.length
  const rel = ys[n - 2]
  const evo = ys[n - 1]
  const curve = (x0: number, y0: number, x1: number, y1: number) => {
    const m = (y0 + y1) / 2
    return `C ${x0} ${m} ${x1} ${m} ${x1} ${y1}`
  }
  const f1 = Math.max(18, ys[0] - 22)
  const f0 = Math.max(0, f1 - 46)
  const m0 = Math.max(ys[n - 3] + 24, rel - 70)
  const e1 = evo - 22
  const e0 = Math.max(rel + 12, e1 - 46)
  const r = Math.max(14, (xL - xB) * 1.2)
  return {
    xM,
    xB,
    xL,
    main: `M ${xM} 0 V ${h}`,
    feature: `M ${xM} ${f0} ${curve(xM, f0, xB, f1)} V ${m0} ${curve(xB, m0, xM, rel)}`,
    shipped: `M ${xM} ${rel} V ${h}`,
    evolve: `M ${xM} ${e0} ${curve(xM, e0, xB, e1)} V ${loop}`,
    loop: `M ${xB} ${loop} C ${xB} ${loop + r} ${xL} ${loop + r} ${xL} ${loop} V 8`,
    arrow: `M ${xL - 5} 13 L ${xL} 7 L ${xL + 5} 13`,
    dots: ys.map((y, i) => ({ x: i === n - 2 ? xM : xB, y })),
  }
}

export function EngineeringFactory({ content = engFactory }: { content?: typeof engFactory }) {
  const { board, stages, principles } = content
  const n = stages.length
  const logRef = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const markRefs = useRef<(HTMLSpanElement | null)[]>([])
  const loopRowRef = useRef<HTMLParagraphElement>(null)
  const clipRef = useRef<SVGRectElement>(null)
  const loopLitRef = useRef<SVGPathElement>(null)
  const geoRef = useRef<Geo | null>(null)
  const [geo, setGeo] = useState<Geo | null>(null)
  const [reached, setReached] = useState(0)
  const [looped, setLooped] = useState(false)

  /* measure the rows the graph runs past, whenever the list changes size */
  useLayoutEffect(() => {
    const log = logRef.current
    const lane = laneRef.current
    if (!log || !lane) return
    const measure = () => {
      const top = log.getBoundingClientRect().top
      const mid = (el: Element | null) => {
        if (!el) return 0
        const r = el.getBoundingClientRect()
        return Math.round(r.top + r.height / 2 - top)
      }
      const next: Geo = {
        w: lane.clientWidth,
        h: log.clientHeight,
        ys: markRefs.current.slice(0, n).map(mid),
        loop: mid(loopRowRef.current),
      }
      const prev = geoRef.current
      if (prev && JSON.stringify(prev) === JSON.stringify(next)) return
      geoRef.current = next
      setGeo(next)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(log)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [n])

  /* the scroll draws the graph: everything above the reading line is lit */
  useEffect(() => {
    const log = logRef.current
    if (!log || !geo) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const draw = () => {
      raf = 0
      const g = geoRef.current
      if (!g) return
      const vh = window.innerHeight
      const line = still ? Infinity : vh * LINE - log.getBoundingClientRect().top
      clipRef.current?.setAttribute('height', String(Math.max(0, Math.min(g.h, line))))
      const q = still ? 1 : Math.min(1, Math.max(0, (line - g.loop) / (vh * 0.3)))
      loopLitRef.current?.style.setProperty('stroke-dashoffset', String(1 - q))
      setReached(g.ys.filter((y) => line >= y).length)
      setLooped(q >= 1)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    draw()
    if (still) return
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [geo])

  const g = geo && geo.ys.length === n ? graph(geo) : null

  return (
    <section className="umm-section cd-arch ep" id="factory" aria-labelledby="ef-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="ef-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="blossom"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <p className="cx-lead ep__intro">{content.intro}</p>

        <div className="ep__board" data-umm-theme="ink" role="group" aria-label={board.label}>
          {/* the window bar: the repo, and where it leads */}
          <div className="ep__bar">
            <span className="ep__lights" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="ep__repo">
              <Repo />
              {board.eyebrow}
            </span>
            <span className="ep__tag">
              <BranchMark />
              {board.tag}
            </span>
          </div>

          {/* the shared context, as the repo's connected integrations */}
          <div className="ep__context">
            <span className="ep__label">{board.contextLabel}</span>
            <ul>
              {board.context.map((c, i) => {
                const Mark = CONTEXT_ICONS[i % CONTEXT_ICONS.length]
                return (
                  <li key={c.tool}>
                    <span className="ep__tool-mark">
                      <Mark />
                    </span>
                    <strong>{c.tool}</strong>
                    <span>{c.role}</span>
                    <span className="ep__linked" aria-hidden="true" />
                  </li>
                )
              })}
            </ul>
          </div>

          {/* the history: the graph down the left, the pull requests beside it */}
          <div className="ep__log" ref={logRef}>
            <div className="ep__lane" ref={laneRef} aria-hidden="true">
              {g && geo && (
                <svg className="ep__graph" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
                  <defs>
                    <clipPath id="ep-read">
                      <rect ref={clipRef} x="0" y="0" width={geo.w} height="0" />
                    </clipPath>
                  </defs>
                  <g className="ep__track">
                    <path d={g.main} />
                    <path d={g.feature} />
                    <path d={g.evolve} />
                    <path className="ep__track-loop" d={g.loop} />
                  </g>
                  <g className="ep__lit" clipPath="url(#ep-read)">
                    <path className="ep__lit-feature" d={g.feature} />
                    <path className="ep__lit-main" d={g.shipped} />
                    <path className="ep__lit-evolve" d={g.evolve} />
                  </g>
                  <path ref={loopLitRef} className="ep__lit-loop" d={g.loop} pathLength={1} />
                  <path className="ep__arrow" data-on={looped || undefined} d={g.arrow} />
                  {g.dots.map((d, i) => (
                    <g
                      key={i}
                      className="ep__commit"
                      data-on={i < reached || undefined}
                      data-merge={i === n - 2 || undefined}
                      style={{ ['--tone' as string]: `var(--umm-${TONES[i % TONES.length]})` } as CSSProperties}
                    >
                      <circle className="ep__halo" cx={d.x} cy={d.y} r="12" />
                      <circle className="ep__dot" cx={d.x} cy={d.y} r="6" />
                      {i === n - 2 && <circle className="ep__core" cx={d.x} cy={d.y} r="2.2" />}
                    </g>
                  ))}
                  <circle className="ep__loop-dot" data-on={looped || undefined} cx={g.xB} cy={geo.loop} r="5" />
                </svg>
              )}
            </div>

            <ol className="ep__prs">
              {stages.map((stage, i) => {
                const tone = TONES[i % TONES.length]
                const Mark = stageMark(i, n)
                return (
                  <li
                    key={stage.name}
                    className="ep__pr"
                    data-on={i < reached || undefined}
                    style={{ ['--tone' as string]: `var(--umm-${tone})` } as CSSProperties}
                  >
                    <div className="ep__pr-head">
                      <span
                        className="ep__pr-mark"
                        ref={(el) => {
                          markRefs.current[i] = el
                        }}
                      >
                        <Mark />
                      </span>
                      <span className="ep__label ep__label--tone">
                        {String(i + 1).padStart(2, '0')} / {stage.name}
                      </span>
                    </div>
                    <h3 className="ep__title">{stage.title}</h3>
                    <p className="ep__desc">{stage.body}</p>

                    <ul className="ep__people">
                      <li>
                        <span className="ep__avatar">
                          <Person />
                        </span>
                        <span>
                          <span className="ep__label">{board.directLabel}</span>
                          <p>{stage.direct}</p>
                        </span>
                      </li>
                      <li>
                        <span className="ep__avatar ep__avatar--agent">
                          <Spark />
                        </span>
                        <span>
                          <span className="ep__label">{board.assistLabel}</span>
                          <p>{stage.assist}</p>
                        </span>
                      </li>
                    </ul>

                    <div className="ep__checks">
                      <div className="ep__checks-head">
                        <Shield />
                        <span className="ep__label">{board.gateLabel}</span>
                      </div>
                      <p className="ep__check">
                        <span className="ep__tick">
                          <Tick />
                        </span>
                        <span>{stage.gate}</span>
                      </p>
                    </div>

                    <div className="ep__file">
                      <span className="ep__label">{board.artifactLabel}</span>
                      <p className="ep__chip">
                        <File />
                        <span>{stage.artifact}</span>
                        <span className="ep__diff" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                          <i />
                          <i />
                        </span>
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>

            <p className="ep__loop" ref={loopRowRef} data-on={looped || undefined}>
              <Loop />
              {board.loop}
            </p>
          </div>
        </div>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li key={p.title} className="cd-arch__rule" data-umm-tone={RULE_TONES[i]}>
              <span className="cd-arch__rule-tag">
                {String(i + 1).padStart(2, '0')} / {p.step}
              </span>
              <h3 className="cd-arch__rule-title">{p.title}</h3>
              <p className="cd-arch__rule-body">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
