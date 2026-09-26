import { SectionHead } from '../primitives'
import { iconRegistry } from '../icons'
import { BeamJourney } from '../journey/BeamJourney'
import { usePinProgress } from '@/lib/usePinProgress'
import { delivery } from '@/content/experienceDesign'

/* ============================================================================
   HOW WE WORK

   The same beam journey as "Why it matters", mirrored: the track runs down the
   left of the stage with the stages riding up it, and the argument sits on the
   right. Running the method on the page the reader is already scrolling is the
   point — the five stages happen in order because the reader makes them.

   The two responsibility notes ride with the copy rather than being parked
   below the section, so "who builds it" is answered in the same breath as the
   heading that promises it.
   ========================================================================== */

export function Delivery() {
  const { ref, progress } = usePinProgress<HTMLElement>()

  return (
    <section
      className="umm-section umm-pin"
      id="delivery"
      ref={ref}
      style={{ ['--umm-pin-steps' as string]: delivery.steps.length }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container umm-pin__inner umm-pin__inner--flip">
          <BeamJourney steps={delivery.steps} progress={progress} />

          <div className="umm-pin__copy">
            <SectionHead
              chapter={delivery.chapter}
              title={
                <>
                  {delivery.titleLead} {delivery.titleAccent}
                </>
              }
              lead={delivery.lead}
            />

            <div className="umm-hand">
              {delivery.responsibilities.map((item) => {
                const Glyph = iconRegistry[item.icon]
                return (
                  <article className="umm-hand__item" key={item.title}>
                    <span className="umm-hand__icon" aria-hidden="true">
                      <Glyph size={18} />
                    </span>
                    <div>
                      <h3 className="umm-hand__title">{item.title}</h3>
                      <p className="umm-hand__text">{item.body}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
