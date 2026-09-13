import { PlusIcon } from './Icons.jsx'

/**
 * The floating "+" action button. Rendered per-screen (Home, Products,
 * Travel) rather than globally — each screen decides its own tap target,
 * and screens that have nothing meaningful for it to do simply don't
 * render it at all.
 *
 * Fixed bottom-right, sitting just above the bottom nav bar. Positioned
 * inside the same centered max-width column as the rest of the app (see
 * BottomNav) so it lines up correctly even on wide viewports.
 */
export default function FAB({ onClick, label = 'Add' }) {
  return (
    <div
      className="fixed inset-x-0 z-30 flex justify-center pointer-events-none"
      style={{ bottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)' }}
    >
      <div className="relative w-full max-w-[460px]">
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          className="pointer-events-auto absolute right-4 bottom-0 w-14 h-14 rounded-full bg-accent text-accent-text flex items-center justify-center transition-transform duration-150 active:scale-[0.94]"
          style={{
            boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 35%, transparent)',
          }}
        >
          <PlusIcon size={26} />
        </button>
      </div>
    </div>
  )
}
