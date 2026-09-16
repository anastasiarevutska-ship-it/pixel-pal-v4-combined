import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

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
      className="text-navy"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

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

  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <ScreenHeader title="Social Profile" onBack={() => navigate('/pixel-pal-match/request/note')} />

      <div>
        <h2 className="text-h3">This is how your Pixel Pal will see you</h2>
        <p className="mt-2 text-body-sm text-navy-60">
          You can update your Social Profile before we start looking.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <Avatar name={me.displayName} src={me.avatarUrl} size="xl" />
        <p className="text-h4 text-navy">{me.displayName}</p>
        {me.signature && <p className="text-body-sm text-navy-60">{me.signature}</p>}
        {me.aboutMe && <p className="text-body-sm text-navy">{me.aboutMe}</p>}
        {me.socialLinks?.some((link) => link.toLowerCase().includes('instagram')) && (
          <div className="flex justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
              <InstagramIcon />
            </span>
          </div>
        )}
      </Card>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Button variant="secondary" onClick={() => navigate('/pixel-pal-match/social-profile-edit')}>
          Edit social profile
        </Button>
        <Button variant="primary" onClick={() => navigate('/pixel-pal-match/finding')}>
          Looks good
        </Button>
      </div>
    </div>
  )
}
