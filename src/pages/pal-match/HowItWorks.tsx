import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft } from '../../components/ui/ScreenHeader'
import bgGlow from '../../assets/shared/bg-glow.png'

const cards = [
  "We'll connect you with someone who shares relevant experience",
  "We'll use what we know about your treatment and what matters to you",
  "You're both patients, not medical experts — your care team is always one tap away",
]

/**
 * Pal Auto Match · How it works — ported from V2's M2 (`HowItWorks.tsx`).
 * Three swipeable cards over the shared `bg-glow` warm gradient, with a
 * lavender icon back button and a plain-text Skip/Next, matching the
 * reference onboarding screens.
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
    <div className="relative flex h-full flex-col">
      <img
        src={bgGlow}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 w-full [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)]"
      />

      <div className="relative flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/messages')}
            aria-label="Back"
            className="flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
              <ChevronLeft />
            </span>
          </button>
          <button type="button" onClick={handleWantsSupport} className="text-label-bold text-navy-60 hover:text-navy">
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
          <button
            type="button"
            onClick={isLastCard ? handleWantsSupport : goNext}
            className="text-label-bold text-navy-60 hover:text-navy"
          >
            {isLastCard ? "Let's go" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
