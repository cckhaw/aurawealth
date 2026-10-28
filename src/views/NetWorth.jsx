import { useMemo } from 'react'
import { Plus, Pencil, Wallet, TrendingUp, Home, Gem, Landmark, CreditCard, PartyPopper, Circle } from 'lucide-react'

const ICONS = { Wallet, TrendingUp, Home, Gem, Landmark, CreditCard }
import { Button, Card, EmptyState, SectionTitle } from '../components/ui'
import { useStore } from '../lib/store'
import { useFmt } from '../lib/useFmt'
import { ASSET_CLASSES, LIABILITY_CLASSES } from '../lib/constants'
import { totals } from '../lib/calc'
import { fmtDate, pct } from '../lib/format'

function HoldingRow({ h, meta, onEdit, f }) {
  const Icon = ICONS[meta.icon] || Circle
  const asset = h.kind === 'asset'
  return (
    <button
      onClick={() => onEdit(h)}
      aria-label={`Edit ${h.name}`}
      className="group w-full flex items-center gap-3 py-3 min-h-[60px] px-2 -mx-2 rounded-[14px] text-left hover:bg-fill transition-all duration-300 ease-apple"
    >
      <span className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center" style={{ background: `${meta.color}1F`, color: meta.color }}>
        <Icon size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium t-label truncate">{h.name}</span>
        <span className="block text-[12px] t-label-2 truncate">
          Since {fmtDate(h.acquired, { month: 'short', year: 'numeric' })} · {asset ? 'grows' : 'pays down'} {Math.abs(h.growth).toFixed(1)}%/yr
        </span>
      </span>
      <span className="font-semibold num t-label">{f.m(h.value)}</span>
      <Pencil size={14} className="t-label-3 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
    </button>
  )
}

function Group({ title, color, classes, items, total, onEdit, f }) {
  return (
    <div>
      {Object.entries(classes).map(([k, meta]) => {
        const rows = items.filter((h) => h.class === k)
        if (!rows.length) return null
        const sub = rows.reduce((s, h) => s + h.value, 0)
        return (
          <div key={k} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between px-0.5 mb-1">
              <span className="text-[12px] font-semibold uppercase tracking-wider t-label-2">{meta.label}</span>
              <span className="text-[12px] font-semibold num t-label-2">{f.m(sub)} · {pct(total ? (sub / total) * 100 : 0, 0)}</span>
            </div>
            <div className="divide-y hairline">
              {rows.map((h) => <HoldingRow key={h.id} h={h} meta={meta} onEdit={onEdit} f={f} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function NetWorth({ onEdit, onAdd }) {
  const { state } = useStore()
  const f = useFmt()
  const t = useMemo(() => totals(state.holdings), [state.holdings])
  const assets = state.holdings.filter((h) => h.kind === 'asset')
  const liabs = state.holdings.filter((h) => h.kind === 'liability')
  const debtRatio = t.assets ? (t.liabilities / t.assets) * 100 : 0
  const ratioColor = debtRatio < 30 ? '#30D158' : debtRatio < 50 ? '#FF9500' : '#FF3B30'

  return (
    <div className="space-y-6 anim-view">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight t-label">Net Worth</h1>
          <p className="t-label-2 text-[15px]">Your balance sheet · tap any item to edit</p>
        </div>
        <Button icon={Plus} onClick={() => onAdd('asset')}>Add Item</Button>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-10">
          <div>
            <p className="text-[13px] font-medium t-label-2">Total Net Worth</p>
            <p className="text-[40px] sm:text-[48px] font-bold num t-label leading-tight">{f.m(t.netWorth)}</p>
          </div>
          <div className="flex gap-8 sm:gap-10 flex-wrap">
            <div><p className="text-[13px] t-label-2">Assets</p><p className="text-[22px] font-semibold num text-apple-green">{f.m(t.assets)}</p></div>
            <div><p className="text-[13px] t-label-2">Liabilities</p><p className="text-[22px] font-semibold num text-apple-red">{f.m(t.liabilities)}</p></div>
            <div><p className="text-[13px] t-label-2">Debt-to-assets</p><p className="text-[22px] font-semibold num" style={{ color: ratioColor }}>{pct(debtRatio)}</p></div>
          </div>
        </div>
        {t.assets > 0 && (
          <div className="mt-5 flex h-3 rounded-full overflow-hidden bg-fill gap-0.5" role="img" aria-label="Asset class composition">
            {Object.entries(ASSET_CLASSES).map(([k, c]) => (
              <div key={k} title={`${c.label} ${f.m(t.byClass[k])}`} className="h-full transition-all duration-700 ease-apple" style={{ width: `${((t.byClass[k] || 0) / t.assets) * 100}%`, background: c.color }} />
            ))}
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card className="p-5 sm:p-6">
          <SectionTitle
            title="Assets"
            subtitle={f.m(t.assets)}
            action={<Button variant="secondary" icon={Plus} className="!px-4" onClick={() => onAdd('asset')}>Asset</Button>}
          />
          {assets.length ? <Group classes={ASSET_CLASSES} items={assets} total={t.assets} onEdit={onEdit} f={f} /> : <EmptyState icon={Wallet} title="No assets yet" text="Add cash, investments, property or alternatives." />}
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionTitle
            title="Liabilities"
            subtitle={f.m(t.liabilities)}
            action={<Button variant="secondary" icon={Plus} className="!px-4" onClick={() => onAdd('liability')}>Liability</Button>}
          />
          {liabs.length ? <Group classes={LIABILITY_CLASSES} items={liabs} total={t.liabilities} onEdit={onEdit} f={f} /> : <EmptyState icon={PartyPopper} title="Debt free" text="No liabilities recorded. Add a mortgage, loan or card if you have one." />}
        </Card>
      </div>
    </div>
  )
}
