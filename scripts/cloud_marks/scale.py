"""
Card 03 -- Cloud-native applications & platforms: scale out, scale back.

Users on the left send requests to a load-balancer node, which routes them
to a service container on the right. The container has a load
meter and a mint health check; two dashed slots above and below it are room
to grow. Demand rises: two more users arrive, requests come faster, the meter climbs and turns
coral, the check drops. The container replicates: two instances slide out of
it into the slots, the balancer's lines reach them, and the requests spread
across all three while the meters even out. Demand falls (the extra users
leave), the replicas slide back into the one container, and its health
check pops mint again.

Frame 0 is the calm picture: one user, one healthy container at low load,
two empty slots on each side, a request on its way in.

Beats (30 fps, loop 240):
  0-40    calm: a request every ~24 frames
  40-96   demand rises: two users arrive (40, 54), requests every 6-10
          frames, the meter climbs and turns coral (66), the check gives way to a coral alert (70-78)
  92-112  two replicas slide out, lines draw, their checks pop (112, 116)
  104-170 requests round-robin over three; meters settle at ~45% and
          the primary's check comes back (124)
  172-196 demand falls: the two users leave, meters drop
  196-214 replicas slide back in, lines retract
  214     the health check pops mint
  214-240 calm

Build and check:  python scripts/build_cloud_service_marks.py scale
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    v, kf, _prop, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT,
    OUT, INOUT, IN, SPRING, LIN, OP,
    sc, seq, pop_moves, smooth, layer, wide_comp, pivot,
    panel, bar, dashed, cubic, check, sparkle, Track,
)

# --- geometry ------------------------------------------------------------------

USERS_C, USERS_S = (44, 90), (60, 140)
USER_Y = [90, 46, 134]                           # the steady user, then the two who arrive
USER_X = 44
LB_C, LB_D = (138, 90), 40
INST_X = 270
INST_S = (136, 38)
INST_L = INST_X - INST_S[0] / 2                  # 194
SEATS = [90, 42, 138]                            # primary, upper, lower
GLYPH_X = INST_L + 22
METER_X0, METER_W = INST_L + 42, 62              # meter track: left edge, width
METER_Y_OFF = 0
BADGE_X = INST_L + INST_S[0] - 18

# --- timing --------------------------------------------------------------------

USERS_IN = {1: 40, 2: 54}  # demand rises: two more users arrive
USERS_OUT = {1: 172, 2: 178}
OUT_T = (92, 112)          # replicas slide out
BACK_T = (196, 214)        # ... and back in
SETTLED = 124             # meters even out: the primary is healthy again
HEALTH = 214
STRAIN = 66                # primary's meter turns coral
DOT_D = 28                 # a request's trip: entry -> container

# requests: (emission frame, from user, to seat); seat 0 is the primary
REQUESTS = ([(6, 0, 0), (30, 0, 0), (48, 1, 0), (58, 0, 0), (66, 2, 0), (74, 1, 0),
             (80, 0, 0), (86, 2, 0), (92, 1, 0)]
            + [(104 + 8 * i, (i + 1) % 3, i % 3) for i in range(9)]
            + [(184, 0, 0), (204, 0, 0), (226, 0, 0)])


# --- tracks --------------------------------------------------------------------

def branch(seat):
    y = SEATS[seat]
    return ((LB_C[0], 90), (LB_C[0] + 34, 90), (INST_L - 34, y), (INST_L, y))


def straight(p, q):
    return (p, (p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3),
            (p[0] + 2 * (q[0] - p[0]) / 3, p[1] + 2 * (q[1] - p[1]) / 3), q)


def feed(user):
    y = USER_Y[user]
    x0 = USERS_C[0] + USERS_S[0] / 2
    return ((x0, y), (x0 + 30, y), (LB_C[0] - 34, 90), (LB_C[0], 90))


def dot_track(user, seat):
    b, f = branch(seat), feed(user)
    return Track([straight((USER_X + 10, f[0][1]), f[0]), f, b,
                  straight(b[3], (b[3][0] + 18, b[3][1]))])


TRACKS = {(u, s): dot_track(u, s) for u in range(3) for s in range(3)}


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


# --- drawing -------------------------------------------------------------------

def request(i, t0, user, seat):
    trk = TRACKS[(user, seat)]
    home = (USER_X + 10, USER_Y[user])

    def age(f):
        return (f - t0) % OP

    def pos(f):
        a = age(f)
        if a > DOT_D:
            return _r(home)
        return _r(trk.at(trk.total * a / DOT_D))

    def scl(f):
        return sc(100) if age(f) <= DOT_D else sc(0)

    return group([group([ell((0, 0), (12, 12)), fill(SUN), stroke(INK, 2.6)], "dot")],
                 "req%d" % i, tr(p=sampled(pos), s=sampled(scl)))


def load_balancer():
    x, y = LB_C
    ends = [(x + 8, y - 9), (x + 8, y), (x + 8, y + 9)]
    dots = [group([ell(p, (6.5, 6.5)) for p in ends] + [ell((x - 9, y), (6.5, 6.5)), fill(INK)], "fan-dots")]
    fan = [line((x - 9, y), (x - 2, y))] + [line((x - 2, y), p) for p in ends]
    return [*dots, group([*fan, stroke(INK, 2.6)], "fan"),
            group([ell((x, y), (LB_D, LB_D)), fill(SKY), stroke(INK, 3.5)], "node"),
            group([ell((x + 4, y + 4), (LB_D, LB_D)), fill(INK)], "node-shadow")]


def lines():
    out = [group([cubic(*feed(0)), stroke(INK, 3)], "from-user0"),
           group([cubic(*branch(0)), stroke(INK, 3)], "to-primary")]
    for u in (1, 2):
        t, t2 = USERS_IN[u], USERS_OUT[u]
        e = seq(0, [(t + 2, t + 12, 100, OUT), (t2, t2 + 10, 0, INOUT)])
        out.append(group([cubic(*feed(u)), trim(e=e), stroke(INK, 3)], "from-user%d" % u))
    for s in (1, 2):
        e = seq(0, [(OUT_T[0] + 4, OUT_T[1], 100, OUT), (BACK_T[0], BACK_T[1] - 6, 0, INOUT)])
        out.append(group([cubic(*branch(s)), trim(e=e), stroke(INK, 3)], "to-replica%d" % s))
    return out


def slots():
    items = [rect((INST_X, SEATS[s]), INST_S, 9) for s in (1, 2)]
    return group(items + [dashed(stroke(INK, 2.5, o=40), 6, 5)], "slots")


def instance(seat):
    y = 90                                          # drawn at the primary seat
    if seat == 0:
        meter = seq([30, 100], [(40, 58, [55, 100], OUT), (58, 76, [92, 100], OUT),
                                (104, 124, [46, 100], INOUT), (172, 192, [22, 100], INOUT),
                                (214, 226, [30, 100], OUT)])
        meter_c = seq(CITRUS, [(STRAIN, STRAIN + 6, CORAL, LIN), (112, 120, CITRUS, LIN)])
        badge_s = seq(sc(100), [(STRAIN + 4, STRAIN + 14, sc(0), IN)] + pop_moves(SETTLED, over=136)
                      + pop_moves(HEALTH, over=140))
        pos, name = None, "primary"
    else:
        meter = seq([0, 100], [(104, 124, [46, 100], INOUT), (172, 192, [22, 100], INOUT),
                               (BACK_T[0], BACK_T[1], [0, 100], LIN)])
        meter_c = CITRUS
        t = OUT_T[1] + 4 * (seat - 1)
        badge_s = seq(sc(0), pop_moves(t, over=136)[:1] + [(t + 10, t + 18, sc(100), LIN),
                                                           (BACK_T[0], BACK_T[0] + 8, sc(0), IN)])
        target = [INST_X, SEATS[seat]]
        pos = seq([INST_X, 90], [(OUT_T[0] + 2 * (seat - 1), OUT_T[1] + 2 * (seat - 1), target, SPRING),
                                 (BACK_T[0], BACK_T[1], [INST_X, 90], INOUT)])
        name = "replica%d" % seat
    gx = GLYPH_X
    glyph = [group([line((gx - 10, y - 4), (gx + 10, y - 4)), stroke(INK, 2.6)], "lid"),
             group([rect((gx, y), (22, 20), 4), fill(BLOSSOM), stroke(INK, 2.8)], "box")]
    mc = (METER_X0 + METER_W / 2, y)
    mline = group([rect(mc, (METER_W, 10), 5), stroke(INK, 2.4)], "meter-edge")
    mfill = group([rect(mc, (METER_W, 10), 5), fill(meter_c)],
                  "meter-fill", tr(a=(METER_X0, y), p=(METER_X0, y), s=meter))
    mtrack = group([rect(mc, (METER_W, 10), 5), fill(PAPER)], "meter-track")
    badge = pivot((BADGE_X, y), [check((BADGE_X, y), 9, 2.6),
                                 group([ell((BADGE_X, y), (16, 16)), fill(MINT), stroke(INK, 2.4)],
                                       "disc")],
                  "health", s=badge_s)
    items = [badge, mline, mfill, mtrack, *glyph,
             *panel((INST_X, y), INST_S, r=9, fc=PAPER, sw=3.5, sh=4, name="card")]
    if pos is None:
        bx, by = BADGE_X, y
        warn = pivot((bx, by), [
            group([rect((bx, by - 1.8), (3, 6.6), 1.5), fill(INK)], "bang"),
            group([ell((bx, by + 4.4), (3.2, 3.2)), fill(INK)], "bang-dot"),
            group([ell((bx, by), (16, 16)), fill(CORAL), stroke(INK, 2.4)], "disc"),
        ], "overload", s=seq(sc(0), pop_moves(STRAIN + 12, over=136)
                             + [(110, 118, sc(0), IN)]))
        items.insert(1, warn)
        return group(items, name)
    return group(items, name, tr(a=(INST_X, 90), p=pos))


def user(u):
    x, y = USER_X, USER_Y[u]

    def figure(colour, o=100, sw=2.8):
        st = [stroke(INK, sw)] if colour is not None else []
        fl = fill(colour) if colour is not None else fill(INK, o)
        shoulders = rect((x, y + 9), (26, 13), 6.5)
        return [group([ell((x, y - 7), (13, 13)), fl, *st], "head"),
                group([shoulders, fl, *st], "shoulders")]
    if u == 0:
        return [group(figure(SUN), "user0")]
    t, t2 = USERS_IN[u], USERS_OUT[u]
    s = seq(sc(0), [(t, t + 10, sc(100), SPRING), (t2, t2 + 8, sc(0), IN)])
    return [group(figure(SUN), "user%d" % u, tr(a=(x, y), p=(x, y), s=s)),
            group(figure(None, o=12), "user%d-seat" % u)]


def build():
    reqs = [request(i, t, u, s) for i, (t, u, s) in enumerate(REQUESTS)]
    return wide_comp("build", [
        layer("users", user(0) + user(1) + user(2)),
        layer("users-panel", panel(USERS_C, USERS_S, r=12, fc=PAPER, sw=3.5, sh=5, name="users")),
        layer("balancer", load_balancer()),
        layer("primary", [instance(0)]),
        layer("replicas", [instance(1), instance(2)]),
        layer("requests", reqs),
        layer("lines", lines()),
        layer("slots", [slots()]),
    ])
