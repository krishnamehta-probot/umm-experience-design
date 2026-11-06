import { useEffect, useRef, useState } from "react";
import { Dock } from "@/components/home/Dock";
import { IndustryHero } from "@/components/industry/IndustryHero";
import { MosaicHero } from "@/components/industry/MosaicHero";
import { HaloHero } from "@/components/industry/HaloHero";
import { PastelHero } from "@/components/industry/PastelHero";
import { HouseHero } from "@/components/industry/HouseHero";
import { FlowHero, type FlowOptions } from "@/components/industry/FlowHero";
import {
  AiUses,
  Audiences,
  Impact,
  Journeys,
  NextChapter,
  Operations,
  Reality,
  SystemMap,
  Work,
} from "@/components/industry/FintechSections";
import {
  Receipt,
  RouteLayer,
  RouteProvider,
  SendCard,
} from "@/components/industry/Route";
import { FinHero } from "@/components/industry/FinHero";
import {
  Ai3,
  Audiences3,
  Connects3,
  Contact3,
  Impact3,
  Journeys3,
  Operations3,
  Reality3,
  Work3,
} from "@/components/industry/FinSections";
import { PanelPage } from "@/components/industry/PanelPage";
import { GridPage } from "@/components/industry/GridPage";
import { useReveal } from "@/lib/useReveal";
import {
  ai,
  audiences,
  contact,
  hero,
  impact,
  journeys,
  meta,
  operations,
  reality,
  route,
  system,
  work,
} from "@/content/fintech";

/**
 * Fintech, Banking & Insurance — the first of the ten industry pages
 * (2 Nov 2026). Its own design, not the service pages' locked one. On
 * 5 Nov Krish fixed the live draft as the final structure and content; the
 * nine sections after the hero follow it (FintechSections.tsx), and the
 * site's own footer follows the page.
 *
 * The page itself (Krish, 5 Nov), `?page=`:
 *   route  one payment, start to finish: sent from a card in the hero, it
 *          travels down the page, each section a stop, and lands in a
 *          receipt at the close (Route.tsx). The default.
 *   draft  the live draft's layout redrawn in the brand, without the route.
 *
 * The hero: Flow is the final candidate (Krish, 2 Nov: "something like that
 * Stripe thing only but more nicer", settled from one options panel). Every
 * earlier version is kept as an option. `?options` shows the panel: a Hero
 * row, then Flow's own rows. Every choice is kept in the address, so a
 * link opens on it.
 *   flow      flowing brand colour in a shape kept clear of the copy (FlowHero)
 *   mosaic    the copy beside a board of quarter-circle tiles (MosaicHero)
 *   halo      the halo as live light: liquid, corona, prism, soft (HaloHero)
 *   orbit     a 3D band orbiting the headline: chrome, pearl, glass (HaloHero)
 *   wallet    a fanned deck of pastel sector cards (PastelHero)
 *   rising    three pastel columns rising like a chart (PastelHero)
 *   card      a glass bank card with sector stickers (HouseHero)
 *   centre    centred under a glass shield (HouseHero)
 *   fluted    a dark panel lit by the fluted light, a glass coin (HouseHero)
 *   momentum  the last word drawn full width: glass, foil, pastel (IndustryHero)
 */

type Item<T extends string> = { id: T; label: string; hint: string };

const HEROES = [
  {
    id: "finance",
    label: "Finance",
    hint: "The card scene: the bank card, your financial world, payment received.",
  },
  {
    id: "flow",
    label: "Flow",
    hint: "The final candidate: flowing brand colour, clear of the words.",
  },
  {
    id: "mosaic",
    label: "Mosaic",
    hint: "The copy beside a board of quarter-circle tiles.",
  },
  {
    id: "halo",
    label: "Halo",
    hint: "A soft pastel halo of live light round the copy.",
  },
  { id: "orbit", label: "Orbit", hint: "A 3D band orbiting the headline." },
  {
    id: "wallet",
    label: "Wallet",
    hint: "A fanned deck of pastel sector cards.",
  },
  {
    id: "rising",
    label: "Rising",
    hint: "Three pastel columns rising like a chart.",
  },
  {
    id: "card",
    label: "Card",
    hint: "A glass bank card with sector stickers.",
  },
  { id: "centre", label: "Centre", hint: "Centred under a glass shield." },
  {
    id: "fluted",
    label: "Fluted",
    hint: "A dark fluted-light panel with a glass coin.",
  },
  {
    id: "momentum",
    label: "Momentum",
    hint: "The last word drawn full width.",
  },
] as const satisfies readonly Item<string>[];

type HeroPick = (typeof HEROES)[number]["id"];

const PAGES = [
  {
    id: "panel",
    label: "Panel",
    hint: "Modern, after Tirtus: an ink hero lit through fluted glass, a white sheet rising over it, numbered cards (6 Nov).",
  },
  {
    id: "grid",
    label: "Grid",
    hint: "Modern, after Fluxlab: an editorial grid of hairlines, pills, fluted-glass tiles and glass objects (6 Nov).",
  },
  {
    id: "designed",
    label: "Designed",
    hint: "One screen per section, with its drawings and motion (version 3).",
  },
  {
    id: "route",
    label: "Payment route",
    hint: "One payment travels down the page, stop by stop, and lands in a receipt.",
  },
  {
    id: "draft",
    label: "Draft layout",
    hint: "The live draft’s layout, redrawn in the brand, without the route.",
  },
] as const satisfies readonly Item<string>[];

type PagePick = (typeof PAGES)[number]["id"];

const FLOW_ROWS: {
  key: keyof FlowOptions;
  label: string;
  items: Item<string>[];
}[] = [
  {
    key: "shape",
    label: "Shape",
    items: [
      {
        id: "slant",
        label: "Slant",
        hint: "A diagonal across the top, as on Stripe, falling clear of the words.",
      },
      {
        id: "wave",
        label: "Wave",
        hint: "The diagonal’s edge as a slow, rolling wave.",
      },
      {
        id: "quarter",
        label: "Quarter",
        hint: "A quarter circle from the top-right corner: the shape the UMM mark is built from.",
      },
      {
        id: "panel",
        label: "Panel",
        hint: "A rounded panel of colour beside the words.",
      },
    ],
  },
  {
    key: "palette",
    label: "Palette",
    items: [
      { id: "brand", label: "Brand", hint: "All five brand pastels." },
      {
        id: "night",
        label: "Night",
        hint: "Ink, with sky, blossom and coral flowing through it as light.",
      },
      {
        id: "cool",
        label: "Cool",
        hint: "Sky and blossom, a touch of citrus.",
      },
      {
        id: "warm",
        label: "Warm",
        hint: "Sun, coral and blossom, a touch of citrus.",
      },
    ],
  },
  {
    key: "finish",
    label: "Finish",
    items: [
      { id: "smooth", label: "Smooth", hint: "Flat, smooth colour." },
      {
        id: "silk",
        label: "Silk",
        hint: "The folds of colour catch a soft sheen, like silk.",
      },
      {
        id: "grain",
        label: "Grain",
        hint: "A fine print grain over flat colour.",
      },
      {
        id: "silkgrain",
        label: "Silk + grain",
        hint: "The sheen and the grain together.",
      },
    ],
  },
  {
    key: "motion",
    label: "Motion",
    items: [
      { id: "calm", label: "Calm", hint: "Half pace: barely moving." },
      { id: "flow", label: "Flow", hint: "A slow, steady drift." },
      { id: "lively", label: "Lively", hint: "Nearly twice the pace." },
    ],
  },
  {
    key: "copy",
    label: "Copy",
    items: [
      { id: "left", label: "Left", hint: "The words at the bottom left." },
      { id: "centre", label: "Centre", hint: "The words centred at the foot." },
    ],
  },
];

const FLOW_DEFAULT: FlowOptions = {
  shape: "slant",
  palette: "brand",
  finish: "silk",
  motion: "flow",
  copy: "left",
};

/** One row of the panel, in the homepage dock's markup: its buttons, and a
 *  line under them saying what the hovered (or chosen) one does. */
function Row<T extends string>({
  label,
  items,
  value,
  onPick,
}: {
  label: string;
  items: readonly Item<T>[];
  value: T;
  onPick: (v: T) => void;
}) {
  const [hover, setHover] = useState<T | null>(null);
  const hint = items.find((it) => it.id === (hover ?? value))?.hint;
  return (
    <fieldset className="ha-dock__set">
      <legend>{label}</legend>
      <div onPointerLeave={() => setHover(null)}>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            aria-pressed={value === it.id}
            onPointerEnter={() => setHover(it.id)}
            onClick={() => onPick(it.id)}
          >
            {it.label}
          </button>
        ))}
      </div>
      <p className="ha-dock__hint">{hint ?? " "}</p>
    </fieldset>
  );
}

export function FintechPage() {
  const params = new URLSearchParams(window.location.search);
  const options = params.has("options");
  const [page, setPage] = useState<PagePick>(
    () => PAGES.find((p) => p.id === params.get("page"))?.id ?? "designed",
  );
  const [pick, setPick] = useState<HeroPick>(
    () => HEROES.find((h) => h.id === params.get("hero"))?.id ?? "finance",
  );
  const [flow, setFlow] = useState<FlowOptions>(() => {
    const o = { ...FLOW_DEFAULT };
    for (const row of FLOW_ROWS) {
      const q = params.get(row.key);
      if (q && row.items.some((it) => it.id === q))
        (o as Record<string, string>)[row.key] = q;
    }
    return o;
  });

  useEffect(() => {
    document.title = meta.title;
  }, []);

  const root = useRef<HTMLDivElement>(null);
  const routed = page === "route";

  useReveal([page, pick]);

  /* every choice is kept in the address */
  const remember = (key: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState(null, "", url);
  };

  const heroView = (() => {
    switch (pick) {
      case "finance":
        return <FinHero content={hero} />;
      case "flow":
        return (
          <FlowHero
            content={hero}
            opts={flow}
            aside={routed ? <SendCard /> : undefined}
          />
        );
      case "mosaic":
        return <MosaicHero content={hero} />;
      case "halo":
      case "orbit":
        return <HaloHero key={pick} content={hero} kind={pick} />;
      case "wallet":
      case "rising":
        return <PastelHero key={pick} content={hero} layout={pick} />;
      case "card":
      case "centre":
      case "fluted":
        return <HouseHero key={pick} content={hero} layout={pick} tone="sky" />;
      case "momentum":
        return <IndustryHero content={hero} fill="foil" />;
    }
  })();

  const dock = options && (
    <Dock>
      <Row
        label="Page"
        items={PAGES}
        value={page}
        onPick={(id) => {
          setPage(id);
          remember("page", id);
        }}
      />
    </Dock>
  );

  /* the two modern pages (6 Nov) are whole pages of their own, hero and all */
  if (page === "panel" || page === "grid") {
    return (
      <div className="ind" data-page={page} key={page}>
        {page === "panel" ? <PanelPage /> : <GridPage />}
        {dock}
      </div>
    );
  }

  const body = (
    <>
      {heroView}

      {options && (
        <Dock>
          <Row
            label="Page"
            items={PAGES}
            value={page}
            onPick={(id) => {
              setPage(id);
              remember("page", id);
            }}
          />
          <Row
            label="Hero"
            items={HEROES}
            value={pick}
            onPick={(id) => {
              setPick(id);
              remember("hero", id);
            }}
          />
          {pick === "flow" &&
            FLOW_ROWS.map((row) => (
              <Row
                key={row.key}
                label={row.label}
                items={row.items}
                value={flow[row.key]}
                onPick={(id) => {
                  setFlow((f) => ({ ...f, [row.key]: id }));
                  remember(row.key, id);
                }}
              />
            ))}
        </Dock>
      )}

      {page === "designed" ? (
        <main key={page}>
          <Reality3 content={reality} />
          <Journeys3 content={journeys} />
          <Operations3 content={operations} />
          <Connects3 content={system} />
          <Work3 content={work} />
          <Audiences3 content={audiences} />
          <Impact3 content={impact} />
          <Ai3 content={ai} />
          <Contact3 content={contact} />
        </main>
      ) : (
        <main key={page}>
          <Reality content={reality} />
          <Journeys content={journeys} />
          <Operations content={operations} />
          <SystemMap content={system} />
          <Work content={work} />
          <Audiences content={audiences} />
          <Impact content={impact} />
          <AiUses content={ai} />
          {/* the close takes the hero's flowing colour, in the hero's palette */}
          <NextChapter
            content={contact}
            palette={pick === "flow" ? flow.palette : "brand"}
            aside={routed ? <Receipt /> : undefined}
          />
        </main>
      )}

      {routed && <RouteLayer rootRef={root} />}
    </>
  );

  return (
    <div
      ref={root}
      className="ind"
      data-page={page}
      data-route={routed || undefined}
    >
      {routed ? (
        <RouteProvider key={page} content={route}>
          {body}
        </RouteProvider>
      ) : (
        body
      )}
    </div>
  );
}
