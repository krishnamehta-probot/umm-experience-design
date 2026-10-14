import { useEffect, useRef, useState } from 'react'
import type { Rage } from './useRage'
import { reducedMotion } from './gl'

/* ============================================================================
   useDeck — the scene choreography every technique version shares

   A list of scenes to cycle through on a timer, one scene per chip on hover,
   and an exit scene when a question is asked. The engine only has to expose
   go(scene, opts?). Hovering pauses the cycle; picking a scene from the dock
   turns Auto off.
   ========================================================================== */

type Engine<S> = { go(id: S, o?: { dur?: number }): void } | null

export function useDeck<S extends string>({
  engine,
  rage,
  order,
  chipScenes,
  exit,
  first,
  every = 10000,
}: {
  engine: React.RefObject<Engine<S>>
  rage: Rage
  /** the cycle */
  order: S[]
  /** one scene per chip, in chip order */
  chipScenes: S[]
  /** where a question goes out through */
  exit: S
  first: S
  every?: number
}) {
  const [scene, setScene] = useState<S>(first)
  /* with reduced motion the scene holds still until a chip asks for another */
  const [auto, setAuto] = useState(() => !reducedMotion())
  const hovering = useRef(false)
  const hoverT = useRef(0)

  const show = (id: S) => {
    setScene(id)
    engine.current?.go(id)
  }

  useEffect(() => {
    if (!auto || rage.busy) return
    const t = window.setInterval(() => {
      if (hovering.current) return
      setScene((cur) => {
        const next = order[(order.indexOf(cur) + 1) % order.length]
        engine.current?.go(next)
        return next
      })
    }, every)
    return () => window.clearInterval(t)
  }, [auto, rage.busy, engine, order, every])

  useEffect(() => () => window.clearTimeout(hoverT.current), [])

  useEffect(() => {
    if (rage.phase === 'typing' || rage.phase === 'leaving') engine.current?.go(exit, { dur: 1.4 })
    if (rage.phase === 'idle') engine.current?.go(scene)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rage.phase, engine])

  return {
    scene,
    auto,
    toggleAuto: () => setAuto((v) => !v),
    /** pick from the dock: stops the cycle */
    pick: (id: S) => {
      setAuto(false)
      show(id)
    },
    /* a chip has to be rested on for a moment before its scene comes up,
       so sweeping across the row doesn't flick through six scenes */
    onChip: (i: number) => {
      hovering.current = true
      window.clearTimeout(hoverT.current)
      hoverT.current = window.setTimeout(() => show(chipScenes[i % chipScenes.length]), 450)
    },
    onChipLeave: () => {
      hovering.current = false
      window.clearTimeout(hoverT.current)
    },
  }
}
