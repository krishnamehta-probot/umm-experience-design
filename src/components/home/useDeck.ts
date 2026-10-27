import { useEffect, useRef, useState } from 'react'
import type { Rage } from './useRage'

/* ============================================================================
   useDeck — the scene choreography every version shares

   The hero rests on one scene: the landing scene, unless another is picked
   in the dock. A chip's scene comes up only while that chip is hovered (or
   focused), after a short rest so sweeping across the row doesn't flick
   through them, and the hero settles back a moment after the pointer
   leaves. Asking sends everything out through the exit scene.
   ========================================================================== */

type Engine<S> = { go(id: S, o?: { dur?: number }): void } | null

export function useDeck<S extends string>({
  engine,
  rage,
  chipScenes,
  exit,
  rest: first,
}: {
  engine: React.RefObject<Engine<S>>
  rage: Rage
  /** one scene per chip, in chip order */
  chipScenes: S[]
  /** where a question goes out through */
  exit: S
  /** the scene the hero rests on */
  rest: S
}) {
  const [rest, setRest] = useState<S>(first)
  const restNow = useRef(first)
  restNow.current = rest
  const hoverT = useRef(0)
  const backT = useRef(0)

  const clear = () => {
    window.clearTimeout(hoverT.current)
    window.clearTimeout(backT.current)
  }
  useEffect(() => clear, [])

  useEffect(() => {
    if (rage.phase === 'typing' || rage.phase === 'leaving') engine.current?.go(exit, { dur: 1.4 })
    if (rage.phase === 'idle') engine.current?.go(restNow.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rage.phase, engine])

  return {
    scene: rest,
    /** pick from the dock: the hero rests on it */
    pick: (id: S) => {
      clear()
      setRest(id)
      engine.current?.go(id)
    },
    onChip: (i: number) => {
      clear()
      hoverT.current = window.setTimeout(() => engine.current?.go(chipScenes[i % chipScenes.length]), 350)
    },
    onChipLeave: () => {
      clear()
      backT.current = window.setTimeout(() => engine.current?.go(restNow.current), 1200)
    },
    /** hovering a scene in the dock previews it; leaving goes back */
    peek: (id: S | null) => {
      clear()
      if (id === null) engine.current?.go(restNow.current)
      else hoverT.current = window.setTimeout(() => engine.current?.go(id), 200)
    },
  }
}
