import { useEffect, useState } from 'react'
import { asciiChips } from '@/content/home'
import { useScene } from '@/components/home/HomeParts'
import { LiveHero, PALETTES, SceneSet, Seg, type VersionProps } from '@/components/home/LiveHero'
import { AsciiScene, CHARSETS, type AsciiOpts } from '@/components/home/ascii/AsciiScene'
import { EFFECTS } from '@/components/home/ascii/DeckStage'
import { LANDING, SCENES, type SceneId } from '@/components/home/ascii/scenes'
import { useDeck } from '@/components/home/useDeck'
import { usePeek } from '@/components/home/usePeek'
import { useRage } from '@/components/home/useRage'

/* ============================================================================
   HOME · ASCII

   The live hero over a world drawn entirely in characters. On arrival,
   contour lines flow across the page and around the copy; hovering a chip
   scrambles, cell by cell, into that chip's scene, and back when the
   pointer leaves. The cursor bends the characters; asking scrambles
   everything into RAGe.
   ========================================================================== */

const SCENE_ROW = [LANDING, ...SCENES]
const CHIP_SCENES = asciiChips.map((c) => c.scene as SceneId)

const SIZES = [
  { id: 8, label: 'S', hint: 'Small characters: the most detail.' },
  { id: 11, label: 'M', hint: 'Medium characters: detail you can still read as type.' },
  { id: 14, label: 'L', hint: 'Large characters: the type itself becomes the texture.' },
  { id: 19, label: 'XL', hint: 'Extra large: a few big characters, very graphic.' },
]

export function HomeAscii({ switcher, shared, onShared }: VersionProps) {
  const rage = useRage({ leave: 1500 })
  const [opts, setOpts] = useState<AsciiOpts>({ charset: 'ascii', palette: shared.palette, cell: 11, effect: 'ripple' })
  const { shown, peekOf } = usePeek(opts)
  const [canvas, engine] = useScene((c) => new AsciiScene(c, shared.scene, opts))
  const deck = useDeck<SceneId>({ engine, rage, chipScenes: CHIP_SCENES, exit: 'rage', rest: shared.scene })

  useEffect(() => {
    onShared({ scene: deck.scene, palette: opts.palette })
  }, [deck.scene, opts.palette, onShared])

  useEffect(() => {
    engine.current?.setOpts(shown)
  }, [shown, engine])

  const set = <K extends keyof AsciiOpts>(k: K) => (v: AsciiOpts[K]) => setOpts((o) => ({ ...o, [k]: v }))

  return (
    <LiveHero
      rage={rage}
      palette={shown.palette}
      version="ascii"
      canvas={<canvas ref={canvas} className="ha__gl" aria-hidden="true" />}
      onChip={deck.onChip}
      onChipLeave={deck.onChipLeave}
      dock={
        <>
          {switcher}
          <SceneSet items={SCENE_ROW} value={deck.scene} onPick={deck.pick} onPeek={deck.peek} />
          <Seg label="Characters" items={CHARSETS} value={opts.charset} onPick={set('charset')} onPeek={peekOf('charset')} />
          <Seg label="Colour" items={PALETTES} value={opts.palette} onPick={set('palette')} onPeek={peekOf('palette')} />
          <Seg label="Cell size" items={SIZES} value={opts.cell} onPick={set('cell')} onPeek={peekOf('cell')} />
          <Seg label="Cursor" items={EFFECTS} value={opts.effect} onPick={set('effect')} onPeek={peekOf('effect')} />
        </>
      }
    />
  )
}
