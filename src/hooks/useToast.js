import { create } from 'zustand'

let counter = 0

export const useToast = create((set, get) => ({
  toasts: [],
  toast: (message, opts = {}) => {
    const id = ++counter
    set((s) => ({ toasts: [...s.toasts, { id, message, tone: opts.tone || 'default' }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, opts.duration || 2200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
