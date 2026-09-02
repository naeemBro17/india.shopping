import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, storeItemStats } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import TopBar from '../components/TopBar.jsx'
import ProductSheet from '../components/ProductSheet.jsx'
import { Button, Card, formatINR } from '../components/ui.jsx'
import { PlusIcon, ChevronRight, CartIcon, SparkIcon } from '../components/Icons.jsx'

export default function Home() {
  const navigate = useNavigate()
  const products = useStore((s) => s.products)
  const stores = useStore((s) => s.stores)
  const settings = useStore((s) => s.settings)
  const setTripMode = useStore((s) => s.setTripMode)
  const toast = useToast((s) => s.toast)
  const [sheet, setSheet] = useState(null)

  const shopping = settings.trip_mode === 'shopping'

  const stats = useMemo(() => {
    const mustBuy = products.filter((p) => p.priority === 'must_buy').length
    const activeStores = stores.filter(
      (s) => products.some((p) => p.store_ids.includes(s.id))
    ).length
    const budget = products.reduce((sum, p) => sum + (p.estimated_price || 0) * p.quantity, 0)
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

      <div className="px-4 pt-4 space-y-5">
        {/* trip banner */}
        <Card
          className={`p-4 ${shopping ? 'tint-success' : ''}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] uppercase tracking-wide text-text-secondary font-semibold">
                India Trip
              </p>
              <p className="text-[17px] font-bold mt-0.5">
                {shopping ? 'Shopping Active' : 'Preparation Mode'}
              </p>
              <p className="text-[12.5px] text-text-secondary mt-0.5">
                {shopping
                  ? 'Head to the Shopping tab to work through each store.'
                  : 'Build your list, assign stores, set a budget.'}
              </p>
            </div>
          </div>
          <div className="mt-3">
            {shopping ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setTripMode('preparation')
                  toast('Back to preparation mode')
                }}
              >
                Pause Shopping
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setTripMode('shopping')
                  toast('Shopping mode on', { tone: 'success' })
                  navigate('/shopping')
                }}
              >
                <CartIcon size={18} />
                Start Shopping
              </Button>
            )}
          </div>
        </Card>

        {/* stats */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Total products" value={stats.total} />
          <Stat label="Must buy" value={stats.mustBuy} />
          <Stat label="Active stores" value={stats.activeStores} />
          <Stat label="Estimated budget" value={formatINR(stats.budget)} small />
        </div>

        {/* quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary" onClick={() => setSheet('add')}>
            <PlusIcon size={18} />
            Add product
          </Button>
          <Button variant="secondary" onClick={() => navigate('/products')}>
            View all
          </Button>
        </div>

        {/* stores overview */}
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
                <button
                  key={store.id}
                  onClick={() => navigate(`/stores/${store.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-surface-2 transition min-h-[56px]"
                >
                  <span className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[11px] font-semibold text-text-secondary shrink-0">
                    {store.type === 'online' ? 'ON' : 'IN'}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-medium truncate">{store.name}</span>
                    <span className="block text-[12.5px] text-text-secondary">
                      {remaining === 0 ? 'All done' : `${remaining} of ${total} left`}
                    </span>
                  </span>
                  <ChevronRight size={18} className="text-text-secondary shrink-0" />
                </button>
              ))}
            </Card>
          )}
        </section>
      </div>

      <ProductSheet state={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}

function Stat({ label, value, small }) {
  return (
    <div className="bg-surface border border-border rounded-card p-3.5">
      <p className={small ? 'text-[20px] font-bold leading-tight' : 'text-[26px] font-bold leading-none'}>
        {value}
      </p>
      <p className="text-[12px] text-text-secondary mt-1.5">{label}</p>
    </div>
  )
}
