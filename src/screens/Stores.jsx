import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, storeItemStats } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import StoreSheet from '../components/StoreSheet.jsx'
import { Card, ProgressBar, EmptyState } from '../components/ui.jsx'
import { PlusIcon, ChevronRight, StoreIcon } from '../components/Icons.jsx'

export default function Stores() {
  const navigate = useNavigate()
  const stores = useStore((s) => s.stores)
  const products = useStore((s) => s.products)
  const [sheet, setSheet] = useState(null)

  const { physical, online } = useMemo(() => {
    const rows = stores.map((s) => ({ store: s, ...storeItemStats(products, s.id) }))
    return {
      physical: rows.filter((r) => r.store.type === 'physical'),
      online: rows.filter((r) => r.store.type === 'online'),
    }
  }, [stores, products])

  return (
    <div>
      <TopBar
        title="Stores"
        right={
          <button
            onClick={() => setSheet('add')}
            aria-label="Add store"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-primary active:bg-surface-2"
          >
            <PlusIcon size={22} />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-6">
        {stores.length === 0 && (
          <EmptyState
            icon={StoreIcon}
            title="No stores yet."
            hint="Add the shops and sites you plan to buy from in India."
          />
        )}

        <StoreSection
          title="Physical stores"
          rows={physical}
          onOpen={(id) => navigate(`/stores/${id}`)}
        />
        <StoreSection
          title="Online stores"
          rows={online}
          onOpen={(id) => navigate(`/stores/${id}`)}
        />
      </div>

      <StoreSheet state={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}

function StoreSection({ title, rows, onOpen }) {
  if (rows.length === 0) return null
  return (
    <section>
      <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-2 px-1">
        {title}
      </h2>
      <div className="space-y-2.5">
        {rows.map(({ store, total, bought, remaining }) => (
          <Card key={store.id} className="overflow-hidden">
            <button
              onClick={() => onOpen(store.id)}
              className="w-full text-left px-4 py-3.5 active:bg-surface-2 transition"
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 min-w-0">
                  <span className="block text-[15.5px] font-semibold truncate">{store.name}</span>
                  {store.location && (
                    <span className="block text-[12.5px] text-text-secondary truncate">
                      {store.location}
                    </span>
                  )}
                </span>
                <ChevronRight size={18} className="text-text-secondary shrink-0" />
              </div>
              <p className="text-[12.5px] text-text-secondary mt-2 mb-1.5">
                {total === 0
                  ? 'No items assigned'
                  : remaining === 0
                  ? `All ${total} items bought`
                  : `${remaining} item${remaining === 1 ? '' : 's'} remaining`}
              </p>
              {total > 0 && <ProgressBar value={bought} total={total} />}
            </button>
          </Card>
        ))}
      </div>
    </section>
  )
}
