import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
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

   16 Oct, Krish: each service page's thinking section shows something its
   service would recognise, so Engineering's is a pull request history in a
   code tool. Later the same day he asked for it to be finished properly, more
   crafted and premium, so it is built as a real developer tool: one lit
   window (the board) with its title bar (the repo and the tag) and a toolbar
   holding the shared context as connected integrations. Below, the history:
   a git graph down the left, the star of the board, and the five stages as
   commit rows beside it. Each row is a pull request: the stage's title as
   the commit message, its intent as the description, the engineer and the
   agent who worked it, the review gate as its required check and the
   delivery artifact as the file it lands.

   The graph draws itself with the scroll (a reading line at 62% of the
   window, measured once per frame from passive listeners; the scroll stays
   native). The feature branch takes each stage's tone as it runs, Build
   fans out into a parallel branch, Release merges into main (a burst, and
   main lights from there on), Evolve opens a new branch whose signal loops
   back up to the top. The row being read lifts onto a raised card with the
   stage's light behind its commit; its check spins, then ticks, and its
   artifact lands. Small aria-hidden mockup details (hashes, a version tag,
   diff counts, a signal line) are illustration only, as the CX checkout
   phone's are. Nothing pins, every word is in the page's flow. On a phone
   the graph keeps a 26px lane at the left of the rows.
   ========================================================================== */

const TONES: Tone[] = ['blossom', 'sky', 'citrus', 'sun', 'coral']
const RULE_TONES: Tone[] = ['sky', 'sun', 'blossom']
const TOOL_TONES: Tone[] = ['sky', 'blossom', 'lilac']
/* the reading line, as a share of the window's height */
const LINE = 0.62

/* illustration only, inside the mockup (aria-hidden): a short commit hash
   per row and the release's version tag */
const HASHES = ['a1f3c9e', '7c2e5b0', 'e94d1a3', '3b8f06c', 'd5a27e9']
const RELEASE_TAG = 'v2.4.0'
/* a diff stat for the rows that land code-like changes: lines added and
   removed, and GitHub's five blocks (a added, d removed) */
const DIFFS = [
  { add: '+86', del: '−2', a: 4, d: 0 },
  { add: '+1,248', del: '−312', a: 3, d: 1 },
]

const tone = (t: Tone) => ({ ['--tone' as string]: `var(--umm-${t})` }) as CSSProperties

/* --- small drawings ---------------------------------------------------------- */

/* the shared context's three tools, as abstract marks (no brand logos):
   a board's columns, overlapping shapes, a branch */
function ToolMark({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {i % 3 === 0 && (
        <>
          <rect x="2" y="3" width="3.2" height="10" rx="1.2" />
          <rect x="6.4" y="3" width="3.2" height="7" rx="1.2" />
          <rect x="10.8" y="3" width="3.2" height="4.4" rx="1.2" />
        </>
      )}
      {i % 3 === 1 && (
        <>
          <circle cx="10" cy="6" r="3.6" />
          <rect x="2.4" y="7.4" width="6.8" height="6.8" rx="1.8" opacity="0.7" />
        </>
      )}
      {i % 3 === 2 && (
        <>
          <circle cx="4.4" cy="3.8" r="2" />
          <circle cx="4.4" cy="12.2" r="2" />
          <circle cx="11.8" cy="6.2" r="2" />
          <path d="M4.4 5.8v4.4M11.8 8.2c0 2.6-7.4 1.4-7.4 4" fill="none" strokeWidth="1.6" />
        </>
      )}
    </svg>
  )
}

/* who worked the row: an engineer's avatar is a lit orb, an agent's carries a spark */
const Avatar = ({ agent }: { agent?: boolean }) => (
  <span className="ep__avatar" data-agent={agent || undefined} aria-hidden="true">
    {agent && (
      <svg viewBox="0 0 12 12">
        <path d="M6 1.4c.35 2.5 2.1 4.25 4.6 4.6-2.5.35-4.25 2.1-4.6 4.6C5.65 8.1 3.9 6.35 1.4 6 3.9 5.65 5.65 3.9 6 1.4z" />
      </svg>
    )}
  </span>
)

/* the required check: queued ring, a run that spins, then the drawn tick */
const Check = () => (
  <span className="ep__tick" aria-hidden="true">
    <i />
    <svg viewBox="0 0 24 24">
      <path d="M7 12.5l3.4 3.4L17.2 9" />
    </svg>
  </span>
)

/* the artifact, drawn: a document with a folded corner, or a release tag */
const DocMark = ({ tag }: { tag?: boolean }) =>
  tag ? (
    <svg className="ep__doc" viewBox="0 0 24 28" aria-hidden="true">
      <path
        className="ep__doc-body"
        d="M5 2.5h8.6a2 2 0 0 1 1.4.6l5.4 5.4a2 2 0 0 1 0 2.8L9.8 21.9a2 2 0 0 1-2.8 0L1.6 16.5a2 2 0 0 1-.6-1.4V6.5a4 4 0 0 1 4-4z"
      />
      <circle className="ep__doc-hole" cx="6.6" cy="8" r="1.9" />
      <path className="ep__doc-line" d="M9.5 15.5l4.5-4.5" />
    </svg>
  ) : (
    <svg className="ep__doc" viewBox="0 0 24 28" aria-hidden="true">
      <path className="ep__doc-body" d="M3 4a3 3 0 0 1 3-3h9l7 7v16a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
      <path className="ep__doc-fold" d="M15 1v4.5a2.5 2.5 0 0 0 2.5 2.5H22z" />
      <path className="ep__doc-line" d="M7.5 13.5h9M7.5 17.5h9M7.5 21.5h5.5" />
    </svg>
  )

/* each artifact's small readout, illustration only: a diff stat, the test
   run, the rollout, the production signal */
function Readout({ i, n }: { i: number; n: number }) {
  if (i === n - 1)
    return (
      <span className="ep__viz ep__viz--signal" aria-hidden="true">
        <svg viewBox="0 0 96 26" preserveAspectRatio="none">
          <path
            className="ep__signal-area"
            d="M0 19 L12 17 L22 20 L32 12 L42 15 L52 8 L62 11 L72 5 L84 9 L96 3 V26 H0z"
          />
          <path
            className="ep__signal-line"
            d="M0 19 L12 17 L22 20 L32 12 L42 15 L52 8 L62 11 L72 5 L84 9 L96 3"
            pathLength={1}
          />
        </svg>
      </span>
    )
  if (i === n - 2)
    return (
      <span className="ep__viz ep__viz--roll" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    )
  if (i === n - 3)
    return (
      <span className="ep__viz ep__viz--tests" aria-hidden="true">
        {Array.from({ length: 14 }, (_, k) => (
          <i key={k} style={{ ['--k' as string]: k } as CSSProperties} />
        ))}
      </span>
    )
  const d = DIFFS[i % DIFFS.length]
  return (
    <span className="ep__viz ep__viz--diff" aria-hidden="true">
      <b className="ep__add">{d.add}</b>
      <b className="ep__del">{d.del}</b>
      <span className="ep__blocks">
        {Array.from({ length: 5 }, (_, k) => (
          <i key={k} data-k={k < d.a ? 'add' : k < d.a + d.d ? 'del' : undefined} />
        ))}
      </span>
    </span>
  )
}

/* --- the git graph --------------------------------------------------------------- */

type Geo = { w: number; h: number; ys: number[]; loop: number; top: number }

/* the graph, from the measured rows: main down the left, the feature branch
   (Define, Build, Validate) merging into main at Release, Build's parallel
   branch, the branch Evolve opens, and its loop back up to the top */
function graph({ w, h, ys, loop }: Geo) {
  const wide = w >= 80
  const xM = Math.round(w * (wide ? 0.14 : 0.16))
  const xB = Math.round(w * (wide ? 0.39 : 0.5))
  const xP = Math.round(w * 0.64)
  const xL = Math.round(w * (wide ? 0.89 : 0.86))
  const n = ys.length
  const rel = ys[n - 2]
  const evo = ys[n - 1]
  const bend = wide ? 46 : 30
  const C = (x0: number, y0: number, x1: number, y1: number) => {
    const m = (y0 + y1) / 2
    return `C ${x0} ${m} ${x1} ${m} ${x1} ${y1}`
  }
  const f1 = ys[0] - (wide ? 18 : 14)
  const f0 = Math.max(6, f1 - (wide ? 40 : 26))
  const m0 = Math.max(ys[n - 3] + 24, rel - bend - 8)
  const e1 = evo - (wide ? 30 : 22)
  const e0 = Math.max(rel + 22, e1 - bend)
  const r = Math.max(8, (xL - xB) * 0.75)
  const top = wide ? 14 : 10

  /* Build's parallel branch, where the lane is wide enough for it */
  const p0 = ys[1] + 22
  const p3 = ys[2] - 30
  const par = wide && p3 - p0 > bend * 2 + 30
  const pa = p0 + bend
  const pb = p3 - bend

  const feature = `M ${xM} ${f0} ${C(xM, f0, xB, f1)} V ${m0} ${C(xB, m0, xM, rel)}`
  const evolve = `M ${xM} ${e0} ${C(xM, e0, xB, e1)} V ${loop}`
  return {
    xM,
    xB,
    xL,
    f0,
    f1,
    rel,
    main: `M ${xM} 0 V ${h}`,
    feature,
    shipped: `M ${xM} ${rel} V ${h}`,
    evolve,
    par: par ? `M ${xB} ${p0} ${C(xB, p0, xP, pa)} V ${pb} ${C(xP, pb, xB, p3)}` : '',
    parDots: par ? [pa + (pb - pa) * 0.3, pa + (pb - pa) * 0.72].map((y) => ({ x: xP, y })) : [],
    loop: `M ${xB} ${loop} C ${xB} ${loop + r * 1.15} ${xL} ${loop + r * 1.15} ${xL} ${loop} V ${top}`,
    arrow: wide
      ? `M ${xL - 5.5} ${top + 6} L ${xL} ${top} L ${xL + 5.5} ${top + 6}`
      : `M ${xL - 3.5} ${top + 4} L ${xL} ${top} L ${xL + 3.5} ${top + 4}`,
    /* the path the pen follows as the scroll draws: feature, main, evolve */
    pen: `M ${xM} ${f0} ${C(xM, f0, xB, f1)} V ${m0} ${C(xB, m0, xM, rel)} V ${e0} ${C(xM, e0, xB, e1)} V ${loop}`,
    dots: ys.map((y, i) => ({ x: i === n - 2 ? xM : xB, y })),
    /* the feature branch's tone stops, one per commit it carries */
    stops: ys.slice(0, n - 1).map((y) => Math.min(1, Math.max(0, (y - f1) / Math.max(1, rel - f1)))),
  }
}

/* --- the section ------------------------------------------------------------------ */

export function EngineeringFactory({ content = engFactory }: { content?: typeof engFactory }) {
  const { board, stages, principles } = content
  const n = stages.length
  const uid = useId().replace(/:/g, '')
  const boardRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const markRefs = useRef<(HTMLElement | null)[]>([])
  const loopRowRef = useRef<HTMLElement>(null)
  const clipRef = useRef<SVGRectElement>(null)
  const loopLitRef = useRef<SVGPathElement>(null)
  const penRef = useRef<SVGPathElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const geoRef = useRef<Geo | null>(null)
  const [geo, setGeo] = useState<Geo | null>(null)
  const [reached, setReached] = useState(0)
  const [active, setActive] = useState(-1)
  const [looped, setLooped] = useState(false)
  /* the feedback line lights as the loop turns; the arrow when it is home */
  const [returning, setReturning] = useState(false)

  /* measure the rows the graph runs past, whenever the board changes size */
  useLayoutEffect(() => {
    const boardEl = boardRef.current
    const log = logRef.current
    const lane = laneRef.current
    if (!boardEl || !log || !lane) return
    const measure = () => {
      const box = log.getBoundingClientRect()
      const mid = (el: Element | null) => {
        if (!el) return 0
        const r = el.getBoundingClientRect()
        return Math.round(r.top + r.height / 2 - box.top)
      }
      const next: Geo = {
        w: lane.clientWidth,
        h: log.clientHeight,
        ys: markRefs.current.slice(0, n).map(mid),
        loop: mid(loopRowRef.current),
        top: Math.round(box.top - boardEl.getBoundingClientRect().top),
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
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [n])

  const g = useMemo(() => (geo && geo.ys.length === n ? graph(geo) : null), [geo, n])

  /* the scroll draws the graph: everything above the reading line is lit,
     the pen rides the line's front, the loop climbs once Evolve is passed */
  useEffect(() => {
    const log = logRef.current
    if (!log || !geo || !g) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    /* the pen's path, sampled once: y → x */
    const pts: { x: number; y: number }[] = []
    const pen = penRef.current
    if (pen) {
      const len = pen.getTotalLength()
      for (let s = 0; s <= len; s += 3) {
        const p = pen.getPointAtLength(s)
        pts.push({ x: p.x, y: p.y })
      }
    }
    const xAt = (y: number) => {
      let lo = 0
      let hi = pts.length - 1
      while (lo < hi) {
        const m = (lo + hi) >> 1
        if (pts[m].y < y) lo = m + 1
        else hi = m
      }
      return pts[lo]?.x ?? g.xB
    }
    let raf = 0
    const draw = () => {
      raf = 0
      const vh = window.innerHeight
      const read = vh * LINE - log.getBoundingClientRect().top
      const line = still ? Infinity : read
      clipRef.current?.setAttribute('height', String(Math.max(0, Math.min(geo.h, line))))
      const head = headRef.current
      if (head) {
        const on = !still && read > g.f0 + 4 && read < geo.loop - 2
        head.style.opacity = on ? '1' : '0'
        if (on) head.setAttribute('transform', `translate(${xAt(read)} ${read})`)
      }
      const q = still ? 1 : Math.min(1, Math.max(0, (read - geo.loop) / (vh * 0.28)))
      loopLitRef.current?.style.setProperty('stroke-dashoffset', String(1 - q))
      setReached(still ? n : geo.ys.filter((y) => line >= y).length)
      setActive(geo.ys.filter((y) => read >= y).length - 1)
      setLooped(q >= 0.98)
      setReturning(q >= 0.14)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [geo, g, n])

  /* the stage light sits behind the commit being read */
  const lit = Math.max(0, active)
  const boardStyle = {
    ...tone(TONES[lit % TONES.length]),
    ['--ep-gy' as string]: geo ? `${geo.top + (geo.ys[lit] ?? 0)}px` : '30%',
    ['--ep-gx' as string]: g ? `${g.xB}px` : '0px',
  } as CSSProperties

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

        <div
          className="ep__board"
          ref={boardRef}
          data-umm-theme="ink"
          data-looped={looped || undefined}
          data-reading={active >= 0 || undefined}
          role="group"
          aria-label={board.label}
          style={boardStyle}
        >
          <span className="ep__glow" aria-hidden="true" />

          {/* the window's chrome: title bar, then the connected integrations */}
          <div className="ep__chrome">
            <div className="ep__bar">
              <span className="ep__lights" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="ep__repo">{board.eyebrow}</span>
              <span className="ep__tag">
                <span className="ep__live" aria-hidden="true" />
                {board.tag}
              </span>
            </div>

            <div className="ep__context">
              <span className="ep__label">{board.contextLabel}</span>
              <ul>
                {board.context.map((c, i) => (
                  <li key={c.tool} style={tone(TOOL_TONES[i % TOOL_TONES.length])}>
                    <span className="ep__tool">
                      <ToolMark i={i} />
                    </span>
                    <span className="ep__tool-text">
                      <strong>{c.tool}</strong>
                      <span>{c.role}</span>
                    </span>
                    <span className="ep__synced" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* the history: the graph down the left, the pull requests beside it */}
          <div className="ep__log" ref={logRef}>
            <div className="ep__lane" ref={laneRef} aria-hidden="true">
              {g && geo && (
                <svg className="ep__graph" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
                  <defs>
                    <clipPath id={`${uid}-read`}>
                      <rect ref={clipRef} x="-40" y="0" width={geo.w + 80} height="0" />
                    </clipPath>
                    <linearGradient
                      id={`${uid}-feat`}
                      gradientUnits="userSpaceOnUse"
                      x1="0"
                      y1={g.f1}
                      x2="0"
                      y2={g.rel}
                    >
                      {g.stops.map((o, i) => (
                        <stop key={i} offset={o} style={{ stopColor: `var(--umm-${TONES[i % TONES.length]})` }} />
                      ))}
                    </linearGradient>
                    <filter
                      id={`${uid}-glow`}
                      filterUnits="userSpaceOnUse"
                      x={-30}
                      y={-30}
                      width={geo.w + 60}
                      height={geo.h + 60}
                    >
                      <feGaussianBlur stdDeviation="4" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id={`${uid}-halo`} x="-200%" y="-200%" width="500%" height="500%">
                      <feGaussianBlur stdDeviation="4" />
                    </filter>
                  </defs>

                  {/* the tracks, unlit */}
                  <g className="ep__track">
                    <path d={g.main} />
                    <path d={g.feature} />
                    {g.par && <path d={g.par} />}
                    <path d={g.evolve} />
                    <path className="ep__track-loop" d={g.loop} />
                  </g>

                  {/* lit by the scroll */}
                  <g className="ep__lit" clipPath={`url(#${uid}-read)`} filter={`url(#${uid}-glow)`}>
                    <path className="ep__lit-main" d={g.shipped} />
                    {g.par && <path className="ep__lit-par" d={g.par} />}
                    <path className="ep__lit-feature" d={g.feature} stroke={`url(#${uid}-feat)`} />
                    <path className="ep__lit-evolve" d={g.evolve} />
                  </g>
                  <path
                    ref={loopLitRef}
                    className="ep__lit-loop"
                    d={g.loop}
                    pathLength={1}
                    filter={`url(#${uid}-glow)`}
                  />
                  <path className="ep__arrow" d={g.arrow} />
                  <path ref={penRef} className="ep__pen" d={g.pen} />

                  {/* Build's parallel commits */}
                  {g.parDots.map((d, k) => (
                    <circle
                      key={k}
                      className="ep__mini"
                      data-on={reached >= 3 || (reached >= 2 && active === 1) || undefined}
                      cx={d.x}
                      cy={d.y}
                      r={geo.w >= 80 ? 4 : 3}
                    />
                  ))}

                  {/* the five commits */}
                  {g.dots.map((d, i) => {
                    const r = geo.w >= 80 ? 6 : 4.2
                    const merge = i === n - 2
                    return (
                      <g
                        key={i}
                        className="ep__commit"
                        data-on={i < reached || undefined}
                        data-active={i === active || undefined}
                        data-merge={merge || undefined}
                        style={tone(TONES[i % TONES.length])}
                      >
                        <circle className="ep__halo" cx={d.x} cy={d.y} r={r + 4} filter={`url(#${uid}-halo)`} />
                        <circle className="ep__pulse" cx={d.x} cy={d.y} r={r + 1} />
                        <circle className="ep__ring" cx={d.x} cy={d.y} r={r + (merge ? 6.5 : 3)} />
                        {merge && <circle className="ep__burst" cx={d.x} cy={d.y} r={r + 4} />}
                        {merge && <circle className="ep__burst ep__burst--late" cx={d.x} cy={d.y} r={r + 4} />}
                        {merge && <circle className="ep__merge-ring" cx={d.x} cy={d.y} r={r + 4.5} />}
                        <circle className="ep__dot" cx={d.x} cy={d.y} r={r} />
                      </g>
                    )
                  })}

                  {/* the pen: the front of the drawing */}
                  <g ref={headRef} className="ep__head" style={{ opacity: 0 }}>
                    <circle r="7" className="ep__head-glow" filter={`url(#${uid}-halo)`} />
                    <circle r={geo.w >= 80 ? 3.2 : 2.4} className="ep__head-core" />
                  </g>
                </svg>
              )}
            </div>

            <ol className="ep__prs">
              {stages.map((stage, i) => {
                const t = TONES[i % TONES.length]
                return (
                  <li
                    key={stage.name}
                    className="ep__pr"
                    data-on={i < reached || undefined}
                    data-active={i === active || undefined}
                    style={tone(t)}
                  >
                    <div className="ep__pr-in">
                      <p
                        className="ep__meta"
                        ref={(el) => {
                          markRefs.current[i] = el
                        }}
                      >
                        <span className="ep__n">{String(i + 1).padStart(2, '0')}</span>
                        <span className="ep__stage">{stage.name}</span>
                        <span className="ep__hash" aria-hidden="true">
                          {HASHES[i % HASHES.length]}
                        </span>
                        {i === n - 2 && (
                          <span className="ep__vtag" aria-hidden="true">
                            {RELEASE_TAG}
                          </span>
                        )}
                      </p>
                      <h3 className="ep__title">{stage.title}</h3>
                      <p className="ep__desc">{stage.body}</p>

                      <dl className="ep__people">
                        <div>
                          <dt className="ep__label">
                            <Avatar />
                            {board.directLabel}
                          </dt>
                          <dd>{stage.direct}</dd>
                        </div>
                        <div>
                          <dt className="ep__label">
                            <Avatar agent />
                            {board.assistLabel}
                          </dt>
                          <dd>{stage.assist}</dd>
                        </div>
                      </dl>

                      <div className="ep__gate">
                        <Check />
                        <div>
                          <p className="ep__label">{board.gateLabel}</p>
                          <p className="ep__gate-text">{stage.gate}</p>
                        </div>
                      </div>

                      <div className="ep__file">
                        <DocMark tag={i === n - 2} />
                        <div>
                          <p className="ep__label">{board.artifactLabel}</p>
                          <p className="ep__file-name">{stage.artifact}</p>
                        </div>
                        <Readout i={i} n={n} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>

            <p className="ep__loop" data-on={returning || undefined}>
              <span className="ep__loop-text" ref={loopRowRef}>
                {board.loop}
              </span>
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
