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
 */
export function anonymousPalLabels(
  conversations: Conversation[],
  meId: PersonId,
): Record<string, string> {
  const mine = [...conversations]
    .filter((c) => c.participantIds.includes(meId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const labels: Record<string, string> = {}
  mine.forEach((c, i) => {
    labels[c.id] = `Anonymous Pal ${i + 1}`
  })
  return labels
}
