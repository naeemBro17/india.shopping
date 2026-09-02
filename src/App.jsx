import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore.js'
import BottomNav from './components/BottomNav.jsx'
import Toaster from './components/Toaster.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'

import Home from './screens/Home.jsx'
import Products from './screens/Products.jsx'
import Stores from './screens/Stores.jsx'
import StoreDetail from './screens/StoreDetail.jsx'
import Shopping from './screens/Shopping.jsx'
import ShoppingStore from './screens/ShoppingStore.jsx'
import Currency from './screens/Currency.jsx'
import Settings from './screens/Settings.jsx'

function useDarkModeSync() {
  const dark = useStore((s) => s.settings.dark_mode)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', !!dark)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', dark ? '#0F0F0E' : '#F8F7F4')
  }, [dark])
}

export default function App() {
  useDarkModeSync()

  return (
    <div className="min-h-full bg-bg text-text-primary">
      <div className="max-w-[460px] mx-auto min-h-screen flex flex-col">
        <OfflineBanner />
        <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/shopping/:id" element={<ShoppingStore />} />
            <Route path="/currency" element={<Currency />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
        <Toaster />
      </div>
    </div>
  )
}
