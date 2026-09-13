import { TRAVEL_CATEGORY_COLORS, convertTravelAmount } from '../store/useStore.js'
import { formatBDT, formatINR } from './ui.jsx'

/**
 * One row in the Travel transaction history. The entry's own currency (৳ or
 * ₹) is always shown next to its amount, never rewritten — a ৳ entry logged
 * before conversion still reads as ৳ here, with a muted ₹ equivalent below
 * once a rate exists.
 */
export default function TravelExpenseRow({ expense, conversionRate, onClick }) {
  const dot = TRAVEL_CATEGORY_COLORS[expense.category] || TRAVEL_CATEGORY_COLORS.Other
  const isBDT = expense.currency === 'BDT'
  const amountLabel = isBDT ? formatBDT(expense.amount) : formatINR(expense.amount)
  const equivalent =
    isBDT && conversionRate
      ? formatINR(convertTravelAmount(expense.amount, 'BDT', 'INR', conversionRate))
      : null

  const dateLabel = new Date(expense.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <button
      type="button"
      onClick={() => onClick?.(expense)}
      className="w-full flex items-center gap-3 px-3.5 py-3 text-left active:bg-surface-2 transition"
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="text-[14.5px] font-medium truncate">{expense.category}</span>
          <span className="text-[12px] text-text-muted shrink-0">· {dateLabel}</span>
        </span>
        {expense.note && (
          <span className="block text-[12.5px] text-text-secondary truncate mt-0.5">
            {expense.note}
          </span>
        )}
      </span>
      <span className="text-right shrink-0">
        <span className="block text-[15px] font-semibold tabular-nums">{amountLabel}</span>
        {equivalent && (
          <span className="block text-[11.5px] text-text-muted tabular-nums mt-0.5">
            ≈ {equivalent}
          </span>
        )}
      </span>
    </button>
  )
}
