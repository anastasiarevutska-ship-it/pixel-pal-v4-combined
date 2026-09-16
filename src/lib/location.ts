// Location context for the Reach-out composer — see docs/concept-b-spec.md.
// Purpose is privacy awareness, not matching: a patient may want to avoid
// (or specifically want) someone geographically close before she sends a
// message request, so this is presented neutrally, never as a good/bad
// signal, and never encourages or discourages the connection itself.
//
// Expressed only as the *relationship* between two locations — the other
// person's exact city/state is never shown beyond "same as mine," which
// reveals nothing about them she didn't already know about herself.

import type { Location } from './types'

export type LocationRelation = 'same_area' | 'same_state' | 'no_overlap'

export function getLocationRelation(me?: Location, other?: Location): LocationRelation | null {
  if (!me || !other) return null
  if (me.city === other.city && me.state === other.state) return 'same_area'
  if (me.state === other.state) return 'same_state'
  return 'no_overlap'
}

export type LocationContext = { title: string; body: string }

/**
 * Copy for the composer's location block. Only the `same_area` case names a
 * city, and it's always the reader's own — never the other person's.
 */
export function getLocationContext(me?: Location, other?: Location): LocationContext | null {
  const relation = getLocationRelation(me, other)
  if (!relation) return null
  switch (relation) {
    case 'same_area':
      return {
        title: 'Same local area',
        body: `You're both in the ${me!.city} area.`,
      }
    case 'same_state':
      return {
        title: 'Same state, different local area',
        body: "You're in the same state, but not the same local area.",
      }
    case 'no_overlap':
      return {
        title: 'No local overlap',
        body: 'This person is outside your area.',
      }
  }
}
