import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/* ============================================================================
   THE FINTECH ICON IN 3D — the final hero's left tile (Krish, 6 Nov: "on
   left instead use or create such nice 3d rendered object")

   UMM's Cool Shape for fintech (four circles in a diamond) rendered as four
   glossy pastel discs, puffed like pillows, each in the icon's own colour:
   citrus at the top, sun on the left, lilac on the right, sky at the foot.
   Lit by a soft studio, a clear coat and a faint pearl sheen, with a soft
   shadow on an unseen floor.

   The sector chosen in the hero arranges them:
     0 Banking    the icon itself, the four in their diamond
     1 Payments   in flight, one after another, turned like rolling coins
     2 Insurance  stacked, a reserve
   They glide from one to the next, bob each on its own beat, the whole
   leans after the pointer, a disc under the pointer swells a little, and a
   click asks for the next arrangement (`onPick`).

   Draws only while on screen; one still frame for reduced motion; a run of
   slow frames drops the resolution.
   ========================================================================== */

const COLORS = ['#f0ff70', '#ffe58f', '#dccfff', '#d1e7ff']

type Pose = { p: [number, number, number]; r: [number, number, number] }

const FORMATIONS: Pose[][] = [
  [
    { p: [0, 1.22, 0], r: [0, 0, 0] },
    { p: [-1.22, 0, 0], r: [0, 0, 0] },
    { p: [1.22, 0, 0], r: [0, 0, 0] },
    { p: [0, -1.22, 0], r: [0, 0, 0] },
  ],
  [
    { p: [-1.85, -0.98, 0.3], r: [0.15, 0.95, 0.35] },
    { p: [-0.62, -0.32, 0.1], r: [0.15, 0.95, 0.35] },
    { p: [0.62, 0.34, -0.1], r: [0.15, 0.95, 0.35] },
    { p: [1.85, 1.0, -0.3], r: [0.15, 0.95, 0.35] },
  ],
  [
    { p: [0.05, -1.0, 0], r: [-1.32, 0, 0.06] },
    { p: [-0.07, -0.38, 0.03], r: [-1.32, 0, -0.08] },
    { p: [0.09, 0.24, -0.02], r: [-1.32, 0, 0.1] },
    { p: [-0.03, 0.86, 0.04], r: [-1.32, 0, -0.04] },
  ],
]

export default function IconObject3D({ formation, onPick }: { formation: number; onPick?: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const want = useRef(formation)
  want.current = formation
  const pick = useRef(onPick)
  pick.current = onPick

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 1.04
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04).texture
    scene.environment = env

    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(2.5, 7, 4)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 })
    key.shadow.camera.updateProjectionMatrix()
    key.shadow.radius = 16
    key.shadow.blurSamples = 20
    key.shadow.bias = -0.0004
    scene.add(key)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.1 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2.25
    ground.receiveShadow = true
    scene.add(ground)

    const circle = new THREE.Shape()
    circle.absarc(0, 0, 0.6, 0, Math.PI * 2, false)
    const geo = new THREE.ExtrudeGeometry(circle, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.16,
      bevelSegments: 16,
      curveSegments: 72,
    })
    geo.center()

    const Q = FORMATIONS.map((f) => f.map((pose) => new THREE.Quaternion().setFromEuler(new THREE.Euler(...pose.r))))

    const group = new THREE.Group()
    scene.add(group)
    const discs = COLORS.map((hex, i) => {
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshPhysicalMaterial({
          color: hex,
          roughness: 0.3,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          sheen: 0.5,
          sheenRoughness: 0.4,
          sheenColor: new THREE.Color('#ffffff'),
          iridescence: 0.28,
          iridescenceIOR: 1.35,
          iridescenceThicknessRange: [120, 420],
          envMapIntensity: 1.1,
        }),
      )
      m.castShadow = true
      const f = FORMATIONS[want.current][i]
      m.position.set(...f.p)
      m.quaternion.copy(Q[want.current][i])
      group.add(m)
      return m
    })

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      /* far enough back that the widest arrangement always fits */
      const z = Math.max(10, 9.6 / camera.aspect)
      camera.position.set(0, 0.7, z)
      camera.lookAt(0, -0.1, 0)
      camera.updateProjectionMatrix()
      if (!running) draw(performance.now())
    }

    /* the pointer: the lean, and which disc is under it */
    const aim = { x: 0, y: 0 }
    const lean = { x: 0, y: 0 }
    const ndc = new THREE.Vector2(9, 9)
    const ray = new THREE.Raycaster()
    let hover = -1
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      aim.x = (e.clientY - r.top) / r.height - 0.5
      aim.y = (e.clientX - r.left) / r.width - 0.5
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    }
    const onLeave = () => {
      ndc.set(9, 9)
      aim.x = 0
      aim.y = 0
    }
    const onClick = () => {
      if (hover >= 0) pick.current?.()
    }

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    let last = t0
    const target = new THREE.Vector3()
    const draw = (now: number) => {
      const t = calm ? 0 : (now - t0) / 1000
      const dt = calm ? 1 : Math.min(0.05, (now - last) / 1000)
      last = now
      const k = calm ? 1 : 1 - Math.exp(-dt * 4.2)
      const kl = calm ? 1 : 1 - Math.exp(-dt * 2.6)
      lean.x += (aim.x - lean.x) * kl
      lean.y += (aim.y - lean.y) * kl
      group.rotation.x = 0.16 + lean.x * 0.4 + Math.sin(t * 0.5) * 0.03
      group.rotation.y = -0.4 + lean.y * 0.7 + Math.sin(t * 0.3) * 0.12

      ray.setFromCamera(ndc, camera)
      const hit = ndc.x < 2 ? ray.intersectObjects(discs, false)[0] : undefined
      hover = hit ? (discs as THREE.Object3D[]).indexOf(hit.object) : -1
      el.style.cursor = hover >= 0 && pick.current ? 'pointer' : ''

      const F = FORMATIONS[want.current]
      discs.forEach((d, i) => {
        const f = F[i]
        target.set(f.p[0], f.p[1] + Math.sin(t * 1.1 + i * 1.7) * 0.06, f.p[2])
        d.position.lerp(target, k)
        d.quaternion.slerp(Q[want.current][i], k)
        const s = hover === i ? 1.1 : 1
        d.scale.setScalar(d.scale.x + (s - d.scale.x) * k)
      })
      renderer.render(scene, camera)
    }

    let raf = 0
    let running = false
    let slow = 0
    let tier = 0
    const loop = (now: number) => {
      if (now - last > 34) slow++
      else slow = Math.max(0, slow - 1)
      if (slow > 30 && tier === 0) {
        tier = 1
        renderer.setPixelRatio(1)
        resize()
      }
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !calm && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(loop)
      } else if (!e.isIntersecting && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(el)
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()
    requestAnimationFrame(() => el.classList.add('is-ready'))
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('click', onClick)
      geo.dispose()
      discs.forEach((d) => (d.material as THREE.Material).dispose())
      ground.geometry.dispose()
      ;(ground.material as THREE.Material).dispose()
      env.dispose()
      pmrem.dispose()
      room.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className="ff-obj3d" />
}
