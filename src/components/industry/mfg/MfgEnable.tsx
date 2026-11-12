import type { CSSProperties } from 'react'
import { enable } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { MfgArt } from './MfgArt'
import { Head } from './Head'
import { scrollThrough, useProgress } from './hooks'

/* ============================================================================
   THE MANUFACTURING PAGE — 03 · WHAT UMM ENABLES

   The draft's order is the value chain's: procurement first, the four
   capabilities, revenue operations last. The section pins for a while and
   tells it in that order as the reader scrolls:

     left   the chain as a rail, 00 to 04: procurement, then the four
            capabilities, each filling as its card is dealt; revenue
            operations closing the flow at the foot, with the way on to the
            architecture
     right  the deck. Procurement is its first card (Krish, 12 Nov: the 00
            card no longer waits on the left for good; it is dealt like the
            rest), then each capability slides up over the last, which
            settles back a step behind it. Each card: its number, its
            words, and its drawing on the flat pastel, a scene that plays
            through (the material ordered, shipped and planned; the line
            running under its live view; the evidence joined into one
            release; the machine in the field calling its service; the data
            rising from edge to cloud)

   A click on the rail scrolls to that card. On a phone the deck is a plain
   list, unpinned.
   ========================================================================== */

const clamp = (v: number) => Math.min(1, Math.max(0, v))

type Card = {
  key: string
  k: string
  title: string
  sub: string
  points: readonly string[]
  art: string
  tone: string
}

export function MfgEnable() {
  const c = enable
  /* the deck: procurement first, then the four capabilities */
  const cards: Card[] = [
    { key: 'start', k: c.start.eyebrow, title: c.start.title, sub: c.start.body, points: [], art: 'material', tone: 'sun' },
    ...c.capabilities.map((x) => ({
      key: x.title,
      k: x.eyebrow.replace(/^\d+ \/ /, ''),
      title: x.title,
      sub: x.sub,
      points: x.points,
      art: x.art,
      tone: x.tone,
    })),
  ]
  const n = cards.length
  const { ref, p } = useProgress<HTMLElement>()
  /* 0 → n-1 across the pinned scroll, with a little rest at each end */
  const step = clamp((p - 0.05) / 0.9) * (n - 1)
  const on = Math.min(n - 1, Math.round(step))

  return (
    <section id={c.id} ref={ref} className="me" style={{ '--n': n } as CSSProperties} aria-labelledby="me-title">
      <div className="me__pin">
        <Head id="me-title" head={c.head} />

        <div className="me__main">
          <aside className="me__chain" data-umm-reveal>
            <ol className="me__rail">
              {cards.map((x, k) => {
                const fill = clamp(step - k + 1)
                return (
                  <li key={x.key}>
                    <button
                      type="button"
                      aria-current={k === on || undefined}
                      style={{ '--f': k === 0 ? 1 : fill } as CSSProperties}
                      onClick={() => scrollThrough(ref.current, 0.05 + (k / (n - 1)) * 0.9)}
                    >
                      <span>{pad(k - 1)}</span>
                      {k === 0 ? x.k : x.title}
                      <i />
                    </button>
                  </li>
                )
              })}
            </ol>

            <div className="me__end">
              <p>{c.close.body}</p>
              <a className="mf-link" href={c.close.link.href}>
                {c.close.link.label}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </aside>

          <div className="me__deck">
            {cards.map((x, k) => {
              const arrive = k === 0 ? 1 : clamp(step - k + 1)
              const depth = Math.min(2, Math.max(0, step - k))
              return (
                <article
                  key={x.key}
                  className="me-card"
                  data-tone={x.tone}
                  data-start={k === 0 || undefined}
                  data-on={k === on || undefined}
                  style={{ '--in': arrive, '--d': depth, zIndex: k + 1 } as CSSProperties}
                >
                  <div className="me-card__text">
                    <p className="me__k">
                      <span>{pad(k - 1)}</span>
                      {x.k}
                    </p>
                    <h3>{x.title}</h3>
                    <p className="me-card__sub">{x.sub}</p>
                    {x.points.length > 0 && (
                      <ul className="me-card__points">
                        {x.points.map((pt) => (
                          <li key={pt}>
                            <svg viewBox="0 0 16 16" aria-hidden="true">
                              <path d="M5 11l6-6M6 5h5v5" />
                            </svg>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="me-card__art">
                    <span className="me-card__num">{pad(k - 1)}</span>
                    <MfgArt name={x.art} />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
