import { useLayoutEffect, useRef, useState } from 'react'
import type { IconName } from '../icons'
import { iconRegistry } from '../icons'

export type TabItem = {
  id: string
  label: string
  icon?: IconName
}

/**
 * Tab strip implementing the WAI-ARIA tabs pattern: arrow keys move between
 * tabs, Home/End jump to the ends, and only the selected tab sits in the tab
 * order so the keyboard does not have to walk every option to move past.
 *
 * `idBase` is supplied by the caller rather than generated, so the matching
 * <TabPanel> can point back at the correct tab for its accessible name.
 *
 * The selected state is a single pill that travels between tabs rather than a
 * background switching off one and on another. It is measured from the live
 * buttons — the labels are different lengths, so the pill has to change width
 * as it moves, and no static rule can know by how much.

 */
export function Tabs({
  idBase,
  items,
  value,
  onChange,
  label,
}: {
  idBase: string
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  label: string
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number } | null>(
    null,
  )

  useLayoutEffect(() => {
    const host = listRef.current
    if (!host) return
    const read = () => {
      const btn = host.querySelector<HTMLElement>('[aria-selected="true"]')
      if (!btn) return
      const a = host.getBoundingClientRect()
      const b = btn.getBoundingClientRect()
      setPill({ x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height })
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(host)
    /* The strip is scrollable on small screens, and the display face loads
       late — both move the tabs under the pill. */
    host.addEventListener('scroll', read, { passive: true })
    document.fonts?.ready.then(read)
    return () => {
      ro.disconnect()
      host.removeEventListener('scroll', read)
    }
  }, [value, items])

  const focusTab = (index: number) => {
    const next = (index + items.length) % items.length
    onChange(items[next].id)
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons?.[next]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusTab(index + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusTab(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(0)
        break
      case 'End':
        event.preventDefault()
        focusTab(items.length - 1)
        break
    }
  }

  return (
    <div className="umm-tabs" role="tablist" aria-label={label} ref={listRef}>
      {pill ? (
        <span
          className="umm-tabs__pill"
          aria-hidden="true"
          style={{
            transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
            width: pill.w,
            height: pill.h,
          }}
        />
      ) : null}

      {items.map((item, i) => {
        const selected = item.id === value
        const Glyph = item.icon ? iconRegistry[item.icon] : null
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${idBase}-tab-${item.id}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            className="umm-tabs__tab"
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {Glyph ? <Glyph size={17} /> : null}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  idBase,
  id,
  children,
}: {
  idBase: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${id}`}
      aria-labelledby={`${idBase}-tab-${id}`}
      tabIndex={0}
    >
      {children}
    </div>
  )
}
