import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { me, ME_ID, palMatchPerson, people, reserveResponders, seedAsks } from '../lib/seed'
import type { Ask, ChatMessage, Conversation, MessageRequest, Person } from '../lib/types'

let uid = 0
function nextId(prefix: string) {
  uid += 1
  return `${prefix}_${Date.now()}_${uid}`
}

const incomingIntroLines = [
  "I've been through something similar — happy to talk if it would help.",
  "This really resonated with me. I'd love to connect if you're open to it.",
  "Sending you support. I've been where you are and I'm glad to listen.",
  "I don't have it all figured out either, but I'd like to talk if that's okay.",
]

const replyLines = [
  'Thank you for reaching out — it means a lot.',
  "I really needed to hear that today.",
  "That's exactly how I felt too. It helps to know I'm not alone in this.",
  'Thanks for sharing that. How are you holding up today?',
]

/** Presentation-only demo toggle for the Pal Auto Match "Finding" screen —
 * ported from V2. There's no real matching algorithm behind it; this just
 * picks which of the two outcome screens `Finding` sends her to. */
export type MatchOutcomeDemo = 'match_found' | 'no_match_yet'

type State = {
  me: Person
  people: Record<string, Person>
  asks: Record<string, Ask>
  messageRequests: Record<string, MessageRequest>
  conversations: Record<string, Conversation>
  /** Requests *I* sent to someone else's ask, most recent last — drives the demo's "simulate their response" controls. */
  myOutgoingRequestIds: string[]
  /** People whose asks/requests she's blocked — conversation-scoped action, but the person stays blocked feed-wide (see PixelPalFeedTab). */
  blockedPersonIds: string[]
  /** Pal Auto Match's demo outcome toggle — see `MatchOutcomeDemo`. */
  matchOutcomeDemo: MatchOutcomeDemo

  // Author side — my own ask
  postAsk: (text: string) => string
  closeAsk: (askId: string) => void
  simulateIncomingRequest: (askId: string) => void
  acceptIncomingRequest: (requestId: string) => string
  declineIncomingRequest: (requestId: string) => void

  // Responder side — reaching out to someone else's ask
  sendMessageRequest: (askId: string, introMessage: string) => string
  simulateAskAuthorResponds: (requestId: string, outcome: 'accepted' | 'declined') => string | undefined

  // Pal Auto Match — automatic matching, no ask/reply step. The onboarding
  // and finding/outcome screens are ported (Phase 2A), but Match Found's
  // "Say hello" doesn't call `createPalMatchConversation` yet — that wiring
  // is Phase 2B.
  setMatchOutcomeDemo: (outcome: MatchOutcomeDemo) => void
  createPalMatchConversation: () => string
  /** Edits the one shared Social Profile (`me`) — same record Ask's own
   * profile-reveal modal reads, per the "one Social Profile, never a second
   * identity" rule both prototypes use. This only writes to it; it does not
   * call or interact with Ask's `shareMyProfile`/reveal mechanic at all. */
  updateSocialProfile: (patch: {
    displayName: string
    signature: string
    aboutMe: string
    socialLinks: string[]
    avatarUrl: string
  }) => void

  // Chat, shared by both directions
  sendMessage: (conversationId: string, text: string) => void
  simulateReply: (conversationId: string) => void
  shareMyProfile: (conversationId: string) => void
  simulateOtherSharesProfile: (conversationId: string) => void

  // Conversation-level actions — see the chat header's overflow menu
  graduateConversation: (conversationId: string) => void
  blockPerson: (conversationId: string) => void

  resetDemo: () => void
}

function buildInitialState() {
  const asks: Record<string, Ask> = {}
  seedAsks.forEach((a) => (asks[a.id] = a))
  return {
    me,
    people: { ...people, [palMatchPerson.id]: palMatchPerson },
    asks,
    messageRequests: {} as Record<string, MessageRequest>,
    conversations: {} as Record<string, Conversation>,
    myOutgoingRequestIds: [] as string[],
    blockedPersonIds: [] as string[],
    matchOutcomeDemo: 'match_found' as MatchOutcomeDemo,
  }
}

export const useDemoStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),

      postAsk: (text: string) => {
        const id = nextId('ask')
        const ask: Ask = {
          id,
          authorId: ME_ID,
          text: text.trim(),
          createdAt: new Date().toISOString(),
          status: 'open',
          anonSeed: Object.keys(get().asks).length,
        }
        set((s) => ({ asks: { ...s.asks, [id]: ask } }))
        return id
      },

      closeAsk: (askId: string) => {
        set((s) => ({
          asks: { ...s.asks, [askId]: { ...s.asks[askId], status: 'closed' } },
        }))
      },

      simulateIncomingRequest: (askId: string) => {
        const s = get()
        const ask = s.asks[askId]
        if (!ask) return
        const taken = new Set(
          Object.values(s.messageRequests)
            .filter((r) => r.askId === askId)
            .map((r) => r.responderId),
        )
        const pool = [...Object.keys(people), ...reserveResponders].filter(
          (id) => id !== ask.authorId && !taken.has(id),
        )
        if (pool.length === 0) return
        const responderId = pool[Math.floor(Math.random() * pool.length)]
        const id = nextId('req')
        const request: MessageRequest = {
          id,
          askId,
          responderId,
          introMessage: incomingIntroLines[Object.values(s.messageRequests).length % incomingIntroLines.length],
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
        set((st) => ({ messageRequests: { ...st.messageRequests, [id]: request } }))
      },

      acceptIncomingRequest: (requestId: string) => {
        const s = get()
        const request = s.messageRequests[requestId]
        const ask = request ? s.asks[request.askId] : undefined
        if (!request || !ask) return ''
        const convoId = nextId('convo')
        const conversation: Conversation = {
          id: convoId,
          origin: 'ask',
          askId: ask.id,
          askSnippet: ask.text,
          participantIds: [ask.authorId, request.responderId],
          messages: [
            {
              id: nextId('msg'),
              senderId: request.responderId,
              text: request.introMessage,
              createdAt: request.createdAt,
            },
          ],
          profileShared: { [ask.authorId]: false, [request.responderId]: false },
          status: 'active',
          createdAt: new Date().toISOString(),
        }
        set((st) => ({
          messageRequests: { ...st.messageRequests, [requestId]: { ...request, status: 'accepted' } },
          conversations: { ...st.conversations, [convoId]: conversation },
        }))
        return convoId
      },

      declineIncomingRequest: (requestId: string) => {
        set((s) => ({
          messageRequests: {
            ...s.messageRequests,
            [requestId]: { ...s.messageRequests[requestId], status: 'declined' },
          },
        }))
      },

      sendMessageRequest: (askId: string, introMessage: string) => {
        const id = nextId('req')
        const request: MessageRequest = {
          id,
          askId,
          responderId: ME_ID,
          introMessage: introMessage.trim(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          messageRequests: { ...s.messageRequests, [id]: request },
          myOutgoingRequestIds: [...s.myOutgoingRequestIds, id],
        }))
        return id
      },

      simulateAskAuthorResponds: (requestId: string, outcome: 'accepted' | 'declined') => {
        const s = get()
        const request = s.messageRequests[requestId]
        const ask = request ? s.asks[request.askId] : undefined
        if (!request || !ask) return undefined
        if (outcome === 'declined') {
          set((st) => ({
            messageRequests: { ...st.messageRequests, [requestId]: { ...request, status: 'declined' } },
          }))
          return undefined
        }
        const convoId = nextId('convo')
        const conversation: Conversation = {
          id: convoId,
          origin: 'ask',
          askId: ask.id,
          askSnippet: ask.text,
          participantIds: [ask.authorId, request.responderId],
          messages: [
            {
              id: nextId('msg'),
              senderId: request.responderId,
              text: request.introMessage,
              createdAt: request.createdAt,
            },
          ],
          profileShared: { [ask.authorId]: false, [request.responderId]: false },
          status: 'active',
          createdAt: new Date().toISOString(),
        }
        set((st) => ({
          messageRequests: { ...st.messageRequests, [requestId]: { ...request, status: 'accepted' } },
          conversations: { ...st.conversations, [convoId]: conversation },
        }))
        return convoId
      },

      setMatchOutcomeDemo: (outcome: MatchOutcomeDemo) => set({ matchOutcomeDemo: outcome }),

      updateSocialProfile: (patch) => {
        set((s) => ({
          me: {
            ...s.me,
            displayName: patch.displayName,
            signature: patch.signature,
            aboutMe: patch.aboutMe,
            socialLinks: patch.socialLinks,
            avatarUrl: patch.avatarUrl || undefined,
          },
        }))
      },

      createPalMatchConversation: () => {
        const id = nextId('convo')
        const conversation: Conversation = {
          id,
          origin: 'pal_match',
          participantIds: [ME_ID, palMatchPerson.id],
          messages: [],
          status: 'active',
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ conversations: { ...s.conversations, [id]: conversation } }))
        return id
      },

      sendMessage: (conversationId: string, text: string) => {
        const trimmed = text.trim()
        if (!trimmed) return
        const message: ChatMessage = { id: nextId('msg'), senderId: ME_ID, text: trimmed, createdAt: new Date().toISOString() }
        set((s) => {
          const convo = s.conversations[conversationId]
          if (!convo) return s
          return {
            conversations: {
              ...s.conversations,
              [conversationId]: { ...convo, messages: [...convo.messages, message] },
            },
          }
        })
      },

      simulateReply: (conversationId: string) => {
        const s = get()
        const convo = s.conversations[conversationId]
        if (!convo) return
        const otherId = convo.participantIds.find((id) => id !== ME_ID)
        if (!otherId) return
        const message: ChatMessage = {
          id: nextId('msg'),
          senderId: otherId,
          text: replyLines[convo.messages.length % replyLines.length],
          createdAt: new Date().toISOString(),
        }
        set((st) => ({
          conversations: {
            ...st.conversations,
            [conversationId]: { ...convo, messages: [...convo.messages, message] },
          },
        }))
      },

      shareMyProfile: (conversationId: string) => {
        const s = get()
        const convo = s.conversations[conversationId]
        if (!convo || convo.profileShared?.[ME_ID]) return
        const system: ChatMessage = {
          id: nextId('msg'),
          senderId: ME_ID,
          text: 'You shared your profile.',
          createdAt: new Date().toISOString(),
          system: true,
        }
        set((st) => ({
          conversations: {
            ...st.conversations,
            [conversationId]: {
              ...convo,
              profileShared: { ...convo.profileShared, [ME_ID]: true },
              messages: [...convo.messages, system],
            },
          },
        }))
      },

      simulateOtherSharesProfile: (conversationId: string) => {
        const s = get()
        const convo = s.conversations[conversationId]
        const otherId = convo?.participantIds.find((id) => id !== ME_ID)
        if (!convo || !otherId || convo.profileShared?.[otherId]) return
        const bothNowShared = convo.profileShared?.[ME_ID]
        const system: ChatMessage = {
          id: nextId('msg'),
          senderId: otherId,
          text: bothNowShared ? "You're both sharing profiles now." : 'They shared their profile too.',
          createdAt: new Date().toISOString(),
          system: true,
        }
        set((st) => ({
          conversations: {
            ...st.conversations,
            [conversationId]: {
              ...convo,
              profileShared: { ...convo.profileShared, [otherId]: true },
              messages: [...convo.messages, system],
            },
          },
        }))
      },

      graduateConversation: (conversationId: string) => {
        const s = get()
        const convo = s.conversations[conversationId]
        // Checked positively, not `!== 'active'` — a conversation created
        // before `status` existed (already in a demo's localStorage) has no
        // status at all, and that must still count as active, not silently
        // block graduating it.
        if (!convo || convo.status === 'graduated' || convo.status === 'blocked') return
        const system: ChatMessage = {
          id: nextId('msg'),
          senderId: ME_ID,
          text: 'You graduated from this chat. It stays here as a read-only record.',
          createdAt: new Date().toISOString(),
          system: true,
        }
        set((st) => ({
          conversations: {
            ...st.conversations,
            [conversationId]: { ...convo, status: 'graduated', messages: [...convo.messages, system] },
          },
        }))
      },

      blockPerson: (conversationId: string) => {
        const s = get()
        const convo = s.conversations[conversationId]
        if (!convo || convo.status === 'blocked') return
        const otherId = convo.participantIds.find((id) => id !== ME_ID)
        if (!otherId) return
        const system: ChatMessage = {
          id: nextId('msg'),
          senderId: ME_ID,
          text: "You blocked this person. You won't hear from them again here.",
          createdAt: new Date().toISOString(),
          system: true,
        }
        set((st) => ({
          blockedPersonIds: st.blockedPersonIds.includes(otherId)
            ? st.blockedPersonIds
            : [...st.blockedPersonIds, otherId],
          conversations: {
            ...st.conversations,
            [conversationId]: { ...convo, status: 'blocked', messages: [...convo.messages, system] },
          },
        }))
      },

      resetDemo: () => set(buildInitialState()),
    }),
    { name: 'pixel-pal-concept-b-demo' },
  ),
)
