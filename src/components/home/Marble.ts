import { CASES, CASE_ASPECT, LIGHT, caseImage, caseLogo, caseUrl } from './cases'
import { MARK_H, MARK_W, markPath, type Focus, type MarkEngine, type MarkHost } from './mark'
import { ReelPlayer, clamp01, easeInOut, holdRunway, makeReel, releaseRunway, runwayAt } from './reel'

/* ============================================================================
   MARBLE — the UMM mark gathered from particles, the work marbled through it
   (/home-marble)

   From Krish's pick of the Lovable heroes (3 Nov, "Kinetic Tiles", the 14th),
   asked to be made "too good": tens of thousands of particles come in from
   every side of the screen and from all over it, quickly, curving in, and
   build the UMM mark in the middle. The colour runs into the mark like ink
   on marbling water: the case studies' renders, one after the other, each
   combed into the next along a moving vein. While that happens the mark
   glides down to the foot of the hero and the headline, the ask bar and the
   six questions rise in above it (the page's data-formed).

   The marble keeps moving, slowly. The cursor parts the particles, resting
   on the mark or on a question stirs it, and a click opens the case study
   showing, named by its client's logo in the notch under the u. Scrolling
   blows the particles apart and grows the mark's place into the film, which
   plays from its start once it fills the screen (reel.ts); asking does too.
   ========================================================================== */

/** particles in the mark, by the width of the screen */
const COUNT = { desk: 11000, tablet: 8000, phone: 4200 }
/** the entrance (s): the flight (all in by 1.25), the colour running in
 *  while the mark holds the middle, then the glide down */
const REVEAL_AT = 0.85
const REVEAL = 0.8
const SETTLE_AT = 1.45
const SETTLE = 0.8
/** the copy comes in, once the mark is on its way down */
const FORMED = 1.75
/** the flight's trails fade over these (s) */
const TRAILS: [number, number] = [0.95, 1.3]
/** each case study held, then marbled into the next (s) */
const HOLD = 3.2
const MIX = 1.6
/** how far the hero holds while the film grows, in screen heights */
const RUNWAY = 1.2
/** the room under the mark for the case's tag where the notch is too small */
const UNDER = 52
/** the notch under the u's first quarter, as a share of the mark's width */
const NOTCH = 0.155
const INK = [0.067, 0.063, 0.078]
/** the case it opens on: Biocon's blues read best as the first */
const FIRST = 1
/** the mark's proportions */
const MARK_K = MARK_W / MARK_H

const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec2 aTarget;
in vec2 aStart;
in vec4 aRand;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform vec4 uFrom;
uniform vec4 uTo;
uniform float uSize;
uniform float uSizeK;
uniform float uAlpha;
uniform vec3 uPointer;
uniform float uFormed;
uniform float uScatter;
uniform float uFlowT;
uniform float uFlow;
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

void main() {
  /* the flight in, on a curve, quick away and easing in to its place */
  float p = clamp((uTime - aRand.x) / aRand.y, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - p, 4.0);
  /* the mark glides from the middle to the foot, its letters one by one */
  float s = clamp((uTime - ${SETTLE_AT.toFixed(2)} - aTarget.x * 0.18) / ${SETTLE.toFixed(2)}, 0.0, 1.0);
  s = s < 0.5 ? 4.0 * s * s * s : 1.0 - pow(-2.0 * s + 2.0, 3.0) / 2.0;
  vec4 box = mix(uFrom, uTo, s);
  vec2 target = box.xy + aTarget * box.zw;
  vec2 d = target - aStart;
  vec2 ctrl = aStart + d * 0.5 + vec2(-d.y, d.x) * aRand.z * 0.45;
  vec2 pos = mix(mix(aStart, ctrl, e), mix(ctrl, target, e), e);

  /* the case studies, the render covering the mark's box, flowing slowly
     like marbling ink; the next one combed in along a moving vein */
  vec2 q = vec2(aTarget.x, 0.5 + (aTarget.y - 0.5) * uImgK);
  q += uFlow * vec2(
    sin(q.y * 9.0 + uFlowT * 0.5 + sin(q.x * 6.0 - uFlowT * 0.33) * 1.6),
    cos(q.x * 7.0 - uFlowT * 0.42 + cos(q.y * 5.0 + uFlowT * 0.27) * 1.6));
  float thr = fbm(aTarget * vec2(4.6, 1.6) + uSeed);
  float local = smoothstep(thr - 0.07, thr + 0.07, uMix * 1.5 - 0.25);
  float vein = 1.0 - abs(local * 2.0 - 1.0);
  float ang = thr * 14.0 + uFlowT * 0.6;
  vec2 swirl = vec2(cos(ang), sin(ang));
  q += vein * 0.05 * swirl;
  vec3 col = mix(textureLod(uA, q, 1.0).rgb, textureLod(uB, q, 1.0).rgb, local);
  /* as dark marble: the renders are mostly pages on white, so their light
     goes to deep stone and their colours glow through it like veins; the
     mark stays as bold as the black tiles it was built from */
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(lum), col, 1.35);
  col = mix(uInk, clamp(col, 0.0, 1.0), 0.34 + 0.66 * pow(1.0 - lum, 0.85) + 0.25 * (lum - lum * lum));
  col += vein * 0.18;
  /* ink until the colour runs in, in veins, from the u to the last m */
  float rthr = 0.55 * fbm(aTarget * vec2(3.2, 1.2) + 7.3) + 0.45 * aTarget.x;
  float rev = smoothstep(rthr - 0.08, rthr + 0.08, uReveal * 1.3 - 0.15);
  float rvein = 1.0 - abs(rev * 2.0 - 1.0);
  col = mix(uInk, col + rvein * 0.22, rev);
  col *= 0.92 + 0.16 * aRand.w;
  /* polished: a faint sheen crossing the mark now and then */
  float sweep = fract(uFlowT * 0.1) * 4.0 - 1.0;
  col += rev * 0.1 * exp(-pow((aTarget.x + aTarget.y * 0.35 - sweep) * 6.0, 2.0));

  /* stirred along the vein; parted by the cursor */
  pos += (vein + rvein) * 6.0 * swirl * uFormed;
  vec2 dp = pos - uPointer.xy;
  float f = exp(-dot(dp, dp) / (110.0 * 110.0)) * uPointer.z * uFormed;
  pos += normalize(dp + 0.001) * f * 18.0;

  /* scrolled or asked: blown apart from the mark's middle */
  vec2 c = uTo.xy + uTo.zw * 0.5;
  vec2 away = normalize(pos - c + (aRand.zw - 0.5) * 60.0);
  pos += away * uScatter * uScatter * (260.0 + 900.0 * aRand.w);

  float alpha = uAlpha * smoothstep(0.0, 0.25, uTime) * (1.0 - smoothstep(0.25, 0.85, uScatter));
  /* round in flight, a square tile once in its place, the paper showing
     between them; lit from above once the colour is in */
  float landed = smoothstep(0.55, 1.0, e);
  vRound = mix(0.5, 0.14, landed);
  vLit = landed * rev;
  float size = uSize * (box.z / uTo.z) * (0.93 + 0.04 * aRand.w) * mix(0.6, 1.0, e) * uSizeK;
  vSize = max(1.0, size * uDpr);
  gl_PointSize = vSize;
  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vCol = vec4(col, alpha);
}
`

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec4 vCol;
in float vSize;
in float vRound;
in float vLit;
out vec4 o;
void main() {
  vec2 q = abs(gl_PointCoord - 0.5);
  float d = length(max(q - (0.5 - vRound), 0.0)) - vRound;
  float aa = 1.2 / vSize;
  float a = vCol.a * (1.0 - smoothstep(-aa, 0.0, d));
  /* each tile lit from above, like a polished chip */
  vec3 c = vCol.rgb * (1.0 + vLit * 0.14 * (0.5 - gl_PointCoord.y));
  o = vec4(c * a, a);
}
`

const UNIFORMS = [
  'uRes', 'uDpr', 'uTime', 'uFrom', 'uTo', 'uSize', 'uSizeK', 'uAlpha', 'uPointer', 'uFormed', 'uScatter',
  'uFlowT', 'uFlow', 'uReveal', 'uMix', 'uSeed', 'uImgK', 'uInk', 'uA', 'uB',
] as const

type Box = { x: number; y: number; w: number; h: number }

const ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg>'

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
  private ready: boolean[] = []
  private hit = document.createElement('a')
  private caption = document.createElement('a')
  private captionAt = -1
  private captionTimer = 0
  private grow = document.createElement('div')
  private video = makeReel()
  private reel = new ReelPlayer(this.video)
  private calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private from: Box = { x: 0, y: 0, w: 1, h: 1 }
  private to: Box = { x: 0, y: 0, w: 1, h: 1 }
  private size = 3
  private dpr = 1
  private pw = 1
  private ph = 1
  private client = { x: 0, y: 0, on: false }
  private pointer = { x: -9999, y: -9999, on: 0 }
  private stir = 0
  private side = false
  private over = false
  /* the case showing, the next, and where the marbling between them is */
  private at = FIRST
  private next = (FIRST + 1) % CASES.length
  private revealFrom = -1
  private heldFrom = -1
  private mixFrom = -1
  private seed = 0
  private flowT = 0
  private formed = false
  private leaveAt = -1
  private grown = false
  private t0 = performance.now()
  private last = performance.now()
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

    /* the mark opens the case showing; its tag, in the notch under the u,
       names it and is the way in for the keyboard */
    this.hit.className = 'hx__marble-hit'
    this.hit.tabIndex = -1
    this.hit.setAttribute('aria-hidden', 'true')
    this.hit.addEventListener('pointerenter', this.onOver)
    this.hit.addEventListener('pointerleave', this.onOut)
    this.caption.className = 'hx__marble-cap'
    this.caption.innerHTML = `<span class="hx__marble-tag"><img alt="" decoding="async"></span><span class="hx__marble-go">View case study ${ARROW}</span>`
    host.stage.append(this.hit, this.caption)
    this.setCaption(FIRST)

    /* the mark's place, grown to the film, over the page */
    this.grow.className = 'hx__ring-grow'
    this.grow.setAttribute('aria-hidden', 'true')
    this.grow.append(this.video)
    host.layer.appendChild(this.grow)

    this.layout()
    this.build()
    this.load()
    if (this.calm) this.t0 -= 30000

    this.ro = new ResizeObserver(this.layout)
    this.ro.observe(host.page)
    this.ro.observe(host.stage)
    window.addEventListener('resize', this.layout)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.onVisible)
    this.wake()
  }

  focus(q: Focus | null) {
    this.side = !!q
  }

  leave() {
    this.leaveAt = performance.now()
  }

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    window.clearTimeout(this.captionTimer)
    this.ro.disconnect()
    window.removeEventListener('resize', this.layout)
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisible)
    this.reel.dispose()
    releaseRunway(this.host.run, this.host.page)
    this.host.page.removeAttribute('data-formed')
    const gl = this.gl
    for (const t of this.tex) gl.deleteTexture(t)
    gl.deleteBuffer(this.buf)
    gl.deleteVertexArray(this.vao)
    gl.deleteProgram(this.prog)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.canvas.remove()
    this.hit.remove()
    this.caption.remove()
    this.grow.remove()
  }

  /* --- the particles ----------------------------------------------------------- */

  /** places in the mark on a square grid, tile by tile, and a start for each
   *  from anywhere on the screen or just off its edges */
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
    const inside = (i: number, j: number) => i >= 0 && j >= 0 && i < RW && j < RH && px[(j * RW + i) * 4 + 3] > 127
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

    /* where each comes from: half from off the edges, all round; half from
       anywhere on the screen. Most curve the same way, so they swirl in */
    const W = this.pw
    const H = Math.min(this.ph, window.innerHeight)
    const data = new Float32Array(this.count * 8)
    for (let i = 0; i < this.count; i++) {
      const tx = pts[i * 2]
      const ty = pts[i * 2 + 1]
      let sx: number
      let sy: number
      if (Math.random() < 0.5) {
        const out = 30 + Math.random() * 240
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
      data[o + 1] = ty
      data[o + 2] = sx
      data[o + 3] = sy
      data[o + 4] = 0.02 + Math.random() * 0.2 + tx * 0.08
      data[o + 5] = 0.65 + Math.random() * 0.3
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

  /** the twelve renders, as textures as they arrive */
  private load() {
    const gl = this.gl
    CASES.forEach(([slug], i) => {
      const t = gl.createTexture()!
      this.tex[i] = t
      this.ready[i] = false
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([17, 16, 20, 255]))
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (this.dead) return
        gl.bindTexture(gl.TEXTURE_2D, t)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
        this.ready[i] = true
      }
      img.src = caseImage(slug)
    })
  }

  /* --- size ---------------------------------------------------------------------- */

  private layout = () => {
    const { page, stage, run } = this.host
    holdRunway(run, page, this.calm ? 0 : RUNWAY)
    const pr = page.getBoundingClientRect()
    const sr = stage.getBoundingClientRect()
    this.pw = Math.max(1, pr.width)
    this.ph = Math.max(1, pr.height)
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cw = Math.round(this.pw * this.dpr)
    const ch = Math.round(this.ph * this.dpr)
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw
      this.canvas.height = ch
    }

    /* its place: the stage, the mark as large as fits; where the notch
       under the u is too small for the case's tag, with room under it */
    const fit = (tall: number) => Math.min((sr.width * 0.96) / MARK_W, (tall * 0.94) / MARK_H)
    let room = sr.height
    let s = fit(room)
    const narrow = MARK_W * s * NOTCH < 150
    if (narrow) {
      room = Math.max(40, sr.height - UNDER)
      s = fit(room)
    }
    const w = MARK_W * s
    const h = MARK_H * s
    const sx = (sr.width - w) / 2
    const sy = (room - h) / 2
    this.to = { x: sr.left - pr.left + sx, y: sr.top - pr.top + sy, w, h }

    /* the middle of the screen, larger, where it gathers first */
    const vh = Math.min(this.ph, window.innerHeight)
    const fw = narrow ? Math.max(w, this.pw * 0.86) : Math.max(w, Math.min(this.pw * 0.8, vh * 0.5 * MARK_K))
    this.from = { x: (this.pw - fw) / 2, y: vh / 2 - fw / MARK_K / 2, w: fw, h: fw / MARK_K }

    /* each particle's spacing at its place, its dot about as wide */
    if (this.count) this.size = Math.sqrt((this.fill * w * h) / this.count)

    const hs = this.hit.style
    hs.left = `${sx.toFixed(1)}px`
    hs.top = `${sy.toFixed(1)}px`
    hs.width = `${w.toFixed(1)}px`
    hs.height = `${h.toFixed(1)}px`
    const cs = this.caption.style
    if (narrow) {
      this.caption.dataset.under = ''
      cs.left = '50%'
      cs.top = `${(sy + h + 12).toFixed(1)}px`
      cs.width = ''
    } else {
      /* the notch under the u's first quarter: the mark's lower left */
      delete this.caption.dataset.under
      cs.left = `${sx.toFixed(1)}px`
      cs.top = `${(sy + h * 0.56).toFixed(1)}px`
      cs.width = `${(w * NOTCH).toFixed(1)}px`
    }
    this.wake()
  }

  /* --- input --------------------------------------------------------------------- */

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    this.client = { x: e.clientX, y: e.clientY, on: true }
  }

  private onLeave = () => {
    this.client.on = false
  }

  private onOver = () => {
    this.over = true
  }

  private onOut = () => {
    this.over = false
  }

  private onVisible = () => {
    this.reel.visible(!document.hidden)
    this.wake()
  }

  private wake = () => {
    if (!this.raf && !this.dead && !document.hidden) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  /** the case showing: its link, and its client's logo on the tag */
  private setCaption(at: number) {
    if (at === this.captionAt) return
    const first = this.captionAt < 0
    this.captionAt = at
    const [slug, title] = CASES[at]
    const put = () => {
      const a = this.caption
      a.href = this.hit.href = caseUrl(slug)
      a.setAttribute('aria-label', `View case study: ${title}`)
      this.hit.title = title
      const tag = a.querySelector<HTMLElement>('.hx__marble-tag')!
      if (LIGHT.has(slug)) tag.dataset.dark = ''
      else delete tag.dataset.dark
      tag.querySelector('img')!.src = caseLogo(slug)
      a.removeAttribute('data-out')
    }
    window.clearTimeout(this.captionTimer)
    if (first) return put()
    this.caption.setAttribute('data-out', '')
    this.captionTimer = window.setTimeout(put, 280)
  }

  /* --- the frame ----------------------------------------------------------------- */

  private frame = () => {
    this.raf = 0
    if (this.dead || document.hidden) return
    const now = performance.now()
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const t = (now - this.t0) / 1000
    const { run, page } = this.host
    const pr = page.getBoundingClientRect()

    if (!this.formed && t >= FORMED) {
      this.formed = true
      page.setAttribute('data-formed', '')
    }

    let p = runwayAt(run, page)
    if (this.leaveAt >= 0) p = Math.max(p, easeInOut(clamp01((now - this.leaveAt) / 1300)))
    const k = easeInOut(clamp01(p / 0.9))

    /* the colour runs in once the first render is here, then each case is
       held and marbled into the next (not while the film grows) */
    if (this.revealFrom < 0 && this.ready[this.at] && t >= REVEAL_AT) this.revealFrom = this.calm ? t - REVEAL : t
    const reveal = this.revealFrom < 0 ? 0 : clamp01((t - this.revealFrom) / REVEAL)
    if (reveal >= 1 && this.heldFrom < 0) this.heldFrom = t
    const hold = this.calm ? HOLD * 2 : HOLD
    if (this.mixFrom < 0 && this.heldFrom >= 0 && t - this.heldFrom >= hold && this.ready[this.next] && p < 0.002) {
      this.mixFrom = t
      this.seed = Math.random() * 40
    }
    let mix = this.mixFrom < 0 ? 0 : clamp01((t - this.mixFrom) / MIX)
    if (mix >= 0.45) this.setCaption(this.next)
    if (mix >= 1) {
      this.at = this.next
      this.next = (this.next + 1) % CASES.length
      this.mixFrom = -1
      this.heldFrom = t
      mix = 0
    }

    /* the marble's own slow flow, stirred by a question or the cursor on it */
    const stirTo = this.side ? 1 : this.over ? 0.6 : 0
    this.stir += (stirTo - this.stir) * (1 - Math.exp(-dt * 2.5))
    if (!this.calm) this.flowT += dt * (1 + this.stir * 1.4)
    const flow = this.calm ? 0 : 0.01 + this.stir * 0.02

    /* the cursor, eased, in the page's own pixels */
    const ease = 1 - Math.exp(-dt * 10)
    if (this.client.on) {
      const cx = this.client.x - pr.left
      const cy = this.client.y - pr.top
      if (this.pointer.x < -9000) {
        this.pointer.x = cx
        this.pointer.y = cy
      }
      this.pointer.x += (cx - this.pointer.x) * ease
      this.pointer.y += (cy - this.pointer.y) * ease
    }
    this.pointer.on += ((this.client.on && !this.calm ? 1 : 0) - this.pointer.on) * ease
    const settled = clamp01((t - SETTLE_AT - SETTLE - 0.18) / 0.4)

    /* --- draw --- */
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
    gl.bindTexture(gl.TEXTURE_2D, this.tex[this.at])
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.tex[this.next])
    gl.uniform1i(u.uA, 0)
    gl.uniform1i(u.uB, 1)
    gl.uniform2f(u.uRes, this.pw, this.ph)
    gl.uniform1f(u.uDpr, this.dpr)
    gl.uniform4f(u.uFrom, this.from.x, this.from.y, this.from.w, this.from.h)
    gl.uniform4f(u.uTo, this.to.x, this.to.y, this.to.w, this.to.h)
    gl.uniform1f(u.uSize, this.size)
    gl.uniform3f(u.uPointer, this.pointer.x, this.pointer.y, this.pointer.on)
    gl.uniform1f(u.uFormed, settled)
    gl.uniform1f(u.uScatter, k)
    gl.uniform1f(u.uFlowT, this.flowT)
    gl.uniform1f(u.uFlow, flow)
    gl.uniform1f(u.uReveal, reveal)
    gl.uniform1f(u.uMix, mix * mix * (3 - 2 * mix))
    gl.uniform1f(u.uSeed, this.seed)
    gl.uniform1f(u.uImgK, CASE_ASPECT / MARK_K)
    gl.uniform3f(u.uInk, INK[0], INK[1], INK[2])
    /* in flight each particle draws two fading copies of itself a moment
       behind: its trail */
    const trail = this.calm ? 0 : 1 - clamp01((t - TRAILS[0]) / (TRAILS[1] - TRAILS[0]))
    const passes: [number, number, number][] =
      trail > 0
        ? [
            [0.08, 0.16 * trail, 0.62],
            [0.04, 0.38 * trail, 0.8],
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

    /* the mark's place grows to the screen, the film in it */
    page.style.setProperty('--fade', (1 - clamp01(p * 2.4)).toFixed(3))
    const g = this.grow.style
    if (p > 0.002) {
      if (!this.grown) {
        this.grown = true
        page.setAttribute('data-growing', '')
      }
      const vw = document.documentElement.clientWidth
      const vh = window.innerHeight
      const b = this.to
      g.display = 'block'
      g.left = `${(b.x + (-pr.left - b.x) * k).toFixed(1)}px`
      g.top = `${(b.y + (-pr.top - b.y) * k).toFixed(1)}px`
      g.width = `${(b.w + (vw - b.w) * k).toFixed(1)}px`
      g.height = `${(b.h + (vh - b.h) * k).toFixed(1)}px`
      g.borderRadius = `${(24 * (1 - k)).toFixed(1)}px`
      g.opacity = clamp01(k * 2.2).toFixed(3)
      this.caption.style.opacity = (1 - clamp01(p * 3)).toFixed(3)
    } else if (this.grown) {
      this.grown = false
      page.removeAttribute('data-growing')
      g.display = 'none'
      this.caption.style.opacity = ''
    }

    if (!this.calm) this.reel.update(p)
    this.raf = requestAnimationFrame(this.frame)
  }
}
