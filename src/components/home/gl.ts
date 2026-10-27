import * as THREE from 'three'

/* ============================================================================
   GL — the bits the three hero scenes share: a renderer that sizes itself to
   its canvas, a frame loop that sleeps when the hero is off screen, a pointer
   in normalised device coordinates, the brand palette as GL colours and a
   3D simplex noise for the shaders.
   ========================================================================== */

/* The shaders write colour straight to the canvas with no colour-space pass,
   so the palette is held as the sRGB values themselves, not linearised. */
export const glColors = (hex: string[]) =>
  hex.map((c) => new THREE.Color(c).convertLinearToSRGB())

export const PALETTE = glColors(['#ffc4f2', '#f0ff70', '#d1e7ff', '#ffe58f', '#ffc3c4'])

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export abstract class Stage {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera: THREE.PerspectiveCamera
  /** pointer in NDC, eased toward `pointerTarget` every frame */
  pointer = new THREE.Vector2(0, 0)
  pointerTarget = new THREE.Vector2(0, 0)
  pointerIn = false
  width = 1
  height = 1
  time = 0
  slow = reducedMotion()

  private raf = 0
  private last = 0
  private visible = true
  private ro: ResizeObserver
  private io: IntersectionObserver
  protected canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, fov = 35) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      if (this.visible) this.start()
    })
    this.io.observe(canvas)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.addEventListener('pointerleave', this.onLeave)
  }

  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect()
    this.pointerTarget.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1,
    )
    this.pointerIn = true
  }
  private onLeave = () => {
    this.pointerIn = false
  }

  resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (!w || !h) return
    this.width = w
    this.height = h
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.onResize()
  }

  protected onResize() {}
  protected abstract frame(dt: number): void

  start() {
    if (this.raf) return
    this.last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - this.last) / 1000, 1 / 20)
      this.last = now
      this.time += this.slow ? dt * 0.35 : dt
      /* a slow follow: the scenes lean after the cursor, never snap to it */
      this.pointer.lerp(this.pointerTarget, 1 - Math.exp(-1.3 * dt))
      this.frame(dt)
      this.renderer.render(this.scene, this.camera)
      this.raf = this.visible ? requestAnimationFrame(loop) : 0
    }
    this.raf = requestAnimationFrame(loop)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.ro.disconnect()
    this.io.disconnect()
    window.removeEventListener('pointermove', this.onMove)
    document.removeEventListener('pointerleave', this.onLeave)
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      mats.forEach((mat) => {
        Object.values(mat).forEach((v) => v instanceof THREE.Texture && v.dispose())
        if ('uniforms' in mat)
          Object.values((mat as THREE.ShaderMaterial).uniforms).forEach(
            (u) => u.value instanceof THREE.Texture && u.value.dispose(),
          )
        mat.dispose()
      })
    })
    this.renderer.dispose()
  }
}

/** Frame-rate independent ease toward a target. */
export const damp = (a: number, b: number, k: number, dt: number) =>
  a + (b - a) * (1 - Math.exp(-k * dt))

/* Ashima / Stefan Gustavson 3D simplex noise, MIT. */
export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`
