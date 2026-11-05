/* ============================================================================
   INDUSTRY ICONS — public/casestudies/icon/*.webp, for the uniform cards on
   /casestudies

   One Cool Shape per industry (Krish, 5 Nov: sir likes the Cool Shapes
   icons). The outlines in industry-shapes.json are coolshapes-react 1.0.1's
   (MIT, (c) 2024 Coolshapes, https://coolshap.es), read from the package's
   source. The finish is drawn here the way the package draws it: a white
   ground, a pale yellow lift, blooms of colour blurred together, and a fine
   grain laid over in overlay, all inside the outline.

   Three sets: <slug>.webp in the Cool Shapes' own bright colours,
   <slug>-pastel.webp in UMM's own pastels, and <slug>-single.webp flat in
   one of UMM's pastels.

     node scripts/render-industry-icons.mjs
   ========================================================================== */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const shapes = JSON.parse(fs.readFileSync(path.join(here, 'industry-shapes.json'), 'utf8'))
const out = path.join(here, '..', 'public', 'casestudies', 'icon')
fs.mkdirSync(out, { recursive: true })

const C = {
  cyan: '#00F0FF', pink: '#FF58E4', yellow: '#FFE53B', blue: '#3D6BFF', lime: '#A6F04A',
  violet: '#9C6BFF', orange: '#FF8A3D', mint: '#2FF0B4', coral: '#FF6B7D',
}
/* UMM's own pastels, exactly (blossom, citrus, sky, sun, coral and the
   lilac), each standing in for the bright colour nearest it (Krish, 5 Nov:
   "the shapes need to be in pastel colours") */
const P = {
  cyan: '#D1E7FF', pink: '#FFC4F2', yellow: '#FFE58F', blue: '#D1E7FF', lime: '#F0FF70',
  violet: '#DCCFFF', orange: '#FFC3C4', mint: '#F0FF70', coral: '#FFC3C4',
}
const SETS = {
  Telecom: ['cyan', 'pink', 'yellow', 'blue'],
  Fintech: ['lime', 'cyan', 'violet', 'yellow'],
  Media: ['pink', 'orange', 'violet', 'yellow'],
  Manufacturing: ['yellow', 'orange', 'pink', 'cyan'],
  Biotech: ['mint', 'cyan', 'violet', 'lime'],
  Technology: ['blue', 'cyan', 'pink', 'violet'],
  Hospitality: ['coral', 'pink', 'yellow', 'orange'],
  Healthcare: ['cyan', 'mint', 'blue', 'pink'],
  Ecommerce: ['orange', 'pink', 'yellow', 'violet'],
  'Real Estate': ['violet', 'blue', 'pink', 'cyan'],
  Gaming: ['lime', 'pink', 'blue', 'yellow'],
  'Beauty & Wellness': ['pink', 'violet', 'yellow', 'coral'],
  Energy: ['yellow', 'orange', 'lime', 'pink'],
  Healthtech: ['mint', 'pink', 'cyan', 'yellow'],
}
/* one flat brand pastel per industry, for the single-colour set (Krish,
   5 Nov: "I was asking for a single colour") */
const SINGLE = {
  Telecom: '#D1E7FF',
  Fintech: '#F0FF70',
  Media: '#FFC4F2',
  Manufacturing: '#FFE58F',
  Biotech: '#DCCFFF',
  Technology: '#D1E7FF',
  Hospitality: '#FFC3C4',
  Healthcare: '#D1E7FF',
  Ecommerce: '#FFC4F2',
  'Real Estate': '#DCCFFF',
  Gaming: '#F0FF70',
  'Beauty & Wellness': '#FFC4F2',
  Energy: '#FFE58F',
  Healthtech: '#FFC3C4',
}
export const slugOf = (industry) => industry.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-')

/** the outline alone, filled flat with one colour */
const flat = (industry) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="360" height="360">${shapes[industry].parts
    .map((p) => `<path fill="${SINGLE[industry]}" d="${p.d}"${p.evenodd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''}/>`)
    .join('')}</svg>`

const svg = (industry, pal, k) => {
  const [a, b, c, d] = SETS[industry].map((n) => pal[n])
  /* the blooms turn a little from one industry to the next */
  const turn = (k * 47) % 360
  const parts = shapes[industry].parts
    .map((p) => `<path fill="#fff" d="${p.d}"${p.evenodd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''}/>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="360" height="360">
  <defs>
    <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200" style="mask-type:alpha">${parts}</mask>
    <filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="n" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox">
      <feTurbulence baseFrequency="0.6" numOctaves="5" seed="4" result="t"/>
      <feComposite in="t" in2="SourceGraphic" operator="in" result="g"/>
      <feBlend in="SourceGraphic" in2="g" mode="overlay"/>
    </filter>
  </defs>
  <g mask="url(#m)">
    <rect width="200" height="200" fill="#fff"/>
    <rect width="200" height="200" fill="#FFF9C5" fill-opacity="0.44"/>
    <g filter="url(#b)" transform="rotate(${turn} 100 100)">
      <rect x="10" y="18" width="140" height="104" fill="${a}" fill-opacity="0.88"/>
      <rect x="58" y="104" width="150" height="112" fill="${b}"/>
      <ellipse cx="158" cy="62" rx="52" ry="42" fill="${c}" fill-opacity="0.9"/>
      <ellipse cx="26" cy="168" rx="50" ry="40" fill="${d}" fill-opacity="0.85"/>
    </g>
    <g style="mix-blend-mode:overlay" opacity="0.55"><rect width="200" height="200" fill="gray" filter="url(#n)"/></g>
  </g>
</svg>`
}

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })
let k = 0
for (const industry of Object.keys(SETS)) {
  for (const [suffix, pal] of [['', C], ['-pastel', P], ['-single', null]]) {
    const art = pal ? svg(industry, pal, k) : flat(industry)
    await page.setContent(`<body style="margin:0;background:transparent">${art}</body>`)
    const png = await page.locator('svg').screenshot({ omitBackground: true })
    const webp = await page.evaluate(async (b64) => {
      const img = new Image()
      img.src = 'data:image/png;base64,' + b64
      await img.decode()
      const cv = document.createElement('canvas')
      cv.width = img.width
      cv.height = img.height
      cv.getContext('2d').drawImage(img, 0, 0)
      return cv.toDataURL('image/webp', 0.9).split(',')[1]
    }, png.toString('base64'))
    fs.writeFileSync(path.join(out, `${slugOf(industry)}${suffix}.webp`), Buffer.from(webp, 'base64'))
  }
  k++
}
await browser.close()
console.log('wrote', Object.keys(SETS).length * 3, 'icons to', out)
