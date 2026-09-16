import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDemoStore } from '../../store/useDemoStore'
import { ME_ID } from '../../lib/seed'
import { Avatar } from '../../components/ui/Avatar'
import { TextField } from '../../components/ui/TextField'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { Modal } from '../../components/ui/Modal'

const starters = [
  {
    label: 'KEEP IT SIMPLE',
    message: "Hi! Nice to meet you. How's your week going?",
  },
  {
    label: 'TALK ABOUT TREATMENT',
    message: 'How have things been going for you lately?',
  },
  {
    label: 'TALK ABOUT SOMETHING ELSE',
    message: 'What do you like doing when you need a break from all of this?',
  },
]

// Demo/mocked attachment only — same lightweight approach as Ask's own
// Chat.tsx (see that file's MockAttachment): the shared data model has no
// attachment field, so this folds a line into the message text rather than
// introducing a second attachment system alongside Ask's.
type MockAttachment = { type: 'image' | 'file'; name: string }

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

/**
 * Pal Auto Match chat — ported from V2's `PixelPalChat.tsx`, but backed by
 * the shared, persisted `Conversation`/`sendMessage` store instead of V2's
 * local component state. A symmetric peer thread: no Member/Pal framing, no
 * request/accept state, no Ask-style anonymous label or mutual profile
 * reveal (identity is visible from the moment this conversation exists —
 * see Conversation.origin in lib/types.ts) and no Ask/reply context strip.
 *
 * Deliberately its own screen rather than a reuse of Ask's `Chat.tsx`: that
 * screen's header, context strip, and profile-reveal affordance are all
 * built around Ask-specific concepts that don't apply here (see the V4
 * direction doc — Ask and Pal Auto Match intentionally have different chat
 * experiences on top of the same Conversation entity).
 *
 * Attachments reuse Ask's own lightweight inline-mock pattern (a small
 * `Sheet` + a pending-attachment chip folded into the message text) rather
 * than porting V2's separate `AttachSheet`/`MessageAttachmentViews`
 * components — one mocked attachment approach, not two. Unlike Ask's chat,
 * there's no one-time privacy reminder before attaching: that reminder
 * exists there specifically because Ask starts anonymous, which doesn't
 * apply here.
 */
export default function PixelPalChat() {
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId: string }>()
  const conversations = useDemoStore((s) => s.conversations)
  const people = useDemoStore((s) => s.people)
  const sendMessage = useDemoStore((s) => s.sendMessage)
  const endPalMatchForRematch = useDemoStore((s) => s.endPalMatchForRematch)

  const [draft, setDraft] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [findSomeoneElseOpen, setFindSomeoneElseOpen] = useState(false)
  const [attachSheetOpen, setAttachSheetOpen] = useState(false)
  const [attachment, setAttachment] = useState<MockAttachment | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const convo = conversationId ? conversations[conversationId] : undefined

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [convo?.messages.length])

  if (!convo) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <button type="button" onClick={() => navigate('/messages')} className="text-label-bold text-navy-60">
          ← Back
        </button>
        <p className="text-body text-navy-60">This conversation isn't available.</p>
      </div>
    )
  }

  const otherId = convo.participantIds.find((id) => id !== ME_ID)!
  const otherPerson = people[otherId]
  const hasSentFirstMessage = convo.messages.some((m) => m.senderId === ME_ID)
  // The only way a pal_match conversation stops being active — see
  // `endPalMatchForRematch`/ConversationStatus in lib/types.ts. Nothing
  // grades/blocks a Pal Auto Match connection in this concept (see V2's own
  // source-of-truth "Legacy concepts" list), so `status` is otherwise
  // always 'active' here.
  const isReadOnly = convo.status === 'ended'

  function handleSend() {
    if ((!draft.trim() && !attachment) || !convo) return
    const attachmentLine = attachment ? `📎 ${attachment.name}` : ''
    const text = [draft.trim(), attachmentLine].filter(Boolean).join('\n')
    sendMessage(convo.id, text)
    setDraft('')
    setAttachment(null)
  }

  // Fills the composer only — never sends on her behalf, same as V2.
  function handleStarterTap(text: string) {
    setDraft(text)
  }

  function handlePickAttachment(type: MockAttachment['type']) {
    setAttachSheetOpen(false)
    setAttachment(type === 'image' ? { type, name: 'IMG_0192.heic' } : { type, name: 'Visit-summary.pdf' })
  }

  // Ported from V2's `handleFindSomeoneElse` (no reason captured, nothing
  // shown to River), now resolved for a real persisted Conversation: marks
  // it ended-as-rematched (see endPalMatchForRematch) rather than deleting
  // it or reusing Ask's `graduateConversation` — a mismatch is not a
  // positive close-out, and the two must stay distinct lifecycle outcomes.
  function handleFindSomeoneElse() {
    if (!convo) return
    setFindSomeoneElseOpen(false)
    endPalMatchForRematch(convo.id)
    navigate('/pixel-pal-match/finding')
  }

  // Presentational-only, same as V2 — both simply close the menu, neither
  // wired into a real flow yet there either.
  function handlePausePlaceholder() {
    setMenuOpen(false)
  }

  function handleReportPlaceholder() {
    setMenuOpen(false)
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Header — alias + non-identifying... no: identity is real and
          visible from the start here, unlike Ask. No location, no exact
          treatment, no compatibility score. */}
      <div className="flex items-center gap-3 border-b border-navy-20 p-4">
        <button
          type="button"
          onClick={() => navigate('/messages')}
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-h4 text-navy"
        >
          ←
        </button>
        <Avatar name={otherPerson?.displayName ?? 'Pixel Pal'} src={otherPerson?.avatarUrl} size="sm" />
        <p className="flex-1 text-body-bold">{otherPerson?.alias ?? otherPerson?.displayName}</p>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-11 items-center gap-1 rounded-field px-3 text-body-sm-bold text-navy hover:bg-lavender-20"
        >
          Menu
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Care Team / medical-question handoff — same clinical-boundary
            purpose as Ask's Chat.tsx footer link, applies symmetrically to
            both peers. */}
        <div className="mb-3 flex items-center justify-between gap-3 rounded-field bg-lavender-20 px-3 py-2">
          <div className="min-w-0">
            <p className="text-label-bold text-navy-80">Medical question?</p>
            <p className="text-label text-navy-60">Your Care Team is the best place to ask.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/messages')}
            className="shrink-0 whitespace-nowrap text-label-bold text-navy underline-offset-4 hover:underline"
          >
            Message Care Team →
          </button>
        </div>

        <div className="flex flex-col gap-3">
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
              <div
                key={message.id}
                className={`max-w-[80%] whitespace-pre-line rounded-card px-4 py-2.5 text-body-sm ${
                  mine ? 'ml-auto bg-navy text-white' : 'mr-auto bg-white text-navy shadow-xs'
                }`}
              >
                {message.text}
              </div>
            )
          })}
          <div ref={endRef} />
        </div>

        {/* Conversation starters — only before her first message, and only
            while the conversation is still active (see isReadOnly). */}
        {!isReadOnly && !hasSentFirstMessage && (
          <div className="mt-4 rounded-card border border-lavender-40 bg-lavender-20 p-4">
            <p className="text-body-bold text-navy">Not sure how to start?</p>
            <p className="mt-1 text-body-sm text-navy-60">Pick a direction, or write your own.</p>
            <div className="mt-3 flex flex-col gap-2">
              {starters.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => handleStarterTap(starter.message)}
                  className="rounded-field border border-navy-20 bg-white px-3 py-2.5 text-left transition-colors hover:border-navy-40"
                >
                  <p className="text-label-bold uppercase text-navy-60">{starter.label}</p>
                  <p className="mt-0.5 text-body-sm text-navy">{starter.message}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer — same +/input/Send shape as V2's PixelPalChat. Gone
          entirely once she's found someone else, same convention as Ask's
          own read-only treatment: a grayed-out input would still invite a
          tap. */}
      {isReadOnly ? (
        <div className="border-t border-navy-20 px-4 py-3">
          <p className="text-center text-label text-navy-40">
            You found someone else. This conversation is kept here as a read-only record.
          </p>
        </div>
      ) : (
      <div className="border-t border-navy-20 pt-3">
        {attachment && (
          <div className="mx-3 mb-2 flex items-center gap-2 rounded-card bg-lavender-20 px-3 py-2">
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
        <div className="flex items-center gap-2 p-3 pt-0">
          <button
            type="button"
            onClick={() => setAttachSheetOpen(true)}
            aria-label="Add"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-field border border-navy-20 text-h4 text-navy hover:bg-lavender-20"
          >
            +
          </button>
          <div className="min-w-0 flex-1">
            <TextField
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              aria-label="Message"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-navy text-white hover:bg-navy-80"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M3.105 2.288a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.897 28.897 0 0015.293-7.155.75.75 0 000-1.114A28.897 28.897 0 003.105 2.288z" />
            </svg>
          </button>
        </div>
      </div>
      )}

      {/* Attachment picker — a Sheet, matching the same interaction shape
          Ask's own Chat.tsx already uses for its mocked attachment, rather
          than porting V2's separate AttachSheet component. */}
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

      {/* Relationship menu — symmetric, Pal Auto Match-only. Only "Find
          someone else" is wired; the other two are presentational
          placeholders, same as V2. "Find someone else"/"Pause" disabled once
          she's already found someone else — same convention as Ask's own
          Graduate/Block rows going disabled once read-only; Report stays
          available either way. */}
      <Sheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Conversation">
        <div className="flex flex-col gap-1">
          <MenuRow
            label="Find someone else"
            disabled={isReadOnly}
            onClick={() => {
              setMenuOpen(false)
              setFindSomeoneElseOpen(true)
            }}
          />
          <MenuRow label="Pause Pixel Pal" disabled={isReadOnly} onClick={handlePausePlaceholder} />
          <MenuRow label="Report a concern" onClick={handleReportPlaceholder} />
        </div>
      </Sheet>

      <Modal isOpen={findSomeoneElseOpen} onClose={() => setFindSomeoneElseOpen(false)} title="Find someone else?">
        <p className="mb-4 text-body-sm text-navy-60">
          Sometimes a connection just isn&rsquo;t the right fit. You don&rsquo;t need to give a
          reason.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={handleFindSomeoneElse}>
            Find someone else
          </Button>
          <Button variant="primary" onClick={() => setFindSomeoneElseOpen(false)}>
            Keep this Pixel Pal
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function MenuRow({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-11 items-center rounded-field px-3 text-left text-body-bold text-navy hover:bg-lavender-20 disabled:opacity-40"
    >
      {label}
    </button>
  )
}
