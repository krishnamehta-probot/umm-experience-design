import * as THREE from 'three'
import { DeckStage, PASS_CURSOR, PASS_INK, PASS_VERT, passUniforms, type Effect } from './DeckStage'
import type { SceneId } from './scenes'

/* ============================================================================
   ASCII ENGINE

   The deck's brightness, two texels per character cell, read cell by cell
   and drawn as the character whose ink matches it, from a glyph atlas
   painted on a 2D canvas. A scene change swaps cells in random order and
   the cells on the moving front scramble through random characters — the
   "decoding" look.

   Three sets are typed from a font; the rest are drawn by hand so they look
   the same on every machine:
     braille  0 to 8 braille dots, the finest set
     quarter  the UMM quarter-circle at four sizes, then the corner piece and
              the full square, each cell turned at random (mode 2)
     wire     not by brightness: the cell's edge direction picks ─ │ ╱ ╲, so
              shapes are drawn in outline like a blueprint (mode 1)
     plus     a Swiss grid of crosses that thicken with light
   ========================================================================== */

export type Charset = 'ascii' | 'braille' | 'quarter' | 'wire' | 'plus' | 'blocks' | 'dots' | 'binary'
export type Palette = 'light' | 'dark' | 'blue'
export type { Effect }
export type AsciiOpts = { charset: Charset; palette: Palette; cell: number; effect: Effect }

export const CHARSETS: { id: Charset; label: string; sample: string; hint: string }[] = [
  { id: 'ascii', label: 'ASCII', sample: '.:+#@', hint: 'Typewriter characters, from a dot to an @ as the light grows.' },
  { id: 'braille', label: 'Braille', sample: '⠁⠃⠇⣇⣿', hint: 'Up to eight braille dots per cell. The finest, most photographic set.' },
  { id: 'quarter', label: 'Quarter', sample: '◜◞◠●', hint: 'The UMM quarter-circle, growing with the light and turned at random.' },
  { id: 'wire', label: 'Wire', sample: '─│╱╲', hint: 'Lines that follow the edges of each shape, like a blueprint.' },
  { id: 'plus', label: 'Plus', sample: '·+✚', hint: 'A Swiss grid of crosses that thicken where it is bright.' },
  { id: 'blocks', label: 'Blocks', sample: '░▒▓█', hint: 'Shaded blocks, like an old terminal.' },
  { id: 'dots', label: 'Dots', sample: '·•●', hint: 'One round dot per cell, sized by the light: a halftone.' },
  { id: 'binary', label: 'Binary', sample: '0101', hint: 'Zeros and ones, brighter where the scene is.' },
]

/** Sets typed from a font, darkest first. */
const TYPED: Partial<Record<Charset, string[]>> = {
  ascii: ' .,:;-~=+*?%S#@'.split(''),
  blocks: ' ·░░▒▒▓▓██'.split(''),
  binary: ' 0101010'.split(''),
}

/** How many glyphs each hand-drawn set has. */
const DRAWN: Partial<Record<Charset, number>> = { braille: 9, quarter: 7, wire: 7, plus: 7, dots: 9 }

const MODE: Partial<Record<Charset, number>> = { wire: 1, quarter: 2 }

const frag = /* glsl */ `
uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uAtlas;
uniform float uCount;
uniform vec2 uCell;
uniform vec2 uRes;
uniform float uMix;
uniform float uBand;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform int uEffect;
uniform int uPalette;
uniform int uMode;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
${PASS_INK}

void main(){
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 grid = ceil(uRes / uCell);
  vec2 uv = (cell + 0.5) / grid;
  vec2 local = fract(gl_FragCoord.xy / uCell);
  ${PASS_CURSOR}

  float h = hash(cell);
  float useB = step(h, uMix);
  float lum = mix(texture2D(uA, suv).r, texture2D(uB, suv).r, useB);
  lum = pow(clamp(lum + shade, 0.0, 1.0), 0.9);

  float idx = floor(lum * (uCount - 0.001));
  if (uMode == 1) {
    /* wire: the edge's direction picks the stroke; flat areas get dots */
    vec2 st = 1.0 / grid;
    float r = mix(texture2D(uA, suv + vec2(st.x, 0.0)).r, texture2D(uB, suv + vec2(st.x, 0.0)).r, useB);
    float l = mix(texture2D(uA, suv - vec2(st.x, 0.0)).r, texture2D(uB, suv - vec2(st.x, 0.0)).r, useB);
    float u = mix(texture2D(uA, suv + vec2(0.0, st.y)).r, texture2D(uB, suv + vec2(0.0, st.y)).r, useB);
    float dn = mix(texture2D(uA, suv - vec2(0.0, st.y)).r, texture2D(uB, suv - vec2(0.0, st.y)).r, useB);
    vec2 gr = vec2(r - l, u - dn);
    if (length(gr) > 0.1) {
      float a = mod(atan(gr.y, gr.x) + 3.14159, 3.14159);
      float bin = floor(mod(a / 0.785398 + 0.5, 4.0));
      /* the stroke runs across the gradient */
      idx = bin == 0.0 ? 4.0 : bin == 1.0 ? 6.0 : bin == 2.0 ? 3.0 : 5.0;
    } else {
      idx = lum > 0.55 ? 2.0 : lum > 0.15 ? 1.0 : 0.0;
    }
  }

  float front = 1.0 - smoothstep(0.0, uBand, abs(h - uMix));
  if (uMix > 0.0 && uMix < 1.0 && front > 0.0) {
    float r = hash(cell + floor(uTime * 8.0));
    if (r < front * 0.55) idx = floor(mix(uCount * 0.2, uCount * 0.7, hash(cell * 1.7 + floor(uTime * 8.0))));
  }
  if (scramble > 0.0 && hash(cell + floor(uTime * 1.5)) < scramble * 0.6)
    idx = floor(hash(cell * 3.1 + floor(uTime * 1.5)) * (uCount - 0.001));

  /* quarter: every cell turned its own way */
  if (uMode == 2) {
    float k = floor(hash(cell + 7.7) * 4.0);
    if (k == 1.0 || k == 3.0) local.x = 1.0 - local.x;
    if (k >= 2.0) local.y = 1.0 - local.y;
  }

  float glyph = texture2D(uAtlas, vec2((idx + local.x) / uCount, local.y)).a;
  float ink = max(mix(glyph, lum * 0.95, reveal), ring * 0.8);
  gl_FragColor = inkOf(ink, lum);
}
`

/** Draws glyph `i` of a hand-drawn set into the cell at (x0, 0). */
function drawGlyph(g: CanvasRenderingContext2D, set: Charset, i: number, x0: number, cw: number, ch: number) {
  const n = DRAWN[set]!
  const cx = x0 + cw / 2
  const cy = ch / 2
  const s = Math.min(cw, ch)
  const dot = (x: number, y: number, r: number) => {
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
  }
  if (set === 'dots') {
    const r = (Math.sqrt(i / (n - 1)) * s) / 2
    if (r > 0.3) dot(cx, cy, r)
  } else if (set === 'braille') {
    /* fill order spreads the dots evenly as the count grows */
    const order = [0, 7, 3, 4, 1, 6, 2, 5]
    for (let k = 0; k < i; k++) {
      const pos = order[k]
      const col = pos % 2
      const row = Math.floor(pos / 2)
      dot(x0 + cw * (col ? 0.68 : 0.32), ch * (0.17 + row * 0.22), Math.max(0.8, cw * 0.11))
    }
  } else if (set === 'quarter') {
    /* the glyph sits in a square at the cell's middle, corner at its top left */
    const q = s * 0.92
    const qx = cx - q / 2
    const qy = cy - q / 2
    const quarter = (r: number) => {
      g.beginPath()
      g.moveTo(qx, qy)
      g.arc(qx, qy, r * q, 0, Math.PI / 2)
      g.closePath()
      g.fill()
    }
    if (i === 1) dot(qx + q * 0.12, qy + q * 0.12, q * 0.09)
    else if (i === 2) quarter(0.42)
    else if (i === 3) quarter(0.68)
    else if (i === 4) quarter(1)
    else if (i === 5) {
      /* the corner piece of the mark: the square less a quarter circle */
      g.beginPath()
      g.rect(qx, qy, q, q)
      g.moveTo(qx, qy)
      g.arc(qx, qy, q * 0.62, 0, Math.PI / 2)
      g.closePath()
      g.fill('evenodd')
    } else if (i === 6) g.fillRect(qx, qy, q, q)
  } else if (set === 'wire') {
    g.lineWidth = Math.max(1, cw * 0.13)
    g.lineCap = 'round'
    const line = (ax: number, ay: number, bx: number, by: number) => {
      g.beginPath()
      g.moveTo(x0 + ax * cw, ay * ch)
      g.lineTo(x0 + bx * cw, by * ch)
      g.stroke()
    }
    if (i === 1) dot(cx, cy, Math.max(0.6, cw * 0.06))
    else if (i === 2) dot(cx, cy, Math.max(0.9, cw * 0.11))
    else if (i === 3) line(0, 0.5, 1, 0.5)
    else if (i === 4) line(0.5, 0, 0.5, 1)
    else if (i === 5) line(0, 1, 1, 0)
    else if (i === 6) line(0, 0, 1, 1)
  } else if (set === 'plus') {
    if (i === 1) dot(cx, cy, Math.max(0.6, s * 0.05))
    else if (i > 1) {
      const arm = s * (0.12 + (i - 2) * 0.08)
      const w = Math.max(1, s * (0.06 + (i - 2) * 0.025))
      g.fillRect(cx - arm, cy - w / 2, arm * 2, w)
      g.fillRect(cx - w / 2, cy - arm, w, arm * 2)
    }
  }
}

export class AsciiScene extends DeckStage {
  opts: AsciiOpts
  private atlas: THREE.CanvasTexture | null = null

  constructor(canvas: HTMLCanvasElement, first: SceneId, opts: AsciiOpts) {
    super(canvas, first)
    this.opts = opts
    this.mount(
      new THREE.ShaderMaterial({
        vertexShader: PASS_VERT,
        fragmentShader: frag,
        transparent: true,
        depthTest: false,
        uniforms: passUniforms({
          uAtlas: { value: null },
          uCount: { value: 10 },
          uCell: { value: new THREE.Vector2(8, 13) },
          uMode: { value: 0 },
        }),
      }),
    )
    document.fonts?.ready.then(() => this.paintAtlas())
    this.setOpts(opts, true)
  }

  setOpts(o: AsciiOpts, force = false) {
    const atlasChanged = force || o.charset !== this.opts.charset || o.cell !== this.opts.cell
    this.opts = o
    this.setEffect(o.effect)
    this.setPalette(o.palette)
    this.pass.uniforms.uMode.value = MODE[o.charset] ?? 0
    if (atlasChanged) {
      this.paintAtlas()
      this.resize()
    }
  }

  private cellPx() {
    const dpr = this.renderer.getPixelRatio()
    return new THREE.Vector2(Math.round(this.opts.cell * 0.62 * dpr), Math.round(this.opts.cell * dpr))
  }

  /** The glyph strip: one cell per brightness step, darkest first. */
  private paintAtlas() {
    const set = this.opts.charset
    const typed = TYPED[set]
    const count = typed ? typed.length : DRAWN[set]!
    const { x: cw, y: ch } = this.cellPx()
    const cv = document.createElement('canvas')
    cv.width = cw * count
    cv.height = ch
    const g = cv.getContext('2d')!
    g.fillStyle = '#fff'
    g.strokeStyle = '#fff'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    for (let i = 0; i < count; i++) {
      if (!typed) {
        drawGlyph(g, set, i, i * cw, cw, ch)
        continue
      }
      const c = typed[i]
      g.globalAlpha = set === 'binary' ? 0.3 + (0.7 * i) / (count - 1) : 1
      g.font = `${set === 'blocks' ? 400 : 500} ${Math.round(ch * 0.82)}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`
      if (set === 'blocks' && c === '█') g.fillRect(i * cw, 0, cw, ch)
      else g.fillText(c, i * cw + cw / 2, ch / 2 + ch * 0.04)
    }
    this.atlas?.dispose()
    this.atlas = new THREE.CanvasTexture(cv)
    this.atlas.minFilter = THREE.LinearFilter
    this.atlas.magFilter = THREE.LinearFilter
    this.atlas.generateMipmaps = false
    this.pass.uniforms.uAtlas.value = this.atlas
    this.pass.uniforms.uCount.value = count
  }

  protected targetSize(): [number, number] {
    const c = this.cellPx()
    const dpr = this.renderer.getPixelRatio()
    return [Math.ceil((this.width * dpr) / c.x) * 2, Math.ceil((this.height * dpr) / c.y) * 2]
  }

  protected onGrid() {
    this.pass.uniforms.uCell.value.copy(this.cellPx())
  }

  dispose() {
    this.atlas?.dispose()
    super.dispose()
  }
}
