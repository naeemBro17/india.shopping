import { useMemo } from 'react'
import { useStore } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import { buildAndDownloadDocument, pdfMoney } from '../lib/exportDoc.js'
import TopBar from '../components/TopBar.jsx'
import { Card, Button, EmptyState, formatINR } from '../components/ui.jsx'
import { ReceiptIcon, DownloadIcon } from '../components/Icons.jsx'

/** Grammatical, count-agreeing note for items with no recorded price. */
function excludedNote(n) {
  if (n <= 0) return null
  const verb = n === 1 ? 'has' : 'have'
  const priceWord = n === 1 ? 'no recorded price' : 'no recorded prices'
  const isAre = n === 1 ? 'is' : 'are'
  return `${n} item${n === 1 ? '' : 's'} ${verb} ${priceWord} and ${isAre} not included in the total.`
}

export default function Receipt() {
  const products = useStore((s) => s.products)
  const toast = useToast((s) => s.toast)

  const receipt = useMemo(() => {
    const bought = products
      .filter((p) => p.is_bought)
      .sort((a, b) => (b.boughtAt || 0) - (a.boughtAt || 0))

    let grandTotal = 0
    let estimatedValue = 0
    const recorded = []
    const estimated = []
    bought.forEach((p) => {
      const qty = Number(p.bought_quantity) > 0 ? Number(p.bought_quantity) : Number(p.quantity) || 1
      const hasActual = Number(p.actual_price) > 0
      const unitPrice = hasActual ? Number(p.actual_price) : Number(p.estimated_price) || 0
      const lineTotal = unitPrice * qty
      const row = { ...p, qty, hasActual, unitPrice, lineTotal }
      if (hasActual) {
        grandTotal += lineTotal
        recorded.push(row)
      } else {
        estimatedValue += lineTotal
        estimated.push(row)
      }
    })

    return {
      recorded,
      estimated,
      grandTotal,
      estimatedValue,
      totalItems: bought.length,
      excludedCount: estimated.length,
      allEstimated: bought.length > 0 && recorded.length === 0,
    }
  }, [products])

  const note = excludedNote(receipt.excludedCount)
  const noRows = receipt.totalItems === 0

  async function download() {
    const dateStr = new Date().toISOString().slice(0, 10)
    const dateLabel = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const columns = [
      { label: 'Item', align: 'left', width: 0.42 },
      { label: 'Qty', align: 'right', width: 0.14 },
      { label: 'Price', align: 'right', width: 0.2 },
      { label: 'Total', align: 'right', width: 0.24 },
    ]
    const rowOf = (r) => [
      r.name,
      String(r.qty),
      pdfMoney(r.unitPrice, 'INR'),
      pdfMoney(r.lineTotal, 'INR'),
    ]

    const sections = []
    if (receipt.recorded.length > 0) {
      sections.push({ table: { columns, rows: receipt.recorded.map(rowOf) } })
    }
    if (receipt.estimated.length > 0) {
      sections.push({
        heading: 'Not included — no recorded price',
        table: { columns, rows: receipt.estimated.map(rowOf) },
      })
    }

    const totals = receipt.allEstimated
      ? [
          { label: `Total items: ${receipt.totalItems}` },
          { label: 'No recorded prices yet — total unavailable.' },
          { label: `Estimated value: ${pdfMoney(receipt.estimatedValue, 'INR')}` },
        ]
      : [
          { label: `Total items: ${receipt.totalItems}` },
          { label: `Total spent: ${pdfMoney(receipt.grandTotal, 'INR')}`, emphasize: true },
        ]

    await buildAndDownloadDocument({
      filename: `shopping-receipt-${dateStr}`,
      title: 'Shopping Mission — Receipt',
      subtitle: dateLabel,
      sections,
      totals,
      note: note || undefined,
      footer: `Shopping Mission - generated ${dateLabel}`,
    })
    toast('Receipt downloaded', { tone: 'success' })
  }

  return (
    <div>
      <TopBar title="Shopping Receipt" back subtitle="Only items you've checked off" />

      <div className="px-4 pt-4 pb-6 space-y-4">
        {noRows ? (
          <EmptyState
            icon={ReceiptIcon}
            title="Nothing purchased yet"
            hint="Your receipt will appear here once you start checking off items."
          />
        ) : (
          <>
            {receipt.recorded.length > 0 && (
              <Card className="overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2 text-[11.5px] font-semibold uppercase tracking-wide text-text-secondary">
                  <span className="flex-1 min-w-0">Item</span>
                  <span className="w-9 text-right shrink-0">Qty</span>
                  <span className="w-16 text-right shrink-0">Price</span>
                  <span className="w-20 text-right shrink-0">Total</span>
                </div>
                <div className="divide-y divide-border">
                  {receipt.recorded.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 px-3.5 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14.5px] font-medium truncate">{r.name}</p>
                      </div>
                      <span className="w-9 text-right shrink-0 text-[13px] tabular-nums text-text-secondary">
                        {r.qty}
                      </span>
                      <span className="w-16 text-right shrink-0 text-[13px] tabular-nums text-text-secondary">
                        {formatINR(r.unitPrice)}
                      </span>
                      <span className="w-20 text-right shrink-0 text-[14px] font-semibold tabular-nums">
                        {formatINR(r.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {receipt.estimated.length > 0 && (
              <section>
                <h2 className="text-[12.5px] font-semibold text-text-secondary uppercase tracking-wide mb-2 px-1">
                  Not included — no recorded price
                </h2>
                <Card className="divide-y divide-border overflow-hidden">
                  {receipt.estimated.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 px-3.5 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14.5px] font-medium truncate text-text-secondary">
                          {r.name}
                        </p>
                        <p className="text-[11px] text-text-muted">(estimated)</p>
                      </div>
                      <span className="w-9 text-right shrink-0 text-[13px] tabular-nums text-text-muted">
                        {r.qty}
                      </span>
                      <span className="w-16 text-right shrink-0 text-[13px] tabular-nums text-text-muted">
                        {formatINR(r.unitPrice)}
                      </span>
                      <span className="w-20 text-right shrink-0 text-[14px] font-semibold tabular-nums text-text-muted">
                        {formatINR(r.lineTotal)}
                      </span>
                    </div>
                  ))}
                </Card>
              </section>
            )}

            <Card className="p-4">
              <div className="flex items-center justify-between text-[13.5px] text-text-secondary">
                <span>Total items</span>
                <span className="tabular-nums">{receipt.totalItems}</span>
              </div>
              <div className="border-t border-border mt-3 pt-3">
                {receipt.allEstimated ? (
                  <>
                    <p className="text-[15px] font-semibold">
                      No recorded prices yet — total unavailable.
                    </p>
                    <p className="text-[13px] text-text-secondary mt-1">
                      Estimated value: {formatINR(receipt.estimatedValue)}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold">Total spent</span>
                    <span className="text-[20px] font-bold tabular-nums">
                      {formatINR(receipt.grandTotal)}
                    </span>
                  </div>
                )}
              </div>
              {note && !receipt.allEstimated && (
                <p className="text-[12px] text-text-muted mt-2">{note}</p>
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
