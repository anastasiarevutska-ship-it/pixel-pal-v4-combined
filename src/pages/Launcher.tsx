import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { useDemoStore } from '../store/useDemoStore'
import pixelLogo from '../assets/brand/pixel-logo.svg'
import iconPeopleHeart from '../assets/shared/icon-people-heart.svg'

/**
 * Route "/" — client-facing cover for this concept walkthrough. This
 * prototype is a standalone exploration of "Concept B": Pixel Pal as an
 * anonymous ask, browsed and responded to inside Community/Groups, rather
 * than the matching-based Pixel Pal built elsewhere. See
 * docs/concept-b-spec.md.
 */
export default function Launcher() {
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const [showResetToast, setShowResetToast] = useState(false)

  function handleReset() {
    resetDemo()
    setShowResetToast(true)
    setTimeout(() => setShowResetToast(false), 2000)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-lavender-20 p-10">
      <img src={pixelLogo} alt="Pixel Care" className="h-[88px] w-[88px]" />

      <div className="mt-2 max-w-2xl text-center">
        <p className="text-label-bold uppercase text-lavender">Pixel Pal · Concept B</p>
        <h1 className="mt-2 text-display">Ask first, connect second</h1>
      </div>

      <p className="mt-6 max-w-2xl text-center text-body text-navy-60">
        Instead of matching two people automatically, patients post anonymously what they'd like
        to talk about. Anyone who relates can send a private message request — the author decides
        who to let in.
      </p>

      <div className="mt-16 grid w-full max-w-2xl gap-4 sm:grid-cols-1">
        <Link to="/groups" className="block">
          <Card className="flex h-full cursor-pointer flex-col gap-3 transition-transform hover:-translate-y-0.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-navy p-2.5">
              <img src={iconPeopleHeart} alt="" aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-h4">Enter Community</p>
              <p className="mt-1 text-body-sm text-navy-60">
                Groups, plus Pixel Pal as a private one-to-one alternative alongside it.
              </p>
            </div>
          </Card>
        </Link>
      </div>

      <button
        type="button"
        onClick={handleReset}
        className="mt-10 text-label text-navy-60 transition-colors hover:text-navy"
      >
        ↺ Reset demo
      </button>

      <Toast message="Demo reset — back to the seed." isOpen={showResetToast} />
    </div>
  )
}
