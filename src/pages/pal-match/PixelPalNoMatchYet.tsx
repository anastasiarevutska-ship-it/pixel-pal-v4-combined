import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import bgGlow from '../../assets/shared/bg-glow-warm.png'

/**
 * Pal Auto Match "We're still looking" — ported from V2's
 * `PixelPalNoMatchYet.tsx`. Simple waiting state; no Back button, same as
 * V2 — her search has already started by the time she's here, a terminal
 * outcome of setup/matching rather than a step to navigate backward out of.
 * Full-bleed `bg-glow-warm.png`, same reference asset as HowItWorks, and a
 * lavender "soft" button instead of navy — matching the reference.
 *
 * V2 also called `beginPixelPalSearch()` here to flip a flag its Home
 * dashboard's reminder card read to switch from a promotional card to a
 * "searching" status card. Not ported: V4's `/home` is an unrelated
 * placeholder stub (`HomeStub`) with no such card to feed, so that flag
 * would be dead state.
 */
export default function PixelPalNoMatchYet() {
  const navigate = useNavigate()

  return (
    <div className="relative flex h-full flex-col">
      <img src={bgGlow} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />

      <div className="relative flex h-full flex-col gap-6 p-5">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <h2 className="text-h3">We&rsquo;re still looking</h2>
          <p className="text-body text-navy-60">
            We haven&rsquo;t found the right connection just yet. You don&rsquo;t need to stay here
            — we&rsquo;ll let you know when your Pixel Pal is ready.
          </p>
        </div>

        <div className="pt-6">
          <Button variant="soft" onClick={() => navigate('/home')}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}
