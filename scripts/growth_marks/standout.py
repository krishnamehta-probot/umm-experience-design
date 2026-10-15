"""
Card 02 -- Brand & market positioning: the one the customer can tell apart.

Three product cards in a row, a message card under them, and a customer on
the right with a speech bubble. Frame 0 is the positioned picture: the middle
card in its own colour, lifted forward with a star on its corner; the
customer's bubble holds that same card and a line of praise; the message card
below carries three bullet points.

The picture goes flat: the star drops, the middle card falls back into line
and greys out like the others, the message card and the bubble go. The
customer looks along the row with a "..." bubble -- every card bobs, and they
all look the same. Then the middle card takes its colour and lifts forward,
the star pops on it, the bubble swaps its dots for the card, and the message
card stacks in below, bullet by bullet.

Beats (30 fps, loop 240):
  0-12    rest on the positioned picture
  12-30   star, colour, lift, bubble and message card go
  36      the bubble comes back with three dots
  44-74   the cards bob in turn; the dots pulse
  84-102  the middle card takes its colour and lifts forward
  102     the star pops on its corner
  114-130 the bubble's dots give way to the card and a bar
  138-172 the message card stacks in; its bullets draw at 148, 156, 164
  176     sparks by the star
  190-240 rest

Build and check:  python scripts/build_growth_service_marks.py standout
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    ell, rect, path, line, stroke, fill, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, SUN,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, pop_moves, layer, wide_comp, pivot, panel, bar, sparkle,
)

GREY = [0.875, 0.87, 0.89, 1]        # a card like every other card
GREY_D = [0.765, 0.76, 0.79, 1]      # its picture

CARD_Y, CARD_S = 60, (58, 72)
CARD_X = [50, 120, 190]
CHOSEN = 1
LIFT = 7                             # how far the chosen card rises

MSG_C, MSG_S = (120, 143), (156, 50)
BULLETS = [(129, 82), (143, 64), (157, 94)]      # y, bar width
BULLET_AT = [148, 156, 164]

AV_C = (300, 136)
BUB_C, BUB_S = (298, 52), (92, 50)
TAIL_TIP = (296, 99)

BOB_AT = [44, 54, 64]
COLOUR_AT = 84
LIFT_AT = 86
STAR_AT = 102
SWAP_AT = 114
MSG_AT = 138


# --- the product cards -------------------------------------------------------------

def _card_bits(c, block_c, bars_o=88):
    x, y = c
    return [bar((x - 4, y + 13), (34, 5), o=bars_o), bar((x - 8, y + 23), (26, 5), o=bars_o),
            group([rect((x, y - 11), (42, 28), 5), fill(block_c), stroke(INK, 2.4)], "picture")]


def _plain_card(i):
    x = CARD_X[i]
    c = (x, CARD_Y)
    t = BOB_AT[i]
    bob = seq(sc(100), [(t, t + 5, sc(107), OUT), (t + 5, t + 12, sc(100), INOUT)])
    return [pivot(c, [*_card_bits(c, GREY_D, 45),
                      group([rect(c, CARD_S, 9), fill(GREY), stroke(INK, 3)], "card")],
                  "card%d" % i, s=bob),
            group([rect((x + 4, CARD_Y + 4), CARD_S, 9), fill(INK)], "card-shadow")]


def _chosen():
    x = CARD_X[CHOSEN]
    c = (x, CARD_Y)
    t = BOB_AT[CHOSEN]
    lifted, flat = [x, CARD_Y - LIFT], [x, CARD_Y]
    scale = seq(sc(112), [(14, 28, sc(100), INOUT),
                          (t, t + 5, sc(107), OUT), (t + 5, t + 12, sc(100), INOUT),
                          (LIFT_AT, LIFT_AT + 16, sc(112), SPRING)])
    pos = seq(lifted, [(14, 28, flat, INOUT), (LIFT_AT, LIFT_AT + 16, lifted, SPRING)])
    body_c = seq(BLOSSOM, [(16, 26, GREY, LIN), (COLOUR_AT, COLOUR_AT + 8, BLOSSOM, LIN)])
    block_c = seq(PAPER, [(16, 26, GREY_D, LIN), (COLOUR_AT, COLOUR_AT + 8, PAPER, LIN)])
    bars_o = seq(88, [(16, 26, 45, LIN), (COLOUR_AT, COLOUR_AT + 8, 88, LIN)])

    sx, sy = x + CARD_S[0] / 2 - 5, CARD_Y - CARD_S[1] / 2 + 5
    star = pivot((sx, sy), [group([sparkle((sx, sy), 11), fill(CITRUS), stroke(INK, 2.6)],
                                  "star")],
                 "star", s=seq(sc(100), [(12, 20, sc(0), IN)] + pop_moves(STAR_AT, over=140)))
    card = pivot(c, [star, *_card_bits(c, block_c, bars_o),
                     group([rect(c, CARD_S, 9), fill(body_c), stroke(INK, 3)], "card")],
                 "chosen", p=pos, s=scale)
    # the shadow stays down on the table, so it reads deeper as the card lifts
    sh_c = (x + 4, CARD_Y + 4)
    shadow = pivot(sh_c, [group([rect(sh_c, CARD_S, 9), fill(INK)], "shadow")],
                   "chosen-shadow",
                   p=seq([x + 7, CARD_Y + 1], [(14, 28, list(sh_c), INOUT),
                                              (LIFT_AT, LIFT_AT + 16, [x + 7, CARD_Y + 1],
                                               SPRING)]),
                   s=seq(sc(112), [(14, 28, sc(100), INOUT),
                                   (t, t + 5, sc(107), OUT), (t + 5, t + 12, sc(100), INOUT),
                                   (LIFT_AT, LIFT_AT + 16, sc(112), SPRING)]))
    return [card, shadow]


# --- the message card ----------------------------------------------------------------

def _message():
    x0 = MSG_C[0] - MSG_S[0] / 2 + 18
    items = []
    for i, ((y, w), t) in enumerate(zip(BULLETS, BULLET_AT)):
        bx = x0 + 12
        items.append(pivot((x0, y), [group([ell((x0, y), (8, 8)), fill(BLOSSOM),
                                            stroke(INK, 2.2)], "dot")],
                           "bullet%d" % i,
                           s=seq(sc(100), [(26, 28, sc(0), LIN)] + pop_moves(t, over=150))))
        items.append(group([rect((bx + w / 2, y), (w, 6), 3), fill(INK, 88)], "line%d" % i,
                           tr(a=(bx, y), p=(bx, y),
                              s=seq([100, 100], [(26, 28, [0, 100], LIN),
                                                 (t + 2, t + 14, [100, 100], OUT)]))))
    items += panel(MSG_C, MSG_S, r=12, sw=3.5, sh=5, name="message")
    return pivot(MSG_C, items, "message",
                 s=seq(sc(100), [(14, 26, sc(0), IN)] + pop_moves(MSG_AT, over=112)))


# --- the customer ------------------------------------------------------------------------

def _customer():
    x, y = AV_C
    return [
        group([ell((x, y - 9), (16, 16)), fill(INK)], "head"),
        group([rect((x, y + 13), (24, 13), 6.5), fill(INK)], "shoulders"),
        group([ell(AV_C, (50, 50)), fill(SKY), stroke(INK, 3.2)], "circle"),
        group([ell((x + 4, y + 4), (50, 50)), fill(INK)], "circle-shadow"),
    ]


def _bubble():
    bx, by = BUB_C
    tx, ty = TAIL_TIP
    edge = by + BUB_S[1] / 2
    a, b = (tx - 8, edge), (tx + 10, edge)          # the tail's base on the bubble's edge
    tail_fill = group([path([(a[0], edge - 2), (tx, ty), (b[0], edge - 2)],
                            closed=True, k=0), fill(PAPER)], "tail")
    tail_line = group([path([b, (tx, ty), a], k=0), stroke(INK, 3.5)], "tail-line")
    tail_shadow = group([path([(a[0] + 4, edge), (tx + 4, ty + 4), (b[0] + 4, edge)],
                              closed=True, k=0), fill(INK)], "tail-shadow")

    # what the customer says: that card, and a good word about it
    mx, my = bx - 22, by
    answer = pivot(BUB_C, [
        group([sparkle((mx + 9, my - 11), 6), fill(CITRUS), stroke(INK, 1.8)], "mini-star"),
        group([rect((mx, my - 4), (12, 9), 2.5), fill(PAPER), stroke(INK, 1.8)], "mini-pic"),
        group([rect((mx, my), (24, 30), 5), fill(BLOSSOM), stroke(INK, 2.6)], "mini-card"),
        bar((bx + 14, by - 7), (36, 6)),
        bar((bx + 10, by + 7), (28, 6)),
    ], "answer", s=seq(sc(100), [(26, 28, sc(0), LIN),
                                 (SWAP_AT + 4, SWAP_AT + 14, sc(112), SPRING),
                                 (SWAP_AT + 14, SWAP_AT + 20, sc(100), LIN)]))

    dots = []
    for k, dx in enumerate((-16, 0, 16)):
        c = (bx + dx, by)
        pulses = []
        for p in (48, 66):
            t = p + 4 * k
            pulses += [(t, t + 4, sc(140), OUT), (t + 4, t + 10, sc(100), INOUT)]
        dots.append(pivot(c, [group([ell(c, (10, 10)), fill(INK, 45)], "dot")], "dot%d" % k,
                          s=seq(sc(0), [(36 + 2 * k, 46 + 2 * k, sc(100), SPRING)] + pulses
                                + [(SWAP_AT, SWAP_AT + 6, sc(0), IN)])))

    body = panel(BUB_C, BUB_S, r=14, sw=3.5, sh=5, name="bubble")
    items = [answer, *dots, tail_fill, tail_line, *body, tail_shadow]
    return pivot(TAIL_TIP, items, "bubble",
                 s=seq(sc(100), [(12, 24, sc(0), IN), (34, 46, sc(100), SPRING),
                                 (SWAP_AT + 2, SWAP_AT + 7, sc(106), OUT),
                                 (SWAP_AT + 7, SWAP_AT + 14, sc(100), INOUT)]))


def _spark(c, rad, t):
    return group([sparkle(c, rad), fill(CITRUS), stroke(INK, 1.8)], "spark",
                 tr(a=c, p=c, s=seq(sc(0), [(t, t + 6, sc(130), SPRING),
                                            (t + 6, t + 12, sc(100), LIN),
                                            (t + 12, t + 22, sc(0), IN)])))


def _sparks():
    x = CARD_X[CHOSEN]
    return [_spark((x + 46, 14), 4.5, 176),
            _spark((x - 40, 12), 3.5, 180),
            _spark((x + 50, 40), 3.5, 184)]


def build():
    plain = []
    for i in (0, 2):
        plain += _plain_card(i)
    return wide_comp("position", [
        layer("sparks", _sparks()),
        layer("bubble", [_bubble()]),
        layer("customer", _customer()),
        layer("chosen", _chosen()),
        layer("cards", plain),
        layer("message", [_message()]),
    ])
