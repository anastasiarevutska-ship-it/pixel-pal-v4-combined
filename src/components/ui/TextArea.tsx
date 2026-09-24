import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  helperText?: string
  /** Rotating prompt slot, e.g. "Tell her where you are right now" (spec M5). */
  promptHelper?: ReactNode
  /** `muted` is the Figma sheets' light-grey writing field (e.g. "Share
   * what's on your mind") instead of plain white. */
  tone?: 'default' | 'muted'
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, helperText, promptHelper, tone = 'default', id, rows = 4, className = '', ...props },
  ref,
) {
  const areaId = id ?? props.name
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={areaId} className="text-label-bold text-navy-60">
          {label}
        </label>
      )}
      {promptHelper && <div className="text-body-sm text-navy-60">{promptHelper}</div>}
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        className={`rounded-field border border-navy-20 px-4 py-3 text-body text-navy focus:border-lavender focus:outline-none ${
          tone === 'muted' ? 'bg-gray20 placeholder:text-navy-60' : 'bg-white placeholder:text-navy-40'
        } ${className}`}
        {...props}
      />
      {helperText && <p className="text-label text-navy-60">{helperText}</p>}
    </div>
  )
})
