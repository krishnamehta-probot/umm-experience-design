/* ============================================================================
   Export a service page's film to MP4

     npm run dev            (in another terminal)
     node scripts/render-film.mjs [out.mp4] [--film cx|ai|cloud|eng|growth|ux] [--tall] [--web]
                                  [--fps 30] [--url http://localhost:5173]

   The pages play these files (useFilmVideo), so after changing a film,
   export its four cuts again into public/film:

     node scripts/render-film.mjs public/film/cx-wide.mp4 --web
     node scripts/render-film.mjs public/film/cx-tall.mp4 --tall --web
     node scripts/render-film.mjs public/film/ai-wide.mp4 --film ai --web
     node scripts/render-film.mjs public/film/ai-tall.mp4 --film ai --tall --web
     node scripts/render-film.mjs public/film/cloud-wide.mp4 --film cloud --web
     node scripts/render-film.mjs public/film/cloud-tall.mp4 --film cloud --tall --web
     node scripts/render-film.mjs public/film/eng-wide.mp4 --film eng --web
     node scripts/render-film.mjs public/film/eng-tall.mp4 --film eng --tall --web
     node scripts/render-film.mjs public/film/growth-wide.mp4 --film growth --web
     node scripts/render-film.mjs public/film/growth-tall.mp4 --film growth --tall --web
     node scripts/render-film.mjs public/film/ux-wide.mp4 --film ux --web
     node scripts/render-film.mjs public/film/ux-tall.mp4 --film ux --tall --web

   Opens /film (the film alone on its 1920 x 1080 frame, or 1080 x 1920
   with --tall, the cut upright phones get), steps its GSAP
   timeline one frame at a time through window.__film.seek(), screenshots
   each frame and pipes them straight into ffmpeg. Because every frame is
   seeked, not played, the export is exact whatever the machine's speed: no
   dropped frames, every cut on the frame it was timed for.

   Output: H.264, yuv420p (plays everywhere, LinkedIn and decks included),
   no audio track. --web trades a little quality for a file a page can
   stream on a phone. Default file: exports/umm-our-work-30s.mp4
   ========================================================================== */

import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import ffmpeg from 'ffmpeg-static'
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const out = resolve(args.find((a) => a.endsWith('.mp4')) ?? 'exports/umm-our-work-30s.mp4')
const fps = Number(flag('--fps', 30))
const url = flag('--url', 'http://localhost:5173')
const which = flag('--film', 'cx')
const tall = args.includes('--tall')
const web = args.includes('--web')

mkdirSync(dirname(out), { recursive: true })

/* real Chrome if it's installed: it draws the blur and 3D on the GPU, which
   is several times faster than Playwright's software-rendered Chromium */
let browser
try {
  browser = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist'] })
} catch {
  browser = await chromium.launch()
}
const page = await browser.newPage({
  viewport: tall ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
})
await page.goto(`${url}/film?film=${which}${tall ? '&cut=tall' : ''}`, { waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__film)
await page.evaluate(() => window.__film.ready)
await page.evaluate(() => document.fonts.ready)
const duration = await page.evaluate(() => window.__film.duration)
const frames = Math.round(duration * fps)

const enc = spawn(
  ffmpeg,
  [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(fps),
    '-c:v', 'mjpeg',
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', web ? '24' : '17',
    ...(web ? ['-profile:v', 'high', '-level', '4.1', '-maxrate', '6M', '-bufsize', '12M'] : []),
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    out,
  ],
  { stdio: ['pipe', 'ignore', 'pipe'] },
)
let encErr = ''
enc.stderr.on('data', (d) => {
  encErr = (encErr + d).slice(-2000)
})
const encoded = new Promise((res, rej) =>
  enc.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}\n${encErr}`)))),
)

const t0 = Date.now()
for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.__film.seek(t), f / fps)
  /* two frames for the browser to lay out and paint the seeked state */
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  const jpg = await page.screenshot({ type: 'jpeg', quality: 95 })
  if (!enc.stdin.write(jpg)) await new Promise((r) => enc.stdin.once('drain', r))
  if (f % fps === 0) {
    const s = (Date.now() - t0) / 1000
    console.log(`frame ${f}/${frames}  (${(f / fps).toFixed(0)}s of film, ${s.toFixed(0)}s elapsed)`)
  }
}
enc.stdin.end()
await encoded
await browser.close()
console.log(`done: ${out}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`)
