import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton } from '@/components/primitives'
import { WordFill } from './WordFill'
import { HaloLight, type HaloLightMode } from './HaloLight'
import type { HaloRing, RingFinish } from './HaloRing'
import type { HouseHeroContent } from './HouseHero'
import '@/styles/halo-hero.css'

/* ============================================================================
   HALO HERO — from the round-3 "Halo" still Krish liked (2 Nov), kept as two
   options

   Centred: the headline at the house size, its last word in the moving foil,
   the paragraph and buttons, the sectors along the foot as the homepage's
   slash row. Round the copy, the halo:
     halo   a soft ring of the five pastels drawn as live light (HaloLight):
            liquid, corona or prism, or "soft", the still's plain CSS blur
     orbit  a 3D twisted band orbiting the headline (HaloRing), its far half
            behind the words and its near half in front: chrome, pearl or
            glass, over the still's soft blur

   `?options` shows a switch for the halo's look; `?halo=` and `?ring=` open
   on one.
   ========================================================================== */

type HaloKind = 'halo' | 'orbit'
type Look = HaloLightMode | 'soft' | RingFinish

const LOOKS: Record<HaloKind, { id: Look; label: string }[]> = {
  halo: [
    { id: 'liquid', label: 'Liquid' },
    { id: 'corona', label: 'Corona' },
    { id: 'prism', label: 'Prism' },
    { id: 'soft', label: 'Soft' },
  ],
  orbit: [
    { id: 'chrome', label: 'Chrome' },
    { id: 'pearl', label: 'Pearl' },
    { id: 'glass', label: 'Glass' },
  ],
}

/** where `el` sits inside `root`, by layout alone: a line still rising (a
 *  transform) does not move it */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0
  let y = 0
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  return { x, y }
}

export function HaloHero({ content, kind = 'halo' }: { content: HouseHeroContent; kind?: HaloKind }) {
  const stage = useRef<HTMLDivElement>(null)
  const lightHost = useRef<HTMLDivElement>(null)
  const back = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const foilHost = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const slot = useRef<HTMLSpanElement>(null)
  const base = useRef<HTMLElement>(null)
  const light = useRef<HaloLight | null>(null)
  const ring = useRef<HaloRing | null>(null)
  const params = new URLSearchParams(window.location.search)
  const options = params.has('options')
  const looks = LOOKS[kind]
  const [look, setLook] = useState<Look>(() => {
    const q = params.get(kind === 'halo' ? 'halo' : 'ring')
    return looks.some((l) => l.id === q) ? (q as Look) : looks[0].id
  })
  const lookRef = useRef(look)
  lookRef.current = look

  const [first, ...rest] = content.lines
  const accent = rest[rest.length - 1]
  const middle = rest.slice(0, -1).join(' ')

  useEffect(() => {
    const st = stage.current!
    delete st.dataset.flat
    delete st.dataset.flatlight
    let foil: WordFill | null = null
    try {
      foil = new WordFill(foilHost.current!, 'foil')
    } catch {
      st.dataset.flat = '' /* no WebGL: the word is set as plain type */
    }
    if (kind === 'halo') {
      const mode = lookRef.current === 'soft' ? 'liquid' : (lookRef.current as HaloLightMode)
      try {
        light.current = new HaloLight(lightHost.current!, mode)
      } catch {
        st.dataset.flatlight = '' /* no WebGL: the halo is the CSS blur */
      }
    }

    const measure = () => {
      if (kind === 'halo') {
        /* the halo: round the copy, a little wider than the headline */
        const b = body.current!
        const radius = Math.min(Math.max(st.clientWidth * 0.27, 300), st.clientHeight * 0.44)
        light.current?.layout(b.offsetLeft + b.offsetWidth / 2, b.offsetTop + b.offsetHeight / 2, radius)
      } else {
        /* the orbit: centred on the headline, a little wider than it */
        const t = title.current!
        const at = offsetIn(t, st)
        const radius = Math.min(t.offsetWidth * 0.62, st.clientWidth * 0.48)
        ring.current?.layout(at.x + t.offsetWidth / 2, at.y + t.offsetHeight / 2, radius)
      }
      /* the foil word, laid exactly over its transparent copy */
      const el = slot.current!
      const size = parseFloat(getComputedStyle(el).fontSize)
      const pad = Math.round(size * 0.05)
      const w = offsetIn(el, st)
      const baseline = offsetIn(base.current!, st).y
      foil?.setWord(
        accent,
        '500 {size} Mosvita, sans-serif',
        size,
        pad,
        { x: w.x - pad, y: baseline - size * 0.77, w: el.offsetWidth + pad * 2, h: size * 0.86 },
        -0.034,
      )
    }
    let mraf = 0
    const remeasure = () => {
      cancelAnimationFrame(mraf)
      mraf = requestAnimationFrame(measure)
    }
    const ro = new ResizeObserver(remeasure)

    let cancelled = false
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return
      measure()
      ro.observe(st)
      requestAnimationFrame(() => (st.dataset.in = ''))
      if (kind !== 'orbit') return
      /* three.js loads on its own, after the headline has painted */
      import('./HaloRing')
        .then(({ HaloRing }) => {
          if (cancelled) return
          try {
            ring.current = new HaloRing(back.current!, front.current!, lookRef.current as RingFinish)
            measure()
            st.dataset.ring = ''
          } catch {
            /* no WebGL: the soft blur alone */
          }
        })
        .catch(() => {})
    })

    return () => {
      cancelled = true
      ro.disconnect()
      cancelAnimationFrame(mraf)
      foil?.dispose()
      light.current?.dispose()
      light.current = null
      ring.current?.dispose()
      ring.current = null
    }
  }, [accent, kind])

  useEffect(() => {
    if (kind === 'halo' && look !== 'soft') light.current?.setMode(look as HaloLightMode)
    if (kind === 'orbit') ring.current?.setFinish(look as RingFinish)
  }, [look, kind])

  return (
    <section className={`hx hx--${kind}`} aria-labelledby="hx-title">
      <div ref={stage} className="hx__stage" data-soft={kind === 'halo' && look === 'soft' ? '' : undefined}>
        <div className="hx__aura" aria-hidden="true" />
        {kind === 'halo' ? (
          <div ref={lightHost} className="hx__layer hx__layer--light" aria-hidden="true" />
        ) : (
          <div ref={back} className="hx__layer hx__layer--back" aria-hidden="true" />
        )}
        <MegaNav />

        <div ref={body} className="hx__body">
          <p className="hx__eyebrow">{content.eyebrow}</p>
          <h1 ref={title} id="hx-title" className="hx__title">
            <span className="hx__line" style={{ '--i': 0 } as CSSProperties}>
              <span>{first}</span>
            </span>
            <span className="hx__line" style={{ '--i': 1 } as CSSProperties}>
              <span>
                {middle} <i ref={base} className="hx__base" />
                <span ref={slot} className="hx__foil">
                  {accent}
                </span>
              </span>
            </span>
          </h1>
          <p className="hx__lead">{content.lead}</p>
          <div className="hx__actions">
            <SplitButton href={content.primary.href}>{content.primary.label}</SplitButton>
            <a className="hx__more" href={content.secondary.href}>
              {content.secondary.label} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <ul className="hx__row" aria-label="Sectors">
          {content.sectors.map((s) => (
            <li key={s}>{s} /</li>
          ))}
        </ul>

        <div ref={foilHost} className="hx__layer hx__layer--foil" aria-hidden="true" />
        {kind === 'orbit' && <div ref={front} className="hx__layer hx__layer--front" aria-hidden="true" />}

        {options && (
          <div className="hx__dock" role="group" aria-label={kind === 'halo' ? 'Halo' : 'Ring finish'}>
            <span>{kind === 'halo' ? 'Halo' : 'Ring'}</span>
            {looks.map((l) => (
              <button key={l.id} type="button" aria-pressed={l.id === look} onClick={() => setLook(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
