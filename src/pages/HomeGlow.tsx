import { useMemo, useState } from 'react'
import { asciiChips, homeHero, homeNav, rage as rageSite } from '@/content/home'
import { IconArrowUpRight } from '@/components/icons'
import { Dock } from '@/components/home/Dock'
import { Seg, type VersionProps } from '@/components/home/LiveHero'
import { usePeek } from '@/components/home/usePeek'
import { useRage } from '@/components/home/useRage'
import { GLOW_FRAG, Wash, mixRGB, rgbOf, type RGB } from '@/components/home/Wash'
import logo from '@/assets/home/umm-logo.svg'
import '@/styles/home-glow.css'

/* ============================================================================
   HOME · GLOW — the live hero's content in the styling of Krish's Stacks
   reference

   Krish, 14 Oct: the styling only, "not the exact thing, as we need those 6
   options", brand fonts only, and a shader behind that is barely
   interactive. So: the homepage's headline, ask bar and six questions, set
   the Stacks way (a pale page with faint ruled sides, a pill above a very
   large centred headline, small-caps labels and pill buttons) over a WebGL
   glow of one brand pastel rising from the bottom to a deep core of the same
   colour. The glow breathes on its own and leans a few percent toward the
   pointer, eased over seconds. Every question goes to RAGe.
   ========================================================================== */

export type GlowTone = 'citrus' | 'sky' | 'blossom' | 'sun' | 'coral'

const TONES: { id: GlowTone; label: string; hint: string }[] = [
  { id: 'citrus', label: 'Citrus', hint: 'A lime glow with a deep green heart, closest to the reference.' },
  { id: 'sky', label: 'Sky', hint: 'A light blue glow with a deep navy heart.' },
  { id: 'blossom', label: 'Blossom', hint: 'A pink glow with a deep plum heart.' },
  { id: 'sun', label: 'Sun', hint: 'A warm yellow glow with a deep amber heart.' },
  { id: 'coral', label: 'Coral', hint: 'A salmon glow with a deep red heart.' },
]

/** the dark each glow deepens to at its heart */
const DEEP: Record<GlowTone, RGB> = {
  citrus: [0.03, 0.09, 0.05],
  sky: [0.03, 0.06, 0.17],
  blossom: [0.15, 0.03, 0.12],
  sun: [0.16, 0.09, 0.0],
  coral: [0.16, 0.03, 0.03],
}

const PAPER = '#f8f8f6'

export function HomeGlow({ switcher }: VersionProps) {
  const rage = useRage({ leave: 1300 })
  const [opts, setOpts] = useState<{ tone: GlowTone }>({ tone: 'citrus' })
  const { shown, peekOf } = usePeek(opts)
  const colors = useMemo((): [string, string, RGB] => {
    const tone = rgbOf(`var(--umm-${shown.tone})`)
    return [PAPER, `var(--umm-${shown.tone})`, mixRGB(DEEP[shown.tone], tone, 0.3)]
  }, [shown.tone])

  return (
    <main className="hg" data-umm-tone={shown.tone} data-phase={rage.phase}>
      <Wash frag={GLOW_FRAG} colors={colors} className="hg__wash" />
      <div className="hg__lines" aria-hidden="true" />

      <header className="hg-nav">
        <a className="hg-nav__logo" href="/" aria-label="UMM, home">
          <img src={logo} alt="" width={1553} height={460} />
        </a>
        <nav className="hg-nav__links" aria-label="Main">
          {homeNav.links.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="hg-btn hg-btn--ink hg-btn--sm" href={homeNav.cta.href}>
          {homeNav.cta.label}
        </a>
      </header>

      <section className="hg__hero">
        <a className="hg-pill" href="https://umm.digital/rage/">
          <span className="hg-pill__orb" aria-hidden="true" />
          <span>{rageSite.tagline}</span>
        </a>
        <h1 className="hg__title">
          <span>{homeHero.title[0]}</span>
          <span>{homeHero.title[1]}</span>
        </h1>
        <ul className="hg__pillars" aria-label="What we do">
          {homeHero.pillars.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <form
          className="hg-ask"
          onSubmit={(e) => {
            e.preventDefault()
            if (rage.phase === 'idle') rage.go(rage.value, { typed: true })
          }}
        >
          <label className="hm-sr" htmlFor="hg-ask">
            {homeHero.placeholder}
          </label>
          <input
            id="hg-ask"
            value={rage.value}
            placeholder={homeHero.placeholder}
            autoComplete="off"
            readOnly={rage.phase !== 'idle'}
            onChange={(e) => rage.setValue(e.target.value)}
          />
          <button type="submit" className="hg-btn hg-btn--ink">
            Ask RAGe
          </button>
        </form>

        <ul className="hg-chips" aria-label="Ask RAGe">
          {asciiChips.map((c) => (
            <li key={c.q}>
              <button type="button" className="hg-chip" disabled={rage.busy} onClick={() => rage.go(c.q)}>
                <span>{c.q}</span>
                <IconArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Dock>
        {switcher}
        <Seg label="Colour" items={TONES} value={opts.tone} onPick={(t) => setOpts({ tone: t })} onPeek={peekOf('tone')} />
      </Dock>
    </main>
  )
}
