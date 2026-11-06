import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { work } from '@/content/fintech'
import { Arrow, pad } from '../glass/kit'
import '@/styles/fin-final-work.css'

/* ============================================================================
   THE FINAL FINTECH PAGE — 06 · RELEVANT WORK (Krish, 6 Nov: "check if you
   can do something like this", Framer's ImageScroller)

   After that component: the section is as many screens tall as it has cases,
   and one screen of it stays pinned while you scroll through. Each case takes
   the panel in turn: its poster becomes the ground (blurred, settling from a
   little larger as it fades in), its site floats on the right, and its words
   change a beat after the picture, as the reference's caption does. A dock of
   thumbnails sits at the foot, a white outline gliding to the case in view on
   a spring; a thumbnail scrolls to its case. A hairline along the dock shows
   how far through the set you are.

   The heading stays at the top of the pinned screen, as in the sections
   above. The posters are the case-study page's; the sites are the page's own
   images. The copy is the final copy.
   ========================================================================== */

const POSTER: Record<string, string> = {
  'Lyca Remit': '/casestudies/lycaremit.webp',
  Fintuit: '/casestudies/fintuit.webp',
  Belfrics: '/casestudies/belfrics.webp',
}

export function FinalWork() {
  const c = work
  const n = c.cases.length
  const host = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)

  /* the case in view follows the scroll through the section */
  useEffect(() => {
    const el = host.current
    if (!el) return
    let raf = 0
    const read = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const total = Math.max(1, r.height - window.innerHeight)
      const p = Math.min(1, Math.max(0, -r.top / total))
      stage.current?.style.setProperty('--sp', p.toFixed(4))
      const k = Math.min(n - 1, Math.floor(p * n))
      setI((v) => (v === k ? v : k))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [n])

  const jump = (k: number) => {
    const el = host.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const total = el.offsetHeight - window.innerHeight
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: top + (k / Math.max(1, n - 1)) * total, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <section id={c.id} ref={host} className="fw" style={{ '--n': n } as CSSProperties} aria-labelledby="fw-title">
      <div className="fw__pin">
        <div className="fr__top">
          <div className="fr__head">
            <p className="ff-eyebrow">{c.head.eyebrow}</p>
            <h2 id="fw-title" className="fr__title">
              <span>{c.head.lines[0]}</span>
              <span>
                <span className="ff-blue">{c.head.lines[1]}</span>
              </span>
            </h2>
          </div>
          <p className="fr__lead">{c.head.intro}</p>
        </div>

        <div ref={stage} className="fw__stage">
          {/* the grounds */}
          {c.cases.map((x, k) => (
            <div key={x.name} className="fw__bg" data-on={k === i || undefined} data-umm-tone={x.tone}>
              <img src={POSTER[x.name]} alt="" loading="lazy" decoding="async" />
            </div>
          ))}
          <span className="fw__shade" aria-hidden="true" />

          {/* the sites */}
          <div className="fw__shots">
            {c.cases.map((x, k) => (
              <img
                key={x.name}
                className="fw__shot"
                data-on={k === i || undefined}
                data-past={k < i || undefined}
                src={x.image}
                alt={x.alt}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>

          {/* the words, a beat after the picture */}
          <div className="fw__copy">
            {c.cases.map((x, k) => (
              <article
                key={x.name}
                className="fw__case"
                data-on={k === i || undefined}
                aria-hidden={k !== i}
                inert={k !== i}
              >
                <p className="fw__tag">
                  <span>
                    {pad(k)} / {pad(n - 1)}
                  </span>
                  {x.tag}
                </p>
                <h3 className="fw__name">{x.name}</h3>
                <p className="fw__title">{x.title}</p>
                <p className="fw__body">{x.body}</p>
                <p className="fw__role">
                  <b>{c.roleLabel}</b>
                  {x.role}
                </p>
                <a className="fw__cta" href={x.href} target="_blank" rel="noreferrer">
                  <span>{c.read}</span>
                  <i>
                    <Arrow />
                  </i>
                </a>
              </article>
            ))}
          </div>

          {/* the dock */}
          <div className="fw__dock" style={{ '--i': i } as CSSProperties}>
            <div className="fw__thumbs">
              <span className="fw__outline" aria-hidden="true" />
              {c.cases.map((x, k) => (
                <button
                  key={x.name}
                  type="button"
                  className="fw__thumb"
                  aria-current={k === i || undefined}
                  aria-label={`${c.view}: ${x.name}`}
                  onClick={() => jump(k)}
                >
                  <img src={POSTER[x.name]} alt="" decoding="async" />
                </button>
              ))}
            </div>
            <span className="fw__track" aria-hidden="true">
              <i />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
