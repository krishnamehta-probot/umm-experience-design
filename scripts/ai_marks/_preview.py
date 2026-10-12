"""
Build one scene module of scripts/ai_marks and write it where the page reads
it (src/lottie/ai-services/<out>.json), after the loop check.

    python scripts/ai_marks/_preview.py maze strategy
"""
import importlib
import json
import os
import sys

HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.dirname(HERE))
sys.path.insert(0, HERE)

from build_ai_service_marks import _verify  # noqa: E402

module, out = sys.argv[1], sys.argv[2]
d = importlib.import_module(module).build()
_verify(module, d)
dest = os.path.join(HERE, "..", "..", "src", "lottie", "ai-services", "%s.json" % out)
with open(dest, "w", encoding="utf-8") as f:
    json.dump(d, f, separators=(",", ":"))
print("wrote", os.path.normpath(dest), "%.1f KB" % (os.path.getsize(dest) / 1024))
