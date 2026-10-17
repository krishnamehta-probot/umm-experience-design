import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { LottieMark } from '@/components/primitives'
import type { ServiceMarks } from '@/components/v2/ServicesV2'
import { gsap } from '@/lib/gsap'
import { services as services0 } from '@/content/growth'
import { Doodle, Wand, type DoodleKind } from './doodles'
import '@/styles/gensify-stage.css'

import align from '@/lottie/growth-services/align.json'
import position from '@/lottie/growth-services/position.json'
import attract from '@/lottie/growth-services/attract.json'
import develop from '@/lottie/growth-services/develop.json'
import learn from '@/lottie/growth-services/learn.json'
import connect from '@/lottie/growth-services/connect.json'

/* ============================================================================
   INTEGRATED GROWTH · THE GENSIFY STAGE

   17 Oct, Krish: "the 7th service is genzify so it needs to be kind of
   animation from 6 service and such animation transition which can show
   like all 6 services are there in genz mode".

   A strip across the top of the Gensify card. The six services sit on it
   as six small tiles, each in its own tone with its own scene playing (the
   same Lottie marks as the cards above, on the same player). Then a wand
   sweeps across: the board turns holographic behind it, and as the star
   passes each tile the tile flips edge-on and lands in Gen-Z mode, bouncing
   past its mark: a sticker, tilted, in a punchier take on its colour, with
   a thick ink outline and a hard ink shadow, its name on a pill, doodles
   popping on round it. It holds, bobbing, then eases back and goes again.

   The loop is one GSAP timeline, played only while the stage is on screen.
   Reduced motion gets the Gen-Z state, still (gensify-stage.css).
   Decorative throughout: the words on it are the services' own steps.
   ========================================================================== */

/** The page's six scenes, keyed as its service cards carry them. */
const MARKS: ServiceMarks = {
  research: align,
  interface: position,
  journey: attract,
  testing: develop,
  data: learn,
  brand: connect,
}

type Spot = 'tl' | 'tr' | 'bl' | 'br'
type Fill = 'sun' | 'citrus' | 'blossom' | 'sky' | 'coral' | 'paper'

/** Each tile's lean once it is a sticker. */
const TILT = [-5, 4, -3, 5, -4, 3]

/** What pops on round each tile, where, in which colour. */
const STICKERS: [DoodleKind, Spot, Fill][][] = [
  [
    ['star', 'tr', 'citrus'],
    ['sparkle', 'bl', 'paper'],
  ],
  [
    ['smiley', 'tl', 'sun'],
    ['sparkle', 'br', 'sky'],
  ],
  [
    ['squiggle', 'tr', 'blossom'],
    ['star', 'bl', 'sun'],
  ],
  [
    ['heart', 'tl', 'coral'],
    ['sparkle', 'br', 'paper'],
  ],
  [
    ['sparkle', 'tr', 'sun'],
    ['smiley', 'bl', 'citrus'],
  ],
  [
    ['star', 'tl', 'sky'],
    ['squiggle', 'tr', 'sun'],
  ],
]

/** The dust the wand leaves: left %, top %, size. */
const TRAIL: [number, number, number][] = [
  [5, 20, 0.8],
  [12, 78, 0.6],
  [21, 12, 1],
  [30, 84, 0.7],
  [39, 22, 0.6],
  [48, 74, 0.9],
  [57, 14, 0.7],
  [66, 82, 0.6],
  [75, 18, 1],
  [84, 76, 0.7],
  [93, 30, 0.6],
]

/* the beats, in seconds */
const CALM = 1.5 // the services as they are
const SWEEP = 1.7 // the wand, edge to edge
const HALF = 0.17 // a tile turning edge-on
const HOLD = 3.1 // Gen-Z mode
const TAIL = 0.5 // calm again before the next pass
const GZ = 0.9 // a sticker's size, so the tilted ones clear each other

type Item = (typeof services0.items)[number]

export function GensifyStage({ items = services0.items }: { items?: Item[] }) {
  const stage = useRef<HTMLDivElement>(null)
  const loop = useRef<gsap.core.Timeline | null>(null)
  const seen = useRef(false)
  const [live, setLive] = useState(false)

  // Only on screen: the scenes mount and the loop plays.
  useEffect(() => {
    const node = stage.current
    if (!node) return
    const io = new IntersectionObserver(
      ([entry]) => {
        seen.current = entry.isIntersecting
        setLive(entry.isIntersecting)
        if (entry.isIntersecting) loop.current?.play()
        else loop.current?.pause()
      },
      { threshold: 0.15 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  // Built again when the row becomes a 3 x 2 grid (the order the wand meets
  // the tiles changes), and not at all for reduced motion.
  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const mm = gsap.matchMedia(el)
    mm.add({ row: '(min-width: 720px)', motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
      if (!ctx.conditions?.motion) return
      const tl = build(el)
      loop.current = tl
      if (seen.current) tl.play()
      return () => {
        loop.current = null
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <div className="gx-stage" ref={stage} data-live={live || undefined} aria-hidden="true">
      <span className="gx-stage__holo" />
      <div className="gx-stage__tiles">
        {items.map((s, i) => (
          <div
            key={s.step}
            className="gx-tile"
            data-umm-tone={s.tone}
            style={{ '--tilt': `${TILT[i % TILT.length]}deg`, '--i': i } as CSSProperties}
          >
            <svg className="gx-tile__burst" viewBox="0 0 120 100" preserveAspectRatio="none">
              <path d="M30 9 26 1M60 8V0M90 9l4-8M30 91l-4 8M60 92v8M90 91l4 8M7 35 0 30M7 65l-7 5M113 35l7-5M113 65l7 5" />
            </svg>
            <div className="gx-tile__body">
              <span className="gx-tile__calm" />
              <span className="gx-tile__pop">
                <span className="gx-tile__sheen" />
              </span>
              <span className="gx-tile__no">{String(i + 1).padStart(2, '0')}</span>
              <LottieMark data={MARKS[s.mark]} playing={live} still={0} className="gx-tile__mark" />
              <span className="gx-tile__name">{s.step}</span>
              <span className="gx-tile__tag">{s.step}</span>
              {(STICKERS[i % STICKERS.length] ?? []).map(([kind, spot, fill]) => (
                <span key={spot} className="gx-sticker" data-spot={spot} data-kind={kind} data-fill={fill}>
                  <Doodle kind={kind} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="gx-trail">
        {TRAIL.map(([x, y, s]) => (
          <span key={x} style={{ left: `${x}%`, top: `${y}%`, '--s': s } as CSSProperties}>
            <Doodle kind="sparkle" />
          </span>
        ))}
      </div>
      <div className="gx-stage__track">
        <span className="gx-wand">
          <Wand />
        </span>
      </div>
    </div>
  )
}

/** The whole pass as one looping timeline, timed off where the tiles sit. */
function build(el: HTMLElement) {
  const q = gsap.utils.selector(el)
  const tiles = q('.gx-tile') as HTMLElement[]
  const holo = q('.gx-stage__holo')[0] as HTMLElement
  const track = q('.gx-stage__track')[0] as HTMLElement
  const wand = q('.gx-wand')[0] as HTMLElement
  const trail = q('.gx-trail > span') as HTMLElement[]
  const sheens = q('.gx-tile__sheen')
  const bodies = q('.gx-tile__body')
  const stickers = q('.gx-sticker')

  const box = el.getBoundingClientRect()
  const tBox = track.getBoundingClientRect()
  const wBox = wand.getBoundingClientRect()
  // The track is the stage plus a margin; it slides from fully left of the
  // stage to flush with it. The star rides a fixed distance in from the
  // track's right edge, so the moment it is over any x is known.
  const span = tBox.width
  const lead = tBox.right - (wBox.left + wBox.width * 0.7)
  const at = (x: number) => CALM + (SWEEP * (x + lead)) / span

  gsap.set(tiles, { transformPerspective: 760, '--gz': 0 })
  gsap.set(stickers, { scale: 0, rotation: -35 })
  gsap.set(q('.gx-tile__burst'), { scale: 0.6, autoAlpha: 0 })
  gsap.set(sheens, { x: 0, xPercent: -170, skewX: -16 })
  gsap.set([holo, track], { x: 0, xPercent: -100 })
  gsap.set(trail, { scale: 0, rotation: -45 })

  const tl = gsap.timeline({ repeat: -1, paused: true })

  // The wand crosses, the board turning holographic behind it.
  tl.to([holo, track], { xPercent: 0, duration: SWEEP, ease: 'none' }, CALM)
  tl.to(
    wand,
    {
      keyframes: {
        '0%': { y: 14, rotation: -20 },
        '30%': { y: -12, rotation: 4 },
        '62%': { y: 9, rotation: -8 },
        '100%': { y: -6, rotation: 8 },
        easeEach: 'sine.inOut',
      },
      duration: SWEEP,
    },
    CALM,
  )

  trail.forEach((s) => {
    const t = at(s.offsetLeft)
    tl.to(s, { scale: 1, rotation: 45, duration: 0.24, ease: 'back.out(3)' }, t).to(
      s,
      { scale: 0, rotation: 120, duration: 0.55, ease: 'power2.in' },
      t + 0.4,
    )
  })

  // Each tile flips as the star passes over its middle.
  let landed = 0
  tiles.forEach((tile, i) => {
    const r = tile.getBoundingClientRect()
    const row = Math.round((r.top - box.top) / Math.max(1, r.height))
    const t = at(r.left - box.left + r.width / 2) - HALF + row * 0.08
    const tilt = TILT[i % TILT.length]
    tl.to(tile, { rotationY: 90, scale: 0.9, duration: HALF, ease: 'power2.in' }, t)
      .set(tile, { rotationY: -90, '--gz': 1 }, t + HALF)
      .to(tile, { rotationY: 0, rotation: tilt, scale: GZ, duration: 0.85, ease: 'back.out(2.6)' }, t + HALF)
      .set(tile.querySelector('.gx-tile__burst'), { scale: 0.6, autoAlpha: 1 }, t + HALF)
      .to(
        tile.querySelector('.gx-tile__burst'),
        { scale: 1.2, autoAlpha: 0, duration: 0.5, ease: 'power2.out' },
        t + HALF,
      )
      .to(
        tile.querySelectorAll('.gx-sticker'),
        { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(3.2)', stagger: 0.1 },
        t + HALF + 0.18,
      )
    landed = Math.max(landed, t + HALF + 0.85)
  })

  // Gen-Z mode: a gloss runs over each sticker, and they bob.
  tl.to(sheens, { xPercent: 170, duration: 0.9, ease: 'power1.inOut', stagger: 0.09 }, landed - 0.3)
  tl.to(bodies, { y: -5, duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: 3, stagger: 0.1 }, landed)

  // Ease back: the doodles go, each tile turns back, right to left, and the
  // board fades to paper.
  const back = landed + HOLD
  tl.to(
    stickers,
    { scale: 0, rotation: 30, duration: 0.3, ease: 'back.in(2)', stagger: { each: 0.025, from: 'end' } },
    back,
  )
  const n = tiles.length
  tiles.forEach((tile, i) => {
    const t = back + 0.25 + (n - 1 - i) * 0.07
    tl.to(
      tile,
      { rotationY: -90, rotation: TILT[i % TILT.length] / 2, scale: 0.94, duration: 0.2, ease: 'power2.in' },
      t,
    )
      .set(tile, { rotationY: 90, '--gz': 0 }, t + 0.2)
      .to(tile, { rotationY: 0, rotation: 0, scale: 1, duration: 0.6, ease: 'power3.out' }, t + 0.2)
  })
  tl.to(holo, { autoAlpha: 0, duration: 0.7, ease: 'power1.inOut' }, back + 0.3)
  const reset = back + 0.3 + 0.7 + 0.05
  tl.set([holo, track], { xPercent: -100 }, reset)
  tl.set(holo, { autoAlpha: 1 }, reset + 0.02)
  tl.set(sheens, { xPercent: -170 }, reset + 0.02)
  tl.to({}, { duration: TAIL }, reset + 0.05)
  return tl
}
