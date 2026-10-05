"""
============================================================================
SERVICE SCENES -- LOTTIE SOURCE FOR THE V2 SERVICE CARDS

The back of each service card plays a short illustrated scene of what the
client walks away with: the ranked plan being found, the journey and its
blueprint being walked, the prototype being clicked and tested, the brand
kit being tried on, one customer view filling up and talking back, the
test being won and the score moving.

Same drawing language as the page: white paper panels with an ink outline
and a hard ink shadow, pastel fills, heavy round strokes. Every scene is a
cycle -- frame 0 is a finished picture, and the last frame lands back on it
-- so the card never opens on an empty box and the loop has no cut.

    python scripts/build_service_marks.py

writes src/lottie/services/*.json. Shape helpers come from build_lottie.py.
============================================================================
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from build_lottie import (  # noqa: E402
    v, kf, _prop, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL,
    OUT, INOUT, IN, SPRING, LIN,
)

FPS = 30
OP = 240                       # 8s: long enough to tell a small story
W, H = 320, 240                # 4:3, the shape of the space on the card back

SUN = [1, 0.886, 0.537, 1]
MINT = [0.647, 0.973, 0.694, 1]
PERI = [0.710, 0.765, 1, 1]
INDIGO = [0.286, 0.282, 0.827, 1]
SOFT = (0.5, 0, 0.2, 1)        # a long, soft settle


# --- composition ------------------------------------------------------------

def _three(prop):
    """Layer transforms want 3D values; pad 2D keyframes with a z."""
    if isinstance(prop, dict) and prop.get("a") == 1:
        for k in prop["k"]:
            if len(k["s"]) == 2:
                k["s"].append(100 if k["s"][0] != 0 or k["s"][1] != 0 else 0)
                for side in ("o", "i"):
                    if side in k:
                        k[side]["x"].append(k[side]["x"][-1])
                        k[side]["y"].append(k[side]["y"][-1])
    return prop


def layer(nm, shapes, p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    s = _three(s)
    return {"ddd": 0, "ind": 0, "ty": 4, "nm": nm, "sr": 1, "ao": 0,
            "ks": {"o": _prop(o), "r": _prop(r), "p": _prop(p, pad=3),
                   "a": _prop(a, pad=3), "s": _prop(s, pad=3)},
            "shapes": shapes, "ip": 0, "op": OP, "st": 0, "bm": 0}


def comp(name, layers):
    for i, l in enumerate(layers):
        l["ind"] = i + 1
    return {"v": "5.9.0", "fr": FPS, "ip": 0, "op": OP, "w": W, "h": H,
            "nm": name, "ddd": 0, "assets": [], "layers": layers}


# --- drawing ------------------------------------------------------------------

def panel(c, size, r=12, fc=PAPER, sw=3.5, sh=5, name="panel"):
    """White paper with an ink outline and a hard ink shadow."""
    x, y = c
    return [group([rect(c, size, r), fill(fc), stroke(INK, sw)], name),
            group([rect((x + sh, y + sh), size, r), fill(INK)], name + "-shadow")]


def bar(c, size, colour=INK, o=88):
    return group([rect(c, size, size[1] / 2), fill(colour, o)], "bar")


def dashed(st, dash, gap, off=0):
    st["d"] = [{"n": "d", "nm": "dash", "v": v(dash)},
               {"n": "g", "nm": "gap", "v": v(gap)},
               {"n": "o", "nm": "offset", "v": _prop(off)}]
    return st


def cubic(p0, p1, p2, p3):
    """One cubic bezier, from its four control points."""
    return {"ty": "sh", "ix": 1, "nm": "curve", "hd": False,
            "ks": v({"i": [[0, 0], [p2[0] - p3[0], p2[1] - p3[1]]],
                     "o": [[p1[0] - p0[0], p1[1] - p0[1]], [0, 0]],
                     "v": [list(p0), list(p3)], "c": False})}


def check(c, s, w=3, colour=INK):
    x, y = c
    pts = [(x - 0.42 * s, y + 0.02 * s), (x - 0.12 * s, y + 0.3 * s),
           (x + 0.42 * s, y - 0.3 * s)]
    return group([path(pts, k=0), stroke(colour, w)], "check")


def sparkle(c, r):
    x, y = c
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * 0.3
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    return path(pts, closed=True, k=0)


def at_scale(c, s, items, name="g", o=100, p=None, r=0):
    """Wrap items so they scale/rotate about c (and optionally move)."""
    return group(items, name, tr(a=c, p=p if p is not None else c, s=s, r=r, o=o))


# --- timing -------------------------------------------------------------------

def bump(times, peak=112, lead=6, land=12):
    """Lands with a little overshoot at each time; 100 otherwise."""
    pts = []
    for t in times:
        pts += [(t - lead, [100, 100], OUT), (t, [peak, peak], SPRING),
                (t + land, [100, 100], LIN)]
    return kf(pts) if pts else v([100, 100])


def shown(t_in, t_out, d_in=14, d_out=10, peak=100):
    """Scale in with a spring at t_in, out at t_out. If t_out comes first,
    the thing is already showing at frame 0 and leaves then returns."""
    if t_in < t_out:
        return kf([(t_in, [0, 0], SPRING), (t_in + d_in, [peak, peak], LIN),
                   (t_out, [peak, peak], IN), (t_out + d_out, [0, 0], LIN)])
    return kf([(t_out, [peak, peak], IN), (t_out + d_out, [0, 0], LIN),
               (t_in, [0, 0], SPRING), (t_in + d_in, [peak, peak], LIN)])


def fade(t_in, t_out, d_in=10, d_out=10):
    if t_in < t_out:
        return kf([(t_in, 0, OUT), (t_in + d_in, 100, LIN),
                   (t_out, 100, IN), (t_out + d_out, 0, LIN)])
    return kf([(t_out, 100, IN), (t_out + d_out, 0, LIN),
               (t_in, 0, OUT), (t_in + d_in, 100, LIN)])


def smooth(u):
    return u * u * (3 - 2 * u)


# --- bezier sampling, for things that travel along a drawn path ----------------

def bezier_segments(pts, k=0.36):
    n = len(pts)
    tan = []
    for i in range(n):
        prev = pts[i - 1] if i > 0 else pts[i]
        nxt = pts[i + 1] if i < n - 1 else pts[i]
        tan.append(((nxt[0] - prev[0]) * k, (nxt[1] - prev[1]) * k))
    segs = []
    for i in range(n - 1):
        p0, p3 = pts[i], pts[i + 1]
        p1 = (p0[0] + tan[i][0], p0[1] + tan[i][1])
        p2 = (p3[0] - tan[i + 1][0], p3[1] - tan[i + 1][1])
        segs.append((p0, p1, p2, p3))
    return segs


def bz(seg, u):
    p0, p1, p2, p3 = seg
    m = 1 - u
    return (m ** 3 * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u ** 3 * p3[0],
            m ** 3 * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u ** 3 * p3[1])


class Track:
    """Arc-length lookup along a smooth path through pts."""

    def __init__(self, pts=None, k=0.36, steps=120, segs=None):
        self.samples = []          # (cumulative length, point)
        total = 0
        prev = None
        self.stops = [0]
        for seg in segs or bezier_segments(pts, k):
            for i in range(steps + 1):
                p = bz(seg, i / steps)
                if prev is not None:
                    total += math.dist(prev, p)
                self.samples.append((total, p))
                prev = p
            self.stops.append(total)
        self.total = total

    def at(self, s):
        s = max(0, min(self.total, s))
        lo, hi = 0, len(self.samples) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if self.samples[mid][0] < s:
                lo = mid + 1
            else:
                hi = mid
        return self.samples[lo][1]


# ============================================================================
# 1 · CX STRATEGY & RESEARCH -- a ranked plan of what to fix first
#
# A report. A lens passes down the findings and each one grows to its size;
# then they sort themselves, biggest first, and the top one is marked.
# ============================================================================

def research():
    slots = [100, 124, 148, 172]
    vals = [55, 96, 34, 76]
    rank = {1: 0, 3: 1, 0: 2, 2: 3}          # finding -> slot once sorted
    bx, bl = 104, 126                        # bars' left edge and full length
    pass_at = lambda y: 30 + (y - 92) / 84 * 72

    rows = []
    for i in range(4):
        y0, y1 = slots[i], slots[rank[i]]
        tp = pass_at(y0)
        grow = kf([(tp - 2, [12, 100], OUT), (tp + 16, [vals[i], 100], LIN),
                   (204, [vals[i], 100], INOUT), (226, [12, 100], LIN)])
        dot_fill = (kf([(136, PAPER, OUT), (146, CORAL, LIN), (198, CORAL, IN),
                        (206, PAPER, LIN)]) if i == 1 else PAPER)
        rows.append(group([
            group([ell((86, 0), (12, 12)), fill(dot_fill), stroke(INK, 2.6)], "dot"),
            group([rect((bx + bl / 2, 0), (bl, 10), 5), fill(INK, 88)], "bar",
                  tr(a=(bx, 0), p=(bx, 0), s=grow)),
        ], "row%d" % i, tr(p=kf([(112, [0, y0], SPRING), (138, [0, y1], LIN),
                                 (200, [0, y1], INOUT), (224, [0, y0], LIN)]))))

    lens_rest = [244, 208, 0]
    return comp("research", [
        layer("lens", [
            group([line((13, 13), (27, 27)), stroke(INK, 7.5)], "handle"),
            group([path([(-9, -4), (-4, -10)], k=0), stroke(PAPER, 3.5)], "glint"),
            group([ell((0, 0), (36, 36)), fill(SKY, 80), stroke(INK, 4.5)], "glass"),
        ], p=kf([(0, lens_rest, LIN), (12, lens_rest, INOUT), (30, [214, 92, 0], LIN),
                 (102, [214, 176, 0], INOUT), (122, lens_rest, LIN)]),
            r=kf([(12, 0, INOUT), (30, -14, LIN), (102, 8, INOUT), (122, 0, LIN)])),
        layer("sparkle", [
            at_scale((244, 100), shown(146, 196, d_in=16),
                     [group([sparkle((244, 100), 11), fill(CORAL), stroke(INK, 2.5)], "star")],
                     r=kf([(146, -40, OUT), (166, 0, LIN)])),
        ]),
        layer("rows", rows),
        layer("top", [
            group([rect((156, 100), (168, 24), 12), fill(CITRUS), stroke(INK, 2.6)], "pill",
                  tr(a=(72, 100), p=(72, 100),
                     s=kf([(136, [0, 100], OUT), (154, [100, 100], LIN),
                           (196, [100, 100], IN), (208, [0, 100], LIN)]))),
        ]),
        layer("report", [
            group([rect((116, 72), (62, 9), 4.5), fill(INK)], "title"),
            group([ell((236, 72), (13, 13)), fill(SKY), stroke(INK, 2.5)], "tag"),
            group([line((80, 86), (240, 86)), stroke(INK, 2, 18)], "rule"),
            *panel((160, 124), (200, 156), r=16),
        ]),
        layer("sheet", panel((150, 120), (200, 156), r=16, sw=3, sh=0, name="under")[:1],
              p=(150, 120), a=(150, 120), r=-5),
    ])


# ============================================================================
# 2 · CUSTOMER JOURNEY DESIGN -- a journey map and a service blueprint
#
# Four touchpoints on a route. A customer walks it; each stop lights up and
# drops a line through the line of visibility to the work behind it.
# ============================================================================

def journey():
    stations = [(52, 98), (124, 66), (198, 100), (270, 70)]
    route = Track(stations)
    legs = [(14, 44), (54, 84), (94, 124)]
    arrive = [10, 44, 84, 124]

    pos, prog = [], []
    for k, (t0, t1) in enumerate(legs):
        s0, s1 = route.stops[k], route.stops[k + 1]
        for f in range(t0, t1 + 1, 2):
            u = smooth((f - t0) / (t1 - t0))
            s = s0 + (s1 - s0) * u
            x, y = route.at(s)
            pos.append((f, [round(x, 2), round(y, 2), 0], LIN))
            prog.append((f, round(s / route.total * 100, 3), LIN))
        if k < 2:
            x, y = stations[k + 1]
            pos.append((t1 + 2, [x, y, 0], LIN))
    sx, sy = stations[0]
    ex, ey = stations[3]
    pos = [(0, [sx, sy, 0], LIN)] + pos + [(208, [ex, ey, 0], LIN), (209, [sx, sy, 0], LIN)]

    glyphs = [
        lambda x, y: [group([rect((x, y), (19, 14), 3), stroke(INK, 2.5)], "web"),
                      group([line((x - 9, y - 2.5), (x + 9, y - 2.5)), stroke(INK, 2.5)], "bar")],
        lambda x, y: [group([rect((x, y), (12, 19), 3.5), stroke(INK, 2.5)], "phone"),
                      group([ell((x, y + 5), (2.5, 2.5)), fill(INK)], "btn")],
        lambda x, y: [group([path([(x - 9, y - 6), (x + 9, y - 6), (x + 9, y + 4), (x - 2, y + 4),
                                   (x - 6, y + 9), (x - 6, y + 4), (x - 9, y + 4)], closed=True, k=0),
                             stroke(INK, 2.5)], "chat")],
        lambda x, y: [check((x, y), 18, 3.2)],
    ]
    tiles, backs, drops = [], [], []
    for i, (x, y) in enumerate(stations):
        t = arrive[i]
        tile_fill = kf([(t - 4, PAPER, OUT), (t + 4, SUN, LIN), (198, SUN, IN), (210, PAPER, LIN)])
        tiles.append(at_scale((x, y), bump([t], peak=118), [
            *glyphs[i](x, y),
            group([rect((x, y), (36, 36), 10), fill(tile_fill), stroke(INK, 3)], "tile"),
            group([rect((x + 4, y + 4), (36, 36), 10), fill(INK)], "shadow"),
        ], "stop%d" % i))
        drops.append(group([line((x, y + 24), (x, 178)),
                            trim(e=kf([(t + 2, 0, OUT), (t + 18, 100, LIN),
                                       (196 + 3 * i, 100, IN), (208 + 3 * i, 0, LIN)])),
                            dashed(stroke(INK, 2.5), 2, 5)], "drop%d" % i))
        backs.append(at_scale((x, 194), shown(t + 12, 198 + 3 * i, d_in=16), [
            group([line((x - 10, 194), (x + 10, 194)), stroke(INK, 2.5)], "task"),
            *panel((x, 194), (44, 24), r=8, fc=PERI, sw=2.6, sh=3),
        ], "back%d" % i))

    return comp("journey", [
        layer("traveller", [
            group([ell((0, 0), (17, 17)), fill(CORAL), stroke(INK, 3.5)], "dot"),
        ], p=kf(pos), o=kf([(196, 100, IN), (206, 0, LIN), (222, 0, OUT), (234, 100, LIN)]),
            s=bump([44, 84, 124], peak=130, lead=4, land=10)),
        layer("finish", [
            at_scale((270, 70), kf([(124, [40, 40], OUT), (150, [190, 190], LIN)]),
                     [group([ell((270, 70), (40, 40)), stroke(CORAL, 3)], "ring")],
                     o=kf([(123, 0, LIN), (124, 90, OUT), (150, 0, LIN)])),
        ]),
        layer("stops", tiles),
        layer("route", [
            group([path(stations),
                   trim(s=kf([(196, 0, IN), (224, 100, LIN), (225, 0, LIN)]),
                        e=kf(prog + [(224, 100, LIN), (225, 0, LIN)])),
                   stroke(INK, 4.5)], "walked"),
            group([path(stations), dashed(stroke(INK, 3, 30), 1, 8)], "ahead"),
        ]),
        layer("backstage", backs),
        layer("drops", drops),
        layer("visibility", [
            group([line((22, 154), (298, 154)), dashed(stroke(INK, 2, 40), 7, 6)], "line"),
        ]),
    ])


# ============================================================================
# 3 · WEBSITE & APP DESIGN -- a clickable, tested prototype and design files
#
# A site and its app. The cursor taps through the prototype to the next
# screen, the checks come back green, then it frames a block in the design
# file, handles and all.
# ============================================================================

def interface():
    px, py = 238, 136                        # phone centre
    rest = [284, 212, 0]
    btn = (px, 178)

    screen_a = group([
        group([rect(btn, (56, 18), 9), fill(CITRUS), stroke(INK, 2.5)], "button",
              tr(a=btn, p=btn, s=kf([(50, [100, 100], OUT), (54, [90, 90], SPRING),
                                     (66, [100, 100], LIN)]))),
        bar((px - 6, 144), (42, 6)),
        bar((px, 132), (54, 6)),
        group([rect((px, 102), (62, 38), 8), fill(PERI), stroke(INK, 2.5)], "image"),
    ], "screenA", tr(p=kf([(58, [0, 0], IN), (70, [-18, 0], LIN), (204, [-18, 0], OUT),
                           (218, [0, 0], LIN)]),
                     o=kf([(58, 100, IN), (68, 0, LIN), (206, 0, OUT), (218, 100, LIN)])))

    checks = []
    for i, y in enumerate([112, 138, 164]):
        t = 80 + 9 * i
        checks.append(group([
            bar((px + 10, y), (38, 6)),
            at_scale((px - 22, y), kf([(t, [0, 0], SPRING), (t + 12, [100, 100], LIN),
                                       (212, [100, 100], LIN), (213, [0, 0], LIN)]),
                     [check((px - 22, y), 9, 2.4),
                      group([ell((px - 22, y), (17, 17)), fill(MINT), stroke(INK, 2.4)], "c")]),
        ], "row%d" % i))
    screen_b = group([*checks, bar((px - 8, 88), (44, 7), INK, 100)], "screenB",
                     tr(p=kf([(62, [18, 0], OUT), (76, [0, 0], LIN), (200, [0, 0], IN),
                              (212, [18, 0], LIN)]),
                        o=kf([(62, 0, OUT), (72, 100, LIN), (200, 100, IN), (210, 0, LIN)])))

    sel = (108, 92)
    handles = [group([rect((sel[0] + dx, sel[1] + dy), (7, 7), 1.5), fill(PAPER),
                      stroke(INDIGO, 2)], "h") for dx in (-76, 76) for dy in (-20, 20)]
    cursor = [(0, 0), (0, 25), (7, 19), (12, 29), (17, 27), (12, 17), (20, 17)]

    return comp("interface", [
        layer("cursor", [group([path(cursor, closed=True, k=0), fill(INK),
                                stroke(PAPER, 2)], "arrow")],
              p=kf([(0, rest, LIN), (18, rest, INOUT), (46, [244, 182, 0], LIN),
                    (112, [244, 182, 0], INOUT), (140, [182, 104, 0], LIN),
                    (198, [182, 104, 0], INOUT), (228, rest, LIN)]),
              s=kf([(46, [100, 100, 100], OUT), (51, [82, 82, 100], OUT),
                    (58, [100, 100, 100], LIN)])),
        layer("tested", [at_scale((278, 64), shown(100, 198, d_in=16), [
            check((278, 64), 14, 3),
            group([ell((278, 64), (30, 30)), fill(MINT), stroke(INK, 3)], "badge"),
        ])]),
        layer("ripple", [at_scale(btn, kf([(52, [30, 30], OUT), (72, [150, 150], LIN)]),
                                  [group([rect(btn, (56, 18), 9), stroke(INK, 2.5)], "ring")],
                                  o=kf([(51, 0, LIN), (52, 70, OUT), (72, 0, LIN)]))]),
        layer("screens", [screen_a, screen_b]),
        layer("phone", [
            group([rect((px, 70), (24, 6), 3), fill(INK)], "notch"),
            *panel((px, py), (86, 154), r=18, sh=5),
        ]),
        layer("selection", [group([
            *handles,
            group([rect(sel, (152, 40), 3),
                   trim(e=kf([(140, 0, OUT), (160, 100, LIN)])),
                   stroke(INDIGO, 2.5)], "box"),
        ], "select", tr(o=kf([(139, 0, LIN), (140, 100, LIN), (196, 100, IN), (206, 0, LIN)])))]),
        layer("site", [
            group([rect((80, 152), (56, 20), 6), fill(PAPER), stroke(INK, 2.4)], "card1"),
            group([rect((146, 152), (56, 20), 6), fill(SUN), stroke(INK, 2.4)], "card2"),
            bar((76, 126), (74, 6)),
            bar((86, 114), (94, 6)),
            group([rect(sel, (140, 30), 7), fill(SKY), stroke(INK, 2.5)], "hero"),
            group([line((28, 64), (196, 64)), stroke(INK, 3)], "topbar"),
            *[group([ell((40 + 10 * i, 53), (5.5, 5.5)), fill(INK)], "dot") for i in range(3)],
            *panel((112, 106), (170, 128), r=14),
        ]),
    ])


# ============================================================================
# 4 · DIGITAL BRANDING -- a digital brand kit and a design system
#
# The kit on one board: a mark trying on forms and colours, its swatches,
# the type (getting bolder and lighter with each try) and a component that
# switches with it.
# ============================================================================

def brand():
    lands = [40, 110, 180]
    hold = lambda t: t - 22
    B = 56
    mx, my = 96, 112
    r = kf([(hold(40), 12, INOUT), (40, B / 2, LIN), (hold(110), B / 2, INOUT),
            (110, 12, LIN)])
    rot = kf([(hold(40), 0, INOUT), (40, 90, LIN), (hold(110), 90, INOUT), (110, 135, LIN),
              (hold(180), 135, INOUT), (180, 180, LIN)])
    col = kf([(hold(40), SKY, INOUT), (40, BLOSSOM, LIN), (hold(110), BLOSSOM, INOUT),
              (110, CORAL, LIN), (hold(180), CORAL, INOUT), (180, SKY, LIN)])
    weight = kf([(hold(40), 5.5, INOUT), (40, 9, LIN), (hold(110), 9, INOUT), (110, 4, LIN),
                 (hold(180), 4, INOUT), (180, 5.5, LIN)])
    on = lambda a, b: kf([(hold(40), a, INOUT), (40, b, LIN), (hold(110), b, INOUT),
                          (110, a, LIN), (hold(180), a, INOUT), (180, b, LIN),
                          (218, b, INOUT), (234, a, LIN)])

    sw_x = [196, 232, 268]
    ring_x = kf([(hold(40), [268, 70], INOUT), (40, [196, 70], LIN),
                 (hold(110), [196, 70], INOUT), (110, [232, 70], LIN),
                 (hold(180), [232, 70], INOUT), (180, [268, 70], LIN)])

    return comp("brand", [
        layer("mark", [
            group([rect((0, 0), (B, B), r), fill(col), stroke(INK, 4.5)], "form",
                  tr(r=rot, s=bump(lands, peak=114, lead=8, land=14))),
        ], p=(mx, my)),
        layer("tile", [
            *[group([ell((mx + dx, my + dy), (5, 5)), fill(INK, 35)], "pin")
              for dx in (-38, 38) for dy in (-38, 38)],
            *panel((mx, my), (116, 116), r=24, sh=6),
        ]),
        layer("ring", [group([ell((0, 0), (40, 40)), stroke(INK, 3)], "ring",
                             tr(p=ring_x))]),
        layer("swatches", [
            at_scale((x, 70), bump([lands[i]], peak=124),
                     [group([ell((x, 70), (28, 28)), fill(c), stroke(INK, 3)], "sw")])
            for i, (x, c) in enumerate(zip(sw_x, [BLOSSOM, CORAL, SKY]))
        ]),
        layer("type", [
            group([path([(184, 160), (201, 112), (218, 160)], k=0), stroke(INK, weight)], "A"),
            group([line((191, 143), (211, 143)), stroke(INK, weight)], "Abar"),
            group([ell((242, 145), (28, 28)), stroke(INK, weight)], "a"),
            group([line((256, 128), (256, 160)), stroke(INK, weight)], "astem"),
        ]),
        layer("toggle", [
            group([ell((0, 0), (18, 18)), fill(PAPER), stroke(INK, 3)], "knob",
                  tr(p=on([-13, 0], [13, 0]))),
            group([rect((0, 0), (52, 26), 13), fill(on(PAPER, INK)), stroke(INK, 3)], "track"),
        ], p=(226, 198)),
        layer("chip", [
            group([rect((0, 0), (40, 16), 8), fill(PAPER), stroke(INK, 2.4)], "chip"),
        ], p=(170, 198), o=on(40, 100)),
    ])


# ============================================================================
# 5 · PERSONALISATION & CUSTOMER DATA -- one view of each customer
#
# Shop, email and app send what they know along their lines into one
# customer card; the card fills in and sends out a message made for them,
# a different one each time.
# ============================================================================

def data_view():
    srcs = [(46, 70), (46, 120), (46, 170)]
    card = (150, 120)
    dock = (110, 120)
    lead, period, travel = 6, 40, 26

    lines, packets, arrivals = [], [], {0: [], 1: [], 2: []}
    for si, (x, y) in enumerate(srcs):
        seg = ((x + 18, y), (90, y), (86, 120), dock)
        lines.append(group([cubic(*seg), stroke(INK, 2.5, 22)], "wire%d" % si))
        trk = Track(segs=[seg])
        for n in range(-1, OP // period + 1):
            t0 = lead + si * 13 + n * period
            t1 = t0 + travel
            if t1 < 0 or t0 > OP:
                continue
            if 0 <= t1 <= OP:
                arrivals[si].append(t1)
            p = []
            for f in range(max(0, t0), min(OP, t1) + 1, 2):
                u = (f - t0) / travel
                x2, y2 = trk.at(trk.total * smooth(u))
                p.append((f, [round(x2, 2), round(y2, 2), 0], LIN))
            # Showing only while in flight; a packet cut by the loop's seam
            # is finished by its twin from the cycle before.
            o = [(t0 - 1, 0, LIN), (t0, 100, LIN)] if t0 > 0 else [(0, 100, LIN)]
            o += [(t1, 100, LIN), (t1 + 1, 0, LIN)] if t1 < OP else [(OP, 100, LIN)]
            packets.append(layer("packet", [
                group([ell((0, 0), (9, 9)), fill(INK)], "dot")], p=kf(p), o=kf(o)))

    all_arrivals = sorted(t for ts in arrivals.values() for t in ts)
    glyphs = [
        [group([path([(-8, -5), (8, -5), (6, 4), (-6, 4)], closed=True, k=0),
                stroke(INK, 2.4)], "cart"),
         group([ell((-4, 8), (3.5, 3.5)), fill(INK)], "w1"),
         group([ell((4, 8), (3.5, 3.5)), fill(INK)], "w2")],
        [group([rect((0, 0), (18, 13), 2.5), stroke(INK, 2.4)], "mail"),
         group([path([(-8, -5), (0, 1), (8, -5)], k=0), stroke(INK, 2.4)], "flap")],
        [group([rect((0, 0), (12, 19), 3.5), stroke(INK, 2.4)], "phone"),
         group([ell((0, 5), (2.5, 2.5)), fill(INK)], "btn")],
    ]
    tiles = []
    for si, (x, y) in enumerate(srcs):
        tiles.append(group([
            group(glyphs[si], "glyph", tr(p=(x, y))),
            *panel((x, y), (34, 34), r=9, sh=4),
        ], "src%d" % si))

    # Each message hands over to the next, so one is always showing.
    variants = [(SKY, 226, 72), (CITRUS, 76, 148), (MINT, 152, 222)]
    msgs = []
    for vi, (c, t_in, t_out) in enumerate(variants):
        mc = (258, 120)
        come = [(t_in, [238, 120], OUT), (t_in + 14, [258, 120], LIN)]
        go = [(t_out, [258, 120], IN), (t_out + 10, [280, 120], LIN)]
        grow = [(t_in, [90, 90], OUT), (t_in + 14, [100, 100], LIN)]
        if t_in > t_out:
            move, size = go + come, [(t_out, [100, 100], LIN)] + grow
        else:
            move, size = come + go, grow
        msgs.append(group([
            group([sparkle((288, 94), 8), fill(c), stroke(INK, 2.2)], "spark"),
            bar((250, 134), (30, 6)),
            bar((256, 122), (42, 6)),
            group([rect((258, 104), (52, 12), 6), fill(c), stroke(INK, 2.4)], "head"),
            *panel(mc, (70, 58), r=12, sh=4),
        ], "msg%d" % vi, tr(a=mc, p=kf(move), s=kf(size), o=fade(t_in, t_out, 12, 10))))

    return comp("data", [
        layer("messages", msgs),
        layer("send", [group([line((190, 120), (222, 120)),
                              dashed(stroke(INK, 2.5, 45), 4, 4,
                                     kf([(0, 0, LIN), (OP, -48)]))], "ants")]),
        *packets,
        layer("profile", [
            group([rect((138, 160), (22, 11), 5.5), fill(SKY), stroke(INK, 2.2)], "tag1",
                  tr(a=(138, 160), p=(138, 160), s=bump(arrivals[0], peak=125, lead=3, land=10))),
            group([rect((164, 160), (22, 11), 5.5), fill(CITRUS), stroke(INK, 2.2)], "tag2",
                  tr(a=(164, 160), p=(164, 160), s=bump(arrivals[1], peak=125, lead=3, land=10))),
            bar((150, 142), (34, 6)),
            bar((150, 130), (48, 6)),
            group([path([(140, 112), (143, 106), (157, 106), (160, 112)], k=0.3),
                   stroke(INK, 2.6)], "shoulders"),
            group([ell((150, 97), (10, 10)), fill(INK)], "head"),
            group([ell((150, 101), (34, 34)), fill(PERI), stroke(INK, 3)], "avatar",
                  tr(a=(150, 101), p=(150, 101), s=bump(arrivals[2], peak=112, lead=3, land=10))),
            *panel(card, (78, 104), r=14, sh=5),
        ], p=card, a=card, s=bump(all_arrivals, peak=103, lead=3, land=9)),
        layer("sources", tiles),
        layer("wires", lines),
    ])


# ============================================================================
# 6 · TESTING & ONGOING IMPROVEMENT -- a scorecard and a testing rhythm
#
# Two versions go head to head; their meters fill, the winner is ticked and
# lifted, the score ring climbs, and the week's dot lights in the rhythm.
# ============================================================================

def testing():
    def variant(c, block, extra, dots):
        x, y = c
        return [
            *[group([ell((x - 24 + 7 * i, y - 34), (4.5, 4.5)), fill(INK)], "id")
              for i in range(dots)],
            *extra,
            group([rect((x, y - 12), (48, 24), 6), fill(block), stroke(INK, 2.4)], "block"),
            *panel(c, (68, 88), r=12, sh=5),
        ]

    a, b = (78, 96), (160, 96)
    win = 78
    meter = lambda x, val, colour: [
        group([rect((x, 160), (56, 8), 4), fill(colour)], "fill",
              tr(a=(x - 28, 160), p=(x - 28, 160),
                 s=kf([(18, [10, 100], OUT), (64 if val > 60 else 56, [val, 100], LIN),
                       (198, [val, 100], INOUT), (222, [10, 100], LIN)]))),
        group([rect((x, 160), (64, 14), 7), fill(PAPER), stroke(INK, 2.4)], "track"),
    ]
    score = kf([(86, 58, SOFT), (126, 86, LIN), (198, 86, INOUT), (226, 58, LIN)])
    rhythm = []
    for i in range(5):
        t = 26 + 36 * i
        rhythm.append(group([ell((212 + 17 * i, 184), (11, 11)),
                             fill(kf([(t, PAPER, OUT), (t + 6, INK, LIN), (212, INK, IN),
                                      (222, PAPER, LIN)])),
                             stroke(INK, 2.4)], "beat%d" % i,
                            tr(a=(212 + 17 * i, 184), p=(212 + 17 * i, 184),
                               s=bump([t + 4], peak=135, lead=4, land=10))))

    return comp("testing", [
        layer("badge", [at_scale((190, 54), shown(win, 200, d_in=16), [
            check((190, 54), 13, 3),
            group([ell((190, 54), (28, 28)), fill(MINT), stroke(INK, 3)], "c"),
        ])]),
        layer("b", [group(variant(b, CORAL, [
            group([rect((b[0], b[1] + 18), (36, 12), 6), fill(CITRUS), stroke(INK, 2.2)], "cta"),
            bar((b[0] - 6, b[1] + 4), (36, 5)),
        ], 2), "B", tr(a=b, p=kf([(win, [b[0], b[1]], SPRING), (win + 14, [b[0], b[1] - 7], LIN),
                                   (198, [b[0], b[1] - 7], INOUT), (214, [b[0], b[1]], LIN)]),
                        s=kf([(win, [100, 100], SPRING), (win + 14, [105, 105], LIN),
                              (198, [105, 105], INOUT), (214, [100, 100], LIN)])))]),
        layer("a", [group(variant(a, SKY, [
            bar((a[0], a[1] + 10), (44, 5)),
            bar((a[0] - 6, a[1] + 20), (32, 5)),
        ], 1), "A", tr(o=kf([(win, 100, OUT), (win + 12, 50, LIN), (198, 50, INOUT),
                             (214, 100, LIN)])))]),
        layer("meters", [*meter(a[0], 46, INK), *meter(b[0], 92, INK)]),
        layer("score", [
            group([path([(-7, 3), (0, -5), (7, 3)], k=0), stroke(INK, 3.5)], "up",
                  tr(p=kf([(118, [0, 0], OUT), (124, [0, -5], SPRING), (136, [0, 0], LIN)]))),
            group([line((0, -5), (0, 9)), stroke(INK, 3.5)], "stem"),
            group([ell((0, 0), (84, 84)), trim(s=0, e=score), stroke(INK, 9)], "arc",
                  tr(r=0)),
            group([ell((0, 0), (84, 84)), stroke(INK, 9, 12)], "track"),
            group([ell((0, 0), (110, 110)), fill(PAPER), stroke(INK, 3.2)], "dial"),
            group([ell((5, 5), (110, 110)), fill(INK)], "shadow"),
        ], p=(254, 96)),
        layer("rhythm", rhythm),
    ])


SCENES = {
    "research": research,
    "journey": journey,
    "interface": interface,
    "brand": brand,
    "data": data_view,
    "testing": testing,
}

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "src", "lottie", "services")
    os.makedirs(out, exist_ok=True)
    for name, build in SCENES.items():
        d = build()
        dest = os.path.join(out, "%s.json" % name)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(d, f, separators=(",", ":"))
        print("  %-10s %2d layers  %6.1f KB" % (name, len(d["layers"]),
                                                 os.path.getsize(dest) / 1024))
