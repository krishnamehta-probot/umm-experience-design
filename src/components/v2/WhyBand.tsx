import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Shape } from './Shape'
import { RibbonCurtain } from './RibbonCurtain'
import { FlutedLight } from './FlutedLight'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useMagneticStops } from '@/lib/useMagneticStops'
import { ribbon, why } from '@/content/cxUiDesign'
import { Eyebrow } from './ChipHead'

/* ============================================================================
   2 · WHY DESIGN MATTERS — "ten teams → one experience", told by scroll

   The dark section rises over the hero with the strip on its top edge
   (RibbonCurtain). Ten team stickers pop into the dark one by one as each
   reaches the screen. Once
   the strip reaches the top of the screen the section holds, and the scroll
   plays four beats:

     1. The stickers fly together and snap into one pill, "experience", which
        flies into the headline and becomes the highlight on that word as the
        headline arrives.
     2–4. The three points, 01 to 03: a big shape carrying the number on the
        left, the point underlined and its line on the right.

   Everything follows the scroll: the scroll position is the story's
   position, and scrolling up plays it back. On top of that the beats are
   magnetic stops (lib/useMagneticStops): when the reader stops scrolling,
   the page settles gently on the nearest beat, each beat's resting state
   sitting exactly on its stop.

   The ground is FlutedLight, a shader of blue light through fluted glass
   that sweeps as the story moves. It stays on through the last point and
   goes out as the section leaves, handing over to the film's black.

   Phones, short windows: the same story stacked, each beat scrubbed by the
   scroll as it passes. Reduced motion: the finished state, no motion.

   The markup is the finished state. Each mode sets its own starting state
   in JS, so without JS (or with reduced motion) the section simply reads.
   ========================================================================== */

const UNDERLINE = 'M1 12 C 22 7, 46 15, 70 9 S 92 10, 99 8'

const PIN = '(min-width: 721px) and (min-height: 540px) and (prefers-reduced-motion: no-preference)'
const STACK =
  '(max-width: 720px) and (prefers-reduced-motion: no-preference), (max-height: 539px) and (prefers-reduced-motion: no-preference)'

/** How far the strip's top edge sits below the section's top: the section
 *  holds with the strip flush against the top of the screen. Mirrors the
 *  curtain's geometry (band centre 128, half-width 36, of a 1440 frame). */
const stripTop = () => Math.min(window.innerWidth * (92 / 1440), 92)

/** Position of an element inside the stage, from layout offsets, so the
 *  transforms the timeline is applying never skew it. */
function within(n: HTMLElement, stage: HTMLElement) {
  let x = 0
  let y = 0
  for (let e: HTMLElement | null = n; e && e !== stage; e = e.offsetParent as HTMLElement | null) {
    x += e.offsetLeft
    y += e.offsetTop
  }
  return { x, y }
}

/** The beats the section rests on: the headline, then each point. */
const STOPS = why.pairs.length + 1

/** Where the hold starts and how long it lasts: from the strip reaching the
 *  top of the screen until the section's bottom meets the screen's. */
const holdOf = (el: HTMLElement) => {
  const top = el.getBoundingClientRect().top + window.scrollY + stripTop()
  return { top, travel: el.offsetHeight - window.innerHeight - stripTop() }
}

function usePinMedia() {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(PIN).matches)
  useEffect(() => {
    const mq = window.matchMedia(PIN)
    const fn = () => setOn(mq.matches)
    fn()
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return on
}

/** A headline line, with the merge word as the chip wherever it falls. */
function Line({ text }: { text: string }) {
  const at = text.indexOf(why.one)
  if (at < 0) return <span className="cx-why__line">{text}</span>
  return (
    <span className="cx-why__line">
      {text.slice(0, at)}
      <span className="cx-why__one cx-why__one--inline" data-umm-tone="blossom">
        {why.one}
      </span>
      {text.slice(at + why.one.length)}
    </span>
  )
}

export function WhyBand() {
  const ref = useRef<HTMLElement>(null)
  /** the hold's scroll progress, read by the light every frame */
  const light = useRef(0)
  const pinned = usePinMedia()
  useMagneticStops(ref, STOPS, pinned, holdOf, { pace: 1.6 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const q = <T extends Element>(s: string) => el.querySelector<T>(s)!
    const all = <T extends Element>(s: string) => gsap.utils.toArray<T>(s, el)

    const stage = q<HTMLElement>('.cx-why__stage')
    const teams = all<HTMLElement>('.cx-why__team')
    const faces = teams.map((t) => t.firstElementChild as HTMLElement)
    const merged = q<HTMLElement>('.cx-why__merged')
    const inline = q<HTMLElement>('.cx-why__one--inline')
    const intro = q<HTMLElement>('.cx-why__intro')
    const pairs = all<HTMLElement>('.cx-why__pair')

    /* The stickers and the pill are centred on their spot (xPercent -50),
       so their offset is already their centre; the inline chip's centre is
       its offset plus half its size. */
    const toMerge = (t: HTMLElement) => {
      const a = within(merged, stage)
      const b = within(t, stage)
      return { x: a.x - b.x, y: a.y - b.y }
    }
    const toInline = () => {
      const a = within(inline, stage)
      const b = within(merged, stage)
      return {
        x: a.x + inline.offsetWidth / 2 - b.x,
        y: a.y + inline.offsetHeight / 2 - b.y,
        scale: inline.offsetWidth / merged.offsetWidth,
      }
    }

    /* a fixed shuffle, so the stickers leave in a lively but repeatable order */
    const order = [3, 0, 6, 8, 1, 5, 9, 2, 7, 4]

    /** Beat 1, added to tl at `at`; `pace` stretches it. */
    const teamsBeat = (tl: gsap.core.Timeline, at: number, pace: number) => {
      gsap.set(teams, { xPercent: -50, yPercent: -50, rotation: (i) => why.teams[i].r })
      gsap.set(merged, { xPercent: -50, yPercent: -50, scale: 0, rotation: -14, autoAlpha: 1 })
      gsap.set(inline, { opacity: 0 })
      teams.forEach((t, i) => {
        const go = at + order[i] * 0.07 * pace
        tl.to(t, {
          x: () => toMerge(t).x,
          y: () => toMerge(t).y,
          rotation: 0,
          scale: 0.45,
          duration: 1.4 * pace,
          ease: 'power2.in',
        }, go)
        tl.to(t, { autoAlpha: 0, duration: 0.25 * pace }, go + 1.2 * pace)
      })
      const popAt = at + 1.45 * pace
      tl.to(merged, { scale: 1, rotation: -3, duration: 0.6 * pace, ease: 'back.out(2)' }, popAt)

      const flyAt = popAt + 0.9 * pace
      tl.to(merged, {
        x: () => toInline().x,
        y: () => toInline().y,
        scale: () => toInline().scale,
        duration: 1 * pace,
        ease: 'power3.inOut',
      }, flyAt)
      tl.from('.cx-why__tag', { autoAlpha: 0, y: 12, duration: 0.6 * pace, ease: 'power3.out' }, flyAt - 0.1 * pace)
      /* one tween per line rather than a stagger: a staggered from() only
         sets its first target's start state up front, so line two showed
         early */
      all<HTMLElement>('.cx-why__line').forEach((line, i) => {
        tl.from(line, { autoAlpha: 0, y: 46, duration: 0.8 * pace, ease: 'power3.out' }, flyAt + i * 0.15 * pace)
      })
      tl.from('.cx-why__lead', { autoAlpha: 0, y: 22, duration: 0.7 * pace, ease: 'power3.out' }, flyAt + 0.55 * pace)
      tl.set(merged, { autoAlpha: 0 }, flyAt + 1 * pace)
      tl.set(inline, { opacity: 1 }, flyAt + 1 * pace)
      return flyAt + 1 * pace
    }

    /** One point coming in, added to tl at `at`: the shape spins up out of
     *  nothing with its number, then the point and its line. */
    const pairBeat = (tl: gsap.core.Timeline, pair: HTMLElement, at: number, pace: number) => {
      tl.from(pair.querySelector('.cx-why__shape'), { autoAlpha: 0, scale: 0.2, rotation: -120, duration: 0.9 * pace, ease: 'back.out(1.4)' }, at)
      tl.from(pair.querySelector('.cx-why__num'), { autoAlpha: 0, y: 40, duration: 0.6 * pace, ease: 'power3.out' }, at + 0.3 * pace)
      tl.from(pair.querySelector('.cx-why__fix'), { autoAlpha: 0, y: 56, duration: 0.7 * pace, ease: 'power3.out' }, at + 0.2 * pace)
      tl.fromTo(pair.querySelector('.cx-why__fix path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5 * pace, ease: 'power2.inOut' }, at + 0.7 * pace)
      tl.from(pair.querySelector('.cx-why__body'), { autoAlpha: 0, y: 28, duration: 0.6 * pace, ease: 'power3.out' }, at + 0.55 * pace)
    }

    /** One point leaving, so the next can take its place. */
    const pairOut = (tl: gsap.core.Timeline, pair: HTMLElement, at: number) => {
      tl.to(pair.querySelector('.cx-why__mark'), { autoAlpha: 0, scale: 0.6, rotation: 70, duration: 0.6, ease: 'power2.in' }, at)
      tl.to(pair.querySelector('.cx-why__text'), { autoAlpha: 0, y: -60, duration: 0.5, ease: 'power2.in' }, at + 0.05)
    }

    /* The stickers aren't there before the reader gets to them. Each one
       stays hidden until it is properly on screen, then pops in on its own:
       a fade, a small rise and a settle. One still below the fold stays
       unseen, and a sticker that drops back below the screen hides again.
       The pop is on a wrapper of its own, so it never fights the stickers'
       flight or their idle float. */
    let holding = () => false
    const fadeTeams = () => {
      const shown = teams.map(() => false)
      gsap.set(faces, { autoAlpha: 0, y: 26, scale: 0.7 })
      const update = () => {
        const vh = window.innerHeight
        const top = stage.getBoundingClientRect().top
        teams.forEach((t, i) => {
          const y = top + within(t, stage).y
          const on = holding() || y < vh * 0.9
          if (on === shown[i]) return
          shown[i] = on
          gsap.to(faces[i], on
            ? { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.8)', overwrite: true }
            : { autoAlpha: 0, y: 26, scale: 0.7, duration: 0.35, ease: 'power2.in', overwrite: true })
        })
      }
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: update, onRefresh: update })
      update()
    }

    const mm = gsap.matchMedia()

    /* Big screens: the section holds and the scroll plays the beats. */
    mm.add(
      PIN,
      () => {
        el.dataset.mode = 'pin'
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

        const introDone = teamsBeat(tl, 0, 1)
        /* the timeline time each beat rests at: the headline, then each
           point fully in */
        const rest = [introDone + 0.2]
        const outAt = introDone + 0.7
        tl.to(intro, { autoAlpha: 0, y: -70, duration: 0.6, ease: 'power2.in' }, outAt)

        const STEP = 2.2
        pairs.forEach((pair, i) => {
          const at = outAt + 0.4 + i * STEP
          gsap.set(pair, { autoAlpha: 0 })
          tl.set(pair, { autoAlpha: 1 }, at)
          pairBeat(tl, pair, at, 1)
          rest.push(at + 1.3)
          if (i < pairs.length - 1) pairOut(tl, pair, at + STEP - 0.3)
        })

        /* Fully scroll-driven: the scroll position is the story's position.
           Each beat's resting state sits exactly where the magnet settles
           (the middle of its lane), and the scroll between two lanes plays
           the change between them. The playhead follows the scroll with a
           short ease, so it glides rather than ticks. */
        const marks = [
          [0, 0],
          ...rest.map((t, s) => [(s + 0.5) / STOPS, t]),
          [1, rest[rest.length - 1]],
        ]
        const timeAt = (p: number) => {
          for (let k = 1; k < marks.length; k++) {
            const [p1, t1] = marks[k]
            const [p0, t0] = marks[k - 1]
            if (p <= p1) return t0 + ((t1 - t0) * (p - p0)) / Math.max(1e-6, p1 - p0)
          }
          return marks[marks.length - 1][1]
        }
        const follow = (p: number) => {
          light.current = p
          gsap.to(tl, { time: timeAt(p), duration: 0.55, ease: 'power3.out', overwrite: true })
        }
        const st = ScrollTrigger.create({
          trigger: el,
          start: () => `top top-=${stripTop()}`,
          end: 'bottom bottom',
          invalidateOnRefresh: true,
          onUpdate: (self) => follow(self.progress),
          onLeaveBack: () => follow(0),
        })
        holding = () => st.progress > 0
        fadeTeams()
        tl.time(timeAt(st.progress))

        /* The light stays on through the last point, and goes out as the
           section leaves, so it hands over to the film's black. */
        /* the bottom goes dark first (--exit masks it from below), so the
           edge that rises off the screen is already black */
        const fade = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'bottom bottom',
            end: 'bottom 55%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        fade.fromTo(q('.cx-why__light'), { '--exit': 0 }, { '--exit': 1, ease: 'none', duration: 1 }, 0)
        fade.to(q('.cx-why__light'), { autoAlpha: 0, ease: 'power1.in', duration: 0.6 }, 0.4)

        return () => {
          gsap.killTweensOf(tl)
          st.kill()
          fade.scrollTrigger?.kill()
          fade.kill()
          holding = () => false
          el.dataset.mode = 'stack'
        }
      },
      el,
    )

    /* Phones and short windows: stacked, each beat scrubbed by the scroll
       as it passes. */
    mm.add(
      STACK,
      () => {
        fadeTeams()
        const opening = gsap.timeline({
          scrollTrigger: { trigger: '.cx-why__teams', start: 'top 72%', end: 'top 5%', scrub: 0.6 },
        })
        teamsBeat(opening, 0, 0.7)
        pairs.forEach((pair) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: pair, start: 'top 90%', end: 'top 50%', scrub: 0.6 } })
          pairBeat(tl, pair, 0, 0.8)
        })
      },
      el,
    )

    /* the light settles slowly while the story plays, so the glass seems to
       turn a little under it; never below 1.04, so its edges stay off screen */
    const drift = gsap.fromTo(
      q('.cx-why__light'),
      { scale: 1.12 },
      {
        scale: 1.04,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true },
      },
    )

    return () => {
      mm.revert()
      drift.scrollTrigger?.kill()
      drift.kill()
    }
  }, [])

  return (
    <section className="cx-why" id="why" ref={ref} data-umm-theme="ink" data-mode="stack" aria-labelledby="cx-why-title">
      <div className="cx-why__pin">
        <RibbonCurtain items={ribbon} clearOf=".cx-hero__copy" />

        <div className="cx-why__stage">
          <FlutedLight progress={light} />

          {/* the ten teams, and the one pill they become */}
          <div className="cx-why__teams" aria-hidden="true">
            {why.teams.map((t) => (
              <span className="cx-why__team" key={t.name} data-umm-tone={t.tone} style={{ left: `${t.x}%`, top: `${t.y}%` }}>
                <span className="cx-why__pop">
                  <span>{t.name}</span>
                </span>
              </span>
            ))}
            <span className="cx-why__one cx-why__merged" data-umm-tone="blossom">
              {why.one}
            </span>
          </div>

          <div className="umm-container cx-why__inner">
            <div className="cx-why__beat cx-why__intro">
              <Eyebrow className="cx-why__tag">{why.chip}</Eyebrow>
              <h2 className="cx-why__title" id="cx-why-title">
                <Line text={why.line1} /> <Line text={why.line2} />
              </h2>
              <p className="cx-lead cx-why__lead">{why.lead}</p>
            </div>

            {why.pairs.map((pair, i) => (
              <div className="cx-why__beat cx-why__pair" key={pair.title} data-umm-tone={pair.tone}>
                <div className="cx-why__mark" aria-hidden="true">
                  <Shape name={pair.shape} tone={pair.tone} className="cx-why__shape" />
                  <span className="cx-why__num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="cx-why__text">
                  <h3 className="cx-why__fix">
                    {pair.title}
                    <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                      <path d={UNDERLINE} pathLength={1} />
                    </svg>
                  </h3>
                  <p className="cx-why__body">{pair.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* the scroll the beats play over, while the section holds */}
      <div className="cx-why__runway" aria-hidden="true" />
    </section>
  )
}
