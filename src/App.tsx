import { lazy, Suspense } from 'react'
import { CxUiDesignPage } from './pages/CxUiDesignPage'

/* The comparison page and the styleguide are only ever visited on purpose,
   so they are split out and v2's visitors never download them. */
const ExperienceDesignPage = lazy(() =>
  import('./pages/ExperienceDesignPage').then((m) => ({ default: m.ExperienceDesignPage })),
)
const StyleguidePage = lazy(() =>
  import('./pages/StyleguidePage').then((m) => ({ default: m.StyleguidePage })),
)
const PhonePreview = lazy(() => import('./pages/PhonePreview').then((m) => ({ default: m.PhonePreview })))
const HomeShowcase = lazy(() => import('./pages/HomeShowcase').then((m) => ({ default: m.HomeShowcase })))
const HomeFinal = lazy(() => import('./pages/HomeFinal').then((m) => ({ default: m.HomeFinal })))
const HomeFlank = lazy(() => import('./pages/HomeFlank').then((m) => ({ default: m.HomeFlank })))
const AiAutomationPage = lazy(() =>
  import('./pages/AiAutomationPage').then((m) => ({ default: m.AiAutomationPage })),
)
const CloudDataPage = lazy(() => import('./pages/CloudDataPage').then((m) => ({ default: m.CloudDataPage })))
const EngineeringPage = lazy(() => import('./pages/EngineeringPage').then((m) => ({ default: m.EngineeringPage })))
const GrowthPage = lazy(() => import('./pages/GrowthPage').then((m) => ({ default: m.GrowthPage })))
const UxCommercePage = lazy(() =>
  import('./pages/UxCommercePage').then((m) => ({ default: m.UxCommercePage })),
)
const FilmRenderPage = lazy(() =>
  import('./pages/FilmRenderPage').then((m) => ({ default: m.FilmRenderPage })),
)

/**
 * Three entry points, selected by pathname rather than a hash router — the
 * pages use hash anchors for section navigation, so a hash router would fight
 * them. Vite's SPA fallback serves index.html for every path in both dev and
 * preview.
 *
 *   /            CX and UI Design, v2 (the current iteration)
 *   /v1          the original 12-section Experience Design page, kept for
 *                side-by-side comparison
 *   /styleguide  the living component library
 *   /ai-automation  the AI & Automation service page, on v2's design
 *   /cloud-data  the Cloud & Data service page, on v2's design
 *   /digital-engineering  the Digital Engineering service page
 *   /integrated-growth  the Integrated Growth & Strategy service page
 *   /ux-digital-commerce  the UX & Digital Commerce service page
 *   /home        the umm.digital homepage hero, with an options dock that
 *                switches between its versions (ASCII, print, particles,
 *                glow, blush) and every option of each; /home-ascii,
 *                -print, -particles, -glow and -blush open it on that version
 *   /home-final  the homepage the boss chose (26 Oct): print, engraving,
 *                the UMM mark, in its own layout with nothing on the mark
 *   /home-tiles, /home-glass, /home-window  three new marks for Santosh
 *                (30 Oct), the questions left and right of the ask bar
 *   /home-peek   the same, with no wordmark: the reel peeks up from the
 *                foot of the hero and grows to full screen (31 Oct)
 *   /phone       the three versions side by side in phone-sized frames
 *   /film        the "Our work" film alone on a 1920 x 1080 frame, for
 *                scripts/render-film.mjs to export to MP4
 */
export function App() {
  const path = window.location.pathname.replace(/\/$/, '')
  const homes = {
    '/home': 'ascii',
    '/home-ascii': 'ascii',
    '/home-print': 'print',
    '/home-particles': 'particles',
    '/home-glow': 'glow',
    '/home-blush': 'blush',
  } as const
  if (path in homes) {
    return (
      <Suspense fallback={null}>
        <HomeShowcase initial={homes[path as keyof typeof homes]} />
      </Suspense>
    )
  }
  if (path === '/home-final') {
    return (
      <Suspense fallback={null}>
        <HomeFinal />
      </Suspense>
    )
  }
  const flanks = {
    '/home-tiles': 'tiles',
    '/home-glass': 'glass',
    '/home-window': 'window',
    '/home-peek': 'peek',
  } as const
  if (path in flanks) {
    return (
      <Suspense fallback={null}>
        <HomeFlank initial={flanks[path as keyof typeof flanks]} />
      </Suspense>
    )
  }
  if (path === '/phone') {
    return (
      <Suspense fallback={null}>
        <PhonePreview />
      </Suspense>
    )
  }
  if (path === '/ai-automation') {
    return (
      <Suspense fallback={null}>
        <AiAutomationPage />
      </Suspense>
    )
  }
  if (path === '/cloud-data') {
    return (
      <Suspense fallback={null}>
        <CloudDataPage />
      </Suspense>
    )
  }
  if (path === '/digital-engineering') {
    return (
      <Suspense fallback={null}>
        <EngineeringPage />
      </Suspense>
    )
  }
  if (path === '/integrated-growth') {
    return (
      <Suspense fallback={null}>
        <GrowthPage />
      </Suspense>
    )
  }
  if (path === '/ux-digital-commerce') {
    return (
      <Suspense fallback={null}>
        <UxCommercePage />
      </Suspense>
    )
  }
  if (path === '/film') {
    return (
      <Suspense fallback={null}>
        <FilmRenderPage />
      </Suspense>
    )
  }
  if (path === '/styleguide' || path === '/v1') {
    return (
      <Suspense fallback={null}>
        {path === '/v1' ? <ExperienceDesignPage /> : <StyleguidePage />}
      </Suspense>
    )
  }
  return <CxUiDesignPage />
}
