import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { withAccent } from './ChipHead'
import { Shape } from './Shape'
import { RibbonCurtain } from './RibbonCurtain'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { ribbon, why } from '@/content/cxUiDesign'

/* ============================================================================
   2 · WHY IT MATTERS — "ten teams → one company", told by scroll

   The dark section rises over the hero with the strip on its top edge
   (RibbonCurtain). Once the strip reaches the top of the screen the section
   holds, and the scroll plays four beats:

     1. Ten team stickers float across the dark. They fly together and snap
        into one pill, "one company", which flies into the headline and
        becomes the highlight on those words as the headline arrives.
     2–4. Each pain sits big in the middle. The scroll scratches it out, then
        the fix rises in with its shape and one line of explanation.

   A 01 · 02 · 03 counter tracks the three pairs. The four beats are
   magnetic stops (lib/useMagneticStops), like the pinned sections further
   down: the scroll picks the beat and the beat plays through as a whole
   animation at its own pace, however fast the wheel turns, and the page
   settles on the nearest beat when the reader stops. Scrolling up plays
   the beats back in reverse. The light fades out over the last stretch,
   so the section hands over to the film's black without a seam.

   Phones, short windows: the same story stacked, each beat playing once as
   it arrives. Reduced motion: the finished state, no motion.

   The markup is the finished state. Each mode sets its own starting state
   in JS, so without JS (or with reduced motion) the section simply reads.
   ========================================================================== */

/* Drawn in a 100 x 24 box stretched over the words: two passes back and
   forth through the middle of the line, like a pen crossing it out. */
const SCRATCH = ['M2 11 C 20 7, 42 14, 62 9 S 88 12, 98 8', 'M97 15 C 76 19, 50 12, 28 16 S 8 14, 3 17']
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

/** The beats the section rests on: the headline, then each pain → fix. */
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

export function WhyBand() {
  const ref = useRef<HTMLElement>(null)
  const [before, after] = why.line1.split(why.one)
  const pinned = usePinMedia()
  useMagneticStops(ref, STOPS, pinned, holdOf)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const q = <T extends Element>(s: string) => el.querySelector<T>(s)!
    const all = <T extends Element>(s: string) => gsap.utils.toArray<T>(s, el)

    const stage = q<HTMLElement>('.cx-why__stage')
    const teams = all<HTMLElement>('.cx-why__team')
    const merged = q<HTMLElement>('.cx-why__merged')
    const inline = q<HTMLElement>('.cx-why__one--inline')
    const intro = q<HTMLElement>('.cx-why__intro')
    const pairs = all<HTMLElement>('.cx-why__pair')
    const counts = all<HTMLElement>('.cx-why__count li')

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

    /** Beat 1, added to tl at `at`; `pace` stretches it for scrubbing. */
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
      tl.from('.cx-why__tag', { autoAlpha: 0, scale: 0.6, rotation: '+=14', duration: 0.6 * pace, ease: 'back.out(2)' }, flyAt - 0.1 * pace)
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

    /** One pain → fix beat, added to tl at `at`. */
    const pairBeat = (tl: gsap.core.Timeline, pair: HTMLElement, at: number, pace: number) => {
      const [p1, p2] = pair.querySelectorAll('.cx-why__pain path')
      tl.from(pair.querySelector('.cx-why__shape'), { autoAlpha: 0, scale: 0.3, rotation: -140, duration: 0.7 * pace, ease: 'back.out(1.6)' }, at)
      tl.from(pair.querySelector('.cx-why__pain'), { autoAlpha: 0, y: 56, duration: 0.6 * pace, ease: 'power3.out' }, at + 0.05 * pace)
      tl.fromTo(p1, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45 * pace, ease: 'power1.inOut' }, at + 0.7 * pace)
      tl.fromTo(p2, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4 * pace, ease: 'power1.inOut' }, at + 1.1 * pace)
      tl.fromTo(pair.querySelector('.cx-why__strike'), { opacity: 1 }, { opacity: 0.42, duration: 0.4 * pace }, at + 0.9 * pace)
      tl.from(pair.querySelector('.cx-why__fix'), { autoAlpha: 0, y: 48, duration: 0.6 * pace, ease: 'power3.out' }, at + 1.25 * pace)
      tl.fromTo(pair.querySelector('.cx-why__fix path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5 * pace, ease: 'power2.inOut' }, at + 1.55 * pace)
      tl.from(pair.querySelector('.cx-why__body'), { autoAlpha: 0, y: 24, duration: 0.5 * pace, ease: 'power3.out' }, at + 1.5 * pace)
    }

    const mm = gsap.matchMedia()

    /* Big screens: the section holds and the scroll plays the beats. */
    mm.add(
      PIN,
      () => {
        el.dataset.mode = 'pin'
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

        const introDone = teamsBeat(tl, 0, 1)
        /* where each beat rests: -1 is before the hold, 0 the headline,
           then each pair with its fix fully in */
        const rest = [0, introDone + 0.2]
        const outAt = introDone + 0.7
        tl.to(intro, { autoAlpha: 0, y: -70, duration: 0.6, ease: 'power2.in' }, outAt)
        tl.from('.cx-why__count', { autoAlpha: 0, x: 16, duration: 0.4 }, outAt + 0.2)

        const STEP = 2.6
        pairs.forEach((pair, i) => {
          const at = outAt + 0.4 + i * STEP
          gsap.set(pair, { autoAlpha: 0 })
          tl.set(pair, { autoAlpha: 1 }, at)
          pairBeat(tl, pair, at, 1)
          rest.push(at + 2.15)
          tl.fromTo(counts[i], { opacity: 0.3 }, { opacity: 1, duration: 0.2 }, at)
          if (i < pairs.length - 1) {
            tl.to(counts[i], { opacity: 0.3, duration: 0.2 }, at + STEP)
            tl.to(pair, { autoAlpha: 0, y: -70, duration: 0.5, ease: 'power2.in' }, at + STEP - 0.15)
          }
        })
        /* The scroll picks the beat; the timeline plays to it at its own
           pace (about 0.8s per unit of the timeline, so a whole beat takes
           a second and a half to two). */
        let beat = -2
        let play: gsap.core.Tween | null = null
        const goTo = (b: number) => {
          if (b === beat) return
          beat = b
          const to = rest[b + 1]
          play?.kill()
          const d = Math.abs(to - tl.time())
          play = tl.tweenTo(to, { duration: Math.min(3.2, Math.max(0.5, d * 0.8)), ease: 'power1.inOut' })
        }
        const st = ScrollTrigger.create({
          trigger: el,
          start: () => `top top-=${stripTop()}`,
          end: 'bottom bottom',
          invalidateOnRefresh: true,
          onUpdate: (self) => goTo(self.progress <= 0 ? -1 : stopAt(self.progress, STOPS)),
          onLeaveBack: () => goTo(-1),
        })
        goTo(st.progress <= 0 ? -1 : stopAt(st.progress, STOPS))

        /* After the last fix the light goes out over the last stretch, so the
           section leaves as plain black and hands over to the film's black
           without a seam. */
        const fade = gsap.to(q('.cx-why__light'), {
          autoAlpha: 0,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: el,
            start: () => `bottom bottom+=${Math.round(window.innerHeight * 0.3)}`,
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        return () => {
          play?.kill()
          st.kill()
          fade.scrollTrigger?.kill()
          fade.kill()
          tl.kill()
          el.dataset.mode = 'stack'
        }
      },
      el,
    )

    /* Phones and short windows: stacked, each beat plays once on arrival. */
    mm.add(
      STACK,
      () => {
        const opening = gsap.timeline({ scrollTrigger: { trigger: '.cx-why__teams', start: 'top 78%', once: true } })
        teamsBeat(opening, 0, 0.7)
        pairs.forEach((pair) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: pair, start: 'top 80%', once: true } })
          pairBeat(tl, pair, 0, 0.8)
        })
      },
      el,
    )

    /* the light settles slowly while the story plays, so the glass seems to
       turn a little under it */
    const drift = gsap.fromTo(
      q('.cx-why__light'),
      { scale: 1.1, xPercent: -2 },
      {
        scale: 1,
        xPercent: 2,
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
        <RibbonCurtain items={ribbon} clearOf=".cx-hero__lead" />

        <div className="cx-why__stage">
          <div className="cx-why__light" aria-hidden="true" />

          {/* the ten teams, and the one pill they become */}
          <div className="cx-why__teams" aria-hidden="true">
            {why.teams.map((t) => (
              <span className="cx-why__team" key={t.name} data-umm-tone={t.tone} style={{ left: `${t.x}%`, top: `${t.y}%` }}>
                <span>{t.name}</span>
              </span>
            ))}
            <span className="cx-why__one cx-why__merged" data-umm-tone="blossom">
              {why.one}
            </span>
          </div>

          <div className="umm-container cx-why__inner">
            <div className="cx-why__beat cx-why__intro">
              <span className="cx-why__tag" data-umm-tone="sky">
                {why.chip}
              </span>
              <h2 className="cx-why__title" id="cx-why-title">
                <span className="cx-why__line">
                  {before}
                  <span className="cx-why__one cx-why__one--inline" data-umm-tone="blossom">
                    {why.one}
                  </span>
                  {after}
                </span>{' '}
                <span className="cx-why__line">{withAccent(why.line2, why.accent)}</span>
              </h2>
              <p className="cx-lead cx-why__lead">{why.lead}</p>
            </div>

            {why.pairs.map((pair) => (
              <div className="cx-why__beat cx-why__pair" key={pair.pain}>
                <Shape name={pair.shape} tone={pair.tone} className="cx-why__shape" />
                <p className="cx-why__pain">
                  <span className="cx-why__strike">{pair.pain}</span>
                  <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
                    {SCRATCH.map((d) => (
                      <path key={d} d={d} pathLength={1} />
                    ))}
                  </svg>
                </p>
                <p className="cx-why__fix">
                  {pair.fix}
                  <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                    <path d={UNDERLINE} pathLength={1} />
                  </svg>
                </p>
                <p className="cx-why__body">{pair.body}</p>
              </div>
            ))}

            <ol className="cx-why__count" aria-hidden="true">
              {why.pairs.map((pair, i) => (
                <li key={pair.pain}>{String(i + 1).padStart(2, '0')}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* the scroll the beats play over, while the section holds */}
      <div className="cx-why__runway" aria-hidden="true" />
    </section>
  )
}
