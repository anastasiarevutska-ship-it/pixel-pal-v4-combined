import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ProgressDots } from '../../components/ui/ProgressDots'
import { Button } from '../../components/ui/Button'

const cards = [
  "We'll connect you with someone who shares relevant experience",
  "We'll use what we know about your treatment and what matters to you",
  "You're both patients, not medical experts — your care team is always one tap away",
]

/**
 * Pal Auto Match · How it works — ported from V2's M2 (`HowItWorks.tsx`).
 * Three swipeable cards + ProgressDots + Skip, unchanged from the source.
 *
 * V2 called `startMemberFlow(memberId)` here to silently prefill her known
 * treatment record before the preference steps. V4 has no treatment-record
 * concept at all (the preference steps are illustrative/local-state only —
 * see RequestNeeds/RequestNote), so there's nothing to prefill; this screen
 * just navigates on.
 */
export default function HowItWorks() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)

  const goNext = () => setStep((s) => Math.min(s + 1, cards.length - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  function handleWantsSupport() {
    navigate('/pixel-pal-match/request/needs')
  }

  const isLastCard = step === cards.length - 1

  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="justify-self-start text-label-bold text-navy-60 hover:text-navy"
        >
          ← Back
        </button>
        <ProgressDots total={cards.length} current={step} />
        <button
          type="button"
          onClick={handleWantsSupport}
          className="justify-self-end text-label-bold text-navy-60 hover:text-navy"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_event, info) => {
              if (info.offset.x < -60) goNext()
              else if (info.offset.x > 60) goBack()
            }}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="cursor-grab rounded-card bg-white p-6 text-center shadow-card active:cursor-grabbing"
          >
            <p className="text-h4">{cards[step]}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" fullWidth={false} onClick={isLastCard ? handleWantsSupport : goNext}>
          {isLastCard ? "Let's go" : 'Next'}
        </Button>
      </div>
    </div>
  )
}
