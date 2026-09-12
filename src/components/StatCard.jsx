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

  return (
    <div className="bg-surface border border-border rounded-card p-3.5">
      <p
        className={cx(
          'font-bold leading-none tabular-nums',
          long ? 'text-[19px]' : 'text-[24px]'
        )}
      >
        {value}
      </p>
      <p className="text-[12px] text-text-secondary mt-1.5">{label}</p>
      {pct != null && (
        <div className="h-1 rounded-full bg-surface-2 overflow-hidden mt-2.5">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
