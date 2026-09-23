import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { usePhoneOverlayNode } from './ui/PhoneFrame'
import { ChevronLeft } from './ui/ScreenHeader'
import { Button } from './ui/Button'
import { TextField } from './ui/TextField'

const reportReasons = [
  'Spam or self-promotion',
  'Inappropriate or offensive language',
  'Personal attack or harassment',
  'Misinformation or unverified claims about treatments or health conditions',
  'Off-topic or irrelevant',
  'Other',
]

type ReportReasonScreenProps = {
  isOpen: boolean
  onBack: () => void
  onSubmit: (reason: string) => void
}

/**
 * Full-screen report-reason picker, shared by Ask's Chat.tsx and Pal Auto
 * Match's PixelPalChat.tsx — matches the reference ("Report User", Figma
 * node 16895:36686) exactly: a fixed reason list with "Other" revealing a
 * free-text field, not the free-text-only report modal this replaced. A
 * full page (portaled into PhoneFrame's overlay layer, same trick as
 * `Modal`) rather than a centered `Modal`, since the reference renders it
 * as its own screen with a back chevron, not a dialog card.
 */
export function ReportReasonScreen({ isOpen, onBack, onSubmit }: ReportReasonScreenProps) {
  const overlayNode = usePhoneOverlayNode()
  const [selected, setSelected] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')

  const reason = selected === 'Other' ? otherText.trim() : selected
  const canSubmit = selected !== null && (selected !== 'Other' || otherText.trim().length > 0)

  function reset() {
    setSelected(null)
    setOtherText('')
  }

  function handleBack() {
    reset()
    onBack()
  }

  function handleSubmit() {
    if (!canSubmit || !reason) return
    onSubmit(reason)
    reset()
  }

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="pointer-events-auto absolute inset-0 z-50 flex flex-col bg-white p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
              <ChevronLeft />
            </span>
          </button>

          <h1 className="mt-4 text-h3">Report User</h1>
          <p className="mt-3 text-body-bold text-navy">Select one reason why you are reporting user.</p>

          <div className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto" role="radiogroup" aria-label="Report reason">
            {reportReasons.map((r) => (
              <div key={r}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={selected === r}
                    onChange={() => setSelected(r)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-navy"
                  />
                  <span className="text-body-sm text-navy">{r}</span>
                </label>
                {r === 'Other' && selected === 'Other' && (
                  <div className="mt-2 pl-8">
                    <TextField
                      autoFocus
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder="Tell us more"
                      aria-label="Other reason"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button variant="soft" disabled={!canSubmit} onClick={handleSubmit}>
              Send Report
            </Button>
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return overlayNode ? createPortal(content, overlayNode) : content
}
