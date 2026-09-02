import { useEffect, useRef, useState } from 'react'
import { cx } from './ui.jsx'
import { CloseIcon } from './Icons.jsx'

export default function BottomSheet({ open, onClose, title, children, maxHeight = '88vh' }) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef(null)
  const lastChildren = useRef(children)
  const lastTitle = useRef(title)
  if (open) {
    lastChildren.current = children
    lastTitle.current = title
  }

  useEffect(() => {
    clearTimeout(closeTimer.current)
    if (open) {
      setMounted(true)
      setClosing(false)
    } else if (mounted) {
      setClosing(true)
      closeTimer.current = setTimeout(() => setMounted(false), 200)
    }
    return () => clearTimeout(closeTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mounted, onClose])

  if (!mounted) return null

  const shownTitle = open ? title : lastTitle.current
  const shownChildren = open ? children : lastChildren.current

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        onClick={() => onClose?.()}
        className={cx(
          'absolute inset-0 bg-black/40 transition-opacity duration-200',
          closing ? 'opacity-0' : 'opacity-100'
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={shownTitle}
        className={cx(
          'relative bg-surface border-t border-x border-border rounded-t-[20px] w-full mx-auto max-w-[460px]',
          closing ? 'animate-slide-down' : 'animate-slide-up'
        )}
        style={{ maxHeight }}
      >
        <div className="pt-2 flex justify-center">
          <span className="block w-9 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border">
          <h2 className="text-[16px] font-semibold text-text-primary">{shownTitle}</h2>
          <button
            onClick={() => onClose?.()}
            aria-label="Close"
            className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-text-secondary active:bg-surface-2"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div
          className="overflow-y-auto overscroll-contain px-4 py-4"
          style={{ maxHeight: `calc(${maxHeight} - 64px)` }}
        >
          {shownChildren}
          <div style={{ height: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>
    </div>
  )
}
