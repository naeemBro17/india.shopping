import { cx } from './ui.jsx'

/**
 * The ONE stat card. Used only in the Home screen 2x2 grid.
 *
 * `progress`, when given as { value, total }, renders a thin accent-coloured
 * bar under the number — used for things like must-buy / bought progress.
 */
export default function StatCard({ label, value, progress }) {
  const long = typeof value === 'string' && value.length > 6
  const pct =
    progress && progress.total > 0
      ? Math.max(0, Math.min(100, Math.round((progress.value / progress.total) * 100)))
      : null
  // A 0% bar would render as a flat grey track — nudge it to a small
  // visible sliver so it never looks like a rendering failure.
  const barWidth = pct === 0 ? '6px' : pct != null ? `${pct}%` : undefined

  return (
    <div className="bg-surface border border-border rounded-card px-3 py-2">
      <p
        className={cx(
          'font-bold leading-none tabular-nums',
          long ? 'text-[18px]' : 'text-[24px]'
        )}
      >
        {value}
      </p>
      <p className="text-[11px] leading-none text-text-secondary mt-1.5 truncate">{label}</p>
      {pct != null && (
        <div className="h-[3px] rounded-full bg-surface-2 overflow-hidden mt-2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: barWidth }}
          />
        </div>
      )}
    </div>
  )
}
