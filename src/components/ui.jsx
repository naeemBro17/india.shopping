import { forwardRef } from 'react'

export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

/* ---------- Button ---------- */
export const Button = forwardRef(function Button(
  { variant = 'primary', className, type = 'button', ...rest },
  ref
) {
  const variants = {
    primary:
      'bg-accent text-white border border-transparent active:opacity-90',
    secondary:
      'bg-surface text-text-primary border border-border active:bg-surface-2',
    ghost:
      'bg-transparent text-text-secondary border border-transparent active:bg-surface-2',
    danger:
      'bg-transparent text-[var(--accent-warm)] border border-[color:color-mix(in_srgb,var(--accent-warm)_35%,transparent)] active:bg-surface-2',
    success:
      'bg-success text-white border border-transparent active:opacity-90',
  }
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'min-h-[44px] px-4 rounded-[10px] text-[15px] font-medium transition inline-flex items-center justify-center gap-2 select-none disabled:opacity-40',
        variants[variant],
        className
      )}
      {...rest}
    />
  )
})

/* ---------- Card ---------- */
export function Card({ as: As = 'div', className, ...rest }) {
  return (
    <As
      className={cx(
        'bg-surface border border-border rounded-card',
        className
      )}
      {...rest}
    />
  )
}

/* ---------- Pill (toggle option) ---------- */
export function Pill({ active, className, ...rest }) {
  return (
    <button
      type="button"
      className={cx(
        'min-h-[40px] px-4 rounded-full text-[14px] font-medium border transition whitespace-nowrap',
        active
          ? 'bg-text-primary text-[var(--bg)] border-transparent'
          : 'bg-surface text-text-secondary border-border active:bg-surface-2',
        className
      )}
      {...rest}
    />
  )
}

/* ---------- Badge ---------- */
export function Badge({ tone = 'neutral', className, children }) {
  const tones = {
    neutral: 'bg-surface-2 text-text-secondary border-border',
    accent: 'tint-accent',
    warm: 'tint-warm',
    success: 'tint-success',
    warning: 'tint-warning',
  }
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[12px] font-medium border leading-none',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

/* ---------- Field ---------- */
export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-[13px] font-medium text-text-secondary mb-1.5">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="block text-[12px] text-text-secondary mt-1">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full min-h-[44px] px-3 rounded-[10px] bg-surface-2 border border-border text-[15px] text-text-primary placeholder:text-text-secondary/70 outline-none focus:border-accent transition'

export function TextInput({ className, ...rest }) {
  return <input className={cx(inputCls, className)} {...rest} />
}

export function TextArea({ className, ...rest }) {
  return (
    <textarea
      className={cx(inputCls, 'py-2.5 min-h-[64px] resize-none', className)}
      {...rest}
    />
  )
}

/* ---------- Toggle switch ---------- */
export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'w-[52px] h-[32px] rounded-full border transition flex items-center px-[3px] shrink-0',
        checked ? 'bg-accent border-transparent' : 'bg-surface-2 border-border'
      )}
    >
      <span
        className={cx(
          'w-[24px] h-[24px] rounded-full bg-white transition-transform',
          checked ? 'translate-x-[20px]' : 'translate-x-0'
        )}
      />
    </button>
  )
}

/* ---------- Progress bar ---------- */
export function ProgressBar({ value, total, tone = 'accent' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const bar =
    tone === 'success'
      ? 'bg-success'
      : pct === 100
      ? 'bg-success'
      : 'bg-accent'
  return (
    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
      <div
        className={cx('h-full rounded-full transition-all duration-300', bar)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-14">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-secondary mb-3">
          <Icon size={22} />
        </div>
      )}
      <p className="text-[15px] font-medium text-text-primary">{title}</p>
      {hint && <p className="text-[13px] text-text-secondary mt-1 max-w-[240px]">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }) {
  return <div className={cx('skeleton animate-shimmer rounded-[8px]', className)} />
}

export function formatINR(n) {
  const v = Number(n) || 0
  return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}
