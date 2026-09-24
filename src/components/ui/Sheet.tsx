import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePhoneOverlayNode } from './PhoneFrame'

type SheetProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Pinned action area below a divider (e.g. the sheet's main CTA) — stays
   * visible while a long body scrolls. */
  footer?: ReactNode
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

/**
 * Bottom sheet (spec §4), matched to the Figma pop-ups (e.g. node
 * 16913:93895): small bold title with a close ✕ on the right, content over
 * a blurred (not darkened) page, and an optional footer for the main action
 * below a divider. Slides up from the bottom; fades instead when
 * `prefers-reduced-motion` is set (spec §8). Portals into PhoneFrame's
 * overlay layer (see PhoneFrame.tsx) so it always pins to the visible
 * device screen — including covering the tab bar — regardless of how far a
 * long, scrollable page has scrolled, or how deeply this is invoked from in
 * the route tree. Falls back to rendering in place if there's no PhoneFrame
 * ancestor.
 */
export function Sheet({ isOpen, onClose, title, children, footer }: SheetProps) {
  const prefersReducedMotion = useReducedMotion()
  const overlayNode = usePhoneOverlayNode()

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-white/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative z-10 flex max-h-[85%] w-full flex-col rounded-t-card bg-white shadow-card"
            initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
            animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-start gap-3 px-5 py-6">
              {title && <h2 className="flex-1 text-body-bold text-navy-80">{title}</h2>}
              {/* 24px glyph with a 44px hit area (negative margin keeps it
                  visually flush with the content edge). */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-m-2.5 ml-auto flex h-11 w-11 shrink-0 items-center justify-center text-navy-80"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pb-5">{children}</div>
            {footer && <div className="border-t border-navy-20 px-5 pb-6 pt-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return overlayNode ? createPortal(content, overlayNode) : content
}
