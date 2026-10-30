import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { reducedMotion } from './gl'
import { GLOW_GLSL, glowNow } from './Glow'
import { MARK_H, MARK_PATHS, MARK_W, markPath, type Focus, type MarkEngine, type MarkHost } from './mark'

/* ============================================================================
   GLASS MARK — the UMM mark as a thick piece of glass (/home-glass)

   The four pieces of the mark extruded and bevelled, in clear glass with a
   little dispersion and a thin-film sheen, lit by a soft studio. It stands on
   the grey paper, which is ruled with faint hairlines around it, and casts a
   soft shadow onto it: what the glass bends is the paper and that shadow, so
   the letters read darker in the middle and bright at their bevels.

   The cursor is the light. The mark turns a little to face it, the shadow
   falls away from it, and the studio's reflections slide across the bevels.
   Resting on a question turns the mark toward it. Without a cursor the mark
   sways slowly on its own.
   ========================================================================== */

const BEVEL = 22
const DEPTH = 110

/* the paper: the ground (the grey, #DEDEDE, linear 0.7305; or the glow,
   the same as the page's own, Glow.ts), its hairlines, and the mark's shadow
   (a blurred silhouette, uSil) offset away from the light */
const PAPER_FRAG = /* glsl */ `
uniform vec2 uRes;
uniform float uDpr;
uniform sampler2D uSil;
uniform vec4 uRect;
uniform vec2 uOff;
uniform float uOn;
uniform float uGlow;
uniform vec2 uOrigin;
uniform vec2 uGC;
uniform vec2 uGR;
uniform vec3 uGM;
uniform float uGT;
${GLOW_GLSL}
vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec3 col = uGlow > 0.5 ? toLinear(glowAt(p + uOrigin, uGC, uGR, uGM, uGT)) : vec3(0.7305);

  /* hairlines on the grey, strongest around the mark and gone by the
     stage's edges (the glow has none) */
  float P = 7.0;
  float d = abs(fract(p.y / P) - 0.5) * P;
  float line = 1.0 - smoothstep(0.3, 0.85, d);
  vec2 q = (p - (uRect.xy + uRect.zw * 0.5)) / (uRect.zw * vec2(0.5, 0.62));
  float near = 1.0 - smoothstep(0.55, 1.0, length(q));
  col *= 1.0 - line * 0.075 * near * uOn * (1.0 - uGlow);

  /* the shadow, and the light the glass gathers into it */
  float sh = texture2D(uSil, (p - uOff - uRect.xy) / uRect.zw).a;
  float lit = texture2D(uSil, (p - uOff * 0.35 - uRect.xy) / uRect.zw).a;
  col *= 1.0 - 0.42 * sh * uOn;
  col += vec3(0.05, 0.09, 0.24) * lit * (1.0 - sh) * 0.9 * uOn;

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** the mark's silhouette, blurred, on a canvas with room around it */
function silhouette(blur: number) {
  const W = 1024
  const pad = 90
  const k = (W - pad * 2) / MARK_W
  const H = Math.ceil(MARK_H * k + pad * 2)
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const c = cv.getContext('2d')!
  /* the shape drawn far off the canvas, its shadow thrown back onto it */
  c.shadowColor = '#000'
  c.shadowBlur = blur
  c.shadowOffsetX = W * 4
  c.setTransform(k, 0, 0, k, pad - W * 4, pad)
  c.fill(markPath())
  return { cv, k, pad, W, H }
}

export class GlassMark implements MarkEngine {
  private canvas = document.createElement('canvas')
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(20, 1, 1, 10000)
  private mesh: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshPhysicalMaterial>
  private paper: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  private sil = silhouette(46)
  private stage: HTMLElement
  private page: HTMLElement
  private calm = reducedMotion()
  private hover = window.matchMedia('(hover: hover)').matches
  private w = 1
  private h = 1
  private s = 1
  private rot = { x: 0, y: 0 }
  private pointer = { x: 0, y: 0, on: false }
  private look: { x: number; y: number } | null = null
  private light = { x: 0, y: 0 }
  private off = { x: 18, y: 22 }
  private t0 = performance.now()
  private last = performance.now()
  private leaveAt = -1
  private raf = 0
  private visible = true
  private dead = false
  private ro: ResizeObserver
  private io: IntersectionObserver

  constructor(host: MarkHost) {
    this.stage = host.stage
    this.page = host.page
    this.canvas.className = 'hx__gl hx__gl--glass'
    this.canvas.setAttribute('aria-hidden', 'true')

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.toneMapping = THREE.NeutralToneMapping
    this.stage.appendChild(this.canvas)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 1.1
    pmrem.dispose()

    /* the paper, a quad over the whole canvas, drawn first */
    const tex = new THREE.CanvasTexture(this.sil.cv)
    tex.colorSpace = THREE.NoColorSpace
    this.paper = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: {
          uRes: { value: new THREE.Vector2(1, 1) },
          uDpr: { value: 1 },
          uSil: { value: tex },
          uRect: { value: new THREE.Vector4() },
          uOff: { value: new THREE.Vector2() },
          uOn: { value: 0 },
          uGlow: { value: host.ground === 'glow' ? 1 : 0 },
          uOrigin: { value: new THREE.Vector2() },
          uGC: { value: new THREE.Vector2() },
          uGR: { value: new THREE.Vector2(1, 1) },
          uGM: { value: new THREE.Vector3() },
          uGT: { value: 0 },
        },
        vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.9999, 1.0); }',
        fragmentShader: PAPER_FRAG,
        depthTest: false,
        depthWrite: false,
      }),
    )
    this.paper.frustumCulled = false
    this.paper.renderOrder = -1
    this.scene.add(this.paper)

    /* the mark: its four pieces, extruded and bevelled */
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">${MARK_PATHS.map((d) => `<path d="${d}"/>`).join('')}</svg>`
    const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p))
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL * 1.3,
      bevelSize: BEVEL,
      bevelSegments: 10,
      curveSegments: 56,
    })
    /* the drawing's y runs down: turn it over, and set it about its middle */
    geo.rotateX(Math.PI)
    geo.center()
    geo.computeVertexNormals()
    this.mesh = new THREE.Mesh(
      geo,
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.08,
        transmission: 1,
        thickness: DEPTH + BEVEL * 2.6,
        ior: 1.5,
        dispersion: 3,
        /* smoked a little, so the letters hold their own on white */
        attenuationColor: new THREE.Color('#a3abc0'),
        attenuationDistance: 300,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        iridescence: 0.45,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [120, 420],
        specularIntensity: 1,
        envMapIntensity: 1.15,
      }),
    )
    this.scene.add(this.mesh)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(this.stage)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      this.wake()
    })
    this.io.observe(this.stage)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.wake)
    this.resize()
    this.wake()
  }

  focus(q: Focus | null) {
    if (!q) {
      this.look = null
      return
    }
    const r = this.canvas.getBoundingClientRect()
    this.look = { x: q.x - r.left, y: q.y - r.top }
  }

  leave() {
    this.leaveAt = (performance.now() - this.t0) / 1000
  }

  dispose() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.wake)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.paper.geometry.dispose()
    this.paper.material.uniforms.uSil.value.dispose()
    this.paper.material.dispose()
    this.scene.environment?.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.canvas.remove()
  }

  private resize() {
    const r = this.stage.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return
    this.w = r.width
    this.h = r.height
    const dpr = Math.min(window.devicePixelRatio || 1, this.hover ? 1.75 : 1.5)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(r.width, r.height, false)
    /* one world unit is one CSS pixel where the mark stands */
    const fov = this.camera.fov
    this.camera.aspect = r.width / r.height
    this.camera.position.set(0, 0, r.height / 2 / Math.tan(((fov / 2) * Math.PI) / 180))
    this.camera.updateProjectionMatrix()
    this.s = Math.min((r.width * 0.86) / (MARK_W + BEVEL * 2), (r.height * 0.78) / (MARK_H + BEVEL * 2))

    const u = this.paper.material.uniforms
    u.uRes.value.set(r.width * dpr, r.height * dpr)
    u.uDpr.value = dpr
    const { k, pad, W, H } = this.sil
    const scale = this.s / k
    u.uRect.value.set(r.width / 2 - (MARK_W / 2) * this.s - pad * scale, r.height / 2 - (MARK_H / 2) * this.s - pad * scale, W * scale, H * scale)
    if (!this.pointer.on) this.light = { x: r.width * 0.22, y: r.height * 0.05 }
    this.wake()
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = this.canvas.getBoundingClientRect()
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, on: true }
  }

  private onLeave = () => {
    this.pointer.on = false
  }

  private wake = () => {
    if (!this.raf && !this.dead && this.visible && !document.hidden) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  private frame = (now: number) => {
    this.raf = 0
    if (this.dead || !this.visible || document.hidden) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const t = (now - this.t0) / 1000
    const calm = this.calm
    const { w, h } = this

    /* where the mark looks and where the light is: the question being
       rested on, else the cursor, else a slow drift of its own */
    const drift = { x: w * (0.5 + Math.sin(t * 0.21) * 0.32), y: h * (0.35 + Math.sin(t * 0.17 + 1) * 0.3) }
    const at = this.look ?? (this.pointer.on ? this.pointer : calm ? { x: w * 0.3, y: h * 0.1 } : drift)
    const k = 1 - Math.exp(-dt * 2.2)
    const tx = clamp((at.x - w / 2) / (w / 2), -1.5, 1.5)
    const ty = clamp((at.y - h / 2) / (h / 2), -1.8, 1.8)
    this.rot.y += (tx * 0.3 - this.rot.y) * k
    this.rot.x += (ty * 0.2 - this.rot.x) * k
    this.light.x += (at.x - this.light.x) * k
    this.light.y += (at.y - this.light.y) * k

    /* the shadow falls away from the light */
    const dx = w / 2 - this.light.x
    const dy = h / 2 - this.light.y + h * 0.35
    const len = Math.hypot(dx, dy) || 1
    const reach = clamp(len * 0.07, 12, 34)
    this.off.x = (dx / len) * reach
    this.off.y = (dy / len) * reach

    /* in: the mark stands up out of the paper; out: it turns away */
    const e = calm ? 1 : ease(clamp((t - 0.25) / 2.4, 0, 1))
    const l = this.leaveAt < 0 ? 0 : ease(clamp((t - this.leaveAt) / 1.3, 0, 1))
    const m = this.mesh
    m.rotation.set(this.rot.x + (1 - e) * -1.15, this.rot.y + l * Math.PI * 0.55, 0)
    m.position.set(0, (1 - e) * -h * 0.12, 0)
    m.scale.setScalar(this.s * (0.9 + 0.1 * e) * (1 - 0.25 * l))
    this.scene.environmentRotation.set(0, this.rot.y * 2.2 + t * 0.02, 0)

    const u = this.paper.material.uniforms
    u.uOff.value.set(this.off.x, this.off.y)
    u.uOn.value = e * (1 - l)
    if (u.uGlow.value) {
      /* the glow where the page's own is, from where this canvas sits */
      const pr = this.page.getBoundingClientRect()
      const cr = this.canvas.getBoundingClientRect()
      u.uOrigin.value.set(cr.left - pr.left, cr.top - pr.top)
      u.uGC.value.set(glowNow.cx, glowNow.cy)
      u.uGR.value.set(glowNow.rx, glowNow.ry)
      u.uGM.value.set(glowNow.mx, glowNow.my, glowNow.on)
      u.uGT.value = glowNow.t
    }

    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.frame)
  }
}
