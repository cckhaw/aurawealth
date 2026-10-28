import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from './ui'

export default function Kpi({ label, value, compactValue, sub, delta, deltaLabel, icon: Icon, color, goodWhenUp = true }) {
  const up = delta >= 0
  const good = goodWhenUp ? up : !up
  return (
    <Card hover className="p-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium t-label-2">{label}</span>
        <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${color}1F`, color }}>
          <Icon size={18} />
        </span>
      </div>
      <div>
        <p className="text-[28px] sm:text-[30px] font-bold num t-label leading-none truncate">
          {compactValue ? <><span className="sm:hidden">{compactValue}</span><span className="hidden sm:inline">{value}</span></> : value}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-[13px]">
          {delta != null && Number.isFinite(delta) && (
            <span className={`inline-flex items-center font-semibold ${good ? 'text-apple-green' : 'text-apple-red'}`}>
              {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              {deltaLabel}
            </span>
          )}
          <span className="t-label-2 truncate">{sub}</span>
        </div>
      </div>
    </Card>
  )
}
