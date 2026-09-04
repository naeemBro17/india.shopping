import { useMemo } from 'react'
import { useStore } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import { Card, Button, cx } from '../components/ui.jsx'
import { PlusIcon, TrashIcon } from '../components/Icons.jsx'

/** keep only digits and a single decimal point */
function sanitize(raw) {
  const cleaned = String(raw).replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned
}

export default function Currency() {
  const currency = useStore((s) => s.currency)
  const setDirection = useStore((s) => s.setDirection)
  const setAmount = useStore((s) => s.setAmount)
  const addRate = useStore((s) => s.addRate)
  const updateRate = useStore((s) => s.updateRate)
  const removeRate = useStore((s) => s.removeRate)
  const clearRates = useStore((s) => s.clearRates)

  const rates = currency.rates || []
  const bdtToInr = currency.direction === 'BDT_INR'
  const fromSym = bdtToInr ? '৳' : '₹'
  const toSym = bdtToInr ? '₹' : '৳'
  const fromName = bdtToInr ? 'BDT' : 'INR'
  const toName = bdtToInr ? 'INR' : 'BDT'
  const amount = Number(currency.amount) || 0

  const computed = useMemo(() => {
    const list = rates.map((r) => {
      const rate = Number(r.value)
      const valid = r.value !== '' && !Number.isNaN(rate) && rate > 0
      return { ...r, rate, valid, result: valid ? amount * rate : null }
    })
    let bestId = null
    let bestRate = -Infinity
    list.forEach((r) => {
      if (r.valid && r.rate > bestRate) {
        bestRate = r.rate
        bestId = r.id
      }
    })
    return { list, bestId, best: list.find((r) => r.id === bestId) || null }
  }, [rates, amount])

  const fmt = (n) =>
    n.toLocaleString('en-IN', { maximumFractionDigits: 2 })

  return (
    <div>
      <TopBar title="Currency" />

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* direction */}
        <div className="flex rounded-full border border-border p-1">
          <button
            onClick={() => setDirection('BDT_INR')}
            className={cx(
              'flex-1 min-h-[40px] rounded-full text-[13.5px] font-semibold transition',
              bdtToInr ? 'bg-text-primary text-[var(--bg)]' : 'text-text-secondary'
            )}
          >
            BDT → INR
          </button>
          <button
            onClick={() => setDirection('INR_BDT')}
            className={cx(
              'flex-1 min-h-[40px] rounded-full text-[13.5px] font-semibold transition',
              !bdtToInr ? 'bg-text-primary text-[var(--bg)]' : 'text-text-secondary'
            )}
          >
            INR → BDT
          </button>
        </div>

        {/* amount */}
        <Card className="p-4">
          <label
            htmlFor="currency-amount"
            className="block text-[13px] font-medium text-text-secondary mb-2"
          >
            Amount in {fromName}
          </label>
          <div className="flex items-center gap-2 rounded-[10px] bg-surface-2 border border-border px-3 focus-within:border-accent transition">
            <span className="text-[20px] font-bold text-text-secondary shrink-0">
              {fromSym}
            </span>
            <input
              id="currency-amount"
              type="text"
              inputMode="decimal"
              value={currency.amount}
              onChange={(e) => setAmount(sanitize(e.target.value))}
              placeholder="0"
              className="flex-1 min-w-0 min-h-[52px] bg-transparent text-[24px] font-bold outline-none placeholder:text-text-secondary/40"
            />
          </div>
          {computed.best && amount > 0 && (
            <p className="text-[13px] text-text-secondary mt-3">
              Best:{' '}
              <span className="text-text-primary font-semibold text-[15px]">
                {toSym}
                {fmt(computed.best.result)}
              </span>{' '}
              via {computed.best.label || 'unnamed'}
            </p>
          )}
        </Card>

        {/* rates */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[12.5px] font-semibold text-text-secondary uppercase tracking-wide">
              Compare rates
            </h2>
            <button
              onClick={clearRates}
              className="text-[12.5px] font-medium text-text-secondary active:text-text-primary"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2">
            {computed.list.map((r) => (
              <Card
                key={r.id}
                className={cx(
                  'p-3',
                  r.id === computed.bestId && 'border-success'
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    value={r.label}
                    onChange={(e) => updateRate(r.id, { label: e.target.value })}
                    className="flex-1 min-w-0 min-h-[36px] bg-transparent text-[14px] font-semibold outline-none"
                    placeholder="Label"
                  />
                  {r.id === computed.bestId && (
                    <span className="text-[10px] font-bold tracking-wide px-1.5 py-[2px] rounded-full bg-success text-white">
                      BEST
                    </span>
                  )}
                  {rates.length > 1 && (
                    <button
                      onClick={() => removeRate(r.id)}
                      aria-label="Remove rate"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary active:bg-surface-2"
                    >
                      <TrashIcon size={15} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[12px] text-text-secondary shrink-0">
                    1 {fromName} =
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={r.value}
                    onChange={(e) =>
                      updateRate(r.id, { value: sanitize(e.target.value) })
                    }
                    placeholder="0.00"
                    className="w-24 min-h-[40px] px-2 rounded-[8px] bg-surface-2 border border-border text-[14px] font-semibold outline-none focus:border-accent"
                  />
                  <span className="text-[12px] text-text-secondary shrink-0">
                    {toName}
                  </span>
                  <span className="flex-1 text-right text-[15px] font-bold tabular-nums">
                    {r.result != null ? `${toSym}${fmt(r.result)}` : '—'}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <Button
            variant="secondary"
            className="w-full mt-2"
            onClick={addRate}
            disabled={rates.length >= 4}
          >
            <PlusIcon size={16} />
            Add rate
          </Button>
        </section>
      </div>
    </div>
  )
}
