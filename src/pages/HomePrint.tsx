import { useEffect, useState } from 'react'
import { asciiChips } from '@/content/home'
import { useScene } from '@/components/home/HomeParts'
import { LiveHero, PALETTES, SceneSet, Seg, type VersionProps } from '@/components/home/LiveHero'
import { EFFECTS } from '@/components/home/ascii/DeckStage'
import { PRINT_STYLES, PrintScene, type PrintOpts } from '@/components/home/ascii/PrintScene'
import { SCENES, type SceneId } from '@/components/home/ascii/scenes'
import { useDeck } from '@/components/home/useDeck'
import { useRage } from '@/components/home/useRage'

/* ============================================================================
   HOME · PRINT

   The same 3D scenes as the ASCII version, put on the page the way a press
   would: 1-bit dither, halftone dots, banknote line engraving or pen
   crosshatching. Scene changes dissolve pixel by pixel through the dither
   pattern. Hovering a chip calls up its scene; asking dissolves into RAGe.
   ========================================================================== */

const ORDER = SCENES.map((s) => s.id)
const CHIP_SCENES = asciiChips.map((c) => c.scene as SceneId)

const GRAINS = [
  { id: 2, label: 'Fine' },
  { id: 3, label: 'Medium' },
  { id: 5, label: 'Coarse' },
]

export function HomePrint({ switcher, shared, onShared }: VersionProps) {
  const rage = useRage({ leave: 1500 })
  const [opts, setOpts] = useState<PrintOpts>({ style: 'engrave', palette: shared.palette, grain: 3, effect: 'magnify' })
  const [canvas, engine] = useScene((c) => new PrintScene(c, shared.scene, opts))
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
      version="print"
      canvas={<canvas ref={canvas} className="ha__gl" aria-hidden="true" />}
      onChip={deck.onChip}
      onChipLeave={deck.onChipLeave}
      dock={
        <>
          {switcher}
          <SceneSet items={SCENES} value={deck.scene} auto={deck.auto} onAuto={deck.toggleAuto} onPick={deck.pick} />
          <Seg label="Print" items={PRINT_STYLES} value={opts.style} onPick={(v) => setOpts((o) => ({ ...o, style: v }))} />
          <Seg label="Colour" items={PALETTES} value={opts.palette} onPick={(v) => setOpts((o) => ({ ...o, palette: v }))} />
          <Seg label="Grain" items={GRAINS} value={opts.grain} onPick={(v) => setOpts((o) => ({ ...o, grain: v }))} />
          <Seg label="Cursor" items={EFFECTS} value={opts.effect} onPick={(v) => setOpts((o) => ({ ...o, effect: v }))} />
        </>
      }
    />
  )
}
