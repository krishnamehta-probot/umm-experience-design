import * as THREE from 'three'
import { NOISE } from '../gl'

/* ============================================================================
   BRIGHTNESS — what every deck scene is drawn with. A scene renders one grey
   value per pixel; the ASCII and print passes turn that grey into ink.
   ========================================================================== */

export type Built = {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  /** `res` is the size of the target it renders into, in pixels */
  update(t: number, pointer: THREE.Vector2, res?: THREE.Vector2): void
}

/* --- the shared brightness material ------------------------------------- */

export const lumVert = /* glsl */ `
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

export const lumFrag = /* glsl */ `
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

export function lum(opts: { chrome?: number; warp?: number; fog?: [number, number]; light?: THREE.Vector3; side?: THREE.Side } = {}) {
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

export const cam = (fov: number, z: number) => {
  const c = new THREE.PerspectiveCamera(fov, 1, 0.1, 100)
  c.position.set(0, 0, z)
  return c
}


/** How wide the frame is, in world units, at `dist` from the camera. */
export const frameWidth = (camera: THREE.PerspectiveCamera, dist: number) =>
  2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect

/** On a phone, how far below the middle a scene's object sits, as a share
 *  of the frame's height: in the open space between the chips and the
 *  headline, not behind the chips. */
export const PHONE_DROP = 0.12

/** Places an object `w` wide: `x` to the side on a wide frame (beside the
 *  copy, as on desktop); centred, dropped and shrunk to fit on a tall one
 *  (a phone). Called every frame, so it follows the window as it resizes. */
export function place(obj: THREE.Object3D, camera: THREE.PerspectiveCamera, x: number, w: number, y = 0) {
  const tall = camera.aspect < 1
  const dist = camera.position.distanceTo(obj.position)
  const frameH = frameWidth(camera, dist) / camera.aspect
  obj.position.x = tall ? 0 : x
  obj.position.y = tall ? -frameH * PHONE_DROP : y
  obj.scale.setScalar(Math.min(1, (frameWidth(camera, dist) * (tall ? 0.86 : 1.4)) / w))
}
