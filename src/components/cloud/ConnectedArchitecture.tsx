import type { CSSProperties, ReactNode } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { architecture } from '@/content/cloudData'
import { usePipeFlow } from './usePipeFlow'
import '@/styles/cloud-arch.css'
import '@/styles/cloud-pipe.css'

/* ============================================================================
   CLOUD & DATA · THE THINKING BEHIND THE INFRASTRUCTURE

   16 Oct, the doc's second version: one connected architecture, with three
   workflow views (Cloud provisioning, Data migration, Cloud operations)
   and three principles.

   16 Oct, Krish: the four service pages' thinking sections looked alike, so
   each now shows something its service would recognise. Cloud & Data's is a
   data pipeline (cloud-pipe.css), on a light board where the others are ink.
   No picture beside the cards: one pipe runs down the board, and the cards
   hang off it at joints, left and right on a wide screen, all to the right
   of it on a phone or tablet, where the pipe keeps a lane at the board's
   left edge.

     the intelligence layer   the sensor head the pipe hangs from, reading
                              the flow
     your existing systems    pour in at the top, one inlet per system
     the connected platform   a tank that fills as the water passes it
     what it enables          branches off as outlets, one per outcome
     engineer oversight       a valve, with a gauge whose needle swings
     the three workflows      three taps at the bottom, each pouring into
                              its card

   The pipe fills with the reader's scroll (usePipeFlow): flowing dashes and
   packets of data run down it as far as the water has reached, and each
   card lights, its joint filling and its badge taking its tone, as the
   water reaches it. Scrolling stays native, nothing pins, and every word is
   in the page's flow. Reduced motion: the pipe is full and still. Then the
   disclaimer and the principles.
   ========================================================================== */

const ICON = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const Spark = () => (
  <svg {...ICON}>
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
)
const Apps = () => (
  <svg {...ICON}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
)
const Data = () => (
  <svg {...ICON}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
)
const Code = () => (
  <svg {...ICON}>
    <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13" />
  </svg>
)
const Cloud = () => (
  <svg {...ICON}>
    <path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.4 9.1 4.75 4.75 0 0 0 7 18.5z" />
  </svg>
)
const Stack = () => (
  <svg {...ICON}>
    <rect x="4" y="4.5" width="16" height="4.5" rx="1.2" />
    <rect x="4" y="10" width="16" height="4.5" rx="1.2" />
    <rect x="4" y="15.5" width="16" height="4.5" rx="1.2" />
  </svg>
)
const Pulse = () => (
  <svg {...ICON}>
    <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
  </svg>
)
const Loop = () => (
  <svg {...ICON}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </svg>
)
const Check = () => (
  <svg {...ICON}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
)
const Arrow = () => (
  <svg {...ICON}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

/** the oversight valve's hand wheel */
const Wheel = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="12.5" />
    <path d="M16 3.5v25M3.5 16h25" />
    <circle cx="16" cy="16" r="3.2" />
  </svg>
)

/** the oversight gauge: a dial whose needle swings once the water reaches it */
const Gauge = () => (
  <svg className="cp__gauge" viewBox="0 0 72 44" aria-hidden="true">
    <path className="cp__gauge-face" d="M6 38a30 30 0 0 1 60 0z" />
    <path className="cp__gauge-band" d="M50.5 15.5A30 30 0 0 1 66 38" />
    <path
      className="cp__gauge-ticks"
      d="M10.2 38h4M13.9 23.4l3.4 2.1M24 12.6l2 3.5M36 8.5v4M48 12.6l-2 3.5M58.1 23.4l-3.4 2.1M61.8 38h-4"
    />
    <path className="cp__gauge-arc" d="M6 38a30 30 0 0 1 60 0" />
    <g className="cp__needle">
      <path d="M36 38 36 14" />
    </g>
    <circle className="cp__gauge-hub" cx="36" cy="38" r="3.6" />
  </svg>
)

const SYSTEM_ICON = [Apps, Data, Code]
const OUT_TONE: Tone[] = ['sky', 'citrus', 'blossom']
const RULE_TONE: Tone[] = ['sky', 'citrus', 'blossom']
const PACKETS = 8

export function ConnectedArchitecture({ content = architecture }: { content?: typeof architecture }) {
  const { board, workflows, principles } = content
  const { runRef, tankRef, anchorRef, isLit } = usePipeFlow()
  const num = (i: number) => String(i + 1).padStart(2, '0')
  const tone = (t: Tone) => ({ ['--tone' as string]: `var(--umm-${t})` }) as CSSProperties

  /** a card on the pipe, lit once the water reaches its joint */
  const stage = (i: number, side: 'l' | 'r', t: Tone, kind: string, body: ReactNode) => (
    <li
      key={kind}
      className={`cp__card cp__card--${kind}`}
      data-side={side}
      data-on={isLit(i) || undefined}
      ref={kind === 'platform' ? tankRef : undefined}
      style={tone(t)}
    >
      {body}
    </li>
  )

  /** the card's number, in a badge that takes its tone when lit */
  const badge = (i: number) => (
    <span className="cp__badge" aria-hidden="true">
      {num(i)}
    </span>
  )

  /** a plain joint: a stub of pipe from the pipe to the card's side */
  const joint = (i: number, extra?: ReactNode) => (
    <span className="cp__joint" ref={anchorRef(i)} aria-hidden="true">
      <span className="cp__stub" />
      {extra}
    </span>
  )

  const wfLit = workflows.some((_, k) => isLit(4 + k))

  return (
    <section className="umm-section cd-arch cp" id="architecture" aria-labelledby="cf-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="cf-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="sky"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <div className="cp__board" role="group" aria-label={board.label}>
          <div className="cp__top">
            <span className="cp__eyebrow">
              <span className="cp__live" aria-hidden="true" />
              {board.eyebrow}
            </span>
            <span className="cp__mono">{board.tag}</span>
          </div>

          {/* the intelligence layer: the sensor head the pipe hangs from */}
          <div className="cp__sensor">
            <span className="cp__lens" aria-hidden="true">
              <Spark />
            </span>
            <div className="cp__sensor-text">
              <span className="cp__mono">{board.layerEyebrow}</span>
              <p className="cp__sensor-title">{board.layerTitle}</p>
              <p className="cp__sensor-note">{board.layerNote}</p>
              <p className="cp__mono cp__sensor-assist">{board.assist}</p>
            </div>
          </div>

          <div className="cp__run" ref={runRef}>
            {/* the pipe, its water and the packets riding it */}
            <div className="cp__pipe" aria-hidden="true">
              <span className="cp__collar" />
              <span className="cp__water">
                <span className="cp__stream" />
                {Array.from({ length: PACKETS }, (_, k) => (
                  <span key={k} className="cp__packet" style={{ ['--k' as string]: k } as CSSProperties} />
                ))}
              </span>
              <span className="cp__front" />
            </div>

            <ol className="cp__stages">
              {stage(
                0,
                'l',
                'sky',
                'systems',
                <>
                  <div className="cp__head">
                    {badge(0)}
                    <h3 className="cp__title">{board.systemsLabel}</h3>
                  </div>
                  <ul className="cp__list">
                    {board.systems.map((s, k) => {
                      const Icon = SYSTEM_ICON[k]
                      return (
                        <li key={s.title} className="cp__node">
                          {/* each system pours in through its own inlet */}
                          <span className="cp__inlet" ref={k === 0 ? anchorRef(0) : undefined} aria-hidden="true">
                            <span className="cp__drop" style={{ ['--k' as string]: k } as CSSProperties} />
                          </span>
                          <span className="cp__node-icon">
                            <Icon />
                          </span>
                          <span>
                            <span className="cp__node-title">{s.title}</span>
                            <span className="cp__node-sub">{s.items}</span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  <p className="cp__link">
                    <Arrow />
                    {board.systemsLink}
                  </p>
                </>,
              )}

              {stage(
                1,
                'r',
                'lilac',
                'platform',
                <>
                  {joint(1)}
                  {/* the tank: its water rises as the pipe's passes it */}
                  <span className="cp__tank" aria-hidden="true">
                    <span className="cp__tank-water">
                      <span className="cp__wave" />
                    </span>
                    <span className="cp__marks" />
                  </span>
                  <div className="cp__head">
                    {badge(1)}
                    <h3 className="cp__title">{board.platformLabel}</h3>
                  </div>
                  <p className="cp__move">{board.movement}</p>
                  <div className="cp__pair">
                    <div className="cp__box">
                      <Cloud />
                      <span className="cp__node-title">{board.runtime.title}</span>
                      <span className="cp__node-sub">{board.runtime.body}</span>
                    </div>
                    <div className="cp__box">
                      <Stack />
                      <span className="cp__node-title">{board.data.title}</span>
                      <span className="cp__node-sub">{board.data.body}</span>
                    </div>
                  </div>
                  <div className="cp__box cp__box--row">
                    <Pulse />
                    <span>
                      <span className="cp__node-title">{board.observe.title}</span>
                      <span className="cp__node-sub">{board.observe.items}</span>
                    </span>
                  </div>
                  <p className="cp__providers">{board.providers.join(' · ')}</p>
                </>,
              )}

              {stage(
                2,
                'l',
                'blossom',
                'outcomes',
                <>
                  <div className="cp__head">
                    {badge(2)}
                    <h3 className="cp__title">{board.outcomesLabel}</h3>
                  </div>
                  <p className="cp__link">
                    <Arrow />
                    {board.outcomesLink}
                  </p>
                  <ol className="cp__list">
                    {board.outcomes.map((o, k) => (
                      <li key={o} className="cp__outcome" data-umm-tone={OUT_TONE[k]}>
                        {/* each outcome branches off through its own outlet */}
                        <span className="cp__outlet" ref={k === 0 ? anchorRef(2) : undefined} aria-hidden="true">
                          <span className="cp__drop" style={{ ['--k' as string]: k } as CSSProperties} />
                        </span>
                        <span className="cp__mono">{num(k)}</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="cp__loop">
                    <Loop />
                    {board.loop}
                  </p>
                </>,
              )}

              {stage(
                3,
                'r',
                'citrus',
                'oversight',
                <>
                  {joint(
                    3,
                    <span className="cp__valve">
                      <Wheel />
                    </span>,
                  )}
                  <div className="cp__head">
                    {badge(3)}
                    <h3 className="cp__title">{board.oversightLabel}</h3>
                    <Gauge />
                  </div>
                  <ul className="cp__checks">
                    {board.oversight.map((o) => (
                      <li key={o}>
                        <Check />
                        {o}
                      </li>
                    ))}
                  </ul>
                </>,
              )}
            </ol>

            {/* the three workflows: three taps at the bottom of the pipe */}
            <ol className="cp__flows" data-on={wfLit || undefined}>
              {workflows.map((w, k) =>
                stage(
                  4 + k,
                  'r',
                  OUT_TONE[k],
                  w.id,
                  <>
                    <span className="cp__tap" aria-hidden="true">
                      <span className="cp__feed" ref={anchorRef(4 + k)} />
                      <span className="cp__handle" />
                      <span className="cp__spout" />
                      <span className="cp__pour" style={{ ['--k' as string]: k } as CSSProperties}>
                        <i />
                        <i />
                        <i />
                      </span>
                    </span>
                    <div className="cp__head">
                      {badge(4 + k)}
                      <span className="cp__plate">{w.label}</span>
                    </div>
                    <span className="cp__mono">{w.eyebrow}</span>
                    <h3 className="cp__title">{w.title}</h3>
                    <p className="cp__body">{w.body}</p>
                    <dl className="cp__facts">
                      <div>
                        <dt className="cp__mono">{board.aiLabel}</dt>
                        <dd>{w.ai}</dd>
                      </div>
                      <div>
                        <dt className="cp__mono">{board.decisionLabel}</dt>
                        <dd>{w.decision}</dd>
                      </div>
                      <div>
                        <dt className="cp__mono">{board.evidenceLabel}</dt>
                        <dd>{w.evidence.join(' · ')}</dd>
                      </div>
                      <div>
                        <dt className="cp__mono">{board.outcomeLabel}</dt>
                        <dd>{w.outcome}</dd>
                      </div>
                    </dl>
                  </>,
                ),
              )}
            </ol>
          </div>
        </div>

        <p className="cd-arch__note cp__note">{board.disclaimer}</p>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li key={p.title} className="cd-arch__rule" data-umm-tone={RULE_TONE[i]}>
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
