import '@/styles/flavour.css'
import '@/styles/ux-flavour.css'

/* ============================================================================
   UX & DIGITAL COMMERCE · THE COMMERCE FLAVOUR

   16 Oct, review feedback relayed by Krish: each service page should carry
   its subject, so this one should feel like commerce throughout. What
   changes, from here, the shared flavour.css and ux-flavour.css, under
   html.flavour and html.ux-flavour:

     - every section label's mark is a cursor
     - the stages' picture is the store growing (StageLight "shop")
     - the roadmap's "Today" is "Live"

   A trial: set UX_FLAVOUR to false and the page is plain.

   16 Oct, evening, Krish: the background patterns, the closing band's
   drawing and the service cards' extras are gone, so every page sits on
   CX's plain ground. Keep it simple for now.
   ========================================================================== */

export const UX_FLAVOUR = true

/** the classes the page sets on <html> while the flavour is on */
export const FLAVOUR_CLASSES = ['flavour', 'ux-flavour']

/** The stages' picture. */
export const STAGE_LIGHT = UX_FLAVOUR ? 'shop' : 'glass'
