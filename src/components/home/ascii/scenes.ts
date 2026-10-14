import * as THREE from 'three'
import { NOISE } from '../gl'
import logoUrl from '@/assets/home/umm-logo.svg'

/* ============================================================================
   ASCII SCENES

   Each scene is an ordinary three.js scene that renders BRIGHTNESS only —
   one grey value per pixel — into a small target. The ASCII pass then turns
   that brightness into characters. So a scene's only job is a good
   silhouette and good shading: rim light, a hard highlight, a little fog.
   ========================================================================== */

export type SceneId = 'sphere' | 'mountains' | 'logo' | 'eye' | 'city' | 'tunnel' | 'knot' | 'rage'

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'sphere', label: 'Sphere' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'logo', label: 'UMM mark' },
  { id: 'eye', label: 'Eye' },
  { id: 'city', label: 'Data city' },
  { id: 'tunnel', label: 'Tunnel' },
  { id: 'knot', label: 'Knot' },
]

export type Built = {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  update(t: number, pointer: THREE.Vector2): void
}

/* --- the shared brightness material ------------------------------------- */

const lumVert = /* glsl */ `
uniform float uTime;
uniform float uWarp;
varying vec3 vN;
varying vec3 vW;
${NOISE}
void main(){
  vec3 p = position;
  if (uWarp > 0.0) p += normal * snoise(p * 1.4 + uTime * 0.35) * uWarp;
  vec4 w = modelMatrix * vec4(p, 1.0);
  #ifdef USE_INSTANCING
    w = modelMatrix * instanceMatrix * vec4(p, 1.0);
    vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  #else
    vN = normalize(mat3(modelMatrix) * normal);
  #endif
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

const lumFrag = /* glsl */ `
uniform vec3 uLight;
uniform float uChrome;
uniform vec2 uFog;
varying vec3 vN;
varying vec3 vW;
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  if (!gl_FrontFacing) N = -N;
  float diff = max(dot(N, normalize(uLight)), 0.0);
  float spec = pow(max(dot(reflect(-normalize(uLight), N), V), 0.0), 28.0);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  /* chrome: reflections of a striped studio, read as bands of characters */
  vec3 R = reflect(-V, N);
  float bands = smoothstep(0.2, 0.8, sin(R.y * 7.0 + R.x * 2.0) * 0.5 + 0.5);
  float i = 0.06 + diff * 0.55 + spec * 0.7 + rim * 0.35;
  i = mix(i, 0.12 + bands * 0.7 + spec * 0.6 + rim * 0.3, uChrome);
  float d = length(cameraPosition - vW);
  i *= 1.0 - smoothstep(uFog.x, uFog.y, d);
  gl_FragColor = vec4(vec3(clamp(i, 0.0, 1.0)), 1.0);
}
`

function lum(opts: { chrome?: number; warp?: number; fog?: [number, number]; light?: THREE.Vector3; side?: THREE.Side } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: lumVert,
    fragmentShader: lumFrag,
    side: opts.side ?? THREE.FrontSide,
    uniforms: {
      uTime: { value: 0 },
      uWarp: { value: opts.warp ?? 0 },
      uLight: { value: opts.light ?? new THREE.Vector3(-0.6, 0.8, 0.7) },
      uChrome: { value: opts.chrome ?? 0 },
      uFog: { value: new THREE.Vector2(...(opts.fog ?? [40, 60])) },
    },
  })
}

const cam = (fov: number, z: number) => {
  const c = new THREE.PerspectiveCamera(fov, 1, 0.1, 100)
  c.position.set(0, 0, z)
  return c
}

/* --- the scenes ---------------------------------------------------------- */

/** The hero's own sphere, in chrome, breathing slowly. */
function sphere(): Built {
  const scene = new THREE.Scene()
  const camera = cam(35, 7)
  const mat = lum({ chrome: 0.85, warp: 0.07 })
  /* where the live hero keeps its sphere: left of centre, behind the chips */
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 48), mat)
  m.position.set(-1.9, -0.15, 0)
  scene.add(m)
  return {
    scene,
    camera,
    update(t, p) {
      mat.uniforms.uTime.value = t
      m.rotation.y = t * 0.25 + p.x * 0.6
      m.rotation.x = p.y * -0.4
    },
  }
}

/** The grey mountain field the live hero sits on, rolling toward you. */
function mountains(): Built {
  const scene = new THREE.Scene()
  const camera = cam(45, 0)
  camera.position.set(0, 2.4, 8)
  camera.lookAt(0, 0, -6)
  const geo = new THREE.PlaneGeometry(40, 30, 200, 150)
  geo.rotateX(-Math.PI / 2)
  const mat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vN; varying vec3 vW;
      ${NOISE}
      float h(vec2 p){
        float k = snoise(vec3(p * 0.28 + vec2(0.0, uTime * 0.25), 1.0));
        return pow(k * 0.5 + 0.5, 2.2) * 2.6;
      }
      void main(){
        vec3 p = position; p.y = h(p.xz);
        float e = 0.08;
        vec3 n = normalize(vec3(h(p.xz - vec2(e,0.0)) - h(p.xz + vec2(e,0.0)), 2.0*e, h(p.xz - vec2(0.0,e)) - h(p.xz + vec2(0.0,e))));
        vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xyz; vN = n;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: lumFrag,
    uniforms: {
      uTime: { value: 0 },
      uLight: { value: new THREE.Vector3(-0.5, 0.7, 0.4) },
      uChrome: { value: 0 },
      uFog: { value: new THREE.Vector2(9, 26) },
    },
  })
  const m = new THREE.Mesh(geo, mat)
  m.position.z = -6
  scene.add(m)
  return {
    scene,
    camera,
    update(t, p) {
      mat.uniforms.uTime.value = t
      camera.position.x = p.x * 1.2
      camera.position.y = 2.4 + p.y * 0.6
      camera.lookAt(0, 0, -6)
    },
  }
}

/** The UMM wordmark, embossed and turning. The artwork itself is drawn to a
 *  canvas twice — sharp for the outline, blurred for the height of the bevel —
 *  so every quarter circle of the mark stays exact. */
function logo(): Built {
  const scene = new THREE.Scene()
  const camera = cam(35, 9)
  const W = 1600
  const H = Math.round((W * 460) / 1553)
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
  img.src = logoUrl

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
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, (w * (H + pad * 2)) / (W + pad * 2)), mat)
  scene.add(plane)
  return {
    scene,
    camera,
    update(t, p) {
      plane.rotation.y = Math.sin(t * 0.5) * 0.42 + p.x * 0.4
      plane.rotation.x = Math.sin(t * 0.37) * 0.16 - p.y * 0.25
      plane.updateMatrixWorld()
      mat.uniforms.uRot.value.setFromMatrix4(plane.matrixWorld)
      mat.uniforms.uTime.value = t
    },
  }
}

/** The eye from the film under the hero. Its pupil follows the cursor. */
function eye(): Built {
  const scene = new THREE.Scene()
  const camera = cam(35, 5)
  const mat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec2 uLook; uniform float uAspect;
      varying vec2 vUv;
      ${NOISE}
      void main(){
        vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.5;
        p -= uLook * 0.12;
        float r = length(p);
        float a = atan(p.y, p.x);
        float fib = snoise(vec3(a * 9.0, r * 2.2 - uTime * 0.15, uTime * 0.05)) * 0.5 + 0.5;
        float fine = snoise(vec3(a * 38.0, r * 6.0, uTime * 0.1)) * 0.5 + 0.5;
        float iris = smoothstep(0.24, 0.32, r) * (1.0 - smoothstep(0.72, 0.98, r));
        float i = iris * (0.25 + pow(fib, 1.6) * 0.7 + fine * 0.25);
        i += (1.0 - smoothstep(0.0, 0.26, abs(r - 0.3))) * 0.45 * iris;
        float halo = exp(-pow((r - 0.95) * 3.0, 2.0)) * 0.25 * fine;
        float dust = step(0.985, snoise(vec3(p * 22.0, uTime * 0.3))) * smoothstep(1.4, 0.6, r);
        float glint = exp(-dot(p - vec2(-0.12, 0.14), p - vec2(-0.12, 0.14)) * 160.0);
        gl_FragColor = vec4(vec3(clamp((i + halo + dust * 0.8 + glint) * 0.8, 0.0, 1.0)), 1.0);
      }`,
    uniforms: { uTime: { value: 0 }, uLook: { value: new THREE.Vector2() }, uAspect: { value: 1.6 } },
  })
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
  scene.add(plane)
  return {
    scene,
    camera,
    update(t, p) {
      mat.uniforms.uTime.value = t
      mat.uniforms.uLook.value.copy(p)
      mat.uniforms.uAspect.value = camera.aspect
      /* the plane always fills the frame */
      const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
      plane.scale.set((h * camera.aspect) / 2, h / 2, 1)
    },
  }
}

/** A city of data: bars rising and falling on a grid. */
function city(): Built {
  const scene = new THREE.Scene()
  const camera = cam(32, 0)
  const n = 26
  const mat = lum({ fog: [16, 34] })
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 1, 0.42), mat, n * n)
  scene.add(mesh)
  const d = new THREE.Object3D()
  const seed = Array.from({ length: n * n }, () => Math.random() * 10)
  return {
    scene,
    camera,
    update(t, p) {
      let k = 0
      for (let x = 0; x < n; x++)
        for (let z = 0; z < n; z++) {
          const px = (x - n / 2) * 0.55
          const pz = (z - n / 2) * 0.55
          const wave = Math.sin(px * 0.6 + t * 1.1) * Math.cos(pz * 0.5 - t * 0.8)
          const h = 0.15 + Math.max(0, wave * 1.6 + Math.sin(seed[k] + t * 0.7) * 0.6 + 0.6)
          d.position.set(px, h / 2, pz)
          d.scale.set(1, h, 1)
          d.updateMatrix()
          mesh.setMatrixAt(k++, d.matrix)
        }
      mesh.instanceMatrix.needsUpdate = true
      const a = t * 0.12 + p.x * 0.5
      camera.position.set(Math.sin(a) * 15, 9 + p.y * 2, Math.cos(a) * 15)
      camera.lookAt(0, 0.6, 0)
    },
  }
}

/** Rings rushing toward you. */
function tunnel(): Built {
  const scene = new THREE.Scene()
  const camera = cam(60, 0)
  const mat = lum({ fog: [4, 26], light: new THREE.Vector3(0, 0, 1), side: THREE.DoubleSide })
  const rings: THREE.Mesh[] = []
  for (let i = 0; i < 22; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.07, 10, 6 + (i % 3) * 2), mat)
    r.position.z = -i * 1.4
    scene.add(r)
    rings.push(r)
  }
  return {
    scene,
    camera,
    update(t, p) {
      rings.forEach((r, i) => {
        r.position.z = (((t * 3 - i * 1.4) % 30.8) + 30.8) % 30.8 - 29
        r.rotation.z = t * 0.3 + i * 0.25
      })
      camera.position.x = p.x * 0.8
      camera.position.y = p.y * 0.5
      camera.lookAt(p.x * 0.4, p.y * 0.3, -10)
    },
  }
}

/** A chrome knot: many systems, one piece. */
function knot(): Built {
  const scene = new THREE.Scene()
  const camera = cam(35, 9)
  const mat = lum({ chrome: 0.8 })
  const m = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.48, 260, 36, 2, 3), mat)
  m.position.x = 1
  scene.add(m)
  return {
    scene,
    camera,
    update(t, p) {
      m.rotation.x = t * 0.21 + p.y * 0.4
      m.rotation.y = t * 0.33 + p.x * 0.6
    },
  }
}

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
      plane.rotation.y = p.x * 0.35 + Math.sin(t) * 0.05
      plane.rotation.x = -p.y * 0.25
    },
  }
}

export const BUILD: Record<SceneId, () => Built> = { sphere, mountains, logo, eye, city, tunnel, knot, rage }
