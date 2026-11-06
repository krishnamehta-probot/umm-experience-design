import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/* ============================================================================
   THE HERO'S 3D ELEMENTS (Krish, 6 Nov: "keep it more like what i had
   given… he likes such elements… its okay for those elements to not have
   the pastel colors. these are elements and icons are different")

   His references: glossy, translucent, saturated blue 3D renders on a flat
   studio grey or on black. One canvas holds several and shows one at a
   time; the hero's sector pills choose it ("all three pills its kind of
   elements"), and the next grows in, turning, as the last shrinks away:

     flower  Banking. Eight elliptical discs fanned round a centre, each
             tilted along its length so it lies over the next (his
             reference, nearly as given)
     coins   Payments. A row of glossy coins seen at an angle, a wave
             running along them as money moves; each flips in turn when
             the row arrives
     shield  Insurance. A puffed glass shield with a white check on it,
             swaying; it turns once when it arrives
     layers  three plates of blue glass stacked in the air, lit from within,
             before a blue glow (kept as an option for a dark tile)

   and for the reality section, one for each of the three pressures:

     fragments  Fragmented journeys. Six glossy pieces (a sphere, a cube, a
                coin, a capsule, a ring, a bar) floating round an empty
                centre, drifting apart and back, never joining
     papers     Time lost in operations. A fan of documents, the front one
                lined with white text bars, the fan opening and closing as
                if being sorted through
     bars       Growth with accountability. Four rounded bars rising in
                steps from a base, a white check above the tallest; they
                grow in turn when they arrive

   Faces run deep blue to light cyan and are a little translucent; rims a
   deeper blue; all clear-coated. Or, as `finish="glass"` (Krish, 6 Nov:
   "whatever is made in blue can you make it in glass format"), clear glass
   tinted pale blue, refracting soft pastel light painted on the ground
   behind it, with a little dispersion and iridescence at the edges. Everything leans after the pointer and
   swells a little under it; a click on the element calls `onPick`.

   The canvas is opaque in the tile's own ground, so the glass refracts what
   is really behind it. Draws only while on screen; one still frame for
   reduced motion; a run of slow frames drops the resolution.
   ========================================================================== */

export type ElementKind = 'flower' | 'coins' | 'shield' | 'layers' | 'fragments' | 'papers' | 'bars'

export type Finish = 'blue' | 'glass'

const BLUE = {
  deep: '#0832c8',
  mid: '#1658f2',
  light: '#62c4ff',
  rim: '#0a3be0',
}

/* glass: the tint runs a pale blue to clear (it multiplies what shows through,
   so it has to stay pale or the glass reads as solid blue) */
const GLASS = {
  deep: '#c2d6ff',
  mid: '#e0ebff',
  light: '#ffffff',
}

/* the finish of the elements being built; set by the canvas just before it
   builds them (building is synchronous), read by the shared look below */
let look: Finish = 'blue'

type Frame = { t: number; dt: number; boost: number; over: number }

type Built = {
  root: THREE.Group
  /** the element's size across, in world units, for framing */
  size: number
  update: (f: Frame) => void
  dispose: () => void
}

/* --- the shared look ------------------------------------------------------------- */

/** paints a geometry deep → mid → light blue by `at` (0–1) per vertex */
function gradient(geo: THREE.BufferGeometry, at: (x: number, y: number, z: number) => number) {
  const ramp = look === 'glass' ? GLASS : BLUE
  const deep = new THREE.Color(ramp.deep)
  const mid = new THREE.Color(ramp.mid)
  const light = new THREE.Color(ramp.light)
  const c = new THREE.Color()
  const pos = geo.getAttribute('position')
  const col = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, at(pos.getX(i), pos.getY(i), pos.getZ(i))))
    if (t < 0.55) c.copy(deep).lerp(mid, t / 0.55)
    else c.copy(mid).lerp(light, (t - 0.55) / 0.45)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
}

/** clear glass, tinted by the vertex colours (or `tint`); double-sided so
 *  pieces behind one another still show through each other */
const glassMaterial = (tint?: string) =>
  new THREE.MeshPhysicalMaterial({
    vertexColors: !tint,
    color: tint ?? '#ffffff',
    roughness: 0.04,
    metalness: 0,
    transmission: 1,
    thickness: 0.7,
    ior: 1.46,
    dispersion: 2,
    attenuationColor: new THREE.Color('#a8c4ff'),
    attenuationDistance: 3,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 0.35,
    iridescenceIOR: 1.28,
    iridescenceThicknessRange: [120, 360],
    specularIntensity: 1,
    envMapIntensity: 1.7,
    side: THREE.DoubleSide,
  })

const faceMaterial = () =>
  look === 'glass'
    ? glassMaterial()
    : new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.16,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    transmission: 0.2,
    thickness: 0.35,
    ior: 1.42,
    attenuationColor: new THREE.Color(BLUE.deep),
    attenuationDistance: 1.4,
    iridescence: 0.12,
    iridescenceIOR: 1.3,
    envMapIntensity: 1.2,
  })

const rimMaterial = () =>
  look === 'glass'
    ? glassMaterial('#dce8ff')
    : new THREE.MeshPhysicalMaterial({
    color: BLUE.rim,
    roughness: 0.12,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.4,
  })

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

/* --- Banking: the flower -------------------------------------------------------------- */

function buildFlower(): Built {
  const ellipse = new THREE.Shape()
  ellipse.absellipse(0, 0, 1.02, 0.58, 0, Math.PI * 2, false, 0)
  const geo = new THREE.ExtrudeGeometry(ellipse, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 8,
    curveSegments: 80,
  })
  geo.center()
  geo.translate(1.0, 0, 0)
  gradient(geo, (x) => x / 2.1)
  const face = faceMaterial()
  const rim = rimMaterial()

  const root = new THREE.Group()
  const spin = new THREE.Group()
  root.add(spin)
  for (let i = 0; i < 8; i++) {
    const mesh = new THREE.Mesh(geo, [face, rim])
    mesh.castShadow = true
    mesh.rotation.set(0.62, -0.1, 0)
    const pivot = new THREE.Group()
    pivot.rotation.z = (i / 8) * Math.PI * 2
    pivot.position.z = i * 0.012
    pivot.add(mesh)
    spin.add(pivot)
  }

  let angle = 0
  return {
    root,
    size: 4.3,
    update: ({ t, dt, boost, over }) => {
      angle -= (0.2 + boost * 2.4) * dt
      spin.rotation.z = angle
      root.userData.tilt = { x: -0.46 + Math.sin(t * 0.45) * 0.04, y: 0.3 + Math.sin(t * 0.3) * 0.08 }
      root.userData.bob = Math.sin(t * 0.8) * 0.06
      root.userData.swell = 1 + over * 0.05
    },
    dispose: () => {
      geo.dispose()
      face.dispose()
      rim.dispose()
    },
  }
}

/* --- Payments: the coins ---------------------------------------------------------------- */

function buildCoins(): Built {
  const circle = new THREE.Shape()
  circle.absarc(0, 0, 0.62, 0, Math.PI * 2, false)
  const geo = new THREE.ExtrudeGeometry(circle, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.07,
    bevelSegments: 8,
    curveSegments: 72,
  })
  geo.center()
  gradient(geo, (x, y) => (x + y) / 2.4 + 0.5)
  const face = faceMaterial()
  const rim = rimMaterial()

  const root = new THREE.Group()
  const N = 7
  const coins = Array.from({ length: N }, (_, i) => {
    const mesh = new THREE.Mesh(geo, [face, rim])
    mesh.castShadow = true
    mesh.position.set(-1.95 + i * 0.65, (i - 3) * 0.13, 0)
    root.add(mesh)
    return mesh
  })

  return {
    root,
    size: 5,
    update: ({ t, boost, over }) => {
      /* a wave runs along the row; as the row arrives each coin flips once,
         one after another */
      coins.forEach((m, i) => {
        const w = Math.sin(t * 2.2 - i * 0.75)
        m.position.y = (i - 3) * 0.13 + w * 0.2
        m.position.z = -Math.abs(i - 3) * 0.12
        const flip = Math.PI * 2 * ease((1 - boost) * 1.7 - i * 0.1)
        m.rotation.set(0.14, 0.72 + flip, Math.sin(t * 2.2 - i * 0.75 - 0.6) * 0.22)
      })
      root.userData.tilt = { x: -0.12 + Math.sin(t * 0.4) * 0.03, y: 0.22 + Math.sin(t * 0.3) * 0.1 }
      root.userData.bob = Math.sin(t * 0.8) * 0.05
      root.userData.swell = 1 + over * 0.04
    },
    dispose: () => {
      geo.dispose()
      face.dispose()
      rim.dispose()
    },
  }
}

/* --- Insurance: the shield ------------------------------------------------------------ */

function buildShield(): Built {
  const s = new THREE.Shape()
  s.moveTo(0, 1.5)
  s.bezierCurveTo(0.55, 1.24, 0.95, 1.2, 1.3, 1.2)
  s.lineTo(1.3, 0.2)
  s.bezierCurveTo(1.3, -0.75, 0.55, -1.25, 0, -1.55)
  s.bezierCurveTo(-0.55, -1.25, -1.3, -0.75, -1.3, 0.2)
  s.lineTo(-1.3, 1.2)
  s.bezierCurveTo(-0.95, 1.2, -0.55, 1.24, 0, 1.5)
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.14,
    bevelSegments: 10,
    curveSegments: 48,
  })
  geo.center()
  gradient(geo, (_x, y) => (y + 1.7) / 3.4)
  const face = faceMaterial()
  const rim = rimMaterial()
  const shield = new THREE.Mesh(geo, [face, rim])
  shield.castShadow = true

  /* the check, a white glossy tube with round ends */
  const a = new THREE.Vector3(-0.62, 0.02, 0)
  const b = new THREE.Vector3(-0.15, -0.46, 0)
  const c = new THREE.Vector3(0.7, 0.52, 0)
  const path = new THREE.CurvePath<THREE.Vector3>()
  path.add(new THREE.LineCurve3(a, b))
  path.add(new THREE.LineCurve3(b, c))
  const tube = new THREE.TubeGeometry(path, 64, 0.14, 20, false)
  const cap = new THREE.SphereGeometry(0.14, 24, 16)
  const white = new THREE.MeshPhysicalMaterial({
    color: '#eef6ff',
    roughness: 0.14,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.2,
  })
  const check = new THREE.Group()
  check.add(new THREE.Mesh(tube, white))
  for (const p of [a, b, c]) {
    const m = new THREE.Mesh(cap, white)
    m.position.copy(p)
    check.add(m)
  }
  check.position.z = 0.4
  check.traverse((o) => (o.castShadow = true))

  const root = new THREE.Group()
  const turn = new THREE.Group()
  turn.add(shield, check)
  root.add(turn)

  return {
    root,
    size: 3.7,
    update: ({ t, boost, over }) => {
      turn.rotation.y = Math.sin(t * 0.55) * 0.42 + Math.PI * 2 * ease(1 - boost)
      root.userData.tilt = { x: -0.1 + Math.sin(t * 0.4) * 0.04, y: 0 }
      root.userData.bob = Math.sin(t * 0.8) * 0.07
      root.userData.swell = 1 + over * 0.05
    },
    dispose: () => {
      geo.dispose()
      tube.dispose()
      cap.dispose()
      face.dispose()
      rim.dispose()
      white.dispose()
    },
  }
}

/* --- the ground behind glass ---------------------------------------------------------- */

/** the tile's ground with soft pastel light round where the element sits, for
 *  the glass to bend (a flat ground through clear glass reads as nothing) */
function paintGround(cv: HTMLCanvasElement, ground: string, at: [number, number], aspect: number) {
  const h = 256
  const w = Math.max(64, Math.round(h * aspect))
  cv.width = w
  cv.height = h
  const g = cv.getContext('2d')!
  g.fillStyle = ground
  g.fillRect(0, 0, w, h)
  const x = at[0] * w
  const y = at[1] * h
  const r = h * 0.62
  const blob = (dx: number, dy: number, rr: number, hex: string, a: number) => {
    const grad = g.createRadialGradient(x + dx * r, y + dy * r, 0, x + dx * r, y + dy * r, rr * r)
    const c = new THREE.Color(hex)
    const rgb = `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}`
    grad.addColorStop(0, `rgba(${rgb}, ${a})`)
    grad.addColorStop(1, `rgba(${rgb}, 0)`)
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
  }
  blob(-0.18, -0.12, 0.8, '#a9d0ff', 0.75)
  blob(0.26, 0.1, 0.62, '#d7c8ff', 0.6)
  blob(-0.05, 0.3, 0.46, '#ffd3e2', 0.45)
  blob(0.12, -0.3, 0.4, '#fff1b8', 0.35)
}

/* --- the layers, on a dark tile (an option) --------------------------------------------- */

function glowTexture() {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 256
  const g = cv.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, '#1f4fd8')
  grad.addColorStop(0.35, '#0e2370')
  grad.addColorStop(0.7, '#0b0d1c')
  grad.addColorStop(1, '#0b0a10')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function buildLayers(): Built {
  const geo = new RoundedBoxGeometry(2.3, 0.16, 2.3, 6, 0.14)
  const tones = [BLUE.deep, BLUE.mid, '#4aa8ff']
  const mats = tones.map(
    (hex) =>
      new THREE.MeshPhysicalMaterial({
        color: hex,
        roughness: 0.1,
        metalness: 0,
        transmission: 0.6,
        thickness: 0.6,
        ior: 1.45,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        emissive: hex,
        emissiveIntensity: 0.3,
        attenuationColor: new THREE.Color(hex),
        attenuationDistance: 0.9,
        envMapIntensity: 1.3,
      }),
  )
  const root = new THREE.Group()
  const stack = new THREE.Group()
  stack.rotation.x = 0.62
  root.add(stack)
  const plates = mats.map((m) => {
    const mesh = new THREE.Mesh(geo, m)
    stack.add(mesh)
    return mesh
  })
  stack.add(new THREE.PointLight('#3d7bff', 7, 7, 1.6))
  const tex = glowTexture()
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: tex }))
  glow.position.z = -3
  glow.userData.backdrop = true
  root.add(glow)

  let turn = 0
  let gap = 0.62
  return {
    root,
    size: 3.7,
    update: ({ t, dt, boost, over }) => {
      turn += (0.16 + boost * 1.6) * dt
      stack.rotation.y = Math.PI / 4 + Math.sin(turn) * 0.35
      const want = 0.62 + Math.sin(t * 0.9) * 0.05 + over * 0.2 + boost * 0.5
      gap += (want - gap) * Math.min(1, dt * 5)
      plates.forEach((p, i) => (p.position.y = (i - 1) * gap))
      root.userData.tilt = { x: Math.sin(t * 0.4) * 0.03, y: Math.sin(t * 0.25) * 0.05 }
      root.userData.bob = Math.sin(t * 0.7) * 0.05
      root.userData.swell = 1 + over * 0.03
    },
    dispose: () => {
      geo.dispose()
      mats.forEach((m) => m.dispose())
      tex.dispose()
      glow.geometry.dispose()
      ;(glow.material as THREE.Material).dispose()
    },
  }
}

/* --- the reality: fragments, papers, bars ---------------------------------------------- */

const whiteMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#eef6ff',
    roughness: 0.14,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.2,
  })

/** a white glossy check with round ends */
function makeCheck(white: THREE.Material) {
  const a = new THREE.Vector3(-0.62, 0.02, 0)
  const b = new THREE.Vector3(-0.15, -0.46, 0)
  const c = new THREE.Vector3(0.7, 0.52, 0)
  const path = new THREE.CurvePath<THREE.Vector3>()
  path.add(new THREE.LineCurve3(a, b))
  path.add(new THREE.LineCurve3(b, c))
  const tube = new THREE.TubeGeometry(path, 64, 0.14, 20, false)
  const cap = new THREE.SphereGeometry(0.14, 24, 16)
  const group = new THREE.Group()
  group.add(new THREE.Mesh(tube, white))
  for (const p of [a, b, c]) {
    const m = new THREE.Mesh(cap, white)
    m.position.copy(p)
    group.add(m)
  }
  group.traverse((o) => (o.castShadow = true))
  return {
    group,
    dispose: () => {
      tube.dispose()
      cap.dispose()
    },
  }
}

function buildFragments(): Built {
  const disc = new THREE.Shape()
  disc.absarc(0, 0, 0.5, 0, Math.PI * 2, false)
  const coin = new THREE.ExtrudeGeometry(disc, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.07,
    bevelSegments: 8,
    curveSegments: 64,
  })
  coin.center()
  const geos: THREE.BufferGeometry[] = [
    new THREE.SphereGeometry(0.5, 48, 32),
    new RoundedBoxGeometry(0.82, 0.82, 0.82, 6, 0.16),
    coin,
    new THREE.CapsuleGeometry(0.27, 0.7, 12, 32),
    new THREE.TorusGeometry(0.42, 0.16, 32, 72),
    new RoundedBoxGeometry(1.1, 0.34, 0.34, 6, 0.15),
  ]
  geos.forEach((g) => gradient(g, (x, y) => (y + x * 0.4 + 0.7) / 1.4))
  const mat = faceMaterial()
  const root = new THREE.Group()
  /* where each sits round the empty centre, and how fast it turns */
  const home = [
    [-1.35, 0.75, 0.2],
    [0.25, 1.35, -0.3],
    [1.45, 0.45, 0.25],
    [1.05, -1.05, -0.2],
    [-0.35, -1.35, 0.3],
    [-1.55, -0.5, -0.25],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z))
  const spin = [
    [0.3, 0.5, 0.1],
    [0.5, 0.3, 0.2],
    [0.2, 0.6, 0.3],
    [0.6, 0.2, 0.4],
    [0.4, 0.4, 0.1],
    [0.2, 0.3, 0.5],
  ]
  const pieces = geos.map((g, i) => {
    const m = new THREE.Mesh(g, mat)
    m.castShadow = true
    m.rotation.set(i * 0.7, i * 1.1, i * 0.4)
    root.add(m)
    return m
  })
  return {
    root,
    size: 4.2,
    update: ({ t, dt, boost, over }) => {
      /* they drift apart and back, and never meet */
      const apart = 1 + 0.16 * Math.sin(t * 0.6) + boost * 0.9 + over * 0.12
      pieces.forEach((m, i) => {
        const h = home[i]
        m.position.set(h.x * apart, h.y * apart + Math.sin(t * 1.1 + i * 1.3) * 0.08, h.z)
        m.rotation.x += spin[i][0] * dt
        m.rotation.y += spin[i][1] * dt
        m.rotation.z += spin[i][2] * dt
      })
      root.userData.tilt = { x: -0.1 + Math.sin(t * 0.4) * 0.04, y: 0.2 + Math.sin(t * 0.3) * 0.1 }
      root.userData.bob = Math.sin(t * 0.7) * 0.05
      root.userData.swell = 1
    },
    dispose: () => {
      geos.forEach((g) => g.dispose())
      mat.dispose()
    },
  }
}

function buildPapers(): Built {
  const geo = new RoundedBoxGeometry(1.7, 2.2, 0.07, 4, 0.06)
  gradient(geo, (x, y) => ((y + 1.1) / 2.2) * 0.65 + ((x + 0.85) / 1.7) * 0.35)
  const N = 5
  const mats = Array.from({ length: N }, (_, i) => {
    const m = faceMaterial()
    m.color.setScalar(0.78 + i * 0.055)
    return m
  })
  const white = whiteMaterial()
  const line = new RoundedBoxGeometry(1, 0.1, 0.04, 2, 0.045)
  const dot = new THREE.SphereGeometry(0.16, 24, 16)
  const root = new THREE.Group()
  const fan = new THREE.Group()
  fan.position.y = -1.05
  root.add(fan)
  const pivots = mats.map((m, i) => {
    const pivot = new THREE.Group()
    const paper = new THREE.Mesh(geo, m)
    paper.castShadow = true
    paper.position.y = 1.1
    pivot.add(paper)
    pivot.position.z = i * 0.08
    fan.add(pivot)
    /* the front one carries its text: a mark and four lines */
    if (i === N - 1) {
      ;[1.1, 0.8, 1.2, 0.6].forEach((w, k) => {
        const bar = new THREE.Mesh(line, white)
        bar.scale.x = w
        bar.position.set(-0.62 + w / 2, 0.45 - k * 0.3, 0.06)
        paper.add(bar)
      })
      const mark = new THREE.Mesh(dot, white)
      mark.position.set(0.5, 0.72, 0.08)
      paper.add(mark)
    }
    return pivot
  })
  return {
    root,
    size: 3.9,
    update: ({ t, boost, over }) => {
      /* the fan opens and closes, as if being sorted through */
      const spread = 0.17 + 0.07 * Math.sin(t * 0.7) + boost * 0.35 + over * 0.08
      pivots.forEach((pivot, i) => {
        pivot.rotation.z = (i - (N - 1) / 2) * -spread
        pivot.position.y = i === N - 1 ? 0.08 + Math.sin(t * 1.3) * 0.06 : 0
      })
      root.userData.tilt = { x: -0.12 + Math.sin(t * 0.4) * 0.03, y: 0.32 + Math.sin(t * 0.3) * 0.12 }
      root.userData.bob = Math.sin(t * 0.8) * 0.05
      root.userData.swell = 1
    },
    dispose: () => {
      geo.dispose()
      line.dispose()
      dot.dispose()
      mats.forEach((m) => m.dispose())
      white.dispose()
    },
  }
}

function buildBars(): Built {
  const heights = [0.95, 1.5, 2.1, 2.75]
  const mat = faceMaterial()
  const geos = heights.map((h) => {
    const g = new RoundedBoxGeometry(0.62, h, 0.62, 6, 0.16)
    g.translate(0, h / 2, 0)
    gradient(g, (_x, y) => y / 2.9)
    return g
  })
  const baseGeo = new RoundedBoxGeometry(3.7, 0.2, 1.35, 6, 0.1)
  gradient(baseGeo, () => 0.85)
  const baseMat = faceMaterial()
  const white = whiteMaterial()
  const check = makeCheck(white)

  const root = new THREE.Group()
  const body = new THREE.Group()
  body.position.y = -1.55
  root.add(body)
  const base = new THREE.Mesh(baseGeo, baseMat)
  base.position.y = -0.1
  base.castShadow = true
  body.add(base)
  const bars = geos.map((g, i) => {
    const m = new THREE.Mesh(g, mat)
    m.castShadow = true
    m.position.set(-1.2 + i * 0.8, 0, 0)
    body.add(m)
    return m
  })
  check.group.scale.setScalar(0.62)
  body.add(check.group)

  return {
    root,
    size: 4.1,
    update: ({ t, boost, over }) => {
      /* they grow in turn as they arrive, then breathe */
      bars.forEach((m, i) => {
        const g = ease((1 - boost) * 1.8 - i * 0.18)
        m.scale.y = 0.12 + 0.88 * g + Math.sin(t * 1.2 - i * 0.6) * 0.025 + over * 0.04
      })
      const top = heights[3] * bars[3].scale.y
      check.group.position.set(1.2, top + 0.55 + Math.sin(t * 1.4) * 0.07, 0.1)
      check.group.rotation.y = Math.sin(t * 0.8) * 0.35
      root.userData.tilt = { x: -0.22 + Math.sin(t * 0.4) * 0.03, y: 0.5 + Math.sin(t * 0.3) * 0.16 }
      root.userData.bob = Math.sin(t * 0.8) * 0.04
      root.userData.swell = 1
    },
    dispose: () => {
      geos.forEach((g) => g.dispose())
      baseGeo.dispose()
      mat.dispose()
      baseMat.dispose()
      white.dispose()
      check.dispose()
    },
  }
}

const BUILD: Record<ElementKind, () => Built> = {
  flower: buildFlower,
  coins: buildCoins,
  shield: buildShield,
  layers: buildLayers,
  fragments: buildFragments,
  papers: buildPapers,
  bars: buildBars,
}

/* --- the canvas --------------------------------------------------------------------------- */

export default function Element3D({
  kinds,
  active = 0,
  ground,
  at = [0.5, 0.5],
  shadow = false,
  finish = 'blue',
  onPick,
}: {
  /** the elements this canvas holds */
  kinds: ElementKind[]
  /** which of them is shown */
  active?: number
  /** the tile's ground colour, painted behind the elements */
  ground: string
  /** where the element's centre sits in the tile (0–1 across, 0–1 down) */
  at?: [number, number]
  /** a soft shadow on an unseen floor (for a light ground) */
  shadow?: boolean
  /** saturated glossy blue, or clear glass before soft pastel light */
  finish?: Finish
  onPick?: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const want = useRef(active)
  want.current = active
  const pick = useRef(onPick)
  pick.current = onPick
  const list = kinds.join(',')

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      return
    }
    const dark = new THREE.Color(ground).getHSL({ h: 0, s: 0, l: 0 }).l < 0.3
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = dark ? 1.1 : 1
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = shadow
    renderer.shadowMap.type = THREE.VSMShadowMap
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const glass = finish === 'glass'
    const groundCanvas = glass ? document.createElement('canvas') : null
    const groundTex = groundCanvas ? new THREE.CanvasTexture(groundCanvas) : null
    if (groundTex) groundTex.colorSpace = THREE.SRGBColorSpace
    scene.background = groundTex ?? new THREE.Color(ground)
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04).texture
    scene.environment = env

    const key = new THREE.DirectionalLight(0xffffff, dark ? 0.8 : 1.4)
    key.position.set(2, 8, 5)
    scene.add(key)

    const names = list.split(',') as ElementKind[]
    look = finish
    const built = names.map((k) => BUILD[k]())
    look = 'blue'
    const holder = new THREE.Group()
    built.forEach((b) => holder.add(b.root))
    scene.add(holder)
    const S = Math.max(...built.map((b) => b.size))

    /* each element's presence, 0 (gone) to 1 (shown), and its arrival flourish */
    const shown = built.map((_, i) => (i === want.current ? 1 : 0))
    const boost = built.map(() => 0)
    let current = want.current

    let floor: THREE.Mesh | null = null
    if (shadow) {
      key.castShadow = true
      key.shadow.mapSize.set(1024, 1024)
      Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 22 })
      key.shadow.camera.updateProjectionMatrix()
      key.shadow.radius = 18
      key.shadow.blurSamples = 20
      key.shadow.bias = -0.0004
      floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.08 }))
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      floor.position.y = -(S / 2 + 0.25)
      holder.add(floor)
    }

    /* frame the elements: big, at their place in the tile */
    const TAN = Math.tan(THREE.MathUtils.degToRad(15))
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      const a = w / h
      camera.aspect = a
      const z = Math.max(S / (0.8 * 2 * TAN), S / (0.64 * 2 * TAN * a))
      camera.position.set(0, 0, z)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
      const vh = 2 * TAN * z
      holder.position.set((at[0] - 0.5) * vh * a, (0.5 - at[1]) * vh, 0)
      if (groundCanvas && groundTex) {
        paintGround(groundCanvas, ground, at, a)
        groundTex.needsUpdate = true
      }
      if (!running) draw(performance.now())
    }

    const aim = { x: 0, y: 0 }
    const lean = { x: 0, y: 0 }
    const ndc = new THREE.Vector2(9, 9)
    const ray = new THREE.Raycaster()
    let over = false
    let overK = 0
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
    const draw = (time: number) => {
      const dt = calm ? 0 : Math.min(0.05, (time - last) / 1000)
      last = time
      const t = calm ? 0 : (time - t0) / 1000
      const kl = calm ? 1 : 1 - Math.exp(-dt * 2.6)
      const ks = calm ? 1 : 1 - Math.exp(-dt * 3.4)
      lean.x += (aim.x - lean.x) * kl
      lean.y += (aim.y - lean.y) * kl

      const now = Math.min(built.length - 1, Math.max(0, want.current))
      if (now !== current) {
        current = now
        boost[now] = calm ? 0 : 1
      }

      const b = built[current]
      ray.setFromCamera(ndc, camera)
      over =
        ndc.x < 2 &&
        ray.intersectObject(b.root, true).some((h) => !h.object.userData.backdrop && (h.object as THREE.Mesh).isMesh)
      el.style.cursor = over && pick.current ? 'pointer' : ''
      overK += ((over ? 1 : 0) - overK) * kl

      built.forEach((el3, i) => {
        shown[i] += ((i === current ? 1 : 0) - shown[i]) * ks
        boost[i] *= calm ? 0 : Math.exp(-dt * 1.6)
        const p = shown[i]
        el3.root.visible = p > 0.004
        if (!el3.root.visible) return
        el3.update({ t, dt, boost: boost[i], over: i === current ? overK : 0 })
        const u = el3.root.userData as { tilt: { x: number; y: number }; bob: number; swell: number }
        const e = ease(p)
        el3.root.rotation.x = u.tilt.x + lean.x * 0.35
        el3.root.rotation.y = u.tilt.y + lean.y * 0.5
        el3.root.rotation.z = (1 - e) * (i === current ? -0.9 : 0.9)
        el3.root.position.y = u.bob
        el3.root.scale.setScalar(u.swell * Math.max(0.0001, e))
      })
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

    /* reduced motion: a change of element still needs a frame */
    const nudge = window.setInterval(() => {
      if (!running && want.current !== current) draw(performance.now())
    }, 200)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(nudge)
      io.disconnect()
      ro.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('click', onClick)
      built.forEach((b) => b.dispose())
      if (floor) {
        floor.geometry.dispose()
        ;(floor.material as THREE.Material).dispose()
      }
      groundTex?.dispose()
      env.dispose()
      pmrem.dispose()
      room.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [list, ground, at[0], at[1], shadow, finish])

  return <div ref={host} className="ff-el3d" />
}
