import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { AiHead } from "@/components/ai/AiHead";
import type { Tone } from "@/components/primitives";
import { architecture, type ArchWorkflow } from "@/content/cloudData";
import "@/styles/cloud-arch.css";
import "@/styles/cloud-net.css";

/* ============================================================================
   CLOUD & DATA · THE THINKING BEHIND THE INFRASTRUCTURE

   16 Oct, the doc's second version: one connected architecture instead of
   the three scenarios. An ink board, as the closing band is ink: the
   intelligence layer (AI orchestration) across the top; your existing
   systems, the connected platform and what it enables in a row under it,
   joined by connectors that carry data; the feedback loop back up; the
   engineer oversight along the foot.

   Three workflow views (Cloud provisioning, Data migration, Cloud
   operations), chosen from the pills on the intelligence layer or the tabs
   under the board: each lights its part of the board and shows its path,
   what AI supports, the engineer's decision, the evidence and the outcome.
   Reset architecture goes back to Cloud provisioning. It does not pin; a
   reader clicks through it. Then the three principles as rule cards.

   16 Oct, Krish: make it interactive, and never fit it to the screen so
   all of it shows on any device. So it stays in the page's flow, and:
     - every part of the board is a way in: tap a system, a platform box,
       an outcome or the loop and its view opens (hover previews it on the
       board with a mouse)
     - when a view opens, its path lights in order, systems to platform to
       outcome and back up the loop
     - until the reader touches it, the views turn on their own while the
       board is on screen, the chosen tab filling as the next comes
     - a light follows the pointer over the ink
   ========================================================================== */

const TONE: Tone[] = ["sky", "citrus", "blossom"];

/** What each view lights on the board. */
const LIT: Record<
  ArchWorkflow["id"],
  { systems: number; parts: string[]; outcome: number }
> = {
  provisioning: { systems: 2, parts: ["runtime"], outcome: 0 },
  migration: { systems: 1, parts: ["movement", "data"], outcome: 1 },
  operations: { systems: 0, parts: ["observe", "loop"], outcome: 2 },
};

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

const Spark = () => (
  <svg {...ICON}>
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
);
const Apps = () => (
  <svg {...ICON}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
);
const Data = () => (
  <svg {...ICON}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
);
const Code = () => (
  <svg {...ICON}>
    <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13" />
  </svg>
);
const Cloud = () => (
  <svg {...ICON}>
    <path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.4 9.1 4.75 4.75 0 0 0 7 18.5z" />
  </svg>
);
const Stack = () => (
  <svg {...ICON}>
    <rect x="4" y="4.5" width="16" height="4.5" rx="1.2" />
    <rect x="4" y="10" width="16" height="4.5" rx="1.2" />
    <rect x="4" y="15.5" width="16" height="4.5" rx="1.2" />
  </svg>
);
const Pulse = () => (
  <svg {...ICON}>
    <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
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

const SYSTEM_ICON = [Apps, Data, Code];

/** how long each view holds while the views turn on their own */
const TURN_MS = 7000;

/** The view a part of the board belongs to. */
const VIEW_OF = {
  system: (i: number) =>
    (Object.keys(LIT) as ArchWorkflow["id"][]).find(
      (k) => LIT[k].systems === i,
    ),
  part: (part: string) =>
    (Object.keys(LIT) as ArchWorkflow["id"][]).find((k) =>
      LIT[k].parts.includes(part),
    ),
  outcome: (i: number) =>
    (Object.keys(LIT) as ArchWorkflow["id"][]).find(
      (k) => LIT[k].outcome === i,
    ),
};

/** A connector between two columns: its label and an arrow, with data
 *  travelling along it. */
function Link({ label, lit }: { label: string; lit: boolean }) {
  return (
    <div className="cd-net__link" data-on={lit}>
      <span className="cd-net__link-label">{label}</span>
      <span className="cd-net__wire" aria-hidden="true">
        <i />
        <i />
      </span>
    </div>
  );
}

export function ConnectedArchitecture({
  content = architecture,
}: {
  content?: typeof architecture;
}) {
  const { board, workflows, principles } = content;
  const [pick, setPick] = useState(0);
  /** the view a hovered part previews on the board */
  const [peek, setPeek] = useState<number | null>(null);
  /** turning on its own until the reader takes over */
  const [auto, setAuto] = useState(true);
  const [seen, setSeen] = useState(false);
  const reduced = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const wf = workflows[pick];
  const shown = workflows[peek ?? pick];
  const lit = LIT[shown.id];
  const on = (part: string) => lit.parts.includes(part);
  const turning = auto && seen && !reduced;

  /* turn only while the board is on screen */
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!turning) return;
    const t = window.setTimeout(
      () => setPick((p) => (p + 1) % workflows.length),
      TURN_MS,
    );
    return () => window.clearTimeout(t);
  }, [turning, pick, workflows.length]);

  /** the reader chose: the views stop turning */
  const choose = (i: number) => {
    setAuto(false);
    setPeek(null);
    setPick(i);
  };
  const indexOf = (id?: ArchWorkflow["id"]) =>
    id ? workflows.findIndex((w) => w.id === id) : -1;
  /** handlers that make a part of the board open its view */
  const way = (id?: ArchWorkflow["id"]) => {
    const i = indexOf(id);
    if (i < 0) return {};
    return {
      "data-way": true,
      onClick: () => choose(i),
      onPointerEnter: (e: PointerEvent) =>
        e.pointerType === "mouse" && setPeek(i),
      onPointerLeave: () => setPeek(null),
    };
  };
  /** the light that follows the pointer over the ink */
  const follow = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section
      className="umm-section cd-arch cd-net"
      id="architecture"
      aria-labelledby="cd-net-title"
    >
      <div className="umm-container cd-arch__head">
        <AiHead
          id="cd-net-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="sky"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <div
          className="cd-net__board"
          ref={boardRef}
          data-umm-theme="ink"
          data-flow={shown.id}
          role="group"
          aria-label={board.label}
          onPointerMove={follow}
        >
          <div className="cd-net__top">
            <span className="cd-net__eyebrow">
              <span className="cd-net__live" aria-hidden="true" />
              {board.eyebrow}
            </span>
            <span className="cd-net__tag">{board.tag}</span>
          </div>

          {/* the intelligence layer */}
          <div className="cd-net__layer">
            <span className="cd-net__layer-icon">
              <Spark />
            </span>
            <div className="cd-net__layer-text">
              <span className="cd-net__mono">{board.layerEyebrow}</span>
              <p className="cd-net__layer-title">{board.layerTitle}</p>
            </div>
            <div className="cd-net__layer-side">
              <div className="cd-net__pills">
                {workflows.map((w, i) => (
                  <button
                    key={w.id}
                    type="button"
                    className="cd-net__pill"
                    aria-pressed={i === pick}
                    aria-controls="cd-net-panel"
                    onClick={() => choose(i)}
                  >
                    {w.short}
                  </button>
                ))}
              </div>
              <p className="cd-net__layer-note">{board.layerNote}</p>
            </div>
          </div>

          <div className="cd-net__assist" aria-hidden="true">
            <span className="cd-net__mono">{board.assist}</span>
            <span className="cd-net__drop">
              <i />
            </span>
          </div>

          {/* systems → platform → outcomes */}
          <div className="cd-net__row">
            <div className="cd-net__col">
              <span className="cd-net__mono cd-net__col-label">
                {board.systemsLabel}
              </span>
              <ul className="cd-net__list">
                {board.systems.map((s, i) => {
                  const Icon = SYSTEM_ICON[i];
                  return (
                    <li
                      key={s.title}
                      className="cd-net__node"
                      data-on={lit.systems === i}
                      {...way(VIEW_OF.system(i))}
                    >
                      <span className="cd-net__node-icon">
                        <Icon />
                      </span>
                      <span>
                        <span className="cd-net__node-title">{s.title}</span>
                        <span className="cd-net__node-sub">{s.items}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Link label={board.systemsLink} lit />

            <div className="cd-net__platform">
              <span className="cd-net__mono cd-net__col-label">
                {board.platformLabel}
              </span>
              <p
                className="cd-net__move"
                data-on={on("movement")}
                {...way(VIEW_OF.part("movement"))}
              >
                {board.movement}
              </p>
              <div className="cd-net__pair">
                <div
                  className="cd-net__box"
                  data-on={on("runtime")}
                  {...way(VIEW_OF.part("runtime"))}
                >
                  <Cloud />
                  <p className="cd-net__box-title">{board.runtime.title}</p>
                  <p className="cd-net__box-body">{board.runtime.body}</p>
                </div>
                <div
                  className="cd-net__box"
                  data-on={on("data")}
                  {...way(VIEW_OF.part("data"))}
                >
                  <Stack />
                  <p className="cd-net__box-title">{board.data.title}</p>
                  <p className="cd-net__box-body">{board.data.body}</p>
                </div>
              </div>
              <div
                className="cd-net__observe"
                data-on={on("observe")}
                {...way(VIEW_OF.part("observe"))}
              >
                <Pulse />
                <span>
                  <span className="cd-net__box-title">
                    {board.observe.title}
                  </span>
                  <span className="cd-net__box-body">
                    {board.observe.items}
                  </span>
                </span>
              </div>
              <p className="cd-net__providers">{board.providers.join(" · ")}</p>
            </div>

            <Link label={board.outcomesLink} lit />

            <div className="cd-net__col">
              <span className="cd-net__mono cd-net__col-label">
                {board.outcomesLabel}
              </span>
              <ol className="cd-net__list">
                {board.outcomes.map((o, i) => (
                  <li
                    key={o}
                    className="cd-net__outcome"
                    data-on={lit.outcome === i}
                    data-umm-tone={TONE[i]}
                    {...way(VIEW_OF.outcome(i))}
                  >
                    <span className="cd-net__mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="cd-net__outcome-text">{o}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <p
            className="cd-net__loop"
            data-on={on("loop")}
            {...way(VIEW_OF.part("loop"))}
          >
            <Loop />
            {board.loop}
          </p>

          <div className="cd-net__oversight">
            <span className="cd-net__mono">{board.oversightLabel}</span>
            <ul>
              {board.oversight.map((o) => (
                <li key={o}>
                  <Check />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* the workflow views */}
        <div
          className="cd-net__tabs"
          role="tablist"
          aria-label={board.workflowsLabel}
        >
          {workflows.map((w, i) => (
            <button
              key={w.id}
              type="button"
              role="tab"
              className="cd-net__tab"
              aria-selected={i === pick}
              aria-controls="cd-net-panel"
              data-umm-tone={TONE[i]}
              data-turning={turning && i === pick ? "true" : undefined}
              style={{ ["--turn" as string]: `${TURN_MS}ms` } as CSSProperties}
              onClick={() => choose(i)}
            >
              <span className="cd-net__mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              {w.label}
            </button>
          ))}
        </div>

        <div
          className="cd-net__panel"
          id="cd-net-panel"
          role="tabpanel"
          aria-live="polite"
        >
          <div
            className="cd-net__detail"
            key={wf.id}
            style={
              {
                ["--tone" as string]: `var(--umm-${TONE[pick]})`,
              } as CSSProperties
            }
          >
            <div className="cd-net__path">
              <span className="cd-net__mono">{wf.eyebrow}</span>
              <h3 className="cd-net__title">{wf.title}</h3>
              <p className="cd-net__body">{wf.body}</p>
            </div>
            <dl className="cd-net__facts">
              <div>
                <dt className="cd-net__mono">{board.aiLabel}</dt>
                <dd>{wf.ai}</dd>
              </div>
              <div>
                <dt className="cd-net__mono">{board.decisionLabel}</dt>
                <dd>{wf.decision}</dd>
              </div>
            </dl>
            <dl className="cd-net__facts">
              <div>
                <dt className="cd-net__mono">{board.evidenceLabel}</dt>
                <dd>{wf.evidence.join(" · ")}</dd>
              </div>
              <div>
                <dt className="cd-net__mono">{board.outcomeLabel}</dt>
                <dd>{wf.outcome}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="cd-net__foot">
          <p className="cd-arch__note">{board.disclaimer}</p>
          <button
            type="button"
            className="cd-arch__reset"
            onClick={() => choose(0)}
            disabled={pick === 0}
          >
            <Loop />
            {board.reset}
          </button>
        </div>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li key={p.title} className="cd-arch__rule" data-umm-tone={TONE[i]}>
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
