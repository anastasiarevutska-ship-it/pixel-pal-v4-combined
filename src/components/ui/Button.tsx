import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'soft' | 'soft-outline'

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
// Disabled styling lives per-variant too, for the same reason as radius:
// `soft` greys out (Figma's disabled CTA) instead of fading, and that can't
// coexist with a shared `disabled:opacity-40` on the same element.
const base =
  'inline-flex min-h-11 items-center justify-center gap-2 px-6 text-body-bold transition-colors disabled:cursor-not-allowed'

const faded = 'disabled:opacity-40'

const variants: Record<ButtonVariant, string> = {
  // Pill radius: not explicitly named in spec §3's shape list (which only
  // covers cards/inputs/pills/avatars), but consistent with the pill/avatar
  // radius already in the system, and it's the token that exists — never
  // an arbitrary one.
  primary: `rounded-pill bg-navy text-white hover:bg-navy-80 ${faded}`,
  secondary: `rounded-pill bg-lavender-40 text-navy hover:bg-lavender-80 ${faded}`,
  ghost: `rounded-pill bg-transparent text-navy underline-offset-4 hover:underline ${faded}`,
  // Coral, sparingly, per spec §3 — calm/warm, not an alarm color.
  destructive: `rounded-pill border border-coral bg-white text-coral hover:bg-coral/10 ${faded}`,
  // Outlined secondary action — ported from V2 for choices (e.g. "Find
  // someone else") that are real but shouldn't read as destructive/coral.
  // Lavender border, same as every outlined button in the Figma file.
  outline: `rounded-pill border border-lavender bg-white text-navy hover:bg-lavender-20 ${faded}`,
  // Softer rounded-rectangle primary CTA (Community screen's reference
  // design) — `rounded-card`, the same 16px corner already used for cards,
  // rather than introducing a new arbitrary radius just for this. Disabled
  // is the Figma's flat grey, not a faded lavender.
  soft: 'rounded-card bg-lavender-80 text-navy hover:bg-lavender disabled:bg-navy-20 disabled:text-navy-60',
  // `soft`'s secondary partner (e.g. Decline beside Start Chat, Figma
  // "Your Post") — same corner, so the two can sit side by side without a
  // pill next to a rounded rectangle.
  'soft-outline': `rounded-card border border-lavender bg-white text-navy hover:bg-lavender-20 ${faded}`,
}

export function Button({ variant = 'primary', fullWidth = true, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}
