import { useNavigate } from 'react-router-dom'
import { TabBar } from '../components/TabBar'
import { CareTeamBlock } from '../components/CareTeamBlock'
import { GreetingHeader } from '../components/GreetingHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import bgGlow from '../assets/shared/bg-glow.png'
import iconPeopleHeart from '../assets/shared/icon-people-heart.svg'

/**
 * `/messages` — recreation of the reference "Contact us" screenshot. Care
 * Team block is presentational, same as the source design. The Pixel Pal
 * card is a second entry point into Concept B (alongside the Groups tab),
 * so the feature reads as reachable from where patients already look for
 * one-to-one help — not something bolted only onto Groups.
 */
export default function Messages() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-full flex-col">
      <img
        src={bgGlow}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full w-full object-cover"
      />

      <div className="relative flex flex-col gap-6 p-5">
        <GreetingHeader line1="How can we help," line2="Samantha?" />

        <CareTeamBlock />

        <Card variant="glass" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex shrink-0 items-center justify-center rounded-field bg-navy p-3">
              <img src={iconPeopleHeart} alt="" aria-hidden="true" className="h-6 w-6" />
            </span>
            <p className="text-body-sm-bold text-navy-80">Pixel Pal</p>
          </div>
          <p className="text-body text-navy-80">
            Post what's on your mind anonymously, or browse what others are going through. Message
            requests stay private until you choose to accept one.
          </p>
          <Button variant="primary" onClick={() => navigate('/groups/pixel-pal')}>
            Open Pixel Pal
          </Button>
        </Card>
      </div>

      <div className="relative mt-auto">
        <TabBar />
      </div>
    </div>
  )
}
