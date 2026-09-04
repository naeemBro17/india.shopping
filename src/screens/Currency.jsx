import { useMemo } from 'react'
import { useStore } from '../store/useStore.js'
import TopBar from '../components/TopBar.jsx'
import { Card, Button, cx } from '../components/ui.jsx'
import { PlusIcon, TrashIcon } from '../components/Icons.jsx'

/** keep only digits and a single decimal point */
function sanitizeAmount(raw) {
  const cleaned = raw.replace(/[^0-9.]/g, '')
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

  const bdtToInr = currency.direction === 'BDT_INR'
  const fromSym = bdtToInr ? '৳' : '₹'
  const toSym = bdtToInr ? '₹' : '৳'
  const fromName = bdtToInr ? 'BDT' : 'INR'
  const toName = bdtToInr ? 'INR' : 'BDT'
  const amount = Number(currency.amount) || 0

  const computed = useMemo(() => {
    const list = currency.rates.map((r) => {
      const rate = Number(r.value)
      const valid = r.value !== '' && !Number.isNaN(rate) && rate > 0
      return { ...r, rate, valid, result: valid ? amount * rate : null }
    })
    // best = highest "to" amount per unit -> highest rate
    let bestId = null
    let bestRate = -Infinity
    list.forEach((r) => {
      if (r.valid && r.rate > bestRate) {
        bestRate = r.rate
        bestId = r.id
      }
    })
    return { list, bestId, best: list.find((r) => r.id === bestId) || null }
  }, [currency.rates, amount])

  return (
    <div>
      <TopBar title="Currency" />

      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* direction */}
        <div>
          <div className="flex rounded-full border border-border bg-surface p-1">
            <button
              onClick={() => setDirection('BDT_INR')}
              className={cx(
                'flex-1 min-h-[44px] rounded-full text-[14px] font-semibold transition',
                bdtToInr ? 'bg-text-primary text-[var(--bg)]' : 'text-text-secondary'
              )}
            >
              BDT → INR
            </button>
            <button
              onClick={() => setDirection('INR_BDT')}
              className={cx(
                'flex-1 min-h-[44px] rounded-full text-[14px] font-semibold transition',
                !bdtToInr ? 'bg-text-primary text-[var(--bg)]' : 'text-text-secondary'
              )}
            >
              INR → BDT
            </button>
          </div>
          <p className="text-center text-[12.5px] text-text-secondary mt-2">
            Converting <span className="font-semibold text-text-primary">{fromName}</span> to{' '}
            <span className="font-semibold text-text-primary">{toName}</span> · rates entered
            manually, nothing fetched online
          </p>
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
            <span className="text-[22px] font-bold text-text-secondary w-6 text-center shrink-0">
              {fromSym}
            </span>
            <input
              id="currency-amount"
              type="text"
              inputMode="decimal"
              value={currency.amount}
              onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
              placeholder="0"
              className="flex-1 min-w-0 min-h-[52px] bg-transparent text-[26px] font-bold outline-none placeholder:text-text-secondary/40"
            />
          </div>
        </Card>

        {/* rates */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
              Compare rates
            </h2>
            <button
              onClick={clearRates}
              className="text-[12.5px] font-medium text-text-secondary active:text-text-primary"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2.5">
            {computed.list.map((r) => (
              <Card
                key={r.id}
                className={cx('p-3.5', r.id === computed.bestId && 'tint-success')}
              >
                <div className="flex items-center gap-2">
                  <input
                    value={r.label}
                    onChange={(e) => updateRate(r.id, { label: e.target.value })}
                    className="flex-1 min-w-0 bg-transparent text-[14px] font-semibold outline-none"
                    placeholder="Label"
                  />
                  {r.id === computed.bestId && (
                    <span className="text-[10.5px] font-bold tracking-wide px-2 py-[3px] rounded-full bg-success text-white">
                      BEST
                    </span>
                  )}
                  {currency.rates.length > 1 && (
                    <button
                      onClick={() => removeRate(r.id)}
                      aria-label="Remove rate"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary active:bg-surface-2"
                    >
                      <TrashIcon size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] text-text-secondary">1 {fromName} =</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={r.value}
                      onChange={(e) =>
                        updateRate(r.id, { value: sanitizeAmount(e.target.value) })
                      }
                      placeholder="0.00"
                      className="w-20 min-h-[44px] px-2 rounded-[8px] bg-surface-2 border border-border text-[14px] font-semibold outline-none focus:border-accent"
                    />
                    <span className="text-[12px] text-text-secondary">{toName}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-[16px] font-bold">
                      {r.result != null ? `${toSym}${r.result.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={addRate}
              disabled={currency.rates.length >= 4}
            >
              <PlusIcon size={16} />
              Add rate
            </Button>
          </div>
        </section>

        {/* best highlight */}
        <Card className="p-4">
          {computed.best && amount > 0 ? (
            <>
              <p className="text-[12.5px] text-text-secondary">
                Best rate: <span className="font-semibold text-text-primary">{computed.best.label || 'Unnamed'}</span>
              </p>
              <p className="text-[30px] font-bold mt-1 leading-none">
                {toSym}
                {computed.best.result.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-[12.5px] text-text-secondary mt-1.5">
                {fromSym}{amount.toLocaleString('en-IN')} {fromName} at 1 {fromName} = {computed.best.rate} {toName}
              </p>
            </>
          ) : (
            <p className="text-[13.5px] text-text-secondary text-center py-2">
              Enter an amount and at least one rate to see the best conversion.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
