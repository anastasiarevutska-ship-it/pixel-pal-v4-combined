import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '../../store/useDemoStore'

/** How long the prototype "looking" pause lasts before branching — pacing
 * only, not a real fetch. Ported from V2 unchanged. */
const LOOKING_MS = 2200

const statusLines = [
  'Considering your preferences',
  'Looking for relevant shared experience',
  "Checking who's available",
]

/**
 * Pal Auto Match "Finding your Pixel Pal" — ported from V2's
 * `PixelPalFinding.tsx`. No real matching runs here: after a fixed pause it
 * reads `matchOutcomeDemo` (the presentation-only flag set from Demo
 * Controls' "Match outcome" toggle) and branches to the mocked Match Found
 * or No Match Yet screen. The real matching algorithm is still an open
 * product question, same as it was in V2.
 *
 * V2 also cleared a `pixelPalMatchEnded` flag on mount here (relevant once
 * "Find someone else" can loop back to this screen) and, on the No Match Yet
 * branch, set a `pixelPalSearchActive` flag read by a Home reminder card.
 * Neither concept is ported in Phase 2A — there's no chat yet to end, and
 * V4's `/home` is an unrelated placeholder stub with no reminder-card
 * surface to feed.
 */
export default function PixelPalFinding() {
  const navigate = useNavigate()
  const matchOutcomeDemo = useDemoStore((s) => s.matchOutcomeDemo)

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(matchOutcomeDemo === 'no_match_yet' ? '/pixel-pal-match/no-match-yet' : '/pixel-pal-match/match-found', {
        replace: true,
      })
    }, LOOKING_MS)
    return () => clearTimeout(t)
  }, [navigate, matchOutcomeDemo])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div
        className="h-10 w-10 animate-spin rounded-pill border-2 border-lavender border-t-transparent"
        aria-hidden="true"
      />
      <div>
        <h2 className="text-h3">Finding your Pixel Pal</h2>
        <p className="mt-2 text-body text-navy-60">
          We&rsquo;re looking for someone who fits what matters to you.
        </p>
      </div>
      <div className="flex flex-col gap-1.5 text-body-sm text-navy-60">
        {statusLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  )
}
