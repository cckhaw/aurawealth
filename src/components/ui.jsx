import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export const cx = (...a) => a.filter(Boolean).join(' ')

export function Card({ className, hover, children, ...p }) {
  return (
    <div className={cx('glass', hover && 'glass-hover', className)} {...p}>
      {children}
    </div>
  )
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h2 className="text-[19px] font-semibold tracking-tight t-label">{title}</h2>
        {subtitle && <p className="text-[13px] t-label-2 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

const BTN = {
  primary: 'bg-apple-blue text-white hover:brightness-110 shadow-[0_6px_16px_rgba(0,122,255,0.3)]',
  secondary: 'bg-fill t-label hover:bg-fill-strong',
  danger: 'bg-apple-red/10 text-apple-red hover:bg-apple-red/20',
  ghost: 't-label-2 hover:bg-fill',
}

export function Button({ variant = 'primary', className, icon: Icon, children, ...p }) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-[14px] text-[15px] font-semibold',
        'transition-all duration-300 ease-apple active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
        BTN[variant], className,
      )}
      {...p}
    >
      {Icon && <Icon size={18} strokeWidth={2.25} />}
      {children}
    </button>
  )
}

export function IconButton({ label, icon: Icon, className, ...p }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx('inline-flex items-center justify-center w-11 h-11 rounded-full t-label-2 hover:bg-fill transition-all duration-300 ease-apple active:scale-90', className)}
      {...p}
    >
      <Icon size={20} />
    </button>
  )
}

export function Badge({ color = '#8E8E93', children, className }) {
  return (
    <span
      className={cx('inline-flex items-center rounded-full px-2.5 py-[3px] text-[12px] font-semibold whitespace-nowrap', className)}
      style={{ color, backgroundColor: `${color}1F` }}
    >
      {children}
    </span>
  )
}

export function Field({ label, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      <span className="block text-[13px] font-medium t-label-2 mb-1.5 px-1">{label}</span>
      {children}
      {hint && <span className="block text-[12px] t-label-3 mt-1 px-1">{hint}</span>}
    </label>
  )
}

export function Segmented({ options, value, onChange, className, small }) {
  return (
    <div role="tablist" className={cx('flex p-1 rounded-[14px] bg-fill gap-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'flex-1 rounded-[11px] font-semibold transition-all duration-300 ease-apple whitespace-nowrap',
              small ? 'min-h-[36px] px-3 text-[13px]' : 'min-h-[44px] px-3 text-[15px]',
              active ? 'bg-[var(--card-solid)] t-label shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : 't-label-2',
            )}
            style={active && o.color ? { color: o.color } : undefined}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Slider({ label, value, min, max, step = 1, onChange, format, accent = '#007AFF', hint }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between px-1">
        <span className="text-[14px] font-medium t-label">{label}</span>
        <span className="text-[17px] font-semibold num" style={{ color: accent }}>{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%`, '--accent': accent }}
      />
      {hint && <p className="text-[12px] t-label-3 px-1 -mt-1">{hint}</p>}
    </div>
  )
}

/** Bottom sheet on phones, centered dialog on larger screens. */
export function Modal({ open, onClose, title, children, footer }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm anim-fade" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-[480px] max-h-[92dvh] flex flex-col rounded-t-[28px] sm:rounded-[28px] bg-[var(--card-solid)] shadow-2xl anim-sheet outline-none border hairline"
      >
        <div className="sm:hidden mx-auto mt-2 h-1.5 w-10 rounded-full bg-fill-strong" />
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-5 pb-2">
          <h3 className="text-[20px] font-semibold tracking-tight t-label">{title}</h3>
          <IconButton label="Close" icon={X} onClick={onClose} className="bg-fill -mr-1" />
        </div>
        <div className="overflow-y-auto px-5 pb-4 flex-1">{children}</div>
        {footer && <div className="px-5 pt-3 pb-5 safe-bottom border-t hairline">{footer}</div>}
      </div>
    </div>
  )
}

export function ProgressBar({ value, max, color = '#007AFF', over = '#FF3B30' }) {
  const ratio = max > 0 ? value / max : 0
  const c = ratio > 1 ? over : ratio > 0.85 ? '#FF9500' : color
  return (
    <div className="h-2 rounded-full bg-fill overflow-hidden" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all duration-700 ease-apple" style={{ width: `${Math.min(100, ratio * 100)}%`, backgroundColor: c }} />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-14 h-14 rounded-full bg-fill flex items-center justify-center mb-3">
        <Icon size={26} className="t-label-2" />
      </div>
      <p className="font-semibold t-label">{title}</p>
      <p className="text-[14px] t-label-2 mt-1 max-w-xs">{text}</p>
    </div>
  )
}

export function ChartTooltip({ active, payload, label, fmt, labelFmt }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[14px] px-3.5 py-2.5 text-[13px] shadow-xl border hairline bg-[var(--card-solid)]">
      <p className="font-semibold t-label mb-1">{labelFmt ? labelFmt(label, payload) : label}</p>
      {payload.filter((p) => p.value != null && p.name).map((p) => (
        <p key={p.dataKey ?? p.name} className="flex items-center gap-2 t-label-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-4 font-semibold t-label num">{fmt ? fmt(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  )
}
