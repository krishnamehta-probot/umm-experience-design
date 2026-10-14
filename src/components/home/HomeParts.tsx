import { useEffect, useRef, type ReactNode } from 'react'
import { IconArrowUpRight } from '../icons'
import { SplitButton } from '../primitives'
import { homeHero, homeNav } from '@/content/home'
import type { Rage } from './useRage'
import logo from '@/assets/home/umm-logo.svg'

/* ============================================================================
   HOME PARTS — the pieces every hero version shares: the site nav, the ask
   bar, the headline and the four-pillar row.
   ========================================================================== */

function Spark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 2c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Zm8 11c.3 2.3 1.2 3.2 3.5 3.5-2.3.3-3.2 1.2-3.5 3.5-.3-2.3-1.2-3.2-3.5-3.5 2.3-.3 3.2-1.2 3.5-3.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function HomeNav() {
  return (
    <header className="hm-nav">
      <a className="hm-nav__logo" href="/" aria-label="UMM, home">
        <img src={logo} alt="" width={1553} height={460} />
      </a>
      <nav className="hm-nav__links" aria-label="Main">
        {homeNav.links.map((l) => (
          <a key={l.label} href={l.href}>
            {l.spark && <Spark />}
            {l.label}
          </a>
        ))}
      </nav>
      <SplitButton className="hm-nav__cta" href={homeNav.cta.href}>
        {homeNav.cta.label}
      </SplitButton>
    </header>
  )
}

export function AskBar({
  rage,
  className = '',
  barRef,
}: {
  rage: Rage
  className?: string
  barRef?: React.Ref<HTMLFormElement>
}) {
  return (
    <form
      ref={barRef}
      className={`hm-ask ${className}`.trim()}
      data-phase={rage.phase}
      onSubmit={(e) => {
        e.preventDefault()
        if (rage.phase === 'idle') rage.go(rage.value, { typed: true })
      }}
    >
      <label className="hm-sr" htmlFor="hm-ask-input">
        {homeHero.placeholder}
      </label>
      <input
        id="hm-ask-input"
        className="hm-ask__input"
        value={rage.value}
        placeholder={homeHero.placeholder}
        autoComplete="off"
        readOnly={rage.phase !== 'idle'}
        onChange={(e) => rage.setValue(e.target.value)}
      />
      <button type="submit" className="hm-ask__go" aria-label="Ask RAGe">
        <IconArrowUpRight size={18} strokeWidth={2} />
      </button>
    </form>
  )
}

export function Pillars({ className = '' }: { className?: string }) {
  return (
    <ul className={`hm-pillars ${className}`.trim()}>
      {homeHero.pillars.map((p) => (
        <li key={p}>{p} /</li>
      ))}
    </ul>
  )
}

export function Title({ className = '', children }: { className?: string; children?: ReactNode }) {
  return (
    <h1 className={`hm-title ${className}`.trim()}>
      <span>{homeHero.title[0]}</span>
      <span>{homeHero.title[1]}</span>
      {children}
    </h1>
  )
}

/** Runs a scene class for the lifetime of a canvas. */
export function useScene<T extends { dispose(): void }>(
  make: (canvas: HTMLCanvasElement) => T,
): [React.RefObject<HTMLCanvasElement | null>, React.RefObject<T | null>] {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<T>(null)
  useEffect(() => {
    if (!canvas.current) return
    const s = make(canvas.current)
    scene.current = s
    return () => {
      s.dispose()
      scene.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [canvas, scene]
}
