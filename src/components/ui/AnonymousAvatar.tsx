type AnonymousAvatarSize = 'xs' | 'sm' | 'md' | 'lg'

// Same size-stepped soft-square radii as `Avatar`, so an anonymous stand-in
// and the real avatar it later reveals into share one shape.
const sizes: Record<AnonymousAvatarSize, string> = {
  xs: 'h-6 w-6 rounded-tag', // 24px — inline in a card's header row (Figma "Your Post")
  sm: 'h-8 w-8 rounded-icon',
  md: 'h-11 w-11 rounded-field',
  lg: 'h-16 w-16 rounded-field',
}

// Pastel tones drawn from the existing token set only — never a new color,
// and never anything derived from a real identity. Cycled by `seed` so the
// same ask/person reads as a consistent (but still anonymous) avatar across
// screens, the way a real anonymous-post UI would.
const tones = ['bg-lavender-40', 'bg-yellow-40', 'bg-lavender-80', 'bg-yellow-80', 'bg-lavender-20', 'bg-navy-20']

/**
 * A generic, non-identifying stand-in for a patient's real Avatar — used
 * everywhere Concept B shows someone before a mutual profile reveal (feed
 * cards, message requests, an un-revealed chat header). Deliberately a
 * silhouette, not initials: initials leak identity the moment two asks
 * share a first letter, silhouettes never do.
 */
export function AnonymousAvatar({ seed = 0, size = 'md' }: { seed?: number; size?: AnonymousAvatarSize }) {
  const tone = tones[seed % tones.length]
  return (
    <div
      className={`${sizes[size]} ${tone} flex shrink-0 items-center justify-center text-navy-60`}
      aria-hidden="true"
    >
      <svg width="55%" height="55%" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4v-1Z" />
      </svg>
    </div>
  )
}
