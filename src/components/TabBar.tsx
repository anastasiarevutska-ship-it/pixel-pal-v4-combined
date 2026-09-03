import { Link, useLocation } from 'react-router-dom'
import { useDemoStore } from '../store/useDemoStore'
import { ME_ID } from '../lib/seed'
import iconNavHomeActive from '../assets/shared/icon-nav-home.svg'
import iconNavHomeInactive from '../assets/shared/icon-nav-home-inactive.svg'
import iconNavTreatment from '../assets/shared/icon-nav-treatment.svg'
import iconNavMessagesActive from '../assets/shared/icon-nav-messages-active.svg'
import iconNavMessagesInactive from '../assets/shared/icon-nav-chat.svg'
import iconNavBook from '../assets/shared/icon-nav-book.svg'
import iconNavCommunity from '../assets/shared/icon-nav-community.svg'

type Tab = {
  key: string
  label: string
  to?: string
  active?: boolean
  activeIcon?: string
  inactiveIcon?: string
  icon?: string
  dot?: boolean
}

/**
 * Real bottom nav (Home / Treatment / Messages / Library / Groups) — same
 * five items and order as the reference screenshots. Home/Messages/Groups
 * are wired to real screens; Treatment/Library stay visual-only, shown
 * honestly rather than faked as working (same convention as the other
 * Pixel Pal prototypes).
 */
export function TabBar() {
  const { pathname } = useLocation()
  const asks = useDemoStore((s) => s.asks)
  const messageRequests = useDemoStore((s) => s.messageRequests)

  // A quiet "something to check" dot on Groups: a pending request has
  // arrived on one of my own open asks.
  const myOpenAskIds = new Set(
    Object.values(asks)
      .filter((a) => a.authorId === ME_ID)
      .map((a) => a.id),
  )
  const hasPendingOnMyAsk = Object.values(messageRequests).some(
    (r) => myOpenAskIds.has(r.askId) && r.status === 'pending',
  )

  const tabs: Tab[] = [
    {
      key: 'home',
      label: 'Home',
      to: '/home',
      active: pathname.startsWith('/home'),
      activeIcon: iconNavHomeActive,
      inactiveIcon: iconNavHomeInactive,
    },
    { key: 'treatment', label: 'Treatment', icon: iconNavTreatment },
    {
      key: 'messages',
      label: 'Messages',
      to: '/messages',
      active: pathname.startsWith('/messages'),
      activeIcon: iconNavMessagesActive,
      inactiveIcon: iconNavMessagesInactive,
    },
    { key: 'library', label: 'Library', icon: iconNavBook },
    {
      key: 'groups',
      label: 'Groups',
      to: '/groups',
      active: pathname.startsWith('/groups'),
      icon: iconNavCommunity,
      dot: hasPendingOnMyAsk,
    },
  ]

  return (
    <div className="flex items-start border-t border-lavender-20 bg-white px-2 pt-2">
      {tabs.map((tab) => {
        const isActive = tab.active ?? false
        const icon = tab.icon ?? (isActive ? tab.activeIcon : tab.inactiveIcon)
        const inner = (
          <div className="flex flex-1 flex-col items-center gap-0.5 pb-2">
            <div className="relative h-6 w-6">
              <img src={icon} alt="" aria-hidden="true" className="h-6 w-6" />
              {tab.dot && (
                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-pill bg-coral" />
              )}
            </div>
            <p className={isActive ? 'text-nav-label-active text-neutral-900' : 'text-nav-label text-navy-60'}>
              {tab.label}
            </p>
          </div>
        )

        if (!tab.to) {
          return (
            <div key={tab.key} className="flex flex-1">
              {inner}
            </div>
          )
        }

        return (
          <Link key={tab.key} to={tab.to} className="flex flex-1">
            {inner}
          </Link>
        )
      })}
    </div>
  )
}
