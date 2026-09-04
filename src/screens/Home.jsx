import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, storeItemStats } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import ProductSheet from '../components/ProductSheet.jsx'
import StatCard from '../components/StatCard.jsx'
import StoreRow from '../components/StoreRow.jsx'
import { Button, Card, formatINR } from '../components/ui.jsx'
import { PlusIcon, SparkIcon } from '../components/Icons.jsx'

export default function Home() {
  const navigate = useNavigate()
  const products = useStore((s) => s.products)
  const stores = useStore((s) => s.stores)
  const [sheet, setSheet] = useState(null)

  const stats = useMemo(() => {
    const mustBuy = products.filter((p) => p.priority === 'must_buy').length
    const activeStores = stores.filter((s) =>
      products.some((p) => (p.store_ids || []).includes(s.id))
    ).length
    const budget = products.reduce(
      (sum, p) => sum + (p.estimated_price || 0) * p.quantity,
      0
    )
    return { total: products.length, mustBuy, activeStores, budget }
  }, [products, stores])

  const storeRows = useMemo(
    () =>
      stores
        .map((s) => ({ store: s, ...storeItemStats(products, s.id) }))
        .filter((r) => r.total > 0)
        .sort((a, b) => b.remaining - a.remaining),
    [stores, products]
  )

  return (
    <div>
      <TopBar title="Shopping Mission" />

      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total products" value={stats.total} />
          <StatCard label="Must buy" value={stats.mustBuy} />
          <StatCard label="Stores" value={stats.activeStores} />
          <StatCard label="Budget" value={formatINR(stats.budget)} />
        </div>

        {/* actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary" onClick={() => setSheet('add')}>
            <PlusIcon size={18} />
            Add Product
          </Button>
          <Button variant="secondary" onClick={() => navigate('/products')}>
            View All
          </Button>
        </div>

        {/* stores */}
        <section>
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-2 px-1">
            Stores
          </h2>
          {storeRows.length === 0 ? (
            <Card className="p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-secondary mx-auto mb-2">
                <SparkIcon size={18} />
              </div>
              <p className="text-[14px] font-medium">No stores yet</p>
              <p className="text-[12.5px] text-text-secondary mt-1">
                Add a product and assign it to a store to get started.
              </p>
            </Card>
          ) : (
            <Card className="divide-y divide-border overflow-hidden">
              {storeRows.map(({ store, total, remaining }) => (
                <StoreRow
                  key={store.id}
                  store={store}
                  total={total}
                  remaining={remaining}
                  onClick={() => navigate(`/stores/${store.id}`)}
                />
              ))}
            </Card>
          )}
        </section>
      </div>

      <ProductSheet state={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}
