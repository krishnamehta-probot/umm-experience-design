"""
Card 04 -- Platform engineering & DevSecOps: a release that runs the same way
every time.

A pipeline panel: a commit node, then three gates on one track -- build (a
cube), test (a flask), security (a shield). The track leaves the panel, forks,
and feeds three environment boxes stacked on the right: dev, staging, prod.
A rollback button sits ready beside prod. Frame 0 is the finished release:
every gate checked, the track lit mint, all three environments filled with
their status lights on.

The checks, the lit track and the environments clear. A commit pops on the
node and runs the track, stopping inside each gate: the gate bumps and its
check pops. At the fork the release waits while a copy goes out to each
environment in turn -- dev, then staging, then prod -- and each box fills and
lights as its copy lands. The rollback button nods once when prod goes live.

Beats (30 fps, loop 240):
  0-14    rest on the finished release
  14-34   gate checks, lit track, environment fills and lights clear
  30-40   the commit pops on the node
  40-54   -> build gate; bump, check (60)
  64-78   -> test gate; bump, check (84)
  88-102  -> security gate; bump, check (108)
  112-124 -> the fork, where the release waits
  126-140 copy -> dev; fills (140-156), light (152)
  148-162 copy -> staging; fills (162-178), light (174)
  170-184 copy -> prod; fills (184-200), light (196)
  200-212 the rollback button nods; the release at the fork clears
  212-240 rest

Build and check:  python scripts/build_eng_service_marks.py pipeline
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    v, kf, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT, PERI, LILAC,
    OUT, INOUT, IN, SPRING, LIN, OP,
    sc, seq, pop_moves, smooth, layer, wide_comp, pivot, panel, bar, check, Track,
)

# --- geometry ------------------------------------------------------------------

PIPE_C, PIPE_S = (112, 92), (200, 104)
TRACK_Y = 96
COMMIT_X = 34
GATE_X = [82, 132, 182]
GATE_S = 36
FORK = (226, TRACK_Y)

ENV_X, ENV_S = 284, (66, 36)
ENV_Y = [46, 96, 146]
ENV_COL = [SKY, LILAC, CITRUS]
ENV_IN = ENV_X - ENV_S[0] / 2            # where a branch meets its box
FILL_W, FILL_H = ENV_S[0] - 10, ENV_S[1] - 10

ROLL_C = (339, 146)

# when the commit reaches each gate, and when that gate's check pops
ARRIVE = [(40, 54), (64, 78), (88, 102)]
CHECK_AT = [60, 84, 108]
TO_FORK = (112, 124)
# each copy: leaves the fork, lands in its box
BRANCH = [(126, 140), (148, 162), (170, 184)]
CLEAR = 14


def _pct(x):
    return round(100 * (x - COMMIT_X) / (FORK[0] - COMMIT_X), 2)


# --- the pipeline panel ----------------------------------------------------------

def _cube(c):
    x, y = c
    hexa = [(x, y - 10), (x + 9, y - 5), (x + 9, y + 5), (x, y + 10), (x - 9, y + 5),
            (x - 9, y - 5)]
    edges = group([line((x, y), (x - 9, y - 5)), line((x, y), (x + 9, y - 5)),
                   line((x, y), (x, y + 10)), stroke(INK, 2.4)], "edges")
    return [edges, group([path(hexa, closed=True, k=0), fill(SUN), stroke(INK, 2.6)], "cube")]


def _flask(c):
    x, y = c
    body = [(x - 3.5, y - 10), (x - 3.5, y - 3), (x - 9.5, y + 9), (x + 9.5, y + 9),
            (x + 3.5, y - 3), (x + 3.5, y - 10)]
    liquid = [(x - 6.5, y + 3), (x + 6.5, y + 3), (x + 9.5, y + 9), (x - 9.5, y + 9)]
    return [group([line((x - 6, y - 10), (x + 6, y - 10)), stroke(INK, 2.6)], "lip"),
            group([path(body, k=0), stroke(INK, 2.6)], "glass"),
            group([path(liquid, closed=True, k=0), fill(BLOSSOM)], "liquid")]


def _shield(c):
    x, y = c
    pts = [(-10, -9), (0, -12.5), (10, -9), (0, 13)]
    ins = [[0, 10], [-4, 0], [-3.4, -1.5], [6.5, -4.5]]
    outs = [[3.4, -1.5], [4, 0], [0, 10], [-6.5, -4.5]]
    shape = {"ty": "sh", "ix": 1, "nm": "shield", "hd": False,
             "ks": v({"i": ins, "o": outs,
                      "v": [[x + px, y + py] for px, py in pts], "c": True})}
    return [group([ell((x, y - 1), (5, 5)), fill(INK)], "keyhole"),
            group([shape, fill(PERI), stroke(INK, 2.6)], "shield")]


ICONS = [_cube, _flask, _shield]


def _gate(i):
    x, y = GATE_X[i], TRACK_Y
    a0, a1 = ARRIVE[i]
    t = CHECK_AT[i]
    cc = (x + GATE_S / 2 - 1, y - GATE_S / 2 + 1)
    tick = pivot(cc, [check(cc, 9, w=2.8),
                      group([ell(cc, (17, 17)), fill(MINT), stroke(INK, 2.4)], "disc")],
                 "check%d" % i,
                 s=seq(sc(100), [(CLEAR + 2 * i, CLEAR + 8 + 2 * i, sc(0), IN)]
                       + pop_moves(t, over=135)))
    tile = pivot((x, y), [*ICONS[i]((x, y)),
                          *panel((x, y), (GATE_S, GATE_S), r=9, sw=3, sh=4, name="gate")],
                 "tile%d" % i,
                 s=seq(sc(100), [(a1, a1 + 4, sc(108), OUT), (a1 + 4, a1 + 12, sc(100), SPRING)]))
    return [tick, tile, bar((x, y + 31), (22, 5))]


def _track():
    rail = group([line((COMMIT_X, TRACK_Y), FORK), stroke(INK, 3)], "rail")
    moves = [(CLEAR, CLEAR + 18, 0, IN)]
    for (a0, a1), x in zip(ARRIVE, GATE_X):
        moves.append((a0, a1, _pct(x), INOUT))
    moves.append((TO_FORK[0], TO_FORK[1], 100, INOUT))
    lit = group([line((COMMIT_X, TRACK_Y), FORK), trim(e=seq(100, moves)), stroke(MINT, 10)],
                "lit")
    node = group([ell((COMMIT_X, TRACK_Y), (16, 16)), fill(PAPER), stroke(INK, 3.2)], "commit")
    return [node, rail, lit]


def _commit_dot():
    home = [COMMIT_X, TRACK_Y]
    moves = []
    for (a0, a1), x in zip(ARRIVE, GATE_X):
        moves.append((a0, a1, [x, TRACK_Y], INOUT))
    moves += [(TO_FORK[0], TO_FORK[1], list(FORK), INOUT), (210, 211, home, LIN)]
    return group([ell((0, 0), (14, 14)), fill(CITRUS), stroke(INK, 3)], "commit-dot",
                 tr(a=(0, 0), p=seq(home, moves),
                    s=seq(sc(0), [(30, 38, sc(125), SPRING), (38, 42, sc(100), LIN),
                                  (200, 208, sc(0), IN)])))


def _pipe():
    head = [bar((58, 60), (44, 7)), bar((184, 60), (24, 6))]
    return [*head, *panel(PIPE_C, PIPE_S, r=14, sw=3.5, sh=5, name="pipeline")]


# --- the environments ------------------------------------------------------------

def _branch_seg(i):
    y = ENV_Y[i]
    p0, p3 = FORK, (ENV_IN, y)
    return (p0, (FORK[0] + 22, FORK[1]), (FORK[0] + 18, y), p3)


def _cubic_shape(seg):
    p0, p1, p2, p3 = seg
    return {"ty": "sh", "ix": 1, "nm": "branch", "hd": False,
            "ks": v({"i": [[0, 0], [p2[0] - p3[0], p2[1] - p3[1]]],
                     "o": [[p1[0] - p0[0], p1[1] - p0[1]], [0, 0]],
                     "v": [list(p0), list(p3)], "c": False})}


def _branch(i):
    seg = _branch_seg(i)
    t0, t1 = BRANCH[i]
    rail = group([_cubic_shape(seg), stroke(INK, 3)], "rail")
    lit = group([_cubic_shape(seg),
                 trim(e=seq(100, [(CLEAR + 2 * i, CLEAR + 16 + 2 * i, 0, IN),
                                  (t0, t1, 100, INOUT)])),
                 stroke(MINT, 10)], "lit")

    trk = Track([seg])
    home = [round(seg[0][0], 2), round(seg[0][1], 2)]
    end = [round(seg[3][0], 2), round(seg[3][1], 2)]
    keys = [(0, home), (t0, home)]
    for f in range(t0 + 2, t1, 2):
        x, y = trk.at(trk.total * smooth((f - t0) / (t1 - t0)))
        keys.append((f, [round(x, 2), round(y, 2)]))
    keys += [(t1, end), (t1 + 8, end), (t1 + 9, home), (OP, home)]
    dot = group([ell((0, 0), (12, 12)), fill(CITRUS), stroke(INK, 2.8)], "copy",
                tr(a=(0, 0), p=kf([(t, p, LIN) for t, p in keys]),
                   s=seq(sc(0), [(t0 - 4, t0 + 2, sc(100), SPRING), (t1 - 2, t1 + 6, sc(0), IN)])))
    return [dot, lit, rail]


def _env(i):
    x, y = ENV_X, ENV_Y[i]
    t1 = BRANCH[i][1]
    left = x - FILL_W / 2

    def size(w):
        return [w, FILL_H]

    def ctr(w):
        return [round(left + w / 2, 2), y]

    clear = (CLEAR + 4 + 3 * i, CLEAR + 18 + 3 * i)
    grow = (t1, t1 + 16)
    fill_rect = group([rect(seq(ctr(FILL_W), [(clear[0], clear[1], ctr(0), IN),
                                              (grow[0], grow[1], ctr(FILL_W), OUT)]),
                            seq(size(FILL_W), [(clear[0], clear[1], size(0), IN),
                                               (grow[0], grow[1], size(FILL_W), OUT)]), 5),
                       fill(ENV_COL[i])], "fill")
    lc = (x + 20, y)
    light = pivot(lc, [group([ell(lc, (10, 10)),
                              fill(seq(MINT, [(clear[0], clear[0] + 6, PAPER, LIN),
                                              (t1 + 12, t1 + 16, MINT, LIN)])),
                              stroke(INK, 2.4)], "light")],
                  "light", s=seq(sc(100), pop_moves(t1 + 12, over=140)))
    box = pivot((x, y), [light, bar((x - 8, y), (28, 6)), fill_rect,
                         *panel((x, y), ENV_S, r=9, sw=3, sh=4, name="env")],
                "env%d" % i,
                s=seq(sc(100), [(t1, t1 + 4, sc(106), OUT), (t1 + 4, t1 + 12, sc(100), SPRING)]))
    return [box]


def _rollback():
    x, y = c = ROLL_C
    # an undo arrow: the shaft runs right, bends round and back; the head points left
    shaft = [(x - 6, y - 3), (x + 1, y - 3), (x + 6, y + 1.5), (x + 1, y + 6), (x - 3, y + 6)]
    head = [(x - 2.5, y - 7), (x - 6.5, y - 3), (x - 2.5, y + 1)]
    icon = [group([path(head, k=0), stroke(INK, 2.6)], "head"),
            group([path(shaft, k=0.25), stroke(INK, 2.6)], "shaft")]
    disc = group([ell(c, (24, 24)), fill(PAPER), stroke(INK, 2.8)], "disc")
    shadow = group([ell((x + 3, y + 3), (24, 24)), fill(INK)], "disc-shadow")
    nod = seq(0, [(198, 204, -40, OUT), (204, 214, 0, SPRING)])
    return [group([group(icon, "icon", tr(a=c, p=c, r=nod)), disc, shadow], "rollback")]


def build():
    return wide_comp("release", [
        layer("rollback", _rollback()),
        layer("envs", [g for i in range(3) for g in _env(i)]),
        layer("gates", [g for i in range(3) for g in _gate(i)]),
        layer("commit", [_commit_dot()]),
        layer("branches", [g for i in range(3) for g in _branch(i)]),
        layer("track", _track()),
        layer("pipe", _pipe()),
    ])
