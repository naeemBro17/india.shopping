import { useToast } from '../hooks/useToast.js'
import { cx } from './ui.jsx'
import { CheckIcon } from './Icons.jsx'

export default function Toaster() {
  const toasts = useToast((s) => s.toasts)
  return (
    <div className="fixed left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none"
      style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            'animate-fade-in-up max-w-[360px] w-full flex items-center gap-2 px-3.5 py-2.5 rounded-[12px] border text-[14px] font-medium',
            'bg-surface border-border text-text-primary'
          )}
        >
          <span
            className={cx(
              'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
              t.tone === 'success' ? 'tint-success' : 'tint-accent'
            )}
          >
            <CheckIcon size={13} />
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
