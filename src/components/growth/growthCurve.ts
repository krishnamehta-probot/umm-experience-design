import { useEffect, useRef, type RefObject } from 'react'

/* ============================================================================
   INTEGRATED GROWTH · THE GROWTH CURVE'S DRAWING (GrowthSystem's)

   16 Oct, Krish's approved concept: the growth system as one chart. Later
   the same day he asked for the execution to be lifted to a premium grade:
   one confident curve, a live tip that leads the reader, numbers that roll,
   the four workflows as ribbons, the chart reading as one designed piece.

   This hook draws the chart (.gc__plot) and runs it from the reader's place:
   once per animation frame from passive listeners, scrolling native.

     - the system's curve climbs through its four pins: on a tall window the
       chart is held (sticky) above the four stage rows and the curve's tip
       sits on the row being read; on a short one it draws as the chart
       crosses the screen
     - each pin lights (tone, pop, one pulse, its number rolling) as the
       line reaches it, and its stage row ticks as it is read
     - then the four workflows rise as four ribbons, each from its own point
       on the baseline, one as its card is read; the one chosen in the
       legend (or the one being read) is drawn in ink and its card lifts
     - the held chart lets go as the last workflow card reaches it: from
       there it rides up just above that card, so the last words never pass
       under it and it needs no empty slot to land in

   Only transform, stroke-dashoffset, opacity and a clip rect change per
   frame; the drawing's geometry is measured on resize. With reduced motion
   everything is drawn and lit from the start.
   ========================================================================== */

type Pt = { x: number; y: number }

/** the system's curve as fractions of the plot (x across, y up from the
 *  baseline): its start, the four pins, its end at the top right */
const MAIN_X = [0, 0.125, 0.375, 0.625, 0.875, 0.985]
const MAIN_Y = [0.04, 0.085, 0.2, 0.43, 0.75, 0.93]
/** the four workflows: each from its own point on the baseline to its own
 *  height at the right, the first the highest, so they never cross */
const FLOW_X = [0.03, 0.105, 0.18, 0.255]
const FLOW_Y = [0.64, 0.5, 0.37, 0.25]

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const f = (n: number) => n.toFixed(1)
const flag = (el: Element | null | undefined, key: string, on: boolean) => {
  if (!el) return
  const d = (el as HTMLElement).dataset
  if (on && d[key] === undefined) d[key] = ''
  else if (!on && d[key] !== undefined) delete d[key]
}

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

/** where the line is, given anchors (a screen height, a length) in order
 *  down the page and the reading line's height */
function through(a: { at: number; l: number }[], r: number) {
  if (r <= a[0].at) return a[0].l
  for (let i = 0; i < a.length - 1; i++) {
    if (r < a[i + 1].at) {
      const span = a[i + 1].at - a[i].at
      return a[i].l + (a[i + 1].l - a[i].l) * (span > 0 ? (r - a[i].at) / span : 1)
    }
  }
  return a[a.length - 1].l
}

export function useGrowthCurve(runRef: RefObject<HTMLDivElement | null>, pick: number | null) {
  const pickRef = useRef(pick)
  const kickRef = useRef<() => void>(() => {})

  useEffect(() => {
    pickRef.current = pick
    kickRef.current()
  }, [pick])

  useEffect(() => {
    const run = runRef.current
    if (!run) return
    const one = <T extends Element>(s: string) => run.querySelector<T>(s)
    const all = <T extends Element>(s: string) => [...run.querySelectorAll<T>(s)]
    const plot = one<HTMLElement>('.gc__plot')
    const svg = one<SVGSVGElement>('.gc__svg')
    const scratch = one<SVGPathElement>('[data-gc="scratch"]')
    const lines = all<SVGPathElement>('[data-gc="line"]')
    const line = lines[lines.length - 1]
    const band = one<SVGPathElement>('[data-gc="band"]')
    const under = one<SVGPathElement>('[data-gc="under"]')
    const ghost = one<SVGPathElement>('[data-gc="ghost"]')
    const area = one<SVGPathElement>('[data-gc="area"]')
    const clip = one<SVGRectElement>('[data-gc="clip"]')
    const grid = one<SVGPathElement>('[data-gc="grid"]')
    const base = one<SVGPathElement>('[data-gc="base"]')
    const tip = one<HTMLElement>('.gc__tip')
    const glow = one<HTMLElement>('.gc__glow')
    const readout = one<HTMLElement>('.gc__readout')
    const wfHead = one<HTMLElement>('.gc__wf')
    const dir = one<HTMLElement>('.gc__direction')
    if (!plot || !svg || !scratch || !line || !ghost || !area || !clip || !grid || !base || !tip || !glow) return

    const holds = all<HTMLElement>('[data-gc-hold]')
    const pins = all<HTMLElement>('.gc__pin')
    const drops = all<SVGPathElement>('[data-gc="drop"]')
    const xs = all<HTMLElement>('.gc__x')
    const stages = all<HTMLElement>('[data-gc-stage]')
    const flows = all<HTMLElement>('[data-gc-flow]')
    const series = all<SVGGElement>('[data-gc-series]').map((g) => ({
      g,
      paths: [...g.querySelectorAll<SVGPathElement>('path')],
      end: g.querySelector<SVGCircleElement>('circle'),
      grad: g.querySelector<SVGLinearGradientElement>('linearGradient'),
      tone: g.style.getPropertyValue('--tone') || 'var(--umm-sun)',
      len: 0,
      cur: 0,
    }))
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')

    let len = 0
    let cur = 0
    let pinLen: number[] = []
    let hold: HTMLElement | null = null
    let holdTop = 0
    let holdH = 0
    /** how far the held chart has been lifted to ride above the last card */
    let shift = 0
    let raf = 0
    let ready = false

    const lengthOf = (d: string) => {
      scratch.setAttribute('d', d)
      return scratch.getTotalLength()
    }

    const layout = () => {
      const w = plot.clientWidth
      const h = plot.clientHeight
      if (!w || !h) return
      svg.setAttribute('viewBox', `0 0 ${f(w)} ${f(h)}`)
      /* room at the top for the tip's rings; the baseline is the plot's foot */
      const top = Math.min(18, h * 0.08)
      const X = (u: number) => u * w
      const Y = (v: number) => h - v * (h - top)

      const pts = MAIN_X.map((x, i) => ({ x: X(x), y: Y(MAIN_Y[i]) }))
      const pieces = monotone(pts)
      const d = pieces.join(' ')
      const end = pts[pts.length - 1]
      const shape = `${d} L${f(end.x)} ${f(h)} L${f(pts[0].x)} ${f(h)} Z`
      lines.forEach((el) => el.setAttribute('d', d))
      ghost.setAttribute('d', d)
      band?.setAttribute('d', d)
      area.setAttribute('d', shape)
      under?.setAttribute('d', shape)
      len = line.getTotalLength()
      pinLen = pins.map((_, i) => lengthOf(pieces.slice(0, i + 2).join(' ')))
      lines.forEach((el) => (el.style.strokeDasharray = `${f(len)} ${f(len + 40)}`))
      clip.setAttribute('height', f(h + 120))

      /* three quiet guides; where the chart's title sits in the plot's top
         left (wide), a guide starts after it rather than running under it */
      const pr = plot.getBoundingClientRect()
      const dr = dir && getComputedStyle(dir).position === 'absolute' ? dir.getBoundingClientRect() : null
      grid.setAttribute(
        'd',
        [0.25, 0.5, 0.75]
          .map((k) => {
            const y = h * k
            const x0 = dr && y < dr.bottom - pr.top + 10 ? Math.min(w, dr.right - pr.left + 28) : 0
            return `M${f(x0)} ${f(y)} H${f(w)}`
          })
          .join(' '),
      )
      base.setAttribute('d', `M0 ${f(h - 0.5)} H${f(w)}`)

      pins.forEach((pin, i) => {
        const p = pts[i + 1]
        pin.style.setProperty('--x', `${f(p.x)}px`)
        pin.style.setProperty('--y', `${f(p.y)}px`)
        drops[i]?.setAttribute('d', `M${f(p.x)} ${f(p.y + pin.offsetHeight / 2 + 4)} V${f(h)}`)
        xs[i]?.style.setProperty('--x', `${f(p.x)}px`)
      })

      series.forEach((s, k) => {
        const a = { x: X(FLOW_X[k]), y: h }
        const b = { x: X(MAIN_X[MAIN_X.length - 1]), y: Y(FLOW_Y[k]) }
        const dx = b.x - a.x
        const sd = `M${f(a.x)} ${f(a.y)} C${f(a.x + dx * 0.55)} ${f(a.y)} ${f(b.x - dx * 0.2)} ${f(b.y + (h - b.y) * 0.22)} ${f(b.x)} ${f(b.y)}`
        s.paths.forEach((el) => el.setAttribute('d', sd))
        s.len = s.paths[0]?.getTotalLength() ?? 0
        s.paths.forEach((el) => (el.style.strokeDasharray = `${f(s.len)} ${f(s.len + 40)}`))
        s.grad?.setAttribute('x1', f(a.x))
        s.grad?.setAttribute('x2', f(b.x))
        s.end?.setAttribute('cx', f(b.x))
        s.end?.setAttribute('cy', f(b.y))
      })

      /* the held element, if the window lets the chart be held */
      holds.forEach((el) => (el.style.transform = ''))
      shift = 0
      hold = holds.find((el) => getComputedStyle(el).position === 'sticky') ?? null
      holdTop = hold ? parseFloat(getComputedStyle(hold).top) || 0 : 0
      holdH = hold ? hold.offsetHeight : 0
      run.style.setProperty('--gc-hold', `${holdH}px`)

      if (!ready) {
        /* the first frame starts where the reader already is */
        ready = true
        frame(true)
      } else kick()
    }

    const frame = (snap = false) => {
      raf = 0
      if (!len) return
      const vh = window.innerHeight
      const reduce = still.matches
      /* the reading line: just under the held chart, or low on the screen */
      const r = hold ? holdTop + holdH + (vh - holdTop - holdH) * 0.3 : vh * 0.6
      const sb = stages.map((el) => el.getBoundingClientRect())
      const ft = flows.map((el) => el.getBoundingClientRect().top)
      const wfTop = wfHead ? wfHead.getBoundingClientRect().top : Infinity

      let mainT = len
      const flowT: number[] = series.map(() => 1)
      if (!reduce && hold && sb.length === pinLen.length) {
        mainT = through(
          [
            { at: sb[0].top - 260, l: 0 },
            ...sb.map((b, i) => ({ at: b.top, l: pinLen[i] })),
            { at: sb[sb.length - 1].top + sb[sb.length - 1].height * 0.75, l: len },
          ],
          r,
        )
        series.forEach((_, k) => (flowT[k] = clamp((r - (ft[k] ?? 0) + 160) / 340)))
      } else if (!reduce) {
        const t = clamp((vh * 0.92 - plot.getBoundingClientRect().top) / (vh * 0.62))
        mainT = len * clamp(t / 0.7)
        series.forEach((_, k) => (flowT[k] = clamp((t - 0.7 - k * 0.05) / 0.18)))
      }

      /* ease towards the reader's place: a soft follow, not a jump */
      const k0 = reduce || snap ? 1 : 0.2
      let moving = false
      cur += (mainT - cur) * k0
      if (Math.abs(mainT - cur) < 0.4) cur = mainT
      else moving = true
      series.forEach((s, k) => {
        const t = flowT[k] * s.len
        s.cur += (t - s.cur) * k0
        if (Math.abs(t - s.cur) < 0.4) s.cur = t
        else moving = true
      })

      /* the held chart lets go at the last card: it stays just above it,
         riding up with it, so that card is read whole and nothing rests
         under the chart (only transform changes) */
      if (hold && ft.length) {
        const natural = hold.getBoundingClientRect().top - shift
        const lift = Math.min(0, ft[ft.length - 1] - 16 - holdH - natural)
        if (Math.abs(lift - shift) > 0.25) {
          shift = lift
          hold.style.transform = shift ? `translate3d(0, ${f(shift)}px, 0)` : ''
        }
      }

      /* the system's line, its light and its tip */
      lines.forEach((el) => (el.style.strokeDashoffset = f(len - cur)))
      const p = line.getPointAtLength(cur)
      /* the clip rect starts 40px left of the plot, so it ends at the tip */
      clip.setAttribute('width', f(Math.max(0, p.x + 41)))
      tip.style.transform = `translate3d(${f(p.x)}px, ${f(p.y)}px, 0)`

      let lit = 0
      pins.forEach((pin, i) => {
        const on = cur >= pinLen[i] - 4
        if (on) lit = i + 1
        flag(pin, 'on', on)
        flag(drops[i], 'on', on)
        flag(xs[i], 'on', on)
      })

      /* the stage rows: ticked once read */
      let now = -1
      sb.forEach((b, i) => {
        if (b.top <= r) now = i
        flag(stages[i], 'on', reduce || b.top <= r)
      })
      stages.forEach((el, i) => flag(el, 'now', i === now))

      /* the workflows' ribbons */
      series.forEach((s) => {
        s.paths.forEach((el) => (el.style.strokeDashoffset = f(s.len - s.cur)))
        flag(s.g, 'drawn', s.cur > 0.5)
        flag(s.end, 'on', s.len > 0 && s.cur >= s.len - 1)
      })

      const flowsPhase = hold || reduce ? r >= wfTop : flowT[0] > 0
      run.dataset.phase = flowsPhase ? 'flows' : 'system'
      let reading = -1
      ft.forEach((t, k) => {
        if (t <= r) reading = k
      })
      const em = pickRef.current ?? (flowsPhase && reading >= 0 ? reading : null)
      series.forEach((s, k) => flag(s.g, 'em', em === k))
      flows.forEach((el, k) => flag(el, 'em', em === k))
      flag(run, 'em', em !== null)

      /* the light follows the reading: the curve's head, then the chosen
         workflow's head in its own tone */
      let g = p
      let tone = 'var(--umm-sun)'
      if (flowsPhase && em !== null && series[em]?.paths[0]) {
        const s = series[em]
        g = s.paths[0].getPointAtLength(s.cur)
        tone = s.tone
      }
      glow.style.transform = `translate3d(${f(g.x)}px, ${f(g.y)}px, 0)`
      run.style.setProperty('--gc-glow', tone)

      /* the readout under the chart on narrow screens: where the line is */
      if (readout) {
        const slot = flowsPhase ? (em !== null ? 4 + em : -1) : Math.max(0, lit - 1)
        if (slot >= 0) readout.style.setProperty('--i', String(slot))
        flag(readout, 'off', slot < 0)
      }

      if (moving) raf = requestAnimationFrame(() => frame())
    }

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(() => frame())
    }
    kickRef.current = kick

    let pending = 0
    const relayout = () => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(layout)
    }

    layout()
    const ro = new ResizeObserver(relayout)
    ro.observe(plot)
    holds.forEach((el) => ro.observe(el))
    document.fonts?.ready.then(relayout)
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', relayout, { passive: true })
    still.addEventListener('change', kick)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pending)
      kickRef.current = () => {}
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', relayout)
      still.removeEventListener('change', kick)
    }
  }, [runRef])
}
