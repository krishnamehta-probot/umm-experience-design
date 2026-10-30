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

   The cursor leans each a little and brings up a touch more light where it
   is. The colours come from a palette (TONES) or, by default, turn through
   them all ('rotate'), easing from one to the next.

   The field is soft, so the canvas is drawn at half the CSS resolution. The
   shader is SHADER_GLSL, which the glass mark (GlassMark.ts) draws too,
   reading the same values from `glowNow`, so the glass bends the same light.
   ========================================================================== */

export type Shader = 'glow' | 'mesh' | 'aurora' | 'silk' | 'halo'

export const SHADERS: { id: Shader; label: string; hint: string }[] = [
  { id: 'glow', label: 'Glow', hint: 'A bloom of colour rising from below the ask bar, its edge slowly drawn about.' },
  { id: 'mesh', label: 'Mesh', hint: 'Three soft blobs of colour drifting and blending around the ask bar.' },
  { id: 'aurora', label: 'Aurora', hint: 'Curtains of light rising from the foot of the screen, swaying slowly.' },
  { id: 'silk', label: 'Silk', hint: 'A satin ribbon of colour flowing across behind the ask bar.' },
  { id: 'halo', label: 'Halo', hint: 'A ring of light around the ask bar, its colours turning slowly round it.' },
]

export type Tone = 'rotate' | 'magenta' | 'violet' | 'ocean' | 'mint' | 'sunset' | 'pastel'

/** each palette: a deep colour, a lighter one, and an accent */
const PALETTES: Record<Exclude<Tone, 'rotate'>, [string, string, string]> = {
  magenta: ['#e23da4', '#f59fd6', '#9b5cff'],
  violet: ['#6b4cff', '#b9a8ff', '#e05bff'],
  ocean: ['#1f6bff', '#8ec9ff', '#14cfc0'],
  mint: ['#10c49a', '#a8f0d4', '#b7e83a'],
  sunset: ['#ff5a36', '#ffb27a', '#ff4fa3'],
  pastel: ['#ffc4f2', '#d1e7ff', '#f0ff70'],
}

export const TONES: { id: Tone; label: string; hint: string }[] = [
  { id: 'rotate', label: 'Rotate', hint: 'Turns slowly through every palette, easing from one into the next.' },
  { id: 'magenta', label: 'Magenta', hint: 'Krish’s reference: magenta into pink, a touch of violet.' },
  { id: 'violet', label: 'Violet', hint: 'Indigo and lilac, a touch of orchid.' },
  { id: 'ocean', label: 'Ocean', hint: 'Electric blue and sky, a touch of teal.' },
  { id: 'mint', label: 'Mint', hint: 'Jade and mint, a touch of lime.' },
  { id: 'sunset', label: 'Sunset', hint: 'Coral and peach, a touch of pink.' },
  { id: 'pastel', label: 'Pastel', hint: 'The brand pastels: pink, sky and lime, soft on the white.' },
]

/** the order 'rotate' turns through */
const ROTATION: Exclude<Tone, 'rotate' | 'pastel'>[] = ['magenta', 'violet', 'ocean', 'mint', 'sunset']
/** how long each palette holds in the rotation, and how long it eases (s) */
const HOLD = 7
const EASE = 3

export const SHADER_GLSL = /* glsl */ `
uniform float sMode;
uniform vec3 sA;
uniform vec3 sB;
uniform vec3 sC;
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

/* three blobs drifting and blending around the bar */
vec3 meshMode(vec2 p) {
  float s = max(sSize.x, sView);
  vec2 q = p / s;
  vec2 qa = sAnchor / s;
  float t = sTime;
  q += (vec2(gfbm(q * 2.0 + t * 0.03), gfbm(q * 2.0 + vec2(3.1, 1.7) - t * 0.025)) - 0.5) * 0.18;
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

/* the field at a point of the page (CSS px, y down), in sRGB */
vec3 shaderAt(vec2 p) {
  if (sMode < 0.5) return glowMode(p);
  if (sMode < 1.5) return meshMode(p);
  if (sMode < 2.5) return auroraMode(p);
  if (sMode < 3.5) return silkMode(p);
  return haloMode(p);
}
`

/** Where the field is now (the page's CSS px), for the glass to match */
export const glowNow = {
  mode: 0,
  a: [1, 1, 1],
  b: [1, 1, 1],
  c: [1, 1, 1],
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
const UNIFORMS = ['uRes', 'uScale', 'sMode', 'sA', 'sB', 'sC', 'sAnchor', 'sSize', 'sView', 'sMouse', 'sTime']

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
const smooth = (t: number) => t * t * (3 - 2 * t)

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
  private cols = [rgb('#ffffff'), rgb('#ffffff'), rgb('#ffffff')]
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
    if (this.tone !== 'rotate') return PALETTES[this.tone].map(rgb)
    if (this.calm) return PALETTES[ROTATION[0]].map(rgb)
    const u = t / (HOLD + EASE)
    const i = Math.floor(u) % ROTATION.length
    const f = smooth(Math.max(0, (u - Math.floor(u)) * (HOLD + EASE) - HOLD) / EASE)
    const from = PALETTES[ROTATION[i]].map(rgb)
    const to = PALETTES[ROTATION[(i + 1) % ROTATION.length]].map(rgb)
    return from.map((c, k) => c.map((v, j) => v + (to[k][j] - v) * f))
  }

  private resize() {
    this.canvas.width = Math.max(1, Math.round(this.page.offsetWidth * SCALE))
    this.canvas.height = Math.max(1, Math.round(this.page.offsetHeight * SCALE))
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
    ;[g.a, g.b, g.c] = this.cols
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
    gl.uniform1f(u.uScale, SCALE)
    gl.uniform1f(u.sMode, g.mode)
    gl.uniform3fv(u.sA, g.a)
    gl.uniform3fv(u.sB, g.b)
    gl.uniform3fv(u.sC, g.c)
    gl.uniform2f(u.sAnchor, g.ax, g.ay)
    gl.uniform2f(u.sSize, g.w, g.h)
    gl.uniform1f(u.sView, g.view)
    gl.uniform3f(u.sMouse, g.mx, g.my, g.on)
    gl.uniform1f(u.sTime, g.t)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (!this.calm) this.raf = requestAnimationFrame(this.frame)
  }
}
