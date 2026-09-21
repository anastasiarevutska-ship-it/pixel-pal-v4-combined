import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'soft'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
}

// Radius lives per-variant, not in `base` — `soft` (see below) needs
// `rounded-card` instead of the pill every other variant uses, and two
// radius utilities on one element depend on Tailwind's generated-CSS order
// to resolve, not on className string order, so they can't safely coexist
// on the same element. Every existing variant explicitly carries
// `rounded-pill` itself instead, which is a no-op change for them.
const base =
  'inline-flex min-h-11 items-center justify-center gap-2 px-6 text-body-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40'

const variants: Record<ButtonVariant, string> = {
  // Pill radius: not explicitly named in spec §3's shape list (which only
  // covers cards/inputs/pills/avatars), but consistent with the pill/avatar
  // radius already in the system, and it's the token that exists — never
  // an arbitrary one.
  primary: 'rounded-pill bg-navy text-white hover:bg-navy-80',
  secondary: 'rounded-pill bg-lavender-40 text-navy hover:bg-lavender-80',
  ghost: 'rounded-pill bg-transparent text-navy underline-offset-4 hover:underline',
  // Coral, sparingly, per spec §3 — calm/warm, not an alarm color.
  destructive: 'rounded-pill border border-coral bg-white text-coral hover:bg-coral/10',
  // Navy-outlined secondary action — ported from V2 for choices (e.g. "Find
  // someone else") that are real but shouldn't read as destructive/coral.
  outline: 'rounded-pill border border-navy bg-white text-navy hover:bg-lavender-20',
  // Softer rounded-rectangle primary CTA (Community screen's reference
  // design) — `rounded-card`, the same 16px corner already used for cards,
  // rather than introducing a new arbitrary radius just for this.
  soft: 'rounded-card bg-lavender-80 text-navy hover:bg-lavender',
}

export function Button({ variant = 'primary', fullWidth = true, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}
