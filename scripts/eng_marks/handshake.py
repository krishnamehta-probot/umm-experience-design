"""
Card 03 -- APIs, data & systems integration: a contract between two systems.

A CRM panel on the left (people: avatar chips and name bars) and an ERP
panel on the right (a table of rows) are joined by an API pipe. A citrus
gate with a padlock sits on the pipe: every packet that passes it makes the
shackle lift and the gate pop -- access checked. Packets leave the CRM in
their record's colour and land in the ERP as rows, each with a small mint
check. One packet fails past the gate: it stops, turns coral with a cross
and shakes; a dashed retry arrow draws up and over the gate, the packet
rides it back, turns blossom again and goes through on its second try. It
is the last row in, and gets its check like the others.

Frame 0 is the finished picture: the three rows delivered and checked, the
gate locked, the pipe clear.

Beats (30 fps, loop 240):
  0-12    rest on the finished picture
  12-28   the ERP rows shrink away
  32-72   packet 1 (sky) -> row 1
  56-80   packet 2 (blossom) passes the gate and stops at the fault (80);
          coral and a cross (80-86), shakes (86-96)
  92-106  the retry arrow draws over the gate
  92-132  packet 3 (sun) goes through underneath -> row 2
  108-134 packet 2 rides the arrow back before the gate; blossom again
  142-178 packet 2's second try -> row 3, its check pops
  178-240 hold on the finished picture

Build and check:  python scripts/build_eng_service_marks.py handshake
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from build_ai_service_marks import (  # noqa: E402
    kf, ell, rect, path, line, stroke, fill, trim, tr, group,
    INK, PAPER, BLOSSOM, CITRUS, SKY, CORAL, SUN, MINT,
    OUT, INOUT, IN, SPRING, LIN, OP,
    sc, seq, pop_moves, smooth, layer, wide_comp, pivot,
    panel, bar, dashed, cubic, check, Track,
)

# --- geometry ------------------------------------------------------------------

Y = 92                                     # the pipe
CRM_C, CRM_S = (64, 92), (96, 128)         # x 16-112, y 28-156
ERP_C, ERP_S = (292, 92), (100, 128)       # x 242-342
CRM_R = CRM_C[0] + CRM_S[0] / 2            # 112
ERP_L = ERP_C[0] - ERP_S[0] / 2            # 242
GATE_C, GATE_S = (178, Y), (36, 46)
HOME = (CRM_R - 16, Y)                     # inside the CRM, out of sight
PARK = (ERP_L + 18, Y)                     # inside the ERP, out of sight
FAULT = (216, Y)                           # where packet 2 breaks down
REJOIN = (138, Y)                          # where the retry drops it back

PEOPLE_Y = [74, 100, 126]
PEOPLE = [SKY, BLOSSOM, SUN]
ROW_Y = [74, 100, 126]
CHIP_X = ERP_L + 18
TICK_X = ERP_C[0] + ERP_S[0] / 2 - 18

PKT = 14
SHRINK = 12

# (colour, row, start frame); packet 2 is the one that fails first
P1 = (SKY, 0, 32)
P3 = (SUN, 1, 92)
P2_START = 56
P2_STOP = 80                               # it reaches the fault
FAULTED = 80
SHAKE = (86, 96)
ARROW = (92, 106)
RIDE = (108, 134)
RETRY = (142, 178)
RUN = 40                                   # HOME -> PARK


# --- tracks --------------------------------------------------------------------

def straight(p, q):
    return (p, (p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3),
            (p[0] + 2 * (q[0] - p[0]) / 3, p[1] + 2 * (q[1] - p[1]) / 3), q)


ARC = (FAULT, (FAULT[0] - 2, Y - 66), (REJOIN[0] + 2, Y - 66), REJOIN)
ARC_TRACK = Track([ARC])


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


def _x(a, b, u):
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)


def run_pos(t0, a=HOME, b=PARK, d=RUN):
    """Along the pipe from a to b, steady, easing only at the very ends."""
    def f(fr):
        u = (fr - t0) / d
        return _x(a, b, 0.5 * (smooth(u) + u))
    return f


def p2_pos(fr):
    if fr <= P2_START or fr > RETRY[1] + 2:
        return _r(HOME)
    if fr <= P2_STOP:
        u = (fr - P2_START) / (P2_STOP - P2_START)
        return _r(_x(HOME, FAULT, 1 - (1 - u) ** 2))          # brakes into the fault
    if fr <= RIDE[0]:
        if SHAKE[0] <= fr <= SHAKE[1]:
            k = (fr - SHAKE[0]) // 2
            return _r((FAULT[0] + (2.5 if k % 2 else -2.5) * (fr < SHAKE[1]), Y))
        return _r(FAULT)
    if fr <= RIDE[1]:
        u = smooth((fr - RIDE[0]) / (RIDE[1] - RIDE[0]))
        return _r(ARC_TRACK.at(ARC_TRACK.total * u))
    if fr <= RETRY[0]:
        return _r(REJOIN)
    if fr <= RETRY[1]:
        return _r(run_pos(RETRY[0], REJOIN, PARK, RETRY[1] - RETRY[0])(fr))
    return _r(PARK)


def good_pos(t0):
    run = run_pos(t0)

    def f(fr):
        if fr <= t0 or fr > t0 + RUN + 2:
            return _r(HOME)
        if fr >= t0 + RUN:
            return _r(PARK)
        return _r(run(fr))
    return f


def gate_passes():
    """The frames at which some packet is under the gate's middle."""
    out = []
    for fn in (good_pos(P1[2]), good_pos(P3[2]), p2_pos):
        prev = fn(0)[0]
        for fr in range(1, OP):
            x = fn(fr)[0]
            if prev < GATE_C[0] <= x:
                out.append(fr)
            prev = x
    return sorted(out)


# --- drawing: the two systems ----------------------------------------------------

def crm():
    x0 = CRM_C[0] - CRM_S[0] / 2
    head = [bar((x0 + 30, 44), (34, 6)), bar((x0 + 74, 44), (14, 6), o=40)]
    rule = group([line((x0 + 2, 56), (CRM_R - 2, 56)), stroke(INK, 3)], "rule")
    people = []
    for i, y in enumerate(PEOPLE_Y):
        people += [bar((x0 + 52, y - 5), (32, 6)), bar((x0 + 46, y + 6), (20, 5), o=40),
                   group([ell((x0 + 20, y), (16, 16)), fill(PEOPLE[i]), stroke(INK, 2.4)], "face%d" % i)]
    return [*head, rule, *people,
            *panel(CRM_C, CRM_S, r=12, fc=PAPER, sw=3.5, sh=5, name="crm")]


def erp():
    x0 = ERP_L
    head = [bar((x0 + 28, 44), (30, 6)), bar((x0 + 72, 44), (22, 6), o=40)]
    rule = group([line((x0 + 2, 56), (x0 + ERP_S[0] - 2, 56)), stroke(INK, 3)], "rule")
    seps = group([line((x0 + 10, y + 13), (x0 + ERP_S[0] - 10, y + 13)) for y in ROW_Y[:-1]]
                 + [stroke(INK, 1.5, o=14)], "seps")
    return [*head, rule, seps,
            *panel(ERP_C, ERP_S, r=12, fc=PAPER, sw=3.5, sh=5, name="erp")]


ROW_SOURCES = [(SKY, P1[2] + RUN - 6), (SUN, P3[2] + RUN - 6), (BLOSSOM, RETRY[1] - 6)]


def rows():
    out = []
    for r, y in enumerate(ROW_Y):
        colour, land = ROW_SOURCES[r]
        tick = pivot((TICK_X, y), [check((TICK_X, y), 8, 2.4),
                                   group([ell((TICK_X, y), (15, 15)), fill(MINT), stroke(INK, 2.2)],
                                         "disc")],
                     "tick", s=seq(sc(100), [(SHRINK, SHRINK + 4, sc(0), IN)]
                                   + pop_moves(land + 8, over=150)))
        items = [tick,
                 bar((CHIP_X + 30, y), (32, 6)),
                 group([rect((CHIP_X, y), (14, 14), 4), fill(colour), stroke(INK, 2.4)], "chip")]
        down = SHRINK + 2 * (2 - r)
        s = seq(sc(100), [(down, down + 8, [0, 100], IN),
                          (land, land + 10, [106, 100], OUT), (land + 10, land + 16, sc(100), INOUT)])
        out.append(group(items, "row%d" % r, tr(a=(CHIP_X - 8, y), p=(CHIP_X - 8, y), s=s)))
    return out


# --- drawing: the pipe and the gate ----------------------------------------------

def pipe():
    a, b = (CRM_R - 4, Y), (ERP_L + 4, Y)
    return [group([line(a, b), stroke(PAPER, 4)], "pipe-in"),
            group([line(a, b), stroke(INK, 11)], "pipe-out")]


def gate():
    x, y = GATE_C
    passes = gate_passes()
    assert all(b - a >= 12 for a, b in zip(passes, passes[1:])), passes
    pop = []
    lift = []
    for t in passes:
        pop += pop_moves(t - 2, over=110, up=4, down=6)
        lift += [(t - 4, t - 1, [x, y - 4], OUT), (t + 3, t + 8, [x, y], INOUT)]
    shackle = group([group([cubic((x - 5, y - 1), (x - 5, y - 13), (x + 5, y - 13), (x + 5, y - 1)),
                            stroke(INK, 3)], "arc")],
                    "shackle", tr(a=(x, y), p=seq([x, y], lift)))
    lock = [group([ell((x, y + 4), (3.6, 3.6)), fill(CITRUS)], "hole"),
            group([rect((x, y + 5), (18, 14), 3), fill(INK)], "body")]
    return [pivot(GATE_C, [*lock, shackle,
                           *panel(GATE_C, GATE_S, r=9, fc=CITRUS, sw=3.5, sh=4, name="gate")],
                  "gate", s=seq(sc(100), pop))]


# --- drawing: packets and the retry arrow -----------------------------------------

def packet(colour, t0, name):
    body = [group([rect((0, 0), (PKT, PKT), 4), fill(colour), stroke(INK, 2.6)], "pkt")]
    s = seq(sc(0), [(t0, t0 + 2, sc(100), LIN), (t0 + RUN + 2, t0 + RUN + 4, sc(0), LIN)])
    return group(body, name, tr(p=sampled(good_pos(t0)), s=s))


def faulty():
    c = seq(BLOSSOM, [(FAULTED, FAULTED + 4, CORAL, LIN), (RIDE[1] - 4, RIDE[1] + 2, BLOSSOM, LIN)])
    cross = group([line((-3.2, -3.2), (3.2, 3.2)), line((3.2, -3.2), (-3.2, 3.2)), stroke(INK, 2.4)],
                  "x", tr(s=seq(sc(0), pop_moves(FAULTED + 2, over=150) + [(RIDE[1] - 8, RIDE[1] - 2, sc(0), IN)])))
    body = group([rect((0, 0), (PKT + 2, PKT + 2), 4), fill(c), stroke(INK, 2.6)], "pkt")
    s = seq(sc(0), [(P2_START, P2_START + 2, sc(100), LIN),
                    (FAULTED, FAULTED + 6, sc(118), OUT), (FAULTED + 6, FAULTED + 12, sc(100), INOUT),
                    (RETRY[1] + 2, RETRY[1] + 4, sc(0), LIN)])
    return group([cross, body], "retried", tr(p=sampled(p2_pos), s=s))


def retry_arrow():
    t0, t1 = ARROW
    r0, r1 = RIDE
    e = seq(0, [(t0, t1, 100, INOUT), (r1 + 4, r1 + 5, 0, LIN)])
    def tail(fr):                          # the arrow is eaten from behind, under the packet
        if r0 <= fr <= r1:
            return round(100 * smooth((fr - r0) / (r1 - r0)), 2)
        return 100 if r1 < fr <= r1 + 4 else 0
    s = sampled(tail)
    arc = group([cubic(*ARC), trim(s=s, e=e), dashed(stroke(INK, 2.8), 5, 5)], "arc")
    tip = REJOIN
    head = pivot(tip, [group([path([(tip[0] - 6, tip[1] - 14), (tip[0], tip[1] - 7),
                                    (tip[0] + 6, tip[1] - 14)], k=0), stroke(INK, 2.8)], "head")],
                 "head", s=seq(sc(0), pop_moves(t1 - 2, over=140) + [(r1 - 4, r1, sc(0), IN)]))
    return [head, arc]


def build():
    return wide_comp("connect", [
        layer("arrow", retry_arrow()),
        layer("crm", crm()),
        layer("rows", rows()),
        layer("erp", erp()),
        layer("gate", gate()),
        layer("packets", [faulty(), packet(P3[0], P3[2], "pkt3"), packet(P1[0], P1[2], "pkt1")]),
        layer("pipe", pipe()),
    ])
