import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'
import bgGlow from '../../assets/shared/bg-glow-warm.png'

type LocationPreference = 'outside_local_area' | 'no_preference'

const locationOptions: { id: LocationPreference; label: string }[] = [
  { id: 'outside_local_area', label: 'Yes, outside my local area.' },
  { id: 'no_preference', label: "No, location doesn't matter to me." },
]

/**
 * Pal Auto Match step 2 of 2 — location preference. Ported from V2's
 * `RequestNote.tsx` unchanged (the filename is a holdover from an earlier
 * V2 draft where this step was a free-text note; verified against the
 * actual V2 source that its current content is genuinely the location
 * preference below, not a note field — kept the same name here so this
 * stays traceable against the reference implementation).
 *
 * Illustrative prototype behavior only, same as RequestNeeds: kept in local
 * state, not wired into the store or any real geographic matching. Location
 * itself is never shown to a Pixel Pal — this is an internal matching/
 * privacy constraint only.
 */
export default function RequestNote() {
  const navigate = useNavigate()
  const [preference, setPreference] = useState<LocationPreference | null>(null)

  return (
    <div className="relative flex h-full flex-col">
      <img src={bgGlow} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />

      <div className="relative flex h-full flex-col p-5">
        <RequestStepHeader
          onBack={() => navigate('/pixel-pal-match/request/needs')}
          onSkip={() => navigate('/pixel-pal-match/social-profile-preview')}
        />

        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="text-center">
            <h2 className="text-h3">Do you have a preference regarding location?</h2>
            <p className="mt-3 text-body-sm text-navy-60">
              Your location is never shown to your Pixel Pal.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {locationOptions.map((option) => (
              <Chip
                key={option.id}
                variant="option"
                label={option.label}
                selected={preference === option.id}
                onClick={() => setPreference(option.id)}
              />
            ))}
          </div>
        </div>

        <div className="pt-6">
          <Button variant="soft" onClick={() => navigate('/pixel-pal-match/social-profile-preview')}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
