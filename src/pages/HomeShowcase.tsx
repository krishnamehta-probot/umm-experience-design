import { useCallback, useRef, useState } from 'react'
import { Seg, type Shared } from '@/components/home/LiveHero'
import { HomeAscii } from './HomeAscii'
import { HomePrint } from './HomePrint'
import { HomeParticles } from './HomeParticles'

/* ============================================================================
   HOME · SHOWCASE

   The homepage hero on one screen, for presenting: the Options dock opens
   with a Version row (ASCII, Print, Particles) and under it every option of
   the version showing. Switching version keeps the scene and the colour, so
   the comparison is like for like. The choice is kept in ?v= so a reload
   comes back to it.
   ========================================================================== */

export type Version = 'ascii' | 'print' | 'particles'

const VERSIONS: { id: Version; label: string }[] = [
  { id: 'ascii', label: 'ASCII' },
  { id: 'print', label: 'Print' },
  { id: 'particles', label: 'Particles' },
]

const PAGES = { ascii: HomeAscii, print: HomePrint, particles: HomeParticles }

export function HomeShowcase({ initial }: { initial: Version }) {
  const [version, setVersion] = useState<Version>(() => {
    const v = new URLSearchParams(window.location.search).get('v')
    return VERSIONS.some((x) => x.id === v) ? (v as Version) : initial
  })
  const shared = useRef<Shared>({ scene: 'sphere', palette: 'light' })
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
