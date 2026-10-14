import { useCallback, useEffect, useRef, useState } from 'react'
import { rage } from '@/content/home'

/* ============================================================================
   useRage — the hand-off every hero version shares

   idle → typing (a picked question writes itself into the bar)
        → leaving (the version plays its way out)
        → RAGe, with the question in ?query=

   Coming back with the browser's back button restores the page from the
   back-forward cache mid-exit, so it resets on pageshow.
   ========================================================================== */

export type RagePhase = 'idle' | 'typing' | 'leaving'

export function useRage({ leave = 1400, perChar = 14 }: { leave?: number; perChar?: number } = {}) {
  const [value, setValue] = useState('')
  const [phase, setPhase] = useState<RagePhase>('idle')
  const [question, setQuestion] = useState('')
  const timers = useRef<number[]>([])

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const reset = useCallback(() => {
    clear()
    setPhase('idle')
    setValue('')
    setQuestion('')
  }, [])

  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && reset()
    window.addEventListener('pageshow', onShow)
    return () => {
      clear()
      window.removeEventListener('pageshow', onShow)
    }
  }, [reset])

  const go = useCallback(
    (q: string, { typed = false }: { typed?: boolean } = {}) => {
      const text = q.trim()
      if (!text) return
      clear()
      setQuestion(text)
      const out = () => {
        setPhase('leaving')
        later(() => window.location.assign(rage.url(text)), leave)
      }
      if (typed) {
        setValue(text)
        out()
        return
      }
      setPhase('typing')
      setValue('')
      for (let i = 1; i <= text.length; i++) later(() => setValue(text.slice(0, i)), i * perChar)
      later(out, text.length * perChar + 120)
    },
    [leave, perChar],
  )

  return { value, setValue, phase, question, go, reset, busy: phase !== 'idle' }
}

export type Rage = ReturnType<typeof useRage>
