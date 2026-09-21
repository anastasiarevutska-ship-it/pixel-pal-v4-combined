import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useEffect } from 'react'
import { useDemoStore, palMatchCandidate } from '../../store/useDemoStore'

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
 * the time she reaches this screen, so there's nothing here to reconsider.
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
    <div className="flex min-h-full flex-col gap-6 p-5">
      <h1 className="text-screen-title text-navy">Pixel Pal</h1>

      <h2 className="text-h3">Meet your Pixel Pal</h2>

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <Avatar name={match?.displayName ?? ''} size="xl" />
        <p className="text-h4 text-navy">{match?.alias}</p>
        {match?.aboutMe && <p className="text-body-sm text-navy-60">{match.aboutMe}</p>}
      </Card>

      <p className="text-body text-navy-60">You have some treatment experience in common.</p>

      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={handleSayHello}>
          Say hello
        </Button>
      </div>
    </div>
  )
}
