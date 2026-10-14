import * as THREE from 'three'
import { DeckStage, PASS_CURSOR, PASS_INK, PASS_VERT, passUniforms, type Effect } from './DeckStage'
import type { SceneId } from './scenes'

/* ============================================================================
   PRINT ENGINE — the deck's scenes as if printed

   Four ways of putting brightness on paper with one colour of ink:
     dither    1-bit ordered (Bayer) dither, the old Mac screen
     halftone  newspaper dots on a 45° screen, sized by brightness
     engrave   banknote line engraving: lines that swell where it is bright
               and bend with the form
     hatch     pen crosshatching, a layer of strokes per tone step
   A scene change is a dither dissolve: each pixel switches when its own
   threshold is passed, with a fizz of noise along the moving front.
   ========================================================================== */

export type PrintStyle = 'dither' | 'halftone' | 'engrave' | 'hatch'
export type PrintOpts = { style: PrintStyle; palette: 'light' | 'dark' | 'blue'; grain: number; effect: Effect }

export const PRINT_STYLES: { id: PrintStyle; label: string }[] = [
  { id: 'dither', label: '1-bit dither' },
  { id: 'halftone', label: 'Halftone' },
  { id: 'engrave', label: 'Engraving' },
  { id: 'hatch', label: 'Crosshatch' },
]

const frag = /* glsl */ `
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uRes;
uniform float uMix;
uniform float uBand;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform int uEffect;
uniform int uPalette;
uniform int uStyle;
uniform float uGrain;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float bayer2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a){ return bayer4(0.5 * a) * 0.25 + bayer2(a); }
${PASS_INK}

float lumAt(vec2 suv, float thr){
  float a = texture2D(uA, suv).r;
  float b = texture2D(uB, suv).r;
  return mix(a, b, step(thr, uMix));
}

void main(){
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes;
  ${PASS_CURSOR}

  float g = uGrain;
  vec2 cellP = floor(px / g);
  float thr = bayer8(cellP);
  float lum;
  float ink = 0.0;

  if (uStyle == 0) {
    /* 1-bit dither on a grid of g-px pixels */
    vec2 cuv = (cellP + 0.5) * g / uRes + (suv - uv);
    lum = lumAt(cuv, thr);
    ink = step(thr, lum * 1.05 - 0.03);
  } else if (uStyle == 1) {
    /* halftone: a 45° screen, cells 4g wide */
    float s = g * 4.0;
    mat2 rot = mat2(0.7071, -0.7071, 0.7071, 0.7071);
    vec2 q = rot * px;
    vec2 c = (floor(q / s) + 0.5) * s;
    vec2 cpx = transpose(rot) * c;
    lum = lumAt(cpx / uRes + (suv - uv), hash(floor(q / s)));
    float r = sqrt(lum) * s * 0.62;
    ink = 1.0 - smoothstep(r - 0.8, r + 0.8, length(q - c));
  } else if (uStyle == 2) {
    /* engraving: lines that swell with brightness and bend with the form */
    lum = lumAt(suv, thr);
    float period = g * 3.2;
    float bend = lum * period * 1.4 + sin(px.x * 0.004 + uTime * 0.08) * period * 0.6;
    float y = (px.y + bend) / period;
    float w = clamp(lum * 0.92, 0.0, 0.92);
    float dist = abs(fract(y) - 0.5) * 2.0;
    ink = 1.0 - smoothstep(w - 0.12, w + 0.02, dist);
    ink *= step(0.04, lum);
  } else {
    /* crosshatch: one layer of strokes per tone step */
    lum = lumAt(suv, thr);
    float p = g * 2.6;
    float l1 = abs(fract((px.x + px.y) / p) - 0.5);
    float l2 = abs(fract((px.x - px.y) / p) - 0.5);
    float l3 = abs(fract(px.y / p) - 0.5);
    float wid = 0.16;
    ink = max(ink, step(0.12, lum) * (1.0 - smoothstep(wid, wid + 0.08, l1)));
    ink = max(ink, step(0.38, lum) * (1.0 - smoothstep(wid, wid + 0.08, l2)));
    ink = max(ink, step(0.66, lum) * (1.0 - smoothstep(wid, wid + 0.08, l3)));
  }

  /* the change's moving front fizzes, only where there is a picture */
  float any = step(0.03, max(texture2D(uA, suv).r, texture2D(uB, suv).r));
  float front = (1.0 - smoothstep(0.0, uBand, abs(thr - uMix))) * any;
  if (uMix > 0.0 && uMix < 1.0) ink = mix(ink, step(0.5, hash(cellP + floor(uTime * 8.0))), front * 0.4);

  gl_FragColor = inkOf(mix(ink, lum, reveal), lum);
}
`

export class PrintScene extends DeckStage {
  opts: PrintOpts

  constructor(canvas: HTMLCanvasElement, first: SceneId, opts: PrintOpts) {
    super(canvas, first)
    this.opts = opts
    this.mount(
      new THREE.ShaderMaterial({
        vertexShader: PASS_VERT,
        fragmentShader: frag,
        transparent: true,
        depthTest: false,
        uniforms: passUniforms({
          uStyle: { value: 0 },
          uGrain: { value: 3 },
        }),
      }),
    )
    this.setOpts(opts)
  }

  setOpts(o: PrintOpts) {
    this.opts = o
    this.setEffect(o.effect)
    this.setPalette(o.palette)
    this.pass.uniforms.uStyle.value = PRINT_STYLES.findIndex((s) => s.id === o.style)
    this.onGrid()
    this.resize()
  }

  /* A smooth image is wanted for every style, so the targets stay at about
     a third of the screen; the style decides its own grain. */
  protected targetSize(): [number, number] {
    const k = 0.34
    return [Math.ceil(this.width * k), Math.ceil(this.height * k)]
  }

  protected onGrid() {
    this.pass.uniforms.uGrain.value = this.opts.grain * this.renderer.getPixelRatio()
  }
}
