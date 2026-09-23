import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useEffect } from 'react'
import { useDemoStore, palMatchCandidate } from '../../store/useDemoStore'
import bgGlow from '../../assets/shared/bg-glow-warm.png'

function XIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/**
 * Pal Auto Match "Meet your Pixel Pal" — ported from V2's
 * `PixelPalMatchFound.tsx`. Deliberately minimal: one mocked profile, no
 * accept/decline, no comparison, no second match.
 *
 * Shows whoever `palMatchCandidate` (store) says she'd be connected to: the
 * next roster person she hasn't been matched with or reported before, so
 * "Find someone else" really produces someone new. Once the roster runs out
 * there is no candidate and she's sent to "No match yet".
 *
 * Phase 2B: "Say hello" now creates the persisted `pal_match` Conversation
 * and opens it. Unlike V2, this is a real, store-backed record, not
 * local-only chat state.
 *
 * `openPalMatchConversation` is idempotent for the current match — there is
 * never more than one active pal_match conversation at a time, so revisiting
 * this screen (e.g. browser back) and clicking "Say hello" again reopens the
 * same conversation rather than creating a duplicate. A new one is only
 * created once the previous match has actually ended (see "Find someone
 * else" in the Pal chat screen).
 *
 * No Back button, same as V2: the match is already created automatically by
 * the time she reaches this screen, so there's nothing here to reconsider —
 * the "X" (matching the reference) dismisses to Messages instead, where the
 * conversation is already waiting for her.
 */
export default function PixelPalMatchFound() {
  const navigate = useNavigate()
  const openPalMatchConversation = useDemoStore((s) => s.openPalMatchConversation)
  const conversations = useDemoStore((s) => s.conversations)
  const blockedPersonIds = useDemoStore((s) => s.blockedPersonIds)
  // The person Pal Auto Match would actually connect her to — a new one after
  // "Find someone else", never a previous or reported Pal.
  const match = palMatchCandidate({ conversations, blockedPersonIds })

  useEffect(() => {
    if (!match) navigate('/pixel-pal-match/no-match-yet', { replace: true })
  }, [match, navigate])

  function handleSayHello() {
    const conversationId = openPalMatchConversation()
    if (!conversationId) {
      navigate('/pixel-pal-match/no-match-yet')
      return
    }
    navigate(`/pixel-pal-match/chat/${conversationId}`)
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <img src={bgGlow} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />

      <div className="relative flex min-h-full flex-col gap-6 p-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/messages')}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40 text-navy"
          >
            <XIcon />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <h1 className="text-h3">Congratulation!</h1>
            <p className="mt-1 text-body text-navy-60">Meet your Pixel Pal.</p>
          </div>

          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-card bg-lavender-40 text-h3 text-navy"
            aria-hidden="true"
          >
            {initials(match?.displayName ?? '')}
          </div>

          <div>
            <p className="text-h4 text-navy">{match?.alias}</p>
            {match?.signature && <p className="mt-1 text-body-sm text-navy-60">{match.signature}</p>}
          </div>

          {match?.aboutMe && <p className="text-body-sm text-navy-60">{match.aboutMe}</p>}
        </div>

        <div className="mt-auto pt-6">
          <Button variant="soft" onClick={handleSayHello}>
            Say Hello
          </Button>
        </div>
      </div>
    </div>
  )
}
