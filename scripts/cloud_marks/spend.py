"""
Card 06 -- Cloud economics & ongoing optimization: every cost has an owner.

A monthly bill: a stacked cost bar with an owner chip under each segment,
and a gauge beside it. Frame 0 is the allocated, balanced picture: every
segment in its owner's colour, the under-used block trimmed to what is
used, the needle in the mint middle.

The bill goes grey and unowned, the under-used block swells back to its
full size and the needle swings into the coral. Segments take their owners'
colours one by one, each chip popping under it; one stays grey -- nobody
owns it -- until an owner tag drops onto it and it turns. The idle part of
the under-used block is trimmed off, the total shrinks, and the needle
springs back to balanced.

Beats (30 fps, loop 240):
  0-12    rest on the allocated, balanced bill
  12-30   segments grey, chips shrink, block swells, needle swings to over
  36-80   four segments take their owners' colours, chips pop
  84-132  the owner tag drops onto the grey segment, it turns, chip pops
  136-154 the idle part of the under-used block is trimmed; total shrinks
  156-182 the needle springs back to balanced
  182-240 rest

Build and check:  python scripts/build_cloud_service_marks.py spend
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    ell, rect, path, line, stroke, fill, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI, LILAC,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, pop_moves, layer, wide_comp, pivot, panel, bar, dashed, sparkle,
)

GREY = [0.875, 0.87, 0.89, 1]   # an unassigned cost

BILL_C, BILL_S = (140, 89), (244, 146)
GAUGE_C, GAUGE_S = (310, 89), (68, 104)

BAR_Y, BAR_H, BAR_X0 = 84, 34, 30
# segment widths and owner colours; segment 2 has no owner until the tag
# lands; segment 4 is the under-used block: USED of it is used, IDLE more
# was bought
WIDTHS = [52, 44, 38, 42]
OWNERS = [SKY, SUN, PERI, BLOSSOM, MINT]
USED, IDLE = 30, 16
ASSIGN_AT = {0: 36, 1: 48, 3: 60, 4: 72}
UNOWNED = 2
TAG_LAND = 104

CHIP_Y, NAME_Y = 124, 145

PIVOT = (310, 100)              # the gauge's needle pivot
ARC_R = 22
OVER = 60                       # needle angle when spend runs over


def _lefts():
    xs, x = [], BAR_X0
    for w in WIDTHS:
        xs.append(x)
        x += w
    return xs, x


LEFTS, E_X = _lefts()           # E_X: the under-used block's left edge
CENTRES = [l + w / 2 for l, w in zip(LEFTS, WIDTHS)] + [E_X + USED / 2]


# --- the bill ----------------------------------------------------------------------

def _fill_seq(i):
    t = ASSIGN_AT.get(i, TAG_LAND + 2)
    return seq(OWNERS[i], [(12 + 2 * i, 22 + 2 * i, GREY, LIN), (t, t + 6, OWNERS[i], LIN)])


def _segment(i):
    c = (CENTRES[i], BAR_Y)
    t = ASSIGN_AT.get(i, TAG_LAND + 2)
    s = seq(sc(100), [(t, t + 5, [100, 112], SPRING), (t + 5, t + 12, sc(100), LIN)])
    return pivot(c, [group([rect(c, (WIDTHS[i], BAR_H), 4), fill(_fill_seq(i)),
                            stroke(INK, 3)], "seg")], "seg%d" % i, s=s)


def _underused():
    """The under-used block: an outline that spans what was bought, a fill
    over what is used. Frame 0 has them equal (trimmed)."""
    i = 4
    trim_w = [(14, 30, USED + IDLE, INOUT), (136, 154, USED, INOUT)]

    def size_k():
        return seq([USED, BAR_H], [(a, b, [w, BAR_H], e) for a, b, w, e in trim_w])

    def ctr_k():
        return seq([E_X + USED / 2, BAR_Y], [(a, b, [E_X + w / 2, BAR_Y], e)
                                             for a, b, w, e in trim_w])
    divider = group([line((E_X + USED, BAR_Y - 13), (E_X + USED, BAR_Y + 13)),
                     dashed(stroke(INK, 2.4, o=seq(0, [(22, 30, 100, LIN),
                                                       (140, 146, 0, LIN)])), 3, 4)],
                    "divider")
    t = ASSIGN_AT[i]
    used = group([rect((E_X + USED / 2, BAR_Y), (USED, BAR_H), 4), fill(_fill_seq(i))],
                 "used")
    used_pop = pivot((E_X + USED / 2, BAR_Y), [used], "used",
                     s=seq(sc(100), [(t, t + 5, [100, 112], SPRING),
                                     (t + 5, t + 12, sc(100), LIN)]))
    # fills above the outline, as in panel(): the inner half of the stroke
    # is covered, so its weight matches the other segments'
    return [divider, used_pop,
            group([rect(ctr_k(), size_k(), 4), fill(PAPER)], "bought"),
            group([rect(ctr_k(), size_k(), 4), stroke(INK, 3)], "outline")]


def _chip(i):
    x = CENTRES[i]
    t = ASSIGN_AT.get(i, TAG_LAND + 6)
    items = [group([ell((x, CHIP_Y), (20, 20)), fill(OWNERS[i]), stroke(INK, 2.6)], "chip"),
             bar((x, NAME_Y), (22, 5))]
    return pivot((x, 132), items, "owner%d" % i,
                 s=seq(sc(100), [(12 + 2 * i, 20 + 2 * i, sc(0), IN)]
                       + pop_moves(t + 2, over=130)))


def _vacant():
    """A dashed ring where the unowned segment's owner chip should be."""
    x = CENTRES[UNOWNED]
    st = dashed(stroke(INK, 2.2, o=seq(0, [(22, 30, 55, LIN), (110, 114, 0, LIN)])), 3, 3.5)
    return group([ell((x, CHIP_Y), (20, 20)), st], "vacant")


def _tag():
    x, y = CENTRES[UNOWNED], BAR_Y - BAR_H / 2 - 9
    pts = [(x - 9, y - 12), (x + 9, y - 12), (x + 9, y + 3), (x, y + 11), (x - 9, y + 3)]
    items = [group([ell((x, y - 5), (5, 5)), fill(PAPER), stroke(INK, 2)], "hole"),
             group([path(pts, closed=True, k=0), fill(PERI), stroke(INK, 2.8)], "tag")]
    pos = seq([x, -24], [(84, 104, [x, y], IN), (134, 136, [x, -24], LIN)])
    s = seq(sc(100), [(104, 109, [118, 84], OUT), (109, 118, sc(100), SPRING),
                      (122, 132, sc(0), IN), (134, 136, sc(100), LIN)])
    return pivot((x, y), items, "tag", p=pos, s=s,
                 o=seq(0, [(83, 84, 100, LIN), (133, 134, 0, LIN)]))


def _total():
    """The bill's total in the header: shrinks a little when the block is trimmed."""
    left = 196
    trimmed = E_X + USED - left             # right edge on the bar's end
    full = trimmed + IDLE
    keys = [(12, 28, full, INOUT), (138, 156, trimmed, INOUT)]
    size = seq([trimmed, 10], [(a, b, [w, 10], e) for a, b, w, e in keys])
    ctr = seq([left + trimmed / 2, 38], [(a, b, [left + w / 2, 38], e) for a, b, w, e in keys])
    return group([rect(ctr, size, 5), fill(INK)], "total")


def _snip_spark():
    c = (E_X + USED + 10, BAR_Y - 22)
    return group([sparkle(c, 7), fill(CITRUS), stroke(INK, 2)], "spark",
                 tr(a=c, p=c, s=seq(sc(0), [(150, 156, sc(130), SPRING),
                                            (156, 162, sc(100), LIN),
                                            (168, 176, sc(0), IN)])))


def _bill():
    return [
        _snip_spark(),
        _tag(),
        *[_chip(i) for i in range(5)],
        _vacant(),
        *_underused(),
        *[_segment(i) for i in range(4)],
        _total(),
        bar((64, 38), (56, 7)),
        *panel(BILL_C, BILL_S, r=14, sw=3.5, sh=5, name="bill"),
    ]


# --- the gauge ----------------------------------------------------------------------

def _arc(a0, a1, r):
    """Points along the upper arc about the pivot, angles in degrees from
    straight up (negative = left)."""
    cx, cy = PIVOT
    n = max(3, int(abs(a1 - a0) / 6) + 1)
    pts = []
    for k in range(n):
        a = math.radians(a0 + (a1 - a0) * k / (n - 1))
        pts.append((round(cx + r * math.sin(a), 2), round(cy - r * math.cos(a), 2)))
    return pts


def _gauge():
    zones = []
    for a0, a1, colour in ((-90, -30, SUN), (-30, 30, MINT), (30, 90, CORAL)):
        st = stroke(colour, 7)
        st["lc"] = 1
        zones.append(group([path(_arc(a0, a1, ARC_R), k=0.3), st], "zone"))
    outline = group([path(_arc(-90, 90, ARC_R), k=0.3), stroke(INK, 11.5)], "rim")
    angle = seq(0, [(14, 30, OVER, OUT), (40, 46, OVER - 8, INOUT), (46, 52, OVER, INOUT),
                    (156, 182, 0, SPRING)])
    cx, cy = PIVOT
    needle = group([line(PIVOT, (cx, cy - 19)), stroke(INK, 3.6)], "needle",
                   tr(a=PIVOT, p=PIVOT, r=angle))
    hub = group([ell(PIVOT, (9, 9)), fill(INK)], "hub")
    items = [needle, hub, *zones, outline, bar((cx, 126), (30, 6)),
             *panel(GAUGE_C, GAUGE_S, r=14, sw=3.5, sh=5, name="gauge")]
    return pivot(GAUGE_C, items, "gauge",
                 s=seq(sc(100), [(176, 182, sc(106), SPRING), (182, 190, sc(100), LIN)]))


def build():
    return wide_comp("optimize", [
        layer("gauge", [_gauge()]),
        layer("bill", _bill()),
    ])
