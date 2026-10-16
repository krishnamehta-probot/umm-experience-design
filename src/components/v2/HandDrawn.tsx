import '@/styles/cloud-ind.css'

/* ============================================================================
   HAND-DRAWN SCENES · THE SHARED PIECES

   16 Oct, Krish: the industry cards' animations should be like the ones on
   umm.digital's home page: black line drawings of hands at work, a cuff
   solid or striped, the objects white, a scatter of confetti, each a short
   bouncy loop. Cloud's scenes were drawn first (cloud/art.tsx); Growth's
   use the same pieces, so they live here: the line and fill styles, the
   hand, and the confetti burst. The shared motion (the burst, the marching
   routes, the twinkling flecks, the tile) is cloud-ind.css.
   ========================================================================== */

export const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** filled paper, outlined */
export const SOLID = { ...LINE, fill: 'var(--umm-paper)' } as const

/** A hand pointing along +x, wrist at the origin: the cuff behind, three
 *  fingers and a thumb in front, in the site's style. */
export function Hand({ cuff = 'ink' }: { cuff?: 'ink' | 'stripe' }) {
  return (
    <g>
      <path {...SOLID} d="M-30 -8.6h22v17.2h-22z" />
      <rect
        {...LINE}
        x="-12"
        y="-11"
        width="12"
        height="22"
        rx="3"
        fill={cuff === 'ink' ? 'currentColor' : 'var(--umm-paper)'}
      />
      {cuff === 'stripe' && <path {...LINE} d="M-8.6 -10.6v21.2M-5 -10.8v21.6M-1.6 -10.6v21.2" />}
      <path
        {...SOLID}
        d="M0 -9C6 -10 9 -10.6 12 -10.4H22c3.6 0 3.6 6 0 6c3.2 0 3.2 6 -.4 6c3 0 3 5.8 -.6 5.8H12C8 9.8 4 10.2 0 9.4z"
      />
      <path {...LINE} d="M13 -4.4h8.6M13 1.6h8M12.6 7.4h7" />
      <path {...SOLID} d="M5 -10.2C8 -15.6 14 -16.8 18.6 -14.8c2 .9 1.4 3.4 -.8 3.6L12 -10.4" />
    </g>
  )
}

/** small confetti that pops round a point */
export function Burst({ className, x, y }: { className: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`cd-ind__burst ${className}`} {...LINE}>
        <path d="M0 -9v-5M7 -6l3.4 -3.4M-7 -6l-3.4 -3.4M9 1h5M-9 1h-5" />
      </g>
    </g>
  )
}
