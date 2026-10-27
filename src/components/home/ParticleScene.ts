import * as THREE from 'three'
import { NOISE, Stage } from './gl'
import type { SceneId } from './ascii/scenes'
import { AVOID, avoidUniforms, WAVE } from './ascii/wave'
import { MOTION } from './ascii/dots'
import * as F from './ascii/forms'
import { frameWidth, PHONE_DROP } from './ascii/lum'

/* ============================================================================
   PARTICLES · MORPH — one cloud of fine grains that pours from shape to shape

   Every shape is a list of points the same length as the cloud. A change
   sends each grain from where it is to its place in the next shape, each
   leaving a little later than the last and swinging out through a noise
   field on the way, so the cloud pours rather than slides. The cursor
   scatters, attracts or swirls the grains near it.
   ========================================================================== */

export type Pull = 'scatter' | 'attract' | 'swirl' | 'wave'

export const PULLS: { id: Pull; label: string; hint: string }[] = [
  { id: 'scatter', label: 'Scatter', hint: 'Grains near the cursor drift aside, like sand under a hand.' },
  { id: 'attract', label: 'Attract', hint: 'Grains near the cursor gather toward it.' },
  { id: 'swirl', label: 'Swirl', hint: 'Grains near the cursor circle around it.' },
  { id: 'wave', label: 'Wave', hint: 'Slow rings roll out through the cloud from the cursor.' },
]
export type ParticleOpts = { count: number; size: number; palette: 'light' | 'dark' | 'blue'; pull: Pull }

const vert = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aSeed;
uniform float uMix;
uniform float uTime;
uniform float uSize;
uniform vec3 uMouse;
uniform float uMouseOn;
uniform int uPull;
uniform float uWave;
uniform float uLand;
uniform float uWarp;
varying float vSeed;
varying float vDepth;
varying float vKeep;
varying float vCrest;
${NOISE}
${WAVE}
${MOTION}
${AVOID}

void main(){
  float k = clamp((uMix - aSeed * 0.4) / 0.6, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  vec3 p = mix(aFrom, aTo, k);
  float fly = sin(k * 3.14159);
  p += vec3(
    snoise(vec3(p.xy * 0.35, aSeed * 9.0)),
    snoise(vec3(p.yz * 0.35, aSeed * 7.0 + 3.0)),
    snoise(vec3(p.zx * 0.35, aSeed * 5.0 + 6.0))) * fly * 0.9;
  /* a little life at rest */
  p += vec3(
    snoise(vec3(p * 0.6 + uTime * 0.07)),
    snoise(vec3(p * 0.6 + uTime * 0.07 + 11.0)),
    0.0) * 0.035;
  /* on the landing grid, the slow swell of the dot wave */
  float sw = wave(p.xz, uTime * 0.6);
  p.y += sw * uWave;
  /* the land: the same grid lifted into mountains */
  float lh = landH(p.xz, uTime * 0.5);
  p.y += (lh + sw * 0.25) * uLand;
  /* the warp: every streak rushing toward the viewer */
  p.z = mix(p.z, warpZ(p.z, uTime * 0.5), uWarp);

  vec4 w = modelMatrix * vec4(p, 1.0);
  vec2 d = w.xy - uMouse.xy;
  float f = exp(-dot(d, d) * 2.6) * uMouseOn;
  vec2 n = normalize(d + 1e-4);
  if (uPull == 0) w.xy += n * f * 0.2;
  else if (uPull == 1) w.xy -= n * f * min(length(d), 0.7) * 0.22;
  else if (uPull == 2) w.xy += vec2(-n.y, n.x) * f * 0.2;
  else {
    float dl = length(d);
    float wave = sin(dl * 6.0 - uTime * 0.6) * exp(-dl * 1.2) * uMouseOn;
    w.z += wave * 0.12;
    w.xy += n * wave * 0.025;
  }
  if (uPull != 3) w.z += f * 0.08;

  vec4 mv = viewMatrix * w;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.55 + aSeed * 0.9) / -mv.z;
  /* the dot wave keeps clear of the copy, and its crests catch the light */
  vec2 suv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
  vKeep = smoothstep(0.01, 0.04, avoidDist(suv));
  vCrest = mix(1.0, 0.35 + 0.65 * smoothstep(-0.3, 0.45, sw), uWave);
  vCrest *= mix(1.0, 0.3 + 0.7 * smoothstep(0.1, 1.6, lh), uLand);
  vCrest *= mix(1.0, smoothstep(1.5, 4.0, -mv.z), uWarp);
  vSeed = aSeed;
  vDepth = -mv.z;
}
`

const frag = /* glsl */ `
uniform int uPalette;
uniform float uField;
uniform float uWarp;
varying float vSeed;
varying float vDepth;
varying float vKeep;
varying float vCrest;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.2, r);
  /* the field forms reach deep into the distance; the warp deeper still */
  float fog = smoothstep(mix(16.0, 27.0, uField) + uWarp * 12.0, mix(6.0, 15.0, uField) + uWarp * 15.0, vDepth);
  vec3 col;
  float alpha;
  if (uPalette == 0) { col = vec3(0.063, 0.055, 0.08); alpha = a * 0.72 * fog; }
  else if (uPalette == 1) { col = vec3(0.96, 0.96, 0.98); alpha = a * 0.75 * fog; }
  else { col = mix(vec3(0.08, 0.3, 1.0), vec3(0.7, 0.9, 1.0), vSeed * vSeed); alpha = a * 0.85 * fog; }
  gl_FragColor = vec4(col, alpha * vKeep * vCrest);
}
`

/* --- shapes -------------------------------------------------------------- */

const rnd = Math.random

function fromMask(n: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, width: number, depth = 0.12) {
  const W = 800
  const H = 300
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d')!
  draw(g, W, H)
  const d = g.getImageData(0, 0, W, H).data
  const pts: number[] = []
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 128) pts.push(x, y)
  const out = new Float32Array(n * 3)
  const m = pts.length / 2
  const s = width / W
  for (let i = 0; i < n; i++) {
    if (!m) break
    const j = Math.floor(rnd() * m)
    out[i * 3] = (pts[j * 2] - W / 2 + rnd() * 2) * s
    out[i * 3 + 1] = -(pts[j * 2 + 1] - H / 2 + rnd() * 2) * s
    out[i * 3 + 2] = (rnd() - 0.5) * depth
  }
  return out
}

/** Each shape is one of the dot forms the ASCII and print versions draw
 *  (forms.ts), so all three versions show the same seven forms. */
function shape(id: SceneId, n: number): Float32Array {
  switch (id) {
    case 'rage':
      return fromMask(
        n,
        (g, W, H) => {
          g.font = '600 230px Mosvita, Inter, sans-serif'
          g.textAlign = 'center'
          g.textBaseline = 'middle'
          g.fillText('RAGe', W / 2, H / 2 + 10)
        },
        5.8,
      )
    case 'home':
    case 'land':
    case 'logo' /* the final homepage's print mark; never a particle shape */:
      /* the wave's grid; the swell, the mountains and the fade around the
         copy happen in the shader */
      return F.field(n).pos
    case 'lattice':
      return F.lattice(n).pos
    case 'warp':
      return F.warp(n).pos
    case 'spark':
      return F.spark(n).pos
    case 'grid':
      return F.grid(n).pos
    case 'globe':
      return F.globe(n).pos
  }
}

/** How the cloud is held for each shape: a slow spin or none, a tilt, and
 *  where it sits beside the copy. */
const HOLD: Partial<Record<SceneId, { spin: number; tiltX: number; x?: number; y?: number; s?: number }>> = {
  lattice: { spin: 0.12, tiltX: 0.45, x: 2.3, y: 0.55 },
  spark: { spin: 0.08, tiltX: 0.2, x: 2.3, y: 0.55 },
  globe: { spin: 0.1, tiltX: 0.35, x: 2.3, y: 0.55 },
}

/** How wide each object shape is, for fitting it to a phone. */
const WIDTH: Partial<Record<SceneId, number>> = {
  lattice: 2.9,
  spark: 3.6,
  globe: 3.4,
  rage: 5.8,
}

/** The shapes that fill the frame as they are, never moved or fitted. */
const FIELDS = new Set<SceneId>(['home', 'land', 'warp', 'grid'])

export class ParticleScene extends Stage {
  opts: ParticleOpts
  current: SceneId
  private next: SceneId | null = null
  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
  private mix = 1
  private dur = 3.2
  private cache = new Map<string, Float32Array>()
  private ray = new THREE.Raycaster()
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  private mouseOn = 0
  private avoidU = avoidUniforms()
  private holder = new THREE.Group()
  private mat: THREE.ShaderMaterial

  constructor(canvas: HTMLCanvasElement, first: SceneId, opts: ParticleOpts) {
    super(canvas, 35)
    this.camera.position.set(0, 0, 8)
    this.current = first
    this.opts = opts
    this.mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMix: { value: 1 },
        uTime: { value: 0 },
        uSize: { value: 30 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uMouseOn: { value: 0 },
        uPull: { value: 0 },
        uPalette: { value: 0 },
        uWave: { value: 0 },
        uLand: { value: 0 },
        uWarp: { value: 0 },
        uField: { value: 0 },
        ...this.avoidU.u,
      },
    })
    this.scene.add(this.holder)
    this.build()
    document.fonts?.ready.then(() => this.cache.forEach((_, k) => k.startsWith('rage') && this.cache.delete(k)))
    this.setOpts(opts)
    this.resize()
    this.start()
  }

  private shape(id: SceneId) {
    const key = `${id}:${this.opts.count}`
    let s = this.cache.get(key)
    if (!s) {
      s = shape(id, this.opts.count)
      this.cache.set(key, s)
    }
    return s
  }

  /** (Re)builds the cloud at the current count, resting on the current shape. */
  private build() {
    const n = this.opts.count
    const geo = new THREE.BufferGeometry()
    const to = this.shape(this.next ?? this.current)
    const from = this.next ? this.shape(this.current) : to
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) seed[i] = rnd()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    geo.setAttribute('aFrom', new THREE.BufferAttribute(from.slice(), 3))
    geo.setAttribute('aTo', new THREE.BufferAttribute(to.slice(), 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50)
    if (this.points) {
      this.holder.remove(this.points)
      this.points.geometry.dispose()
    }
    this.points = new THREE.Points(geo, this.mat)
    this.holder.add(this.points)
  }

  setOpts(o: ParticleOpts) {
    const rebuild = o.count !== this.opts.count
    this.opts = o
    const u = this.mat.uniforms
    u.uPull.value = PULLS.findIndex((x) => x.id === o.pull)
    u.uPalette.value = ['light', 'dark', 'blue'].indexOf(o.palette)
    this.mat.blending = o.palette === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending
    this.mat.needsUpdate = true
    this.onResize()
    if (rebuild) this.build()
  }

  protected onResize() {
    const dpr = this.renderer.getPixelRatio()
    const k = Math.min(1.3, Math.max(0.7, this.width / 1500))
    this.mat.uniforms.uSize.value = this.opts.size * 9 * dpr * k
  }

  go(id: SceneId, { dur = 3.2 }: { dur?: number } = {}) {
    if (id === (this.next ?? this.current) || !this.points) return
    const geo = this.points.geometry
    const fromAttr = geo.getAttribute('aFrom') as THREE.BufferAttribute
    const toAttr = geo.getAttribute('aTo') as THREE.BufferAttribute
    /* leave from wherever the cloud mostly is */
    const settled = this.next ? (this.mix > 0.5 ? this.next : this.current) : this.current
    ;(fromAttr.array as Float32Array).set(this.shape(settled))
    ;(toAttr.array as Float32Array).set(this.shape(id))
    fromAttr.needsUpdate = true
    toAttr.needsUpdate = true
    this.current = settled
    this.next = id
    this.mix = 0
    this.dur = dur
  }

  protected frame(dt: number) {
    const u = this.mat.uniforms
    u.uTime.value = this.time
    if (this.next) {
      this.mix = Math.min(1, this.mix + dt / this.dur)
      if (this.mix >= 1) {
        this.current = this.next
        this.next = null
      }
    }
    u.uMix.value = this.next ? this.mix : 1

    this.ray.setFromCamera(this.pointer, this.camera)
    const hit = this.ray.ray.intersectPlane(this.plane, new THREE.Vector3())
    if (hit) u.uMouse.value.copy(hit)
    this.mouseOn += ((this.pointerIn ? 1 : 0) - this.mouseOn) * (1 - Math.exp(-1.1 * dt))
    u.uMouseOn.value = this.mouseOn

    const shown = this.next && this.mix > 0.5 ? this.next : this.current
    /* the swell comes in as the grains settle on the landing grid */
    this.avoidU.sync()
    const toward = (k: number, on: boolean) => k + ((on ? 1 : 0) - k) * (1 - Math.exp(-1.5 * dt))
    u.uWave.value = toward(u.uWave.value, shown === 'home')
    u.uLand.value = toward(u.uLand.value, shown === 'land')
    u.uWarp.value = toward(u.uWarp.value, shown === 'warp')
    u.uField.value = toward(u.uField.value, FIELDS.has(shown))
    const hold = HOLD[shown] ?? { spin: 0, tiltX: 0 }
    const ease = 1 - Math.exp(-1.2 * dt)
    if (this.points) {
      const r = this.points.rotation
      /* spin, or come to rest at the nearest whole turn */
      if (hold.spin) r.y += hold.spin * dt
      else r.y += (Math.round(r.y / (Math.PI * 2)) * Math.PI * 2 - r.y) * ease
      r.x += (hold.tiltX - r.x) * ease
      /* on a phone the shape is centred and shrunk to fit the width */
      const aspect = this.width / this.height
      const tall = aspect < 1
      /* the landing contours are drawn for this frame, edge to edge */
      const full = FIELDS.has(shown)
      const fit = full ? 1 : tall ? Math.min(1, (frameWidth(this.camera, 8) * 0.86) / (WIDTH[shown] ?? 3.2)) : (hold.s ?? 1)
      const q = this.points.position
      q.x += ((tall || full ? 0 : (hold.x ?? 0)) - q.x) * ease
      q.y += ((full ? 0 : tall ? -(frameWidth(this.camera, 8) / aspect) * PHONE_DROP : (hold.y ?? 0)) - q.y) * ease
      const s = this.points.scale
      s.setScalar(s.x + (fit - s.x) * ease)
    }
    const h = this.holder.rotation
    h.y += (this.pointer.x * 0.07 - h.y) * ease
    h.x += (-this.pointer.y * 0.04 - h.x) * ease
  }
}
