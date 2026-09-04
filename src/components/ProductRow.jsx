import { cx, formatINR } from './ui.jsx'
import { CheckIcon } from './Icons.jsx'
import { PRIORITY_META } from '../store/useStore.js'

/**
 * The ONE product row. Used on Products, Store detail, and Shopping mode.
 * Same layout / spacing / typography everywhere — only the left control
 * changes: a browsing checkbox vs a shopping BOUGHT button.
 *
 * Reading order is always: [check] → name → details.
 *
 * Props:
 *   mode      'browse' (default) | 'shopping'
 *   onToggle  (product) => void   — toggles is_bought (same action both modes)
 *   onOpen    (product) => void   — opens edit sheet (browse mode only)
 */
export default function ProductRow({
  product,
  stores = [],
  mode = 'browse',
  onOpen,
  onToggle,
  justAdded,
}) {
  const shopping = mode === 'shopping'
  const bought = product.is_bought
  const meta = PRIORITY_META[product.priority] || PRIORITY_META.normal
  const storeNames = (product.store_ids || [])
    .map((id) => stores.find((s) => s.id === id)?.name)
    .filter(Boolean)

  return (
    <div
      className={cx(
        'flex items-stretch bg-surface border border-border rounded-card transition-all duration-200',
        justAdded && 'animate-fade-in-up',
        bought && 'opacity-60'
      )}
    >
      {/* LEFT — bought control */}
      <button
        type="button"
        onClick={() => onToggle?.(product)}
        aria-label={bought ? 'Mark as not bought' : 'Mark as bought'}
        aria-pressed={bought}
        className={cx(
          'shrink-0 flex items-center justify-center border-r border-border active:bg-surface-2 transition',
          shopping ? 'w-[60px]' : 'w-12'
        )}
      >
        <span
          className={cx(
            'flex items-center justify-center rounded-full border transition-colors',
            shopping ? 'w-9 h-9' : 'w-6 h-6',
            bought
              ? 'bg-success border-transparent text-white animate-check-in'
              : shopping
              ? 'border-accent text-accent'
              : 'border-border text-transparent'
          )}
        >
          <CheckIcon size={shopping ? 18 : 14} />
        </span>
      </button>

      {/* CONTENT */}
      <button
        type="button"
        onClick={() => (shopping ? onToggle?.(product) : onOpen?.(product))}
        className="flex-1 min-w-0 text-left px-3.5 py-3"
      >
        <p
          className={cx(
            'text-[15.5px] font-semibold text-text-primary leading-snug',
            bought && 'line-through decoration-text-secondary/60'
          )}
        >
          {product.name}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span
            className={cx(
              'inline-flex items-center px-2 py-[3px] rounded-full text-[11.5px] font-medium border leading-none',
              meta.pill
            )}
          >
            {meta.label}
          </span>
          <span className="text-[12.5px] text-text-secondary">Qty {product.quantity}</span>
          {product.brand && (
            <span className="text-[12.5px] text-text-secondary">· {product.brand}</span>
          )}
          {!shopping && product.estimated_price > 0 && (
            <span className="text-[12.5px] text-text-secondary">
              · est. {formatINR(product.estimated_price)}
            </span>
          )}
        </div>

        {shopping && product.notes && !bought && (
          <p className="text-[12.5px] text-text-secondary mt-1.5">{product.notes}</p>
        )}

        {!shopping && storeNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {storeNames.map((n) => (
              <span
                key={n}
                className="text-[11.5px] px-2 py-[3px] rounded-full bg-surface-2 border border-border text-text-secondary"
              >
                {n}
              </span>
            ))}
          </div>
        )}
      </button>
    </div>
  )
}
