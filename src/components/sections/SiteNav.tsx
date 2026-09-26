import { useEffect, useState } from 'react'
import { IconArrowDownRight, IconClose, IconMenu } from '../icons'
import { nav } from '@/content/experienceDesign'

/**
 * Sticky masthead. Condenses once the reader leaves the hero so the page
 * gains a quiet frame without stealing height from the content.
 */
export function SiteNav() {
  const [condensed, setCondensed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile sheet on Escape, and lock the page behind it.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className="umm-nav" data-condensed={condensed}>
      <div className="umm-nav__inner">
        <a className="umm-wordmark" href="#top" aria-label="Unified Modern Minds — home">
          <span className="umm-wordmark__mark">UMM</span>
          <span className="umm-wordmark__full">
            Unified
            <br />
            Modern Minds
          </span>
        </a>

        <nav className="umm-nav__links" aria-label="Section navigation">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="umm-btn umm-btn--sm umm-nav__cta" href="#contact">
          Discuss your CX project
          <IconArrowDownRight size={17} />
        </a>

        <button
          type="button"
          className="umm-nav__toggle"
          aria-expanded={menuOpen}
          aria-controls="umm-mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>
      </div>

      <div className="umm-nav__sheet" id="umm-mobile-menu" data-open={menuOpen} hidden={!menuOpen}>
        <nav aria-label="Section navigation">
          {nav.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
              style={{ '--i': i } as React.CSSProperties}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="umm-btn umm-nav__sheet-cta"
          href="#contact"
          onClick={() => setMenuOpen(false)}
        >
          Discuss your CX project
          <IconArrowDownRight size={18} />
        </a>
      </div>
    </header>
  )
}
