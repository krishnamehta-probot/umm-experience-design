import { useLayoutEffect, useRef } from 'react'
import { ChipHead, withAccent } from './ChipHead'
import { Shape } from './Shape'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { tools } from '@/content/cxUiDesign'

/* ============================================================================
   6b · THE TOOLS WHEEL — ported from the AI & Automation artifact

   Santosh approved this section's content as it stands, so the words are v1's
   "systems you already have" untouched; the form is the artifact's option
   wheel. The six groups curve down the left on an arc: the one on the line is
   forward and full size while its neighbours tilt back and fade. The
   section's own pinned scrub drives it, so the page still scrolls normally,
   and the box on the right carries that group's claim and its tools as a
   register (equal rows that fill the box whether there are two tools or
   seven), over the group's shape as a watermark.

   Clicking a group scrolls to where that group sits, so the control and the
   scrollbar can never disagree about which one is showing.
   ========================================================================== */

export function ToolsWheel() {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const section = ref.current
    if (!section) return
    const pin = section.querySelector<HTMLElement>('.cx-tools__pin')!
    const opts = Array.from(section.querySelectorAll<HTMLButtonElement>('.cx-wheel__o'))
    const panes = Array.from(section.querySelectorAll<HTMLElement>('.cx-pane'))
    const N = opts.length
    const reduce = prefersReducedMotion()

    let cur = -1
    const select = (n: number) => {
      if (n === cur) return
      cur = n
      opts.forEach((o, k) => {
        o.classList.toggle('is-on', k === n)
        o.setAttribute('aria-pressed', String(k === n))
      })
      panes.forEach((p, k) => (p.hidden = k !== n))
      if (reduce) return
      gsap.fromTo(
        panes[n].querySelectorAll('.cx-pane__rows li'),
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.5, stagger: 0.055, ease: 'power2.inOut', overwrite: true, clearProps: 'clipPath' },
      )
      gsap.fromTo(
        panes[n].querySelector('.cx-pane__mark'),
        { opacity: 0, scale: 0.86 },
        { opacity: 0.16, scale: 1, duration: 0.7, ease: 'power3.out', overwrite: true, clearProps: 'transform' },
      )
    }

    /* The arc. Every value is a function of d, how many places an option sits
       from the line, and d is fractional, so the wheel turns continuously
       rather than stepping through six states. */
    let STEP = 56
    const CURVE = 30
    const TILT = 9
    const REACH = 3.2
    const measure = () => {
      const h = section.querySelector<HTMLElement>('.cx-wheel')!.clientHeight
      STEP = Math.max(38, Math.min(74, h / 6.2))
    }
    const place = (f: number) => {
      opts.forEach((o, k) => {
        const d = k - f
        const ad = Math.abs(d)
        const c = Math.min(ad, REACH)
        gsap.set(o, {
          yPercent: -50,
          y: Math.sign(d) * c * STEP,
          x: Math.pow(c, 1.35) * CURVE,
          rotateX: -d * TILT,
          scale: 1 - Math.min(0.4, ad * 0.13),
          opacity: ad > REACH ? 0 : Math.max(0.13, 1 - ad * 0.3),
          force3D: true,
        })
      })
    }

    const clicks: Array<() => void> = []
    const ctx = gsap.context(() => {
      measure()
      if (reduce || window.innerWidth < 900) {
        place(0)
        select(0)
        opts.forEach((o, n) => {
          const fn = () => {
            place(n)
            select(n)
          }
          o.addEventListener('click', fn)
          clicks.push(() => o.removeEventListener('click', fn))
        })
        return
      }

      const st = ScrollTrigger.create({
        trigger: pin,
        start: 'center center',
        end: () => '+=' + Math.round(window.innerHeight * 1.7),
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
        onRefresh: () => {
          measure()
          place(cur < 0 ? 0 : cur)
        },
        onUpdate: (self) => {
          const f = self.progress * (N - 1)
          place(f)
          select(Math.round(f))
        },
      })

      opts.forEach((o, n) => {
        const fn = () =>
          window.scrollTo({ top: st.start + (st.end - st.start) * (n / (N - 1)), behavior: 'smooth' })
        o.addEventListener('click', fn)
        clicks.push(() => o.removeEventListener('click', fn))
      })

      place(0)
      select(0)
    }, section)

    return () => {
      clicks.forEach((off) => off())
      ctx.revert()
    }
  }, [])

  return (
    <section className="cx-tools" id="tools" ref={ref}>
      <div className="cx-tools__pin">
        <div className="umm-container">
          <div className="cx-head cx-head--tight">
            <ChipHead
              line1={tools.line1}
              line2={withAccent(tools.line2, tools.accent)}
              chip={tools.chip}
              tone="citrus"
              chipAt="48%"
              tilt={-8}
              lineRecipe={5}
              chipRecipe={2}
            />
            <p className="cx-lead">{tools.lead}</p>
          </div>

          <div className="cx-tools__body">
            <div className="cx-wheel">
              <ul className="cx-wheel__list">
                {tools.groups.map((g) => (
                  <li key={g.label}>
                    <button type="button" className="cx-wheel__o" data-umm-tone={g.tone} aria-pressed="false">
                      {g.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cx-panes">
              {tools.groups.map((g, i) => (
                <div className="cx-pane" key={g.label} data-umm-tone={g.tone} hidden={i !== 0}>
                  <Shape name={g.shape} className="cx-pane__mark" />
                  <p className="cx-pane__role">{g.role}</p>
                  <p className="cx-pane__claim">{g.claim}</p>
                  <ul className="cx-pane__rows">
                    {g.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <p className="cx-tools__note">{tools.note}</p>
        </div>
      </div>
    </section>
  )
}
