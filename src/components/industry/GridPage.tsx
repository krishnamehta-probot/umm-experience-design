import { useState, type ReactNode } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import type { Tone } from '@/components/primitives/tone'
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
import '@/styles/fin-grid.css'

/* ============================================================================
   FINTECH — "GRID" (Krish, 6 Nov: the second of two modern, interactive
   pages; references Tirtus and Fluxlab, "our colors and our icons and such
   nice glass type of things… mainly compact")

   After Fluxlab: the page is an editorial grid on white, every row and cell
   ruled by a hairline. Big type, pill tags, small-caps numbered indexes,
   tiles of fluted glass in the brand pastels with UMM's Cool Shapes and
   real glass objects in front of them, round ink arrow buttons. Every
   section one screen. The copy is the final copy, word for word.
   ========================================================================== */

function Title({ lines }: { lines: readonly string[] }) {
  return (
    <h2 className="gb-h2">
      <span>{lines[0]}</span>
      <span className="gb-grey">{lines[1]}</span>
    </h2>
  )
}

function HeadRow({ head, children }: { head: SectionHead; children?: ReactNode }) {
  return (
    <div className="gb-row gb-headrow">
      <div className="gb-headrow__l" data-umm-reveal>
        <p className="gb-pill gb-pill--static">{head.eyebrow}</p>
        <Title lines={head.lines} />
      </div>
      <div className="gb-headrow__r" data-umm-reveal>
        <p className="gb-p">{head.intro}</p>
        {children}
      </div>
    </div>
  )
}

/* ── 01 · Hero ─────────────────────────────────────────────────────────── */

const SECTOR_TONES: Tone[][] = [
  ['sky', 'lilac', 'blossom', 'citrus'],
  ['citrus', 'sun', 'sky', 'coral'],
  ['blossom', 'coral', 'lilac', 'sky'],
]

function Hero() {
  const c = hero
  const [si, setSi] = useState(0)
  const index = [reality, journeys, system, work]
  return (
    <section className="gb-hero" aria-labelledby="gb-title">
      <MegaNav />
      <div className="gb-wrap gb-hero__wrap">
        <div className="gb-row gb-hero__top">
          <h1 id="gb-title" className="gb-hero__title">
            <span className="gb-up" style={css({ '--i': 0 })}>
              <span>{c.lines[0]}</span>
            </span>
            <span className="gb-up gb-grey" style={css({ '--i': 1 })}>
              <span>{c.lines.slice(1).join(' ')}</span>
            </span>
          </h1>
          <div className="gb-hero__side">
            <p className="gb-p">{c.lead}</p>
            <div className="gb-actions">
              <a className="gb-btn" href={c.primary.href}>
                {c.primary.label} <Arrow />
              </a>
              <a className="gb-btn gb-btn--ghost" href={c.secondary.href}>
                {c.secondary.label} <Arrow down />
              </a>
            </div>
          </div>
        </div>

        <div className="gb-row gb-hero__bar">
          <div className="gb-pills" role="group" aria-label={c.eyebrow}>
            {c.sectors.map((s, k) => (
              <button key={s} type="button" className="gb-pill" aria-pressed={k === si} onClick={() => setSi(k)}>
                {s}
              </button>
            ))}
          </div>
          <nav className="gb-hero__index" aria-label="On this page">
            {index.map((s, k) => (
              <a key={s.id} className="gb-caps" href={`#${s.id}`}>
                <span>{pad(k)}.</span> {s.head.eyebrow}
              </a>
            ))}
          </nav>
        </div>

        <div className="gb-row gb-hero__tiles">
          <div className="gb-tile">
            <FlutedGlass tones={SECTOR_TONES[si]} ground="paper" flutes={20} />
            <p className="gb-tile__cap">{c.eyebrow}</p>
            <p className="gb-tile__big" key={si}>
              {c.sectors[si]}
              <small>
                {pad(si)} / {pad(c.sectors.length - 1)}
              </small>
            </p>
          </div>
          <div className="gb-tile gb-tile--ink">
            <GlassObject shape="card" className="gb-hero__obj" />
            <p className="gb-tag gb-tag--dark">{c.sectors.join(' · ')}</p>
            <div className="gb-tile__words">
              <p className="gb-tile__line">{c.strapline}</p>
              <a className="gb-caps gb-tile__go" href={c.secondary.href}>
                {c.secondary.label} <Arrow />
              </a>
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
  const { i, pick, host } = useCycle(c.cards.length, 5200)
  const card = c.cards[i]
  return (
    <section id={c.id} className="gb-s">
      <div className="gb-wrap">
        <div className="gb-row gb-real">
          <div className="gb-real__l" data-umm-reveal>
            <p className="gb-pill gb-pill--static">{c.head.eyebrow}</p>
            <Title lines={c.head.lines} />
            <hr className="gb-rule" />
            <p className="gb-p">{c.head.intro}</p>
          </div>
          <div className="gb-real__mid">
            <div className="gb-glasstile">
              <FlutedGlass tones={[card.tone, 'lilac', 'sky', 'blossom']} ground="veil" flutes={16} />
              <GlassObject shape="shield" className="gb-real__obj" />
              <p className="gb-tag">
                {pad(i)} / {pad(c.cards.length - 1)}
              </p>
            </div>
          </div>
          <div ref={host} className="gb-real__r">
            <ol className="gb-index">
              {c.cards.map((x, k) => (
                <li key={x.title}>
                  <button type="button" aria-pressed={k === i} onClick={() => pick(k)}>
                    <span>{pad(k)}.</span>
                    {x.title}
                    <i />
                  </button>
                </li>
              ))}
            </ol>
            <div className="gb-mini" key={card.title} data-umm-tone={card.tone}>
              <div className="gb-mini__art">
                <span className="gb-mini__icon">
                  <CoolIcon name={REALITY_ICON[i]} />
                </span>
                <Reed />
                <span className="gb-round">
                  <Arrow />
                </span>
              </div>
              <p className="gb-mini__t">{card.title}</p>
              <p className="gb-mini__b">{card.body}</p>
            </div>
          </div>
        </div>
        <div className="gb-row gb-pov" data-umm-reveal>
          <p className="gb-caps">{c.view.eyebrow}</p>
          <p className="gb-pov__big">
            <span>{c.view.lines[0]}</span> <span className="gb-grey">{c.view.lines[1]}</span>
          </p>
          <p className="gb-p">{c.view.body}</p>
        </div>
      </div>
    </section>
  )
}

/* ── 03 · Financial journeys ────────────────────────────────────────────── */

const JOURNEY_ICON: IconName[] = ['fintech', 'beauty-and-wellness', 'energy', 'real-estate', 'hospitality', 'telecom']

function Journeys() {
  const c = journeys
  const { i, pick, host } = useCycle(c.items.length, 6000)
  const it = c.items[i]
  return (
    <section id={c.id} className="gb-s">
      <div className="gb-wrap">
        <HeadRow head={c.head} />
        <div ref={host} className="gb-row gb-band">
          <div className="gb-band__list">
            <ol className="gb-index">
              {c.items.map((x, k) => (
                <li key={x.id}>
                  <button type="button" aria-pressed={k === i} onClick={() => pick(k)}>
                    <span>{pad(k)}.</span>
                    {x.label}
                    <i />
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="gb-band__glass">
            <FlutedGlass tones={[it.tone, 'lilac', 'sky', 'blossom']} ground="veil" flutes={22} />
            <span className="gb-band__icon" key={it.id}>
              <CoolIcon name={JOURNEY_ICON[i]} />
            </span>
            <p className="gb-tag">{it.label}</p>
          </div>
          <div className="gb-band__text" key={it.id} data-umm-tone={it.tone}>
            <h3>{it.title}</h3>
            <p className="gb-p">{it.body}</p>
            <ul className="gb-ticks">
              {it.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="gb-row gb-note">
          <p className="gb-caps">{c.view.eyebrow}</p>
          <p className="gb-p">{c.view.body}</p>
        </div>
      </div>
    </section>
  )
}

/* ── 04 · Beyond the transaction ────────────────────────────────────────── */

const OPS_ICON: IconName[] = ['media', 'real-estate', 'healthtech']

function Operations() {
  const c = operations
  const [hi, setHi] = useState<number | null>(null)
  return (
    <section id={c.id} className="gb-s">
      <div className="gb-wrap">
        <HeadRow head={c.head}>
          <div className="gb-pills">
            {c.cards.map((x, k) => (
              <button
                key={x.eyebrow}
                type="button"
                className="gb-pill"
                aria-pressed={hi === k}
                onPointerEnter={() => setHi(k)}
                onPointerLeave={() => setHi(null)}
                onClick={() => setHi((h) => (h === k ? null : k))}
              >
                {x.eyebrow}
              </button>
            ))}
          </div>
        </HeadRow>
        <div className="gb-row gb-cards3">
          {c.cards.map((card, k) => (
            <article
              key={card.eyebrow}
              className="gb-card"
              data-umm-tone={card.tone}
              data-hi={hi === k || undefined}
              data-dim={(hi !== null && hi !== k) || undefined}
              onPointerEnter={() => setHi(k)}
              onPointerLeave={() => setHi(null)}
              data-umm-reveal
              style={css({ '--umm-reveal-delay': `${k * 90}ms` })}
            >
              <div className="gb-card__art">
                <span className="gb-card__icon">
                  <CoolIcon name={OPS_ICON[k]} />
                </span>
                <Reed />
                <p className="gb-tag">{card.eyebrow}</p>
                <span className="gb-round">
                  <Arrow />
                </span>
              </div>
              <h3>{card.title}</h3>
              <p className="gb-p">{card.body}</p>
              <ul className="gb-ticks">
                {card.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
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
    <div className="gb-trow">
      <span className="gb-trow__label">{label}</span>
      <div className="gb-trow__cells" style={css({ '--n': nodes.length })}>
        {nodes.map((n, k) => (
          <span key={n} className="gb-tcell" data-on={on.includes(k) || undefined}>
            {n}
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <section id={c.id} className="gb-s">
      <div ref={ref} className="gb-wrap">
        <HeadRow head={c.head} />
        <div className="gb-row gb-tabsrow" role="tablist" aria-label={L.reference}>
          {c.journeys.map((x, k) => (
            <button key={x.id} type="button" role="tab" aria-selected={k === ji} onClick={() => setJi(k)}>
              <span>{pad(k)}</span>
              {x.label}
            </button>
          ))}
        </div>
        <div className="gb-row gb-sys" key={j.id}>
          <div className="gb-sys__side">
            <p className="gb-caps gb-q">{L.reference}</p>
            <p className="gb-sys__sum">{j.summary}</p>
            <div className="gb-sys__ai">
              <FlutedGlass tones={['lilac', 'sky', 'blossom', 'lilac']} ground="ink" flutes={5} />
              <div className="gb-sys__ai-in">
                <p className="gb-caps">
                  <span className="gb-live" />
                  {L.ai.join(' ')}
                </p>
                <b>{j.ai.title}</b>
                <p>{j.ai.body}</p>
              </div>
            </div>
            <p className="gb-caps gb-q">{L.changeHead}</p>
            <dl className="gb-sys__change">
              {L.change.map((lab, k) => (
                <div key={lab}>
                  <dt>{lab}</dt>
                  <dd>{j.change[k]}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="gb-sys__table">
            {row(L.rows[0], j.experiences, lit.e)}
            <p className="gb-tband">
              <span>↓ {L.down1}</span>
              <span>↑ {L.up1}</span>
            </p>
            {row(L.rows[1], j.workflows, lit.w)}
            <p className="gb-tband">
              <span>↓ {L.down2}</span>
              <span className="gb-tband__spine">
                {L.spine.map((s) => (
                  <b key={s}>{s}</b>
                ))}
              </span>
              <span>↑ {L.up2}</span>
            </p>
            {row(L.rows[2], j.systems, lit.s)}
            <p className="gb-tctl">
              <span>{L.exchange}</span>
              <span>
                <b>{L.controls}</b> {L.controlsList}
              </span>
            </p>
            <p className="gb-tops">{L.aiOps}</p>
            <div className="gb-tsteps">
              <p className="gb-tsteps__h">
                <b>{L.stepsHead}</b> <span>{L.stepsTag}</span>
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
            <div className="gb-texc">
              <p className="gb-caps">↳ {L.exception}</p>
              <p>{j.exception}</p>
              <p className="gb-texc__ctx">
                <b>{L.context}</b> {j.context}
              </p>
            </div>
          </div>
        </div>
        <p className="gb-row gb-fine">{L.note}</p>
      </div>
    </section>
  )
}

/* ── 06 · Relevant work ─────────────────────────────────────────────────── */

function Work() {
  const c = work
  return (
    <section id={c.id} className="gb-s">
      <div className="gb-wrap">
        <HeadRow head={c.head} />
        <div className="gb-row gb-cards3">
          {c.cases.map((cs, k) => (
            <a
              key={cs.name}
              className="gb-workcard"
              href={cs.href}
              target="_blank"
              rel="noreferrer"
              data-umm-tone={cs.tone}
              data-umm-reveal
              style={css({ '--umm-reveal-delay': `${k * 90}ms` })}
            >
              <span className="gb-workcard__img">
                <img src={cs.image} alt={cs.alt} loading="lazy" decoding="async" />
                <span className="gb-tag">{cs.tag}</span>
                <span className="gb-round">
                  <Arrow />
                </span>
              </span>
              <span className="gb-workcard__name">{cs.name}</span>
              <span className="gb-workcard__title">{cs.title}</span>
              <span className="gb-workcard__more">
                <span>
                  <span>{cs.body}</span>
                  <span>
                    <b>{c.roleLabel}</b> {cs.role}
                  </span>
                </span>
              </span>
              <span className="gb-caps gb-workcard__go">
                {c.read} <Arrow />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── 07 · Who we work with ──────────────────────────────────────────────── */

const AUD_ICON: IconName[] = ['technology', 'fintech', 'hospitality', 'gaming']

function Audiences() {
  const c = audiences
  const { i, pick, host } = useCycle(c.items.length, 5200)
  return (
    <section id={c.id} className="gb-s">
      <div className="gb-wrap">
        <HeadRow head={c.head} />
        <div ref={host} className="gb-row gb-aud" role="tablist" aria-label={c.head.eyebrow}>
          {c.items.map((a, k) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={k === i}
              className="gb-aud__cell"
              data-on={k === i || undefined}
              data-umm-tone={a.tone}
              onClick={() => pick(k)}
            >
              <span className="gb-caps">
                <span>{pad(k)}.</span> {a.label}
              </span>
              <span className="gb-aud__icon">
                <CoolIcon name={AUD_ICON[k]} />
              </span>
              <span className="gb-aud__title">{a.title}</span>
              <span className="gb-aud__body">{a.body}</span>
              <i className="gb-aud__fill" />
              <i className="gb-aud__bar" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── 08 · How AI is impacting financial services ────────────────────────── */

function Impact() {
  const c = impact
  return (
    <section id={c.id} className="gb-s">
      <div className="gb-wrap">
        <HeadRow head={c.head} />
        <div className="gb-row gb-imp">
          {c.cards.map((card, k) => {
            const [from, to] = splitShift(card.title)
            return (
              <article key={card.eyebrow} className="gb-imp__cell" data-umm-tone={card.tone} data-umm-reveal style={css({ '--k': k })}>
                <p className="gb-caps">{card.eyebrow}</p>
                <h3 className="gb-imp__title">
                  <span className="gb-imp__from">{from}</span>
                  <span className="gb-imp__to">{to}</span>
                </h3>
                <p className="gb-p">{card.body}</p>
                <p className="gb-imp__change">
                  <i />
                  <span>
                    <b>{c.changeLabel}</b>
                    {card.change}
                  </span>
                </p>
              </article>
            )
          })}
        </div>
        <div className="gb-row gb-closerow">
          <p className="gb-closerow__t">{c.close.title}</p>
          <p className="gb-p">{c.close.body}</p>
        </div>
      </div>
    </section>
  )
}

/* ── 09 · AI in financial services ──────────────────────────────────────── */

const AI_ICON: IconName[] = ['telecom', 'real-estate', 'biotech']

function Ai() {
  const c = ai
  return (
    <section id={c.id} className="gb-s">
      <div className="gb-wrap">
        <HeadRow head={c.head} />
        <div className="gb-row gb-cards3">
          {c.cards.map((card, k) => (
            <article key={card.title} className="gb-ai" data-umm-tone={card.tone} data-umm-reveal style={css({ '--k': k })}>
              <div className="gb-ai__top">
                <span className="gb-caps">
                  <span>{pad(k)}.</span>
                </span>
                <span className="gb-ai__icon">
                  <CoolIcon name={AI_ICON[k]} />
                </span>
              </div>
              <h3>{card.title}</h3>
              <ol className="gb-flow">
                {card.flow.map((f, n) => (
                  <li key={f} style={css({ '--n': n })}>
                    {f}
                  </li>
                ))}
              </ol>
              <p className="gb-p">{card.body}</p>
              <div className="gb-ai__m">
                <p className="gb-caps gb-q">{c.measureLabel}</p>
                <div className="gb-pills">
                  {card.measures.map((m) => (
                    <span key={m} className="gb-pill gb-pill--static gb-pill--tone">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="gb-row gb-closerow">
          <p className="gb-closerow__t">{c.close.title}</p>
          <p className="gb-p">{c.close.body}</p>
        </div>
      </div>
    </section>
  )
}

/* ── 10 · Your next chapter ─────────────────────────────────────────────── */

function Contact() {
  const c = contact
  return (
    <section id={c.id} className="gb-s gb-s--last">
      <div className="gb-wrap">
        <div className="gb-row gb-contact">
          <div className="gb-contact__l" data-umm-reveal>
            <p className="gb-pill gb-pill--static">{c.eyebrow}</p>
            <h2 className="gb-contact__title">
              <span>{c.lines[0]}</span>
              <span className="gb-grey">{c.lines[1]}</span>
            </h2>
            <p className="gb-p">{c.body}</p>
            <a className="gb-btn gb-btn--big" href={c.cta.href}>
              {c.cta.label} <Arrow />
            </a>
          </div>
          <div className="gb-contact__r">
            <div className="gb-tile gb-tile--ink gb-contact__tile">
              <FlutedGlass tones={['blossom', 'sky', 'lilac', 'sky']} ground="ink" flutes={16} />
              <GlassObject shape="coin" className="gb-contact__obj" />
              <p className="gb-tag gb-tag--dark">{hero.strapline}</p>
            </div>
          </div>
        </div>
        <div className="gb-row gb-foot">
          <p className="gb-caps">{hero.eyebrow}</p>
          <p className="gb-caps">{hero.sectors.join(' · ')}</p>
        </div>
      </div>
    </section>
  )
}

export function GridPage() {
  return (
    <div className="gb">
      <Hero />
      <main>
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
