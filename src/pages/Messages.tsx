import { useNavigate } from 'react-router-dom'
import { TabBar } from '../components/TabBar'
import { CareTeamBlock } from '../components/CareTeamBlock'
import { GreetingHeader } from '../components/GreetingHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { AnonymousAvatar } from '../components/ui/AnonymousAvatar'
import { useDemoStore } from '../store/useDemoStore'
import { ME_ID } from '../lib/seed'
import { anonymousPalLabels } from '../lib/palLabel'
import type { Ask, Conversation, ConversationStatus, Person } from '../lib/types'
import bgGlow from '../assets/shared/bg-glow.png'
import iconUserHeart from '../assets/shared/icon-user-heart.svg'

// Most recent message wins over the conversation's own createdAt — a chat
// that's had activity since it was created should sort above one that
// hasn't, regardless of which was created first. Falls back to createdAt
// for a conversation with no messages yet (accepted-but-silent).
function lastActivityAt(convo: Conversation): string {
  const lastMessage = convo.messages[convo.messages.length - 1]
  return lastMessage ? lastMessage.createdAt : convo.createdAt
}

// Read-only lifecycle states get a small, neutral label rather than being
// hidden or redesigned into a different card treatment — see V4 direction
// doc §5 ("smallest clear treatment", no Archive concept). Deliberately
// silent for 'active': the ordinary case needs no badge at all.
function conversationStatusLabel(status: ConversationStatus): string | undefined {
  if (status === 'graduated') return 'Graduated'
  if (status === 'blocked') return 'Blocked'
  if (status === 'ended') return 'Ended'
  return undefined
}

type ConversationRowProps = {
  conversation: Conversation
  people: Record<string, Person>
  asks: Record<string, Ask>
  askAnonLabel?: string
}

/**
 * One row in the unified inbox. Origin determines both the identity/avatar
 * rule and which context is shown — an ask-origin row and a pal_match-origin
 * row deliberately don't carry the same metadata (V4 direction doc §7):
 * Ask shows the ask context it grew out of and respects its own anonymity/
 * reveal state; Pal Auto Match shows the always-revealed identity, a PIXEL
 * PAL marker, and a latest-message preview instead.
 *
 * A local component rather than an extracted shared file — Peer Support's
 * own "Your chats" list (the only other place that rendered a conversation
 * row) is removed in this same pass, so there is exactly one caller. Pull
 * this out again if a second real caller shows up.
 */
function ConversationRow({ conversation, people, asks, askAnonLabel }: ConversationRowProps) {
  const navigate = useNavigate()
  const otherId = conversation.participantIds.find((id) => id !== ME_ID)
  const otherPerson = otherId ? people[otherId] : undefined
  const statusLabel = conversationStatusLabel(conversation.status)

  if (conversation.origin === 'pal_match') {
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    return (
      <button
        type="button"
        onClick={() => navigate(`/pixel-pal-match/chat/${conversation.id}`)}
        className="flex items-start gap-3 rounded-card border border-lavender-40 bg-white p-3 text-left"
      >
        <Avatar name={otherPerson?.displayName ?? 'Pixel Pal'} src={otherPerson?.avatarUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-body-sm-bold text-navy">{otherPerson?.displayName ?? 'Pixel Pal'}</p>
            <span className="shrink-0 rounded-pill bg-lavender-40 px-1.5 py-0.5 text-label-bold uppercase text-navy">
              Pixel Pal
            </span>
            {statusLabel && <span className="shrink-0 text-label uppercase text-navy-40">{statusLabel}</span>}
          </div>
          {lastMessage && <p className="line-clamp-2 text-body-sm text-navy-60">{lastMessage.text}</p>}
        </div>
        <span className="shrink-0 self-center text-body-sm-bold text-navy">Open chat →</span>
      </button>
    )
  }

  // Ask-origin — same identity/context rules as Ask's own feed and chat
  // screens (see PixelPalFeedTab/Chat.tsx): anonymous until profiles are
  // mutually shared, ask snippet kept as the "why we're talking" context.
  const bothShared = !!otherId && !!conversation.profileShared?.[ME_ID] && !!conversation.profileShared?.[otherId]
  const seed = (conversation.askId ? asks[conversation.askId]?.anonSeed : undefined) ?? conversation.id.length
  const iAmAskAuthor = !!conversation.askId && asks[conversation.askId]?.authorId === ME_ID
  const contextLabel = iAmAskAuthor ? 'Connected through your post' : 'You reached out about'
  const isNew = conversation.messages.length <= 1

  return (
    <button
      type="button"
      onClick={() => navigate(`/groups/pixel-pal/chat/${conversation.id}`)}
      className="flex items-start gap-3 rounded-card border border-lavender-40 bg-white p-3 text-left"
    >
      {bothShared ? (
        <Avatar name={otherPerson?.displayName ?? 'Pixel Pal'} src={otherPerson?.avatarUrl} size="sm" />
      ) : (
        <AnonymousAvatar seed={seed} size="sm" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-body-sm-bold text-navy">
            {bothShared ? otherPerson?.displayName : askAnonLabel}
          </p>
          {isNew && (
            <span className="shrink-0 rounded-pill bg-lavender-40 px-1.5 py-0.5 text-label-bold uppercase text-navy">
              New
            </span>
          )}
          {statusLabel && <span className="shrink-0 text-label uppercase text-navy-40">{statusLabel}</span>}
        </div>
        <p className="text-label text-navy-40">{contextLabel}</p>
        <p className="line-clamp-2 text-body-sm text-navy-60">“{conversation.askSnippet}”</p>
      </div>
      <span className="shrink-0 self-center text-body-sm-bold text-navy">Open chat →</span>
    </button>
  )
}

/**
 * `/messages` — the unified inbox (V4 direction doc): every persisted
 * peer-to-peer conversation lives here regardless of whether it came from
 * Ask or Pal Auto Match, alongside the existing Care Team content.
 *
 * Only the Pal Auto Match entry point lives here — Ask's own entry point is
 * the Groups tab (Groups ⇄ Peer Support), not Messages, per direct
 * instruction. Ask conversations still surface in this inbox once they
 * exist; this only changes where the *ask* discovery action is offered, not
 * where its resulting conversations live.
 *
 * Contextual links elsewhere (My Ask's "Ongoing" section, Match Found's
 * "Say hello") open the same persisted conversation, not a copy of it — see
 * those screens.
 *
 * Sorted by most recent activity (last message, or creation time if no
 * messages yet) rather than creation order, so an old but active thread
 * with a new reply outranks a newer, quieter one.
 */
export default function Messages() {
  const navigate = useNavigate()
  const conversations = useDemoStore((s) => s.conversations)
  const asks = useDemoStore((s) => s.asks)
  const people = useDemoStore((s) => s.people)

  const myConversations = Object.values(conversations)
    .filter((c) => c.participantIds.includes(ME_ID))
    // Reported conversations must disappear from Messages entirely — not a
    // read-only row, not a badge, gone — and never come back (see
    // reportPalMatchConversation in the store).
    .filter((c) => c.status !== 'reported')
    .sort((a, b) => lastActivityAt(b).localeCompare(lastActivityAt(a)))
  // Ask-only numbering (see anonymousPalLabels) — a pal_match conversation
  // never consumes a slot here, same rule as everywhere else this is read.
  const askAnonLabels = anonymousPalLabels(Object.values(conversations), ME_ID)

  // Only one active Pal Auto Match relationship is ever allowed at a time
  // (see openPalMatchConversation in the store, which enforces the same
  // rule on the write side). 'active' is the only status that counts — a
  // graduated, rematch-ended, or reported pal_match conversation already
  // reads as a past/read-only row in the Conversations list below, so it
  // must not also keep blocking the entry card. Ask-origin conversations
  // never factor in here at all, regardless of how many she has.
  const hasActivePalMatch = Object.values(conversations).some(
    (c) => c.origin === 'pal_match' && c.participantIds.includes(ME_ID) && c.status === 'active',
  )

  return (
    <div className="relative flex min-h-full flex-col">
      <img
        src={bgGlow}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full w-full object-cover"
      />

      <div className="relative flex flex-col gap-6 p-5">
        <GreetingHeader line1="How can we help," line2="Samantha?" />

        <CareTeamBlock />

        {/* Only offered while she has no active Pal Auto Match — once one
            exists it's already represented as a row in Conversations below,
            so re-offering "Find a Pixel Pal" here would suggest starting a
            second one, which the product (and the store) never allows. */}
        {!hasActivePalMatch && (
          <Card variant="glass" className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex shrink-0 items-center justify-center rounded-field bg-navy p-3">
                <img src={iconUserHeart} alt="" aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="text-body-sm-bold text-navy-80">Pixel Pal</p>
            </div>
            <p className="text-body text-navy-80">
              Connect one-to-one with someone who understands. Share experiences, talk things
              through, and navigate fertility treatment together.
            </p>
            <Button variant="primary" onClick={() => navigate('/pixel-pal-match/how-it-works')}>
              Find a Pixel Pal
            </Button>
          </Card>
        )}

        {myConversations.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-label-bold uppercase text-navy-60">Conversations</p>
            {myConversations.map((convo) => (
              <ConversationRow
                key={convo.id}
                conversation={convo}
                people={people}
                asks={asks}
                askAnonLabel={askAnonLabels[convo.id]}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-auto">
        <TabBar />
      </div>
    </div>
  )
}
