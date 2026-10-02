# CX and UI Design: references per section (v2)

Companion to [cx-ui-design-copy.md](cx-ui-design-copy.md). For each section:
2–3 references, what to take from each, and a few ideas of our own.

**Tags:** **Animation** = how it moves · **Layout** = how content is
arranged · **Visual** = how it looks.

Every URL was checked and loads. Motion details come from each page's own
write-up or code; anything not confirmed is marked *unverified*. These are
for inspiration only. We take the idea, never the artwork, except Cool
Shapes (MIT licence, free to use).

---

## Across the whole page

- **Chip tags on every headline:** the tilted pill that overlaps a line of
  the headline, as in our AI & Automation artifact. One per section, each
  in a different pastel.
- **One icon system:** [Cool Shapes](https://coolshap.es/) (stars,
  flowers, wheels, polygons). Recolour them to flat fills in our five
  pastels, not their grainy gradients. React package: `coolshapes-react`.
- **Rhythm:** light hero → **dark Why band** → light middle → **dark
  closing band**. Santosh liked the dark accents; two is enough.
- **Corner radii match the homepage.** Santosh said our tiles read too
  sharp.
- **Floating glass cube** (homepage element): an object that drifts
  between sections.

---

## 1. Hero

| Ref | Tag | What to take |
|---|---|---|
| **Our AI & Automation artifact** | Animation | The base. The gradient star grows from the corner until it fills the screen, then sweeps off to reveal section 2. Santosh liked this. |
| [Horeca, Codrops write-up (2026)](https://tympanus.net/codrops/2026/06/10/building-horeca-advanced-motion-design-in-webflow-without-the-performance-trade-offs/) | Animation | Their headline scales to fill the screen while pivoting on one fixed point. Use the same technique to keep the star's centre steady as it grows, so it doesn't wobble. |
| [Motion, Scroll Zoom Hero](https://motion.dev/tutorials/react-scroll-zoom-hero) | Animation | The exit: scale, blur and fade all tied to one scroll value, so the star leaves softly instead of cutting away. |
| [gsap.com home hero](https://gsap.com/) | Visual | Headline words set in tilted colour pills (rotated about 6° to 15°), with solid shapes pinned to the headline's corners. Dark site, but the chip-and-shape treatment transfers directly. |
| [Google Design, Illustrating the Gemini app](https://design.google/library/gemini-ai-visual-design) | Visual | A gradient rule for the 4-point star: sharp leading edge, soft fading tail. People already read this sparkle as "AI". |

**Our ideas**
- The glass cube floats beside the split-button and catches the star's
  colours as it passes.
- Put a chip on the accent word *enjoy*, in the same tilted style as the
  section headlines, so the hero introduces the page's visual language.

### Moving ribbon

| Ref | Tag | What to take |
|---|---|---|
| **Our current ribbon** (your screenshot) | Visual | Keep it: the curved sky-blue band with ✦ separators across the seam. |
| [Codrops, Infinite marquee along an SVG path (2025)](https://tympanus.net/codrops/2025/06/17/building-an-infinite-marquee-along-an-svg-path-with-react-motion/) | Animation | Words that follow the curve itself, and a band that speeds up and reverses with your scroll. |
| [GSAP, ScrollTrigger getVelocity()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/getVelocity()/) | Animation | Feed scroll speed into a capped tilt: the band leans further on a fast scroll, then settles. |

---

## 2. Why it matters (dark band)

| Ref | Tag | What to take |
|---|---|---|
| [Dia browser](https://www.diabrowser.com/) | Layout | Exactly our structure: one line, then three numbered points, each naming the pain in plain words with a one-sentence fix. It has an AI angle and short copy. |
| [Basecamp, Before & After](https://basecamp.com/before-and-after) | Layout | "Before" in the customer's own words, facing "after", backed by one stat. That stat is what keeps it credible to enterprise buyers. |
| [Codrops, 5 creative GSAP demos: Osmo hand-drawn underline](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/) | Animation | Hand-drawn strokes. On scroll, scribble through *"They get stuck"*, then underline *"We find out where"* in lime. Their demo runs on hover; we trigger it on scroll. |

**Our ideas**
- Use the **blue light-streak image** (your reference) as the band's
  background, so the dark band gets depth instead of flat black.
- Each pain gets a "broken" Cool Shape (a cracked star, a split circle).
  When its fix appears, the shape snaps back into one piece.

---

## 3. Our work

| Ref | Tag | What to take |
|---|---|---|
| [Notion homepage](https://www.notion.com/) | Layout | Tabs that swap the video and caption inside one fixed-height frame. Switching from Retail to Finance never changes the page height, so the section stays one screen. |
| [Ramp customer stories](https://ramp.com/customers) | Layout | The result number *is* the card's headline, with an industry badge and context strip under it. |
| [Stripe customers](https://stripe.com/customers) | Layout | Industry filter, results written as *number + plain outcome + client*, and the logo strip placed directly under the stories. |
| [Codrops, Perspective mockup slideshow](https://tympanus.net/codrops/2014/11/21/perspective-mockup-slideshow/) | Animation | Screens gliding inside a tilted device frame, with desktop and phone moving out of step. The cheapest way to bring flat screenshots alive. |
| [Codrops, 3D mobile app showcase](https://tympanus.net/codrops/2013/08/01/3d-effect-for-mobile-app-showcase/) | Animation | The phone's screens separate into a layered stack. One beat of our loop, rebuilt with GSAP. |

**Our idea: a storyboard for the 15-second loops** (same beats for every
project, so the five feel like a set)

| Time | Beat |
|---|---|
| 0–3s | Home screen glides into a tilted laptop frame; the phone slides in behind it. |
| 3–7s | Smooth scroll-through of the key flow (e.g. Aladdin's filter → product). |
| 7–10s | Screens fan out into a layered stack. |
| 10–13s | Zoom into the one moment the number is about (the search box, the checkout). |
| 13–15s | The headline number pops onto the frame as a tilted chip, then the loop restarts. |

---

## 4. What we do

| Ref | Tag | What to take |
|---|---|---|
| [Truus, services cards on Awwwards](https://www.awwwards.com/inspiration/services-cards-truus) ([site](https://truus.co)) | Visual + Animation | Pastel service tiles with tilted "sticker" chips overlapping the card edges, popping in on scroll with GSAP. Their palette (pink, lime, lilac on cream) is very close to ours. |
| [Google, The Web Can Do What!? on Awwwards](https://www.awwwards.com/inspiration/cards-google-the-web-can-do-what) | Visual | A solid shape with a thin ink outline as each card's icon. Only the shape moves (loop or hover); the three text lines stay still and readable. |
| [Cool Shapes](https://coolshap.es/) | Visual | The six icons themselves: one shape per service, flat-filled in one pastel each. |

**Our idea**
- Each card's "See it in: Aladdin Commercial →" link shows a tiny
  thumbnail of that project's loop on hover, linking sections 3 and 4.

---

## 5. Built for where you are

| Ref | Tag | What to take |
|---|---|---|
| **Our current company-size filter** | Animation | Santosh liked the interaction. Keep the mechanics; reskin it. |
| [Pitch homepage](https://pitch.com/) | Layout | Persona tabs that each open with a verb headline and one "this is you if…" line before the detail. The same page has a stat built as rolling digit columns, like our odometer. |
| [Stripe homepage, "businesses of all sizes"](https://stripe.com/) | Layout | One big number as the hero of each tab, with named proof under it. A playful wrapper that still feels serious. |
| [Shopify homepage](https://www.shopify.com/) | Layout | Stages named as ambitions ("Get started fast", "Grow as big as you want"), so the three read as a journey, not price tiers. |

**Our idea**
- One Cool Shape per stage that grows with it: a small sprout shape for
  startups, a flower for growing companies, a full wheel for enterprise.
  It morphs as you switch tabs.

---

## 6. How we design

| Ref | Tag | What to take |
|---|---|---|
| [Laws of UX](https://lawsofux.com/) | Visual + Animation | Our card recipe: each principle on its own solid colour, a flat glyph built from simple shapes, and the shapes appearing one after another. Slight scale on hover. |
| [Rive, A taste of the principles of design](https://rive.app/marketplace/26628-49967-a-taste-of-the-principles-of-design/) | Animation | A toggle on each principle: switch it on and watch the rule fix the design. CC BY licence, so we credit it if we remix the file. |
| [Rauno Freiberg, Invisible details of interaction design](https://rauno.me/craft/interaction-design) | Animation | State the rule in one sentence, then let the reader *try* it. |
| **Our AI & Automation artifact, tools wheel** | Animation | The tools part. Already built; it takes the approved content as-is. |

**Our ideas: one live demo per rule**
- **Colour with a reason:** a toggle swaps a washed-out button for a
  readable one.
- **Made for thumbs:** drag a thumb over a phone and the easy-reach zone
  lights up.
- **Fewer steps:** ten tap-dots collapse into three.
- **Same look everywhere:** five mismatched buttons snap into one style.
- **Tested before it's built:** a prototype gets a ✓ chip stamped on it.

---

## 7. How we work + let's talk (dark band)

| Ref | Tag | What to take |
|---|---|---|
| [Cal.com](https://cal.com/) | Layout | Numbered step cards, each with a small live UI fragment inside. Its FAQ puts the heading, one line and the buttons in the left column, with the accordion on the right. That is our closing band. |
| [Codrops, Scrollable and draggable timeline with GSAP](https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/) | Animation | Discover → Improve as one horizontal strip that moves with the scroll and can be dragged on phones. Stays compact; the tutorial covers accessibility. |
| [Designjoy](https://www.designjoy.co/) | Visual | Short verb-only step names; a marquee of pill chips inside one step; the FAQ ending in one cheeky booking card instead of a form. |

**Our ideas**
- Use Cal.com's two-column layout *inside* the dark band: big CTA on the
  left, the seven questions on the right.
- The ribbon comes back once, small, above the footer, so the page ends
  the way it started.
