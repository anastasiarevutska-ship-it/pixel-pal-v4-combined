import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '../../store/useDemoStore'
import { ME_ID } from '../../lib/seed'
import { relativeTime } from '../../lib/relativeTime'
import { AnonymousAvatar } from '../../components/ui/AnonymousAvatar'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'

function ChevronLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-navy"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

/**
 * `/groups/pixel-pal/my-ask` — her own post, and every message request
 * against it (none, one, or several). Once she's opened this screen because
 * someone reached out, the requests are the reason she's here — her own
 * post is only context for *why* they did, so it's a compact, quiet
 * summary, not the hero of the screen. Accept ("Start chat") opens the
 * resulting private conversation immediately; decline stays private and
 * reasonless, same courtesy the other Pixel Pal prototypes use for the same
 * moment.
 *
 * Own header rather than the shared `ScreenHeader` primitive — that one's
 * the 32px sub-page convention matched from the client's own screenshots
 * (Medication Inventory, Prescriptions, …), which reads as too heavy for a
 * screen she's likely opening straight from a "1 message request" prompt.
 * This is a local, compact variant, not a change to that shared pattern.
 */
export default function MyAsk() {
  const navigate = useNavigate()
  const asks = useDemoStore((s) => s.asks)
  const messageRequests = useDemoStore((s) => s.messageRequests)
  const conversations = useDemoStore((s) => s.conversations)
  const closeAsk = useDemoStore((s) => s.closeAsk)
  const acceptIncomingRequest = useDemoStore((s) => s.acceptIncomingRequest)
  const declineIncomingRequest = useDemoStore((s) => s.declineIncomingRequest)

  const myAsk = Object.values(asks)
    .filter((a) => a.authorId === ME_ID)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  const requests = myAsk
    ? Object.values(messageRequests)
        .filter((r) => r.askId === myAsk.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : []
  const pending = requests.filter((r) => r.status === 'pending')
  const accepted = requests.filter((r) => r.status === 'accepted')

  function handleBack() {
    navigate('/groups/pixel-pal')
  }

  const header = (
    <div className="flex items-center gap-3">
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
      <p className="text-h4 text-navy">Your post</p>
    </div>
  )

  if (!myAsk) {
    return (
      <div className="flex flex-col gap-6 p-5">
        {header}
        <EmptyState title="No active post" description="Start a conversation from the Peer Support feed to see it here." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      {header}

      {/* Post-card and Message requests are grouped a little tighter than
          the header→content gap above — still a clear break (this is
          "why", that's "who"), just not as wide a jump as the rest of the
          page's rhythm. */}
      <div className="flex flex-col gap-4">
        {/* Secondary context, not another content card — quiet neutral wash
            (not white-with-border, which read as a form field) so the
            incoming-request card below it is unmistakably the main event. */}
        <div className="flex flex-col gap-1 rounded-card bg-navy-20/30 p-3">
          <p className="text-label-bold uppercase text-navy-60">Your post · posted anonymously</p>
          <p className="line-clamp-2 text-body-sm text-navy-80">{myAsk.text}</p>
          {myAsk.status === 'open' ? (
            <button
              type="button"
              onClick={() => closeAsk(myAsk.id)}
              className="mt-2 self-start text-body-sm-bold text-navy underline-offset-4 hover:underline"
            >
              Close post
            </button>
          ) : (
            <p className="text-label-bold uppercase text-navy-40">Closed to new responses</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* Same section-label treatment as "What's on people's minds" /
              "Groups for you" on the other Peer Support screens — the count
              is a small lavender badge beside it, its own quiet element
              (not `(N)` glued onto the heading) so it reads as a request
              count, not a dashboard counter. */}
          <div className="flex items-center gap-2">
            <p className="text-label-bold uppercase text-navy-60">Message requests</p>
            <span className="rounded-pill bg-lavender-40 px-2 py-0.5 text-label-bold text-navy">
              {pending.length}
            </span>
          </div>

          {requests.length === 0 && (
            <EmptyState
              title="No one has reached out yet"
              description="Check back soon — you'll see requests here as they come in."
            />
          )}

          {pending.map((request) => (
            <div key={request.id} className="flex flex-col gap-3 rounded-card bg-lavender-20 p-4">
              <div className="flex items-center gap-2">
                <AnonymousAvatar seed={request.id.length} size="sm" />
                <div>
                  {/* "Someone reached out" — not "Anonymous" — is the
                      headline; this is also where matching context (e.g.
                      "Similar treatment experience") would slot in later,
                      replacing this line rather than restructuring the
                      card. */}
                  <p className="text-body-sm-bold text-navy">Someone reached out</p>
                  <p className="text-label text-navy-40">{relativeTime(request.createdAt)}</p>
                </div>
              </div>
              <p className="text-body text-navy-80">{request.introMessage}</p>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  fullWidth={false}
                  className="flex-1"
                  onClick={() => {
                    const convoId = acceptIncomingRequest(request.id)
                    if (convoId) navigate(`/groups/pixel-pal/chat/${convoId}`)
                  }}
                >
                  Start chat
                </Button>
                <Button
                  variant="ghost"
                  fullWidth={false}
                  className="flex-1"
                  onClick={() => declineIncomingRequest(request.id)}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}

          {accepted.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-label-bold uppercase text-navy-40">Ongoing</p>
              {accepted.map((request) => {
                const convo = Object.values(conversations).find(
                  (c) => c.askId === myAsk.id && c.participantIds.includes(request.responderId),
                )
                if (!convo) return null
                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => navigate(`/groups/pixel-pal/chat/${convo.id}`)}
                    className="flex items-center gap-3 rounded-card bg-white p-3 text-left shadow-card"
                  >
                    <AnonymousAvatar seed={request.id.length} size="sm" />
                    <p className="flex-1 text-body-sm-bold text-navy">Open chat</p>
                    <span className="text-navy-40">→</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
