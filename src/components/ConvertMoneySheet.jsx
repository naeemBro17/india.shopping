import { useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import { Button, formatBDT, formatINR } from './ui.jsx'

/**
 * The one-time "convert money" switch — entered once, at the money-changer,
 * and used for ALL ৳↔₹ math afterwards (including the final report). Also
 * reused (via `isEdit`) from Travel settings to correct a mistyped rate.
 */
export default function ConvertMoneySheet({ open, onClose, onConfirm, isEdit, currentRate }) {
  const [rate, setRate] = useState(currentRate ? String(currentRate) : '')
  const n = Number(rate)
  const valid = n > 0

  function confirm() {
    if (!valid) return
    onConfirm(n)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Edit conversion rate' : 'Convert money'}>
      <div className="space-y-4">
        <p className="text-[13.5px] text-text-secondary">
          {isEdit
            ? "Correct the rate you got — everything on the Travel screen recalculates from it."
            : 'Enter the rate you got at the money changer.'}
        </p>

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
            ৳1 = ₹____
          </label>
          <div className="flex items-center gap-2 rounded-[10px] bg-surface-2 border border-border px-3 focus-within:border-accent transition">
            <span className="text-[15px] font-semibold text-text-secondary shrink-0">৳1 =</span>
            <span className="text-[20px] font-bold text-text-secondary shrink-0">₹</span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              className="flex-1 min-w-0 min-h-[52px] bg-transparent text-[20px] font-bold outline-none placeholder:text-text-secondary/40"
            />
          </div>
          <p className="text-[13px] text-text-secondary mt-2">
            {valid
              ? `${formatBDT(10000)} = ${formatINR(10000 * n)}`
              : 'e.g. ৳10,000 = ₹—'}
          </p>
        </div>

        <Button variant="primary" className="w-full" onClick={confirm} disabled={!valid}>
          {isEdit ? 'Save rate' : 'Convert'}
        </Button>
      </div>
    </BottomSheet>
  )
}
