import { ChevronLeft } from './ui/ScreenHeader'

type RequestStepHeaderProps = {
  onBack: () => void
  onSkip: () => void
  title: string
}

/** Shared header for the Pal Auto Match preference steps — back icon button
 * (same `rounded-icon` bg-lavender-40 chip as ScreenHeader) plus a Skip link,
 * matching the reference onboarding screens. */
export function RequestStepHeader({ onBack, onSkip, title }: RequestStepHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
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
      <h2 className="text-h3">{title}</h2>
    </div>
  )
}
