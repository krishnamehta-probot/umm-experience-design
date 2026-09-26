import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/* ============================================================================
   RIBBON LOOP

   A solid band of colour laid along a single S-wave, with the wordmarks riding
   it. The band is the same path as the text — stroked thick with round caps —
   so the two can never drift out of register no matter the width.

   The loop is seamless because the text is repeated to overrun the path and
   `startOffset` wraps by exactly one repetition, which is measured from the
   rendered glyphs rather than guessed.

   Drag it and it scrubs; let go and it carries on the way you threw it.
   ========================================================================== */

/** One gentle S — flat at both ends, all the descent in the middle. */
const PATH = 'M -220 76 C 420 76, 620 316, 1660 316'
const VIEW = { w: 1440, h: 392 }

export function RibbonLoop({
  items,
  speed = 1.1,
  separator = '✦',
  className = '',
}: {
  items: readonly string[]
  /** User units travelled per frame. */
  speed?: number
  separator?: string
  className?: string
}) {
  const reduced = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const pathId = `umm-ribbon-${uid}`

  const measureRef = useRef<SVGTextElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const textPathRef = useRef<SVGTextPathElement>(null)

  const [spacing, setSpacing] = useState(0)
  const [pathLength, setPathLength] = useState(0)

  /* One repetition, trailing separator included so the join reads the same as
     every other gap when the text wraps around. */
  const unit = useMemo(
    () => `${items.join(`\u00A0\u00A0${separator}\u00A0\u00A0`)}\u00A0\u00A0${separator}\u00A0\u00A0`,
    [items, separator],
  )

  const run = useMemo(() => {
    if (!spacing || !pathLength) return unit
    return Array(Math.ceil(pathLength / spacing) + 2)
      .fill(unit)
      .join('')
  }, [unit, spacing, pathLength])

  /* Measure once the face has actually loaded — measuring against a fallback
     would set a wrap distance that no longer matches what is drawn. */
  useEffect(() => {
    let cancelled = false
    const measure = () => {
      if (cancelled || !measureRef.current || !pathRef.current) return
      setSpacing(measureRef.current.getComputedTextLength())
      setPathLength(pathRef.current.getTotalLength())
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelled = true
      window.removeEventListener('resize', measure)
    }
  }, [unit])

  const ready = spacing > 0 && pathLength > 0

  useEffect(() => {
    const node = textPathRef.current
    if (!ready || !node) return
    node.setAttribute('startOffset', `${-spacing}px`)
    if (reduced) return

    let offset = -spacing
    let dir = 1
    let dragging = false
    let lastX = 0
    let velocity = 0
    let frame = 0

    const wrap = (value: number) => {
      let next = value
      if (next <= -spacing) next += spacing
      if (next > 0) next -= spacing
      return next
    }

    const step = () => {
      if (!dragging) {
        offset = wrap(offset + speed * dir)
        node.setAttribute('startOffset', `${offset}px`)
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)

    const host = node.ownerSVGElement?.parentElement
    const onDown = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      velocity = 0
      ;(event.target as Element).setPointerCapture?.(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - lastX
      lastX = event.clientX
      velocity = dx
      offset = wrap(offset + dx)
      node.setAttribute('startOffset', `${offset}px`)
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      /* Keep whatever direction the throw had; a dead release keeps the last. */
      if (velocity !== 0) dir = velocity > 0 ? 1 : -1
    }

    host?.addEventListener('pointerdown', onDown)
    host?.addEventListener('pointermove', onMove)
    host?.addEventListener('pointerup', onUp)
    host?.addEventListener('pointerleave', onUp)

    return () => {
      cancelAnimationFrame(frame)
      host?.removeEventListener('pointerdown', onDown)
      host?.removeEventListener('pointermove', onMove)
      host?.removeEventListener('pointerup', onUp)
      host?.removeEventListener('pointerleave', onUp)
    }
  }, [ready, spacing, speed, reduced])

  return (
    <div className={`umm-ribbon ${className}`.trim()}>
      <svg
        className="umm-ribbon__svg"
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        role="img"
        aria-label={items.join(', ')}
      >
        <defs>
          <path id={pathId} ref={pathRef} d={PATH} fill="none" />
        </defs>

        {/* The band and the baseline are the same curve, stroked and set. */}
        <use href={`#${pathId}`} className="umm-ribbon__band" />

        {/* Hidden, unpositioned copy used only to measure one repetition. */}
        <text
          ref={measureRef}
          className="umm-ribbon__text"
          xmlSpace="preserve"
          aria-hidden="true"
          style={{ visibility: 'hidden', pointerEvents: 'none' }}
        >
          {unit}
        </text>

        {ready && (
          <text className="umm-ribbon__text" xmlSpace="preserve" aria-hidden="true">
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={`${-spacing}px`}
              xmlSpace="preserve"
            >
              {run}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  )
}
