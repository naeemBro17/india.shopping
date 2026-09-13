import BottomSheet from './BottomSheet.jsx'
import TravelExpenseForm from './TravelExpenseForm.jsx'
import { useStore } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'

/**
 * state: null (closed) | 'add' | expense object (edit)
 */
export default function TravelExpenseSheet({ state, onClose }) {
  const addTravelExpense = useStore((s) => s.addTravelExpense)
  const updateTravelExpense = useStore((s) => s.updateTravelExpense)
  const deleteTravelExpense = useStore((s) => s.deleteTravelExpense)
  const lastUsedCurrency = useStore((s) => s.travel_settings.last_used_currency)
  const toast = useToast((s) => s.toast)

  const open = state != null
  const editing = state && state !== 'add' ? state : null

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Edit expense' : 'Add expense'}>
      {open && (
        <TravelExpenseForm
          key={editing ? editing.id : 'add'}
          initial={editing}
          defaultCurrency={lastUsedCurrency || 'BDT'}
          isEdit={!!editing}
          onCancel={onClose}
          onSubmit={(data) => {
            if (editing) {
              updateTravelExpense(editing.id, data)
              toast('Expense updated', { tone: 'success' })
            } else {
              addTravelExpense(data)
              toast('Expense added', { tone: 'success' })
            }
            onClose()
          }}
          onDelete={
            editing
              ? () => {
                  deleteTravelExpense(editing.id)
                  toast('Expense deleted')
                  onClose()
                }
              : undefined
          }
        />
      )}
    </BottomSheet>
  )
}
