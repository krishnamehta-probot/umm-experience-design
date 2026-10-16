import { useEffect, type RefObject } from 'react'

/* ============================================================================
   INTEGRATED GROWTH · THE GROWTH CURVE'S DRAWING (GrowthSystem's)

   16 Oct, Krish's approved concept: the growth system as one large chart.
   This hook measures the cards' pins inside the chart (.gc__plot) and draws
   the chart's lines through them, then draws them in as the reader scrolls:
   stroke-dashoffset from how far the reader is through the section, once
   per animation frame from a passive listener. Scrolling stays native.

   Wide (the four columns): the system's line climbs from the axis through
   the four pins, each card further right and up, to the top-right of the
   plot; the four workflows fan off the axis below, each line rising to
   the pin over its card. Narrow (the stacked cards): the line is a rail
   down the cards' left edge that splits into four lanes, one to each
   workflow. A pin lights (data-on on its card) when its line reaches it.
   With reduced motion everything is drawn and lit from the start.
   ========================================================================== */

/** the width at which the chart takes its four columns (growth-curve.css) */
export const GC_WIDE = '(min-width: 1200px)'

type Pt = { x: number; y: number }

type Series = {
  /** the ribbon and the ink line, the same path */
  lines: SVGPathElement[]
  area: SVGPathElement | null
  head: SVGCircleElement | null
  len: number
  /** length → height down the plot, for the stacked cards */
  samples: { l: number; y: number }[]
  pins: { li: HTMLElement; at: number }[]
  /** the list whose place on screen runs the line (wide) */
  run: HTMLElement
  delay: number
  /** the head stays at the end of the line once drawn */
  keepHead: boolean
}

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const f = (n: number) => n.toFixed(1)

/** A monotone curve through points left to right (Fritsch–Butland slopes),
 *  so the line never dips between two pins: its pieces, the first a move. */
function monotone(p: Pt[]): string[] {
  const n = p.length
  const s: number[] = []
  for (let i = 0; i < n - 1; i++) s.push((p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x))
  const m = p.map((_, i) => {
    if (i === 0) return s[0]
    if (i === n - 1) return s[n - 2]
    const a = s[i - 1]
    const b = s[i]
    return a * b <= 0 ? 0 : 2 / (1 / a + 1 / b)
  })
  const d = [`M${f(p[0].x)} ${f(p[0].y)}`]
  for (let i = 0; i < n - 1; i++) {
    const dx = (p[i + 1].x - p[i].x) / 3
    d.push(
      `C${f(p[i].x + dx)} ${f(p[i].y + m[i] * dx)} ${f(p[i + 1].x - dx)} ${f(p[i + 1].y - m[i + 1] * dx)} ${f(p[i + 1].x)} ${f(p[i + 1].y)}`,
    )
  }
  return d
}

export function useGrowthCurve(plotRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const plot = plotRef.current
    if (!plot) return
    const svg = plot.querySelector<SVGSVGElement>('.gc__svg')
    const scratch = plot.querySelector<SVGPathElement>('[data-gc="scratch"]')
    const rise = plot.querySelector<SVGLinearGradientElement>('#gc-rise')
    if (!svg || !scratch) return
    const wide = window.matchMedia(GC_WIDE)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const all = <T extends Element>(sel: string) => [...plot.querySelectorAll<T>(sel)]
    const one = <T extends Element>(sel: string) => plot.querySelector<T>(sel)
    const setD = (key: string, d: string) =>
      all<SVGPathElement>(`[data-gc="${key}"]`).forEach((el) => el.setAttribute('d', d))
    const lengthOf = (d: string) => {
      scratch.setAttribute('d', d)
      return scratch.getTotalLength()
    }

    let series: Series[] = []
    let cols = false
    let frame = 0

    const layout = () => {
      const box = plot.getBoundingClientRect()
      const w = box.width
      const h = box.height
      if (!w || !h) return
      svg.setAttribute('viewBox', `0 0 ${f(w)} ${f(h)}`)
      cols = wide.matches
      const at = (el: Element): Pt => {
        const b = el.getBoundingClientRect()
        return { x: b.left - box.left + b.width / 2, y: b.top - box.top + b.height / 2 }
      }
      const mainLis = all<HTMLElement>('[data-gc-pin="main"]')
      const flowLis = all<HTMLElement>('[data-gc-pin="flow"]')
      const dot = (li: HTMLElement) => at(li.querySelector('.gc__dot') ?? li)
      const P = mainLis.map(dot)
      const E = flowLis.map(dot)
      const sysRun = one<HTMLElement>('[data-gc-run="main"]')
      const flowRun = one<HTMLElement>('[data-gc-run="flows"]')
      if (!sysRun || !flowRun || P.length < 1 || E.length < 1) return
      const base = h - 1

      let mainD: string
      let mainPts: Pt[]
      let pieces: string[] = []
      const flowDs: string[] = []
      const areaDs: string[] = []

      if (cols) {
        const ax = 10
        const T = { x: w - 14, y: 20 }
        mainPts = [{ x: ax, y: P[0].y + 30 }, ...P, T]
        pieces = monotone(mainPts)
        mainD = pieces.join(' ')
        /* the fan: from the axis beside the first workflow, each line up
           steeply, then easing towards its own level and its card */
        const O = { x: ax, y: E[0].y + 58 }
        E.forEach((e) => {
          const dx = e.x - O.x
          const up = O.y - e.y
          const d = `M${f(O.x)} ${f(O.y)} C${f(O.x + dx * 0.03)} ${f(e.y + up * 0.3)} ${f(O.x + dx * 0.42)} ${f(e.y + up * 0.05)} ${f(e.x)} ${f(e.y)}`
          flowDs.push(d)
          areaDs.push(`${d} V${f(O.y)} H${f(O.x)} Z`)
        })
        setD('axis', `M${ax} 8 V${f(base)} H${f(w)}`)
        setD('guides', P.map((p) => `M${ax} ${f(p.y)} H${f(p.x - 24)}`).join(' '))
        setD('target', `M${ax} ${f(T.y)} H${f(w)}`)
        let ticks = ''
        for (let y = 32; y < base - 8; y += 24) ticks += `M${ax} ${y} h5 `
        for (let x = ax + 48; x < w - 4; x += 48) ticks += `M${x} ${f(base)} v-5 `
        setD('ticks', ticks)
        rise?.setAttribute('x1', '0')
        rise?.setAttribute('y1', '0')
        rise?.setAttribute('x2', f(w))
        rise?.setAttribute('y2', '0')
      } else {
        /* the rail down the cards' left edge, splitting into four lanes */
        const rx = P[0].x
        const B = { x: rx, y: flowRun.getBoundingClientRect().top - box.top - 6 }
        mainPts = [{ x: rx, y: 0 }, ...P, B]
        mainD = `M${f(rx)} 0 V${f(B.y)}`
        E.forEach((e, k) => {
          const lx = rx + (k - (E.length - 1) / 2) * 6
          flowDs.push(
            `M${f(B.x)} ${f(B.y)} C${f(B.x)} ${f(B.y + 14)} ${f(lx)} ${f(B.y + 10)} ${f(lx)} ${f(B.y + 26)}` +
              ` V${f(e.y - 26)} C${f(lx)} ${f(e.y - 10)} ${f(e.x)} ${f(e.y - 14)} ${f(e.x)} ${f(e.y)}`,
          )
          areaDs.push('')
        })
        setD('axis', `M0 ${f(base)} H${f(w)}`)
        setD('guides', '')
        setD('target', '')
        let ticks = ''
        for (let x = 24; x < w - 4; x += 40) ticks += `M${x} ${f(base)} v-5 `
        setD('ticks', ticks)
        rise?.setAttribute('x1', '0')
        rise?.setAttribute('y1', '0')
        rise?.setAttribute('x2', '0')
        rise?.setAttribute('y2', f(h))
      }

      /* how far along its line each pin sits */
      const pinsAt = (pts: Pt[], lis: HTMLElement[]) =>
        lis.map((li, i) => ({
          li,
          at: cols ? lengthOf(pieces.slice(0, i + 2).join(' ')) : pts[i + 1].y,
        }))

      const build = (key: string, d: string, run: HTMLElement, delay: number, keepHead: boolean) => {
        setD(key, d)
        const lines = all<SVGPathElement>(`[data-gc="${key}"]`)
        const len = lines[0]?.getTotalLength() ?? 0
        const samples: { l: number; y: number }[] = []
        if (!cols && lines[0]) {
          const n = Math.max(2, Math.ceil(len / 8))
          for (let i = 0; i <= n; i++) {
            const l = (len * i) / n
            samples.push({ l, y: lines[0].getPointAtLength(l).y })
          }
        }
        lines.forEach((el) => (el.style.strokeDasharray = `${f(len)} ${f(len + 40)}`))
        return { lines, len, samples, run, delay, keepHead }
      }

      const main = build('main', mainD, sysRun, 0, true)
      series = [
        {
          ...main,
          area: null,
          head: one<SVGCircleElement>('[data-gc="head-main"]'),
          pins: pinsAt(mainPts, mainLis),
        },
        ...flowDs.map((d, k) => {
          const s = build(`flow${k}`, d, flowRun, k * 0.08, false)
          const area = one<SVGPathElement>(`[data-gc="area${k}"]`)
          area?.setAttribute('d', areaDs[k])
          return {
            ...s,
            area,
            head: one<SVGCircleElement>(`[data-gc="head${k}"]`),
            pins: [{ li: flowLis[k], at: s.len }],
          }
        }),
      ]
      draw()
    }

    const draw = () => {
      frame = 0
      const vh = window.innerHeight
      const top = plot.getBoundingClientRect().top
      const runs = new Map<HTMLElement, number>()
      for (const s of series) {
        let p = 1
        if (!still.matches) {
          if (cols) {
            if (!runs.has(s.run)) runs.set(s.run, s.run.getBoundingClientRect().top)
            const t = (vh * 0.85 - (runs.get(s.run) ?? 0)) / (vh * 0.5)
            p = clamp((t - s.delay) / (1 - s.delay))
          } else {
            /* the reading line, down the plot */
            const y = vh * 0.68 - top
            const sm = s.samples
            if (!sm.length || y <= sm[0].y) p = 0
            else if (y >= sm[sm.length - 1].y) p = 1
            else {
              let lo = 0
              let hi = sm.length - 1
              while (hi - lo > 1) {
                const mid = (lo + hi) >> 1
                if (sm[mid].y < y) lo = mid
                else hi = mid
              }
              const a = sm[lo]
              const b = sm[hi]
              const k = b.y === a.y ? 1 : (y - a.y) / (b.y - a.y)
              p = (a.l + (b.l - a.l) * k) / s.len
            }
          }
        }
        const drawn = s.len * p
        for (const el of s.lines) {
          el.style.strokeDashoffset = f(s.len - drawn)
          el.style.visibility = p > 0 ? 'visible' : 'hidden'
        }
        if (s.area) s.area.style.opacity = String(p)
        if (s.head && s.lines[0]) {
          const pt = s.lines[0].getPointAtLength(drawn)
          s.head.setAttribute('cx', f(pt.x))
          s.head.setAttribute('cy', f(pt.y))
          s.head.style.opacity = p > 0 && (p < 1 || s.keepHead) ? '1' : '0'
        }
        for (const pin of s.pins) {
          /* lit as the line meets the badge's edge */
          if (drawn >= pin.at - 16) pin.li.dataset.on = ''
          else delete pin.li.dataset.on
        }
      }
    }

    const tick = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    let pending = 0
    const relayout = () => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(layout)
    }

    layout()
    const ro = new ResizeObserver(relayout)
    ro.observe(plot)
    document.fonts?.ready.then(relayout)
    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick, { passive: true })
    wide.addEventListener('change', relayout)
    still.addEventListener('change', tick)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(pending)
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
      wide.removeEventListener('change', relayout)
      still.removeEventListener('change', tick)
    }
  }, [plotRef])
}
