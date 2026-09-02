import { cx, formatINR } from './ui.jsx'
import { CheckIcon } from './Icons.jsx'
import { PRIORITY_META } from '../store/useStore.js'

export default function ProductCard({ product, stores, onOpen, onToggle, justAdded }) {
  const meta = PRIORITY_META[product.priority] || PRIORITY_META.normal
  const storeNames = product.store_ids
    .map((id) => stores.find((s) => s.id === id)?.name)
    .filter(Boolean)

  return (
    <div
      className={cx(
        'bg-surface border border-border rounded-card transition',
        justAdded && 'animate-fade-in-up',
        product.is_bought && 'opacity-70'
      )}
    >
      <div className="flex">
        <button
          onClick={() => onOpen?.(product)}
          className="flex-1 text-left p-3.5 min-w-0"
        >
          <p
            className={cx(
              'text-[16px] font-semibold text-text-primary leading-snug',
              product.is_bought && 'line-through decoration-text-secondary/60'
            )}
          >
            {product.name}
          </p>
          {product.brand && (
            <p className="text-[13.5px] text-text-secondary mt-0.5">{product.brand}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span
              className={cx(
                'inline-flex items-center px-2 py-[3px] rounded-full text-[12px] font-medium border leading-none',
                meta.pill
              )}
            >
              {meta.label}
            </span>
            <span className="text-[12.5px] text-text-secondary">Qty {product.quantity}</span>
            {product.estimated_price > 0 && (
              <>
                <span className="text-text-secondary/40">·</span>
                <span className="text-[12.5px] text-text-secondary">
                  est. {formatINR(product.estimated_price)}
                </span>
              </>
            )}
          </div>

          {storeNames.length > 0 && (
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

        <button
          onClick={() => onToggle?.(product)}
          aria-label={product.is_bought ? 'Mark as not bought' : 'Mark as bought'}
          aria-pressed={product.is_bought}
          className="w-14 shrink-0 flex items-center justify-center border-l border-border active:bg-surface-2 transition"
        >
          <span
            className={cx(
              'w-7 h-7 rounded-full border flex items-center justify-center transition',
              product.is_bought
                ? 'bg-success border-transparent text-white animate-check-pop'
                : 'border-border text-transparent'
            )}
          >
            <CheckIcon size={16} />
          </span>
        </button>
      </div>
    </div>
  )
}
