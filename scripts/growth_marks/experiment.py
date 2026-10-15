"""
Card 05 -- Analytics, attribution & growth measurement: run the test, read
it against the baseline, make the call.

An A/B test: two variant cards side by side, told apart by colour (sky and
citrus chips in their headers, bars in the same colours), with a dashed
baseline running across both. The bars climb in steps as results come in;
sky leads at first, then citrus overtakes and passes the baseline while sky
stays under it. Citrus gets a winner rosette on its bar and a mint check on
its card, and a decision arrow draws from it to a next-step card, whose flag
goes up in the winner's colour.

Frame 0 is the decided picture: sky under the line, citrus over it with its
rosette and check, the arrow drawn, the next step flagged.

Beats (30 fps, loop 240):
  0-12    rest on the decided picture
  12-28   the bars drop to stubs; rosette, check, arrow and next card clear
  34-122  results come in: five steps each, sky then citrus four frames
          after; citrus crosses the baseline on its fourth step (~96)
  116     the winner rosette pops on citrus's bar
  126     the mint check pops on its card
  140-156 the decision arrow draws; arrowhead (154)
  158     the next-step card pops; its flag goes up (172)
  190-240 rest

Build and check:  python scripts/build_growth_service_marks.py experiment
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    ell, rect, path, line, stroke, fill, trim, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, SUN,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, pop_moves, layer, wide_comp, pivot,
    panel, bar, dashed, check, sparkle, MINT,
)

# --- geometry ------------------------------------------------------------------

CARD_S = (84, 128)
VX = [66, 170]                          # variant A (sky), variant B (citrus)
COLOURS = [SKY, CITRUS]
CARD_Y = 90
TOP = CARD_Y - CARD_S[1] / 2            # 26
FLOOR = 140
BAR_W = 32
STUB = 6

BASE_H = 54
BASE_Y = FLOOR - BASE_H                 # the dashed baseline, y 86

# heights after each step of results; the last is the decided one
STEPS = [[10, 22, 30, 34, 38],          # sky: leads early, stays under
         [8, 16, 34, 56, 76]]           # citrus: overtakes, passes the line
STEP_AT = [34, 52, 70, 88, 106]
LAG = [0, 4]

NEXT_C, NEXT_S = (304, 90), (72, 84)
ARROW = ((222, 90), (256, 90))

CLEAR = 12
ROSETTE_AT = 116
CHECK_AT = 126
ARROW_T = (140, 156)
NEXT_AT = 158
FLAG_AT = 172


# --- the variant cards -----------------------------------------------------------

def variant(i):
    x = VX[i]
    c = (x, CARD_Y)
    head = [group([rect((x - 26, TOP + 16), (14, 14), 4), fill(COLOURS[i]), stroke(INK, 2.4)],
                  "chip"),
            bar((x + 8, TOP + 16), (34, 6))]
    floor = group([line((x - 30, FLOOR), (x + 30, FLOOR)), stroke(INK, 3)], "floor")
    grid = group([line((x - 30, y), (x + 30, y)) for y in (64, 112)]
                 + [stroke(INK, 1.5, o=11)], "grid")
    return [*head, floor, grid, *panel(c, CARD_S, r=14, sw=3.5, sh=5, name="variant%d" % i)]


def result_bar(i):
    x, hs = VX[i], STEPS[i]
    final = hs[-1]

    def size(h):
        return [BAR_W, h]

    def ctr(h):
        return [x, FLOOR - h / 2]

    moves_s = [(CLEAR + 2 + 2 * i, CLEAR + 14 + 2 * i, size(STUB), IN)]
    moves_c = [(CLEAR + 2 + 2 * i, CLEAR + 14 + 2 * i, ctr(STUB), IN)]
    for t, h in zip(STEP_AT, hs):
        t += LAG[i]
        moves_s.append((t, t + 12, size(h), SPRING))
        moves_c.append((t, t + 12, ctr(h), SPRING))
    return group([rect(seq(ctr(final), moves_c), seq(size(final), moves_s), 5),
                  fill(COLOURS[i]), stroke(INK, 3)], "result%d" % i)


def baseline():
    return group([line((18, BASE_Y), (216, BASE_Y)), dashed(stroke(INK, 3, o=70), 6, 5)],
                 "baseline")


# --- the verdict ----------------------------------------------------------------

def rosette():
    x = VX[1]
    c = (x, FLOOR - STEPS[1][-1] - 2)
    cx, cy = c
    tails = group([path([(cx - 7, cy + 4), (cx - 11, cy + 20), (cx - 5, cy + 16),
                         (cx - 1, cy + 21), (cx + 1, cy + 6)], closed=True, k=0),
                   path([(cx + 7, cy + 4), (cx + 11, cy + 20), (cx + 5, cy + 16),
                         (cx + 1, cy + 21), (cx - 1, cy + 6)], closed=True, k=0),
                   fill(BLOSSOM), stroke(INK, 2.4)], "tails")
    disc = group([ell(c, (24, 24)), fill(SUN), stroke(INK, 3)], "disc")
    star = group([sparkle(c, 7.5), fill(INK)], "star")
    return pivot(c, [star, disc, tails], "rosette",
                 s=seq(sc(100), [(CLEAR, CLEAR + 8, sc(0), IN)] + pop_moves(ROSETTE_AT, over=135)))


def winner_check():
    c = (VX[1] + CARD_S[0] / 2 - 4, TOP + 4)
    return pivot(c, [check(c, 11, 3),
                     group([ell(c, (24, 24)), fill(MINT), stroke(INK, 2.8)], "disc")],
                 "check",
                 s=seq(sc(100), [(CLEAR, CLEAR + 8, sc(0), IN)] + pop_moves(CHECK_AT, over=132)))


def decision():
    (x0, y0), (x1, y1) = ARROW
    shaft = group([line((x0, y0), (x1, y1)),
                   trim(e=seq(100, [(CLEAR, CLEAR + 8, 0, IN), (ARROW_T[0], ARROW_T[1], 100, INOUT)])),
                   stroke(INK, 4)], "shaft")
    head = pivot((x1, y1), [group([path([(x1 - 7, y1 - 8), (x1 + 1, y1), (x1 - 7, y1 + 8)], k=0),
                                   stroke(INK, 4)], "chevron")],
                 "arrowhead",
                 s=seq(sc(100), [(CLEAR, CLEAR + 6, sc(0), IN)] + pop_moves(ARROW_T[1] - 2, over=135)))
    return [head, shaft]


def next_step():
    cx, cy = NEXT_C
    px, top = cx - 16, cy - 26
    pennant = pivot((px, top + 7),
                    [group([path([(px, top), (px + 22, top + 7), (px, top + 14)], closed=True, k=0),
                            fill(CITRUS), stroke(INK, 2.8)], "pennant")],
                    "flag", s=seq(sc(100), [(CLEAR, CLEAR + 6, sc(0), IN)]
                                  + pop_moves(FLAG_AT, over=130)))
    pole = group([line((px, cy + 6), (px, top - 1)), stroke(INK, 3.2)], "pole")
    items = [pennant, pole,
             bar((cx + 2, cy + 18), (44, 6)),
             bar((cx - 6, cy + 30), (28, 6), o=40),
             *panel(NEXT_C, NEXT_S, r=14, sw=3.5, sh=5, name="next")]
    return pivot(NEXT_C, items, "next-step",
                 s=seq(sc(100), [(CLEAR + 2, CLEAR + 12, sc(0), IN)]
                       + pop_moves(NEXT_AT, over=112, up=10, down=8)))


def build():
    return wide_comp("learn", [
        layer("verdict", [rosette(), winner_check()]),
        layer("baseline", [baseline()]),
        layer("bars", [result_bar(1), result_bar(0)]),
        layer("variants", [g for i in (1, 0) for g in variant(i)]),
        layer("decision", decision()),
        layer("next", [next_step()]),
    ])
