import { cx } from './ui.jsx'
import Checkbox from './Checkbox.jsx'

/**
 * The ONE product row. Used on Products, Store detail, and Shopping mode —
 * same file, same styling. A couple of props nudge the context:
 *
 *   mode         'browse' (default) | 'shopping'
 *   showStoreTag show the store name as subtext (Products screen)
 *   onToggle     (product) => void   — toggles is_bought
 *   onOpen       (product) => void   — opens edit view (browse only)
 *
 * Reading order is always: [checkbox] → name → muted subtext.
 * Priority is a subtle coloured dot, never a pill.
 */

const DOT = {
  must_buy: 'bg-[var(--accent-warm)]',
  if_available: 'bg-[var(--accent)]',
}

export default function ProductRow({
  product,
  stores = [],
  mode = 'browse',
  showStoreTag = false,
  onOpen,
  onToggle,
  justAdded,
}) {
  const shopping = mode === 'shopping'
  const bought = product.is_bought

  const storeName = showStoreTag
    ? (product.store_ids || [])
        .map((id) => stores.find((s) => s.id === id)?.name)
        .filter(Boolean)[0]
    : null

  // one line of muted subtext, at most
  const subtext =
    product.brand ||
    (shopping && product.notes) ||
    storeName ||
    null

  const dot = DOT[product.priority]

  function toggle(e) {
    e.stopPropagation()
    onToggle?.(product)
  }

  return (
    <div
      onClick={() => (shopping ? onToggle?.(product) : onOpen?.(product))}
      className={cx(
        'flex items-center gap-3 bg-surface border border-border rounded-card px-3.5 py-3 transition',
        !bought && 'active:bg-surface-2 cursor-pointer',
        justAdded && 'animate-fade-in-up',
        bought && 'opacity-50'
      )}
    >
      <Checkbox
        checked={bought}
        size={shopping ? 'lg' : 'md'}
        ariaLabel={bought ? 'Mark as not bought' : 'Mark as bought'}
        onToggle={toggle}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {dot && !bought && (
            <span className={cx('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
          )}
          <p
            className={cx(
              'text-[15.5px] font-medium text-text-primary leading-snug truncate',
              bought && 'line-through decoration-text-secondary/50'
            )}
          >
            {product.name}
          </p>
        </div>
        {subtext && !bought && (
          <p className="text-[12.5px] text-text-secondary truncate mt-0.5">
            {subtext}
          </p>
        )}
      </div>

      {product.quantity > 1 && !bought && (
        <span className="text-[12.5px] text-text-secondary shrink-0 tabular-nums">
          ×{product.quantity}
        </span>
      )}
    </div>
  )
}
