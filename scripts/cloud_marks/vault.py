"""
Card 05 -- Cloud security & data governance: who gets into which row.

A data panel of four rows, each with a padlock, behind a shield. Frame 0 is
the governed picture: an approved ID badge docked at the shield with a mint
check, its row unlocked and highlighted, every row carrying a
classification tag and a review tick.

The access clears and the badge leaves. A second badge slides up to the
shield: the shield flashes coral, a cross pops on the badge, it shakes and
bounces off. The approved badge comes back: mint flash, check, its row
unlocks and lights up. Classification tags drop onto the rows one by one,
then a magnifier sweeps down the list and ticks each row as it passes.

Beats (30 fps, loop 240):
  0-12    rest on the governed picture
  12-34   check, highlight, tags and ticks clear; badge A slides out
  30-104  badge B arrives (30-50), coral flash and cross (52-64), shakes,
          bounces off the shield and out (76-104)
  106-148 badge A arrives (106-126), mint flash and check (128-142), row
          unlocks and highlights (138-148)
  150-182 tags drop onto rows 0..3
  182-220 the review magnifier sweeps down, ticks pop row by row
  220-240 rest

Build and check:  python scripts/build_cloud_service_marks.py vault
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    v, ell, rect, path, line, stroke, fill, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI, LILAC,
    OUT, INOUT, IN, SPRING, LIN,
    sc, seq, pop_moves, layer, wide_comp, pivot, panel, bar, check,
)

RED = [0.85, 0.35, 0.38, 1]

DATA_C, DATA_S = (118, 89), (196, 146)
ROWS = [62, 88, 114, 140]
ROW_X, ROW_W, ROW_H = 106, 152, 20
LOCK_X, TAG_X, TICK_X = 42, 136, 166
OPEN_ROW = 1                    # the row the approved badge can open
TAG_COL = [SKY, SUN, BLOSSOM, SKY]
TAG_AT = [150, 158, 166, 174]

SHIELD_C = (228, 90)
STATUS_C = (20, -28)          # the badge's status disc, on its corner
DOCK, AWAY = [306, 92], [404, 92]

# the magnifier glides down the tick column; each tick pops as it passes
MAG_Y0, MAG_Y1, MAG_T0, MAG_T1 = 50, 152, 186, 214
TICK_AT = [round(MAG_T0 + (y - MAG_Y0) * (MAG_T1 - MAG_T0) / (MAG_Y1 - MAG_Y0)) + 3
           for y in ROWS]


# --- the data panel -------------------------------------------------------------

def _row(i, y):
    items = []
    # padlock: the shackle lifts and swings open on the unlocked row
    is_open = i == OPEN_ROW
    foot = (LOCK_X + 4, y - 1)
    lift = (seq([foot[0], foot[1] - 3], [(14, 22, list(foot), IN),
                                          (138, 148, [foot[0], foot[1] - 3], SPRING)])
            if is_open else list(foot))
    swing = seq(-28, [(14, 22, 0, IN), (138, 148, -28, SPRING)]) if is_open else 0
    shackle = group([path([(LOCK_X - 4, y - 1), (LOCK_X - 4, y - 4), (LOCK_X, y - 8),
                           (LOCK_X + 4, y - 4), (LOCK_X + 4, y - 1)], k=0.3),
                     stroke(INK, 2.4)], "shackle", tr(a=foot, p=lift, r=swing))
    body = group([rect((LOCK_X, y + 2.5), (12, 9), 2), fill(INK)], "lockbody")

    tick = pivot((TICK_X, y), [check((TICK_X, y), 10, w=3)], "tick",
                 s=seq(sc(100), [(14 + 2 * i, 22 + 2 * i, sc(0), IN),
                                 (TICK_AT[i], TICK_AT[i] + 8, sc(135), SPRING),
                                 (TICK_AT[i] + 8, TICK_AT[i] + 14, sc(100), LIN)]))

    tx, t = TAG_X, TAG_AT[i]
    tag = pivot((tx, y), [
        group([ell((tx - 8, y), (3.6, 3.6)), fill(INK)], "hole"),
        group([rect((tx, y), (28, 13), 4), fill(TAG_COL[i]), stroke(INK, 2.2)], "tag"),
    ], "tag%d" % i,
        p=seq([tx, y], [(14 + 2 * i, 24 + 2 * i, [tx, y - 10], IN),
                        (t, t + 10, [tx, y], OUT)]),
        s=seq(sc(100), [(14 + 2 * i, 24 + 2 * i, sc(0), IN),
                        (t, t + 8, sc(125), SPRING), (t + 8, t + 14, sc(100), LIN)]))

    row_fill = (seq(MINT, [(14, 22, PAPER, LIN), (138, 146, MINT, LIN)])
                if is_open else PAPER)
    strip = group([rect((ROW_X, y), (ROW_W, ROW_H), 6), fill(row_fill), stroke(INK, 2.4)],
                  "strip")
    strip_s = (seq(sc(100), [(138, 144, sc(104), SPRING), (144, 152, sc(100), LIN)])
               if is_open else sc(100))
    items = [tick, tag, shackle, body, bar((80, y), (40, 6)),
             pivot((ROW_X, y), [strip], "strip", s=strip_s)]
    return group(items, "row%d" % i)


def _data():
    return [*[_row(i, y) for i, y in enumerate(ROWS)],
            bar((58, 36), (48, 7)),
            *panel(DATA_C, DATA_S, r=14, sw=3.5, sh=5, name="data")]


def _magnifier():
    x = TICK_X
    lens = group([ell((x, MAG_Y0), (20, 20)), fill(PAPER, 55), stroke(INK, 3.4)], "lens")
    handle = group([line((x + 7, MAG_Y0 + 7), (x + 14, MAG_Y0 + 14)), stroke(INK, 4.4)],
                   "handle")
    return pivot((x, MAG_Y0), [lens, handle], "magnifier",
                 p=seq([x, MAG_Y0], [(MAG_T0, MAG_T1, [x, MAG_Y1], LIN),
                                     (222, 224, [x, MAG_Y0], LIN)]),
                 s=seq(sc(0), [(178, 186, sc(100), SPRING), (214, 222, sc(0), IN)]))


# --- the shield ------------------------------------------------------------------

def _shield_shape(c):
    x, y = c
    pts = [(-27, -24), (0, -33), (27, -24), (0, 35)]
    ins = [[0, 26], [-11, 0], [-9, -4], [17, -12]]
    outs = [[9, -4], [11, 0], [0, 26], [-17, -12]]
    return {"ty": "sh", "ix": 1, "nm": "shield", "hd": False,
            "ks": v({"i": ins, "o": outs,
                     "v": [[x + px, y + py] for px, py in pts], "c": True})}


def _shield():
    x, y = SHIELD_C
    colour = seq(PERI, [(52, 56, CORAL, LIN), (72, 80, PERI, LIN),
                        (128, 132, MINT, LIN), (148, 156, PERI, LIN)])
    lock = [
        group([ell((x, y + 4), (4.4, 4.4)), fill(PAPER)], "keyhole"),
        group([rect((x, y + 5), (20, 16), 3.5), fill(INK)], "body"),
        group([path([(x - 6, y - 2), (x - 6, y - 7), (x, y - 12), (x + 6, y - 7),
                     (x + 6, y - 2)], k=0.3), stroke(INK, 3.4)], "shackle"),
    ]
    face = group([_shield_shape(SHIELD_C), fill(colour), stroke(INK, 3.5)], "face")
    shadow = group([_shield_shape((x + 5, y + 5)), fill(INK)], "shadow")
    bump = [(50, 54, sc(92), IN), (54, 62, sc(100), SPRING),
            (126, 130, sc(92), IN), (130, 138, sc(100), SPRING)]
    return pivot(SHIELD_C, [*lock, face, shadow], "shield", s=seq(sc(100), bump))


# --- the badges ------------------------------------------------------------------

def _badge(name, avatar, status, pos, rot=0, op=100, shake=None):
    items = [
        status,
        group([rect((0, -23), (13, 4), 2), fill(INK)], "clip"),
        group([ell((0, -9), (8, 8)), fill(INK)], "head"),
        group([rect((0, 0), (14, 6.5), 3.2), fill(INK)], "shoulders"),
        group([ell((0, -5), (23, 23)), fill(avatar), stroke(INK, 2.4)], "avatar"),
        bar((0, 17), (26, 5)),
        *panel((0, 0), (44, 58), r=8, sw=3, sh=4, name="card"),
    ]
    inner = group(items, "body", tr(p=shake)) if shake else group(items, "body")
    return group([inner], name, tr(p=pos, r=rot, o=op))


def _status_ok(s):
    c = STATUS_C
    return pivot(c, [check(c, 9, w=2.8),
                     group([ell(c, (17, 17)), fill(MINT), stroke(INK, 2.4)], "disc")],
                 "ok", s=s)


def _status_no(s):
    x, y = c = STATUS_C
    d = 3.4
    cross = group([line((x - d, y - d), (x + d, y + d)), line((x + d, y - d), (x - d, y + d)),
                   stroke(RED, 2.8)], "cross")
    return pivot(c, [cross, group([ell(c, (17, 17)), fill(CORAL), stroke(RED, 2.4)], "disc")],
                 "no", s=s)


def _badges():
    a = _badge(
        "badgeA", BLOSSOM,
        _status_ok(seq(sc(100), [(12, 20, sc(0), IN), (132, 140, sc(135), SPRING),
                                 (140, 146, sc(100), LIN)])),
        seq(DOCK, [(18, 34, AWAY, IN), (106, 126, DOCK, OUT)]))
    b = _badge(
        "badgeB", SUN,
        _status_no(seq(sc(0), [(56, 64, sc(135), SPRING), (64, 70, sc(100), LIN),
                               (104, 106, sc(0), LIN)])),
        seq(AWAY, [(30, 50, DOCK, OUT), (78, 84, [288, 92], IN),
                   (84, 104, [404, 70], OUT), (104, 106, AWAY, LIN)]),
        rot=seq(0, [(84, 104, 24, OUT), (104, 106, 0, LIN)]),
        op=seq(0, [(28, 30, 100, LIN), (102, 104, 0, LIN)]),
        shake=seq([0, 0], [(64, 67, [3, 0], INOUT), (67, 70, [-3, 0], INOUT),
                           (70, 73, [3, 0], INOUT), (73, 76, [0, 0], INOUT)]))
    return [a, b]


def build():
    return wide_comp("govern", [
        layer("badges", _badges()),
        layer("shield", [_shield()]),
        layer("magnifier", [_magnifier()]),
        layer("data", _data()),
    ])
