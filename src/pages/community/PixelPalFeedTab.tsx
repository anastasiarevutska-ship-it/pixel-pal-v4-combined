import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDemoStore, unseenAcceptedRequests } from '../../store/useDemoStore'
import { ME_ID } from '../../lib/seed'
import { relativeTime } from '../../lib/relativeTime'
import type { Ask, AskExperience } from '../../lib/types'
import { getLocationContext } from '../../lib/location'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { EmptyState } from '../../components/ui/EmptyState'
import { Sheet } from '../../components/ui/Sheet'
import { TextArea } from '../../components/ui/TextArea'

// EXPERIENCE feed filter — single-select, defaults to none (all posts).
// Deliberately not collected on the ask composer itself (see AskExperience
// in lib/types), so this only ever filters seeded/other people's asks.
const EXPERIENCE_FILTERS: { value: AskExperience; label: string }[] = [
  { value: 'not_started', label: 'No experience' },
  { value: 'first_time', label: 'First treatment' },
  { value: 'been_through_it', label: 'Treated before' },
]

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

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
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
  const acknowledgedRequestIds = useDemoStore((s) => s.acknowledgedRequestIds)
  const acknowledgeAcceptedRequests = useDemoStore((s) => s.acknowledgeAcceptedRequests)
  const people = useDemoStore((s) => s.people)
  const me = useDemoStore((s) => s.me)
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

  // EXPERIENCE feed filter — single-select; `null` is the default
  // (unfiltered) state, not a fourth "Everyone" chip.
  const [experienceFilter, setExperienceFilter] = useState<AskExperience | null>(null)

  function handleExperienceFilterClick(value: AskExperience) {
    setExperienceFilter((current) => (current === value ? null : value))
  }

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
  // "What's on people's minds" (potential connections) — it's a conversation
  // now, and lives in Messages (the unified inbox), not here. An accepted
  // thread should never keep sitting in the general feed looking like just
  // another post to react to.
  const feedAsks = Object.values(asks)
    .filter((a) => a.authorId !== ME_ID && a.status === 'open')
    .filter((a) => myOutgoingRequestFor(a.id)?.status !== 'accepted')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  // EXPERIENCE chip narrows this same list — it never touches "Your post" or
  // "Your chats" above, only "What's on people's minds" below.
  const visibleFeedAsks = experienceFilter
    ? feedAsks.filter((a) => a.experience === experienceFilter)
    : feedAsks

  // Someone accepted a request I sent: its post leaves the feed (see
  // feedAsks) and the chat lives in Messages, so this is the only place on
  // this screen that says it happened — until she opens the chat.
  const unseenAccepted = unseenAcceptedRequests({ messageRequests, acknowledgedRequestIds })
  const firstAccepted = unseenAccepted[0]
  const firstAcceptedConvo = firstAccepted
    ? Object.values(conversations).find(
        (c) => c.origin === 'ask' && c.askId === firstAccepted.askId && c.participantIds.includes(ME_ID),
      )
    : undefined

  function handleOpenAccepted() {
    if (unseenAccepted.length === 1 && firstAcceptedConvo) {
      navigate(`/groups/pixel-pal/chat/${firstAcceptedConvo.id}`)
    } else {
      acknowledgeAcceptedRequests(unseenAccepted.map((r) => r.id))
      navigate('/messages')
    }
  }

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

  // Privacy-awareness context for the composer — see lib/location.ts.
  // Never the other person's exact city, only how her own location relates
  // to it, so she can decide for herself whether to reach out.
  const respondingLocationContext = respondingAsk
    ? getLocationContext(me.location, people[respondingAsk.authorId]?.location)
    : null

  return (
    <>
      {firstAccepted && (
        <button
          type="button"
          onClick={handleOpenAccepted}
          className="flex items-center gap-3 rounded-card bg-lavender-20 px-4 py-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="text-body-sm-bold text-navy-80">
              {unseenAccepted.length === 1
                ? 'Your request was accepted'
                : `${unseenAccepted.length} requests were accepted`}
            </p>
            {unseenAccepted.length === 1 && (
              <p className="truncate text-label text-navy-60">&ldquo;{asks[firstAccepted.askId]?.text}&rdquo;</p>
            )}
          </div>
          <span className="shrink-0 text-body-sm-bold text-navy">
            {unseenAccepted.length === 1 ? 'Open chat →' : 'Open →'}
          </span>
        </button>
      )}

      <div className="flex flex-col gap-3">
        {displayedMyOpenAsk ? (
          /* Once she has an active post, the onboarding hero (heading,
             explanation, CTA) has done its job and would just be repeating
             itself — replaced by "my post → its response status" instead.
             Light bordered card with a soft shadow (Figma node
             16903:80122), deliberately not lavender: the feed's own cards
             are lavender, and this one is *hers*, so it shouldn't read as
             just another post in that list. Extra top/bottom margin sets it
             apart as its own section above the feed. */
          <Link
            to="/groups/pixel-pal/my-ask"
            className="mt-2 flex flex-col gap-2.5 rounded-field border border-navy-20 bg-gray20 px-6 py-3 shadow-card"
          >
            <div className="flex flex-col gap-2.5">
              <p className="text-caption uppercase text-navy-60">Your post</p>
              <p className="line-clamp-2 text-body text-navy-80">{displayedMyOpenAsk.text}</p>
            </div>
            {/* Status row — same request-state logic as before (see
                pendingCount above), with the arrow as its own small
                lavender chip on the right instead of inline "→" text. */}
            <div className="flex items-center gap-3 border-t border-lavender-40 pt-2.5">
              <div className="min-w-0 flex-1">
                {pendingCount > 0 ? (
                  <p className="text-body-bold text-navy-80">
                    {pendingCount} message {pendingCount === 1 ? 'request' : 'requests'}
                  </p>
                ) : (
                  <>
                    <p className="text-body-bold text-navy-80">No requests yet</p>
                    <p className="text-body-sm text-navy-60">We&rsquo;ll let you know when someone reaches out.</p>
                  </>
                )}
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-icon bg-lavender-40 text-navy">
                <ArrowRightIcon />
              </span>
            </div>
          </Link>
        ) : (
          <>
            {/* Lighter one-line hero (Figma node 16903:79103) — `h4`, not
                the 32px `screen-title`, so the heading sits on a single
                line above the explanation instead of wrapping. */}
            <div className="flex flex-col gap-3 pt-4">
              <h1 className="text-center text-h4 text-navy-80">Share what's on your mind</h1>
              <p className="text-center text-body text-navy-80">
                Share a question, worry, or experience anonymously — or reach out when someone
                else's story resonates.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-3">
              <Button variant="soft" onClick={() => setComposeOpen(true)}>
                Share With Peers
              </Button>
              {myLatestAsk && myLatestAsk.status === 'closed' && (
                <Link
                  to="/groups/pixel-pal/my-ask"
                  className="text-center text-label text-navy-60 underline-offset-4 hover:underline"
                >
                  Your last post is closed — view requests →
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      {/* `mt-4` on top of the screen's gap-6 = the reference's 40px break
          between whatever sits above (hero CTA or "Your post") and the feed. */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Main feed section label — `h5` (Library's own `RESOURCES`
            eyebrow size/weight, see tailwind.config.js's own note on
            where that token came from), not the small `label-bold` this
            row used to share with "Experience" below it. That size gap is
            the actual fix here: the community feed is the primary content
            on this screen, and the filter beneath it is a utility, so they
            can't keep reading as two headings of equal weight. */}
        <p className="text-h5 uppercase text-navy-80">What's on people's minds</p>

        <div className="mb-2 flex flex-col gap-2">
          {/* "Filter by experience" mirrors Library's own "Related tags" —
              normal-case, `body-sm-bold`, clearly smaller/quieter than the
              section eyebrow above it. No standalone uppercase "EXPERIENCE"
              label anymore; this replaces it rather than sitting beside it. */}
          <p className="text-body-sm-bold text-navy-80">Filter by experience</p>
          {/* Horizontally scrollable, no visible scrollbar — same Content
              Library filter/tag chip row, just this screen's three values
              (see Chip's own `filter` variant for where its shape/type now
              comes from). Single-select: tapping the active chip again
              clears it (see handleExperienceFilterClick). */}
          <div className="-mx-1 flex gap-0.5 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {EXPERIENCE_FILTERS.map((filter) => (
              <Chip
                key={filter.value}
                variant="filter"
                label={filter.label}
                selected={experienceFilter === filter.value}
                onClick={() => handleExperienceFilterClick(filter.value)}
              />
            ))}
          </div>
        </div>

        {visibleFeedAsks.length === 0 && (
          <EmptyState
            title="No posts match this filter yet"
            description="Try another experience, or clear the filter to see everyone."
          />
        )}

        {visibleFeedAsks.map((ask) => {
          const outgoing = myOutgoingRequestFor(ask.id)
          return (
            <div key={ask.id} className="flex flex-col gap-3 rounded-card bg-lavender-20 p-3 shadow-card">
              <p className="text-body text-navy">{ask.text}</p>
              <p className="text-label text-navy-40">{relativeTime(ask.createdAt)}</p>
              {!outgoing && (
                <Button
                  variant="soft"
                  onClick={() => {
                    setRespondingAsk(ask)
                    setRespondStep('write')
                  }}
                >
                  Reach Out
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
        footer={
          composeStep === 'write' ? (
            <Button variant="soft" disabled={!askText.trim()} onClick={handlePostAsk}>
              Post Anonymously
            </Button>
          ) : (
            <Button variant="soft" onClick={closeCompose}>
              Done
            </Button>
          )
        }
      >
        {composeStep === 'write' ? (
          /* Figma node 16913:93895 — tall muted field, then a single plain
             privacy line (no yellow note box). */
          <div className="mt-4 flex flex-col gap-4">
            <TextArea
              ref={askTextAreaRef}
              tone="muted"
              rows={7}
              maxLength={280}
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              onFocus={handleComposerFocus}
              placeholder="Share what's on your mind"
              className="resize-none overflow-hidden"
            />
            <p className="text-body-sm text-navy-60">Your name and photo won't be shown.</p>
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
          </div>
        )}
      </Sheet>

      {/* Respond to someone else's ask */}
      <Sheet
        isOpen={!!respondingAsk}
        onClose={closeRespond}
        title={respondStep === 'write' ? 'Reach out privately' : undefined}
        footer={
          respondStep === 'write' ? (
            <Button variant="soft" disabled={!introText.trim()} onClick={handleSendRequest}>
              Send Message Request
            </Button>
          ) : (
            <Button variant="soft-outline" onClick={closeRespond}>
              Back to feed
            </Button>
          )
        }
      >
        {respondingAsk && respondStep === 'write' && (
          /* Figma node 16913:94001 — the quoted post as a plain lavender
             card (no avatar), the muted field, then the privacy note and
             location context as plain text beneath it (no yellow box). */
          <div className="flex flex-col gap-4">
            <div className="rounded-card bg-lavender-20 p-3 shadow-card">
              <p className="text-body text-navy">{respondingAsk.text}</p>
            </div>

            <TextArea
              autoFocus
              tone="muted"
              rows={7}
              maxLength={280}
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="Share why this resonated with you, or how you can relate…"
              className="resize-none"
            />

            <div className="text-body-sm text-navy-60">
              <p>They'll see this message and can choose to start a private chat. Your identity stays anonymous for now.</p>
              {/* Never the other person's exact city — only how her own
                  location relates to it (see lib/location.ts). */}
              {respondingLocationContext && (
                <p>
                  <span className="text-body-sm-bold text-navy-80">{respondingLocationContext.title}.</span>{' '}
                  {respondingLocationContext.body}
                </p>
              )}
            </div>
          </div>
        )}
        {respondingAsk && respondStep === 'sent' && (
          <div className="flex flex-col gap-4">
            <p className="text-h4">Message request sent ✓</p>
            <p className="text-body-sm text-navy-60">
              They'll be notified and can choose to reply. If they accept, you'll see it here as a
              private chat.
            </p>
          </div>
        )}
      </Sheet>
    </>
  )
}
