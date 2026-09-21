import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { palMatchPerson } from '../../lib/seed'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * Pal Auto Match "Meet your Pixel Pal" — ported from V2's
 * `PixelPalMatchFound.tsx`. Deliberately minimal: one mocked profile, no
 * accept/decline, no comparison, no second match.
 *
 * `palMatchPerson` (River) comes straight from lib/seed.ts — the same
 * `Person` record used as a conversation participant, imported here
 * directly for display, matching V2's own pattern of reading its
 * `mockMatch` fixture directly rather than via a store selector.
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
 *
 * Known prototype limitation: this screen's card always shows River — it
 * reads `palMatchPerson` directly rather than a matching result, since the
 * demo has no roster of alternate candidates to choose from (see
 * lib/seed.ts). If she's already reported him, `openPalMatchConversation`
 * correctly refuses to reconnect her to the person she reported (see that
 * action's own comment) — but this card still cosmetically shows his
 * profile until she taps "Say hello" and lands on "No match yet" instead. A
 * true fix needs a real multi-candidate matching pool, which is out of
 * scope here.
 */
export default function PixelPalMatchFound() {
  const navigate = useNavigate()
  const openPalMatchConversation = useDemoStore((s) => s.openPalMatchConversation)

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
        <Avatar name={palMatchPerson.displayName} size="xl" />
        <p className="text-h4 text-navy">{palMatchPerson.alias}</p>
        {palMatchPerson.aboutMe && <p className="text-body-sm text-navy-60">{palMatchPerson.aboutMe}</p>}
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
