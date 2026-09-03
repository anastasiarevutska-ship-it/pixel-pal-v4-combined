import { createContext, useContext, useState, type ReactNode } from 'react'

/**
 * The device screen's overlay layer — where Sheet/Modal/Toast portal to.
 * Sitting here (a sibling of the scrollable content, inside the *fixed*
 * 844px screen) rather than wherever in the route tree they're invoked
 * from means an overlay always pins to the visible screen and always
 * covers the tab bar, regardless of how deep the caller is nested or how
 * far the page has scrolled. Consumers fall back to rendering inline
 * (no portal) if used outside a PhoneFrame — e.g. a future storybook-style
 * page — so nothing breaks, it just loses the screen-confinement guarantee.
 */
const PhoneOverlayContext = createContext<HTMLDivElement | null>(null)
export function usePhoneOverlayNode() {
  return useContext(PhoneOverlayContext)
}

/**
 * Realistic device frame — spec §8. 390×844 (iPhone-shape), status bar,
 * rounded corners, centered on a Lavender 20 backdrop by the page that
 * uses it (not baked in here, so this component stays reusable outside a
 * full-page context).
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  // A ref alone wouldn't do — mutating `.current` after mount doesn't
  // trigger a re-render, so context consumers would be stuck with the
  // `null` seen on first render. `useState` (with the setter passed
  // straight in as the `ref` callback) re-renders once the node exists.
  const [overlayNode, setOverlayNode] = useState<HTMLDivElement | null>(null)

  return (
    <div className="h-[844px] w-[390px] rounded-frame bg-navy p-3 shadow-card">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-screen bg-gray20">
        <div className="flex items-center justify-between px-6 pb-1 pt-4 text-label-bold text-navy">
          <span>9:41</span>
          <span aria-hidden="true">●●●●</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PhoneOverlayContext.Provider value={overlayNode}>{children}</PhoneOverlayContext.Provider>
        </div>
        {/* Empty and non-interactive until Sheet/Modal portals something
            into it — `pointer-events-none` here keeps it from blocking
            taps on the real screen underneath; the portaled content opts
            back into `pointer-events-auto` itself. */}
        <div ref={setOverlayNode} className="pointer-events-none absolute inset-0" />
      </div>
    </div>
  )
}
