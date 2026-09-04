import { useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useStore, storeItemStats, PRIORITY_ORDER } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import ProductRow from '../components/ProductRow.jsx'
import ProductSheet from '../components/ProductSheet.jsx'
import { markBoughtWithFeedback } from '../lib/feedback.js'
import StoreSheet from '../components/StoreSheet.jsx'
import { Card, ProgressBar, EmptyState, Button } from '../components/ui.jsx'
import { BagIcon, PlusIcon } from '../components/Icons.jsx'

export default function StoreDetail() {
  const { id } = useParams()
  const stores = useStore((s) => s.stores)
  const products = useStore((s) => s.products)
  const toggleBought = useStore((s) => s.toggleBought)
  const [sheet, setSheet] = useState(null)
  const [storeSheet, setStoreSheet] = useState(null)

  const store = stores.find((s) => s.id === id)
  const { total, bought, items } = useMemo(
    () => storeItemStats(products, id),
    [products, id]
  )

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.is_bought !== b.is_bought) return a.is_bought ? 1 : -1
        const pa = PRIORITY_ORDER[a.priority] ?? 1
        const pb = PRIORITY_ORDER[b.priority] ?? 1
        if (pa !== pb) return pa - pb
        return b.created_at - a.created_at
      }),
    [items]
  )

  if (!store) return <Navigate to="/stores" replace />

  return (
    <div>
      <TopBar
        title={store.name}
        subtitle={store.type === 'online' ? 'Online store' : 'Physical store'}
        back="/stores"
        right={
          <button
            onClick={() => setStoreSheet(store)}
            className="min-h-[36px] px-3 rounded-full text-[13px] font-medium border border-border text-text-secondary active:bg-surface-2"
          >
            Edit
          </button>
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium">
              {total === 0 ? 'No items yet' : `${bought} of ${total} bought`}
            </p>
            {store.website_url && (
              <a
                href={store.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-medium text-accent"
              >
                Visit site
              </a>
            )}
          </div>
          {total > 0 && <div className="mt-3"><ProgressBar value={bought} total={total} /></div>}
          {store.location && (
            <p className="text-[12.5px] text-text-secondary mt-3">{store.location}</p>
          )}
        </Card>

        <Button variant="secondary" className="w-full" onClick={() => setSheet('add')}>
          <PlusIcon size={18} />
          Add product to {store.name}
        </Button>

        <div className="space-y-2.5">
          {sorted.length === 0 ? (
            <EmptyState
              icon={BagIcon}
              title="No products assigned to this store."
              hint="Add one above, or assign an existing product from the Products tab."
            />
          ) : (
            sorted.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                stores={stores}
                onOpen={(prod) => setSheet(prod)}
                onToggle={(prod) => markBoughtWithFeedback(prod, toggleBought)}
              />
            ))
          )}
        </div>
      </div>

      <ProductSheet
        state={sheet}
        onClose={() => setSheet(null)}
        defaultStoreId={store.id}
      />
      <StoreSheet state={storeSheet} onClose={() => setStoreSheet(null)} />
    </div>
  )
}
