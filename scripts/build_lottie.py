"""
============================================================================
SERVICE MARKS -- LOTTIE SOURCE

The marks on the service cards, generated rather than
hand-edited: a 240x240 composition is a few thousand lines of JSON, and the
part worth editing is the timing, not the punctuation.

Each mark renders at ~120px on the card, so what reads at that size is
movement, not small parts. Strokes are heavy, element counts are low, and
every composition resolves back to its own first frame so the loop has no
cut in it.

    python scripts/build_lottie.py

writes src/lottie/*.json.
============================================================================
"""
import json
import math
import os

FPS = 30
OP = 168                      # 5.6s -- long enough for a beat to land and hold
W = H = 240
C = 120                       # centre

# The palette, normalised. A mark sits on its own card's colour, so its accent
# is always a different one of the five or it would vanish into the ground.
INK = [0.063, 0.055, 0.078, 1]
PAPER = [1, 1, 1, 1]
BLOSSOM = [1, 0.769, 0.949, 1]
CITRUS = [0.941, 1, 0.439, 1]
SKY = [0.820, 0.906, 1, 1]
CORAL = [1, 0.765, 0.769, 1]

# Easing, as cubic-bezier control points.
OUT = (0.22, 1, 0.36, 1)         # decelerate -- the default for an arrival
INOUT = (0.65, 0, 0.35, 1)       # travel between two rests
IN = (0.55, 0, 1, 0.45)          # leave
SPRING = (0.34, 1.5, 0.64, 1)    # arrive with a little overshoot
LIN = (0.333, 0.333, 0.667, 0.667)


# --- value helpers ---------------------------------------------------------

def v(x):
    """A static property."""
    return {"a": 0, "k": x}


def kf(points):
    """
    An animated property. `points` is [(frame, value[, ease_to_next]), ...];
    repeat a value at two frames to hold it there.
    """
    out = []
    for i, pt in enumerate(points):
        t, val = pt[0], pt[1]
        ease = pt[2] if len(pt) > 2 else OUT
        val = list(val) if isinstance(val, (list, tuple)) else [val]
        k = {"t": t, "s": val}
        if i < len(points) - 1:
            x1, y1, x2, y2 = ease
            n = len(val)
            k["o"] = {"x": [x1] * n, "y": [y1] * n}
            k["i"] = {"x": [x2] * n, "y": [y2] * n}
        out.append(k)
    return {"a": 1, "k": out}


def _prop(x, pad=None):
    """Accept either a raw value or an already-built property."""
    if isinstance(x, dict):
        return x
    if isinstance(x, (list, tuple)):
        x = list(x)
        if pad is not None and len(x) < pad:
            x = x + [0] * (pad - len(x))
        return v(x)
    return v(x)


# --- shapes ----------------------------------------------------------------

def ell(p=(0, 0), size=(100, 100)):
    return {"ty": "el", "p": _prop(p), "s": _prop(size), "d": 1, "nm": "ellipse"}


def rect(p=(0, 0), size=(100, 100), r=0):
    return {"ty": "rc", "p": _prop(p), "s": _prop(size), "r": _prop(r),
            "d": 1, "nm": "rect"}


def path(pts, closed=False, k=0.36):
    """A smooth path through `pts`, tangents derived Catmull-Rom style.
    k=0 gives hard corners, which is what a cursor wants."""
    n = len(pts)
    i_t, o_t = [], []
    for idx, (x, y) in enumerate(pts):
        prev = pts[(idx - 1) % n] if (closed or idx > 0) else pts[idx]
        nxt = pts[(idx + 1) % n] if (closed or idx < n - 1) else pts[idx]
        dx, dy = (nxt[0] - prev[0]) * k, (nxt[1] - prev[1]) * k
        i_t.append([-dx, -dy])
        o_t.append([dx, dy])
    return {"ty": "sh", "ix": 1, "nm": "path", "hd": False,
            "ks": v({"i": i_t, "o": o_t, "v": [list(p) for p in pts],
                     "c": closed})}


def line(a, b):
    return {"ty": "sh", "ix": 1, "nm": "line", "hd": False,
            "ks": v({"i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]],
                     "v": [list(a), list(b)], "c": False})}


def stroke(c, w, o=100):
    return {"ty": "st", "c": _prop(c), "o": _prop(o), "w": _prop(w),
            "lc": 2, "lj": 2, "ml": 4, "nm": "stroke", "hd": False}


def fill(c, o=100):
    return {"ty": "fl", "c": _prop(c), "o": _prop(o), "r": 1,
            "nm": "fill", "hd": False}


def trim(s=0, e=100, o=0):
    return {"ty": "tm", "s": _prop(s), "e": _prop(e), "o": _prop(o),
            "m": 1, "nm": "trim", "hd": False}


def tr(p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    return {"ty": "tr", "p": _prop(p), "a": _prop(a), "s": _prop(s),
            "r": _prop(r), "o": _prop(o), "sk": v(0), "sa": v(0),
            "nm": "Transform"}


def group(items, name="group", transform=None):
    it = list(items) + [transform or tr()]
    return {"ty": "gr", "it": it, "nm": name, "np": len(items),
            "cix": 2, "bm": 0, "ix": 1, "hd": False}


def layer(nm, shapes, p=(C, C), a=(0, 0), s=(100, 100), r=0, o=100):
    return {"ddd": 0, "ind": 0, "ty": 4, "nm": nm, "sr": 1, "ao": 0,
            "ks": {"o": _prop(o), "r": _prop(r),
                   "p": _prop(p, pad=3), "a": _prop(a, pad=3),
                   "s": _prop(s, pad=3)},
            "shapes": shapes, "ip": 0, "op": OP, "st": 0, "bm": 0}


def comp(name, layers):
    for i, l in enumerate(layers):
        l["ind"] = i + 1
    return {"v": "5.9.0", "fr": FPS, "ip": 0, "op": OP, "w": W, "h": H,
            "nm": name, "ddd": 0, "assets": [], "layers": layers}


# --- recurring pieces ------------------------------------------------------

def pulse(at_, colour, start=50, end=248, width=3.5, hold=40, peak=72):
    """A ring thrown off an arrival, expanding and dissolving. It rests at
    nothing, so it costs the seam at either end of the loop nothing."""
    s_pts, o_pts = [], []
    if at_[0] > 0:
        s_pts.append((0, [start, start], LIN))
        o_pts.append((0, 0, LIN))
    for t in at_:
        s_pts.append((t, [start, start], OUT))
        s_pts.append((t + hold, [end, end], LIN))
        o_pts.append((t, peak, OUT))
        o_pts.append((t + hold, 0, LIN))
    if at_[-1] + hold < OP:
        s_pts.append((OP, [start, start], LIN))
        o_pts.append((OP, 0, LIN))
    return group([ell((0, 0), (100, 100)), stroke(colour, width)], "pulse",
                 tr(s=kf(s_pts), o=kf(o_pts)))


def pop(at_, base=100, over=140, lead=8, land=12):
    """Scale keyframes for something that lands with a little overshoot --
    the difference between a thing appearing and a thing arriving."""
    pts, seen = [], set()

    def add(t, val, ease):
        t = max(0, min(OP, t))
        if t in seen:
            return
        seen.add(t)
        pts.append((t, [val, val], ease))

    add(0, base, LIN)
    for t in at_:
        add(t - lead, base, OUT)
        add(t, over, SPRING)
        add(t + land, base, LIN)
    add(OP, base, LIN)
    pts.sort(key=lambda k: k[0])
    return kf(pts)


def at(x, y):
    """Comp coordinates from centre-relative ones."""
    return [C + x, C + y, 0]


# ===========================================================================
# THE SIX MARKS
#
# Layer order is top-first, as Lottie reads it.
# ===========================================================================

def compass():
    """CX strategy and assessment -- a bearing taken, twice, and held."""
    R = 84
    swing = kf([(0, -90, SPRING), (46, 30, LIN), (66, 30, SPRING),
                (108, 150, LIN), (128, 150, SPRING), (OP, 270)])
    return comp("compass", [
        layer("hub", [
            group([ell((0, 0), (36, 36)), stroke(SKY, 5)], "halo",
                  tr(s=pop([46, 108], over=126))),
            group([ell((0, 0), (17, 17)), fill(INK)], "core"),
        ]),
        layer("needle", [
            # Through the pivot, not out of it: a needle that only sticks out
            # one side reads as a dumbbell rather than as a bearing. The tail
            # is deliberately short and bare -- a dot on the end of it would
            # be a third circle stacking up in the middle of the mark.
            group([line((0, 34), (0, -72)), stroke(INK, 6.5)], "shaft"),
            group([ell((0, -72), (20, 20)), fill(SKY), stroke(INK, 4.5)], "tip",
                  tr(a=(0, -72), p=(0, -72), s=pop([46, 108], over=136))),
        ], r=swing),
        layer("sweep", [
            group([ell((0, 0), (2 * R, 2 * R)),
                   trim(s=0, e=24, o=kf([(0, 0, LIN), (OP, 360)])),
                   stroke(INK, 5.5)], "arc"),
        ]),
        layer("pulse", [pulse([46, 108], SKY, start=44)]),
        layer("ring", [
            group([ell((0, 0), (2 * R, 2 * R)), stroke(INK, 2.5, 20)], "faint"),
        ]),
    ])


ROUTE = [(-86, 34), (-40, -30), (6, 26), (52, -34), (86, 6)]
ROUTE_T = [27, 39, 51]


def journey():
    """Journey mapping -- a line laid down, stops lighting as it is passed,
    then the whole line drawn on through and away."""
    stops = [
        group([ell(pt, (19, 19)), fill(PAPER), stroke(INK, 4.5)], "stop%d" % i,
              tr(a=pt, p=pt, s=pop([t]),
                 o=kf([(0, 0, LIN), (t - 9, 0, OUT), (t, 100, LIN),
                       (138, 100, IN), (154, 0, LIN), (OP, 0)])))
        for i, (pt, t) in enumerate(zip(ROUTE[1:4], ROUTE_T))
    ]
    return comp("journey", [
        layer("traveller", [
            group([ell((0, 0), (23, 23)), fill(CORAL), stroke(INK, 4)], "dot"),
        ],
            p=kf([(0, at(*ROUTE[0]), INOUT), (27, at(*ROUTE[1]), INOUT),
                  (39, at(*ROUTE[2]), INOUT), (51, at(*ROUTE[3]), INOUT),
                  (78, at(*ROUTE[4]), LIN), (OP, at(*ROUTE[4]))]),
            o=kf([(0, 0, OUT), (11, 100, LIN), (98, 100, IN), (118, 0, LIN),
                  (OP, 0)])),
        layer("stops", stops),
        layer("pulse", [pulse([78], CORAL)], p=at(*ROUTE[4])),
        layer("route", [
            group([path(ROUTE),
                   trim(s=kf([(0, 0, LIN), (142, 0, IN), (OP, 100)]),
                        e=kf([(0, 0, INOUT), (78, 100, LIN), (OP, 100)])),
                   stroke(INK, 6)], "line"),
        ]),
        layer("route-faint", [
            group([path(ROUTE), stroke(INK, 4.5, 20)], "line"),
        ]),
    ])


def design():
    """Service and interaction design -- a selection moved down the rows and
    back up again.

    The earlier version built itself up and then cleared itself out, which
    meant the first frame of the loop was an empty box: open a card and you
    got nothing for the first second. The frame and the rows are permanent
    now, and only the choice moves, so the mark reads the instant it appears
    and never has a dead beat."""
    rows_y, widths = [-30, 0, 30], [96, 74, 86]
    PILL = 110.0
    # -30 -> 0 -> 30 -> -30, holding at each: a shuttle, so the last move is a
    # travel back rather than a cut.
    stops = [(-30, 0, 28), (0, 52, 84), (30, 108, 140)]
    pos, scale, ptr = [], [], []
    for i, (y, land, leave) in enumerate(stops):
        # The pill takes the width of whichever row it is on, so it reads as
        # that row being chosen rather than as a band parked over it.
        fit = (widths[i] + 15) / PILL * 100
        pos += [(land, [0, y], LIN), (leave, [0, y], INOUT)]
        # Squashed wider on impact, settling back: weight, in one property.
        scale += [(land, [fit * 1.1, 90], OUT), (land + 11, [fit, 100], LIN),
                  (leave, [fit, 100], INOUT)]
        ptr += [(land, at(widths[i] / 2 - 6, y + 2), LIN),
                (leave, at(widths[i] / 2 - 6, y + 2), INOUT)]
    first = (widths[0] + 15) / PILL * 100
    pos.append((OP, [0, -30]))
    scale.append((OP, [first * 1.1, 90]))
    ptr.append((OP, at(widths[0] / 2 - 6, -28)))

    cursor = [(0, 0), (0, 27), (7, 21), (12, 31), (17, 28), (12, 18), (20, 18)]
    tap = []
    for _, land, _ in stops:
        tap += [(max(0, land - 4), [100, 100, 100], OUT),
                (land + 2, [80, 80, 100], OUT),
                (land + 12, [100, 100, 100], LIN)]
    tap = [(0, [100, 100, 100], OUT)] + [k for k in tap if k[0] > 0]
    tap.append((OP, [100, 100, 100]))

    return comp("design", [
        layer("pointer", [
            group([path(cursor, closed=True, k=0), fill(INK)], "cursor"),
        ], p=kf(ptr), s=kf(tap)),
        layer("rows", [
            group([rect((0, y), (w, 13), 7), fill(INK, 90)], "row%d" % i)
            for i, (y, w) in enumerate(zip(rows_y, widths))
        ]),
        layer("chosen", [
            group([rect((0, 0), (110, 28), 14), fill(CITRUS)], "pill",
                  tr(p=kf(pos), s=kf(scale))),
        ]),
        layer("frame", [
            group([rect((0, 0), (158, 126), 16), stroke(INK, 5)], "box"),
        ]),
    ])


STREAMS = [
    [(-94, -74), (-54, -42), (-25, -15)],
    [(94, -74), (54, -42), (25, -15)],
    [(-94, 74), (-54, 42), (-25, 15)],
    [(94, 74), (54, 42), (25, 15)],
]


def data_mark():
    """Data and personalisation -- four sources arriving as one.

    The arrivals are spread across the whole loop rather than bunched at the
    start, so there is always one stream in flight: the mark has a pulse to
    it at any moment you happen to open the card. The core is permanent and
    takes each arrival rather than being built once and thrown away."""
    starts, dur = [0, 42, 84, 126], 42
    lands = [t + dur for t in starts]
    bright = []
    for i, s in enumerate(STREAMS):
        t0, t1 = starts[i], lands[i]
        bright.append(group([
            path(s),
            # Head runs ahead, tail follows: a segment travelling the stream
            # and being absorbed at the end of it.
            trim(s=kf([(0, 0, LIN), (t0 + 11, 0, INOUT), (t1, 100, LIN),
                       (OP, 100)]),
                 e=kf([(0, 0, LIN), (t0, 0, INOUT), (t1 - 9, 100, LIN),
                       (OP, 100)])),
            stroke(INK, 6)], "stream%d" % i))
    beats = [t for t in lands if t + 12 < OP]
    return comp("data", [
        layer("pulse", [pulse(beats, BLOSSOM, start=48, end=200, hold=34,
                              peak=62)]),
        # Earlier in the array paints on top, so the seed has to come first or
        # the disc behind it covers it.
        layer("core", [
            group([ell((0, 0), (26, 26)), fill(BLOSSOM)], "seed",
                  tr(s=pop(beats, over=156, lead=4, land=14))),
            group([ell((0, 0), (54, 54)), fill(PAPER), stroke(INK, 5.5)], "ring"),
        ], s=pop(beats, over=110, lead=4, land=16)),
        layer("streams", bright),
        layer("streams-faint",
              [group([path(s), stroke(INK, 4, 22)], "faint%d" % i)
               for i, s in enumerate(STREAMS)]),
    ])


PLOT = [(-86, 46), (-44, 20), (-2, 28), (40, -16), (86, -46)]


def measure():
    """Measurement and optimisation -- a line found, then held against a mark."""
    return comp("measure", [
        layer("head", [
            group([ell((0, 0), (21, 21)), fill(SKY), stroke(INK, 4)], "dot"),
        ],
            p=kf([(0, at(*PLOT[0]), INOUT), (12, at(*PLOT[0]), INOUT),
                  (36, at(*PLOT[1]), INOUT), (54, at(*PLOT[2]), INOUT),
                  (74, at(*PLOT[3]), INOUT), (94, at(*PLOT[4]), LIN),
                  (OP, at(*PLOT[4]))]),
            o=kf([(0, 0, OUT), (14, 100, LIN), (128, 100, IN), (144, 0, LIN),
                  (OP, 0)])),
        layer("pulse", [pulse([94], SKY)], p=at(*PLOT[4])),
        layer("target", [
            group([line((-24, 0), (24, 0)), stroke(SKY, 5.5)], "bar"),
        ], p=at(*PLOT[4]),
            s=kf([(0, [0, 0, 100], LIN), (94, [0, 0, 100], SPRING),
                  (107, [112, 112, 100], OUT), (116, [100, 100, 100], LIN),
                  (132, [100, 100, 100], IN), (148, [0, 0, 100], LIN),
                  (OP, [0, 0, 100])])),
        layer("plot", [
            group([path(PLOT),
                   trim(s=kf([(0, 0, LIN), (146, 0, IN), (OP, 100)]),
                        e=kf([(0, 0, LIN), (12, 0, INOUT), (94, 100, LIN),
                              (OP, 100)])),
                   stroke(INK, 6)], "line"),
        ]),
        layer("grid", [
            group([line((-92, y), (92, y)), stroke(INK, 2.5, 20)], "grid%d" % i)
            for i, y in enumerate([-46, 0, 46])
        ]),
    ])


def operations():
    """Experience operations -- the loop that keeps running after launch."""
    R = 76
    lead = 22 / 100 * 360                       # the trail's head, in degrees
    angles = [0, 120, 240]
    nodes = []
    for a in angles:
        t = int(((a - lead) % 360) / 360 * OP)
        rad = math.radians(a)
        px, py = R * math.sin(rad), -R * math.cos(rad)
        nodes.append(group([ell((px, py), (21, 21)), fill(PAPER),
                            stroke(INK, 5)], "node%d" % a,
                           tr(a=(px, py), p=(px, py), s=pop([t], over=150))))
    return comp("operations", [
        layer("nodes", nodes),
        layer("runner", [
            group([ell((0, -R), (22, 22)), fill(INK)], "dot"),
        ], r=kf([(0, lead, LIN), (OP, lead + 360)])),
        layer("trail", [
            group([ell((0, 0), (2 * R, 2 * R)),
                   trim(s=0, e=22, o=kf([(0, 0, LIN), (OP, 360)])),
                   stroke(BLOSSOM, 8.5)], "arc"),
        ]),
        layer("loop-faint", [
            group([ell((0, 0), (2 * R, 2 * R)), stroke(INK, 2.5, 22)], "circle"),
        ]),
    ])


def brand():
    """Digital branding -- one mark tried in three forms and three colours,
    each landing on its own swatch, the way a brand kit settles.

    A single rounded rectangle does all of it: the corner radius takes it
    from square to circle and back, a quarter turn makes the diamond, and the
    fill steps through the swatches below. The loop ends on a square turned
    half way round, which is the square it started as."""
    B = 96                                   # the mark's box
    Y = -16                                  # sat a little above centre
    lands = [36, 92, 148]
    swatch = [BLOSSOM, CORAL, SKY]           # what each landing turns it to
    hold = lambda t: t - 18                  # each change takes 18 frames

    r = kf([(0, 14, LIN), (hold(36), 14, INOUT), (36, B / 2, LIN),
            (hold(92), B / 2, INOUT), (92, 14, LIN), (OP, 14)])
    rot = kf([(0, 0, LIN), (hold(36), 0, INOUT), (36, 90, LIN),
              (hold(92), 90, INOUT), (92, 135, LIN),
              (hold(148), 135, INOUT), (148, 180, LIN), (OP, 180)])
    col = kf([(0, SKY, LIN), (hold(36), SKY, INOUT), (36, BLOSSOM, LIN),
              (hold(92), BLOSSOM, INOUT), (92, CORAL, LIN),
              (hold(148), CORAL, INOUT), (148, SKY, LIN), (OP, SKY)])

    xs = [-34, 0, 34]
    dots = [
        group([ell((x, 0), (22, 22)), fill(c), stroke(INK, 4)], "swatch%d" % i,
              tr(a=(x, 0), p=(x, 0), s=pop([t], over=150)))
        for i, (x, c, t) in enumerate(zip(xs, swatch, lands))
    ]
    return comp("brand", [
        layer("swatches", dots, p=at(0, 74)),
        layer("mark", [
            group([rect((0, 0), (B, B), r), fill(col), stroke(INK, 6)], "form",
                  tr(r=rot, s=pop(lands, over=112, lead=6, land=14))),
        ], p=at(0, Y)),
        # Under the mark, so it is only seen once it has grown past the edge.
        layer("pulse", [pulse(lands, INK, start=70, end=190, width=2.5,
                              hold=18, peak=30)], p=at(0, Y)),
    ])


MARKS = {
    "compass": compass,
    "journey": journey,
    "design": design,
    "data": data_mark,
    "measure": measure,
    "operations": operations,
    "brand": brand,
}

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "src", "lottie")
    for name, build in MARKS.items():
        d = build()
        dest = os.path.join(out, "%s.json" % name)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(d, f, separators=(",", ":"))
        print("  %-11s %d layers  %5.1f KB  %.1fs"
              % (name, len(d["layers"]), os.path.getsize(dest) / 1024,
                 d["op"] / d["fr"]))
