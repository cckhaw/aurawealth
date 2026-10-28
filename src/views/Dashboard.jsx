import { useMemo } from 'react'
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, PiggyBank, Shield, Wallet, ArrowRight, Receipt, Sparkles, Plus } from 'lucide-react'
import { Badge, Button, Card, ChartTooltip, EmptyState, SectionTitle } from '../components/ui'
import Kpi from '../components/Kpi'
import { useStore } from '../lib/store'
import { useFmt } from '../lib/useFmt'
import { ASSET_CLASSES, CATEGORY_COLORS, TX_TYPES } from '../lib/constants'
import { cashMetrics, netWorthTrend, totals } from '../lib/calc'
import { addDays, fmtDate, iso, pct } from '../lib/format'

export default function Dashboard({ onTab, onAddTx, onAddHolding }) {
  const { state, dispatch } = useStore()
  const f = useFmt()
  const { holdings, transactions, settings } = state

  const t = useMemo(() => totals(holdings), [holdings])
  const cm = useMemo(() => cashMetrics(transactions, holdings), [transactions, holdings])
  const trend = useMemo(() => netWorthTrend(holdings), [holdings])
  const nwDelta = trend[trend.length - 1].value - trend[0].value
  const nwDeltaPct = trend[0].value ? (nwDelta / Math.abs(trend[0].value)) * 100 : 0

  const slices = Object.entries(ASSET_CLASSES)
    .map(([k, c]) => ({ key: k, name: c.label, color: c.color, value: t.byClass[k] || 0 }))
    .filter((s) => s.value > 0)

  const impactful = useMemo(() => {
    const from = iso(addDays(new Date(), -60))
    return transactions
      .filter((x) => x.date >= from)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [transactions])

  const cushionColor = cm.cushion >= 6 ? '#30D158' : cm.cushion >= 3 ? '#FF9500' : '#FF3B30'

  return (
    <div className="space-y-6 anim-view">
      <div>
        <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight t-label">Overview</h1>
        <p className="t-label-2 text-[15px]">Your financial position at a glance · trailing 30 days</p>
      </div>

      {holdings.length === 0 && transactions.length === 0 && (
        <Card className="p-6 sm:p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-white mb-4" style={{ background: 'linear-gradient(135deg,#007AFF,#5856D6)' }}><Sparkles size={26} /></div>
          <h2 className="text-[22px] font-bold tracking-tight t-label">Welcome to Aura Wealth</h2>
          <p className="t-label-2 mt-1 max-w-md mx-auto">Your dashboard is empty. Add your first asset to see your net worth, or load sample data to explore with a realistic portfolio.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
            <Button icon={Plus} onClick={() => onAddHolding('asset')}>Add your first asset</Button>
            <Button variant="secondary" icon={Sparkles} onClick={() => dispatch({ type: 'sample' })}>Load sample data</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Kpi
          label="Total Net Worth" value={f.m(t.netWorth)} compactValue={f.compact(t.netWorth)} icon={Wallet} color="#007AFF"
          delta={nwDelta} deltaLabel={`${nwDelta >= 0 ? '+' : ''}${pct(nwDeltaPct)}`} sub="12-mo modeled"
        />
        <Kpi
          label="Monthly Net Cash Flow" value={f.m(cm.net)} icon={Banknote} color="#30D158"
          delta={cm.net - cm.pNet} deltaLabel={f.compact(Math.abs(cm.net - cm.pNet))} sub="vs prior 30d"
        />
        <Kpi
          label="Savings Rate" value={pct(cm.savingsRate)} icon={PiggyBank} color="#5856D6"
          delta={cm.savingsRate - cm.pSavingsRate} deltaLabel={`${Math.abs(cm.savingsRate - cm.pSavingsRate).toFixed(1)} pts`} sub="of income"
        />
        <Kpi
          label="Liquid Cash Cushion" value={`${cm.cushion.toFixed(1)} mo`} icon={Shield} color={cushionColor}
          sub={`${f.compact(cm.cash)} ÷ ${f.compact(cm.burn)}/mo`}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <SectionTitle title="Asset Allocation" subtitle="Current mix by asset class" />
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="92%" paddingAngle={3} cornerRadius={8} stroke="none">
                  {slices.map((s) => <Cell key={s.key} fill={s.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip fmt={f.m} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[12px] t-label-2">Total assets</span>
              <span className="text-[22px] font-bold num t-label">{f.compact(t.assets)}</span>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {Object.entries(ASSET_CLASSES).map(([k, c]) => {
              const share = t.assets ? ((t.byClass[k] || 0) / t.assets) * 100 : 0
              const drift = share - (settings.target[k] ?? 0)
              return (
                <li key={k} className="flex items-center gap-3 text-[14px]">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="t-label flex-1 truncate">{c.label}</span>
                  <span className="font-semibold num t-label">{pct(share)}</span>
                  <span className={`w-[62px] text-right text-[12px] num font-medium ${Math.abs(drift) < 3 ? 't-label-3' : drift > 0 ? 'text-apple-orange' : 'text-apple-blue'}`} title="Drift from target allocation">
                    {drift >= 0 ? '+' : ''}{drift.toFixed(1)} pt
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="text-[12px] t-label-3 mt-3">Drift is measured against your target weights in Settings.</p>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-3">
          <SectionTitle
            title="Net Worth Trend"
            subtitle="Modeled from each holding’s growth assumption"
            action={<Badge color="#007AFF">12 months</Badge>}
          />
          <div className="h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--label-2)', fontSize: 12 }} interval="preserveStartEnd" minTickGap={20} />
                <YAxis hide domain={['dataMin - 20000', 'dataMax + 20000']} />
                <Tooltip content={<ChartTooltip fmt={f.m} labelFmt={(_, p) => p[0]?.payload.full} />} cursor={{ stroke: 'var(--grid)' }} />
                <Area type="monotone" dataKey="value" name="Net worth" stroke="#007AFF" strokeWidth={3} fill="url(#nw)" dot={false} activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[['Assets', t.assets, '#30D158'], ['Liabilities', t.liabilities, '#FF3B30'], ['Invested (30d)', cm.invested, '#5856D6']].map(([l, v, c]) => (
              <div key={l} className="rounded-[16px] bg-fill px-3 py-2.5">
                <p className="text-[12px] t-label-2">{l}</p>
                <p className="text-[16px] font-semibold num truncate" style={{ color: c }}>{f.compact(v)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionTitle
          title="Recent High-Impact Transactions"
          subtitle="Largest movements in the last 60 days"
          action={<Button variant="ghost" className="!min-h-[44px] !px-3 text-apple-blue" onClick={() => onTab('cashflow')}>View all <ArrowRight size={16} /></Button>}
        />
        {impactful.length === 0 ? (
          <EmptyState icon={Receipt} title="No recent activity" text="Add a transaction to see your largest cash movements here." />
        ) : (
          <ul className="divide-y hairline">
            {impactful.map((x) => (
              <li key={x.id}>
                <button onClick={() => onAddTx(x)} className="w-full flex items-center gap-3 sm:gap-4 py-3 min-h-[60px] text-left rounded-[14px] hover:bg-fill transition-all duration-300 ease-apple px-2 -mx-2">
                  <span className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-[15px] font-bold" style={{ background: `${CATEGORY_COLORS[x.category] || '#8E8E93'}22`, color: CATEGORY_COLORS[x.category] || '#8E8E93' }}>
                    {x.category[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium t-label truncate">{x.note || x.category}</span>
                    <span className="flex items-center gap-2 mt-0.5">
                      <Badge color={CATEGORY_COLORS[x.category] || '#8E8E93'}>{x.category}</Badge>
                      <span className="text-[12px] t-label-3">{fmtDate(x.date)}</span>
                    </span>
                  </span>
                  <span className="font-semibold num text-[16px]" style={{ color: x.type === 'income' ? TX_TYPES.income.color : 'var(--label)' }}>
                    {x.type === 'income' ? '+' : '−'}{f.m(x.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
