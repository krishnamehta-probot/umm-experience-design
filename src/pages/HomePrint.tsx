import { useEffect, useState } from 'react'
import { asciiChips } from '@/content/home'
import { useScene } from '@/components/home/HomeParts'
import { LiveHero, PALETTES, SceneSet, Seg, type VersionProps } from '@/components/home/LiveHero'
import { EFFECTS } from '@/components/home/ascii/DeckStage'
import { PRINT_STYLES, PrintScene, type PrintOpts } from '@/components/home/ascii/PrintScene'
import { LANDING, SCENES, type SceneId } from '@/components/home/ascii/scenes'
import { useDeck } from '@/components/home/useDeck'
import { usePeek } from '@/components/home/usePeek'
import { useRage } from '@/components/home/useRage'

/* ============================================================================
   HOME · PRINT

   The same 3D scenes as the ASCII version, put on the page the way a press
   would: 1-bit dither, halftone dots, banknote line engraving or pen
   crosshatching. Scene changes dissolve pixel by pixel through the dither
   pattern. On arrival, contour lines flow around the copy; hovering a chip
   calls up its scene; asking dissolves into RAGe.
   ========================================================================== */

const SCENE_ROW = [LANDING, ...SCENES]
const CHIP_SCENES = asciiChips.map((c) => c.scene as SceneId)

const GRAINS = [
  { id: 2, label: 'Fine', hint: 'A fine screen: smooth from a distance.' },
  { id: 3, label: 'Medium', hint: 'The print shows its pattern without losing the shape.' },
  { id: 5, label: 'Coarse', hint: 'A coarse screen: the pattern is the picture.' },
]

export function HomePrint({ switcher, shared, onShared }: VersionProps) {
  const rage = useRage({ leave: 1500 })
  const [opts, setOpts] = useState<PrintOpts>({ style: 'engrave', palette: shared.palette, grain: 3, effect: 'magnify' })
  const { shown, peekOf } = usePeek(opts)
  const [canvas, engine] = useScene((c) => new PrintScene(c, shared.scene, opts))
  const deck = useDeck<SceneId>({ engine, rage, chipScenes: CHIP_SCENES, exit: 'rage', rest: shared.scene })

  useEffect(() => {
    onShared({ scene: deck.scene, palette: opts.palette })
  }, [deck.scene, opts.palette, onShared])

  useEffect(() => {
    engine.current?.setOpts(shown)
  }, [shown, engine])

  const set = <K extends keyof PrintOpts>(k: K) => (v: PrintOpts[K]) => setOpts((o) => ({ ...o, [k]: v }))

  return (
    <LiveHero
      rage={rage}
      palette={shown.palette}
      version="print"
      canvas={<canvas ref={canvas} className="ha__gl" aria-hidden="true" />}
      onChip={deck.onChip}
      onChipLeave={deck.onChipLeave}
      dock={
        <>
          {switcher}
          <SceneSet items={SCENE_ROW} value={deck.scene} onPick={deck.pick} onPeek={deck.peek} />
          <Seg label="Print" items={PRINT_STYLES} value={opts.style} onPick={set('style')} onPeek={peekOf('style')} />
          <Seg label="Colour" items={PALETTES} value={opts.palette} onPick={set('palette')} onPeek={peekOf('palette')} />
          <Seg label="Grain" items={GRAINS} value={opts.grain} onPick={set('grain')} onPeek={peekOf('grain')} />
          <Seg label="Cursor" items={EFFECTS} value={opts.effect} onPick={set('effect')} onPeek={peekOf('effect')} />
        </>
      }
    />
  )
}
