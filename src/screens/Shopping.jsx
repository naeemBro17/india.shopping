import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, storeItemStats } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import TopBar from '../components/TopBar.jsx'
import StoreRow from '../components/StoreRow.jsx'
import { Card, Button, ProgressBar } from '../components/ui.jsx'
import { CartIcon, CheckIcon } from '../components/Icons.jsx'

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
    const assigned = products.filter((p) => (p.store_ids || []).length > 0)
    return {
      totalItems: assigned.length,
      boughtItems: assigned.filter((p) => p.is_bought).length,
    }
  }, [products])

  /* ---------- preparation: one calm prompt, one button ---------- */
  if (!active) {
    return (
      <div>
        <TopBar title="Shopping" />
        <div className="px-4 pt-24 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-secondary mb-4">
            <CartIcon size={26} />
          </div>
          <p className="text-[18px] font-semibold">Ready to shop?</p>
          <p className="text-[13.5px] text-text-secondary mt-1 max-w-[260px]">
            Your list stays in preparation mode until you start.
          </p>
          <Button
            variant="primary"
            className="mt-6 w-full max-w-[280px]"
            onClick={() => {
              setTripMode('shopping')
              toast('Shopping mode on', { tone: 'success' })
            }}
          >
            <CartIcon size={18} />
            Start Shopping
          </Button>
        </div>
      </div>
    )
  }

  /* ---------- shopping: store selector ---------- */
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
          <Card className="divide-y divide-border overflow-hidden">
            {rows.map(({ store, total, remaining }) => (
              <StoreRow
                key={store.id}
                store={store}
                total={total}
                remaining={remaining}
                onClick={() => navigate(`/shopping/${store.id}`)}
              />
            ))}
          </Card>
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
          {tripComplete && (
            <div className="mt-4 flex items-center gap-2 text-success font-semibold">
              <span className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center">
                <CheckIcon size={14} />
              </span>
              Trip Complete!
            </div>
          )}
        </Card>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            setTripMode('preparation')
            toast('Back to preparation mode')
          }}
        >
          Pause shopping
        </Button>
      </div>
    </div>
  )
}
