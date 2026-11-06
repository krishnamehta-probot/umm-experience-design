/* ============================================================================
   HALO LIGHT — the Halo hero's halo, drawn as live light (Krish, 2 Nov)

   The halo from the round-3 still: a soft ring of the five pastels round the
   headline. No object in it; the light itself is what's made unique. Three
   ways to draw it, for choosing by eye (a fourth, "soft", is the still's
   plain CSS blur and needs no shader):

     liquid  the ring flows like liquid light: its edge wells and folds, its
             colours run round it
     corona  a soft glow with a fine iridescent rim on its inner edge, like
             an eclipse, a bright streak running round the rim
     prism   the light split into three rings, sky, blossom and citrus, that
             drift apart and come back together; where they overlap they
             mix, as filters do, into colours of their own

   The hero's ground is white, so the light is worked out as it lands on
   white and drawn opaque. Drawn at a reduced resolution (it is all soft
   light) and scaled up. Sleeps off screen; one still frame for reduced
   motion.
   ========================================================================== */

export type HaloLightMode = 'liquid' | 'corona' | 'prism'

const MODE: Record<HaloLightMode, number> = { liquid: 0, corona: 1, prism: 2 }

/** canvas pixels per CSS pixel: the light is soft, so a lower resolution
 *  costs nothing visible */
const SCALE = 0.6

const VS = /* glsl */ `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FS = /* glsl */ `
precision highp float;
uniform vec2 uSize;    // canvas, device px
uniform float uScale;  // CSS px per canvas px
uniform vec2 uC;       // the halo's centre, CSS px
uniform float uR;      // its radius, CSS px
uniform float uT;
uniform float uMode;
const vec3 SKY = vec3(.82, .906, 1.);
const vec3 BLO = vec3(1., .769, .949);
const vec3 COR = vec3(1., .765, .769);
const vec3 SUN = vec3(1., .898, .561);
const vec3 CIT = vec3(.941, 1., .439);
const float TAU = 6.2831853;
vec3 tone(float i) {
  if (i < .5) return SKY;
  if (i < 1.5) return BLO;
  if (i < 2.5) return COR;
  if (i < 3.5) return SUN;
  return CIT;
}
vec3 ramp(float x) {
  x = fract(x) * 5.;
  float i = floor(x);
  return mix(tone(i), tone(mod(i + 1., 5.)), smoothstep(0., 1., fract(x)));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0., a = .5;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 7.1; a *= .5; }
  return s;
}
/* a ring of radius 1 round o, its edge welling with the noise */
float ring(vec2 d, vec2 o, float w, float wob, float seed) {
  vec2 e = d - o;
  float r = length(e);
  vec2 q = e / max(r, 1e-4);
  float n = fbm(q * 1.4 + vec2(uT * .05 + seed, -uT * .04));
  return exp(-pow((r + (n - .5) * wob - 1.) / w, 2.));
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y) * uScale;
  vec2 d = (px - uC) / uR;
  float r = length(d);
  float a = atan(d.y, d.x);
  float an = a / TAU + .5;
  vec2 q = vec2(cos(a), sin(a));
  /* the hero's ground is white: the light is worked out as it lands on it */
  vec3 F = vec3(1.);

  if (uMode < .5) {
    /* liquid: the band wells and folds, its colours running round it */
    float n = fbm(q * 1.5 + vec2(uT * .06, -uT * .045) + r * .9);
    float m = fbm(q * 3.2 - vec2(uT * .08, uT * .05) + 3.7);
    float rr = r + (n - .5) * .42 + (m - .5) * .14;
    float band = exp(-pow((rr - 1.) / .22, 2.));
    vec3 c = ramp(an + (n - .5) * .7 + uT * .018);
    /* the fold's crest a touch deeper, so the flow has form */
    c = mix(c, c * c, smoothstep(.55, .95, band) * .35);
    F = mix(F, c, band * .9);
  } else if (uMode < 1.5) {
    /* corona: a soft glow, a fine iridescent rim inside it, a streak running round */
    float n = fbm(q * 1.6 + vec2(uT * .05, -uT * .04));
    float glow = exp(-pow((r + (n - .5) * .2 - 1.06) / .3, 2.)) * .62;
    F = mix(F, ramp(an + (n - .5) * .4 + uT * .015), glow);
    float head = fract(uT * .055);
    float behind = fract(head - an);
    float streak = exp(-behind * 7.) + exp(-(1. - behind) * 40.);
    float bloom = exp(-pow((r - .9) / .1, 2.)) * streak * .4;
    F = mix(F, ramp(an + uT * .03), bloom);
    float edge = r - .84 - (n - .5) * .025;
    float rim = exp(-pow(edge / .011, 2.)) * (.4 + .6 * streak);
    vec3 iri = ramp(an * 2. + edge * 14. + uT * .03);
    F = mix(F, iri * iri, rim);
  } else {
    /* prism: three rings drift apart and back, overlapping like filters */
    float k = .5 + .5 * sin(uT * .32);
    float s = .07 + .1 * k;
    vec2 o1 = s * vec2(cos(uT * .17), sin(uT * .17));
    vec2 o2 = s * vec2(cos(uT * .17 + 2.094), sin(uT * .17 + 2.094));
    vec2 o3 = s * vec2(cos(uT * .17 + 4.189), sin(uT * .17 + 4.189));
    float a1 = ring(d, o1, .16, .22, 0.) * .85;
    float a2 = ring(d, o2, .16, .22, 5.) * .85;
    float a3 = ring(d, o3, .16, .22, 11.) * .85;
    /* multiplied over white: each ring tints, the overlaps deepen */
    F = (1. - a1 * (1. - SKY)) * (1. - a2 * (1. - BLO)) * (1. - a3 * (1. - CIT));
  }
  /* a whisper of dither, so the soft gradients never band */
  F += (hash(gl_FragCoord.xy + fract(uT)) - .5) / 255.;
  gl_FragColor = vec4(clamp(F, 0., 1.), 1.);
}
`

export class HaloLight {
  private gl: WebGLRenderingContext
  private u: Record<string, WebGLUniformLocation | null> = {}
  private canvas = document.createElement('canvas')
  private mode = 0
  private c = { x: 0, y: 0, r: 1 }
  private raf = 0
  private t0 = performance.now()
  private visible = true
  private still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private io: IntersectionObserver

  constructor(host: HTMLElement, mode: HaloLightMode) {
    const canvas = this.canvas
    canvas.className = 'hx__canvas'
    canvas.setAttribute('aria-hidden', 'true')
    host.appendChild(canvas)
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
    if (!gl) {
      canvas.remove()
      throw new Error('webgl')
    }
    this.gl = gl
    this.mode = MODE[mode]
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    for (const n of ['uSize', 'uScale', 'uC', 'uR', 'uT', 'uMode']) this.u[n] = gl.getUniformLocation(prog, n)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      this.wake()
    })
    this.io.observe(canvas)
  }

  /** Centre the halo at (x, y) over the host, `radius` out (CSS px). */
  layout(x: number, y: number, radius: number) {
    this.canvas.width = Math.max(1, Math.round(this.canvas.clientWidth * SCALE))
    this.canvas.height = Math.max(1, Math.round(this.canvas.clientHeight * SCALE))
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.c = { x, y, r: radius }
    this.draw()
  }

  setMode(mode: HaloLightMode) {
    this.mode = MODE[mode]
    this.draw()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.io.disconnect()
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.canvas.remove()
  }

  private wake() {
    if (this.still || this.raf || !this.visible) return
    this.raf = requestAnimationFrame(this.frame)
  }

  private frame = () => {
    this.raf = 0
    this.draw()
    if (this.visible) this.raf = requestAnimationFrame(this.frame)
  }

  private draw() {
    const gl = this.gl
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform2f(this.u.uSize, this.canvas.width, this.canvas.height)
    gl.uniform1f(this.u.uScale, 1 / SCALE)
    gl.uniform2f(this.u.uC, this.c.x, this.c.y)
    gl.uniform1f(this.u.uR, this.c.r)
    gl.uniform1f(this.u.uT, this.still ? 8 : (performance.now() - this.t0) / 1000 + 8)
    gl.uniform1f(this.u.uMode, this.mode)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
