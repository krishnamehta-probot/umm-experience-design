"""
Card 06 · Model engineering & MLOps -- a model's heartbeat monitor.

A monitor shows an EKG line. The healthy line (three strong beats, mint glow)
is the finished picture on frame 0. The scan head then redraws it as a
drifting line: beats shrink and the baseline sags into a coral zone, and the
status pill flips to the problem state. A tuning dial turns, its tick dots
pop mint in turn, the zone clears, and the healthy line is scanned back in.
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

RED = [0.85, 0.35, 0.38, 1]

MON_C, MON_S = (140, 89), (244, 146)
SCREEN_C, SCREEN_S = (140, 89), (216, 118)
PILL_C = (213, 50)
DIAL_C, DIAL_S = (310, 89), (68, 104)
KNOB_C, KNOB_R = (310, 100), 17
TICK_R, TICK_D = 31, 9

X0, BEAT = 46, 63          # the line runs x 46 -> 235, three beats of 63 px
BASE = 112                 # resting baseline
SAG_PTS = [(46, 0), (109, 4), (172, 10), (235, 16)]
BEAT_OFFS = [(0, 0), (14, 0), (18, 6), (26, -42), (34, 22), (40, 0), (63, 0)]

TICK_ANGLES = [-45, -22.5, 0, 22.5, 45]
KNOB_FROM, KNOB_TUNED, KNOB_OVER = -50, 45, 48


def sag(x):
    for (xa, ya), (xb, yb) in zip(SAG_PTS, SAG_PTS[1:]):
        if xa <= x <= xb:
            return ya + (yb - ya) * (x - xa) / (xb - xa)
    return SAG_PTS[-1][1]


def beat_pts(amps, sagging):
    pts = [(X0, BASE)]
    for i in range(3):
        x0, a = X0 + BEAT * i, amps[i]
        for dx, dy in BEAT_OFFS[1:]:
            x = x0 + dx
            base = BASE + (sag(x) if sagging else 0)
            pts.append((round(x, 2), round(base + a * dy, 2)))
    return pts


HEALTHY = beat_pts([1, 1, 1], False)
DRIFT = beat_pts([1, 0.72, 0.45], True)


def segs(pts):
    out = []
    for a, b in zip(pts, pts[1:]):
        p1 = (a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3)
        p2 = (a[0] + 2 * (b[0] - a[0]) / 3, a[1] + 2 * (b[1] - a[1]) / 3)
        out.append((a, p1, p2, b))
    return out


TRK_H = Track(segs(HEALTHY))
TRK_D = Track(segs(DRIFT))


def samples(t0, t1, fn):
    """Sampled keys every 2 frames from t0 to t1 (inclusive), eased with smooth."""
    fs = sorted(set(list(range(t0, t1, 2)) + [t1]))
    return [(f, fn((f - t0) / (t1 - t0))) for f in fs]


def track(points):
    return kf([(t, val, LIN) for t, val in points])


def trim_scan(t0, t1):
    return lambda u: 100 * smooth(u)


def head_scan(trk):
    def f(u):
        x, y = trk.at(trk.total * smooth(u))
        return [round(x, 2), round(y, 2)]
    return f


def ease_inout_x(target):
    """Frame fraction at which the INOUT ease reaches `target` (0..1)."""
    x1, y1, x2, y2 = INOUT

    def bz(t):
        m = 1 - t
        x = 3 * m * m * t * x1 + 3 * m * t * t * x2 + t ** 3
        y = 3 * m * m * t * y1 + 3 * m * t * t * y2 + t ** 3
        return x, y

    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if bz(mid)[1] < target:
            lo = mid
        else:
            hi = mid
    return bz((lo + hi) / 2)[0]


# --- the monitor ------------------------------------------------------------

def _grid():
    items = []
    for y in (50, 70, 90, 110, 130):
        items.append(line((33, y), (247, y)))
    for x in (60, 88, 116, 144, 172, 200, 228):
        items.append(line((x, 31), (x, 147)))
    return group(items + [stroke(INK, 1.5, o=11)], "grid")


def _healthy_ink_items():
    return group([path(HEALTHY, k=0),
                  trim(e=track([(0, 100), (147, 100), (148, 0)]
                               + samples(150, 204, trim_scan(150, 204))
                               + [(240, 100)])),
                  stroke(INK, 4, o=seq(100, [(12, 28, 0, OUT), (149, 150, 100, LIN)]))],
                 "healthy")


def _glow_items():
    return group([path(HEALTHY, k=0),
                  trim(e=track([(0, 100), (147, 100), (148, 0)]
                               + samples(150, 204, trim_scan(150, 204))
                               + [(240, 100)])),
                  stroke(MINT, 10, o=seq(60, [(12, 28, 0, OUT), (149, 150, 60, LIN)]))],
                 "glow")


def _drift_items():
    return group([path(DRIFT, k=0),
                  trim(e=track([(0, 0)] + samples(30, 96, trim_scan(30, 96))
                               + [(151, 100), (152, 0), (240, 0)])),
                  stroke(INK, 4, o=seq(0, [(29, 30, 100, LIN), (142, 150, 0, OUT)]))],
                 "drift")


def _head():
    p0 = list(HEALTHY[0])
    pos = track([(0, p0)]
                + samples(30, 96, head_scan(TRK_D))
                + [(97, p0)]
                + samples(150, 204, head_scan(TRK_H))
                + [(240, p0)])
    op = seq(0, [(29, 30, 100, LIN), (96, 97, 0, LIN),
                 (149, 150, 100, LIN), (204, 205, 0, LIN)])
    return group([ell((0, 0), (12, 12)), fill(PAPER), stroke(INK, 3)],
                 "head", tr(p=pos, a=(0, 0), o=op))


def _pills():
    scale = lambda: seq(sc(100), pop_moves(88, over=118) + pop_moves(204, over=118))
    # first item draws on top, so the marks come before the pill fill
    ok_items = [check(PILL_C, 12, w=3, colour=INK),
                group([rect(PILL_C, (44, 18), 9), fill(MINT), stroke(INK, 2.5)], "pill")]
    px, py = PILL_C
    bad_items = [group([rect((px, py - 1.5), (3.2, 7.5), 1.6), fill(RED)], "bang"),
                 group([ell((px, py + 5.8), (3.6, 3.6)), fill(RED)], "bang-dot"),
                 group([rect(PILL_C, (44, 18), 9), fill(CORAL), stroke(RED, 2.5)], "pill-fill")]
    ok = pivot(PILL_C, ok_items, "pill-ok", s=scale(),
               o=seq(100, [(88, 89, 0, LIN), (204, 205, 100, LIN)]))
    bad = pivot(PILL_C, bad_items, "pill-bad", s=scale(),
                o=seq(0, [(88, 89, 100, LIN), (204, 205, 0, LIN)]))
    return [ok, bad]


def _zone():
    return group([rect((185, 93), (110, 106), 4), fill(CORAL)], "zone",
                 tr(o=seq(0, [(72, 88, 100, OUT), (112, 140, 0, OUT)])))


def _screen():
    return [group([rect(SCREEN_C, SCREEN_S, 8), fill(PAPER), stroke(INK, 2.5)], "screen")]


# --- the dial ---------------------------------------------------------------

def _dial():
    cx, cy = KNOB_C
    # the pointer passes each tick at a time the knob's INOUT ease reaches it
    knob_span = KNOB_OVER - KNOB_FROM
    tick_times = []
    for a in TICK_ANGLES:
        f = (a - KNOB_FROM) / knob_span
        tick_times.append(114 + round(24 * ease_inout_x(f)))

    knob_angle = seq(KNOB_TUNED, [(12, 28, KNOB_FROM, INOUT),
                                  (112, 136, KNOB_OVER, INOUT),
                                  (136, 144, KNOB_TUNED, OUT)])
    pointer = group([line(KNOB_C, (cx, cy - 14)), stroke(INK, 3.5)], "pointer",
                    tr(a=KNOB_C, p=KNOB_C, r=knob_angle))
    hub = group([ell(KNOB_C, (7, 7)), fill(INK)], "hub")
    knob = group([ell(KNOB_C, (2 * KNOB_R, 2 * KNOB_R)), fill(SUN), stroke(INK, 3.5)], "knob")

    ticks = []
    for i, (a, t) in enumerate(zip(TICK_ANGLES, tick_times)):
        r = math.radians(a)
        p = (round(cx + TICK_R * math.sin(r), 2), round(cy - TICK_R * math.cos(r), 2))
        fill_seq = seq(MINT, [(12, 28, PAPER, LIN), (t, t + 4, MINT, LIN)])
        ticks.append(group([ell(p, (TICK_D, TICK_D)), fill(fill_seq), stroke(INK, 2)],
                           "tick%d" % i,
                           tr(a=p, p=p, s=seq(sc(100), pop_moves(t, over=125)))))

    return [pointer, hub, knob, *ticks, bar((cx, 130), (30, 6)),
            *panel(DIAL_C, DIAL_S, r=14, sw=3.5, sh=5, name="dial")]


def build():
    return wide_comp("mlops", [
        layer("dial", _dial()),
        layer("head", [_head()]),
        layer("lines", [_healthy_ink_items(), _glow_items(), _drift_items()]),
        layer("pills", _pills()),
        layer("zone", [_zone()]),
        layer("grid", [_grid()]),
        layer("screen", _screen()),
        layer("monitor", panel(MON_C, MON_S, r=14, sw=3.5, sh=5, name="monitor")),
    ])
