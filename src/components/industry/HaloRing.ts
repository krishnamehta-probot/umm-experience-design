import * as THREE from 'three'
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { studio } from '@/components/v2/glassStudio'

/* ============================================================================
   HALO RING — the Orbit hero's ring, in 3D (2 Nov: Krish liked the halo; the
   owner likes modern, abstract and flashy. Krish then took it out of the
   default, "what is that ring doing in there"; it is kept as an option)

   A band of light twisted one and a half times round a ring, tipped back into
   an orbit round the headline. The words sit inside the orbit: the ring is
   drawn twice, its far half on a canvas behind the type and its near half on
   one in front, split by a clipping plane through its centre, so it passes
   behind "Built for Trust." and in front of the line under it.

   Motion: the band turns on its own axis, so the twists run round the orbit;
   the orbit rocks a little; the room it reflects turns slowly. Sleeps off
   screen; one still frame for reduced motion.

   Three finishes (?ring= on the page):
     chrome  mirror metal reflecting a pale room of pastel softboxes, a
             thin-film sheen at its edges
     pearl   white pearl, iridescent where it turns away
     glass   the service pages' glass: dark studio strips and rainbow fringes
   ========================================================================== */

export type RingFinish = 'chrome' | 'pearl' | 'glass'

/** half twists round the ring; odd, so the band's two faces join as one */
const TWISTS = 3
/** the band's cross-section, as a share of the ring's radius */
const BAND_W = 0.085
const BAND_D = 0.026
/** how far the orbit is tipped back */
const TILT = 1.24

function bandGeometry() {
  const g = new ParametricGeometry(
    (u, v, out) => {
      const U = u * Math.PI * 2
      const V = v * Math.PI * 2
      const phi = (TWISTS * U) / 2
      const a = BAND_W * Math.cos(V)
      const b = BAND_D * Math.sin(V)
      const radial = a * Math.cos(phi) - b * Math.sin(phi)
      const z = a * Math.sin(phi) + b * Math.cos(phi)
      out.set((1 + radial) * Math.cos(U), (1 + radial) * Math.sin(U), z)
    },
    480,
    40,
  )
  /* the seam joins the band to itself half a turn round, so weld it by
     position, or the normals break into a line there */
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  const welded = mergeVertices(g, 1e-5)
  welded.computeVertexNormals()
  return welded
}

/** A pale room for the chrome and the pearl: white walls, a softbox of each
 *  pastel, and a dark horizon so the metal has something to be bright
 *  against. */
function pastelRoom() {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.SphereGeometry(22, 48, 24), new THREE.MeshBasicMaterial({ color: 0xeeeef2, side: THREE.BackSide })))
  const panel = (w: number, h: number, hex: string, power: number, at: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(power), side: THREE.DoubleSide }),
    )
    m.position.set(...at)
    m.lookAt(0, 0, 0)
    g.add(m)
  }
  panel(16, 7, '#ffffff', 2.2, [0, 13, 2]) //        key, above
  panel(5, 18, '#D1E7FF', 2.4, [-13, 0, 4]) //       sky, left
  panel(5, 18, '#FFC4F2', 2.2, [13, 0, 2]) //        blossom, right
  panel(18, 4, '#F0FF70', 1.6, [0, -12, 5]) //       citrus, the floor's bounce
  panel(8, 8, '#FFE58F', 1.8, [7, 4, -13]) //        sun, behind
  panel(4, 18, '#FFC3C4', 1.6, [-8, 0, -13]) //      coral, behind
  panel(2, 18, '#ffffff', 3.4, [3, 0, 14]) //        a hard white strip behind the camera
  const horizon = new THREE.Mesh(
    new THREE.CylinderGeometry(21, 21, 3.2, 64, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x1a1820, side: THREE.BackSide }),
  )
  horizon.position.y = -2.4
  g.add(horizon)
  return g
}

function material(finish: RingFinish) {
  if (finish === 'chrome')
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.12,
      iridescence: 0.75,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [180, 620],
      envMapIntensity: 1.15,
    })
  if (finish === 'pearl')
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.22,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 820],
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      sheen: 1,
      sheenColor: new THREE.Color('#FFC4F2'),
      sheenRoughness: 0.45,
      envMapIntensity: 1.05,
    })
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.03,
    transmission: 1,
    thickness: 0.35,
    ior: 1.52,
    dispersion: 4,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2,
    attenuationColor: new THREE.Color('#f0f4fa'),
    attenuationDistance: 4,
    side: THREE.DoubleSide,
  })
}

/** One of the two canvases: its own renderer, room and copy of the ring. */
class Layer {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  orbit = new THREE.Group()
  ring: THREE.Mesh
  room: THREE.Group | null = null
  env: THREE.Texture | null = null
  pmrem: THREE.PMREMGenerator
  plane: THREE.Plane

  constructor(host: HTMLElement, side: 'back' | 'front', geometry: THREE.BufferGeometry, finish: RingFinish) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.toneMapping = THREE.NeutralToneMapping
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.localClippingEnabled = true
    this.renderer.domElement.className = 'hx__gl'
    host.appendChild(this.renderer.domElement)
    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    /* the back canvas keeps the far half of the ring, the front one the near */
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, side === 'back' ? -1 : 1), 0)
    this.ring = new THREE.Mesh(geometry, material(finish))
    this.orbit.add(this.ring)
    this.scene.add(this.orbit)
    this.setFinish(finish)
  }

  setFinish(finish: RingFinish) {
    const old = this.ring.material as THREE.Material
    this.ring.material = material(finish)
    ;(this.ring.material as THREE.Material).clippingPlanes = [this.plane]
    old.dispose()
    this.env?.dispose()
    if (this.room) this.scene.remove(this.room)
    const envScene = new THREE.Scene()
    envScene.add(finish === 'glass' ? studio(false) : pastelRoom())
    this.env = this.pmrem.fromScene(envScene, 0.02).texture
    this.scene.environment = this.env
    /* the glass also needs the room to look through, drawn only off screen */
    this.room = finish === 'glass' ? studio(true) : null
    if (this.room) this.scene.add(this.room)
  }

  dispose() {
    ;(this.ring.material as THREE.Material).dispose()
    this.env?.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
  }
}

export class HaloRing {
  private layers: Layer[]
  private geometry = bandGeometry()
  private camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100)
  private raf = 0
  private t0 = performance.now()
  private visible = true
  private still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private io: IntersectionObserver
  private lean = { x: 0, y: 0 }
  private aim = { x: 0, y: 0 }

  /** `back` sits under the type, `front` over it; both cover the same box. */
  constructor(
    private back: HTMLElement,
    front: HTMLElement,
    finish: RingFinish,
  ) {
    this.layers = [new Layer(back, 'back', this.geometry, finish), new Layer(front, 'front', this.geometry, finish)]
    this.camera.position.set(0, 0, 10)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      this.wake()
    })
    this.io.observe(back)
    if (!this.still) window.addEventListener('pointermove', this.onPointer, { passive: true })
  }

  /** Sit the ring's centre at (x, y) over the hosts, `radius` across (CSS px). */
  layout(x: number, y: number, radius: number) {
    const w = this.back.clientWidth
    const h = this.back.clientHeight
    if (!w || !h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    for (const l of this.layers) {
      l.renderer.setPixelRatio(dpr)
      l.renderer.setSize(w, h, false)
    }
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    /* world units per CSS pixel on the plane through the ring's centre */
    const ppu = h / (2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)))
    for (const l of this.layers) {
      l.orbit.position.set((x - w / 2) / ppu, (h / 2 - y) / ppu, 0)
      l.orbit.scale.setScalar(radius / ppu)
    }
    this.draw()
  }

  setFinish(finish: RingFinish) {
    for (const l of this.layers) l.setFinish(finish)
    this.draw()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.io.disconnect()
    window.removeEventListener('pointermove', this.onPointer)
    for (const l of this.layers) l.dispose()
    this.geometry.dispose()
  }

  private onPointer = (e: PointerEvent) => {
    this.aim.x = (e.clientY / window.innerHeight - 0.5) * 0.12
    this.aim.y = (e.clientX / window.innerWidth - 0.5) * 0.2
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
    const t = this.still ? 6 : (performance.now() - this.t0) / 1000
    this.lean.x += (this.aim.x - this.lean.x) * 0.04
    this.lean.y += (this.aim.y - this.lean.y) * 0.04
    for (const l of this.layers) {
      /* tipped back, the far side up; it rocks a little and leans to the pointer */
      l.orbit.rotation.set(-TILT + Math.sin(t * 0.37) * 0.035 + this.lean.x, Math.sin(t * 0.23) * 0.09 + this.lean.y, 0.07)
      /* the band turns on its own axis, so its twists run round the orbit */
      l.ring.rotation.z = t * 0.16
      l.scene.environmentRotation.set(0, t * 0.12, 0)
      l.renderer.render(l.scene, this.camera)
    }
  }
}
