import { ProgressDots } from './ui/ProgressDots'

type RequestStepHeaderProps = {
  step: number
  total: number
  onBack: () => void
  title: string
}

/** Shared header for the Pal Auto Match preference steps — ported verbatim
 * from V2, where the same header was also shared with the (not ported here)
 * Pal application wizard. */
export function RequestStepHeader({ step, total, onBack, title }: RequestStepHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center text-h4 text-navy"
        >
          ←
        </button>
        <ProgressDots total={total} current={step} />
        <span className="w-11" aria-hidden="true" />
      </div>
      <h2 className="text-h3">{title}</h2>
    </div>
  )
}
