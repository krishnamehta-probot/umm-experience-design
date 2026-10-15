"""
Card 01 -- Cloud strategy, architecture & migration: a phased move.

A server rack on the left holds four workloads, tied together by their
dependency lines; a cloud on the right has a dashed slot for each one that
should move. Each workload is assessed in turn (its status light comes on),
and the one that should stay is locked in place. Then, phase by phase, the movers lift
out of the rack and land in their cloud slots, their dependency lines
stretching with them; each arrival pops a mint check and fills a phase pip.
Last, the locked stayer gets its own check. Its line still runs across to the
cloud: it stays, connected.

Frame 0 is the finished picture: three workloads in the cloud, the stayer
locked in the rack, everything checked, all three phase pips lit.

Beats (30 fps, loop 240):
  0-12    rest on the finished picture
  12-30   the cloud workloads, checks, lock and pips shrink away
  32-50   the movers pop back into their rack slots
  50-80   assessment, top to bottom; the stayer is locked (66)
  80-110  phase 1: top workload -> top of the cloud
  114-144 phase 2: second workload -> cloud, lower left
  148-178 phase 3: bottom workload -> cloud, lower right
  186     the stayer is checked; sparks over the cloud
  200-240 hold on the finished picture

Build and check:  python scripts/build_cloud_service_marks.py migrate
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    v, kf, _prop, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT,
    OUT, INOUT, IN, SPRING, LIN, OP,
    sc, seq, pop_moves, smooth, layer, wide_comp, pivot,
    panel, bar, dashed, check, sparkle, Track,
)

# --- geometry ------------------------------------------------------------------

RACK_C, RACK_S = (62, 90), (84, 140)
UNIT_S = (56, 22)
SLOTS = [(62, 45), (62, 75), (62, 105), (62, 135)]     # rack slots, top to bottom
STAYER = 2
DEST = {0: (270, 80), 1: (238, 122), 3: (306, 122)}     # cloud slots
FILLS = {0: SKY, 1: BLOSSOM, 2: SUN, 3: CORAL}
DEPS = [(0, 1), (1, 3), (2, 1)]                         # dependency lines

# Cloud: the union of four circles over a flat base at y = 150.
CIRCLES = [((212, 126), 24), ((242, 90), 30), ((288, 70), 38), ((316, 122), 28)]
CLOUD_BASE = 150

PIPS = [(132, 156), (152, 156), (172, 156)]

# --- timing --------------------------------------------------------------------

SHRINK = 12                     # cloud workloads and marks shrink away from here
JUMP = 30                       # movers jump back to the rack (at scale 0)
POP_IN = {0: 32, 1: 36, 3: 40}  # ... and pop into their slots
ASSESS = {0: 50, 1: 56, 2: 62, 3: 68}
PIN_AT = 66
MOVES = {0: (80, 110), 1: (114, 144), 3: (148, 178)}
STAY_CHECK = 186
SPARKS = 190


# --- the cloud outline ---------------------------------------------------------

def _meet(c0, r0, c1, r1, centre):
    """The intersection of two circles farther from `centre` (the outer cusp)."""
    (x0, y0), (x1, y1) = c0, c1
    d = math.dist(c0, c1)
    a = (r0 * r0 - r1 * r1 + d * d) / (2 * d)
    h = math.sqrt(max(r0 * r0 - a * a, 0))
    mx, my = x0 + a * (x1 - x0) / d, y0 + a * (y1 - y0) / d
    p = (mx + h * (y1 - y0) / d, my - h * (x1 - x0) / d)
    q = (mx - h * (y1 - y0) / d, my + h * (x1 - x0) / d)
    return p if math.dist(p, centre) > math.dist(q, centre) else q


def _ang(c, p):
    return math.atan2(p[1] - c[1], p[0] - c[0])


def cloud_shape(dx=0, dy=0):
    """The cloud as one closed bezier path: an arc of each circle, cusp to
    cusp, clockwise on screen, then the flat base back to the start."""
    centre = (265, 110)
    ends = []                                       # (start angle, end angle) per circle
    first = ((CIRCLES[0][0][0], CLOUD_BASE))
    last = ((CIRCLES[-1][0][0], CLOUD_BASE))
    cusps = [_meet(CIRCLES[i][0], CIRCLES[i][1], CIRCLES[i + 1][0], CIRCLES[i + 1][1], centre)
             for i in range(len(CIRCLES) - 1)]
    starts = [first] + cusps
    stops = cusps + [last]
    verts, ins, outs = [], [], []
    for (c, r), p0, p1 in zip(CIRCLES, starts, stops):
        a0, a1 = _ang(c, p0), _ang(c, p1)
        while a1 <= a0:
            a1 += 2 * math.pi
        n = max(1, math.ceil((a1 - a0) / (math.pi / 4)))
        da = (a1 - a0) / n
        L = 4 / 3 * math.tan(da / 4) * r
        for k in range(n + 1):
            a = a0 + da * k
            pt = (c[0] + r * math.cos(a), c[1] + r * math.sin(a))
            t = (-math.sin(a) * L, math.cos(a) * L)
            if k == 0:
                if verts:                           # cusp: keep the previous in-tangent
                    outs[-1] = [round(t[0], 3), round(t[1], 3)]
                    continue
                verts.append(pt)
                ins.append([0, 0])
                outs.append([round(t[0], 3), round(t[1], 3)])
            else:
                verts.append(pt)
                ins.append([round(-t[0], 3), round(-t[1], 3)])
                outs.append([round(t[0], 3), round(t[1], 3)] if k < n else [0, 0])
    return {"ty": "sh", "ix": 1, "nm": "cloud", "hd": False,
            "ks": v({"i": ins, "o": outs,
                     "v": [[round(x + dx, 2), round(y + dy, 2)] for x, y in verts],
                     "c": True})}


def cloud_panel():
    return [group([cloud_shape(), fill(PAPER), stroke(INK, 3.5)], "cloud"),
            group([cloud_shape(5, 5), fill(INK)], "cloud-shadow")]


# --- motion --------------------------------------------------------------------

def _track(k):
    (x0, y0), (x1, y1) = SLOTS[k], DEST[k]
    if k == 0:      # high arc over the gap
        seg = ((x0, y0), (x0 + 70, y0 - 52), (x1 - 70, y1 - 60), (x1, y1))
    elif k == 1:    # through the middle
        seg = ((x0, y0), (x0 + 72, y0 - 18), (x1 - 70, y1 - 40), (x1, y1))
    else:           # low: slide out to the right first, clear of the stayer
        seg = ((x0, y0), (x0 + 70, y0 - 10), (x1 - 70, y1), (x1, y1))
    return Track([seg])


TRACKS = {k: _track(k) for k in MOVES}


def unit_pos(k, f):
    if k == STAYER:
        return SLOTS[k]
    t0, t1 = MOVES[k]
    if f < JUMP or f >= t1:
        return DEST[k]
    if f <= t0:
        return SLOTS[k]
    trk = TRACKS[k]
    return trk.at(trk.total * smooth((f - t0) / (t1 - t0)))


def sampled(fn):
    """Keys every 2 frames, linear, with the holds collapsed to their ends."""
    pts = [(f, fn(f)) for f in range(0, OP + 1, 2)]
    keep = [pts[0]]
    for i in range(1, len(pts) - 1):
        if not (pts[i][1] == pts[i - 1][1] == pts[i + 1][1]):
            keep.append(pts[i])
    keep.append(pts[-1])
    return kf([(f, val, LIN) for f, val in keep])


def _r(p):
    return [round(p[0], 2), round(p[1], 2)]


# --- drawing -------------------------------------------------------------------

def unit(k):
    w, h = UNIT_S
    bx, by = w / 2 - 11, 0                          # status light / badge seat
    if k == STAYER:
        badge_s = seq(sc(100), [(SHRINK, SHRINK + 10, sc(0), IN)]
                      + pop_moves(STAY_CHECK, over=136))
        dot_c = seq(CORAL, [(24, 30, PAPER, LIN), (ASSESS[k], ASSESS[k] + 4, CORAL, LIN)])
    else:
        badge_s = seq(sc(100), [(SHRINK, SHRINK + 10, sc(0), IN)]
                      + pop_moves(MOVES[k][1], over=136))
        dot_c = seq(CITRUS, [(24, 30, PAPER, LIN), (ASSESS[k], ASSESS[k] + 4, CITRUS, LIN)])
    badge = pivot((bx, by), [check((bx, by), 9, 2.6),
                             group([ell((bx, by), (15, 15)), fill(MINT), stroke(INK, 2.4)],
                                   "badge-disc")],
                  "badge", s=badge_s)
    dot = group([ell((bx, by), (9, 9)), fill(dot_c), stroke(INK, 2.2)], "light")
    items = [badge, dot, bar((-8, 0), (24, 5)),
             group([rect((0, 0), UNIT_S, 6), fill(FILLS[k]), stroke(INK, 3)], "body"),
             group([rect((3, 3), UNIT_S, 6), fill(INK)], "shadow")]
    if k == STAYER:
        pc = (-w / 2 + 6, -h / 2 - 3)               # padlock on the top-left corner
        lx, ly = pc
        pin = pivot(pc, [
            group([ell((lx, ly + 3), (3.6, 3.6)), fill(INK)], "lock-hole"),
            group([rect((lx, ly + 3), (16, 13), 3), fill(CORAL), stroke(INK, 2.6)], "lock-body"),
            group([path([(lx - 4.5, ly - 3), (lx - 4.5, ly - 7), (lx, ly - 11.5), (lx + 4.5, ly - 7),
                         (lx + 4.5, ly - 3)], k=0.3), stroke(INK, 3)], "lock-shackle"),
        ], "lock", s=seq(sc(100), [(SHRINK, SHRINK + 10, sc(0), IN)]
                          + pop_moves(PIN_AT, over=140)))
        items.insert(0, pin)

    a = ASSESS[k]
    if k == STAYER:
        scl = seq(sc(100), [(a, a + 5, sc(110), OUT), (a + 5, a + 11, sc(100), INOUT)])
    else:
        d = POP_IN[k]
        s0 = SHRINK + (d - 32) // 2
        scl = seq(sc(100), [(s0, s0 + 12, sc(0), IN),
                            (d, d + 12, sc(100), SPRING),
                            (a, a + 5, sc(110), OUT), (a + 5, a + 11, sc(100), INOUT)])
    pos = sampled(lambda f: _r(unit_pos(k, f)))
    return group(items, "unit%d" % k, tr(p=pos, s=scl))


def links():
    out = []
    for a, b in DEPS:
        def shape(f, a=a, b=b):
            pa, pb = _r(unit_pos(a, f)), _r(unit_pos(b, f))
            return {"i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [pa, pb], "c": False}
        sh = {"ty": "sh", "ix": 1, "nm": "link", "hd": False, "ks": sampled(shape)}
        out.append(group([sh, stroke(INK, 3)], "dep%d%d" % (a, b)))
    return group(out, "links", tr(o=seq(100, [(SHRINK, SHRINK + 8, 0, LIN),
                                             (44, 52, 100, LIN)])))


def slots():
    items = []
    for k, c in list(enumerate(SLOTS)) + [(k, DEST[k]) for k in DEST]:
        items.append(rect(c, UNIT_S, 6))
    return group(items + [dashed(stroke(INK, 2.5, o=40), 5, 4)], "slots")


def pips():
    out = []
    for i, (p, k) in enumerate(zip(PIPS, (0, 1, 3))):
        t = MOVES[k][1]
        out.append(group(
            [ell(p, (11, 11)),
             fill(seq(SUN, [(SHRINK, SHRINK + 8, PAPER, LIN), (t, t + 4, SUN, LIN)])),
             stroke(INK, 2.4)],
            "pip%d" % i, tr(a=p, p=p, s=seq(sc(100), pop_moves(t, over=140)))))
    out.append(group([line(PIPS[0], PIPS[-1]), stroke(INK, 2.6)], "pip-line"))
    return out


def _spark(c, rad, t):
    return group([sparkle(c, rad), fill(CITRUS), stroke(INK, 1.8)], "spark",
                 tr(a=c, p=c, s=seq(sc(0), [(t, t + 6, sc(130), SPRING),
                                            (t + 6, t + 12, sc(100), LIN),
                                            (t + 12, t + 22, sc(0), IN)])))


def sparks():
    return [_spark((338, 70), 5, SPARKS),
            _spark((228, 46), 4, SPARKS + 4),
            _spark((346, 92), 3.5, SPARKS + 8)]


def build():
    return wide_comp("plan", [
        layer("sparks", sparks()),
        layer("units", [unit(0), unit(1), unit(3), unit(2)]),
        layer("links", [links()]),
        layer("slots", [slots()]),
        layer("pips", pips()),
        layer("rack", panel(RACK_C, RACK_S, r=12, fc=PAPER, sw=3.5, sh=5, name="rack")),
        layer("cloud", cloud_panel()),
    ])
