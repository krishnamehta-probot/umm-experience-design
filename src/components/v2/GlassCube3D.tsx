import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { prefersReducedMotion } from '@/lib/gsap'
import { studio } from './glassStudio'

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

   Fintech's options (2 Nov, HouseHero): a bank card with its chip cut
   through, a shield with a tick cut through, and a coin with a raised rim.
   ========================================================================== */

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

/** The Cloud & Data page's object: a cloud, as a slab of glass. Its outline
 *  is the union of three puffs on a flat base, traced round from the middle
 *  and lightly smoothed so the notches between the puffs read as soft folds
 *  rather than cuts, then extruded with the sparkle's rounded edge. */
function cloudGeometry() {
  const puffs: [number, number, number][] = [
    [-0.74, -0.16, 0.28],
    [-0.3, 0.08, 0.4],
    [0.22, 0.18, 0.44],
    [0.74, -0.12, 0.32],
  ]
  const BASE = -0.44
  const inside = (x: number, y: number) =>
    puffs.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r) ||
    (x >= -0.74 && x <= 0.74 && y >= BASE && y <= -0.12)
  /* how far the outline is from the middle, all the way round */
  const N = 480
  const ox = 0
  const oy = -0.12
  const reach = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2
    let r = 0
    while (r < 2 && inside(ox + Math.cos(a) * (r + 0.004), oy + Math.sin(a) * (r + 0.004))) r += 0.004
    return r
  })
  const soft = reach.map((_, i) => {
    let sum = 0
    for (let k = -3; k <= 3; k++) sum += reach[(i + k + N) % N]
    return sum / 7
  })
  const pts = soft.map((r, i) => {
    const a = (i / N) * Math.PI * 2
    return new THREE.Vector2(ox + Math.cos(a) * r, oy + Math.sin(a) * r)
  })
  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize: 0.1,
    bevelSegments: 16,
    curveSegments: 64,
  })
  geometry.center()
  return geometry
}

/** The Digital Engineering page's object: a gear, as a slab of glass, its
 *  eight teeth rounded off and a hole through the middle. */
function gearGeometry() {
  const TEETH = 8
  const OUTER = 1
  const ROOT = 0.78
  const N = 640
  const pts = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2
    /* a rounded square wave round the rim: flat-topped teeth, soft flanks */
    const w = Math.cos(a * TEETH)
    const k = Math.min(1, Math.max(0, (w + 0.15) * 1.9))
    const tooth = k * k * (3 - 2 * k)
    const r = ROOT + (OUTER - ROOT) * tooth
    return new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r)
  })
  const shape = new THREE.Shape(pts)
  const hole = new THREE.Path()
  hole.absarc(0, 0, 0.32, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.06,
    bevelSegments: 12,
    curveSegments: 48,
  })
  geometry.center()
  return geometry
}

/** The Integrated Growth page's object: an arrow rising to the right, as a
 *  slab of glass with the sparkle's rounded edge. */
function arrowGeometry() {
  const outline: [number, number][] = [
    [0, 1.05],
    [0.78, 0.2],
    [0.3, 0.2],
    [0.3, -1.0],
    [-0.3, -1.0],
    [-0.3, 0.2],
    [-0.78, 0.2],
  ]
  /* turned to point up and to the right */
  const turn = -Math.PI / 4
  const pts = outline.map(
    ([x, y]) => new THREE.Vector2(x * Math.cos(turn) - y * Math.sin(turn), x * Math.sin(turn) + y * Math.cos(turn)),
  )
  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.12,
    bevelSegments: 16,
    curveSegments: 32,
  })
  geometry.center()
  return geometry
}

/** The UX & Digital Commerce page's object: a shopping bag, as a slab of
 *  glass: a rounded body with its handle arching over the top, the handle's
 *  opening cut through. */
function bagGeometry() {
  const W = 0.74
  const TOP = 0.42
  const BOT = -0.82
  const R = 0.14
  const H_OUT = 0.44
  const H_IN = 0.28
  const shape = new THREE.Shape()
  shape.moveTo(-W + R, BOT)
  shape.lineTo(W - R, BOT)
  shape.quadraticCurveTo(W, BOT, W, BOT + R)
  shape.lineTo(W, TOP - R)
  shape.quadraticCurveTo(W, TOP, W - R, TOP)
  shape.lineTo(H_OUT, TOP)
  shape.absarc(0, TOP, H_OUT, 0, Math.PI, false)
  shape.lineTo(-W + R, TOP)
  shape.quadraticCurveTo(-W, TOP, -W, TOP - R)
  shape.lineTo(-W, BOT + R)
  shape.quadraticCurveTo(-W, BOT, -W + R, BOT)
  const hole = new THREE.Path()
  hole.moveTo(H_IN, TOP + 0.02)
  hole.absarc(0, TOP + 0.02, H_IN, 0, Math.PI, false)
  hole.lineTo(H_IN, TOP + 0.02)
  shape.holes.push(hole)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.08,
    bevelSegments: 14,
    curveSegments: 48,
  })
  geometry.center()
  return geometry
}

/** The outline of a stroke along `pts`, `w` either side, mitred at the joins. */
function stroke(pts: [number, number][], w: number) {
  const v = pts.map(([x, y]) => new THREE.Vector2(x, y))
  const left: THREE.Vector2[] = []
  const right: THREE.Vector2[] = []
  v.forEach((p, i) => {
    const prev = i > 0 ? p.clone().sub(v[i - 1]).normalize() : null
    const next = i < v.length - 1 ? v[i + 1].clone().sub(p).normalize() : null
    const d = prev && next ? prev.clone().add(next).normalize() : (prev ?? next)!
    const n = new THREE.Vector2(-d.y, d.x)
    const k = prev && next ? w / n.dot(new THREE.Vector2(-prev.y, prev.x)) : w
    left.push(p.clone().addScaledVector(n, k))
    right.push(p.clone().addScaledVector(n, -k))
  })
  return [...left, ...right.reverse()]
}

/** Fintech, option A: a bank card, as a slab of glass, its chip cut through. */
function cardGeometry() {
  const W = 0.98
  const H = 0.62
  const R = 0.11
  const shape = new THREE.Shape()
  shape.moveTo(-W + R, -H)
  shape.lineTo(W - R, -H)
  shape.quadraticCurveTo(W, -H, W, -H + R)
  shape.lineTo(W, H - R)
  shape.quadraticCurveTo(W, H, W - R, H)
  shape.lineTo(-W + R, H)
  shape.quadraticCurveTo(-W, H, -W, H - R)
  shape.lineTo(-W, -H + R)
  shape.quadraticCurveTo(-W, -H, -W + R, -H)
  const chip = new THREE.Path()
  const [cx, cy, cw, ch, cr] = [-0.56, 0.06, 0.17, 0.13, 0.04]
  chip.moveTo(cx - cw + cr, cy - ch)
  chip.lineTo(cx + cw - cr, cy - ch)
  chip.quadraticCurveTo(cx + cw, cy - ch, cx + cw, cy - ch + cr)
  chip.lineTo(cx + cw, cy + ch - cr)
  chip.quadraticCurveTo(cx + cw, cy + ch, cx + cw - cr, cy + ch)
  chip.lineTo(cx - cw + cr, cy + ch)
  chip.quadraticCurveTo(cx - cw, cy + ch, cx - cw, cy + ch - cr)
  chip.lineTo(cx - cw, cy - ch + cr)
  chip.quadraticCurveTo(cx - cw, cy - ch, cx - cw + cr, cy - ch)
  shape.holes.push(chip)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.06,
    bevelSegments: 14,
    curveSegments: 32,
  })
  geometry.center()
  return geometry
}

/** Fintech, option B: a shield, as a slab of glass, a tick cut through it. */
function shieldGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.98)
  shape.quadraticCurveTo(0.42, 0.78, 0.82, 0.8)
  shape.quadraticCurveTo(0.86, 0.2, 0.7, -0.24)
  shape.quadraticCurveTo(0.46, -0.78, 0, -1.02)
  shape.quadraticCurveTo(-0.46, -0.78, -0.7, -0.24)
  shape.quadraticCurveTo(-0.86, 0.2, -0.82, 0.8)
  shape.quadraticCurveTo(-0.42, 0.78, 0, 0.98)
  shape.holes.push(
    new THREE.Path(
      stroke(
        [
          [-0.34, 0.04],
          [-0.08, -0.22],
          [0.38, 0.3],
        ],
        0.085,
      ),
    ),
  )
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.1,
    bevelSegments: 16,
    curveSegments: 48,
  })
  geometry.center()
  return geometry
}

/** Fintech, option C: a coin, turned on a lathe: a raised rim round a
 *  shallow face, the same on both sides. */
function coinGeometry() {
  const half: [number, number][] = [
    [0, 0.1],
    [0.7, 0.1],
    [0.76, 0.17],
    [0.92, 0.18],
    [0.99, 0.12],
    [1.0, 0],
  ]
  const profile = [...half, ...half.slice(0, -1).reverse().map(([r, y]) => [r, -y] as [number, number])].map(
    ([r, y]) => new THREE.Vector2(r, y),
  )
  const geometry = new THREE.LatheGeometry(profile, 128)
  geometry.rotateX(Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

export type GlassShape = 'cube' | 'sparkle' | 'cloud' | 'gear' | 'arrow' | 'bag' | 'card' | 'shield' | 'coin'

export default function GlassCube3D({ coveredBy, shape = 'cube' }: { coveredBy?: string; shape?: GlassShape }) {
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
      shape === 'sparkle'
        ? sparkleGeometry()
        : shape === 'cloud'
          ? cloudGeometry()
          : shape === 'gear'
            ? gearGeometry()
            : shape === 'arrow'
              ? arrowGeometry()
              : shape === 'bag'
                ? bagGeometry()
                : shape === 'card'
                  ? cardGeometry()
                  : shape === 'shield'
                    ? shieldGeometry()
                    : shape === 'coin'
                      ? coinGeometry()
                      : new RoundedBoxGeometry(1.5, 1.5, 1.5, 10, 0.17),
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
    if (shape === 'cloud') cube.scale.setScalar(0.86)
    if (shape === 'gear') cube.scale.setScalar(0.9)
    if (shape === 'arrow') cube.scale.setScalar(0.88)
    if (shape === 'bag') cube.scale.setScalar(0.92)
    if (shape === 'card') cube.scale.setScalar(0.94)
    if (shape === 'shield') cube.scale.setScalar(0.88)
    if (shape === 'coin') cube.scale.setScalar(0.9)
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
      if (shape !== 'cube') {
        /* held at a three-quarter view, like the cube, so its thickness and
           rounded edges show; it rocks rather than spins, so the slab never
           turns edge-on */
        /* the flat ones (card, coin) turn further, or they read as a dark disc */
        const [bx, by] = shape === 'coin' ? [0.32, -0.95] : shape === 'card' ? [0.55, -0.62] : [0.36, -0.5]
        cube.rotation.x = bx + lean.x * 0.6 + Math.sin(t * 0.6) * 0.05
        cube.rotation.y = by + Math.sin(t * 0.32) * 0.3 + lean.y * 0.6 + Math.sin(turn) * 0.3
        /* the gear turns slowly on its axle, as a gear does */
        cube.rotation.z = shape === 'gear' ? -t * 0.18 : 0.08 + Math.sin(t * 0.25) * 0.08
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
