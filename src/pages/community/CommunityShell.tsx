import { Link, Outlet, useLocation } from 'react-router-dom'
import { TabBar } from '../../components/TabBar'
import { GreetingHeader } from '../../components/GreetingHeader'
import bgGlow from '../../assets/shared/bg-glow.png'

/**
 * `/groups` and `/groups/pixel-pal` share this shell: same header as the
 * Groups reference screenshot, plus a segmented control that makes Pixel
 * Pal a sibling section of Community rather than a separate product —
 * "Groups = public conversations, Pixel Pal = private one-to-one" is meant
 * to read as one screen with two tabs, the same way the reference nav
 * treats Home/Messages/Groups as siblings.
 *
 * The tab itself reads "Peer Support" — the type of experience, for
 * navigation — while "Pixel Pal" stays the feature/brand name introduced
 * once you're inside it (feed header, cards, etc.). Route names/params keep
 * the `pixel-pal` slug; only this nav label changed.
 */
export default function CommunityShell() {
  const { pathname } = useLocation()
  const onPixelPal = pathname.startsWith('/groups/pixel-pal')

  return (
    <div className="relative flex min-h-full flex-col">
      {/* Full-bleed at its natural aspect ratio (no object-cover crop/zoom,
          which would both distort and over-saturate this soft gradient) —
          masked to fade to transparent over its own last third so it blends
          into the base page color rather than hard-cutting wherever it
          happens to end. Content further down the scroll (later group
          cards) simply sits on the plain base color, the same way the
          reference design's glow fades out well before the fold. Scrolls
          with the content it sits behind (both live in this same `relative`
          column) rather than staying pinned to the viewport, which is what
          keeps it feeling continuous as you scroll into the feed instead of
          the image "running out" after one screen height. */}
      <img
        src={bgGlow}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 w-full [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)]"
      />

      <div className="relative flex flex-col gap-5 p-5 pb-0">
        <GreetingHeader line1="Join the conversation," line2="Samantha!" />

        {/* Pill segmented control (reference design) — lavender-40 track,
            active tab a raised white pill (shadow-xs), inactive tab plain/
            quiet text on the track itself. One shared instance for both
            routes (`onPixelPal` just flips which side is active), so Groups
            and Peer Support can never drift apart in styling. */}
        <div className="flex gap-1 rounded-pill bg-lavender-40 p-1">
          <Link
            to="/groups"
            className={`flex-1 rounded-pill py-3 text-center text-body-sm-bold transition-colors ${
              !onPixelPal ? 'bg-white text-navy shadow-xs' : 'text-navy-40'
            }`}
          >
            Groups
          </Link>
          <Link
            to="/groups/pixel-pal"
            className={`flex-1 rounded-pill py-3 text-center text-body-sm-bold transition-colors ${
              onPixelPal ? 'bg-white text-navy shadow-xs' : 'text-navy-40'
            }`}
          >
            Peer Support
          </Link>
        </div>
      </div>

      <div className="relative flex flex-col gap-6 p-5 pt-4">
        <Outlet />
      </div>

      <TabBar />
    </div>
  )
}
