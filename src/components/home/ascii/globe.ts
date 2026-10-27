import * as THREE from 'three'

/* ============================================================================
   GLOBE DATA — the earth for the dotted globe form (forms.ts)

   The continents as coarse hand-drawn outlines (longitude, latitude),
   painted once into an equirectangular mask, plus the city pairs the data
   arcs fly between.
   ========================================================================== */

export const GLOBE_R = 1.35

/* prettier-ignore */
const LAND: [number, number][][] = [
  /* North America */
  [[-168, 66], [-162, 70], [-140, 70], [-125, 70], [-95, 72], [-80, 73], [-62, 66], [-55, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 22], [-92, 18], [-87, 21], [-88, 15], [-83, 9], [-80, 8], [-83, 8], [-86, 11], [-92, 15], [-105, 20], [-110, 23], [-114, 30], [-118, 34], [-124, 40], [-124, 48], [-133, 56], [-150, 60], [-160, 58], [-165, 62]],
  /* Greenland */
  [[-55, 60], [-43, 60], [-20, 70], [-18, 80], [-35, 83], [-60, 82], [-70, 77], [-58, 70]],
  /* South America */
  [[-80, 8], [-75, 11], [-62, 11], [-50, 0], [-35, -5], [-39, -15], [-48, -25], [-58, -35], [-65, -41], [-69, -52], [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-78, 4]],
  /* Eurasia */
  [[-10, 36], [-9, 43], [-1, 46], [-4, 48], [2, 51], [8, 54], [8, 57], [5, 62], [14, 68], [25, 71], [40, 68], [60, 70], [70, 73], [80, 73], [100, 77], [115, 73], [130, 71], [150, 71], [170, 69], [180, 66], [178, 62], [163, 60], [160, 54], [156, 51], [140, 54], [135, 44], [130, 42], [127, 38], [126, 35], [121, 31], [122, 25], [115, 22], [109, 21], [108, 16], [109, 12], [105, 9], [100, 13], [100, 7], [103, 1], [98, 8], [98, 16], [94, 17], [92, 22], [88, 22], [80, 15], [77, 8], [73, 17], [72, 21], [67, 25], [57, 25], [56, 27], [50, 30], [48, 29], [50, 25], [56, 24], [59, 22], [52, 16], [45, 13], [43, 15], [39, 22], [35, 28], [34, 31], [35, 36], [30, 36], [27, 37], [26, 40], [29, 41], [28, 44], [23, 40], [20, 40], [18, 40], [16, 38], [12, 42], [8, 44], [3, 43], [0, 39], [-5, 36]],
  /* Africa */
  [[-17, 21], [-10, 30], [-6, 36], [10, 37], [11, 33], [20, 31], [30, 31], [32, 30], [33, 27], [37, 21], [39, 16], [43, 12], [51, 12], [48, 5], [42, -1], [40, -10], [40, -16], [35, -24], [32, -29], [27, -34], [20, -35], [18, -30], [12, -17], [13, -6], [9, -1], [9, 4], [5, 6], [-4, 5], [-8, 4], [-13, 8], [-17, 14]],
  /* Madagascar */
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  /* Australia */
  [[114, -22], [114, -34], [118, -35], [123, -34], [131, -31], [138, -35], [141, -38], [146, -39], [150, -37], [153, -28], [153, -25], [146, -19], [142, -11], [137, -12], [136, -15], [130, -11], [126, -14], [122, -17]],
  /* Britain */
  [[-5, 50], [1, 51], [2, 53], [-1, 55], [-2, 58], [-5, 58], [-6, 56], [-3, 54], [-5, 52]],
  /* Iceland */
  [[-24, 64], [-14, 64], [-14, 66], [-22, 66]],
  /* Japan */
  [[130, 31], [135, 34], [140, 35], [142, 40], [141, 45], [145, 44], [140, 41], [136, 37], [132, 35]],
  /* Sumatra, Borneo, New Guinea */
  [[95, 5], [98, 4], [106, -6], [104, -6], [100, -2]],
  [[109, 1], [110, -3], [116, -4], [119, 1], [117, 7], [113, 3]],
  [[131, -1], [141, -3], [150, -10], [142, -9], [136, -5]],
  /* New Zealand */
  [[172, -35], [178, -38], [174, -41], [167, -46], [171, -44]],
]

const MW = 1024
const MH = 512
let mask: HTMLCanvasElement | null = null
let maskData: Uint8ClampedArray | null = null

/** The continents as an equirectangular mask: white land, clear sea. */
export function landMask() {
  if (mask) return mask
  mask = document.createElement('canvas')
  mask.width = MW
  mask.height = MH
  const g = mask.getContext('2d')!
  g.fillStyle = '#fff'
  for (const poly of LAND) {
    g.beginPath()
    poly.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * MW
      const y = ((90 - lat) / 180) * MH
      if (i) g.lineTo(x, y)
      else g.moveTo(x, y)
    })
    g.closePath()
    g.fill()
  }
  return mask
}

/** Whether a direction from the centre points at land. */
export function isLand(v: THREE.Vector3) {
  if (!maskData) maskData = landMask().getContext('2d')!.getImageData(0, 0, MW, MH).data
  const n = v.clone().normalize()
  const lat = Math.asin(n.y)
  const lon = Math.atan2(-n.z, n.x)
  const x = Math.min(MW - 1, Math.floor((lon / (Math.PI * 2) + 0.5) * MW))
  const y = Math.min(MH - 1, Math.floor((0.5 - lat / Math.PI) * MH))
  return maskData[(y * MW + x) * 4 + 3] > 128
}

/** A point on the globe, from latitude and longitude in degrees. */
export const geo = (lat: number, lon: number, r: number) => {
  const a = THREE.MathUtils.degToRad(lat)
  const b = THREE.MathUtils.degToRad(lon)
  return new THREE.Vector3(Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b)).multiplyScalar(r)
}

/** City pairs the arcs fly between (latitude, longitude). */
export const ROUTES: [number, number][][] = [
  [[33.7, -84.4], [51.5, -0.1]],
  [[33.7, -84.4], [19.1, 72.9]],
  [[33.7, -84.4], [37.8, -122.4]],
  [[33.7, -84.4], [40.7, -74.0]],
  [[51.5, -0.1], [25.2, 55.3]],
  [[19.1, 72.9], [1.35, 103.8]],
  [[19.1, 72.9], [25.2, 55.3]],
  [[40.7, -74.0], [-23.5, -46.6]],
]

/** Every city on a route, once. */
export const CITIES = [...new Map(ROUTES.flat().map((c) => [c.join(), c])).values()]

/** The bezier an arc flies along, lifted off the surface by its length. */
export function arcCurve(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).normalize().multiplyScalar(GLOBE_R + a.distanceTo(b) * 0.45)
  return new THREE.QuadraticBezierCurve3(a, mid, b)
}

export const routeCurves = () => ROUTES.map(([a, b]) => arcCurve(geo(a[0], a[1], GLOBE_R), geo(b[0], b[1], GLOBE_R)))
