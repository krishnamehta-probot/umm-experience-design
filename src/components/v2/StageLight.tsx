import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/* ============================================================================
   STAGE LIGHT — the picture behind each stage's number

   The same material as section 2's ground (scripts/make-light-streaks.py):
   light seen through vertical fluted glass, so every flute refracts it a
   little differently and the light steps from flute to flute. Here it is
   live, in a fragment shader, and what the light IS grows with the company:

     Startups     one spark, low on the right: the idea, just lit
     Growing      the curve: a J of light rising to the top right
     Enterprises  the skyline: every flute a lit tower, the whole width on

   Each is tinted with its stage's colour (sun, blossom, sky), deepened so it
   glows on the dark. All three are one function of the stage value `u`, the
   same number that winds the odometer, so the picture morphs with the
   scroll rather than switching. The shader eases its own copy of `u` toward
   the target, which smooths a tap on the tabs (phones) into a morph too.

   The top-left corner is held dark: that is where the number sits.

   Draws only while on screen. Reduced motion: no drift, and a stage change
   swaps straight to the new picture. No WebGL: the CSS ground shows instead.
   ========================================================================== */

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float u;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

// brightness -> colour, from the page's ink through the stage's own ramp
vec3 ramp(float l, vec3 deep, vec3 mid, vec3 hot) {
  vec3 ink = vec3(16.0, 14.0, 20.0) / 255.0;
  vec3 c = mix(ink, deep, smoothstep(0.0, 0.16, l));
  c = mix(c, mid, smoothstep(0.12, 0.62, l));
  c = mix(c, hot, smoothstep(0.55, 1.02, l));
  return mix(c, vec3(1.0), smoothstep(1.0, 1.5, l) * 0.6);
}

void main() {
  vec2 q = gl_FragCoord.xy / res;          // 0..1, y up
  float a = res.x / res.y;

  // --- the glass: flutes crowd together to the left, as if turned away
  float N = 15.0;
  float gx = pow(q.x, 0.8) * N;
  float id = floor(gx);
  float fu = fract(gx);
  float fw = 1.0 / (N * 0.8 * pow(max(q.x, 0.02), -0.2));
  float xs = q.x - 0.85 * (fu - 0.5) * fw;  // where this pixel looks through to
  float tint = 0.88 + 0.24 * hash(id + 3.0);
  vec2 p = vec2(xs, q.y);

  // --- 1 · the spark: one point of light, a halo, and a thin rising beam
  vec2 c = vec2(0.74 + 0.012 * sin(t * 0.5), 0.34 + 0.02 * sin(t * 0.7));
  float d = length((p - c) * vec2(a, 1.0));
  float pulse = 0.9 + 0.1 * sin(t * 1.6);
  float spark = 1.3 * exp(-pow(d / 0.05, 2.0)) * pulse
              + 0.5 * exp(-d / 0.17)
              + 0.75 * exp(-pow((q.x - c.x) * a / 0.05, 2.0))
                     * smoothstep(c.y - 0.02, c.y + 0.12, q.y) * pow(1.0 - q.y, 0.7)
                     * (0.8 + 0.2 * sin(q.y * 18.0 - t * 2.4))
              + 0.18 * exp(-pow((p.y - 0.06) / 0.18, 2.0)) * smoothstep(0.25, 0.9, p.x);

  // --- 2 · the curve: a J of light, low on the left, up the right edge
  float yc = 0.05 + 0.92 * pow(p.x, 2.7);
  float slope = 0.92 * 2.7 * pow(max(p.x, 0.001), 1.7) / a;
  float dc = (yc - p.y) / sqrt(1.0 + slope * slope);   // +: under the curve
  float right = pow(clamp(p.x, 0.0, 1.0), 1.3);
  float run = 0.78 + 0.22 * sin(p.x * 7.0 - t * 0.9);   // light travelling up it
  float curve = 0.55 * exp(-pow((dc - 0.008) / 0.04, 2.0)) * (0.3 + 0.9 * right) * run
              + 0.62 * (dc > 0.0 ? exp(-dc / 0.16) : exp(dc / 0.05)) * (0.12 + right);

  // --- 3 · the skyline: each flute a tower, taller to the right
  float x0 = (id + 0.5) / N;
  float h = 0.14 + 0.6 * pow(pow(x0, 1.0 / 0.8), 0.9) * (0.55 + 0.45 * hash(id + 11.0))
          + 0.015 * sin(t * 0.6 + id * 1.7);
  float below = h - q.y;
  float sky = (below > 0.0 ? 0.32 * exp(-below / 0.32) + 0.1 : 0.0)
            + 0.9 * exp(-pow(below / 0.014, 2.0))                     // the lit roofline
            + 0.25 * exp(-max(-below, 0.0) / 0.05) * step(below, 0.0); // glow above it
  // a few lit windows drifting on and off inside the towers
  float row = floor(q.y * 46.0);
  float lit = step(0.84, hash(id * 31.0 + row + floor(t * 0.4 + hash(row + id) * 6.0)));
  float pane = smoothstep(0.0, 0.12, fract(q.y * 46.0)) * smoothstep(1.0, 0.7, fract(q.y * 46.0))
             * smoothstep(0.15, 0.3, fu) * smoothstep(0.85, 0.7, fu);
  sky += (below > 0.03 ? 0.3 * lit * pane : 0.0);
  sky *= 0.55 + 0.5 * right;

  // --- blend the three by the same stage value as the odometer
  float w0 = clamp(1.0 - abs(u - 0.0), 0.0, 1.0);
  float w1 = clamp(1.0 - abs(u - 1.0), 0.0, 1.0);
  float w2 = clamp(1.0 - abs(u - 2.0), 0.0, 1.0);
  float light = (w0 * spark + w1 * curve + w2 * sky) * tint;
  light += 0.05 + 0.04 * right;

  // the flutes' own edges: a hairline of light on the left, shade to the right
  light = light * (1.0 - 0.3 * exp(-(1.0 - fu) / 0.3)) + exp(-fu / 0.025) * light * 0.9;

  // keep the corner where the number sits dark
  float corner = length((q - vec2(0.0, 1.0)) * vec2(1.0, 1.25));
  light *= mix(0.22, 1.0, smoothstep(0.25, 0.85, corner));

  // each stage's colour, deepened to glow on the dark
  vec3 deep = w0 * vec3(0.20, 0.10, 0.0) + w1 * vec3(0.20, 0.02, 0.17) + w2 * vec3(0.03, 0.06, 0.30);
  vec3 mid  = w0 * vec3(1.0, 0.62, 0.06) + w1 * vec3(0.92, 0.26, 0.74) + w2 * vec3(0.08, 0.38, 0.96);
  vec3 hot  = w0 * vec3(1.0, 0.90, 0.56) + w1 * vec3(1.0, 0.77, 0.95) + w2 * vec3(0.82, 0.91, 1.0);
  vec3 col = ramp(light, deep, mid, hot);

  // a whisper of grain so the gradients never band
  col += (hash(dot(gl_FragCoord.xy, vec2(1.0, 113.0)) + fract(t)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
}

export function StageLight({ u }: { u: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const target = useRef(u)
  const wake = useRef<() => void>(() => {})
  const reduced = useReducedMotion()

  target.current = u
  useEffect(() => wake.current(), [u])

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) return
    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (!vs || !fs || !prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'res')
    const uT = gl.getUniformLocation(prog, 't')
    const uU = gl.getUniformLocation(prog, 'u')

    el.dataset.ready = ''

    let shown = target.current
    let visible = false
    let raf = 0
    let last = performance.now()
    const start = last

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.max(1, Math.round(el.clientWidth * dpr))
      const h = Math.max(1, Math.round(el.clientHeight * dpr))
      if (el.width !== w || el.height !== h) {
        el.width = w
        el.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const draw = (now: number) => {
      size()
      gl.uniform2f(uRes, el.width, el.height)
      gl.uniform1f(uT, reduced ? 4 : (now - start) / 1000)
      gl.uniform1f(uU, shown)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = (now: number) => {
      raf = 0
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      // Follow the target: close enough to track a scroll, slow enough to
      // turn a tap into a morph.
      shown = reduced ? target.current : shown + (target.current - shown) * (1 - Math.exp(-dt * 7))
      if (Math.abs(target.current - shown) < 0.0005) shown = target.current
      draw(now)
      if (visible && (!reduced || shown !== target.current)) raf = requestAnimationFrame(frame)
    }

    const kick = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    wake.current = kick

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(el)
    const ro = new ResizeObserver(kick)
    ro.observe(el)

    return () => {
      wake.current = () => {}
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      delete el.dataset.ready
    }
  }, [reduced])

  return <canvas className="cx-stage__light" ref={canvas} aria-hidden="true" />
}
