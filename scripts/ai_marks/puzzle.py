"""
Card 05, AI integration & modernisation: the missing puzzle piece.

A 2 x 4 grid of jigsaw-style pieces, each with a system icon. The AI piece
(top row, second cell) is lifted out, leaves a dashed slot, flies back in from
the top right, drops into place, and the light spreads out from it.
"""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (
    v, kf, _prop, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, LILAC,
    OUT, INOUT, IN, SPRING, LIN, OP, FPS, WW, WH,
    sc, seq, pop_moves, layer, wide_comp, pivot, sparkle, dashed, cubic, Track,
)


# --- geometry --------------------------------------------------------------
PITCH = 70          # cell pitch
SIDE = 68           # piece side (2 px seams)
R_SQ = 8            # corner radius
KNOB_R = 10         # knob radius


def cx_of(c):
    return 74 + PITCH * c


def cy_of(r):
    return 54 + PITCH * r


def smooth(u):
    u = max(0.0, min(1.0, u))
    return u * u * (3 - 2 * u)


AI_C = (cx_of(1), cy_of(0))          # (144, 54)
SLOT_C = AI_C

# knobs: owner (row, col) -> direction. R = into right neighbour, D = into the one below.
KNOBS_R = {(0, 0), (0, 2), (1, 0), (1, 2)}      # non-AI owners
AI_KNOB_R = True
AI_KNOB_D = True

# wave timing for the seven other pieces (distance from the AI piece, then stagger)
WAVE = {(0, 0): 126, (0, 2): 133, (1, 1): 140, (1, 0): 147,
        (1, 2): 154, (0, 3): 161, (1, 3): 168}
RING1 = {(0, 0), (0, 2), (1, 1)}                # edge neighbours of the AI piece

# frame-0 spark seats around the AI piece, with the wave time each one re-lights
SEATS = [((109, 32), 126), ((179, 32), 133), ((122, 89), 140), ((166, 89), 144)]

PIECE_FILL = {(0, 0): SKY, (0, 2): SUN, (0, 3): BLOSSOM, (1, 0): CITRUS,
              (1, 1): CORAL, (1, 2): MINT, (1, 3): PAPER}


# --- icons (INK, drawn about centre c, roughly 20-26 px) --------------------

def icon_db(c):
    x, y = c
    return [
        group([ell((x, y - 7), (20, 8)), stroke(INK, 2.8)], "db-top"),
        group([line((x - 10, y - 7), (x - 10, y + 7)), stroke(INK, 2.8)], "db-l"),
        group([line((x + 10, y - 7), (x + 10, y + 7)), stroke(INK, 2.8)], "db-r"),
        group([ell((x, y + 7), (20, 8)), stroke(INK, 2.8)], "db-bot"),
    ]


def icon_chat(c):
    x, y = c
    out = [group([rect((x, y - 2), (26, 18), 7), stroke(INK, 2.8)], "bubble")]
    for i, dx in enumerate((-6, 0, 6)):
        out.append(group([ell((x + dx, y - 2), (3.6, 3.6)), fill(INK)], "dot%d" % i))
    return out


def icon_doc(c):
    x, y = c
    out = [group([rect((x, y), (22, 28), 3), stroke(INK, 2.8)], "page")]
    for i, dy in enumerate((-6, 0, 6)):
        out.append(group([line((x - 6, y + dy), (x + 6, y + dy)), stroke(INK, 2.6)], "bar%d" % i))
    return out


def icon_bars(c):
    x, y = c
    return [
        group([rect((x - 7, y + 5), (5, 10), 1.5), fill(INK)], "b1"),
        group([rect((x, y + 2), (5, 16), 1.5), fill(INK)], "b2"),
        group([rect((x + 7, y - 1), (5, 22), 1.5), fill(INK)], "b3"),
    ]


def icon_cloud(c):
    x, y = c
    return [
        group([ell((x - 7, y + 3), (14, 14)), fill(INK)], "c1"),
        group([ell((x + 2, y - 1), (18, 18)), fill(INK)], "c2"),
        group([ell((x + 10, y + 4), (12, 12)), fill(INK)], "c3"),
        group([rect((x + 1, y + 6), (26, 12), 6), fill(INK)], "c4"),
    ]


def icon_gear(c):
    x, y = c
    out = [group([ell((x, y), (16, 16)), stroke(INK, 3)], "ring")]
    for i in range(6):
        a = math.pi / 3 * i
        p0 = (x + 8 * math.cos(a), y + 8 * math.sin(a))
        p1 = (x + 13 * math.cos(a), y + 13 * math.sin(a))
        out.append(group([line(p0, p1), stroke(INK, 4.6)], "tooth%d" % i))
    out.append(group([ell((x, y), (5, 5)), fill(INK)], "hub"))
    return out


def icon_cal(c):
    x, y = c
    out = [group([rect((x, y + 1), (24, 22), 3), stroke(INK, 2.8)], "cal"),
           group([line((x - 12, y - 5), (x + 12, y - 5)), stroke(INK, 2.6)], "calhead")]
    for r, dy in enumerate((3, 8)):
        for k, dx in enumerate((-6, 0, 6)):
            out.append(group([rect((x + dx, y + dy + 1), (3.6, 3.6), 0.8), fill(INK)],
                             "d%d%d" % (r, k)))
    return out


ICONS = {(0, 0): icon_db, (0, 2): icon_chat, (0, 3): icon_doc, (1, 0): icon_bars,
         (1, 1): icon_cloud, (1, 2): icon_gear, (1, 3): icon_cal}


# --- timing helpers -----------------------------------------------------------

def _pos_kf(fn, frames):
    """Position keys sampled from fn(frame) at the given frames (LIN between)."""
    frames = sorted(set(int(f) for f in frames))
    return kf([(f, list(fn(f)), LIN) for f in frames])


def _arc_track():
    return Track([
        ((400, 44), (300, 44), (200, 46), (144, 46)),
    ])


ARC = _arc_track()


def _ai_pos(f):
    if f <= 12:
        return (144, 54)
    if f <= 20:
        s = smooth((f - 12) / 8)
        return (144 + 2 * s, 54 - 84 * s)
    if f <= 30:
        s = smooth((f - 20) / 10)
        return (146 + 254 * s, -30 - 80 * s)
    if f <= 40:
        return (400, 44)
    if f <= 100:
        return ARC.at(ARC.total * smooth((f - 40) / 60))
    if f <= 112:
        return (144, 46 - 4 * math.sin(math.pi * (f - 100) / 12))
    if f <= 124:
        u = (f - 112) / 12
        return (144, 46 + 8 * u * u)
    return (144, 54)


def _spark_fn(seat, t):
    centre = AI_C

    def fn(f):
        if f <= 20:
            return seat
        if f < t:
            return centre
        if f <= t + 8:
            u = smooth((f - t) / 8)
            return (centre[0] + (seat[0] - centre[0]) * u,
                    centre[1] + (seat[1] - centre[1]) * u)
        return seat
    return fn


# --- the pieces -----------------------------------------------------------------

SIDES = {"R": (1, 0), "L": (-1, 0), "B": (0, 1), "T": (0, -1)}

# one knob per shared edge; the owner pokes into the neighbour
OWNED = {
    (0, 0): ["B"],
    (0, 2): ["L", "R"],
    (0, 3): ["B"],
    (1, 1): ["L"],
    (1, 2): ["L", "R", "T"],
}
AI_OWNED = ["L", "B"]


def _knob(c, side, colour):
    """Semicircle knob on the given side of the piece centred at c, base on the edge.
    Drawn as a closed polygon so it can be filled and outlined like the squares."""
    cx, cy = c
    dx, dy = SIDES[side]
    px, py = -dy, dx
    ex, ey = cx + dx * SIDE / 2, cy + dy * SIDE / 2
    pts = []
    for i in range(17):
        t = -math.pi / 2 + math.pi * i / 16
        pts.append((ex + KNOB_R * (math.cos(t) * dx + math.sin(t) * px),
                    ey + KNOB_R * (math.cos(t) * dy + math.sin(t) * py)))
    return group([path(pts, closed=True, k=0), fill(colour), stroke(INK, 3)], "knob-" + side)


def _piece(r, c, colour, icon, knob_r, t, ring1):
    cx, cy = cx_of(c), cy_of(r)
    items = []
    items += ICONS[(r, c)]((cx, cy))
    items.append(group([rect((cx, cy), (SIDE, SIDE), R_SQ), fill(colour), stroke(INK, 3)], "sq"))
    for side in OWNED.get((r, c), []):
        items.append(_knob((cx, cy), side, colour))
    o = seq(100, [(12, 20, 55, OUT), (t, t + 8, 100, OUT)])
    if ring1:
        moves = [(119, 122, sc(104), SPRING), (122, 126, sc(100), LIN)] + pop_moves(t, over=108)
        s = seq(sc(100), moves)
    else:
        s = seq(sc(100), pop_moves(t, over=108))
    return pivot((cx, cy), items, "piece-%d%d" % (r, c), s=s, o=o)


def _ai_piece():
    cx, cy = AI_C
    items = [
        group([sparkle((cx, cy), 22), fill(CITRUS)], "glyph"),
        group([rect((cx, cy), (SIDE, SIDE), R_SQ), fill(INK)], "ai-sq"),
    ]
    for side in AI_OWNED:
        items.append(_knob((cx, cy), side, INK))
    shadow_o = seq(0, [(12, 20, 30, OUT), (100, 106, 25, OUT), (112, 120, 0, IN)])
    items.append(group([rect((cx + 6, cy + 8), (SIDE, SIDE), R_SQ), fill(INK, shadow_o)], "shadow"))
    pos = _pos_kf(_ai_pos, list(range(0, OP + 1, 2)) + [12, 20, 30, 40, 100, 112, 124, OP])
    s = seq(sc(100), [(12, 20, sc(112), OUT), (30, 40, sc(108), LIN),
                      (112, 118, sc(96), IN), (118, 126, sc(100), SPRING)])
    r = seq(0, [(30, 39, -25, LIN), (40, 100, 0, OUT)])
    return group(items, "ai", tr(a=(cx, cy), p=pos, s=s, r=r))


def _slot():
    cx, cy = SLOT_C
    o = seq(0, [(16, 26, 100, OUT), (112, 118, 0, IN)])
    st = dashed(stroke(INK, 2.6, o), 6, 4)
    return group([rect((cx, cy), (SIDE, SIDE), R_SQ), st], "slot")


def _spark(i, seat, t):
    o = seq(100, [(12, 20, 0, LIN), (t, t + 1, 100, LIN)])
    fn = _spark_fn(seat, t)
    frames = [0, 12, 20, 21, t - 1, t, t + 2, t + 4, t + 6, t + 8, OP]
    pos = _pos_kf(fn, frames)
    return group([ell((0, 0), (10, 10)), fill(CITRUS), stroke(INK, 1.8)],
                 "spark%d" % i, tr(a=(0, 0), p=pos, o=o))


def build():
    grid = []
    # top-left to bottom-right so that each knob owner is listed before its socket
    for r in range(2):
        for c in range(4):
            if (r, c) == (0, 1):
                continue
            knob_r = (r, c) in KNOBS_R
            grid.append(_piece(r, c, PIECE_FILL[(r, c)], ICONS[(r, c)], knob_r,
                               WAVE[(r, c)], (r, c) in RING1))

    sparks = [_spark(i, seat, t) for i, (seat, t) in enumerate(SEATS)]

    return wide_comp("integration", [
        layer("sparks", sparks),
        layer("ai", [_ai_piece()]),
        layer("slot", [_slot()]),
        layer("grid", grid),
    ])
