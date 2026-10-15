"""
Card 02 -- Platform architecture & modernisation: retain, refactor, replace.

One heavy monolith -- a wide paper block with tangled ink lines through most
of it and a coral alert on its corner -- shudders, cracks along two seams
and splits into three blocks that slide apart. Each gets its own decision:

  keep      the left block was already tidy: it turns sky and a padlock
            badge pops on it
  refactor  a citrus sweep runs across the middle block, wiping out the
            tangle and leaving neat skeleton bars on blossom behind it; a
            cycle-arrow badge pops
  replace   the tangled right block slides down and away, a new sun block
            drops in from above with a sparkle

Clean connectors then draw between the three. Frame 0 is the finished
picture: the three modules, badged and connected.

Beats (30 fps, loop 240):
  0-12    rest on the finished picture
  12-28   badges and connectors go, the modules shrink away
  32-50   the monolith pops in; its alert pops (50)
  52-70   it shudders; the seams crack (58-68)
  74-96   it splits: three blocks slide apart
  100     keep: sky, padlock (104)
  108-140 refactor: the sweep (112-136), badge (140)
  148-184 replace: old block out (148-164), new drops in (164-180), sparkle (184)
  190-206 connectors draw
  206-240 hold on the finished picture

Build and check:  python scripts/build_eng_service_marks.py modules
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, pop_moves, layer, wide_comp, pivot,
    bar, check, sparkle, cubic,
)

# --- geometry ------------------------------------------------------------------

Y = 94
COLS = [62, 178, 294]                    # the modules' centres
MS = (88, 78)                            # a module
HW, HH = MS[0] / 2, MS[1] / 2
MONO_C = (178, Y)
MONO_S = (3 * MS[0], MS[1])
ABUT = [COLS[1] - MS[0], COLS[1], COLS[1] + MS[0]]   # the chunks inside the monolith
SEAMS = [COLS[1] - HW, COLS[1] + HW]
SWEEP = (COLS[1] - HW, COLS[1] + HW)

# --- timing --------------------------------------------------------------------

GONE = 29                                # everything is scale 0 by here
MONO_IN = 32
ALERT = 50
CRACK = (58, 68)
SPLIT, PARTED = 74, 96
KEEP = 100
SWEEP_T = (112, 136)
OLD_OUT = (148, 164)
NEW_IN = (164, 180)
WIRE = (190, 204)


def badge_c(x):
    return (x + HW - 4, Y - HH + 4)


# --- drawing: pieces ------------------------------------------------------------

def neat(x):
    return [bar((x - 12, Y - 15), (44, 6)),
            bar((x - 5, Y + 1), (58, 6), o=40),
            bar((x - 15, Y + 16), (38, 6), o=40)]


TANGLES = [
    [(-34, -14), (-22, 18), (-14, -20), (-26, -2), (-4, 14), (2, -20), (-8, 0),
     (14, 18), (20, -18), (8, -4), (30, 12), (34, -16)],
    [(-34, 10), (-18, -18), (-10, 20), (0, -12), (-12, -6), (10, 20), (18, -20),
     (26, 16), (14, 4), (34, -2)],
]


def tangle(x, e=None, flip=False):
    """Scribbles across a block. Each runs right to left, so trimming its end
    away erases it from the left -- the way the sweep travels."""
    items = []
    for i, pts in enumerate(TANGLES):
        pts = [(x + (-px if flip else px), Y + py) for px, py in reversed(pts)]
        shape = path(pts, k=0.5)
        extra = [trim(e=e)] if e is not None else []
        items.append(group([shape, *extra, stroke(INK, 2.6)], "tangle%d" % i))
    return items


def slab(x, fc, o=100, name="block", sh=4):
    """A module's paper: fill, outline and hard shadow, with its own opacity."""
    c = (x, Y)
    return group([group([rect(c, MS, 9), fill(fc), stroke(INK, 3.5)], "body"),
                  group([rect((x + sh, Y + sh), MS, 9), fill(INK)], "shadow")],
                 name, tr(o=o))


def disc_badge(c, glyph, name, s):
    return pivot(c, [*glyph, group([ell(c, (22, 22)), fill(PAPER), stroke(INK, 2.6)], "disc")],
                 name, s=s)


def padlock(c):
    x, y = c
    return [group([ell((x, y + 2.6), (2.6, 2.6)), fill(PAPER)], "hole"),
            group([rect((x, y + 2.6), (11, 8.4), 2), fill(INK)], "body"),
            group([cubic((x - 3.4, y - 1), (x - 3.4, y - 8.4), (x + 3.4, y - 8.4), (x + 3.4, y - 1)),
                   stroke(INK, 2.4)], "shackle")]


def cycle(c):
    """A round arrow, open at the top, its head pointing on round."""
    x, y = c
    r, a1 = 5.2, 210
    pts = [(x + r * math.cos(math.radians(a)), y + r * math.sin(math.radians(a)))
           for a in range(-30, a1 + 1, 30)]
    ex, ey = pts[-1]
    ca, sa = math.cos(math.radians(a1)), math.sin(math.radians(a1))
    dx, dy = -sa, ca                                   # the way round
    head = [(ex + dx * 3.4, ey + dy * 3.4),
            (ex - dx * 1.2 + ca * 3.4, ey - dy * 1.2 + sa * 3.4),
            (ex - dx * 1.2 - ca * 3.4, ey - dy * 1.2 - sa * 3.4)]
    return [group([path(head, closed=True, k=0), fill(INK), stroke(INK, 1.2)], "head"),
            group([path(pts[:-1] + [(ex - dx * 0.8, ey - dy * 0.8)], k=0.3), stroke(INK, 2.4)], "arc")]


# --- drawing: the monolith and its three chunks -------------------------------

def keep_chunk():
    x = COLS[0]
    fc = seq(SKY, [(GONE, GONE + 1, PAPER, LIN), (KEEP, KEEP + 8, SKY, LIN)])
    o = seq(100, [(GONE, GONE + 1, 0, LIN), (SPLIT, SPLIT + 1, 100, LIN)])
    p = seq([x, Y], [(GONE, GONE + 1, [ABUT[0], Y], LIN), (SPLIT + 2, PARTED, [x, Y], INOUT)])
    s = seq(sc(100), [(12, 24, sc(0), IN), (GONE, GONE + 1, sc(100), LIN)]
            + pop_moves(KEEP, over=106, up=6, down=8))
    return group([*neat(x), slab(x, fc, o=o, name="paper")], "keep",
                 tr(a=(x, Y), p=p, s=s))


def refactor_chunk():
    x = COLS[1]
    x0 = SWEEP[0]
    t0, t1 = SWEEP_T
    wipe = seq(0, [(GONE, GONE + 1, 100, LIN), (t0 + 2, t1 - 2, 0, LIN)])
    grow = seq([100, 100], [(GONE, GONE + 1, [0, 100], LIN), (t0, t1, [100, 100], LIN)])
    o = seq(100, [(GONE, GONE + 1, 0, LIN), (SPLIT, SPLIT + 1, 100, LIN)])
    sweep_p = seq([x0, Y], [(t0, t1, [SWEEP[1], Y], LIN), (t1 + 6, t1 + 7, [x0, Y], LIN)])
    sweep_s = seq([100, 0], [(t0 - 4, t0, [100, 100], OUT), (t1, t1 + 5, [100, 0], IN)])
    sweep = group([group([rect((x0, Y), (7, MS[1] + 12), 3.5), fill(CITRUS), stroke(INK, 2.6)],
                         "bar")], "sweep", tr(a=(x0, Y), p=sweep_p, s=sweep_s))
    bars = group(neat(x), "neat", tr(a=(x0, Y), p=(x0, Y), s=grow))
    colour = group([rect((x, Y), MS, 9), fill(BLOSSOM)], "blossom",
                   tr(a=(x0, Y), p=(x0, Y), s=grow))
    outline = group([rect((x, Y), MS, 9), stroke(INK, 3.5)], "outline", tr(o=o))
    paper = group([rect((x, Y), MS, 9), fill(PAPER)], "paper", tr(o=o))
    shadow = group([rect((x + 4, Y + 4), MS, 9), fill(INK)], "shadow", tr(o=o))
    s = seq(sc(100), [(14, 26, sc(0), IN), (GONE, GONE + 1, sc(100), LIN)]
            + pop_moves(t1, over=106, up=6, down=8))
    # the fills sit over the outline's inner half, as in panel()
    return group([sweep, *tangle(x, e=wipe), bars, colour, paper, outline, shadow],
                 "refactor", tr(a=(x, Y), p=(x, Y), s=s))


def old_chunk():
    x = COLS[2]
    o = seq(0, [(GONE, GONE + 1, 100, LIN), (OLD_OUT[0] + 4, OLD_OUT[1], 0, IN)])
    p = seq([ABUT[2], Y], [(SPLIT + 2, PARTED, [x, Y], INOUT),
                           (OLD_OUT[0], OLD_OUT[1], [x, Y + 54], IN),
                           (OLD_OUT[1] + 2, OLD_OUT[1] + 3, [ABUT[2], Y], LIN)])
    po = seq(0, [(SPLIT, SPLIT + 1, 100, LIN)] + [(OLD_OUT[1] + 2, OLD_OUT[1] + 3, 0, LIN)])
    return group([*tangle(x, flip=True), slab(x, PAPER, o=po, name="paper")], "old",
                 tr(a=(x, Y), p=p, o=o))


def monolith():
    x, y = MONO_C
    t0, t1 = CRACK
    crack_e = seq(0, [(t0, t1, 100, OUT), (SPLIT, SPLIT + 1, 0, LIN)])
    cracks = []
    for i, sx in enumerate(SEAMS):
        pts = [(sx, y - HH), (sx - 4, y - 23), (sx + 4, y - 11), (sx - 3, y + 1),
               (sx + 4, y + 13), (sx - 4, y + 25), (sx, y + HH)]
        cracks.append(group([path(pts, k=0), trim(e=crack_e), stroke(INK, 3)], "crack%d" % i))
    bc = (x + MONO_S[0] / 2 - 4, y - HH + 4)
    alert = pivot(bc, [
        group([rect((bc[0], bc[1] - 1.8), (3, 6.6), 1.5), fill(INK)], "bang"),
        group([ell((bc[0], bc[1] + 4.4), (3.2, 3.2)), fill(INK)], "bang-dot"),
        group([ell(bc, (20, 20)), fill(CORAL), stroke(INK, 2.6)], "disc"),
    ], "alert", s=seq(sc(0), pop_moves(ALERT, over=136) + [(SPLIT - 4, SPLIT, sc(0), IN)]))
    o = seq(0, [(GONE, GONE + 1, 100, LIN), (SPLIT, SPLIT + 1, 0, LIN)])
    big = group([group([rect(MONO_C, MONO_S, 12), fill(PAPER), stroke(INK, 3.5)], "body"),
                 group([rect((x + 5, y + 5), MONO_S, 12), fill(INK)], "shadow")],
                "slab", tr(o=o))
    s = seq(sc(100), [(GONE - 1, GONE, sc(0), LIN),
                      (MONO_IN, MONO_IN + 12, sc(105), OUT), (MONO_IN + 12, MONO_IN + 18, sc(100), INOUT)])
    r = seq(0, [(52, 55, -1.6, INOUT), (55, 58, 1.6, INOUT), (58, 61, -1.4, INOUT),
                (61, 64, 1.2, INOUT), (64, 68, 0, INOUT)])
    return group([alert, *cracks, keep_chunk(), refactor_chunk(), old_chunk(), big],
                 "monolith", tr(a=MONO_C, p=MONO_C, s=s, r=r))


def new_block():
    x = COLS[2]
    p = seq([x, Y], [(OLD_OUT[0], OLD_OUT[0] + 1, [x, Y - 150], LIN),
                     (NEW_IN[0], NEW_IN[1], [x, Y], SPRING)])
    s = seq(sc(100), [(16, 28, sc(0), IN), (OLD_OUT[0], OLD_OUT[0] + 1, sc(100), LIN)])
    return group([*neat(x), slab(x, SUN)], "new", tr(a=(x, Y), p=p, s=s))


# --- drawing: badges and connectors -----------------------------------------------

def badges():
    def s(t, d):
        return seq(sc(100), [(12 + d, 20 + d, sc(0), IN)] + pop_moves(t, over=140))
    keep_c, ref_c, new_c = (badge_c(x) for x in COLS)
    return [
        disc_badge(keep_c, padlock(keep_c), "keep-badge", s(KEEP + 4, 0)),
        disc_badge(ref_c, cycle(ref_c), "refactor-badge", s(SWEEP_T[1] + 4, 2)),
        pivot(new_c, [sparkle(new_c, 12), fill(SUN), stroke(INK, 2.8)], "new-badge",
              s=s(NEW_IN[1] + 4, 4)),
    ]


def connectors():
    out = []
    for i in range(2):
        a = (COLS[i] + HW, Y)
        b = (COLS[i + 1] - HW, Y)
        t0 = WIRE[0] + 6 * i
        e = seq(100, [(12, 22, 0, IN), (t0, t0 + 10, 100, OUT)])
        out.append(group([line(a, b), trim(e=e), stroke(INK, 3.5)], "link%d" % i))
        for j, d in enumerate((a, b)):
            t = t0 + 8 * j
            out.append(pivot(d, [group([ell(d, (10, 10)), fill(INK)], "end")], "end%d%d" % (i, j),
                             s=seq(sc(100), [(12, 18, sc(0), IN)] + pop_moves(t, over=150))))
    return out


def build():
    return wide_comp("modernise", [
        layer("badges", badges()),
        layer("connectors", connectors()),
        layer("new", [new_block()]),
        layer("monolith", [monolith()]),
    ])
