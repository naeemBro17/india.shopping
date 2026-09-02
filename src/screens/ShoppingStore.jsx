import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useStore, storeItemStats, PRIORITY_META } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import { Button, ProgressBar, EmptyState, cx } from '../components/ui.jsx'
import { BagIcon, CheckIcon } from '../components/Icons.jsx'

export default function ShoppingStore() {
  const { id } = useParams()
  const navigate = useNavigate()
  const stores = useStore((s) => s.stores)
  const products = useStore((s) => s.products)
  const settings = useStore((s) => s.settings)
  const setBought = useStore((s) => s.setBought)

  const store = stores.find((s) => s.id === id)
  const { total, bought, remaining, items } = useMemo(
    () => storeItemStats(products, id),
    [products, id]
  )

  const [exitSheet, setExitSheet] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [pulseId, setPulseId] = useState(null)
  const remainingRef = useRef(remaining)
  const prevRemaining = useRef(remaining)

  useEffect(() => {
    remainingRef.current = remaining
  }, [remaining])

  // completion detection: remaining crossed to 0 via a tap
  useEffect(() => {
    if (total > 0 && prevRemaining.current > 0 && remaining === 0) {
      setCelebrate(true)
      const t = setTimeout(() => navigate('/shopping'), 2000)
      return () => clearTimeout(t)
    }
    prevRemaining.current = remaining
  }, [remaining, total, navigate])

  // browser back guard
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPop = () => {
      if (remainingRef.current > 0) {
        window.history.pushState(null, '', window.location.href)
        setExitSheet(true)
      } else {
        navigate('/shopping')
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [navigate])

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.is_bought !== b.is_bought) return a.is_bought ? 1 : -1
        return b.created_at - a.created_at
      }),
    [items]
  )

  if (!store) return <Navigate to="/shopping" replace />
  if (settings.trip_mode !== 'shopping') return <Navigate to="/shopping" replace />

  function attemptLeave() {
    if (remaining > 0) setExitSheet(true)
    else navigate('/shopping')
  }

  function markBought(p) {
    setPulseId(p.id)
    setTimeout(() => setPulseId(null), 320)
    setBought(p.id, true)
  }

  const unfinished = items.filter((p) => !p.is_bought)

  return (
    <div>
      <TopBar
        title={store.name}
        subtitle={`${bought} / ${total} items`}
        back={attemptLeave}
      />

      <div className="px-4 pt-3 pb-6">
        <div className="mb-4">
          <ProgressBar value={bought} total={total} />
        </div>

        {total === 0 ? (
          <EmptyState
            icon={BagIcon}
            title="Nothing to shop for here."
            hint="This store has no items assigned."
            action={
              <Button variant="secondary" onClick={() => navigate('/shopping')}>
                Back to stores
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {sorted.map((p) => {
              const meta = PRIORITY_META[p.priority] || PRIORITY_META.normal
              return (
                <li
                  key={p.id}
                  className={cx(
                    'rounded-card border transition-all duration-300',
                    p.is_bought
                      ? 'bg-surface-2 border-border opacity-70'
                      : 'bg-surface border-border'
                  )}
                >
                  <div className="p-3.5">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={cx(
                            'text-[15.5px] font-semibold leading-snug',
                            p.is_bought && 'line-through decoration-text-secondary/60'
                          )}
                        >
                          {p.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span
                            className={cx(
                              'inline-flex items-center px-2 py-[3px] rounded-full text-[11.5px] font-medium border leading-none',
                              meta.pill
                            )}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[12.5px] text-text-secondary">
                            Qty {p.quantity}
                          </span>
                          {p.brand && (
                            <span className="text-[12.5px] text-text-secondary">· {p.brand}</span>
                          )}
                        </div>
                        {p.notes && !p.is_bought && (
                          <p className="text-[12.5px] text-text-secondary mt-1.5">{p.notes}</p>
                        )}
                      </div>
                      {p.is_bought && (
                        <span className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center shrink-0 animate-check-pop">
                          <CheckIcon size={13} />
                        </span>
                      )}
                    </div>

                    {p.is_bought ? (
                      <button
                        onClick={() => setBought(p.id, false)}
                        className="mt-3 w-full min-h-[40px] rounded-[10px] border border-border text-[13px] font-medium text-text-secondary active:bg-surface transition"
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => markBought(p)}
                        className={cx(
                          'mt-3 w-full min-h-[48px] rounded-[10px] bg-accent text-white text-[15px] font-semibold transition active:opacity-90',
                          pulseId === p.id && 'animate-scale-pop'
                        )}
                      >
                        BOUGHT
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* exit protection */}
      <BottomSheet
        open={exitSheet}
        onClose={() => setExitSheet(false)}
        title={`${unfinished.length} item${unfinished.length === 1 ? '' : 's'} still remaining`}
      >
        <p className="text-[13.5px] text-text-secondary">
          These aren't checked off yet at {store.name}:
        </p>
        <ul className="mt-3 space-y-1.5">
          {unfinished.map((p) => (
            <li key={p.id} className="text-[14px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/50" />
              {p.name}
              <span className="text-text-secondary text-[12.5px]">×{p.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-5">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              setExitSheet(false)
              navigate('/shopping')
            }}
          >
            Leave for now
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => setExitSheet(false)}>
            Go back
          </Button>
        </div>
      </BottomSheet>

      {/* completion overlay */}
      {celebrate && (
        <div className="fixed inset-0 z-[70] bg-bg flex flex-col items-center justify-center animate-fade-in px-8 text-center">
          <span className="w-20 h-20 rounded-full bg-success text-white flex items-center justify-center animate-check-pop">
            <CheckIcon size={40} />
          </span>
          <p className="text-[22px] font-bold mt-5">{store.name} Complete!</p>
          <p className="text-[15px] text-text-secondary mt-1">
            {total} / {total} items
          </p>
        </div>
      )}
    </div>
  )
}
