import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { prefersReducedMotion } from '@/lib/gsap'

/* ============================================================================
   GLASS CUBE — real 3D, after the homepage's glass-cube PNG

   A rounded glass cube lit like a product shot: a dark studio with a few
   softbox strips, so its edges catch hard white highlights and the glass
   splits the light into rainbow fringes (dispersion), as in the PNG.

   The trick that makes it read as glass on a white page: the studio is in
   the scene twice. One copy lights it (the environment map, for
   reflections). The other is what the glass sees through itself: it is drawn
   only into three's transmission pass and skipped on screen, so the cube
   refracts a dark room with light strips while the page around it stays
   white.

   Motion: sways slowly on its own, leans toward the pointer, and the page
   scroll turns it. Renders only while on screen; one still frame
   for reduced motion. Loaded on its own (lazy), after the headline.

   Sparkle variant (shape="sparkle", used by the AI page): the same glass,
   studio and motion, cut as the four-point AI sparkle (✦), a thick slab with
   rounded edges and softened tips. It rocks rather than spins, so it never
   turns edge-on.
   ========================================================================== */

/** Draws a mesh into render targets (environment, transmission) but never to
 *  the screen. Three applies colorWrite/depthWrite after onBeforeRender, so
 *  flipping them here per draw is enough. */
function offscreenOnly(mesh: THREE.Mesh) {
  const mat = mesh.material as THREE.Material
  mesh.onBeforeRender = (renderer) => {
    const toTarget = renderer.getRenderTarget() !== null
    mat.colorWrite = toTarget
    mat.depthWrite = toTarget
  }
}

/** A dark room with softbox strips. Brightness above 1 is kept: the targets
 *  are half-float, so the strips read as light sources, not white paint. */
function studio(hidden: boolean) {
  const g = new THREE.Group()
  const add = (mesh: THREE.Mesh) => {
    if (hidden) offscreenOnly(mesh)
    g.add(mesh)
  }

  add(
    new THREE.Mesh(
      new THREE.BoxGeometry(24, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x1c1e24, side: THREE.BackSide }),
    ),
  )

  const strip = (w: number, h: number, hex: string, power: number, at: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(power), side: THREE.DoubleSide }),
    )
    m.position.set(...at)
    m.lookAt(0, 0, 0)
    add(m)
  }

  strip(10, 8, '#ffffff', 2.4, [0, 11, 1]) //       key, from above
  strip(1.4, 15, '#ffffff', 6, [-10.5, 0, 3]) //    hard strip, left
  strip(2.6, 15, '#ffffff', 3, [10.5, 1, -1]) //    softer strip, right
  strip(7, 5, '#ffffff', 1.1, [1, 3, 11]) //        fill behind the camera
  strip(12, 2.5, '#ffffff', 1.4, [0, -11, -3]) //   floor bounce
  // what the glass shows inside: a faint grey wash with strips over it, two
  // of them in palette
  strip(16, 16, '#b4b9c2', 0.16, [0, 0, -11.8])
  strip(0.3, 18, '#D1E7FF', 3.6, [-3.2, 0, -11.5])
  strip(0.5, 18, '#ffffff', 3, [1.6, 0, -11.5])
  strip(0.22, 18, '#FFC4F2', 2.6, [4.6, 0, -11.5])
  strip(0.18, 18, '#ffffff', 3.4, [-6.5, 0, -11.5])
  return g
}

/** The AI sparkle (✦), as a thick slab of glass with soft rounded edges, the
 *  way the cube is built: its rounded edges catch the studio's strips, and
 *  through the front you see its own far edges, which is what makes the cube
 *  read as solid glass rather than a dark tile. */
function sparkleGeometry() {
  const R = 1.08 // tip reach
  const C = 0.21 // the arms' curve control, near the centre: lower = slimmer arms
  const E = 0.045 // how much of each arm's curve gives way to a rounded tip
  const tips = [new THREE.Vector2(0, R), new THREE.Vector2(R, 0), new THREE.Vector2(0, -R), new THREE.Vector2(-R, 0)]
  const controls = [
    new THREE.Vector2(C, C),
    new THREE.Vector2(C, -C),
    new THREE.Vector2(-C, -C),
    new THREE.Vector2(-C, C),
  ]
  /* a point on, and the control of a piece of, the curve from tip i to tip i + 1 */
  const at = (i: number, t: number) => {
    const [p0, p1, p2] = [tips[i], controls[i], tips[(i + 1) % 4]]
    return p0
      .clone()
      .multiplyScalar((1 - t) ** 2)
      .add(p1.clone().multiplyScalar(2 * (1 - t) * t))
      .add(p2.clone().multiplyScalar(t * t))
  }
  const control = (i: number, t0: number, t1: number) => {
    const [p0, p1, p2] = [tips[i], controls[i], tips[(i + 1) % 4]]
    return p0
      .clone()
      .multiplyScalar((1 - t0) * (1 - t1))
      .add(p1.clone().multiplyScalar((1 - t0) * t1 + t0 * (1 - t1)))
      .add(p2.clone().multiplyScalar(t0 * t1))
  }
  /* each arm's curve stops just short of the tips; the tips themselves are
     small curves round the point, so the rounded edge has room to follow */
  const shape = new THREE.Shape()
  const start = at(0, E)
  shape.moveTo(start.x, start.y)
  for (let i = 0; i < 4; i++) {
    const c = control(i, E, 1 - E)
    const end = at(i, 1 - E)
    shape.quadraticCurveTo(c.x, c.y, end.x, end.y)
    const next = at((i + 1) % 4, E)
    const tip = tips[(i + 1) % 4]
    shape.quadraticCurveTo(tip.x, tip.y, next.x, next.y)
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize: 0.12,
    bevelSegments: 16,
    curveSegments: 64,
  })
  geometry.center()
  return geometry
}

export default function GlassCube3D({ coveredBy, shape = 'cube' }: { coveredBy?: string; shape?: 'cube' | 'sparkle' }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    /* The hero holds still while the next section slides over it, so the
       cube stays "on screen" long after anyone can see it. Once that
       section's top has passed the top of the screen, stop drawing. */
    const cover = coveredBy ? document.querySelector<HTMLElement>(coveredBy) : null
    const covered = () => !!cover && cover.getBoundingClientRect().top <= 0

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return // no WebGL: the hero simply has no cube
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
    camera.position.set(0, 0, 6.2)

    /* reflections come from one copy of the studio … */
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    envScene.add(studio(false))
    const env = pmrem.fromScene(envScene, 0.015).texture
    scene.environment = env

    /* … and what is seen through the glass from the other */
    scene.add(studio(true))

    const cube = new THREE.Mesh(
      shape === 'sparkle' ? sparkleGeometry() : new RoundedBoxGeometry(1.5, 1.5, 1.5, 10, 0.17),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.03,
        transmission: 1,
        thickness: 1.4,
        ior: 1.52,
        dispersion: 4,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 2,
        attenuationColor: new THREE.Color('#f0f4fa'),
        attenuationDistance: 4,
        side: THREE.DoubleSide, // the back faces show through, like solid glass
      }),
    )
    if (shape === 'sparkle') cube.scale.setScalar(0.84) // the star's tips reach further than the cube's corners
    scene.add(cube)

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(() => {
      resize()
      if (!running) draw(performance.now())
    })
    ro.observe(host)
    resize()

    /* pointer lean and scroll turn, both eased */
    const lean = { x: 0, y: 0 }
    const aim = { x: 0, y: 0 }
    let turn = 0
    const onPointer = (e: PointerEvent) => {
      aim.x = (e.clientY / window.innerHeight - 0.5) * 0.5
      aim.y = (e.clientX / window.innerWidth - 0.5) * 0.8
    }

    const t0 = performance.now()
    const draw = (now: number) => {
      const t = (now - t0) / 1000
      lean.x += (aim.x - lean.x) * 0.05
      lean.y += (aim.y - lean.y) * 0.05
      turn += (window.scrollY * 0.004 - turn) * 0.08
      /* sways around the three-quarter view rather than spinning through
         it: face-on, the glass reads as a dark box */
      if (shape === 'sparkle') {
        /* held at a three-quarter view, like the cube, so its thickness and
           rounded edges show; it rocks rather than spins, so the slab never
           turns edge-on */
        cube.rotation.x = 0.36 + lean.x * 0.6 + Math.sin(t * 0.6) * 0.05
        cube.rotation.y = -0.5 + Math.sin(t * 0.32) * 0.3 + lean.y * 0.6 + Math.sin(turn) * 0.3
        cube.rotation.z = 0.08 + Math.sin(t * 0.25) * 0.08
      } else {
        cube.rotation.x = 0.42 + lean.x + Math.sin(t * 0.6) * 0.05
        cube.rotation.y = -0.62 + Math.sin(t * 0.32) * 0.32 + lean.y + turn
      }
      cube.position.y = Math.sin(t * 0.9) * 0.07
      renderer.render(scene, camera)
    }

    /* Glass is two extra passes a frame. On a weak GPU that must never cost
       the page its smoothness: a run of slow frames drops the resolution,
       and a second run settles the cube on a still frame. */
    let frame = 0
    let running = false
    let last = 0
    let slow = 0
    let tier = 0
    let still = false
    const loop = (now: number) => {
      if (covered()) {
        running = false
        return
      }
      if (last && now - last > 34) slow++
      else slow = Math.max(0, slow - 1)
      last = now
      if (slow > 24) {
        slow = 0
        tier++
        if (tier === 1) {
          renderer.setPixelRatio(1)
          resize()
        } else {
          still = true
          running = false
          return
        }
      }
      draw(now)
      frame = requestAnimationFrame(loop)
    }

    const reduced = prefersReducedMotion()
    draw(t0)
    host.classList.add('is-ready')

    /* hold still until the headline's intro has played, so the two never
       compete for frames */
    let visible = false
    let waited = false
    const start = () => {
      if (reduced || still || running || !visible || !waited || covered()) return
      running = true
      last = 0
      frame = requestAnimationFrame(loop)
    }
    const hold = window.setTimeout(() => {
      waited = true
      start()
    }, 2000)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else if (running) {
        running = false
        cancelAnimationFrame(frame)
      }
    })
    io.observe(host)
    if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true })
    /* back up the page, the cover slides off: draw again */
    const onScroll = () => {
      if (!running) start()
    }
    if (cover) window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.clearTimeout(hold)
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      ro.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
      const dispose = (o: THREE.Object3D) =>
        o.traverse((n) => {
          if (n instanceof THREE.Mesh) {
            n.geometry.dispose()
            ;(n.material as THREE.Material).dispose()
          }
        })
      dispose(scene)
      dispose(envScene)
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [coveredBy, shape])

  return <div className="cx-hero__cube-gl" ref={ref} />
}
