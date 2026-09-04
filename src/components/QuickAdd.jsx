import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { Button, Pill, TextInput, TextArea, Field, cx } from './ui.jsx'
import { CloseIcon, ChevronRight } from './Icons.jsx'

const PRIORITIES = [
  { key: 'must_buy', label: 'Must Buy' },
  { key: 'normal', label: 'Normal' },
  { key: 'if_available', label: 'If Available' },
]

/**
 * The one-tap add. A single auto-focused field; Enter (or Add) saves the
 * product immediately with sensible defaults and keeps the field open and
 * focused for the next one. "More details" reveals the optional fields.
 */
export default function QuickAdd({ onClose }) {
  const addProduct = useStore((s) => s.addProduct)
  const stores = useStore((s) => s.stores)

  const [name, setName] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [brand, setBrand] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [priority, setPriority] = useState('normal')
  const [storeIds, setStoreIds] = useState([])
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [justAdded, setJustAdded] = useState('')

  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function reset() {
    setBrand('')
    setQuantity('1')
    setPriority('normal')
    setStoreIds([])
    setPrice('')
    setNotes('')
    setExpanded(false)
  }

  function submit() {
    const n = name.trim()
    if (!n) return
    addProduct({
      name: n,
      brand,
      quantity: Number(quantity) || 1,
      priority,
      store_ids: storeIds,
      estimated_price: Number(price) || 0,
      notes,
    })
    setName('')
    reset()
    setJustAdded(n)
    setTimeout(() => setJustAdded(''), 1600)
    inputRef.current?.focus()
  }

  function toggleStore(id) {
    setStoreIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    )
  }

  return (
    <div className="bg-surface border border-border rounded-card p-3 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') onClose?.()
          }}
          placeholder="What do you need to buy?"
          className="flex-1 min-w-0 min-h-[44px] px-1 bg-transparent text-[15.5px] outline-none placeholder:text-text-secondary/70"
        />
        <Button
          variant="primary"
          className="min-h-[38px] px-4 shrink-0"
          onClick={submit}
          disabled={!name.trim()}
        >
          Add
        </Button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close add"
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-text-secondary active:bg-surface-2"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {justAdded && (
        <p className="text-[12px] text-success px-1 mt-1">Added “{justAdded}”</p>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 flex items-center gap-1 px-1 text-[12.5px] font-medium text-text-secondary active:text-text-primary"
      >
        <ChevronRight
          size={14}
          className={cx('transition-transform', expanded && 'rotate-90')}
        />
        More details
      </button>

      {expanded && (
        <div className="mt-3 space-y-3.5 animate-fade-in">
          <Field label="Brand">
            <TextInput
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Forest Essentials"
            />
          </Field>

          <Field label="Quantity">
            <TextInput
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-24"
            />
          </Field>

          <Field label="Priority">
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <Pill
                  key={p.key}
                  active={priority === p.key}
                  onClick={() => setPriority(p.key)}
                  className="flex-1"
                >
                  {p.label}
                </Pill>
              ))}
            </div>
          </Field>

          {stores.length > 0 && (
            <Field label="Store">
              <div className="flex flex-wrap gap-2">
                {stores.map((s) => (
                  <Pill
                    key={s.id}
                    active={storeIds.includes(s.id)}
                    onClick={() => toggleStore(s.id)}
                  >
                    {s.name}
                  </Pill>
                ))}
              </div>
            </Field>
          )}

          <Field label="Estimated price (₹)">
            <TextInput
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 1850"
            />
          </Field>

          <Field label="Notes">
            <TextArea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Get the 24ml bottle"
            />
          </Field>
        </div>
      )}
    </div>
  )
}
