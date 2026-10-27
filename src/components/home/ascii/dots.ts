import * as THREE from 'three'
import { NOISE } from '../gl'
import { cam, place, type Built } from './lum'
import { AVOID, avoidUniforms, WAVE, waveGrid } from './wave'
import * as F from './forms'

/* ============================================================================
   DOT SCENES — the six chip forms (forms.ts) as deck scenes for the ASCII
   and print versions, drawn in the same soft dots as the landing wave and
   kept clear of the copy the same way.

   Each scene is one Points object. Its vertex shader starts from the dot's
   position `p`, brightness `b` and size `s`, runs the form's own lines (the
   swell, the rush, the pulses), and the shared ending projects the dot,
   fades it near the copy and in the distance, and sizes it.
   ========================================================================== */

/** The land's height and the warp's rush, in GLSL, shared with the particle
 *  version. Both take scene time. */
export const MOTION = /* glsl */ `
float ridge(vec2 q){ float n = 1.0 - abs(snoise(vec3(q, 0.0))); return n * n; }
float landH(vec2 q, float t){
  q += vec2(0.0, t * 0.05);
  return ridge(q * 0.16) * 1.9 + ridge(q * 0.37 + 3.0) * 0.55;
}
float warpZ(float z, float t){ return mod(z + t * 2.2 + 30.0, 36.0) - 30.0; }
`

type Place = { x: number; y: number; w: number; spin: number; tilt: number }

function dotScene(
  f: F.Form,
  body: string,
  { object, far = [15, 27] }: { object?: Place; far?: [number, number] } = {},
): Built {
  const scene = new THREE.Scene()
  const camera = cam(35, 8)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(f.pos, 3))
  geo.setAttribute('aT', new THREE.BufferAttribute(f.t, 1))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100)
  const { u: avoidU, sync } = avoidUniforms()
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aT;
      uniform float uTime;
      uniform float uAge;
      uniform float uSize;
      varying float vB;
      ${NOISE}
      ${WAVE}
      ${MOTION}
      ${AVOID}
      void main(){
        vec3 p = position;
        float b = 1.0;
        float s = 1.0;
        float t = uTime;
        ${body}
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        vec2 uv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
        float keep = smoothstep(0.01, 0.04, avoidDist(uv));
        float far = smoothstep(${far[1].toFixed(1)}, ${far[0].toFixed(1)}, -mv.z);
        vB = b * keep * far;
        gl_PointSize = max(1.0, uSize * s * 8.0 / -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vB;
      void main(){
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        gl_FragColor = vec4(vec3(vB * (1.0 - smoothstep(0.25, 0.5, r))), 1.0);
      }`,
    uniforms: { uTime: { value: 0 }, uAge: { value: 0 }, uSize: { value: 3 }, ...avoidU },
  })
  const group = new THREE.Group()
  group.add(new THREE.Points(geo, mat))
  scene.add(group)

  let start = 0
  let last = -1
  return {
    scene,
    camera,
    update(t, p, res) {
      sync()
      /* forms that unfold start afresh each time they come into view */
      if (last < 0 || t - last > 0.5) start = t
      last = t
      mat.uniforms.uTime.value = t
      mat.uniforms.uAge.value = t - start
      /* the objects' dots a little larger than the fields', so a form
         reads at the size of a character */
      if (res) mat.uniforms.uSize.value = res.y * (object ? 0.024 : 0.014)
      if (object) {
        group.rotation.y = t * object.spin + p.x * 0.35
        group.rotation.x = object.tilt - p.y * 0.2
        place(group, camera, object.x, object.w, object.y)
      } else {
        camera.position.x = p.x * 0.3
        camera.position.y = p.y * 0.15
        camera.lookAt(0, 0, 0)
      }
    },
  }
}

/** Where the object forms sit on a wide screen: up and to the right, in the
 *  clear space beside the chips and above the film card. */
const SIDE = { x: 2.3, y: 0.55 }

export const lattice = () =>
  dotScene(
    F.lattice(16000),
    /* glsl */ `
      /* a front of light sweeps through the lattice, node to node */
      float d = dot(position, normalize(vec3(1.0, 0.6, 0.3)));
      float front = fract(t * 0.08) * 4.0 - 2.0;
      float pulse = exp(-abs(d - front) * 5.0);
      b = mix(0.45, 1.0, aT) + pulse * 0.6;
      s = mix(0.8, 1.7, aT);`,
    { object: { ...SIDE, w: 2.9, spin: 0.12, tilt: 0.45 } },
  )

export const warp = () =>
  dotScene(
    F.warp(12000),
    /* glsl */ `
      p.z = warpZ(p.z, t);
      b = (0.4 + 0.6 * aT) * smoothstep(-30.0, -16.0, p.z) * (1.0 - smoothstep(4.5, 6.0, p.z));
      s = 0.6;`,
    { far: [30, 39] },
  )

export const spark = () =>
  dotScene(
    F.spark(14000),
    /* glsl */ `
      /* signals fire out along every filament together, like a breath */
      float pulse = exp(-abs(fract(t * 0.15) - aT) * 12.0);
      b = aT < 0.1 ? 1.0 : aT > 0.99 ? 0.7 + 0.3 * pulse : 0.35 + 0.65 * pulse;
      s = aT < 0.1 ? 0.9 : aT > 0.99 ? 1.6 : 0.8;`,
    { object: { ...SIDE, w: 3.6, spin: 0.08, tilt: 0.2 } },
  )

export const grid = () =>
  dotScene(
    F.grid(20000),
    /* glsl */ `
      /* the squares appear from the middle outward, then hold */
      float reach = uAge * 0.3;
      b = step(aT, reach) * (0.5 + 0.5 * exp(-abs(aT - reach) * 10.0));
      p.y += wave(p.xz, t * 0.6) * 0.12;`,
  )

export const globe = () =>
  dotScene(
    F.globe(16000),
    /* glsl */ `
      if (aT >= 3.0) {
        /* an arc, drawn as it flies, bright at the head */
        float k = floor(aT - 3.0);
        float f = fract(aT);
        float head = fract(t * 0.12 + k * 0.13) * 1.4;
        b = step(f, head) * (1.0 - smoothstep(1.0, 1.4, head)) * (0.35 + 0.65 * exp(-max(head - f, 0.0) * 7.0));
      } else {
        /* the far side of the earth falls away */
        vec3 n = normalize(mat3(modelViewMatrix) * position);
        b = (aT > 1.5 ? 0.85 + 0.15 * sin(t * 2.0) : 0.75) * mix(0.12, 1.0, smoothstep(-0.3, 0.5, n.z));
        s = aT > 1.5 ? 1.5 : 1.0;
      }`,
    { object: { ...SIDE, w: 3.4, spin: 0.1, tilt: 0.35 } },
  )

export const land = () => {
  const g = waveGrid(0.2)
  return dotScene(
    { pos: g, t: new Float32Array(g.length / 3) },
    /* glsl */ `
      float h = landH(p.xz, t);
      p.y += h + wave(p.xz, t * 0.6) * 0.25;
      b = 0.3 + 0.7 * smoothstep(0.1, 1.6, h);`,
  )
}
