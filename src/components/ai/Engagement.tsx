import { useLayoutEffect, useRef } from 'react'
import '@/styles/ai-apps.css'
import { FlyArrow } from '@/components/primitives'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { measurePeel, sheetPath } from '@/lib/cornerPeel'
import { engagement } from '@/content/aiAutomation'

export type EngagementContent = typeof engagement

/** Off-site links open in a new tab. */
const offSite = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})

/* ============================================================================
   7 · CHOOSE A STARTING POINT — four ways in, one place to go

   The page ends its argument on four smaller, lower-commitment steps: an
   assessment, a proof of value, a build, or ongoing support. All four lead
   to the same conversation, so the cards are doors, not a comparison.

   Krish, 14 Oct: on white, and in the service cards' design (ServicesV2):
   each card its pastel, the number in mono, the title and its line, and
   the bitten corner with the black round arrow. The bite is the same
   outline (lib/cornerPeel); these cards do not turn over, the whole card
   is the link.

   Sits between the process roadmap and the dark closing band, under its own
   hairline. The cards rise in once, as the block scrolls into view. Reduced
   motion: no motion, the cards simply sit in place.
   ========================================================================== */

export function Engagement({ content = engagement }: { content?: EngagementContent }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.ai-door', root)
      gsap.set(cards, { y: 24, opacity: 0 })
      ScrollTrigger.create({
        trigger: root,
        start: 'top 82%',
        once: true,
        onEnter: () => gsap.to(cards, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12 }),
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div className="umm-container ai-engage" ref={ref}>
      <h3 className="ai-engage__title">{content.title}</h3>
      <ul className="ai-engage__grid">
        {content.items.map((item, i) => (
          <Door key={item.title} item={item} index={i} href={content.href} />
        ))}
      </ul>
    </div>
  )
}

type Item = EngagementContent['items'][number]

/** One way in: a service card's face, its bitten corner and black arrow. */
function Door({ item, index, href }: { item: Item; index: number; href: string }) {
  const sheet = useRef<HTMLSpanElement>(null)
  const bite = useRef<HTMLSpanElement>(null)

  /* the bitten outline, measured as the service cards measure theirs */
  useLayoutEffect(() => {
    const el = sheet.current
    const b = bite.current
    if (!el || !b) return
    const draw = () => {
      const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24
      const g = measurePeel(el.offsetWidth, el.offsetHeight, r, b.offsetWidth)
      el.style.clipPath = `path("${sheetPath(g)}")`
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <li className="ai-door" data-umm-tone={item.tone}>
      <a className="ai-door__link" href={href} {...offSite(href)}>
        <span className="ai-door__sheet" ref={sheet}>
          <span className="ai-door__index">{String(index + 1).padStart(2, '0')}</span>
          <span className="ai-door__title">{item.title}</span>
          <span className="ai-door__body">{item.body}</span>
        </span>
        <span className="ai-door__bite" ref={bite} aria-hidden="true">
          <span className="ai-door__go">
            <FlyArrow size={20} strokeWidth={2.2} />
          </span>
        </span>
      </a>
    </li>
  )
}
