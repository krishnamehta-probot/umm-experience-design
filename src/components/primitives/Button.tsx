import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { IconArrowRight, IconArrowUpRight } from '../icons'

type Variant = 'ink' | 'accent' | 'tone' | 'outline' | 'paper'
type Size = 'sm' | 'md' | 'lg'

type CommonProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  /** Trailing glyph. `none` for buttons that do not navigate. */
  icon?: 'right' | 'upRight' | 'none'
  className?: string
}

const VARIANT_CLASS: Record<Variant, string> = {
  ink: '',
  accent: 'umm-btn--accent',
  tone: 'umm-btn--tone',
  outline: 'umm-btn--outline',
  paper: 'umm-btn--paper',
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'umm-btn--sm',
  md: '',
  lg: 'umm-btn--lg',
}

function classes(variant: Variant = 'ink', size: Size = 'md', className = '') {
  return ['umm-btn', VARIANT_CLASS[variant], SIZE_CLASS[size], className]
    .filter(Boolean)
    .join(' ')
}

function Glyph({ icon }: { icon: CommonProps['icon'] }) {
  if (icon === 'none') return null
  if (icon === 'upRight') return <IconArrowUpRight size={18} />
  return <IconArrowRight size={18} />
}

export function Button({
  children,
  icon = 'right',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { variant, size, className, ...buttonProps } = rest
  return (
    <button
      type="button"
      className={classes(variant, size, className)}
      {...buttonProps}
    >
      {children}
      <Glyph icon={icon} />
    </button>
  )
}

export function ButtonLink({
  children,
  icon = 'right',
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { variant, size, className, ...anchorProps } = rest
  return (
    <a className={classes(variant, size, className)} {...anchorProps}>
      {children}
      <Glyph icon={icon} />
    </a>
  )
}

export function TextLink({
  children,
  icon = 'upRight',
  className = '',
  ...rest
}: {
  children: ReactNode
  icon?: 'right' | 'upRight'
  className?: string
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`umm-textlink ${className}`} {...rest}>
      {children}
      {icon === 'right' ? <IconArrowRight size={17} /> : <IconArrowUpRight size={17} />}
    </a>
  )
}
