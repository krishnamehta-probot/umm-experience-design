import { useEffect, useRef } from 'react'
import type { Tone } from '@/components/primitives/tone'

/* ============================================================================
   FLUTED GLASS — a tile of soft brand colour seen through reeded glass
   (Krish, 6 Nov: "modern… with our colors and our icons and such nice
   glass type of things", from the Tirtus and Fluxlab references)

   Four soft blobs of the tile's pastels drift over its ground (white, the
   veil grey, or ink, where the pastels read as light). The tile is cut into
   vertical flutes; each flute is a prism showing a mirrored, magnified slice
   of the colour behind it, shaded across its width with a hairline of light
   at its edge, and a fine grain over all. The pointer pulls one blob after
   it and slides the colour through the flutes.

   Draws only while on screen; holds one still frame for reduced motion;
   falls back to a CSS wash without WebGL. A change of tones eases across.
   ========================================================================== */

const HEX: Record<string, string> = {
  sky: '#d1e7ff',
  blossom: '#ffc4f2',
  citrus: '#f0ff70',
  sun: '#ffe58f',
  coral: '#ffc3c4',
  lilac: '#dccfff',
}

const GROUND = { paper: '#ffffff', veil: '#ececef', ink: '#100e14' } as const
type Ground = keyof typeof GROUND

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uT;
uniform vec3 uM;
uniform vec3 uG;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uN;
uniform float uInk;

float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 blob(vec3 col, vec3 c, vec2 p, vec2 at, vec2 r, float k) {
  vec2 d = (p - at) / r;
  return mix(col, c, exp(-dot(d, d)) * k);
}

vec3 field(vec2 p) {
  float t = uT;
  vec3 col = uG;
  float a = uRes.x / uRes.y;
  vec2 r = vec2(0.5 / max(a, 0.6), 0.5) * 0.95;
  col = blob(col, uC0, p, vec2(0.18 + 0.10 * sin(t * 0.23), 0.30 + 0.14 * cos(t * 0.19)), r * 1.15, 0.96);
  col = blob(col, uC1, p, vec2(0.80 + 0.08 * cos(t * 0.21), 0.34 + 0.16 * sin(t * 0.17)), r * 1.05, 0.96);
  col = blob(col, uC2, p, vec2(0.50 + 0.18 * sin(t * 0.13 + 1.3), 0.92 + 0.06 * cos(t * 0.27)), r * 1.2, 0.92);
  vec2 m = mix(vec2(0.62 + 0.12 * sin(t * 0.29 + 2.1), 0.06 + 0.10 * cos(t * 0.11)), uM.xy, 0.55 * uM.z);
  col = blob(col, uC3, p, m, r * 0.85, 0.9);
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;
  float fx = uv.x * uN;
  float i = floor(fx);
  float f = fract(fx);
  float slide = (uM.x - 0.5) * 0.14 * uM.z + sin(uT * 0.17) * 0.012;
  float sx = (i + 0.5) / uN + (0.5 - f) * 2.1 / uN + slide;
  vec3 col = field(vec2(sx, uv.y + (f - 0.5) * 0.02));
  float shade = pow(f, 1.7);
  col = mix(col, col * mix(0.88, 0.62, uInk), shade * 0.6);
  col += smoothstep(0.9, 1.0, 1.0 - f) * mix(0.09, 0.07, uInk);
  col += (h(gl_FragCoord.xy + fract(uT) * 37.0) - 0.5) * 0.04;
  gl_FragColor = vec4(col, 1.0);
}
`

export function FlutedGlass({
  tones,
  ground = 'paper',
  flutes = 18,
  className = '',
}: {
  /** up to four brand pastels; fewer are repeated */
  tones: Tone[]
  ground?: Ground
  flutes?: number
  className?: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const want = useRef<number[][]>([])
  want.current = [0, 1, 2, 3].map((k) => rgb(HEX[tones[k % tones.length]] ?? HEX.sky))

  useEffect(() => {
    const el = host.current
    if (!el) return
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) {
      el.classList.add('is-fallback')
      return
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      el.classList.add('is-fallback')
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const at = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(at)
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
    const u = (n: string) => gl.getUniformLocation(prog, n)
    const U = {
      res: u('uRes'),
      t: u('uT'),
      m: u('uM'),
      g: u('uG'),
      c: [u('uC0'), u('uC1'), u('uC2'), u('uC3')],
      n: u('uN'),
      ink: u('uInk'),
    }
    el.appendChild(canvas)
    requestAnimationFrame(() => el.classList.add('is-ready'))

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cols = want.current.map((c) => [...c])
    const pointer = { x: 0.5, y: 0.5, on: 0 }
    const m = { x: 0.5, y: 0.5, on: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr))
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (!running) draw(performance.now())
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      const inside = x > -0.1 && x < 1.1 && y > -0.1 && y < 1.1
      pointer.on = inside && e.pointerType === 'mouse' ? 1 : 0
      if (inside) {
        pointer.x = x
        pointer.y = y
      }
    }

    const t0 = performance.now() - Math.random() * 20000
    let last = performance.now()
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const k = calm ? 1 : 1 - Math.exp(-dt * 2.4)
      m.x += (pointer.x - m.x) * k
      m.y += (pointer.y - m.y) * k
      m.on += (pointer.on - m.on) * k
      const kc = calm ? 1 : 1 - Math.exp(-dt * 2)
      cols.forEach((c, i) => c.forEach((v, j) => (c[j] = v + (want.current[i][j] - v) * kc)))
      gl.uniform2f(U.res, canvas.width, canvas.height)
      gl.uniform1f(U.t, calm ? 14 : (now - t0) / 1000)
      gl.uniform3f(U.m, m.x, m.y, m.on)
      gl.uniform3fv(U.g, rgb(GROUND[ground]))
      U.c.forEach((loc, i) => gl.uniform3fv(loc, cols[i]))
      gl.uniform1f(U.n, flutes)
      gl.uniform1f(U.ink, ground === 'ink' ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    let raf = 0
    let running = false
    const loop = (now: number) => {
      draw(now)
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
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [ground, flutes])

  return <div ref={host} className={`flg flg--${ground} ${className}`.trim()} aria-hidden="true" />
}
