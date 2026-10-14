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

export type Effect = 'ripple' | 'magnify' | 'reveal'

export const EFFECTS: { id: Effect; label: string }[] = [
  { id: 'ripple', label: 'Ripple' },
  { id: 'magnify', label: 'Magnify' },
  { id: 'reveal', label: 'Reveal' },
]

/** How fast the scenes move, and how far they follow the cursor. */
const PACE = 0.5
const LEAN = 0.55

export const PASS_VERT = /* glsl */ `
void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }
`

/** The cursor's bend of the sampling coordinates, shared by every pass.
 *  Sets `suv` and `reveal`; needs uv, uMouse, uMouseOn, uRes, uTime, uEffect. */
export const PASS_CURSOR = /* glsl */ `
  float aspect = uRes.x / uRes.y;
  vec2 dv = (uv - uMouse) * vec2(aspect, 1.0);
  float d = length(dv);
  vec2 suv = uv;
  float reveal = 0.0;
  if (uEffect == 0) {
    suv += normalize(dv + 1e-5) / vec2(aspect, 1.0) * sin(d * 46.0 - uTime * 1.8) * 0.0032 * exp(-d * 7.0) * uMouseOn;
  } else if (uEffect == 1) {
    float k = mix(0.78, 1.0, smoothstep(0.0, 0.2, d));
    suv = mix(uv, uMouse + (uv - uMouse) * k, uMouseOn);
  } else {
    reveal = (1.0 - smoothstep(0.05, 0.2, d)) * uMouseOn * 0.75;
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
    if (this.pass) this.pass.uniforms.uEffect.value = ['ripple', 'magnify', 'reveal'].indexOf(e)
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
    this.mouseOn += ((this.pointerIn && this.overCanvas ? 1 : 0) - this.mouseOn) * (1 - Math.exp(-1.8 * dt))
    u.uMouseOn.value = this.mouseOn
    u.uMouse.value.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5)

    /* the scenes run at half pace and lean only gently toward the cursor */
    const t = this.time * PACE
    const sp = p.clone().multiplyScalar(LEAN)
    const r = this.renderer
    r.setClearColor(0x000000, 1)
    const a = this.get(this.current)
    a.update(t, sp)
    r.setRenderTarget(this.ta)
    r.clear()
    r.render(a.scene, a.camera)

    if (this.next) {
      const b = this.get(this.next)
      b.update(t, sp)
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
