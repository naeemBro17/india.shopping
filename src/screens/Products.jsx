import { useMemo, useState } from 'react'
import { useStore, PRIORITY_ORDER } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import TopBar from '../components/TopBar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductSheet from '../components/ProductSheet.jsx'
import { EmptyState } from '../components/ui.jsx'
import { PlusIcon, SearchIcon, BagIcon } from '../components/Icons.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'must_buy', label: 'Must Buy' },
  { key: 'normal', label: 'Normal' },
  { key: 'if_available', label: 'If Available' },
  { key: 'bought', label: 'Bought' },
]

export default function Products() {
  const products = useStore((s) => s.products)
  const stores = useStore((s) => s.stores)
  const toggleBought = useStore((s) => s.toggleBought)
  const toast = useToast((s) => s.toast)

  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sheet, setSheet] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => {
        if (filter === 'bought') return p.is_bought
        if (filter === 'must_buy') return p.priority === 'must_buy'
        if (filter === 'normal') return p.priority === 'normal'
        if (filter === 'if_available') return p.priority === 'if_available'
        return true
      })
      .filter((p) => {
        if (!q) return true
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (a.is_bought !== b.is_bought) return a.is_bought ? 1 : -1
        const pa = PRIORITY_ORDER[a.priority] ?? 1
        const pb = PRIORITY_ORDER[b.priority] ?? 1
        if (pa !== pb) return pa - pb
        return b.created_at - a.created_at
      })
  }, [products, filter, query])

  const noProducts = products.length === 0

  return (
    <div>
      <TopBar
        title="Products"
        right={
          <button
            onClick={() => setSheet('add')}
            aria-label="Add product"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-primary active:bg-surface-2"
          >
            <PlusIcon size={22} />
          </button>
        }
      />

      <div className="px-4 pt-3 space-y-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`min-h-[38px] px-3.5 rounded-full text-[13.5px] font-medium border whitespace-nowrap transition ${
                filter === f.key
                  ? 'bg-text-primary text-[var(--bg)] border-transparent'
                  : 'bg-surface text-text-secondary border-border active:bg-surface-2'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <SearchIcon size={18} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, notes"
            className="w-full min-h-[44px] pl-10 pr-3 rounded-[10px] bg-surface-2 border border-border text-[15px] outline-none focus:border-accent transition"
          />
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-2.5">
        {noProducts ? (
          <EmptyState
            icon={BagIcon}
            title="Your India shopping list is empty."
            hint="Add your first product — face oils, spices, sarees, gifts for family."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title={query ? 'No products match your search.' : 'Nothing in this filter yet.'}
            hint={query ? 'Try a different word or clear the search.' : undefined}
          />
        ) : (
          filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              stores={stores}
              onOpen={(prod) => setSheet(prod)}
              onToggle={(prod) => {
                toggleBought(prod.id)
                toast(prod.is_bought ? 'Marked as not bought' : 'Marked as bought', {
                  tone: prod.is_bought ? 'default' : 'success',
                })
              }}
            />
          ))
        )}
      </div>

      <ProductSheet state={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}
