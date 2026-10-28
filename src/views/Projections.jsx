import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Flame, Hourglass, PiggyBank, TrendingUp } from 'lucide-react'
import { Card, ChartTooltip, SectionTitle, Slider, Segmented } from '../components/ui'
import { useStore } from '../lib/store'
import { useFmt } from '../lib/useFmt'
import { project, totals } from '../lib/calc'
import { pct } from '../lib/format'

const SCENARIOS = [
  { key: 'cons', name: 'Conservative (−2%)', delta: -2, color: '#FF9500' },
  { key: 'base', name: 'Base case', delta: 0, color: '#007AFF' },
  { key: 'opt', name: 'Optimistic (+2%)', delta: 2, color: '#30D158' },
]

export default function Projections() {
  const { state, dispatch } = useStore()
  const f = useFmt()
  const p = state.settings.projection
  const set = (patch) => dispatch({ type: 'projection/patch', patch })

  const t = useMemo(() => totals(state.holdings), [state.holdings])
  // Investable = everything that is not the home (cash + stocks + alternatives).
  const investable = t.assets - (t.byClass.realEstate || 0)
  const start = p.useHoldings ? investable : p.startingBalance

  const endAge = Math.max(p.retireAge, p.currentAge)
  const base = { start, monthly: p.monthlySavings, inflation: p.inflation, currentAge: p.currentAge, endAge, shockPct: p.shockPct, shockYear: p.shockYear }

  const { data, main, noShock } = useMemo(() => {
    const runs = Object.fromEntries(SCENARIOS.map((s) => [s.key, project({ ...base, annualReturn: p.annualReturn + s.delta })]))
    const flat = project({ ...base, annualReturn: p.annualReturn, shockPct: 0 })
    const rows = runs.base.map((pt, i) => ({
      age: pt.age,
      Conservative: Math.round(runs.cons[i].balance),
      Base: Math.round(pt.balance),
      Optimistic: Math.round(runs.opt[i].balance),
      Real: Math.round(pt.real),
      Contributed: Math.round(pt.contributed),
    }))
    return { data: rows, main: runs.base, noShock: flat }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, p.monthlySavings, p.annualReturn, p.inflation, p.currentAge, endAge, p.shockPct, p.shockYear])

  const last = main[main.length - 1]
  const years = last.year
  const growth = last.balance - last.contributed
  const shockCost = noShock[noShock.length - 1].balance - last.balance
  const swr = last.real * 0.04
  const purchasingLoss = last.balance ? (1 - last.real / last.balance) * 100 : 0
  const shockAge = p.currentAge + Math.round(p.shockYear)
  const shockVisible = p.shockPct > 0 && Math.round(p.shockYear) <= years

  return (
    <div className="space-y-6 anim-view">
      <div>
        <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight t-label">Wealth Projections</h1>
        <p className="t-label-2 text-[15px]">Model compound growth, scenarios and market shocks</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: `Projected wealth at ${endAge}`, v: f.m(last.balance), s: `in ${years} years`, c: '#007AFF', i: TrendingUp },
          { l: 'Inflation-adjusted value', v: f.m(last.real), s: `today’s purchasing power (−${pct(purchasingLoss, 0)})`, c: '#5856D6', i: Hourglass },
          { l: 'Total contributed', v: f.m(last.contributed), s: `${f.m(growth)} from returns`, c: '#30D158', i: PiggyBank },
          { l: 'Sustainable income', v: `${f.m(swr)}/yr`, s: '4% rule, in today’s money', c: '#FF9500', i: Flame },
        ].map((k) => (
          <Card key={k.l} hover className="p-4 sm:p-5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium t-label-2 leading-tight">{k.l}</span>
              <span className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center" style={{ background: `${k.c}1F`, color: k.c }}><k.i size={16} /></span>
            </div>
            <p className="text-[24px] sm:text-[28px] font-bold num t-label truncate mt-2" aria-live="polite">{k.v}</p>
            <p className="text-[12px] t-label-2 mt-0.5">{k.s}</p>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-4 items-start">
        <Card className="p-5 sm:p-6 xl:col-span-2 xl:order-2">
          <SectionTitle title="Growth Trajectory" subtitle={`Age ${p.currentAge} → ${endAge} · monthly compounding`} />
          <div className="h-[340px] sm:h-[400px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--grid)" strokeDasharray="3 4" />
                <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fill: 'var(--label-2)', fontSize: 12 }} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} width={58} tick={{ fill: 'var(--label-2)', fontSize: 12 }} tickFormatter={f.compact} />
                <Tooltip content={<ChartTooltip fmt={f.m} labelFmt={(a) => `Age ${a}`} />} cursor={{ stroke: 'var(--grid)' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {shockVisible && <ReferenceLine x={shockAge} stroke="#FF3B30" strokeDasharray="4 4" label={{ value: `−${p.shockPct}% shock`, fill: '#FF3B30', fontSize: 11, position: 'insideTopLeft' }} />}
                <Line dataKey="Optimistic" stroke="#30D158" strokeWidth={2} dot={false} strokeDasharray="6 4" />
                <Line dataKey="Base" name="Base case" stroke="#007AFF" strokeWidth={3.5} dot={false} activeDot={{ r: 5 }} />
                <Line dataKey="Conservative" stroke="#FF9500" strokeWidth={2} dot={false} strokeDasharray="6 4" />
                <Line dataKey="Real" name="Inflation-adjusted" stroke="#5856D6" strokeWidth={2.5} dot={false} />
                <Line dataKey="Contributed" name="Contributions" stroke="#8E8E93" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            {SCENARIOS.map((s) => {
              const v = data[data.length - 1][{ cons: 'Conservative', base: 'Base', opt: 'Optimistic' }[s.key]]
              return (
                <div key={s.key} className="rounded-[16px] bg-fill px-4 py-3">
                  <p className="text-[12px] t-label-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}</p>
                  <p className="text-[18px] font-semibold num t-label">{f.m(v)}</p>
                </div>
              )
            })}
          </div>
          {shockVisible && (
            <p className="text-[13px] t-label-2 mt-4 rounded-[14px] bg-apple-red/10 px-4 py-3">
              <strong className="text-apple-red">Stress test:</strong> a {p.shockPct}% market drop at age {shockAge} reduces your final balance by <strong className="t-label num">{f.m(shockCost)}</strong> ({pct((shockCost / noShock[noShock.length - 1].balance) * 100, 0)}).
            </p>
          )}
        </Card>

        <Card className="p-5 sm:p-6 xl:order-1">
          <SectionTitle title="Assumptions" subtitle="Drag to explore outcomes" />
          <div className="space-y-2">
            <Slider label="Current age" value={p.currentAge} min={18} max={80} onChange={(v) => set({ currentAge: v, retireAge: Math.max(p.retireAge, v + 1) })} format={(v) => `${v}`} />
            <Slider label="Target retirement age" value={p.retireAge} min={Math.min(p.currentAge + 1, 90)} max={90} onChange={(v) => set({ retireAge: v })} format={(v) => `${v}`} accent="#5856D6" />
            <Slider label="Monthly savings" value={p.monthlySavings} min={0} max={20000} step={100} onChange={(v) => set({ monthlySavings: v })} format={(v) => f.m(v)} accent="#30D158" />
            <Slider label="Expected annual return" value={p.annualReturn} min={0} max={15} step={0.1} onChange={(v) => set({ annualReturn: v })} format={(v) => `${v.toFixed(1)}%`} accent="#FF9500" />
            <Slider label="Inflation rate" value={p.inflation} min={0} max={10} step={0.1} onChange={(v) => set({ inflation: v })} format={(v) => `${v.toFixed(1)}%`} accent="#FF3B30" />
          </div>

          <div className="border-t hairline mt-4 pt-4 space-y-3">
            <p className="text-[13px] font-semibold t-label-2 px-1">Starting balance</p>
            <Segmented
              small
              value={p.useHoldings ? 'portfolio' : 'manual'}
              onChange={(v) => set({ useHoldings: v === 'portfolio', startingBalance: v === 'manual' && !p.startingBalance ? Math.round(investable) : p.startingBalance })}
              options={[{ value: 'portfolio', label: 'My portfolio' }, { value: 'manual', label: 'Custom' }]}
            />
            {p.useHoldings ? (
              <p className="text-[12px] t-label-3 px-1">{f.m(investable)} — cash, stocks and alternatives (excludes real estate).</p>
            ) : (
              <input className="field num" type="number" inputMode="decimal" min="0" step="1000" aria-label="Custom starting balance" value={p.startingBalance} onChange={(e) => set({ startingBalance: Math.max(0, Number(e.target.value) || 0) })} />
            )}
          </div>

          <div className="border-t hairline mt-4 pt-3">
            <p className="text-[13px] font-semibold t-label-2 px-1">Stress test</p>
            <Slider label="Market crash" value={p.shockPct} min={0} max={60} step={5} onChange={(v) => set({ shockPct: v })} format={(v) => (v ? `−${v}%` : 'Off')} accent="#FF3B30" />
            <Slider label="Occurs in year" value={Math.min(p.shockYear, Math.max(1, endAge - p.currentAge))} min={1} max={Math.max(1, endAge - p.currentAge)} onChange={(v) => set({ shockYear: v })} format={(v) => `Year ${v}`} accent="#FF3B30" />
          </div>
        </Card>
      </div>
    </div>
  )
}
