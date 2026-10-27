import { useEffect, useState } from 'react'
import { asciiChips } from '@/content/home'
import { useScene } from '@/components/home/HomeParts'
import { LiveHero, PALETTES, SceneSet, Seg, type VersionProps } from '@/components/home/LiveHero'
import { PULLS, ParticleScene, type ParticleOpts } from '@/components/home/ParticleScene'
import { LANDING, SCENES, type SceneId } from '@/components/home/ascii/scenes'
import { useDeck } from '@/components/home/useDeck'
import { usePeek } from '@/components/home/usePeek'
import { useRage } from '@/components/home/useRage'

/* ============================================================================
   HOME · PARTICLES

   One cloud of fine grains behind the live hero. On arrival it lies along
   contour lines that flow around the copy; hovering a chip pours it into
   that chip's shape: the data stack, the tunnel, the eye, the
   quarter tiles, the globe and the mountains. The cursor moves the grains near
   it; asking pours the cloud into RAGe's name.
   ========================================================================== */

const SCENE_ROW = [LANDING, ...SCENES]
const CHIP_SCENES = asciiChips.map((c) => c.scene as SceneId)

/* the count rebuilds the cloud, so it is chosen, never previewed on hover */
const COUNTS = [
  { id: 20000, label: '20k', hint: 'A light cloud; the shapes read as sketches.' },
  { id: 40000, label: '40k', hint: 'The shapes read clearly and stay airy.' },
  { id: 80000, label: '80k', hint: 'A dense cloud, almost solid. Needs a strong machine.' },
]
const SIZES = [
  { id: 2, label: 'S', hint: 'Fine grains, like dust.' },
  { id: 3, label: 'M', hint: 'Grains like fine sand.' },
  { id: 4.5, label: 'L', hint: 'Larger grains: the cloud reads as dots.' },
]

export function HomeParticles({ switcher, shared, onShared }: VersionProps) {
  const rage = useRage({ leave: 1700 })
  const [opts, setOpts] = useState<ParticleOpts>(() => ({
    count: window.innerWidth < 760 ? 20000 : 40000,
    size: 3,
    palette: shared.palette,
    pull: 'scatter',
  }))
  const { shown, peekOf } = usePeek(opts)
  const [canvas, engine] = useScene((c) => new ParticleScene(c, shared.scene, opts))
  const deck = useDeck<SceneId>({ engine, rage, chipScenes: CHIP_SCENES, exit: 'rage', rest: shared.scene })

  useEffect(() => {
    onShared({ scene: deck.scene, palette: opts.palette })
  }, [deck.scene, opts.palette, onShared])

  useEffect(() => {
    engine.current?.setOpts(shown)
  }, [shown, engine])

  const set = <K extends keyof ParticleOpts>(k: K) => (v: ParticleOpts[K]) => setOpts((o) => ({ ...o, [k]: v }))

  return (
    <LiveHero
      rage={rage}
      palette={shown.palette}
      version="particles"
      canvas={<canvas ref={canvas} className="ha__gl" aria-hidden="true" />}
      onChip={deck.onChip}
      onChipLeave={deck.onChipLeave}
      dock={
        <>
          {switcher}
          <SceneSet label="Shape" items={SCENE_ROW} value={deck.scene} onPick={deck.pick} onPeek={deck.peek} />
          <Seg label="Particles" items={COUNTS} value={opts.count} onPick={set('count')} />
          <Seg label="Grain size" items={SIZES} value={opts.size} onPick={set('size')} onPeek={peekOf('size')} />
          <Seg label="Colour" items={PALETTES} value={opts.palette} onPick={set('palette')} onPeek={peekOf('palette')} />
          <Seg label="Cursor" items={PULLS} value={opts.pull} onPick={set('pull')} onPeek={peekOf('pull')} />
        </>
      }
    />
  )
}
