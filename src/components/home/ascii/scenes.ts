import * as THREE from 'three'
import { cam, place, type Built } from './lum'
import { globe, grid, land, lattice, spark, warp } from './dots'
import { home } from './wave'
import markUrl from '@/assets/home/umm-mark.svg'

export type { Built }

/* ============================================================================
   DECK SCENES — what the ASCII and print versions draw

   Each scene is an ordinary three.js scene that renders BRIGHTNESS only —
   one grey value per pixel — into a small target, which the ASCII or print
   pass turns into ink. The landing is the dot wave (wave.ts); each chip
   gathers the same dots into its own form (dots.ts, forms.ts); asking
   sends everything out through RAGe's name.
   ========================================================================== */

/** The landing scene, one scene per chip, each picturing what the chip
 *  says, the way out to RAGe, and the final homepage's mark (/home-final). */
export type SceneId = 'home' | 'lattice' | 'warp' | 'spark' | 'grid' | 'globe' | 'land' | 'rage' | 'logo'

/** What a visitor sees on arrival, and what the hero returns to. */
export const LANDING: { id: SceneId; label: string; hint: string } = {
  id: 'home',
  label: 'Landing',
  hint: 'On arrival: a field of dots swelling like a slow ocean, clear of the copy. Each chip gathers the dots into its own form.',
}

/** The six chip scenes, in chip order, each with the line the options dock
 *  shows for it. They only come up while their chip is hovered. */
export const SCENES: { id: SceneId; label: string; hint: string }[] = [
  { id: 'lattice', label: 'Data lattice', hint: 'Architect data-rich solutions: the dots gather into a crystal lattice of data.' },
  { id: 'warp', label: 'Warp', hint: 'Accelerate your digital transformation: the dots stretch into streaks rushing past.' },
  { id: 'spark', label: 'Neural spark', hint: 'Drive innovation through AI: a bright core firing signals out along its filaments.' },
  { id: 'grid', label: 'Scaling grid', hint: 'Build scalable solutions: squares multiplying outward from the middle.' },
  { id: 'globe', label: 'Globe', hint: 'See how UMM delivers impact: the earth in dots, arcs flying between cities.' },
  { id: 'land', label: 'Land', hint: 'Scale smarter: the wave rises into a range of mountains.' },
]

/* --- the scenes ---------------------------------------------------------- */

/** The way out: RAGe's name, set in characters. */
function rage(): Built {
  const scene = new THREE.Scene()
  const camera = cam(35, 6)
  const cv = document.createElement('canvas')
  cv.width = 1600
  cv.height = 600
  const g = cv.getContext('2d')!
  g.fillStyle = '#000'
  g.fillRect(0, 0, 1600, 600)
  g.fillStyle = '#fff'
  g.font = '600 380px Mosvita, Inter, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('RAGe', 800, 320)
  const tex = new THREE.CanvasTexture(cv)
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.4), new THREE.MeshBasicMaterial({ map: tex }))
  scene.add(plane)
  return {
    scene,
    camera,
    update(t, p) {
      place(plane, camera, 0, 6.4)
      plane.rotation.y = p.x * 0.35 + Math.sin(t) * 0.05
      plane.rotation.x = -p.y * 0.25
    },
  }
}

/** The UMM wordmark, embossed and all but still: the scene the boss chose
 *  for the final homepage (26 Oct, in engraving). The artwork is drawn to a canvas
 *  twice, sharp for the outline and blurred for the height of the bevel, so
 *  every quarter circle of the mark stays exact. It fills its own frame,
 *  whatever the frame's shape, and never reaches past the box the page
 *  gives it. */
function logo(): Built {
  const scene = new THREE.Scene()
  const camera = cam(35, 9)
  /* the letters alone (umm-mark.svg): the logo without its ®, cropped to
     the letters so the mark sits centred (27 Oct, Krish) */
  const W = 1600
  const H = Math.round((W * 460) / 1437.32)
  const pad = 40
  const sharp = document.createElement('canvas')
  const soft = document.createElement('canvas')
  ;[sharp, soft].forEach((c) => {
    c.width = W + pad * 2
    c.height = H + pad * 2
  })
  const mask = new THREE.CanvasTexture(sharp)
  const height = new THREE.CanvasTexture(soft)
  const img = new Image()
  img.onload = () => {
    sharp.getContext('2d')!.drawImage(img, pad, pad, W, H)
    const g = soft.getContext('2d')!
    g.filter = 'blur(14px)'
    g.drawImage(img, pad, pad, W, H)
    mask.needsUpdate = true
    height.needsUpdate = true
  }
  img.src = markUrl

  const mat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vW;
      void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMask; uniform sampler2D uHeight; uniform mat3 uRot; uniform float uTime;
      varying vec2 vUv; varying vec3 vW;
      float h(vec2 uv){ return texture2D(uHeight, uv).a; }
      void main(){
        float m = texture2D(uMask, vUv).a;
        if (m < 0.02) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        vec2 e = vec2(1.5 / ${W + pad * 2}.0, 1.5 / ${H + pad * 2}.0);
        float dx = h(vUv + vec2(e.x, 0.0)) - h(vUv - vec2(e.x, 0.0));
        float dy = h(vUv + vec2(0.0, e.y)) - h(vUv - vec2(0.0, e.y));
        vec3 n = normalize(uRot * normalize(vec3(-dx * 9.0, -dy * 9.0, 1.0)));
        vec3 V = normalize(cameraPosition - vW);
        vec3 L = normalize(vec3(-0.4, 0.6, 0.8));
        float diff = max(dot(n, L), 0.0);
        float spec = pow(max(dot(reflect(-L, n), V), 0.0), 30.0);
        vec3 R = reflect(-V, n);
        float bands = smoothstep(0.25, 0.75, sin(R.y * 6.0 + R.x * 3.0 + uTime * 0.4) * 0.5 + 0.5);
        float i = 0.18 + diff * 0.45 + bands * 0.3 + spec * 0.6;
        gl_FragColor = vec4(vec3(clamp(i, 0.0, 1.0) * m), 1.0);
      }`,
    uniforms: {
      uMask: { value: mask },
      uHeight: { value: height },
      uRot: { value: new THREE.Matrix3() },
      uTime: { value: 0 },
    },
  })
  const w = 6.6
  const h = (w * (H + pad * 2)) / (W + pad * 2)
  /* the drawn mark inside the plane's padding */
  const markW = (w * W) / (W + pad * 2)
  const markH = (h * H) / (H + pad * 2)
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
  scene.add(plane)

  /* The mark barely moves (27 Oct, Krish: "slight movement only, not fully
     moveable"): a slow drift of a few degrees and a small lean toward the
     cursor, which the deck has already eased and scaled by 0.55. */
  const SWAY = { yaw: 0.07, tilt: 0.035, leanYaw: 0.06, leanTilt: 0.04 }

  /* The largest size at which the mark's corners stay inside 94% of the
     frame through all of that movement (the near end swells a little as it
     comes toward the camera), found once for each shape of frame. */
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const turn = new THREE.Matrix4()
  const pose = new THREE.Euler()
  const corner = new THREE.Vector3()
  const fits = (s: number) => {
    const yawMax = SWAY.yaw + SWAY.leanYaw * 0.55
    const tiltMax = SWAY.tilt + SWAY.leanTilt * 0.55
    for (const yaw of [-yawMax, yawMax])
      for (const tilt of [-tiltMax, tiltMax]) {
        turn.makeRotationFromEuler(pose.set(tilt, yaw, 0))
        for (const sx of [-1, 1])
          for (const sy of [-1, 1]) {
            corner.set((sx * markW * s) / 2, (sy * markH * s) / 2, 0).applyMatrix4(turn)
            const half = (camera.position.z - corner.z) * tan
            if (half <= 0 || Math.abs(corner.y) > half * 0.94 || Math.abs(corner.x) > half * camera.aspect * 0.94)
              return false
          }
      }
    return true
  }
  let fitFor = 0
  let fit = 1
  const size = () => {
    if (camera.aspect !== fitFor) {
      let lo = 0.05
      let hi = 6
      for (let i = 0; i < 24; i++) {
        const m = (lo + hi) / 2
        if (fits(m)) lo = m
        else hi = m
      }
      fitFor = camera.aspect
      fit = lo
    }
    return fit
  }

  return {
    scene,
    camera,
    update(t, p) {
      plane.scale.setScalar(size())
      /* off the stage the pointer reads past ±0.55: hold the lean at its edge */
      const px = Math.max(-0.55, Math.min(0.55, p.x))
      const py = Math.max(-0.55, Math.min(0.55, p.y))
      plane.rotation.y = Math.sin(t * 0.5) * SWAY.yaw + px * SWAY.leanYaw
      plane.rotation.x = Math.sin(t * 0.37) * SWAY.tilt - py * SWAY.leanTilt
      plane.updateMatrixWorld()
      mat.uniforms.uRot.value.setFromMatrix4(plane.matrixWorld)
      mat.uniforms.uTime.value = t
    },
  }
}

export const BUILD: Record<SceneId, () => Built> = { home, lattice, warp, spark, grid, globe, land, rage, logo }
