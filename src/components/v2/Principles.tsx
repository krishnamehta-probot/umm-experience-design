import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { ChipHead, withAccent } from './ChipHead'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { principles } from '@/content/cxUiDesign'

/* ============================================================================
   6a · HOW WE DESIGN — five rules, each one you can watch working

   Laws of UX's card recipe (one solid pastel per card, shapes building in one
   after another), with Rive's idea on top: every rule has a tiny live demo
   that shows the rule fixing a design, and two of them you can play with
   (Rauno: state the rule, then let the reader try it).

     Colour with a reason     a washed-out button snaps to a readable one
     Made for thumbs          drag a thumb over the phone; the reach zone lights
     Fewer steps, every time  ten taps collapse into three
     Same look, everywhere    five mismatched buttons settle into one style
     Tested before it's built a prototype gets its ✓ stamped on

   The looping demos are CSS and only run while the section is on screen
   ([data-live]); under reduced motion they show their finished state.
   ========================================================================== */

function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, inView }
}

function ColourDemo({ live }: { live: boolean }) {
  const [on, setOn] = useState(true)
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (!live || touched || prefersReducedMotion()) return
    const id = window.setInterval(() => setOn((v) => !v), 2400)
    return () => window.clearInterval(id)
  }, [live, touched])
  return (
    <div className="cx-demo cx-demo--colour" data-on={on}>
      <span className="cx-demo__btn">Pay now</span>
      <button
        type="button"
        className="cx-demo__switch"
        role="switch"
        aria-checked={on}
        onClick={() => {
          setTouched(true)
          setOn((v) => !v)
        }}
      >
        <span className="cx-demo__knob" />
        <span className="cx-demo__label">{on ? 'Readable' : 'Washed out'}</span>
      </button>
    </div>
  )
}

function ThumbDemo() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  /* the easy zone is the arc a right thumb sweeps from the bottom corner */
  const easy = pos ? Math.hypot(100 - pos.x, 100 - pos.y) < 72 : false
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }
  return (
    <div className="cx-demo cx-demo--thumb">
      <div
        className="cx-demo__phone"
        data-easy={easy}
        data-touch={pos !== null}
        onPointerMove={move}
        onPointerDown={move}
        onPointerLeave={() => setPos(null)}
        role="img"
        aria-label="A phone screen showing the easy thumb-reach zone at the bottom right"
      >
        <span className="cx-demo__zone" />
        <span
          className="cx-demo__thumb"
          style={pos ? { left: `${pos.x}%`, top: `${pos.y}%` } : undefined}
        />
      </div>
      <span className="cx-demo__hint" aria-hidden="true">
        {pos ? (easy ? 'Easy reach ✓' : 'A stretch') : 'Try it: move over the phone'}
      </span>
    </div>
  )
}

function StepsDemo() {
  return (
    <div className="cx-demo cx-demo--steps" aria-hidden="true">
      <div className="cx-demo__dots">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="cx-demo__count">
        <span>10 taps</span>
        <span>3 taps</span>
      </div>
    </div>
  )
}

function SameDemo() {
  return (
    <div className="cx-demo cx-demo--same" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  )
}

function TestedDemo() {
  return (
    <div className="cx-demo cx-demo--tested" aria-hidden="true">
      <div className="cx-demo__proto">
        <i />
        <i />
        <i />
        <b />
      </div>
      <span className="cx-demo__stamp">Tested ✓</span>
    </div>
  )
}

export function Principles() {
  const { ref, inView } = useInView<HTMLElement>()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.cx-rule', {
        opacity: 0,
        y: 50,
        scale: 0.94,
        duration: 0.85,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cx-rules', start: 'top 80%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [ref])

  const demo = (id: string) => {
    switch (id) {
      case 'colour':
        return <ColourDemo live={inView} />
      case 'thumbs':
        return <ThumbDemo />
      case 'steps':
        return <StepsDemo />
      case 'same':
        return <SameDemo />
      default:
        return <TestedDemo />
    }
  }

  return (
    <section className="umm-section cx-rules-section" id="design" ref={ref} data-live={inView}>
      <div className="umm-container">
        <div className="cx-head">
          <ChipHead
            line1={principles.line1}
            line2={withAccent(principles.line2, principles.accent)}
            chip={principles.chip}
            tone="coral"
            chipAt="66%"
            tilt={-10}
            lineRecipe={2}
            chipRecipe={0}
          />
          <p className="cx-lead">{principles.lead}</p>
        </div>

        <ul className="cx-rules">
          {principles.items.map((rule, i) => (
            <li className="cx-rule" key={rule.id} data-umm-tone={rule.tone} data-rule={rule.id}>
              <div className="cx-rule__stage">{demo(rule.id)}</div>
              <span className="cx-rule__n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="cx-rule__title">{rule.title}</h3>
              <p className="cx-rule__body">{rule.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
