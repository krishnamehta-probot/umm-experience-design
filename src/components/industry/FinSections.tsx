import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { FlyArrow, SplitButton, Tabs } from '@/components/primitives'
import type { Tone } from '@/components/primitives/tone'
import { IconArrowUpRight } from '@/components/icons'
import { stagger } from '@/lib/useReveal'
import type {
  SectionHead,
  ai as AiContent,
  audiences as AudiencesContent,
  contact as ContactContent,
  impact as ImpactContent,
  journeys as JourneysContent,
  operations as OperationsContent,
  reality as RealityContent,
  system as SystemContent,
  work as WorkContent,
} from '@/content/fintech'
import { FinScene } from './FinScene'
import '@/styles/fin-page.css'

/* ============================================================================
   FIN SECTIONS — the Fintech page, version 3 (Krish, 5 Nov: "properly
   designed and a proper compact site; each section compacted in the
   screen; nice animations going on")

   Every section is one screen: a pill with its name, the heading (the
   statement, then the answer in a lighter weight), its paragraph, and one
   composed block under it. Sections alternate white and a soft wash of a
   brand pastel; on white the cards carry the colour, on a wash they are
   white. What moves:
     - each card's drawing plays as it arrives (FinScene)
     - the journeys and the audiences step through themselves, a line
       filling under the one shown; a click takes over
     - how it connects: a pulse runs through the architecture, box by box,
       and the four steps light in turn
     - how AI is impacting: four panels, one open, opening in turn
   ========================================================================== */

function Head({ id, head, tone }: { id: string; head: SectionHead; tone: Tone }) {
  return (
    <header className="f3-head" data-umm-reveal>
      <p className="f3-pill" data-umm-tone={tone}>
        {head.eyebrow}
      </p>
      <h2 id={`${id}-h`} className="f3-h2">
        <span>{head.lines[0]}</span>
        <span className="f3-h2__soft">{head.lines[1]}</span>
      </h2>
      <p className="f3-intro">{head.intro}</p>
    </header>
  )
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="f3-points">
      {items.map((p) => (
        <li key={p}>
          <IconArrowUpRight size={14} strokeWidth={1.75} />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  )
}

/** Tabs that step through themselves while the section is in view (and the
 *  pointer isn't over it); `--p` on the host is how far through the current
 *  one it is, for the line under it. A pick stops the stepping. */
function useAutoTabs(count: number, ms = 6500) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = host.current
    if (!el) return
    if (!auto) {
      el.style.setProperty('--p', '1')
      return
    }
    let seen = false
    let over = false
    let t = 0
    let last = performance.now()
    let raf = 0
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    const enter = () => (over = true)
    const leave = () => (over = false)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100)
      last = now
      if (seen && !over) {
        t += dt
        if (t >= ms) {
          t = 0
          setI((v) => (v + 1) % count)
        }
      }
      el.style.setProperty('--p', (t / ms).toFixed(4))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [auto, count, ms])
  const pick = (k: number) => {
    setAuto(false)
    setI(k)
  }
  return { i, pick, host }
}

function ListTabs({
  idBase,
  label,
  items,
  value,
  onPick,
  numbered = false,
  big = false,
}: {
  idBase: string
  label: string
  items: { id: string; label: string }[]
  value: number
  onPick: (k: number) => void
  numbered?: boolean
  big?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const key = (e: KeyboardEvent, k: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = (k + d + items.length) % items.length
    onPick(n)
    ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[n]?.focus()
  }
  return (
    <div ref={ref} className={`f3-list${big ? ' f3-list--big' : ''}`} role="tablist" aria-orientation="vertical" aria-label={label}>
      {items.map((it, k) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          id={`${idBase}-tab-${k}`}
          aria-selected={k === value}
          aria-controls={`${idBase}-panel`}
          tabIndex={k === value ? 0 : -1}
          className="f3-list__row"
          onClick={() => onPick(k)}
          onKeyDown={(e) => key(e, k)}
        >
          {numbered && <span className="f3-list__num">{String(k + 1).padStart(2, '0')}</span>}
          <span className="f3-list__label">{it.label}</span>
          <IconArrowUpRight className="f3-list__arrow" size={18} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}

/* ── 02 · The reality ────────────────────────────────────────────────────── */

export function Reality3({ content }: { content: typeof RealityContent }) {
  return (
    <section id={content.id} className="f3s" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="sky" />
      <div className="f3-cards f3-cards--3">
        {content.cards.map((c, i) => (
          <article key={c.title} className="f3-card f3-card--tint" data-umm-tone={c.tone} data-umm-reveal style={stagger(i, 110)}>
            <FinScene name={c.art} tone={c.tone} className="f3-card__scene" />
            <h3 className="f3-h3">{c.title}</h3>
            <p className="f3-card__body">{c.body}</p>
          </article>
        ))}
      </div>
      <div className="f3-pov" data-umm-reveal>
        <p className="f3-label">{content.view.eyebrow}</p>
        <p className="f3-pov__title">
          {content.view.lines[0]} <span className="f3-h2__soft">{content.view.lines[1]}</span>
        </p>
        <p className="f3-pov__body">{content.view.body}</p>
      </div>
    </section>
  )
}

/* ── 03 · Financial journeys ─────────────────────────────────────────────── */

export function Journeys3({ content }: { content: typeof JourneysContent }) {
  const { i, pick, host } = useAutoTabs(content.items.length)
  const item = content.items[i]
  const base = `${content.id}-t`
  return (
    <section id={content.id} className="f3s f3s--sky" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="citrus" />
      <div ref={host} className="f3-split" data-umm-reveal>
        <div className="f3-split__side">
          <ListTabs idBase={base} label={content.head.eyebrow} items={content.items} value={i} onPick={pick} numbered />
          <div className="f3-aside">
            <p className="f3-label">{content.view.eyebrow}</p>
            <p>{content.view.body}</p>
          </div>
        </div>
        <div key={item.id} id={`${base}-panel`} className="f3-panel f3-swap" role="tabpanel" aria-labelledby={`${base}-tab-${i}`}>
          <FinScene name={item.art} tone={item.tone} ground className="f3-panel__scene" />
          <div className="f3-panel__text">
            <h3 className="f3-h3 f3-h3--l">{item.title}</h3>
            <p className="f3-panel__body">{item.body}</p>
            <Points items={item.points} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 04 · Beyond the transaction ─────────────────────────────────────────── */

export function Operations3({ content }: { content: typeof OperationsContent }) {
  return (
    <section id={content.id} className="f3s" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="blossom" />
      <div className="f3-cards f3-cards--3">
        {content.cards.map((c, i) => (
          <article
            key={c.title}
            className="f3-card f3-card--tint f3-card--ops"
            data-umm-tone={c.tone}
            data-umm-reveal
            style={{ ...stagger(i, 110), '--rows': 5 } as CSSProperties}
          >
            <FinScene name={c.art} tone={c.tone} className="f3-card__scene f3-card__scene--s" />
            <p className="f3-label">{c.eyebrow}</p>
            <h3 className="f3-h3">{c.title}</h3>
            <p className="f3-card__body">{c.body}</p>
            <Points items={c.points} />
          </article>
        ))}
      </div>
    </section>
  )
}

/* ── 05 · How it connects ────────────────────────────────────────────────── */

export function Connects3({ content }: { content: typeof SystemContent }) {
  const [id, setId] = useState(content.journeys[0].id)
  const j = content.journeys.find((x) => x.id === id) ?? content.journeys[0]
  const L = content.labels
  const base = `${content.id}-t`
  const k = (n: number) => ({ '--k': n }) as CSSProperties
  return (
    <section id={content.id} className="f3s f3s--lilac f3s--dense" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="sun" />
      <div className="f3-sys__tabs" data-umm-reveal>
        <Tabs idBase={base} label={content.head.eyebrow} items={content.journeys} value={id} onChange={setId} />
      </div>
      <div key={j.id} id={`${base}-panel-${j.id}`} className="f3-sys f3-swap" role="tabpanel" aria-labelledby={`${base}-tab-${j.id}`}>
        <div className="f3-sys__side">
          <p className="f3-label f3-label--ink">
            {L.reference} / {j.label}
          </p>
          <p className="f3-sys__summary">{j.summary}</p>
          <div className="f3-ai">
            <p className="f3-label f3-ai__label">
              <span className="f3-live" aria-hidden="true" />
              {L.ai[0]} {L.ai[1]}
            </p>
            <h3 className="f3-h3">{j.ai.title}</h3>
            <p className="f3-ai__body">{j.ai.body}</p>
            <p className="f3-ai__ops">{L.aiOps}</p>
          </div>
          <div className="f3-change">
            <p className="f3-label">{L.changeHead}</p>
            <ol>
              {j.change.map((c, n) => (
                <li key={c} data-n={n}>
                  <span className="f3-label">{L.change[n]}</span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="f3-fine">{L.note}</p>
        </div>

        <div className="f3-sys__main">
          <div className="f3-dia">
            <div className="f3-dia__row">
              <span className="f3-label">{L.rows[0]}</span>
              <div className="f3-dia__nodes f3-dia__nodes--2">
                {j.experiences.map((n, x) => (
                  <span key={n} className="f3-node f3-node--exp" style={k(x ? 8 : 0)}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div className="f3-dia__links">
              <span className="f3-link f3-link--down">{L.down1}</span>
              <span className="f3-link f3-link--up">{L.up1}</span>
            </div>
            <div className="f3-dia__row">
              <span />
              <p className="f3-spine" style={k(1)}>
                {L.spine[0]}
                <i />
                {L.spine[1]}
              </p>
            </div>
            <div className="f3-dia__links">
              <span className="f3-link f3-link--down">{L.down2}</span>
              <span className="f3-link f3-link--up">{L.up2}</span>
            </div>
            <div className="f3-dia__row">
              <span className="f3-label">{L.rows[1]}</span>
              <div className="f3-dia__nodes f3-dia__nodes--3">
                {j.workflows.map((n, x) => (
                  <span key={n} className="f3-node f3-node--flow" style={k(2 + x)}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div className="f3-dia__links f3-dia__links--one">
              <span className="f3-link f3-link--both">{L.exchange}</span>
            </div>
            <div className="f3-dia__row">
              <span className="f3-label">{L.rows[2]}</span>
              <div className="f3-dia__nodes f3-dia__nodes--3">
                {j.systems.map((n, x) => (
                  <span key={n} className="f3-node f3-node--sys" style={k(5 + x)}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div className="f3-dia__controls">
              <span className="f3-label">{L.controls}</span>
              <span>{L.controlsList}</span>
            </div>
          </div>

          <div className="f3-steps">
            <p className="f3-steps__head">
              <b>{L.stepsHead}</b>
              <span className="f3-label">{L.stepsTag}</span>
            </p>
            <ol>
              {j.steps.map((s, n) => (
                <li key={s} style={k(n)}>
                  <span className="f3-steps__num">{String(n + 1).padStart(2, '0')}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="f3-exc">
            <p className="f3-label">↳ {L.exception}</p>
            <p>{j.exception}</p>
            <p className="f3-ctx">
              <span className="f3-label">{L.context}</span> {j.context}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 06 · Relevant work ──────────────────────────────────────────────────── */

export function Work3({ content }: { content: typeof WorkContent }) {
  return (
    <section id={content.id} className="f3s" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="coral" />
      <div className="f3-cards f3-cards--3">
        {content.cases.map((c, i) => (
          <article key={c.name} className="f3-case" data-umm-tone={c.tone} data-umm-reveal style={stagger(i, 110)}>
            <a className="f3-case__visual" href={c.href} aria-label={`${content.view}: ${c.name}`}>
              <img src={c.image} alt={c.alt} loading="lazy" decoding="async" />
              <span className="f3-case__view">
                {content.view}
                <FlyArrow size={13} strokeWidth={1.75} />
              </span>
            </a>
            <p className="f3-label">{c.tag}</p>
            <h3 className="f3-case__name">{c.name}</h3>
            <p className="f3-case__title">{c.title}</p>
            <p className="f3-case__body">{c.body}</p>
            <p className="f3-case__role">
              <span className="f3-label">{content.roleLabel}</span>
              {c.role}
            </p>
            <a className="f3-case__read" href={c.href}>
              {content.read}
              <FlyArrow size={14} strokeWidth={1.75} />
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ── 07 · Who we work with ───────────────────────────────────────────────── */

export function Audiences3({ content }: { content: typeof AudiencesContent }) {
  const { i, pick, host } = useAutoTabs(content.items.length, 5500)
  const item = content.items[i]
  const base = `${content.id}-t`
  return (
    <section id={content.id} className="f3s f3s--citrus" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="sky" />
      <div ref={host} className="f3-split" data-umm-reveal>
        <div className="f3-split__side">
          <ListTabs idBase={base} label={content.head.eyebrow} items={content.items} value={i} onPick={pick} big />
        </div>
        <div key={item.id} id={`${base}-panel`} className="f3-panel f3-swap" role="tabpanel" aria-labelledby={`${base}-tab-${i}`}>
          <FinScene name={item.art} tone={item.tone} ground className="f3-panel__scene" />
          <div className="f3-panel__text f3-panel__text--mid">
            <h3 className="f3-h3 f3-h3--l">{item.title}</h3>
            <p className="f3-panel__body">{item.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 08 · How AI is impacting financial services ─────────────────────────── */

export function Impact3({ content }: { content: typeof ImpactContent }) {
  const { i, pick, host } = useAutoTabs(content.cards.length, 6000)
  return (
    <section id={content.id} className="f3s" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="blossom" />
      {/* four cards; the open one turns its drawing over to show its text,
          in turn, a line filling along its foot; hover or a click opens one */}
      <div ref={host} className="f3-flip" data-umm-reveal>
        {content.cards.map((c, n) => {
          const open = n === i
          return (
            <article
              key={c.title}
              className="f3-flip__card"
              data-umm-tone={c.tone}
              data-open={open || undefined}
              onPointerEnter={() => !open && pick(n)}
            >
              <button type="button" className="f3-flip__head" aria-expanded={open} onClick={() => pick(n)}>
                <span className="f3-label">{c.eyebrow}</span>
                <span className="f3-h3">{c.title}</span>
              </button>
              <div className="f3-flip__face">
                <FinScene name={c.art} tone={c.tone} className="f3-flip__scene" />
                <div className="f3-flip__text" aria-hidden={!open}>
                  <p>{c.body}</p>
                  <div className="f3-change-line">
                    <span className="f3-label">{content.changeLabel}</span>
                    <span>{c.change}</span>
                  </div>
                </div>
              </div>
              <span className="f3-flip__bar" aria-hidden="true" />
            </article>
          )
        })}
      </div>
      <div className="f3-pov f3-pov--close" data-umm-reveal>
        <p className="f3-pov__title">{content.close.title}</p>
        <p className="f3-pov__body">{content.close.body}</p>
      </div>
    </section>
  )
}

/* ── 09 · AI in financial services ───────────────────────────────────────── */

export function Ai3({ content }: { content: typeof AiContent }) {
  return (
    <section id={content.id} className="f3s f3s--sky" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="citrus" />
      <div className="f3-cards f3-cards--3">
        {content.cards.map((c, n) => (
          <article
            key={c.title}
            className="f3-card f3-card--white"
            data-umm-tone={c.tone}
            data-umm-reveal
            style={{ ...stagger(n, 110), '--rows': 5 } as CSSProperties}
          >
            <span className="f3-ai-card__num">{String(n + 1).padStart(2, '0')}</span>
            <h3 className="f3-h3 f3-h3--l">{c.title}</h3>
            <ol className="f3-flow">
              {c.flow.map((f, x) => (
                <li key={f} style={{ '--k': x } as CSSProperties}>
                  {f}
                </li>
              ))}
            </ol>
            <p className="f3-card__body">{c.body}</p>
            <div className="f3-change-line">
              <span className="f3-label">{content.measureLabel}</span>
              <span>{c.measures.join(' · ')}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="f3-pov f3-pov--close" data-umm-reveal>
        <p className="f3-pov__title">{content.close.title}</p>
        <p className="f3-pov__body">{content.close.body}</p>
      </div>
    </section>
  )
}

/* ── 10 · Your next chapter ──────────────────────────────────────────────── */

export function Contact3({ content }: { content: typeof ContactContent }) {
  return (
    <section id={content.id} className="f3s f3s--end" aria-labelledby={`${content.id}-h`}>
      <div className="f3-end" data-umm-reveal>
        <div className="f3-end__copy">
          <p className="f3-pill" data-umm-tone="sun">
            {content.eyebrow}
          </p>
          <h2 id={`${content.id}-h`} className="f3-h2">
            <span>{content.lines[0]}</span>
            <span>{content.lines[1]}</span>
          </h2>
          <p className="f3-end__body">{content.body}</p>
          <SplitButton href={content.cta.href}>{content.cta.label}</SplitButton>
        </div>
        <FinScene name="shield" tone="sky" className="f3-end__scene" />
      </div>
    </section>
  )
}
