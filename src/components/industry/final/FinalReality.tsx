import { lazy, Suspense } from "react";
import { CoolIcon, pad, useCycle, type IconName } from "../glass/kit";
import { reality } from "@/content/fintech";

import type { Finish } from "./Element3D";

const Element3D = lazy(() => import("./Element3D"));

/* ============================================================================
   THE FINAL FINTECH PAGE — 02 · THE REALITY (Krish, 6 Nov: "take it from
   that box kind of thing only… make sure that it looks extremely perfect")

   Grid's reality section, in the final hero's language: no hairline frame,
   the same eyebrow, the heading's second line in the elements' blue.

     top     the eyebrow and heading on the left, the intro on the right,
             as in the hero
     left    a studio tile (the smaller column, Krish 6 Nov: "let the
             people focus on content") with its own blue 3D element for each
             pressure (Element3D): fragmented journeys as pieces drifting
             round an empty centre, time lost in operations as a fan of
             documents being sorted, growth with accountability as bars
             rising to a check
     right   all three pressures to read at once, one row each (Cool Shapes
             icon, title, text, number); the chosen one lifts onto a card
             with a line filling along its foot. They step on by themselves
             (paused under the pointer, stopped once one is picked)
     below   the point of view on a dark card, as the hero's right card

   A click on the element steps on too. The copy is the final copy.
   ========================================================================== */

const KINDS = ["fragments", "papers", "bars"] as const;
const ICON: IconName[] = ["fintech", "manufacturing", "ecommerce"];

/* Krish, 6 Nov: the elements in glass, the icons in a single colour.
   Kept as options: ?finish=blue (the glossy blue elements) and
   ?icons=pastel (the pastel gradient icons) */
const params = new URLSearchParams(window.location.search);
const finish: Finish = params.get("finish") === "blue" ? "blue" : "glass";
const icons = params.get("icons") === "pastel" ? "pastel" : "single";

export function FinalReality() {
  const c = reality;
  const n = c.cards.length;
  const { i, pick, host } = useCycle<HTMLDivElement>(n, 5600);
  return (
    <section id={c.id} className="fr" aria-labelledby="fr-title">
      <div className="fr__top" data-umm-reveal>
        <div className="fr__head">
          <p className="ff-eyebrow">{c.head.eyebrow}</p>
          <h2 id="fr-title" className="fr__title">
            <span>{c.head.lines[0]}</span>
            <span>
              <span className="ff-blue">{c.head.lines[1]}</span>
            </span>
          </h2>
        </div>
        <p className="fr__lead">{c.head.intro}</p>
      </div>

      <div ref={host} className="fr__grid">
        <div className="fr__stage" data-umm-reveal>
          <Suspense fallback={null}>
            <Element3D
              kinds={[...KINDS]}
              active={i}
              ground="#e4e4e8"
              at={[0.5, 0.5]}
              shadow
              finish={finish}
              onPick={() => pick((i + 1) % n)}
            />
          </Suspense>
          <div className="ff-tile__head">
            <p className="ff-glass">
              {pad(i)}
              <span className="fr__of">/ {pad(n - 1)}</span>
            </p>
          </div>
        </div>

        <ol className="fr__list" data-umm-reveal>
          {c.cards.map((x, k) => (
            <li
              key={x.title}
              className="fr__row"
              data-on={k === i || undefined}
            >
              <span className="fr__icon">
                <CoolIcon name={ICON[k]} look={icons} />
              </span>
              <div className="fr__text">
                <h3>
                  <button
                    type="button"
                    aria-pressed={k === i}
                    onClick={() => pick(k)}
                  >
                    {x.title}
                  </button>
                </h3>
                <p>{x.body}</p>
              </div>
              <span className="fr__num">{pad(k)}</span>
              <i className="fr__bar" />
            </li>
          ))}
        </ol>
      </div>

      <div className="fr__pov" data-umm-reveal>
        <p className="fr__pov-eyebrow">{c.view.eyebrow}</p>
        <p className="fr__pov-big">
          <span>{c.view.lines[0]}</span>{" "}
          <span className="fr__pov-blue">{c.view.lines[1]}</span>
        </p>
        <p className="fr__pov-body">{c.view.body}</p>
      </div>
    </section>
  );
}
