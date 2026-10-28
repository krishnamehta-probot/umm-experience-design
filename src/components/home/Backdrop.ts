import { reducedMotion } from './gl'

/* ============================================================================
   BACKDROP — the paper behind the final homepage's hero (/home-final)

   Krish (28 Oct): "something out of the box in the background of the hero,
   so that it all feels interactive and still minimal". Four ways the paper
   answers the cursor, all ink or light on the ground, all slow:

     emboss   plain paper, until a raking light follows the cursor and shows
              the quarter circles of the mark pressed into it; it fades back
              when the cursor stops
     filings  a sparse grid of tiny quarter circles, all facing one way, that
              turn toward the cursor like iron filings near a magnet
     engrave  the whole sheet in faint banknote lines, the mark's own style,
              swelling and spreading under the cursor as under a loupe
     press    the cursor presses a soft dent into the paper that fades over
              a few seconds; a click stamps a quarter circle

   The canvas is transparent: light is drawn in white and shadow in the
   mark's ink, so it works on the grey ground and the white one. The mark
   keeps a clearing of its own: inside it the paper does nothing, so the
   mark's magnet is the only thing answering the cursor there. Without
   hover (phones) a slow ghost cursor wanders instead.
   ========================================================================== */

export type BackdropMode = 'none' | 'emboss' | 'filings' | 'engrave' | 'press'

export const BACKDROPS: { id: BackdropMode; label: string; hint: string }[] = [
  {
    id: 'emboss',
    label: 'Hidden emboss',
    hint: 'Plain paper. A raking light follows the cursor and shows quarter circles pressed into it, then fades when you stop.',
  },
  {
    id: 'filings',
    label: 'Filings',
    hint: 'Tiny quarter circles, the mark’s own shape, all facing one way, that turn toward the cursor like iron filings.',
  },
  {
    id: 'engrave',
    label: 'Engraved sheet',
    hint: 'The hero in faint banknote lines, the mark’s style, swelling and spreading under the cursor like a loupe.',
  },
  {
    id: 'press',
    label: 'Blind press',
    hint: 'The cursor presses a soft dent into the paper that fades over a few seconds. A click stamps a quarter circle.',
  },
  { id: 'none', label: 'None', hint: 'The plain ground, as before.' },
]

const MODE: Record<BackdropMode, number> = { none: 0, emboss: 1, filings: 2, engrave: 3, press: 4 }

const VERT = /* glsl */ `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`

const COMMON = /* glsl */ `
precision highp float;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float sdBox(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
`

const DRAW = /* glsl */ `
${COMMON}
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform vec2 uMouse;
uniform float uOn;
uniform int uMode;
uniform vec4 uClear;
uniform float uClearR;
uniform sampler2D uTrail;
uniform vec2 uTexel;

/* the mark's ink (DeckStage PASS_INK, light palette) */
const vec3 INK = vec3(0.063, 0.055, 0.08);

/* light in white, shadow in ink, premultiplied */
vec4 shade(float s){ return s > 0.0 ? vec4(vec3(s), s) : vec4(INK * -s, -s); }

/* 0 inside the mark's clearing, 1 from 80px outside it */
float quiet(vec2 p){
  vec2 b = uClear.zw;
  float d = sdBox(p - uClear.xy, b - uClearR) - uClearR;
  return smoothstep(8.0, 80.0, d);
}

/* emboss: quarter-circle tiles, each turned one of four ways, pressed in */
float tile(vec2 p){
  float S = 64.0;
  float pad = 7.0;
  vec2 c = floor(p / S);
  vec2 q = p - c * S;
  float o = floor(hash(c) * 4.0);
  if (o == 1.0 || o == 3.0) q.x = S - q.x;
  if (o >= 2.0) q.y = S - q.y;
  float d = max(length(q - pad) - (S - 2.0 * pad), sdBox(q - S * 0.5, vec2(S * 0.5 - pad)));
  return 1.0 - smoothstep(-6.0, 0.5, d);
}

vec4 emboss(vec2 p){
  vec2 to = uMouse - p;
  float f = exp(-dot(to, to) / (300.0 * 300.0)) * uOn * quiet(p);
  if (f < 0.002) return vec4(0.0);
  float h = tile(p);
  float gx = tile(p + vec2(1.0, 0.0)) - h;
  float gy = tile(p + vec2(0.0, 1.0)) - h;
  vec3 n = normalize(vec3(gx * 3.0, gy * 3.0, 1.0));
  vec3 L = normalize(vec3(to, 120.0));
  float s = dot(n, L) - L.z;
  return shade((s * 0.5 + 0.03) * f);
}

/* filings: tiny quarter circles turning to face the cursor */
vec4 filings(vec2 p){
  float S = 46.0;
  vec2 c = (floor(p / S) + 0.5) * S;
  float k = quiet(c);
  if (k < 0.01) return vec4(0.0);
  vec2 to = uMouse - c;
  float d = length(to);
  float w = uOn * (0.3 + 0.7 * exp(-d * d / (320.0 * 320.0)));
  vec2 dir = mix(vec2(0.7071), to / max(d, 1.0), w);
  dir = length(dir) < 0.001 ? vec2(0.7071) : normalize(dir);
  float near = uOn * exp(-d * d / (220.0 * 220.0));
  float r = 6.0 * (1.0 + 0.4 * near) * k;
  vec2 q = p - c;
  vec2 l = vec2(dot(q, dir), dot(q, vec2(-dir.y, dir.x)));
  l.x += 0.6 * r;
  float dd = max(length(l) - r, (abs(l.y) - l.x) * 0.7071);
  float a = (1.0 - smoothstep(-0.6, 0.6, dd)) * (0.14 + 0.3 * near) * k;
  return vec4(INK * a, a);
}

/* engraved sheet: hairlines that bend slowly, spread and swell under the cursor */
vec4 engrave(vec2 p){
  float P = 9.0;
  vec2 q = p - uMouse;
  float f = uOn * exp(-dot(q, q) / (170.0 * 170.0));
  float lens = 1.0 - 0.32 * f;
  vec2 s = uMouse + q * lens;
  float y = s.y + sin(s.x * 0.0035 + uTime * 0.06) * P * 0.9 + sin(s.x * 0.011 - uTime * 0.04 + s.y * 0.002) * P * 0.25;
  float d = abs(fract(y / P + 0.5) - 0.5) * P / lens;
  float w = 0.45 + 0.9 * f;
  float ink = 1.0 - smoothstep(w - 0.5, w + 0.5, d);
  float a = ink * (0.12 + 0.16 * f) * quiet(p);
  return vec4(INK * a, a);
}

/* blind press: the trail's dents, lit from the top left */
vec4 press(vec2 p){
  vec2 uv = p / uRes;
  float h = texture2D(uTrail, uv).r;
  vec2 e = uTexel * 1.5;
  float hx = texture2D(uTrail, uv + vec2(e.x, 0.0)).r - texture2D(uTrail, uv - vec2(e.x, 0.0)).r;
  float hy = texture2D(uTrail, uv + vec2(0.0, e.y)).r - texture2D(uTrail, uv - vec2(0.0, e.y)).r;
  vec3 n = normalize(vec3(hx * 2.4, hy * 2.4, 1.0));
  vec3 L = normalize(vec3(-0.55, 0.65, 0.55));
  float s = dot(n, L) - L.z;
  return shade((s * 0.6 - h * 0.03) * quiet(p));
}

void main(){
  vec2 p = gl_FragCoord.xy / uDpr;
  if (uMode == 1) gl_FragColor = emboss(p);
  else if (uMode == 2) gl_FragColor = filings(p);
  else if (uMode == 3) gl_FragColor = engrave(p);
  else gl_FragColor = press(p);
}
`

/* the press trail: fade what is there, then press the newest stroke and
   any click into it */
const TRAIL = /* glsl */ `
${COMMON}
uniform sampler2D uPrev;
uniform vec2 uSize;
uniform vec2 uA;
uniform vec2 uB;
uniform float uR;
uniform float uSeg;
uniform float uDecay;
uniform vec4 uStamp;
uniform float uStampOn;

void main(){
  vec2 p = gl_FragCoord.xy;
  float h = max(texture2D(uPrev, p / uSize).r - uDecay, 0.0);
  if (uSeg > 0.0) {
    vec2 pa = p - uA;
    vec2 ba = uB - uA;
    float t = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
    float d = length(pa - ba * t);
    h = max(h, exp(-d * d / (uR * uR)) * 0.85);
  }
  if (uStampOn > 0.0) {
    vec2 q = p - uStamp.xy;
    float o = uStamp.w;
    if (o == 1.0 || o == 3.0) q.x = -q.x;
    if (o >= 2.0) q.y = -q.y;
    float R = uStamp.z;
    q += R * 0.5;
    float d = max(length(q) - R, sdBox(q - R * 0.5, vec2(R * 0.5)));
    h = max(h, 1.0 - smoothstep(-2.0, 0.5, d));
  }
  gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
}
`

/** The press trail lives at half the canvas's CSS size. */
const TRAIL_SCALE = 0.5
/** How fast a dent fades (height per second): about four seconds. */
const FADE = 0.25

type GL = WebGLRenderingContext | WebGL2RenderingContext
type Target = { tex: WebGLTexture; fb: WebGLFramebuffer }

export class Backdrop {
  private gl: GL
  private draw: WebGLProgram
  private trail: WebGLProgram
  private u: Record<string, WebGLUniformLocation | null> = {}
  private t: Record<string, WebGLUniformLocation | null> = {}
  private targets: Target[] = []
  private buf: WebGLBuffer | null = null
  private half = false
  private size = [0, 0]
  private trailSize = [0, 0]
  private dpr = 1
  private raf = 0
  private last = 0
  private time = 0
  private decayOwed = 0
  private calm = reducedMotion()
  private ghost = !window.matchMedia('(hover: hover)').matches

  /* the pointer, in canvas CSS px from the top left */
  private target = { x: -9999, y: -9999 }
  private seen = false
  private movedAt = -1
  private mouse = { x: -9999, y: -9999 }
  private on = 0
  private pressFrom: { x: number; y: number } | null = null
  private stamp: { x: number; y: number; o: number } | null = null

  private mode: BackdropMode
  private ro: ResizeObserver
  private canvas: HTMLCanvasElement
  private stage: () => HTMLElement | null

  constructor(canvas: HTMLCanvasElement, mode: BackdropMode, stage: () => HTMLElement | null) {
    this.canvas = canvas
    this.mode = mode
    this.stage = stage
    const opts = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }
    const gl2 = canvas.getContext('webgl2', opts) as WebGL2RenderingContext | null
    const gl = (gl2 ?? canvas.getContext('webgl', opts)) as GL | null
    if (!gl) throw new Error('no webgl')
    this.gl = gl
    this.half = !!gl2 && !!gl2.getExtension('EXT_color_buffer_float')

    this.draw = this.program(DRAW)
    this.trail = this.program(TRAIL)
    for (const k of ['uRes', 'uDpr', 'uTime', 'uMouse', 'uOn', 'uMode', 'uClear', 'uClearR', 'uTrail', 'uTexel'])
      this.u[k] = gl.getUniformLocation(this.draw, k)
    for (const k of ['uPrev', 'uSize', 'uA', 'uB', 'uR', 'uSeg', 'uDecay', 'uStamp', 'uStampOn'])
      this.t[k] = gl.getUniformLocation(this.trail, k)

    /* one triangle over the whole canvas */
    const buf = gl.createBuffer()
    this.buf = buf
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    for (const p of [this.draw, this.trail]) {
      const at = gl.getAttribLocation(p, 'aPos')
      gl.enableVertexAttribArray(at)
      gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
    }

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.resize()

    window.addEventListener('pointermove', this.onMove, { passive: true })
    window.addEventListener('pointerdown', this.onDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.onVisible)
    this.setMode(mode)
  }

  setMode(m: BackdropMode) {
    this.mode = m
    this.canvas.style.visibility = m === 'none' ? 'hidden' : ''
    this.clearTrail()
    this.pressFrom = null
    this.start()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.ro.disconnect()
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerdown', this.onDown)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisible)
    /* free what was made, but keep the context: a canvas has only the one,
       and the page may mount on it again */
    const gl = this.gl
    this.targets.forEach((x) => {
      gl.deleteTexture(x.tex)
      gl.deleteFramebuffer(x.fb)
    })
    this.targets = []
    gl.deleteProgram(this.draw)
    gl.deleteProgram(this.trail)
    gl.deleteBuffer(this.buf)
  }

  /* --- input --------------------------------------------------------------- */

  private local(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  private onMove = (e: PointerEvent) => {
    const p = this.local(e)
    this.target = p
    if (!this.seen) {
      this.seen = true
      this.mouse = { ...p }
    }
    this.movedAt = this.time
    if (e.pointerType !== 'mouse') this.ghost = false
  }

  private onDown = (e: PointerEvent) => {
    if (this.mode !== 'press') return
    if ((e.target as Element | null)?.closest?.('a, button, input, form, .ha-dock')) return
    const p = this.local(e)
    this.stamp = { ...p, o: Math.floor(Math.random() * 4) }
  }

  private onLeave = () => {
    this.seen = false
    this.pressFrom = null
  }

  private onVisible = () => (document.hidden ? cancelAnimationFrame(this.raf) : this.start())

  /* --- frame --------------------------------------------------------------- */

  private start() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    if (this.mode === 'none' || document.hidden) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame)
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    if (!this.calm) this.time += dt
    const [w, h] = this.size

    /* without hover, a ghost cursor wanders slowly over the paper */
    if (this.ghost && !this.calm) {
      const t = this.time
      this.target = { x: w * (0.5 + 0.36 * Math.sin(t * 0.13)), y: h * (0.55 + 0.3 * Math.sin(t * 0.09 + 1.3)) }
      if (!this.seen) this.mouse = { ...this.target }
      this.seen = true
      this.movedAt = this.time
    }

    /* the light and the magnet follow slowly; the press follows at once */
    const ease = 1 - Math.exp(-dt * 5)
    this.mouse.x += (this.target.x - this.mouse.x) * ease
    this.mouse.y += (this.target.y - this.mouse.y) * ease
    /* emboss: lit while the cursor moves, fading over a few seconds once
       it stops; the others: lit while the cursor is on the page */
    const moving = this.time - this.movedAt < 0.15
    const want = !this.seen ? 0 : this.mode === 'emboss' ? (moving ? (this.ghost ? 0.6 : 1) : 0) : this.ghost ? 0.6 : 1
    this.on += (want - this.on) * (1 - Math.exp(-dt * (want > this.on ? 3 : 0.7)))

    const gl = this.gl
    if (this.mode === 'press') this.pressStep(dt)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(this.draw)
    const u = this.u
    gl.uniform2f(u.uRes, w, h)
    gl.uniform1f(u.uDpr, this.dpr)
    gl.uniform1f(u.uTime, this.time)
    gl.uniform2f(u.uMouse, this.mouse.x, h - this.mouse.y)
    gl.uniform1f(u.uOn, this.on)
    gl.uniform1i(u.uMode, MODE[this.mode])
    const c = this.clearing()
    gl.uniform4f(u.uClear, c.x, h - c.y, c.hw, c.hh)
    gl.uniform1f(u.uClearR, c.r)
    gl.uniform2f(u.uTexel, 1 / this.trailSize[0], 1 / this.trailSize[1])
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.targets[0]?.tex ?? null)
    gl.uniform1i(u.uTrail, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  /** The mark's own box, inside its stage: the mark is fitted to 94% of
   *  the stage at its 1437 × 460 shape (scenes.ts). */
  private clearing() {
    const st = this.stage()
    if (!st) return { x: -9999, y: -9999, hw: 0, hh: 0, r: 0 }
    const a = this.canvas.getBoundingClientRect()
    const b = st.getBoundingClientRect()
    const ratio = 1437.32 / 460
    const mw = Math.min(b.width * 0.94, b.height * 0.94 * ratio)
    const mh = mw / ratio
    return { x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2, hw: mw / 2, hh: mh / 2, r: mh * 0.3 }
  }

  private pressStep(dt: number) {
    const gl = this.gl
    const [tw, th] = this.trailSize
    const k = TRAIL_SCALE
    const h = this.size[1]
    /* 8-bit trails can only fade in whole steps of 1/255 */
    this.decayOwed += FADE * dt
    let decay = this.decayOwed
    if (!this.half) decay = Math.floor(this.decayOwed * 255) / 255
    this.decayOwed -= decay

    const p = this.seen ? { x: this.target.x, y: this.target.y } : null
    const from = this.pressFrom
    const seg = !!p && !!from && Math.hypot(p.x - from.x, p.y - from.y) > 0.5
    this.pressFrom = p

    const [src, dst] = this.targets
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb)
    gl.viewport(0, 0, tw, th)
    gl.useProgram(this.trail)
    const t = this.t
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, src.tex)
    gl.uniform1i(t.uPrev, 0)
    gl.uniform2f(t.uSize, tw, th)
    gl.uniform1f(t.uDecay, decay)
    gl.uniform1f(t.uR, 6)
    gl.uniform1f(t.uSeg, seg ? 1 : 0)
    if (seg && p && from) {
      gl.uniform2f(t.uA, from.x * k, (h - from.y) * k)
      gl.uniform2f(t.uB, p.x * k, (h - p.y) * k)
    }
    const s = this.stamp
    gl.uniform1f(t.uStampOn, s ? 1 : 0)
    if (s) gl.uniform4f(t.uStamp, s.x * k, (h - s.y) * k, 30, s.o)
    this.stamp = null
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    this.targets = [dst, src]
  }

  /* --- set up -------------------------------------------------------------- */

  private resize() {
    const r = this.canvas.getBoundingClientRect()
    const w = Math.max(1, Math.round(r.width))
    const h = Math.max(1, Math.round(r.height))
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.size = [w, h]
    this.canvas.width = Math.round(w * this.dpr)
    this.canvas.height = Math.round(h * this.dpr)
    this.makeTrail(Math.max(1, Math.round(w * TRAIL_SCALE)), Math.max(1, Math.round(h * TRAIL_SCALE)))
  }

  private makeTrail(w: number, h: number) {
    const gl = this.gl
    this.targets.forEach((x) => {
      gl.deleteTexture(x.tex)
      gl.deleteFramebuffer(x.fb)
    })
    this.trailSize = [w, h]
    const make = (): Target => {
      const tex = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, tex)
      if (this.half) {
        const g2 = gl as WebGL2RenderingContext
        g2.texImage2D(g2.TEXTURE_2D, 0, g2.RGBA16F, w, h, 0, g2.RGBA, g2.HALF_FLOAT, null)
      } else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      const fb = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      return { tex, fb }
    }
    this.targets = [make(), make()]
    if (this.half && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      this.half = false
      this.makeTrail(w, h)
      return
    }
    this.clearTrail()
  }

  private clearTrail() {
    const gl = this.gl
    gl.clearColor(0, 0, 0, 1)
    for (const x of this.targets) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, x.fb)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  private program(frag: string) {
    const gl = this.gl
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag))
    gl.bindAttribLocation(p, 0, 'aPos')
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link')
    return p
  }
}
