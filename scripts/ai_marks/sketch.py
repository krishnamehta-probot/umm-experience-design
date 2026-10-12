"""
AI PROTOTYPES & PRODUCT DEVELOPMENT -- sketch to real product.

A big app window. A pencil sketches its layout in wobbly ink lines, then a
light band sweeps across and each sketch element is replaced by the real one.
A cursor clicks the real button, a mint tick badge pops on the corner.
Frame 0 is the finished product.

    python scripts/ai_marks/_preview.py sketch prototype
"""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (
    path, line, stroke, fill, trim, tr, group, ell, rect,
    INK, PAPER, BLOSSOM, SKY, CORAL, SUN, MINT,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, wide_comp, pivot, panel, bar, sparkle, check, Track, layer,
)

# --- timing constants ----------------------------------------------------------
# The sketch is drawn 26-113 with 6-frame pencil travel between strokes, so the
# sweep, click and badge sit about 20 frames later than the first storyboard.

PENCIL_REST = (440, 120)           # off the right edge
PENCIL_LIFT = (226, 110)
PENCIL_EXIT = (400, -40)
PENCIL_ANGLE = -20
PENCIL_SCALE = 125

SWEEP0, SWEEP1 = 126, 160          # band crosses the window, inside its frame
BAND_X0, BAND_X1 = 76, 284         # just inside the left and right edges
CURSOR_REST = (268, 126)           # tip on the button's lower-right, body inside the frame
CURSOR_OFF = (400, 150)
CURSOR_CLICK = (246, 122)
CURSOR_SCALE = 1.2
CLICK_AT = 186
TICK_IN = 206


def bez(u, e):
    """Value of a cubic-bezier ease e = (x1, y1, x2, y2) at time fraction u."""
    x1, y1, x2, y2 = e
    lo, hi = 0.0, 1.0
    for _ in range(50):
        s = (lo + hi) / 2
        x = 3 * (1 - s) ** 2 * s * x1 + 3 * (1 - s) * s * s * x2 + s ** 3
        if x < u:
            lo = s
        else:
            hi = s
    s = (lo + hi) / 2
    return 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s * s * y2 + s ** 3


def star(c, r, k=0.42):
    """A sparkle: four long points and a fuller centre (inner radius k * r)."""
    x, y = c
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * k
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    return path(pts, closed=True, k=0)


def band_x(f):
    u = min(1.0, max(0.0, (f - SWEEP0) / (SWEEP1 - SWEEP0)))
    return BAND_X0 + (BAND_X1 - BAND_X0) * bez(u, INOUT)


def pop_at(x):
    """First frame at which the band's centre has reached x."""
    for f in range(SWEEP0, SWEEP1 + 1):
        if band_x(f) >= x:
            return f
    return SWEEP1


# --- sketch geometry (the same boxes as the real content) -----------------------

HEADER = [(78.5, 41.6), (120, 40.4), (180, 41.4), (240, 40.6), (281.5, 41.5),
          (282.4, 56.3), (240, 57.4), (180, 56.5), (120, 57.6), (78.4, 56.4)]
BOX = [(78.6, 68.4), (112, 67.3), (146.3, 68.8), (146.8, 93), (146.2, 117.4),
       (112, 118.6), (78.3, 117.2), (78.8, 93)]
X1 = [(84.5, 74.5), (112, 93.5), (140.5, 112.6)]
X2 = [(84.2, 112.4), (112.6, 92.5), (140.2, 74.2)]
L1 = [(160.5, 71.4), (190, 70.4), (215, 71.6), (245, 70.6), (270.5, 71.2)]
L2 = [(160.6, 85.3), (190, 84.2), (225, 85.8), (256.4, 84.9)]
L3 = [(160.4, 98.8), (185, 99.9), (210, 98.2), (230.6, 99.4)]
BTN = [(218.6, 113.4), (250, 112.6), (281.6, 113.8), (282.3, 134.6),
       (250, 135.5), (218.2, 134.4)]

# Stroke timing: (name, points, closed, t0, t1, outer group, pop frame)
# The pop frame for each sketch element is set below from the band position.
STROKES = [
    ("sk_head", HEADER, True, 26, 36, "sk_header"),
    ("sk_box", BOX, True, 42, 50, "sk_image"),
    ("sk_x1", X1, False, 56, 59, "sk_image"),
    ("sk_x2", X2, False, 65, 68, "sk_image"),
    ("sk_l1", L1, False, 74, 79, "sk_line0"),
    ("sk_l2", L2, False, 85, 89, "sk_line1"),
    ("sk_l3", L3, False, 95, 99, "sk_line2"),
    ("sk_btn", BTN, True, 105, 113, "sk_button"),
]

# Pop frames, from where the band reaches each element's left edge.
T_HEAD = pop_at(78)        # header and image tile
T_LINES = pop_at(160)      # three text lines, staggered by 2 frames
T_BTN = pop_at(218)        # button
OUTER_FADE = {"sk_header": T_HEAD, "sk_image": T_HEAD, "sk_line0": T_LINES,
              "sk_line1": T_LINES + 2, "sk_line2": T_LINES + 4, "sk_button": T_BTN}


def fade_seq(t_fade):
    """Sketch group opacity: on while it is drawn, off once the band is past."""
    return seq(0, [(22, 23, 100, LIN), (t_fade, t_fade + 6, 0, IN)])


def pop_scale(t, over=108):
    return [(t, t + 8, sc(over), SPRING), (t + 8, t + 16, sc(100), LIN)]


def pop_fade(t):
    """Real element: gone with the rest at 12-22, back in at its pop frame."""
    return [(12, 22, 0, IN), (t, t + 8, 100, OUT)]


# --- sketch strokes, each with a trim that draws it and a pencil that follows ----

def sketch_stroke(name, pts, closed, t0, t1, t_fade):
    """Returns (inner group, start point, pencil samples, end point). The pencil
    sits at the arc length the trim has reached, using the same bezier as the trim."""
    segs = []
    ps = list(pts) + ([pts[0]] if closed else [])
    for a, b in zip(ps, ps[1:]):
        d = (b[0] - a[0], b[1] - a[1])
        segs.append((a, (a[0] + d[0] / 3, a[1] + d[1] / 3),
                     (a[0] + 2 * d[0] / 3, a[1] + 2 * d[1] / 3), b))
    trk = Track(segs)
    e = seq(0, [(t0, t1, 100, INOUT), (t_fade + 7, t_fade + 8, 0, LIN)])
    g = group([path(pts, closed=closed, k=0), trim(e=e), stroke(INK, 2.5, o=45)], name)
    samples = []
    for f in range(t0 + 1, t1 + 1):
        u = (f - t0) / (t1 - t0)
        x, y = trk.at(trk.total * bez(u, INOUT))
        samples.append((f, [round(x, 2), round(y, 2)]))
    end = pts[0] if closed else pts[-1]
    return g, list(pts[0]), samples, end


def build_sketch_and_pencil():
    inner = {}
    pencil_moves = [(22, 26, list(HEADER[0]), OUT)]   # enters from the right
    cur = 26
    for name, pts, closed, t0, t1, gname in STROKES:
        t_fade = OUTER_FADE[gname]
        g, start, samples, end = sketch_stroke(name, pts, closed, t0, t1, t_fade)
        inner.setdefault(gname, []).append(g)
        if t0 > cur:
            pencil_moves.append((cur, t0, start, OUT))     # travel to the next start
        prev = t0
        for f, p in samples:
            pencil_moves.append((prev, f, p, LIN))
            prev = f
        cur = t1
    # lift off the paper and exit up and to the right, then park off the edge
    pencil_moves.append((cur, cur + 4, list(PENCIL_LIFT), OUT))
    pencil_moves.append((cur + 4, cur + 13, list(PENCIL_EXIT), IN))
    pencil_moves.append((200, 201, list(PENCIL_REST), LIN))   # unseen

    sk = []
    for gname, items in inner.items():
        sk.append(group(items, gname, tr(o=fade_seq(OUTER_FADE[gname]))))
    return sk, pencil_moves


def pencil(moves):
    body = [
        group([path([(0, 0), (14, -6), (14, 6)], closed=True, k=0),
               fill(PAPER), stroke(INK, 2.4)], "wood"),
        group([path([(0, 0), (4.5, -2.4), (4.5, 2.4)], closed=True, k=0),
               fill(INK)], "lead"),
        group([rect((36, 0), (44, 12), 2), fill(SUN), stroke(INK, 2.6)], "body"),
        group([line((58, -6), (58, 6)), stroke(INK, 2.2)], "ferrule"),
        group([rect((64, 0), (12, 12), 3), fill(CORAL), stroke(INK, 2.6)], "eraser"),
    ]
    return group(body, "pencil", tr(a=(0, 0), p=seq(list(PENCIL_REST), moves),
                                    s=sc(PENCIL_SCALE), r=PENCIL_ANGLE))


# --- real content ----------------------------------------------------------------

def real_content():
    header = pivot((180, 49), [
        group([rect((180, 49), (204, 16), 4), fill(SKY), stroke(INK, 2.8)], "bar"),
    ], "real_header", s=seq(sc(100), pop_scale(T_HEAD)), o=seq(100, pop_fade(T_HEAD)))

    image = pivot((112, 93), [
        # first in the list draws on top: the sparkle before its tile
        group([star((112, 93), 14), fill(PAPER), stroke(INK, 2)], "spark"),
        group([rect((112, 93), (68, 50), 5), fill(BLOSSOM), stroke(INK, 2.8)], "tile"),
    ], "real_image", s=seq(sc(100), pop_scale(T_HEAD)), o=seq(100, pop_fade(T_HEAD)))

    lines = []
    for i, (cx, cy, w) in enumerate([(215, 71, 110), (208, 85, 96), (195, 99, 70)]):
        t = T_LINES + 2 * i
        lines.append(pivot((cx, cy), [bar((cx, cy), (w, 8))], "real_line%d" % i,
                           s=seq(sc(100), pop_scale(t)), o=seq(100, pop_fade(t))))

    btn_clicks = pop_scale(T_BTN) + [(CLICK_AT, CLICK_AT + 4, sc(92), IN),
                                     (CLICK_AT + 4, CLICK_AT + 12, sc(100), SPRING)]
    button = pivot((250, 124), [
        group([rect((250, 124), (64, 22), 6), fill(INK)], "btn"),
        bar((250, 124), (24, 6), colour=PAPER, o=100),
    ], "real_button", s=seq(sc(100), btn_clicks), o=seq(100, pop_fade(T_BTN)))

    return [header, image, *lines, button]


# --- cursor, click ring, tick badge, sweep band ------------------------------------

def cursor():
    base = [(0, 0), (0, 17), (4.5, 13), (8, 20.5), (10.5, 19.5), (7, 12.5), (13, 12.5)]
    pts = [(x * CURSOR_SCALE, y * CURSOR_SCALE) for x, y in base]
    pos = seq(list(CURSOR_REST), [
        (12, 26, list(CURSOR_OFF), IN),
        (CLICK_AT - 24, CLICK_AT, list(CURSOR_CLICK), INOUT),
        (CLICK_AT + 4, CLICK_AT + 20, list(CURSOR_REST), INOUT),
    ])
    return group([path(pts, closed=True, k=0), fill(INK), stroke(PAPER, 2.4)],
                 "cursor", tr(a=(0, 0), p=pos))


def click_ring():
    """An ink ring the size of the button, growing to 1.35x and fading out
    over 12 frames. Stays inside the window."""
    s = seq(sc(100), [(CLICK_AT, CLICK_AT + 12, sc(135), OUT),
                      (CLICK_AT + 12, CLICK_AT + 13, sc(100), LIN)])
    o = seq(0, [(CLICK_AT, CLICK_AT + 1, 80, LIN), (CLICK_AT + 1, CLICK_AT + 12, 0, OUT)])
    return pivot((250, 124), [
        group([rect((250, 124), (64, 22), 6), stroke(INK, 2.5)], "ring"),
    ], "click_ring", s=s, o=o)


def tick_badge():
    c = (292, 18)
    s = seq(sc(100), [(12, 24, sc(0), IN), (TICK_IN, TICK_IN + 14, sc(100), SPRING)])
    return pivot(c, [
        check(c, 15, 3),  # first in the list draws on top
        group([ell(c, (26, 26)), fill(MINT), stroke(INK, 3)], "disc"),
    ], "tick_badge", s=s)


def sweep_band():
    pos = seq([BAND_X0, 87], [(SWEEP0, SWEEP1, [BAND_X1, 87], INOUT),
                              (SWEEP1 + 9, SWEEP1 + 10, [BAND_X0, 87], LIN)])
    o = seq(0, [(SWEEP0, SWEEP0 + 4, 100, LIN), (SWEEP1, SWEEP1 + 8, 0, IN)])
    return group([
        group([star((0, 0), 14), fill(PAPER), stroke(INK, 2.2)], "band_spark"),
        group([rect((0, 0), (18, 150), 9), fill(SUN)], "band_body"),
    ], "sweep", tr(a=(0, 0), p=pos, o=o))


# --- scene ---------------------------------------------------------------------------

def build():
    sk, pencil_moves = build_sketch_and_pencil()
    window = panel((180, 87), (232, 146), r=14, fc=PAPER, sw=3.5, sh=5, name="window")
    top = [
        group([ell((84, 22), (6, 6)), fill(INK)], "dot0"),
        group([ell((94, 22), (6, 6)), fill(INK)], "dot1"),
        group([ell((104, 22), (6, 6)), fill(INK)], "dot2"),
        group([line((78, 31), (282, 31)), stroke(INK, 2, o=30)], "divider"),
    ]
    return wide_comp("prototype", [
        layer("cursor", [cursor()]),
        layer("tick", [tick_badge()]),
        layer("ring", [click_ring()]),
        layer("band", [sweep_band()]),
        layer("pencil", [pencil(pencil_moves)]),
        layer("real", real_content()),
        layer("sketch", sk),
        layer("window", [*window, *top]),
    ])
