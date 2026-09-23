import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'
import bgGlow from '../../assets/shared/bg-glow-warm.png'

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

// Standard Instagram glyph (rounded square + lens + flash dot), inline SVG —
// ported as-is from V2, same reasoning: no icon library dependency here.
function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 22v-8h2.7l.4-3.1H14V9c0-.9.2-1.5 1.5-1.5H17V4.7c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7v2.6H9v3.1h2.3V22h2.7Z" />
    </svg>
  )
}

// Recognized platforms — matched against `me.socialLinks` (one per line, see
// SocialProfileEdit) so the icon row only shows what's actually filled in.
const socialPlatforms = [
  { match: (link: string) => link.includes('instagram'), Icon: InstagramIcon },
  { match: (link: string) => link.includes('x.com') || link.includes('twitter'), Icon: XIcon },
  { match: (link: string) => link.includes('facebook'), Icon: FacebookIcon },
]

/**
 * Pal Auto Match Social Profile preview — ported from V2's
 * `SocialProfilePreview.tsx`. The last onboarding step before matching,
 * showing her what her Pixel Pal will see before we start looking.
 *
 * Reuses the same `Person` record (`me`) Ask already reads, per the "one
 * Social Profile, not a separate Pixel Pal profile" rule — no new fields
 * beyond the `signature`/`aboutMe`/`socialLinks` added to `Person` for this
 * screen (see lib/types.ts).
 *
 * "Edit social profile" opens `SocialProfileEdit`
 * (`/pixel-pal-match/social-profile-edit`), which edits this same `me`
 * record — not a second profile system. It returns here on both Save and
 * Cancel, so this screen always re-reads current store values (immediately
 * reflecting a save, unchanged after a cancel) rather than caching anything
 * itself.
 */
export default function SocialProfilePreview() {
  const navigate = useNavigate()
  const me = useDemoStore((s) => s.me)
  const links = me.socialLinks?.map((l) => l.toLowerCase()) ?? []
  const shownPlatforms = socialPlatforms.filter(({ match }) => links.some(match))

  return (
    <div className="relative flex min-h-full flex-col">
      <img src={bgGlow} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />

      <div className="relative flex min-h-full flex-col gap-6 p-5">
        <ScreenHeader title="Your Social Profile" onBack={() => navigate('/pixel-pal-match/request/note')} />

        <div>
          <h2 className="text-h3">This is how your Pixel Pal will see you.</h2>
          <p className="mt-2 text-body-sm text-navy-60">
            You can update your Social Profile before we start looking.
          </p>
        </div>

        <Card className="flex flex-col gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-lavender-40 text-h4 text-navy"
            aria-hidden="true"
          >
            {initials(me.displayName)}
          </div>

          <div>
            <p className="text-h4 text-navy">{me.displayName}</p>
            {me.signature && <p className="text-body-sm text-navy-60">{me.signature}</p>}
          </div>

          {me.aboutMe && <p className="text-body-sm text-navy">{me.aboutMe}</p>}

          {shownPlatforms.length > 0 && (
            <div>
              <p className="text-label-bold text-navy-60">SOCIAL</p>
              <div className="mt-2 flex gap-2">
                {shownPlatforms.map(({ Icon }, i) => (
                  <span key={i} className="flex h-8 w-8 items-center justify-center rounded-icon bg-navy text-white">
                    <Icon />
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Button variant="soft" onClick={() => navigate('/pixel-pal-match/social-profile-edit')}>
            Edit Social Profile
          </Button>
          <Button variant="outline" onClick={() => navigate('/pixel-pal-match/finding')}>
            Looks Good
          </Button>
        </div>
      </div>
    </div>
  )
}
