import { useLayoutEffect, useRef } from 'react'
import '@/styles/ai-apps.css'
import { FlyArrow } from '@/components/primitives'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { engagement } from '@/content/aiAutomation'

export type EngagementContent = typeof engagement

/** Off-site links open in a new tab. */
const offSite = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})

/* ============================================================================
   7 · CHOOSE A STARTING POINT — four ways in, one place to go

   The page ends its argument on four smaller, lower-commitment steps: an
   assessment, a proof of value, a build, or ongoing support. They sit on a
   neutral grey so they read as options rather than products, and each one
   takes its pastel only when the visitor points at it. All four lead to the
   same conversation, so the cards are doors, not a comparison.

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
      const cards = gsap.utils.toArray<HTMLElement>('.ai-engage__card', root)
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
      <div className="ai-engage__grid">
        {content.items.map((item) => (
          <a
            key={item.title}
            className="ai-engage__card"
            href={content.href}
            data-umm-tone={item.tone}
            {...offSite(content.href)}
          >
            <h4 className="ai-engage__name">{item.title}</h4>
            <p className="ai-engage__body">{item.body}</p>
            <FlyArrow size={16} className="ai-engage__arrow" />
          </a>
        ))}
      </div>
    </div>
  )
}
