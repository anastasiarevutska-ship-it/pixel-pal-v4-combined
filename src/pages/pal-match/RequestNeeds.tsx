import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'

type TreatmentPreference = 'similar_experience' | 'no_preference'

const preferenceOptions: { id: TreatmentPreference; label: string }[] = [
  { id: 'similar_experience', label: 'Yes, if possible' },
  { id: 'no_preference', label: 'No preference' },
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
    <div className="flex h-full flex-col p-5">
      <RequestStepHeader
        step={0}
        total={2}
        onBack={() => navigate('/pixel-pal-match/how-it-works')}
        title="Would you prefer someone with similar treatment experience?"
      />
      <p className="mb-4 text-body-sm text-navy-60">
        We'll use this as a preference when looking for your Pixel Pal.
      </p>
      <div className="flex flex-wrap gap-2">
        {preferenceOptions.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={preference === option.id}
            onClick={() => setPreference(option.id)}
          />
        ))}
      </div>
      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={() => navigate('/pixel-pal-match/request/note')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
