import type { CSSProperties } from 'react'
import { rollout } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { Head } from './Head'
import { useAuto } from './hooks'

/* ============================================================================
   THE MANUFACTURING PAGE — 09 · FROM PILOTS TO OPERATING IMPACT

   "Make AI part of how production runs." The route from one improvement to
   many lines and plants, told on a plan of the estate in fine line:

     left    the four steps, stepping on by themselves with a progress line
             (paused under the pointer, stopped once one is picked)
     right   the estate: three plants and their lines. As the steps go:
               01  one line lit, its lever pinned and its baseline drawn
               02  its machines' signals running to one shared record
               03  the line tried in other states (shifts, materials),
                   the copies settling on one, checked
               04  the pattern copied: every line in the plant lights in
                   turn, then the route runs on to the other two plants
   ========================================================================== */

/* the estate: each plant's place and its lines */
const PLANTS = [
  { x: 24, y: 28, w: 236, h: 236, lines: 4 },
  { x: 288, y: 28, w: 168, h: 108, lines: 2 },
  { x: 288, y: 156, w: 168, h: 108, lines: 2 },
]

function Estate() {
  let n = 0
  return (
    <svg className="mro-map" viewBox="0 0 480 290" aria-hidden="true">
      {PLANTS.map((p, pi) => (
        <g key={pi} className="mro-plant" data-p={pi}>
          <rect className="mro-ground" x={p.x} y={p.y} width={p.w} height={p.h} rx="16" />
          <text className="mro-t" x={p.x + 14} y={p.y + 20}>
            {`Plant ${String.fromCharCode(65 + pi)}`}
          </text>
          {Array.from({ length: p.lines }, (_, li) => {
            const gap = (p.h - 44) / p.lines
            const y = p.y + 40 + li * gap + gap / 2
            const k = n++
            return (
              <g key={li} className="mro-line" data-first={k === 0 || undefined} style={{ '--k': k } as CSSProperties}>
                <path className="mro-track" d={`M${p.x + 16} ${y}H${p.x + p.w - 16}`} />
                {[0, 1, 2, 3].map((m) => {
                  const mx = p.x + 22 + (m * (p.w - 56)) / 3
                  return <rect key={m} className="mro-m" x={mx} y={y - 7} width="14" height="14" rx="3.5" />
                })}
              </g>
            )
          })}
        </g>
      ))}

      {/* 01 · the lever and its baseline, on the first line */}
      <g className="mro-lever">
        <path className="mro-pin" d="M53 82c-7-7-10-12-10-17a10 10 0 0 1 20 0c0 5-3 10-10 17z" />
        <circle className="mro-pin-dot" cx="53" cy="65" r="3.2" />
        <path className="mro-base" d="M40 108h196" />
      </g>

      {/* 02 · the signals running to one record */}
      <g className="mro-data">
        <rect className="mro-db" x="190" y="38" width="50" height="20" rx="8" />
        {[1, 2, 3].map((m) => {
          const mx = 46 + (m * 180) / 3 + 7
          return <path key={m} className="mro-sig" style={{ '--k': m } as CSSProperties} d={`M${mx} 84C${mx} 70 215 72 215 58`} />
        })}
      </g>

      {/* 03 · tried in other states */}
      <g className="mro-ghosts">
        {[-1, 1].map((d) => (
          <path key={d} className="mro-ghost" style={{ '--d': d } as CSSProperties} d="M40 92h196" />
        ))}
        <g className="mro-check">
          <circle cx="246" cy="116" r="9" />
          <path d="M242 116.4l2.8 2.8 5.2-5.6" />
        </g>
      </g>

      {/* 04 · on to the other plants */}
      <g className="mro-spread">
        <path className="mro-route" d="M260 90C276 90 272 70 288 70" />
        <path className="mro-route" style={{ '--k': 1 } as CSSProperties} d="M260 200C276 200 272 210 288 210" />
      </g>
    </svg>
  )
}

export function MfgRollout() {
  const c = rollout
  const { i, pick, host } = useAuto<HTMLDivElement>(c.steps.length, 5600)
  return (
    <section id={c.id} className="mro mf-sec" aria-labelledby="mro-title">
      <Head id="mro-title" head={c.head} />
      <div ref={host} className="mro__main" data-step={i} data-umm-reveal>
        <ol className="mro__steps">
          {c.steps.map((s, k) => (
            <li key={s.title} data-on={k === i || undefined} data-done={k < i || undefined}>
              <button type="button" aria-pressed={k === i} onClick={() => pick(k)}>
                <span className="mro__num">{pad(k)}</span>
                <span className="mro__title">{s.title}</span>
                <span className="mro__body">{s.body}</span>
                <i className="mro__bar" />
              </button>
            </li>
          ))}
        </ol>
        <div className="mro__stage">
          <Estate />
        </div>
      </div>
    </section>
  )
}
