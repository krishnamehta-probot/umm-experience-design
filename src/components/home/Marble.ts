import { MARK_H, MARK_W, markPath, type MarkEngine, type MarkHost } from './mark'

/* ============================================================================
   MARBLE — the entrance of /home-marble: the UMM mark gathered from
   particles, veined like marble, then scattered again

   From Krish's pick of the Lovable heroes (3 Nov, "Kinetic Tiles", the 14th):
   black tiles fly in from every side of the screen and from all over it,
   turning as they come, with a trail, and snap into the UMM mark in the
   middle, a shimmer crossing it as it locks. Colour then runs into it as
   veins through black marble, in the brand's five pastels only (Krish:
   "keep it only like umm colors"). Then the mark lets go the way it came:
   its tiles fly back out to places all over the screen and off its edges,
   fading as they go, while the headline comes in word by word in its place
   and the ask bar and the questions under it (the page's data-formed).
   After that the page is the hero alone (Krish, 3 Nov: the mark kept at the
   foot "is not required"), and the canvas stops.

   About four seconds in all: the flight in a little slower than the first
   cut (Krish: "a little slow only"), the rest quick, so the visitor is not
   left waiting. With reduced motion there is no entrance at all.
   ========================================================================== */

/** tiles in the mark, by the width of the screen */
const COUNT = { desk: 2000, tablet: 1500, phone: 900 }
/** the mark's width, as a share of the screen's (14th: about 40%) */
const WIDE = { desk: 0.4, phone: 0.74 }
/** the entrance (s): all the tiles in by 1.65, the colour running in */
const REVEAL_AT = 1.3
const REVEAL = 0.7
/** the mark lets go, and the copy comes in; each tile's flight out, and
 *  how far apart they leave */
const GONE = 2.9
const OUT = 1.0
const OUT_SPREAD = 0.35
/** the trails fade over these */
const TRAILS: [number, number] = [1.15, 1.55]
/** the shimmer as the mark locks */
const SHIMMER = 1.35
const INK = [0.067, 0.063, 0.078]
const MARK_K = MARK_W / MARK_H

const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec2 aTarget;
in vec2 aStart;
in vec2 aEnd;
in vec4 aRand;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform vec4 uBox;
uniform float uSize;
uniform float uSizeK;
uniform float uAlpha;
uniform float uFlowT;
uniform float uReveal;
uniform vec3 uInk;
out vec4 vCol;
out float vSize;
out float vRound;
out float vAngle;
out float vLit;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }
  return s;
}
/* the brand's five pastels, in a ring: blossom, coral, sun, citrus, sky;
   each held, with only a short blend into the next */
vec3 brand(float t) {
  t = fract(t) * 5.0;
  float i = floor(t);
  float f = smoothstep(0.38, 0.62, fract(t));
  vec3 a = i < 1.0 ? vec3(1.0, 0.769, 0.949) : i < 2.0 ? vec3(1.0, 0.765, 0.769) : i < 3.0 ? vec3(1.0, 0.898, 0.561) : i < 4.0 ? vec3(0.941, 1.0, 0.439) : vec3(0.820, 0.906, 1.0);
  vec3 b = i < 1.0 ? vec3(1.0, 0.765, 0.769) : i < 2.0 ? vec3(1.0, 0.898, 0.561) : i < 3.0 ? vec3(0.941, 1.0, 0.439) : i < 4.0 ? vec3(0.820, 0.906, 1.0) : vec3(1.0, 0.769, 0.949);
  return mix(a, b, f);
}

void main() {
  /* the flight: quick away, easing into its place, on a curve */
  float p = clamp((uTime - aRand.x) / aRand.y, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - p, 4.0);
  vec2 target = uBox.xy + aTarget * uBox.zw;
  vec2 d = target - aStart;
  vec2 ctrl = aStart + d * 0.5 + vec2(-d.y, d.x) * aRand.z * 0.45;
  vec2 pos = mix(mix(aStart, ctrl, e), mix(ctrl, target, e), e);
  float landed = smoothstep(0.6, 1.0, p);

  /* black marble, veined in the brand's pastels: broad bands bent by a
     slow turbulence, each running from one pastel into the next along its
     length, thin bright lines at their hearts */
  vec2 m = aTarget * vec2(${MARK_K.toFixed(3)}, 1.0);
  float turb = fbm(m * 1.4 + vec2(uFlowT * 0.35, -uFlowT * 0.22));
  float wave = 0.5 + 0.5 * sin(m.x * 2.6 + m.y * 3.6 + turb * 7.0 + uFlowT * 0.9);
  float vein = smoothstep(0.4, 0.95, wave);
  float core = pow(wave, 22.0);
  vec3 tint = brand(m.x * 0.28 - m.y * 0.12 + turb * 0.45 + uFlowT * 0.07);
  /* the colour runs in from the u to the last m */
  float rthr = 0.5 * fbm(m * 0.9 + 7.3) + 0.5 * aTarget.x;
  float rev = smoothstep(rthr - 0.1, rthr + 0.1, uReveal * 1.35 - 0.2);
  vec3 col = mix(uInk, tint, vein * rev) + core * rev * 0.3;
  /* the shimmer crossing the mark as it locks */
  col += 0.32 * exp(-pow((aTarget.x - (uTime - ${SHIMMER.toFixed(2)}) * 1.7) * 7.0, 2.0)) * landed;
  col *= 0.94 + 0.12 * aRand.w;

  /* letting go the way it came: each tile flies back out, slowly away and
     gathering speed, on a curve, to a place of its own all over the screen
     or off its edges, turning, shrinking and fading as it goes */
  float g = clamp((uTime - ${GONE.toFixed(2)} - aRand.w * ${OUT_SPREAD.toFixed(2)} - aTarget.x * 0.1) / ${OUT.toFixed(2)}, 0.0, 1.0);
  float go = g * g * g;
  vec2 d2 = aEnd - pos;
  vec2 ctrl2 = pos + d2 * 0.5 - vec2(-d2.y, d2.x) * aRand.z * 0.35;
  pos = mix(mix(pos, ctrl2, go), mix(ctrl2, aEnd, go), go);

  /* turning in flight, square once in place */
  vAngle = aRand.z * 2.6 * (1.0 - e) * (1.0 - e) + go * aRand.z * 3.0;
  vRound = mix(0.5, 0.12, landed);
  vLit = landed * rev * (1.0 - g);
  float tile = uSize * 0.9 * mix(0.6 + 0.25 * aRand.w, 1.0, e) * mix(1.0, 0.55, go) * uSizeK;
  vSize = max(1.0, tile * 1.42 * uDpr);
  gl_PointSize = vSize;
  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  float alpha = uAlpha * smoothstep(0.0, 0.2, uTime) * mix(0.55, 1.0, e) * (1.0 - smoothstep(0.45, 1.0, g));
  vCol = vec4(col, alpha);
}
`

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec4 vCol;
in float vSize;
in float vRound;
in float vAngle;
in float vLit;
out vec4 o;
void main() {
  /* the tile, turned, inside a sprite wide enough for it at any angle */
  vec2 q = gl_PointCoord - 0.5;
  float c = cos(vAngle), s = sin(vAngle);
  q = abs(mat2(c, -s, s, c) * q) * 1.42;
  float d = length(max(q - (0.5 - vRound), 0.0)) - vRound;
  /* a crisp edge, one pixel wide */
  float px = 1.42 / vSize;
  float a = vCol.a * (1.0 - smoothstep(-0.5 * px, 0.5 * px, d));
  /* lit from above, like a polished chip */
  vec3 col = vCol.rgb * (1.0 + vLit * 0.16 * (0.5 - gl_PointCoord.y));
  o = vec4(col * a, a);
}
`

const UNIFORMS = ['uRes', 'uDpr', 'uTime', 'uBox', 'uSize', 'uSizeK', 'uAlpha', 'uFlowT', 'uReveal', 'uInk'] as const

type Box = { x: number; y: number; w: number; h: number }

function shader(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
  return s
}

export class Marble implements MarkEngine {
  private host: MarkHost
  private canvas = document.createElement('canvas')
  private gl: WebGL2RenderingContext
  private prog: WebGLProgram
  private vao: WebGLVertexArrayObject
  private buf: WebGLBuffer
  private u = {} as Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>
  private count = 0
  /** the share of the mark's box the mark fills */
  private fill = 0.63
  private box: Box = { x: 0, y: 0, w: 1, h: 1 }
  private size = 6
  private dpr = 1
  private pw = 1
  private ph = 1
  private formed = false
  private done = false
  private t0 = performance.now()
  private raf = 0
  private dead = false
  private ro: ResizeObserver

  constructor(host: MarkHost) {
    this.host = host
    const gl = this.canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true })
    if (!gl) throw new Error('webgl2')
    this.gl = gl
    const prog = gl.createProgram()!
    gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
    this.prog = prog
    for (const k of UNIFORMS) this.u[k] = gl.getUniformLocation(prog, k)
    this.vao = gl.createVertexArray()!
    this.buf = gl.createBuffer()!

    this.canvas.className = 'hx__marble-gl'
    this.canvas.setAttribute('aria-hidden', 'true')
    host.layer.appendChild(this.canvas)

    this.ro = new ResizeObserver(this.layout)
    this.ro.observe(host.page)
    window.addEventListener('resize', this.layout)
    document.addEventListener('visibilitychange', this.wake)

    /* no entrance with reduced motion: the hero as it ends */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.finish()
      return
    }
    this.layout()
    this.build()
    this.wake()
  }

  focus() {}

  leave() {}

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    window.removeEventListener('resize', this.layout)
    document.removeEventListener('visibilitychange', this.wake)
    this.host.page.removeAttribute('data-formed')
    const gl = this.gl
    gl.deleteBuffer(this.buf)
    gl.deleteVertexArray(this.vao)
    gl.deleteProgram(this.prog)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.canvas.remove()
  }

  /** the copy in, the canvas put away */
  private finish() {
    this.done = true
    this.host.page.setAttribute('data-formed', '')
    this.canvas.style.display = 'none'
  }

  /* --- the tiles ----------------------------------------------------------------- */

  /** places in the mark on a square grid, and a start and an end for each,
   *  from and to anywhere on the screen or just off its edges */
  private build() {
    const RW = 1000
    const RH = Math.round(RW / MARK_K)
    const c = document.createElement('canvas')
    c.width = RW
    c.height = RH
    const x = c.getContext('2d', { willReadFrequently: true })!
    x.scale(RW / MARK_W, RH / MARK_H)
    x.fill(markPath())
    const px = x.getImageData(0, 0, RW, RH).data
    const inside = (i: number, j: number) => px[(j * RW + i) * 4 + 3] > 127
    let area = 0
    for (let i = 3; i < px.length; i += 4) if (px[i] > 127) area++
    this.fill = area / (RW * RH)

    const vw = window.innerWidth
    const want = vw >= 1000 ? COUNT.desk : vw >= 641 ? COUNT.tablet : COUNT.phone
    const sp = Math.sqrt(area / want)
    const pts: number[] = []
    for (let y = sp / 2; y < RH; y += sp) {
      for (let xx = sp / 2; xx < RW; xx += sp) {
        if (inside(Math.floor(xx), Math.floor(y))) pts.push(xx / RW, y / RH)
      }
    }
    this.count = pts.length / 2

    /* half come from (and go to) off the edges, all round, half anywhere on
       the screen; most curve the same way, so they swirl in */
    const W = this.pw
    const H = Math.min(this.ph, window.innerHeight)
    const somewhere = (): [number, number] => {
      if (Math.random() < 0.5) {
        const out = 20 + Math.random() * 220
        const side = Math.floor(Math.random() * 4)
        const along = Math.random()
        return [side === 0 ? -out : side === 1 ? W + out : along * W, side === 2 ? -out : side === 3 ? H + out : along * H]
      }
      return [Math.random() * W, Math.random() * H]
    }
    const data = new Float32Array(this.count * 10)
    for (let i = 0; i < this.count; i++) {
      const tx = pts[i * 2]
      const [sx, sy] = somewhere()
      const [ex, ey] = somewhere()
      const o = i * 10
      data[o] = tx
      data[o + 1] = pts[i * 2 + 1]
      data[o + 2] = sx
      data[o + 3] = sy
      data[o + 4] = ex
      data[o + 5] = ey
      data[o + 6] = 0.05 + Math.random() * 0.3 + tx * 0.12
      data[o + 7] = 0.8 + Math.random() * 0.35
      data[o + 8] = (Math.random() - 0.5) * 1.1 + 0.3
      data[o + 9] = Math.random()
    }

    const gl = this.gl
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    const attr = (name: string, size: number, offset: number) => {
      const loc = gl.getAttribLocation(this.prog, name)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 40, offset)
    }
    attr('aTarget', 2, 0)
    attr('aStart', 2, 8)
    attr('aEnd', 2, 16)
    attr('aRand', 4, 24)
    gl.bindVertexArray(null)
    this.layout()
  }

  /* --- size ---------------------------------------------------------------------- */

  private layout = () => {
    const pr = this.host.page.getBoundingClientRect()
    this.pw = Math.max(1, pr.width)
    this.ph = Math.max(1, pr.height)
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cw = Math.round(this.pw * this.dpr)
    const ch = Math.round(this.ph * this.dpr)
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw
      this.canvas.height = ch
    }
    /* the mark in the middle of the screen, about as wide as the 14th's */
    const vh = Math.min(this.ph, window.innerHeight)
    const share = this.pw < 700 ? WIDE.phone : WIDE.desk
    const w = Math.min(this.pw * share, vh * 0.3 * MARK_K)
    const h = w / MARK_K
    this.box = { x: (this.pw - w) / 2, y: (vh - h) / 2, w, h }
    if (this.count) this.size = Math.sqrt((this.fill * w * h) / this.count)
    this.wake()
  }

  private wake = () => {
    if (!this.raf && !this.dead && !this.done && !document.hidden) this.raf = requestAnimationFrame(this.frame)
  }

  /* --- the frame ----------------------------------------------------------------- */

  private frame = () => {
    this.raf = 0
    if (this.dead || this.done || document.hidden) return
    const t = (performance.now() - this.t0) / 1000

    if (!this.formed && t >= GONE) {
      this.formed = true
      this.host.page.setAttribute('data-formed', '')
    }
    /* the last tile gone: the hero alone */
    if (t > GONE + OUT_SPREAD + 0.1 + OUT + 0.05) {
      this.finish()
      return
    }
    const reveal = Math.min(1, Math.max(0, (t - REVEAL_AT) / REVEAL))

    const gl = this.gl
    const u = this.u
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.useProgram(this.prog)
    gl.bindVertexArray(this.vao)
    gl.uniform2f(u.uRes, this.pw, this.ph)
    gl.uniform1f(u.uDpr, this.dpr)
    gl.uniform4f(u.uBox, this.box.x, this.box.y, this.box.w, this.box.h)
    gl.uniform1f(u.uSize, this.size)
    /* the marble flows slowly the whole time */
    gl.uniform1f(u.uFlowT, t * 0.9)
    gl.uniform1f(u.uReveal, reveal)
    gl.uniform3f(u.uInk, INK[0], INK[1], INK[2])
    /* in flight each tile draws two fading copies of itself a moment
       behind: its trail */
    const trail = 1 - Math.min(1, Math.max(0, (t - TRAILS[0]) / (TRAILS[1] - TRAILS[0])))
    const passes: [number, number, number][] =
      trail > 0
        ? [
            [0.07, 0.14 * trail, 0.7],
            [0.035, 0.32 * trail, 0.85],
            [0, 1, 1],
          ]
        : [[0, 1, 1]]
    for (const [lag, alpha, sizeK] of passes) {
      gl.uniform1f(u.uTime, t - lag)
      gl.uniform1f(u.uAlpha, alpha)
      gl.uniform1f(u.uSizeK, sizeK)
      gl.drawArrays(gl.POINTS, 0, this.count)
    }
    gl.bindVertexArray(null)
    this.raf = requestAnimationFrame(this.frame)
  }
}
