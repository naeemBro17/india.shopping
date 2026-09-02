import { NavLink, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { cx } from './ui.jsx'
import { HomeIcon, BagIcon, StoreIcon, CartIcon, CoinIcon } from './Icons.jsx'

const TABS = [
  { to: '/', label: 'Home', icon: HomeIcon, match: (p) => p === '/' },
  { to: '/products', label: 'Products', icon: BagIcon, match: (p) => p.startsWith('/products') },
  { to: '/stores', label: 'Stores', icon: StoreIcon, match: (p) => p.startsWith('/stores') },
  { to: '/shopping', label: 'Shopping', icon: CartIcon, match: (p) => p.startsWith('/shopping') },
  { to: '/currency', label: 'Currency', icon: CoinIcon, match: (p) => p.startsWith('/currency') },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const activeIndex = useMemo(
    () => TABS.findIndex((t) => t.match(pathname)),
    [pathname]
  )

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative max-w-[460px] mx-auto flex">
        <span
          className="absolute top-0 h-[2px] bg-accent rounded-full transition-all duration-300"
          style={{
            width: `${100 / TABS.length}%`,
            left: `${(activeIndex < 0 ? 0 : activeIndex) * (100 / TABS.length)}%`,
            opacity: activeIndex < 0 ? 0 : 1,
          }}
        />
        {TABS.map((t) => {
          const Icon = t.icon
          const active = t.match(pathname)
          return (
            <NavLink
              key={t.to}
              to={t.to}
              className={cx(
                'flex-1 min-h-[56px] flex flex-col items-center justify-center gap-1 pt-1.5 transition',
                active ? 'text-accent' : 'text-text-secondary'
              )}
            >
              <Icon size={22} />
              <span className="text-[10.5px] font-medium tracking-tight">{t.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
