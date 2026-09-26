import { useCallback, useEffect, useRef, useState } from 'react'

/* ============================================================================
   CARD SWAP

   A deck that deals its own front card to the back, forever. The front card
   drops clear of the stack, slides back along the depth axis, and rises into
   the last slot while everything behind it promotes one place forward.

   It is the only thing on the page that moves without being scrolled, which is
   the point: the section argues that your platforms are already running, and a
   stack that turns over on its own says that before the copy does.

   Everything is derived from two numbers — the running order and a 0..1 phase
   through the current swap — so the section's copy, index and stack are all
   reading the same clock and cannot disagree.
   ========================================================================== */

const clamp = (v: number) => Math.min(1, Math.max(0, v))
/** Progress through a window of the phase, as 0..1. */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/* Only the first few slots are laid out; everything deeper stacks on the last
   one and is invisible. Six cards fanned at full spacing would run off the
   column — and nobody reads the fourth card back anyway. */
const DEPTH = 3
/* Per slot: right, up, and away from the viewer, at full size. */
const DX = 42
const DY = 46
const DZ = 78
const SKEW = 6
/* How far the outgoing card falls before it slides back. */
const DROP = 150

/* The fan is as wide as the card plus three steps of DX. On a phone that runs
   off the screen, so every distance is scaled to the room available. */
function fanScale(width: number) {
  if (width >= 900) return 1
  return Math.max(0.4, Math.min(1, (width - 80) / 520))
}

export type Slot = {
  /** Highest at the front. */
  z: number
  transform: string
  opacity: number
  /** How readable the card's contents are — only the front card is fully lit. */
  ink: number
}

function place(s: number, k: number, drop = 0): Omit<Slot, 'z'> {
  const d = Math.min(s, DEPTH) * k
  const o =
    s <= 2 ? 1 : s <= 3 ? 1 - (s - 2) * 0.55 : Math.max(0, 0.45 - (s - 3) * 0.45)
  /* Cards behind the front one keep their colour and give up their type
     almost entirely. The group name is the top thing on a card, so any left
     showing pokes out above the front card and reads as a second title. */
  const ink = clamp(1 - s / 0.5) * 0.94 + 0.06
  return {
    ink,
    transform: `translate3d(${(d * DX).toFixed(1)}px, ${(drop - d * DY).toFixed(1)}px, ${(
      -d * DZ
    ).toFixed(1)}px) skewY(${SKEW}deg)`,
    opacity: o,
  }
}

type Options = {
  /** Time the front card is held still, in ms. */
  dwell?: number
  /** Time one swap takes, in ms. */
  duration?: number
  /** Swap time while flying to a card the reader picked. */
  hurry?: number
}

export function useCardSwap(
  count: number,
  { dwell = 3600, duration = 1500, hurry = 520 }: Options = {},
) {
  const [order, setOrder] = useState(() =>
    Array.from({ length: count }, (_, i) => i),
  )
  const [phase, setPhase] = useState(0)

  const orderRef = useRef(order)
  const phaseRef = useRef(0)
  const clockRef = useRef(0)
  const pausedRef = useRef(false)
  /* Set by a click on the index: keep dealing, fast, until this card is up. */
  const wantRef = useRef<number | null>(null)
  const stillRef = useRef(false)
  const [still, setStill] = useState(false)
  const [k, setK] = useState(1)

  useEffect(() => {
    const read = () => setK(fanScale(window.innerWidth))
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stillRef.current = true
      setStill(true)
      return
    }

    let raf = 0
    let last = 0

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      /* Capped so a backgrounded tab does not resume by jumping a whole swap. */
      const dt = last ? Math.min(64, now - last) : 0
      last = now

      const want = wantRef.current
      const chasing = want !== null && orderRef.current[0] !== want
      if (want !== null && !chasing) wantRef.current = null

      let t = clockRef.current
      const dw = dwell
      /* The last step of a chase runs at full speed, so a card arriving from
         one place away is dealt exactly as the deck deals itself. Only the
         steps in between are hurried, and even those are dealt, never cut. */
      const dist = chasing ? orderRef.current.indexOf(want as number) : 0
      const du = !chasing ? duration : dist > 1 ? hurry : duration

      /* Chasing gives up the rest of the dwell — but it starts the swap at
         phase zero rather than wherever the dwell clock had got to. Carrying
         the clock over is what made a card one place away appear to jump:
         three seconds of dwell divided by a short swap is already past one. */
      if (chasing && t < dw) t = dw

      /* Hover holds the deck, but only between swaps — stopping a card
         mid-flight would leave it stranded off the stack. */
      if (pausedRef.current && !chasing && t < dw) return
      t += dt

      if (t < dw) {
        clockRef.current = t
        if (phaseRef.current !== 0) {
          phaseRef.current = 0
          setPhase(0)
        }
        return
      }

      const p = (t - dw) / du
      if (p >= 1) {
        const next = [...orderRef.current.slice(1), orderRef.current[0]]
        orderRef.current = next
        clockRef.current = 0
        phaseRef.current = 0
        setOrder(next)
        setPhase(0)
        return
      }

      clockRef.current = t
      phaseRef.current = p
      setPhase(p)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [dwell, duration, hurry])

  /** Where card `id` sits this frame. */
  const slot = useCallback(
    (id: number): Slot => {
      const i = order.indexOf(id)

      if (i === 0) {
        /* Out and around: fall, travel back, rise into the last slot. The fall
           and the rise overlap the travel at both ends, so it reads as one
           gesture rather than three moves. */
        const fall = DROP * k * (ease(seg(phase, 0, 0.3)) - ease(seg(phase, 0.62, 1)))
        const back = ease(seg(phase, 0.32, 0.82)) * (count - 1)
        return {
          ...place(back, k, fall),
          /* Stays on top for the whole fall, so the card is seen to leave
             rather than simply being covered up by the one behind it. */
          z: phase < 0.5 ? count + 1 : 0,
        }
      }

      /* Everything else moves up one place, and not before the fall has
         finished — the deck shuffles forward into a gap that is already
         there, which is the order you can actually follow. */
      const e = ease(seg(phase, 0.3, 0.95))
      return { ...place(i - e, k), z: count - i }
    },
    [order, phase, count, k],
  )

  const goTo = useCallback((id: number) => {
    /* With motion off there is no loop to chase it, so cut straight there. */
    if (stillRef.current) {
      const cur = orderRef.current
      const k = cur.indexOf(id)
      const next = [...cur.slice(k), ...cur.slice(0, k)]
      orderRef.current = next
      setOrder(next)
      return
    }
    wantRef.current = id
  }, [])

  const hold = useCallback((on: boolean) => {
    pausedRef.current = on
  }, [])

  /* Which card the reader would say is showing.

     `order[0]` is the card the deck is still dealing, and it stops being the
     one on top halfway through the swap — at the same moment its z-index is
     handed over. Anything that has to agree with the deck reads this, not the
     order, or the copy ends up describing a card that has already left. */
  const live = phase < 0.5 ? order[0] : order[1 % count]

  return { order, phase, front: live, slot, goTo, hold, still }
}
