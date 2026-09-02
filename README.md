# India Shopping Mission

A mobile-first web app for planning and running a shopping trip to India. Build your
product list, assign items to physical and online stores, track a budget, then switch
into a store-by-store shopping checklist. Includes a manual currency comparison tool
(BDT ⇄ INR).

**No backend. No account. No tracking.** Everything is stored in `localStorage` on the
device. Installable to a phone home screen and fully usable offline (PWA).

## Stack

- React 18 + Vite 5
- Tailwind CSS v3 (CSS-variable theming, light + dark)
- React Router v6
- Zustand + `persist` middleware (localStorage)
- `vite-plugin-pwa` (offline precache, installable manifest)

## Run

```bash
npm install
npm run dev        # dev server
npm run build      # production build -> dist/
npm run preview    # serve the production build
```

## Structure

```
src/
  components/   reusable UI (BottomSheet, ProductCard, forms, nav, icons, ui primitives)
  screens/      one file per route
  store/        Zustand store + localStorage persistence + selectors
  hooks/        useOnlineStatus, useToast
```

## Routes

| Path            | Screen                                             |
|-----------------|----------------------------------------------------|
| `/`             | Home — trip status, stats, quick actions, stores   |
| `/products`     | Product list with filters + search                 |
| `/stores`       | Stores grouped physical / online, with progress    |
| `/stores/:id`   | Store detail — items for that store                |
| `/shopping`     | Shopping mode — pick a store, trip audit           |
| `/shopping/:id` | Store checklist with BOUGHT buttons + exit guard   |
| `/currency`     | Manual BDT ⇄ INR rate comparison                   |
| `/settings`     | Dark mode, trip mode, budget, clear all data       |

## Data

All state lives under the `india-shopping-mission` localStorage key:

- `products[]` — name, brand, quantity, priority, prices, notes, `is_bought`, `store_ids`
- `stores[]` — name, `type` (`physical` | `online`), location, website
- `settings` — `trip_mode`, `total_budget`, `dark_mode`
- `currency` — direction, amount, up to 4 manual rates

Five stores are preloaded on first run (Amazon India, Nykaa, Sephora, Health & Glow,
Myntra). **Clear all data** in Settings resets products/settings/rates and restores the
default stores.

## Notes on behaviour

- Currency rates are entered by hand — nothing is fetched. Best rate = highest
  destination-currency value per unit, in whichever direction is selected.
- Shopping mode has an exit guard: leaving a store with unchecked items opens a sheet
  listing them. Items are never auto-completed.
- Completing every item in a store shows a 2s confirmation overlay, then returns to the
  store list.
- Animations respect `prefers-reduced-motion`.
