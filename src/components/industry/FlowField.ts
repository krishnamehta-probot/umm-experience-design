/* ============================================================================
   FLOW FIELD — the Flow hero's colour (Krish, 2 Nov: "something like that
   Stripe thing, only nicer")

   A field of the palette's colours flowing slowly on a diagonal, like
   Stripe's, but folded: the colours are laid over a soft, warped height
   field, so they pool and run like poured silk, and "silk" lights that
   height field so its folds catch a soft sheen. Its outline is not drawn
   here: the hero clips the canvas to a shape kept clear of the words.

   Drawn at a reduced resolution (it is all soft colour) and scaled up.
   Sleeps off screen; one still frame for reduced motion.
   ========================================================================== */

export type FlowPalette = 'brand' | 'night' | 'cool' | 'warm'

const C = {
  sky: [0.82, 0.906, 1],
  blossom: [1, 0.769, 0.949],
  coral: [1, 0.765, 0.769],
  sun: [1, 0.898, 0.561],
  citrus: [0.941, 1, 0.439],
} as const

/** each palette's stops, in the order the colours flow into one another.
 *  "night" lays its stops over ink (uInk), as light; citrus and sun stay
 *  out of it, since over ink they turn olive */
const PALETTES: Record<FlowPalette, (keyof typeof C)[]> = {
  brand: ['sky', 'blossom', 'coral', 'sun', 'citrus'],
  night: ['sky', 'blossom', 'coral', 'blossom'],
  cool: ['sky', 'blossom', 'sky', 'citrus'],
  warm: ['sun', 'coral', 'blossom', 'citrus'],
}

const SCALE = 0.55

const VS = /* glsl */ `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FS = /* glsl */ `
precision highp float;
uniform vec2 uSize;     // canvas, device px
uniform float uScale;   // CSS px per canvas px
uniform float uH;       // the stage's height, CSS px
uniform float uT;
uniform vec3 uC[6];
uniform float uN;
uniform float uSheen;
uniform float uInk;
vec3 stop(float i) {
  vec3 c = uC[0];
  for (int k = 1; k < 6; k++) if (float(k) == i) c = uC[k];
  return c;
}
vec3 pal(float x) {
  x = fract(x) * uN;
  float i = floor(x);
  return mix(stop(i), stop(mod(i + 1., uN)), smoothstep(0., 1., fract(x)));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0., a = .5;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.02 + 3.7; a *= .5; }
  return s;
}
/* the height the colours lie on: warped twice, flowing on a diagonal */
float field(vec2 p) {
  vec2 q = p + vec2(uT * .045, -uT * .02);
  vec2 w = vec2(fbm(q * .8 + vec2(0., uT * .03)), fbm(q * .8 + vec2(5.2, -uT * .025)));
  return fbm(q * .65 + w * 1.5);
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y) * uScale;
  vec2 p = px / uH * 1.7;
  float h = field(p);
  vec3 col = pal(h * 2. + p.x * .16 - p.y * .1 + uT * .008);
  /* "night": ink, the colours added over it as light where the folds
     crest, so they glow instead of greying */
  float ink = 0.;
  if (uInk > .5) {
    /* the corner behind the logo stays ink, so the white logo always reads */
    float k = smoothstep(.3, .64, h) * smoothstep(140., 360., length(px - vec2(120., 50.)));
    col = vec3(.063, .055, .078) + col * k * 1.05;
    ink = 1. - k;
  }
  if (uSheen > .5) {
    /* the folds lit from the upper left: a sheen on the crests, shade in
       the troughs, so the colour has the body of silk */
    float e = .012;
    float hx = field(p + vec2(e, 0.)) - h;
    float hy = field(p + vec2(0., e)) - h;
    vec3 n = normalize(vec3(-hx / e * .16, -hy / e * .16, 1.));
    vec3 l = normalize(vec3(-.5, .6, .62));
    float spec = pow(max(dot(reflect(-l, n), vec3(0., 0., 1.)), 0.), 20.);
    col *= .84 + .16 * dot(n, l);
    col += vec3(1.) * spec * (.5 - .25 * ink);
  }
  col += (hash(gl_FragCoord.xy + fract(uT)) - .5) / 255.;
  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}
`

export class FlowField {
  private gl: WebGLRenderingContext
  private u: Record<string, WebGLUniformLocation | null> = {}
  private canvas = document.createElement('canvas')
  private raf = 0
  private last = performance.now()
  private t = 6
  private speed = 1
  private visible = true
  private still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private io: IntersectionObserver

  constructor(host: HTMLElement, palette: FlowPalette) {
    const canvas = this.canvas
    canvas.className = 'fh__canvas'
    canvas.setAttribute('aria-hidden', 'true')
    host.appendChild(canvas)
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) {
      canvas.remove()
      throw new Error('webgl')
    }
    this.gl = gl
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
    for (const n of ['uSize', 'uScale', 'uH', 'uT', 'uC', 'uN', 'uSheen', 'uInk']) this.u[n] = gl.getUniformLocation(prog, n)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    this.setPalette(palette)
    this.setSheen(true)

    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      this.wake()
    })
    this.io.observe(canvas)
  }

  resize() {
    this.canvas.width = Math.max(1, Math.round(this.canvas.clientWidth * SCALE))
    this.canvas.height = Math.max(1, Math.round(this.canvas.clientHeight * SCALE))
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.draw()
  }

  setPalette(palette: FlowPalette) {
    const stops = PALETTES[palette]
    const flat = new Float32Array(18)
    stops.forEach((k, i) => flat.set(C[k], i * 3))
    this.gl.uniform3fv(this.u.uC, flat)
    this.gl.uniform1f(this.u.uN, stops.length)
    this.gl.uniform1f(this.u.uInk, palette === 'night' ? 1 : 0)
    this.draw()
  }

  setSheen(on: boolean) {
    this.gl.uniform1f(this.u.uSheen, on ? 1 : 0)
    this.draw()
  }

  /** 1 is the default pace; the field's time runs at this rate */
  setSpeed(speed: number) {
    this.speed = speed
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.io.disconnect()
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.canvas.remove()
  }

  private wake() {
    if (this.still || this.raf || !this.visible) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  private frame = (now: number) => {
    this.raf = 0
    this.t += (Math.min(now - this.last, 100) / 1000) * this.speed
    this.last = now
    this.draw()
    if (this.visible) this.raf = requestAnimationFrame(this.frame)
  }

  private draw() {
    const gl = this.gl
    gl.uniform2f(this.u.uSize, this.canvas.width, this.canvas.height)
    gl.uniform1f(this.u.uScale, 1 / SCALE)
    gl.uniform1f(this.u.uH, Math.max(1, this.canvas.clientHeight))
    gl.uniform1f(this.u.uT, this.t)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
