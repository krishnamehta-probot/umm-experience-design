import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
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
import { FinArt } from './FinArt'
import { FlowField, type FlowPalette } from './FlowField'
import { Stamp, useRouteStop } from './Route'
import '@/styles/industry-page.css'

/* ============================================================================
   FINTECH SECTIONS — sections 02 to 10 of the Fintech, Banking & Insurance
   page (Krish, 5 Nov: the live draft is the final structure and the final
   content; "just start building it")

   The draft's structure, section for section, drawn in UMM's own language:
   the five pastels and ink on white, Mosvita only, every block on one
   12-column grid so the edges line up down the page. Colour is a ground
   for the drawings, never behind a line of text; nothing overlaps.

   What moves, slowly: the drawings float, the dots run along the
   architecture's links, the closing panel is the hero's flowing colour.
   ========================================================================== */

function Head({ id, head, tone }: { id: string; head: SectionHead; tone: Tone }) {
  return (
    <header className="ip-head" data-umm-reveal>
      <p className="ip-eyebrow" data-umm-tone={tone}>
        {head.eyebrow}
      </p>
      <Stamp id={id} />
      <h2 id={`${id}-h`} className="ip-h2">
        <span>{head.lines[0]}</span>
        <span>{head.lines[1]}</span>
      </h2>
      <p className="ip-intro">{head.intro}</p>
    </header>
  )
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="ip-points">
      {items.map((p) => (
        <li key={p}>
          <IconArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  )
}

/** A vertical list of tabs, the draft's: a row per item, the chosen one in
 *  ink with a line drawn under it. Arrow keys move between rows. */
function ListTabs({
  idBase,
  label,
  items,
  value,
  onChange,
  numbered = false,
  size = 'm',
}: {
  idBase: string
  label: string
  items: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  numbered?: boolean
  size?: 'm' | 'l'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + items.length) % items.length
    onChange(items[next].id)
    ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }
  return (
    <div ref={ref} className={`ip-list ip-list--${size}${numbered ? '' : ' ip-list--plain'}`} role="tablist" aria-orientation="vertical" aria-label={label}>
      {items.map((it, i) => {
        const on = it.id === value
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            id={`${idBase}-tab-${it.id}`}
            aria-selected={on}
            aria-controls={`${idBase}-panel`}
            tabIndex={on ? 0 : -1}
            className="ip-list__row"
            onClick={() => onChange(it.id)}
            onKeyDown={(e) => move(e, i)}
          >
            {numbered && <span className="ip-list__num">{String(i + 1).padStart(2, '0')}</span>}
            <span className="ip-list__label">{it.label}</span>
            <IconArrowUpRight className="ip-list__arrow" size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}

/** With a route: when the payment reaches this section, its tabs turn to
 *  the payment's own journey, unless the visitor has chosen one already. */
function useRouteFocus(id: string, set: (v: string) => void) {
  const stop = useRouteStop(id)
  const touched = useRef(false)
  const arrived = !!stop?.reached
  const focus = stop?.stop.focus
  useEffect(() => {
    if (arrived && focus && !touched.current) set(focus)
  }, [arrived, focus, set])
  const pick = (v: string) => {
    touched.current = true
    set(v)
  }
  return { pick, arrived, focus }
}

/* ── 02 · The reality ────────────────────────────────────────────────────── */

export function Reality({ content }: { content: typeof RealityContent }) {
  return (
    <section id={content.id} className="ip-sec" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="sky" />
      <div className="ip-cards ip-cards--3">
        {content.cards.map((c, i) => (
          <article key={c.title} className="ip-card" data-umm-reveal style={stagger(i, 90)}>
            <FinArt name={c.art} tone={c.tone} />
            <div className="ip-card__text">
              <h3 className="ip-h3">{c.title}</h3>
              <p>{c.body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="ip-pov" data-umm-reveal>
        <p className="ip-label">{content.view.eyebrow}</p>
        <p className="ip-pov__title">
          <span>{content.view.lines[0]}</span>
          <span>{content.view.lines[1]}</span>
        </p>
        <p className="ip-pov__body">{content.view.body}</p>
      </div>
    </section>
  )
}

/* ── 03 · Financial journeys ─────────────────────────────────────────────── */

export function Journeys({ content }: { content: typeof JourneysContent }) {
  const [id, setId] = useState(content.items[0].id)
  const item = content.items.find((it) => it.id === id) ?? content.items[0]
  const base = `${content.id}-tabs`
  const { pick } = useRouteFocus(content.id, setId)
  return (
    <section id={content.id} className="ip-sec ip-sec--rule" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="citrus" />
      <div className="ip-split" data-umm-reveal>
        <ListTabs idBase={base} label={content.head.eyebrow} items={content.items} value={id} onChange={pick} numbered />
        <div
          key={item.id}
          id={`${base}-panel`}
          className="ip-panel ip-swap"
          role="tabpanel"
          aria-labelledby={`${base}-tab-${item.id}`}
        >
          <FinArt name={item.art} tone={item.tone} className="fa--wide" />
          <h3 className="ip-h3 ip-h3--l">{item.title}</h3>
          <p className="ip-panel__body">{item.body}</p>
          <Points items={item.points} />
        </div>
      </div>
      <div className="ip-band" data-umm-reveal>
        <p className="ip-label">{content.view.eyebrow}</p>
        <p className="ip-band__body">{content.view.body}</p>
      </div>
    </section>
  )
}

/* ── 04 · Beyond the transaction ─────────────────────────────────────────── */

export function Operations({ content }: { content: typeof OperationsContent }) {
  return (
    <section id={content.id} className="ip-sec ip-sec--rule" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="blossom" />
      <div className="ip-cards ip-cards--3">
        {content.cards.map((c, i) => (
          <article key={c.title} className="ip-card" data-umm-reveal style={{ ...stagger(i, 90), '--rows': 5 } as CSSProperties}>
            <FinArt name={c.art} tone={c.tone} />
            <div className="ip-card__text">
              <p className="ip-label">{c.eyebrow}</p>
              <h3 className="ip-h3">{c.title}</h3>
              <p>{c.body}</p>
              <Points items={c.points} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ── 05 · How it connects ────────────────────────────────────────────────── */

/** a link between two rows of the architecture: a short line with a dot
 *  running along it, down, up or both ways, and its words beside it */
function Link({ dir, children }: { dir: 'down' | 'up' | 'both'; children: string }) {
  return (
    <span className={`ip-link ip-link--${dir}`}>
      <i aria-hidden="true" />
      <span>{children}</span>
    </span>
  )
}

export function SystemMap({ content }: { content: typeof SystemContent }) {
  const [id, setId] = useState(content.journeys[0].id)
  const j = content.journeys.find((x) => x.id === id) ?? content.journeys[0]
  const L = content.labels
  const base = `${content.id}-tabs`
  const { pick, arrived, focus } = useRouteFocus(content.id, setId)
  /* the payment's own journey lights up, box by box, as it passes */
  const traced = arrived && j.id === focus
  return (
    <section id={content.id} className="ip-sec ip-sec--ground" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="sun" />
      <div data-umm-reveal>
        <Tabs idBase={base} label={content.head.eyebrow} items={content.journeys} value={id} onChange={pick} />
      </div>

      <div
        key={j.id}
        id={`${base}-panel-${j.id}`}
        className={`ip-map ip-swap${traced ? ' is-traced' : ''}`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${j.id}`}
      >
        <div className="ip-map__ref">
          <p className="ip-label">
            {L.reference} / {j.label}
          </p>
          <p className="ip-map__summary">{j.summary}</p>
        </div>

        <div className="ip-ai">
          <p className="ip-label ip-ai__label">
            <span className="ip-ai__live" aria-hidden="true" />
            <span>
              {L.ai[0]}
              <br />
              {L.ai[1]}
            </span>
          </p>
          <div className="ip-ai__text">
            <h3 className="ip-h3">{j.ai.title}</h3>
            <p>{j.ai.body}</p>
            <p className="ip-ai__ops">{L.aiOps}</p>
          </div>
        </div>

        <div className="ip-box">
          <p className="ip-label">{L.changeHead}</p>
          <ol className="ip-change">
            {j.change.map((c, i) => (
              <li key={c} data-step={i}>
                <span className="ip-label">{L.change[i]}</span>
                <span className="ip-change__text">{c}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="ip-box ip-diagram">
          <div className="ip-diagram__row">
            <p className="ip-label">{L.rows[0]}</p>
            <div className="ip-nodes ip-nodes--2">
              {j.experiences.map((n, i) => (
                <span key={n} className="ip-node ip-node--exp" style={{ '--k': i ? 8 : 0 } as CSSProperties}>
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="ip-diagram__row ip-diagram__row--link">
            <span />
            <div className="ip-links">
              <Link dir="down">{L.down1}</Link>
              <Link dir="up">{L.up1}</Link>
            </div>
          </div>
          <div className="ip-diagram__row">
            <span />
            <p className="ip-spine" style={{ '--k': 1 } as CSSProperties}>
              {L.spine[0]}
              <i aria-hidden="true" />
              {L.spine[1]}
            </p>
          </div>
          <div className="ip-diagram__row ip-diagram__row--link">
            <span />
            <div className="ip-links">
              <Link dir="down">{L.down2}</Link>
              <Link dir="up">{L.up2}</Link>
            </div>
          </div>
          <div className="ip-diagram__row">
            <p className="ip-label">{L.rows[1]}</p>
            <div className="ip-nodes ip-nodes--3">
              {j.workflows.map((n, i) => (
                <span key={n} className="ip-node ip-node--flow" style={{ '--k': 2 + i } as CSSProperties}>
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="ip-diagram__row ip-diagram__row--link">
            <span />
            <div className="ip-links ip-links--one">
              <Link dir="both">{L.exchange}</Link>
            </div>
          </div>
          <div className="ip-diagram__row">
            <p className="ip-label">{L.rows[2]}</p>
            <div className="ip-nodes ip-nodes--3">
              {j.systems.map((n, i) => (
                <span key={n} className="ip-node ip-node--sys" style={{ '--k': 5 + i } as CSSProperties}>
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="ip-diagram__controls">
            <p className="ip-label">{L.controls}</p>
            <p>{L.controlsList}</p>
          </div>
        </div>

        <div className="ip-steps-head">
          <h3 className="ip-h3 ip-h3--l">{L.stepsHead}</h3>
          <p className="ip-label">{L.stepsTag}</p>
        </div>
        <ol className="ip-steps">
          {j.steps.map((s, i) => (
            <li key={s} className="ip-step" style={{ '--k': 9 + i } as CSSProperties}>
              <span className="ip-step__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="ip-step__text">{s}</span>
            </li>
          ))}
        </ol>
        <div className="ip-exception">
          <p className="ip-label">↳ {L.exception}</p>
          <p>{j.exception}</p>
        </div>
        <div className="ip-context">
          <p className="ip-label">{L.context}</p>
          <p>{j.context}</p>
        </div>
        <p className="ip-note">{L.note}</p>
      </div>
    </section>
  )
}

/* ── 06 · Relevant work ──────────────────────────────────────────────────── */

export function Work({ content }: { content: typeof WorkContent }) {
  return (
    <section id={content.id} className="ip-sec" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="coral" />
      <div className="ip-work">
        {content.cases.map((c) => (
          <article key={c.name} className="ip-case" data-umm-reveal>
            <a className="ip-case__visual" href={c.href} data-umm-tone={c.tone} aria-label={`${content.view}: ${c.name}`}>
              <span className="ip-case__frame">
                <img src={c.image} alt={c.alt} loading="lazy" decoding="async" />
              </span>
              <span className="ip-case__view">
                {content.view}
                <FlyArrow size={14} strokeWidth={1.75} />
              </span>
            </a>
            <div className="ip-case__text">
              <p className="ip-label">{c.tag}</p>
              <h3 className="ip-case__name">{c.name}</h3>
              <p className="ip-case__title">{c.title}</p>
              <p className="ip-case__body">{c.body}</p>
              <p className="ip-label ip-case__role-label">{content.roleLabel}</p>
              <p className="ip-case__role">{c.role}</p>
              <a className="ip-case__read" href={c.href}>
                {content.read}
                <FlyArrow size={15} strokeWidth={1.75} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ── 07 · Who we work with ───────────────────────────────────────────────── */

export function Audiences({ content }: { content: typeof AudiencesContent }) {
  const [id, setId] = useState(content.items[0].id)
  const item = content.items.find((it) => it.id === id) ?? content.items[0]
  const base = `${content.id}-tabs`
  return (
    <section id={content.id} className="ip-sec ip-sec--rule" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="sky" />
      <div className="ip-split" data-umm-reveal>
        <ListTabs idBase={base} label={content.head.eyebrow} items={content.items} value={id} onChange={setId} size="l" />
        <div
          key={item.id}
          id={`${base}-panel`}
          className="ip-panel ip-swap"
          role="tabpanel"
          aria-labelledby={`${base}-tab-${item.id}`}
        >
          <FinArt name={item.art} tone={item.tone} className="fa--wide" />
          <h3 className="ip-h3 ip-h3--l">{item.title}</h3>
          <p className="ip-panel__body">{item.body}</p>
        </div>
      </div>
    </section>
  )
}

/* ── 08 · How AI is impacting financial services ─────────────────────────── */

export function Impact({ content }: { content: typeof ImpactContent }) {
  return (
    <section id={content.id} className="ip-sec ip-sec--rule" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="blossom" />
      <div className="ip-cards ip-cards--2">
        {content.cards.map((c, i) => (
          <article key={c.title} className="ip-card ip-card--impact" data-umm-reveal style={stagger(i % 2, 90)}>
            <div className="ip-impact__top">
              <div>
                <p className="ip-label">{c.eyebrow}</p>
                <h3 className="ip-h3">{c.title}</h3>
              </div>
              <FinArt name={c.art} tone={c.tone} />
            </div>
            <p className="ip-impact__body">{c.body}</p>
            <div className="ip-impact__change">
              <p className="ip-label">{content.changeLabel}</p>
              <p>{c.change}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="ip-close" data-umm-reveal>
        <p className="ip-close__title">{content.close.title}</p>
        <p className="ip-close__body">{content.close.body}</p>
      </div>
    </section>
  )
}

/* ── 09 · AI in financial services ───────────────────────────────────────── */

export function AiUses({ content }: { content: typeof AiContent }) {
  return (
    <section id={content.id} className="ip-sec ip-sec--ground" aria-labelledby={`${content.id}-h`}>
      <Head id={content.id} head={content.head} tone="citrus" />
      <div className="ip-cards ip-cards--3">
        {content.cards.map((c, i) => (
          <article key={c.title} className="ip-card ip-card--ai" data-umm-reveal style={{ ...stagger(i, 90), '--rows': 5 } as CSSProperties}>
            <span className="ip-step__num">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="ip-h3">{c.title}</h3>
            <ol className="ip-flow" data-umm-tone={c.tone}>
              {c.flow.map((f) => (
                <li key={f}>
                  <span>{f}</span>
                </li>
              ))}
            </ol>
            <p className="ip-ai-card__body">{c.body}</p>
            <div className="ip-impact__change">
              <p className="ip-label">{content.measureLabel}</p>
              <p>{c.measures.join(' · ')}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="ip-close" data-umm-reveal>
        <p className="ip-close__title">{content.close.title}</p>
        <p className="ip-close__body">{content.close.body}</p>
      </div>
    </section>
  )
}

/* ── 10 · Your next chapter ──────────────────────────────────────────────── */

/** The close: the words on the left, and on the right the hero's flowing
 *  colour in a rounded panel, in the hero's palette, so the page ends the
 *  way it began. With a route, the receipt sits on the colour (`aside`):
 *  the payment lands in it. */
export function NextChapter({
  content,
  palette,
  aside,
}: {
  content: typeof ContactContent
  palette: FlowPalette
  aside?: ReactNode
}) {
  const host = useRef<HTMLDivElement>(null)
  const flow = useRef<FlowField | null>(null)
  const first = useRef(palette)

  useEffect(() => {
    const el = host.current!
    try {
      flow.current = new FlowField(el, first.current)
    } catch {
      el.dataset.flat = ''
      return
    }
    const ro = new ResizeObserver(() => flow.current?.resize())
    ro.observe(el)
    return () => {
      ro.disconnect()
      flow.current?.dispose()
      flow.current = null
    }
  }, [])

  useEffect(() => {
    flow.current?.setPalette(palette)
  }, [palette])

  return (
    <section id={content.id} className="ip-sec ip-next" aria-labelledby={`${content.id}-h`}>
      <div className="ip-next__copy" data-umm-reveal>
        <p className="ip-eyebrow" data-umm-tone="sun">
          {content.eyebrow}
        </p>
        <h2 id={`${content.id}-h`} className="ip-h2 ip-h2--solid">
          <span>{content.lines[0]}</span>
          <span>{content.lines[1]}</span>
        </h2>
        <p className="ip-next__body">{content.body}</p>
        <SplitButton href={content.cta.href}>{content.cta.label}</SplitButton>
      </div>
      <div className="ip-next__stage" data-umm-reveal data-umm-reveal-from="scale">
        <div ref={host} className="ip-next__field" aria-hidden="true" />
        {aside}
      </div>
    </section>
  )
}
