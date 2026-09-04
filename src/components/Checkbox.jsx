import { cx } from './ui.jsx'
import { CheckIcon } from './Icons.jsx'

/**
 * The ONE checkbox. Identical everywhere — Products list and Shopping mode.
 *
 * Default: circle outline, transparent fill, accent border.
 * Checked: circle fills with the accent colour + a white checkmark that
 * pops in (scale 0 → 1.15 → 1 over ~200ms). Un-checking just reverses.
 *
 * Props:
 *   checked   bool
 *   onToggle  (event) => void   — receives the click event (caller stops
 *                                 propagation so a row tap doesn't also fire)
 *   size      'md' (list) | 'lg' (shopping mode)
 */
export default function Checkbox({ checked, onToggle, size = 'md', ariaLabel }) {
  const lg = size === 'lg'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-pressed={checked}
      className={cx(
        'shrink-0 flex items-center justify-center rounded-full border-2 outline-none',
        'transition-[background-color,border-color,transform] duration-200 ease-out',
        lg ? 'w-8 h-8' : 'w-[26px] h-[26px]',
        checked
          ? 'bg-accent border-accent text-white animate-scale-pop'
          : 'bg-transparent border-[color:color-mix(in_srgb,var(--accent)_45%,transparent)] text-transparent active:bg-surface-2'
      )}
    >
      {checked && (
        <span className="flex animate-check-pop">
          <CheckIcon size={lg ? 18 : 15} strokeWidth={3} />
        </span>
      )}
    </button>
  )
}
