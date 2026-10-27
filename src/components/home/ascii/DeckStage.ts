import * as THREE from 'three'
import { Stage } from '../gl'
import { BUILD, type Built, type SceneId } from './scenes'

/* ============================================================================
   DECK STAGE — the scene deck the ASCII and print versions share

   Owns the brightness scenes (scenes.ts) and two small render targets. Each
   frame it renders the current scene into A and, during a change, the next
   scene into B. A subclass supplies the full-screen pass that turns those
   two brightness images into the final look (characters, dither, hatching)
   and says how big the targets should be.

   Every pass receives the same uniforms: uA, uB, uMix (the change, -band to
   1 + band), uBand, uTime, uRes (device px), uMouse (0..1) and uMouseOn.
   ========================================================================== */

export type Effect = 'ripple' | 'magnify' | 'reveal' | 'scramble' | 'repel' | 'magnet'

export const EFFECTS: { id: Effect; label: string; hint: string }[] = [
  { id: 'ripple', label: 'Ripple', hint: 'Slow rings spread out from the cursor, like a drop in water.' },
  { id: 'magnify', label: 'Lens', hint: 'A round lens under the cursor shows the scene up close.' },
  { id: 'reveal', label: 'Spotlight', hint: 'A soft circle under the cursor shows the picture behind the ink.' },
  { id: 'scramble', label: 'Scramble', hint: 'The ink under the cursor decodes and re-codes itself.' },
  { id: 'repel', label: 'Repel', hint: 'A soft round dimple: the ink makes way for the cursor and closes again behind it.' },
  { id: 'magnet', label: 'Magnetic', hint: 'The ink is drawn toward the cursor and its lines gather round it, following with a little spring.' },
]

/** How fast the scenes move, and how far they follow the cursor. */
const PACE = 0.5
const LEAN = 0.55

export const PASS_VERT = /* glsl */ `
void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }
`

/** What the cursor does, shared by every pass. Sets `suv` (where to read
 *  the scene), `shade` (added to its brightness), `reveal` (show the plain
 *  picture), `scramble` (randomise the ink), `ring` (a hairline circle
 *  that outlines the lens and the spotlight), `pull` (device px a pass
 *  with lines, the engraving, shifts them by, toward the cursor) and
 *  `inkOnly` (1 when the shade may only add to the picture, never to the
 *  bare paper around it). Needs uv, uMouse, uMouseOn,
 *  uRes, uTime and uEffect. */
export const PASS_CURSOR = /* glsl */ `
  float aspect = uRes.x / uRes.y;
  vec2 dv = (uv - uMouse) * vec2(aspect, 1.0);
  float d = length(dv);
  float pd = length((gl_FragCoord.xy / uRes - uMouse) * vec2(aspect, 1.0));
  vec2 suv = uv;
  float shade = 0.0;
  float reveal = 0.0;
  float scramble = 0.0;
  float ring = 0.0;
  float pull = 0.0;
  float inkOnly = 0.0;
  /* the repel and the magnet are sized off the frame's longer side, so a
     wide, short stage gets the same hand as a full screen */
  float big = max(uRes.x, uRes.y);
  vec2 dp = (uv - uMouse) * uRes / big;
  if (uEffect == 0) {
    float w = sin(d * 28.0 - uTime * 0.7);
    float fall = exp(-d * 7.0) * smoothstep(0.0, 0.04, d) * uMouseOn;
    suv += normalize(dv + 1e-5) / vec2(aspect, 1.0) * w * 0.002 * fall;
    shade = w * 0.04 * fall;
  } else if (uEffect == 1) {
    float R = 0.14;
    float inside = 1.0 - smoothstep(R - 0.03, R, d);
    suv = mix(uv, uMouse + (uv - uMouse) / 1.3, inside * uMouseOn);
    ring = (1.0 - smoothstep(0.0, 1.2 / uRes.y, abs(pd - R))) * uMouseOn * 0.35;
  } else if (uEffect == 2) {
    float R = 0.15;
    reveal = (1.0 - smoothstep(R - 0.06, R, d)) * uMouseOn * 0.6;
    ring = (1.0 - smoothstep(0.0, 1.2 / uRes.y, abs(pd - R))) * uMouseOn * 0.25;
  } else if (uEffect == 3) {
    scramble = (1.0 - smoothstep(0.04, 0.13, d)) * uMouseOn * 0.5;
  } else if (uEffect == 4) {
    /* repel: a soft round dimple, the picture eased out from under the
       cursor and the ink there thinned, not cleared */
    float k = exp(-pow(length(dp) / 0.065, 2.0)) * uMouseOn;
    suv = uv - normalize(dp + 1e-6) * big / uRes * 0.026 * k;
    shade = -k * 0.7;
  } else {
    /* magnet: the picture drawn in toward the cursor, its lines closing up
       round it and the ink there a little fuller; on the mark only, the
       paper around it stays bare; gentle, about half its first strength
       (27 Oct, Krish: "too harsh") */
    float k = exp(-pow(length(dp) / 0.08, 2.0)) * uMouseOn;
    suv = uv + normalize(dp + 1e-6) * big / uRes * 0.01 * k;
    pull = (uv.y - uMouse.y) * uRes.y * 0.24 * k;
    shade = k * 0.08;
    inkOnly = 1.0;
  }
`

/** Ink colour and opacity for the three palettes; needs uPalette. */
export const PASS_INK = /* glsl */ `
vec4 inkOf(float ink, float lum){
  if (uPalette == 0) return vec4(0.063, 0.055, 0.08, ink * 0.62);
  if (uPalette == 1) return vec4(0.96, 0.96, 0.97, ink * 0.9);
  return vec4(mix(vec3(0.05, 0.22, 0.85), vec3(0.62, 0.86, 1.0), smoothstep(0.35, 1.0, lum)), ink);
}
`

export function passUniforms(extra: Record<string, THREE.IUniform> = {}) {
  return {
    uA: { value: null },
    uB: { value: null },
    uMix: { value: 0 },
    uBand: { value: 0.14 },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(-9, -9) },
    uMouseOn: { value: 0 },
    uEffect: { value: 0 },
    uPalette: { value: 0 },
    ...extra,
  } as Record<string, THREE.IUniform>
}

export abstract class DeckStage extends Stage {
  current: SceneId
  protected next: SceneId | null = null
  protected built = new Map<SceneId, Built>()
  protected ta: THREE.WebGLRenderTarget
  protected tb: THREE.WebGLRenderTarget
  protected pass!: THREE.ShaderMaterial
  private mix = 0
  private dur = 2.4
  private onDone: (() => void) | null = null
  private mouseOn = 0
  private overCanvas = false
  private res = new THREE.Vector2()
  /* the repel and the magnet follow the cursor on a spring, a touch under
     damped, so they catch up quickly and settle with a small wobble; the
     other effects drift after the slow pointer */
  private springy = false
  private spot = new THREE.Vector2(-9, -9)
  private spotV = new THREE.Vector2()

  constructor(canvas: HTMLCanvasElement, first: SceneId) {
    super(canvas, 35)
    this.current = first
    const rt = () =>
      new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true })
    this.ta = rt()
    this.tb = rt()
    window.addEventListener('pointermove', this.onPointer, { passive: true })
  }

  /** Called by the subclass once its pass material exists. */
  protected mount(pass: THREE.ShaderMaterial) {
    this.pass = pass
    pass.uniforms.uA.value = this.ta.texture
    pass.uniforms.uB.value = this.tb.texture
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pass)
    quad.frustumCulled = false
    this.scene.add(quad)
    this.resize()
    this.start()
  }

  /** Width and height of the brightness targets, in texels. */
  protected abstract targetSize(): [number, number]
  /** After a resize, for the subclass's own uniforms. */
  protected onGrid() {}

  private onPointer = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect()
    this.overCanvas = e.clientY >= r.top && e.clientY <= r.bottom
  }

  protected get(id: SceneId) {
    let b = this.built.get(id)
    if (!b) {
      b = BUILD[id]()
      this.built.set(id, b)
    }
    b.camera.aspect = this.width / this.height
    b.camera.updateProjectionMatrix()
    return b
  }

  setEffect(e: Effect) {
    if (this.pass) this.pass.uniforms.uEffect.value = EFFECTS.findIndex((x) => x.id === e)
    this.springy = e === 'repel' || e === 'magnet'
  }

  setPalette(p: 'light' | 'dark' | 'blue') {
    if (this.pass) this.pass.uniforms.uPalette.value = ['light', 'dark', 'blue'].indexOf(p)
  }

  protected onResize() {
    if (!this.pass) return
    const dpr = this.renderer.getPixelRatio()
    this.pass.uniforms.uRes.value.set(this.width * dpr, this.height * dpr)
    const [w, h] = this.targetSize()
    this.ta.setSize(w, h)
    this.tb.setSize(w, h)
    this.onGrid()
  }

  /** Changes scene across `dur` seconds, then calls `then`. */
  go(id: SceneId, { dur = 2.4, then }: { dur?: number; then?: () => void } = {}) {
    if (id === (this.next ?? this.current)) {
      then?.()
      return
    }
    if (this.next) this.current = this.next
    this.next = id
    this.mix = 0
    this.dur = dur
    this.onDone = then ?? null
  }

  protected frame(dt: number) {
    const u = this.pass.uniforms
    u.uTime.value = this.time
    const p = this.pointer
    const on = this.pointerIn && this.overCanvas ? 1 : 0
    this.mouseOn += (on - this.mouseOn) * (1 - Math.exp(-(this.springy ? 4 : 1.1) * dt))
    u.uMouseOn.value = this.mouseOn
    if (this.springy) {
      const tx = this.pointerTarget.x * 0.5 + 0.5
      const ty = this.pointerTarget.y * 0.5 + 0.5
      if (this.spot.x < -1) this.spot.set(tx, ty)
      this.spotV.x += ((tx - this.spot.x) * 70 - this.spotV.x * 11) * dt
      this.spotV.y += ((ty - this.spot.y) * 70 - this.spotV.y * 11) * dt
      this.spot.addScaledVector(this.spotV, dt)
      u.uMouse.value.copy(this.spot)
    } else u.uMouse.value.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5)

    /* the scenes run at half pace and lean only gently toward the cursor */
    const t = this.time * PACE
    const sp = p.clone().multiplyScalar(LEAN)
    const r = this.renderer
    r.setClearColor(0x000000, 1)
    const a = this.get(this.current)
    const res = this.res.set(this.ta.width, this.ta.height)
    a.update(t, sp, res)
    r.setRenderTarget(this.ta)
    r.clear()
    r.render(a.scene, a.camera)

    if (this.next) {
      const b = this.get(this.next)
      b.update(t, sp, res)
      r.setRenderTarget(this.tb)
      r.clear()
      r.render(b.scene, b.camera)
      this.mix = Math.min(1, this.mix + dt / this.dur)
      if (this.mix >= 1) {
        this.current = this.next
        this.next = null
        this.mix = 0
        const t = this.ta
        this.ta = this.tb
        this.tb = t
        u.uA.value = this.ta.texture
        u.uB.value = this.tb.texture
        const done = this.onDone
        this.onDone = null
        done?.()
      }
    }
    const band = u.uBand.value as number
    u.uMix.value = this.next ? this.mix * (1 + band * 2) - band : 0
    r.setRenderTarget(null)
    r.setClearColor(0x000000, 0)
  }

  dispose() {
    window.removeEventListener('pointermove', this.onPointer)
    this.ta.dispose()
    this.tb.dispose()
    this.built.forEach((b) =>
      b.scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
        mats.forEach((x) => {
          Object.values((x as THREE.ShaderMaterial).uniforms ?? {}).forEach(
            (v) => v.value instanceof THREE.Texture && v.value.dispose(),
          )
          x.dispose()
        })
      }),
    )
    super.dispose()
  }
}
