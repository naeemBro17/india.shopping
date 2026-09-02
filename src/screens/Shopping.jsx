import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, storeItemStats } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import TopBar from '../components/TopBar.jsx'
import { Card, Button, ProgressBar } from '../components/ui.jsx'
import { CartIcon, CheckIcon, ChevronRight } from '../components/Icons.jsx'

export default function Shopping() {
  const navigate = useNavigate()
  const products = useStore((s) => s.products)
  const stores = useStore((s) => s.stores)
  const settings = useStore((s) => s.settings)
  const setTripMode = useStore((s) => s.setTripMode)
  const toast = useToast((s) => s.toast)

  const active = settings.trip_mode === 'shopping'

  const rows = useMemo(
    () =>
      stores
        .map((s) => ({ store: s, ...storeItemStats(products, s.id) }))
        .filter((r) => r.total > 0),
    [stores, products]
  )

  const audit = useMemo(() => {
    const totalItems = products.filter((p) => p.store_ids.length > 0).length
    const boughtItems = products.filter((p) => p.store_ids.length > 0 && p.is_bought).length
    const pendingStores = rows.filter((r) => r.remaining > 0)
    return { totalItems, boughtItems, pendingStores }
  }, [products, rows])

  if (!active) {
    return (
      <div>
        <TopBar title="Shopping" />
        <div className="px-4 pt-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-secondary mb-4">
            <CartIcon size={26} />
          </div>
          <p className="text-[16px] font-semibold">Shopping mode is off</p>
          <p className="text-[13.5px] text-text-secondary mt-1 max-w-[260px]">
            Start Shopping from the Home screen first. Your list stays in preparation
            mode until then.
          </p>
          <Button
            variant="primary"
            className="mt-5"
            onClick={() => {
              setTripMode('shopping')
              toast('Shopping mode on', { tone: 'success' })
            }}
          >
            Start Shopping now
          </Button>
        </div>
      </div>
    )
  }

  const physical = rows.filter((r) => r.store.type === 'physical')
  const online = rows.filter((r) => r.store.type === 'online')
  const tripComplete = audit.totalItems > 0 && audit.boughtItems === audit.totalItems

  return (
    <div>
      <TopBar title="Shopping" subtitle="Shopping mode active" />

      <div className="px-4 pt-4 pb-6 space-y-5">
        <div>
          <h2 className="text-[19px] font-bold px-1">Where are you shopping?</h2>
          <p className="text-[13px] text-text-secondary px-1 mt-0.5">
            Pick a store to work through its checklist.
          </p>
        </div>

        {rows.length === 0 ? (
          <Card className="p-5 text-center">
            <p className="text-[14px] font-medium">No stores have items yet</p>
            <p className="text-[12.5px] text-text-secondary mt-1">
              Assign products to stores from the Products tab first.
            </p>
          </Card>
        ) : (
          <>
            <StoreGrid title="Physical stores" rows={physical} onOpen={navigate} />
            <StoreGrid title="Online stores" rows={online} onOpen={navigate} />
          </>
        )}

        {/* trip audit */}
        <Card className={`p-4 ${tripComplete ? 'tint-success' : ''}`}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">
              Trip audit
            </p>
            <p className="text-[13px] font-semibold">
              {audit.boughtItems} / {audit.totalItems}
            </p>
          </div>
          <div className="mt-3">
            <ProgressBar value={audit.boughtItems} total={audit.totalItems} />
          </div>

          {tripComplete ? (
            <div className="mt-4 flex items-center gap-2 text-success font-semibold">
              <span className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center">
                <CheckIcon size={14} />
              </span>
              Trip Complete!
            </div>
          ) : audit.pendingStores.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              <p className="text-[12.5px] text-text-secondary">Stores with items left:</p>
              {audit.pendingStores.map((r) => (
                <button
                  key={r.store.id}
                  onClick={() => navigate(`/shopping/${r.store.id}`)}
                  className="w-full flex items-center justify-between py-1.5 text-left"
                >
                  <span className="text-[14px]">{r.store.name}</span>
                  <span className="text-[13px] text-text-secondary flex items-center gap-1">
                    {r.remaining} left <ChevronRight size={15} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[12.5px] text-text-secondary">Nothing assigned to shop yet.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

function StoreGrid({ title, rows, onOpen }) {
  if (rows.length === 0) return null
  return (
    <section>
      <h3 className="text-[12.5px] font-semibold text-text-secondary uppercase tracking-wide mb-2 px-1">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {rows.map(({ store, total, remaining }) => (
          <button
            key={store.id}
            onClick={() => onOpen(`/shopping/${store.id}`)}
            className={`text-left rounded-card border p-3.5 min-h-[92px] flex flex-col justify-between transition active:bg-surface-2 ${
              remaining === 0 ? 'tint-success' : 'bg-surface border-border'
            }`}
          >
            <span className="text-[14.5px] font-semibold leading-snug">{store.name}</span>
            <span className="text-[12.5px] text-text-secondary mt-2">
              {remaining === 0 ? 'Complete' : `${remaining} of ${total} left`}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
