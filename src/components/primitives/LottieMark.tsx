import { useEffect, useRef } from 'react'
import type { LottiePlayer } from 'lottie-web'
import { useReducedMotion } from '@/lib/useReducedMotion'

/* ============================================================================
   LOTTIE MARK

   Plays one of the hand-authored compositions in src/lottie.

   The player is imported dynamically and only once a card is actually opened,
   so the ~150KB light build never lands in the first paint of a page where
   nobody expands anything. Closing a card destroys the instance rather than
   pausing it, so a page of collapsed cards costs nothing at all.
   ========================================================================== */

export function LottieMark({
  data,
  playing,
  still = 30,
  hold = false,
  className = '',
}: {
  data: unknown
  /** Mount and run only while the card holding it is open. */
  playing: boolean
  /** The frame held for reduced motion. */
  still?: number
  /** Mounted but paused where it is (e.g. until hovered). */
  hold?: boolean
  className?: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const anim = useRef<ReturnType<LottiePlayer['loadAnimation']> | null>(null)
  const held = useRef(hold)
  held.current = hold

  useEffect(() => {
    const node = host.current
    if (!playing || !node) return

    let cancelled = false

    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (cancelled || !node) return
      const instance = lottie.loadAnimation({
        container: node,
        renderer: 'svg',
        loop: !reduced,
        autoplay: !reduced && !held.current,
        animationData: data as object,
      })
      /* Reduced motion still gets the mark, just held on a legible frame. */
      if (reduced) instance.goToAndStop(still, true)
      anim.current = instance
    })

    return () => {
      cancelled = true
      anim.current?.destroy()
      anim.current = null
      node.replaceChildren()
    }
  }, [playing, data, reduced, still])

  useEffect(() => {
    const a = anim.current
    if (!a || reduced) return
    if (hold) a.pause()
    else a.play()
  }, [hold, reduced])

  return <div className={`umm-lottie ${className}`.trim()} ref={host} aria-hidden="true" />
}
