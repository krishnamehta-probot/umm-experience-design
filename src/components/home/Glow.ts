import { reducedMotion } from './gl'

/* ============================================================================
   GLOW — the white ground with a magenta glow rising behind the ask bar
   (Krish's reference, 30 Oct), for the flanking-question heroes (HomeFlank)

   A soft field drawn by a shader: white, warming through pink to magenta at
   its heart, which sits below the ask bar so the black bar stands in the
   glow the way the black film card does in his reference. Its edge is drawn
   about by slow noise and it breathes a little; the cursor leans it, and
   brings up a touch more light where it is.

   The glow is soft, so the canvas is drawn at half the CSS resolution. Its
   shape is GLOW_GLSL, which the glass mark (GlassMark.ts) uses too, reading
   where the glow is from `glowNow`, so the glass bends the same glow.
   ========================================================================== */

export const GLOW_GLSL = /* glsl */ `
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
/* the glow at a point of the page (CSS px, y down): gC its heart, gR its
   reach, gM the cursor (z: how present), gT the time (s). sRGB out. */
vec3 glowAt(vec2 p, vec2 gC, vec2 gR, vec3 gM, float gT) {
  vec2 c = gC + (gM.xy - gC) * 0.07 * gM.z;
  vec2 q = (p - c) / gR;
  vec2 w = vec2(gfbm(q * 1.4 + vec2(gT * 0.035, 0.0)), gfbm(q * 1.4 + vec2(5.2, -gT * 0.03))) - 0.5;
  q += w * 0.55;
  float d = length(q) / (1.0 + 0.05 * sin(gT * 0.35));
  float a = exp(-d * d * 2.2);
  vec2 m = (p - gM.xy) / (gR * 0.45);
  a += 0.16 * exp(-dot(m, m)) * gM.z * smoothstep(0.0, 0.4, a + 0.1);
  vec3 col = mix(vec3(1.0), vec3(0.957, 0.62, 0.84), smoothstep(0.04, 0.5, a));
  return mix(col, vec3(0.886, 0.239, 0.643), smoothstep(0.42, 0.95, a));
}
`

/** Where the glow is now, in the page's CSS px, for the glass to match */
export const glowNow = { cx: 0, cy: 0, rx: 1, ry: 1, mx: 0, my: 0, on: 0, t: 0 }

const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uScale;
uniform vec2 uC;
uniform vec2 uR;
uniform vec3 uM;
uniform float uT;
${GLOW_GLSL}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  vec3 col = glowAt(p, uC, uR, uM, uT);
  /* a grain of dither against banding */
  col += (gh(gl_FragCoord.xy + fract(uT) * 61.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`

const SCALE = 0.5

export class Glow {
  private canvas = document.createElement('canvas')
  private gl: WebGLRenderingContext
  private prog: WebGLProgram
  private buf: WebGLBuffer
  private u: Record<string, WebGLUniformLocation | null> = {}
  private page: HTMLElement
  private anchor: () => HTMLElement | null
  private calm = reducedMotion()
  private pointer = { x: 0, y: 0, on: false }
  private m = { x: 0, y: 0, on: 0 }
  private last = performance.now()
  private raf = 0
  private dead = false
  private ro: ResizeObserver

  /** `anchor` is the ask bar: the glow's heart sits below it */
  constructor(layer: HTMLElement, page: HTMLElement, anchor: () => HTMLElement | null) {
    this.page = page
    this.anchor = anchor
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
    for (const n of ['uRes', 'uScale', 'uC', 'uR', 'uM', 'uT']) this.u[n] = gl.getUniformLocation(prog, n)

    layer.prepend(this.canvas)
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(page)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.wake)
    this.resize()
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

  private resize() {
    const w = this.page.offsetWidth
    const h = this.page.offsetHeight
    this.canvas.width = Math.max(1, Math.round(w * SCALE))
    this.canvas.height = Math.max(1, Math.round(h * SCALE))
    this.place()
    this.wake()
  }

  /** the heart below the ask bar, the reach most of the page */
  private place() {
    const w = this.page.offsetWidth
    const h = this.page.offsetHeight
    const pr = this.page.getBoundingClientRect()
    const a = this.anchor()?.getBoundingClientRect()
    const ax = a ? a.left - pr.left + a.width / 2 : w / 2
    const ay = a ? a.top - pr.top + a.height / 2 : h * 0.6
    const vh = Math.min(h, window.innerHeight)
    glowNow.cx = ax
    glowNow.cy = ay + vh * 0.26
    glowNow.rx = Math.max(w * 0.46, 320)
    glowNow.ry = Math.max(vh * 0.5, 300)
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
      if (!this.m.on) this.m = { x: this.pointer.x, y: this.pointer.y, on: this.m.on }
      this.m.x += (this.pointer.x - this.m.x) * k
      this.m.y += (this.pointer.y - this.m.y) * k
    }
    this.m.on += ((this.pointer.on && !this.calm ? 1 : 0) - this.m.on) * k
    this.place()
    glowNow.mx = this.m.x
    glowNow.my = this.m.y
    glowNow.on = this.m.on
    glowNow.t = this.calm ? 12 : now / 1000

    const { gl, u } = this
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height)
    gl.uniform1f(u.uScale, SCALE)
    gl.uniform2f(u.uC, glowNow.cx, glowNow.cy)
    gl.uniform2f(u.uR, glowNow.rx, glowNow.ry)
    gl.uniform3f(u.uM, glowNow.mx, glowNow.my, glowNow.on)
    gl.uniform1f(u.uT, glowNow.t)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (!this.calm) this.raf = requestAnimationFrame(this.frame)
  }
}
