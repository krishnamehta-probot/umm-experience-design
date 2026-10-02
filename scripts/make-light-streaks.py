"""
Light streaks: fluted glass in front of a curved sweep of light.

Makes public/why-light.webp, the ground of section 2 ("Why it matters").
After the light-streak reference Krish shared (the homepage's blue
streaks): a bright arc rising from the bottom left to the top right, seen
through vertical reeded glass, so every reed refracts the arc a little
differently and the light steps from flute to flute.

How it is built, the way the real thing works:
  1. the light: a bright core along a curve, a broad glow on its inner side,
     everything brighter towards the right
  2. the glass: each flute is a vertical cylinder lens, so it samples the
     light from a shifted, mirrored x; each flute also gets a lit edge and a
     shaded edge
  3. colour: brightness mapped from the page's ink, through deep and bright
     blue, to the palette's sky blue and near white
  4. a whisper of noise so the gradients never band

Rendered at 2x and downsampled for clean flute edges.

    python scripts/make-light-streaks.py
"""

import numpy as np
from PIL import Image

W, H = 2560, 1120        # output size: the stage's own wide shape, so little is cropped
SS = 2                   # supersampling
FLUTE = 110              # flute width at output size (at the right edge)

w, h = W * SS, H * SS
fw = FLUTE * SS

y, x = np.mgrid[0:h, 0:w].astype(np.float32)

# --- 2. the glass: where each pixel looks through to ------------------------
# the glass is turned a little away from us, so the flutes crowd together
# towards the left: lay them out on a warped x
gx = w * (x / w) ** 0.78
gfw = fw * 0.78 * (np.maximum(x, 1) / w) ** -0.22     # local flute width in x
u = (gx % fw) / fw                             # 0..1 across a flute
# a cylinder lens magnifies a narrow slice of what's behind it, so the arc
# runs steeper inside each flute and steps where one flute meets the next
xs = x - 0.8 * (u - 0.5) * gfw
flute = np.floor(gx / fw)
# a little unevenness between flutes, as in real glass
tint = 0.9 + 0.2 * np.abs(np.sin(flute * 12.9898) * 43758.5453 % 1)

# --- 1. the light, sampled at the refracted x ---------------------------------
nx = xs / w                                    # 0..1 across
ny = y / h
# the arc hugs the bottom, then sweeps hard up the right edge (a J)
curve = 1.0 - 0.95 * np.clip(nx, 0, 1.2) ** 3.4           # the arc's height
slope = 0.95 * 3.4 * np.clip(nx, 1e-3, 1.2) ** 2.4 * (h / w)
d = (ny - curve) / np.sqrt(1 + slope ** 2)                  # +: inside the arc

core = np.exp(-((d - 0.01) / 0.055) ** 2)                   # the bright edge
glow = np.where(d > 0, np.exp(-d / 0.17), np.exp(d / 0.08)) # inner glow
rightward = np.clip(nx, 0, 1) ** 1.35
light = (
    0.4 * core * (0.25 + 0.95 * rightward)
    + 0.62 * glow * (0.12 + 1.0 * rightward)
    + 0.06 * (0.35 + 0.65 * ny)      # navy ambience, a touch more low down
    + 0.06 * rightward
) * tint

# --- 2b. the flutes' own edges: a hairline of light on the left, shade to
#     the right ------------------------------------------------------------------
edge_lit = np.exp(-(u / 0.025))
edge_dim = np.exp(-((1 - u) / 0.3))
light = light * (1 - 0.28 * edge_dim) + edge_lit * light * 0.9

# --- 3. colour ------------------------------------------------------------------
stops = [  # brightness -> colour (sRGB 0-255)
    (0.00, (16, 14, 20)),      # the page's ink
    (0.08, (8, 14, 40)),
    (0.30, (8, 40, 160)),      # deep blue
    (0.55, (20, 95, 245)),     # bright blue
    (0.80, (70, 158, 255)),
    (1.00, (150, 205, 255)),
    (1.30, (209, 231, 255)),   # palette sky, the hottest edges only
]
xs_stop = np.array([s[0] for s in stops], dtype=np.float32)
cols = np.array([s[1] for s in stops], dtype=np.float32)
lit = np.clip(light, 0, 1.3)
rgb = np.stack([np.interp(lit, xs_stop, cols[:, c]) for c in range(3)], axis=-1)

# --- 4. downsample and dither -------------------------------------------------------
rgb = rgb.reshape(H, SS, W, SS, 3).mean(axis=(1, 3))
rng = np.random.default_rng(7)
rgb += rng.normal(0, 1.1, rgb.shape)
img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')
img.save('public/why-light.webp', quality=90, method=6)
print('saved public/why-light.webp', img.size)
