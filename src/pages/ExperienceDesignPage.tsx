import { useReveal } from '@/lib/useReveal'
import { RibbonLoop } from '@/components/primitives'
import { Hero } from '@/components/sections/Hero'
import { Why } from '@/components/sections/Why'
import { Services } from '@/components/sections/Services'
import { Stages } from '@/components/sections/Stages'
import { Tech } from '@/components/sections/Tech'
import { Sectors } from '@/components/sections/Sectors'
import { Delivery } from '@/components/sections/Delivery'
import { Engagement } from '@/components/sections/Engagement'
import { Proof } from '@/components/sections/Proof'
import { Faq } from '@/components/sections/Faq'
import { Closing, SiteFooter } from '@/components/sections/Closing'
import { capabilities } from '@/content/experienceDesign'

/**
 * Experience Design / CX — the flagship enterprise service page.
 *
 * Section order follows the structure signed off at
 * umm-alternate-option.lovable.app.
 */
export function ExperienceDesignPage() {
  useReveal()

  return (
    <>
      <a className="umm-skip-link" href="#services">
        Skip to services
      </a>

      <main>
        <Hero />
        <RibbonLoop items={capabilities} />
        <Why />
        <Services />
        <Stages />
        <Tech />
        <Sectors />
        <Delivery />
        <Engagement />
        <Proof />
        <Faq />
        <Closing />
      </main>

      <SiteFooter />
    </>
  )
}
