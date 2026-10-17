import { useEffect, useRef, type RefObject } from 'react'

/* ============================================================================
   INTEGRATED GROWTH · THE GROWTH FLYWHEEL'S GEOMETRY AND MOTION (GrowthSystem)

   17 Oct, Krish: the growth curve was not it ("this section needs something
   else, not this animation"). His pick is a growth flywheel: the four stages
   as one loop (signals, engine, channels, measurement, and back to the
   signals: the copy's own "feedback returns to the brief and the growth
   engine"), a heavy wheel that turns as you read and gathers speed, the
   commercial direction as its hub, and the four workflows as small wheels
   belted to it.

   The drawing (Flywheel.tsx) is laid out once in a 1000 x 1000 box, centre
   500 500, angles in degrees clockwise from twelve o'clock:

     track    the four stages as chevron segments, 372 to 430, one per
              quarter: Signals at the top, the engine on the right,
              channels at the bottom, measurement on the left
     rotor    the flywheel itself, 276 to 356: an ink ring with fine ticks
              and eight lit slots; the only part that turns
     hub      the commercial direction, a paper disc of 268 that never turns,
              its four priorities engraved around its edge
     wheels   the four workflows, small wheels in the corners; the one being
              read is belted round the flywheel and spins with it

   The hook runs it from the reader's place, once per animation frame, from
   passive listeners: scrolling stays native. Each stage's segment fills as
   its row is read, a lit tip running the loop; the rotor turns all the time
   (slowly), faster with every stage it has taken in, and is pushed by the
   scroll itself, coasting down like a heavy wheel when the reader stops.
   Only transform, opacity, stroke-dashoffset and data flags change per
   frame. Reduced motion: the wheel still, everything lit.
   ========================================================================== */

export const C = 500
/** the radii of the drawing (see above) */
export const R = {
  out: 430,
  in: 372,
  mid: 401,
  rotor: 356,
  tickIn: 326,
  slot: 304,
  hub: 268,
  ring: 237,
  belt: 437,
  sat: 62,
  /** a corner wheel's centre, along each axis from the centre */
  satAt: 405,
}

/** each stage's quarter: centred on 0, 90, 180, 270 (the top first) */
const SPAN = 43.5
/** how far a segment's point runs past its end, and into the next one's notch */
const TIP = 4.5

const f = (n: number) => n.toFixed(2)
export const at = (r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
const p = (r: number, deg: number) => at(r, deg).map(f).join(' ')

/** a stage's segment: a ring piece with a point at its clockwise end and a
 *  notch at its start, so the four read as one loop */
export function segmentPath(i: number) {
  const a0 = 90 * i - SPAN
  const a1 = 90 * i + SPAN
  return [
    `M${p(R.out, a0)}`,
    `A${R.out} ${R.out} 0 0 1 ${p(R.out, a1)}`,
    `L${p(R.mid, a1 + TIP)}`,
    `L${p(R.in, a1)}`,
    `A${R.in} ${R.in} 0 0 0 ${p(R.in, a0)}`,
    `L${p(R.mid, a0 + TIP)}Z`,
  ].join(' ')
}

/** the light that fills a segment as its row is read, along its middle */
export function fillPath(i: number) {
  const a0 = 90 * i - SPAN
  return `M${p(R.mid, a0)} A${R.mid} ${R.mid} 0 0 1 ${p(R.mid, 90 * i + SPAN + TIP)}`
}

/** where the lit tip is, a fraction p through stage i */
export const tipAngle = (i: number, k: number) => 90 * i - SPAN + (2 * SPAN + TIP) * k

/** the path a stage's name runs along: clockwise, except the bottom one,
 *  which runs back so it reads left to right */
export function labelPath(i: number) {
  const s = 40
  if (i === 2) return `M${p(R.mid, 180 + s)} A${R.mid} ${R.mid} 0 0 0 ${p(R.mid, 180 - s)}`
  return `M${p(R.mid, 90 * i - s)} A${R.mid} ${R.mid} 0 0 1 ${p(R.mid, 90 * i + s)}`
}

/** the hub's edge, for its engraved priorities: over the top, and back
 *  along the bottom so both read left to right */
export const ringTop = `M${p(R.ring, -88)} A${R.ring} ${R.ring} 0 0 1 ${p(R.ring, 88)}`
export const ringBottom = `M${p(R.ring, 268)} A${R.ring} ${R.ring} 0 0 0 ${p(R.ring, 92)}`

/** the rotor's ticks, in its own box (centre 0 0): fine every 3°, long every 30° */
export const rotorTicks = (() => {
  const d: string[] = []
  for (let k = 0; k < 120; k++) {
    const a = ((k * 3 - 90) * Math.PI) / 180
    const r0 = R.rotor - 6
    const r1 = k % 10 === 0 ? R.tickIn - 2 : k % 5 === 0 ? R.tickIn + 8 : R.tickIn + 14
    d.push(`M${f(r0 * Math.cos(a))} ${f(r0 * Math.sin(a))}L${f(r1 * Math.cos(a))} ${f(r1 * Math.sin(a))}`)
  }
  return d.join('')
})()

/** the rotor's eight lit slots, in its own box */
export const rotorSlots = Array.from({ length: 8 }, (_, k) => {
  const c = 22.5 + k * 45
  const a = (d: number) => ((d - 90) * Math.PI) / 180
  const q = (d: number) => `${f(R.slot * Math.cos(a(d)))} ${f(R.slot * Math.sin(a(d)))}`
  return `M${q(c - 12)} A${R.slot} ${R.slot} 0 0 1 ${q(c + 12)}`
})

/** the bolts between the slots, in the rotor's box */
export const rotorBolts = Array.from({ length: 8 }, (_, k) => {
  const a = ((k * 45 - 90) * Math.PI) / 180
  return [R.slot * Math.cos(a), R.slot * Math.sin(a)] as const
})

/** the corner wheels, clockwise from the top right */
export const SAT_CORNERS = [45, 135, 225, 315]
export const satCentre = (k: number): [number, number] => {
  const sx = k === 0 || k === 1 ? 1 : -1
  const sy = k === 1 || k === 2 ? 1 : -1
  return [C + sx * R.satAt, C + sy * R.satAt]
}

/** an open belt from corner wheel k round the far side of the flywheel */
export function beltPath(k: number) {
  const c = SAT_CORNERS[k]
  const d = R.satAt * Math.SQRT2
  const rs = R.sat + 5
  const phi = (Math.acos((R.belt - rs) / d) * 180) / Math.PI
  const [sx, sy] = satCentre(k)
  const small = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return `${f(sx + rs * Math.cos(a))} ${f(sy + rs * Math.sin(a))}`
  }
  return [
    `M${p(R.belt, c + phi)}`,
    `A${R.belt} ${R.belt} 0 1 1 ${p(R.belt, c - phi)}`,
    `L${small(c - phi)}`,
    `A${rs} ${rs} 0 0 1 ${small(c + phi)}`,
    'Z',
  ].join(' ')
}

/* ------------------------------------------------------------------------- */

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const flag = (el: Element | null | undefined, key: string, on: boolean) => {
  if (!el) return
  const d = (el as HTMLElement | SVGElement).dataset
  if (on && d[key] === undefined) d[key] = ''
  else if (!on && d[key] !== undefined) delete d[key]
}

/** where the light sits for each stage (its quarter) and each corner wheel */
const STAGE_LIGHT = [
  [50, 24],
  [76, 50],
  [50, 76],
  [24, 50],
]
const SAT_LIGHT = [
  [80, 20],
  [80, 80],
  [20, 80],
  [20, 20],
]

export function useGrowthFlywheel(runRef: RefObject<HTMLDivElement | null>, pick: number | null) {
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
    const wheel = one<HTMLElement>('.gf__wheel')
    const rotor = one<HTMLElement>('.gf__rotor')
    const arm = one<HTMLElement>('.gf__arm')
    const glow = one<HTMLElement>('.gf__glow')
    const hold = one<HTMLElement>('.gf__hold')
    const strip = one<HTMLElement>('.gf__strip')
    const ticks = one<SVGElement>('.gf__ticks')
    const smears = all<SVGElement>('.gf__smear')
    const readout = one<HTMLElement>('.gf__readout')
    const wfHead = one<HTMLElement>('.gf__wf')
    if (!wheel || !rotor || !arm || !glow || !hold || !strip) return

    const segs = all<SVGGElement>('[data-gf-seg]')
    const fills = all<SVGPathElement>('[data-gf="fill"]')
    const sats = all<HTMLElement>('[data-gf-sat]')
    const spins = sats.map((s) => s.querySelector<SVGSVGElement>('svg'))
    const belts = all<SVGGElement>('[data-gf-belt]')
    const stages = all<HTMLElement>('[data-gf-stage]')
    const flows = all<HTMLElement>('[data-gf-flow]')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')

    /** each stage's fill, eased towards the reader's place */
    const prog = stages.map(() => 0)
    const want = stages.map(() => 0)
    /** what the fills last drew, so a still frame writes nothing */
    const shown = stages.map(() => -1)
    let theta = 0
    let vel = 6
    let sv = 0
    const satTheta = sats.map(() => 0)
    const satRate = sats.map(() => 0.6)
    let em: number | null = null
    let energy = 0
    let held: 'hold' | 'strip' | null = null
    let lastY = window.scrollY
    let lastT = 0
    let raf = 0
    let dirty = true
    let inView = false

    const layout = () => {
      hold.style.top = ''
      held =
        getComputedStyle(hold).position === 'sticky'
          ? 'hold'
          : getComputedStyle(strip).position === 'sticky'
            ? 'strip'
            : null
      const vh = window.innerHeight
      if (held === 'hold') {
        /* held beside the rows, in the middle of the screen */
        hold.style.top = `${Math.max(16, Math.round((vh - hold.offsetHeight) / 2))}px`
        run.style.setProperty('--gf-hold', '0px')
      } else {
        run.style.setProperty('--gf-hold', held === 'strip' ? `${strip.offsetHeight + 8}px` : '0px')
      }
      dirty = true
      kick()
    }

    /** the reader's place: which stage, how far through it, which workflow */
    const read = () => {
      dirty = false
      const vh = window.innerHeight
      const reduce = still.matches
      const sb = held === 'strip' ? strip.getBoundingClientRect().bottom : 0
      const r = held === 'strip' ? sb + (vh - sb) * 0.32 : vh * 0.55
      const rows = stages.map((el) => el.getBoundingClientRect())
      const ft = flows.map((el) => el.getBoundingClientRect().top)
      const wfTop = wfHead ? wfHead.getBoundingClientRect().top : Infinity

      let now = -1
      rows.forEach((b, i) => {
        const end = i < rows.length - 1 ? rows[i + 1].top : b.bottom - b.height * 0.2
        want[i] = reduce ? 1 : clamp((r - b.top) / Math.max(1, end - b.top))
        if (b.top <= r) now = i
        flag(stages[i], 'on', reduce || b.top <= r)
      })
      const flowsPhase = r >= wfTop
      stages.forEach((el, i) => flag(el, 'now', !flowsPhase && i === now))
      segs.forEach((el, i) => flag(el, 'now', !reduce && !flowsPhase && i === now))
      run.dataset.phase = flowsPhase ? 'flows' : 'system'

      let reading = -1
      ft.forEach((t, k) => {
        if (t <= r) reading = k
        flag(flows[k], 'on', reduce || t <= r)
      })
      em = pickRef.current ?? (flowsPhase && reading >= 0 ? reading : null)
      flows.forEach((el, k) => flag(el, 'em', em === k))
      belts.forEach((el, k) => flag(el, 'em', em === k))
      sats.forEach((el, k) => {
        flag(el, 'em', em === k)
        flag(el, 'on', reduce || (flowsPhase && k <= reading) || em === k)
      })
      flag(run, 'em', em !== null)

      /* the light follows the reading: the stage's quarter, then the wheel */
      const spot = em !== null ? SAT_LIGHT[em] : flowsPhase || now < 0 ? [50, 50] : STAGE_LIGHT[Math.min(now, 3)]
      glow.style.translate = `${spot[0] - 50}% ${spot[1] - 50}%`
      const tone =
        em !== null
          ? sats[em]?.style.getPropertyValue('--tone')
          : now >= 0 && !flowsPhase
            ? stages[now]?.style.getPropertyValue('--tone')
            : ''
      wheel.style.setProperty('--gf-glow', tone || 'var(--umm-sun)')

      if (readout) {
        const slot = flowsPhase ? (em !== null ? 4 + em : -1) : Math.max(0, now)
        readout.dataset.i = String(slot)
      }
    }

    const frame = (t: number) => {
      raf = 0
      const reduce = still.matches
      const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 1 / 60
      lastT = t
      if (dirty) read()

      /* the fills: a soft follow, not a jump */
      let moving = false
      const k0 = reduce ? 1 : 1 - Math.exp(-dt * 9)
      prog.forEach((v, i) => {
        let n = v + (want[i] - v) * k0
        if (Math.abs(want[i] - n) < 0.002) n = want[i]
        else moving = true
        prog[i] = n
        if (shown[i] !== n) {
          shown[i] = n
          fills[i]?.style.setProperty('stroke-dashoffset', f(1 - n))
        }
        flag(segs[i], 'on', n > 0.01)
      })
      energy = prog.reduce((a, b) => a + b, 0)

      /* the tip runs the loop at the reader's place */
      let i = prog.findIndex((v) => v < 0.999)
      if (i < 0) i = prog.length
      const done = i >= prog.length
      const ang = done ? 360 : tipAngle(i, prog[i] ?? 0)
      arm.style.transform = `rotate(${f(ang)}deg)`
      flag(arm, 'on', energy > 0.01 && !done)

      if (!reduce) {
        /* the scroll pushes the wheel; with nothing pushing it coasts down to
           its drift, which quickens with every stage it has taken in */
        const y = window.scrollY
        const push = (y - lastY) / dt
        lastY = y
        sv += (push - sv) * (1 - Math.exp(-dt * 10))
        const drift = 5 + energy * 3.5 + (em !== null ? 3 : 0)
        const target = drift + clamp(sv * 0.08, -160, 220)
        const rate = Math.abs(target) > Math.abs(vel) ? 3.2 : 0.75
        vel += (target - vel) * (1 - Math.exp(-dt * rate))
        theta = (theta + vel * dt) % 360
        rotor.style.transform = `rotate(${f(theta)}deg)`
        /* at speed the ticks and slots smear into rings */
        const blur = clamp((Math.abs(vel) - 45) / 150)
        if (ticks) ticks.style.opacity = f(1 - blur * 0.7)
        smears.forEach((s) => (s.style.opacity = f(blur)))
        sats.forEach((_, k) => {
          satRate[k] += ((em === k ? 2.4 : 0.5) - satRate[k]) * (1 - Math.exp(-dt * 2))
          satTheta[k] = (satTheta[k] + vel * dt * satRate[k]) % 360
          spins[k]?.style.setProperty('transform', `rotate(${f(satTheta[k])}deg)`)
        })
      }

      if ((inView && !reduce) || moving) raf = requestAnimationFrame(frame)
      else lastT = 0
    }

    const kick = () => {
      dirty = true
      if (!raf) raf = requestAnimationFrame(frame)
    }
    kickRef.current = kick

    let pending = 0
    const relayout = () => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(layout)
    }

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting
        if (inView) {
          lastY = window.scrollY
          kick()
        }
      },
      { rootMargin: '120px 0px' },
    )
    io.observe(run)
    const ro = new ResizeObserver(relayout)
    ro.observe(run)
    ro.observe(strip)
    document.fonts?.ready.then(relayout)
    layout()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', relayout, { passive: true })
    still.addEventListener('change', kick)
    return () => {
      io.disconnect()
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
