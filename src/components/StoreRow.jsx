import { ChevronRight } from './Icons.jsx'

/**
 * The ONE store row. Used on Home, Stores, and Shopping mode store lists.
 */
export default function StoreRow({ store, total = 0, remaining = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-surface-2 transition min-h-[56px]"
    >
      <span className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[11px] font-semibold text-text-secondary shrink-0">
        {store.type === 'online' ? 'ON' : 'IN'}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-medium truncate">{store.name}</span>
        <span className="block text-[12.5px] text-text-secondary">
          {total === 0
            ? 'No items assigned'
            : remaining === 0
            ? `All ${total} done`
            : `${remaining} of ${total} left`}
        </span>
      </span>
      <ChevronRight size={18} className="text-text-secondary shrink-0" />
    </button>
  )
}
