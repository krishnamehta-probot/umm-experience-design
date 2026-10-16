import '@/styles/flavour.css'
import '@/styles/cloud-flavour.css'

/* ============================================================================
   CLOUD & DATA · THE CLOUD FLAVOUR

   16 Oct, review feedback relayed by Krish: each service page should carry
   its subject, so this one should feel like cloud and data throughout and
   read a little differently from the other service pages. The sections,
   their order and the scroll are unchanged. What changes, all of it from
   here, the shared flavour.css and cloud-flavour.css, under html.flavour
   and html.cloud-flavour:

     - every section label's mark is a small cloud
     - the stages' picture is infrastructure that grows (StageLight "infra")
     - the roadmap reads as a deployment pipeline: "Today" is "Deploy",
       with a status light, and the open stage's bar streams

   It was a trial: set CLOUD_FLAVOUR to false and the page is as it was.

   16 Oct, evening, Krish: the background patterns, the closing band's
   drawing and the service cards' extras are gone, so every page sits on
   CX's plain ground. Keep it simple for now.
   ========================================================================== */

export const CLOUD_FLAVOUR = true

/** the classes the page sets on <html> while the flavour is on */
export const FLAVOUR_CLASSES = ['flavour', 'cloud-flavour']

/** The stages' picture. */
export const STAGE_LIGHT = CLOUD_FLAVOUR ? 'infra' : 'network'
