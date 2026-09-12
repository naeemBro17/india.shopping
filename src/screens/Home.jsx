import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, storeItemStats, activeStoreIds } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import StatCard from '../components/StatCard.jsx'
import StoreRow from '../components/StoreRow.jsx'
import { Button, Card } from '../components/ui.jsx'
import { PlusIcon, SettingsIcon } from '../components/Icons.jsx'

export default function Home() {
  const navigate = useNavigate()
  const products = useStore((s) => s.products)
  const stores = useStore((s) => s.stores)

  const stats = useMemo(() => {
    const total = products.length
    const mustBuy = products.filter((p) => p.priority === 'must_buy')
    const mustBuyDone = mustBuy.filter((p) => p.is_bought).length
    const bought = products.filter((p) => p.is_bought).length
    return {
      total,
      mustBuyLeft: mustBuy.length - mustBuyDone,
      mustBuyDone,
      mustBuyTotal: mustBuy.length,
      bought,
      storesInUse: activeStoreIds(products).size,
    }
  }, [products])

  const storeRows = useMemo(
    () =>
      stores
        .map((s) => ({ store: s, ...storeItemStats(products, s.id) }))
        .filter((r) => r.total > 0),
    [stores, products]
  )

  return (
    <div>
      <TopBar
        title="Shopping Mission"
        right={
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-primary active:bg-surface-2"
          >
            <SettingsIcon size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Products" value={stats.total} />
          <StatCard
            label="Must buy left"
            value={stats.mustBuyLeft}
            progress={{ value: stats.mustBuyDone, total: stats.mustBuyTotal }}
          />
          <StatCard
            label="Bought"
            value={stats.bought}
            progress={{ value: stats.bought, total: stats.total }}
          />
          <StatCard label="Stores in use" value={stats.storesInUse} />
        </div>

        <div className="space-y-2.5">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/products?add=1')}
          >
            <PlusIcon size={18} />
            Add Product
          </Button>

          <Button variant="secondary" className="w-full" onClick={() => navigate('/products')}>
            View List
          </Button>
        </div>

        {storeRows.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-2 px-1">
              Stores
            </h2>
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
          </section>
        )}
      </div>
    </div>
  )
}
