import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useReducedMotion } from './useReducedMotion'

/* ============================================================================
   THE JOURNEY ENGINE

   The conceptual spine of the page: a CX page should itself feel like a
   customer journey, so the reader's scroll position is modelled as travel
   between numbered stations.

   Two values drive every scroll-reactive component on the page:

     activeIndex  which station the reader is currently inside
     progress     0..1 position along the whole journey

   `progress` is deliberately station-aware rather than a raw scroll fraction.
   Station i occupies the slot [i/count, (i+1)/count], so the travelling marker
   lands exactly on a station's dot at the midpoint of that section. A raw
   scrollY/scrollHeight fraction would drift away from the dots, because
   sections differ wildly in height, and the rail would read as broken.
   ========================================================================== */

export type Station = {
  /** DOM id of the section this station maps to. */
  id: string
  /** Short label shown on the rail when the station is active. */
  label: string
  /** Set when the section renders on ink, so the rail can invert over it. */
  dark?: boolean
}

type JourneyValue = {
  stations: Station[]
  activeIndex: number
  /** 0..1 along the whole journey. */
  progress: number
  /** 0..1 within the active station's own section. */
  stationProgress: number
  goTo: (id: string) => void
}

const JourneyContext = createContext<JourneyValue | null>(null)

/** The viewport line that decides "which section am I reading". */
const FOCUS_RATIO = 0.42

type Bounds = { id: string; top: number; height: number }

export function JourneyProvider({
  stations,
  children,
}: {
  stations: Station[]
  children: ReactNode
}) {
  const reduced = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [stationProgress, setStationProgress] = useState(0)

  // Cached document-space geometry, recomputed only on resize/reflow so the
  // scroll handler never triggers a layout pass of its own.
  const boundsRef = useRef<Bounds[]>([])
  const frameRef = useRef(0)

  useEffect(() => {
    if (reduced) return

    const measure = () => {
      const scrollY = window.scrollY
      boundsRef.current = stations
        .map(({ id }) => {
          const el = document.getElementById(id)
          if (!el) return null
          const rect = el.getBoundingClientRect()
          return { id, top: rect.top + scrollY, height: rect.height }
        })
        .filter((b): b is Bounds => b !== null)
    }

    const update = () => {
      frameRef.current = 0
      const bounds = boundsRef.current
      if (bounds.length === 0) return

      const count = bounds.length
      const focusY = window.scrollY + window.innerHeight * FOCUS_RATIO

      let index = 0
      let intra = 0

      if (focusY <= bounds[0].top) {
        index = 0
        intra = 0
      } else {
        const last = bounds[count - 1]
        if (focusY >= last.top + last.height) {
          index = count - 1
          intra = 1
        } else {
          for (let i = 0; i < count; i++) {
            const b = bounds[i]
            if (focusY >= b.top && focusY < b.top + b.height) {
              index = i
              intra = b.height > 0 ? (focusY - b.top) / b.height : 0
              break
            }
            // Gaps between sections resolve to the section just passed.
            if (focusY < b.top) {
              index = Math.max(0, i - 1)
              intra = 1
              break
            }
          }
        }
      }

      const clampedIntra = Math.min(1, Math.max(0, intra))
      setActiveIndex(index)
      setStationProgress(clampedIntra)
      setProgress(Math.min(1, Math.max(0, (index + clampedIntra) / count)))
    }

    const onScroll = () => {
      if (frameRef.current) return
      frameRef.current = requestAnimationFrame(update)
    }

    const onResize = () => {
      measure()
      onScroll()
    }

    measure()
    update()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    // Sections change height when accordions open or tabs switch panels.
    const ro = new ResizeObserver(onResize)
    ro.observe(document.body)

    // Late-loading webfonts reflow the page after first measure.
    if (document.fonts?.ready) {
      document.fonts.ready.then(onResize).catch(() => {})
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [stations, reduced])

  const value = useMemo<JourneyValue>(
    () => ({
      stations,
      activeIndex,
      progress,
      stationProgress,
      goTo: (id: string) => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      },
    }),
    [stations, activeIndex, progress, stationProgress, reduced]
  )

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export function useJourney(): JourneyValue {
  const ctx = useContext(JourneyContext)
  if (!ctx) throw new Error('useJourney must be used inside a <JourneyProvider>')
  return ctx
}
