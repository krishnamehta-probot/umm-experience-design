"""
============================================================================
INTEGRATED GROWTH & STRATEGY SERVICE SCENES -- LOTTIE SOURCE FOR ITS SERVICE CARDS

The Integrated Growth & Strategy page's six service cards, in exactly the language of the
AI page's (scripts/build_ai_service_marks.py, whose helpers and loop check
these use): white paper panels with an ink outline and a hard ink shadow,
pastel fills, heavy round strokes, no text glyphs (words are skeleton
bars), wide 2 : 1 scenes, an 8-second cycle that lands back on frame 0,
the finished picture on frame 0.

    python scripts/build_growth_service_marks.py

writes src/lottie/growth-services/*.json, one per scene in scripts/growth_marks/.
============================================================================
"""
import importlib
import json
import os
import sys

HERE = os.path.dirname(__file__)
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "growth_marks"))

from build_ai_service_marks import _verify  # noqa: E402

SCENES = [
    ("align", "compass"),
    ("position", "standout"),
    ("attract", "magnet"),
    ("develop", "journey"),
    ("learn", "experiment"),
    ("connect", "routing"),
]

if __name__ == "__main__":
    out = os.path.join(HERE, "..", "src", "lottie", "growth-services")
    os.makedirs(out, exist_ok=True)
    only = set(sys.argv[1:])
    for name, module in SCENES:
        if only and name not in only and module not in only:
            continue
        d = importlib.import_module(module).build()
        _verify(name, d)
        dest = os.path.join(out, "%s.json" % name)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(d, f, separators=(",", ":"))
        print("  %-12s %2d layers  %6.1f KB  %.1fs"
              % (name, len(d["layers"]), os.path.getsize(dest) / 1024, d["op"] / d["fr"]))
