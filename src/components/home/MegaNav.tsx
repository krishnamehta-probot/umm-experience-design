import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { SplitButton } from '../primitives'
import { siteCta, siteMenu } from '@/content/home'
import logo from '@/assets/home/umm-logo.svg'
import '@/styles/mega-nav.css'

/* ============================================================================
   MEGA NAV — the live site's nav, copied (umm.digital, 28 Oct)

   The grey pill of five titles, a white pill sliding under whichever is
   pointed at, and below it that title's panel: wordmark and render on the
   left, the links beside. The live panels are 90% black over white glass;
   here (Krish, 28 Oct) they are the white glass alone.
   ========================================================================== */

export function MegaNav() {
  const [open, setOpen] = useState<number | null>(null)
  const menu = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLUListElement>(null)
  const [pill, setPill] = useState({ x: 0, w: 0 })
  const pointer = useRef('')

  const show = (i: number) => {
    const b = bar.current?.children[i] as HTMLElement | undefined
    if (b) setPill({ x: b.offsetLeft, w: b.offsetWidth })
    setOpen(i)
  }

  /* a tap or click anywhere else, or Escape, closes it */
  useEffect(() => {
    if (open === null) return
    const away = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node)) setOpen(null)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <header className="hm-nav mn">
      <a className="hm-nav__logo" href="/" aria-label="UMM, home">
        <img src={logo} alt="" width={1553} height={460} />
      </a>

      <div
        ref={menu}
        className="mn__menu"
        data-open={open !== null || undefined}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)}
        onBlur={(e) => !menu.current?.contains(e.relatedTarget as Node) && setOpen(null)}
      >
        <ul
          ref={bar}
          className="mn__bar"
          aria-label="Main"
          style={{ '--x': `${pill.x}px`, '--w': `${pill.w}px` } as CSSProperties}
        >
          {siteMenu.map((m, i) => (
            <li key={m.label}>
              <button
                type="button"
                className="mn__title"
                aria-expanded={open === i}
                aria-controls={`mn-panel-${i}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && show(i)}
                onPointerDown={(e) => (pointer.current = e.pointerType)}
                onClick={() => {
                  /* a mouse has already opened it by hovering; a tap or a key toggles */
                  if (pointer.current === 'mouse' && open === i) return
                  if (open === i) setOpen(null)
                  else show(i)
                  pointer.current = ''
                }}
              >
                {m.icon && <img className="mn__spark" src={m.icon} alt="" width={16} height={16} />}
                {m.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="mn__drop">
          {siteMenu.map((m, i) => (
            <div
              key={m.label}
              id={`mn-panel-${i}`}
              className="mn__panel"
              data-kind={m.kind}
              data-open={open === i || undefined}
              style={m.accent ? ({ '--accent': m.accent } as CSSProperties) : undefined}
            >
              <div className="mn__lead">
                <img className="mn__mark" src={m.mark} alt="" />
                <img className="mn__render" src={m.render} alt="" decoding="async" />
              </div>
              {m.cols.map((col, c) => (
                <ul key={c} className="mn__list">
                  {col.map((l) => (
                    <li key={l.label}>
                      <a className="mn__link" href={l.href}>
                        <span className="mn__icon">
                          <img src={l.icon} alt="" />
                        </span>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
              {m.card && (
                <a className="mn__card" href={m.card.href}>
                  <img src={m.card.img} alt={m.card.alt} decoding="async" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <SplitButton className="hm-nav__cta" href={siteCta.href} target="_blank" rel="noreferrer">
        {siteCta.label}
      </SplitButton>
    </header>
  )
}
