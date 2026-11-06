import * as THREE from 'three'

/* The glass objects' studio (GlassCube3D, and the industry Orbit hero's glass
   finish): a dark room with softbox strips, used twice, once to light the
   glass and once, drawn only off screen, as what is seen through it. */

/** Draws a mesh into render targets (environment, transmission) but never to
 *  the screen. Three applies colorWrite/depthWrite after onBeforeRender, so
 *  flipping them here per draw is enough. */
export function offscreenOnly(mesh: THREE.Mesh) {
  const mat = mesh.material as THREE.Material
  mesh.onBeforeRender = (renderer) => {
    const toTarget = renderer.getRenderTarget() !== null
    mat.colorWrite = toTarget
    mat.depthWrite = toTarget
  }
}

/** A dark room with softbox strips. Brightness above 1 is kept: the targets
 *  are half-float, so the strips read as light sources, not white paint. */
export function studio(hidden: boolean) {
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
