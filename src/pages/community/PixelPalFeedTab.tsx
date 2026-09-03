import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDemoStore } from '../../store/useDemoStore'
import { ME_ID } from '../../lib/seed'
import { relativeTime } from '../../lib/relativeTime'
import type { Ask } from '../../lib/types'
import { AnonymousAvatar } from '../../components/ui/AnonymousAvatar'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { TextArea } from '../../components/ui/TextArea'

function LockIcon() {
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
      className="mt-0.5 shrink-0"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function InfoIcon() {
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
      className="mt-0.5 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

// Demo/prototype convenience only — not intended production UX. Real
// patients would never have their composer silently pre-filled; this exists
// purely so a click-through demo doesn't stall on "what do I type here?"
const EXAMPLE_ASK_TEXT =
  "I have my first transfer next week and I'm feeling really nervous. I'd love to talk to someone who's been through it."

/**
 * `/groups/pixel-pal` — the feed: anonymous asks from other patients, plus
 * her own active ask if she has one. This is the core of Concept B — no
 * matching, no profile browsing, just what people want to talk about.
 */
export default function PixelPalFeedTab() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const asks = useDemoStore((s) => s.asks)
  const messageRequests = useDemoStore((s) => s.messageRequests)
  const conversations = useDemoStore((s) => s.conversations)
  const postAsk = useDemoStore((s) => s.postAsk)
  const sendMessageRequest = useDemoStore((s) => s.sendMessageRequest)

  const [composeOpen, setComposeOpen] = useState(false)
  const [composeStep, setComposeStep] = useState<'write' | 'posted'>('write')
  const [askText, setAskText] = useState('')
  const askTextAreaRef = useRef<HTMLTextAreaElement>(null)
  // The post is created the instant she taps "Post anonymously" (below) —
  // this only holds back *revealing* it in the feed behind the success
  // sheet, so the "Your post" card doesn't appear mid-confirmation. Set on
  // post, cleared on "Done".
  const [revealPendingPost, setRevealPendingPost] = useState(false)
  // Demo-only autofill (see EXAMPLE_ASK_TEXT) — fires at most once per
  // composer session, tracked separately from `askText` so deleting the
  // autofilled example and refocusing never reinserts it.
  const [composerAutofillUsed, setComposerAutofillUsed] = useState(false)

  const [respondingAsk, setRespondingAsk] = useState<Ask | null>(null)
  const [respondStep, setRespondStep] = useState<'write' | 'sent'>('write')
  const [introText, setIntroText] = useState('')

  // Entered from Home/Messages' "Start a conversation" shortcut.
  useEffect(() => {
    if (searchParams.get('compose') === '1') {
      setComposeOpen(true)
      setComposeStep('write')
      searchParams.delete('compose')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Grows the compose textarea with its content instead of a fixed box —
  // resets to `auto` first so it can shrink back down after a delete, not
  // just ever grow.
  useEffect(() => {
    const el = askTextAreaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [askText])

  const myAsks = Object.values(asks)
    .filter((a) => a.authorId === ME_ID)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const myOpenAsk = myAsks.find((a) => a.status === 'open')
  const myLatestAsk = myAsks[0]
  // What the feed actually *shows* — withholds the just-created open post
  // until she's dismissed the success sheet with "Done" (see
  // `revealPendingPost` above).
  const displayedMyOpenAsk = revealPendingPost ? undefined : myOpenAsk

  const requestsForMyOpenAsk = myOpenAsk
    ? Object.values(messageRequests).filter((r) => r.askId === myOpenAsk.id)
    : []
  const pendingCount = requestsForMyOpenAsk.filter((r) => r.status === 'pending').length

  function myOutgoingRequestFor(askId: string) {
    return Object.values(messageRequests).find((r) => r.askId === askId && r.responderId === ME_ID)
  }

  // Once one of my outgoing requests is accepted, that ask graduates out of
  // "What's on people's minds" (potential connections) into "Your chats"
  // (already-established ones) — an accepted thread should never keep
  // sitting in the general feed looking like just another post to react to.
  const feedAsks = Object.values(asks)
    .filter((a) => a.authorId !== ME_ID && a.status === 'open')
    .filter((a) => myOutgoingRequestFor(a.id)?.status !== 'accepted')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // Every established chat, regardless of which side accepted whom — a
  // request is a request only until it's accepted; once accepted it's not
  // "a request that succeeded," it's a chat, and belongs in exactly one
  // place. Covers both directions: her post, someone else's accepted
  // request into it, and her own accepted request into someone else's post.
  const myChats = Object.values(conversations)
    .filter((c) => c.participantIds.includes(ME_ID))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function handlePostAsk() {
    if (!askText.trim()) return
    postAsk(askText)
    setComposeStep('posted')
    setRevealPendingPost(true)
  }

  function closeCompose() {
    setComposeOpen(false)
    setAskText('')
    setComposeStep('write')
    setRevealPendingPost(false)
    setComposerAutofillUsed(false)
  }

  // Demo-only — see EXAMPLE_ASK_TEXT and `composerAutofillUsed` above. The
  // textarea deliberately has no `autoFocus`, so this only ever fires from
  // the user's own tap/click into the field — opening the sheet alone must
  // never populate it. Fills only if still empty, then never runs again
  // this session, so a real deletion afterward stays deleted.
  function handleComposerFocus() {
    if (composerAutofillUsed) return
    setComposerAutofillUsed(true)
    if (!askText.trim()) {
      setAskText(EXAMPLE_ASK_TEXT)
    }
  }

  function handleSendRequest() {
    if (!respondingAsk || !introText.trim()) return
    sendMessageRequest(respondingAsk.id, introText)
    setRespondStep('sent')
  }

  function closeRespond() {
    setRespondingAsk(null)
    setIntroText('')
    setRespondStep('write')
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* The feature identifier — the one thing that stays regardless of
            whether she has an active post, so the screen never loses its
            "you're inside Pixel Pal" anchor. */}
        <span className="w-fit rounded-pill bg-lavender-40 px-3 py-1 text-label-bold uppercase text-navy">
          Pixel Pal
        </span>

        {displayedMyOpenAsk ? (
          /* Once she has an active post, the onboarding hero (heading,
             explanation, CTA) has done its job and would just be repeating
             itself — replaced by a compact status/management row instead.
             `line-clamp-2` + `p-3` mean an 8-line post takes exactly the
             same space as a one-line post: this is a status entry point
             into the post-detail screen, not a reproduction of the post
             itself (that's what the feed's own anonymous cards are for,
             and deliberately not what this looks like — white + a
             lavender border, not `bg-lavender-20`, so "mine to manage"
             reads as a different kind of thing from "theirs to react to"
             at a glance). */
          <Link
            to="/groups/pixel-pal/my-ask"
            className="flex flex-col gap-1 rounded-card border border-lavender-40 bg-white px-3 py-2"
          >
            <p className="text-body-sm-bold text-navy">Your post</p>
            <p className="line-clamp-2 text-body-sm text-navy-60">{displayedMyOpenAsk.text}</p>
            {pendingCount > 0 ? (
              <p className="text-body-sm-bold text-lavender">
                {pendingCount} message {pendingCount === 1 ? 'request' : 'requests'} →
              </p>
            ) : (
              <p className="text-body-sm text-navy-60">No message requests yet</p>
            )}
          </Link>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="text-h3 text-navy">Find someone who understands</h1>
              <p className="text-body text-navy-60">
                Share what's on your mind anonymously, or reach out to someone you relate to.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={() => setComposeOpen(true)}>
                Start a conversation
              </Button>
              {myLatestAsk && myLatestAsk.status === 'closed' && (
                <Link
                  to="/groups/pixel-pal/my-ask"
                  className="text-label text-navy-60 underline-offset-4 hover:underline"
                >
                  Your last post is closed — view requests →
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      {myChats.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-label-bold uppercase text-navy-60">Your chats</p>
          {myChats.map((convo) => {
            // "New" is a request the instant it's accepted; a chat title
            // shouldn't freeze on that moment forever, so it's a small
            // transient badge, not the row's permanent label.
            const isNew = convo.messages.length <= 1
            const seed = asks[convo.askId]?.anonSeed ?? convo.id.length
            return (
              <button
                key={convo.id}
                type="button"
                onClick={() => navigate(`/groups/pixel-pal/chat/${convo.id}`)}
                className="flex items-center gap-3 rounded-card border border-lavender-40 bg-white p-3 text-left"
              >
                <AnonymousAvatar seed={seed} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-body-sm-bold text-navy">Anonymous</p>
                    {isNew && (
                      <span className="rounded-pill bg-lavender-40 px-1.5 py-0.5 text-label-bold uppercase text-navy">
                        New
                      </span>
                    )}
                  </div>
                  <p className="truncate text-label text-navy-40">Connected over: “{convo.askSnippet}”</p>
                </div>
                <span className="shrink-0 text-body-sm-bold text-navy">Open chat →</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-label-bold uppercase text-navy-60">What's on people's minds</p>
        {feedAsks.map((ask) => {
          const outgoing = myOutgoingRequestFor(ask.id)
          return (
            <div key={ask.id} className="flex flex-col gap-2 rounded-card bg-lavender-20 p-4">
              <p className="text-body text-navy-80">{ask.text}</p>
              <p className="text-label text-navy-40">{relativeTime(ask.createdAt)}</p>
              {!outgoing && (
                <Button
                  variant="secondary"
                  fullWidth={false}
                  className="self-start"
                  onClick={() => {
                    setRespondingAsk(ask)
                    setRespondStep('write')
                  }}
                >
                  Reach out
                </Button>
              )}
              {outgoing?.status === 'pending' && (
                <p className="text-label-bold text-navy-40">Message request sent</p>
              )}
              {outgoing?.status === 'declined' && (
                <p className="text-label-bold text-navy-40">Not accepted this time</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Create ask */}
      <Sheet
        isOpen={composeOpen}
        onClose={closeCompose}
        title={composeStep === 'write' ? 'What would you like to talk about?' : undefined}
      >
        {composeStep === 'write' ? (
          <div className="flex flex-col gap-4">
            <TextArea
              ref={askTextAreaRef}
              rows={3}
              maxLength={280}
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              onFocus={handleComposerFocus}
              placeholder="Share what's been on your mind…"
              className="resize-none overflow-hidden"
            />
            {/* Same semantic yellow as the success screen's "What happens
                next" (privacy / how-this-works guidance), but lighter still
                — no heading, tighter padding — since here it's a secondary
                note beside an empty textarea, not the main thing on screen. */}
            <div className="flex flex-col gap-1 rounded-card bg-yellow-40 px-3 py-2">
              <div className="flex items-start gap-2 text-body-sm text-navy">
                <LockIcon />
                <p>Your name and photo won't be shown.</p>
              </div>
              <p className="text-body-sm text-navy-60">People who relate can send you a private message request.</p>
            </div>
            <Button variant="primary" disabled={!askText.trim()} onClick={handlePostAsk}>
              Post anonymously
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-h4 text-navy">✓ Posted anonymously</p>

            {/* Read-only submitted content, not another feed-style post —
                a neutral cool-gray block (not lavender/purple, which is
                reserved for the feed's own social cards) so it reads as
                "this is what you typed," with the message itself carrying
                more weight than its own label. */}
            <div className="flex flex-col gap-1 rounded-card bg-navy-20/30 p-3">
              <p className="text-body-sm text-navy-60">What you shared</p>
              <p className="text-body-bold text-navy">{askText}</p>
            </div>

            {/* System / next-step guidance — compact and visually lighter
                than the block above on every axis (background, padding,
                label weight vs. size, no message content of its own) so it
                never competes with what she just wrote. */}
            <div className="flex items-start gap-2 rounded-card bg-yellow-40 px-3 py-2.5">
              <InfoIcon />
              <div className="flex flex-col gap-0.5">
                <p className="text-body-sm-bold text-navy">What happens next</p>
                <p className="text-body-sm text-navy-60">
                  People who relate can send you a private message request. You decide who you'd like
                  to talk to.
                </p>
              </div>
            </div>

            <Button variant="primary" onClick={closeCompose}>
              Done
            </Button>
          </div>
        )}
      </Sheet>

      {/* Respond to someone else's ask */}
      <Sheet
        isOpen={!!respondingAsk}
        onClose={closeRespond}
        title={respondStep === 'write' ? 'Reach out privately' : undefined}
      >
        {respondingAsk && respondStep === 'write' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-card bg-lavender-20 p-3">
              <AnonymousAvatar seed={respondingAsk.anonSeed} size="sm" />
              <p className="text-body-sm text-navy-80">{respondingAsk.text}</p>
            </div>
            <TextArea
              autoFocus
              rows={4}
              maxLength={280}
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="Share why this resonated with you, or how you can relate…"
              helperText="They'll see this message and can choose to start a private chat. Your identity stays anonymous for now."
            />
            <Button variant="primary" disabled={!introText.trim()} onClick={handleSendRequest}>
              Send message request
            </Button>
          </div>
        )}
        {respondingAsk && respondStep === 'sent' && (
          <div className="flex flex-col gap-4">
            <p className="text-h4">Message request sent ✓</p>
            <p className="text-body-sm text-navy-60">
              They'll be notified and can choose to reply. If they accept, you'll see it here as a
              private chat.
            </p>
            <Button variant="ghost" onClick={closeRespond}>
              Back to feed
            </Button>
          </div>
        )}
      </Sheet>
    </>
  )
}
