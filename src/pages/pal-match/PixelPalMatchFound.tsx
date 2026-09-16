import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { palMatchPerson } from '../../lib/seed'

/**
 * Pal Auto Match "Meet your Pixel Pal" — ported from V2's
 * `PixelPalMatchFound.tsx`. Deliberately minimal: one mocked profile, no
 * accept/decline, no comparison, no second match.
 *
 * `palMatchPerson` (River) comes straight from lib/seed.ts — the same
 * `Person` record Phase 1 added to the store for future conversation
 * participant lookups, imported here directly for display, matching V2's
 * own pattern of reading its `mockMatch` fixture directly rather than via a
 * store selector.
 *
 * Phase 2A boundary: in V2, "Say hello" opens the match's chat immediately.
 * That chat doesn't exist yet in V4 (Phase 2B), and creating/opening a
 * conversation from this screen is explicitly out of scope for this phase —
 * so the button is shown, matching V2's screen, but disabled rather than
 * wired to a fake or dead destination.
 *
 * No Back button, same as V2: the match is already created automatically by
 * the time she reaches this screen, so there's nothing here to reconsider.
 */
export default function PixelPalMatchFound() {
  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <h1 className="text-screen-title text-navy">Pixel Pal</h1>

      <h2 className="text-h3">Meet your Pixel Pal</h2>

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <Avatar name={palMatchPerson.displayName} size="xl" />
        <p className="text-h4 text-navy">{palMatchPerson.alias}</p>
        {palMatchPerson.aboutMe && <p className="text-body-sm text-navy-60">{palMatchPerson.aboutMe}</p>}
      </Card>

      <p className="text-body text-navy-60">You have some treatment experience in common.</p>

      <div className="mt-auto pt-6">
        <Button variant="primary" disabled>
          Say hello
        </Button>
      </div>
    </div>
  )
}
