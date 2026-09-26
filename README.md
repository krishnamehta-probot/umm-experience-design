# UMM — Experience Design / CX

High-fidelity build of the Experience Design service page, plus the component
library it is made from.

The page follows the structure signed off at
[umm-alternate-option.lovable.app](https://umm-alternate-option.lovable.app/),
rendered at production fidelity: light theme, pastel Silicon Valley palette,
zero photography, and a scroll-linked journey running the length of the page.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle into dist/
npm run preview    # serve the production build
```

Two routes:

| Route | What it is |
| --- | --- |
| `/` | The Experience Design / CX service page |
| `/styleguide` | Living component library — every token, icon and component |

---

## The design language

### Colour

A light enterprise ground with five pastel accent **surfaces** and five
saturated **signals**. The pastels are the same ones already on umm.digital's
brand cards, so the rebrand reads as a continuation rather than a reset.

| Role | Token | Hex |
| --- | --- | --- |
| Page ground | `--umm-canvas` | `#EEEEEE` |
| Recessed band | `--umm-canvas-deep` | `#E4E4E7` |
| Raised surface | `--umm-paper` | `#FFFFFF` |
| Primary text / dark bands | `--umm-ink` | `#100E14` |
| Accent surfaces | `--umm-periwinkle` `--umm-mint` `--umm-ice` `--umm-yellow` `--umm-pink` | `#B5C3FF` `#A5F8B1` `#C2E1FF` `#FFE289` `#FFBABB` |
| Signals | `--umm-indigo` `--umm-green` `--umm-sky` `--umm-amber` `--umm-rose` | `#4948D3` `#1E9552` `#407ECE` `#CF910A` `#E45D86` |

**The pastels are surfaces, never text colours.** Ink always sits on top of
them, which is what keeps contrast compliant at any size. Where an accent has
to carry a thin stroke or a small glyph on a light ground, its saturated signal
is used instead.

Setting `data-umm-tone="mint"` on any element re-points `--umm-tone`,
`--umm-tone-wash` and `--umm-tone-signal` for that whole subtree, so components
recolour without a single one of them naming a colour.

Setting `data-umm-theme="ink"` re-points the semantic roles for a dark band.
That is the entire mechanism behind the closing section and the footer — no
component has a dark variant.

### Typography

One family throughout. Display sizes are fluid and clamp against a 1440px
design width, so there are no breakpoint-specific type rules to maintain.

Mono is used only for labels, ordinals and eyebrows — it is what gives the page
its engineering register without adding a second display face.

### Motion

Three easings, five durations, all tokenised. Every scroll-linked effect checks
`prefers-reduced-motion` first and degrades to a static, fully-visible state.
Content is never hidden behind an animation that might not run — verified: with
reduced motion on, zero elements remain hidden and the SVG pulse is not
rendered at all.

### No photography

Everything visual is drawn: a 38-icon owned set on a single grammar (24px
canvas, 20px live area, 1.5 stroke, `currentColor`, round caps), the hero
journey diagram, and the closing band's CSS grid. Platform names in the
Technology section are set as text rather than vendor logos, which also avoids
implying partnerships the disclaimer explicitly denies.

---

## The scroll journey

The boss asked for a page that feels like a journey and shows the reader where
to focus. Four mechanics do that work, all driven from one engine
(`src/lib/journey.tsx`):

**1. The journey spine.** A rail down the left edge, visible from 1180px. The
line draws as the reader descends, stations light as they are reached and stay
lit, a marker rides the line at the exact reading position, and only the active
station names itself. It inverts to white over the dark closing band.

`progress` is deliberately *station-aware* rather than a raw scroll fraction:
station `i` owns the slot `[i/count, (i+1)/count]`, so the marker lands exactly
on a dot at the midpoint of that section. A raw `scrollY/scrollHeight` value
would drift off the dots, because sections differ hugely in height.

**2. Armed rows.** In Services and Why, exactly one row is ever active — the
one nearest a fixed line across the viewport. It takes a wash of its own tone,
its ordinal fills, its icon and its "You receive" chip take the accent. This is
the literal answer to *denote where to focus*.

Uses a nearest-to-focus-line calculation rather than per-row
IntersectionObservers, which flicker between candidates when rows are taller
than the viewport.

**3. The filling track.** The five-step method in *How we work* is a track the
reader physically fills. Each step draws its own connector to the next, so the
line stays registered to the dots through any grid or breakpoint change.

**4. The drawing diagram.** The hero journey draws itself, its four nodes land
as the line reaches them, and a pulse keeps travelling the path. The pulse uses
SVG `<animateMotion>` rather than CSS `offset-path`, because the path is
authored in viewBox units and a CSS offset path would drift off it at any
rendered size other than 1:1.

On narrow screens the rail is replaced by a hairline progress bar across the
top of the viewport, driven by the same value so the two can never disagree.

---

## Layout

```
src/
  styles/
    tokens.css        Single source of truth. A rebrand is a change to this file.
    base.css          Reset, document type, layout primitives, motion contract
    components.css    The reusable library
    journey.css       The spine
    nav.css  hero.css  sections.css  styleguide.css
  lib/
    journey.tsx            Station engine: activeIndex + progress
    useFocusIndex.ts       Which item in a list the reader is on
    useElementProgress.ts  0..1 as one element crosses the viewport
    useReveal.ts           One observer for every [data-umm-reveal] on the page
    useReducedMotion.ts
  components/
    icons/          Icon.tsx (the grammar) + index.tsx (the set + registry)
    primitives/     The component library — import from here, not from files
    journey/        JourneySpine, JourneyBar, JourneyDiagram
    sections/       One file per page section
  content/
    experienceDesign.ts    All copy, typed, in one module
  pages/
    ExperienceDesignPage.tsx
    StyleguidePage.tsx
```

**Content is separated from markup.** Every word on the page lives in
`src/content/experienceDesign.ts`, so copy can go to a writer, a translator or
a CMS without anyone touching a component.

---

## Building another service page

The library is built to be reused across UMM's service pages — CX is the first.

1. Copy `src/content/experienceDesign.ts` to e.g. `cloudAndData.ts` and rewrite
   the copy. The `stations` array defines both the page order and the rail.
2. Compose a page from `src/components/sections/*`, which are already generic
   apart from the content they import.
3. Change nothing in `styles/tokens.css` — that is what keeps the pages
   looking like one family.

`/styleguide` is the reference: it renders the real components from the real
tokens, so it cannot drift from what ships.

---

## Verified

- `npm run build` — clean typecheck, no console or page errors
- No horizontal scroll at 360 / 390 / 768 / 1024 / 1180 / 1440 / 1920px
- One `h1`, no heading-level jumps, no unnamed buttons, all decorative SVG
  hidden from assistive technology
- Tab order: skip link → masthead → content. The rail renders last in the DOM
  (it is fixed, so position has no visual effect) so its eleven buttons don't
  sit between a keyboard user and the page
- Tabs implement the full WAI-ARIA pattern: arrow keys, Home/End, roving
  tabindex
- Reduced motion: zero hidden elements, no SMIL, no scroll-linked drawing

---

## Open questions for sign-off

**1. The typeface.** The build currently uses **Mosvita** (six weights, in
`public/fonts/`), which is what the approved prototype used. You mentioned a
face called *"Monorole"* — I could not find any font by that name, or a near
spelling, in any foundry or catalogue. Please confirm the exact name and
source.

Swapping is a one-line change: `--umm-font-display` / `--umm-font-body` in
`src/styles/tokens.css`. Nothing else in the system names a font.

Note that Mosvita is a commercial face (© Yukita Creative) — a web licence is
needed before this goes live. The current live site uses AeonikPro + Inter.

**2. Four sector panels are authored, not approved.** The signed-off prototype
expanded **Retail & commerce** only. To reach full fidelity I wrote
**Financial services**, **Healthcare**, **Manufacturing & B2B** and **Telecoms
& media** in the same voice and to the same structure, deliberately avoiding
invented metrics in keeping with the page's own "proof without inventing the
numbers" principle. They need a read-through before they ship.

**3. Delivery target.** umm.digital runs WordPress 6.9.9 + Elementor 4.1.4.
This build is React + Vite, per the "go all in, design-first" direction. Two
routes forward when you're ready: rebuild the page in Elementor against
`tokens.css`, or serve this as a standalone page on the existing domain. Worth
deciding before implementation starts, not after.
