import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import type { Tone } from '@/components/primitives'
import { growthSystem as content0 } from '@/content/growth'
import { Flywheel } from './Flywheel'
import { useGrowthFlywheel } from './growthFlywheel'
import '@/styles/cloud-arch.css'
import '@/styles/growth-flywheel.css'

/* ============================================================================
   INTEGRATED GROWTH · THE THINKING BEHIND THE GROWTH: THE GROWTH FLYWHEEL

   16 Oct, the doc's second version: the UMM growth system, the page's
   story: the commercial direction (one brief) over customer signals that
   flow into the growth engine, which activates the channels, whose
   responses return as intelligence; four workflows through it; then the
   marketing factory.

   17 Oct, Krish: the growth curve was not it ("this section needs something
   else, not this animation"). His pick is a growth flywheel, the loop the
   copy already describes (feedback returns to the brief and the growth
   engine):

     - the hero is one rendered flywheel: the four stages as a loop of
       chevron segments round it, an ink rotor with fine ticks and lit slots
       that turns as you read and gathers speed, and the commercial
       direction as its hub, its four priorities engraved round the edge.
       The segment of the stage being read fills in its tone, a lit tip
       running the loop.
     - the four workflows are small wheels in its corners; the one being
       read (or chosen in the legend) lights and is belted round the
       flywheel, spinning with it
     - the stages and the workflows are editorial rows in the page's flow
       (the CX row: tick, number, big title from 0.45 to 1, hairlines)

   Wide and tall enough, the wheel is held (sticky) beside the rows, in the
   middle of the screen. On a phone or tablet it is a compact wheel in a
   frosted strip held at the top (under a third of the screen), naming the
   stage or workflow being read. On a short window nothing is held. Then
   across the architecture, and the marketing factory, as they were.
   ========================================================================== */

/** each stage's light round the loop (the engine, the page's own sun) */
const STAGE_TONES: Tone[] = ['sky', 'sun', 'coral', 'citrus']
/** the four workflows' wheels */
const FLOW_TONES: Tone[] = ['citrus', 'sky', 'coral', 'sun']
/** the factory's four, as they were */
const FACTORY_TONES: Tone[] = ['citrus', 'sun', 'sky', 'blossom']

/** "01 Customer signals" → ["01", "Customer signals"] */
const split = (label: string) => {
  const m = label.match(/^(\d+)\s+(.*)$/)
  return m ? [m[1], m[2]] : ['', label]
}

const tone = (t: Tone) => ({ ['--tone' as string]: `var(--umm-${t})` }) as CSSProperties

const Check = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d="M5 10.5 8.5 14 15 6.5" />
  </svg>
)

export function GrowthSystem({ content = content0 }: { content?: typeof content0 }) {
  const { board, workflows, factory } = content
  const runRef = useRef<HTMLDivElement>(null)
  const [pick, setPick] = useState<number | null>(null)
  useGrowthFlywheel(runRef, pick)

  const stages = [board.signals.label, board.engine.label, board.channels.label, board.measure.label].map(split)

  /** a part's sources or channels: hairline rows */
  const nodes = (list: { title: string; body: string }[]) => (
    <ul className="gf__nodes">
      {list.map((n) => (
        <li key={n.title}>
          <span className="gf__item">{n.title}</span>
          <span className="gf__small">{n.body}</span>
        </li>
      ))}
    </ul>
  )

  /** a stage row: tick, number and title, then what links it on and what it holds */
  const stage = (i: number, side: ReactNode, body: ReactNode) => {
    const [n, name] = stages[i]
    return (
      <li className="gf__stage" data-gf-stage="" style={tone(STAGE_TONES[i])}>
        <div className="gf__stage-head">
          <span className="gf__tick" aria-hidden="true">
            <Check />
          </span>
          <span className="gf__n" aria-hidden="true">
            {n}
          </span>
          <h3 className="gf__stage-title">
            <span className="umm-sr-only">{n} </span>
            {name}
          </h3>
        </div>
        <div className="gf__stage-side">{side}</div>
        <div className="gf__stage-body">{body}</div>
      </li>
    )
  }

  return (
    <section className="umm-section cd-arch gf" id="growth" aria-labelledby="gs-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="gs-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="sun"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <div className="gf__board" role="group" aria-label={board.label}>
          <div className="gf__top">
            <span className="gf__eyebrow">
              <span className="gf__live" aria-hidden="true" />
              {board.eyebrow}
            </span>
            <span className="gf__label">{board.tag}</span>
          </div>

          <div className="gf__run" ref={runRef} data-phase="system">
            {/* the hero: the flywheel, with the commercial direction as its hub */}
            <div className="gf__hold">
              <div className="gf__direction">
                <p className="gf__label">{board.direction.label}</p>
                <p className="gf__dir-title">
                  {/* a sentence a line in the hub */}
                  {(board.direction.title.match(/[^.]+(?:\.|$)/g) ?? [board.direction.title]).map((s, i, all) => (
                    <span key={s}>
                      {s.trim()}
                      {i < all.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </p>
                <ul className="gf__pills">
                  {board.direction.items.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="gf__strip">
                <Flywheel
                  stages={stages}
                  items={board.direction.items}
                  stageTones={STAGE_TONES}
                  flowTones={FLOW_TONES}
                />
                {/* the strip's caption (phones and tablets): what is being read */}
                <div className="gf__readout" aria-hidden="true" data-i="0">
                  {stages.map(([n, name], i) => (
                    <span key={n} data-slot={i}>
                      <b>{n}</b>
                      {name}
                    </span>
                  ))}
                  {workflows.map((w, k) => (
                    <span key={w.id} data-slot={4 + k} style={tone(FLOW_TONES[k])}>
                      <i />
                      {w.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="gf__rows">
              {/* the system: four stages, read in turn as the wheel fills */}
              <ol className="gf__stages">
                {stage(0, <p className="gf__link">{board.signals.link}</p>, nodes(board.signals.nodes))}

                {stage(
                  1,
                  <div className="gf__engine">
                    <p className="gf__engine-title">{board.engine.title}</p>
                    <p className="gf__engine-sub">{board.engine.sub}</p>
                  </div>,
                  <>
                    <ul className="gf__nodes gf__nodes--mods">
                      {board.engine.modules.map((m) => (
                        <li key={m.title}>
                          <span className="gf__item">{m.title}</span>
                          <span className="gf__small">{m.body}</span>
                        </li>
                      ))}
                    </ul>
                    <ul className="gf__chips">
                      {board.engine.guard.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </>,
                )}

                {stage(2, <p className="gf__link">{board.channels.link}</p>, nodes(board.channels.nodes))}

                {stage(
                  3,
                  <p className="gf__link">{board.measure.loop}</p>,
                  <>
                    <p className="gf__headline">{board.measure.title}</p>
                    <p className="gf__chain">
                      {board.measure.chain.map((c, i) => (
                        <span key={c}>
                          {c}
                          {i < board.measure.chain.length - 1 ? (i < 3 ? ' + ' : ' → ') : ''}
                        </span>
                      ))}
                    </p>
                  </>,
                )}
              </ol>

              {/* the workflows: the heading and the wheels' legend */}
              <div className="gf__wf">
                <h3 className="gf__wf-title">{content.workflowsLabel}</h3>
                <p className="gf__small" id="gf-wf-lead">
                  {content.workflowsLead}
                </p>
                <ul className="gf__legend" aria-describedby="gf-wf-lead">
                  {workflows.map((w, k) => (
                    <li key={w.id} style={tone(FLOW_TONES[k])}>
                      <button
                        type="button"
                        className="gf__key"
                        aria-pressed={pick === k}
                        onClick={() => setPick((p) => (p === k ? null : k))}
                      >
                        {w.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* the four workflows, each belted to the wheel as it is read */}
              <ol className="gf__flows">
                {workflows.map((w, k) => (
                  <li
                    key={w.id}
                    className="gf__flow"
                    data-gf-flow=""
                    data-picked={pick === k || undefined}
                    style={tone(FLOW_TONES[k])}
                  >
                    <p className="gf__label gf__dot">{w.eyebrow}</p>
                    <h4 className="gf__flow-title">{w.title}</h4>
                    <p className="gf__small">{w.body}</p>
                    <dl className="gf__spec">
                      <div>
                        <dt className="gf__label">{content.doesLabel}</dt>
                        <dd>
                          <ol className="gf__does">
                            {w.does.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ol>
                        </dd>
                      </div>
                      <div>
                        <dt className="gf__label">{content.controlsLabel}</dt>
                        <dd>
                          <p className="gf__small">{w.controls}</p>
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* across the architecture: the board's baseline */}
          <div className="gf__across">
            <p className="gf__label">{board.across.label}</p>
            <ul className="gf__assure" style={tone('sun')}>
              {board.across.items.map((a) => (
                <li key={a}>
                  <span className="gf__tick" data-done="" aria-hidden="true">
                    <Check />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* the marketing factory model */}
        <div className="gf__factory">
          <div className="gf__factory-head">
            <ChipHead
              line1={factory.line1}
              line2={withAccent(factory.line2, factory.line2)}
              chip={factory.eyebrow}
              tone="blossom"
              lineRecipe={1}
              as="h3"
            />
            <p className="cx-lead">{factory.lead}</p>
          </div>
          <ol className="gf__steps">
            {factory.steps.map((s, i) => (
              <li
                key={s.label}
                className="gf__step"
                data-umm-tone={FACTORY_TONES[i]}
                style={{ ['--i' as string]: i } as CSSProperties}
              >
                <span className="gf__step-label">
                  {String(i + 1).padStart(2, '0')} / {s.label}
                </span>
                <p className="gf__step-title">{s.title}</p>
                <p className="gf__step-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
