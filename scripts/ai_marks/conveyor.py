"""
Card 03 -- Intelligent workflow automation: a conveyor with an AI scanner.

A belt runs under a citrus scanner arch. Messy documents come in from the
left, the scanner flashes and each one comes out as a neat card, which tips
into the tray at the right end. A flagged document is lifted into the
on-hold spot top right. Frame 0 is the finished picture: two cards in the
tray, the flagged document on hold.

Beats (30 fps, loop 240):
  0-12    rest on the finished picture
  12-28   tray cards and the held document shrink away
  26-118  item A enters, scans at the arch (64-78), rides to the end, tips
          into the tray (100-118)
  70-168  item B enters, reaches the arch (120), coral beam and flag (120-132),
          lifted on an arc to the on-hold spot (134-168)
  120-204 item C enters, scans (168-180), rides to the end, drops on A (182-204)
  204-240 hold on the finished picture

The belt and arch layers sit 7 px higher than the tray (layer p), so the
composition is centred vertically.

Build and check:  python scripts/ai_marks/_preview.py conveyor workflow
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    v, kf, _prop, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI, LILAC,
    OUT, INOUT, IN, SPRING, LIN, OP, FPS, WW, WH,
    sc, seq, pop_moves, travel, smooth, layer, wide_comp, pivot,
    panel, bar, dashed, cubic, check, sparkle, _shape, Track,
)

DEEP_CORAL = [0.85, 0.35, 0.38, 1]
SHIFT = (0, -7)                 # belt, arch and scan layers sit 7 px higher

# Items and the on-hold spot are drawn in absolute canvas coordinates.
ON_Y = 88                       # an item's centre while it rides the belt
ARCH = (138, 88)                # scan point: centred between the legs
END = (240, 88)                 # the belt's right end (shifted belt top = 111)
ENTER = (-25, 88)               # off the left edge, out of frame
T_A, R_A = (303, 137), -4       # tray slot, lower card
T_C, R_C = (309, 131), 4        # tray slot, upper card (stacked on A)
MID = (270, 106)                # over the tray's rim, on the way in
HELD = (307, 48)                # on-hold spot centre
EVENTS = (64, 120, 168)         # scan moments: A, B (coral), C


def _rot(pts, deg):
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    return [(x * c - y * s, x * s + y * c) for x, y in pts]


# A messy document, origin-centred: 30 x 38, a folded dog-ear top right,
# tilted 12 degrees. The tilt is baked into the points.
SHEET = _rot([(-15, -19), (7, -19), (15, -11), (15, 19), (-15, 19)], 12)
FOLD = _rot([(7, -19), (7, -11), (15, -11)], 12)
SCRIBBLES = [
    _rot([(-9, -7), (-4, -9), (1, -6), (5, -9), (9, -7)], 12),
    _rot([(-9, 1), (-5, -1), (0, 2), (4, 0), (9, 2)], 12),
    _rot([(-9, 9), (-3, 7), (2, 10), (4, 8)], 12),
]


# --- drawing: the belt, the scanner, the tray, the hold spot ----------------------

def belt():
    """Shifted layer: pre-shift coordinates, belt 118-136."""
    rollers = [
        group([ell((31, 127), (18, 18)), fill(INK)], "rollerL"),
        group([ell((249, 127), (18, 18)), fill(INK)], "rollerR"),
    ]
    chevrons = [
        group([path([(x - 3, 123), (x + 3, 127), (x - 3, 131)], k=0), stroke(INK, 3)], "chev%d" % x)
        for x in (60, 88, 200, 226)
    ]
    body = group([rect((140, 127), (244, 18), 9), fill(PAPER), stroke(INK, 3.5)], "belt")
    shadow = group([rect((144, 131), (244, 18), 9), fill(INK)], "beltShadow")
    return [*rollers, *chevrons, body, shadow]


def arch():
    """Shifted layer: pre-shift coordinates."""
    bar_top = group([rect((138, 52), (84, 14), 5), fill(CITRUS), stroke(INK, 3.5)], "archBar")
    bar_shadow = group([rect((141, 55), (84, 14), 5), fill(INK)], "archBarShadow")
    pulse = K([(0, sc(100), LIN)] + [pt for e in EVENTS for pt in (
        (e, sc(100), LIN), (e + 6, sc(135), OUT), (e + 14, sc(100), LIN))] + [(OP, sc(100), LIN)])
    spark = pivot((138, 30), [sparkle((138, 30), 11), fill(SUN), stroke(INK, 3)],
                  "sparkle", s=pulse)
    legs = [
        group([line((100, 118), (100, 59)), stroke(INK, 5)], "legL"),
        group([line((176, 118), (176, 59)), stroke(INK, 5)], "legR"),
    ]
    return [bar_top, bar_shadow, spark, *legs]


def scan_lines():
    """Three INK scan lines that sweep down the beam once per scan."""
    TOP, BOT = 67, 111          # pre-shift coordinates
    out = []
    for i, x in enumerate((118, 138, 158)):
        d = 2 * i
        pos = [(0, [x, TOP], LIN)]
        op = [(0, 0, LIN)]
        for e in EVENTS:
            t = e + d
            pos += [(t, [x, TOP], LIN), (t + 13, [x, BOT], LIN), (t + 14, [x, TOP], LIN)]
            op += [(t, 0, LIN), (t + 1, 100, LIN), (t + 11, 100, LIN), (t + 13, 0, LIN)]
        pos.append((OP, [x, TOP], LIN))
        op.append((OP, 0, LIN))
        out.append(group([line((-8, 0), (8, 0)), stroke(INK, 2.5)], "scan%d" % i,
                         tr(p=K(pos), o=K(op))))
    return out


def beam(colour, op):
    """Shifted layer: a light cone from the top bar down to the belt."""
    body = group([rect((138, 85), (64, 66), 0), fill(colour),
                  stroke(INK, 2)], "beamBody")
    return group([body], "beam", tr(o=op))


def tray():
    back = group([rect((307, 143), (70, 46), 6), fill(PAPER), stroke(INK, 3.5)], "trayBack")
    shadow = group([rect((312, 148), (70, 46), 6), fill(INK)], "trayShadow")
    return [back, shadow]


def lip():
    body = group([rect((307, 159), (70, 14), 4), fill(SKY), stroke(INK, 3.5)], "lip")
    shadow = group([rect((312, 164), (70, 14), 4), fill(INK)], "lipShadow")
    return [body, shadow]


def hold_spot():
    edge = dashed(stroke(INK, 3, o=50), 6, 5)
    return group([rect((307, 44), (74, 62), 10), edge], "onHold")


# --- drawing: the items (origin-centred, placed by their group transform) -------

def sheet(op):
    """A messy document: a tilted sheet with a dog-ear and scribbles."""
    items = [
        group([path(SCRIBBLES[0], k=0.3), stroke(INK, 2.5)], "scr0"),
        group([path(SCRIBBLES[1], k=0.3), stroke(INK, 2.5)], "scr1"),
        group([path(SCRIBBLES[2], k=0.3), stroke(INK, 2.5)], "scr2"),
        group([path(FOLD, closed=True, k=0), fill(PAPER), stroke(INK, 3)], "fold"),
        group([path(SHEET, closed=True, k=0), fill(PAPER), stroke(INK, 3)], "paper"),
        group([path([(x + 3, y + 3) for x, y in SHEET], closed=True, k=0), fill(INK)],
              "sheetShadow"),
    ]
    return group(items, "sheet", tr(o=op))


def neat_card(op):
    items = [
        bar((-7, -5), (18, 5)),
        bar((-8, 5), (14, 5)),
        group([ell((10, 2), (12, 12)), fill(MINT), stroke(INK, 2.6)], "stamp"),
        check((10, 2), 8, 3),
        group([rect((0, 0), (40, 30), 5), fill(PAPER), stroke(INK, 3)], "cardBody"),
        group([rect((3, 3), (40, 30), 5), fill(INK)], "cardShadow"),
    ]
    return group(items, "card", tr(o=op))


def item_card(name, pos, scl, rot, cr_op, card_op):
    """A sheet that turns into a card at the scanner: the swap is a crossfade."""
    return group([neat_card(card_op), sheet(cr_op)], name, tr(p=pos, s=scl, r=rot))


def item_held(name, pos, scl, flag_s):
    """The odd document: a messy sheet with a coral flag on a pole from its top edge."""
    pole = group([line((-4, -17), (-4, -30)), stroke(INK, 3)], "pole")
    flag = group([path([(-4, -30), (7, -25), (-4, -20)], closed=True, k=0),
                  fill(CORAL), stroke(INK, 3)], "flagCloth")
    flag_grp = group([pole, flag], "flag", tr(a=(-4, -17), p=(-4, -17), s=flag_s))
    return group([flag_grp, sheet(100)], name, tr(p=pos, s=scl))


# --- timelines ------------------------------------------------------------------

def K(points):
    """Keyed property from (frame, value, ease-to-next) points. Starts and ends
    on the same value at 0 and OP."""
    return kf(points)


def arc_points(t0, t1):
    """Keys for the lift: an arc from the scanner into the on-hold spot."""
    trk = Track([(ARCH, (200, 88), (230, 40), HELD)])
    pts = []
    for f in range(t0, t1, 2):
        u = (f - t0) / (t1 - t0)
        x, y = trk.at(trk.total * smooth(u))
        pts.append((f, [round(x, 2), round(y, 2)], LIN))
    return pts


def build():
    # Item A: enters 26, scans 64-78, rides to the end 78-100, tips into the tray.
    A_pos = K([
        (0, T_A, LIN), (20, T_A, LIN), (21, ENTER, LIN), (26, ENTER, INOUT),
        (64, ARCH, LIN), (78, ARCH, INOUT), (100, END, IN),
        (112, MID, SPRING), (118, T_A, LIN), (240, T_A, LIN),
    ])
    A_scl = K([(0, sc(100), LIN), (12, sc(100), IN), (20, sc(0), LIN),
               (24, sc(0), OUT), (26, sc(100), LIN), (240, sc(100), LIN)])
    A_rot = K([(0, R_A, LIN), (24, R_A, LIN), (26, 0, LIN), (100, 0, IN),
               (112, 35, SPRING), (118, R_A, LIN), (240, R_A, LIN)])
    A_cr = K([(0, 0, LIN), (23, 0, LIN), (24, 100, LIN), (66, 100, LIN),
              (74, 0, LIN), (240, 0, LIN)])
    A_cd = K([(0, 100, LIN), (20, 100, LIN), (22, 0, LIN), (66, 0, LIN),
              (74, 100, LIN), (240, 100, LIN)])

    # Item B: enters 70, scans 120 (coral), lifted to the on-hold spot 134-168.
    B_pos = K([(0, HELD, LIN), (20, HELD, LIN), (21, ENTER, LIN), (70, ENTER, INOUT),
               (120, ARCH, LIN)] + arc_points(134, 168) + [(168, HELD, LIN), (240, HELD, LIN)])
    B_scl = K([(0, sc(100), LIN), (12, sc(100), IN), (20, sc(0), LIN),
               (68, sc(0), LIN), (70, sc(100), LIN), (240, sc(100), LIN)])
    B_flag = K([(0, sc(100), LIN), (12, sc(100), IN), (20, sc(0), LIN),
                (120, sc(0), SPRING), (132, sc(100), LIN), (240, sc(100), LIN)])

    # Item C: enters 120, scans 168-180, rides 182-196, drops on A 196-204.
    C_pos = K([(0, T_C, LIN), (20, T_C, LIN), (21, ENTER, LIN), (120, ENTER, INOUT),
               (168, ARCH, LIN), (182, ARCH, INOUT), (196, END, IN),
               (200, MID, SPRING), (204, T_C, LIN), (240, T_C, LIN)])
    C_scl = K([(0, sc(100), LIN), (12, sc(100), IN), (20, sc(0), LIN),
               (116, sc(0), LIN), (118, sc(100), LIN), (240, sc(100), LIN)])
    C_rot = K([(0, R_C, LIN), (116, R_C, LIN), (118, 0, LIN), (196, 0, IN),
               (202, 35, INOUT), (204, R_C, LIN), (240, R_C, LIN)])
    C_cr = K([(0, 0, LIN), (119, 0, LIN), (120, 100, LIN), (170, 100, LIN),
              (178, 0, LIN), (240, 0, LIN)])
    C_cd = K([(0, 100, LIN), (116, 100, LIN), (117, 0, LIN), (170, 0, LIN),
              (178, 100, LIN), (240, 100, LIN)])

    # Scan beams: citrus up to 90% for the cards, deep coral at 80% for the flag.
    citrus_op = K([(0, 0, LIN), (64, 0, INOUT), (71, 90, INOUT), (78, 0, LIN),
                   (168, 0, INOUT), (175, 90, INOUT), (182, 0, LIN), (240, 0, LIN)])
    coral_op = K([(0, 0, LIN), (120, 0, INOUT), (127, 80, INOUT), (134, 0, LIN),
                  (240, 0, LIN)])

    item_c = item_card("itemC", C_pos, C_scl, C_rot, C_cr, C_cd)
    item_a = item_card("itemA", A_pos, A_scl, A_rot, A_cr, A_cd)
    item_b = item_held("itemB", B_pos, B_scl, B_flag)

    return wide_comp("workflow", [
        layer("arch", arch(), p=SHIFT),
        layer("beams", [beam(DEEP_CORAL, coral_op), beam(CITRUS, citrus_op)], p=SHIFT),
        layer("lip", lip()),
        layer("items", [item_c, item_a, item_b]),
        layer("tray", tray()),
        layer("hold", [hold_spot()]),
        layer("belt", belt(), p=SHIFT),
    ])
