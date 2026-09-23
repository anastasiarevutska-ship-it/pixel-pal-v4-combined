import { ChevronLeft } from './ui/ScreenHeader'

type RequestStepHeaderProps = {
  onBack: () => void
  onSkip: () => void
}

/** Shared header for the Pal Auto Match preference steps — back icon button
 * (same `rounded-icon` bg-lavender-40 chip as ScreenHeader) plus a Skip link,
 * matching the reference onboarding screens. The question title lives with
 * the rest of the question block below (see RequestNeeds/RequestNote),
 * which the reference centers in the remaining space rather than stacking
 * it directly under this row. */
export function RequestStepHeader({ onBack, onSkip }: RequestStepHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
          <ChevronLeft />
        </span>
      </button>
      <button type="button" onClick={onSkip} className="text-label-bold text-navy-60 hover:text-navy">
        Skip
      </button>
    </div>
  )
}
