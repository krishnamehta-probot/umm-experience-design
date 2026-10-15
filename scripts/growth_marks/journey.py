"""
Card 04 -- Conversion & customer lifecycle: a smooth path, and a reason to
come back.

Three stage cards stand over a road: a visit (sky, a page and a cursor), an
enquiry (blossom, a cart) and a purchase (citrus, a mint check). A customer
dot walks the road from stage to stage. Between the cart and the purchase a
coral bump of friction rises; the dot stalls at its foot and shakes, a coral
alert pops, then the bump is smoothed flat (a sparkle) and the dot rolls on
to the purchase, whose check pops. From there it takes the curved return
arrow under the road back to the cart for a repeat order, walks to the
purchase again, and a loyalty heart pops on the return loop.

Frame 0 is the finished picture: a flat road, the dot resting at the
purchase, the return loop drawn with its arrowhead and heart.

Beats (30 fps, loop 240):
  0-12    rest on the finished picture
  12-26   the heart, the return loop, its arrowhead and the purchase check
          clear; the dot shrinks away; the coral bump rises (16-30)
  26-40   the dot pops in at the visit card
  38-62   walks to the cart (nudge at 62)
  68-82   walks on and brakes at the bump's foot
  82-108  stuck: it shakes, the coral alert pops and clears
  96-112  the bump smooths flat; a sparkle (106-132)
  110-130 the dot rolls on to the purchase; the check pops (130)
  136-164 back round the return loop, drawing it; arrowhead (162), cart (164)
  168-188 to the purchase again (nudge at 188)
  192     the loyalty heart pops
  210-240 rest

Build and check:  python scripts/build_growth_service_marks.py journey
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    v, kf, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT,
    OUT, INOUT, IN, SPRING, LIN, OP,
    sc, seq, pop_moves, smooth, layer, wide_comp, pivot,
    panel, bar, check, sparkle, _shape, Track,
)

# --- geometry ------------------------------------------------------------------

SHIFT = (0, -6)                           # every layer sits 6 px higher, to centre
ROAD_Y = 108
CARD_Y = 54
CARD_S = (68, 52)
XS = [60, 180, 300]                       # visit, cart, purchase
FILLS = [SKY, BLOSSOM, CITRUS]
ROAD_L = 34

BUMP = (222, 240, 258)                    # the friction bump: foot, peak, foot
BUMP_UP = 88                              # its peak's height when it is up
STUCK_X = 207                             # where the dot brakes, at the foot
BANG_C = (240, 70)
SPARK_C = (240, 92)

DOT = 22
VISIT, CART, PUR = [(x, ROAD_Y) for x in XS]
STUCK = (STUCK_X, ROAD_Y)

# the return loop: down out of the purchase, under the road, up into the cart
LOOP_Y0 = 120
LOOP = (( XS[2], LOOP_Y0), (XS[2], 172), (XS[1], 172), (XS[1], LOOP_Y0))
HEART_C = (240, 159)


def straight(p, q):
    return (p, (p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3),
            (p[0] + 2 * (q[0] - p[0]) / 3, p[1] + 2 * (q[1] - p[1]) / 3), q)


LOOP_TRACK = Track([straight(PUR, LOOP[0]), LOOP, straight(LOOP[3], CART)])
ARC_TRACK = Track([LOOP])

# --- timing --------------------------------------------------------------------

CLEAR = 12
POP_IN = 26
WALK1 = (38, 62)                          # visit -> cart
WALK2 = (68, 82)                          # cart -> the bump's foot
SHAKE = (84, 96)
FLATTEN = (98, 112)
WALK3 = (110, 130)                        # foot -> purchase
LOOP_T = (136, 164)                       # purchase -> round the loop -> cart
WALK4 = (168, 188)                        # cart -> purchase
HEART_AT = 192


def _r(p):
    return [round(p[0], 2), round(p[1], 2)]


def _lerp(p, q, u):
    return (p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u)


def sampled(fn):
    """Keys every 2 frames, linear, with the holds collapsed to their ends."""
    pts = [(f, fn(f)) for f in range(0, OP + 1, 2)]
    keep = [pts[0]]
    for i in range(1, len(pts) - 1):
        if not (pts[i][1] == pts[i - 1][1] == pts[i + 1][1]):
            keep.append(pts[i])
    keep.append(pts[-1])
    return kf([(f, val, LIN) for f, val in keep])


def _loop_u(fr):
    t0, t1 = LOOP_T
    return smooth(min(1, max(0, (fr - t0) / (t1 - t0))))


def dot_pos(fr):
    if fr <= CLEAR + 10:
        return _r(PUR)
    if fr <= WALK1[0]:
        return _r(VISIT)
    if fr <= WALK1[1]:
        return _r(_lerp(VISIT, CART, smooth((fr - WALK1[0]) / (WALK1[1] - WALK1[0]))))
    if fr <= WALK2[0]:
        return _r(CART)
    if fr <= WALK2[1]:
        u = (fr - WALK2[0]) / (WALK2[1] - WALK2[0])
        return _r(_lerp(CART, STUCK, 1 - (1 - u) ** 2))          # brakes into the foot
    if SHAKE[0] < fr < SHAKE[1]:
        u = (fr - SHAKE[0]) / (SHAKE[1] - SHAKE[0])
        return _r((STUCK_X + 3.5 * math.sin(u * math.pi * 6) * (1 - u), ROAD_Y))
    if fr <= WALK3[0]:
        return _r(STUCK)
    if fr <= WALK3[1]:
        return _r(_lerp(STUCK, PUR, smooth((fr - WALK3[0]) / (WALK3[1] - WALK3[0]))))
    if fr <= LOOP_T[0]:
        return _r(PUR)
    if fr <= LOOP_T[1]:
        return _r(LOOP_TRACK.at(LOOP_TRACK.total * _loop_u(fr)))
    if fr <= WALK4[0]:
        return _r(CART)
    if fr <= WALK4[1]:
        return _r(_lerp(CART, PUR, smooth((fr - WALK4[0]) / (WALK4[1] - WALK4[0]))))
    return _r(PUR)


def arc_end(fr):
    """The return loop's trim end: it erases at the start, then draws behind
    the dot as the dot runs round it."""
    if fr <= CLEAR + 2:
        return [100]
    if fr <= CLEAR + 14:
        u = (fr - CLEAR - 2) / 12
        return [round(100 * (1 - u * u), 2)]
    if fr <= LOOP_T[0]:
        return [0]
    if fr <= LOOP_T[1]:
        # how far along the arc proper the dot is (the track has short stubs
        # either side of it)
        s = LOOP_TRACK.total * _loop_u(fr)
        stub = math.dist(PUR, LOOP[0])
        return [round(100 * min(1, max(0, (s - stub) / ARC_TRACK.total)), 2)]
    return [100]


# --- drawing: the cards ----------------------------------------------------------

def _visit(x):
    tip = (x + 6, 44)
    cursor = [(0, 0), (0, 17), (4.5, 13), (8, 20), (11, 18.5), (7.5, 12), (13, 12)]
    return [
        group([path([(tip[0] + dx, tip[1] + dy) for dx, dy in cursor], closed=True, k=0),
               fill(PAPER), stroke(INK, 2.6)], "cursor"),
        bar((x - 12, 44), (28, 6)),
        bar((x - 14, 56), (24, 6), o=40),
        bar((x - 10, 68), (32, 6), o=40),
    ]


def _cart(x):
    y = CARD_Y
    return [
        group([ell((x - 5, y + 13), (7, 7)), fill(INK)], "wheelL"),
        group([ell((x + 9, y + 13), (7, 7)), fill(INK)], "wheelR"),
        group([path([(x - 11, y - 9), (x + 18, y - 9), (x + 13, y + 6), (x - 7, y + 6)],
                    closed=True, k=0), fill(PAPER), stroke(INK, 3)], "basket"),
        group([path([(x - 20, y - 14), (x - 14, y - 14), (x - 11, y - 9)], k=0),
               stroke(INK, 3)], "handle"),
    ]


def _purchase(x):
    return [purchase_check(), bar((x, 70), (30, 6), o=40)]


def purchase_check():
    c = (XS[2], 47)
    return pivot(c, [check(c, 11, 3),
                     group([ell(c, (24, 24)), fill(MINT), stroke(INK, 2.8)], "disc")],
                 "check",
                 s=seq(sc(100), [(CLEAR, CLEAR + 8, sc(0), IN)] + pop_moves(WALK3[1], over=132)))


def cards():
    out = []
    nudges = [[POP_IN + 4], [WALK1[1], LOOP_T[1]], [WALK3[1], WALK4[1]]]
    for i, x in enumerate(XS):
        icon = [_visit, _cart, _purchase][i](x)
        moves = []
        for t in nudges[i]:
            moves += pop_moves(t, over=108, up=8, down=8)
        c = (x, CARD_Y)
        out.append(pivot(c, [*icon, *panel(c, CARD_S, r=12, fc=FILLS[i], sw=3.5, sh=5,
                                           name="stage%d" % i)],
                         "card%d" % i, s=seq(sc(100), moves)))
    return out


# --- drawing: the road ---------------------------------------------------------

def _bump_shape(peak):
    a, m, b = BUMP
    return _shape([(a, ROAD_Y), (m, peak), (b, ROAD_Y)], k=0.36)


def road():
    bump = seq(_bump_shape(ROAD_Y), [(16, 30, _bump_shape(BUMP_UP), SPRING),
                                    (FLATTEN[0], FLATTEN[1], _bump_shape(ROAD_Y), INOUT)])
    hump = group([{"ty": "sh", "ix": 1, "nm": "bump", "hd": False, "ks": bump},
                  stroke(INK, 4.5), fill(CORAL)], "bump",
                 tr(o=seq(0, [(14, 16, 100, LIN), (FLATTEN[1], FLATTEN[1] + 2, 0, LIN)])))
    flat = group([line((ROAD_L, ROAD_Y), (XS[2], ROAD_Y)), stroke(INK, 4.5)], "road")
    stubs = group([line((x, CARD_Y + CARD_S[1] / 2 + 2), (x, ROAD_Y - 7)) for x in XS]
                  + [stroke(INK, 3)], "stubs")
    nodes = [group([ell((x, ROAD_Y), (14, 14)), fill(PAPER), stroke(INK, 3)], "stop%d" % i)
             for i, x in enumerate(XS)]
    return [*nodes, hump, flat, stubs]


def alert():
    x, y = BANG_C
    items = [group([rect((x, y - 1.8), (3.2, 7), 1.6), fill(INK)], "bang"),
             group([ell((x, y + 4.6), (3.4, 3.4)), fill(INK)], "bang-dot"),
             group([ell(BANG_C, (20, 20)), fill(CORAL), stroke(INK, 2.6)], "disc")]
    return pivot(BANG_C, items, "alert",
                 s=seq(sc(0), [(SHAKE[0] - 2, SHAKE[0] + 6, sc(120), SPRING),
                               (SHAKE[0] + 6, SHAKE[0] + 12, sc(100), LIN),
                               (FLATTEN[0] + 2, FLATTEN[0] + 10, sc(0), IN)]))


def spark():
    return pivot(SPARK_C, [sparkle(SPARK_C, 10), fill(SUN), stroke(INK, 2.8)], "sparkle",
                 s=seq(sc(0), [(106, 114, sc(120), SPRING), (114, 120, sc(100), LIN),
                               (124, 132, sc(0), IN)]))


# --- drawing: the return loop ----------------------------------------------------

def _cubic_shape(p0, p1, p2, p3):
    return {"ty": "sh", "ix": 1, "nm": "curve", "hd": False,
            "ks": v({"i": [[0, 0], [p2[0] - p3[0], p2[1] - p3[1]]],
                     "o": [[p1[0] - p0[0], p1[1] - p0[1]], [0, 0]],
                     "v": [list(p0), list(p3)], "c": False})}


def return_loop():
    arc = group([_cubic_shape(*LOOP),
                 {"ty": "tm", "s": v(0), "e": sampled(arc_end), "o": v(0), "m": 1,
                  "nm": "trim", "hd": False},
                 stroke(INK, 4)], "loop")
    tx, ty = LOOP[3]
    head_c = (tx, ty + 2)
    head = pivot(head_c, [group([path([(tx - 7, ty + 8), (tx, ty + 1), (tx + 7, ty + 8)], k=0),
                                 stroke(INK, 4)], "chevron")],
                 "arrowhead",
                 s=seq(sc(100), [(CLEAR, CLEAR + 6, sc(0), IN)] + pop_moves(LOOP_T[1] - 2, over=135)))
    return [head, arc]


def _heart(c, s):
    x, y = c
    vs = [(0, -0.18), (0.5, -0.1), (0, 0.45), (-0.5, -0.1)]
    ins = [(-0.1, -0.27), (0, -0.3), (0.2, -0.15), (0, 0.25)]
    outs = [(0.1, -0.27), (0, 0.25), (-0.2, -0.15), (0, -0.3)]
    return {"ty": "sh", "ix": 1, "nm": "heart", "hd": False, "ks": v({
        "v": [[x + a * s, y + b * s] for a, b in vs],
        "i": [[a * s, b * s] for a, b in ins],
        "o": [[a * s, b * s] for a, b in outs],
        "c": True})}


def heart():
    c = HEART_C
    items = [group([_heart((c[0], c[1] - 0.5), 15), fill(BLOSSOM), stroke(INK, 2.4)], "heart"),
             group([ell(c, (28, 28)), fill(SUN), stroke(INK, 3)], "disc"),
             group([ell((c[0] + 2.5, c[1] + 2.5), (28, 28)), fill(INK)], "shadow")]
    return pivot(c, items, "loyalty",
                 s=seq(sc(100), [(CLEAR, CLEAR + 8, sc(0), IN)] + pop_moves(HEART_AT, over=135)))


# --- drawing: the customer -------------------------------------------------------

def customer():
    body = [group([ell((0, 0), (DOT, DOT)), fill(SUN), stroke(INK, 3)], "dot"),
            group([ell((2.5, 2.5), (DOT, DOT)), fill(INK)], "shadow")]
    s = seq(sc(100), [(CLEAR + 2, CLEAR + 10, sc(0), IN),
                      (POP_IN, POP_IN + 8, sc(125), SPRING), (POP_IN + 8, POP_IN + 14, sc(100), LIN)])
    return group(body, "customer", tr(p=sampled(dot_pos), s=s))


def build():
    up = SHIFT
    return wide_comp("develop", [
        layer("alert", [alert(), spark()], p=up),
        layer("customer", [customer()], p=up),
        layer("heart", [heart()], p=up),
        layer("cards", cards(), p=up),
        layer("road", road(), p=up),
        layer("loop", return_loop(), p=up),
    ])
