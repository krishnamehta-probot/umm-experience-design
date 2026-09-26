/**
 * The five brand surfaces — the whole palette, named after the colours
 * themselves rather than the slots they used to occupy. Setting `data-umm-tone`
 * on any element re-points --umm-tone / --umm-tone-wash / --umm-tone-signal for
 * that whole subtree, so descendants recolor without any of them naming a color.
 *
 * Ordered so consecutive items in a list land on colours that sit apart from
 * each other: warm, cold, warm, cold, warm.
 */
export const TONES = ['sun', 'sky', 'blossom', 'citrus', 'coral'] as const

export type Tone = (typeof TONES)[number]

/**
 * Walks the tone sequence so a list of any length stays evenly distributed
 * across the palette rather than repeating one accent.
 */
export function toneAt(index: number): Tone {
  return TONES[index % TONES.length]
}

/**
 * The CSS variable holding a tone's surface colour. Components that must hand
 * a colour to an inline style go through this instead of naming a hex, so the
 * five stay defined in exactly one place (tokens.css) and a palette change
 * propagates instead of needing to be chased through the components.
 */
export function toneVar(tone: Tone): string {
  return `var(--umm-${tone})`
}
