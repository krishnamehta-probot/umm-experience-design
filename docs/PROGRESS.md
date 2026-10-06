# CX and UI Design v2: progress

Live log for the second iteration of the CX page. Newest updates at the top
of the **Log**. Tick boxes as things land.

- **Copy:** [cx-ui-design-copy.md](cx-ui-design-copy.md) (approved by Krish, 2 Oct)
- **References:** [cx-ui-design-references.md](cx-ui-design-references.md) (all kept)
- **Run it:** `npm run dev` → <http://localhost:5173/> is v2 ·
  <http://localhost:5173/v1> is the old 12-section page · `/styleguide` unchanged

---

## Where we are

| # | Section | Status | Built from |
|---|---|---|---|
| 0 | Setup: route, content, chip headlines, shapes, GSAP | ✅ done | — |
| 1 | Hero + ribbon curtain into a dark section 2 | 🔁 revision 1 built (Krish's brief), awaiting review | Artifact layout; Krish's ribbon-reveal idea |
| 2 | Why it matters (dark band) | 🔁 rebuilt as a scroll story ("ten teams → one company"), awaiting review | Krish's go on the scroll-story concept |
| 3 | Our work → a 30-second film | 🔁 replaced (Krish), awaiting review | Krish: "After Effects-style, hook them, our numbers, real work" |
| 4 | What we do: 6 two-sided service cards | 🔁 rebuilt (corner-peel turn, Lottie on the back), awaiting review | Notched-card reference; Truus stickers |
| 5 | Built for where you are: size tabs | 🔄 revised (light picture behind the number), awaiting review | v1 filter (Santosh liked), Pitch, Stripe |
| 6 | How we design: 5 rules + tools | 🔄 revised (rules: realistic phone, magnetic stops; tools: rebuilt in the rules' language, pastel tile + list), awaiting review | Laws of UX, Rive toggles, Rauno, artifact wheel |
| 7 | How we work + FAQ + closing band | 🔄 revised (steps as a roadmap board, magnetic; curtain; footer wordmark), awaiting review | Designjoy steps, Cal.com FAQ + CTA |
| 8 | Phones, reduced motion, build check | ✅ build passes; runtime smoke test clean | — |

**Not yet done:** Krish's visual review of every section (he is the only
reviewer; no screenshot review was done on my side).

---

## What's where (code)

| Piece | File |
|---|---|
| Page | `src/pages/CxUiDesignPage.tsx` |
| All copy | `src/content/cxUiDesign.ts` (mirrors the copy deck word for word) |
| Film | `src/components/v2/ProofFilm.tsx` (timeline + scenes), `/film` page, `scripts/render-film.mjs` (MP4 export) |
| Sections | `src/components/v2/` (HeroV2, RibbonCurtain, WhyBand, WorkShowcase, ScreenLoop, ServicesV2, StagesV2, StageLight, Principles, ToolsStack, ProcessClose, NavV2) |
| Chip headline | `src/components/v2/ChipHead.tsx` (6 line recipes × 4 chip recipes) |
| Shape icons | `src/components/v2/Shape.tsx` + `shapes.data.ts` (36 Cool Shapes, MIT) |
| Glass cube (CSS stand-in) | `src/components/v2/GlassCube.tsx` |
| Styles | `src/styles/v2.css` (all `cx-` prefixed; v1 untouched) |
| Case-study screens | `public/work/<project>/` (home, strip, s1–s3, zoom; ~420KB each) |

**Screens used per project:** Aladdin, Coco & Coir, Fintuit and Habari come
from Krish's `Deck/projects ss` folder. HealthX Africa had none, so its pages
were captured from healthxafrica.com on 2 Oct (cookie banner dismissed).

**The 15s loop:** a GSAP timeline in `ScreenLoop.tsx`, same 5 beats for
every project (glide in → scroll the story page → pages fan out → zoom to the
key moment → number chip lands). Where each zoom lands is the `FOCUS` table
at the top of that file. The tabs auto-advance one loop each until someone
clicks a tab, then that project loops.

---

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2 Oct | Santosh's 7-part order kept; tools wheel sits in section 6 | His list had no tools slot; keeps the long pinned scroll away from the final CTA |
| 2 Oct | Nothing from the old page is dropped | Krish: everything gets folded in (see the copy deck's last table) |
| 2 Oct | Sectors become the filter tabs of "Our work" | One real project per industry; keeps all 5 sectors |
| 2 Oct | Engagement models live inside the size tabs | Keeps all 4 models without their own section |
| 2 Oct | Case-study loops built in-page (GSAP), not video files | Sharp at any size, light to load, editable; can be exported to mp4 later |
| 2 Oct | Glass cube drawn in CSS | The only cube image we have is 216px; the homepage cube videos are H.264 and need the real asset |
| 2 Oct | Star gradient uses the brand pastels (sky, blossom, citrus, sun) | The artifact's star used off-palette blues; the five colours are locked |
| 2 Oct | Why band's light streaks drawn in sky over ink | Evokes the blue light-streak reference while staying in palette |
| 2 Oct | Pin lengths cut (size tabs 88 → 58svh per stage, tools 2.2 → 1.7 screens) | Santosh wants a short page; page is now ~16 screens at 1440×900 |
| 2 Oct | v2 at `/`, v1 kept at `/v1` (lazy-loaded) | Side-by-side comparison; v2 visitors never download v1 |

---

## Open items (need Krish / Santosh)

- [ ] **Visual review of all 7 sections** on localhost:5173.
- [ ] **Digital branding card:** which project goes in its "See it in" link?
      (Card currently has no sticker.)
- [ ] **HealthX Africa:** screens were captured from today's live site;
      confirm it is still UMM's design.
- [ ] **Hi-res assets:** the floating glass cube and the blue light-streak
      image from the homepage, at full size. CSS stand-ins until then.
- [ ] **Logo strip** is set as text (Nokia, Deloitte, TD Bank…). Swap for the
      real marks if UMM has permission to show them as logos.
- [ ] **Typeface:** still Mosvita (the "Monorole" question is open).
- [ ] **Commit:** nothing committed yet; say the word.

---

## Log

### 6 Oct 2026, sections 6b and 7 brought back to the brand
- Krish: the road and the deep colour screens were not in the brand's
  aesthetic; the tools section's scroll also felt different from the rest.
- Both now use the language of the sections he approved (stages, rules):
  canvas ground, ink type, hairline rows with a mono number, one rounded
  picture, flat pastels, no deep shades, glass or dark labels.
- 6b `ToolsStack`: the six groups are a list on the right, as the rules
  are; the open one shows its role and claim. On the left, one rounded tile
  in the group's pastel (tint at the top, deepening to the pastel at the
  bottom), its Cool Shape flat in a deeper pastel, and its tools dropped on
  as white stickers. Colour glides between groups (registered `--p0..2`).
- 7 `Roadmap`: a roadmap board. Steps down the left, a timeline on the
  right with each step a rounded pastel bar, slightly overlapping; the axis
  is marked only First call, Launch and Ongoing (no invented weeks). A
  "today" line moves to the end of each step; the bars it passes fill, and
  each finished step gets a "Signed off" sticker.
- Scroll: both use the rules' rhythm exactly (55svh per stop, the same
  magnetic settle), so the three pinned sections feel like one system.
- Phones and reduced motion: tools become one tile per group; the roadmap
  keeps the board with each bar under its step, and today sweeps the plan
  once it is in view (reduced motion: done).

### 6 Oct 2026, section 7: the steps as a roadmap
- Krish: the pile of squares looked like the tools section and was not what
  he asked for; UMM uses pastels; it should look like a roadmap.
- `Roadmap.tsx` replaces the pile. A road winds across the section from
  "First call" through five milestone pins, past a Launch flag at Deliver,
  and carries on off the edge after Improve ("and on"). Flat brand pastels
  only: the road behind the marker fills sun → sky → blossom → citrus →
  coral; the road ahead is the white road with a dashed planned route.
- Each milestone is a magnetic stop. A "you are here" marker drives along
  the road to it (turning with the bends); signposts stand on the outside of
  each bend, a dashed outline while ahead, filled in their pastel once
  reached, so the last stop shows the whole roadmap. Clicking a signpost
  drives there.
- Phones and reduced motion: the road runs down the left of a list and each
  stretch fills as its step scrolls into view (reduced motion: all filled).
- Checks: build passes; five stops at 1440×900 and 1366×768, settle, free
  exit; 390; reduced motion; no console errors; no horizontal scroll.

### 6 Oct 2026, section 7 and the page's finish
- Krish: make the final section big squares with a very nice scroll effect,
  and finish the whole page.
- The five steps are five big squares dealt onto a pile. The section pins;
  each step is a magnetic stop. The next square slides up from below the
  screen and lands on top; the ones before sink back (smaller, tilted each
  way, shaded); the numeral turns into place as its square lands. Each
  square is its step's colour deepening across the card (the same ramps as
  6b), with the Cool Shapes numeral large in the deep shade. The index on
  the left ticks along and glides to a step when clicked.
- Phones and reduced motion: no pin; the squares stick one below the last as
  they scroll, so the pile still builds (two columns on wide reduced-motion
  screens).
- The dark band now rises over the end of the pile with rounded shoulders;
  its headline lines rise in, then the copy, then the questions.
- The footer ends on a full-width "umm" wordmark, fading into the ink, its
  letters rising as it arrives.
- 6b: grounds that are covered or wiped away stop drawing after their wipe
  (their glass blur is not free).
- Checks: build passes; full walk of the page at 1440×900 (21 screens), five
  deck stops and the settle, 390 end of page, reduced motion; no console
  errors; no horizontal scroll at 390.

### 6 Oct 2026, section 6b: six groups, six colours, glass shapes
- Krish: make the tools section image-worthy and on brand; each group its own
  colour, deepening from light to dark within the group; use the Cool
  Shapes; magnetic scroll like section 6a.
- The wheel is replaced by `ToolsStack`. The section pins; each of the six
  groups is a full screen whose colour runs from a light tint at the top to
  a deep shade at the bottom (hand-picked four-stop ramps per tone, with a
  touch of grain). Each new group's colour wipes up over the last; going back
  wipes it down. The group's Cool Shape stands low on the right as frosted
  glass (shape-masked backdrop blur, rim of light, soft shadow), with two
  solid shapes drifting behind it. The words rise in after the wipe; tools
  are frosted tiles. The rail on the left reads out the group and glides to
  it when clicked.
- The magnet is now a shared hook, `lib/useMagneticStops`, used by 6a and 6b.
- Phones and reduced motion: no pin; six rounded bands, each with its own
  ramp and glass shape.
- Words unchanged (Santosh-approved). Open: there are five brand colours for
  six groups, so Research & analytics repeats sun (Experience & content's);
  they are first and last, never side by side.
- Checks: build passes; all six groups at 1440×900, 1366×768; magnet settle
  and free exit; 390 bands; reduced motion; no console errors.

### 6 Oct 2026, section 6: a real phone, compact, and magnetic stops
- Krish: the phone felt cartoonish and took the whole screen height; the
  scroll was too quick to take in each change.
- The phone is now a modern handset (titanium band, thin bezel, camera
  island, side buttons, glass reflection, real status-bar icons) running an
  iOS-style checkout: large title, grouped list rows, a shaded product
  thumbnail, a frosted bottom bar, a home indicator. "Tested" is now a
  usability-test notification sliding in, plus a tap heat map on Pay.
  Callouts are plain white cards with a leader, not outlined pills.
- Compact: the phone is capped at 80% of its column's height (about 68% of
  the window at 1440×900).
- Magnetic scroll: six stops (before, then one per rule). The scroll picks
  the stop; the change plays as a full eased animation (0.8–1.1s) whatever
  the scroll speed. When scrolling goes quiet the page glides to the nearest
  stop; entering and leaving the section are never pulled back; any wheel,
  touch or key input cancels a glide. Clicking a rule glides to its stop.
- Checks: build passes; stops at 1440×900 and 1366×768, settle test (stopped
  between stops 2 and 3 → settled on 3), free exit, 390 autoplay and tap; no
  console errors.

### 6 Oct 2026, section 6: one checkout, fixed rule by rule
- Krish picked option A of three: replace the five rule cards (a second grid
  of pastel cards straight after the services cards, two of them with weak
  demos) with one scene the rules act on.
- The section pins. A phone holds a checkout with every rule broken, and the
  scroll applies the rules one at a time, each with a callout:
  colour (Pay goes from 1.4:1 contrast to 19:1, the page's text darkens),
  thumbs (Pay moves from the top corner to a bar in the thumb's reach),
  steps (ten steps fold into three; three of five fields fold away),
  same look (four button styles settle into one outline pill),
  tested (taps land on Pay, the "Tested ✓" stamp goes on).
  The rules list on the left ticks as each lands, opens the active rule's
  text, and scrolls to a rule when clicked. Scrolling up undoes it all.
- Every change is a number (--k1 … --k5) set by the scroll and turned into
  colour, position and size in CSS. They are registered with @property so on
  phones a tap eases them.
- Phones: unpinned; the phone sits between the headline and the rules, plays
  through once on its own when it comes into view, then the rules are taps.
  Reduced motion: unpinned, starts on the finished screen, taps still work.
- New content: `principles.hint` and a `fix` callout per rule.
- Checks: `npm run build` passes; screenshots at 1440×900 (before, each rule,
  after), 1366×768, 390 (autoplay and tap) and reduced motion; no console
  errors; no horizontal scroll at 390.

### 6 Oct 2026, section 5: a picture of light behind each stage's number
- Krish: make it image-worthy, in the same aesthetic as section 2's light,
  but relatable to the section.
- The stage figure is now a dark tile with a live fluted-glass light shader
  behind the number (`src/components/v2/StageLight.tsx`), the same material
  as `why-light.webp`. What the light is grows with the company:
  **Startups** one spark (sun), **Growing** a rising J-curve (blossom),
  **Enterprises** a lit skyline, every flute a tower (sky). It morphs on the
  same scroll value as the odometer; the top-left corner stays dark for the
  number, which is now white.
- Replaces the three Cool Shapes in that tile.
- Draws only on screen; reduced motion gets a still frame; without WebGL the
  tile falls back to the stage colour glowing on ink.
- Checks: `npm run build` passes; screenshots at 1440 (all three stages and
  mid-morph), 390 (tapped tabs) and with reduced motion; no console errors.

### 5 Oct 2026, section 4: illustrated scenes on the card backs
- **Brief:** the Lottie marks weren't good enough; make them feel premium
  and true to each service.
- **Built:** six new 8-second scenes on a 4:3 canvas, each showing what the
  client walks away with, in the page's drawing language (white paper,
  ink outline, hard ink shadow, pastel fills). Source:
  `scripts/build_service_marks.py` → `src/lottie/services/`.
  - **Research:** a lens reads down a report, the findings grow, then
    sort themselves biggest-first and the top one is marked.
  - **Journey:** a customer walks four touchpoints; each lights up and
    drops through the line of visibility to the work behind it.
  - **UI/UX:** a cursor taps through the app prototype, the tests come back
    green, then it frames a block in the site's design file.
  - **Branding:** a mark tries on forms and colours with its swatches; the
    type changes weight and a component switches with it.
  - **Data:** shop, email and app feed one customer card, which sends out a
    different tailored message each time.
  - **Testing:** A against B, meters fill, B wins and lifts, the score ring
    climbs and the week's dot lights in the rhythm.
- Every scene is a cycle that opens on a finished picture; reduced motion
  holds frame 150, the "result" moment. The v1 marks are untouched.

### 5 Oct 2026, section 4: two-sided cards that peel over from the corner
- **Brief:** "You need this when" and "What we do" on the front; the arrow
  turns the card to a back with "What you get" and the Lottie, instead of
  going to a new page; an out-of-the-box animation for the turn; a black
  arrow circle with the arrow in the card's colour; all cards one size.
- **Built:**
  - White section ground. Every card has a real bite out of its
    bottom-right corner (a clip-path drawn from the card's measured size),
    with the black button sitting in it.
  - Front: number, title, when, what, and a "See what you get" hint.
    Back: number and title, the service's Lottie mark, what you get, and
    the case-study link.
  - The turn is a corner peel: a fold sweeps from the bite to the far
    corner, the lifted paper turns back over the sheet (lit underside, soft
    shadow, held off the paper in perspective) and rolls off at the far
    corner. Pressing again lays the sheet back down. Geometry in
    `src/lib/cornerPeel.ts`.
  - Digital branding has a new Lottie mark (one form tried as square,
    circle and diamond over three swatches), added to
    `scripts/build_lottie.py`.
  - Marks run only while a card shows its back and the grid is near the
    screen. Grid rows are `1fr`, so all six cards share the tallest size.
- **Accessibility:** the hidden side is `inert`; the button carries
  `aria-expanded`/`aria-controls` and names the card. **Reduced motion:**
  the side changes without the peel, and the mark holds a still frame.
- **Open:** digital branding still has no case study, so its back has no
  link.
- **Checked** at 1440×900 and 390×844: the turn both ways, a second press
  mid-turn, keyboard, reduced motion. Typecheck and build pass.

### 2 Oct 2026, the film's entrance: a window that opens with the scroll
- **Krish:** after section 2 the film should come in "in a frame", ultra
  smooth, everything synced, not just scroll in.
- **Built:**
  - Section 2's light goes out on the last fix, so the hand-off is black to
    black, with no seam.
  - The film section holds on screen (sticky).
  - A small 16:9 window holding the film's first frame rises into the
    centre: soft sky outline and glow (a black window on a black page needs
    one), the "Our work in 30 seconds" chip under it, the film's cursor
    blinking while it waits.
  - Scrolling opens the window (0.9 screen heights) until its corners meet
    the screen; the outline and chip fade as it opens.
  - The film starts the instant the window is full. The hold continues one
    more screen, so it never plays half scrolled. It pauses once most of it
    has scrolled away, and resumes on the way back.
- **Phones, portrait, short windows:** unchanged, a 16:9 band that plays
  when on screen. **Reduced motion:** the end card. **The MP4 export:**
  unaffected.
- **Fixed on the way:** GSAP matchMedia only runs a conditions callback when
  one condition matches, so phones never got their autoplay; added an
  always-true condition.
- **Checked** in real Chrome at 1517×729, stepping section 2's end →
  window → full → playing → scrolled away (paused); phone 390×844 plays.
  Build passes.

### 2 Oct 2026, section 2's background: the line is gone, a real light image
- **Krish:** the curved line in section 2 adds nothing; "if it's an image,
  create something like that and leave the line".
- It wasn't an image: CSS gradient pleats plus a blurred SVG beam with a
  thin core line. Both are removed.
- **New:** `public/why-light.webp` (2560×1120, 58KB), made by
  `scripts/make-light-streaks.py` after Krish's light-streak reference. It
  shows a J of light hugging the bottom and sweeping up the right edge, seen
  through angled fluted glass. Each reed magnifies a slice of the light, so
  it slants inside the reed and steps between reeds. Colour runs from the
  page's ink through deep and bright blue to the palette's sky.
- On the page it fades in under the strip (no seam), stays low on the left
  where the words sit, and settles slowly (zoom 1.1 → 1, slight drift) as
  the story plays.
- **Checked:** rendered against the reference over four tuning passes, then
  on the page at 1517×729 at four story points. Build passes.

### 2 Oct 2026, section 3 is now a 30-second film (Krish: "make it")
- **Krish:** drop "Proof, not promises"; start a 30-second After
  Effects-style film as soon as section 2 ends. It should hook, carry the
  branding, and show our numbers and real work. No company-level numbers
  were given, so only the projects' own numbers are used.
- **Built:** `ProofFilm.tsx`. One GSAP timeline, exactly 30s, on a fixed
  1920×1080 frame scaled to the screen (fills landscape screens; whole frame
  on portrait).
  - 0:00 hook: "You've got 0.05 seconds." typed, then "That's how fast
    people judge a website." (Lindgaard et al., 2006).
  - 0:04 a cursor drags out a blank frame that snaps into Coco & Coir's
    homepage; our screens fly past the camera.
  - 0:08 five hits, 3s each: 22% Coco & Coir, 4X Fintuit, 30% HealthX, 92%
    Aladdin (screen seen through the numerals), 45 days Habari (day grid).
  - 0:23 the tilted screen wall, the five industries, "Real work. Real
    numbers."
  - 0:26 end card: the hero line, then umm, Let's talk, umm.digital.
- **Editing kit:** colour-led Cool Shape wipes, whip pans with motion blur,
  a punch-in with flash frame, camera shake on every number slam, slow
  push-ins, 12fps film grain.
- **On the page:** plays when 55% on screen, pauses off screen, with a
  play/pause, progress bar (click to seek) and timecode. Reduced motion: it
  waits on the end card. Screen readers get the projects and numbers as text.
  Keeps the `#work` anchor.
- **MP4:** `npm run render:film` seeks the timeline frame by frame (exact,
  no dropped frames) and encodes with ffmpeg-static. Outputs, kept out of
  git (`exports/`):
  - `exports/umm-our-work-30s.mp4` (master, 43.6MB)
  - `exports/umm-our-work-30s-share.mp4` (9.6MB)
- **Retired, not deleted:** `WorkShowcase.tsx` / `ScreenLoop.tsx` (unused
  now); the copy deck keeps the old section under "The tabbed version".
- **Checked:** rendered and reviewed 60 frames across the cut; fixed whip
  gaps, a scene's dark wash covering the next wipe, elements flashing in
  their end spot during cuts, and a label colliding with the 92% numerals.
  On the page at 1517×729 in Chrome it autoplays, pauses on button and off
  screen. Build passes.

### 2 Oct 2026, section 2 rebuilt as a scroll story (Krish: "build it")
- **Found and fixed a page-wide bug:** base.css sets `body { overflow-x:
  hidden }`. With v2's own overflow on `html`, that made body a scroll box,
  which silently stopped every sticky element from sticking. So the hero
  never actually held still, and the size-tabs section's and the closing
  band's sticky parts were affected too. v2 now clips instead of hiding.
  Result: the hero holds while the black rises over it, as designed.
- **Section 2, "ten teams → one company"** (`WhyBand.tsx`):
  - When the strip reaches the top, the section holds (260svh of scroll)
    and plays four beats.
  - Beat 1: ten team stickers float, fly together into a "one company"
    pill, and the pill flies into the headline and becomes its highlight.
  - Beats 2–4: each pain big, scratched out by the scroll, then the fix
    with its underline, shape and line of explanation.
  - A 01 · 02 · 03 counter tracks the pairs. Everything runs backwards on
    scroll up.
- **Phones / short windows:** the same story stacked, each beat plays once
  on arrival. **Reduced motion:** the finished state.
- **New copy:** the ten team names (added to the copy deck).
- **Also fixed:**
  - The underline/scratch lines broke into dashes and showed a stray dot
    before drawing (non-scaling stroke + an even dash pattern).
  - A staggered from() left the headline's second line visible early.
- **Glass cube** stops drawing once section 2 covers it.
- **Checked** frame by frame at 1517×729, 1920×960, 1280×720 and 390×844:
  the hero holds, the section holds steady through the story, no console
  errors, and the build passes.

### 2 Oct 2026, section 2 starts right under the strip (Krish)
- Krish likes section 2's content concept. Next step: make it interactive.
- Fixed now: section 2 starts directly under the strip. The lip is cut
  from 240 to 214 units and the dark ground's top padding removed. Gap from
  strip to headline went from about 150px to 49px (desktop) and 36px
  (phone). The light sweep fades in below the strip instead of starting on
  a hard edge.

### 2 Oct 2026, hero: 3D glass cube (Krish: "try once")
- Real 3D cube in the hero's top-right (`GlassCube3D.tsx`, three.js 0.186),
  modelled on the homepage's glass-cube PNG: rounded glass, dark interior,
  bright edge highlights, thin rainbow fringes, back edges showing through.
  Two strips seen inside it use the palette's sky and blossom.
- Motion: sways around the three-quarter view, leans toward the pointer,
  turns with the scroll, sinks with the hero.
- Weight: three.js loads as its own 131KB (gzipped) file after the
  headline. The cube waits 2s so it never competes with the intro. If frames
  run slow it drops to 1x resolution, then to a still frame. Reduced motion
  gets one still frame.
- Rendered and compared with the PNG (three tuning passes: too blocky, then
  too flat blue, then matched).

### 2 Oct 2026, hero: white ground, curvy strip (Krish)
- Hero background is now white (`--umm-paper`); the rest of the page is
  still `--umm-canvas` grey until Krish says otherwise.
- The strip is now a wave: up on the left, down through the middle, up on
  the right (46-unit swing either side of its centre line). It still
  flattens as the dark section reaches the top. The paragraph is kept clear
  by 28px or more at every size checked.

### 2 Oct 2026, hero revision 1, fixes after Krish's screenshot
- Krish: "what is even this? i am not liking it". His window (1920 screen
  at 125%, about 1517×729) showed three faults:
  - the ribbon covered the paragraph's last line;
  - a grey box sat around "enjoy" (the chip's shadow was clipped by the
    line mask);
  - a grey haze sat above the ribbon (a drop shadow nobody asked for).
- **Fixed:**
  - Chip shadow and band shadow removed.
  - The ribbon no longer grows past its 1440 size (72px band, 42px words on
    any wider screen).
  - Its first-screen position is measured: left end at 78% of the screen,
    pushed lower only as far as needed to stay 28px clear of the paragraph.
  - The headline is capped by screen height so wide, short windows keep
    room for the ribbon.
- **Checked** at 1517×729, 1536×730, 1896×911, 1920×960, 1440×900,
  1366×768, 1280×720 and 390×844: the paragraph is never covered, black
  shows under the ribbon, and the page is dark on arrival. Build passes.
- **Waiting on Krish:** whether the dislike was these faults or the
  ribbon-curtain idea itself.

### 2 Oct 2026, hero revision 1 (Krish's brief)
- **Brief:** artifact layout (headline top-left, round black CTA right,
  paragraph right-aligned under it). Ribbon visible on the first screen; on
  scroll the ribbon reveals section 2, which is dark. No star.
- **Built:** the hero is sticky; the dark Why section rises over it with the
  ribbon riding its curved top edge (`RibbonCurtain.tsx`). The curve
  straightens as it rises, the words speed up with scroll speed, and the hero
  sinks back (scale 0.93, fades to 35%) underneath. Page is black the moment
  the hero is gone.
- **Removed:** the star takeover (`StarTakeover.tsx` deleted), the glass cube
  from the hero (still in the closing band), the hero's second button.
- **Checked:** build passes, no console errors. On the first screen the
  ribbon's left end sits at 78% of the screen height with 64–92px of black
  under it on laptops. The paragraph clears the ribbon by 39–107px at
  1280×720 → 1440×900. The CTA and paragraph share one right edge.

### 2 Oct 2026, review
- Krish reviewed the full v2 build: **not his expectation**. Moving to
  section-by-section revision. Krish briefs each section; it gets rebuilt to
  his brief before the next one starts. The status table above is reset per
  section as each is revised.

### 2 Oct 2026, build
- Built the whole v2 page: 7 sections, nav, footer, star takeover, ribbon.
- Ported from the AI & Automation artifact: hero star takeover, tilted chip
  headlines (with the artifact's line and chip motion recipes), tools wheel.
- Kept from v1: the size-tab mechanics (odometer), ribbon, accordion, split
  buttons, tokens.
- Extracted 36 Cool Shapes as flat silhouettes so they take our pastels.
- Prepared screens for 5 projects (4 from the folder, HealthX captured).
- Checks: `npm run build` passes; headless smoke test at 1440 and 390 wide
  shows no console errors, no broken images, no horizontal scroll; every
  headline chip lands on its text; the pinned size tabs fit 1440×900,
  1366×768 and 1280×720.

### 2 Oct 2026, planning
- Researched 10 reference pages (the 7 from Santosh plus ustwo, Instrument
  and frog) and UMM's own 29 case studies.
- Flow agreed: 7 sections in Santosh's order.
- Copy deck written and approved by Krish.
- Reference board written (2–3 references per section plus our own ideas);
  Krish kept all of it.
