import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore, PRIORITY_ORDER } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import ProductRow from '../components/ProductRow.jsx'
import ProductSheet from '../components/ProductSheet.jsx'
import QuickAdd from '../components/QuickAdd.jsx'
import { markBoughtWithFeedback } from '../lib/feedback.js'
import { cx } from '../components/ui.jsx'
import { PlusIcon, SearchIcon, CloseIcon, ChevronRight, BagIcon } from '../components/Icons.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'must_buy', label: 'Must Buy' },
  { key: 'normal', label: 'Normal' },
  { key: 'if_available', label: 'If Available' },
]

export default function Products() {
  const products = useStore((s) => s.products)
  const stores = useStore((s) => s.stores)
  const toggleBought = useStore((s) => s.toggleBought)

  const [params, setParams] = useSearchParams()
  const [adding, setAdding] = useState(params.get('add') === '1')
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [boughtOpen, setBoughtOpen] = useState(null) // null = auto
  const searchRef = useRef(null)

  useEffect(() => {
    if (params.get('add') === '1') setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (searching) searchRef.current?.focus()
  }, [searching])

  const q = query.trim().toLowerCase()
  const matches = (p) =>
    !q ||
    p.name.toLowerCase().includes(q) ||
    (p.brand || '').toLowerCase().includes(q)

  const { active, bought } = useMemo(() => {
    const byPriority = (a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 1
      const pb = PRIORITY_ORDER[b.priority] ?? 1
      if (pa !== pb) return pa - pb
      return b.created_at - a.created_at
    }
    const active = products
      .filter((p) => !p.is_bought && matches(p))
      .filter((p) => filter === 'all' || p.priority === filter)
      .sort(byPriority)
    const bought = products
      .filter((p) => p.is_bought && matches(p))
      .sort((a, b) => (b.boughtAt || 0) - (a.boughtAt || 0))
    return { active, bought }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, filter, q])

  const showBought = boughtOpen ?? bought.length <= 3
  const noProducts = products.length === 0

  function onToggle(prod) {
    markBoughtWithFeedback(prod, toggleBought)
  }

  return (
    <div>
      <TopBar
        title="Products"
        right={
          <>
            <button
              onClick={() => setSearching((v) => !v)}
              aria-label="Search"
              className={cx(
                'w-11 h-11 rounded-full flex items-center justify-center active:bg-surface-2',
                searching ? 'text-accent' : 'text-text-primary'
              )}
            >
              <SearchIcon size={20} />
            </button>
            <button
              onClick={() => setAdding((v) => !v)}
              aria-label="Add product"
              className="w-11 h-11 rounded-full flex items-center justify-center text-text-primary active:bg-surface-2"
            >
              <PlusIcon size={22} />
            </button>
          </>
        }
      />

      {searching && (
        <div className="px-4 pt-3 animate-fade-in-up">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              <SearchIcon size={18} />
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or brand"
              className="w-full min-h-[44px] pl-10 pr-10 rounded-[10px] bg-surface-2 border border-border text-[15px] outline-none focus:border-accent transition"
            />
            <button
              onClick={() => {
                setQuery('')
                setSearching(false)
              }}
              aria-label="Close search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-text-secondary active:bg-surface"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pt-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cx(
                'min-h-[30px] px-3 rounded-full text-[12.5px] font-medium border whitespace-nowrap transition',
                filter === f.key
                  ? 'bg-text-primary text-[var(--bg)] border-transparent'
                  : 'bg-surface text-text-secondary border-border active:bg-surface-2'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-2">
        {adding && <QuickAdd onClose={() => setAdding(false)} />}

        {noProducts && !adding ? (
          <div className="flex flex-col items-center text-center px-8 py-16">
            <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-secondary mb-3">
              <BagIcon size={22} />
            </div>
            <p className="text-[15px] font-medium">Your list is empty</p>
            <p className="text-[13px] text-text-secondary mt-1 max-w-[240px]">
              Tap + to add your first product.
            </p>
          </div>
        ) : (
          <>
            {active.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                stores={stores}
                showStoreTag
                onOpen={setEditing}
                onToggle={onToggle}
              />
            ))}

            {active.length === 0 && !noProducts && (
              <p className="text-[13.5px] text-text-secondary text-center py-8">
                {q
                  ? 'Nothing matches your search.'
                  : 'Nothing left in this filter.'}
              </p>
            )}

            {bought.length > 0 && (
              <div className="pt-3">
                <button
                  onClick={() => setBoughtOpen(!showBought)}
                  className="w-full flex items-center gap-1.5 px-1 py-2 text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary"
                >
                  <ChevronRight
                    size={14}
                    className={cx('transition-transform', showBought && 'rotate-90')}
                  />
                  Bought · {bought.length}
                </button>
                {showBought && (
                  <div className="space-y-2 mt-1">
                    {bought.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        stores={stores}
                        showStoreTag
                        onOpen={setEditing}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ProductSheet state={editing} onClose={() => setEditing(null)} />
    </div>
  )
}
