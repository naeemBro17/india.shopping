import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import { parseBulkImport } from '../lib/bulkImport.js'
import BottomSheet from './BottomSheet.jsx'
import { Button, TextArea } from './ui.jsx'

/**
 * Paste-a-list import. Pure offline text parsing (src/lib/bulkImport.js) —
 * no AI/API calls. Every imported product defaults to priority "must_buy",
 * quantity 1, no store, no price.
 */
export default function BulkImport({ open, onClose }) {
  const addProducts = useStore((s) => s.addProducts)
  const toast = useToast((s) => s.toast)
  const [text, setText] = useState('')

  const parsed = useMemo(() => parseBulkImport(text), [text])

  function close() {
    setText('')
    onClose?.()
  }

  function handleImport() {
    if (parsed.length === 0) return
    addProducts(parsed)
    toast(`${parsed.length} product${parsed.length === 1 ? '' : 's'} added`, {
      tone: 'success',
    })
    close()
  }

  return (
    <BottomSheet open={open} onClose={close} title="Bulk Import" maxHeight="92vh">
      <div className="space-y-3">
        <TextArea
          autoFocus
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="One product per line. Add a price with | 450 at the end of a line."
          className="min-h-[150px]"
        />

        <p className="text-[13px] text-text-secondary px-0.5">
          {parsed.length} product{parsed.length === 1 ? '' : 's'} detected
        </p>

        {parsed.length > 0 && (
          <div className="max-h-[240px] overflow-y-auto space-y-1.5 border border-border rounded-[10px] p-2.5 bg-surface-2">
            {parsed.map((p, i) => (
              <p key={i} className="text-[13.5px] text-text-primary truncate">
                {i + 1}. {p.name}
                {p.estimated_price !== '' && (
                  <span className="text-text-secondary"> — ₹{p.estimated_price}</span>
                )}
              </p>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" className="flex-1" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleImport}
            disabled={parsed.length === 0}
          >
            Import All{parsed.length > 0 ? ` (${parsed.length})` : ''}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
