import { CASES, CASE_ASPECT, caseImage } from './cases'
import { MARK_H, MARK_W, markPath, type MarkEngine, type MarkHost } from './mark'

/* ============================================================================
   MARBLE — the entrance of /home-marble: the UMM mark gathered from
   particles, the work marbled through it, then gone

   From Krish's pick of the Lovable heroes (3 Nov, "Kinetic Tiles", the 14th):
   black tiles fly in from every side of the screen and from all over it,
   turning as they come, with a trail, and snap into the UMM mark in the
   middle, a shimmer crossing it as it locks. Colour then runs into it as
   veins through black marble, the case studies' own colours (their renders),
   combed quickly from one case into the next. Then, as in the 14th, the mark
   lets go: its tiles drift up and fade while the headline rises in its place
   and the ask bar and the questions come in under it (the page's
   data-formed). After that the page is the hero alone (Krish, 3 Nov: the
   mark kept at the foot "is not required"), and the canvas stops.

   About three seconds in all, quick on purpose ("so we are not leaving
   time" for the visitor to drift off). With reduced motion there is no
   entrance at all.
   ========================================================================== */

/** tiles in the mark, by the width of the screen */
const COUNT = { desk: 2000, tablet: 1500, phone: 900 }
/** the mark's width, as a share of the screen's (14th: about 40%) */
const WIDE = { desk: 0.4, phone: 0.74 }
/** the entrance (s) */
const REVEAL_AT = 0.95
const REVEAL = 0.5
/** the next case combed in at each of these, over MIX */
const MIXES = [1.45, 1.9]
const MIX = 0.42
/** the mark lets go, and the copy comes in */
const GONE = 2.3
const FADE = 0.6
/** the trails fade over these */
const TRAILS: [number, number] = [0.85, 1.15]
/** the shimmer as the mark locks */
const SHIMMER = 1.0
/** the three cases it runs through, most colourful first */
const SHOWN = ['biocon-group', 'mohawk-recover', 'iadeptive'].map((s) => CASES.findIndex(([slug]) => slug === s))
const INK = [0.067, 0.063, 0.078]
const MARK_K = MARK_W / MARK_H

const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec2 aTarget;
in vec2 aStart;
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
uniform float uMix;
uniform float uSeed;
uniform float uImgK;
uniform vec3 uInk;
uniform sampler2D uA;
uniform sampler2D uB;
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
vec3 boost(vec3 c) {
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  return clamp(mix(vec3(l), c, 1.5), 0.0, 1.0);
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

  /* black marble, veined with the case's colours: broad bands bent by a
     slow turbulence, thin bright lines at their hearts */
  vec2 m = aTarget * vec2(${MARK_K.toFixed(3)}, 1.0);
  float turb = fbm(m * 1.4 + vec2(uFlowT * 0.35, -uFlowT * 0.22));
  float wave = 0.5 + 0.5 * sin(m.x * 2.6 + m.y * 3.6 + turb * 7.0 + uFlowT * 0.9);
  float vein = smoothstep(0.42, 0.95, wave);
  float core = pow(wave, 22.0);
  vec2 q = vec2(aTarget.x, 0.5 + (aTarget.y - 0.5) * uImgK) + (turb - 0.5) * 0.08;
  /* the next case combed in along a ragged front */
  float thr = fbm(m * 1.1 + uSeed);
  float local = smoothstep(thr - 0.08, thr + 0.08, uMix * 1.5 - 0.25);
  vec3 cas = mix(boost(textureLod(uA, q, 1.5).rgb), boost(textureLod(uB, q, 1.5).rgb), local);
  /* the colour runs in from the u to the last m */
  float rthr = 0.5 * fbm(m * 0.9 + 7.3) + 0.5 * aTarget.x;
  float rev = smoothstep(rthr - 0.1, rthr + 0.1, uReveal * 1.35 - 0.2);
  vec3 col = mix(uInk, cas, vein * rev) + core * rev * 0.42;
  /* the shimmer crossing the mark as it locks */
  col += 0.32 * exp(-pow((aTarget.x - (uTime - ${SHIMMER.toFixed(2)}) * 1.7) * 7.0, 2.0)) * landed;
  col *= 0.94 + 0.12 * aRand.w;

  /* letting go: each tile, from the u to the last m, drifts up, turns,
     shrinks and fades as the headline rises */
  float g = clamp((uTime - ${GONE.toFixed(2)} - aTarget.x * 0.22 - aRand.w * 0.1) / ${FADE.toFixed(2)}, 0.0, 1.0);
  g = g * g * (3.0 - 2.0 * g);
  pos += vec2((aRand.z - 0.3) * 40.0, -(30.0 + 70.0 * aRand.w)) * g;

  /* turning in flight, square once in place */
  vAngle = aRand.z * 2.6 * (1.0 - e) * (1.0 - e) + g * (aRand.w - 0.5) * 2.0;
  vRound = mix(0.5, 0.12, landed);
  vLit = landed * rev;
  float tile = uSize * 0.9 * mix(0.6 + 0.25 * aRand.w, 1.0, e) * (1.0 - 0.6 * g) * uSizeK;
  vSize = max(1.0, tile * 1.42 * uDpr);
  gl_PointSize = vSize;
  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  float alpha = uAlpha * smoothstep(0.0, 0.2, uTime) * mix(0.55, 1.0, e) * (1.0 - g);
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

const UNIFORMS = [
  'uRes', 'uDpr', 'uTime', 'uBox', 'uSize', 'uSizeK', 'uAlpha', 'uFlowT', 'uReveal', 'uMix', 'uSeed', 'uImgK',
  'uInk', 'uA', 'uB',
] as const

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
  private tex: WebGLTexture[] = []
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
    this.load()
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
    for (const t of this.tex) gl.deleteTexture(t)
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

  /** places in the mark on a square grid, and a start for each from anywhere
   *  on the screen or just off its edges */
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

    /* half come from off the edges, all round, half from anywhere on the
       screen; most curve the same way, so they swirl in */
    const W = this.pw
    const H = Math.min(this.ph, window.innerHeight)
    const data = new Float32Array(this.count * 8)
    for (let i = 0; i < this.count; i++) {
      const tx = pts[i * 2]
      let sx: number
      let sy: number
      if (Math.random() < 0.5) {
        const out = 20 + Math.random() * 200
        const side = Math.floor(Math.random() * 4)
        const along = Math.random()
        sx = side === 0 ? -out : side === 1 ? W + out : along * W
        sy = side === 2 ? -out : side === 3 ? H + out : along * H
      } else {
        sx = Math.random() * W
        sy = Math.random() * H
      }
      const o = i * 8
      data[o] = tx
      data[o + 1] = pts[i * 2 + 1]
      data[o + 2] = sx
      data[o + 3] = sy
      data[o + 4] = 0.04 + Math.random() * 0.22 + tx * 0.1
      data[o + 5] = 0.6 + Math.random() * 0.28
      data[o + 6] = (Math.random() - 0.5) * 1.1 + 0.3
      data[o + 7] = Math.random()
    }

    const gl = this.gl
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    const attr = (name: string, size: number, offset: number) => {
      const loc = gl.getAttribLocation(this.prog, name)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 32, offset)
    }
    attr('aTarget', 2, 0)
    attr('aStart', 2, 8)
    attr('aRand', 4, 16)
    gl.bindVertexArray(null)
    this.layout()
  }

  /** the three renders; until one arrives its veins run in the brand's
   *  pastels */
  private load() {
    const gl = this.gl
    const PASTEL = [255, 196, 242, 255, 209, 231, 255, 255, 240, 255, 112, 255, 255, 229, 143, 255]
    SHOWN.forEach((at, i) => {
      const t = gl.createTexture()!
      this.tex[i] = t
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(PASTEL))
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (this.dead) return
        gl.bindTexture(gl.TEXTURE_2D, t)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      }
      img.src = caseImage(CASES[at][0])
    })
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
    if (t > GONE + 0.22 + 0.1 + FADE + 0.1) {
      this.finish()
      return
    }

    /* which two cases, and how far the comb from one to the next */
    let a = 0
    let mix = 0
    MIXES.forEach((at, i) => {
      if (t >= at) {
        a = i
        mix = Math.min(1, (t - at) / MIX)
      }
    })
    const b = Math.min(a + 1, this.tex.length - 1)
    const reveal = Math.min(1, Math.max(0, (t - REVEAL_AT) / REVEAL))
    /* the marble flows, faster while a case is being combed in */
    const flowT = t * 0.9 + MIXES.reduce((s, at) => s + Math.min(MIX, Math.max(0, t - at)) * 1.6, 0)

    const gl = this.gl
    const u = this.u
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.useProgram(this.prog)
    gl.bindVertexArray(this.vao)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.tex[a])
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.tex[b])
    gl.uniform1i(u.uA, 0)
    gl.uniform1i(u.uB, 1)
    gl.uniform2f(u.uRes, this.pw, this.ph)
    gl.uniform1f(u.uDpr, this.dpr)
    gl.uniform4f(u.uBox, this.box.x, this.box.y, this.box.w, this.box.h)
    gl.uniform1f(u.uSize, this.size)
    gl.uniform1f(u.uFlowT, flowT)
    gl.uniform1f(u.uReveal, reveal)
    gl.uniform1f(u.uMix, mix * mix * (3 - 2 * mix))
    gl.uniform1f(u.uSeed, a * 13.7 + 3.1)
    gl.uniform1f(u.uImgK, CASE_ASPECT / MARK_K)
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
