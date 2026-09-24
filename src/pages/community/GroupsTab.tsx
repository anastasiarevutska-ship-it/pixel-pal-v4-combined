import { Button } from '../../components/ui/Button'
import fertilityOnIce from '../../assets/groups/fertility-on-ice.jpg'
import gestationalCarrier from '../../assets/groups/gestational-carrier.jpg'
import fertilityJourney from '../../assets/groups/fertility-journey.jpg'

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5-9-5.5Z" />
    </svg>
  )
}

// Mock content from the Figma "My Groups" frame (node 16899:78023) — no
// group-browsing flow exists to wire this to. Thumbnails are the frame's own
// images, center-cropped to 3x the 88px display size.
const mockGroups = [
  {
    id: 'fertility-on-ice',
    image: fertilityOnIce,
    title: 'Fertility on Ice',
    description: 'A community of those who have chosen to freeze their eggs',
  },
  {
    id: 'gestational-carrier',
    image: gestationalCarrier,
    title: 'Gestational Carrier',
    description: 'A space for sharing personal experiences related to Gestational Carrier',
  },
  {
    id: 'fertility-journey',
    image: fertilityJourney,
    title: 'Fertility Journey',
    description: 'An environment where people can discuss fertility treatments',
  },
]

/**
 * `/groups` — the My Groups tab (Figma node 16899:78023). Spacing below the
 * tabs is measured from that frame: 32 to the title, 24 to the button, 48 to
 * "Groups for you", 24 to the first card, cards 12 apart.
 */
export default function GroupsTab() {
  return (
    <>
      <div className="flex flex-col gap-6 pt-4">
        {/* `text-balance` gives the same "You're not following / any groups
            yet." break as the Figma instead of a lone "yet." line. */}
        <p className="text-balance text-center text-h4 leading-8 text-navy-80">
          You&rsquo;re not following any groups yet.
        </p>
        <Button variant="soft">Explore Groups</Button>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <p className="text-h5 uppercase text-navy-80">Groups for you</p>
        <div className="flex flex-col gap-3">
          {mockGroups.map((group) => (
            <div key={group.id} className="flex items-center gap-3 rounded-card bg-lavender-20 p-3 shadow-card">
              <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-icon">
                <img src={group.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-tag bg-lavender-40 text-navy">
                  <PlayIcon />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-body-sm-bold text-navy">{group.title}</p>
                <p className="text-body-sm text-navy-80">{group.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
