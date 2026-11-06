import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/* ============================================================================
   THE PASTEL FLOWER — the final hero's left tile (Krish, 6 Nov, from his
   reference: a flower of glossy discs fanned round a centre; "nice and
   big", not small in a corner)

   Eight elliptical discs, each with its inner tip at the centre, turned in
   a pinwheel and tilted along their length so each lies over the next.
   Each face shades from its tip to its outer edge; the rims are the same
   colour a shade deeper, so the thickness reads, as in the reference. A
   clear coat and a faint pearl sheen, a soft studio, a soft shadow below.

   The colours run round the flower through a palette per sector (cool for
   Banking, warm for Payments, rose for Insurance) and ease across when the
   sector changes, the flower giving a quick extra turn as it does. It
   turns slowly on its own, leans after the pointer, swells a little under
   it, and a click asks for the next sector (`onPick`).
   ========================================================================== */

const PALETTES = [
  ['#d1e7ff', '#dccfff', '#ffc4f2', '#d1e7ff'],
  ['#f0ff70', '#ffe58f', '#ffc3c4', '#f0ff70'],
  ['#ffc4f2', '#ffc3c4', '#dccfff', '#ffc4f2'],
]

const PETALS = 8

/** a palette's colour at `u` (0–1) round the flower */
function along(pal: string[], u: number) {
  const x = u * (pal.length - 1)
  const i = Math.min(pal.length - 2, Math.floor(x))
  return new THREE.Color(pal[i]).lerp(new THREE.Color(pal[i + 1]), x - i)
}

export default function FlowerObject3D({ palette, onPick }: { palette: number; onPick?: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const want = useRef(palette)
  want.current = palette
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
    renderer.toneMappingExposure = 1.02
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

    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(2, 8, 5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 22 })
    key.shadow.camera.updateProjectionMatrix()
    key.shadow.radius = 18
    key.shadow.blurSamples = 20
    key.shadow.bias = -0.0004
    scene.add(key)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.09 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2.55
    ground.receiveShadow = true
    scene.add(ground)

    /* one petal: an ellipse with a rounded rim, its inner tip at the origin */
    const ellipse = new THREE.Shape()
    ellipse.absellipse(0, 0, 1.02, 0.58, 0, Math.PI * 2, false, 0)
    const geo = new THREE.ExtrudeGeometry(ellipse, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.06,
      bevelSegments: 8,
      curveSegments: 80,
    })
    geo.center()
    geo.translate(1.0, 0, 0)
    /* the face lightens from the tip to the outer edge */
    const pos = geo.getAttribute('position')
    const shade = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const t = Math.min(1, Math.max(0, pos.getX(i) / 2.1))
      const v = 0.74 + 0.26 * t
      shade[i * 3] = v
      shade[i * 3 + 1] = v
      shade[i * 3 + 2] = v
    }
    geo.setAttribute('color', new THREE.BufferAttribute(shade, 3))

    const flower = new THREE.Group()
    const spin = new THREE.Group()
    flower.add(spin)
    scene.add(flower)

    const petals = Array.from({ length: PETALS }, (_, i) => {
      const face = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.22,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        sheen: 0.4,
        sheenRoughness: 0.35,
        sheenColor: new THREE.Color('#ffffff'),
        iridescence: 0.22,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [120, 420],
        envMapIntensity: 1.15,
      })
      const rim = new THREE.MeshPhysicalMaterial({
        roughness: 0.18,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.2,
      })
      const mesh = new THREE.Mesh(geo, [face, rim])
      mesh.castShadow = true
      mesh.rotation.set(0.62, -0.1, 0)
      const pivot = new THREE.Group()
      pivot.rotation.z = (i / PETALS) * Math.PI * 2
      pivot.position.z = i * 0.012
      pivot.add(mesh)
      spin.add(pivot)
      return { mesh, face, rim, pivot }
    })

    /* the colours now, easing toward the sector's */
    const colourOf = (p: number, i: number) => along(PALETTES[p], i / PETALS)
    const now = petals.map((_, i) => colourOf(want.current, i))
    const paint = () =>
      petals.forEach((p, i) => {
        p.face.color.copy(now[i])
        p.rim.color.copy(now[i]).multiplyScalar(0.72)
      })
    paint()

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      /* the flower fills the box's shorter side, nearly */
      const z = Math.max(9.4, 9.4 / camera.aspect)
      camera.position.set(0, 0.5, z)
      camera.lookAt(0, -0.05, 0)
      camera.updateProjectionMatrix()
      if (!running) draw(performance.now())
    }

    const aim = { x: 0, y: 0 }
    const lean = { x: 0, y: 0 }
    const ndc = new THREE.Vector2(9, 9)
    const ray = new THREE.Raycaster()
    let over = false
    let swell = 1
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
      if (over) pick.current?.()
    }

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    let last = t0
    let shown = want.current
    let angle = 0
    let boost = 0
    const target = new THREE.Color()
    const draw = (time: number) => {
      const dt = calm ? 1 : Math.min(0.05, (time - last) / 1000)
      last = time
      const t = calm ? 0 : (time - t0) / 1000
      const kl = calm ? 1 : 1 - Math.exp(-dt * 2.6)
      const kc = calm ? 1 : 1 - Math.exp(-dt * 3)
      lean.x += (aim.x - lean.x) * kl
      lean.y += (aim.y - lean.y) * kl

      /* a new sector: an extra quick turn, and the colours ease across */
      if (want.current !== shown) {
        shown = want.current
        boost = 2.4
      }
      boost += (0 - boost) * (calm ? 1 : 1 - Math.exp(-dt * 1.6))
      angle -= (0.22 + boost) * (calm ? 0 : dt)
      spin.rotation.z = angle

      petals.forEach((_, i) => {
        target.copy(colourOf(shown, i))
        now[i].lerp(target, kc)
      })
      paint()

      flower.rotation.x = -0.52 + lean.x * 0.35 + Math.sin(t * 0.45) * 0.04
      flower.rotation.y = 0.32 + lean.y * 0.55 + Math.sin(t * 0.3) * 0.08
      flower.position.y = Math.sin(t * 0.8) * 0.06

      ray.setFromCamera(ndc, camera)
      over = ndc.x < 2 && ray.intersectObject(spin, true).length > 0
      el.style.cursor = over && pick.current ? 'pointer' : ''
      swell += ((over ? 1.05 : 1) - swell) * kl
      flower.scale.setScalar(swell)

      renderer.render(scene, camera)
    }

    let raf = 0
    let running = false
    let slow = 0
    let tier = 0
    const loop = (time: number) => {
      if (time - last > 34) slow++
      else slow = Math.max(0, slow - 1)
      if (slow > 30 && tier === 0) {
        tier = 1
        renderer.setPixelRatio(1)
        resize()
      }
      draw(time)
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
      petals.forEach((p) => {
        p.face.dispose()
        p.rim.dispose()
      })
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
