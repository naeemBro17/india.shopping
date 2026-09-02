import BottomSheet from './BottomSheet.jsx'
import StoreForm from './StoreForm.jsx'
import { useStore } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'

export default function StoreSheet({ state, onClose }) {
  const addStore = useStore((s) => s.addStore)
  const updateStore = useStore((s) => s.updateStore)
  const toast = useToast((s) => s.toast)

  const open = state != null
  const editing = state && state !== 'add' ? state : null

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Edit store' : 'Add store'}>
      {open && (
        <StoreForm
          key={editing ? editing.id : 'add'}
          initial={editing}
          onCancel={onClose}
          onSubmit={(data) => {
            if (editing) {
              updateStore(editing.id, data)
              toast('Store updated', { tone: 'success' })
            } else {
              addStore(data)
              toast('Store added', { tone: 'success' })
            }
            onClose()
          }}
        />
      )}
    </BottomSheet>
  )
}
