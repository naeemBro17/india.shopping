import { useState } from 'react'
import { TRAVEL_CATEGORIES } from '../store/useStore.js'
import { Button, TextInput, cx } from './ui.jsx'
import { TrashIcon } from './Icons.jsx'

const CURRENCIES = [
  { key: 'BDT', symbol: '৳' },
  { key: 'INR', symbol: '₹' },
]

/**
 * Add/edit form used inside the Travel expense BottomSheet — reached via the
 * FAB (add) or by tapping a transaction row (edit). The always-visible
 * inline quick add on the Travel screen itself is TravelQuickAdd, a
 * separate, faster component; this one follows the Cancel/Save/Delete
 * pattern shared with ProductForm.
 */
export default function TravelExpenseForm({
  initial,
  defaultCurrency = 'BDT',
  isEdit,
  onSubmit,
  onCancel,
  onDelete,
}) {
  const initialIsPreset = initial && TRAVEL_CATEGORIES.includes(initial.category)

  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [currency, setCurrency] = useState(initial?.currency || defaultCurrency)
  const [category, setCategory] = useState(
    initial ? (initialIsPreset ? initial.category : 'Other') : 'Food'
  )
  const [customCategory, setCustomCategory] = useState(
    initial && !initialIsPreset ? initial.category : ''
  )
  const [note, setNote] = useState(initial?.note || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const valid = Number(amount) > 0

  function submit() {
    if (!valid) return
    const cat = category === 'Other' ? customCategory.trim() || 'Other' : category
    onSubmit({ amount: Number(amount), currency, category: cat, note })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-[10px] bg-surface-2 border border-border px-3 focus-within:border-accent transition">
        <input
          type="text"
          inputMode="decimal"
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="0"
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

      <TextInput
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
      />

      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={submit} disabled={!valid}>
          {isEdit ? 'Save changes' : 'Add expense'}
        </Button>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
          className={cx(
            'w-full min-h-[44px] rounded-[10px] text-[14px] font-medium border transition flex items-center justify-center gap-2',
            confirmDelete
              ? 'tint-warm'
              : 'border-border text-text-secondary active:bg-surface-2'
          )}
        >
          <TrashIcon size={16} />
          {confirmDelete ? 'Tap again to delete' : 'Delete expense'}
        </button>
      )}
    </div>
  )
}
