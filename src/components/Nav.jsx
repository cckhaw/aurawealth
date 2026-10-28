import { LayoutDashboard, Landmark, ArrowLeftRight, LineChart, Settings, Sparkles, Sun, Moon } from 'lucide-react'
import { cx } from './ui'

export const TABS = [
  { id: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { id: 'networth', label: 'Net Worth & Assets', short: 'Net Worth', icon: Landmark },
  { id: 'cashflow', label: 'Cash Flow & Expenses', short: 'Cash Flow', icon: ArrowLeftRight },
  { id: 'projections', label: 'Wealth Projections', short: 'Projections', icon: LineChart },
  { id: 'settings', label: 'Settings', short: 'Settings', icon: Settings },
]

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(88,86,214,0.35)]" style={{ background: 'linear-gradient(135deg,#007AFF,#5856D6)' }}>
        <Sparkles size={20} />
      </div>
      <div className="leading-tight">
        <p className="text-[17px] font-bold tracking-tight t-label">Aura Wealth</p>
        <p className="text-[12px] t-label-2">Net worth, in focus</p>
      </div>
    </div>
  )
}

export function Sidebar({ tab, onTab, dark, onToggleDark }) {
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[280px] p-4 z-30">
      <div className="glass w-full flex flex-col p-4">
        <div className="px-2 pt-2 pb-6"><Logo /></div>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex items-center gap-3 min-h-[48px] px-3.5 rounded-[14px] text-[14.5px] whitespace-nowrap font-medium text-left transition-all duration-300 ease-apple',
                  active ? 'bg-apple-blue text-white shadow-[0_6px_16px_rgba(0,122,255,0.3)]' : 't-label-2 hover:bg-fill',
                )}
              >
                <t.icon size={20} strokeWidth={active ? 2.25 : 1.9} />
                {t.label}
              </button>
            )
          })}
        </nav>
        <button
          onClick={onToggleDark}
          className="mt-auto flex items-center justify-between min-h-[48px] px-3.5 rounded-[14px] bg-fill t-label text-[15px] font-medium transition-all duration-300 ease-apple active:scale-[0.98]"
          aria-label="Toggle dark mode"
        >
          <span className="flex items-center gap-3">{dark ? <Moon size={19} /> : <Sun size={19} />}{dark ? 'Dark' : 'Light'} mode</span>
          <span className={cx('w-11 h-[26px] rounded-full p-[2px] transition-colors duration-300', dark ? 'bg-apple-green' : 'bg-fill-strong')}>
            <span className={cx('block w-[22px] h-[22px] rounded-full bg-white shadow transition-transform duration-300 ease-apple', dark && 'translate-x-[18px]')} />
          </span>
        </button>
      </div>
    </aside>
  )
}

export function MobileHeader({ dark, onToggleDark }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-[var(--bg)]/80 backdrop-blur-xl border-b hairline">
      <Logo />
      <button onClick={onToggleDark} aria-label="Toggle dark mode" className="w-11 h-11 rounded-full bg-fill flex items-center justify-center t-label active:scale-90 transition-all duration-300 ease-apple">
        {dark ? <Moon size={19} /> : <Sun size={19} />}
      </button>
    </header>
  )
}

export function BottomBar({ tab, onTab }) {
  return (
    <nav aria-label="Main" className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass !rounded-none !border-x-0 !border-b-0 safe-bottom">
      <div className="grid grid-cols-5 px-1 pt-1.5 pb-1">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={cx('flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-[14px] transition-all duration-300 ease-apple active:scale-90', active ? 'text-apple-blue' : 't-label-3')}
            >
              <t.icon size={23} strokeWidth={active ? 2.4 : 1.9} />
              <span className="text-[10.5px] font-semibold tracking-tight">{t.short}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
