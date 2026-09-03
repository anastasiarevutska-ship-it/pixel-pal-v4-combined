import { Link } from 'react-router-dom'
import { TabBar } from '../components/TabBar'
import { GreetingHeader } from '../components/GreetingHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import bgGlow from '../assets/shared/bg-glow.png'

/**
 * `/home` — not part of Concept B. Kept only so the bottom nav has
 * somewhere real to land on Home, same way Treatment/Library stay visual
 * placeholders. The actual concept lives under Groups → Pixel Pal.
 */
export default function HomeStub() {
  return (
    <div className="relative flex min-h-full flex-col">
      <img
        src={bgGlow}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] w-full object-cover"
      />
      <div className="relative flex flex-col gap-6 p-5">
        <GreetingHeader line1="Welcome back," line2="Samantha!" />
        <EmptyState
          title="Your care dashboard"
          description="Not part of this concept prototype — the Pixel Pal walkthrough lives under Groups."
          action={
            <Link to="/groups" className="w-full">
              <Button variant="secondary">Go to Groups</Button>
            </Link>
          }
        />
      </div>
      <div className="relative mt-auto">
        <TabBar />
      </div>
    </div>
  )
}
