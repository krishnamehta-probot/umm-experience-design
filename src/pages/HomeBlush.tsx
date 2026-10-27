import { useState } from 'react'
import { asciiChips, homeHero, homeNav, rage as rageSite } from '@/content/home'
import { IconArrowUpRight } from '@/components/icons'
import { Dock } from '@/components/home/Dock'
import { Seg, type VersionProps } from '@/components/home/LiveHero'
import { usePeek } from '@/components/home/usePeek'
import { useRage } from '@/components/home/useRage'
import { BLUSH_FRAG, Wash } from '@/components/home/Wash'
import logo from '@/assets/home/umm-logo.svg'
import '@/styles/home-blush.css'

/* ============================================================================
   HOME · BLUSH — the live hero's content in the styling of Krish's Hume
   reference

   Krish, 14 Oct: the styling only, with the six questions, brand fonts
   only, and a shader behind that is not interactive. So: the homepage's
   headline and the six questions, set the Hume way (an uppercase nav, a
   "new" pill, a centred headline, outlined pills, one big white rounded
   card as the ask box) over a WebGL wash of two brand pastels fading to
   cream, drifting like slow silk. A question picked writes itself into the
   card and goes to RAGe.
   ========================================================================== */

export type BlushWash = 'coral' | 'blossom' | 'sky' | 'citrus'

const WASHES: { id: BlushWash; label: string; hint: string; colors: [string, string] }[] = [
  { id: 'coral', label: 'Coral → Sun', hint: 'Salmon at the top warming to peach, closest to the reference.', colors: ['--umm-coral', '--umm-sun'] },
  { id: 'blossom', label: 'Blossom → Sky', hint: 'Pink at the top cooling to light blue.', colors: ['--umm-blossom', '--umm-sky'] },
  { id: 'sky', label: 'Sky → Citrus', hint: 'Light blue at the top turning to lime.', colors: ['--umm-sky', '--umm-citrus'] },
  { id: 'citrus', label: 'Citrus → Sun', hint: 'Lime at the top warming to yellow.', colors: ['--umm-citrus', '--umm-sun'] },
]

const CREAM = '#fffaf4'

function Chevron() {
  return (
    <svg className="hb-nav__chev" viewBox="0 0 12 12" aria-hidden="true">
      <path d="m3 4.5 3 3 3-3" />
    </svg>
  )
}

export function HomeBlush({ switcher }: VersionProps) {
  const rage = useRage({ leave: 1300 })
  const [opts, setOpts] = useState<{ wash: BlushWash }>({ wash: 'coral' })
  const { shown, peekOf } = usePeek(opts)
  const [a, b] = WASHES.find((w) => w.id === shown.wash)!.colors
  const ask = () => {
    if (rage.phase === 'idle') rage.go(rage.value, { typed: true })
  }

  return (
    <main className="hb" data-wash={shown.wash} data-phase={rage.phase}>
      <Wash frag={BLUSH_FRAG} colors={[`var(${a})`, `var(${b})`, CREAM]} />

      <header className="hb-nav">
        <a className="hb-nav__logo" href="/" aria-label="UMM, home">
          <img src={logo} alt="" width={1553} height={460} />
        </a>
        <nav className="hb-nav__links" aria-label="Main">
          {homeNav.links.map((l, i) => (
            <a key={l.label} href={l.href}>
              {l.label}
              {(i === 1 || i === 3) && <Chevron />}
            </a>
          ))}
        </nav>
        <a className="hb-btn" href={homeNav.cta.href}>
          {homeNav.cta.label}
        </a>
      </header>

      <section className="hb__hero">
        <a className="hb-pill" href="https://umm.digital/rage/">
          <span className="hb-pill__new">New</span>
          <span>{rageSite.tagline}</span>
        </a>
        <h1 className="hb__title">
          <span>{homeHero.title[0]}</span>
          <span>{homeHero.title[1]}</span>
        </h1>
        <ul className="hb__pillars" aria-label="What we do">
          {homeHero.pillars.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <ul className="hb-chips" aria-label="Ask RAGe">
          {asciiChips.map((c) => (
            <li key={c.q}>
              <button type="button" className="hb-chip" disabled={rage.busy} onClick={() => rage.go(c.q)}>
                {c.q}
              </button>
            </li>
          ))}
        </ul>

        <form
          className="hb-card"
          onSubmit={(e) => {
            e.preventDefault()
            ask()
          }}
        >
          <p className="hb-card__label">
            Ask RAGe
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="6.2" />
              <path d="M8 7.4v3.6M8 5.2v.01" />
            </svg>
          </p>
          <label className="hm-sr" htmlFor="hb-ask">
            {homeHero.placeholder}
          </label>
          <textarea
            id="hb-ask"
            className="hb-card__text"
            value={rage.value}
            placeholder={homeHero.placeholder}
            readOnly={rage.phase !== 'idle'}
            rows={2}
            onChange={(e) => rage.setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                ask()
              }
            }}
          />
          <div className="hb-card__foot">
            <button type="submit" className="hb-go" aria-label="Ask RAGe">
              <IconArrowUpRight size={20} strokeWidth={2} />
            </button>
          </div>
        </form>
      </section>

      <Dock>
        {switcher}
        <Seg label="Colour" items={WASHES} value={opts.wash} onPick={(w) => setOpts({ wash: w })} onPeek={peekOf('wash')} />
      </Dock>
    </main>
  )
}
