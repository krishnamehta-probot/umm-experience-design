"""
Card 04 -- Analytics & business intelligence: one agreed dashboard.

A dashboard panel with a bar chart, a trend line over it and an "agreed
definition" check in its header; a KPI card beside it. Frame 0 is that
finished picture. The chart then comes apart into mismatched number tiles
(different heights, different colours, one coral tile that disagrees and
shakes); the tiles fly back onto the baseline as squat blocks, grow into
bars in the agreed colours one by one, the trend line draws across them,
the KPI card pops in and its number counts up, and the definition is
checked.

Beats (30 fps, loop 240):
  0-14    rest on the finished dashboard
  14-42   the chart scatters into mismatched tiles; line, KPI card and
          check clear
  54-72   the coral tile shakes (the conflicting number)
  84-136  tiles fly home, one by one, as squat blocks
  112-150 each block grows into its bar, agreed colours
  150-176 trend line draws; end dot pops
  158-186 KPI card pops, its number grows
  186-200 the definition check pops
  200-240 rest

Build and check:  python scripts/build_cloud_service_marks.py dashboard
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI, LILAC,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, layer, wide_comp, pivot, panel, bar, check,
)

RED = [0.85, 0.35, 0.38, 1]

MON_C, MON_S = (140, 89), (244, 146)
KPI_C, KPI_S = (310, 89), (68, 104)

BASE_Y = 148                    # chart baseline
BAR_W = 26
XS = [66, 106, 146, 186, 226]   # bar centres
HS = [28, 42, 36, 54, 70]       # agreed heights (a rising trend)
AGREED = [SKY, SKY, SKY, SKY, CITRUS]

# the scattered state: where each tile's foot lands, its tilt, its height
# and its (mismatched) colour; tile 2 is the coral one that disagrees
SCAT_P = [(52, 92), (104, 140), (150, 84), (196, 136), (238, 96)]
SCAT_R = [-14, 9, -7, 12, -10]
SCAT_H = [40, 22, 50, 30, 26]
MESS = [SUN, BLOSSOM, CORAL, MINT, LILAC]
SQUAT = 14                      # height of a tile flying home

TREND = [(66, 106), (106, 90), (146, 98), (186, 80), (226, 62)]
CHECK_C = (44, 38)
BANG_C = (170, 40)             # the conflict badge, over the coral tile


def _bar(i):
    x, h0 = XS[i], HS[i]
    t_out = 14 + 2 * i
    t_fly = 84 + 8 * i
    t_grow = 112 + 6 * i
    hs = SCAT_H[i]

    def size(h):
        return [BAR_W, h]

    def ctr(h):
        return [0, -h / 2]

    size_k = seq(size(h0), [(t_out, t_out + 20, size(hs), INOUT),
                            (t_fly, t_fly + 20, size(SQUAT), INOUT),
                            (t_grow, t_grow + 14, size(h0), SPRING)])
    ctr_k = seq(ctr(h0), [(t_out, t_out + 20, ctr(hs), INOUT),
                          (t_fly, t_fly + 20, ctr(SQUAT), INOUT),
                          (t_grow, t_grow + 14, ctr(h0), SPRING)])
    colour = seq(AGREED[i], [(t_out, t_out + 10, MESS[i], LIN),
                             (t_fly + 4, t_fly + 18, AGREED[i], LIN)])
    pos = seq([x, BASE_Y], [(t_out, t_out + 20, list(SCAT_P[i]), INOUT),
                            (t_fly, t_fly + 20, [x, BASE_Y], INOUT)])
    rot = seq(0, [(t_out, t_out + 20, SCAT_R[i], INOUT),
                  (t_fly, t_fly + 20, 0, INOUT)])
    body = group([rect(ctr_k, size_k, 5), fill(colour), stroke(INK, 3)], "tile")
    items = [body]
    if i == 2:
        shake = seq([0, 0], [(54, 57, [4, 0], INOUT), (57, 60, [-4, 0], INOUT),
                             (60, 63, [4, 0], INOUT), (63, 66, [-4, 0], INOUT),
                             (66, 70, [0, 0], INOUT)])
        items = [group([body], "shake", tr(p=shake))]
    return group(items, "bar%d" % i, tr(a=(0, 0), p=pos, r=rot))


def _trend():
    line_g = group([path(TREND, k=0),
                    trim(e=seq(100, [(14, 26, 0, IN), (150, 176, 100, INOUT)])),
                    stroke(INK, 4)], "trend")
    end = pivot(TREND[-1], [group([ell(TREND[-1], (12, 12)), fill(PAPER), stroke(INK, 3)],
                                  "dot")],
                "end", s=seq(sc(100), [(14, 22, sc(0), IN), (174, 182, sc(135), SPRING),
                                       (182, 190, sc(100), LIN)]))
    return [end, line_g]


def _bang():
    """The conflict badge: pops over the coral tile while it shakes."""
    x, y = BANG_C
    items = [group([rect((x, y - 1.5), (3.2, 7.5), 1.6), fill(RED)], "bang"),
             group([ell((x, y + 5.6), (3.4, 3.4)), fill(RED)], "bang-dot"),
             group([ell(BANG_C, (20, 20)), fill(PAPER), stroke(RED, 2.6)], "disc")]
    return pivot(BANG_C, items, "conflict",
                 s=seq(sc(0), [(50, 58, sc(120), SPRING), (58, 64, sc(100), LIN),
                               (80, 88, sc(0), IN)]))


def _header():
    disc_fill = seq(MINT, [(14, 22, PAPER, LIN), (186, 192, MINT, LIN)])
    tick = pivot(CHECK_C, [check(CHECK_C, 10, w=3)], "tick",
                 s=seq(sc(100), [(14, 22, sc(0), IN), (186, 194, sc(130), SPRING),
                                 (194, 200, sc(100), LIN)]))
    disc = pivot(CHECK_C, [group([ell(CHECK_C, (20, 20)), fill(disc_fill), stroke(INK, 2.6)],
                                 "disc")],
                 "disc", s=seq(sc(100), [(186, 192, sc(112), SPRING), (192, 200, sc(100), LIN)]))
    return [tick, disc, bar((88, 38), (56, 7)), bar((228, 38), (28, 6))]


def _kpi():
    cx, cy = KPI_C
    left = cx - 22
    grow = [(28, 30, None, LIN), (170, 188, None, OUT)]

    def keyed(full, short):
        return seq(full, [(a, b, short if i == 0 else full, e)
                          for i, (a, b, _, e) in enumerate(grow)])
    number = group([rect(keyed([cx, 80], [left + 7, 80]), keyed([44, 14], [14, 14]), 7),
                    fill(INK)], "number")
    arrow = group([path([(cx - 6, 116), (cx, 110), (cx + 6, 116)], k=0), stroke(INK, 3)],
                  "up")
    pill = group([rect((cx, 114), (40, 18), 9), fill(MINT), stroke(INK, 2.5)], "pill")
    items = [number, arrow, pill, bar((cx - 6, 60), (30, 6)),
             *panel(KPI_C, KPI_S, r=14, sw=3.5, sh=5, name="kpi")]
    return pivot(KPI_C, items, "kpi",
                 s=seq(sc(100), [(16, 28, sc(0), IN), (158, 168, sc(110), SPRING),
                                 (168, 176, sc(100), LIN)]))


def build():
    baseline = group([line((44, BASE_Y), (248, BASE_Y)), stroke(INK, 3.5)], "baseline")
    grid = group([line((44, y), (248, y)) for y in (68, 92, 116)]
                 + [stroke(INK, 1.5, o=11)], "grid")
    return wide_comp("understand", [
        layer("kpi", [_kpi()]),
        layer("header", _header()),
        layer("trend", _trend()),
        layer("conflict", [_bang()]),
        layer("bars", [_bar(i) for i in (2, 0, 1, 3, 4)]),
        layer("chart", [baseline, grid]),
        layer("panel", panel(MON_C, MON_S, r=14, sw=3.5, sh=5, name="dashboard")),
    ])
