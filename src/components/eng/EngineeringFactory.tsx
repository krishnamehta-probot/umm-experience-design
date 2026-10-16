import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AiHead } from "@/components/ai/AiHead";
import type { Tone } from "@/components/primitives";
import { factory as engFactory } from "@/content/engineering";
import { FactoryScene } from "./FactoryScene";
import "@/styles/cloud-arch.css";
import "@/styles/eng-factory.css";
import "@/styles/eng-line.css";

/* ============================================================================
   DIGITAL ENGINEERING · INSIDE OUR ENGINEERING FACTORY

   16 Oct, the doc's second version: the release example gave way to the
   factory, the page's one story. An ink board, as the closing band is:

     the shared context (Jira, Figma, GitHub) feeds a delivery line of five
     stages, Define → Build → Validate → Release → Evolve. A work item rides
     the line, carrying what the stage it sits on delivers; every stage it
     has passed is stamped done. Under the line, the stage's intent, who
     directs (engineers), who assists (agents), the review gate it must
     pass and its delivery artifact. Next moves the work on; after Evolve
     it rides the loop back to Define, as production feedback returns to
     the backlog.

   Clicking a stage goes straight to it. It does not pin. Then the three
   principles, as the other boards' rule cards.

   16 Oct, Krish: something creative and interactive here, scroll-led if
   it suits, and nothing fitted to the screen so all of it always shows.
   So the board became a factory floor (FactoryScene): a conveyor under
   five machines, the work item riding it. The five stages are ordinary
   cards in the page's flow, every word of them on screen as the reader
   scrolls; beside them (over them on a phone) the floor holds still and
   the item travels with the scroll, pausing at each station while its
   card is read, picking up what that station makes. Clicking a station
   scrolls to its card. Where the window is too short to hold the floor
   still, it simply sits at the top of the board.
   ========================================================================== */

const TONES: Tone[] = ["blossom", "sky", "citrus", "sun", "coral"];
const RULE_TONES: Tone[] = ["sky", "sun", "blossom"];

const ICON = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const Person = () => (
  <svg {...ICON}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-6 7-6s6.2 2.4 7 6" />
  </svg>
);
const Spark = () => (
  <svg {...ICON}>
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
);
const Gate = () => (
  <svg {...ICON}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z" />
    <path d="m8.8 12.2 2.3 2.3 4.4-4.6" />
  </svg>
);
const Loop = () => (
  <svg {...ICON}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </svg>
);
const Check = () => (
  <svg {...ICON}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
);

export function EngineeringFactory({
  content = engFactory,
}: {
  content?: typeof engFactory;
}) {
  const { board, stages, principles } = content;
  const n = stages.length;
  const [at, setAt] = useState(0);
  const floorRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  /* the scroll carries the item: --p runs 0 to n-1 as the reading line
     passes the cards' middles, eased so the item rests at each station */
  useEffect(() => {
    const floor = floorRef.current;
    if (!floor) return;
    let raf = 0;
    let last = -1;
    const measure = () => {
      raf = 0;
      const cards = stepRefs.current.filter(Boolean) as HTMLLIElement[];
      if (!cards.length) return;
      const vh = window.innerHeight;
      /* the reading line: mid-screen beside the floor, or, with the floor
         held at the top of a phone, a little under it */
      const stuck =
        getComputedStyle(floor).position === "sticky" &&
        floor.getBoundingClientRect().top < vh * 0.4;
      const line =
        stuck && window.innerWidth < 1000
          ? floor.getBoundingClientRect().bottom +
            (vh - floor.getBoundingClientRect().bottom) * 0.35
          : vh * 0.5;
      const mids = cards.map((c) => {
        const r = c.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      let p = 0;
      if (line >= mids[mids.length - 1]) p = mids.length - 1;
      else if (line > mids[0]) {
        const i = mids.findIndex((m, k) => line >= m && line < mids[k + 1]);
        const f = (line - mids[i]) / (mids[i + 1] - mids[i]);
        /* rest at a station for the first and last fifth of the way */
        const t = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
        p = i + t * t * (3 - 2 * t);
      }
      floor.style.setProperty("--p", p.toFixed(4));
      const now = Math.round(p);
      if (now !== last) {
        last = now;
        setAt(now);
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (i: number) =>
    stepRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

  return (
    <section
      className="umm-section cd-arch ef"
      id="factory"
      aria-labelledby="ef-title"
    >
      <div className="umm-container cd-arch__head">
        <AiHead
          id="ef-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="blossom"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <p className="cx-lead ef__intro">{content.intro}</p>

        <div
          className="ef__board"
          data-umm-theme="ink"
          role="group"
          aria-label={board.label}
        >
          <div className="ef__top">
            <span className="ef__eyebrow">
              <span className="ef__live" aria-hidden="true" />
              {board.eyebrow}
            </span>
            <span className="ef__label">{board.tag}</span>
          </div>

          {/* the shared context feeding the line */}
          <div className="ef__context">
            <span className="ef__label">{board.contextLabel}</span>
            <ul>
              {board.context.map((c) => (
                <li key={c.tool}>
                  <strong>{c.tool}</strong>
                  <span>{c.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ef__story">
            {/* the floor, held still while the cards pass */}
            <div className="ef__hold" ref={floorRef}>
              <FactoryScene at={at} tones={TONES} />
              <ol className="ef__stations" aria-label={board.label}>
                {stages.map((s, i) => (
                  <li key={s.name} data-umm-tone={TONES[i % TONES.length]}>
                    <button
                      type="button"
                      className="ef__station"
                      aria-current={i === at ? "step" : undefined}
                      data-done={i < at || undefined}
                      onClick={() => goTo(i)}
                    >
                      <span className="ef__stage-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="ef__stage-name">{s.name}</span>
                      <span className="ef__stamp" aria-hidden="true">
                        <Check />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            {/* the stages, in the page's flow */}
            <ol className="ef__steps">
              {stages.map((stage, i) => {
                const tone = TONES[i % TONES.length];
                return (
                  <li
                    key={stage.name}
                    className="ef__step"
                    data-on={i === at || undefined}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    style={
                      {
                        ["--tone" as string]: `var(--umm-${tone})`,
                      } as CSSProperties
                    }
                  >
                    <div className="ef__intent">
                      <span className="ef__label ef__label--tone">
                        {String(i + 1).padStart(2, "0")} / {stage.name}
                      </span>
                      <h3 className="ef__title">{stage.title}</h3>
                      <p className="ef__body">{stage.body}</p>
                    </div>
                    <ul className="ef__roles">
                      <li>
                        <span className="ef__role-icon">
                          <Person />
                        </span>
                        <span>
                          <span className="ef__label">{board.directLabel}</span>
                          <p>{stage.direct}</p>
                        </span>
                      </li>
                      <li>
                        <span className="ef__role-icon ef__role-icon--agent">
                          <Spark />
                        </span>
                        <span>
                          <span className="ef__label">{board.assistLabel}</span>
                          <p>{stage.assist}</p>
                        </span>
                      </li>
                      <li className="ef__gate">
                        <span className="ef__role-icon ef__role-icon--gate">
                          <Gate />
                        </span>
                        <span>
                          <span className="ef__label">{board.gateLabel}</span>
                          <p>{stage.gate}</p>
                        </span>
                      </li>
                    </ul>
                    <div className="ef__artifact">
                      <span className="ef__label">{board.artifactLabel}</span>
                      <p>{stage.artifact}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="ef__loop" data-on={at === n - 1 || undefined}>
            <Loop />
            {board.loop}
          </p>
        </div>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li
              key={p.title}
              className="cd-arch__rule"
              data-umm-tone={RULE_TONES[i]}
            >
              <span className="cd-arch__rule-tag">
                {String(i + 1).padStart(2, "0")} / {p.step}
              </span>
              <h3 className="cd-arch__rule-title">{p.title}</h3>
              <p className="cd-arch__rule-body">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
