// Data model — Pixel Pal Concept B (anonymous ask → private message request →
// 1:1 chat → optional mutual profile reveal). See ../../docs/concept-b-spec.md
// for the product rationale. Deliberately has no Member/Pal role split and no
// matching algorithm — both are legacy concepts from the other prototypes
// (V1 suggestion-based matching, V2 automatic matching); see that doc's
// "Not this" section.

export type PersonId = string

/**
 * A patient's existing Social Profile — reused as-is, never a second
 * identity created for Pixel Pal. `alias` may be a first name or a made-up
 * handle (the patient's own choice, same as the real app); `avatarUrl` is
 * optional so `Avatar` falls back to initials rather than a stock photo.
 */
export type Person = {
  id: PersonId
  displayName: string
  alias: string
  avatarUrl?: string
}

export type AskStatus = 'open' | 'closed'

export type Ask = {
  id: string
  authorId: PersonId
  text: string
  createdAt: string
  status: AskStatus
  /** Deterministic index into the anonymous-avatar palette (see AnonymousAvatar) — never derived from the author's real identity. */
  anonSeed: number
}

export type RequestStatus = 'pending' | 'accepted' | 'declined'

export type MessageRequest = {
  id: string
  askId: string
  responderId: PersonId
  introMessage: string
  status: RequestStatus
  createdAt: string
}

export type ChatMessage = {
  id: string
  senderId: PersonId
  text: string
  createdAt: string
  /** A quiet, centered system line (e.g. "You shared your profile") rather than a bubble. */
  system?: boolean
}

export type Conversation = {
  id: string
  askId: string
  /** Frozen copy of the ask text at the moment the request was accepted — the
   * ask may later be edited or closed without rewriting the reason two
   * people are talking. */
  askSnippet: string
  participantIds: [PersonId, PersonId]
  messages: ChatMessage[]
  /** Per-participant opt-in — sharing is mutual and never automatic (see spec). */
  profileShared: Record<PersonId, boolean>
  createdAt: string
}
