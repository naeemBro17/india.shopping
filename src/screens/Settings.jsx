import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useToast } from '../hooks/useToast.js'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'
import TopBar from '../components/TopBar.jsx'
import { Card, Switch, Pill, cx } from '../components/ui.jsx'
import { TrashIcon } from '../components/Icons.jsx'

const APP_VERSION = '1.0.0'

export default function Settings() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const toggleDarkMode = useStore((s) => s.toggleDarkMode)
  const setTripMode = useStore((s) => s.setTripMode)
  const clearAllData = useStore((s) => s.clearAllData)
  const toast = useToast((s) => s.toast)
  const online = useOnlineStatus()

  const [budget, setBudget] = useState(
    settings.total_budget ? String(settings.total_budget) : ''
  )
  const [confirm, setConfirm] = useState(false)

  return (
    <div>
      <TopBar title="Settings" />

      <div className="px-4 pt-4 pb-6 space-y-4">
        <Card className="divide-y divide-border overflow-hidden">
          <Row label="Dark mode" hint="Also switchable from any screen's top bar">
            <Switch checked={settings.dark_mode} onChange={toggleDarkMode} label="Dark mode" />
          </Row>

          <div className="px-4 py-3.5">
            <p className="text-[15px] font-medium">Trip mode</p>
            <p className="text-[12.5px] text-text-secondary mt-0.5 mb-2.5">
              Preparation for planning, Shopping to run the checklist
            </p>
            <div className="flex gap-2">
              <Pill
                active={settings.trip_mode === 'preparation'}
                onClick={() => setTripMode('preparation')}
                className="flex-1"
              >
                Preparation
              </Pill>
              <Pill
                active={settings.trip_mode === 'shopping'}
                onClick={() => setTripMode('shopping')}
                className="flex-1"
              >
                Shopping
              </Pill>
            </div>
          </div>

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
          <div className="px-4 py-3.5">
            <p className="text-[15px] font-medium text-accent-warm">Clear all data</p>
            <p className="text-[12.5px] text-text-secondary mt-0.5">
              Removes every product, resets stores to defaults, and wipes settings and
              saved rates. This cannot be undone.
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
