import { useState, type ReactNode } from 'react'

/** The options dock, for the versions that bring their own hero layout
 *  (Glow, Blush): the same look and toggle as LiveHero's. */
export function Dock({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(() => window.innerWidth >= 900)
  return (
    <aside className="ha-dock" data-open={open} aria-label="Hero options">
      <button type="button" className="ha-dock__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide options' : 'Options'}
      </button>
      {open && <div className="ha-dock__body">{children}</div>}
    </aside>
  )
}
