import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/* ============================================================================
   HERO TILE FIELD

   A full-bleed grid of frosted glass tiles over a two-colour bloom.

   Three things move, all of them quietly:
     1. two colour washes orbit continuously on different clocks, so the
        bloom is always in motion and never settles on the same frame
     2. a soft light follows the pointer and catches the glass under it
     3. tiles lift a little as that light passes over them

   No backdrop-filter anywhere. There is nothing but a smooth gradient behind
   the tiles, so translucent white with a bevel gradient is visually identical
   and costs one composited layer instead of ~300 blur passes.
   ========================================================================== */

/** Enough tiles to overflow the tallest viewport at the smallest tile size. */
const TILE_COUNT = 360

/* Deterministic per-tile variation — the reference field is not uniform, some
   tiles sit brighter than their neighbours. A hash keeps it stable across
   renders instead of reshuffling on every paint. */
function jitter(i: number) {
  const n = Math.sin(i * 12.9898) * 43758.5453
  return n - Math.floor(n)
}

export function TileField({
  tone = 'paper',
}: {
  /**
   * Which ground the field is sitting on. Everything that makes it read as
   * frosted glass is a statement about the surface behind it, so on ink the
   * washes have to blend `screen` rather than `multiply` and the glass holds
   * a fraction of the white it holds on paper. See `.umm-tiles--ink`.
   */
  tone?: 'paper' | 'ink'
} = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    /* Coarse pointers have no hover state to track. */
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let targetX = 70
    let targetY = 45
    let x = targetX
    let y = targetY
    let frame = 0

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      targetX = ((event.clientX - rect.left) / rect.width) * 100
      targetY = ((event.clientY - rect.top) / rect.height) * 100
      el.dataset.lit = 'on'
    }

    const onLeave = () => {
      delete el.dataset.lit
    }

    /* Eased, not snapped. The lag is what keeps it feeling like light rather
       than a cursor readout. */
    const tick = () => {
      x += (targetX - x) * 0.07
      y += (targetY - y) * 0.07
      el.style.setProperty('--mx', `${x.toFixed(2)}%`)
      el.style.setProperty('--my', `${y.toFixed(2)}%`)
      frame = requestAnimationFrame(tick)
    }

    const host = el.parentElement ?? el
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    frame = requestAnimationFrame(tick)

    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <div
      className={`umm-tiles${tone === 'ink' ? ' umm-tiles--ink' : ''}`}
      aria-hidden="true"
      ref={ref}
    >
      <div className="umm-tiles__bloom">
        <span className="umm-tiles__wash umm-tiles__wash--warm" />
        <span className="umm-tiles__wash umm-tiles__wash--rose" />
      </div>
      <div className="umm-tiles__grid">
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <span
            className="umm-tiles__tile"
            key={i}
            style={{ ['--v' as string]: jitter(i).toFixed(3) }}
          />
        ))}
      </div>
      <div className="umm-tiles__lamp" />
    </div>
  )
}
