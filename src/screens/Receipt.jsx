import { useMemo } from 'react'
import { useStore } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import { buildAndDownloadDocument } from '../lib/exportDoc.js'
import TopBar from '../components/TopBar.jsx'
import { Card, Button, EmptyState, formatINR } from '../components/ui.jsx'
import { ReceiptIcon, DownloadIcon } from '../components/Icons.jsx'

export default function Receipt() {
  const products = useStore((s) => s.products)
  const toast = useToast((s) => s.toast)

  const receipt = useMemo(() => {
    const bought = products
      .filter((p) => p.is_bought)
      .sort((a, b) => (b.boughtAt || 0) - (a.boughtAt || 0))

    let grandTotal = 0
    let excludedCount = 0
    const rows = bought.map((p) => {
      const qty = Number(p.bought_quantity) > 0 ? Number(p.bought_quantity) : Number(p.quantity) || 1
      const hasActual = Number(p.actual_price) > 0
      const unitPrice = hasActual ? Number(p.actual_price) : Number(p.estimated_price) || 0
      const lineTotal = unitPrice * qty
      if (hasActual) grandTotal += lineTotal
      else excludedCount += 1
      return { ...p, qty, hasActual, unitPrice, lineTotal }
    })

    return { rows, grandTotal, totalItems: bought.length, excludedCount }
  }, [products])

  async function download() {
    const dateStr = new Date().toISOString().slice(0, 10)
    const dateLabel = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    await buildAndDownloadDocument({
      filename: `shopping-receipt-${dateStr}`,
      title: 'Shopping Mission — Receipt',
      subtitle: dateLabel,
      sections: [
        {
          table: {
            columns: [
              { label: 'Item', align: 'left', width: 0.42 },
              { label: 'Qty', align: 'right', width: 0.14 },
              { label: 'Price', align: 'right', width: 0.2 },
              { label: 'Total', align: 'right', width: 0.24 },
            ],
            rows: receipt.rows.map((r) => [
              r.name + (r.hasActual ? '' : ' (est.)'),
              String(r.qty),
              formatINR(r.unitPrice),
              formatINR(r.lineTotal),
            ]),
          },
        },
      ],
      totals: [
        { label: `Total items: ${receipt.totalItems}` },
        { label: `Total spent: ${formatINR(receipt.grandTotal)}`, emphasize: true },
      ],
      note:
        receipt.excludedCount > 0
          ? `${receipt.excludedCount} item${receipt.excludedCount > 1 ? 's' : ''} had no recorded price and are not included in the total.`
          : undefined,
    })
    toast('Receipt downloaded', { tone: 'success' })
  }

  return (
    <div>
      <TopBar title="Shopping Receipt" back subtitle="Only items you've checked off" />

      <div className="px-4 pt-4 pb-6 space-y-4">
        {receipt.rows.length === 0 ? (
          <EmptyState
            icon={ReceiptIcon}
            title="Nothing purchased yet"
            hint="Your receipt will appear here once you start checking off items."
          />
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2 text-[11.5px] font-semibold uppercase tracking-wide text-text-secondary">
                <span className="flex-1 min-w-0">Item</span>
                <span className="w-9 text-right shrink-0">Qty</span>
                <span className="w-16 text-right shrink-0">Price</span>
                <span className="w-20 text-right shrink-0">Total</span>
              </div>
              <div className="divide-y divide-border">
                {receipt.rows.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 px-3.5 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14.5px] font-medium truncate">{r.name}</p>
                      {!r.hasActual && (
                        <p className="text-[11px] text-text-muted">(estimated)</p>
                      )}
                    </div>
                    <span className="w-9 text-right shrink-0 text-[13px] tabular-nums text-text-secondary">
                      {r.qty}
                    </span>
                    <span
                      className={
                        'w-16 text-right shrink-0 text-[13px] tabular-nums ' +
                        (r.hasActual ? 'text-text-secondary' : 'text-text-muted')
                      }
                    >
                      {formatINR(r.unitPrice)}
                    </span>
                    <span className="w-20 text-right shrink-0 text-[14px] font-semibold tabular-nums">
                      {formatINR(r.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-[13.5px] text-text-secondary">
                <span>Total items</span>
                <span className="tabular-nums">{receipt.totalItems}</span>
              </div>
              <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
                <span className="text-[15px] font-semibold">Total spent</span>
                <span className="text-[20px] font-bold tabular-nums">
                  {formatINR(receipt.grandTotal)}
                </span>
              </div>
              {receipt.excludedCount > 0 && (
                <p className="text-[12px] text-text-muted mt-2">
                  {receipt.excludedCount} item{receipt.excludedCount > 1 ? 's' : ''} had no
                  recorded price and {receipt.excludedCount > 1 ? 'are' : 'is'} not included in
                  the total.
                </p>
              )}
            </Card>

            <Button variant="primary" className="w-full" onClick={download}>
              <DownloadIcon size={18} />
              Download receipt
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
