import { reducedMotion } from './gl'

/* ============================================================================
   GLOW — the shader behind the flanking-question heroes (HomeFlank)

   Krish's reference (30 Oct) was a white page with a magenta glow rising
   behind the black content; the idea, he said, is the glow, not the one
   colour, so the colours turn slowly through a set of palettes, and there
   are other kinds of shader beside it. Each is a soft field of colour on
   white, drawn about the ask bar:

     glow     a bloom rising from below the bar, its edge drawn about by noise
     mesh     three soft blobs of colour drifting and blending around the bar
     aurora   curtains of light rising from the foot of the screen
     silk     a satin ribbon flowing across behind the bar
     halo     a ring of light around the bar, its colours turning round it

   and, asked for as something more current (Krish, 3 Nov):

     grain    a broad gradient rising from below, with a film grain over it
     dither   the bloom drawn in pixels, ordered dots of the palette's colours
              thinning out into the white (the canvas shown unsmoothed);
              made a little nicer at Krish's ask (3 Nov): five steps, not
              four, so the dots step more finely from the white, a tighter
              edge so fewer stray dots reach the copy, and faint rings
              going slowly out from the bar through the dots
     fluted   the mesh seen through a pane of fluted glass. Krish liked the
              first (3 Nov) and asked for it nicer; two passes lit the ribs
              as rods (orbs behind, then wide rods) and missed. It is now
              built as the fluted glass designers use (after Paper Shaders'
              Fluted Glass, Apache-2.0): flat flutes, each a prism sliding
              the colour behind it across itself, a faint shade across each
              and a hairline of light at its edge, a fine grain; the cursor
              slides the colour through the flutes

   and, from the Lovable heroes' third, "Flow" (Krish, 3 Nov):

     flow     bands of colour across the screen, white at the top down to the
              deepest at the foot, their edges frayed and swaying, a fine
              bright thread along each, a fine grain over all

   The flow takes five colours, so every palette has five: the deep one, the
   light one and the accent, then two more for the flow's bands (by default
   the accent's way to the deep one, and a pale of the deep one).

   The cursor leans each a little and brings up a touch more light where it
   is. The colours come from a palette (TONES) or, by default, turn through
   them all ('rotate'), easing from one to the next.

   The field is soft, so the canvas is drawn at half the CSS resolution. The
   shader is SHADER_GLSL, which the glass mark (GlassMark.ts) draws too,
   reading the same values from `glowNow`, so the glass bends the same light.
   ========================================================================== */

export type Shader = 'glow' | 'mesh' | 'aurora' | 'silk' | 'halo' | 'grain' | 'dither' | 'fluted' | 'flow'

export const SHADERS: { id: Shader; label: string; hint: string }[] = [
  { id: 'glow', label: 'Glow', hint: 'A bloom of colour rising from below the ask bar, its edge slowly drawn about.' },
  { id: 'mesh', label: 'Mesh', hint: 'Three soft blobs of colour drifting and blending around the ask bar.' },
  { id: 'aurora', label: 'Aurora', hint: 'Curtains of light rising from the foot of the screen, swaying slowly.' },
  { id: 'silk', label: 'Silk', hint: 'A satin ribbon of colour flowing across behind the ask bar.' },
  { id: 'halo', label: 'Halo', hint: 'A ring of light around the ask bar, its colours turning slowly round it.' },
  { id: 'grain', label: 'Grain', hint: 'A broad gradient rising from below the ask bar, with a fine film grain over it.' },
  { id: 'dither', label: 'Dither', hint: 'The glow drawn in pixels: ordered dots of colour thinning out into the white.' },
  {
    id: 'fluted',
    label: 'Fluted glass',
    hint: 'The soft colour seen through a pane of fluted glass, each flute folding it; the cursor slides it through them.',
  },
  {
    id: 'flow',
    label: 'Flow',
    hint: 'Bands of colour across the screen, white at the top to the deepest at the foot, swaying, a bright thread along each.',
  },
]

export type Tone = 'rotate' | 'magenta' | 'violet' | 'ocean' | 'mint' | 'sunset' | 'pastel' | 'spectrum'

/** each palette: a deep colour, a lighter one, and an accent; and, for the
 *  flow's bands, two more where the palette names them */
const PALETTES: Record<Exclude<Tone, 'rotate'>, string[]> = {
  magenta: ['#e23da4', '#f59fd6', '#9b5cff'],
  violet: ['#6b4cff', '#b9a8ff', '#e05bff'],
  ocean: ['#1f6bff', '#8ec9ff', '#14cfc0'],
  mint: ['#10c49a', '#a8f0d4', '#b7e83a'],
  sunset: ['#ff5a36', '#ffb27a', '#ff4fa3'],
  /* the brand's five: blossom, sky, citrus, then coral and sun */
  pastel: ['#ffc4f2', '#d1e7ff', '#f0ff70', '#ffc3c4', '#ffe58f'],
  /* the Flow reference's bands: ember, sky, lilac, then rose and sun */
  spectrum: ['#ff662e', '#99ccff', '#c7b3ff', '#ff999e', '#ffd97a'],
}

export const TONES: { id: Tone; label: string; hint: string }[] = [
  { id: 'rotate', label: 'Rotate', hint: 'Turns slowly through every palette, easing from one into the next.' },
  { id: 'magenta', label: 'Magenta', hint: 'Krish’s reference: magenta into pink, a touch of violet.' },
  { id: 'violet', label: 'Violet', hint: 'Indigo and lilac, a touch of orchid.' },
  { id: 'ocean', label: 'Ocean', hint: 'Electric blue and sky, a touch of teal.' },
  { id: 'mint', label: 'Mint', hint: 'Jade and mint, a touch of lime.' },
  { id: 'sunset', label: 'Sunset', hint: 'Coral and peach, a touch of pink.' },
  { id: 'pastel', label: 'Pastel', hint: 'The brand pastels: pink, sky and lime, soft on the white.' },
  { id: 'spectrum', label: 'Spectrum', hint: 'The Flow hero’s colours: sky, lilac, rose, ember and sun.' },
]

/** the order 'rotate' turns through */
const ROTATION: Exclude<Tone, 'rotate' | 'pastel' | 'spectrum'>[] = ['magenta', 'violet', 'ocean', 'mint', 'sunset']
/** how long each palette holds in the rotation, and how long it eases (s) */
const HOLD = 7
const EASE = 3

export const SHADER_GLSL = /* glsl */ `
uniform float sMode;
uniform vec3 sA;
uniform vec3 sB;
uniform vec3 sC;
uniform vec3 sD;
uniform vec3 sE;
uniform vec2 sAnchor;
uniform vec2 sSize;
uniform float sView;
uniform vec3 sMouse;
uniform float sTime;

float gh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float gn(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(gh(i), gh(i + vec2(1.0, 0.0)), f.x), mix(gh(i + vec2(0.0, 1.0)), gh(i + vec2(1.0, 1.0)), f.x), f.y);
}
float gfbm(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * gn(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}
vec3 tint(vec3 c, float a) { return mix(vec3(1.0), c, clamp(a, 0.0, 1.0)); }
float near(vec2 p, float r) {
  vec2 m = (p - sMouse.xy) / r;
  return exp(-dot(m, m)) * sMouse.z;
}

/* a bloom rising from below the bar */
vec3 glowMode(vec2 p) {
  vec2 gC = sAnchor + vec2(0.0, sView * 0.26);
  vec2 gR = vec2(max(sSize.x * 0.46, 320.0), max(sView * 0.5, 300.0));
  vec2 c = gC + (sMouse.xy - gC) * 0.07 * sMouse.z;
  vec2 q = (p - c) / gR;
  vec2 w = vec2(gfbm(q * 1.4 + vec2(sTime * 0.035, 0.0)), gfbm(q * 1.4 + vec2(5.2, -sTime * 0.03))) - 0.5;
  q += w * 0.55;
  float d = length(q) / (1.0 + 0.05 * sin(sTime * 0.35));
  float a = exp(-d * d * 2.2);
  a += 0.16 * near(p, gR.x * 0.45) * smoothstep(0.0, 0.4, a + 0.1);
  vec3 col = mix(vec3(1.0), sB, smoothstep(0.04, 0.5, a));
  return mix(col, sA, smoothstep(0.42, 0.95, a));
}

/* the mesh's slow warp at a point, apart so it can be worked out once */
vec2 meshWarp(vec2 p) {
  vec2 q = p / max(sSize.x, sView);
  return (vec2(gfbm(q * 2.0 + sTime * 0.03), gfbm(q * 2.0 + vec2(3.1, 1.7) - sTime * 0.025)) - 0.5) * 0.18;
}

/* three blobs drifting and blending around the bar, warped by w */
vec3 meshAt(vec2 p, vec2 w) {
  float s = max(sSize.x, sView);
  vec2 q = p / s + w;
  vec2 qa = sAnchor / s;
  float t = sTime;
  vec2 b1 = qa + vec2(-0.3 + 0.06 * sin(t * 0.11), 0.1 + 0.05 * cos(t * 0.09));
  vec2 b2 = qa + vec2(0.28 + 0.05 * cos(t * 0.08), 0.14 + 0.06 * sin(t * 0.12));
  vec2 b3 = qa + vec2(0.04 * sin(t * 0.07), 0.3 + 0.05 * sin(t * 0.1));
  b3 += (sMouse.xy / s - b3) * 0.12 * sMouse.z;
  float w1 = exp(-dot(q - b1, q - b1) / 0.075);
  float w2 = exp(-dot(q - b2, q - b2) / 0.075);
  float w3 = exp(-dot(q - b3, q - b3) / 0.1);
  float sum = w1 + w2 + w3 + 0.0001;
  vec3 c = (sA * w1 + sC * w2 + sB * w3) / sum;
  float a = smoothstep(0.0, 0.9, sum) * 0.95 + 0.12 * near(p, s * 0.16);
  return tint(c, a);
}

vec3 meshMode(vec2 p) {
  return meshAt(p, meshWarp(p));
}

/* curtains of light rising from the foot of the screen */
vec3 auroraMode(vec2 p) {
  vec2 q = vec2(p.x / sSize.x, p.y / sView);
  float t = sTime;
  float rise = (sAnchor.y / sView + 0.5) - q.y;
  float edge = 0.78 + 0.5 * (gfbm(vec2(q.x * 2.2 + t * 0.03, t * 0.02)) - 0.5);
  float a = smoothstep(-0.2, 0.05, rise) * (1.0 - smoothstep(edge * 0.3, edge, rise));
  float rays = gn(vec2(q.x * 14.0 + gfbm(vec2(q.x * 2.5, t * 0.05)) * 7.0, t * 0.07));
  a *= 0.3 + 0.95 * smoothstep(0.2, 0.85, rays);
  a *= 1.0 + 0.3 * exp(-pow((p.x - sMouse.x) / (sSize.x * 0.12), 2.0)) * sMouse.z;
  vec3 col = mix(sA, sC, smoothstep(0.1, 0.9, q.x + 0.15 * sin(t * 0.05)));
  col = mix(col, sB, smoothstep(0.0, edge, rise));
  return tint(col, a);
}

/* a satin ribbon flowing across behind the bar */
vec3 silkMode(vec2 p) {
  vec2 q = vec2(p.x / sSize.x, (p.y - sAnchor.y) / sView);
  float t = sTime;
  float m = exp(-pow((p.x - sMouse.x) / (sSize.x * 0.18), 2.0)) * sMouse.z;
  float f = q.y * 5.0 + sin(q.x * 3.2 + t * 0.12) * 0.9 + sin(q.x * 6.3 - t * 0.09 + q.y * 3.0) * 0.35 + m * 0.4;
  float s = 0.5 + 0.5 * sin(f * 2.4);
  vec3 col = mix(sA, sB, s);
  col = mix(col, sC, smoothstep(0.3, 1.0, q.x) * 0.35);
  col = mix(col, vec3(1.0), pow(s, 6.0) * 0.55);
  float c = q.y + (q.x - 0.5) * 0.25 + 0.06 * sin(q.x * 4.0 + t * 0.1) - 0.08;
  return tint(col, exp(-c * c / 0.045));
}

/* a ring of light around the bar, its colours turning round it */
vec3 haloMode(vec2 p) {
  float R = clamp(sSize.x * 0.23, 150.0, 360.0);
  vec2 d = p - sAnchor;
  d.y *= 1.9;
  float r = length(d);
  float ang = atan(d.y, d.x);
  /* noise taken round the circle, so it meets itself without a seam */
  vec2 dir = d / max(r, 0.001);
  float wob = (gfbm(dir * 1.2 + vec2(sTime * 0.06, -sTime * 0.04)) - 0.5) * 0.3 * R;
  float ring = exp(-pow((r - R - wob) / (R * 0.22), 2.0));
  float inner = exp(-pow(r / (R * 0.9), 2.0)) * 0.3;
  float spin = ang + sTime * 0.15;
  vec3 col = mix(mix(sA, sC, 0.5 + 0.5 * sin(spin)), sB, (0.5 + 0.5 * sin(spin * 2.0 + 1.3)) * 0.5);
  float a = ring * 0.95 + inner + 0.25 * ring * near(p, R * 0.8);
  return tint(col, a);
}

/* a broad gradient rising from below the bar, with a film grain over it */
vec3 grainMode(vec2 p) {
  vec2 gC = sAnchor + vec2(0.0, sView * 0.42);
  vec2 gR = vec2(max(sSize.x * 0.62, 380.0), max(sView * 0.62, 340.0));
  vec2 c = gC + (sMouse.xy - gC) * 0.06 * sMouse.z;
  vec2 q = (p - c) / gR;
  vec2 w = vec2(gfbm(q * 1.2 + vec2(sTime * 0.03, 0.0)), gfbm(q * 1.2 + vec2(5.2, -sTime * 0.025))) - 0.5;
  q += w * 0.6;
  float a = exp(-dot(q, q) * 1.6);
  vec3 col = mix(vec3(1.0), sB, smoothstep(0.02, 0.35, a));
  col = mix(col, sC, smoothstep(0.3, 0.7, a) * (0.55 + 0.45 * sin(q.x * 2.4 + sTime * 0.08)));
  col = mix(col, sA, smoothstep(0.62, 0.98, a));
  /* the grain: still, two pixels to a speck, heavier where the colour is */
  float g = gh(floor(p * 0.5) + 0.37) - 0.5;
  return col + g * (0.03 + 0.12 * a);
}

/* ordered dither: the levels of a 8 x 8 Bayer matrix */
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer8(vec2 a) {
  return (bayer2(0.25 * a) * 0.25 + bayer2(0.5 * a)) * 0.25 + bayer2(a);
}

/* the bloom drawn in pixels: white, then a pale of the light colour, the
   light colour, the accent and the deep one, in ordered dots that thin out
   at the edges; through it faint rings go slowly out from the bar, each a
   little denser band of dots, and the cursor brings up a few more */
vec3 ditherMode(vec2 p) {
  vec2 cell = floor(p / 4.0);
  vec2 cp = cell * 4.0 + 2.0;
  vec2 gC = sAnchor + vec2(0.0, sView * 0.3);
  vec2 gR = vec2(max(sSize.x * 0.5, 340.0), max(sView * 0.55, 320.0));
  vec2 q = (cp - gC) / gR;
  vec2 w = vec2(gfbm(q * 1.5 + vec2(sTime * 0.04, 0.0)), gfbm(q * 1.5 + vec2(5.2, -sTime * 0.035))) - 0.5;
  q += w * 0.6;
  float a = max(0.0, exp(-dot(q, q) * 2.2) - 0.12) / 0.88;
  vec2 r = (cp - sAnchor) / vec2(gR.x, gR.y * 0.8);
  a += 0.08 * sin(length(r) * 16.0 - sTime * 0.8) * smoothstep(0.04, 0.45, a);
  a += 0.16 * near(cp, gR.x * 0.4) * smoothstep(0.0, 0.2, a + 0.05);
  float lv = clamp(floor(a * 4.2 + bayer8(cell)), 0.0, 4.0);
  if (lv < 0.5) return vec3(1.0);
  if (lv < 1.5) return mix(vec3(1.0), sB, 0.55);
  if (lv < 2.5) return sB;
  if (lv < 3.5) return sC;
  return sA;
}

/* the mesh through a pane of fluted glass (after Paper Shaders' Fluted
   Glass, Apache-2.0, its "prism"). Each flute is flat glass that slides
   what is behind it across itself: by half a flute at its left edge, back
   by more and more toward its right, and smoothly back again in its last
   stretch, so each shows a slice of the colour drawn out and folded, and the
   flutes meet without a seam in the colour. Reds slide a little less than
   blues. Across each, a faint shade deepening to the right; at its edge a
   hairline of light; over all a fine grain. The cursor slides the colour
   through the flutes a little. */
vec3 flutedMode(vec2 p) {
  float rw = clamp(sSize.x / 24.0, 44.0, 84.0);
  float x = fract(p.x / rw);
  float slide = (sMouse.x / sSize.x - 0.5) * 0.4 * sMouse.z;
  float d = 0.5 - pow(1.5 * x, 3.0);
  d = mix(0.5, d, smoothstep(0.0, 0.3, x) * (1.0 - smoothstep(0.7, 1.0, x))) - slide;
  float k = d * 1.5 * rw;
  vec2 w = meshWarp(p);
  vec3 col = vec3(
    meshAt(vec2(p.x + k * 0.96, p.y), w).r,
    meshAt(vec2(p.x + k, p.y), w).g,
    meshAt(vec2(p.x + k * 1.04, p.y), w).b
  );
  float colour = 1.0 - min(min(col.r, col.g), col.b);
  col *= 1.0 - (0.05 + 0.1 * colour) * pow(x, 1.3);
  float hw = 1.5 / rw;
  float line = 1.0 - smoothstep(0.0, hw, x) * (1.0 - smoothstep(1.0 - hw, 1.0, x));
  col = mix(col, vec3(1.0), line * (0.18 + 0.5 * colour));
  col += (gh(floor(p) + 0.71) - 0.5) * 0.03;
  return clamp(col, 0.0, 1.0);
}

/* the Flow's own noise, as in the reference: five octaves, each turned */
float ffbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * gn(p);
    p = R * p * 2.02;
    a *= 0.5;
  }
  return v;
}

/* bands of colour across the first screen: white at the top, then the light
   colour, the accent, the fourth, the deep one and the fifth at the foot,
   their edges frayed by noise and swaying, a fine bright thread running
   along each, the top washed back to white for the nav, a grain over all */
vec3 flowMode(vec2 p) {
  float t = sTime;
  vec2 uv = vec2(p.x / sSize.x, 1.0 - p.y / sView);
  vec2 q = vec2(p.x / sView, uv.y);
  float mx = mix(0.5, sMouse.x / sSize.x, sMouse.z);
  float y = uv.y + sin(q.x * 2.2 + t * 0.35) * 0.12 + (ffbm(q * 1.4 + vec2(t * 0.07, 0.0)) - 0.5) * 0.5
    + (mx - 0.5) * 0.1 * sin(q.x * 3.0);
  vec3 paper = vec3(0.992, 0.984, 0.968);
  vec3 c = paper;
  c = mix(c, sB, 1.0 - smoothstep(0.6, 0.85, y));
  c = mix(c, sC, 1.0 - smoothstep(0.42, 0.6, y));
  c = mix(c, sD, 1.0 - smoothstep(0.3, 0.45, y));
  c = mix(c, sA, 1.0 - smoothstep(0.12, 0.3, y));
  c = mix(c, sE, 1.0 - smoothstep(-0.05, 0.12, y));
  c += pow(abs(sin(y * 14.0 - t * 0.6)), 40.0) * 0.18;
  c = mix(c, paper, smoothstep(0.75, 1.0, uv.y) * 0.7);
  return c + (gh(floor(p) + fract(t * 7.0) * 61.0) - 0.5) * 0.035;
}

/* the field at a point of the page (CSS px, y down), in sRGB */
vec3 shaderAt(vec2 p) {
  if (sMode < 0.5) return glowMode(p);
  if (sMode < 1.5) return meshMode(p);
  if (sMode < 2.5) return auroraMode(p);
  if (sMode < 3.5) return silkMode(p);
  if (sMode < 4.5) return haloMode(p);
  if (sMode < 5.5) return grainMode(p);
  if (sMode < 6.5) return ditherMode(p);
  if (sMode < 7.5) return flutedMode(p);
  return flowMode(p);
}
`

/** Where the field is now (the page's CSS px), for the glass to match */
export const glowNow = {
  mode: 0,
  a: [1, 1, 1],
  b: [1, 1, 1],
  c: [1, 1, 1],
  d: [1, 1, 1],
  e: [1, 1, 1],
  ax: 0,
  ay: 0,
  w: 1,
  h: 1,
  view: 1,
  mx: 0,
  my: 0,
  on: 0,
  t: 0,
}

const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uScale;
${SHADER_GLSL}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  vec3 col = shaderAt(p);
  /* a grain of dither against banding */
  col += (gh(gl_FragCoord.xy + fract(sTime) * 61.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`

const SCALE = 0.5
/* the flow's threads and grain and the fluted glass's rods are fine, so
   those two are drawn at full resolution */
const scaleOf = (mode: Shader) => (mode === 'flow' || mode === 'fluted' ? 1 : SCALE)
const UNIFORMS = ['uRes', 'uScale', 'sMode', 'sA', 'sB', 'sC', 'sD', 'sE', 'sAnchor', 'sSize', 'sView', 'sMouse', 'sTime']

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
const smooth = (t: number) => t * t * (3 - 2 * t)
const mixc = (a: number[], b: number[], f: number) => a.map((v, i) => v + (b[i] - v) * f)

/** a palette's five colours: the two for the flow made up where it has none,
 *  the accent's way to the deep one and a pale of the deep one */
const five = (hex: string[]) => {
  const c = hex.map(rgb)
  return c.length >= 5 ? c : [...c, mixc(c[2], c[0], 0.5), mixc(c[0], [1, 1, 1], 0.55)]
}

export class Glow {
  private canvas = document.createElement('canvas')
  private gl: WebGLRenderingContext
  private prog: WebGLProgram
  private buf: WebGLBuffer
  private u: Record<string, WebGLUniformLocation | null> = {}
  private page: HTMLElement
  private anchor: () => HTMLElement | null
  private calm = reducedMotion()
  private mode: Shader
  private tone: Tone
  /* the colours now, easing toward the palette's */
  private cols = five(['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'])
  private scale = SCALE
  private pointer = { x: 0, y: 0, on: false }
  private m = { x: 0, y: 0, on: 0 }
  private last = performance.now()
  private raf = 0
  private dead = false
  private ro: ResizeObserver

  /** `anchor` is the ask bar: the field is drawn about it */
  constructor(layer: HTMLElement, page: HTMLElement, anchor: () => HTMLElement | null, mode: Shader, tone: Tone) {
    this.page = page
    this.anchor = anchor
    this.mode = mode
    this.tone = tone
    this.scale = scaleOf(mode)
    this.cols = this.palette(performance.now() / 1000)
    this.canvas.className = 'hx__glow'
    this.canvas.setAttribute('aria-hidden', 'true')
    const gl = this.canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false })
    if (!gl) throw new Error('no webgl')
    this.gl = gl
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
    this.prog = prog
    gl.useProgram(prog)
    this.buf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const at = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(at)
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
    for (const n of UNIFORMS) this.u[n] = gl.getUniformLocation(prog, n)

    layer.prepend(this.canvas)
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(page)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.wake)
    this.resize()
    this.wake()
  }

  /** another shader or palette, in place: the colours ease across */
  set(mode: Shader, tone: Tone) {
    this.mode = mode
    this.tone = tone
    if (scaleOf(mode) !== this.scale) {
      this.scale = scaleOf(mode)
      this.resize()
    }
    this.wake()
  }

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.wake)
    const { gl } = this
    gl.deleteBuffer(this.buf)
    gl.deleteProgram(this.prog)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.canvas.remove()
  }

  /** the palette's colours at time `t`: a fixed one, or the rotation */
  private palette(t: number) {
    if (this.tone !== 'rotate') return five(PALETTES[this.tone])
    if (this.calm) return five(PALETTES[ROTATION[0]])
    const u = t / (HOLD + EASE)
    const i = Math.floor(u) % ROTATION.length
    const f = smooth(Math.max(0, (u - Math.floor(u)) * (HOLD + EASE) - HOLD) / EASE)
    const from = five(PALETTES[ROTATION[i]])
    const to = five(PALETTES[ROTATION[(i + 1) % ROTATION.length]])
    return from.map((c, k) => mixc(c, to[k], f))
  }

  private resize() {
    this.canvas.width = Math.max(1, Math.round(this.page.offsetWidth * this.scale))
    this.canvas.height = Math.max(1, Math.round(this.page.offsetHeight * this.scale))
    this.wake()
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = this.page.getBoundingClientRect()
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, on: true }
  }

  private onLeave = () => {
    this.pointer.on = false
  }

  private wake = () => {
    if (!this.raf && !this.dead && !document.hidden) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  private frame = (now: number) => {
    this.raf = 0
    if (this.dead || document.hidden) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const k = 1 - Math.exp(-dt * 1.5)
    if (this.pointer.on && !this.calm) {
      if (this.m.on < 0.01) this.m = { x: this.pointer.x, y: this.pointer.y, on: this.m.on }
      this.m.x += (this.pointer.x - this.m.x) * k
      this.m.y += (this.pointer.y - this.m.y) * k
    }
    this.m.on += ((this.pointer.on && !this.calm ? 1 : 0) - this.m.on) * k

    /* the colours ease toward the palette's (a change of palette eases too) */
    const want = this.palette(now / 1000)
    const kc = this.calm ? 1 : 1 - Math.exp(-dt * 2.2)
    this.cols = this.cols.map((c, i) => c.map((v, j) => v + (want[i][j] - v) * kc))

    /* the field is drawn about the ask bar */
    const pr = this.page.getBoundingClientRect()
    const a = this.anchor()?.getBoundingClientRect()
    const g = glowNow
    g.mode = SHADERS.findIndex((s) => s.id === this.mode)
    /* the dither's pixels shown as pixels, not smoothed */
    this.canvas.style.imageRendering = this.mode === 'dither' ? 'pixelated' : ''
    ;[g.a, g.b, g.c, g.d, g.e] = this.cols
    g.w = this.page.offsetWidth
    g.h = this.page.offsetHeight
    g.view = Math.min(g.h, window.innerHeight)
    g.ax = a ? a.left - pr.left + a.width / 2 : g.w / 2
    g.ay = a ? a.top - pr.top + a.height / 2 : g.h * 0.6
    g.mx = this.m.x
    g.my = this.m.y
    g.on = this.m.on
    g.t = this.calm ? 12 : now / 1000

    const { gl, u } = this
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height)
    gl.uniform1f(u.uScale, this.scale)
    gl.uniform1f(u.sMode, g.mode)
    gl.uniform3fv(u.sA, g.a)
    gl.uniform3fv(u.sB, g.b)
    gl.uniform3fv(u.sC, g.c)
    gl.uniform3fv(u.sD, g.d)
    gl.uniform3fv(u.sE, g.e)
    gl.uniform2f(u.sAnchor, g.ax, g.ay)
    gl.uniform2f(u.sSize, g.w, g.h)
    gl.uniform1f(u.sView, g.view)
    gl.uniform3f(u.sMouse, g.mx, g.my, g.on)
    gl.uniform1f(u.sTime, g.t)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (!this.calm) this.raf = requestAnimationFrame(this.frame)
  }
}
