import { useEffect, useRef } from 'react'
import type { Tone } from '@/components/primitives'
import type { ShapeName } from '@/components/v2/shapes.data'
import { why as cloudWhy } from '@/content/cloudData'
import '@/styles/cloud-flavour.css'

/* ============================================================================
   CLOUD & DATA · THE CLOUD FLAVOUR

   16 Oct, review feedback relayed by Krish: each service page should carry
   its subject, so this one should feel like cloud and data throughout and
   read a little differently from the other service pages. The sections,
   their order and the scroll are unchanged. What changes, all of it from
   here and cloud-flavour.css, under html.cloud-flavour:

     - a blueprint dot grid behind the white sections
     - a data line down the left edge: a node for each section, a packet
       travelling down it as the page scrolls (wide screens)
     - every section label's mark is a small cloud
     - section 2's three numbers sit on a server rack, a database and a
       cloud; the cloud then opens into the film
     - the stages' picture is infrastructure that grows (StageLight "infra")
     - the service cards carry connector ports, as nodes on a diagram
     - the roadmap reads as a deployment pipeline: "Today" is "Deploy",
       with a status light, and the open stage's bar streams
     - the closing band has a network of nodes behind it, its lights blinking

   It was a trial: set CLOUD_FLAVOUR to false and the page is as it was.
   ========================================================================== */

export const CLOUD_FLAVOUR = true

/** Section 2's numbers on a rack, a database and a cloud. */
const WHY_SHAPES: { shape: ShapeName; tone: Tone }[] = [
  { shape: 'server-1', tone: 'citrus' },
  { shape: 'database-1', tone: 'coral' },
  { shape: 'cloud-1', tone: 'sky' },
]

export function flavourWhy(why: typeof cloudWhy): typeof cloudWhy {
  if (!CLOUD_FLAVOUR) return why
  return { ...why, pairs: why.pairs.map((p, i) => ({ ...p, ...WHY_SHAPES[i % WHY_SHAPES.length] })) }
}

/** The stages' picture. */
export const STAGE_LIGHT = CLOUD_FLAVOUR ? 'infra' : 'network'

/**
 * The data line: a thin rail down the left edge with a node where each
 * section starts. A packet runs down it with the scroll, and the nodes it has
 * passed light up. Wide screens only (there is no margin for it otherwise).
 */
export function DataLine({ ids }: { ids: string[] }) {
  const rail = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rail.current
    if (!el) return
    const nodes = [...el.querySelectorAll<HTMLElement>('.cf-line__node')]
    let stops: number[] = []
    let raf = 0

    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      stops = ids.map((id) => {
        const s = document.getElementById(id)
        const top = s ? s.getBoundingClientRect().top + window.scrollY : 0
        return Math.min(1, Math.max(0, top / max))
      })
      nodes.forEach((n, i) => n.style.setProperty('--at', String(stops[i] ?? 0)))
      update()
    }

    const update = () => {
      raf = 0
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, window.scrollY / max))
      el.style.setProperty('--p', String(p))
      nodes.forEach((n, i) => n.toggleAttribute('data-on', p >= (stops[i] ?? 0) - 0.002))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('load', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('load', measure)
      cancelAnimationFrame(raf)
    }
  }, [ids])

  return (
    <div className="cf-line" ref={rail} aria-hidden="true">
      <span className="cf-line__track" />
      <span className="cf-line__done" />
      {ids.map((id) => (
        <span key={id} className="cf-line__node" />
      ))}
      <span className="cf-line__packet" />
    </div>
  )
}
