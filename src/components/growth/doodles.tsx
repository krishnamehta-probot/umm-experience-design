/* ============================================================================
   INTEGRATED GROWTH · DOODLES

   17 Oct: the little drawn things the Gensify stage and the discovery
   pictures share, in the services' hand: an ink outline round a filled
   shape. Each fills with --fill (set by the caller's CSS), so one drawing
   can be any brand colour. Shapes only, no words; all decorative.
   ========================================================================== */

/** A star's outline as SVG points: n tips on radius R, notches on radius r. */
export function starPoints(cx: number, cy: number, R: number, r: number, n = 5, turn = -90) {
  return Array.from({ length: n * 2 }, (_, k) => {
    const a = ((turn + (k * 180) / n) * Math.PI) / 180
    const d = k % 2 ? r : R
    return `${(cx + d * Math.cos(a)).toFixed(2)},${(cy + d * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

const SPARKLE =
  'M20 3C21.7 13.6 26.4 18.3 37 20C26.4 21.7 21.7 26.4 20 37C18.3 26.4 13.6 21.7 3 20C13.6 18.3 18.3 13.6 20 3Z'

export type DoodleKind = 'sparkle' | 'star' | 'smiley' | 'squiggle' | 'heart'

export function Doodle({ kind, className = '' }: { kind: DoodleKind; className?: string }) {
  const cls = `gx-doodle gx-doodle--${kind} ${className}`.trim()
  if (kind === 'sparkle')
    return (
      <svg className={cls} viewBox="0 0 40 40" aria-hidden="true">
        <path className="gx-doodle__fill" d={SPARKLE} />
      </svg>
    )
  if (kind === 'star')
    return (
      <svg className={cls} viewBox="0 0 40 40" aria-hidden="true">
        <polygon className="gx-doodle__fill" points={starPoints(20, 21, 17, 7.6)} />
      </svg>
    )
  if (kind === 'smiley')
    return (
      <svg className={cls} viewBox="0 0 40 40" aria-hidden="true">
        <circle className="gx-doodle__fill" cx="20" cy="20" r="16" />
        <ellipse className="gx-doodle__dot" cx="14.6" cy="16.6" rx="1.9" ry="2.7" />
        <ellipse className="gx-doodle__dot" cx="25.4" cy="16.6" rx="1.9" ry="2.7" />
        <path className="gx-doodle__line" d="M13 23.4Q20 31 27 23.4" />
      </svg>
    )
  if (kind === 'squiggle')
    return (
      <svg className={cls} viewBox="0 0 56 28" aria-hidden="true">
        <path className="gx-doodle__under" d="M5 19C9 6 15 5 18 14S26 25 30 14S38 3 43 10S49 19 51 12" />
        <path className="gx-doodle__over" d="M5 19C9 6 15 5 18 14S26 25 30 14S38 3 43 10S49 19 51 12" />
      </svg>
    )
  return (
    <svg className={cls} viewBox="0 0 40 40" aria-hidden="true">
      <path
        className="gx-doodle__fill"
        d="M20 34.5C9 26.6 4.6 20.4 5.6 13.9C6.5 7.8 14.3 5.3 20 11.4C25.7 5.3 33.5 7.8 34.4 13.9C35.4 20.4 31 26.6 20 34.5Z"
      />
    </svg>
  )
}

/** The wand that gensifies: a star on a stick, with two sparks off it. */
export function Wand() {
  return (
    <svg className="gx-wand__svg" viewBox="0 0 100 100" aria-hidden="true">
      <line className="gx-wand__stick" x1="12" y1="90" x2="58" y2="44" />
      <line className="gx-wand__band" x1="49" y1="53" x2="57" y2="45" />
      <polygon className="gx-wand__shadow" points={starPoints(73, 31, 23, 10.5, 5, -78)} />
      <polygon className="gx-wand__star" points={starPoints(70, 28, 23, 10.5, 5, -78)} />
      <path className="gx-wand__spark" d={SPARKLE} transform="translate(83 52) scale(0.34)" />
      <path className="gx-wand__spark" d={SPARKLE} transform="translate(30 6) scale(0.27)" />
    </svg>
  )
}
