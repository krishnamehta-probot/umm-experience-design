"""
Card 06 -- Reliability & continuous improvement: see it live, plan the fix.

A monitoring dashboard on the left: an area chart of response time under a
dashed limit line, a bell in the header, and three service status lights
along the bottom. A small backlog board on the right with two columns --
to do and done. Frame 0 is the healthy picture: the area low and calm, every
light mint, the bell quiet, and the incident card already in the done column
with its check.

The done incident clears from the board. The area swells past the limit and
turns coral, the middle light goes coral, and the bell rings with a red dot.
An incident card drops into the top of the to-do column and the two cards
below it shuffle down a slot: it is the top priority. Its progress bar fills
as the fix lands -- the area falls back under the line, the light goes mint,
the bell's dot clears -- then the card turns mint, slides across into done,
gets its check, and the to-do cards move back up.

Beats (30 fps, loop 240):
  0-14    rest on the healthy picture
  14-26   the done incident card shrinks away
  36-60   the area swells past the limit and turns coral; light coral (54)
  56-84   the bell rings; its dot pops (58)
  74-90   the incident card drops into the top of to-do; cards shift down
  96-124  its progress fills; the area recovers; light mint (120); dot clears
  128-136 the card turns mint
  136-156 it slides into done; check (158); to-do cards shift up (150-164)
  164-240 rest

Build and check:  python scripts/build_eng_service_marks.py monitor
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    v, ell, rect, path, line, stroke, fill, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI, LILAC,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, pop_moves, layer, wide_comp, pivot, panel, bar, dashed, check,
)

RED = [0.85, 0.35, 0.38, 1]

DASH_C, DASH_S = (114, 89), (192, 146)
BOARD_C, BOARD_S = (286, 89), (116, 146)

# the area chart
CH_X0, CH_X1, CH_BASE = 36, 192, 128
LIMIT_Y = 76
CALM = [110, 104, 108, 100, 106, 102, 106, 100, 104]
SPIKE = [110, 104, 106, 98, 88, 70, 58, 56, 62]

BELL_C = (186, 40)
LIGHT_X = [40, 92, 144]
LIGHT_Y = 148
BAD_LIGHT = 1

# the board
COL_X = [258, 314]
SLOT_Y = [66, 94, 122]
CARD_S = (46, 22)


# --- the dashboard ----------------------------------------------------------------

def _area_shape(tops, k=1 / 6):
    """A closed area: a smooth top through the samples, square at the baseline."""
    n = len(tops)
    xs = [CH_X0 + (CH_X1 - CH_X0) * i / (n - 1) for i in range(n)]
    pts = list(zip(xs, tops))
    vs, ins, outs = [], [], []
    for i, (x, y) in enumerate(pts):
        prev = pts[max(i - 1, 0)]
        nxt = pts[min(i + 1, n - 1)]
        dx, dy = (nxt[0] - prev[0]) * k, (nxt[1] - prev[1]) * k
        vs.append([round(x, 2), y])
        # square where the top meets the sides
        ins.append([0, 0] if i == 0 else [round(-dx, 2), round(-dy, 2)])
        outs.append([0, 0] if i == n - 1 else [round(dx, 2), round(dy, 2)])
    for x in (CH_X1, CH_X0):
        vs.append([x, CH_BASE])
        ins.append([0, 0])
        outs.append([0, 0])
    return {"i": ins, "o": outs, "v": vs, "c": True}


def _area():
    calm, spike = _area_shape(CALM), _area_shape(SPIKE)
    shape = {"ty": "sh", "ix": 1, "nm": "area", "hd": False,
             "ks": seq(calm, [(36, 60, spike, INOUT), (100, 124, calm, INOUT)])}
    colour = seq(SKY, [(46, 52, CORAL, LIN), (114, 120, SKY, LIN)])
    return group([shape, fill(colour), stroke(INK, 3)], "area")


def _limit():
    return group([line((CH_X0 - 4, LIMIT_Y), (CH_X1 + 4, LIMIT_Y)),
                  dashed(stroke(RED, 2.2, o=seq(55, [(48, 56, 100, LIN), (110, 122, 55, LIN)])),
                         6, 6)], "limit")


def _grid():
    return group([line((CH_X0 - 4, y), (CH_X1 + 4, y)) for y in (60, 92, 110)]
                 + [stroke(INK, 1.5, o=11)], "grid")


def _lights():
    items = []
    for i, x in enumerate(LIGHT_X):
        c = (x, LIGHT_Y)
        if i == BAD_LIGHT:
            col = seq(MINT, [(52, 56, CORAL, LIN), (118, 122, MINT, LIN)])
            st = seq(INK, [(52, 56, RED, LIN), (118, 122, INK, LIN)])
            s = seq(sc(100), pop_moves(54, over=140) + pop_moves(120, over=140))
        else:
            col, st, s = MINT, INK, sc(100)
        items.append(pivot(c, [group([ell(c, (12, 12)), fill(col), stroke(st, 2.4)], "light")],
                           "light%d" % i, s=s))
        items.append(bar((x + 24, LIGHT_Y), (28, 5)))
    return items


def _bell():
    x, y = BELL_C
    body = [(x - 8, y + 6), (x - 6.5, y - 3), (x, y - 8.5), (x + 6.5, y - 3), (x + 8, y + 6)]
    ring = seq(0, [(58, 62, 18, INOUT), (62, 66, -18, INOUT), (66, 70, 16, INOUT),
                   (70, 74, -14, INOUT), (74, 78, 10, INOUT), (78, 84, 0, INOUT)])
    bell = group([
        group([ell((x, y + 9.5), (5, 5)), fill(INK)], "clapper"),
        group([line((x - 10.5, y + 6.5), (x + 10.5, y + 6.5)), stroke(INK, 2.8)], "lip"),
        group([path(body, closed=True, k=0.22), fill(SUN), stroke(INK, 2.6)], "dome"),
        group([ell((x, y - 10.5), (4.5, 4.5)), fill(INK)], "knob"),
    ], "bell", tr(a=(x, y - 10), p=(x, y - 10), r=ring))
    waves = []
    for side in (-1, 1):
        pts = [(x + side * 13, y - 6), (x + side * 15.5, y), (x + side * 13, y + 6)]
        waves.append(path(pts, k=0.3))
    wave = group(waves + [stroke(INK, 2.2)], "waves",
                 tr(o=seq(0, [(58, 60, 100, LIN), (82, 86, 0, LIN)])))
    dc = (x + 7, y - 7)
    dot = pivot(dc, [group([ell(dc, (8, 8)), fill(RED), stroke(PAPER, 1.8)], "dot")], "alert",
                s=seq(sc(0), [(58, 66, sc(130), SPRING), (66, 70, sc(100), LIN),
                              (118, 124, sc(0), IN)]))
    return [dot, bell, wave]


def _dashboard():
    head = [bar((64, 40), (48, 7))]
    return [*head, *panel(DASH_C, DASH_S, r=14, sw=3.5, sh=5, name="dashboard")]


# --- the board -------------------------------------------------------------------

def _plain_card(name, pos, chip, done=False):
    w, h = CARD_S
    items = []
    if done:
        cc = (w / 2 - 9, 0)
        items.append(check(cc, 8, w=2.6))
    items += [bar((3, 0), (18, 5)) if not done else bar((-1, 0), (14, 5)),
              group([rect((-w / 2 + 8, 0), (7, 7), 2), fill(chip), stroke(INK, 1.8)], "chip"),
              *panel((0, 0), CARD_S, r=6, sw=2.6, sh=3, name="card")]
    return group(items, name, tr(p=pos))


def _incident():
    w, h = CARD_S
    done_at = [COL_X[1], SLOT_Y[0]]
    drop_from = [COL_X[0], -24]
    land = [COL_X[0], SLOT_Y[0]]
    pos = seq(done_at, [(26, 27, drop_from, LIN), (74, 88, land, OUT),
                        (136, 154, done_at, INOUT)])
    s = seq(sc(100), [(14, 24, sc(0), IN), (72, 74, sc(100), LIN),
                      (154, 158, sc(108), OUT), (158, 166, sc(100), SPRING)])
    face = seq(MINT, [(24, 25, CORAL, LIN), (128, 136, MINT, LIN)])
    edge = seq(INK, [(24, 25, RED, LIN), (128, 136, INK, LIN)])

    left = -w / 2 + 16
    full = 20

    def prog(wd):
        return [round(left + wd / 2, 2), 4.5]

    progress = group([rect(seq(prog(full), [(30, 31, prog(0), LIN), (96, 124, prog(full), INOUT)]),
                           seq([full, 5], [(30, 31, [0, 5], LIN), (96, 124, [full, 5], INOUT)]),
                           2.5), fill(INK, 88)], "progress")
    track = group([rect((left + full / 2, 4.5), (full, 5), 2.5), fill(INK, 18)], "track")

    bx = -w / 2 + 8
    bang = group([group([rect((bx, -2), (3, 7), 1.5), fill(RED)], "bang"),
                  group([ell((bx, 4), (3.2, 3.2)), fill(RED)], "bang-dot")], "alert",
                 tr(o=seq(0, [(24, 25, 100, LIN), (128, 132, 0, LIN)])))
    cc = (w / 2 + 1, -h / 2 - 1)
    tick = pivot(cc, [check(cc, 8, w=2.6),
                      group([ell(cc, (15, 15)), fill(MINT), stroke(INK, 2.2)], "disc")],
                 "tick", s=seq(sc(100), [(14, 20, sc(0), IN)] + pop_moves(156, over=135)))
    items = [tick, bang, progress, track, bar((4, -4.5), (22, 5)),
             group([rect((0, 0), CARD_S, 6), fill(face), stroke(edge, 2.6)], "card"),
             group([rect((3, 3), CARD_S, 6), fill(INK)], "card-shadow")]
    return group(items, "incident", tr(p=pos, s=s))


def _board():
    # the two to-do cards slide down a slot while the incident sits on top
    def shuffled(slot):
        home = [COL_X[0], SLOT_Y[slot]]
        down = [COL_X[0], SLOT_Y[slot + 1]]
        t = 76 + 3 * slot
        u = 148 + 4 * slot
        return seq(home, [(t, t + 12, down, OUT), (u, u + 14, home, INOUT)])
    todo = [_plain_card("todo0", shuffled(0), SUN), _plain_card("todo1", shuffled(1), LILAC)]
    done = [_plain_card("done1", [COL_X[1], SLOT_Y[1]], SKY, done=True)]
    x0, y0 = BOARD_C
    heads = [bar((COL_X[0] - 8, 40), (24, 6)), bar((COL_X[1] - 8, 40), (24, 6))]
    divider = group([line((x0, 32), (x0, 150)), dashed(stroke(INK, 1.8, o=30), 4, 5)], "divider")
    return [_incident(), *todo, *done, *heads, divider,
            *panel(BOARD_C, BOARD_S, r=14, sw=3.5, sh=5, name="board")]


def build():
    return wide_comp("operate", [
        layer("board", _board()),
        layer("bell", _bell()),
        layer("lights", _lights()),
        layer("limit", [_limit()]),
        layer("area", [_area()]),
        layer("grid", [_grid()]),
        layer("dashboard", _dashboard()),
    ])
