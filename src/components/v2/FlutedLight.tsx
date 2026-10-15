import { useEffect, useRef } from 'react'

/* ============================================================================
   FLUTED LIGHT — section 2's ground, drawn live in a shader

   A J of blue light rising from the bottom left to the top right, seen
   through vertical reeded glass, after the light-streak reference. This is
   the same recipe scripts/make-light-streaks.py once baked into a picture,
   now computed per pixel every frame, so it can move:

     1. the glass: each flute is a cylinder lens, so it looks through to a
        shifted, mirrored x; flutes crowd to the left (the glass is turned a
        little away), each has a lit edge and a shaded one
     2. the light: a bright core along the J, a broad glow inside it,
        stronger to the right
     3. colour: brightness mapped from the page's ink through deep and
        bright blue to the palette's sky (or, with tone="lilac", through
        violet to the palette's lilac: the AI page)

   `progress` (0–1, the section's scroll) sweeps the J: it rises and opens
   as the story moves on. A slow drift keeps it breathing at rest. Draws only
   while on screen; falls back to a CSS glow without WebGL.
   ========================================================================== */

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

/** Brightness to colour, dark to bright: the page's ink, then six steps up
 *  to the palette colour the light ends on (0–255 per channel). */
const RAMPS = {
  sky: [
    [16, 14, 20],
    [8, 14, 40],
    [8, 40, 160],
    [20, 95, 245],
    [70, 158, 255],
    [150, 205, 255],
    [209, 231, 255],
  ],
  lilac: [
    [16, 14, 20],
    [20, 10, 42],
    [58, 24, 150],
    [112, 62, 232],
    [158, 120, 255],
    [200, 180, 255],
    [220, 207, 255],
  ],
  /* the Cloud & Data page's: ink through deep olive to citrus */
  citrus: [
    [16, 14, 20],
    [14, 22, 10],
    [38, 66, 8],
    [104, 150, 18],
    [170, 212, 42],
    [212, 240, 88],
    [240, 255, 112],
  ],
  /* the Digital Engineering page's: ink through deep plum to blossom */
  blossom: [
    [16, 14, 20],
    [26, 10, 30],
    [80, 20, 90],
    [160, 50, 170],
    [220, 120, 220],
    [245, 180, 240],
    [255, 196, 242],
  ],
  /* the Integrated Growth page's: ink through deep amber to sun */
  sun: [
    [16, 14, 20],
    [26, 18, 8],
    [90, 56, 6],
    [180, 120, 14],
    [232, 180, 60],
    [250, 214, 120],
    [255, 226, 137],
  ],
}
export type LightTone = keyof typeof RAMPS

const glslVec = ([r, g, b]: number[]) => `vec3(${r.toFixed(1)}, ${g.toFixed(1)}, ${b.toFixed(1)})`

const frag = (tone: LightTone) => {
  const [c0, c1, c2, c3, c4, c5, c6] = RAMPS[tone].map(glslVec)
  return `
precision highp float;
uniform vec2 uRes;
uniform float uT;
uniform float uP;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 ramp(float v) {
  vec3 c0 = ${c0};
  vec3 c1 = ${c1};
  vec3 c2 = ${c2};
  vec3 c3 = ${c3};
  vec3 c4 = ${c4};
  vec3 c5 = ${c5};
  vec3 c6 = ${c6};
  vec3 c = c0;
  c = mix(c, c1, smoothstep(0.0, 0.08, v));
  c = mix(c, c2, clamp((v - 0.08) / 0.22, 0.0, 1.0));
  c = mix(c, c3, clamp((v - 0.30) / 0.25, 0.0, 1.0));
  c = mix(c, c4, clamp((v - 0.55) / 0.25, 0.0, 1.0));
  c = mix(c, c5, clamp((v - 0.80) / 0.20, 0.0, 1.0));
  c = mix(c, c6, clamp((v - 1.00) / 0.30, 0.0, 1.0));
  return c / 255.0;
}

void main() {
  float w = uRes.x;
  float h = uRes.y;
  float x = gl_FragCoord.x;
  float y = h - gl_FragCoord.y;

  // 1. the glass
  float fw = w / 23.0;
  float gx = w * pow(x / w, 0.78);
  float gfw = fw * 0.78 * pow(max(x, 1.0) / w, -0.22);
  float u = fract(gx / fw);
  float fl = floor(gx / fw);
  float xs = x - 0.8 * (u - 0.5) * gfw;
  float tint = 0.9 + 0.2 * hash(fl);

  // 2. the light, sampled at the refracted x; the J sweeps with the scroll
  float nx = xs / w;
  float ny = y / h;
  float k = 3.4 - 0.9 * uP;
  float amp = 0.95 + 0.08 * uP;
  float off = 0.035 * sin(uT * 0.22) + 0.05 * sin(uT * 0.13 + 1.7) - 0.1 * uP;
  float cx = clamp(nx + off, 0.001, 1.2);
  float curve = 1.0 - amp * pow(cx, k);
  float slope = amp * k * pow(cx, k - 1.0) * (h / w);
  float d = (ny - curve) / sqrt(1.0 + slope * slope);
  float core = exp(-pow((d - 0.01) / 0.055, 2.0));
  float glow = d > 0.0 ? exp(-d / 0.17) : exp(d / 0.08);
  float rw = pow(clamp(nx, 0.0, 1.0), 1.35);
  float pulse = 1.0 + 0.06 * sin(uT * 0.5);
  float beam = (0.4 * core * (0.25 + 0.95 * rw) * pulse + 0.62 * glow * (0.12 + rw)) * tint;
  // the ambience is even: per-flute tint and edges only show where there is
  // real light, so the dark stays clean instead of striped
  float light = beam + 0.05 * (0.35 + 0.65 * ny) + 0.05 * rw;

  // the flutes' own edges: a hairline of light on the left, shade on the right
  float lit = exp(-u / 0.025);
  float dim = exp(-(1.0 - u) / 0.3);
  float e = smoothstep(0.12, 0.45, beam);
  light = light * (1.0 - 0.28 * dim * e) + lit * light * 0.9 * e;

  // 3. colour, with a whisper of dither so the gradients never band
  vec3 col = ramp(clamp(light, 0.0, 1.3));
  col += (hash(gl_FragCoord.x * 0.37 + gl_FragCoord.y * 1.31 + fract(uT)) - 0.5) / 128.0;
  gl_FragColor = vec4(col, 1.0);
}
`
}

export function FlutedLight({ progress, tone = 'sky' }: { progress: { current: number }; tone?: LightTone }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) {
      el.classList.add('is-fallback')
      return
    }
    el.appendChild(canvas)

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, frag(tone)))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      el.classList.add('is-fallback')
      canvas.remove()
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uT = gl.getUniformLocation(prog, 'uT')
    const uP = gl.getUniformLocation(prog, 'uP')

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.max(1, Math.round(el.clientWidth * dpr))
      const h = Math.max(1, Math.round(el.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let p = progress.current
    let frame = 0
    let visible = false
    const t0 = performance.now()
    const draw = () => {
      // eased toward the scroll, so a jump in the scroll never jolts the light
      p += (progress.current - p) * 0.08
      gl.uniform1f(uT, still ? 0 : (performance.now() - t0) / 1000)
      gl.uniform1f(uP, p)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      frame = visible && !still ? requestAnimationFrame(draw) : 0
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !frame) frame = requestAnimationFrame(draw)
    })
    io.observe(el)
    draw()

    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      ro.disconnect()
      canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [progress, tone])

  return <div className="cx-why__light" ref={host} data-tone={tone} aria-hidden="true" />
}
