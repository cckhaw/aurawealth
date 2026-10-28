import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Receipt, Search, X } from 'lucide-react'
import { Badge, Button, Card, EmptyState, IconButton, ProgressBar, SectionTitle, Segmented } from '../components/ui'
import { useStore } from '../lib/store'
import { useFmt } from '../lib/useFmt'
import { CATEGORIES, CATEGORY_COLORS, TX_TYPES } from '../lib/constants'
import { monthlyExpenseByCategory } from '../lib/calc'
import { addDays, fmtDate, iso, monthKey, monthLabel, parseISO, shiftMonth } from '../lib/format'

const RANGES = [
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range…' },
]

function rangeBounds(range, custom) {
  const now = new Date()
  const today = iso(now)
  switch (range) {
    case '30d': return [iso(addDays(now, -29)), today]
    case '90d': return [iso(addDays(now, -89)), today]
    case 'month': return [iso(new Date(now.getFullYear(), now.getMonth(), 1)), today]
    case 'ytd': return [`${now.getFullYear()}-01-01`, today]
    case 'custom': return [custom.from || '0000-01-01', custom.to || '9999-12-31']
    default: return ['0000-01-01', '9999-12-31']
  }
}

const ALL_CATS = [...CATEGORIES.income, ...CATEGORIES.expense, ...CATEGORIES.investment]

export default function CashFlow({ onEdit, onAdd }) {
  const { state } = useStore()
  const f = useFmt()
  const { transactions, settings } = state

  const [range, setRange] = useState('30d')
  const [custom, setCustom] = useState({ from: '', to: '' })
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(25)
  const [month, setMonth] = useState(() => monthKey(iso(new Date())))

  const [from, to] = rangeBounds(range, custom)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions
      .filter((t) => t.date >= from && t.date <= to)
      .filter((t) => type === 'all' || t.type === type)
      .filter((t) => category === 'all' || t.category === category)
      .filter((t) => !q || `${t.note} ${t.category}`.toLowerCase().includes(q))
      .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
  }, [transactions, from, to, type, category, query])

  const sum = (ty) => filtered.reduce((s, t) => (t.type === ty ? s + t.amount : s), 0)
  const income = sum('income'), expense = sum('expense'), invested = sum('investment')

  const grouped = useMemo(() => {
    const g = []
    for (const t of filtered.slice(0, limit)) {
      const last = g[g.length - 1]
      if (last && last.date === t.date) last.items.push(t)
      else g.push({ date: t.date, items: [t] })
    }
    return g
  }, [filtered, limit])

  const spent = useMemo(() => monthlyExpenseByCategory(transactions, month), [transactions, month])
  const budgetRows = useMemo(() => {
    const cats = new Set([...Object.keys(settings.budgets), ...Object.keys(spent)])
    return [...cats]
      .map((c) => ({ c, spent: spent[c] || 0, budget: settings.budgets[c] || 0 }))
      .filter((r) => r.spent > 0 || r.budget > 0)
      .sort((a, b) => b.spent - a.spent)
  }, [spent, settings.budgets])
  const totalSpent = budgetRows.reduce((s, r) => s + r.spent, 0)
  const totalBudget = budgetRows.reduce((s, r) => s + r.budget, 0)
  const thisMonth = monthKey(iso(new Date()))

  const filtersActive = type !== 'all' || category !== 'all' || query || range !== '30d'
  const reset = () => { setType('all'); setCategory('all'); setQuery(''); setRange('30d'); setLimit(25) }
  const changed = (fn) => (v) => { fn(v); setLimit(25) }

  return (
    <div className="space-y-6 anim-view">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight t-label">Cash Flow</h1>
          <p className="t-label-2 text-[15px]">Transactions, budgets and spending categories</p>
        </div>
        <Button icon={Plus} onClick={() => onAdd()} className="hidden sm:inline-flex">Add Transaction</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          ['Income', income, TX_TYPES.income.color],
          ['Expenses', expense, TX_TYPES.expense.color],
          ['Invested', invested, TX_TYPES.investment.color],
          ['Net (income − expenses)', income - expense, income - expense >= 0 ? '#30D158' : '#FF3B30'],
        ].map(([l, v, c]) => (
          <Card key={l} hover className="p-4 sm:p-5 min-w-0">
            <p className="text-[13px] font-medium t-label-2 truncate">{l}</p>
            <p className="text-[24px] sm:text-[28px] font-bold num truncate mt-1" style={{ color: c }}>{f.m(v)}</p>
            <p className="text-[12px] t-label-3">in selected range</p>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-5 gap-4 items-start">
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <SectionTitle title="Budget Breakdown" subtitle="Monthly spending vs. thresholds" />
          <div className="flex items-center justify-between bg-fill rounded-[14px] p-1 mb-4">
            <IconButton label="Previous month" icon={ChevronLeft} onClick={() => setMonth(shiftMonth(month, -1))} />
            <span className="font-semibold t-label text-[15px]">{monthLabel(month)}</span>
            <IconButton label="Next month" icon={ChevronRight} onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= thisMonth} className="disabled:opacity-30" />
          </div>

          <div className="mb-5">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[24px] font-bold num t-label">{f.m(totalSpent)}</span>
              <span className="text-[13px] t-label-2 num">of {f.m(totalBudget)} budget</span>
            </div>
            <ProgressBar value={totalSpent} max={totalBudget} />
          </div>

          {budgetRows.length === 0 ? (
            <EmptyState icon={Receipt} title="No spending this month" text="Expenses you log will appear here against your budgets." />
          ) : (
            <ul className="space-y-4">
              {budgetRows.map((r) => {
                const over = r.budget > 0 && r.spent > r.budget
                return (
                  <li key={r.c}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[r.c] || '#8E8E93' }} />
                      <span className="text-[14px] font-medium t-label flex-1">{r.c}</span>
                      <span className={`text-[13px] num font-semibold ${over ? 'text-apple-red' : 't-label'}`}>{f.m(r.spent)}</span>
                      <span className="text-[13px] num t-label-3">/ {r.budget ? f.m(r.budget) : 'no budget'}</span>
                    </div>
                    <ProgressBar value={r.spent} max={r.budget || r.spent || 1} color={CATEGORY_COLORS[r.c]} />
                    {over && <p className="text-[12px] text-apple-red mt-1">Over by {f.m(r.spent - r.budget)}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-3">
          <SectionTitle
            title="Transaction Ledger"
            subtitle={`${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`}
            action={filtersActive && <Button variant="ghost" icon={X} className="!min-h-[44px] !px-3 text-apple-blue" onClick={reset}>Clear</Button>}
          />

          <div className="space-y-3 mb-4">
            <Segmented
              small
              value={type}
              onChange={changed(setType)}
              options={[{ value: 'all', label: 'All' }, ...Object.entries(TX_TYPES).map(([value, t]) => ({ value, label: t.label, color: t.color }))]}
            />
            <div className="grid grid-cols-2 gap-3">
              <select className="field" aria-label="Date range" value={range} onChange={(e) => changed(setRange)(e.target.value)}>
                {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <select className="field" aria-label="Category" value={category} onChange={(e) => changed(setCategory)(e.target.value)}>
                <option value="all">All categories</option>
                {ALL_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {range === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="field" aria-label="From date" value={custom.from} max={custom.to || undefined} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
                <input type="date" className="field" aria-label="To date" value={custom.to} min={custom.from || undefined} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
              </div>
            )}
            <div className="relative">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 t-label-3" />
              <input className="field !pl-11" placeholder="Search notes…" aria-label="Search transactions" value={query} onChange={(e) => changed(setQuery)(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Receipt} title="No transactions match" text="Try widening the date range or clearing filters." />
          ) : (
            <div>
              {grouped.map((g) => (
                <div key={g.date} className="mb-2">
                  <p className="text-[12px] font-semibold uppercase tracking-wider t-label-2 py-2">
                    {fmtDate(g.date, { weekday: 'long', month: 'short', day: 'numeric', year: parseISO(g.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })}
                  </p>
                  <ul className="divide-y hairline">
                    {g.items.map((t) => {
                      const color = CATEGORY_COLORS[t.category] || '#8E8E93'
                      return (
                        <li key={t.id}>
                          <button onClick={() => onEdit(t)} className="w-full flex items-center gap-3 min-h-[60px] py-2.5 px-2 -mx-2 rounded-[14px] text-left hover:bg-fill transition-all duration-300 ease-apple">
                            <span className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-[14px]" style={{ background: `${color}22`, color }}>{t.category[0]}</span>
                            <span className="flex-1 min-w-0">
                              <span className="block font-medium t-label truncate">{t.note || t.category}</span>
                              <Badge color={color} className="mt-0.5">{t.category}</Badge>
                            </span>
                            <span className="text-right">
                              <span className="block font-semibold num" style={{ color: t.type === 'income' ? TX_TYPES.income.color : t.type === 'investment' ? TX_TYPES.investment.color : 'var(--label)' }}>
                                {t.type === 'income' ? '+' : t.type === 'expense' ? '−' : ''}{f.exact(t.amount)}
                              </span>
                              <span className="block text-[11px] t-label-3 capitalize">{t.type}</span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
              {filtered.length > limit && (
                <Button variant="secondary" className="w-full mt-3" onClick={() => setLimit(limit + 25)}>
                  Show more ({filtered.length - limit} remaining)
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Thumb-first floating action button (phones) */}
      <button
        onClick={() => onAdd()}
        aria-label="Quick add transaction"
        className="sm:hidden fixed right-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-30 w-14 h-14 rounded-full bg-apple-blue text-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,122,255,0.45)] active:scale-90 transition-all duration-300 ease-apple"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  )
}
