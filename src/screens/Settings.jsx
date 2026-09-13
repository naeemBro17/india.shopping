import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, DEFAULT_STORES } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'
import TopBar from '../components/TopBar.jsx'
import { Card, Switch, Button, cx } from '../components/ui.jsx'
import { TrashIcon, ReceiptIcon, ChevronRight } from '../components/Icons.jsx'

const APP_VERSION = '1.0.0'

const ACCENT_THEMES = [
  { key: 'blue', label: 'Blue', color: '#3b82f6' },
  { key: 'violet', label: 'Violet', color: '#8b5cf6' },
  { key: 'orange', label: 'Orange', color: '#f97316' },
]

export default function Settings() {
  const navigate = useNavigate()
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const toggleDarkMode = useStore((s) => s.toggleDarkMode)
  const toggleMute = useStore((s) => s.toggleMute)
  const setAccentTheme = useStore((s) => s.setAccentTheme)
  const clearAllData = useStore((s) => s.clearAllData)
  const toast = useToast((s) => s.toast)
  const online = useOnlineStatus()

  const [budget, setBudget] = useState(
    settings.total_budget ? String(settings.total_budget) : ''
  )
  const [confirm, setConfirm] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const fileInputRef = useRef(null)

  function exportData() {
    const state = useStore.getState()
    const data = {
      products: state.products,
      stores: state.stores,
      settings: state.settings,
      currency: state.currency,
      travel_expenses: state.travel_expenses,
      travel_settings: state.travel_settings,
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `shopping-mission-backup-${date}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('Backup downloaded', { tone: 'success' })
  }

  function pickFile() {
    fileInputRef.current?.click()
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        setPendingImport(data)
      } catch {
        toast("That file couldn't be read — is it a valid backup?")
      }
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!pendingImport) return
    useStore.setState((s) => ({
      products: Array.isArray(pendingImport.products) ? pendingImport.products : s.products,
      stores: Array.isArray(pendingImport.stores) ? pendingImport.stores : DEFAULT_STORES,
      settings: pendingImport.settings
        ? { ...s.settings, ...pendingImport.settings }
        : s.settings,
      currency: pendingImport.currency
        ? { ...s.currency, ...pendingImport.currency }
        : s.currency,
      travel_expenses: Array.isArray(pendingImport.travel_expenses)
        ? pendingImport.travel_expenses
        : s.travel_expenses,
      travel_settings: pendingImport.travel_settings
        ? { ...s.travel_settings, ...pendingImport.travel_settings }
        : s.travel_settings,
    }))
    setPendingImport(null)
    toast('Data restored', { tone: 'success' })
    setTimeout(() => window.location.reload(), 700)
  }

  return (
    <div>
      <TopBar title="Settings" />

      <div className="px-4 pt-4 pb-6 space-y-4">
        <Card className="divide-y divide-border overflow-hidden">
          <Row label="Dark mode" hint="Also switchable from any screen's top bar">
            <Switch checked={settings.dark_mode} onChange={toggleDarkMode} label="Dark mode" />
          </Row>

          <Row
            label="Sound effects"
            hint="The short tick when you mark an item bought"
          >
            <Switch
              checked={!settings.muted}
              onChange={toggleMute}
              label="Sound effects"
            />
          </Row>

          <div className="px-4 py-3.5">
            <p className="text-[15px] font-medium">Total budget (₹)</p>
            <p className="text-[12.5px] text-text-secondary mt-0.5 mb-2.5">
              A ceiling for the whole trip
            </p>
            <input
              type="number"
              inputMode="decimal"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onBlur={() => {
                updateSettings({ total_budget: Number(budget) || 0 })
                toast('Budget saved', { tone: 'success' })
              }}
              placeholder="e.g. 50000"
              className="w-full min-h-[44px] px-3 rounded-[10px] bg-surface-2 border border-border text-[15px] outline-none focus:border-accent"
            />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <button
            onClick={() => navigate('/receipt')}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-surface-2 transition"
          >
            <span className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary shrink-0">
              <ReceiptIcon size={18} />
            </span>
            <span className="flex-1 text-left">
              <p className="text-[15px] font-medium">Shopping receipt</p>
              <p className="text-[12.5px] text-text-secondary mt-0.5">
                See and download what you've bought
              </p>
            </span>
            <ChevronRight size={18} className="text-text-secondary shrink-0" />
          </button>
        </Card>

        <Card className="p-4">
          <p className="text-[15px] font-medium">Accent theme</p>
          <p className="text-[12.5px] text-text-secondary mt-0.5 mb-3">
            Applies instantly across the whole app
          </p>
          <div className="flex gap-2">
            {ACCENT_THEMES.map((t) => {
              const active = (settings.accent_theme || 'blue') === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setAccentTheme(t.key)}
                  aria-label={t.label}
                  aria-pressed={active}
                  className={cx(
                    'flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-[10px] border transition',
                    active ? 'border-accent bg-surface-2' : 'border-transparent'
                  )}
                >
                  <span
                    className="w-8 h-8 rounded-full"
                    style={{
                      backgroundColor: t.color,
                      boxShadow: active
                        ? `0 0 0 2px var(--surface-2), 0 0 0 4px ${t.color}`
                        : 'none',
                    }}
                  />
                  <span className="text-[12px] font-medium text-text-secondary">
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div>
            <p className="text-[15px] font-medium">Backup &amp; Restore</p>
            <p className="text-[12.5px] text-text-secondary mt-0.5">
              All data lives only on this device — export a copy as a safety net.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={exportData}>
              Export Data
            </Button>
            <Button variant="secondary" className="flex-1" onClick={pickFile}>
              Import Data
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFile}
          />
          {pendingImport && (
            <div className="p-3 rounded-[10px] border border-border bg-surface-2 animate-fade-in">
              <p className="text-[13.5px] font-medium">
                This will replace all current data. Continue?
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setPendingImport(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={confirmImport}>
                  Replace data
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3.5">
            <p className="text-[15px] font-medium text-accent-warm">Clear all data</p>
            <p className="text-[12.5px] text-text-secondary mt-0.5">
              Removes every product, resets stores to defaults, and wipes settings,
              saved rates, and travel expenses. This cannot be undone.
            </p>
            <button
              onClick={() => {
                if (confirm) {
                  clearAllData()
                  setConfirm(false)
                  toast('All data cleared')
                } else {
                  setConfirm(true)
                  setTimeout(() => setConfirm(false), 4000)
                }
              }}
              className={cx(
                'mt-3 w-full min-h-[44px] rounded-[10px] text-[14px] font-medium border transition flex items-center justify-center gap-2',
                confirm ? 'tint-warm' : 'border-border text-text-secondary active:bg-surface-2'
              )}
            >
              <TrashIcon size={16} />
              {confirm ? 'Tap again to erase everything' : 'Clear all data'}
            </button>
          </div>
        </Card>

        <div className="px-1 text-[12.5px] text-text-secondary space-y-1">
          <p>India Shopping Mission · v{APP_VERSION}</p>
          <p>All data lives on this device only — no account, no server.</p>
          <p>{online ? 'Online' : 'Offline'} · installable to your home screen</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, hint, children }) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-[15px] font-medium">{label}</p>
        {hint && <p className="text-[12.5px] text-text-secondary mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  )
}
