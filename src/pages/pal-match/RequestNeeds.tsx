import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'
import bgGlow from '../../assets/shared/bg-glow-warm.png'

type TreatmentPreference = 'similar_experience' | 'no_preference'

const preferenceOptions: { id: TreatmentPreference; label: string }[] = [
  { id: 'similar_experience', label: 'Yes, if possible.' },
  { id: 'no_preference', label: 'No preference.' },
]

/**
 * Pal Auto Match step 1 of 2 — treatment-experience preference. Ported from
 * V2's `RequestNeeds.tsx` unchanged.
 *
 * Illustrative prototype behavior only: kept in local component state, not
 * the shared store, since there's no defined matching algorithm for it to
 * feed. Do not wire this into real matching logic.
 */
export default function RequestNeeds() {
  const navigate = useNavigate()
  const [preference, setPreference] = useState<TreatmentPreference | null>(null)

  return (
    <div className="relative flex h-full flex-col">
      <img src={bgGlow} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />

      <div className="relative flex h-full flex-col p-5">
        <RequestStepHeader
          onBack={() => navigate('/pixel-pal-match/how-it-works')}
          onSkip={() => navigate('/pixel-pal-match/social-profile-preview')}
        />

        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="text-center">
            <h2 className="text-h3">Would you prefer someone with similar treatment experience?</h2>
            <p className="mt-3 text-body-sm text-navy-60">
              We'll use this as a preference when looking for your Pixel Pal.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {preferenceOptions.map((option) => (
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
          <Button variant="soft" onClick={() => navigate('/pixel-pal-match/request/note')}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
