/* ============================================================================
   PLATFORM MARKS

   Official vector marks, held as files rather than inlined, so 25 logos cost
   the JS bundle nothing and the browser caches them independently of the page.

   Where a product has no mark of its own it wears its parent's: the four Adobe
   products are Adobe, Data 360 is Salesforce, Dynamics 365 is Microsoft. Three
   tools publish no public vector at all — Dynamic Yield, UserTesting and
   Medallia — and carry a purpose glyph in the brand's own colour instead. Those
   are icons standing next to a name, not marks pretending to be theirs.

   The trademarks belong to their owners. The note under the section says these
   groupings imply no partnership, reseller status or certification.
   ========================================================================== */

import adobe from '@/assets/marks/adobe.svg'
import braze from '@/assets/marks/braze.svg'
import contentful from '@/assets/marks/contentful.svg'
import dynamicYield from '@/assets/marks/dynamic-yield.svg'
import figma from '@/assets/marks/figma.svg'
import ga4 from '@/assets/marks/ga4.svg'
import hotjar from '@/assets/marks/hotjar.svg'
import maze from '@/assets/marks/maze.svg'
import medallia from '@/assets/marks/medallia.svg'
import microsoft from '@/assets/marks/microsoft.svg'
import miro from '@/assets/marks/miro.svg'
import optimizely from '@/assets/marks/optimizely.svg'
import qualtrics from '@/assets/marks/qualtrics.svg'
import salesforce from '@/assets/marks/salesforce.svg'
import segment from '@/assets/marks/segment.svg'
import servicenow from '@/assets/marks/servicenow.svg'
import sitecore from '@/assets/marks/sitecore.svg'
import tealium from '@/assets/marks/tealium.svg'
import usertesting from '@/assets/marks/usertesting.svg'
import wordpress from '@/assets/marks/wordpress.svg'
import zendesk from '@/assets/marks/zendesk.svg'

export const marks: Record<string, string> = {
  'Adobe Experience Manager': adobe,
  'Adobe Journey Optimizer': adobe,
  'Adobe Real-Time CDP': adobe,
  'Adobe Analytics': adobe,
  Sitecore: sitecore,
  Contentful: contentful,
  'WordPress VIP': wordpress,
  Salesforce: salesforce,
  'Salesforce Data 360': salesforce,
  'Microsoft Dynamics 365': microsoft,
  ServiceNow: servicenow,
  Zendesk: zendesk,
  Segment: segment,
  Tealium: tealium,
  Braze: braze,
  'Dynamic Yield': dynamicYield,
  Optimizely: optimizely,
  Figma: figma,
  Miro: miro,
  Maze: maze,
  UserTesting: usertesting,
  Qualtrics: qualtrics,
  Medallia: medallia,
  'Google Analytics 4': ga4,
  Hotjar: hotjar,
}
