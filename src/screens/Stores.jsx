import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, storeItemStats } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import StoreSheet from '../components/StoreSheet.jsx'
import StoreRow from '../components/StoreRow.jsx'
import { Card, EmptyState } from '../components/ui.jsx'
import { PlusIcon, StoreIcon } from '../components/Icons.jsx'

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
      <Card className="divide-y divide-border overflow-hidden">
        {rows.map(({ store, total, remaining }) => (
          <StoreRow
            key={store.id}
            store={store}
            total={total}
            remaining={remaining}
            onClick={() => onOpen(store.id)}
          />
        ))}
      </Card>
    </section>
  )
}
