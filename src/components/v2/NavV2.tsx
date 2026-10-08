import { useEffect, useState } from 'react'
import { IconClose, IconMenu } from '../icons'
import { FlyArrow } from '../primitives'
import { nav } from '@/content/cxUiDesign'

/* ============================================================================
   NAV — a floating pill

   Wordmark, five section links and one call to action, held in a single
   frosted pill that floats over the page. It tightens once the reader leaves
   the top, and hides while scrolling down so it never sits over a headline,
   coming back the moment the reader scrolls up.
   ========================================================================== */

export function NavV2() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      /* A few pixels of hysteresis so a trackpad's jitter cannot flicker it. */
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240)
        last = y
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="cx-nav" data-scrolled={scrolled} data-hidden={hidden && !open}>
      <div className="cx-nav__pill">
        <a className="cx-nav__logo" href="#top" aria-label="Unified Modern Minds, back to top">
          umm
        </a>

        <nav className="cx-nav__links" aria-label="Sections">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="cx-nav__cta" href="#contact">
          Let&rsquo;s talk
          <span className="cx-nav__dot" aria-hidden="true">
            <FlyArrow size={14} strokeWidth={2} />
          </span>
        </a>

        <button
          type="button"
          className="cx-nav__toggle"
          aria-expanded={open}
          aria-controls="cx-nav-sheet"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose size={20} /> : <IconMenu size={20} />}
        </button>
      </div>

      <div className="cx-nav__sheet" id="cx-nav-sheet" hidden={!open}>
        <nav aria-label="Sections">
          {nav.map((item, i) => (
            <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)}>
            <span>06</span>
            Let&rsquo;s talk
          </a>
        </nav>
      </div>
    </header>
  )
}
