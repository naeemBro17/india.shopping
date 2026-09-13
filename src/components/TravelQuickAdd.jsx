import { useEffect, useRef, useState } from 'react'
import { useStore, TRAVEL_CATEGORIES } from '../store/useStore.js'
import { Button, TextInput, cx } from './ui.jsx'

const CURRENCIES = [
  { key: 'BDT', symbol: '৳' },
  { key: 'INR', symbol: '₹' },
]

/**
 * The most-used control on the Travel screen. Always visible, fast:
 * type amount, tap category, tap Add. Stays open after each add, clearing
 * only the amount and note — category and currency stay selected so rapid
 * repeated entry (e.g. logging several meals) is quick.
 */
export default function TravelQuickAdd() {
  const addTravelExpense = useStore((s) => s.addTravelExpense)
  const lastUsedCurrency = useStore((s) => s.travel_settings.last_used_currency)

  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(lastUsedCurrency || 'BDT')
  const [category, setCategory] = useState('Food')
  const [customCategory, setCustomCategory] = useState('')
  const [note, setNote] = useState('')
  const [justAdded, setJustAdded] = useState(false)
  const amountRef = useRef(null)

  // Reflect the trip's last-used currency (e.g. right after "Convert money").
  useEffect(() => {
    setCurrency(lastUsedCurrency || 'BDT')
  }, [lastUsedCurrency])

  const valid = Number(amount) > 0

  function submit() {
    if (!valid) return
    const cat = category === 'Other' ? customCategory.trim() || 'Other' : category
    addTravelExpense({ amount: Number(amount), currency, category: cat, note })
    setAmount('')
    setNote('')
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
    amountRef.current?.focus()
  }

  return (
    <div className="bg-surface border border-border rounded-card p-3.5 space-y-3">
      <div className="flex items-center gap-2 rounded-[10px] bg-surface-2 border border-border px-3 focus-within:border-accent transition">
        <input
          ref={amountRef}
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="0"
          autoFocus
          className="flex-1 min-w-0 min-h-[52px] bg-transparent text-[24px] font-bold outline-none placeholder:text-text-secondary/40"
        />
        <div className="flex rounded-full border border-border p-[3px] shrink-0">
          {CURRENCIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCurrency(c.key)}
              className={cx(
                'min-h-[38px] px-3.5 rounded-full text-[13.5px] font-semibold transition',
                currency === c.key ? 'bg-accent text-accent-text' : 'text-text-secondary'
              )}
            >
              {c.symbol} {c.key}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRAVEL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cx(
              'min-h-[44px] px-4 rounded-full text-[14px] font-medium border transition',
              category === cat
                ? 'bg-accent text-accent-text border-transparent'
                : 'bg-surface text-text-secondary border-border active:bg-surface-2'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {category === 'Other' && (
        <TextInput
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          placeholder="Custom category name"
        />
      )}

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Note (optional)"
        className="w-full min-h-[44px] px-3 rounded-[10px] bg-surface-2 border border-border text-[14.5px] outline-none focus:border-accent transition"
      />

      <Button variant="primary" className="w-full" onClick={submit} disabled={!valid}>
        Add
      </Button>

      {justAdded && (
        <p className="text-[12px] text-success px-1 -mt-1">Added</p>
      )}
    </div>
  )
}
