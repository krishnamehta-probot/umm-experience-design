import type { CSSProperties, ReactNode, Ref } from 'react'
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
   data pipeline the reader's scroll fills.

   16 Oct, later: the idea stays, the execution goes premium. The pipe is
   the one rich object on a quiet white board: a glass tube with real depth,
   lit sky-to-lilac liquid with slow motes of data in it, and a glowing
   front that follows the reader with a soft sky light around it. The cards
   around it are quiet: large titles, hairline rows, no boxes in boxes.

     the intelligence layer   a glass orb the pipe hangs from
     your existing systems    pour in, one inlet per system
     the connected platform   a glass reservoir that fills, wave and all
     what it enables          branches off, one outlet per outcome
     engineer oversight       a valve on the pipe, and a gauge whose
                              needle swings as the water reaches it
     the three workflows      three taps off a manifold, each pouring into
                              its card (on a phone, one branch each)

   On a wide screen the pipe runs down the middle and the cards hang left
   and right, each starting part way down the one before it. On a phone or
   tablet the pipe keeps a 24px lane at the board's left edge.

   The level is the reader's (usePipeFlow). Scrolling stays native, nothing
   pins, and every word is in the page's flow. Reduced motion: the pipe is
   full and still. Then the disclaimer and the principles.
   ========================================================================== */

const OUT_TONE: Tone[] = ['sky', 'citrus', 'blossom']
const RULE_TONE: Tone[] = ['sky', 'citrus', 'blossom']
const PACKETS = 12

/** the anchors, in the order the water reaches them */
const AT = { systems: 0, platform: 3, outcomes: 4, oversight: 7, flows: 8 } as const

/** the reservoir's wave: a long run of 48px swells, slid along as it fills */
const WAVE = (() => {
  let d = 'M0 7'
  for (let x = 0; x < 1536; x += 48) d += ' q12 -5 24 0 t24 0'
  return d
})()

const tone = (t: Tone) => ({ ['--tone' as string]: `var(--umm-${t})` }) as CSSProperties
const nth = (k: number) => ({ ['--k' as string]: k }) as CSSProperties
const num = (i: number) => String(i + 1).padStart(2, '0')

/** a branch of glass from the pipe to a card: its collar on the pipe, its
 *  flange on the card's edge, and the liquid that fills it once reached */
function Port({
  at,
  on,
  flow,
  kind = 'card',
  children,
}: {
  at: (el: HTMLElement | null) => void
  on: boolean
  flow: 'in' | 'out'
  kind?: 'card' | 'row' | 'through'
  children?: ReactNode
}) {
  return (
    <span className="cp__port" data-kind={kind} data-flow={flow} data-on={on || undefined} ref={at} aria-hidden="true">
      <span className="cp__branch" />
      <span className="cp__flange" />
      {children ?? <span className="cp__collar" />}
    </span>
  )
}

/** the oversight gauge: a paper face under glass, a sky track, a citrus
 *  band where the reading should sit, and an ink needle that swings into it */
const Gauge = () => (
  <span className="cp__gauge" aria-hidden="true">
    <span className="cp__gauge-face">
      <svg viewBox="0 0 80 80">
        <path className="cp__gauge-track" d="M15.75 54 A28 28 0 1 1 64.25 54" />
        <path className="cp__gauge-zone" d="M54 15.75 A28 28 0 0 1 67.58 44.86" />
        <g className="cp__needle">
          <path d="M40 15 L42.2 40 L40 47 L37.8 40 Z" />
        </g>
        <circle className="cp__gauge-hub" cx="40" cy="40" r="4.2" />
        <circle className="cp__gauge-pin" cx="40" cy="40" r="1.4" />
      </svg>
    </span>
  </span>
)

export function ConnectedArchitecture({ content = architecture }: { content?: typeof architecture }) {
  const { board, workflows, principles } = content
  const { runRef, originRef, tankRef, anchorRef, isLit, last } = usePipeFlow()

  /** a card is lit once the water reaches its first joint, and is where
   *  the reader is while the water's front is between its joints */
  const card = (
    first: number,
    end: number,
    side: 'l' | 'r',
    t: Tone,
    kind: string,
    body: ReactNode,
    ref?: Ref<HTMLLIElement>,
  ) => (
    <li
      key={kind}
      className={`cp__card cp__card--${kind}`}
      data-side={side}
      data-on={isLit(first) || undefined}
      data-now={(last >= first && last <= end) || undefined}
      ref={ref}
      style={tone(t)}
    >
      {body}
    </li>
  )

  const head = (i: number, title: ReactNode, extra?: ReactNode) => (
    <div className="cp__head">
      <span className="cp__label cp__num" aria-hidden="true">
        {num(i)}
      </span>
      <h3 className="cp__title">{title}</h3>
      {extra}
    </div>
  )

  const flowing = workflows.some((_, k) => isLit(AT.flows + k))

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
        <div className="cp__board" ref={runRef} role="group" aria-label={board.label}>
          {/* the light that travels with the water's front */}
          <span className="cp__light" aria-hidden="true">
            <span className="cp__aura" />
          </span>

          {/* the pipe: glass, its liquid, the motes riding it, its front */}
          <span className="cp__pipe" aria-hidden="true">
            <span className="cp__halo" />
            <span className="cp__tube">
              <span className="cp__liquid">
                {Array.from({ length: PACKETS }, (_, k) => (
                  <i key={k} className="cp__mote" style={nth(k)} />
                ))}
              </span>
              <span className="cp__shine" />
            </span>
            <span className="cp__front" />
          </span>

          <div className="cp__top">
            <span className="cp__label cp__eyebrow">
              <span className="cp__dot" aria-hidden="true" />
              {board.eyebrow}
            </span>
            <span className="cp__label">{board.tag}</span>
          </div>

          <div className="cp__run">
            {/* the intelligence layer: the orb the pipe hangs from */}
            <div className="cp__source">
              <div className="cp__source-name">
                <p className="cp__label">{board.layerEyebrow}</p>
                <h3 className="cp__title cp__title--lit">{board.layerTitle}</h3>
              </div>
              <span className="cp__orb" ref={originRef} aria-hidden="true">
                <span className="cp__orb-core" />
                <svg className="cp__orb-mark" viewBox="0 0 24 24">
                  <path d="M12 4.5v15M4.5 12h15M6.7 6.7l10.6 10.6M17.3 6.7 6.7 17.3" />
                </svg>
              </span>
              <div className="cp__source-note">
                <p className="cp__body">{board.layerNote}</p>
                <p className="cp__label">{board.assist}</p>
              </div>
            </div>

            <ol className="cp__stages">
              {card(
                AT.systems,
                AT.platform - 1,
                'l',
                'sky',
                'systems',
                <>
                  {head(0, board.systemsLabel)}
                  <ul className="cp__rows">
                    {board.systems.map((s, k) => (
                      <li key={s.title} className="cp__row cp__row--split">
                        <Port at={anchorRef(AT.systems + k)} on={isLit(AT.systems + k)} flow="in" kind="row" />
                        <span className="cp__item">{s.title}</span>
                        <span className="cp__small">{s.items}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="cp__label cp__via">{board.systemsLink}</p>
                </>,
              )}

              {card(
                AT.platform,
                AT.outcomes - 1,
                'r',
                'lilac',
                'platform',
                <>
                  {head(1, board.platformLabel)}
                  {/* the reservoir: glass, filling as the reader passes it */}
                  <div className="cp__tank">
                    <Port at={anchorRef(AT.platform)} on={isLit(AT.platform)} flow="out" kind="through" />
                    <span className="cp__tank-glass" aria-hidden="true">
                      <span className="cp__tank-liquid">
                        <svg className="cp__wave" viewBox="0 0 1536 14" width="1536" height="14">
                          <path className="cp__wave-body" d={`${WAVE} V14 H0 Z`} />
                          <path className="cp__wave-line" d={WAVE} />
                        </svg>
                        <span className="cp__caustics" />
                      </span>
                      <span className="cp__tank-shine" />
                    </span>
                    <p className="cp__label cp__tank-text">{board.movement}</p>
                    <p className="cp__label cp__tank-text">{board.providers.join(' · ')}</p>
                  </div>
                  <ul className="cp__rows">
                    {[board.runtime, board.data].map((r) => (
                      <li key={r.title} className="cp__row cp__row--split">
                        <span className="cp__item">{r.title}</span>
                        <span className="cp__small">{r.body}</span>
                      </li>
                    ))}
                    <li className="cp__row cp__row--split">
                      <span className="cp__item">{board.observe.title}</span>
                      <span className="cp__small">{board.observe.items}</span>
                    </li>
                  </ul>
                </>,
                tankRef,
              )}

              {card(
                AT.outcomes,
                AT.oversight - 1,
                'l',
                'sky',
                'outcomes',
                <>
                  {head(2, board.outcomesLabel)}
                  <p className="cp__label cp__via">{board.outcomesLink}</p>
                  <ol className="cp__rows">
                    {board.outcomes.map((o, k) => (
                      <li
                        key={o}
                        className="cp__row cp__row--dot"
                        data-umm-tone={OUT_TONE[k]}
                        data-on={isLit(AT.outcomes + k) || undefined}
                      >
                        <Port at={anchorRef(AT.outcomes + k)} on={isLit(AT.outcomes + k)} flow="out" kind="row" />
                        <span className="cp__pip" aria-hidden="true" />
                        <span className="cp__item">{o}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="cp__body cp__loop">{board.loop}</p>
                </>,
              )}

              {card(
                AT.oversight,
                AT.flows - 1,
                'r',
                'citrus',
                'oversight',
                <>
                  <Port at={anchorRef(AT.oversight)} on={isLit(AT.oversight)} flow="out">
                    {/* the valve: in line on the pipe, its lever turning to open */}
                    <span className="cp__valve">
                      <i className="cp__lever" />
                      <i className="cp__led" />
                    </span>
                  </Port>
                  {head(3, board.oversightLabel, <Gauge />)}
                  <ul className="cp__checks">
                    {board.oversight.map((o, k) => (
                      <li key={o} style={nth(k)}>
                        <span className="cp__tick" aria-hidden="true">
                          <svg viewBox="0 0 16 16">
                            <path d="M3.6 8.4 6.7 11.4 12.4 4.8" />
                          </svg>
                        </span>
                        <span className="cp__item">{o}</span>
                      </li>
                    ))}
                  </ul>
                </>,
              )}
            </ol>

            {/* the three workflows: three taps off a manifold */}
            <ol className="cp__flows" data-on={flowing || undefined}>
              {workflows.map((w, k) =>
                card(
                  AT.flows + k,
                  AT.flows + k,
                  'r',
                  OUT_TONE[k],
                  w.id,
                  <>
                    <span
                      className="cp__tap"
                      ref={anchorRef(AT.flows + k)}
                      data-on={isLit(AT.flows + k) || undefined}
                      style={nth(k)}
                      aria-hidden="true"
                    >
                      <span className="cp__branch" />
                      <span className="cp__flange" />
                      <span className="cp__collar" />
                      <span className="cp__feed" />
                      <span className="cp__faucet">
                        <i className="cp__handle" />
                      </span>
                      <span className="cp__spout" />
                      <span className="cp__pour" />
                      <span className="cp__splash" />
                    </span>
                    <div className="cp__head cp__head--flow">
                      <span className="cp__label cp__num" aria-hidden="true">
                        {num(4 + k)}
                      </span>
                      <span className="cp__tag">{w.label}</span>
                    </div>
                    <p className="cp__label">{w.eyebrow}</p>
                    <h3 className="cp__title">{w.title}</h3>
                    <p className="cp__body">{w.body}</p>
                    <dl className="cp__spec">
                      <div>
                        <dt className="cp__label">{board.aiLabel}</dt>
                        <dd className="cp__small">{w.ai}</dd>
                      </div>
                      <div>
                        <dt className="cp__label">{board.decisionLabel}</dt>
                        <dd className="cp__small">{w.decision}</dd>
                      </div>
                      <div>
                        <dt className="cp__label">{board.evidenceLabel}</dt>
                        <dd className="cp__small">{w.evidence.join(' · ')}</dd>
                      </div>
                      <div>
                        <dt className="cp__label">{board.outcomeLabel}</dt>
                        <dd className="cp__item">{w.outcome}</dd>
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
