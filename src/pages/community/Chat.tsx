import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDemoStore } from '../../store/useDemoStore'
import { ME_ID } from '../../lib/seed'
import { Avatar } from '../../components/ui/Avatar'
import { AnonymousAvatar } from '../../components/ui/AnonymousAvatar'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { Modal } from '../../components/ui/Modal'
import { Sheet } from '../../components/ui/Sheet'

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-navy">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-navy">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-navy">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-navy">
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

type MockAttachment = { type: 'image' | 'file'; name: string }

/**
 * `/groups/pixel-pal/chat/:conversationId` — the private 1:1 conversation.
 * Both sides start anonymous; the context strip keeps the original ask
 * visible so the connection still makes sense once neither person is
 * looking at the feed anymore. "Share my profile" is the only way identity
 * ever moves — one tap from each side, never automatic.
 */
export default function Chat() {
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId: string }>()
  const conversations = useDemoStore((s) => s.conversations)
  const people = useDemoStore((s) => s.people)
  const me = useDemoStore((s) => s.me)
  const sendMessage = useDemoStore((s) => s.sendMessage)
  const shareMyProfile = useDemoStore((s) => s.shareMyProfile)

  const [draft, setDraft] = useState('')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [contextExpanded, setContextExpanded] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Attachments — demo/mocked only, see handlePickAttachment. `reminderSeen`
  // is per-mount (not persisted), so the privacy note is a one-time-per-visit
  // nudge rather than a stored preference.
  const [attachSheetOpen, setAttachSheetOpen] = useState(false)
  const [attachment, setAttachment] = useState<MockAttachment | null>(null)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [reminderSeen, setReminderSeen] = useState(false)
  const [pendingAttachmentType, setPendingAttachmentType] = useState<MockAttachment['type'] | null>(null)

  const convo = conversationId ? conversations[conversationId] : undefined

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [convo?.messages.length])

  if (!convo) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <button type="button" onClick={() => navigate('/groups/pixel-pal')} className="text-label-bold text-navy-60">
          ← Back
        </button>
        <p className="text-body text-navy-60">This conversation isn't available.</p>
      </div>
    )
  }

  const otherId = convo.participantIds.find((id) => id !== ME_ID)!
  const otherPerson = people[otherId]
  const meShared = convo.profileShared[ME_ID]
  const otherShared = convo.profileShared[otherId]
  const bothShared = meShared && otherShared
  // The profile-sharing prompt is demo-gated behind an actual back-and-forth
  // — showing it the instant the chat opens (before she's said anything
  // herself) would front-load an identity decision ahead of the
  // conversation it's supposed to be secondary to.
  const hasExchanged = convo.messages.some((m) => !m.system && m.senderId === ME_ID)
  // Rough heuristic for whether the original post needs a "More" toggle —
  // no live layout measurement, just long-enough-to-likely-wrap-past-2-lines.
  const contextIsLong = convo.askSnippet.length > 90

  function handleSend() {
    if ((!draft.trim() && !attachment) || !convo) return
    // The data model has no attachment field (demo-only, see
    // MockAttachment) — folding it into the message text is the lightweight
    // way to make it visible in the thread without touching the store/types
    // for a mocked feature.
    const attachmentLine = attachment ? `📎 ${attachment.name}` : ''
    const text = [draft.trim(), attachmentLine].filter(Boolean).join('\n')
    sendMessage(convo.id, text)
    setDraft('')
    setAttachment(null)
  }

  function applyAttachment(type: MockAttachment['type']) {
    setAttachment(type === 'image' ? { type, name: 'IMG_0192.heic' } : { type, name: 'Visit-summary.pdf' })
  }

  function handlePickAttachment(type: MockAttachment['type']) {
    setAttachSheetOpen(false)
    if (reminderSeen) {
      applyAttachment(type)
    } else {
      // First attachment attempt this visit — the privacy reminder gates
      // applying it; picking a type again afterward skips straight through.
      setPendingAttachmentType(type)
      setReminderOpen(true)
    }
  }

  function handleReminderContinue() {
    setReminderSeen(true)
    setReminderOpen(false)
    if (pendingAttachmentType) applyAttachment(pendingAttachmentType)
    setPendingAttachmentType(null)
  }

  return (
    <div className="relative flex min-h-full flex-col">
      {/* Header — identity reflects the reveal state, not a fixed name. */}
      <div className="flex items-center gap-3 border-b border-lavender-20 p-4">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="flex h-11 w-11 shrink-0 items-center justify-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
            <ChevronLeft />
          </span>
        </button>
        {bothShared ? (
          <Avatar name={otherPerson?.displayName ?? 'Pixel Pal'} src={otherPerson?.avatarUrl} size="md" />
        ) : (
          <AnonymousAvatar size="md" />
        )}
        <div className="min-w-0">
          <p className="text-body-bold text-navy">{bothShared ? otherPerson?.displayName : 'Anonymous'}</p>
          <p className="truncate text-label text-navy-40">
            {bothShared ? "You've introduced yourselves" : 'Still anonymous to each other'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Context strip — why these two are talking. Supporting context,
            not primary content, so a long original post clamps to ~2 lines
            with a "More" toggle rather than pushing the actual
            conversation down the screen. */}
        <div className="rounded-card bg-lavender-20 p-3">
          <p className="text-label-bold uppercase text-navy-60">You connected over</p>
          <p className={`mt-1 text-body-sm italic text-navy-80 ${contextExpanded ? '' : 'line-clamp-2'}`}>
            “{convo.askSnippet}”
          </p>
          {contextIsLong && (
            <button
              type="button"
              onClick={() => setContextExpanded((v) => !v)}
              className="mt-1 text-label-bold text-navy-60 underline-offset-4 hover:underline"
            >
              {contextExpanded ? 'Less' : 'More'}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {convo.messages.map((message) => {
            if (message.system) {
              return (
                <p key={message.id} className="text-center text-label text-navy-40">
                  {message.text}
                </p>
              )
            }
            const mine = message.senderId === ME_ID
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] whitespace-pre-line rounded-card px-4 py-2.5 text-body-sm ${
                    mine ? 'bg-navy text-white' : 'bg-white text-navy shadow-card'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Profile-reveal affordance — optional, mutual, never automatic, and
          held back until she's actually said something herself: showing an
          identity decision before any exchange has happened would outrank
          the conversation it's meant to stay secondary to. A small
          contextual line, not a feature card — a plain navy text action
          (the product's existing secondary-action style), never a filled
          button that could read as a required next step. */}
      {hasExchanged && !bothShared && (
        <div className="mx-4 mb-3">
          {!meShared && (
            <div className="flex items-center justify-between gap-3 rounded-card bg-navy-20/30 px-3 py-2">
              <div className="min-w-0">
                <p className="text-body-sm text-navy-80">Ready to introduce yourself?</p>
                <p className="text-label text-navy-40">You can share your profile when you feel comfortable.</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="shrink-0 text-body-sm-bold text-navy underline-offset-4 hover:underline"
              >
                Share my profile
              </button>
            </div>
          )}
          {meShared && !otherShared && (
            <p className="text-label text-navy-40">You shared your profile — waiting for them to share theirs too.</p>
          )}
        </div>
      )}

      <div className="relative mt-auto flex flex-col gap-2 border-t border-lavender-20 px-4 py-2">
        {attachment && (
          <div className="flex items-center gap-2 rounded-card bg-lavender-20 px-3 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-icon bg-lavender-40">
              {attachment.type === 'image' ? <ImageIcon /> : <FileIcon />}
            </span>
            <p className="min-w-0 flex-1 truncate text-body-sm text-navy-80">{attachment.name}</p>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label="Remove attachment"
              className="flex h-6 w-6 shrink-0 items-center justify-center text-navy-40 hover:text-navy"
            >
              <XIcon />
            </button>
          </div>
        )}
        {/* `min-w-0` on the input's own wrapper is load-bearing: TextField's
            `className` prop lands on the inner <input>, not this outer div,
            so without an explicit flex-sized wrapper here the field never
            actually participates in the row's flex-shrink/grow — it was
            sizing to its own content instead of the available space, which
            is what pushed Send past the right edge once a third control
            (attachment) joined the row. */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAttachSheetOpen(true)}
            aria-label="Add attachment"
            className="flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
              <PlusIcon />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <TextField
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              placeholder="Write a message…"
              className="w-full"
              aria-label="Message"
            />
          </div>
          <Button
            variant="primary"
            fullWidth={false}
            disabled={!draft.trim() && !attachment}
            onClick={handleSend}
            className="shrink-0"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Attachment picker — one control, one small menu, matching the same
          card language as everything else in Peer Support rather than a
          new upload UI. Demo/mocked selection only, see MockAttachment. */}
      <Sheet isOpen={attachSheetOpen} onClose={() => setAttachSheetOpen(false)} title="Add to your message">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handlePickAttachment('image')}
            className="flex items-center gap-3 rounded-card bg-lavender-20 p-3 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-icon bg-lavender-40">
              <ImageIcon />
            </span>
            <p className="text-body-sm-bold text-navy">Photo or video</p>
          </button>
          <button
            type="button"
            onClick={() => handlePickAttachment('file')}
            className="flex items-center gap-3 rounded-card bg-lavender-20 p-3 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-icon bg-lavender-40">
              <FileIcon />
            </span>
            <p className="text-body-sm-bold text-navy">File</p>
          </button>
        </div>
      </Sheet>

      {/* One-time privacy nudge — anonymous conversation, so attachments get
          a beat of friction the first time only (`reminderSeen`), never
          again after that within this visit. */}
      <Modal isOpen={reminderOpen} onClose={() => setReminderOpen(false)} title="Before you share">
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-navy-60">
            Photos and files may contain personal information. Only share what you're comfortable
            with.
          </p>
          <Button variant="primary" onClick={handleReminderContinue}>
            Continue
          </Button>
        </div>
      </Modal>

      <Modal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Share your profile?">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-card bg-lavender-20 p-3">
            <Avatar name={me.displayName} src={me.avatarUrl} size="md" />
            <p className="text-body-bold text-navy">{me.displayName}</p>
          </div>
          <p className="text-body-sm text-navy-60">
            They'll see your name and photo. They'll be asked to share theirs too — sharing is
            always mutual, never automatic.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              shareMyProfile(convo.id)
              setProfileModalOpen(false)
            }}
          >
            Share my profile
          </Button>
          <Button variant="ghost" onClick={() => setProfileModalOpen(false)}>
            Not yet
          </Button>
        </div>
      </Modal>
    </div>
  )
}
