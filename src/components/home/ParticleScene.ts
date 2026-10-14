import * as THREE from 'three'
import { NOISE, Stage } from './gl'
import type { SceneId } from './ascii/scenes'
import logoUrl from '@/assets/home/umm-logo.svg'

/* ============================================================================
   PARTICLES · MORPH — one cloud of fine grains that pours from shape to shape

   Every shape is a list of points the same length as the cloud. A change
   sends each grain from where it is to its place in the next shape, each
   leaving a little later than the last and swinging out through a noise
   field on the way, so the cloud pours rather than slides. The cursor
   scatters, attracts or swirls the grains near it.
   ========================================================================== */

export type Pull = 'scatter' | 'attract' | 'swirl'
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
varying float vSeed;
varying float vDepth;
${NOISE}

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

  vec4 w = modelMatrix * vec4(p, 1.0);
  vec2 d = w.xy - uMouse.xy;
  float f = exp(-dot(d, d) * 2.6) * uMouseOn;
  vec2 n = normalize(d + 1e-4);
  if (uPull == 0) w.xy += n * f * 0.42;
  else if (uPull == 1) w.xy -= n * f * min(length(d), 0.7) * 0.45;
  else w.xy += vec2(-n.y, n.x) * f * 0.42;
  w.z += f * 0.2;

  vec4 mv = viewMatrix * w;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.55 + aSeed * 0.9) / -mv.z;
  vSeed = aSeed;
  vDepth = -mv.z;
}
`

const frag = /* glsl */ `
uniform int uPalette;
varying float vSeed;
varying float vDepth;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.2, r);
  float fog = smoothstep(16.0, 6.0, vDepth);
  vec3 col;
  float alpha;
  if (uPalette == 0) { col = vec3(0.063, 0.055, 0.08); alpha = a * 0.72 * fog; }
  else if (uPalette == 1) { col = vec3(0.96, 0.96, 0.98); alpha = a * 0.75 * fog; }
  else { col = mix(vec3(0.08, 0.3, 1.0), vec3(0.7, 0.9, 1.0), vSeed * vSeed); alpha = a * 0.85 * fog; }
  gl_FragColor = vec4(col, alpha);
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

let logoImg: HTMLImageElement | null = null
function loadLogo() {
  if (logoImg) return Promise.resolve(logoImg)
  return new Promise<HTMLImageElement>((ok) => {
    const img = new Image()
    img.onload = () => {
      logoImg = img
      ok(img)
    }
    img.src = logoUrl
  })
}

function shape(id: SceneId, n: number): Float32Array {
  const out = new Float32Array(n * 3)
  const set = (i: number, x: number, y: number, z: number) => {
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = z
  }
  switch (id) {
    case 'sphere': {
      for (let i = 0; i < n; i++) {
        const y = 1 - (2 * (i + 0.5)) / n
        const r = Math.sqrt(1 - y * y)
        const a = i * 2.399963
        const R = 1.45 * (0.97 + rnd() * 0.06)
        set(i, Math.cos(a) * r * R, y * R, Math.sin(a) * r * R)
      }
      return out
    }
    case 'logo':
      return fromMask(
        n,
        (g, W, H) => {
          if (logoImg) {
            const w = W * 0.96
            const h = (w * 460) / 1553
            g.drawImage(logoImg, (W - w) / 2, (H - h) / 2, w, h)
          }
        },
        6.6,
        0.3,
      )
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
    case 'eye': {
      for (let i = 0; i < n; i++) {
        const fibre = Math.floor(rnd() * 220)
        const a = (fibre / 220) * Math.PI * 2 + (rnd() - 0.5) * 0.02
        const t = Math.pow(rnd(), 0.8)
        const r = 0.55 + t * 1.75
        set(i, Math.cos(a + t * 0.25) * r, Math.sin(a + t * 0.25) * r, (rnd() - 0.5) * 0.2 - t * 0.4)
      }
      return out
    }
    case 'mountains': {
      for (let i = 0; i < n; i++) {
        const x = (rnd() - 0.5) * 13
        const z = -rnd() * 9 + 2
        const h =
          Math.max(0, Math.sin(x * 0.8) + Math.sin(z * 0.9 + x * 0.3) + Math.sin(x * 0.35 - z * 0.5) * 1.4) * 0.45
        set(i, x, -1.6 + h * h * 0.9, z)
      }
      return out
    }
    case 'knot': {
      for (let i = 0; i < n; i++) {
        const t = rnd() * Math.PI * 2
        const p = 2
        const q = 3
        const R = 1.25
        const cx = (R + 0.5 * Math.cos(q * t)) * Math.cos(p * t)
        const cy = (R + 0.5 * Math.cos(q * t)) * Math.sin(p * t)
        const cz = 0.5 * Math.sin(q * t)
        const a = rnd() * Math.PI * 2
        const r = 0.32
        set(i, cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz + Math.sin(a + t) * r)
      }
      return out
    }
    case 'city': {
      const g = 18
      for (let i = 0; i < n; i++) {
        const bx = Math.floor(rnd() * g)
        const bz = Math.floor(rnd() * g)
        const hgt = 0.2 + Math.max(0, Math.sin(bx * 0.7) * Math.cos(bz * 0.6) + 0.5) * 1.6
        const x = (bx - g / 2) * 0.42 + (rnd() - 0.5) * 0.3
        const z = (bz - g / 2) * 0.42 + (rnd() - 0.5) * 0.3
        set(i, x, -1.4 + rnd() * hgt, z)
      }
      return out
    }
    case 'tunnel': {
      for (let i = 0; i < n; i++) {
        const ring = Math.floor(rnd() * 26)
        const a = rnd() * Math.PI * 2
        const r = 2.3 + (rnd() - 0.5) * 0.08
        set(i, Math.cos(a) * r, Math.sin(a) * r, 3 - ring * 0.9)
      }
      return out
    }
  }
  return out
}

/** How the cloud is held for each shape: a slow spin or none, a tilt, and
 *  where it sits (the sphere where the live hero keeps it, left of centre). */
const HOLD: Partial<Record<SceneId, { spin: number; tiltX: number; x?: number; y?: number }>> = {
  sphere: { spin: 0.08, tiltX: 0, x: -1.9, y: -0.1 },
  knot: { spin: 0.1, tiltX: 0.2, x: 1 },
  city: { spin: 0.05, tiltX: 0.55 },
}

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
      },
    })
    this.scene.add(this.holder)
    this.build()
    loadLogo().then(() => {
      this.cache.forEach((_, k) => k.startsWith('logo') && this.cache.delete(k))
      if (this.current === 'logo' || this.next === 'logo') this.build()
    })
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
    u.uPull.value = ['scatter', 'attract', 'swirl'].indexOf(o.pull)
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
    this.mouseOn += ((this.pointerIn ? 1 : 0) - this.mouseOn) * (1 - Math.exp(-1.8 * dt))
    u.uMouseOn.value = this.mouseOn

    const shown = this.next && this.mix > 0.5 ? this.next : this.current
    const hold = HOLD[shown] ?? { spin: 0, tiltX: 0 }
    const ease = 1 - Math.exp(-1.2 * dt)
    if (this.points) {
      const r = this.points.rotation
      /* spin, or come to rest at the nearest whole turn */
      if (hold.spin) r.y += hold.spin * dt
      else r.y += (Math.round(r.y / (Math.PI * 2)) * Math.PI * 2 - r.y) * ease
      r.x += (hold.tiltX - r.x) * ease
      const q = this.points.position
      q.x += ((hold.x ?? 0) - q.x) * ease
      q.y += ((hold.y ?? 0) - q.y) * ease
    }
    const h = this.holder.rotation
    h.y += (this.pointer.x * 0.12 - h.y) * ease
    h.x += (-this.pointer.y * 0.07 - h.x) * ease
  }
}
