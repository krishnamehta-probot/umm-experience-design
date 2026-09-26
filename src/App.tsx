import { ExperienceDesignPage } from './pages/ExperienceDesignPage'
import { StyleguidePage } from './pages/StyleguidePage'

/**
 * Two entry points, selected by pathname rather than a hash router — the page
 * itself uses hash anchors for section navigation, so a hash router would
 * fight it. Vite's SPA fallback serves index.html for /styleguide in both dev
 * and preview.
 */
export function App() {
  const isStyleguide = window.location.pathname.replace(/\/$/, '') === '/styleguide'
  return isStyleguide ? <StyleguidePage /> : <ExperienceDesignPage />
}
