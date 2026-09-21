import { Button } from '../../components/ui/Button'

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="white" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5-9-5.5Z" />
    </svg>
  )
}

// Lightweight mock content matching the reference "Community_Home_NoGroups"
// screenshot — no group-browsing flow exists to wire this to, same
// presentational-only treatment as the screenshot's own thumbnails.
const mockGroups = [
  {
    id: 'fertility-on-ice',
    tone: 'bg-lavender-40',
    title: 'Fertility on Ice',
    description: 'A community of those who have chosen to freeze their eggs',
  },
  {
    id: 'gestational-carrier',
    tone: 'bg-yellow-40',
    title: 'Gestational Carrier',
    description: 'A space for sharing personal experiences related to Gestational Carrier',
  },
  {
    id: 'fertility-journey',
    tone: 'bg-lavender-20',
    title: 'Fertility Journey',
    description: 'An environment where people can discuss fertility treatments',
  },
]

/** `/groups` — the Groups tab, recreated from the reference screenshot. */
export default function GroupsTab() {
  return (
    <>
      <p className="text-center text-screen-title text-navy">You&rsquo;re not following any groups yet.</p>
      <Button variant="soft">Explore Groups</Button>

      <div className="flex flex-col gap-3">
        <p className="text-label-bold uppercase text-navy-60">Groups for you</p>
        {mockGroups.map((group) => (
          <div key={group.id} className="flex items-center gap-3 rounded-card bg-lavender-20 p-3">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-field ${group.tone}`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-navy/60">
                <PlayIcon />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-body-bold text-navy">{group.title}</p>
              <p className="text-body-sm text-navy-60">{group.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
