import { useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import ConvertMoneySheet from './ConvertMoneySheet.jsx'
import { useStore, travelBudgetTotal } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import { Button, Field, TextInput, formatBDT, formatINR } from './ui.jsx'

/**
 * "Trip budget" + "Trip length" setup, and (once converted) a way to
 * correct the conversion rate. Reachable any time from the Travel screen's
 * top bar, and also what a fresh trip sees before any budget is set.
 */
export default function TravelSettingsSheet({ open, onClose }) {
  const settings = useStore((s) => s.travel_settings)
  const setTravelBudget = useStore((s) => s.setTravelBudget)
  const updateTravelConversionRate = useStore((s) => s.updateTravelConversionRate)
  const toast = useToast((s) => s.toast)

  const [budget, setBudget] = useState(settings.budget_amount ? String(settings.budget_amount) : '')
  const [days, setDays] = useState(settings.trip_days ? String(settings.trip_days) : '')
  const [editingRate, setEditingRate] = useState(false)

  const converted = !!settings.conversion_rate

  function save() {
    setTravelBudget(Number(budget) || 0, Number(days) || 0)
    toast('Trip budget saved', { tone: 'success' })
    onClose()
  }

  const perDay =
    Number(days) > 0
      ? travelBudgetTotal({ ...settings, budget_amount: Number(budget) || 0 }) / Number(days)
      : 0

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Trip budget">
        <div className="space-y-4">
          <Field label="Trip budget (৳)" hint="Set once, before conversion — always in ৳">
            <TextInput
              type="text"
              inputMode="decimal"
              value={budget}
              onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 20000"
            />
          </Field>

          <Field label="Trip length (days)">
            <TextInput
              type="text"
              inputMode="numeric"
              value={days}
              onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 10"
            />
          </Field>

          {perDay > 0 && (
            <p className="text-[13.5px] text-text-secondary">
              Per day:{' '}
              <span className="text-text-primary font-semibold">
                {converted ? formatINR(perDay) : formatBDT(perDay)}
              </span>
            </p>
          )}

          <Button variant="primary" className="w-full" onClick={save}>
            Save
          </Button>

          {converted && (
            <div className="pt-2 border-t border-border">
              <p className="text-[12.5px] text-text-secondary mb-2">
                Converted at ৳1 = ₹{settings.conversion_rate}
              </p>
              <Button variant="secondary" className="w-full" onClick={() => setEditingRate(true)}>
                Edit conversion rate
              </Button>
            </div>
          )}
        </div>
      </BottomSheet>

      <ConvertMoneySheet
        open={editingRate}
        onClose={() => setEditingRate(false)}
        isEdit
        currentRate={settings.conversion_rate}
        onConfirm={(rate) => {
          updateTravelConversionRate(rate)
          toast('Conversion rate updated', { tone: 'success' })
        }}
      />
    </>
  )
}
