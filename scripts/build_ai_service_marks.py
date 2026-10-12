"""
============================================================================
AI SERVICE SCENES -- LOTTIE SOURCE FOR THE CX AI-SERVICE CARDS

Six scenes, one per AI service, drawn in the same language as the service
scenes: white paper panels with an ink outline and a hard ink shadow, pastel
fills, heavy round strokes, no text glyphs (words are skeleton bars). Every
scene is a cycle -- the last frame lands back on frame 0 -- and every
animated property is built through seq(), which refuses to write a loop
that does not close.

    python scripts/build_ai_service_marks.py

writes src/lottie/ai-services/*.json. Shape helpers come from build_lottie.py.
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
OP = 240                       # 8s
W, H = 320, 240

SUN = [1, 0.886, 0.537, 1]
MINT = [0.647, 0.973, 0.694, 1]
PERI = [0.710, 0.765, 1, 1]
LILAC = [0.863, 0.812, 1, 1]


# --- timing ------------------------------------------------------------------

def sc(x):
    """A scale: uniform from one number, or the pair as given."""
    return [x, x] if not isinstance(x, (list, tuple)) else list(x)


def seq(start, moves):
    """
    A property resting at `start`, making each move in turn, and back at
    `start` by OP. A move is (t0, t1, value, ease): it holds the current value
    until t0, then travels to `value` by t1 along `ease`. Moves may not overlap,
    and the last one must come back to `start`, or the loop would cut.
    """
    keys = {0: [start, LIN]}
    cur, last = start, 0
    for t0, t1, val, ease in moves:
        assert last <= t0 < t1 < OP, (t0, t1, last)
        if t0 in keys:
            assert keys[t0][0] == cur, (t0, keys[t0][0], cur)
            keys[t0][1] = ease
        else:
            keys[t0] = [cur, ease]
        keys[t1] = [val, LIN]
        cur, last = val, t1
    assert cur == start, ("loop does not close", cur, start)
    keys[OP] = [start, LIN]
    return kf([(t, val, ease) for t, (val, ease) in sorted(keys.items())])


def pop_moves(t, over=136, base=100, up=10, down=8):
    """A thing landing with a little overshoot at t, then settling."""
    return [(t, t + up, sc(over), SPRING), (t + up, t + up + down, sc(base), LIN)]


def travel(trk, t0, t1, rest):
    """Position keys that run a point along `trk` from t0 to t1, and rest."""
    pts = [(0, rest, LIN)]
    frames = sorted(set(list(range(t0, t1 + 1, 2)) + [t1]))
    for f in frames:
        u = (f - t0) / (t1 - t0)
        x, y = trk.at(trk.total * smooth(u))
        pts.append((f, [round(x, 2), round(y, 2)], LIN))
    pts.append((OP, rest, LIN))
    return kf(pts)


def smooth(u):
    return u * u * (3 - 2 * u)


# --- composition ---------------------------------------------------------------

def _spatial(x, z):
    """Layer transforms are 3D: pad a 2D value, static or keyed, with z."""
    if isinstance(x, dict):
        if x.get("a") == 1:
            for k in x["k"]:
                if len(k["s"]) == 2:
                    k["s"].append(z)
        return x
    x = list(x)
    return v(x + [z] if len(x) == 2 else x)


def layer(nm, shapes, p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    return {"ddd": 0, "ind": 0, "ty": 4, "nm": nm, "sr": 1, "ao": 0,
            "ks": {"o": _prop(o), "r": _prop(r),
                   "p": _spatial(p, 0), "a": _spatial(a, 0),
                   "s": _spatial(s, 100)},
            "shapes": shapes, "ip": 0, "op": OP, "st": 0, "bm": 0}


def comp(name, layers):
    for i, l in enumerate(layers):
        l["ind"] = i + 1
    return {"v": "5.9.0", "fr": FPS, "ip": 0, "op": OP, "w": W, "h": H,
            "nm": name, "ddd": 0, "assets": [], "layers": layers}


# The cards' mark area is about 2.2 : 1 (roughly 336 x 150 on desktop), so the
# scenes in scripts/ai_marks/ are drawn on a wide 2 : 1 canvas; a 4 : 3 one
# would only fill its middle.
WW, WH = 360, 180


def wide_comp(name, layers):
    for i, l in enumerate(layers):
        l["ind"] = i + 1
    return {"v": "5.9.0", "fr": FPS, "ip": 0, "op": OP, "w": WW, "h": WH,
            "nm": name, "ddd": 0, "assets": [], "layers": layers}


def pivot(c, items, name, s=None, p=None, o=None):
    """A group that scales, moves or fades about its own centre c. Its items
    are drawn in absolute comp coordinates; the pivot is where they rest."""
    return group(items, name, tr(a=c, p=p if p is not None else c,
                                 s=s if s is not None else sc(100),
                                 o=o if o is not None else 100))


# --- drawing -------------------------------------------------------------------

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


def _shape(pts, closed=False, k=0.36):
    """The same Catmull-Rom path build_lottie.path makes, as a bare shape --
    for keyframed shapes, where the shape itself is what moves."""
    n = len(pts)
    i_t, o_t = [], []
    for idx, (x, y) in enumerate(pts):
        prev = pts[(idx - 1) % n] if (closed or idx > 0) else pts[idx]
        nxt = pts[(idx + 1) % n] if (closed or idx < n - 1) else pts[idx]
        dx, dy = (nxt[0] - prev[0]) * k, (nxt[1] - prev[1]) * k
        i_t.append([-dx, -dy])
        o_t.append([dx, dy])
    return {"i": i_t, "o": o_t, "v": [list(p) for p in pts], "c": closed}


# --- bezier sampling, for things that travel along a cable ----------------------

def bz(seg, u):
    p0, p1, p2, p3 = seg
    m = 1 - u
    return (m ** 3 * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u ** 3 * p3[0],
            m ** 3 * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u ** 3 * p3[1])


class Track:
    """Arc-length lookup along a chain of cubic segments."""

    def __init__(self, segs, steps=120):
        self.samples, self.total, prev = [], 0.0, None
        for seg in segs:
            for i in range(steps + 1):
                p = bz(seg, i / steps)
                if prev is not None:
                    self.total += math.dist(prev, p)
                self.samples.append((self.total, p))
                prev = p

    def at(self, s):
        s = max(0.0, min(self.total, s))
        lo, hi = 0, len(self.samples) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if self.samples[mid][0] < s:
                lo = mid + 1
            else:
                hi = mid
        return self.samples[lo][1]


def _verify(name, node, where=""):
    """Every keyed property must start at 0, end at OP on its first value,
    and have strictly rising key times. Fails the build rather than ship a cut."""
    if isinstance(node, dict):
        if node.get("a") == 1 and isinstance(node.get("k"), list):
            ks = node["k"]
            ts = [k["t"] for k in ks]
            assert ts[0] == 0 and ts[-1] == OP, (name, where, ts[0], ts[-1])
            assert all(a < b for a, b in zip(ts, ts[1:])), (name, where, ts)
            assert ks[0]["s"] == ks[-1]["s"], (name, where, "loop does not close")
        for key, val in node.items():
            _verify(name, val, where + "/" + str(key))
    elif isinstance(node, list):
        for i, val in enumerate(node):
            _verify(name, val, where + "[%d]" % i)


# ============================================================================
# 1 · AI STRATEGY & ADVISORY -- score the ideas, rank them, put the best on
# the roadmap.
#
# Four idea cards scattered left, each with a score bar that fills in turn.
# They sort into a ranked column; the top one (citrus) slides onto a roadmap
# on the right, its milestones pop in along the line, and a flag goes up on
# the last. Then it all goes back to where it started.
# ============================================================================

REST = {0: ((60, 70), -5), 1: ((124, 104), 6), 2: ((58, 150), 4), 3: ((118, 186), -3)}
STACK = {1: (92, 50), 3: (92, 90), 0: (92, 130), 2: (92, 170)}
SCORE = {0: 0.55, 1: 0.92, 2: 0.35, 3: 0.70}
FILL_AT = {0: 22, 1: 42, 2: 62, 3: 82}
SORT_AT = {1: 116, 3: 118, 0: 120, 2: 122}
LANDING = (206, 116)
ROAD_Y = 150
DOTS = [186, 236, 282]
DOT_AT = [176, 186, 196]


def _idea_card(i, pos, rot, bar_s, dot_c, top_c):
    items = [
        group([rect((-6, 7), (32, 6), 3), fill(INK, 88)], "fill",
              tr(a=(-22, 7), p=(-22, 7), s=bar_s)),
        group([rect((-6, 7), (32, 6), 3), fill(INK, 18)], "track"),
        group([ell((21, 7), (9, 9)), fill(dot_c), stroke(INK, 2.2)], "dot"),
        bar((-6, -8), (34, 6)),
        *panel((0, 0), (60, 36), r=8, fc=top_c, sw=3, sh=4),
    ]
    return group(items, "idea%d" % i, tr(p=pos, r=rot))


def strategy():
    cards = {}
    for i in range(4):
        (x0, y0), r0 = REST[i]
        t = FILL_AT[i]
        bar_s = seq([0, 100], [(t, t + 16, [round(SCORE[i] * 100, 2), 100], OUT),
                               (196 + 2 * i, 208 + 2 * i, [0, 100], IN)])
        dot_c = seq(PAPER, [(t + 16, t + 22, SUN, LIN),
                            (196 + 2 * i, 204 + 2 * i, PAPER, LIN)])
        if i == 1:
            pos = seq([x0, y0], [(116, 138, list(STACK[1]), INOUT),
                                 (152, 172, list(LANDING), INOUT),
                                 (216, 236, [x0, y0], INOUT)])
            rot = seq(r0, [(116, 138, 0, INOUT), (216, 236, r0, INOUT)])
            top_c = seq(PAPER, [(140, 150, CITRUS, LIN), (214, 226, PAPER, LIN)])
        else:
            s, ret = SORT_AT[i], 208 + 2 * i
            pos = seq([x0, y0], [(s, s + 24, list(STACK[i]), INOUT),
                                 (ret, ret + 20, [x0, y0], INOUT)])
            rot = seq(r0, [(s, s + 24, 0, INOUT), (ret, ret + 20, r0, INOUT)])
            top_c = PAPER
        cards[i] = _idea_card(i, pos, rot, bar_s, dot_c, top_c)

    road = []
    for i, x in enumerate(DOTS):
        t = DOT_AT[i]
        road.append(group(
            [ell((x, ROAD_Y), (16, 16)),
             fill(seq(PAPER, [(t, t + 6, SUN, LIN), (222 + 2 * i, 228 + 2 * i, PAPER, LIN)])),
             stroke(INK, 2.8)],
            "milestone%d" % i,
            tr(a=(x, ROAD_Y), p=(x, ROAD_Y), s=seq(sc(100), pop_moves(t, over=140)))))
    road.append(group([line((172, ROAD_Y), (300, ROAD_Y)), stroke(INK, 4.5)], "road"))
    pennant = group(
        [path([(282, 110), (298, 116), (282, 122)], closed=True, k=0),
         fill(seq(PAPER, [(200, 208, CORAL, LIN), (222, 230, PAPER, LIN)])),
         stroke(INK, 2.6)],
        "pennant", tr(a=(282, 116), p=(282, 116), s=seq(sc(100), pop_moves(200, over=130))))
    pole = group([line((282, ROAD_Y), (282, 108)), stroke(INK, 3.2)], "pole")

    return comp("strategy", [
        layer("top", [cards[1]]),
        layer("cards", [cards[0], cards[2], cards[3]]),
        layer("roadmap", [pennant, pole, *road]),
    ])


# ============================================================================
# 2 · CONVERSATIONAL AI & AGENTS
#
# A chat panel holding a question, an answer with its source attached, and a
# handover waiting at the bottom. Right: the tool and the person. The answer
# streams, the source glows, the tool clicks and ticks, and the handover
# lifts out to dock beside the person, who nods.
# ============================================================================

def agents():
    U1_C, U1_S = (136, 84), (88, 28)
    R_C, R_S = (80, 136), (92, 62)
    K_C, K_S = (164, 140), (28, 34)
    Q_C = (80, 190)
    T_C = (254, 88)
    AV_C = (254, 160)

    user = pivot(U1_C, [
        bar((124, 84), (46, 7)),
        *panel(U1_C, U1_S, r=10, fc=SUN, sw=3, sh=4),
    ], "user", p=seq([136, 84], [(10, 20, [136, 76], OUT), (20, 34, [136, 84], SPRING)]))

    lines = []
    for i, (lx, ly, w) in enumerate([(46, 120, 54), (46, 134, 66), (46, 148, 40)]):
        t = 70 + 8 * i
        lines.append(group([rect((lx + w / 2, ly), (w, 7), 3.5), fill(INK, 88)],
                           "stream%d" % i,
                           tr(a=(lx, ly), p=(lx, ly),
                              s=seq(sc(100), [(t, t + 12, [40, 100], INOUT),
                                              (t + 12, t + 24, [100, 100], OUT)]))))
    reply = group([*lines, *panel(R_C, R_S, r=12, fc=PAPER, sw=3.5, sh=5)], "reply")

    knowledge = group([
        bar((160, 133), (14, 4)),
        bar((160, 141), (14, 4)),
        bar((158, 149), (9, 4)),
        *panel(K_C, K_S, r=5, fc=seq(PAPER, [(40, 50, SUN, OUT), (52, 70, PAPER, LIN)]),
               sw=3, sh=4),
    ], "knowledge")
    link = group([
        line((126, 136), (150, 140)),
        trim(e=seq(100, [(56, 64, 0, IN), (64, 76, 100, OUT)])),
        dashed(stroke(INK, 2.8), 3, 4),
    ], "link")

    header = [bar((60, 52), (56, 7)),
              group([ell((168, 52), (10, 10)), fill(MINT), stroke(INK, 2.4)], "status")]

    tool = pivot(T_C, [
        group([path([(240, 76), (232, 90), (238, 90), (234, 100), (244, 84), (238, 84)],
                    closed=True, k=0), fill(CITRUS), stroke(INK, 2)], "bolt"),
        group([ell((270, 88), (22, 22)), fill(MINT), stroke(INK, 2.6)], "disc"),
        group([path([(263, 88), (268, 93), (277, 83)], k=0),
               trim(e=seq(100, [(114, 116, 0, IN), (116, 126, 100, OUT)])),
               stroke(INK, 3.2)], "tick"),
        *panel(T_C, (70, 56), r=12, fc=SKY, sw=3.5, sh=5),
    ], "tool", s=seq(sc(100), [(106, 112, sc(93), IN), (112, 120, sc(100), SPRING)]))

    avatar = pivot(AV_C, [
        group([ell((254, 150), (15, 15)), fill(INK)], "head"),
        group([rect((254, 172), (22, 12), 6), fill(INK)], "shoulders"),
        group([ell(AV_C, (46, 46)), fill(BLOSSOM), stroke(INK, 3.2)], "circle"),
    ], "avatar", s=seq(sc(100), [(168, 176, sc(108), SPRING), (176, 186, sc(100), LIN)]))

    handover = pivot(Q_C, [
        group([path([(117, 173), (120, 170), (123, 173), (120, 176), (120, 178)], k=0),
               stroke(INK, 2)], "q"),
        group([ell((120, 181.5), (2.2, 2.2)), fill(INK)], "qdot"),
        group([ell((120, 176), (16, 16)), fill(CORAL), stroke(INK, 2.2)], "badge"),
        bar((70, 190), (40, 7)),
        *panel(Q_C, (88, 28), r=10, fc=SUN, sw=3, sh=4),
    ], "handover",
        p=seq([80, 190], [(140, 168, [254, 204], INOUT), (200, 226, [80, 190], INOUT)]),
        s=seq(sc(100), [(140, 168, sc(75), INOUT), (200, 226, sc(100), INOUT)]))

    return comp("agents", [
        layer("handover", [handover]),
        layer("human", [avatar]),
        layer("tool", [tool]),
        layer("chat", [user, reply, knowledge, link, *header]),
        layer("frame", panel((108, 124), (168, 184), r=18, sw=4, sh=6)),
    ])


# ============================================================================
# 3 · INTELLIGENT WORKFLOW AUTOMATION
#
# Three stations above a conveyor: read, check, approve. Documents queue on
# the conveyor and run along it. At check one is flagged and drops into the
# coral review tray; the others land in the citrus approved tray. Trays
# already hold a document each.
# ============================================================================

def workflow():
    ST_Y = 84

    def corner(x, y, dx, dy):
        return group([path([(x + dx * 12, y + dy * 5), (x + dx * 12, y + dy * 12),
                            (x + dx * 5, y + dy * 12)], k=0), stroke(INK, 3.2)], "corner")

    icons = {
        96: [corner(96, ST_Y, dx, dy) for dx, dy in ((-1, -1), (1, -1), (-1, 1), (1, 1))]
            + [group([line((86, ST_Y), (106, ST_Y)), stroke(INK, 3)], "scan")],
        160: [check((160, ST_Y), 20, 4.5)],
        224: [group([rect((224, 74), (20, 8), 3), fill(INK)], "handle"),
              group([rect((224, 88), (28, 12), 4), fill(INK)], "base")],
    }

    def station(x, colour, name, bump=None):
        items = [*icons[x],
                 group([ell((x, ST_Y), (52, 52)), fill(colour), stroke(INK, 3.4)], "tile"),
                 group([ell((x + 4, ST_Y + 4), (52, 52)), fill(INK)], "shadow")]
        s = seq(sc(100), bump) if bump else sc(100)
        return pivot((x, ST_Y), items, name, s=s)

    stations = [
        station(96, SKY, "read"),
        station(160, MINT, "check", bump=[(84, 90, sc(112), SPRING), (90, 98, sc(100), LIN)]),
        station(224, BLOSSOM, "approve"),
    ]
    conveyor = group([line((24, 146), (296, 146)), stroke(INK, 5)], "conveyor")

    def doc(name, pos, scl, badge=None):
        items = [] if badge is None else [badge]
        items += [bar((-3, -7), (14, 4)), bar((-3, 1), (16, 4)),
                  *panel((0, 0), (24, 30), r=4, fc=PAPER, sw=2.8, sh=3)]
        return group(items, name, tr(p=pos, s=scl))

    badge = group([
        group([line((10, -17), (10, -12)), stroke(INK, 2.4)], "stem"),
        group([ell((10, -8.5), (2.6, 2.6)), fill(INK)], "dot"),
        group([ell((10, -13), (12, 12)), fill(CORAL), stroke(INK, 2.2)], "disc"),
    ], "flag", tr(a=(10, -13), p=(10, -13),
                  s=seq(sc(0), [(68, 76, sc(100), SPRING), (204, 212, sc(0), IN)])))

    def hide_show(t_hide=204):
        return seq(sc(100), [(t_hide, t_hide + 8, sc(0), IN), (226, 238, sc(100), SPRING)])

    # Leader first, so nothing catches up with anything ahead of it.
    doc_p2 = doc("docP2",
                 seq([142, 146], [(20, 70, [252, 146], LIN), (70, 86, [252, 198], IN),
                                  (212, 214, [142, 146], LIN)]),
                 hide_show())
    doc_b = doc("docB",
                seq([86, 146], [(46, 80, [178, 146], LIN), (80, 96, [178, 202], IN),
                                (212, 214, [86, 146], LIN)]),
                hide_show(), badge)
    doc_p1 = doc("docP1",
                 seq([30, 146], [(100, 168, [252, 146], LIN), (168, 184, [252, 194], IN),
                                 (212, 214, [30, 146], LIN)]),
                 hide_show())
    rest_review = doc("docReview", [140, 202], sc(100))
    rest_approved = doc("docApproved", [252, 202], sc(100))

    review = panel((160, 198), (84, 44), r=10, fc=CORAL, sw=3.6, sh=5)
    approved = panel((252, 198), (84, 44), r=10, fc=CITRUS, sw=3.6, sh=5)
    tray_labels = []

    return comp("workflow", [
        layer("docs", [doc_p2, doc_b, doc_p1, rest_review, rest_approved]),
        layer("stations", stations),
        layer("conveyor", [conveyor]),
        layer("trays", [*tray_labels, *review, *approved]),
    ])


# ============================================================================
# 4 · AI PROTOTYPES & PRODUCT DEVELOPMENT
#
# A phone with its screen already built, beside a checklist and a proof
# meter. A cursor taps the button; the checklist ticks row by row, the meter
# fills, and a star pops.
# ============================================================================

def prototype():
    def blk(c, size, colour, bars, name, t=None):
        items = [*[bar((bx, by), (bw, 6)) for bx, by, bw in bars],
                 group([rect(c, size, 8), fill(colour), stroke(INK, 2.8)], "box")]
        s = seq(sc(100), [(t, t + 8, sc(94), IN), (t + 8, t + 16, sc(100), SPRING)]) if t else sc(100)
        return pivot(c, items, name, s=s)

    phone_blocks = [
        blk((104, 56), (92, 20), SUN, [], "header"),
        blk((104, 96), (92, 56), PERI, [], "image"),
        blk((104, 138), (92, 18), SKY, [(90, 138, 44)], "row1"),
        blk((104, 160), (92, 18), SKY, [(90, 160, 44)], "row2"),
        blk((104, 194), (64, 20), CITRUS, [(104, 194, 30)], "button", t=34),
    ]
    phone = [group([rect((104, 38), (22, 5), 2.5), fill(INK)], "notch"),
             *panel((104, 122), (110, 186), r=18, fc=PAPER, sw=4, sh=6)]

    cl = []
    steps = [46, 58, 70]
    for i, (y, t) in enumerate(zip([92, 124, 156], steps)):
        cl.append(group([ell((190, y), (18, 18)),
                         fill(seq(PAPER, [(t, t + 5, MINT, LIN), (190, 198, PAPER, LIN)])),
                         stroke(INK, 2.6)], "disc%d" % i))
        cl.append(pivot((190, y), [check((190, y), 9, 3)], "tick%d" % i,
                        s=seq(sc(0), [(t + 2, t + 12, sc(100), SPRING), (190, 198, sc(0), IN)])))
        cl.append(bar((226, y), (48, 8)))
    cl.append(bar((212, 58), (58, 8)))
    cl.append(bar((212, 182), (56, 7)))
    cl.append(pivot((268, 178), [group([sparkle((268, 178), 10), fill(CORAL),
                                        stroke(INK, 2.4)], "star")],
                    "star", s=seq(sc(0), [(114, 124, sc(100), SPRING), (196, 204, sc(0), IN)])))
    cl.append(group([rect((228, 200), (96, 12), 6), fill(PAPER), stroke(INK, 2.6)], "track"))
    cl.append(group([rect((230, 200), (88, 8), 4), fill(CITRUS)], "meter",
                    tr(a=(184, 200), p=(184, 200),
                       s=seq([0, 100], [(84, 112, [80, 100], OUT), (194, 212, [0, 100], IN)]))))
    checklist = [*cl, *panel((228, 122), (116, 176), r=16, fc=PAPER, sw=4, sh=6)]

    arrow = [(0, 0), (0, 25), (7, 19), (12, 29), (17, 27), (12, 17), (20, 17)]
    cursor = layer("cursor", [group([path(arrow, closed=True, k=0), fill(INK),
                                     stroke(PAPER, 2)], "arrow")],
                   p=seq([24, 186], [(14, 34, [84, 190], INOUT), (150, 176, [24, 186], INOUT)]),
                   s=seq(sc(100), [(34, 38, sc(88), OUT), (38, 46, sc(100), SPRING)]))

    return comp("prototype", [
        cursor,
        layer("checklist", checklist),
        layer("blocks", phone_blocks),
        layer("phone", phone),
    ])


# ============================================================================
# 5 · AI INTEGRATION & MODERNISATION
#
# A big AI chip with three systems already cabled to it. One legacy cable
# unplugs and is plugged back in with a bounce; then data runs out along all
# three in turn, and the chip glows.
# ============================================================================

def integration():
    cables = [
        ((122, 106), (114, 100), (108, 90), (102, 84)),     # server
        ((122, 134), (114, 140), (108, 180), (102, 186)),   # database (legacy)
        ((198, 120), (204, 120), (214, 120), (220, 120)),   # app
    ]
    chip_c = (160, 120)

    def wire(i, seg):
        tr_e = seq(100, [(56, 70, 0, IN), (116, 128, 100, OUT)]) if i == 1 else 100
        return group([cubic(*seg), trim(e=tr_e), stroke(INK, 4)], "wire%d" % i)

    wires = [wire(i, seg) for i, seg in enumerate(cables)]

    def plug(i, seg):
        x, y = seg[3]
        s = (seq(sc(100), [(56, 64, sc(0), IN), (124, 136, sc(100), SPRING)])
             if i == 1 else sc(100))
        return pivot((x, y), [group([rect((x, y), (12, 10), 3), fill(CITRUS),
                                     stroke(INK, 2.4)], "plug")], "plug%d" % i, s=s)

    plugs = [plug(i, seg) for i, seg in enumerate(cables)]

    chip = pivot(chip_c, [
        group([sparkle(chip_c, 14), fill(PAPER), stroke(INK, 2.2)], "spark"),
        group([rect(chip_c, (76, 76), 18),
               fill(seq(PERI, [(146, 154, CITRUS, LIN), (206, 214, PERI, LIN)])),
               stroke(INK, 4)], "chip"),
        group([rect((164, 124), (76, 76), 18), fill(INK)], "chip-shadow"),
    ], "chip")

    server = [
        group([ell((48, 58), (7, 7)), fill(MINT), stroke(INK, 2)], "led0"),
        group([ell((48, 74), (7, 7)), fill(PERI), stroke(INK, 2)], "led1"),
        group([ell((48, 90), (7, 7)), fill(SUN), stroke(INK, 2)], "led2"),
        bar((68, 58), (26, 6)),
        bar((68, 74), (26, 6)),
        bar((68, 90), (26, 6)),
        *panel((66, 72), (72, 66), r=10, fc=PAPER, sw=3.4, sh=4),
    ]
    database = [
        group([ell((66, 156), (72, 18)), fill(PAPER), stroke(INK, 3.2)], "lid"),
        group([rect((66, 182), (72, 46), 4), fill(BLOSSOM), stroke(INK, 3.2)], "body"),
        group([ell((66, 205), (72, 18)), fill(BLOSSOM), stroke(INK, 3.2)], "base"),
        group([rect((70, 186), (72, 46), 4), fill(INK)], "shadow"),
    ]
    app = [
        group([rect((258, 80), (68, 12), 4), fill(SUN), stroke(INK, 2.4)], "chrome"),
        bar((246, 108), (40, 7)),
        bar((240, 124), (28, 7)),
        group([rect((252, 150), (36, 12), 6), fill(CITRUS), stroke(INK, 2.4)], "button"),
        *panel((258, 120), (76, 96), r=10, fc=PAPER, sw=3.4, sh=5),
    ]

    pulses = []
    for i, (seg, t) in enumerate(zip(cables, [150, 170, 190])):
        pulses.append(layer("pulse%d" % i, [
            group([ell((0, 0), (10, 10)), fill(CORAL), stroke(INK, 2.2)], "dot")],
            p=travel(Track([seg]), t, t + 16, seg[0]),
            o=seq(0, [(t, t + 2, 100, LIN), (t + 14, t + 16, 0, LIN)])))

    return comp("integration", [
        *pulses,
        layer("plugs", plugs),
        layer("chip", [chip]),
        layer("wires", wires),
        layer("systems", [group(server, "server"), group(database, "database"),
                          group(app, "app")]),
    ])


# ============================================================================
# 6 · MODEL ENGINEERING & MLOPS
#
# A monitor of the model's quality, with the three gauges under it and the
# model's version card beside. The line dips into the coral zone; the needles
# drop; the card flips to v2; the line recovers and the needles rise.
# ============================================================================

def mlops():
    XS = [44, 84, 124, 164, 188, 208]
    S0 = [136, 110, 124, 100, 112, 92]
    S1 = [136, 110, 124, 150, 164, 140]
    S2 = [136, 110, 124, 108, 84, 64]

    morph = [(0, S0, LIN), (60, S0, OUT), (84, S1, LIN), (110, S1, OUT),
             (134, S2, LIN), (200, S2, INOUT), (226, S0, LIN), (OP, S0, LIN)]
    keys = []
    for i, (t, ys, ease) in enumerate(morph):
        k = {"t": t, "s": [_shape(list(zip(XS, ys)), k=0.36)]}
        if i < len(morph) - 1:
            k["o"] = {"x": [ease[0]], "y": [ease[1]]}
            k["i"] = {"x": [ease[2]], "y": [ease[3]]}
        keys.append(k)
    curve = {"ty": "sh", "ix": 1, "nm": "curve", "hd": False,
             "ks": {"a": 1, "k": keys}}
    chart = group([curve, stroke(INK, 5)], "line")
    base = group([line((44, 176), (208, 176)), stroke(INK, 2.2, 30)], "base")
    runner = seq([208, 92], [(60, 84, [208, 140], OUT), (110, 134, [208, 64], OUT),
                             (200, 226, [208, 92], INOUT)])
    zone = group([rect((175, 119), (50, 114), 0), fill(CORAL)], "zone",
                 tr(o=seq(0, [(70, 80, 100, OUT), (116, 128, 0, IN)])))

    monitor = [
        bar((62, 48), (60, 7)),
        group([ell((196, 48), (9, 9)), fill(MINT), stroke(INK, 2.4)], "led"),
        *panel((126, 108), (200, 158), r=16, fc=PAPER, sw=4, sh=6),
    ]

    pill = seq(SKY, [(98, 99, CITRUS, LIN), (208, 209, SKY, LIN)])
    ghost_o = seq(18, [(102, 110, 88, LIN), (216, 224, 18, LIN)])
    model = group([
        bar((-4, -44), (36, 7)),
        group([rect((0, -26), (42, 16), 8), fill(pill), stroke(INK, 2.6)], "pill"),
        bar((-4, -4), (36, 7)),
        bar((-6, 10), (28, 7)),
        group([rect((-4, 24), (36, 7), 3.5), fill(INK, ghost_o)], "v2a"),
        group([rect((-6, 38), (28, 7), 3.5), fill(INK, ghost_o)], "v2b"),
        *panel((0, 0), (56, 116), r=10, fc=PAPER, sw=3.5, sh=5),
    ], "model", tr(p=(268, 108),
                   s=seq([100, 100], [(90, 98, [0, 100], IN), (98, 106, [100, 100], OUT),
                                      (200, 208, [0, 100], IN), (208, 216, [100, 100], OUT)])))

    gauges = []
    for i, (x, colour, r0, drop) in enumerate(
            [(76, SKY, -40, 130), (126, SUN, -20, 140), (176, CORAL, -55, 120)]):
        a0, b0 = 84 + 3 * i, 150 + 3 * i
        gauges.append(group([
            group([line((0, 0), (0, -12)), stroke(INK, 3)], "needle",
                  tr(a=(0, 0), p=(x, 212),
                     r=seq(r0, [(a0, a0 + 16, drop, OUT), (b0, b0 + 22, r0, SPRING)]))),
            group([ell((x, 212), (5, 5)), fill(INK)], "pivot"),
            group([ell((x, 212), (24, 24)), trim(e=60), stroke(colour, 5)], "arc"),
            group([ell((x, 212), (30, 30)), fill(PAPER), stroke(INK, 3)], "face"),
        ], "gauge%d" % i))

    return comp("mlops", [
        layer("model", [model]),
        layer("gauges", gauges),
        layer("runner", [group([ell((0, 0), (10, 10)), fill(PAPER), stroke(INK, 3)], "dot")],
              p=runner),
        layer("chart", [chart, base]),
        layer("zone", [zone]),
        layer("monitor", monitor),
    ])


if __name__ == "__main__":
    # The scenes the cards play are the wide ones in scripts/ai_marks/ (Krish,
    # 12 Oct: a maze, a chat buddy, a conveyor, sketch to real, the missing
    # puzzle piece, a heartbeat monitor). The 4 : 3 scenes above are the
    # earlier set, kept as reference only.
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ai_marks"))
    import importlib
    SCENES = {
        out: importlib.import_module(module).build
        for out, module in [
            ("strategy", "maze"),
            ("agents", "buddy"),
            ("workflow", "conveyor"),
            ("prototype", "sketch"),
            ("integration", "puzzle"),
            ("mlops", "heartbeat"),
        ]
    }
    out = os.path.join(os.path.dirname(__file__), "..", "src", "lottie", "ai-services")
    os.makedirs(out, exist_ok=True)
    for name, build in SCENES.items():
        d = build()
        _verify(name, d)
        dest = os.path.join(out, "%s.json" % name)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(d, f, separators=(",", ":"))
        print("  %-12s %2d layers  %6.1f KB  %.1fs"
              % (name, len(d["layers"]), os.path.getsize(dest) / 1024,
                 d["op"] / d["fr"]))
