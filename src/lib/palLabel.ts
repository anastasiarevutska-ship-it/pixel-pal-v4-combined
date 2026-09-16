// Stable, temporary identification for anonymous Pixel Pal connections — see
// docs/concept-b-spec.md. Never a name, never derived from the other
// person's real identity: just a position, so the same connection reads as
// the same label everywhere (chat list, chat header) until profiles are
// mutually shared.

import type { Conversation, PersonId } from './types'

/**
 * Maps conversationId → "Anonymous Pal N", numbered by when each connection
 * was *created* (oldest = 1) rather than by however a screen currently sorts
 * its list — so the label a chat gets never shifts just because the feed's
 * display order does.
 *
 * Ask-origin only. A `pal_match` conversation is never anonymous (identity
 * is revealed from the start — see Conversation.origin in lib/types.ts), so
 * it must never consume a slot in this numbering — doing so would shift
 * every Ask conversation's label depending on unrelated Pal Auto Match
 * activity. Filtered here, not at each call site, so this stays correct
 * regardless of what the caller passes in.
 */
export function anonymousPalLabels(
  conversations: Conversation[],
  meId: PersonId,
): Record<string, string> {
  const mine = [...conversations]
    .filter((c) => c.origin === 'ask' && c.participantIds.includes(meId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const labels: Record<string, string> = {}
  mine.forEach((c, i) => {
    labels[c.id] = `Anonymous Pal ${i + 1}`
  })
  return labels
}
