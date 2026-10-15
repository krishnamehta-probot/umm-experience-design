import { useEffect } from 'react'
import { ProofFilm } from '@/components/v2/ProofFilm'
import { AiFilm } from '@/components/ai/AiFilm'
import { CloudFilm } from '@/components/cloud/CloudFilm'
/* the upright frame's layout (data-tall) lives with the phone styles */
import '@/styles/v2-phone.css'

/**
 * A film alone on its frame, nothing else on the page: the CX page's (/film),
 * the AI page's (/film?film=ai) or the Cloud & Data page's
 * (/film?film=cloud), wide 1920 x 1080 or, with &cut=tall, upright
 * 1080 x 1920 for phones. scripts/render-film.mjs opens this, steps the
 * film's timeline frame by frame through window.__film, screenshots each
 * frame and encodes them to the MP4s the pages play. Not linked from
 * anywhere.
 */
export function FilmRenderPage() {
  const q = new URLSearchParams(window.location.search)
  const which = q.get('film')
  const ai = which === 'ai'
  const cloud = which === 'cloud'
  const tall = q.get('cut') === 'tall'

  useEffect(() => {
    document.title = ai ? 'UMM: AI in practice' : cloud ? 'UMM: cloud and data work' : 'UMM: our work in 30 seconds'
    const { style } = document.body
    style.margin = '0'
    style.overflow = 'hidden'
    style.background = '#100e14'
  }, [ai, cloud])

  if (ai) return <AiFilm mode="render" tall={tall} />
  if (cloud) return <CloudFilm mode="render" tall={tall} />
  return <ProofFilm mode="render" tall={tall} />
}
