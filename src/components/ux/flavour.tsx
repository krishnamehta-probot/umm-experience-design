import '@/styles/flavour.css'
import '@/styles/ux-flavour.css'

/* ============================================================================
   UX & DIGITAL COMMERCE · THE COMMERCE FLAVOUR

   16 Oct, review feedback relayed by Krish: each service page should carry
   its subject, so this one should feel like commerce throughout. What
   changes, from here, the shared flavour.css and ux-flavour.css, under
   html.flavour and html.ux-flavour:

     - the faint columns of a layout grid behind the white sections
     - every section label's mark is a cursor
     - the stages' picture is the store growing (StageLight "shop")
     - a bag drops onto a service card as it is pointed at
     - the roadmap's "Today" is "Live"
     - the closing band has a product grid behind it

   A trial: set UX_FLAVOUR to false and the page is plain.
   ========================================================================== */

export const UX_FLAVOUR = true

/** the classes the page sets on <html> while the flavour is on */
export const FLAVOUR_CLASSES = ['flavour', 'ux-flavour']

/** The stages' picture. */
export const STAGE_LIGHT = UX_FLAVOUR ? 'shop' : 'glass'
