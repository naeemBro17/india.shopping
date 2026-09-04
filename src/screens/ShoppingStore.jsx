import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useStore, storeItemStats } from '../store/useStore.js'
import { markBoughtWithFeedback } from '../lib/feedback.js'
import TopBar from '../components/TopBar.jsx'
import ProductRow from '../components/ProductRow.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import { Button, ProgressBar, EmptyState } from '../components/ui.jsx'
import { BagIcon, CheckIcon } from '../components/Icons.jsx'

export default function ShoppingStore() {
  const { id } = useParams()
  const navigate = useNavigate()
  const stores = useStore((s) => s.stores)
  const products = useStore((s) => s.products)
  const settings = useStore((s) => s.settings)
  const toggleBought = useStore((s) => s.toggleBought)

  const store = stores.find((s) => s.id === id)
  const { total, bought, remaining, items } = useMemo(
    () => storeItemStats(products, id),
    [products, id]
  )

  const [exitSheet, setExitSheet] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  // items just marked bought stay put for 400ms, then slide to the bottom
  const [holdIds, setHoldIds] = useState(() => new Set())
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
        const aDone = a.is_bought && !holdIds.has(a.id)
        const bDone = b.is_bought && !holdIds.has(b.id)
        if (aDone !== bDone) return aDone ? 1 : -1
        return b.created_at - a.created_at
      }),
    [items, holdIds]
  )

  if (!store) return <Navigate to="/shopping" replace />
  if (settings.trip_mode !== 'shopping') return <Navigate to="/shopping" replace />

  function attemptLeave() {
    if (remaining > 0) setExitSheet(true)
    else navigate('/shopping')
  }

  function onToggle(p) {
    const wasBought = p.is_bought
    markBoughtWithFeedback(p, toggleBought)
    if (!wasBought) {
      // pin in place briefly so remaining items stay on top, then reorder
      setHoldIds((s) => new Set(s).add(p.id))
      setTimeout(() => {
        setHoldIds((s) => {
          const n = new Set(s)
          n.delete(p.id)
          return n
        })
      }, 400)
    }
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
            {sorted.map((p) => (
              <li key={p.id}>
                <ProductRow product={p} mode="shopping" onToggle={onToggle} />
              </li>
            ))}
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
