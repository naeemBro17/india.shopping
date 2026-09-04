import { cx } from './ui.jsx'

/**
 * The ONE stat card. Used only in the Home screen 2x2 grid.
 */
export default function StatCard({ label, value }) {
  const long = typeof value === 'string' && value.length > 6
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
    </div>
  )
}
