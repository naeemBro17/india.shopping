import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)

export const DEFAULT_STORES = [
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
  accent_theme: 'slate', // 'slate' | 'sage' | 'rosewood'
}

const DEFAULT_CURRENCY = {
  direction: 'BDT_INR', // or 'INR_BDT'
  amount: '',
  rates: [
    { id: uid(), label: 'Bank rate', value: '' },
    { id: uid(), label: 'Agent / cash', value: '' },
  ],
}

/* ---------- travel expenses (Part B — separate ledger, own screen) ---------- */

export const TRAVEL_CATEGORIES = [
  'Food',
  'Transport',
  'Sightseeing',
  'Shopping',
  'Accommodation',
  'Other',
]

// Decorative per-category dot colours — fixed across themes (data-series
// colour coding, not a theme token), chosen muted enough to sit quietly in
// any of the three palettes.
export const TRAVEL_CATEGORY_COLORS = {
  Food: '#d18b5c',
  Transport: '#6b8ca8',
  Sightseeing: '#9b8ac0',
  Shopping: '#7ba694',
  Accommodation: '#a8626d',
  Other: '#8b949e',
}

const DEFAULT_TRAVEL_SETTINGS = {
  budget_amount: 0,
  budget_currency: 'BDT', // 'BDT' before conversion, 'INR' after
  trip_days: 0,
  conversion_rate: null, // ৳ to ₹ rate, null until "Convert money"
  converted_at: null,
  last_used_currency: 'BDT',
}

function newTravelExpense(data = {}) {
  return {
    id: uid(),
    amount: Number(data.amount) || 0,
    currency: data.currency === 'INR' ? 'INR' : 'BDT',
    category: (data.category || '').trim() || 'Other',
    note: (data.note || '').trim(),
    created_at: Date.now(),
  }
}

/** Convert an amount between BDT/INR using the single stored trip rate (৳1 = ₹rate). */
export function convertTravelAmount(amount, fromCurrency, toCurrency, rate) {
  const n = Number(amount) || 0
  if (fromCurrency === toCurrency) return n
  if (!rate) return n
  return fromCurrency === 'BDT' ? n * rate : n / rate
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
      travel_expenses: [],
      travel_settings: DEFAULT_TRAVEL_SETTINGS,

      /* ---------- products ---------- */
      addProduct: (data) =>
        set((s) => ({ products: [newProduct(data), ...s.products] })),

      /** Bulk import — array of { name, notes, estimated_price }. Priority defaults to must_buy. */
      addProducts: (items) =>
        set((s) => ({
          products: [
            ...items.map((it) =>
              newProduct({
                name: it.name,
                notes: it.notes,
                estimated_price: it.estimated_price,
                priority: 'must_buy',
              })
            ),
            ...s.products,
          ],
        })),

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

      setAccentTheme: (accent_theme) =>
        set((s) => ({ settings: { ...s.settings, accent_theme } })),

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

      /* ---------- travel expenses (separate ledger from shopping) ---------- */
      addTravelExpense: (data) =>
        set((s) => ({
          travel_expenses: [newTravelExpense(data), ...s.travel_expenses],
          travel_settings: {
            ...s.travel_settings,
            last_used_currency: data.currency === 'INR' ? 'INR' : 'BDT',
          },
        })),

      updateTravelExpense: (id, patch) =>
        set((s) => ({
          travel_expenses: s.travel_expenses.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...patch,
                  amount: patch.amount != null ? Number(patch.amount) || 0 : e.amount,
                  category: patch.category != null
                    ? (patch.category || '').trim() || 'Other'
                    : e.category,
                }
              : e
          ),
        })),

      deleteTravelExpense: (id) =>
        set((s) => ({
          travel_expenses: s.travel_expenses.filter((e) => e.id !== id),
        })),

      updateTravelSettings: (patch) =>
        set((s) => ({ travel_settings: { ...s.travel_settings, ...patch } })),

      setTravelBudget: (budget_amount, trip_days) =>
        set((s) => ({
          travel_settings: {
            ...s.travel_settings,
            budget_amount: Number(budget_amount) || 0,
            trip_days: Number(trip_days) || 0,
          },
        })),

      /** The one-time "convert money" switch — from now on the whole screen displays ₹. */
      convertTravelMoney: (rate) =>
        set((s) => ({
          travel_settings: {
            ...s.travel_settings,
            conversion_rate: Number(rate) || 0,
            converted_at: Date.now(),
            budget_currency: 'INR',
            last_used_currency: 'INR',
          },
        })),

      /** Correcting a mistyped rate afterwards — everything derives from this, so it just updates. */
      updateTravelConversionRate: (rate) =>
        set((s) => ({
          travel_settings: { ...s.travel_settings, conversion_rate: Number(rate) || 0 },
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
          travel_expenses: [],
          travel_settings: DEFAULT_TRAVEL_SETTINGS,
        })),
    }),
    {
      name: 'india-shopping-mission',
      version: 2,
      partialize: (s) => ({
        products: s.products,
        stores: s.stores,
        settings: s.settings,
        currency: s.currency,
        travel_expenses: s.travel_expenses,
        travel_settings: s.travel_settings,
      }),
      // v1 -> v2: the old accent-only themes (blue/violet/orange) were
      // replaced by full palettes (slate/sage/rosewood) in Part C.
      migrate: (persisted, version) => {
        if (version < 2 && persisted?.settings) {
          const LEGACY = { blue: 'slate', violet: 'sage', orange: 'rosewood' }
          const legacy = LEGACY[persisted.settings.accent_theme]
          if (legacy) persisted.settings.accent_theme = legacy
        }
        return persisted
      },
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

/** The trip's current display currency — 'BDT' before conversion, 'INR' after. */
export function travelDisplayCurrency(travel_settings) {
  return travel_settings.budget_currency === 'INR' ? 'INR' : 'BDT'
}

/** Trip budget total, expressed in the current display currency. */
export function travelBudgetTotal(travel_settings) {
  const display = travelDisplayCurrency(travel_settings)
  return convertTravelAmount(
    travel_settings.budget_amount,
    'BDT',
    display,
    travel_settings.conversion_rate
  )
}

/** Sum of expenses (optionally filtered), converted into the display currency. */
export function travelSpent(expenses, travel_settings) {
  const display = travelDisplayCurrency(travel_settings)
  return expenses.reduce(
    (sum, e) =>
      sum + convertTravelAmount(e.amount, e.currency, display, travel_settings.conversion_rate),
    0
  )
}

export function travelIsToday(created_at) {
  const d = new Date(created_at)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export const PRIORITY_META = {
  must_buy: { label: 'Must Buy', pill: 'tint-warm' },
  normal: { label: 'Normal', pill: 'bg-surface-2 text-text-secondary border-border' },
  if_available: { label: 'If Available', pill: 'tint-accent' },
}

export const PRIORITY_ORDER = { must_buy: 0, normal: 1, if_available: 2 }
