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
 *   /film        the "Our work" film alone on a 1920 x 1080 frame, for
 *                scripts/render-film.mjs to export to MP4
 */
export function App() {
  const path = window.location.pathname.replace(/\/$/, '')
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
