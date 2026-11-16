import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { work } from '@/content/manufacturing'
import { Head } from './Head'
import { useAuto } from './hooks'
import { CaseCard, Weave } from './WorkParts'

/* ============================================================================
   THE MANUFACTURING PAGE — 06 · RELEVANT WORK, option: one tile, three lives
   (?work=loop; Krish, 16 Nov: "make it interactive that it can be
   remembered")

   The three engagements are one carpet tile's life, in order round a loop:
   made by Mohawk's people (Benefits), sold at the approved price (PriceFX),
   taken back for recycling (Recover), and round again. The tile rides the
   loop from stop to stop by itself; the reader can take it and drag it
   round, and it settles on the nearest stop when let go. The engagement at
   its stop opens beside the loop. Each stop, named for that moment in the
   tile's life (made, sold, recovered), is also a button.
   ========================================================================== */

/* the stops round the loop, clockwise from the top, in degrees */
const at = (k: number) => -90 + k * 120

export function MfgWorkLoop() {
  const c = work
  const order = c.loop.order
  const n = order.length
  const { i, pick, host } = useAuto<HTMLDivElement>(n, 5600)
  const ring = useRef<HTMLDivElement>(null)
  const [r, setR] = useState(200)
  const [ang, setAng] = useState(at(0))
  const [drag, setDrag] = useState(false)

  /* the loop's radius, from its size (the drawn track is 84% of it) */
  useLayoutEffect(() => {
    const el = ring.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setR((e.contentRect.width / 2) * 0.84))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* to the stop in play, the short way round */
  useEffect(() => {
    if (drag) return
    setAng((a) => {
      let t = at(i) + 360 * Math.round((a - at(i)) / 360)
      if (t - a > 180) t -= 360
      if (a - t > 180) t += 360
      return t
    })
  }, [i, drag])

  /* the stop the tile is nearest */
  const near = ((Math.round((ang + 90) / 120) % n) + n) % n
  const s = drag ? near : i

  /* taking the tile round by hand */
  const angleOf = (e: PointerEvent) => {
    const b = ring.current!.getBoundingClientRect()
    return (Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) * 180) / Math.PI
  }
  const moved = useRef(false)
  const down = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    moved.current = false
    setDrag(true)
  }
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return
    const to = angleOf(e)
    setAng((a) => {
      const d = ((((to - a + 180) % 360) + 360) % 360) - 180
      if (Math.abs(d) > 2) moved.current = true
      return a + d
    })
  }
  const up = () => {
    if (!drag) return
    setDrag(false)
    if (moved.current) pick(near)
  }
  /* a tap without a drag moves it on to the next stop */
  const tap = () => {
    if (moved.current) return
    pick((i + 1) % n)
  }

  const x = c.cases[order[s]]

  return (
    <section id={c.id} className="wlp mf-sec" aria-labelledby="mw-title">
      <Head id="mw-title" head={c.head} />
      <div ref={host} className="wlp__body" data-umm-reveal>
        <div className="wlp__loop">
          <div ref={ring} className="wlp__ring" style={{ '--r': `${r}px` } as CSSProperties}>
            <svg className="wlp__track" viewBox="-100 -100 200 200" aria-hidden="true">
              <circle r="84" />
              {[-30, 90, 210].map((a) => (
                <path key={a} transform={`rotate(${a}) translate(84 0) rotate(90)`} d="M-1.6 -3.2L1.4 0 -1.6 3.2" />
              ))}
            </svg>

            <div className="wlp__core">
              <img src={c.featured.logo} alt="Mohawk" />
              <p>{c.loop.title}</p>
              <span>{c.loop.hint}</span>
            </div>

            {order.map((k, j) => {
              const y = c.cases[k]
              return (
                <button
                  key={y.name}
                  type="button"
                  className="wlp__stop"
                  data-on={j === s || undefined}
                  aria-pressed={j === s}
                  style={{ '--a': `${at(j)}deg` } as CSSProperties}
                  onClick={() => pick(j)}
                >
                  <i aria-hidden="true" />
                  <span>
                    <b>{y.life}</b>
                  </span>
                </button>
              )
            })}

            <button
              type="button"
              className="wlp__tile"
              data-tone={x.tone}
              data-drag={drag || undefined}
              aria-label={c.loop.hint}
              style={{ '--a': `${ang}deg` } as CSSProperties}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onClick={tap}
            >
              <Weave kind={x.weave} />
            </button>
          </div>
        </div>
        <div className="wlp__case">
          <CaseCard key={s} x={x} k={s} />
        </div>
      </div>
    </section>
  )
}
