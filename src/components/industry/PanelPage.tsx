import { useState } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { FlutedGlass } from './glass/FlutedGlass'
import { Arrow, CoolIcon, GlassObject, LIT, Reed, css, pad, splitShift, useCycle, useStep, type IconName } from './glass/kit'
import {
  ai,
  audiences,
  contact,
  hero,
  impact,
  journeys,
  operations,
  reality,
  system,
  work,
  type SectionHead,
} from '@/content/fintech'
import '@/styles/fin-panel.css'

/* ============================================================================
   FINTECH — "PANEL" (Krish, 6 Nov: two interactive, modern pages in UMM's
   style; his references were Tirtus and Fluxlab, "our colors and our icons
   and such nice glass type of things… mainly compact")

   After Tirtus: the hero is a rounded ink panel lit by the brand pastels
   through fluted glass, a glass card turning in it; the page comes up over
   it as a white sheet. Big type with its answer in grey, numbered cards,
   an expanding list, the reference architecture on a dark glass panel, a
   work list with pictures, a big numeral card. Every section one screen.
   The copy is the final copy (content/fintech.ts), word for word.
   ========================================================================== */

function Title({ lines, className = '' }: { lines: readonly [string, string] | readonly string[]; className?: string }) {
  return (
    <h2 className={`pa-h2 ${className}`.trim()}>
      <span>{lines[0]}</span>
      <span className="pa-grey">{lines[1]}</span>
    </h2>
  )
}

function Label({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <p className="pa-label" data-umm-tone={tone}>
      <i />
      {children}
    </p>
  )
}

function Head({ head, tone }: { head: SectionHead; tone: string }) {
  return (
    <div className="pa-head">
      <div className="pa-head__l" data-umm-reveal>
        <Label tone={tone}>{head.eyebrow}</Label>
        <Title lines={head.lines} />
      </div>
      <p className="pa-intro pa-head__r" data-umm-reveal>
        {head.intro}
      </p>
    </div>
  )
}

/* ── 01 · Hero ─────────────────────────────────────────────────────────── */

function Hero() {
  const c = hero
  return (
    <section className="pa-hero" aria-labelledby="pa-title">
      <MegaNav />
      <div className="pa-hero__panel">
        <FlutedGlass tones={['sky', 'blossom', 'lilac', 'sky']} ground="ink" flutes={14} />
        <span className="pa-hero__shade" />
        <GlassObject shape="card" className="pa-hero__obj" />
        <div className="pa-hero__in">
          <p className="pa-chip pa-chip--glass">{c.eyebrow}</p>
          <h1 id="pa-title" className="pa-hero__title">
            {c.lines.map((l, i) => (
              <span key={l} className="pa-rise" style={css({ '--i': i })}>
                <span>{l}</span>
              </span>
            ))}
          </h1>
          <div className="pa-hero__foot">
            <div className="pa-hero__tag">
              <p className="pa-hero__strap">{c.strapline}</p>
              <div className="pa-hero__sectors">
                {c.sectors.map((s) => (
                  <span key={s} className="pa-chip pa-chip--glass">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="pa-hero__side">
              <p className="pa-hero__lead">{c.lead}</p>
              <div className="pa-hero__actions">
                <a className="pa-btn pa-btn--light" href={c.primary.href}>
                  <span>{c.primary.label}</span>
                  <i>
                    <Arrow />
                  </i>
                </a>
                <a className="pa-more" href={c.secondary.href}>
                  {c.secondary.label} <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 02 · The reality ───────────────────────────────────────────────────── */

const REALITY_ICON: IconName[] = ['fintech', 'manufacturing', 'ecommerce']

function Reality() {
  const c = reality
  return (
    <section id={c.id} className="pa-s pa-s--first">
      <Head head={c.head} tone="coral" />
      <div className="pa-real">
        {c.cards.map((card, i) => (
          <article key={card.title} className="pa-real__card" data-umm-tone={card.tone} data-umm-reveal style={css({ '--umm-reveal-delay': `${i * 90}ms` })}>
            <div className="pa-real__art">
              <span className="pa-real__icon">
                <CoolIcon name={REALITY_ICON[i]} />
              </span>
              <Reed />
              <span className="pa-real__num">{pad(i)}</span>
            </div>
            <div className="pa-real__text">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="pa-pov" data-umm-reveal>
        <Label tone="citrus">{c.view.eyebrow}</Label>
        <p className="pa-pov__big">
          <span>{c.view.lines[0]}</span> <span className="pa-grey">{c.view.lines[1]}</span>
        </p>
        <p className="pa-pov__body">{c.view.body}</p>
      </div>
    </section>
  )
}

/* ── 03 · Financial journeys ────────────────────────────────────────────── */

const JOURNEY_ICON: IconName[] = ['fintech', 'beauty-and-wellness', 'energy', 'real-estate', 'hospitality', 'telecom']

function Journeys() {
  const c = journeys
  const { i, pick, host } = useCycle<HTMLOListElement>(c.items.length, 6500)
  return (
    <section id={c.id} className="pa-s">
      <div className="pa-jr">
        <div className="pa-jr__intro" data-umm-reveal>
          <Label tone="citrus">{c.head.eyebrow}</Label>
          <Title lines={c.head.lines} />
          <p className="pa-intro">{c.head.intro}</p>
          <div className="pa-jr__view">
            <p className="pa-mini">{c.view.eyebrow}</p>
            <p>{c.view.body}</p>
          </div>
        </div>
        <ol ref={host} className="pa-jr__list">
          {c.items.map((it, k) => {
            const on = k === i
            return (
              <li key={it.id} data-on={on || undefined} data-umm-tone={it.tone}>
                <button type="button" className="pa-jr__row" aria-expanded={on} onClick={() => pick(k)}>
                  <span className="pa-jr__num">{pad(k)}</span>
                  <span className="pa-jr__label">{it.label}</span>
                  <span className="pa-circle">
                    <Arrow down={on} />
                  </span>
                  <span className="pa-jr__bar" />
                </button>
                <div className="pa-jr__panel">
                  <div className="pa-jr__clip">
                    <div className="pa-jr__inner">
                      <div className="pa-jr__text">
                        <h3>{it.title}</h3>
                        <p>{it.body}</p>
                        <ul className="pa-ticks">
                          {it.points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pa-jr__art">
                        <span className="pa-jr__icon">
                          <CoolIcon name={JOURNEY_ICON[k]} />
                        </span>
                        <Reed />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/* ── 04 · Beyond the transaction ────────────────────────────────────────── */

const OPS_ICON: IconName[] = ['media', 'real-estate', 'healthtech']

function Operations() {
  const c = operations
  const [open, setOpen] = useState<number | null>(null)
  const touch = () => window.matchMedia('(hover: none)').matches
  return (
    <section id={c.id} className="pa-s">
      <Head head={c.head} tone="blossom" />
      <div className="pa-ops">
        {c.cards.map((card, k) => (
          <article
            key={card.eyebrow}
            className="pa-op"
            data-umm-tone={card.tone}
            data-open={open === k || undefined}
            data-umm-reveal
            style={css({ '--umm-reveal-delay': `${k * 90}ms` })}
            tabIndex={0}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(k)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)}
            onFocus={() => setOpen(k)}
            onBlur={() => setOpen(null)}
            onClick={() => touch() && setOpen((o) => (o === k ? null : k))}
          >
            <div className="pa-op__ground">
              <span className="pa-op__icon">
                <CoolIcon name={OPS_ICON[k]} />
              </span>
            </div>
            <div className="pa-op__top">
              <p className="pa-chip pa-chip--white">{card.eyebrow}</p>
              <span className="pa-op__num">{pad(k)}</span>
            </div>
            <div className="pa-op__foot">
              <h3>{card.title}</h3>
              <div className="pa-op__more">
                <div>
                  <p>{card.body}</p>
                  <ul className="pa-ticks">
                    {card.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <span className="pa-op__hint" aria-hidden="true">
                <Arrow />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ── 05 · How it connects ───────────────────────────────────────────────── */

function Connects() {
  const c = system
  const L = c.labels
  const [ji, setJi] = useState(0)
  const j = c.journeys[ji]
  const { k: step, ref } = useStep<HTMLDivElement>(4, 1900, ji)
  const lit = LIT[step]
  const row = (label: string, nodes: readonly string[], on: number[]) => (
    <div className="pa-arch__row">
      <span className="pa-arch__label">{label}</span>
      <div className="pa-arch__nodes" style={css({ '--n': nodes.length })}>
        {nodes.map((n, k) => (
          <span key={n} className="pa-node" data-on={on.includes(k) || undefined}>
            {n}
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <section id={c.id} className="pa-s pa-s--dark">
      <div ref={ref} className="pa-dark">
        <FlutedGlass tones={['lilac', 'sky', 'blossom', 'lilac']} ground="ink" flutes={24} className="pa-dark__glass" />
        <div className="pa-dark__in">
          <div className="pa-head pa-head--dark">
            <div className="pa-head__l">
              <p className="pa-chip pa-chip--glass">{c.head.eyebrow}</p>
              <Title lines={c.head.lines} />
            </div>
            <p className="pa-intro pa-head__r">{c.head.intro}</p>
          </div>

          <div className="pa-tabs" role="tablist" aria-label={L.reference}>
            {c.journeys.map((x, k) => (
              <button key={x.id} type="button" role="tab" aria-selected={k === ji} onClick={() => setJi(k)}>
                {x.label}
              </button>
            ))}
          </div>

          <div className="pa-sys" key={j.id}>
            <div className="pa-sys__side pa-frost">
              <p className="pa-mini">{L.reference}</p>
              <p className="pa-sys__sum">{j.summary}</p>
              <div className="pa-sys__ai">
                <p className="pa-mini">
                  <span className="pa-live" />
                  {L.ai.join(' ')}
                </p>
                <b>{j.ai.title}</b>
                <p>{j.ai.body}</p>
                <small>{L.aiOps}</small>
              </div>
              <p className="pa-mini">{L.changeHead}</p>
              <dl className="pa-sys__change">
                {L.change.map((lab, k) => (
                  <div key={lab}>
                    <dt>{lab}</dt>
                    <dd>{j.change[k]}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="pa-sys__main pa-frost">
              <div className="pa-arch">
                {row(L.rows[0], j.experiences, lit.e)}
                <p className="pa-arch__band">
                  <span>↓ {L.down1}</span>
                  <span>↑ {L.up1}</span>
                </p>
                {row(L.rows[1], j.workflows, lit.w)}
                <p className="pa-arch__band">
                  <span>↓ {L.down2}</span>
                  <span className="pa-arch__spine">
                    {L.spine.map((s) => (
                      <b key={s}>{s}</b>
                    ))}
                  </span>
                  <span>↑ {L.up2}</span>
                </p>
                {row(L.rows[2], j.systems, lit.s)}
                <p className="pa-arch__ctl">
                  <span>{L.exchange}</span>
                  <span>
                    <b>{L.controls}</b> {L.controlsList}
                  </span>
                </p>
              </div>
              <div className="pa-steps">
                <p className="pa-steps__h">
                  <b>{L.stepsHead}</b>
                  <span>{L.stepsTag}</span>
                </p>
                <ol>
                  {j.steps.map((s, k) => (
                    <li key={s} data-on={k === step || undefined} data-done={k < step || undefined}>
                      <i>{k + 1}</i>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="pa-exc">
                <p className="pa-mini">↳ {L.exception}</p>
                <p>{j.exception}</p>
                <p className="pa-exc__ctx">
                  <b>{L.context}</b> {j.context}
                </p>
              </div>
            </div>
          </div>
          <p className="pa-fine">{L.note}</p>
        </div>
      </div>
    </section>
  )
}

/* ── 06 · Relevant work ─────────────────────────────────────────────────── */

function Work() {
  const c = work
  return (
    <section id={c.id} className="pa-s">
      <Head head={c.head} tone="sun" />
      <ol className="pa-work">
        {c.cases.map((cs, k) => (
          <li key={cs.name} data-umm-tone={cs.tone} data-umm-reveal style={css({ '--umm-reveal-delay': `${k * 90}ms` })}>
            <a className="pa-work__row" href={cs.href} target="_blank" rel="noreferrer">
              <span className="pa-work__tag">
                <span className="pa-work__n">{pad(k)}</span>
                {cs.tag}
              </span>
              <span className="pa-work__img">
                <img src={cs.image} alt={cs.alt} loading="lazy" decoding="async" />
              </span>
              <span className="pa-work__text">
                <b>{cs.name}</b>
                <span className="pa-work__title">{cs.title}</span>
                <span className="pa-work__body">{cs.body}</span>
              </span>
              <span className="pa-work__role">
                <span className="pa-mini">{c.roleLabel}</span>
                {cs.role}
              </span>
              <span className="pa-work__go">
                <span>{c.read}</span>
                <i className="pa-circle pa-circle--fill">
                  <Arrow />
                </i>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ── 07 · Who we work with ──────────────────────────────────────────────── */

const AUD_ICON: IconName[] = ['technology', 'fintech', 'hospitality', 'gaming']

function Audiences() {
  const c = audiences
  const { i, pick, host } = useCycle(c.items.length, 5600)
  const it = c.items[i]
  const words = it.title.split(' ')
  const cut = Math.ceil(words.length * 0.42)
  return (
    <section id={c.id} className="pa-s pa-s--soft" data-umm-tone={it.tone}>
      <div ref={host} className="pa-aud">
        <div className="pa-aud__l" data-umm-reveal>
          <Label tone="blossom">{c.head.eyebrow}</Label>
          <Title lines={c.head.lines} />
          <p className="pa-intro">{c.head.intro}</p>
          <div className="pa-aud__card" key={it.id}>
            <span className="pa-aud__icon">
              <CoolIcon name={AUD_ICON[i]} />
            </span>
            <span className="pa-aud__meta">
              <b>{it.label}</b>
              <span>
                {pad(i)} / {pad(c.items.length - 1)}
              </span>
            </span>
            <span className="pa-aud__dot" />
          </div>
        </div>
        <div className="pa-aud__r">
          <div className="pa-aud__tabs" role="tablist" aria-label={c.head.eyebrow}>
            {c.items.map((a, k) => (
              <button key={a.id} type="button" role="tab" aria-selected={k === i} onClick={() => pick(k)}>
                <span>{pad(k)}</span>
                {a.label}
                <i />
              </button>
            ))}
          </div>
          <p className="pa-aud__big" key={it.id}>
            {words.map((w, n) => (
              <span key={n} className={n >= cut ? 'pa-grey' : undefined} style={css({ '--n': n })}>
                {w}{' '}
              </span>
            ))}
          </p>
          <p className="pa-aud__body" key={`${it.id}-b`}>
            {it.body}
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── 08 · How AI is impacting financial services ────────────────────────── */

function Impact() {
  const c = impact
  const { i, pick, host } = useCycle(c.cards.length, 6500)
  const card = c.cards[i]
  const [from, to] = splitShift(card.title)
  return (
    <section id={c.id} className="pa-s">
      <Head head={c.head} tone="sun" />
      <div ref={host} className="pa-imp" data-umm-tone={card.tone}>
        <div className="pa-imp__panel">
          <div className="pa-imp__main" key={`m${i}`}>
            <p className="pa-imp__num">
              {pad(i)}
              <small>/{pad(c.cards.length - 1)}</small>
            </p>
            <div className="pa-imp__words">
              <p className="pa-mini">{card.eyebrow}</p>
              <h3 className="pa-imp__title">
                <span className="pa-grey">{from}</span> <span>{to}</span>
              </h3>
              <p className="pa-imp__body">{card.body}</p>
            </div>
          </div>
          <div className="pa-imp__card" key={`c${i}`}>
            <span className="pa-imp__glow" />
            <p className="pa-mini">{c.changeLabel}</p>
            <p className="pa-imp__change">{card.change}</p>
            <span className="pa-circle pa-circle--fill">
              <Arrow />
            </span>
          </div>
        </div>
        <div className="pa-imp__tabs" role="tablist" aria-label={c.head.eyebrow}>
          {c.cards.map((x, k) => (
            <button key={x.eyebrow} type="button" role="tab" aria-selected={k === i} data-umm-tone={x.tone} onClick={() => pick(k)}>
              <span>{pad(k)}</span>
              {x.eyebrow.split(' / ')[1]}
              <i />
            </button>
          ))}
        </div>
      </div>
      <div className="pa-close">
        <p className="pa-close__t">{c.close.title}</p>
        <p className="pa-close__b">{c.close.body}</p>
      </div>
    </section>
  )
}

/* ── 09 · AI in financial services ──────────────────────────────────────── */

const AI_ICON: IconName[] = ['telecom', 'real-estate', 'biotech']

function Ai() {
  const c = ai
  return (
    <section id={c.id} className="pa-s">
      <Head head={c.head} tone="lilac" />
      <div className="pa-ai">
        {c.cards.map((card, k) => (
          <article key={card.title} className="pa-ai__col" data-umm-tone={card.tone} data-umm-reveal style={css({ '--k': k })}>
            <div className="pa-ai__top">
              <span className="pa-ai__n">{pad(k)}</span>
              <span className="pa-ai__icon">
                <CoolIcon name={AI_ICON[k]} />
              </span>
            </div>
            <h3>{card.title}</h3>
            <ol className="pa-flow">
              {card.flow.map((f, n) => (
                <li key={f} style={css({ '--n': n })}>
                  <i />
                  {f}
                </li>
              ))}
            </ol>
            <p className="pa-ai__body">{card.body}</p>
            <div className="pa-ai__m">
              <p className="pa-mini">{c.measureLabel}</p>
              <ul>
                {card.measures.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
      <div className="pa-close">
        <p className="pa-close__t">{c.close.title}</p>
        <p className="pa-close__b">{c.close.body}</p>
      </div>
    </section>
  )
}

/* ── 10 · Your next chapter ─────────────────────────────────────────────── */

function Contact() {
  const c = contact
  return (
    <section id={c.id} className="pa-contact">
      <div className="pa-contact__panel">
        <FlutedGlass tones={['blossom', 'sky', 'lilac', 'sky']} ground="ink" flutes={18} />
        <span className="pa-contact__shade" />
        <GlassObject shape="coin" className="pa-contact__obj" />
        <div className="pa-contact__copy" data-umm-reveal>
          <p className="pa-chip pa-chip--glass">{c.eyebrow}</p>
          <h2 className="pa-contact__title">
            <span>{c.lines[0]}</span>
            <span>{c.lines[1]}</span>
          </h2>
          <p className="pa-contact__body">{c.body}</p>
          <a className="pa-btn pa-btn--light" href={c.cta.href}>
            <span>{c.cta.label}</span>
            <i>
              <Arrow />
            </i>
          </a>
        </div>
      </div>
    </section>
  )
}

export function PanelPage() {
  return (
    <div className="pa">
      <Hero />
      <main className="pa-sheet">
        <Reality />
        <Journeys />
        <Operations />
        <Connects />
        <Work />
        <Audiences />
        <Impact />
        <Ai />
        <Contact />
      </main>
    </div>
  )
}
