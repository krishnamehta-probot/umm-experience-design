import type { ReactNode, SVGProps } from 'react'

/* ============================================================================
   UMM ICON GRAMMAR

   Every icon in this system obeys the same rules, which is what makes a set of
   forty drawings read as one family:

     Canvas        24 x 24
     Live area     20 x 20 (2px optical padding on every side)
     Stroke        1.5, currentColor, round cap, round join
     Fill          none, except a single "node" dot where an icon needs to
                   point at a specific moment in a journey
     Geometry      circles, straight runs and 45 degree diagonals only

   Icons inherit color from their parent, so a tone context recolors them for
   free and there is never a hard-coded hex in an icon file.
   ========================================================================== */

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Rendered size in px. Sits on the 24px grid, so prefer 16/20/24/32/40. */
  size?: number
  /** Overrides the 1.5 default for oversized display use. */
  strokeWidth?: number
  /**
   * Accessible name. Omit for icons that sit beside a text label — those are
   * decorative and are hidden from assistive technology automatically.
   */
  title?: string
}

export function Icon({
  size = 24,
  strokeWidth = 1.5,
  title,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}
