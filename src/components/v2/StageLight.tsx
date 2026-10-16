import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/* ============================================================================
   STAGE LIGHT — the picture behind each stage's number

   The same material as section 2's ground (scripts/make-light-streaks.py):
   light seen through vertical fluted glass, so every flute refracts it a
   little differently and the light steps from flute to flute. Here it is
   live, in a fragment shader, and what the light IS grows with the company:

     Startups     one spark, low on the right: the idea, just lit
     Growing      the curve: a J of light rising to the top right
     Enterprises  the skyline: every flute a lit tower, the whole width on

   Each is tinted with its stage's colour (sun, blossom, sky), deepened so it
   glows on the dark. All three are one function of the stage value `u`, the
   same number that winds the odometer, so the picture morphs with the
   scroll rather than switching. The shader eases its own copy of `u` toward
   the target, which smooths a tap on the tabs (phones) into a morph too.

   The top-left corner is held dark: that is where the number sits.

   Draws only while on screen. Reduced motion: no drift, and a stage change
   swaps straight to the new picture. No WebGL: the CSS ground shows instead.

   variant="network" (the AI page) draws a different picture on the same
   value and behind the same reeded glass: an ordered neural network, layers
   of ringed nodes, every node linked to the next layer, with a forward pass
   sweeping left to right through it. It grows a layer at a time. Startups:
   three small layers on the right (2-3-2). Scale-ups: five (2-3-4-3-2).
   Enterprises: seven across the card (4-5-6-5-6-5-4). Same stage colours,
   same dark corner for the number.

   variant="infra" (the Cloud & Data page, 16 Oct): infrastructure that
   grows with the company. Startups: one server rack. Scale-ups: a cluster
   wired to a hub. Enterprises: three cloud regions passing data.

   variant="build" (Digital Engineering): the code base growing. Startups:
   one branch of commits. Scale-ups: branches merging back. Enterprises: a
   mesh of services around a core.

   variant="rise" (Integrated Growth): growth taking shape. Startups: a
   first sparkline. Scale-ups: bars climbing under a trend line. Enterprises:
   channels orbiting one growth core.

   variant="shop" (UX & Digital Commerce): the store growing. Startups:
   one storefront. Scale-ups: web, tablet and phone. Enterprises: brand
   stores and marketplaces round one commerce core.
   ========================================================================== */

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float u;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

// brightness -> colour, from the page's ink through the stage's own ramp
vec3 ramp(float l, vec3 deep, vec3 mid, vec3 hot) {
  vec3 ink = vec3(16.0, 14.0, 20.0) / 255.0;
  vec3 c = mix(ink, deep, smoothstep(0.0, 0.16, l));
  c = mix(c, mid, smoothstep(0.12, 0.62, l));
  c = mix(c, hot, smoothstep(0.55, 1.02, l));
  return mix(c, vec3(1.0), smoothstep(1.0, 1.5, l) * 0.6);
}

void main() {
  vec2 q = gl_FragCoord.xy / res;          // 0..1, y up
  float a = res.x / res.y;

  // --- the glass: flutes crowd together to the left, as if turned away
  float N = 15.0;
  float gx = pow(q.x, 0.8) * N;
  float id = floor(gx);
  float fu = fract(gx);
  float fw = 1.0 / (N * 0.8 * pow(max(q.x, 0.02), -0.2));
  float xs = q.x - 0.85 * (fu - 0.5) * fw;  // where this pixel looks through to
  float tint = 0.88 + 0.24 * hash(id + 3.0);
  vec2 p = vec2(xs, q.y);

  // --- 1 · the spark: one point of light, a halo, and a thin rising beam
  vec2 c = vec2(0.74 + 0.012 * sin(t * 0.5), 0.34 + 0.02 * sin(t * 0.7));
  float d = length((p - c) * vec2(a, 1.0));
  float pulse = 0.9 + 0.1 * sin(t * 1.6);
  float spark = 1.3 * exp(-pow(d / 0.05, 2.0)) * pulse
              + 0.5 * exp(-d / 0.17)
              + 0.75 * exp(-pow((q.x - c.x) * a / 0.05, 2.0))
                     * smoothstep(c.y - 0.02, c.y + 0.12, q.y) * pow(1.0 - q.y, 0.7)
                     * (0.8 + 0.2 * sin(q.y * 18.0 - t * 2.4))
              + 0.18 * exp(-pow((p.y - 0.06) / 0.18, 2.0)) * smoothstep(0.25, 0.9, p.x);

  // --- 2 · the curve: a J of light, low on the left, up the right edge
  float yc = 0.05 + 0.92 * pow(p.x, 2.7);
  float slope = 0.92 * 2.7 * pow(max(p.x, 0.001), 1.7) / a;
  float dc = (yc - p.y) / sqrt(1.0 + slope * slope);   // +: under the curve
  float right = pow(clamp(p.x, 0.0, 1.0), 1.3);
  float run = 0.78 + 0.22 * sin(p.x * 7.0 - t * 0.9);   // light travelling up it
  float curve = 0.55 * exp(-pow((dc - 0.008) / 0.04, 2.0)) * (0.3 + 0.9 * right) * run
              + 0.62 * (dc > 0.0 ? exp(-dc / 0.16) : exp(dc / 0.05)) * (0.12 + right);

  // --- 3 · the skyline: each flute a tower, taller to the right
  float x0 = (id + 0.5) / N;
  float h = 0.14 + 0.6 * pow(pow(x0, 1.0 / 0.8), 0.9) * (0.55 + 0.45 * hash(id + 11.0))
          + 0.015 * sin(t * 0.6 + id * 1.7);
  float below = h - q.y;
  float sky = (below > 0.0 ? 0.32 * exp(-below / 0.32) + 0.1 : 0.0)
            + 0.9 * exp(-pow(below / 0.014, 2.0))                     // the lit roofline
            + 0.25 * exp(-max(-below, 0.0) / 0.05) * step(below, 0.0); // glow above it
  // a few lit windows drifting on and off inside the towers
  float row = floor(q.y * 46.0);
  float lit = step(0.84, hash(id * 31.0 + row + floor(t * 0.4 + hash(row + id) * 6.0)));
  float pane = smoothstep(0.0, 0.12, fract(q.y * 46.0)) * smoothstep(1.0, 0.7, fract(q.y * 46.0))
             * smoothstep(0.15, 0.3, fu) * smoothstep(0.85, 0.7, fu);
  sky += (below > 0.03 ? 0.3 * lit * pane : 0.0);
  sky *= 0.55 + 0.5 * right;

  // --- blend the three by the same stage value as the odometer
  float w0 = clamp(1.0 - abs(u - 0.0), 0.0, 1.0);
  float w1 = clamp(1.0 - abs(u - 1.0), 0.0, 1.0);
  float w2 = clamp(1.0 - abs(u - 2.0), 0.0, 1.0);
  float light = (w0 * spark + w1 * curve + w2 * sky) * tint;
  light += 0.05 + 0.04 * right;

  // the flutes' own edges: a hairline of light on the left, shade to the right
  light = light * (1.0 - 0.3 * exp(-(1.0 - fu) / 0.3)) + exp(-fu / 0.025) * light * 0.9;

  // keep the corner where the number sits dark
  float corner = length((q - vec2(0.0, 1.0)) * vec2(1.0, 1.25));
  light *= mix(0.22, 1.0, smoothstep(0.25, 0.85, corner));

  // each stage's colour, deepened to glow on the dark
  vec3 deep = w0 * vec3(0.20, 0.10, 0.0) + w1 * vec3(0.20, 0.02, 0.17) + w2 * vec3(0.03, 0.06, 0.30);
  vec3 mid  = w0 * vec3(1.0, 0.62, 0.06) + w1 * vec3(0.92, 0.26, 0.74) + w2 * vec3(0.08, 0.38, 0.96);
  vec3 hot  = w0 * vec3(1.0, 0.90, 0.56) + w1 * vec3(1.0, 0.77, 0.95) + w2 * vec3(0.82, 0.91, 1.0);
  vec3 col = ramp(light, deep, mid, hot);

  // a whisper of grain so the gradients never band
  col += (hash(dot(gl_FragCoord.xy, vec2(1.0, 113.0)) + fract(t)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

/* The AI page's picture: an ordered neural network, layer by layer, behind
   the same reeded glass as the fluted light (see above). */
const NETWORK = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float u;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 ramp(float l, vec3 deep, vec3 mid, vec3 hot) {
  vec3 ink = vec3(16.0, 14.0, 20.0) / 255.0;
  vec3 c = mix(ink, deep, smoothstep(0.0, 0.16, l));
  c = mix(c, mid, smoothstep(0.12, 0.62, l));
  c = mix(c, hot, smoothstep(0.55, 1.02, l));
  return mix(c, vec3(1.0), smoothstep(1.0, 1.5, l) * 0.6);
}

// seven layers across the card; each holds nodes in fixed slots, on whole
// (odd counts) or half steps (even counts), and shows the slots within its
// reach at this stage: -1 hidden, 0 one node, 0.5 two, 1 three ... 2.5 six
float half_(int k) { return (k == 0 || k == 2 || k == 4 || k == 6) ? 0.5 : 0.0; }
float reachAt(int k, float s) {
  //                 startups  scale-ups  enterprises
  vec3 r = k == 0 ? vec3(-1.0, -1.0, 1.5)
         : k == 1 ? vec3(-1.0, -1.0, 2.0)
         : k == 2 ? vec3(-1.0,  0.5, 2.5)
         : k == 3 ? vec3(-1.0,  1.0, 2.0)
         : k == 4 ? vec3( 0.5,  1.5, 2.5)
         : k == 5 ? vec3( 1.0,  1.0, 2.0)
         :          vec3( 0.5,  0.5, 1.5);
  return s < 1.0 ? mix(r.x, r.y, s) : mix(r.y, r.z, clamp(s - 1.0, 0.0, 1.0));
}

const float X0 = 0.475;     // first layer, as a share of the width: the
const float DX = 0.079;     // words keep the left; the network the right
const float Y0 = 0.45;      // the network's middle, card height (y up)
const float DY = 0.135;     // between nodes in a layer
const float R  = 0.022;     // node radius

vec2 nodePos(int k, float slot, float a) { return vec2((X0 + DX * float(k)) * a, Y0 + DY * slot); }
float nodeOn(float slot, float reach) { return smoothstep(-0.45, 0.0, reach - abs(slot)); }

void main() {
  vec2 q = gl_FragCoord.xy / res;
  float a = res.x / res.y;

  // the reeded glass: flutes crowd to the left, each looks a little aside
  float N = 15.0;
  float gx = pow(q.x, 0.8) * N;
  float id = floor(gx);
  float fu = fract(gx);
  // the network is drawn crisp (bending it would slice the rings); the
  // flutes shade it, as they shade the fluted light
  float xs = q.x;
  vec2 p = vec2(xs * a, q.y);

  float w0 = clamp(1.0 - abs(u - 0.0), 0.0, 1.0);
  float w1 = clamp(1.0 - abs(u - 1.0), 0.0, 1.0);
  float w2 = clamp(1.0 - abs(u - 2.0), 0.0, 1.0);

  // the forward pass: a wave that runs across the layers, left to right
  float W = fract(t * 0.16) * 9.0 - 1.0;

  float light = 0.0;
  float kx = (xs - X0) / DX;                 // where this pixel is, in layers
  for (int k = 0; k < 7; k++) {
    float fk = float(k);
    float reach = reachAt(k, u);
    float h = half_(k);
    float act = exp(-pow((W - fk) / 0.45, 2.0));

    // the layer's nodes: a lit ring, a soft core that fills as the wave passes
    for (int j = -3; j <= 3; j++) {
      float slot = float(j) + h;
      if (abs(slot) > 2.6) continue;
      float on = nodeOn(slot, reach);
      if (on < 0.001) continue;
      float d = length(p - nodePos(k, slot, a));
      float ring = exp(-pow((d - R) / 0.004, 2.0));
      float core = smoothstep(R, R - 0.004, d);
      float halo = exp(-max(d - R, 0.0) / 0.03);
      light += on * (0.85 * ring + core * (0.16 + 0.95 * act) + halo * (0.06 + 0.32 * act));
    }

    // its links to the next layer: every node to every node
    if (k < 6 && kx > fk - 0.05 && kx < fk + 1.05) {
      float reachB = reachAt(k + 1, u);
      float hb = half_(k + 1);
      float sw = clamp(kx - fk, 0.0, 1.0);   // how far across this gap
      float pulse = exp(-pow((W - fk - sw) / 0.12, 2.0));
      for (int i = -3; i <= 3; i++) {
        float sa = float(i) + h;
        if (abs(sa) > 2.6) continue;
        float onA = nodeOn(sa, reach);
        if (onA < 0.001) continue;
        vec2 A = nodePos(k, sa, a);
        for (int j = -3; j <= 3; j++) {
          float sb = float(j) + hb;
          if (abs(sb) > 2.6) continue;
          float onB = nodeOn(sb, reachB);
          if (onB < 0.001) continue;
          vec2 B = nodePos(k + 1, sb, a);
          vec2 ab = B - A;
          float s = clamp(dot(p - A, ab) / dot(ab, ab), 0.0, 1.0);
          float de = length(p - A - ab * s);
          // links stop at the rings rather than running into them
          float trimmed = smoothstep(0.0, 0.08, s) * smoothstep(1.0, 0.92, s);
          light += onA * onB * trimmed * (0.16 + 0.55 * pulse) * exp(-pow(de / 0.0026, 2.0));
        }
      }
    }
  }

  // a soft glow behind the network, so the glass has light to bend
  vec2 mid = vec2((X0 + DX * mix(5.0, 3.0, clamp(u * 0.5, 0.0, 1.0))) * a, Y0);
  light += 0.22 * exp(-length((p - mid) * vec2(0.8, 1.0)) / mix(0.22, 0.6, clamp(u * 0.5, 0.0, 1.0)));
  light += 0.04 + 0.04 * q.x;

  // the flutes' own edges: a hairline of light on the left, shade to the right
  float tint = 0.92 + 0.16 * hash(id + 3.0);
  light *= tint;
  light = light * (1.0 - 0.28 * exp(-(1.0 - fu) / 0.3)) + exp(-fu / 0.025) * light * 0.7;

  // keep the corner where the number sits dark, and the words' side quieter
  float corner = length((q - vec2(0.0, 1.0)) * vec2(1.0, 1.25));
  light *= mix(0.22, 1.0, smoothstep(0.25, 0.85, corner));
  light *= mix(0.55, 1.0, smoothstep(0.1, 0.45, q.x));

  vec3 deep = w0 * vec3(0.20, 0.10, 0.0) + w1 * vec3(0.20, 0.02, 0.17) + w2 * vec3(0.03, 0.06, 0.30);
  vec3 mid3 = w0 * vec3(1.0, 0.62, 0.06) + w1 * vec3(0.92, 0.26, 0.74) + w2 * vec3(0.08, 0.38, 0.96);
  vec3 hot  = w0 * vec3(1.0, 0.90, 0.56) + w1 * vec3(1.0, 0.77, 0.95) + w2 * vec3(0.82, 0.91, 1.0);
  vec3 col = ramp(light, deep, mid3, hot);

  col += (hash(dot(gl_FragCoord.xy, vec2(1.0, 113.0)) + fract(t)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

/* The Cloud & Data page's picture: infrastructure that grows with the
   company, behind the same reeded glass. Startups: one server rack, its
   lights blinking. Scale-ups: a cluster of three racks wired to one hub,
   data running up the wires. Enterprises: three cloud regions, two racks in
   each, passing data between them. The stages cross-fade on the same `u`. */
const INFRA = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float u;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 ramp(float l, vec3 deep, vec3 mid, vec3 hot) {
  vec3 ink = vec3(16.0, 14.0, 20.0) / 255.0;
  vec3 c = mix(ink, deep, smoothstep(0.0, 0.16, l));
  c = mix(c, mid, smoothstep(0.12, 0.62, l));
  c = mix(c, hot, smoothstep(0.55, 1.02, l));
  return mix(c, vec3(1.0), smoothstep(1.0, 1.5, l) * 0.6);
}

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float hair(float d, float w) { return exp(-pow(d / w, 2.0)); }
float seg(vec2 p, vec2 A, vec2 B) {
  vec2 ab = B - A;
  float s = clamp(dot(p - A, ab) / dot(ab, ab), 0.0, 1.0);
  return length(p - A - ab * s);
}

// a rack: a lit outline, three units, a blinking light and a vent in each
float rack(vec2 p, vec2 c, vec2 h, float seed) {
  vec2 d = p - c;
  float b = sdBox(d, h, 0.18 * h.x);
  float l = 0.95 * hair(b, 0.0035) + 0.12 * smoothstep(0.004, -0.004, b);
  float inside = smoothstep(0.003, -0.003, b);
  float uh = 2.0 * h.y / 3.0;
  l += 0.5 * inside * hair(abs(abs(d.y) - uh * 0.5), 0.0022) * step(abs(d.x), h.x * 0.92);
  for (int i = 0; i < 3; i++) {
    float fy = (float(i) - 1.0) * uh;
    float on = step(0.4, fract(t * (0.35 + 0.25 * hash(seed + float(i) * 7.0)) + hash(seed + float(i))));
    float dd = length(p - (c + vec2(-h.x * 0.58, fy)));
    l += (0.35 + 1.0 * on) * exp(-pow(dd / (0.11 * h.x), 2.0)) + 0.3 * on * exp(-dd / (0.3 * h.x));
    vec2 v = p - (c + vec2(h.x * 0.22, fy));
    l += 0.4 * hair(sdBox(v, vec2(h.x * 0.38, 0.0), 0.0), 0.0022);
  }
  return l;
}

// a cloud's outline: three bumps on a flat base
float sdCloud(vec2 p, vec2 c, float s) {
  vec2 d = (p - c) / s;
  float k = length(d - vec2(-0.44, -0.08)) - 0.36;
  k = min(k, length(d - vec2(0.02, 0.16)) - 0.48);
  k = min(k, length(d - vec2(0.46, -0.06)) - 0.34);
  k = min(k, sdBox(d - vec2(0.0, -0.26), vec2(0.8, 0.18), 0.18));
  return k * s;
}

float packet(vec2 p, vec2 A, vec2 B, float ph, float r) {
  vec2 pk = mix(A, B, ph);
  float d = length(p - pk);
  return exp(-pow(d / r, 2.0)) + 0.35 * exp(-d / (r * 3.0));
}

void main() {
  vec2 q = gl_FragCoord.xy / res;
  float a = res.x / res.y;

  float N = 15.0;
  float gx = pow(q.x, 0.8) * N;
  float id = floor(gx);
  float fu = fract(gx);
  vec2 p = vec2(q.x * a, q.y);
  // scale the drawing with the card: full size on a wide card, smaller on an upright one
  float S = clamp(a / 1.7, 0.42, 1.0);

  float w0 = clamp(1.0 - abs(u - 0.0), 0.0, 1.0);
  float w1 = clamp(1.0 - abs(u - 1.0), 0.0, 1.0);
  float w2 = clamp(1.0 - abs(u - 2.0), 0.0, 1.0);

  float light = 0.0;

  // 1 · Startups: one rack, on the right
  if (w0 > 0.001) {
    vec2 c = vec2(0.74 * a, 0.42);
    light += w0 * rack(p, c, vec2(0.08, 0.17) * S, 1.0);
    light += w0 * 0.25 * exp(-length((p - c) * vec2(0.8, 1.0)) / (0.28 * S));
  }

  // 2 · Scale-ups: three racks wired up to one hub
  if (w1 > 0.001) {
    vec2 H = vec2(0.72 * a, 0.76);
    float s2 = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      vec2 c = vec2((0.72 + (fi - 1.0) * 0.16 * S) * a, 0.36);
      vec2 h = vec2(0.052, 0.12) * S;
      s2 += rack(p, c, h, 10.0 + fi * 5.0);
      vec2 top = c + vec2(0.0, h.y + 0.01);
      vec2 hb = H - normalize(H - top) * 0.04 * S;
      s2 += 0.3 * hair(seg(p, top, hb), 0.0026);
      s2 += 0.9 * packet(p, top, hb, fract(t * 0.42 + fi * 0.31), 0.007);
    }
    float dh = length(p - H) - 0.04 * S;
    s2 += 0.95 * hair(dh, 0.0035) + 0.5 * smoothstep(0.004, -0.004, dh) * (0.6 + 0.4 * sin(t * 2.0));
    s2 += 0.22 * exp(-length(p - vec2(0.72 * a, 0.5)) / (0.35 * S));
    light += w1 * s2;
  }

  // 3 · Enterprises: three cloud regions, two racks in each, linked
  if (w2 > 0.001) {
    float s3 = 0.0;
    vec2 R0 = vec2((0.6 - 0.02 / S) * a, 0.7);
    vec2 R1 = vec2(0.86 * a, 0.62);
    vec2 R2 = vec2(0.7 * a, 0.25);
    float cs = 0.17 * S;
    for (int k = 0; k < 3; k++) {
      vec2 R = k == 0 ? R0 : (k == 1 ? R1 : R2);
      float dc = sdCloud(p, R, cs);
      s3 += 0.95 * hair(dc, 0.0035) + 0.08 * smoothstep(0.004, -0.004, dc);
      for (int j = 0; j < 2; j++) {
        vec2 c = R + vec2((float(j) - 0.5) * 0.36 * cs, -0.12 * cs);
        s3 += 0.8 * rack(p, c, vec2(0.13, 0.22) * cs, 20.0 + float(k * 2 + j) * 3.0);
      }
    }
    // the links between regions: dashed, with data running both ways
    for (int k = 0; k < 3; k++) {
      vec2 A = k == 0 ? R0 : (k == 1 ? R1 : R2);
      vec2 B = k == 0 ? R1 : (k == 1 ? R2 : R0);
      vec2 dir = normalize(B - A);
      vec2 A2 = A + dir * cs * 0.85;
      vec2 B2 = B - dir * cs * 0.85;
      vec2 ab = B2 - A2;
      float s = clamp(dot(p - A2, ab) / dot(ab, ab), 0.0, 1.0);
      float de = length(p - A2 - ab * s);
      float dash = step(0.45, fract(s * 14.0 - t * 0.6));
      s3 += 0.32 * dash * hair(de, 0.0028);
      s3 += 0.9 * packet(p, A2, B2, fract(t * 0.22 + float(k) * 0.33), 0.008);
      s3 += 0.6 * packet(p, B2, A2, fract(t * 0.17 + float(k) * 0.21 + 0.5), 0.006);
    }
    s3 += 0.2 * exp(-length(p - vec2(0.74 * a, 0.52)) / (0.5 * S));
    light += w2 * s3;
  }

  light += 0.04 + 0.04 * q.x;

  // the flutes: each shades its strip, a hairline of light on its left edge
  float tint = 0.92 + 0.16 * hash(id + 3.0);
  light *= tint;
  light = light * (1.0 - 0.28 * exp(-(1.0 - fu) / 0.3)) + exp(-fu / 0.025) * light * 0.7;

  float corner = length((q - vec2(0.0, 1.0)) * vec2(1.0, 1.25));
  light *= mix(0.22, 1.0, smoothstep(0.25, 0.85, corner));
  light *= mix(0.55, 1.0, smoothstep(0.1, 0.45, q.x));

  vec3 deep = w0 * vec3(0.20, 0.10, 0.0) + w1 * vec3(0.20, 0.02, 0.17) + w2 * vec3(0.03, 0.06, 0.30);
  vec3 mid3 = w0 * vec3(1.0, 0.62, 0.06) + w1 * vec3(0.92, 0.26, 0.74) + w2 * vec3(0.08, 0.38, 0.96);
  vec3 hot  = w0 * vec3(1.0, 0.90, 0.56) + w1 * vec3(1.0, 0.77, 0.95) + w2 * vec3(0.82, 0.91, 1.0);
  vec3 col = ramp(light, deep, mid3, hot);

  col += (hash(dot(gl_FragCoord.xy, vec2(1.0, 113.0)) + fract(t)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

/* The Digital Engineering page's picture: the code base growing with the
   company, behind the same reeded glass. Startups: one branch, its commits
   lit in turn up to the head. Scale-ups: feature branches leaving the main
   line and merging back, work running along them. Enterprises: a mesh of
   services around a core, requests passing between them. */
const BUILD = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float u;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 ramp(float l, vec3 deep, vec3 mid, vec3 hot) {
  vec3 ink = vec3(16.0, 14.0, 20.0) / 255.0;
  vec3 c = mix(ink, deep, smoothstep(0.0, 0.16, l));
  c = mix(c, mid, smoothstep(0.12, 0.62, l));
  c = mix(c, hot, smoothstep(0.55, 1.02, l));
  return mix(c, vec3(1.0), smoothstep(1.0, 1.5, l) * 0.6);
}

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float hair(float d, float w) { return exp(-pow(d / w, 2.0)); }
float seg(vec2 p, vec2 A, vec2 B) {
  vec2 ab = B - A;
  float s = clamp(dot(p - A, ab) / dot(ab, ab), 0.0, 1.0);
  return length(p - A - ab * s);
}
// a commit: a lit ring, its core filling when lit
float commit(vec2 p, vec2 c, float r, float lit) {
  float d = length(p - c);
  return 0.95 * hair(d - r, 0.0032) + smoothstep(r, r - 0.004, d) * (0.16 + 0.95 * lit)
       + lit * 0.4 * exp(-max(d - r, 0.0) / (r * 2.5));
}
float packet(vec2 p, vec2 A, vec2 B, float ph, float r) {
  float d = length(p - mix(A, B, ph));
  return exp(-pow(d / r, 2.0)) + 0.3 * exp(-d / (r * 3.0));
}

void main() {
  vec2 q = gl_FragCoord.xy / res;
  float a = res.x / res.y;
  float N = 15.0;
  float gx = pow(q.x, 0.8) * N;
  float id = floor(gx);
  float fu = fract(gx);
  vec2 p = vec2(q.x * a, q.y);
  float S = clamp(a / 1.7, 0.42, 1.0);

  float w0 = clamp(1.0 - abs(u - 0.0), 0.0, 1.0);
  float w1 = clamp(1.0 - abs(u - 1.0), 0.0, 1.0);
  float w2 = clamp(1.0 - abs(u - 2.0), 0.0, 1.0);
  float light = 0.0;
  float r = 0.022 * S;

  // 1 · Startups: one branch, commits lighting in turn up to the head
  if (w0 > 0.001) {
    float s1 = 0.0;
    float y = 0.42;
    vec2 A = vec2(0.52 * a, y);
    vec2 B = vec2(0.92 * a, y);
    s1 += 0.35 * hair(seg(p, A, B), 0.0028);
    float head = mod(floor(t * 0.9), 6.0);
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec2 c = vec2((0.56 + fi * 0.085) * a, y);
      float lit = fi == 4.0 ? 0.7 + 0.3 * sin(t * 2.4) : step(fi, head - 1.0) * 0.6;
      s1 += commit(p, c, r * (fi == 4.0 ? 1.35 : 1.0), lit);
    }
    s1 += 0.2 * exp(-length(p - vec2(0.9 * a, y)) / (0.22 * S));
    light += w0 * s1;
  }

  // 2 · Scale-ups: branches leave the main line and merge back
  if (w1 > 0.001) {
    float s2 = 0.0;
    float y0 = 0.3;
    float yA = 0.52;
    float yB = 0.72;
    vec2 M0 = vec2(0.5 * a, y0);
    vec2 M1 = vec2(0.94 * a, y0);
    s2 += 0.4 * hair(seg(p, M0, M1), 0.0028);
    // branch A: out at .58, back at .8
    vec2 a0 = vec2(0.58 * a, y0), a1 = vec2(0.63 * a, yA), a2 = vec2(0.75 * a, yA), a3 = vec2(0.8 * a, y0);
    // branch B: out at .66, back at .9
    vec2 b0 = vec2(0.66 * a, yA), b1 = vec2(0.71 * a, yB), b2 = vec2(0.85 * a, yB), b3 = vec2(0.9 * a, y0);
    s2 += 0.35 * (hair(seg(p, a0, a1), 0.0028) + hair(seg(p, a1, a2), 0.0028) + hair(seg(p, a2, a3), 0.0028));
    s2 += 0.35 * (hair(seg(p, b0, b1), 0.0028) + hair(seg(p, b1, b2), 0.0028) + hair(seg(p, b2, b3), 0.0028));
    s2 += commit(p, M0 + vec2(0.03 * a, 0.0), r, 0.3) + commit(p, a0, r, 0.3) + commit(p, a3, r * 1.2, 0.8);
    s2 += commit(p, b3, r * 1.2, 0.6 + 0.4 * sin(t * 2.0)) + commit(p, vec2(0.7 * a, y0), r, 0.2);
    s2 += commit(p, a1 + vec2(0.04 * a, 0.0), r, 0.4) + commit(p, a2, r, 0.5);
    s2 += commit(p, b1 + vec2(0.05 * a, 0.0), r, 0.4) + commit(p, b2, r, 0.5);
    s2 += 0.9 * packet(p, a1, a2, fract(t * 0.35), 0.007) + 0.9 * packet(p, b1, b2, fract(t * 0.28 + 0.4), 0.007);
    s2 += 0.8 * packet(p, M0, M1, fract(t * 0.18), 0.007);
    s2 += 0.2 * exp(-length(p - vec2(0.72 * a, 0.5)) / (0.35 * S));
    light += w1 * s2;
  }

  // 3 · Enterprises: a mesh of services around a core
  if (w2 > 0.001) {
    float s3 = 0.0;
    vec2 C = vec2(0.72 * a, 0.48);
    float R = 0.26 * S;
    s3 += 0.95 * hair(sdBox(p - C, vec2(0.045 * S), 0.012), 0.0034) + 0.25 * smoothstep(0.004, -0.004, sdBox(p - C, vec2(0.045 * S), 0.012));
    for (int i = 0; i < 6; i++) {
      float ang = float(i) / 6.0 * 6.2832 + 0.52;
      vec2 c = C + vec2(cos(ang) * R * 1.15, sin(ang) * R);
      float ang2 = float(i + 1) / 6.0 * 6.2832 + 0.52;
      vec2 c2 = C + vec2(cos(ang2) * R * 1.15, sin(ang2) * R);
      float db = sdBox(p - c, vec2(0.03 * S), 0.009);
      s3 += 0.9 * hair(db, 0.0032) + (0.15 + 0.5 * step(0.5, fract(t * 0.5 + hash(float(i))))) * smoothstep(0.004, -0.004, db);
      vec2 dir = normalize(c - C);
      s3 += 0.3 * hair(seg(p, C + dir * 0.06 * S, c - dir * 0.045 * S), 0.0026);
      s3 += 0.18 * hair(seg(p, c, c2), 0.0024);
      s3 += 0.9 * packet(p, C + dir * 0.06 * S, c - dir * 0.045 * S, fract(t * 0.4 + float(i) * 0.17), 0.006);
    }
    s3 += 0.22 * exp(-length(p - C) / (0.4 * S));
    light += w2 * s3;
  }

  light += 0.04 + 0.04 * q.x;
  float tint = 0.92 + 0.16 * hash(id + 3.0);
  light *= tint;
  light = light * (1.0 - 0.28 * exp(-(1.0 - fu) / 0.3)) + exp(-fu / 0.025) * light * 0.7;
  float corner = length((q - vec2(0.0, 1.0)) * vec2(1.0, 1.25));
  light *= mix(0.22, 1.0, smoothstep(0.25, 0.85, corner));
  light *= mix(0.55, 1.0, smoothstep(0.1, 0.45, q.x));

  vec3 deep = w0 * vec3(0.20, 0.10, 0.0) + w1 * vec3(0.20, 0.02, 0.17) + w2 * vec3(0.03, 0.06, 0.30);
  vec3 mid3 = w0 * vec3(1.0, 0.62, 0.06) + w1 * vec3(0.92, 0.26, 0.74) + w2 * vec3(0.08, 0.38, 0.96);
  vec3 hot  = w0 * vec3(1.0, 0.90, 0.56) + w1 * vec3(1.0, 0.77, 0.95) + w2 * vec3(0.82, 0.91, 1.0);
  vec3 col = ramp(light, deep, mid3, hot);
  col += (hash(dot(gl_FragCoord.xy, vec2(1.0, 113.0)) + fract(t)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

/* The Integrated Growth page's picture: growth taking shape, behind the
   same reeded glass. Startups: a first sparkline, rising, a point running
   along it. Scale-ups: bars climbing under a trend line. Enterprises:
   channels orbiting one growth core, each passing signal into it. */
const RISE = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float u;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 ramp(float l, vec3 deep, vec3 mid, vec3 hot) {
  vec3 ink = vec3(16.0, 14.0, 20.0) / 255.0;
  vec3 c = mix(ink, deep, smoothstep(0.0, 0.16, l));
  c = mix(c, mid, smoothstep(0.12, 0.62, l));
  c = mix(c, hot, smoothstep(0.55, 1.02, l));
  return mix(c, vec3(1.0), smoothstep(1.0, 1.5, l) * 0.6);
}

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float hair(float d, float w) { return exp(-pow(d / w, 2.0)); }
float seg(vec2 p, vec2 A, vec2 B) {
  vec2 ab = B - A;
  float s = clamp(dot(p - A, ab) / dot(ab, ab), 0.0, 1.0);
  return length(p - A - ab * s);
}
float dot_(vec2 p, vec2 c, float r, float lit) {
  float d = length(p - c);
  return 0.9 * hair(d - r, 0.003) + smoothstep(r, r - 0.004, d) * (0.2 + 0.9 * lit) + lit * 0.35 * exp(-max(d - r, 0.0) / (r * 2.5));
}
// the sparkline's height at x (0..1 along it)
float spark(float x) { return 0.24 + 0.32 * x + 0.05 * sin(x * 11.0) * (1.0 - x * 0.6); }

void main() {
  vec2 q = gl_FragCoord.xy / res;
  float a = res.x / res.y;
  float N = 15.0;
  float gx = pow(q.x, 0.8) * N;
  float id = floor(gx);
  float fu = fract(gx);
  vec2 p = vec2(q.x * a, q.y);
  float S = clamp(a / 1.7, 0.42, 1.0);

  float w0 = clamp(1.0 - abs(u - 0.0), 0.0, 1.0);
  float w1 = clamp(1.0 - abs(u - 1.0), 0.0, 1.0);
  float w2 = clamp(1.0 - abs(u - 2.0), 0.0, 1.0);
  float light = 0.0;

  // 1 · Startups: a first sparkline, rising
  if (w0 > 0.001) {
    float s1 = 0.0;
    float x0 = 0.54;
    float x1 = 0.92;
    for (int i = 0; i < 6; i++) {
      float fa = float(i) / 6.0;
      float fb = float(i + 1) / 6.0;
      vec2 A = vec2(mix(x0, x1, fa) * a, spark(fa));
      vec2 B = vec2(mix(x0, x1, fb) * a, spark(fb));
      s1 += 0.7 * hair(seg(p, A, B), 0.003);
      s1 += dot_(p, B, 0.012 * S, fb > 0.99 ? 0.8 + 0.2 * sin(t * 2.4) : 0.15);
    }
    float ph = fract(t * 0.16);
    vec2 run = vec2(mix(x0, x1, ph) * a, spark(ph));
    s1 += 1.0 * exp(-pow(length(p - run) / 0.009, 2.0)) + 0.4 * exp(-length(p - run) / 0.03);
    // the area under it, faintly
    float under = step(p.y, spark(clamp((p.x / a - x0) / (x1 - x0), 0.0, 1.0))) * step(x0 * a, p.x) * step(p.x, x1 * a) * step(0.16, p.y);
    s1 += 0.1 * under;
    light += w0 * s1;
  }

  // 2 · Scale-ups: bars climbing under a trend line
  if (w1 > 0.001) {
    float s2 = 0.0;
    float base = 0.18;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float h = 0.12 + fi * 0.09 + 0.02 * sin(t * 0.8 + fi);
      vec2 c = vec2((0.55 + fi * 0.07) * a, base + h * 0.5);
      vec2 hb = vec2(0.022 * S, h * 0.5);
      float d = sdBox(p - c, hb, 0.006);
      s2 += 0.8 * hair(d, 0.003) + smoothstep(0.004, -0.004, d) * (0.14 + 0.16 * fi / 5.0);
      if (i < 5) {
        float h2 = 0.12 + (fi + 1.0) * 0.09 + 0.02 * sin(t * 0.8 + fi + 1.0);
        vec2 A = vec2(c.x, base + h + 0.05);
        vec2 B = vec2((0.55 + (fi + 1.0) * 0.07) * a, base + h2 + 0.05);
        s2 += 0.75 * hair(seg(p, A, B), 0.003);
      }
      s2 += dot_(p, vec2(c.x, base + h + 0.05), 0.009 * S, i == 5 ? 0.8 : 0.2);
    }
    s2 += 0.35 * hair(abs(p.y - base), 0.0025) * step(0.52 * a, p.x) * step(p.x, 0.94 * a);
    light += w1 * s2;
  }

  // 3 · Enterprises: channels orbiting one growth core
  if (w2 > 0.001) {
    float s3 = 0.0;
    vec2 C = vec2(0.73 * a, 0.48);
    s3 += dot_(p, C, 0.04 * S, 0.7 + 0.3 * sin(t * 1.6));
    for (int k = 0; k < 3; k++) {
      float fk = float(k);
      float rx = (0.12 + fk * 0.075) * S * 1.25;
      float ry = (0.1 + fk * 0.07) * S;
      vec2 d = (p - C) / vec2(rx, ry);
      float ring = abs(length(d) - 1.0) * min(rx, ry);
      s3 += 0.32 * hair(ring, 0.0028);
      for (int j = 0; j < 2; j++) {
        float ang = t * (0.25 - fk * 0.05) + fk * 2.1 + float(j) * 3.14159;
        vec2 o = C + vec2(cos(ang) * rx, sin(ang) * ry);
        s3 += dot_(p, o, 0.013 * S, 0.5);
        // its signal, running in to the core
        float ph = fract(t * 0.35 + fk * 0.27 + float(j) * 0.5);
        vec2 pk = mix(o, C, ph);
        s3 += 0.7 * exp(-pow(length(p - pk) / 0.006, 2.0));
      }
    }
    s3 += 0.22 * exp(-length(p - C) / (0.3 * S));
    light += w2 * s3;
  }

  light += 0.04 + 0.04 * q.x;
  float tint = 0.92 + 0.16 * hash(id + 3.0);
  light *= tint;
  light = light * (1.0 - 0.28 * exp(-(1.0 - fu) / 0.3)) + exp(-fu / 0.025) * light * 0.7;
  float corner = length((q - vec2(0.0, 1.0)) * vec2(1.0, 1.25));
  light *= mix(0.22, 1.0, smoothstep(0.25, 0.85, corner));
  light *= mix(0.55, 1.0, smoothstep(0.1, 0.45, q.x));

  vec3 deep = w0 * vec3(0.20, 0.10, 0.0) + w1 * vec3(0.20, 0.02, 0.17) + w2 * vec3(0.03, 0.06, 0.30);
  vec3 mid3 = w0 * vec3(1.0, 0.62, 0.06) + w1 * vec3(0.92, 0.26, 0.74) + w2 * vec3(0.08, 0.38, 0.96);
  vec3 hot  = w0 * vec3(1.0, 0.90, 0.56) + w1 * vec3(1.0, 0.77, 0.95) + w2 * vec3(0.82, 0.91, 1.0);
  vec3 col = ramp(light, deep, mid3, hot);
  col += (hash(dot(gl_FragCoord.xy, vec2(1.0, 113.0)) + fract(t)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

/* The UX & Digital Commerce page's picture: the store growing with the
   company, behind the same reeded glass. Startups: one storefront, its
   products lighting as a cursor browses. Scale-ups: the same store on web,
   tablet and phone, orders running between them. Enterprises: brand
   stores and marketplaces round one commerce core, orders flowing in. */
const SHOP = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float u;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 ramp(float l, vec3 deep, vec3 mid, vec3 hot) {
  vec3 ink = vec3(16.0, 14.0, 20.0) / 255.0;
  vec3 c = mix(ink, deep, smoothstep(0.0, 0.16, l));
  c = mix(c, mid, smoothstep(0.12, 0.62, l));
  c = mix(c, hot, smoothstep(0.55, 1.02, l));
  return mix(c, vec3(1.0), smoothstep(1.0, 1.5, l) * 0.6);
}

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float hair(float d, float w) { return exp(-pow(d / w, 2.0)); }
float seg(vec2 p, vec2 A, vec2 B) {
  vec2 ab = B - A;
  float s = clamp(dot(p - A, ab) / dot(ab, ab), 0.0, 1.0);
  return length(p - A - ab * s);
}
float packet(vec2 p, vec2 A, vec2 B, float ph, float r) {
  float d = length(p - mix(A, B, ph));
  return exp(-pow(d / r, 2.0)) + 0.3 * exp(-d / (r * 3.0));
}

// a screen: a lit frame, its top bar, and a grid of product tiles, the
// tile "hot" (0..cols*rows-1) lit
float screen(vec2 p, vec2 c, vec2 h, float cols, float rows, float hot, float seed) {
  vec2 d = p - c;
  float b = sdBox(d, h, 0.16 * min(h.x, h.y));
  float l = 0.95 * hair(b, 0.0034) + 0.08 * smoothstep(0.004, -0.004, b);
  float bar = h.y * 0.82;
  l += 0.45 * hair(abs(d.y - bar), 0.0022) * step(abs(d.x), h.x * 0.94);
  // the tiles
  vec2 area = vec2(h.x * 0.86, h.y * 0.62);
  vec2 org = c + vec2(-area.x, -h.y * 0.88);
  vec2 cell = vec2(2.0 * area.x / cols, 2.0 * h.y * 0.76 / rows);
  vec2 g = (p - org) / cell;
  vec2 id = floor(g);
  if (id.x >= 0.0 && id.x < cols && id.y >= 0.0 && id.y < rows) {
    vec2 f = fract(g) - 0.5;
    float tb = sdBox(f * cell, cell * 0.36, cell.y * 0.08);
    float k = id.x + (rows - 1.0 - id.y) * cols;
    float on = 1.0 - step(0.5, abs(k - hot));
    l += 0.6 * hair(tb, 0.003) + smoothstep(0.003, -0.003, tb) * (0.1 + 0.85 * on);
  }
  return l;
}

void main() {
  vec2 q = gl_FragCoord.xy / res;
  float a = res.x / res.y;
  float N = 15.0;
  float gx = pow(q.x, 0.8) * N;
  float id = floor(gx);
  float fu = fract(gx);
  vec2 p = vec2(q.x * a, q.y);
  float S = clamp(a / 1.7, 0.42, 1.0);

  float w0 = clamp(1.0 - abs(u - 0.0), 0.0, 1.0);
  float w1 = clamp(1.0 - abs(u - 1.0), 0.0, 1.0);
  float w2 = clamp(1.0 - abs(u - 2.0), 0.0, 1.0);
  float light = 0.0;

  // 1 · Startups: one storefront, a cursor browsing it
  if (w0 > 0.001) {
    vec2 c = vec2(0.73 * a, 0.44);
    vec2 h = vec2(0.17, 0.17) * S;
    float lit = mod(floor(t * 0.8), 6.0);
    float s1 = screen(p, c, h, 3.0, 2.0, lit, 1.0);
    // the cursor, gliding to the lit tile
    float tc = mod(lit, 3.0);
    float tr = floor(lit / 3.0);
    vec2 target = c + vec2((-0.86 + (tc + 0.5) * 0.573) * h.x, (-0.88 + (1.0 - tr + 0.5) * 0.76) * h.y);
    float dc = length(p - target - vec2(0.012, -0.014) * S);
    s1 += 0.9 * exp(-pow(dc / (0.008 * S), 2.0));
    s1 += 0.22 * exp(-length((p - c) * vec2(0.8, 1.0)) / (0.3 * S));
    light += w0 * s1;
  }

  // 2 · Scale-ups: one store on web, tablet and phone
  if (w1 > 0.001) {
    float s2 = 0.0;
    vec2 cw = vec2(0.66 * a, 0.5);
    vec2 ct = vec2(0.84 * a, 0.36);
    vec2 cp = vec2(0.93 * a, 0.62);
    s2 += screen(p, cw, vec2(0.15, 0.13) * S, 3.0, 2.0, mod(floor(t * 0.7), 6.0), 2.0);
    s2 += screen(p, ct, vec2(0.065, 0.085) * S, 2.0, 2.0, mod(floor(t * 0.7 + 1.0), 4.0), 3.0);
    s2 += screen(p, cp, vec2(0.035, 0.07) * S, 1.0, 2.0, mod(floor(t * 0.7 + 2.0), 2.0), 4.0);
    s2 += 0.25 * hair(seg(p, cw + vec2(0.15 * S, -0.04), ct - vec2(0.065 * S, 0.0)), 0.0025);
    s2 += 0.25 * hair(seg(p, ct + vec2(0.0, 0.085 * S), cp - vec2(0.0, 0.07 * S)), 0.0025);
    s2 += 0.9 * packet(p, cw + vec2(0.15 * S, -0.04), ct - vec2(0.065 * S, 0.0), fract(t * 0.4), 0.007);
    s2 += 0.9 * packet(p, ct + vec2(0.0, 0.085 * S), cp - vec2(0.0, 0.07 * S), fract(t * 0.4 + 0.5), 0.007);
    s2 += 0.2 * exp(-length(p - vec2(0.76 * a, 0.5)) / (0.35 * S));
    light += w1 * s2;
  }

  // 3 · Enterprises: brand stores and marketplaces round one core
  if (w2 > 0.001) {
    float s3 = 0.0;
    vec2 C = vec2(0.74 * a, 0.48);
    float dcore = length(p - C) - 0.04 * S;
    s3 += 0.95 * hair(dcore, 0.0035) + smoothstep(0.004, -0.004, dcore) * (0.5 + 0.3 * sin(t * 2.0));
    for (int i = 0; i < 6; i++) {
      float ang = float(i) / 6.0 * 6.2832 + 0.26;
      vec2 c = C + vec2(cos(ang) * 0.27 * S * 1.2, sin(ang) * 0.27 * S);
      vec2 h = vec2(0.052, 0.042) * S;
      s3 += 0.85 * screen(p, c, h, 2.0, 1.0, mod(floor(t * 0.6 + float(i)), 2.0), 10.0 + float(i));
      vec2 dir = normalize(C - c);
      vec2 A = c + dir * 0.06 * S;
      vec2 B = C - dir * 0.05 * S;
      s3 += 0.22 * hair(seg(p, A, B), 0.0024);
      s3 += 0.9 * packet(p, A, B, fract(t * 0.35 + float(i) * 0.17), 0.006);
    }
    s3 += 0.22 * exp(-length(p - C) / (0.4 * S));
    light += w2 * s3;
  }

  light += 0.04 + 0.04 * q.x;
  float tint = 0.92 + 0.16 * hash(id + 3.0);
  light *= tint;
  light = light * (1.0 - 0.28 * exp(-(1.0 - fu) / 0.3)) + exp(-fu / 0.025) * light * 0.7;
  float corner = length((q - vec2(0.0, 1.0)) * vec2(1.0, 1.25));
  light *= mix(0.22, 1.0, smoothstep(0.25, 0.85, corner));
  light *= mix(0.55, 1.0, smoothstep(0.1, 0.45, q.x));

  vec3 deep = w0 * vec3(0.20, 0.10, 0.0) + w1 * vec3(0.20, 0.02, 0.17) + w2 * vec3(0.03, 0.06, 0.30);
  vec3 mid3 = w0 * vec3(1.0, 0.62, 0.06) + w1 * vec3(0.92, 0.26, 0.74) + w2 * vec3(0.08, 0.38, 0.96);
  vec3 hot  = w0 * vec3(1.0, 0.90, 0.56) + w1 * vec3(1.0, 0.77, 0.95) + w2 * vec3(0.82, 0.91, 1.0);
  vec3 col = ramp(light, deep, mid3, hot);
  col += (hash(dot(gl_FragCoord.xy, vec2(1.0, 113.0)) + fract(t)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
}

export type StageLightVariant = 'glass' | 'network' | 'infra' | 'build' | 'rise' | 'shop'

export function StageLight({ u, variant = 'glass' }: { u: number; variant?: StageLightVariant }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const target = useRef(u)
  const wake = useRef<() => void>(() => {})
  const reduced = useReducedMotion()

  target.current = u
  useEffect(() => wake.current(), [u])

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) return
    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, variant === 'network' ? NETWORK : variant === 'infra' ? INFRA : variant === 'build' ? BUILD : variant === 'rise' ? RISE : variant === 'shop' ? SHOP : FRAG)
    const prog = gl.createProgram()
    if (!vs || !fs || !prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'res')
    const uT = gl.getUniformLocation(prog, 't')
    const uU = gl.getUniformLocation(prog, 'u')

    el.dataset.ready = ''

    let shown = target.current
    let visible = false
    let raf = 0
    let last = performance.now()
    const start = last

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.max(1, Math.round(el.clientWidth * dpr))
      const h = Math.max(1, Math.round(el.clientHeight * dpr))
      if (el.width !== w || el.height !== h) {
        el.width = w
        el.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const draw = (now: number) => {
      size()
      gl.uniform2f(uRes, el.width, el.height)
      gl.uniform1f(uT, reduced ? 4 : (now - start) / 1000)
      gl.uniform1f(uU, shown)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = (now: number) => {
      raf = 0
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      // Follow the target: close enough to track a scroll, slow enough to
      // turn a tap into a morph.
      shown = reduced ? target.current : shown + (target.current - shown) * (1 - Math.exp(-dt * 7))
      if (Math.abs(target.current - shown) < 0.0005) shown = target.current
      draw(now)
      if (visible && (!reduced || shown !== target.current)) raf = requestAnimationFrame(frame)
    }

    const kick = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    wake.current = kick

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(el)
    const ro = new ResizeObserver(kick)
    ro.observe(el)

    return () => {
      wake.current = () => {}
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      delete el.dataset.ready
    }
  }, [reduced, variant])

  return <canvas className="cx-stage__light" ref={canvas} aria-hidden="true" />
}
