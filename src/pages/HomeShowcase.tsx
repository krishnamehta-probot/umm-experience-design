import { useCallback, useRef, useState } from 'react'
import { Seg, type Shared } from '@/components/home/LiveHero'
import { HomeAscii } from './HomeAscii'
import { HomePrint } from './HomePrint'
import { HomeParticles } from './HomeParticles'
import { HomeGlow } from './HomeGlow'
import { HomeBlush } from './HomeBlush'

/* ============================================================================
   HOME · SHOWCASE

   The homepage hero on one screen, for presenting: the Options dock opens
   with a Version row (ASCII, Print, Particles, and since 14 Oct Glow and
   Blush, in the styles of Krish's Stacks and Hume references) and under it every option of
   the version showing. Switching version keeps the scene and the colour, so
   the comparison is like for like. The choice is kept in ?v= so a reload
   comes back to it.
   ========================================================================== */

export type Version = 'ascii' | 'print' | 'particles' | 'glow' | 'blush'

const VERSIONS: { id: Version; label: string; hint: string }[] = [
  { id: 'ascii', label: 'ASCII', hint: 'The 3D world drawn in characters, symbols and lines.' },
  { id: 'print', label: 'Print', hint: 'The same world as if printed: dither, halftone, engraving, hatching.' },
  { id: 'particles', label: 'Particles', hint: 'One cloud of grains that pours from shape to shape.' },
  { id: 'glow', label: 'Glow', hint: 'A serif headline over a glow of one brand colour, RAGe’s cards rising out of it.' },
  { id: 'blush', label: 'Blush', hint: 'A wash of two brand colours, the four pillars as tabs over one big ask card.' },
]

const PAGES = { ascii: HomeAscii, print: HomePrint, particles: HomeParticles, glow: HomeGlow, blush: HomeBlush }

export function HomeShowcase({ initial }: { initial: Version }) {
  const [version, setVersion] = useState<Version>(() => {
    const v = new URLSearchParams(window.location.search).get('v')
    return VERSIONS.some((x) => x.id === v) ? (v as Version) : initial
  })
  const shared = useRef<Shared>({ scene: 'home', palette: 'light' })
  const onShared = useCallback((s: Shared) => {
    shared.current = s
  }, [])

  const pick = (v: Version) => {
    setVersion(v)
    window.history.replaceState(null, '', `/home?v=${v}`)
  }

  const Page = PAGES[version]
  return (
    <Page
      key={version}
      switcher={<Seg label="Version" items={VERSIONS} value={version} onPick={pick} />}
      shared={shared.current}
      onShared={onShared}
    />
  )
}
