"""
CONVERSATIONAL AI & AGENTS -- a chat-bubble character.

A big white speech bubble on the left listens, thinks, answers, acts and
hands over. Right column: the incoming question (blossom), the answer
(paper, citrus stripe), and a mint "done" pill beside the human who takes over.

Beats (frames at 30 fps):
  0-12    rest on the finished picture
  12-28   right-hand rows shrink away, staggered
  30-60   question pops in; three sound arcs pulse toward it; eyes look right
  60-100  thinking dots bounce in the mouth; sparkle at ~92
  100-135 answer grows from the character; its bars draw in; smile returns
  135-160 done pill pops, its check draws; happy squint
  160-200 character tilts; coral "?" badge pops on the question, the human
          slides in, the badge turns mint and leaves
  200-240 hold the finished picture (= frame 0)
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

CX, CY = 88, 80        # the character's centre
ARC_C = (146, 80)      # where the sound arcs leave the character


def arc(c, r, a0, a1):
    """A circular arc from angle a0 to a1 (radians), as one cubic."""
    cx, cy = c
    h = 4 / 3 * math.tan((a1 - a0) / 4) * r
    p0 = (cx + r * math.cos(a0), cy + r * math.sin(a0))
    p3 = (cx + r * math.cos(a1), cy + r * math.sin(a1))
    p1 = (p0[0] - h * math.sin(a0), p0[1] + h * math.cos(a0))
    p2 = (p3[0] + h * math.sin(a1), p3[1] - h * math.cos(a1))
    return cubic(p0, p1, p2, p3)


def skel(x, y, w, t_grow=None, colour=INK, o=88):
    """A skeleton bar, anchored at its left end. If t_grow is given it is
    hidden until then and draws out from the left."""
    s = sc(100)
    if t_grow is not None:
        s = seq(sc(100), [(14, 20, [0, 100], IN), (t_grow, t_grow + 8, sc(100), OUT)])
    return group([rect((x + w / 2, y), (w, 7), 3.5), fill(colour, o)], "bar",
                 tr(a=(x, y), p=(x, y), s=s))


# ----------------------------------------------------------------------------
# character
# ----------------------------------------------------------------------------

def character():
    # Eyes squint (scale y 100 -> 30 -> 100) at the happy beat.
    squint = seq(sc(100), [(138, 146, [100, 30], OUT), (146, 160, sc(100), SPRING)])
    # Highlights glance right, then back; they fade while the eyes are shut.
    look = seq([0, 0], [(30, 42, [4, 0], OUT), (196, 208, [0, 0], INOUT)])
    hl_o = seq(100, [(136, 140, 0, LIN), (152, 156, 100, LIN)])

    eyes, highlights = [], []
    for ex in (68, 108):
        eyes.append(pivot((ex, 72), [group([ell((ex, 72), (12, 16)), fill(INK)], "eye")],
                          "eye%d" % ex, s=squint))
        highlights.append(group([ell((ex - 3, 68), (4, 4)), fill(PAPER)], "hl%d" % ex,
                                tr(p=look, o=hl_o)))

    smile = group([cubic((80, 94), (84, 104), (94, 104), (98, 94)), stroke(INK, 3.2)],
                  "smile", tr(o=seq(100, [(58, 64, 0, IN), (112, 124, 100, OUT)])))

    # Thinking dots: pop in, bounce in turn, shrink at ~92.
    dots = []
    for i, x in enumerate((80, 88, 96)):
        t = 64 + 8 * i
        dots.append(group(
            [ell((x, 98), (8, 8)), fill(INK)], "dot%d" % i,
            tr(a=(x, 98), p=seq([x, 98], [(t, t + 5, [x, 94], OUT), (t + 5, t + 10, [x, 98], IN)]),
               s=seq(sc(0), [(60, 67, sc(100), SPRING), (92, 100, sc(0), IN)]))))

    # Sparkle pops where the dots were and spins a quarter turn, then shrinks.
    spark = group(
        [sparkle((88, 98), 9), fill(CITRUS), stroke(INK, 2.4)], "spark",
        tr(a=(88, 98), p=(88, 98),
           s=seq(sc(0), [(92, 100, sc(100), SPRING), (114, 122, sc(0), IN)]),
           r=seq(0, [(92, 112, 90, OUT), (118, 119, 0, LIN)])))

    blush = [group([ell((54, 90), (14, 8)), fill(LILAC)], "blushL"),
             group([ell((122, 90), (14, 8)), fill(LILAC)], "blushR")]

    # Tail: a fill that covers the bubble's bottom edge, then an open ink stroke.
    tail_fill = group([path([(48, 126), (40, 150), (74, 126)], closed=True, k=0),
                       fill(PAPER)], "tail")
    tail_line = group([path([(74, 127), (40, 150), (48, 127)], k=0),
                       stroke(INK, 3.5)], "tailline")
    tail_shadow = group([path([(51, 131), (45, 155), (79, 131)], closed=True, k=0),
                         fill(INK)], "tailshadow")

    body = panel((CX, CY), (124, 100), r=26, fc=PAPER, sw=3.5, sh=5, name="body")

    items = [*eyes, *highlights, smile, *dots, spark, *blush,
             tail_fill, tail_line, *body, tail_shadow]

    bob = seq([CX, CY], [(16, 104, [CX, CY - 2], INOUT), (104, 200, [CX, CY], INOUT)])
    tilt = seq(0, [(160, 172, -8, INOUT), (172, 186, 0, INOUT)])
    return group(items, "character", tr(a=(CX, CY), p=bob, r=tilt))


def sound_arcs():
    out = []
    for i, (r, t) in enumerate(zip((10, 18, 26), (32, 40, 48))):
        out.append(group(
            [arc(ARC_C, r, math.radians(-40), math.radians(40)), stroke(INK, 3.2)],
            "arc%d" % i,
            tr(a=ARC_C, p=ARC_C,
               s=seq(sc(60), [(t, t + 18, sc(100), OUT), (t + 18, t + 20, sc(60), LIN)]),
               o=seq(0, [(t, t + 3, 100, LIN), (t + 12, t + 20, 0, LIN)]))))
    return out


# ----------------------------------------------------------------------------
# right column
# ----------------------------------------------------------------------------

def question():
    """Row 1, x 184-336, y 18-52. Blossom bubble with a tail pointing left."""
    tail_fill = group([path([(185, 39), (178, 47), (185, 50)], closed=True, k=0),
                       fill(BLOSSOM)], "tail")
    tail_line = group([path([(185, 50), (178, 47), (185, 39)], k=0),
                       stroke(INK, 3.5)], "tailline")
    items = [skel(200, 29, 90), skel(200, 41, 64), tail_fill, tail_line,
             *panel((260, 35), (152, 34), r=12, fc=BLOSSOM, sw=3.5, sh=5, name="qbubble")]
    s = seq(sc(100), [(12, 20, [0, 0], IN)] + pop_moves(30))
    return pivot((260, 35), items, "question", s=s)


def answer():
    """Row 2, x 186-336, y 62-112. Paper bubble with a citrus stripe, three bars.
    Grows from its left edge; its bars draw in one after another."""
    bars = [skel(210, 74, 104, t_grow=116), skel(210, 87, 84, t_grow=123),
            skel(210, 100, 58, t_grow=130)]
    stripe = group([rect((193, 87), (10, 36), 5), fill(CITRUS)], "stripe")
    items = [*bars, stripe, *panel((261, 87), (150, 50), r=12, fc=PAPER, sw=3.5, sh=5,
                                   name="abubble")]
    s = seq(sc(100), [(14, 26, [0, 100], IN), (100, 116, sc(100), OUT)])
    return pivot((186, 87), items, "answer", s=s)


def done_pill():
    """Row 3, pill x 186-258, y 128-158, with its check drawn in."""
    pts = [(215.28, 143.32), (220.08, 147.8), (228.72, 138.2)]
    check_g = group([path(pts, k=0),
                     trim(s=0, e=seq(100, [(20, 22, 0, IN), (146, 160, 100, OUT)])),
                     stroke(INK, 3.5)], "check")
    items = [check_g, *panel((222, 143), (72, 30), r=15, fc=MINT, sw=3.5, sh=5, name="pill")]
    s = seq(sc(100), [(20, 26, sc(0), IN)] + pop_moves(135))
    return pivot((222, 143), items, "done", s=s)


def human():
    """Avatar, x 277-323, y 125-166. Slides in from the right and pops."""
    items = [
        group([path([(294, 140), (297, 144), (303, 144), (306, 140)], k=0),
               stroke(INK, 2.4)], "smile"),
        group([ell((300, 135), (20, 20)), fill(SUN), stroke(INK, 3)], "head"),
        group([rect((300, 158), (46, 16), 8), fill(SUN), stroke(INK, 3)], "shoulders"),
    ]
    p = seq([300, 150], [(160, 161, [360, 150], LIN), (162, 184, [300, 150], OUT)])
    s = seq(sc(100), [(20, 28, sc(0), IN), (161, 162, sc(100), LIN),
                      (184, 194, sc(116), SPRING), (194, 202, sc(100), LIN)])
    return group(items, "human", tr(a=(300, 150), p=p, s=s))


def badge():
    """Coral '?' on the question bubble, then crossfades to a mint check and leaves."""
    q = group([
        group([cubic((322, 17), (322, 11), (330, 11), (330, 16)),
               line((330, 16), (326, 21)), stroke(INK, 2.4)], "hook"),
        group([ell((326, 25), (3.6, 3.6)), fill(INK)], "dot"),
    ], "question", tr(o=seq(100, [(184, 190, 0, LIN), (216, 218, 100, LIN)])))
    pts = [(322.2, 19.2), (324.9, 21.7), (329.8, 16.3)]
    mint = group([
        group([path(pts, k=0),
               trim(s=0, e=seq(0, [(190, 200, 100, OUT), (216, 218, 0, LIN)])),
               stroke(INK, 2.6)], "check"),
        group([ell((326, 19), (18, 18)), fill(MINT), stroke(INK, 2.2)], "disc"),
    ], "mint", tr(o=seq(0, [(184, 192, 100, LIN), (216, 218, 0, LIN)])))
    coral = group([ell((326, 19), (18, 18)), fill(CORAL), stroke(INK, 2.2)], "coral",
                  tr(o=seq(100, [(184, 190, 0, LIN), (216, 218, 100, LIN)])))
    s = seq(sc(0), [(166, 176, sc(100), SPRING), (206, 214, sc(0), IN)])
    return pivot((326, 19), [q, mint, coral], "badge", s=s)


def build():
    return wide_comp("agents", [
        layer("badge", [badge()]),
        layer("human", [human()]),
        layer("done", [done_pill()]),
        layer("answer", [answer()]),
        layer("question", [question()]),
        layer("character", [character()]),
        layer("arcs", sound_arcs()),
    ])
