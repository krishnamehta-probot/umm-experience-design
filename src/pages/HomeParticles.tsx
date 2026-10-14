import { useEffect, useState } from 'react'
import { asciiChips } from '@/content/home'
import { useScene } from '@/components/home/HomeParts'
import { LiveHero, PALETTES, SceneSet, Seg, type VersionProps } from '@/components/home/LiveHero'
import { ParticleScene, type ParticleOpts, type Pull } from '@/components/home/ParticleScene'
import { SCENES, type SceneId } from '@/components/home/ascii/scenes'
import { useDeck } from '@/components/home/useDeck'
import { useRage } from '@/components/home/useRage'

/* ============================================================================
   HOME · PARTICLES

   One cloud of fine grains behind the live hero, pouring from shape to
   shape: the hero's sphere, the UMM mark, the eye, the mountains, a data
   city, a tunnel, a knot. Each chip pours it into its own shape; the cursor
   scatters it like sand; asking pours it into RAGe's name.
   ========================================================================== */

const ORDER = SCENES.map((s) => s.id)
const CHIP_SCENES = asciiChips.map((c) => c.scene as SceneId)

const COUNTS = [
  { id: 20000, label: '20k' },
  { id: 40000, label: '40k' },
  { id: 80000, label: '80k' },
]
const SIZES = [
  { id: 2, label: 'S' },
  { id: 3, label: 'M' },
  { id: 4.5, label: 'L' },
]
const PULLS: { id: Pull; label: string }[] = [
  { id: 'scatter', label: 'Scatter' },
  { id: 'attract', label: 'Attract' },
  { id: 'swirl', label: 'Swirl' },
]

export function HomeParticles({ switcher, shared, onShared }: VersionProps) {
  const rage = useRage({ leave: 1700 })
  const [opts, setOpts] = useState<ParticleOpts>(() => ({
    count: window.innerWidth < 760 ? 20000 : 40000,
    size: 3,
    palette: shared.palette,
    pull: 'scatter',
  }))
  const [canvas, engine] = useScene((c) => new ParticleScene(c, shared.scene, opts))
  const deck = useDeck<SceneId>({ engine, rage, order: ORDER, chipScenes: CHIP_SCENES, exit: 'rage', first: shared.scene })

  useEffect(() => {
    onShared({ scene: deck.scene, palette: opts.palette })
  }, [deck.scene, opts.palette, onShared])

  useEffect(() => {
    engine.current?.setOpts(opts)
  }, [opts, engine])

  return (
    <LiveHero
      rage={rage}
      palette={opts.palette}
      version="particles"
      canvas={<canvas ref={canvas} className="ha__gl" aria-hidden="true" />}
      onChip={deck.onChip}
      onChipLeave={deck.onChipLeave}
      dock={
        <>
          {switcher}
          <SceneSet label="Shape" items={SCENES} value={deck.scene} auto={deck.auto} onAuto={deck.toggleAuto} onPick={deck.pick} />
          <Seg label="Particles" items={COUNTS} value={opts.count} onPick={(v) => setOpts((o) => ({ ...o, count: v }))} />
          <Seg label="Grain size" items={SIZES} value={opts.size} onPick={(v) => setOpts((o) => ({ ...o, size: v }))} />
          <Seg label="Colour" items={PALETTES} value={opts.palette} onPick={(v) => setOpts((o) => ({ ...o, palette: v }))} />
          <Seg label="Cursor" items={PULLS} value={opts.pull} onPick={(v) => setOpts((o) => ({ ...o, pull: v }))} />
        </>
      }
    />
  )
}
