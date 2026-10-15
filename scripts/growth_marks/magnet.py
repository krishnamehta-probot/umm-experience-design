"""
Card 03 -- Demand generation & channel strategy: the right visitors, counted.

Three channel tiles on the left -- a search bar, an article, a video ad --
are cabled into a filter tile, and the filter feeds a landing page on the
right.
Frame 0 is the working picture: five sky visitors sitting on the page and
the counter under them full.

The page empties and the counter drains. Then the channels send visitors:
each tile nudges as a dot leaves it, the dot runs the cable, through the
filter and lands in the next free seat on the page, and the counter grows a
step. Now and then a grey dot runs in, the filter flashes coral and kicks it
back, and it drops away. When the fifth seat fills the page bumps and sparks.

Beats (30 fps, loop 240):
  0-12    rest on the counted page
  12-30   the seated visitors shrink away; the counter drains
  36-164  five sky visitors land at 76, 92, 108, 136, 164
  56, 80, 110  grey dots set off; the filter turns them away at 78, 102, 132
  166-180 the page bumps; sparks
  180-240 rest

Build and check:  python scripts/build_growth_service_marks.py magnet
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    kf, ell, rect, path, line, stroke, fill, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, LILAC,
    OUT, INOUT, IN, SPRING, LIN, OP,
    sc, seq, smooth, layer, wide_comp, pivot, panel, bar, dashed, cubic, sparkle, Track,
)

GREY = [0.765, 0.76, 0.79, 1]        # a visitor who isn't looking for this

# --- geometry ------------------------------------------------------------------

TILE_X, TILE_S = 58, (84, 40)
TILE_Y = [34, 90, 146]                # search, article, ad
EXIT_X = 100                          # the tiles' right edge
MOUTH = (174, 90)                     # where the cables meet the filter
NOZZLE = (214, 90)                    # where the filter lets them out
PAGE_C, PAGE_S = (290, 90), (108, 148)
SEAT_Y = 116
SEATS = [254, 272, 290, 308, 326]
COUNT_Y = 142
COUNT_X0, COUNT_W = 250, 80
BOUNCE = (164, 100)                   # where a turned-away dot is knocked to
DROP = (154, 186)                     # ... and where it falls, out of sight

# qualified: (channel, seat, set off); they take 40 frames to land
QUALIFIED = [(0, 0, 36), (1, 1, 52), (2, 2, 68), (0, 3, 96), (1, 4, 124)]
RUN = 40
# turned away: (channel, set off); 22 frames to reach the filter
REJECTED = [(2, 56), (0, 80), (2, 110)]
REACH = 22
DONE = 166


def _cable(c):
    y = TILE_Y[c]
    return ((EXIT_X, y), (EXIT_X + 40, y), (MOUTH[0] - 40, MOUTH[1]), MOUTH)


def _straight(p, q):
    return (p, (p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3),
            (p[0] + 2 * (q[0] - p[0]) / 3, p[1] + 2 * (q[1] - p[1]) / 3), q)


def _inbound(seat):
    s = (SEATS[seat], SEAT_Y)
    return (NOZZLE, (NOZZLE[0] + 24, NOZZLE[1]), (s[0] - 26, s[1] - 6), s)


def _r(p):
    return [round(p[0], 2), round(p[1], 2)]


def _sampled(fn):
    """Keys every 2 frames, linear, with the holds collapsed to their ends."""
    pts = [(f, fn(f)) for f in range(0, OP + 1, 2)]
    keep = [pts[0]]
    for i in range(1, len(pts) - 1):
        if not (pts[i][1] == pts[i - 1][1] == pts[i + 1][1]):
            keep.append(pts[i])
    keep.append(pts[-1])
    return kf([(f, val, LIN) for f, val in keep])


def _start(c):
    return (EXIT_X - 6, TILE_Y[c])


# --- visitors ----------------------------------------------------------------------

def _visitor(colour):
    return [group([ell((0, 0), (13, 13)), fill(colour), stroke(INK, 2.4)], "dot")]


def _qualified(k):
    c, seat, t0 = QUALIFIED[k]
    trk = Track([_cable(c), _straight(MOUTH, NOZZLE), _inbound(seat)])
    home = (SEATS[seat], SEAT_Y)
    t1 = t0 + RUN
    hide = 12 + 2 * k

    def pos(f):
        if f <= hide + 14 or f >= t1:
            return _r(home)
        if f <= t0:
            return _r(_start(c))
        return _r(trk.at(trk.total * smooth((f - t0) / RUN)))

    s = seq(sc(100), [(hide, hide + 12, sc(0), IN), (t0, t0 + 8, sc(100), SPRING),
                      (t1, t1 + 5, sc(130), OUT), (t1 + 5, t1 + 11, sc(100), INOUT)])
    return layer("visitor%d" % k, _visitor(SKY), p=_sampled(pos), s=s)


def _rejected(k):
    c, t0 = REJECTED[k]
    trk = Track([_cable(c)])
    hit = t0 + REACH
    fall = hit + 22

    def pos(f):
        if f <= t0 or f >= fall:
            return _r(_start(c))
        if f <= hit:
            u = smooth((f - t0) / REACH)
            return _r(trk.at(trk.total * u * 0.92))
        if f <= hit + 6:
            a = trk.at(trk.total * 0.92)
            u = (f - hit) / 6
            u = 1 - (1 - u) ** 2
            return _r((a[0] + (BOUNCE[0] - a[0]) * u, a[1] + (BOUNCE[1] - a[1]) * u))
        u = (f - hit - 6) / 16
        u = u * u
        return _r((BOUNCE[0] + (DROP[0] - BOUNCE[0]) * u, BOUNCE[1] + (DROP[1] - BOUNCE[1]) * u))

    o = seq(0, [(t0, t0 + 1, 100, LIN), (hit + 10, fall - 2, 0, LIN)])
    s = seq(sc(0), [(t0, t0 + 8, sc(100), SPRING), (hit, hit + 3, [80, 120], OUT),
                    (hit + 3, hit + 8, sc(100), INOUT), (fall - 1, fall, sc(0), LIN)])
    return layer("away%d" % k, _visitor(GREY), p=_sampled(pos), s=s, o=o)


# --- the channels ---------------------------------------------------------------------

def _emits(c):
    ts = [t for ch, _, t in QUALIFIED if ch == c] + [t for ch, t in REJECTED if ch == c]
    return sorted(ts)


def _tile(c, items, fc=PAPER, r=8):
    centre = (TILE_X, TILE_Y[c])
    moves = []
    for t in _emits(c):
        moves += [(t - 4, t, [106, 94], OUT), (t, t + 8, sc(100), SPRING)]
    return pivot(centre, [*items, *panel(centre, TILE_S, r=r, fc=fc, sw=3.2, sh=4,
                                         name="tile")],
                 "channel%d" % c, s=seq(sc(100), moves))


def _channels():
    y0, y1, y2 = TILE_Y
    search = _tile(0, [
        group([line((38.5, y0 + 4.5), (43, y0 + 9)), stroke(INK, 3.4)], "handle"),
        group([ell((34, y0 - 1), (13, 13)), fill(SKY), stroke(INK, 3)], "lens"),
        bar((70, y0), (34, 6)),
    ], r=20)
    article = _tile(1, [
        group([rect((34, y1), (20, 24), 4), fill(BLOSSOM), stroke(INK, 2.4)], "picture"),
        bar((68, y1 - 6), (36, 6)),
        bar((64, y1 + 6), (28, 6)),
    ])
    ad = _tile(2, [
        group([path([(32, y2 - 5), (40.5, y2), (32, y2 + 5)], closed=True, k=0), fill(INK),
               stroke(INK, 1.6)], "play"),
        group([ell((35, y2), (24, 24)), fill(PAPER), stroke(INK, 2.6)], "disc"),
        bar((68, y2 - 6), (32, 6)),
        bar((64, y2 + 6), (24, 6)),
    ], fc=SUN)
    return [search, article, ad]


def _cables():
    out = [group([cubic(*_cable(c)), dashed(stroke(INK, 2.8, o=40), 3, 6)], "cable%d" % c)
           for c in range(3)]
    out.append(group([line(NOZZLE, (PAGE_C[0] - PAGE_S[0] / 2, NOZZLE[1])),
                      dashed(stroke(INK, 2.8, o=40), 3, 6)], "cable-in"))
    return out


# --- the filter ----------------------------------------------------------------------------

FILTER_C, FILTER_S = ((MOUTH[0] + NOZZLE[0]) / 2, 90), (NOZZLE[0] - MOUTH[0], 46)


def _filter():
    """A lilac tile with the filter glyph on it. Visitors pass underneath;
    a grey one bounces off its left edge, and the tile flashes coral and
    shakes."""
    keys, shake = [], []
    for _, t0 in REJECTED:
        hit = t0 + REACH
        keys += [(hit, hit + 2, CORAL, LIN), (hit + 10, hit + 16, LILAC, LIN)]
        shake += [(hit, hit + 3, -6, OUT), (hit + 3, hit + 7, 4, INOUT),
                  (hit + 7, hit + 12, 0, INOUT)]
    x, y = FILTER_C
    glyph = [(x - 11, y - 11), (x + 11, y - 11), (x + 3, y + 1), (x + 3, y + 10),
             (x - 3, y + 13), (x - 3, y + 1)]
    icon = group([path(glyph, closed=True, k=0), fill(PAPER), stroke(INK, 2.6)], "glyph")
    body = group([rect(FILTER_C, FILTER_S, 10), fill(seq(LILAC, keys)), stroke(INK, 3.2)],
                 "tile")
    shadow = group([rect((x + 4, y + 4), FILTER_S, 10), fill(INK)], "tile-shadow")
    return [group([icon, body], "filter", tr(a=FILTER_C, p=FILTER_C, r=seq(0, shake))),
            shadow]


# --- the landing page --------------------------------------------------------------------

def _page():
    x, y = PAGE_C
    seats = group([*[ell((sx, SEAT_Y), (13, 13)) for sx in SEATS],
                   dashed(stroke(INK, 2.2, o=45), 3, 3.2)], "seats")
    steps = []
    for k, (_, _, t0) in enumerate(QUALIFIED):
        t1 = t0 + RUN
        steps.append((t1 + 1, t1 + 9, [round(100 * (k + 1) / 5, 2), 100], OUT))
    meter = group([rect((COUNT_X0 + COUNT_W / 2, COUNT_Y), (COUNT_W, 8), 4), fill(MINT)],
                  "count",
                  tr(a=(COUNT_X0, COUNT_Y), p=(COUNT_X0, COUNT_Y),
                     s=seq([100, 100], [(14, 28, [0, 100], IN)] + steps)))
    track = group([rect((x, COUNT_Y), (COUNT_W + 8, 14), 7), fill(PAPER), stroke(INK, 2.6)],
                  "count-track")
    items = [
        meter, track, seats,
        group([rect((268, 88), (40, 14), 7), fill(CITRUS), stroke(INK, 2.4)], "button"),
        bar((276, 52), (52, 7)),
        bar((268, 66), (36, 6)),
        group([rect((x, 30), (PAGE_S[0] - 20, 10), 5), fill(SKY), stroke(INK, 2.4)], "chrome"),
        *panel(PAGE_C, PAGE_S, r=12, sw=3.5, sh=5, name="page"),
    ]
    return pivot(PAGE_C, items, "page",
                 s=seq(sc(100), [(DONE, DONE + 5, sc(105), OUT), (DONE + 5, DONE + 14, sc(100),
                                                                  SPRING)]))


def _spark(c, rad, t):
    return group([sparkle(c, rad), fill(CITRUS), stroke(INK, 1.8)], "spark",
                 tr(a=c, p=c, s=seq(sc(0), [(t, t + 6, sc(130), SPRING),
                                            (t + 6, t + 12, sc(100), LIN),
                                            (t + 12, t + 22, sc(0), IN)])))


def _sparks():
    return [_spark((350, 20), 5, DONE + 4),
            _spark((232, 12), 4, DONE + 8),
            _spark((354, 52), 3.5, DONE + 12)]


def build():
    return wide_comp("attract", [
        layer("sparks", _sparks()),
        layer("filter", _filter()),
        *[_qualified(k) for k in range(len(QUALIFIED))],
        *[_rejected(k) for k in range(len(REJECTED))],
        layer("page", [_page()]),
        layer("channels", _channels()),
        layer("cables", _cables()),
    ])
