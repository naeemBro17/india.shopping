import { useRef, useState } from 'react'
import {
  Button,
  Field,
  Pill,
  TextInput,
  TextArea,
  cx,
} from './ui.jsx'
import { PlusIcon, MinusIcon, TrashIcon } from './Icons.jsx'

const PRIORITIES = [
  { key: 'must_buy', label: 'Must Buy' },
  { key: 'normal', label: 'Normal' },
  { key: 'if_available', label: 'If Available' },
]

export default function ProductForm({ initial, isEdit, stores, onSubmit, onCancel, onDelete }) {
  const [name, setName] = useState(initial?.name || '')
  const [brand, setBrand] = useState(initial?.brand || '')
  const [quantity, setQuantity] = useState(initial?.quantity || 1)
  const [priority, setPriority] = useState(initial?.priority || 'normal')
  const [storeIds, setStoreIds] = useState(initial?.store_ids || [])
  const [estimated, setEstimated] = useState(
    initial?.estimated_price ? String(initial.estimated_price) : ''
  )
  const [notes, setNotes] = useState(initial?.notes || '')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const nameRef = useRef(null)

  function toggleStore(id) {
    setStoreIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    )
  }

  function submit() {
    if (!name.trim()) {
      setError('Give the product a name')
      nameRef.current?.focus()
      return
    }
    onSubmit({
      name,
      brand,
      quantity: Number(quantity) || 1,
      priority,
      store_ids: storeIds,
      estimated_price: Number(estimated) || 0,
      notes,
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Product name">
        <TextInput
          ref={nameRef}
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          placeholder="e.g. Kumkumadi face oil"
        />
        {error && <span className="block text-[12px] text-accent-warm mt-1">{error}</span>}
      </Field>

      <Field label="Brand">
        <TextInput
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Forest Essentials"
        />
      </Field>

      <Field label="Quantity">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
            className="w-11 h-11 rounded-[10px] border border-border bg-surface-2 flex items-center justify-center text-text-primary active:opacity-70"
          >
            <MinusIcon size={18} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => setQuantity((q) => Math.max(1, Number(q) || 1))}
            className="w-16 h-11 text-center rounded-[10px] bg-surface-2 border border-border text-[16px] font-semibold outline-none focus:border-accent"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.max(1, Number(q) || 0) + 1)}
            className="w-11 h-11 rounded-[10px] border border-border bg-surface-2 flex items-center justify-center text-text-primary active:opacity-70"
          >
            <PlusIcon size={18} />
          </button>
        </div>
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

      <Field label="Stores" hint={stores.length ? undefined : 'Add a store first from the Stores tab'}>
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

      <Field label="Estimated price (₹)">
        <TextInput
          type="number"
          inputMode="decimal"
          value={estimated}
          onChange={(e) => setEstimated(e.target.value)}
          placeholder="e.g. 1850"
        />
      </Field>

      <Field label="Notes">
        <TextArea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Get the 24ml bottle, gift-wrap for Ammu"
        />
      </Field>

      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={submit}>
          {isEdit ? 'Save changes' : 'Save product'}
        </Button>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => {
            if (confirmDelete) onDelete()
            else setConfirmDelete(true)
          }}
          className={cx(
            'w-full min-h-[44px] rounded-[10px] text-[14px] font-medium border transition flex items-center justify-center gap-2',
            confirmDelete
              ? 'tint-warm'
              : 'border-border text-text-secondary active:bg-surface-2'
          )}
        >
          <TrashIcon size={16} />
          {confirmDelete ? 'Tap again to delete' : 'Delete product'}
        </button>
      )}
    </div>
  )
}
