type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

type AvatarProps = {
  name: string
  src?: string
  size?: AvatarSize
}

// Rounded squares, not circles (Figma, NEW Patient App) — the corner radius
// steps up with the size so a 32px chat-header avatar and a 96px profile
// avatar both read as the same soft-square shape.
const sizes: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 rounded-icon text-label-bold',
  md: 'h-11 w-11 rounded-field text-body-sm-bold', // 44px — meets the min touch target
  lg: 'h-16 w-16 rounded-field text-body-bold',
  // For profile-style contexts where the photo should carry real weight —
  // the suggestion cards (M4), where a bigger photo is the point: a real
  // person to feel a connection to, not a small icon next to her name.
  xl: 'h-24 w-24 rounded-card text-h3',
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizes[size]} shrink-0 object-cover`}
      />
    )
  }
  // Local initials on Lavender 40 — spec §6 (no stock photos of real people).
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center bg-lavender-40 text-navy`}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}
