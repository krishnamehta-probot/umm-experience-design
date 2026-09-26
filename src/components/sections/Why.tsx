import { SectionHead } from '../primitives'
import { BeamJourney } from '../journey/BeamJourney'
import { usePinProgress } from '@/lib/usePinProgress'
import { why } from '@/content/experienceDesign'

export function Why() {
  const { ref, progress } = usePinProgress<HTMLElement>()

  return (
    <section
      className="umm-section umm-pin"
      id="why"
      ref={ref}
      style={{ ['--umm-pin-steps' as string]: why.steps.length }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container umm-pin__inner">
          <div className="umm-pin__copy">
            <SectionHead
              chapter={why.chapter}
              title={
                <>
                  {why.titleLead} {why.titleAccent} {why.titleTail}
                </>
              }
              lead={why.lead}
            />
          </div>

          <BeamJourney steps={why.steps} progress={progress} />
        </div>
      </div>
    </section>
  )
}
