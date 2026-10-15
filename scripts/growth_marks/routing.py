"""
Card 06 -- Growth operations & automation: every lead routed, every lead
followed up.

An inbox panel on the left holds three lead cards; lines from it merge into a
citrus automation node with a lightning bolt, which branches out to three
owners (sky, blossom and sun avatars). On the right a report panel logs the
follow-ups: one row per owner, an envelope and a bar in that owner's colour.

The leads drop into the inbox. One by one a token leaves a lead, runs into
the node (which pulses), and is routed down a branch to its owner; the lead's
chip takes the owner's colour, the owner nods, and a follow-up envelope flies
from the owner into the report, where that owner's bar grows. When all three
are done the report's mint check pops.

Frame 0 is the finished picture: three leads, each chipped with its owner's
colour, three envelopes in the report and its bars full, the check on.

Beats (30 fps, loop 240):
  0-12    rest on the finished picture
  12-28   the leads, envelopes, bars and check clear
  30-58   the three leads drop into the inbox
  56      lead 1 -> blossom: token 58-86, node pulse 72, owner 86,
          envelope 90-106, bar 104-118
  98      lead 2 -> sky       (same beats, 42 frames later)
  140     lead 3 -> sun
  202     the report's check pops
  220-240 rest

Build and check:  python scripts/build_growth_service_marks.py routing
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    kf, ell, rect, path, line, stroke, fill, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, SUN, MINT,
    OUT, INOUT, IN, SPRING, LIN, OP,
    sc, seq, pop_moves, smooth, layer, wide_comp, pivot,
    panel, bar, cubic, check, Track,
)

# --- geometry ------------------------------------------------------------------

INBOX_C, INBOX_S = (56, 90), (80, 132)
INBOX_R = INBOX_C[0] + INBOX_S[0] / 2          # 96
REPORT_C, REPORT_S = (302, 90), (80, 132)
REPORT_L = REPORT_C[0] - REPORT_S[0] / 2       # 262
TOP = INBOX_C[1] - INBOX_S[1] / 2              # 24
ROW_Y = [72, 102, 132]
LEAD_S = (62, 22)

NODE_C, NODE_D = (144, 90), 36
NODE_L, NODE_R = NODE_C[0] - NODE_D / 2, NODE_C[0] + NODE_D / 2

OWN_X = 214
OWN_Y = [42, 90, 138]
OWN_D = 36
OWN_FILL = [SKY, BLOSSOM, SUN]

ENV_X = 280                                    # an envelope's slot in the report
BAR_X0 = 294                                   # report bars grow right from here
BAR_W = [34, 26, 40]

ROUTE = [1, 0, 2]                              # lead r -> owner ROUTE[r]
ROUTE_AT = [56, 98, 140]
TOKEN = 28                                     # frames, lead -> owner
DROP_AT = 30
CLEAR = 12
CHECK_AT = 202


def _r(p):
    return [round(p[0], 2), round(p[1], 2)]


def sampled(fn):
    """Keys every 2 frames, linear, with the holds collapsed to their ends."""
    pts = [(f, fn(f)) for f in range(0, OP + 1, 2)]
    keep = [pts[0]]
    for i in range(1, len(pts) - 1):
        if not (pts[i][1] == pts[i - 1][1] == pts[i + 1][1]):
            keep.append(pts[i])
    keep.append(pts[-1])
    return kf([(f, val, LIN) for f, val in keep])


def straight(p, q):
    return (p, (p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3),
            (p[0] + 2 * (q[0] - p[0]) / 3, p[1] + 2 * (q[1] - p[1]) / 3), q)


def feed(r):
    y = ROW_Y[r]
    return ((INBOX_R, y), (INBOX_R + 14, y), (NODE_L - 14, NODE_C[1]), (NODE_L, NODE_C[1]))


def branch(o):
    y = OWN_Y[o]
    return ((NODE_R, NODE_C[1]), (NODE_R + 18, NODE_C[1]),
            (OWN_X - OWN_D / 2 - 18, y), (OWN_X - OWN_D / 2, y))


def token_track(r):
    o = ROUTE[r]
    return Track([feed(r), straight((NODE_L, NODE_C[1]), (NODE_R, NODE_C[1])), branch(o),
                  straight((OWN_X - OWN_D / 2, OWN_Y[o]), (OWN_X, OWN_Y[o]))])


# --- drawing: the panels and lines -------------------------------------------------

def inbox():
    x = INBOX_C[0]
    head = [bar((x - 8, TOP + 16), (40, 6)),
            group([ell((x + 26, TOP + 16), (10, 10)), fill(CITRUS), stroke(INK, 2.4)], "count")]
    rule = group([line((x - 38, TOP + 30), (x + 38, TOP + 30)), stroke(INK, 3)], "rule")
    return [*head, rule, *panel(INBOX_C, INBOX_S, r=14, sw=3.5, sh=5, name="inbox")]


def report():
    x = REPORT_C[0]
    head = [bar((x - 8, TOP + 16), (40, 6)), bar((x + 26, TOP + 16), (12, 6), o=40)]
    rule = group([line((x - 38, TOP + 30), (x + 38, TOP + 30)), stroke(INK, 3)], "rule")
    tracks = group([rect((BAR_X0 + 20, y), (40, 10), 5) for y in ROW_Y]
                   + [fill(INK, 7)], "tracks")
    return [*head, rule, tracks, *panel(REPORT_C, REPORT_S, r=14, sw=3.5, sh=5, name="report")]


def lines():
    shapes = [cubic(*feed(r)) for r in range(3)] + [cubic(*branch(o)) for o in range(3)]
    return [group(shapes + [stroke(INK, 3.5)], "lines")]


def node():
    cx, cy = NODE_C
    bolt = [(2, -12), (-6, 2), (0, 2), (-4, 12), (6, -4), (0, -4)]
    pulses = []
    for t in ROUTE_AT:
        pulses += pop_moves(t + 14, over=118, up=6, down=8)
    items = [group([path([(cx + 1 + dx, cy + dy) for dx, dy in bolt], closed=True, k=0),
                    fill(PAPER), stroke(INK, 2.6)], "bolt"),
             *panel(NODE_C, (NODE_D, NODE_D), r=10, fc=CITRUS, sw=3.5, sh=4, name="node")]
    return pivot(NODE_C, items, "automation", s=seq(sc(100), pulses))


def owners():
    out = []
    for o in range(3):
        c = (OWN_X, OWN_Y[o])
        x, y = c
        r = ROUTE.index(o)
        items = [group([ell((x, y - 4), (12, 12)), fill(INK)], "head"),
                 group([rect((x, y + 9), (18, 9), 4.5), fill(INK)], "shoulders"),
                 group([ell(c, (OWN_D, OWN_D)), fill(OWN_FILL[o]), stroke(INK, 3)], "circle"),
                 group([ell((x + 3, y + 3), (OWN_D, OWN_D)), fill(INK)], "shadow")]
        out.append(pivot(c, items, "owner%d" % o,
                         s=seq(sc(100), pop_moves(ROUTE_AT[r] + TOKEN, over=114))))
    return out


# --- drawing: the moving parts -----------------------------------------------------

def leads():
    out = []
    w, h = LEAD_S
    for r in range(3):
        y = ROW_Y[r]
        o = ROUTE[r]
        t = ROUTE_AT[r]
        chip_c = seq(OWN_FILL[o], [(CLEAR + 4, CLEAR + 6, PAPER, LIN),
                                   (t + TOKEN, t + TOKEN + 4, OWN_FILL[o], LIN)])
        items = [group([ell((-w / 2 + 11, 0), (12, 12)), fill(chip_c), stroke(INK, 2.4)], "chip"),
                 bar((6, 0), (30, 6)),
                 group([rect((0, 0), LEAD_S, 6), fill(PAPER), stroke(INK, 2.6)], "card"),
                 group([rect((3, 3), LEAD_S, 6), fill(INK)], "shadow")]
        out_t = CLEAR + 2 * r
        drop = DROP_AT + 7 * r
        pos = seq([INBOX_C[0], y], [(out_t + 8, out_t + 9, [INBOX_C[0], -24], LIN),
                                    (drop, drop + 16, [INBOX_C[0], y], OUT)])
        s = seq(sc(100), [(out_t, out_t + 8, sc(0), IN), (out_t + 9, out_t + 10, sc(100), LIN)]
                + pop_moves(t, over=110, up=6, down=6))
        out.append(group(items, "lead%d" % r, tr(p=pos, s=s)))
    return out


def tokens():
    out = []
    for r in range(3):
        o = ROUTE[r]
        t0 = ROUTE_AT[r] + 2
        trk = token_track(r)
        home = (INBOX_R, ROW_Y[r])

        def f(fr, trk=trk, t0=t0, home=home):
            if fr <= t0:
                return _r(home)
            if fr >= t0 + TOKEN:
                return _r(home)
            u = (fr - t0) / TOKEN
            return _r(trk.at(trk.total * (0.5 * (smooth(u) + u))))
        s = seq(sc(0), [(t0, t0 + 4, sc(100), OUT), (t0 + TOKEN - 4, t0 + TOKEN - 1, sc(0), IN)])
        # it leaves the lead blank and comes out of the node in its owner's colour
        under = next(fr for fr in range(t0, t0 + TOKEN) if f(fr)[0] >= NODE_C[0])
        colour = seq(PAPER, [(under - 1, under + 1, OWN_FILL[o], LIN),
                             (t0 + TOKEN, t0 + TOKEN + 1, PAPER, LIN)])
        out.append(group([group([ell((0, 0), (14, 14)), fill(colour), stroke(INK, 2.6)],
                                "dot")],
                         "token%d" % r, tr(p=sampled(f), s=s)))
    return out


def _envelope():
    return [group([path([(-9, -6.5), (0, 1), (9, -6.5)], k=0), stroke(INK, 2.2)], "flap"),
            group([rect((0, 0), (20, 14), 3), fill(PAPER), stroke(INK, 2.4)], "env"),
            group([rect((2, 2), (20, 14), 3), fill(INK)], "shadow")]


def envelopes():
    out = []
    for o in range(3):
        r = ROUTE.index(o)
        t = ROUTE_AT[r] + TOKEN + 4
        slot = [ENV_X, ROW_Y[o]]
        start = [OWN_X + OWN_D / 2 + 4, OWN_Y[o]]
        out_t = CLEAR + 2 * o
        pos = seq(slot, [(out_t + 8, out_t + 9, start, LIN), (t + 2, t + 16, slot, INOUT)])
        s = seq(sc(100), [(out_t, out_t + 8, sc(0), IN),
                          (t, t + 6, sc(118), SPRING), (t + 6, t + 10, sc(100), LIN)])
        out.append(group(_envelope(), "envelope%d" % o, tr(p=pos, s=s)))
    return out


def report_bars():
    out = []
    for o in range(3):
        r = ROUTE.index(o)
        t = ROUTE_AT[r] + TOKEN + 16
        y = ROW_Y[o]
        w = BAR_W[o]

        def size(n):
            return [n, 10]

        def ctr(n):
            return [BAR_X0 + n / 2, y]
        out_t = CLEAR + 2 * o
        sz = seq(size(w), [(out_t, out_t + 10, size(0), IN), (t, t + 14, size(w), OUT)])
        cc = seq(ctr(w), [(out_t, out_t + 10, ctr(0), IN), (t, t + 14, ctr(w), OUT)])
        op = seq(100, [(out_t + 9, out_t + 10, 0, LIN), (t, t + 1, 100, LIN)])
        out.append(group([rect(cc, sz, 5), fill(OWN_FILL[o]), stroke(INK, 2.4)], "bar%d" % o,
                         tr(o=op)))
    return out


def report_check():
    c = (REPORT_L + REPORT_S[0] - 4, TOP + 4)
    return pivot(c, [check(c, 11, 3),
                     group([ell(c, (24, 24)), fill(MINT), stroke(INK, 2.8)], "disc")],
                 "check",
                 s=seq(sc(100), [(CLEAR, CLEAR + 8, sc(0), IN)] + pop_moves(CHECK_AT, over=132)))


def build():
    return wide_comp("connect", [
        layer("check", [report_check()]),
        layer("envelopes", envelopes()),
        layer("owners", owners()),
        layer("node", [node()]),
        layer("tokens", tokens()),
        layer("leads", leads()),
        layer("bars", report_bars()),
        layer("panels", inbox() + report()),
        layer("lines", lines()),
    ])
