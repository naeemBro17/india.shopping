import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)

const DEFAULT_STORES = [
  { id: 'store-amazon-india', name: 'Amazon India', type: 'online', location: '', website_url: 'https://www.amazon.in' },
  { id: 'store-nykaa', name: 'Nykaa', type: 'online', location: '', website_url: 'https://www.nykaa.com' },
  { id: 'store-sephora', name: 'Sephora', type: 'physical', location: '', website_url: '' },
  { id: 'store-health-glow', name: 'Health & Glow', type: 'physical', location: '', website_url: '' },
  { id: 'store-myntra', name: 'Myntra', type: 'online', location: '', website_url: 'https://www.myntra.com' },
]

const DEFAULT_SETTINGS = {
  trip_mode: 'preparation',
  total_budget: 0,
  dark_mode: false,
  muted: false,
}

const DEFAULT_CURRENCY = {
  direction: 'BDT_INR', // or 'INR_BDT'
  amount: '',
  rates: [
    { id: uid(), label: 'Bank rate', value: '' },
    { id: uid(), label: 'Agent / cash', value: '' },
  ],
}

function newProduct(data = {}) {
  return {
    id: uid(),
    name: (data.name || '').trim(),
    brand: (data.brand || '').trim(),
    quantity: Number(data.quantity) > 0 ? Number(data.quantity) : 1,
    priority: data.priority || 'normal',
    estimated_price: Number(data.estimated_price) || 0,
    actual_price: Number(data.actual_price) || 0,
    notes: (data.notes || '').trim(),
    is_bought: false,
    bought_quantity: 0,
    store_ids: Array.isArray(data.store_ids)
      ? [...new Set(data.store_ids.filter(Boolean))]
      : [],
    created_at: Date.now(),
  }
}

export const useStore = create(
  persist(
    (set, get) => ({
      products: [],
      stores: DEFAULT_STORES,
      settings: DEFAULT_SETTINGS,
      currency: DEFAULT_CURRENCY,

      /* ---------- products ---------- */
      addProduct: (data) =>
        set((s) => ({ products: [newProduct(data), ...s.products] })),

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  quantity:
                    patch.quantity != null
                      ? Math.max(1, Number(patch.quantity) || 1)
                      : p.quantity,
                  estimated_price:
                    patch.estimated_price != null
                      ? Number(patch.estimated_price) || 0
                      : p.estimated_price,
                  actual_price:
                    patch.actual_price != null
                      ? Number(patch.actual_price) || 0
                      : p.actual_price,
                  store_ids: Array.isArray(patch.store_ids)
                    ? [...new Set(patch.store_ids.filter(Boolean))]
                    : p.store_ids || [],
                }
              : p
          ),
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      toggleBought: (id) =>
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id !== id) return p
            const is_bought = !p.is_bought
            return {
              ...p,
              is_bought,
              bought_quantity: is_bought ? p.quantity : 0,
              boughtAt: is_bought ? Date.now() : undefined,
            }
          }),
        })),

      setBought: (id, value) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  is_bought: value,
                  bought_quantity: value ? p.quantity : 0,
                  boughtAt: value ? Date.now() : undefined,
                }
              : p
          ),
        })),

      /* ---------- stores ---------- */
      addStore: (data) =>
        set((s) => ({
          stores: [
            ...s.stores,
            {
              id: uid(),
              name: (data.name || '').trim(),
              type: data.type === 'physical' ? 'physical' : 'online',
              location: (data.location || '').trim(),
              website_url: (data.website_url || '').trim(),
            },
          ],
        })),

      updateStore: (id, patch) =>
        set((s) => ({
          stores: s.stores.map((st) => (st.id === id ? { ...st, ...patch } : st)),
        })),

      deleteStore: (id) =>
        set((s) => ({
          stores: s.stores.filter((st) => st.id !== id),
          products: s.products.map((p) => ({
            ...p,
            store_ids: p.store_ids.filter((sid) => sid !== id),
          })),
        })),

      /* ---------- settings ---------- */
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      setTripMode: (mode) =>
        set((s) => ({ settings: { ...s.settings, trip_mode: mode } })),

      toggleDarkMode: () =>
        set((s) => ({
          settings: { ...s.settings, dark_mode: !s.settings.dark_mode },
        })),

      toggleMute: () =>
        set((s) => ({
          settings: { ...s.settings, muted: !s.settings.muted },
        })),

      /* ---------- currency ---------- */
      setDirection: (direction) =>
        set((s) => ({ currency: { ...s.currency, direction } })),

      setAmount: (amount) =>
        set((s) => ({ currency: { ...s.currency, amount } })),

      addRate: () =>
        set((s) => {
          if (s.currency.rates.length >= 4) return s
          const n = s.currency.rates.length + 1
          return {
            currency: {
              ...s.currency,
              rates: [
                ...s.currency.rates,
                { id: uid(), label: `Rate ${String.fromCharCode(64 + n)}`, value: '' },
              ],
            },
          }
        }),

      updateRate: (id, patch) =>
        set((s) => ({
          currency: {
            ...s.currency,
            rates: s.currency.rates.map((r) =>
              r.id === id ? { ...r, ...patch } : r
            ),
          },
        })),

      removeRate: (id) =>
        set((s) => ({
          currency: {
            ...s.currency,
            rates: s.currency.rates.filter((r) => r.id !== id),
          },
        })),

      clearRates: () =>
        set((s) => ({
          currency: {
            ...s.currency,
            amount: '',
            rates: s.currency.rates.map((r) => ({ ...r, value: '' })),
          },
        })),

      /* ---------- danger zone ---------- */
      clearAllData: () =>
        set(() => ({
          products: [],
          stores: DEFAULT_STORES,
          settings: DEFAULT_SETTINGS,
          currency: {
            direction: 'BDT_INR',
            amount: '',
            rates: [
              { id: uid(), label: 'Bank rate', value: '' },
              { id: uid(), label: 'Agent / cash', value: '' },
            ],
          },
        })),
    }),
    {
      name: 'india-shopping-mission',
      version: 1,
      partialize: (s) => ({
        products: s.products,
        stores: s.stores,
        settings: s.settings,
        currency: s.currency,
      }),
    }
  )
)

/* ---------- selectors / helpers ---------- */

export function storeItemStats(products, storeId) {
  const items = products.filter((p) => (p.store_ids || []).includes(storeId))
  const bought = items.filter((p) => p.is_bought).length
  return { total: items.length, bought, remaining: items.length - bought, items }
}

export function activeStoreIds(products) {
  const set = new Set()
  products.forEach((p) => (p.store_ids || []).forEach((id) => set.add(id)))
  return set
}

export const PRIORITY_META = {
  must_buy: { label: 'Must Buy', pill: 'tint-warm' },
  normal: { label: 'Normal', pill: 'bg-surface-2 text-text-secondary border-border' },
  if_available: { label: 'If Available', pill: 'tint-accent' },
}

export const PRIORITY_ORDER = { must_buy: 0, normal: 1, if_available: 2 }
