import iconCall from '../assets/shared/icon-call.svg'
import iconMessages from '../assets/shared/icon-messages.svg'
import iconVideo from '../assets/shared/icon-video.svg'

const communicationOptions = [
  { icon: iconCall, label: ['Call', 'Care Team'] },
  { icon: iconMessages, label: ['Care Team Messages'] },
  { icon: iconVideo, label: ['Video', 'Calls'] },
]

/**
 * Care Team communication row (Call / Messages / Video) — recreated from
 * the reference Messages screenshot. Presentational only, same as the
 * source design: the buttons aren't wired to anything here either.
 */
export function CareTeamBlock() {
  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-h5 text-navy-80">HOW CAN WE HELP YOU?</p>
        <p className="text-body text-navy-60">Contact us now for support.</p>
      </div>

      <div className="flex items-start gap-7">
        {communicationOptions.map((option) => (
          <button
            key={option.label.join(' ')}
            type="button"
            className="flex flex-1 flex-col items-center gap-2 pt-2"
          >
            <span className="flex items-center justify-center rounded-field bg-navy p-3">
              <img src={option.icon} alt="" aria-hidden="true" className="h-6 w-6" />
            </span>
            <span className="text-body-sm-bold text-navy-80">
              {option.label.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
