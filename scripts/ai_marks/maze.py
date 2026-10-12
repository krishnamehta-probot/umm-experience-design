"""
AI STRATEGY & ADVISORY -- finding the right path.

A real maze (7 x 3 cells) with a closed outer wall, one entrance on the left
and the goal inside the top-right cell. The dot tries a dead-end branch,
hits the end (cross pops, dot shakes), comes back, then runs the one correct
route while the ink line draws behind it. The flag goes up on arrival.

Frame 0 is the finished picture: route shown, dot beside the flag in the goal.
"""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (
    v, kf, _prop, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI, LILAC,
    OUT, INOUT, IN, SPRING, LIN, OP, FPS, WW, WH,
    sc, seq, pop_moves, travel, smooth, layer, wide_comp, pivot,
    panel, bar, dashed, cubic, check, sparkle, _shape, Track,
)

RED = [0.85, 0.35, 0.38, 1]     # deeper red for the dead-end trail and the cross


# --- geometry ----------------------------------------------------------------
# Maze: 7 columns x 3 rows, from (30, 20) to (330, 158). Cell (c, r) centre:

NC, NR = 7, 3
X0, CW = 30, 300 / 7            # left edge, cell width (42.86)
Y0, CH = 20, 46                 # top edge, cell height
X_END = X0 + NC * CW            # 330
Y_END = Y0 + NR * CH            # 158


def cx(c):
    return X0 + CW * (c + 0.5)


def cy(r):
    return Y0 + CH * (r + 0.5)


def cc(c, r):
    return (round(cx(c), 2), round(cy(r), 2))


ENTRANCE = (0, 1)               # left wall, middle row (gap)
GOAL = (6, 0)                   # top-right cell, inside the maze

# A spanning tree of the 21 cells: exactly one path between any two cells.
# Correct route: entrance -> (1,1) -> (1,2) -> (2,2) -> (3,2) -> (3,1) -> (4,1)
#                -> (4,0) -> (5,0) -> goal (6,0).
# Dead-end branch, off the route in the first third: (1,1) -> (1,0) -> (2,0) -> (2,1).
OPEN = {frozenset(p) for p in [
    # correct route
    ((0, 1), (1, 1)), ((1, 1), (1, 2)), ((1, 2), (2, 2)), ((2, 2), (3, 2)),
    ((3, 2), (3, 1)), ((3, 1), (4, 1)), ((4, 1), (4, 0)), ((4, 0), (5, 0)),
    ((5, 0), (6, 0)),
    # dead-end branch
    ((1, 1), (1, 0)), ((1, 0), (2, 0)), ((2, 0), (2, 1)),
    # short spurs so every cell is reachable
    ((0, 1), (0, 0)), ((1, 2), (0, 2)), ((2, 0), (3, 0)), ((5, 0), (5, 1)),
    ((3, 2), (4, 2)), ((4, 2), (5, 2)), ((5, 2), (6, 2)), ((6, 2), (6, 1)),
]}

S = cc(-0.5, 1)                 # start, just outside the entrance (30, 89)
G_DOT = (round(cx(6), 2), 47)   # frame-0 dot position, centred in the goal cell (flag rides on it)
D_END = (round(cx(2), 2), round(cy(1) - 6, 2))    # dead-end resting spot
X_CROSS = (round(cx(2), 2), round(cy(1) + 12, 2)) # cross, below the dead-end dot

ROUTE = [S, cc(0, 1), cc(1, 1), cc(1, 2), cc(2, 2), cc(3, 2), cc(3, 1),
         cc(4, 1), cc(4, 0), cc(5, 0), G_DOT]
DEAD = [S, cc(0, 1), cc(1, 1), cc(1, 0), cc(2, 0), D_END]

FLAG_POLE_X = 316
FLAG_TOP = (FLAG_POLE_X, 28)


def _walls():
    segs = []
    # vertical grid lines x = X0 + CW*c, between (c-1, r) and (c, r)
    for c in range(NC + 1):
        for r in range(NR):
            if (c, r) == ENTRANCE:
                continue
            a = (c - 1, r) if c > 0 else None
            b = (c, r) if c < NC else None
            if a and b and frozenset((a, b)) in OPEN:
                continue
            x = X0 + CW * c
            segs.append(((x, Y0 + CH * r), (x, Y0 + CH * (r + 1))))
    # horizontal grid lines y = Y0 + CH*r, between (c, r-1) and (c, r)
    for r in range(NR + 1):
        for c in range(NC):
            a = (c, r - 1) if r > 0 else None
            b = (c, r) if r < NR else None
            if a and b and frozenset((a, b)) in OPEN:
                continue
            y = Y0 + CH * r
            segs.append(((X0 + CW * c, y), (X0 + CW * (c + 1), y)))
    return segs


# --- motion helpers -----------------------------------------------------------

def _straight(pts):
    """Straight segments as cubics, so Track's arc length is the polyline length."""
    segs = []
    for p, q in zip(pts, pts[1:]):
        a = (p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3)
        b = (p[0] + 2 * (q[0] - p[0]) / 3, p[1] + 2 * (q[1] - p[1]) / 3)
        segs.append((p, a, b, q))
    return segs


TR_ROUTE = Track(_straight(ROUTE))
TR_DEAD = Track(_straight(DEAD))


def _lerp(a, b, u):
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)


def _r(p):
    return [round(p[0], 2), round(p[1], 2)]


def _sampled(fn):
    """Keys every 2 frames (all phase edges are even), linear between them.
    The dot and the trim lines are both driven by the same arc-length
    samples, so the head of the ink line stays on the dot."""
    return kf([(f, fn(f), LIN) for f in range(0, OP + 1, 2)])


def _dot_pos(f):
    if f <= 12:
        return G_DOT
    if f <= 28:                                   # quick jump back to the entrance
        return _lerp(G_DOT, S, smooth((f - 12) / 16))
    if f <= 32:
        return S
    if f <= 80:                                   # into the dead end
        return TR_DEAD.at(TR_DEAD.total * smooth((f - 32) / 48))
    if f <= 96:
        return D_END
    if f <= 124:                                  # back out to the entrance
        return TR_DEAD.at(TR_DEAD.total * (1 - smooth((f - 96) / 28)))
    if f <= 126:
        return S
    if f <= 190:                                  # the correct route
        return TR_ROUTE.at(TR_ROUTE.total * smooth((f - 126) / 64))
    return G_DOT


def _route_e(f):
    if f <= 12:
        return 100
    if f <= 28:
        return 100 * (1 - smooth((f - 12) / 16))
    if f <= 126:
        return 0
    if f <= 190:
        return 100 * smooth((f - 126) / 64)
    return 100


def _trail_e(f):
    if f <= 32:
        return 0
    if f <= 80:
        return 100 * smooth((f - 32) / 48)
    if f <= 96:
        return 100
    if f <= 124:
        return 100 * (1 - smooth((f - 96) / 28))
    return 0


# --- drawing -------------------------------------------------------------------

def _board():
    return panel((180, 89), (332, 154), r=14, fc=PAPER, sw=3.5, sh=5, name="board")


def _goal_square():
    gx, gy = cc(*GOAL)
    return group([rect((gx, gy), (CW - 12, CH - 12), 6), fill(CITRUS)], "goal")


def _walls_group():
    lines = [line(a, b) for a, b in _walls()]
    return group([*lines, stroke(INK, 5)], "walls")


def _route_group():
    return group([
        path(ROUTE, k=0),
        trim(e=_sampled(_route_e)),
        dashed(stroke(INK, 4), 2, 9),
    ], "route")


def _trail_group():
    return group([
        path(DEAD, k=0),
        trim(e=_sampled(_trail_e)),
        dashed(stroke(RED, 4), 2, 9),
    ], "trail")


def _dot_group():
    shake = seq([0, 0], [(80, 83, [4, 0], INOUT), (83, 86, [-4, 0], INOUT),
                         (86, 89, [4, 0], INOUT), (89, 92, [-4, 0], INOUT),
                         (92, 96, [0, 0], INOUT)])
    # the flag rides on the dot: a pole rises from its top when it arrives
    pole = group([line((0, -10), (0, -22)), stroke(INK, 3)], "pole")
    cloth = group([path([(0, -22), (14, -17), (0, -12)], closed=True, k=0),
                   fill(CORAL), stroke(INK, 2.5)], "cloth")
    flag = group([pole, cloth], "flag", tr(
        a=(0, -10), p=(0, -10),
        s=seq([100, 100], [(12, 26, [100, 0], IN), (190, 206, [100, 100], SPRING)])))
    eye_l = group([ell((-2, -1.5), (3.6, 3.6)), fill(INK)], "eye-l")
    eye_r = group([ell((2, -1.5), (3.6, 3.6)), fill(INK)], "eye-r")
    body = group([ell((0, 0), (17, 17)), fill(CITRUS), stroke(INK, 3)], "body")
    inner = group([eye_l, eye_r, flag, body], "dot-body", tr(p=shake))
    return group([inner], "dot", tr(p=_sampled(lambda f: _r(_dot_pos(f)))))


def _star_group():
    """Target star in the goal cell: visible while the dot is away, fades as it arrives."""
    c = cc(*GOAL)
    return group([path(_star_pts(c, 6), closed=True, k=0), stroke(INK, 2)], "star",
                 tr(o=seq(0, [(30, 40, 100, OUT), (176, 190, 0, LIN)])))


def _star_pts(c, rad):
    x, y = c
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2
        rr = rad if i % 2 == 0 else rad * 0.3
        pts.append((round(x + rr * math.cos(a), 2), round(y + rr * math.sin(a), 2)))
    return pts


def _cross_group():
    x, y = X_CROSS
    d = 4

    def strokes():
        return [line((x - d, y - d), (x + d, y + d)),
                line((x + d, y - d), (x - d, y + d))]
    coral = group([*strokes(), stroke(RED, 3.2)], "cross-red")
    ink = group([*strokes(), stroke(INK, 5.6)], "cross-ink")
    return pivot(X_CROSS, [coral, ink], "cross",
                 s=seq(sc(0), [(80, 90, sc(130), SPRING),
                               (90, 98, sc(100), LIN),
                               (98, 116, sc(0), IN)]))


def _flag_group():
    fx, fy = FLAG_TOP
    cloth = group([path([(fx, fy), (fx + 10, fy + 5), (fx, fy + 10)], closed=True, k=0),
                   fill(CORAL), stroke(INK, 2.5)], "cloth")
    pole = group([line((fx, fy + 30), (fx, fy)), stroke(INK, 3)], "pole")
    flag = group([cloth], "flag", tr(
        a=FLAG_TOP, p=FLAG_TOP,
        s=seq([100, 100], [(12, 26, [100, 0], IN), (190, 206, [100, 100], SPRING)]),
        r=seq(0, [(190, 196, -6, OUT), (196, 204, 0, INOUT)])))
    return [flag, pole]


def _spark(c, rad, t):
    return group([sparkle(c, rad), fill(CITRUS), stroke(INK, 1.6)], "spark",
                 tr(a=c, p=c, s=seq(sc(0), [(t, t + 6, sc(130), SPRING),
                                            (t + 6, t + 12, sc(100), LIN),
                                            (t + 12, t + 20, sc(0), IN)])))


def _sparks():
    return [_spark((337, 22), 3.5, 194),
            _spark((337, 46), 3, 198),
            _spark((322, 16), 3, 202)]


# --- scene -----------------------------------------------------------------------

def build():
    return wide_comp("strategy", [
        layer("sparks", _sparks()),
        layer("dot", [_dot_group()]),
        layer("cross", [_cross_group()]),
        layer("trail", [_trail_group()]),
        layer("route", [_route_group()]),
        layer("star", [_star_group()]),
        layer("walls", [_walls_group()]),
        layer("goal", [_goal_square()]),
        layer("board", _board()),
    ])
