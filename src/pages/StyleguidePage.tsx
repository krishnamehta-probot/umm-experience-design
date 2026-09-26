import { useState } from 'react'
import {
  Accordion,
  Board,
  Button,
  ButtonLink,
  Card,
  Chapter,
  DefList,
  Marquee,
  NotchCard,
  Note,
  Ordinal,
  Outcome,
  TabPanel,
  Tabs,
  Tag,
  TextLink,
  TickList,
  TONES,
} from '@/components/primitives'
import { iconRegistry, type IconName } from '@/components/icons'

/* ============================================================================
   THE UMM DESIGN SYSTEM — LIVING STYLEGUIDE

   Not a static spec sheet: every swatch, type ramp and component below is the
   real component rendering from the real tokens. Change tokens.css and this
   page changes with it, which is what stops a design system drifting away from
   the product it describes.
   ========================================================================== */

const FOUNDATION = [
  { name: 'canvas', hex: '#EEEEEE', use: 'Page ground' },
  { name: 'canvas-deep', hex: '#E4E4E7', use: 'Recessed bands' },
  { name: 'paper', hex: '#FFFFFF', use: 'Cards, raised surfaces' },
  { name: 'ink', hex: '#100E14', use: 'Primary text, dark bands' },
  { name: 'ink-soft', hex: '#41414D', use: 'Secondary text' },
  { name: 'ink-quiet', hex: '#737380', use: 'Meta, captions, labels' },
  { name: 'hairline', hex: '#C3C3C9', use: 'Dividers on canvas' },
  { name: 'line', hex: '#E7E7ED', use: 'Dividers on paper' },
  { name: 'veil', hex: '#F1F1F4', use: 'Quiet fills, hover grounds' },
]

const ACCENTS = [
  { name: 'blossom', hex: '#FFC4F2', use: 'Magenta pink' },
  { name: 'citrus', hex: '#F0FF70', use: 'Lime' },
  { name: 'sky', hex: '#D1E7FF', use: 'Light blue' },
  { name: 'sun', hex: '#FFE58F', use: 'Yellow' },
  { name: 'coral', hex: '#FFC3C4', use: 'Salmon' },
]

/* Each brand colour mixed down onto paper. The only derivation the palette
   allows: a wash is the same colour, not a sixth one. Stated as the mix, not
   as a hex, because a hex here is a sixth value to keep in sync — the chip
   beside it already renders the live token. */
const WASHES = [
  { name: 'blossom-wash', hex: 'blossom @ 20%', use: 'Under blossom' },
  { name: 'citrus-wash', hex: 'citrus @ 18%', use: 'Under citrus' },
  { name: 'sky-wash', hex: 'sky @ 28%', use: 'Under sky' },
  { name: 'sun-wash', hex: 'sun @ 18%', use: 'Under sun' },
  { name: 'coral-wash', hex: 'coral @ 18%', use: 'Under coral' },
]

const TYPE_RAMP = [
  { token: 'display-xl', label: 'Display XL', note: '3–6.25rem · hero statements' },
  { token: 'display-l', label: 'Display L', note: '2.5–4.25rem · page + closing titles' },
  { token: 'display-m', label: 'Display M', note: '2–3rem · section headings' },
  { token: 'display-s', label: 'Display S', note: '1.6–2.25rem · panel titles' },
  { token: 'heading-l', label: 'Heading L', note: '1.375–1.75rem · card titles' },
  { token: 'heading-m', label: 'Heading M', note: '1.125–1.3rem · outcomes' },
  { token: 'body-l', label: 'Body L', note: '1.06–1.19rem · section leads' },
  { token: 'body', label: 'Body', note: '1rem · default' },
  { token: 'body-s', label: 'Body S', note: '0.9375rem · card copy' },
]

const SPACE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string
  title: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <section className="sg-section" id={id}>
      <div className="sg-section__head">
        <h2>{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Specimen({
  name,
  note,
  children,
}: {
  name: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <div className="sg-specimen">
      <div className="sg-specimen__meta">
        <code>{name}</code>
        {note ? <span>{note}</span> : null}
      </div>
      <div className="sg-specimen__stage">{children}</div>
    </div>
  )
}

export function StyleguidePage() {
  const [tab, setTab] = useState('one')

  return (
    <div className="sg">
      <header className="sg-masthead">
        <div className="umm-container">
          <Chapter>UMM Design System</Chapter>
          <h1>
            A component library for UMM
            <br />
            enterprise service pages
          </h1>
          <p>
            Every element below renders from <code>src/styles/tokens.css</code>. Change a
            token and this page, and every service page built on it, changes together.
          </p>
          <div className="sg-masthead__actions">
            <ButtonLink href="/" variant="ink">
              View the CX service page
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="umm-container sg-body">
        {/* ---------------------------------------------------------------- */}
        <Section
          id="color"
          title="Colour"
          intro="A light enterprise ground and five pastel accent surfaces. There is no sixth colour and no saturated tier: colour identifies, ink reads."
        >
          <h3 className="sg-subhead">Foundation</h3>
          <div className="sg-swatches">
            {FOUNDATION.map((c) => (
              <div className="sg-swatch" key={c.name}>
                <span
                  className="sg-swatch__chip"
                  style={{ background: `var(--umm-${c.name})` }}
                />
                <code>--umm-{c.name}</code>
                <span className="sg-swatch__hex">{c.hex}</span>
                <span className="sg-swatch__use">{c.use}</span>
              </div>
            ))}
          </div>

          <h3 className="sg-subhead">Accent surfaces</h3>
          <p className="sg-note">
            These are surfaces, never text colours. Ink always sits on top of them, which
            is what keeps contrast compliant at any size.
          </p>
          <div className="sg-swatches">
            {ACCENTS.map((c) => (
              <div className="sg-swatch" key={c.name}>
                <span
                  className="sg-swatch__chip sg-swatch__chip--tall"
                  style={{ background: `var(--umm-${c.name})` }}
                >
                  Aa
                </span>
                <code>--umm-{c.name}</code>
                <span className="sg-swatch__hex">{c.hex}</span>
                <span className="sg-swatch__use">{c.use}</span>
              </div>
            ))}
          </div>

          <h3 className="sg-subhead">Washes</h3>
          <div className="sg-swatches">
            {WASHES.map((c) => (
              <div className="sg-swatch" key={c.name}>
                <span
                  className="sg-swatch__chip"
                  style={{ background: `var(--umm-${c.name})` }}
                />
                <code>--umm-{c.name}</code>
                <span className="sg-swatch__hex">{c.hex}</span>
                <span className="sg-swatch__use">{c.use}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="type"
          title="Typography"
          intro="One family across the whole system. Display sizes are fluid and clamp against a 1440px design width, so there are no breakpoint-specific type rules to maintain."
        >
          <div className="sg-ramp">
            {TYPE_RAMP.map((t) => (
              <div className="sg-ramp__row" key={t.token}>
                <div className="sg-ramp__meta">
                  <code>--umm-text-{t.token}</code>
                  <span>{t.note}</span>
                </div>
                <p
                  className="sg-ramp__sample"
                  style={{ fontSize: `var(--umm-text-${t.token})` }}
                >
                  {t.label}
                </p>
              </div>
            ))}
            <div className="sg-ramp__row">
              <div className="sg-ramp__meta">
                <code>--umm-text-label</code>
                <span>0.75rem · mono, uppercase, tracked</span>
              </div>
              <p className="sg-ramp__sample sg-ramp__sample--mono">Section label</p>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="space"
          title="Space"
          intro="A 4px base scale. Section rhythm is fluid via --umm-section-y."
        >
          <div className="sg-space">
            {SPACE.map((n) => (
              <div className="sg-space__row" key={n}>
                <code>--umm-sp-{n}</code>
                <span className="sg-space__bar" style={{ width: `var(--umm-sp-${n})` }} />
                <span className="sg-space__value">{n * 4}px</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="icons"
          title="Iconography"
          intro="An owned set on a single grammar: 24px canvas, 20px live area, 1.5 stroke, currentColor, round caps. No photography anywhere in the system — icons and drawn diagrams carry every visual idea."
        >
          <div className="sg-icons">
            {(Object.keys(iconRegistry) as IconName[]).map((name) => {
              const Glyph = iconRegistry[name]
              return (
                <div className="sg-icon" key={name}>
                  <Glyph size={26} />
                  <code>{name}</code>
                </div>
              )
            })}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="buttons" title="Actions">
          <Specimen name="<Button /> · <ButtonLink />" note="variant: ink | accent | tone | outline | paper">
            <div className="sg-row">
              <Button>Discuss your CX project</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="outline">Outline</Button>
              <div data-umm-tone="sun">
                <Button variant="tone">Tone</Button>
              </div>
            </div>
            <div className="sg-row">
              <Button size="lg">Large</Button>
              <Button size="sm">Small</Button>
              <Button icon="none">No glyph</Button>
            </div>
          </Specimen>

          <Specimen name="<TextLink />">
            <TextLink href="#icons">View our work</TextLink>
          </Specimen>

          <Specimen name="<Tag />" note="variant: default | tone | solid">
            <div className="sg-row">
              <Tag>Default</Tag>
              <Tag variant="tone" tone="citrus">
                Tone
              </Tag>
              <Tag variant="solid" tone="sky">
                Solid
              </Tag>
            </div>
          </Specimen>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="surfaces"
          title="Surfaces"
          intro="The notch card is UMM's signature: a circular bite out of the bottom-right corner with the action arrow seated in it, carried over from the brand cards on umm.digital."
        >
          <Specimen name="<Card />" note="fill: paper | tone | wash | quiet">
            <div className="sg-grid-3">
              <Card lift>
                <h4 className="sg-card-title">Paper</h4>
                <p className="sg-card-text">The default raised surface.</p>
              </Card>
              <Card fill="wash" tone="citrus">
                <h4 className="sg-card-title">Wash</h4>
                <p className="sg-card-text">An accent tint for calm areas.</p>
              </Card>
              <Card fill="tone" tone="sky">
                <h4 className="sg-card-title">Tone</h4>
                <p className="sg-card-text">Full accent, ink on top.</p>
              </Card>
            </div>
          </Specimen>

          <Specimen name="<NotchCard />" note="the UMM signature shape">
            <div className="sg-grid-3">
              {TONES.slice(0, 3).map((tone) => (
                <NotchCard tone={tone} key={tone}>
                  <h4 className="sg-card-title">{tone}</h4>
                  <p className="sg-card-text">
                    The arrow sits outside the mask, so it is never clipped.
                  </p>
                </NotchCard>
              ))}
            </div>
          </Specimen>

          <Specimen name="<Board />" note="agreed facts, on ink">
            <div className="sg-grid-2">
              <Board
                title="What good looks like"
                rows={[
                  { label: 'What we measure', value: 'Task completion' },
                  { label: 'Journey scope', value: 'Browse to return' },
                  { label: 'Typical output', value: 'Service blueprint' },
                ]}
              />
            </div>
          </Specimen>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="content" title="Content patterns">
          <Specimen name="<Chapter />" note="opens every section">
            <Chapter>Experience Design / CX</Chapter>
          </Specimen>

          <Specimen name="<Ordinal />" note="size: lg | sm | mono · fills when its row is the focus">
            <div className="sg-row sg-row--baseline">
              <Ordinal value={1} />
              <Ordinal value={2} filled />
              <Ordinal value={3} size="sm" />
              <Ordinal value={4} size="mono" />
            </div>
          </Specimen>

          <Specimen name="<DefList />" note="Challenge / Approach / What you get">
            <div className="sg-grid-2">
              <DefList
                entries={[
                  { term: 'Challenge', desc: 'Consistency across many teams and markets.' },
                  { term: 'Approach', desc: 'One design standard and clear journey ownership.' },
                  {
                    term: 'What you get',
                    desc: 'A consistent experience your whole organisation can deliver.',
                    emphasis: true,
                  },
                ]}
              />
            </div>
          </Specimen>

          <Specimen name="<Outcome />" note="the line a buyer scans for">
            <div className="sg-grid-2" data-umm-tone="blossom">
              <Outcome>A prioritised roadmap and a research report.</Outcome>
            </div>
          </Specimen>

          <Specimen name="<TickList />">
            <div data-umm-tone="citrus">
              <TickList
                items={[
                  'Connected online and in-store experience',
                  'Onboarding and support journeys designed in',
                  'Measures agreed before design begins',
                ]}
              />
            </div>
          </Specimen>

          <Specimen name="<Note />" note="scoping and disclaimer copy">
            <Note>
              These groupings reflect how we work. They do not imply a partnership,
              reseller status or certification unless stated separately.
            </Note>
          </Specimen>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="interactive" title="Interactive">
          <Specimen name="<Tabs /> · <TabPanel />" note="full WAI-ARIA keyboard support">
            <Tabs
              idBase="sg-demo"
              label="Demo tabs"
              value={tab}
              onChange={setTab}
              items={[
                { id: 'one', label: 'Retail & commerce', icon: 'retail' },
                { id: 'two', label: 'Financial services', icon: 'finance' },
                { id: 'three', label: 'Healthcare', icon: 'health' },
              ]}
            />
            <div className="sg-tabpanel">
              <TabPanel idBase="sg-demo" id={tab}>
                <p className="sg-card-text">
                  Arrow keys move between tabs, Home and End jump to the ends, and only
                  the selected tab sits in the tab order.
                </p>
              </TabPanel>
            </div>
          </Specimen>

          <Specimen
            name="<Accordion />"
            note="height animated with grid-template-rows, no measured pixels"
          >
            <Accordion
              defaultOpen={0}
              entries={[
                {
                  question: 'What does a CX assessment include?',
                  answer: (
                    <p>
                      We research a set of priority journeys, review the current
                      experience, and agree the measures that matter.
                    </p>
                  ),
                },
                {
                  question: 'Can we start with one journey?',
                  answer: <p>Yes. Many engagements start with a single priority journey.</p>,
                },
              ]}
            />
          </Specimen>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="motion"
          title="Motion"
          intro="Three easings and five durations, all tokenised. Every scroll-linked effect checks prefers-reduced-motion first and degrades to a static, fully-visible state — content is never hidden behind an animation that may not run."
        >
          <div className="sg-motion">
            <div>
              <code>--umm-ease-out</code>
              <span>cubic-bezier(.22, 1, .36, 1) — entrances</span>
            </div>
            <div>
              <code>--umm-ease-in-out</code>
              <span>cubic-bezier(.65, 0, .35, 1) — reversible state</span>
            </div>
            <div>
              <code>--umm-ease-spring</code>
              <span>cubic-bezier(.34, 1.4, .64, 1) — nodes and dots</span>
            </div>
            <div>
              <code>--umm-dur-fast / --umm-dur / --umm-dur-slow</code>
              <span>200ms / 420ms / 720ms</span>
            </div>
            <div>
              <code>--umm-dur-draw</code>
              <span>1400ms — the hero path drawing itself</span>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="marquee" title="Marquee" intro="Decorative, hidden from assistive technology, pauses on hover, stops under reduced motion.">
          <div className="sg-bleed">
            <Marquee
              items={[
                'Customer research',
                'Journey mapping',
                'Service design',
                'Usability testing',
                'UX strategy',
              ]}
              duration={30}
            />
          </div>
        </Section>
      </div>

      <footer className="sg-footer" data-umm-theme="ink">
        <div className="umm-container">
          <p>UMM Design System · Experience Design / CX</p>
          <a href="/">Back to the service page →</a>
        </div>
      </footer>
    </div>
  )
}
