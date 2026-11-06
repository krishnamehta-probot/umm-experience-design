import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import type { GlassShape } from '@/components/v2/GlassCube3D'
import { useReducedMotion } from '@/lib/useReducedMotion'
import '@/styles/fin-kit.css'

/* ============================================================================
   THE GLASS KIT — what the two modern Fintech pages share (6 Nov)

   CoolIcon     UMM's Cool Shapes icons (the case-study page's), in the
                brand pastels
   GlassObject  a real glass object in 3D (GlassCube3D: card, coin, shield…)
   Reed         a pane of reeded glass laid over part of a tile: what is
                behind it is frosted and fluted, the rest stays sharp
   useCycle     tabs that step on by themselves while in view, pause under
                the pointer, and stop once one is picked; `--p` on the host
                is the current step's progress (0–1)
   useStep      a step counter that turns over while in view
   ========================================================================== */

const GlassCube3D = lazy(() => import('@/components/v2/GlassCube3D'))

export type IconName =
  | 'fintech'
  | 'technology'
  | 'telecom'
  | 'energy'
  | 'manufacturing'
  | 'ecommerce'
  | 'healthcare'
  | 'biotech'
  | 'real-estate'
  | 'media'
  | 'gaming'
  | 'hospitality'
  | 'beauty-and-wellness'
  | 'healthtech'

export const css = (o: Record<string, string | number>) => o as CSSProperties

export const pad = (n: number) => String(n + 1).padStart(2, '0')

/** the industry's Cool Shape: its own bright gradient, UMM's pastels, or flat
 *  in a single UMM pastel (`look`, else `bright` picks between the first two) */
export function CoolIcon({
  name,
  bright = false,
  look,
  className = '',
}: {
  name: IconName
  bright?: boolean
  look?: 'bright' | 'pastel' | 'single'
  className?: string
}) {
  const finish = look ?? (bright ? 'bright' : 'pastel')
  return (
    <img
      className={`kit-icon ${className}`.trim()}
      src={`/casestudies/icon/${name}${finish === 'bright' ? '' : `-${finish}`}.webp`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  )
}

export function GlassObject({ shape, className = '' }: { shape: GlassShape; className?: string }) {
  return (
    <div className={`kit-glass ${className}`.trim()} aria-hidden="true">
      <Suspense fallback={null}>
        <GlassCube3D shape={shape} />
      </Suspense>
    </div>
  )
}

export function Reed({ className = '' }: { className?: string }) {
  return <span className={`kit-reed ${className}`.trim()} aria-hidden="true" />
}

export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg className="kit-arrow" viewBox="0 0 24 24" aria-hidden="true" style={down ? { rotate: '135deg' } : undefined}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  )
}

export function useCycle<T extends HTMLElement = HTMLDivElement>(count: number, ms: number) {
  const host = useRef<T | null>(null)
  const [i, setI] = useState(0)
  const auto = useRef(true)
  const acc = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = host.current
    if (!el || reduced) return
    let raf = 0
    let last = 0
    let hover = false
    let running = false
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 100) : 0
      last = now
      if (auto.current && !hover) {
        acc.current += dt
        if (acc.current >= ms) {
          acc.current = 0
          setI((v) => (v + 1) % count)
        }
      }
      el.style.setProperty('--p', auto.current ? (acc.current / ms).toFixed(4) : '1')
      if (auto.current) raf = requestAnimationFrame(tick)
      else running = false
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && auto.current && !running) {
          running = true
          last = 0
          raf = requestAnimationFrame(tick)
        } else if (!e.isIntersecting && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    const on = () => (hover = true)
    const off = () => (hover = false)
    el.addEventListener('pointerenter', on)
    el.addEventListener('pointerleave', off)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointerenter', on)
      el.removeEventListener('pointerleave', off)
    }
  }, [count, ms, reduced])

  const pick = (n: number) => {
    auto.current = false
    acc.current = 0
    host.current?.style.setProperty('--p', '1')
    setI(n)
  }
  return { i, pick, host }
}

export function useStep<T extends HTMLElement = HTMLDivElement>(count: number, ms: number, reset: unknown) {
  const ref = useRef<T | null>(null)
  const [k, setK] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => setK(0), [reset])
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let id = 0
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearInterval(id)
        if (e.isIntersecting) id = window.setInterval(() => setK((v) => (v + 1) % count), ms)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearInterval(id)
    }
  }, [count, ms, reduced])
  return { k, ref }
}

/** which boxes of the reference architecture each step of the work lights:
 *  experiences, workflows, systems */
export const LIT: { e: number[]; w: number[]; s: number[] }[] = [
  { e: [0], w: [0], s: [] },
  { e: [], w: [0, 1], s: [0, 1] },
  { e: [1], w: [2], s: [0] },
  { e: [0], w: [2], s: [2] },
]

/** "From X to Y." → ["From X", "to Y."] */
export function splitShift(title: string): [string, string] {
  const at = title.indexOf(' to ')
  return at < 0 ? [title, ''] : [title.slice(0, at), title.slice(at + 1)]
}
