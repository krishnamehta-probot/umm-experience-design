import { Accordion, SectionHead } from '../primitives'
import { faq } from '@/content/experienceDesign'

export function Faq() {
  return (
    <section className="umm-section umm-section--railed" id="faq">
      <div className="umm-container umm-faq">
        <SectionHead
          chapter={faq.chapter}
          title={
            <>
              {faq.titleLead} {faq.titleAccent}
            </>
          }
          className="umm-faq__head"
        />

        <div className="umm-faq__list" data-umm-reveal>
          <Accordion
            entries={faq.items.map((item) => ({
              question: item.question,
              answer: <p>{item.answer}</p>,
            }))}
            defaultOpen={0}
          />
        </div>
      </div>
    </section>
  )
}
