import { useMemo, useState } from 'react'

/* ============================================================================
   usePeek — the dock's hover preview. A version keeps its chosen options;
   while an option in the dock is hovered, `shown` is those options with the
   hovered one swapped in, and the hero renders `shown`.
   ========================================================================== */

export function usePeek<O extends object>(opts: O) {
  const [peek, setPeek] = useState<Partial<O> | null>(null)
  const shown = useMemo(() => (peek ? { ...opts, ...peek } : opts), [opts, peek])
  /** the onPeek for the dock row that sets `key` */
  const peekOf =
    <K extends keyof O>(key: K) =>
    (v: O[K] | null) =>
      setPeek(v === null ? null : ({ [key]: v } as unknown as Partial<O>))
  return { shown, peekOf }
}
