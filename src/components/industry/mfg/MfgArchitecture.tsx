import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { architecture, type NodeId } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { MfgArt } from './MfgArt'
import { Head } from './Head'

/* ============================================================================
   THE MANUFACTURING PAGE — 05 · THE MANUFACTURING ARCHITECTURE

   "One operating flow. AI at every decision." The draft's interactive
   architecture, as the Fintech page's guided tour was built (Krish: "make
   sure that it's perfectly interactive… easy to understand"):

     stage   an ink sheet. Across the top, the AI layer and its four
             capabilities; under each, a live wire carrying the stage's
             facts up and the AI's decisions down (the draft's labels); then
             the four stages of the value chain, procurement to revenue, each
             with its drawing and its systems; under them the shared
             operational context, its loop turning. Beside the chain, inside
             production, the digital twin loop: plant → signals → twin →
             approval → plant, a light running round it
     tour    three workflows (a supplier date changes; demand rises before
             the next shift; delivery and invoice disagree), each played
             step by step: the parts each step involves light up, the rest
             quieten, and the story reads under the stage with a progress
             line. It plays by itself once in view and moves on to the next
             workflow at the end; Pause holds it; the step dots jump
     inspect any capability, stage or twin tile is a button: it opens what
             that part reads and what it returns, and holds the tour until
             it is closed
     foot    the governance across the architecture
   ========================================================================== */

const STEP_MS = 4400

export function MfgArchitecture() {
  const c = architecture
  const flows = c.workflow.flows
  const [f, setF] = useState(0)
  const [s, setS] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [sel, setSel] = useState<NodeId | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  const story = useRef<HTMLDivElement>(null)

  const flow = flows[f]
  const step = flow.steps[Math.min(s, flow.steps.length - 1)]
  const lit = new Set<NodeId>(sel ? [sel] : step.nodes)

  /* the tour's clock: on while in view, playing, nothing open and the page
     not paused; --p on the stage is the step so far */
  const state = useRef({ f, s, playing, sel })
  state.current = { f, s, playing, sel }
  useEffect(() => {
    const el = stage.current
    if (!el) return
    let raf = 0
    let last = 0
    let acc = 0
    let seen = false
    const tick = (now: number) => {
      const dt = last ? Math.min(100, now - last) : 0
      last = now
      const st = state.current
      if (seen && st.playing && !st.sel) {
        acc += dt
        if (acc >= STEP_MS) {
          acc = 0
          const n = flows[st.f].steps.length
          if (st.s + 1 < n) setS(st.s + 1)
          else {
            setF((st.f + 1) % flows.length)
            setS(0)
          }
        }
      }
      el.style.setProperty('--p', (acc / STEP_MS).toFixed(4))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    /* a new step or workflow starts its clock afresh */
    const reset = () => (acc = 0)
    el.addEventListener('mf-reset', reset)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('mf-reset', reset)
    }
  }, [flows])

  const restart = () => stage.current?.dispatchEvent(new Event('mf-reset'))
  const pickFlow = (k: number) => {
    setF(k)
    setS(0)
    setSel(null)
    setPlaying(true)
    restart()
  }
  const pickStep = (k: number) => {
    setS(k)
    setSel(null)
    restart()
  }
  const inspect = (id: NodeId) => {
    setSel((v) => (v === id ? null : id))
  }

  const node = (id: NodeId) => ({
    'data-lit': lit.has(id) || undefined,
    'aria-pressed': sel === id,
    onClick: () => inspect(id),
  })

  const info = sel ? c.inspector.nodes[sel] : null

  return (
    <section id={c.id} className="ma mf-sec" aria-labelledby="ma-title">
      <Head id="ma-title" head={c.head} />

      <div
        ref={stage}
        className="ma__stage"
        data-umm-reveal
        data-active={sel ? 'sel' : 'tour'}
        style={{ '--steps': flow.steps.length } as CSSProperties}
      >
        <div className="ma__bar">
          <p className="ma__label">
            {c.label}
            <span>
              <i /> {c.interactive}
            </span>
          </p>
          <div className="ma__flows" role="group" aria-label={c.workflow.eyebrow}>
            {flows.map((x, k) => (
              <button key={x.id} type="button" aria-pressed={k === f} onClick={() => pickFlow(k)}>
                {x.name}
              </button>
            ))}
          </div>
          <button type="button" className="ma__play" aria-pressed={playing} onClick={() => setPlaying((v) => !v)}>
            {playing ? 'Pause' : c.workflow.play}
            <span aria-hidden="true">{playing ? 'Ⅱ' : '→'}</span>
          </button>
        </div>

        <div className="ma__grid">
          <div className="ma__chain">
            {/* the AI layer */}
            <div className="ma__ai">
              <div className="ma__ai-head">
                <svg className="ma__spark" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M5.3 18.7L18.7 5.3" />
                </svg>
                <p>
                  <b>{c.ai.label}</b>
                  {c.ai.title}
                </p>
                <p className="ma__ai-note">
                  {c.ai.note[0]} {c.ai.note[1]}
                </p>
              </div>
              <div className="ma__agents">
                {c.ai.agents.map((a) => (
                  <button key={a.id} type="button" className="ma__agent" {...node(a.id as NodeId)}>
                    <small>{c.ai.capLabel}</small>
                    <strong>{a.title}</strong>
                    <span>{a.body}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* what travels up and down between them */}
            <div className="ma__transfer" aria-hidden="true">
              {c.transfer.map(([up, down], k) => {
                const on = lit.has(c.ai.agents[k].id as NodeId) || lit.has(c.stages[k].id as NodeId)
                return (
                  <div key={up} className="ma__wire" data-lit={on || undefined}>
                    <span className="ma__up">↑ {up}</span>
                    <i>
                      <b />
                      <b />
                    </i>
                    <span className="ma__down">↓ {down}</span>
                  </div>
                )
              })}
            </div>

            {/* the value chain */}
            <div className="ma__stages">
              {c.stages.map((x, k) => (
                <button key={x.id} type="button" className="ma__stage-card" {...node(x.id as NodeId)}>
                  <span className="ma__stage-top">
                    <small>{x.eyebrow}</small>
                  </span>
                  <span className="ma__stage-art">
                    <MfgArt name={x.art} />
                  </span>
                  <strong>{x.title}</strong>
                  <span className="ma__pills">
                    {x.systems.map((y) => (
                      <em key={y}>{y}</em>
                    ))}
                  </span>
                  {k < c.stages.length - 1 ? <i className="ma__next" aria-hidden="true" /> : null}
                </button>
              ))}
            </div>

            <div className="ma__context">
              <span className="ma__loop" aria-hidden="true">
                ↺
              </span>
              <b>{c.context.title}</b>
              <span>{c.context.body}</span>
              <em>{c.context.note}</em>
            </div>
          </div>

          {/* inside production: the twin loop */}
          <div className="ma__twin">
            <p className="ma__twin-k">{c.twin.eyebrow}</p>
            <p className="ma__twin-title">
              {c.twin.lines[0]} <span>{c.twin.lines[1]}</span>
            </p>
            <p className="ma__twin-body">{c.twin.body}</p>
            <div className="ma__loopgrid">
              <span className="ma__ring" aria-hidden="true">
                <i />
              </span>
              {c.twin.tiles.map((x) => (
                <button key={x.id} type="button" className={`ma__tile ma__tile--${x.id}`} {...node(x.id as NodeId)}>
                  <small>{x.eyebrow}</small>
                  <strong>{x.title}</strong>
                </button>
              ))}
            </div>
            <p className="ma__twin-cap">{c.twin.caption}</p>
          </div>
        </div>

        {/* the story of the step, or what the chosen part does */}
        <div ref={story} className="ma__story" aria-live="polite">
          {info ? (
            <div className="ma__inspect" key={sel}>
              <p className="ma__story-k">{c.inspector.label}</p>
              <div className="ma__inspect-main">
                <p className="ma__story-title">{info.title}</p>
                <p className="ma__story-copy">{info.body}</p>
              </div>
              <dl>
                <div>
                  <dt>{c.inspector.readsLabel}</dt>
                  <dd>{info.reads}</dd>
                </div>
                <div>
                  <dt>{c.inspector.returnsLabel}</dt>
                  <dd>{info.returns}</dd>
                </div>
              </dl>
              <button type="button" className="ma__close" aria-label="Close" onClick={() => setSel(null)}>
                ×
              </button>
            </div>
          ) : (
            <div className="ma__step" key={`${f}-${s}`}>
              <div className="ma__flow">
                <p className="ma__story-k">{c.workflow.label}</p>
                <p className="ma__flow-title">{flow.title}</p>
                <p className="ma__flow-intro">{flow.intro}</p>
              </div>
              <div className="ma__now">
                <div className="ma__dots" role="group" aria-label="Steps">
                  {flow.steps.map((x, k) => (
                    <button key={x.title} type="button" aria-label={`${k + 1}. ${x.type}`} aria-pressed={k === s} data-done={k < s || undefined} onClick={() => pickStep(k)}>
                      {k + 1}
                    </button>
                  ))}
                  <span className="ma__type">{step.type}</span>
                </div>
                <p className="ma__story-title">{step.title}</p>
                <p className="ma__story-copy">{step.copy}</p>
              </div>
              <p className="ma__note">
                {c.workflow.note} · {pad(s)} / {pad(flow.steps.length - 1)}
              </p>
              <i className="ma__progress" />
            </div>
          )}
        </div>
      </div>

      <div className="ma__gov" data-umm-reveal>
        <b>{c.governance.label}</b>
        {c.governance.items.map((x) => (
          <span key={x}>{x}</span>
        ))}
        <span className="ma__hint">{c.inspector.empty.title}</span>
      </div>
    </section>
  )
}
