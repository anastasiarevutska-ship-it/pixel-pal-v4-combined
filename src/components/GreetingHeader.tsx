import { Avatar } from './ui/Avatar'
import { useDemoStore } from '../store/useDemoStore'
import iconBellBody from '../assets/shared/icon-bell-body.svg'
import iconBellDot from '../assets/shared/icon-bell-dot.svg'

/** Avatar + greeting + notification bell — the header pattern shared by
 * Home, Messages, and Community across the reference screenshots. */
export function GreetingHeader({ line1, line2 }: { line1: string; line2: string }) {
  const me = useDemoStore((s) => s.me)
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar name={me.displayName} src={me.avatarUrl} size="lg" />
        <div>
          <p className="text-body text-navy-80">{line1}</p>
          <p className="text-body-bold text-navy-80">{line2}</p>
        </div>
      </div>
      <div className="relative h-5 w-5 shrink-0">
        <img src={iconBellBody} alt="Notifications" className="h-full w-full" />
        <img src={iconBellDot} alt="" aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5" />
      </div>
    </div>
  )
}
