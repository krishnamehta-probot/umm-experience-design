/* ============================================================================
   WORD FILL — the industry hero's last word, as a solid lit object

   The word is set into a mask, and two blurs of that mask become its height:
   a bevel at the edges and a gentle dome across each stroke. The shader
   lights that shape in one of three fills (Krish liked all three, 2 Nov):

     glass   dark glass, as on the service pages' cube: studio strips slide
             slowly across it and split into rainbow fringes where the bevel
             turns
     foil    ink, like the foil on a bank card rocked in the light: a
             holographic band of the five pastels swings across and back,
             and a glint travels round the letters' bevels (Krish's pick,
             2 Nov: always something moving)
     pastel  the five pastels drifting through it, shaded so the letters
             have form, their edges deepening into their own tone

   The word's texture is drawn once per resize; the fill is computed per
   pixel. Sleeps off screen; a still frame for reduced motion.
   ========================================================================== */

export type Fill = 'glass' | 'foil' | 'pastel'

export const FILLS: { id: Fill; label: string }[] = [
  { id: 'glass', label: 'Glass' },
  { id: 'foil', label: 'Foil' },
  { id: 'pastel', label: 'Pastel' },
]

const VS = /* glsl */ `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FS = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;      // canvas, CSS px
uniform float uDpr;
uniform vec4 uRect;     // the word's box in the canvas, CSS px
uniform vec2 uPx;       // the span the slope is read over, in uv
uniform float uK;       // bevel steepness
uniform float uT;
uniform float uMode;
uniform float uSmall;  // 0 for a big word, 1 for a small one (phones): calmer light
const vec3 SKY = vec3(.82, .906, 1.);
const vec3 BLO = vec3(1., .769, .949);
const vec3 COR = vec3(1., .765, .769);
const vec3 SUN = vec3(1., .898, .561);
const vec3 CIT = vec3(.941, 1., .439);
const vec3 INK = vec3(.063, .055, .078);
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
float height(vec2 uv) {
  vec4 t = texture2D(uTex, uv);
  return t.g * .75 + t.b * .25;
}
float strip(float u, float at, float w) {
  w *= 1. + 1.6 * uSmall;
  return smoothstep(w, 0., abs(fract(u - at) - .5));
}
/* the studio the glass reflects: a dark room, strips of light drifting across */
vec3 room(vec3 r, float x) {
  float u = r.x * .55 + x * .42 - uT * .028;
  vec3 c = vec3(.075, .075, .095) + .06 * (.5 - r.y * .5);
  c += vec3(1.) * strip(u, .0, .022) * 1.6;
  c += SKY * strip(u, .23, .04) * 1.3;
  /* the finer strips only on a big word; a small one keeps two soft lights */
  float fine = 1. - uSmall;
  c += vec3(1.) * strip(u, .41, .012) * 1.2 * fine;
  c += BLO * strip(u, .62, .035) * 1.25 * fine;
  c += CIT * strip(u, .8, .018) * 1.1 * fine;
  c += vec3(1.) * smoothstep(.35, .9, r.y) * .22;
  return c;
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 uv = (px - uRect.xy) / uRect.zw;
  if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) { gl_FragColor = vec4(0.); return; }
  uv.y = 1. - uv.y;
  float mask = texture2D(uTex, uv).r;
  if (mask < .002) { gl_FragColor = vec4(0.); return; }

  float hx = height(uv + vec2(uPx.x, 0.)) - height(uv - vec2(uPx.x, 0.));
  float hy = height(uv + vec2(0., uPx.y)) - height(uv - vec2(0., uPx.y));
  vec3 n = normalize(vec3(-hx * uK, -hy * uK, 1.));
  float rim = pow(1. - n.z, 1.6);
  vec3 col;
  if (uMode < .5) {
    vec3 r = reflect(vec3(0., 0., -1.), n);
    vec2 d = n.xy * .07 * (1. - .75 * uSmall); /* dispersion: each channel bends a little differently */
    col = vec3(room(r + vec3(d, 0.), uv.x).r, room(r, uv.x).g, room(r - vec3(d, 0.), uv.x).b);
    col += vec3(1.) * rim * .35;
    col = col / (1. + col * .35);
  } else if (uMode < 1.5) {
    /* flat, like foil printed on a bank card rocked slowly in the light: no
       bevel (Krish, 2 Nov: no embossed look), only the colour moving. The
       band swings end to end and back, never leaving the word, its colours
       shifting with the tilt */
    float s = asin(.97 * sin(uT * .29)) / 1.3252 * .82 + sin(uT * .123 + 1.3) * .18;
    float d1 = uv.x - (.5 + s * .62) + (uv.y - .5) * .42;
    float k1 = exp(-d1 * d1 / .036);
    /* the band's colours run across it like a holographic streak: sky and
       blossom on its flanks, where it meets the ink, citrus and sun only in
       its bright middle, so no yellow is ever mixed down to olive */
    vec3 band = ramp(.7 + d1 / .19 * .5 + s * .04 + (uv.y - .5) * .08);
    /* a fainter, cooler band drifting the other way, crossing it now and then */
    float d2 = uv.x - (1.45 - fract(uT * .04) * 1.9) - (uv.y - .5) * .3;
    float k2 = exp(-d2 * d2 / .01) * .3;
    vec3 cool = mix(SKY, BLO, uv.y);
    vec3 base = INK + cool * .04;
    /* light adds: blended squared, so the band brightens instead of muddying */
    vec3 c2 = mix(base * base, cool * cool, k2);
    col = sqrt(mix(c2, band * band * .9, min(k1 * .85, .86)));
    col += vec3(1.) * pow(k1, 14.) * .16;
  } else {
    vec2 q = uv * vec2(4., 1.);
    float a = .5 + .5 * sin(q.x * 1.3 + uT * .25 + sin(q.y * 3. + uT * .2));
    float b = .5 + .5 * sin(q.x * .7 - uT * .18 + q.y * 2.);
    vec3 c = ramp(a * .6 + b * .4 + uv.x * .5 + uT * .02);
    vec3 l = normalize(vec3(-.4, .6, .7));
    col = c * (.82 + .3 * dot(n, l));
    col = mix(col, c * c * .9, rim * .9);
    col += vec3(1.) * pow(max(dot(reflect(vec3(0., 0., -1.), n), l), 0.), 24.) * .45;
  }
  gl_FragColor = vec4(clamp(col, 0., 1.) * mask, mask);
}
`

/** three box blurs ≈ a gaussian */
function blur(src: Float32Array, w: number, h: number, radius: number) {
  const r = Math.max(1, Math.round(radius))
  const a = Float32Array.from(src)
  const b = new Float32Array(src.length)
  const at = (v: number, max: number) => Math.min(max, Math.max(0, v))
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      const o = y * w
      let s = 0
      for (let x = -r; x <= r; x++) s += a[o + at(x, w - 1)]
      for (let x = 0; x < w; x++) {
        b[o + x] = s / (2 * r + 1)
        s += a[o + at(x + r + 1, w - 1)] - a[o + at(x - r, w - 1)]
      }
    }
    for (let x = 0; x < w; x++) {
      let s = 0
      for (let y = -r; y <= r; y++) s += b[at(y, h - 1) * w + x]
      for (let y = 0; y < h; y++) {
        a[y * w + x] = s / (2 * r + 1)
        s += b[at(y + r + 1, h - 1) * w + x] - b[at(y - r, h - 1) * w + x]
      }
    }
  }
  return a
}

const MODE: Record<Fill, number> = { glass: 0, foil: 1, pastel: 2 }

export class WordFill {
  private gl: WebGLRenderingContext
  private prog: WebGLProgram
  private u: Record<string, WebGLUniformLocation | null> = {}
  private tex: WebGLTexture
  private rect = { x: 0, y: 0, w: 1, h: 1 }
  private dpr = 1
  private mode = 0
  private raf = 0
  private t0 = performance.now()
  private visible = true
  private still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private io: IntersectionObserver
  private canvas = document.createElement('canvas')

  /** Draws into a canvas of its own, laid over `host`. */
  constructor(host: HTMLElement, fill: Fill) {
    const canvas = this.canvas
    canvas.className = 'ih__canvas'
    canvas.setAttribute('aria-hidden', 'true')
    host.appendChild(canvas)
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
    if (!gl) {
      canvas.remove()
      throw new Error('webgl')
    }
    this.gl = gl
    this.mode = MODE[fill]
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
      return s
    }
    this.prog = gl.createProgram()!
    gl.attachShader(this.prog, sh(gl.VERTEX_SHADER, VS))
    gl.attachShader(this.prog, sh(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(this.prog)
    gl.useProgram(this.prog)
    for (const n of ['uTex', 'uRes', 'uDpr', 'uRect', 'uPx', 'uK', 'uT', 'uMode', 'uSmall'])
      this.u[n] = gl.getUniformLocation(this.prog, n)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(this.prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    this.tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, this.tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      this.wake()
    })
    this.io.observe(canvas)
  }

  /** Set the word into its box: `box` is where it sits over the host (CSS
   *  px), `size` its font size, `pad` the room left either side for the
   *  bevel. The canvas is sized to the host. */
  setWord(
    text: string,
    font: string,
    size: number,
    pad: number,
    box: { x: number; y: number; w: number; h: number },
    /** letter spacing, in em */
    spacing = -0.055,
  ) {
    const gl = this.gl
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    const dpr = this.dpr
    this.canvas.width = Math.round(this.canvas.clientWidth * dpr)
    this.canvas.height = Math.round(this.canvas.clientHeight * dpr)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.rect = box

    const cw = Math.max(1, Math.round(box.w * dpr))
    const ch = Math.max(1, Math.round(box.h * dpr))
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
    ctx.canvas.width = cw
    ctx.canvas.height = ch
    ctx.font = font.replace('{size}', `${size * dpr}px`)
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing * size * dpr}px`
    ctx.fillStyle = '#fff'
    ctx.fillText(text, pad * dpr, size * 0.77 * dpr)
    const img = ctx.getImageData(0, 0, cw, ch).data
    const m = new Float32Array(cw * ch)
    for (let i = 0; i < m.length; i++) m[i] = img[i * 4 + 3] / 255
    /* the bevel never narrower than a few pixels, or a small word (phones)
       turns its rainbow edges to speckle */
    const r1 = Math.max(size * 0.022, 3.4) * dpr
    const b1 = blur(m, cw, ch, r1 / 1.7)
    const b2 = blur(m, cw, ch, (Math.max(size * 0.07, 8) * dpr) / 1.7)
    const out = new Uint8Array(cw * ch * 4)
    for (let i = 0; i < m.length; i++) {
      out[i * 4] = m[i] * 255
      out[i * 4 + 1] = b1[i] * 255
      out[i * 4 + 2] = b2[i] * 255
      out[i * 4 + 3] = 255
    }
    gl.bindTexture(gl.TEXTURE_2D, this.tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cw, ch, 0, gl.RGBA, gl.UNSIGNED_BYTE, out)

    /* a small word gets softer, wider light, or its fine detail turns to speckle */
    const small = Math.min(1, Math.max(0, (180 - size) / 110))
    gl.uniform1f(this.u.uSmall, small)
    /* the slope is read over a wider span on a small word: its bevel is only
       a few levels deep, and reading it texel by texel shows them as bands */
    const step = 1.5 + (r1 * 0.6 - 1.5) * small
    gl.uniform2f(this.u.uPx, step / cw, step / ch)
    gl.uniform1f(this.u.uK, r1 * 1.4 * (1 - 0.7 * small))
    this.draw()
  }

  setFill(fill: Fill) {
    this.mode = MODE[fill]
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
    const r = this.rect
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1i(this.u.uTex, 0)
    gl.uniform2f(this.u.uRes, this.canvas.width / this.dpr, this.canvas.height / this.dpr)
    gl.uniform1f(this.u.uDpr, this.dpr)
    gl.uniform4f(this.u.uRect, r.x, r.y, r.w, r.h)
    gl.uniform1f(this.u.uT, this.still ? 11 : (performance.now() - this.t0) / 1000 + 12)
    gl.uniform1f(this.u.uMode, this.mode)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
