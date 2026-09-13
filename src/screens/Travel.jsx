import { useMemo, useState } from 'react'
import {
  useStore,
  travelBudgetTotal,
  travelSpent,
  travelIsToday,
} from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import { buildAndDownloadDocument, pdfMoney } from '../lib/exportDoc.js'
import TopBar from '../components/TopBar.jsx'
import TravelQuickAdd from '../components/TravelQuickAdd.jsx'
import TravelExpenseRow from '../components/TravelExpenseRow.jsx'
import TravelExpenseSheet from '../components/TravelExpenseSheet.jsx'
import TravelSettingsSheet from '../components/TravelSettingsSheet.jsx'
import ConvertMoneySheet from '../components/ConvertMoneySheet.jsx'
import FAB from '../components/FAB.jsx'
import { Card, Button, ProgressBar, EmptyState, formatBDT, formatINR } from '../components/ui.jsx'
import { SettingsIcon, DownloadIcon, PlaneIcon, SwapIcon, EditIcon } from '../components/Icons.jsx'

export default function Travel() {
  const expenses = useStore((s) => s.travel_expenses)
  const settings = useStore((s) => s.travel_settings)
  const convertTravelMoney = useStore((s) => s.convertTravelMoney)
  const toast = useToast((s) => s.toast)

  const [sheetState, setSheetState] = useState(null) // null | expense object (edit)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)

  const isINR = settings.budget_currency === 'INR'
  const fmt = isINR ? formatINR : formatBDT
  const converted = !!settings.conversion_rate
  const budgetSet = settings.budget_amount > 0

  const totals = useMemo(() => {
    const total = travelBudgetTotal(settings)
    const spent = travelSpent(expenses, settings)
    const remaining = Math.max(0, total - spent)
    const over = Math.max(0, spent - total)

    const perDay = settings.trip_days > 0 ? total / settings.trip_days : 0
    const todayExpenses = expenses.filter((e) => travelIsToday(e.created_at))
    const todaySpent = travelSpent(todayExpenses, settings)
    const todayRemaining = Math.max(0, perDay - todaySpent)
    const todayOver = Math.max(0, todaySpent - perDay)

    return { total, spent, remaining, over, perDay, todaySpent, todayRemaining, todayOver }
  }, [expenses, settings])

  const history = useMemo(
    () => [...expenses].sort((a, b) => b.created_at - a.created_at),
    [expenses]
  )

  async function downloadReport() {
    const dateStr = new Date().toISOString().slice(0, 10)
    const dateLabel = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const rowDate = (ts) =>
      new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

    const sorted = [...expenses].sort((a, b) => a.created_at - b.created_at)
    const inr = sorted.filter((e) => e.currency === 'INR')
    const bdt = sorted.filter((e) => e.currency === 'BDT')

    function subtotalsByCategory(list) {
      const map = {}
      list.forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount
      })
      return Object.entries(map).sort((a, b) => b[1] - a[1])
    }

    const inrTotal = inr.reduce((s, e) => s + e.amount, 0)
    const bdtTotal = bdt.reduce((s, e) => s + e.amount, 0)
    const rate = settings.conversion_rate
    const inrConvertedToBdt = rate ? inrTotal / rate : 0
    const finalExpense = bdtTotal + inrConvertedToBdt

    const columns = [
      { label: 'Date', align: 'left', width: 0.18 },
      { label: 'Category', align: 'left', width: 0.26 },
      { label: 'Note', align: 'left', width: 0.32 },
      { label: 'Amount', align: 'right', width: 0.24 },
    ]

    const sections = [
      {
        heading: 'India (INR)',
        table:
          inr.length > 0
            ? {
                columns,
                rows: inr.map((e) => [rowDate(e.created_at), e.category, e.note || '—', pdfMoney(e.amount, 'INR')]),
              }
            : undefined,
        lines: [
          ...subtotalsByCategory(inr).map(([cat, amt]) => `${cat}: ${pdfMoney(amt, 'INR')}`),
          `India subtotal: ${pdfMoney(inrTotal, 'INR')}`,
        ],
      },
      {
        heading: 'Bangladesh (BDT)',
        table:
          bdt.length > 0
            ? {
                columns,
                rows: bdt.map((e) => [rowDate(e.created_at), e.category, e.note || '—', pdfMoney(e.amount, 'BDT')]),
              }
            : undefined,
        lines: [
          ...subtotalsByCategory(bdt).map(([cat, amt]) => `${cat}: ${pdfMoney(amt, 'BDT')}`),
          `Bangladesh subtotal: ${pdfMoney(bdtTotal, 'BDT')}`,
        ],
      },
    ]

    await buildAndDownloadDocument({
      filename: `travel-expenses-${dateStr}`,
      title: `Travel Expenses — ${dateLabel}`,
      sections,
      totals: [
        { label: `Total in India: ${pdfMoney(inrTotal, 'INR')}` },
        { label: `Total in Bangladesh: ${pdfMoney(bdtTotal, 'BDT')}` },
        { label: `FINAL EXPENSE: ${pdfMoney(finalExpense, 'BDT')}`, emphasize: true },
      ],
      note: rate ? `Converted at Tk. 1 = Rs. ${rate}` : undefined,
      footer: `Shopping Mission - generated ${dateLabel}`,
    })
    toast('Travel report downloaded', { tone: 'success' })
  }

  return (
    <div>
      <TopBar
        title="Travel"
        right={
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Trip budget settings"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-primary active:bg-surface-2"
          >
            <SettingsIcon size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-4">
        {!budgetSet ? (
          <EmptyState
            icon={PlaneIcon}
            title="Set up your trip"
            hint="Add a ৳ budget and trip length to see your daily allowance."
            action={
              <Button variant="primary" onClick={() => setSettingsOpen(true)}>
                Set trip budget
              </Button>
            }
          />
        ) : (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">
                Trip budget
              </p>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Edit trip budget"
                className="w-8 h-8 -mr-1.5 -mt-1 rounded-full flex items-center justify-center text-text-secondary active:bg-surface-2 transition"
              >
                <EditIcon size={15} />
              </button>
            </div>
            <p className="text-[30px] font-bold tabular-nums mt-1 leading-none">
              {fmt(totals.remaining)}
            </p>
            <p className="text-[12.5px] text-text-secondary mt-1">remaining</p>

            <div className="mt-3">
              <ProgressBar value={totals.spent} total={totals.total} />
            </div>
            <p className="text-[13.5px] text-text-secondary mt-2">
              {fmt(totals.spent)} of {fmt(totals.total)}
            </p>
            {totals.over > 0 && (
              <p className="text-[12.5px] text-warning mt-1">{fmt(totals.over)} over budget</p>
            )}

            {settings.trip_days > 0 && (
              <div className="border-t border-border mt-3.5 pt-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium text-text-secondary">Today</span>
                  <span className="text-[13.5px] font-semibold tabular-nums">
                    {fmt(totals.todayRemaining)} left
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar value={totals.todaySpent} total={totals.perDay} />
                </div>
                <p className="text-[12px] text-text-muted mt-1.5">
                  {fmt(totals.perDay)} daily allowance
                </p>
                {totals.todayOver > 0 && (
                  <p className="text-[12px] text-warning mt-1">
                    {fmt(totals.todayOver)} over today's allowance
                  </p>
                )}
              </div>
            )}

            <div className="mt-3.5 pt-3.5 border-t border-border">
              {!converted ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setConvertOpen(true)}
                >
                  <SwapIcon size={16} />
                  Convert money
                </Button>
              ) : (
                <p className="text-[12px] text-text-muted">
                  Converted at ৳1 = ₹{settings.conversion_rate}
                </p>
              )}
            </div>
          </Card>
        )}

        <TravelQuickAdd />

        {expenses.length > 0 && (
          <Button variant="secondary" className="w-full" onClick={downloadReport}>
            <DownloadIcon size={18} />
            Download report
          </Button>
        )}

        <section>
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-2 px-1">
            History
          </h2>
          {history.length === 0 ? (
            <p className="text-[13.5px] text-text-secondary text-center py-8">
              No expenses logged yet. Add your first one above.
            </p>
          ) : (
            <Card className="divide-y divide-border overflow-hidden">
              {history.map((e) => (
                <TravelExpenseRow
                  key={e.id}
                  expense={e}
                  conversionRate={settings.conversion_rate}
                  onClick={setSheetState}
                />
              ))}
            </Card>
          )}
        </section>
      </div>

      <TravelExpenseSheet state={sheetState} onClose={() => setSheetState(null)} />
      <TravelSettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ConvertMoneySheet
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        onConfirm={(rate) => {
          convertTravelMoney(rate)
          toast(`Converted at ৳1 = ₹${rate}`, { tone: 'success' })
        }}
      />

      <FAB label="Add expense" onClick={() => setSheetState('add')} />
    </div>
  )
}
