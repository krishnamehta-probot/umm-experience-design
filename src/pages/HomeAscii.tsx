import { useEffect, useState } from 'react'
import { asciiChips } from '@/content/home'
import { useScene } from '@/components/home/HomeParts'
import { LiveHero, PALETTES, SceneSet, Seg, type VersionProps } from '@/components/home/LiveHero'
import { AsciiScene, type AsciiOpts, type Charset } from '@/components/home/ascii/AsciiScene'
import { EFFECTS } from '@/components/home/ascii/DeckStage'
import { SCENES, type SceneId } from '@/components/home/ascii/scenes'
import { useDeck } from '@/components/home/useDeck'
import { useRage } from '@/components/home/useRage'

/* ============================================================================
   HOME · ASCII

   The live hero over a 3D world drawn entirely in characters. The world
   changes scene on its own every few seconds, each change scrambling across
   the screen cell by cell. Hovering a chip calls up that chip's scene; the
   cursor bends the characters; asking scrambles everything into RAGe.
   ========================================================================== */

const ORDER = SCENES.map((s) => s.id)
const CHIP_SCENES = asciiChips.map((c) => c.scene as SceneId)

const CHARSETS: { id: Charset; label: string }[] = [
  { id: 'ascii', label: 'ASCII' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'dots', label: 'Dots' },
  { id: 'binary', label: 'Binary' },
]
const SIZES = [
  { id: 8, label: 'S' },
  { id: 11, label: 'M' },
  { id: 14, label: 'L' },
  { id: 19, label: 'XL' },
]

export function HomeAscii({ switcher, shared, onShared }: VersionProps) {
  const rage = useRage({ leave: 1500 })
  const [opts, setOpts] = useState<AsciiOpts>({ charset: 'ascii', palette: shared.palette, cell: 11, effect: 'ripple' })
  const [canvas, engine] = useScene((c) => new AsciiScene(c, shared.scene, opts))
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
      version="ascii"
      canvas={<canvas ref={canvas} className="ha__gl" aria-hidden="true" />}
      onChip={deck.onChip}
      onChipLeave={deck.onChipLeave}
      dock={
        <>
          {switcher}
          <SceneSet items={SCENES} value={deck.scene} auto={deck.auto} onAuto={deck.toggleAuto} onPick={deck.pick} />
          <Seg label="Characters" items={CHARSETS} value={opts.charset} onPick={(v) => setOpts((o) => ({ ...o, charset: v }))} />
          <Seg label="Colour" items={PALETTES} value={opts.palette} onPick={(v) => setOpts((o) => ({ ...o, palette: v }))} />
          <Seg label="Cell size" items={SIZES} value={opts.cell} onPick={(v) => setOpts((o) => ({ ...o, cell: v }))} />
          <Seg label="Cursor" items={EFFECTS} value={opts.effect} onPick={(v) => setOpts((o) => ({ ...o, effect: v }))} />
        </>
      }
    />
  )
}
