type ChipVariant = 'default' | 'filter' | 'option'

type ChipProps = {
  label: string
  /** e.g. the acronym: "Frozen embryo transfer" + secondary "(FET)" (spec M3). */
  secondary?: string
  selected: boolean
  onClick: () => void
  /** `filter` is the real Content Library filter/tag chip — border, radius,
   * padding and typography extracted from the Library screen's own "Filters"
   * component (Figma node 6143:26170, PIXEL Care · "NEW Patient App" file)
   * via the Figma MCP connector, not approximated — plus the inline clear
   * ("×") on the selected state, which that reference doesn't show an
   * example of, so it reuses this app's own established yellow-80-fill
   * selected language instead of inventing a new one. `default`'s own shape
   * and colors are untouched. */
  variant?: ChipVariant
}

const variantStyles: Record<ChipVariant, { shape: string; selectedColor: string; unselectedColor: string }> = {
  default: {
    shape: 'min-h-11 gap-1.5 rounded-field border px-4 text-body-sm-bold',
    selectedColor: 'border-navy bg-navy text-white',
    unselectedColor: 'border-navy-20 bg-white text-navy hover:border-navy-40',
  },
  // Stacked, full-width preference option (Pal Auto Match onboarding
  // reference) — same `field` radius/type as `default`, just block-level
  // with a lavender resting border instead of `default`'s gray, so an
  // unselected option still reads as an inviting purple pill rather than a
  // disabled-looking gray outline.
  option: {
    shape: 'w-full min-h-11 justify-center gap-1.5 rounded-field border px-4 text-body-sm-bold',
    selectedColor: 'border-navy bg-navy text-white',
    unselectedColor: 'border-lavender bg-white text-navy hover:border-navy-40',
  },
  filter: {
    // `rounded-tag` (4px) and `text-tag-bold` (12px/13px line/0.12px
    // tracking) are both Library-sourced tokens (see tailwind.config.js) —
    // sharper corners and a smaller label than this app's other chip/field
    // shapes, matching the reference exactly rather than reusing `field`'s
    // 12px radius or `body-sm-bold`'s 13px type. Padding is `p-1.5` (6px),
    // not the reference's own uniform `p-2` (8px): its three real labels
    // (see PixelPalFeedTab.tsx's EXPERIENCE_FILTERS) plus the selected-state
    // "×" this app adds don't quite fit three-across at 8px on the 390px
    // device frame this targets (see PhoneFrame.tsx) — verified against
    // actual rendered widths in every selected/unselected combination, not
    // eyeballed. `gap-0.5` is this app's own addition for that "×", which
    // the reference never shows a chip needing.
    shape: 'gap-0.5 rounded-tag border p-1.5 text-tag-bold',
    selectedColor: 'border-navy-80 bg-yellow-80 text-navy-80',
    unselectedColor: 'border-navy-80 bg-white text-navy-80',
  },
}

/** Selectable chip — single or multi-select is the caller's concern (spec §4). */
export function Chip({ label, secondary, selected, onClick, variant = 'default' }: ChipProps) {
  const styles = variantStyles[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex shrink-0 items-center transition-colors ${styles.shape} ${
        selected ? styles.selectedColor : styles.unselectedColor
      }`}
    >
      <span>{label}</span>
      {secondary && (
        <span className={`text-label ${selected ? 'text-lavender-40' : 'text-navy-60'}`}>{secondary}</span>
      )}
      {variant === 'filter' && selected && <span aria-hidden="true">×</span>}
    </button>
  )
}
