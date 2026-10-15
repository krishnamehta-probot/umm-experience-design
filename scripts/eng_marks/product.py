"""
Card 01 -- Web, mobile & product engineering: two screens, one service.

A browser panel on the left and a phone panel on the right, wired to a small
lilac server between them; an empty dashed parts tray sits under the server.
The screens are built from component blocks: a sky header bar, pastel cards
and a citrus button on each. The blocks pop out of the parts tray one by one
and arc into their slots, the wires draw out from the server and its lights
come on, a cursor presses the browser's button, a dot runs browser -> server
-> phone, and the phone gets its mint check.

Frame 0 is the finished picture: both screens complete, both wired to the
server, the lights on, the phone's check up.

Beats (30 fps, loop 240):
  0-14    rest on the finished picture
  14-34   the blocks shrink away, the wires retract, the lights and the
          check go out
  38-124  seven blocks leave the tray in turn (every 10 frames) and land in
          their slots
  128-144 the wires draw out from the server, the lights come on (142)
  148-176 the cursor comes in and presses the browser's button (164-172)
  176-200 a dot runs browser -> server -> phone; the server blinks (186)
  200     the phone's button pops, its check pops (204)
  204-240 the cursor leaves; hold on the finished picture

Build and check:  python scripts/build_eng_service_marks.py product
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    kf, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, SUN, MINT, LILAC,
    OUT, INOUT, IN, SPRING, LIN, OP,
    sc, seq, pop_moves, smooth, layer, wide_comp, pivot,
    panel, bar, dashed, cubic, check, Track,
)

# --- geometry ------------------------------------------------------------------

B_C, B_S = (98, 88), (152, 120)            # browser: x 22-174, y 28-148
B_R = B_C[0] + B_S[0] / 2                  # 174
P_C, P_S = (300, 88), (64, 120)            # phone: x 268-332
P_L = P_C[0] - P_S[0] / 2                  # 268
S_C, S_S = (221, 58), (40, 50)             # server: x 201-241, y 33-83
S_L, S_R = S_C[0] - S_S[0] / 2, S_C[0] + S_S[0] / 2
WIRE_Y = 58
TRAY = (221, 128)
TRAY_S = (58, 34)
CHECK_C = (P_C[0] + P_S[0] / 2 - 4, 30)

# the component blocks: (name, centre, size, fill, frame it leaves the tray)
PARTS = [
    ("b-head", (98, 66), (130, 14), SKY, 38),
    ("p-head", (300, 54), (46, 12), SKY, 48),
    ("b-card1", (66, 98), (60, 34), BLOSSOM, 58),
    ("b-card2", (131, 98), (60, 34), SUN, 68),
    ("p-card", (300, 88), (46, 42), BLOSSOM, 78),
    ("b-btn", (64, 131), (56, 16), CITRUS, 88),
    ("p-btn", (300, 128), (46, 16), CITRUS, 98),
]
SHRINK = 14
FLY = 26                                   # tray -> slot
WIRES_ON = (128, 144)
LIGHTS_ON = 142
PRESS = 164
DOT = [(176, 186), (192, 200)]             # browser -> server, server -> phone
BLINK = 186
LANDED = 200
CHECK_AT = 204


def _r(p):
    return [round(p[0], 2), round(p[1], 2)]


def sampled(fn):
    """Keys every 2 frames, linear, with the holds collapsed to their ends."""
    pts = [(f, fn(f)) for f in range(0, OP + 1, 2)]
    keep = [pts[0]]
    for i in range(1, len(pts) - 1):
        if not (pts[i][1] == pts[i - 1][1] == pts[i + 1][1]):
            keep.append(pts[i])
    keep.append(pts[-1])
    return kf([(f, val, LIN) for f, val in keep])


def flight(slot):
    """An arc up out of the tray and down into the slot."""
    tx, ty = TRAY
    sx, sy = slot
    return Track([((tx, ty), (tx, ty - 46), (sx, sy - 40), (sx, sy))])


# --- drawing: the screens, the server, the tray --------------------------------

def browser():
    x0 = B_C[0] - B_S[0] / 2
    y0 = B_C[1] - B_S[1] / 2
    dots = group([ell((x0 + 13 + 10 * i, y0 + 11), (6.5, 6.5)) for i in range(3)]
                 + [fill(INK, 88)], "dots")
    url = bar((x0 + 96, y0 + 11), (66, 6), o=30)
    rule = group([line((x0 + 2, y0 + 22), (B_R - 2, y0 + 22)), stroke(INK, 3)], "rule")
    side = bar((128, 131), (44, 6), o=40)
    return [dots, url, rule, side,
            *panel(B_C, B_S, r=12, fc=PAPER, sw=3.5, sh=5, name="browser")]


def phone():
    x, y0 = P_C[0], P_C[1] - P_S[1] / 2
    notch = bar((x, y0 + 10), (18, 5))
    return [notch, *panel(P_C, P_S, r=14, fc=PAPER, sw=3.5, sh=5, name="phone")]


def server():
    x, y = S_C
    lx = S_L + 11
    lights = []
    for i, ly in enumerate((y - 12, y + 12)):
        c = seq(MINT, [(SHRINK + 4, SHRINK + 8, PAPER, LIN),
                       (LIGHTS_ON + 2 * i, LIGHTS_ON + 2 * i + 4, MINT, LIN)])
        s = seq(sc(100), pop_moves(LIGHTS_ON + 2 * i, over=140) + pop_moves(BLINK, over=150))
        lights.append(group([ell((lx, ly), (9, 9)), fill(c), stroke(INK, 2.2)], "light%d" % i,
                            tr(a=(lx, ly), p=(lx, ly), s=s)))
    bars = [bar((x + 6, y - 12), (16, 5)), bar((x + 6, y + 12), (16, 5))]
    split = group([line((S_L + 2, y), (S_R - 2, y)), stroke(INK, 2.6)], "split")
    blink = seq(sc(100), pop_moves(BLINK, over=112, up=6, down=6))
    return [pivot(S_C, [*lights, *bars, split,
                        *panel(S_C, S_S, r=8, fc=LILAC, sw=3.5, sh=4, name="server")],
                  "server", s=blink)]


def tray():
    return group([rect(TRAY, TRAY_S, 9), dashed(stroke(INK, 2.5, o=45), 5, 4)], "tray")


def wires():
    out = []
    ends = [((S_L, WIRE_Y), (B_R, WIRE_Y)), ((S_R, WIRE_Y), (P_L, WIRE_Y))]
    for i, (a, b) in enumerate(ends):
        e = seq(100, [(SHRINK + 2, SHRINK + 14, 0, IN),
                      (WIRES_ON[0] + 2 * i, WIRES_ON[1] - 4 + 2 * i, 100, OUT)])
        out.append(group([line(a, b), trim(e=e), stroke(INK, 3)], "wire%d" % i))
    return out


# --- drawing: the blocks --------------------------------------------------------

def _block_items(name, c, size, colour):
    x, y = c
    w, h = size
    items = []
    if name == "b-head":
        items = [bar((x - 40, y), (34, 5)), bar((x + 44, y), (22, 5), o=40)]
    elif name == "p-head":
        items = [bar((x - 6, y), (22, 4))]
    elif name in ("b-card1", "b-card2"):
        items = [group([ell((x - 16, y - 4), (14, 14)), fill(PAPER), stroke(INK, 2.2)], "pic"),
                 bar((x + 8, y - 6), (20, 5)), bar((x + 4, y + 8), (36, 5), o=40)]
    elif name == "p-card":
        items = [group([ell((x, y - 6), (16, 16)), fill(PAPER), stroke(INK, 2.2)], "pic"),
                 bar((x, y + 12), (28, 5))]
    else:                                    # buttons
        items = [bar((x, y), (w * 0.42, 5))]
    return items + [group([rect(c, size, min(h / 2, 7)), fill(colour), stroke(INK, 2.6)], "body")]


def block(i, name, c, size, colour, t):
    trk = flight(c)
    down = SHRINK + 2 * i
    gone = down + 10
    lift, land = t + 6, t + 6 + FLY

    def pos(f):
        if f <= gone or f >= land:
            return _r(c)
        if f <= lift:
            return _r(TRAY)
        u = (f - lift) / FLY
        return _r(trk.at(trk.total * smooth(u)))

    moves = [(down, gone, sc(0), IN),
             (t, lift, sc(46), OUT),
             (lift, land, sc(100), INOUT),
             (land, land + 6, sc(108), OUT), (land + 6, land + 12, sc(100), INOUT)]
    if name == "b-btn":                      # the press
        moves += [(PRESS, PRESS + 4, sc(90), IN), (PRESS + 4, PRESS + 12, sc(100), SPRING)]
    if name == "p-btn":                      # the dot lands
        moves += pop_moves(LANDED, over=116, up=6, down=8)
    return group(_block_items(name, c, size, colour), name,
                 tr(a=c, p=sampled(pos), s=seq(sc(100), moves)))


# --- drawing: the press, the dot, the check -------------------------------------

def cursor():
    tip = (68, 131)                          # on the browser's button
    pts = [(0, 0), (0, 19), (5, 14.5), (8.6, 22), (12.4, 20.4), (8.8, 13), (15, 13)]
    shape = [(tip[0] + x, tip[1] + y) for x, y in pts]
    arrow = group([path(shape, closed=True, k=0), fill(PAPER), stroke(INK, 2.4)], "arrow")
    p = seq([tip[0] + 34, tip[1] + 30],
            [(148, 162, list(tip), OUT), (206, 220, [tip[0] + 34, tip[1] + 30], IN)])
    s = seq(sc(0), [(146, 154, sc(100), OUT), (PRESS, PRESS + 4, sc(86), IN),
                    (PRESS + 4, PRESS + 12, sc(100), SPRING), (206, 216, sc(0), IN)])
    return group([arrow], "cursor", tr(a=tip, p=p, s=s))


def dot():
    (a0, a1), (b0, b1) = DOT
    p0, p1 = (B_R - 10, WIRE_Y), (S_C[0], WIRE_Y)
    p2 = (P_L + 10, WIRE_Y)

    def pos(f):
        if f <= a0:
            return _r(p0)
        if f <= a1:
            u = smooth((f - a0) / (a1 - a0))
            return _r((p0[0] + (p1[0] - p0[0]) * u, WIRE_Y))
        if f <= b0:
            return _r(p1)
        if f <= b1:
            u = smooth((f - b0) / (b1 - b0))
            return _r((p1[0] + (p2[0] - p1[0]) * u, WIRE_Y))
        return _r(p2) if f <= b1 + 2 else _r(p0)

    s = seq(sc(0), [(a0, a0 + 2, sc(100), LIN), (b1, b1 + 2, sc(0), LIN)])
    return group([group([ell((0, 0), (12, 12)), fill(SUN), stroke(INK, 2.6)], "dot")],
                 "dot", tr(p=sampled(pos), s=s))


def phone_check():
    c = CHECK_C
    return pivot(c, [check(c, 11, 3),
                     group([ell(c, (22, 22)), fill(MINT), stroke(INK, 2.8)], "disc")],
                 "phone-check",
                 s=seq(sc(100), [(SHRINK, SHRINK + 10, sc(0), IN)] + pop_moves(CHECK_AT, over=136)))


def build():
    blocks = [block(i, n, c, s, col, t) for i, (n, c, s, col, t) in enumerate(PARTS)]
    return wide_comp("build", [
        layer("check", [phone_check()]),
        layer("cursor", [cursor()]),
        layer("blocks", blocks[::-1]),          # later blocks fly over earlier ones
        layer("server", server()),
        layer("browser", browser()),
        layer("phone", phone()),
        layer("dot", [dot()]),
        layer("wires", wires()),
        layer("tray", [tray()]),
    ])
