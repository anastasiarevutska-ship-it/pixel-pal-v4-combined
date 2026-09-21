import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabBar } from '../components/TabBar'
import { GreetingHeader } from '../components/GreetingHeader'
import { Button } from '../components/ui/Button'
import { useDemoStore } from '../store/useDemoStore'
import bgGlow from '../assets/shared/bg-glow.png'
import iconUserHeart from '../assets/shared/icon-user-heart.svg'
import iconPeopleHeart from '../assets/shared/icon-people-heart.svg'

function ChevronDownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 10.5 3 3 3-3" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-navy">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <rect x="7" y="12" width="2" height="5" rx="1" fill="#E7DBFB" />
      <rect x="11" y="7" width="2" height="10" rx="1" fill="#E7DBFB" />
      <rect x="15" y="10" width="2" height="7" rx="1" fill="#E7DBFB" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-navy">
      <path d="M2 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2h3.2a2 2 0 0 1 1.6.8l1.6 2.1a2 2 0 0 1 .4 1.2V16a2 2 0 0 1-2 2h-.6a2.5 2.5 0 0 1-4.8 0h-3.2a2.5 2.5 0 0 1-4.8 0H4a2 2 0 0 1-2-2V6Z" />
      <circle cx="7.5" cy="18" r="1.5" fill="#E7DBFB" />
      <circle cx="16.5" cy="18" r="1.5" fill="#E7DBFB" />
    </svg>
  )
}

const glassCard = 'rounded-card border border-white/40 bg-glass-fill p-3 shadow-glass backdrop-blur-glass'

function EventCard({
  icon,
  title,
  when,
  detail,
  tone,
}: {
  icon: ReactNode
  title: string
  when: string
  detail: string
  tone: 'glass' | 'yellow'
}) {
  return (
    <div className={`flex flex-col gap-6 ${tone === 'yellow' ? 'rounded-card bg-yellow-40 p-3' : glassCard}`}>
      <div className="flex items-center gap-4">
        <span className="flex shrink-0 items-center justify-center rounded-icon bg-lavender-40 p-2">{icon}</span>
        <p className="min-w-0 flex-1 text-card-title text-navy">{title}</p>
      </div>
      <div className="flex flex-col gap-1.5 text-body text-navy-80">
        <p className="text-body-bold">{when}</p>
        <p>{detail}</p>
      </div>
    </div>
  )
}

const promos = {
  pixel_pal: {
    icon: iconUserHeart,
    title: 'Pixel Pal',
    description:
      'Connect one-to-one with someone who understands. Share experiences, talk things through, and navigate fertility treatment together.',
    cta: 'Find a Pixel Pal',
    to: '/pixel-pal-match/how-it-works',
  },
  peer_support: {
    icon: iconPeopleHeart,
    title: 'Peer Support',
    description:
      'Share a question, worry, or experience anonymously — or reach out when someone else’s story resonates.',
    cta: 'Share with peers',
    to: '/groups/pixel-pal',
  },
} as const

/**
 * `/home` — the Home tab, recreated from the "Homescreen_Final" Figma
 * reference (PIXEL Care · NEW Patient App, node 16785:20785). Presentational
 * only: the treatment day, dose, lab test and delivery are static demo copy,
 * same as the reference — there is no treatment data model in this concept.
 * The header's avatar stays the initials fallback (no stock photo of a real
 * person, see Avatar.tsx) rather than the reference's headshot.
 */
export default function HomeStub() {
  const navigate = useNavigate()
  // One value, so at most one promo can ever render (see HomePromoDemo).
  const promoKey = useDemoStore((s) => s.homePromoDemo)
  const promo = promoKey === 'none' ? undefined : promos[promoKey]

  return (
    <div className="relative flex min-h-full flex-col">
      <img
        src={bgGlow}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 w-full [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)]"
      />

      <div className="relative flex flex-col gap-10 p-5">
        <div className="flex flex-col gap-5">
          <GreetingHeader line1="How can we help," line2="Samantha?" />

          <div className="flex flex-col gap-6 pt-4 text-center">
            <div className="flex flex-col gap-4 text-navy">
              <p className="text-display">Day 12</p>
              <p className="text-h4">of In Vitro Fertilization</p>
            </div>
            <p className="text-h4 text-navy-60">
              You&rsquo;re on a remarkable journey and every day is another step.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`flex flex-col gap-6 ${glassCard}`}>
            <p className="text-card-title text-navy">Next Dose @ 2pm</p>
            <div className="flex items-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col text-body text-navy-80">
                <p className="text-body-bold">Menopur</p>
                <p>75iu injection</p>
              </div>
              <button
                type="button"
                aria-label="Show dose details"
                className="flex shrink-0 items-center justify-center rounded-icon bg-navy p-2"
              >
                <ChevronDownIcon />
              </button>
            </div>
          </div>

          {promo && (
            <div className={`flex flex-col gap-4 ${glassCard}`}>
              <div className="flex items-center gap-4">
                <span className="flex shrink-0 items-center justify-center rounded-icon bg-navy p-3">
                  <img src={promo.icon} alt="" aria-hidden="true" className="h-6 w-6" />
                </span>
                <p className="min-w-0 flex-1 text-card-title text-navy">{promo.title}</p>
              </div>
              <p className="text-body text-navy-80">{promo.description}</p>
              <Button variant="soft" onClick={() => navigate(promo.to)}>
                {promo.cta}
              </Button>
            </div>
          )}

          <EventCard
            tone="yellow"
            icon={<ChartIcon />}
            title="Lab Test"
            when="Wednesday, Sept. 27 | 3:30pm"
            detail="Columbus Center for Reproductive Endocrinology & Infertility"
          />

          <EventCard
            tone="glass"
            icon={<TruckIcon />}
            title="Delivery"
            when="Wednesday, Sept. 27 | 6:00pm"
            detail="2 medications are coming today."
          />
        </div>
      </div>

      <div className="relative mt-auto">
        <TabBar />
      </div>
    </div>
  )
}
