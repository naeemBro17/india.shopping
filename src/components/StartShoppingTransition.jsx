import { useEffect, useRef } from 'react'
import { startShoppingFeedback } from '../lib/feedback.js'

const NORMAL_MS = 1700
const REDUCED_MS = 800

/**
 * The full-screen "Shopping mode on" moment — plays once when Start
 * Shopping is tapped, then hands off to the store selector underneath.
 * Tap anywhere to skip. Premium and calm: one pop-in, one accent glow,
 * no confetti.
 */
export default function StartShoppingTransition({ itemCount, storeCount, onDone }) {
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    startShoppingFeedback()
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(() => doneRef.current?.(), reduced ? REDUCED_MS : NORMAL_MS)
    return () => clearTimeout(timer)
  }, [])

  const statsLine =
    storeCount > 0
      ? `${itemCount} item${itemCount === 1 ? '' : 's'} · ${storeCount} store${storeCount === 1 ? '' : 's'}`
      : `${itemCount} item${itemCount === 1 ? '' : 's'}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: 'var(--bg)' }}
      onClick={() => onDone?.()}
      role="button"
      aria-label="Skip transition"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%)',
        }}
      />
      <div className="relative flex flex-col items-center px-8 animate-scale-pop">
        <p className="text-[26px] font-bold text-text-primary tracking-tight">
          Shopping mode on
        </p>
        <p className="text-[14.5px] text-text-secondary mt-2">{statsLine}</p>
      </div>
    </div>
  )
}
