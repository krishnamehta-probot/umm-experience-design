/* ============================================================================
   GLASS CUBE

   The homepage's floating glass cube, drawn in CSS until the real asset is
   supplied: six translucent faces with a pastel edge glow, turning slowly and
   bobbing. Each face carries a different brand colour at its edge, so as the
   cube turns the tint travels round it the way light moves through glass.

   Purely decorative and static under reduced motion (see v2.css).
   ========================================================================== */

const FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const

export function GlassCube({ className = '' }: { className?: string }) {
  return (
    <div className={`cx-cube ${className}`.trim()} aria-hidden="true">
      <div className="cx-cube__bob">
        <div className="cx-cube__spin">
          {FACES.map((f) => (
            <span key={f} className={`cx-cube__face cx-cube__face--${f}`} />
          ))}
        </div>
      </div>
      <span className="cx-cube__shadow" />
    </div>
  )
}
