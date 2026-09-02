import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { SunIcon, MoonIcon, ChevronLeft } from './Icons.jsx'

export default function TopBar({ title, subtitle, back, right, showTheme = true }) {
  const navigate = useNavigate()
  const dark = useStore((s) => s.settings.dark_mode)
  const toggleDarkMode = useStore((s) => s.toggleDarkMode)

  return (
    <header
      className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-border"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-[52px] px-4 flex items-center gap-2">
        {back && (
          <button
            onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
            aria-label="Back"
            className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-text-primary active:bg-surface-2"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] font-bold text-text-primary leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-text-secondary leading-tight truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {right}
          {showTheme && (
            <button
              onClick={toggleDarkMode}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-11 h-11 rounded-full flex items-center justify-center text-text-primary active:bg-surface-2 transition"
            >
              {dark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
