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
   ========================================================================== */

export type Charset = 'ascii' | 'blocks' | 'dots' | 'binary'
export type Palette = 'light' | 'dark' | 'blue'
export type { Effect }
export type AsciiOpts = { charset: Charset; palette: Palette; cell: number; effect: Effect }

const SETS: Record<Charset, string[]> = {
  ascii: ' .,:;-~=+*?%S#@'.split(''),
  blocks: ' ·░░▒▒▓▓██'.split(''),
  dots: Array.from({ length: 9 }, (_, i) => String(i)),
  binary: ' 0101010'.split(''),
}

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

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
${PASS_INK}

void main(){
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 grid = ceil(uRes / uCell);
  vec2 uv = (cell + 0.5) / grid;
  vec2 local = fract(gl_FragCoord.xy / uCell);
  ${PASS_CURSOR}

  float h = hash(cell);
  float lum = mix(texture2D(uA, suv).r, texture2D(uB, suv).r, step(h, uMix));
  lum = pow(clamp(lum, 0.0, 1.0), 0.9);

  float idx = floor(lum * (uCount - 0.001));
  float front = 1.0 - smoothstep(0.0, uBand, abs(h - uMix));
  if (uMix > 0.0 && uMix < 1.0 && front > 0.0) {
    float r = hash(cell + floor(uTime * 8.0));
    if (r < front * 0.55) idx = floor(mix(uCount * 0.2, uCount * 0.7, hash(cell * 1.7 + floor(uTime * 8.0))));
  }

  float glyph = texture2D(uAtlas, vec2((idx + local.x) / uCount, local.y)).a;
  gl_FragColor = inkOf(mix(glyph, lum * 0.95, reveal), lum);
}
`

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
    const set = SETS[this.opts.charset]
    const { x: cw, y: ch } = this.cellPx()
    const cv = document.createElement('canvas')
    cv.width = cw * set.length
    cv.height = ch
    const g = cv.getContext('2d')!
    g.fillStyle = '#fff'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    set.forEach((c, i) => {
      const x = i * cw + cw / 2
      const y = ch / 2
      if (this.opts.charset === 'dots') {
        const r = (Math.sqrt(i / (set.length - 1)) * Math.min(cw, ch)) / 2
        if (r > 0.3) {
          g.beginPath()
          g.arc(x, y, r, 0, Math.PI * 2)
          g.fill()
        }
        return
      }
      g.globalAlpha = this.opts.charset === 'binary' ? 0.3 + (0.7 * i) / (set.length - 1) : 1
      g.font = `${this.opts.charset === 'blocks' ? 400 : 500} ${Math.round(ch * 0.82)}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`
      if (this.opts.charset === 'blocks' && c === '█') g.fillRect(i * cw, 0, cw, ch)
      else g.fillText(c, x, y + ch * 0.04)
    })
    this.atlas?.dispose()
    this.atlas = new THREE.CanvasTexture(cv)
    this.atlas.minFilter = THREE.LinearFilter
    this.atlas.magFilter = THREE.LinearFilter
    this.atlas.generateMipmaps = false
    this.pass.uniforms.uAtlas.value = this.atlas
    this.pass.uniforms.uCount.value = set.length
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
