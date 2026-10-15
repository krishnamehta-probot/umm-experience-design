"""
Card 05 -- Quality & security engineering: test it under real demands.

An app window (three window dots in its header) holding a checklist of four
test rows, and a load-gauge card beside it. Frame 0 is the passed run: every
row's box ticked mint, the gauge needle resting in the safe zone, the gauge's
status pill mint.

The ticks clear and the needle drops to idle. A magnifier comes down the
rows and each box ticks as it passes -- until row 3, where the row goes coral
and a bug pops up under the lens and wriggles. The bug is fixed (it shrinks
away in a sparkle), the row clears and ticks, and the magnifier finishes the
last row and leaves. Then the load test: the needle pushes round toward the
coral limit, trembles there while the pill flips coral, and settles back into
the safe zone with the pill mint again.

Beats (30 fps, loop 240):
  0-14    rest on the passed run
  14-30   ticks clear; needle drops to idle
  30-38   magnifier arrives on row 1; tick (42)
  50-58   -> row 2; tick (62)
  68-76   -> row 3; row goes coral, the bug pops (78-88), wriggles (90-102)
  102-114 fixed: bug shrinks in a sparkle, row clears, tick (114)
  122-130 -> row 4; tick (134); magnifier leaves (144-152)
  150-176 load climbs to the limit; pill coral (170); needle trembles (176-190)
  190-210 needle settles in the safe zone; pill mint (200)
  210-240 rest

Build and check:  python scripts/build_eng_service_marks.py testbench
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    ell, rect, path, line, stroke, fill, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI, LILAC,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, pop_moves, layer, wide_comp, pivot, panel, bar, check, sparkle,
)

RED = [0.85, 0.35, 0.38, 1]

APP_C, APP_S = (140, 89), (244, 146)
ROWS = [64, 90, 116, 142]
BOX_X = 46
BAR_W = [70, 54, 78, 60]
RES_X = 226                     # the right-hand result bar
BUG_ROW = 2
LENS_X, LENS_D = 132, 32
LENS = [(LENS_X, y) for y in ROWS]
TICK_AT = [42, 62, 114, 134]

CARD_C, CARD_S = (310, 89), (68, 104)
HUB = (310, 100)
ARC_R = 22
SAFE, IDLE, LIMIT = -42, -80, 60   # needle angles: 0 points straight up
PILL_C = (310, 126)


# --- the app window -----------------------------------------------------------

def _row(i, y):
    t = TICK_AT[i]
    clear = (14 + 2 * i, 22 + 2 * i)
    box_fill = seq(MINT, [(clear[0], clear[1], PAPER, LIN), (t, t + 4, MINT, LIN)])
    bc = (BOX_X, y)
    tick = pivot(bc, [check(bc, 10, w=3)], "tick",
                 s=seq(sc(100), [(clear[0], clear[1], sc(0), IN)] + pop_moves(t, over=140)))
    box = pivot(bc, [group([rect(bc, (17, 17), 4.5), fill(box_fill), stroke(INK, 2.6)], "box")],
                "box", s=seq(sc(100), pop_moves(t, over=114)))
    w = BAR_W[i]
    items = [tick, box, bar((64 + w / 2, y), (w, 6)), bar((RES_X, y), (24, 5), o=30)]
    if i < len(ROWS) - 1:
        items.append(group([line((34, y + 13), (246, y + 13)), stroke(INK, 1.5, o=11)], "rule"))
    return group(items, "row%d" % i)


def _strip():
    """The failing row's coral wash."""
    y = ROWS[BUG_ROW]
    return group([rect((140, y), (220, 22), 6), fill(CORAL)], "strip",
                 tr(o=seq(0, [(76, 82, 100, OUT), (106, 114, 0, OUT)])))


def _app():
    dots = [group([ell((x, 37), (9, 9)), fill(c), stroke(INK, 2)], "dot")
            for x, c in ((40, CORAL), (54, SUN), (68, MINT))]
    head = [*dots, bar((112, 37), (44, 7)), bar((226, 37), (24, 6))]
    return [*head, *panel(APP_C, APP_S, r=14, sw=3.5, sh=5, name="app")]


# --- the magnifier and the bug ------------------------------------------------

def _magnifier():
    x, y = LENS[0]
    r = LENS_D / 2
    d = r * 0.72
    lens = group([ell((x, y), (LENS_D, LENS_D)), fill(PAPER, 55), stroke(INK, 3.4)], "lens")
    handle = group([line((x + d, y + d), (x + d + 10, y + d + 10)), stroke(INK, 5)], "handle")
    pos = seq(list(LENS[0]), [(50, 58, list(LENS[1]), INOUT), (68, 76, list(LENS[2]), INOUT),
                              (122, 130, list(LENS[3]), INOUT), (156, 157, list(LENS[0]), LIN)])
    return pivot((x, y), [lens, handle], "magnifier", p=pos,
                 s=seq(sc(0), [(30, 38, sc(110), SPRING), (38, 42, sc(100), LIN),
                               (144, 152, sc(0), IN)]))


def _bug():
    x, y = c = LENS[BUG_ROW]
    legs = []
    for dy in (-3, 1.5, 6):
        legs += [line((x - 4, y + dy), (x - 9, y + dy - 1.5)),
                 line((x + 4, y + dy), (x + 9, y + dy - 1.5))]
    feelers = [path([(x - 2, y - 7), (x - 4, y - 11), (x - 6.5, y - 12)], k=0.3),
               path([(x + 2, y - 7), (x + 4, y - 11), (x + 6.5, y - 12)], k=0.3)]
    items = [group([line((x, y - 3), (x, y + 8)), stroke(RED, 1.8)], "seam"),
             group([ell((x, y - 6), (8, 7)), fill(RED)], "head"),
             group([ell((x, y + 2.5), (11, 14)), fill(CORAL), stroke(RED, 2.4)], "body"),
             group(legs + feelers + [stroke(RED, 2.2)], "legs")]
    wriggle = seq(0, [(90, 93, 14, INOUT), (93, 96, -14, INOUT), (96, 99, 12, INOUT),
                      (99, 102, 0, INOUT)])
    inner = group(items, "wriggle", tr(a=c, p=c, r=wriggle))
    return pivot(c, [inner], "bug",
                 s=seq(sc(0), [(78, 86, sc(160), SPRING), (86, 92, sc(125), LIN),
                               (102, 110, sc(0), IN)]))


def _fix_spark():
    x, y = LENS[BUG_ROW]
    sparks = []
    for k, (dx, dy, r) in enumerate(((-13, -9, 5), (13, -7, 4), (10, 11, 4.5))):
        c = (x + dx, y + dy)
        t = 104 + 2 * k
        sparks.append(pivot(c, [group([sparkle(c, r), fill(CITRUS), stroke(INK, 1.8)], "spark")],
                            "spark%d" % k,
                            s=seq(sc(0), [(t, t + 6, sc(120), SPRING), (t + 6, t + 14, sc(0), IN)])))
    return sparks


# --- the load gauge -----------------------------------------------------------

def _arc(a0, a1, step=6):
    """Points along the gauge arc from angle a0 to a1 (degrees, 0 = up)."""
    n = max(2, int(abs(a1 - a0) / step) + 1)
    pts = []
    for k in range(n):
        a = math.radians(a0 + (a1 - a0) * k / (n - 1) - 90)
        pts.append((round(HUB[0] + ARC_R * math.cos(a), 2), round(HUB[1] + ARC_R * math.sin(a), 2)))
    return pts


def _gauge():
    zones = [group([path(_arc(-90, 10), k=0.167), stroke(MINT, 7)], "safe"),
             group([path(_arc(10, 50), k=0.167), stroke(SUN, 7)], "warn"),
             group([path(_arc(50, 90), k=0.167), stroke(CORAL, 7)], "limit")]
    rim = group([path(_arc(-90, 90), k=0.167), stroke(INK, 12)], "rim")

    angle = seq(SAFE, [(14, 30, IDLE, INOUT),
                       (150, 176, LIMIT, INOUT),
                       (176, 179, LIMIT - 7, INOUT), (179, 182, LIMIT, INOUT),
                       (182, 185, LIMIT - 6, INOUT), (185, 190, LIMIT, INOUT),
                       (190, 210, SAFE, OUT)])
    hx, hy = HUB
    needle = group([line(HUB, (hx, hy - ARC_R + 3)), stroke(INK, 3.6)], "needle",
                   tr(a=HUB, p=HUB, r=angle))
    hub = group([ell(HUB, (10, 10)), fill(INK)], "hub")
    return [hub, needle, *zones, rim]


def _pills():
    px, py = PILL_C
    bump = lambda: seq(sc(100), pop_moves(170, over=118) + pop_moves(200, over=118))
    ok = pivot(PILL_C, [check(PILL_C, 11, w=3),
                        group([rect(PILL_C, (40, 17), 8.5), fill(MINT), stroke(INK, 2.5)], "pill")],
               "pill-ok", s=bump(), o=seq(100, [(170, 171, 0, LIN), (200, 201, 100, LIN)]))
    bad = pivot(PILL_C, [group([rect((px, py - 1.5), (3.2, 7), 1.6), fill(RED)], "bang"),
                         group([ell((px, py + 5.2), (3.4, 3.4)), fill(RED)], "bang-dot"),
                         group([rect(PILL_C, (40, 17), 8.5), fill(CORAL), stroke(RED, 2.5)],
                               "pill")],
                "pill-bad", s=bump(), o=seq(0, [(170, 171, 100, LIN), (200, 201, 0, LIN)]))
    return [ok, bad]


def _card():
    shake = seq([0, 0], [(176, 179, [2, 0], INOUT), (179, 182, [-2, 0], INOUT),
                         (182, 185, [2, 0], INOUT), (185, 190, [0, 0], INOUT)])
    items = [*_pills(), *_gauge(), bar((CARD_C[0], 56), (34, 6)),
             *panel(CARD_C, CARD_S, r=14, sw=3.5, sh=5, name="gauge-card")]
    return [group(items, "card", tr(p=shake))]


def build():
    return wide_comp("validate", [
        layer("card", _card()),
        layer("sparks", _fix_spark()),
        layer("bug", [_bug()]),
        layer("magnifier", [_magnifier()]),
        layer("rows", [_row(i, y) for i, y in enumerate(ROWS)]),
        layer("strip", [_strip()]),
        layer("app", _app()),
    ])
