import type { Ask, Person } from './types'

export const ME_ID = 'me'

export const me: Person = {
  id: ME_ID,
  displayName: 'Samantha',
  alias: 'Samantha',
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

// Other patients — the counterparties Samantha sees anonymously in the feed
// and, later, by real identity if a chat's profile reveal goes both ways.
// Aliases only, no stock photos (Avatar falls back to initials) — matches
// the "alias + non-identifying avatar" prototype fixture called for in the
// product doc, not a claim every real patient uses one.
export const people: Record<string, Person> = {
  p_wren: { id: 'p_wren', displayName: 'Wren', alias: 'Wren' },
  p_nova: { id: 'p_nova', displayName: 'Nova', alias: 'Nova' },
  p_juniper: { id: 'p_juniper', displayName: 'Juniper', alias: 'Juniper' },
  p_sage: { id: 'p_sage', displayName: 'Sage', alias: 'Sage' },
  p_marlowe: { id: 'p_marlowe', displayName: 'Marlowe', alias: 'Marlowe' },
  p_iris: { id: 'p_iris', displayName: 'Iris', alias: 'Iris' },
  p_reese: { id: 'p_reese', displayName: 'Reese', alias: 'Reese' },
  p_tal: { id: 'p_tal', displayName: 'Tal', alias: 'Tal' },
}

// Seeded asks from other patients — realistic, neutral peer-support content
// (treatment, waiting, motivation, side effects, appointments). Never framed
// as a request for medical advice. `anonSeed` only picks a palette index for
// the anonymous avatar — it carries no identity information.
export const seedAsks: Ask[] = [
  {
    id: 'ask_1',
    authorId: 'p_wren',
    text: "I'm starting a new treatment next week and feeling pretty nervous. I'd love to talk to someone who's been through something similar.",
    createdAt: hoursAgo(2),
    status: 'open',
    anonSeed: 0,
  },
  {
    id: 'ask_2',
    authorId: 'p_nova',
    text: "Two months into IVF and the two-week wait is doing my head in. Anyone else find the waiting harder than the actual treatment?",
    createdAt: hoursAgo(5),
    status: 'open',
    anonSeed: 1,
  },
  {
    id: 'ask_3',
    authorId: 'p_juniper',
    text: "Just had an appointment that didn't go the way I'd hoped. Not looking for advice — just wondering if anyone else has felt this discouraged and kept going anyway.",
    createdAt: hoursAgo(9),
    status: 'open',
    anonSeed: 2,
  },
  {
    id: 'ask_4',
    authorId: 'p_sage',
    text: "The side effects from my meds this cycle have hit way harder than last time. Would help to hear from someone who's dealt with something similar.",
    createdAt: hoursAgo(20),
    status: 'open',
    anonSeed: 3,
  },
  {
    id: 'ask_5',
    authorId: 'p_marlowe',
    text: "Some days I feel really motivated and other days I want to give up completely. Is that normal? Would like to talk to someone who gets it.",
    createdAt: hoursAgo(30),
    status: 'open',
    anonSeed: 4,
  },
  {
    id: 'ask_6',
    authorId: 'p_iris',
    text: "First round of IUI didn't work. Trying to figure out how to feel hopeful again before we try again. Open to talking to anyone who's been here.",
    createdAt: hoursAgo(48),
    status: 'open',
    anonSeed: 5,
  },
]

// Held back — used by "Add another incoming request" / reach-in-return demo
// controls so there's more than one extra person available to draw from
// without repeating the same alias twice in one session.
export const reserveResponders = ['p_reese', 'p_tal']
