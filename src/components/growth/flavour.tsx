import '@/styles/flavour.css'
import '@/styles/growth-flavour.css'

/* ============================================================================
   INTEGRATED GROWTH · THE GROWTH FLAVOUR

   16 Oct, review feedback relayed by Krish: each service page should carry
   its subject, so this one should feel like growth throughout. The
   sections, their order, section 2's shapes and the scroll are unchanged.
   What changes, from here, the shared flavour.css and growth-flavour.css,
   under html.flavour and html.growth-flavour:

     - every section label's mark is a rising trend
     - the stages' picture is growth taking shape (StageLight "rise")
     - (until 17 Oct, the roadmap's "Today" was "Now"; it is CX's again)

   A trial: set GROWTH_FLAVOUR to false and the page is as it was.

   16 Oct, evening, Krish: the background patterns, the closing band's
   drawing and the service cards' extras are gone, so every page sits on
   CX's plain ground. Keep it simple for now.
   ========================================================================== */

export const GROWTH_FLAVOUR = true

/** the classes the page sets on <html> while the flavour is on */
export const FLAVOUR_CLASSES = ['flavour', 'growth-flavour']

/** The stages' picture. */
export const STAGE_LIGHT = GROWTH_FLAVOUR ? 'rise' : 'network'
