"""
Card 01 -- Growth strategy & commercial planning: everyone pointing one way.

A team board on the left holds four arrows in four pastels; a roadmap board
on the right runs three milestones along a road to a target with a flag.
Frame 0 is the agreed plan: every arrow points the same way, at the target;
the road is drawn to the end, each milestone is mint with a check, the flag
is up.

The plan comes apart: the checks and the flag drop, the road empties, and
the arrows swing off in four directions and twitch about, undecided. Then,
one at a time, they swing round to point the same way. With everyone
aligned, the road draws itself out milestone by milestone, each one filling
mint with a check, and the flag goes up on the target.

Beats (30 fps, loop 240):
  0-12    rest on the aligned plan
  12-30   checks, milestones, road and flag clear; arrows swing apart
  34-62   the arrows twitch, each its own way
  66-116  one by one, they swing round to point at the target
  118-172 the road draws; milestones fill at 128, 144, 160
  170-186 the target pops, the flag goes up; sparks
  190-240 rest

Build and check:  python scripts/build_growth_service_marks.py compass
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, pop_moves, layer, wide_comp, pivot, panel, bar, dashed, check, sparkle,
)

# --- geometry ------------------------------------------------------------------

TEAM_C, TEAM_S = (80, 90), (128, 148)
ROAD_C, ROAD_S = (258, 90), (168, 148)

# arrow centre, colour, the way it points while undecided (degrees, clockwise)
ARROWS = [
    ((56, 50), SKY, 135),
    ((106, 74), BLOSSOM, -70),
    ((54, 110), SUN, -150),
    ((104, 134), PERI, 95),
]
SWING_OUT = [14, 16, 18, 20]
ALIGN_AT = [66, 80, 94, 106]

ROAD_Y = 104
ROAD_X0, ROAD_X1 = 190, 296
MILES = [204, 238, 272]
TARGET = (314, ROAD_Y)
POLE_TOP = (314, 56)

# road progress (percent of its length) and when it gets there
PROGRESS = [(118, 128, 13), (132, 144, 45), (148, 160, 77), (162, 172, 100)]
FILL_AT = [128, 144, 160]
FLAG_AT = 172


# --- the team: four arrows -------------------------------------------------------

def _arrow_pts(c):
    x, y = c
    return [(x - 23, y - 5), (x + 3, y - 5), (x + 3, y - 13), (x + 23, y),
            (x + 3, y + 13), (x + 3, y + 5), (x - 23, y + 5)]


def _angle(i):
    r0 = ARROWS[i][2]
    t0, a = SWING_OUT[i], ALIGN_AT[i]
    w = 34 + 6 * i                          # each twitches on its own beat
    d = 16 if i % 2 == 0 else -16
    return seq(0, [(t0, t0 + 16, r0, OUT),
                   (w, w + 6, r0 + d, INOUT), (w + 6, w + 13, r0 - d * 0.6, INOUT),
                   (w + 13, w + 19, r0, INOUT),
                   (a, a + 14, 0, SPRING)])


def _arrow(i):
    c, colour, _ = ARROWS[i]
    a = ALIGN_AT[i]
    r = _angle(i)
    bump = seq(sc(100), [(a + 10, a + 15, sc(112), OUT), (a + 15, a + 22, sc(100), INOUT)])
    body = group([path(_arrow_pts(c), closed=True, k=0), fill(colour), stroke(INK, 3)],
                 "arrow", tr(a=c, p=c, r=r, s=bump))
    sc_ = (c[0] + 3, c[1] + 3)
    shadow = group([path(_arrow_pts(sc_), closed=True, k=0), fill(INK)],
                   "arrow-shadow", tr(a=sc_, p=sc_, r=_angle(i), s=bump))
    return [body, shadow]


def _team():
    arrows = []
    for i in range(len(ARROWS)):
        arrows += _arrow(i)
    return arrows


# --- the roadmap ------------------------------------------------------------------

def _road():
    keys = [(12, 28, 0, IN)] + [(a, b, pc, OUT) for a, b, pc in PROGRESS]
    drawn = group([line((ROAD_X0, ROAD_Y), (ROAD_X1, ROAD_Y)), trim(e=seq(100, keys)),
                   stroke(INK, 4.5)], "road")
    track = group([line((ROAD_X0, ROAD_Y), (ROAD_X1, ROAD_Y)),
                   dashed(stroke(INK, 3, o=35), 3, 6)], "road-track")
    return [drawn, track]


def _milestone(i):
    x, t = MILES[i], FILL_AT[i]
    c = (x, ROAD_Y)
    disc = group([ell(c, (22, 22)),
                  fill(seq(MINT, [(12 + 2 * i, 20 + 2 * i, PAPER, LIN), (t, t + 4, MINT, LIN)])),
                  stroke(INK, 3)], "disc")
    tick = pivot(c, [check(c, 11, 2.8)], "tick",
                 s=seq(sc(100), [(12 + 2 * i, 22 + 2 * i, sc(0), IN),
                                 (t + 2, t + 12, sc(100), SPRING)]))
    label = bar((x, ROAD_Y + 26), (20, 5))
    return [pivot(c, [tick, disc], "milestone%d" % i,
                  s=seq(sc(100), pop_moves(t, over=136))), label]


def _target():
    rings = [
        group([ell(TARGET, (9, 9)), fill(INK)], "bull"),
        group([ell(TARGET, (24, 24)), fill(PAPER), stroke(INK, 2.6)], "ring"),
        group([ell(TARGET, (38, 38)), fill(CITRUS), stroke(INK, 3.2)], "outer"),
        group([ell((TARGET[0] + 4, TARGET[1] + 4), (38, 38)), fill(INK)], "outer-shadow"),
    ]
    return pivot(TARGET, rings, "target",
                 s=seq(sc(100), [(FLAG_AT - 2, FLAG_AT + 4, sc(114), OUT),
                                 (FLAG_AT + 4, FLAG_AT + 12, sc(100), SPRING)]))


def _flag():
    fx, fy = POLE_TOP
    cloth = group([path([(fx, fy), (fx + 17, fy + 6), (fx, fy + 12)], closed=True, k=0),
                   fill(CORAL), stroke(INK, 2.6)], "cloth")
    pole = group([line((fx, TARGET[1]), (fx, fy)), stroke(INK, 3.2)], "pole")
    base = (fx, TARGET[1])
    return pivot(base, [cloth, pole], "flag",
                 s=seq(sc(100), [(12, 24, [100, 0], IN), (FLAG_AT, FLAG_AT + 14, sc(100), SPRING)]))


def _spark(c, rad, t):
    return group([sparkle(c, rad), fill(CITRUS), stroke(INK, 1.8)], "spark",
                 tr(a=c, p=c, s=seq(sc(0), [(t, t + 6, sc(130), SPRING),
                                            (t + 6, t + 12, sc(100), LIN),
                                            (t + 12, t + 22, sc(0), IN)])))


def _sparks():
    return [_spark((336, 40), 5, FLAG_AT + 10),
            _spark((292, 44), 4, FLAG_AT + 14),
            _spark((340, 74), 3.5, FLAG_AT + 18)]


def _roadmap():
    items = [_flag(), _target()]
    for i in range(len(MILES)):
        items += _milestone(i)
    items += _road()
    items += [bar((210, 38), (40, 7)), bar((204, 52), (28, 6), o=40)]
    return items


def build():
    return wide_comp("align", [
        layer("sparks", _sparks()),
        layer("roadmap", _roadmap()),
        layer("road-board", panel(ROAD_C, ROAD_S, r=14, sw=3.5, sh=5, name="roadmap")),
        layer("arrows", _team()),
        layer("team", [bar((40, 28), (28, 6), o=40)]
              + panel(TEAM_C, TEAM_S, r=14, sw=3.5, sh=5, name="team")),
    ])
