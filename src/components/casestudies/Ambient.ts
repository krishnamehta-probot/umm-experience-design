/* ============================================================================
   AMBIENT — the light behind the case-study page (/casestudies)

   A white ground lit by the case in the middle: its render's three colours,
   lifted toward pastel, and eased from one case to the next as the page
   scrolls between them. Two kinds (Krish asked for "amazing visuals in
   background", 5 Nov):

     glow    soft blooms of the case's colours drifting behind the big card,
             their edges drawn about by noise, as if the film's light spilled
             onto the page
     field   fine lines running from the left column to the right, pinched
             together through the big card, light travelling along them
             left to right: the connection the page is about

   Drawn about the big card (setCard), which moves on resize only.
   ========================================================================== */

export type AmbientMode = 'glow' | 'field'

const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = /* glsl */ `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes;
uniform float uScale;
uniform float uTime;
uniform float uMode;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform vec4 uCard;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}

const vec3 PAPER = vec3(0.984, 0.984, 0.988);

vec3 glow(vec2 q, float t) {
  vec2 w = vec2(fbm(q * 1.1 + t * 0.045), fbm(q * 1.1 - t * 0.04 + 7.3)) - 0.5;
  vec2 r = q + w * 0.7;
  vec2 b1 = vec2(-0.62 + 0.16 * sin(t * 0.19), -0.32 + 0.12 * cos(t * 0.15));
  vec2 b2 = vec2(0.66 + 0.13 * cos(t * 0.17), 0.3 + 0.14 * sin(t * 0.21));
  vec2 b3 = vec2(0.08 * sin(t * 0.12), 0.62 + 0.1 * cos(t * 0.1));
  vec3 col = PAPER;
  col = mix(col, uA, 0.78 * exp(-dot(r - b1, r - b1) * 1.5));
  col = mix(col, uB, 0.72 * exp(-dot(r - b2, r - b2) * 1.5));
  col = mix(col, uC, 0.6 * exp(-dot(r - b3, r - b3) * 2.0));
  float keep = smoothstep(2.7, 0.9, length(q * vec2(0.78, 1.0)));
  return mix(PAPER, col, keep);
}

vec3 field(vec2 q, float t) {
  float ax = abs(q.x);
  /* the lines fan out over the columns and draw together through the card */
  float pinch = mix(0.5, 1.7, smoothstep(0.55, 2.3, ax));
  float v = q.y / pinch + 0.16 * (fbm(vec2(q.x * 0.55 - t * 0.05, q.y * 0.7)) - 0.5);
  float k = v * 10.0;
  float d = abs(fract(k + 0.5) - 0.5);
  float fw = max(fwidth(k), 1e-4);
  float line = 1.0 - smoothstep(fw * 0.35, fw * 1.25, d);
  float lane = floor(k + 0.5);
  /* light travelling along each line, left to right */
  float run = fract(q.x * 0.32 - t * 0.09 + hash(vec2(lane, 3.0)));
  float pulse = smoothstep(0.0, 0.9, run) * smoothstep(1.0, 0.94, run);
  vec3 lc = mix(uA, uB, smoothstep(-1.6, 1.6, q.x));
  lc = mix(lc, uC, 0.35 * (0.5 + 0.5 * sin(lane * 1.7)));
  float fade = smoothstep(1.25, 0.2, abs(v) / 3.2) * smoothstep(3.2, 1.2, ax);
  vec3 col = mix(PAPER, mix(uA, PAPER, 0.35), 0.4 * exp(-dot(q, q) * 1.1));
  col = mix(col, lc * 0.92, line * fade * (0.16 + 0.7 * pulse));
  return col;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  vec2 q = (p - uCard.xy) / max(uCard.z, uCard.w) * 2.0;
  vec3 col = uMode < 0.5 ? glow(q, uTime) : field(q, uTime);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`

const UNIFORMS = ['uRes', 'uScale', 'uTime', 'uMode', 'uA', 'uB', 'uC', 'uCard']

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)

/** a render's colour made fit for a white page: lifted to a light, clear tone */
export function lift(hex: string) {
  const [r, g, b] = rgb(hex)
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const l = (mx + mn) / 2
  const d = mx - mn
  let h = 0
  if (d > 0) {
    if (mx === r) h = ((g - b) / d + 6) % 6
    else if (mx === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h /= 6
  }
  const s0 = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  /* greys stay grey, a little cool; colours keep their hue, made light */
  const s = s0 < 0.12 ? 0.06 : Math.min(0.92, 0.55 + s0 * 0.4)
  const L = s0 < 0.12 ? 0.8 : Math.min(0.8, Math.max(0.64, l + 0.18))
  const hue = s0 < 0.12 ? 0.66 : h
  const c = (1 - Math.abs(2 * L - 1)) * s
  const x = c * (1 - Math.abs(((hue * 6) % 2) - 1))
  const m = L - c / 2
  const seg = Math.floor(hue * 6) % 6
  const [R, G, B] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][seg]
  return [R + m, G + m, B + m]
}

export class Ambient {
  private canvas = document.createElement('canvas')
  private gl: WebGLRenderingContext
  private prog: WebGLProgram
  private buf: WebGLBuffer
  private u: Record<string, WebGLUniformLocation | null> = {}
  private mode: AmbientMode
  private scale = 0.5
  private card = [0, 0, 1, 1]
  private cols = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ]
  private calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private t0 = performance.now()
  private raf = 0
  private host: HTMLElement
  private ro: ResizeObserver

  constructor(host: HTMLElement, mode: AmbientMode) {
    this.host = host
    this.mode = mode
    this.canvas.className = 'cs-ambient'
    this.canvas.setAttribute('aria-hidden', 'true')
    const gl = this.canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) throw new Error('no webgl')
    this.gl = gl
    gl.getExtension('OES_standard_derivatives')
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
    host.prepend(this.canvas)
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.setMode(mode)
    this.raf = requestAnimationFrame(this.frame)
  }

  setMode(mode: AmbientMode) {
    this.mode = mode
    /* the blooms are soft, drawn at half size; the lines are fine */
    this.scale = mode === 'field' ? Math.min(1.5, window.devicePixelRatio || 1) : 0.5
    this.resize()
  }

  /** the big card's centre and size, in CSS px */
  setCard(cx: number, cy: number, w: number, h: number) {
    this.card = [cx, cy, w, h]
  }

  /** the three colours now (already eased between cases by the page) */
  setColors(a: number[], b: number[], c: number[]) {
    this.cols = [a, b, c]
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    const { gl } = this
    gl.deleteBuffer(this.buf)
    gl.deleteProgram(this.prog)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.canvas.remove()
  }

  private resize() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    this.canvas.width = Math.max(1, Math.round(w * this.scale))
    this.canvas.height = Math.max(1, Math.round(h * this.scale))
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame)
    if (document.hidden) return
    const { gl, u } = this
    const t = this.calm ? 8 : (now - this.t0) / 1000
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height)
    gl.uniform1f(u.uScale, this.scale)
    gl.uniform1f(u.uTime, t)
    gl.uniform1f(u.uMode, this.mode === 'field' ? 1 : 0)
    gl.uniform3fv(u.uA, this.cols[0])
    gl.uniform3fv(u.uB, this.cols[1])
    gl.uniform3fv(u.uC, this.cols[2])
    gl.uniform4f(u.uCard, this.card[0], this.card[1], this.card[2], this.card[3])
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}
