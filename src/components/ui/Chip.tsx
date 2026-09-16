type ChipVariant = 'default' | 'filter'

type ChipProps = {
  label: string
  /** e.g. the acronym: "Frozen embryo transfer" + secondary "(FET)" (spec M3). */
  secondary?: string
  selected: boolean
  onClick: () => void
  /** `filter` is the compact Content Library treatment-cycle-filter look —
   * shorter, tighter proportions than `default`/Button so it reads as a
   * filter control rather than a CTA, plus the inline clear ("×") on the
   * selected state. `default`'s own shape and colors are untouched. */
  variant?: ChipVariant
}

const variantStyles: Record<ChipVariant, { shape: string; selectedColor: string; unselectedColor: string }> = {
  default: {
    shape: 'min-h-11 gap-1.5 rounded-field border px-4 text-body-sm-bold',
    selectedColor: 'border-navy bg-navy text-white',
    unselectedColor: 'border-navy-20 bg-white text-navy hover:border-navy-40',
  },
  filter: {
    // Fixed 36px height (vs. Button's 44px) and snug px-3 padding so it
    // hugs its label instead of stretching like a CTA; a visible 1px navy
    // outline in both states (not the faint border-navy-20 `default` uses)
    // is what separates "on" (yellow fill) from "off" (white fill) — the
    // border itself doesn't change.
    shape: 'h-9 gap-1 rounded-field border px-3 text-body-sm-bold',
    selectedColor: 'border-navy bg-yellow-80 text-navy',
    unselectedColor: 'border-navy bg-white text-navy',
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
