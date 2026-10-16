import '@/styles/flavour.css'
import '@/styles/eng-flavour.css'

/* ============================================================================
   DIGITAL ENGINEERING · THE ENGINEERING FLAVOUR

   16 Oct, review feedback relayed by Krish: each service page should carry
   its subject, so this one should feel like engineering throughout. The
   sections, their order, section 2's shapes and the scroll are unchanged.
   What changes, from here, the shared flavour.css and eng-flavour.css,
   under html.flavour and html.eng-flavour:

     - every section label's mark is a pair of code brackets
     - the stages' picture is the code base growing (StageLight "build")
     - the roadmap reads as a release train: "Today" is "Release"

   A trial: set ENG_FLAVOUR to false and the page is as it was.

   16 Oct, evening, Krish: the background patterns, the closing band's
   drawing and the service cards' extras are gone, so every page sits on
   CX's plain ground. Keep it simple for now.
   ========================================================================== */

export const ENG_FLAVOUR = true

/** the classes the page sets on <html> while the flavour is on */
export const FLAVOUR_CLASSES = ['flavour', 'eng-flavour']

/** The stages' picture. */
export const STAGE_LIGHT = ENG_FLAVOUR ? 'build' : 'glass'
