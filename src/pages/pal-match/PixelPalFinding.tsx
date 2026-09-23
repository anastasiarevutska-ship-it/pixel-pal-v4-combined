import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '../../store/useDemoStore'
import bgGlow from '../../assets/shared/bg-glow-warm.png'

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
 * The reference shows the status lines appearing one at a time over the
 * course of the wait rather than all at once, and a pulsing concentric-ring
 * placeholder instead of a spinner — both matched here, staggered evenly
 * across `LOOKING_MS`.
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
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const stepMs = LOOKING_MS / (statusLines.length + 1)
    const lineTimers = statusLines.map((_, i) => setTimeout(() => setVisibleLines((n) => n + 1), stepMs * (i + 1)))
    const navTimer = setTimeout(() => {
      navigate(matchOutcomeDemo === 'no_match_yet' ? '/pixel-pal-match/no-match-yet' : '/pixel-pal-match/match-found', {
        replace: true,
      })
    }, LOOKING_MS)
    return () => {
      lineTimers.forEach(clearTimeout)
      clearTimeout(navTimer)
    }
  }, [navigate, matchOutcomeDemo])

  return (
    <div className="relative flex h-full flex-col">
      <img src={bgGlow} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />

      <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="relative flex h-40 w-40 shrink-0 items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-pill border border-lavender-40" />
          <span className="absolute inset-4 rounded-pill border border-lavender-40" />
          <span className="absolute inset-8 animate-pulse rounded-pill border-2 border-lavender" />
        </div>
        <div>
          <h2 className="text-h3">Finding your Pixel Pal</h2>
          <p className="mt-2 text-body text-navy-60">
            We&rsquo;re looking for someone who fits what matters to you.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-body-sm text-navy-60">
          {statusLines.slice(0, visibleLines).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
