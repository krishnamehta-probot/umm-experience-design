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
  className = '',
}: {
  data: unknown
  /** Mount and run only while the card holding it is open. */
  playing: boolean
  /** The frame held for reduced motion. */
  still?: number
  className?: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = host.current
    if (!playing || !node) return

    let cancelled = false
    let anim: ReturnType<LottiePlayer['loadAnimation']> | null = null

    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (cancelled || !node) return
      const instance = lottie.loadAnimation({
        container: node,
        renderer: 'svg',
        loop: !reduced,
        autoplay: !reduced,
        animationData: data as object,
      })
      /* Reduced motion still gets the mark, just held on a legible frame. */
      if (reduced) instance.goToAndStop(still, true)
      anim = instance
    })

    return () => {
      cancelled = true
      anim?.destroy()
      node.replaceChildren()
    }
  }, [playing, data, reduced, still])

  return <div className={`umm-lottie ${className}`.trim()} ref={host} aria-hidden="true" />
}
