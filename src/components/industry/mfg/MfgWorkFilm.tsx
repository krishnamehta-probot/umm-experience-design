import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { SplitButton } from '@/components/primitives'
import { work } from '@/content/manufacturing'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { pad } from '../glass/kit'
import { Head } from './Head'
import '@/styles/fin-final-work.css'
import '@/styles/mfg-work-film.css'

/* ============================================================================
   THE MANUFACTURING PAGE — 06 · RELEVANT WORK, the final version (Krish,
   16 Nov: none of the three options; "make a single final one whatever you
   feel will be best… you only choose on your own")

   "Manufacturing work you can see", taken at its word: the work itself, in
   the films of UMM's own case studies. Built on the Fintech page's work
   section, the one he signed off (FinalWork, after Framer's ImageScroller),
   so the industry pages share it:

     the section is as many screens tall as it has engagements and one
     screen of it stays pinned; each engagement takes the stage in turn
     ground    its case-study poster, Mohawk's own red, blurred and settling
               from a little larger as it fades in
     right     its film playing (the ReCover site, the Pricing app, the
               Benefits site), floating on the ground; only the one in view
               plays, and only while the section is on screen
     left      its words, a beat after the picture: what it is, what UMM
               did, UMM's role, and one action, UMM's own button
     top       Mohawk's mark in white, the featured manufacturer
     dock      a still from each film; the white outline glides to the one
               in view, a hairline shows how far through, a still jumps to
               its engagement

   The films are the case films re-cut at 720p without sound, starting on
   the work (public/industry/manufacturing/). The options before this one
   stay reachable: ?work=swatch | loop | carpet | red | ink.
   ========================================================================== */

export function MfgWorkFilm() {
  const c = work
  const n = c.cases.length
  const host = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const films = useRef<(HTMLVideoElement | null)[]>([])
  const [i, setI] = useState(0)
  const [seen, setSeen] = useState(false)
  const reduced = useReducedMotion()

  /* the engagement in view follows the scroll through the section */
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

  /* the films play only while the section is on screen */
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* only the film in view plays, from its start each time it arrives */
  useEffect(() => {
    films.current.forEach((v, k) => {
      if (!v) return
      if (k === i && seen && !reduced) {
        if (v.paused) v.play().catch(() => {})
      } else {
        v.pause()
        if (k !== i) v.currentTime = 0
      }
    })
  }, [i, seen, reduced])

  const jump = (k: number) => {
    const el = host.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const total = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + ((k + 0.5) / n) * total, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <section id={c.id} ref={host} className="fw mfw" style={{ '--n': n } as CSSProperties} aria-labelledby="mw-title">
      <div className="fw__pin">
        <Head id="mw-title" head={c.head} />

        <div ref={stage} className="fw__stage" data-umm-theme="ink">
          {/* the grounds: each engagement's poster, Mohawk's red */}
          {c.cases.map((x, k) => (
            <div key={x.name} className="fw__bg" data-on={k === i || undefined}>
              <img src={x.poster} alt="" loading="lazy" decoding="async" />
            </div>
          ))}
          <span className="fw__shade" aria-hidden="true" />

          <p className="mfw__brand">
            <img src={c.featured.logo} alt="Mohawk" />
            <span>{c.featured.eyebrow}</span>
          </p>

          {/* the films */}
          <div className="fw__shots mfw__films">
            {c.cases.map((x, k) => (
              <video
                key={x.name}
                ref={(el) => {
                  films.current[k] = el
                }}
                className="fw__shot mfw__film"
                data-on={k === i || undefined}
                data-past={k < i || undefined}
                src={x.film}
                poster={x.still}
                aria-label={x.alt}
                muted
                loop
                playsInline
                preload={k === 0 ? 'auto' : 'metadata'}
              />
            ))}
          </div>

          {/* the words, a beat after the picture */}
          <div className="fw__copy">
            {c.cases.map((x, k) => (
              <article key={x.name} className="fw__case" data-on={k === i || undefined} aria-hidden={k !== i} inert={k !== i}>
                <p className="fw__tag">
                  <span>
                    {pad(k)} / {pad(n - 1)}
                  </span>
                  {x.eyebrow}
                </p>
                <h3 className="fw__name">{x.name}</h3>
                <p className="fw__title">{x.title}</p>
                <p className="fw__body">{x.body}</p>
                <div className="mfw__role">
                  <b>{c.roleLabel}</b>
                  <ul>
                    {x.role.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
                <SplitButton className="mfw__go" href={x.href} target="_blank" rel="noopener">
                  {c.read}
                </SplitButton>
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
                  <img src={x.thumb} alt="" decoding="async" />
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
