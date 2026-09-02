import BottomSheet from './BottomSheet.jsx'
import ProductForm from './ProductForm.jsx'
import { useStore } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'

/**
 * mode: null (closed) | 'add' | product object (edit)
 */
export default function ProductSheet({ state, onClose, defaultStoreId }) {
  const stores = useStore((s) => s.stores)
  const addProduct = useStore((s) => s.addProduct)
  const updateProduct = useStore((s) => s.updateProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)
  const toast = useToast((s) => s.toast)

  const open = state != null
  const editing = state && state !== 'add' ? state : null
  const initial = editing || (defaultStoreId ? { store_ids: [defaultStoreId] } : null)

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editing ? 'Edit product' : 'Add product'}
    >
      {open && (
        <ProductForm
          key={editing ? editing.id : 'add'}
          initial={initial}
          isEdit={!!editing}
          stores={stores}
          onCancel={onClose}
          onSubmit={(data) => {
            if (editing) {
              updateProduct(editing.id, data)
              toast('Product updated', { tone: 'success' })
            } else {
              addProduct(data)
              toast('Product added', { tone: 'success' })
            }
            onClose()
          }}
          onDelete={
            editing
              ? () => {
                  deleteProduct(editing.id)
                  toast('Product deleted')
                  onClose()
                }
              : undefined
          }
        />
      )}
    </BottomSheet>
  )
}
