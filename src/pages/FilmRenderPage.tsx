import { useEffect } from 'react'
import { ProofFilm } from '@/components/v2/ProofFilm'

/**
 * The "Our work" film alone on its 1920 x 1080 frame, nothing else on the
 * page. scripts/render-film.mjs opens this, steps the film's timeline frame
 * by frame through window.__film, screenshots each frame and encodes them to
 * an MP4. Not linked from anywhere.
 */
export function FilmRenderPage() {
  useEffect(() => {
    document.title = 'UMM: our work in 30 seconds'
    const { style } = document.body
    style.margin = '0'
    style.overflow = 'hidden'
    style.background = '#100e14'
  }, [])

  return <ProofFilm mode="render" />
}
