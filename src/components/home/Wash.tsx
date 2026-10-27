import { useEffect, useRef } from 'react'

/* ============================================================================
   WASH — a quiet full-screen WebGL background for the Glow and Blush heroes

   One fragment shader on a full-screen triangle. It runs slowly on its own;
   the pointer, where a shader reads it at all, only leans it a little and
   is eased over seconds, so it is never a toy. Colours come in as uniforms
   (u_a, u_b, u_c, linear 0–1 RGB) and glide when they change. Reduced
   motion draws one still frame. Without WebGL the canvas stays empty and
   the CSS ground under it shows.
   ========================================================================== */

export type RGB = [number, number, number]

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`

/** A colour token or hex, as 0–1 RGB, resolved from the page. */
export function rgbOf(css: string, el: Element = document.documentElement): RGB {
  const probe = document.createElement('i')
  probe.style.color = css
  el.appendChild(probe)
  const c = getComputedStyle(probe).color
  probe.remove()
  const m = c.match(/[\d.]+/g) ?? ['0', '0', '0']
  return [+m[0] / 255, +m[1] / 255, +m[2] / 255]
}

/** a + (b − a) · t, per channel */
export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

export function Wash({
  frag,
  colors,
  className = '',
}: {
  frag: string
  /** u_a, u_b, u_c: a CSS colour (tokens resolve) or 0–1 RGB */
  colors: [string | RGB, string | RGB, string | RGB]
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const target = useRef<RGB[]>([])
  target.current = colors.map((c) => (typeof c === 'string' ? rgbOf(c) : c))

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl) return
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision highp float;\n' + frag))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (import.meta.env.DEV) console.warn('Wash shader:', gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = (n: string) => gl.getUniformLocation(prog, n)
    const uRes = u('u_res')
    const uTime = u('u_time')
    const uPtr = u('u_ptr')
    const uCol = [u('u_a'), u('u_b'), u('u_c')]

    const col: RGB[] = target.current.map((c) => [...c] as RGB)
    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onMove = (e: PointerEvent) => {
      ptr.tx = e.clientX / window.innerWidth
      ptr.ty = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      cv.width = Math.round(cv.clientWidth * dpr)
      cv.height = Math.round(cv.clientHeight * dpr)
      gl.viewport(0, 0, cv.width, cv.height)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(cv)

    let raf = 0
    let last = performance.now()
    let t = 20
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!still) t += dt
      /* colours glide over about a second, the pointer over about three */
      const k = 1 - Math.exp(-dt * 3)
      col.forEach((c, i) => c.forEach((v, j) => (c[j] = v + (target.current[i][j] - v) * k)))
      const kp = 1 - Math.exp(-dt * 0.8)
      ptr.x += (ptr.tx - ptr.x) * kp
      ptr.y += (ptr.ty - ptr.y) * kp
      gl.uniform2f(uRes, cv.width, cv.height)
      gl.uniform1f(uTime, t)
      gl.uniform2f(uPtr, ptr.x, ptr.y)
      col.forEach((c, i) => gl.uniform3f(uCol[i], c[0], c[1], c[2]))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      /* free what this run made, but keep the context: the canvas is the
         same one when React runs the effect again */
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [frag])

  return <canvas ref={ref} className={`hw ${className}`.trim()} aria-hidden="true" />
}

/* --- shared noise -------------------------------------------------------- */

const NOISE = `
uniform vec2 u_res; uniform float u_time; uniform vec2 u_ptr;
uniform vec3 u_a; uniform vec3 u_b; uniform vec3 u_c;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), w.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), w.x), w.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
`

/** Glow: a soft light rising from the bottom centre. u_a is the paper,
 *  u_b the pastel, u_c the deep core. Its rim wanders slowly; the pointer
 *  leans it a few percent. */
export const GLOW_FRAG =
  NOISE +
  `
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  float t = u_time * 0.045;
  vec2 c = vec2(0.5 + (u_ptr.x - 0.5) * 0.05, -0.08);
  vec2 d = (uv - c) * vec2(asp, 1.0);
  d.x /= 1.0 + 0.25 * asp;
  /* the rim breathes and wanders */
  float w = fbm(vec2(atan(d.y, d.x) * 1.6, t) + t) - 0.5;
  float r = length(d) * (1.0 + w * 0.22) / (1.0 + 0.04 * sin(u_time * 0.35));
  float glow = smoothstep(0.82, 0.12, r);
  float core = smoothstep(0.42, 0.02, r + (fbm(uv * 3.0 - t) - 0.5) * 0.08);
  vec3 col = mix(u_a, u_b, glow);
  col = mix(col, u_c, core * 0.85);
  /* the faintest film grain, so the gradient never bands */
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

/** Blush: a vertical wash, u_a at the top through u_b to the cream u_c at
 *  the bottom, its bands drifting like slow silk. Not interactive. */
export const BLUSH_FRAG =
  NOISE +
  `
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time * 0.035;
  vec2 q = vec2(fbm(uv * 1.6 + vec2(0.0, t)), fbm(uv * 1.6 + vec2(5.2, -t)));
  float y = 1.0 - uv.y + (fbm(uv * 2.2 + q * 1.8 + t) - 0.5) * 0.32;
  vec3 col = mix(u_a, u_b, smoothstep(0.0, 0.62, y));
  col = mix(col, u_c, smoothstep(0.5, 1.02, y));
  /* a soft sheen crossing the top */
  col += 0.035 * smoothstep(0.55, 1.0, fbm(uv * vec2(1.2, 3.0) + vec2(t * 1.4, 0.0))) * (1.0 - y);
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`
