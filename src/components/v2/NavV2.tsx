import { useEffect, useRef, useState } from 'react'
import { IconClose, IconMenu } from '../icons'
import { FlyArrow } from '../primitives'
import { nav as cxNav } from '@/content/cxUiDesign'

export type NavContent = typeof cxNav

/* ============================================================================
   NAV — a floating pill

   Wordmark, five section links and one call to action, held in a single
   frosted pill that floats over the page. It tightens once the reader leaves
   the top, and hides while scrolling down so it never sits over a headline,
   coming back the moment the reader scrolls up.
   ========================================================================== */

/* Every service page, in the pill's menu (Krish, 15 Oct: "add the links to
   the navbar so that we can directly check from there"), the open one
   marked; on phones they close the sheet. */
const PAGES = [
  { href: '/', label: 'CX & UI Design' },
  { href: '/ai-automation', label: 'AI & Automation' },
  { href: '/cloud-data', label: 'Cloud & Data' },
  { href: '/digital-engineering', label: 'Digital Engineering' },
  { href: '/integrated-growth', label: 'Integrated Growth & Strategy' },
  { href: '/ux-digital-commerce', label: 'UX & Digital Commerce' },
]

/* 17 Oct, Krish: "for now remove the pages from navbar"; each page is shared
   by its own link. Set true to bring the menu back. */
const SHOW_PAGES = false

export function NavV2({ items: nav = cxNav }: { items?: NavContent }) {
  const here = typeof window === 'undefined' ? '/' : window.location.pathname.replace(/\/$/, '') || '/'
  const others = PAGES.filter((p) => p.href !== here)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  /* the pages menu closes on Escape, or a click anywhere outside it */
  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [menu])

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

        {SHOW_PAGES && (
          <div className="cx-nav__pages" ref={menuRef}>
            <button
              type="button"
              className="cx-nav__page"
              aria-expanded={menu}
              aria-controls="cx-nav-pages"
              onClick={() => setMenu((v) => !v)}
            >
              All services
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M3 4.5 6 7.5 9 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <ul className="cx-nav__menu" id="cx-nav-pages" hidden={!menu}>
              {PAGES.map((p) => (
                <li key={p.href}>
                  <a href={p.href} aria-current={p.href === here ? 'page' : undefined} onClick={() => setMenu(false)}>
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

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
            <span>{String(nav.length + 1).padStart(2, '0')}</span>
            Let&rsquo;s talk
          </a>
          {SHOW_PAGES &&
            others.map((p, i) => (
              <a key={p.href} href={p.href} onClick={() => setOpen(false)}>
                <span>{String(nav.length + 2 + i).padStart(2, '0')}</span>
                {p.label}
              </a>
            ))}
        </nav>
      </div>
    </header>
  )
}
