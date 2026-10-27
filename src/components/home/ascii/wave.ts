import * as THREE from 'three'
import { avoid, MAX_AVOID } from '../avoid'
import { cam, type Built } from './lum'

/* ============================================================================
   DOT WAVE — the landing scene, what a visitor sees on arrival

   A field of fine dots on a gently rising plane, seen in perspective, so it
   fills the screen from the bottom edge up toward the nav. The plane swells
   like a slow ocean: crests catch the light, troughs fall away. Around
   every piece of copy (measured into avoid.ts) the dots fade out, so the
   field never runs under the text.

   The grid, the swell and the fade are shared with the particle version,
   which lays its grains on the same grid and moves them with the same swell.
   ========================================================================== */

/** The plane's height at depth z: it rises with distance, so far rows sit
 *  high on the screen and the field fills it. The camera is at z = 8. */
export const waveY = (z: number) => -2.2 + (2 - z) * 0.42

/** The grid: rows from z = 2 (near) to z = -18 (far), `step` apart. */
export function waveGrid(step: number, max = Infinity) {
  const out: number[] = []
  for (let z = 2; z >= -18 && out.length / 3 < max; z -= step)
    for (let x = -16; x <= 16 && out.length / 3 < max; x += step) out.push(x, waveY(z), z)
  return new Float32Array(out)
}

/** The swell, in GLSL: the plane's lift at (x, z) at time t. */
export const WAVE = /* glsl */ `
float wave(vec2 q, float t){
  return sin(q.x * 0.55 + t * 0.9) * 0.32
       + sin(q.y * 0.45 - t * 0.7 + q.x * 0.2) * 0.28
       + sin((q.x + q.y) * 0.3 + t * 0.5) * 0.18;
}
`

/** The copy's boxes, in GLSL: how far a screen point is from the nearest,
 *  in units of the frame's height. Needs uRects, uCount and uFrame (the
 *  frame's width over its height). */
export const AVOID = /* glsl */ `
uniform vec4 uRects[${MAX_AVOID}];
uniform int uCount;
uniform float uFrame;
float avoidDist(vec2 uv){
  float m = 1e3;
  for (int i = 0; i < ${MAX_AVOID}; i++) {
    if (i >= uCount) break;
    vec4 r = uRects[i];
    vec2 d = abs(uv - (r.xy + r.zw) * 0.5) - (r.zw - r.xy) * 0.5;
    d.x *= uFrame;
    m = min(m, length(max(d, 0.0)) + min(max(d.x, d.y), 0.0));
  }
  return m;
}
`

/** Uniforms for AVOID, and a function that copies the current boxes in. */
export function avoidUniforms() {
  const rects = Array.from({ length: MAX_AVOID }, () => new THREE.Vector4())
  const u = { uRects: { value: rects }, uCount: { value: 0 }, uFrame: { value: 1 } }
  const sync = () => {
    rects.forEach((r, i) => r.fromArray(avoid.rects, i * 4))
    u.uCount.value = avoid.count
    u.uFrame.value = avoid.aspect
  }
  return { u, sync }
}

export function home(): Built {
  const scene = new THREE.Scene()
  const camera = cam(35, 8)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(waveGrid(0.2), 3))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100)
  const { u: avoidU, sync } = avoidUniforms()
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSize;
      varying float vB;
      ${WAVE}
      ${AVOID}
      void main(){
        vec3 p = position;
        float w = wave(p.xz, uTime * 0.6);
        p.y += w;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        vec2 uv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
        float keep = smoothstep(0.01, 0.04, avoidDist(uv));
        float far = smoothstep(27.0, 15.0, -mv.z);
        vB = (0.3 + 0.7 * smoothstep(-0.3, 0.45, w)) * far * keep;
        gl_PointSize = max(1.0, uSize * 8.0 / -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vB;
      void main(){
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        gl_FragColor = vec4(vec3(vB * (1.0 - smoothstep(0.25, 0.5, r))), 1.0);
      }`,
    uniforms: { uTime: { value: 0 }, uSize: { value: 3 }, ...avoidU },
  })
  scene.add(new THREE.Points(geo, mat))
  return {
    scene,
    camera,
    update(t, p, res) {
      sync()
      mat.uniforms.uTime.value = t
      /* dots about 1.4% of the target's height, so they read at every
         character size and print grain */
      if (res) mat.uniforms.uSize.value = res.y * 0.014
      camera.position.x = p.x * 0.3
      camera.position.y = p.y * 0.15
      camera.lookAt(0, 0, 0)
    },
  }
}
