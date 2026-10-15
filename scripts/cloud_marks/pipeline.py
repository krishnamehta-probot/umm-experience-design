"""
Card 02 -- Data engineering & platform modernization: one tidy table.

Three source stores on the left (sky, blossom, sun) feed pipes that merge
into a citrus quality gate, and one pipe runs on from the gate into a tidy
table. Packets leave the stores, pass through the gate (its light pops mint)
and slide into the table, where each lands as a neat row with its source's
colour chip. One packet is bad: it is coral, the gate stops it, the light
turns coral, a flag goes up on it and it drops into the held tray under the
gate. The table gets its mint check at the end.

Frame 0 is the finished picture: four rows in the table, the bad packet
flagged in the held tray, the gate light mint.

Beats (30 fps, loop 240):
  0-12    rest on the finished picture
  12-30   the rows, the held packet and the table's check shrink away
  34-80   packet 1 (sky)     -> row 1
  56-102  packet 2 (blossom) -> row 2
  78-102  packet 3 (coral, bad) stops at the gate; light coral, flag (104),
          dropped into the held tray (112-128)
  108-154 packet 4 (sun)     -> row 3
  130-176 packet 5 (sky)     -> row 4
  184     the table's check pops
  200-240 hold on the finished picture

Build and check:  python scripts/build_cloud_service_marks.py pipeline
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
    panel, bar, dashed, cubic, check, sparkle, Track,
)

# --- geometry ------------------------------------------------------------------

SRC_X = 40
SRC_Y = [38, 90, 142]
SRC_FILL = [SKY, BLOSSOM, SUN]
CYL_W, CYL_H, CYL_E = 42, 36, 12          # width, height, ellipse depth

GATE_C, GATE_S = (152, 90), (34, 52)
LIGHT_C = (152, 90)
IN_X, OUT_X = 136, 168                    # gate's left and right faces
STOP = (124, 90)                          # where the bad packet waits
HELD = (152, 150)                         # held tray under the gate

TABLE_C, TABLE_S = (290, 90), (124, 136)
TABLE_L = TABLE_C[0] - TABLE_S[0] / 2     # 228
ROW_Y = [70, 94, 118, 142]
CHIP_X = 246
PARK = (262, 90)                          # under the table, out of sight

PKT = 14

# (source, row or None for the bad one, start frame)
PACKETS = [(0, 0, 34), (1, 1, 56), (2, None, 78), (2, 2, 108), (0, 3, 130)]
TRAVEL = 46                               # source -> under the table
BAD_TRAVEL = 24
FLAG_AT = 104
DROP = (112, 128)
SHRINK = 12
TABLE_CHECK = 184


# --- tracks --------------------------------------------------------------------

def pipe_seg(i):
    y = SRC_Y[i]
    return ((SRC_X, y), (100, y), (104, 90), (IN_X, 90))


def straight(p, q):
    return (p, (p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3),
            (p[0] + 2 * (q[0] - p[0]) / 3, p[1] + 2 * (q[1] - p[1]) / 3), q)


def full_track(i):
    return Track([pipe_seg(i), straight((IN_X, 90), PARK)])


def bad_track(i):
    s = pipe_seg(i)
    return Track([(s[0], s[1], s[2], STOP)])


DROP_TRACK = Track([(STOP, (128, 118), (140, 132), HELD)])


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


def good_pos(src, t0):
    trk = full_track(src)
    home = (SRC_X, SRC_Y[src])

    def f(fr):
        if fr <= t0 or fr > t0 + TRAVEL + 4:
            return _r(home)
        if fr >= t0 + TRAVEL:
            return _r(PARK)
        # steady along the pipe, easing only at the very ends
        u = (fr - t0) / TRAVEL
        u = 0.5 * (smooth(u) + u)
        return _r(trk.at(trk.total * u))
    return f


def bad_pos(src, t0):
    trk = bad_track(src)
    home = (SRC_X, SRC_Y[src])

    def f(fr):
        if fr < 26:
            return _r(HELD)
        if fr <= t0:
            return _r(home)
        if fr <= t0 + BAD_TRAVEL:
            u = (fr - t0) / BAD_TRAVEL
            return _r(trk.at(trk.total * (1 - (1 - u) ** 2)))   # brakes into the stop
        if fr <= DROP[0]:
            return _r(STOP)
        if fr <= DROP[1]:
            return _r(DROP_TRACK.at(DROP_TRACK.total * smooth((fr - DROP[0]) / (DROP[1] - DROP[0]))))
        return _r(HELD)
    return f


# --- drawing: sources and pipes -------------------------------------------------

def _cyl_outline(cx, cy):
    """The cylinder's silhouette: top half-ellipse, sides, bottom half-ellipse."""
    w, h, e = CYL_W / 2, CYL_H / 2, CYL_E / 2
    k = 0.5523
    top, bot = cy - h + e, cy + h - e
    return {"ty": "sh", "ix": 1, "nm": "cyl", "hd": False, "ks": v({
        "v": [[cx - w, top], [cx, top - e], [cx + w, top], [cx + w, bot], [cx, bot + e], [cx - w, bot]],
        "i": [[0, 0], [-w * k, 0], [0, -e * k], [0, 0], [w * k, 0], [0, e * k]],
        "o": [[0, -e * k], [w * k, 0], [0, 0], [0, e * k], [-w * k, 0], [0, 0]],
        "c": True})}


def _band(cx, y):
    w, e, k = CYL_W / 2, CYL_E / 2, 0.5523
    return {"ty": "sh", "ix": 1, "nm": "band", "hd": False, "ks": v({
        "v": [[cx - w, y], [cx, y + e], [cx + w, y]],
        "i": [[0, 0], [-w * k, 0], [0, e * k]],
        "o": [[0, e * k], [w * k, 0], [0, 0]],
        "c": False})}


def source(i):
    cx, cy = SRC_X, SRC_Y[i]
    top = cy - CYL_H / 2 + CYL_E / 2
    return [
        group([_band(cx, cy + 1), stroke(INK, 2.6)], "band"),
        group([ell((cx, top), (CYL_W, CYL_E)), fill(PAPER), stroke(INK, 3)], "lid"),
        group([_cyl_outline(cx, cy), fill(SRC_FILL[i]), stroke(INK, 3.5)], "body"),
        group([_cyl_outline(cx + 4, cy + 4), fill(INK)], "shadow"),
    ]


def pipes():
    shapes = [cubic(*pipe_seg(i)) for i in range(3)]
    shapes.append(line((IN_X, 90), (TABLE_L, 90)))
    inner = group([*[cubic(*pipe_seg(i)) for i in range(3)],
                   line((IN_X, 90), (TABLE_L, 90)), stroke(PAPER, 4)], "pipe-in")
    outer = group([*shapes, stroke(INK, 11)], "pipe-out")
    return [inner, outer]


# --- drawing: gate, held tray ---------------------------------------------------

def gate():
    lx, ly = LIGHT_C
    bad_on = seq(0, [(SHRINK, SHRINK + 1, 0, LIN), (102, 104, 100, LIN), (132, 138, 0, LIN)])
    good_on = seq(100, [(102, 104, 0, LIN), (132, 138, 100, LIN)])
    pulses = []
    for (src, row, t0) in PACKETS:
        if row is None:
            pulses += pop_moves(102, over=130)
        else:
            t = t0 + 24                                 # the packet is inside the gate
            pulses += pop_moves(t, over=130)
    light_s = seq(sc(100), pulses)
    good = group([check(LIGHT_C, 10, 2.8),
                  group([ell(LIGHT_C, (20, 20)), fill(MINT), stroke(INK, 2.6)], "disc")],
                 "light-ok", tr(o=good_on))
    bad = group([group([rect((lx, ly - 1.6), (3, 6.4), 1.5), fill(INK)], "bang"),
                 group([ell((lx, ly + 4.2), (3.2, 3.2)), fill(INK)], "bang-dot"),
                 group([ell(LIGHT_C, (20, 20)), fill(CORAL), stroke(INK, 2.6)], "disc")],
                "light-bad", tr(o=bad_on))
    light = pivot(LIGHT_C, [good, bad], "light", s=light_s)
    return [light,
            *panel(GATE_C, GATE_S, r=9, fc=CITRUS, sw=3.5, sh=4, name="gate")]


def held_tray():
    return group([rect(HELD, (32, 30), 8), dashed(stroke(INK, 2.5, o=45), 5, 4)], "held")


# --- drawing: the table ---------------------------------------------------------

def table():
    x0 = TABLE_L
    head = [bar((258, 42), (30, 6)), bar((312, 42), (22, 6), o=40)]
    rule = group([line((x0 + 2, 56), (TABLE_L + TABLE_S[0] - 2, 56)), stroke(INK, 3)], "rule")
    seps = group([line((x0 + 10, y + 12), (x0 + TABLE_S[0] - 10, y + 12))
                  for y in ROW_Y[:-1]] + [stroke(INK, 1.5, o=14)], "seps")
    return [*head, rule, seps,
            *panel(TABLE_C, TABLE_S, r=12, fc=PAPER, sw=3.5, sh=5, name="table")]


def rows():
    out = []
    for r, y in enumerate(ROW_Y):
        src, t = next((s, t0) for (s, row, t0) in PACKETS if row == r)
        land = t + TRAVEL - 6
        items = [
            bar((292, y), (34, 6)),
            bar((334, y), (16, 6), o=40),
            group([rect((CHIP_X, y), (14, 14), 4), fill(SRC_FILL[src]), stroke(INK, 2.4)], "chip"),
        ]
        down = SHRINK + 2 * (3 - r)
        s = seq(sc(100), [(down, down + 8, [0, 100], IN),
                          (land, land + 10, [106, 100], OUT), (land + 10, land + 16, sc(100), INOUT)])
        out.append(group(items, "row%d" % r, tr(a=(CHIP_X - 8, y), p=(CHIP_X - 8, y), s=s)))
    return out


def table_check():
    c = (TABLE_L + TABLE_S[0] - 4, 26)
    return pivot(c, [check(c, 11, 3),
                     group([ell(c, (22, 22)), fill(MINT), stroke(INK, 2.8)], "disc")],
                 "table-check",
                 s=seq(sc(100), [(SHRINK, SHRINK + 10, sc(0), IN)] + pop_moves(TABLE_CHECK, over=136)))


# --- drawing: packets -----------------------------------------------------------

def packet(src, t0, colour, name):
    body = [group([rect((0, 0), (PKT, PKT), 4), fill(colour), stroke(INK, 2.6)], "pkt")]
    s = seq(sc(0), [(t0, t0 + 2, sc(100), LIN), (t0 + TRAVEL + 2, t0 + TRAVEL + 4, sc(0), LIN)])
    return group(body, name, tr(p=sampled(good_pos(src, t0)), s=s))


def bad_packet(src, t0):
    pole = group([line((-4, -7), (-4, -22)), stroke(INK, 3)], "pole")
    cloth = group([path([(-4, -22), (8, -17.5), (-4, -13)], closed=True, k=0),
                   fill(CORAL), stroke(INK, 2.6)], "cloth")
    flag = group([pole, cloth], "flag", tr(
        a=(-4, -7), p=(-4, -7),
        s=seq(sc(100), [(SHRINK, SHRINK + 8, sc(0), IN)] + pop_moves(FLAG_AT, over=130))))
    body = group([rect((0, 0), (PKT + 2, PKT + 2), 4), fill(CORAL), stroke(INK, 2.6)], "pkt")
    cross = group([line((-3, -3), (3, 3)), line((3, -3), (-3, 3)), stroke(INK, 2.4)], "x")
    s = seq(sc(100), [(SHRINK, SHRINK + 12, sc(0), IN), (t0, t0 + 2, sc(100), LIN)])
    return group([flag, cross, body], "bad", tr(p=sampled(bad_pos(src, t0)), s=s))


def packets():
    out = []
    for i, (src, row, t0) in enumerate(PACKETS):
        if row is None:
            continue
        out.append(packet(src, t0, SRC_FILL[src], "pkt%d" % i))
    return out


def build():
    bad = next((s, t0) for (s, row, t0) in PACKETS if row is None)
    return wide_comp("connect", [
        layer("check", [table_check()]),
        layer("rows", rows()),
        layer("table", table()),
        layer("sources", [g for i in range(3) for g in source(i)]),
        layer("bad", [bad_packet(*bad)]),
        layer("gate", gate()),
        layer("packets", packets()),
        layer("pipes", pipes()),
        layer("held", [held_tray()]),
    ])
