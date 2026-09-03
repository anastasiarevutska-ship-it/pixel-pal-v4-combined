import { Outlet } from 'react-router-dom'
import { MobileShell } from '../components/MobileShell'

/** Shared PhoneFrame + demo-controls wrapper for every in-app route. */
export default function AppLayout() {
  return (
    <MobileShell>
      <Outlet />
    </MobileShell>
  )
}
