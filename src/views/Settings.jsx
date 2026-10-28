import { useRef, useState } from 'react'
import { AlertTriangle, Download, Monitor, Moon, RotateCcw, Sun, Upload } from 'lucide-react'
import { Button, Card, SectionTitle, Segmented, Slider } from '../components/ui'
import { useStore } from '../lib/store'
import { useFmt } from '../lib/useFmt'
import { ASSET_CLASSES, CATEGORIES, CURRENCIES } from '../lib/constants'
import { currencySymbol } from '../lib/format'

export default function Settings() {
  const { state, dispatch } = useStore()
  const f = useFmt()
  const { settings } = state
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const patch = (p) => dispatch({ type: 'settings/patch', patch: p })
  const totalTarget = Object.values(settings.target).reduce((s, v) => s + v, 0)
  const balanced = totalTarget === 100

  // Moving one weight redistributes the remainder proportionally so the total stays at 100.
  const setWeight = (key, v) => {
    const others = Object.keys(settings.target).filter((k) => k !== key)
    const otherSum = others.reduce((s, k) => s + settings.target[k], 0)
    const remaining = 100 - v
    const next = { [key]: v }
    let used = 0
    others.forEach((k, i) => {
      const w = i === others.length - 1 ? remaining - used : Math.round(otherSum ? (settings.target[k] / otherSum) * remaining : remaining / others.length)
      next[k] = Math.max(0, w)
      used += next[k]
    })
    patch({ target: next })
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `aura-wealth-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    file.text().then((txt) => {
      try {
        const s = JSON.parse(txt)
        if (!Array.isArray(s.holdings) || !Array.isArray(s.transactions) || !s.settings) throw new Error()
        dispatch({ type: 'replace', state: { ...state, ...s, settings: { ...state.settings, ...s.settings } } })
        setMsg({ ok: true, text: 'Data imported successfully.' })
      } catch {
        setMsg({ ok: false, text: 'That file is not a valid Aura Wealth export.' })
      }
    })
  }

  const budgetCats = CATEGORIES.expense

  return (
    <div className="space-y-6 anim-view max-w-4xl">
      <div>
        <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight t-label">Settings</h1>
        <p className="t-label-2 text-[15px]">Preferences are saved automatically on this device</p>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionTitle title="Appearance & Currency" />
        <div className="space-y-5">
          <div>
            <p className="text-[13px] font-medium t-label-2 mb-2 px-1">Theme</p>
            <Segmented
              value={settings.theme}
              onChange={(v) => patch({ theme: v })}
              options={[
                { value: 'light', label: <span className="inline-flex items-center gap-1.5"><Sun size={16} />Light</span> },
                { value: 'dark', label: <span className="inline-flex items-center gap-1.5"><Moon size={16} />Dark</span> },
                { value: 'system', label: <span className="inline-flex items-center gap-1.5"><Monitor size={16} />Auto</span> },
              ]}
            />
          </div>
          <label className="block">
            <span className="block text-[13px] font-medium t-label-2 mb-2 px-1">Base currency</span>
            <select className="field" value={settings.currency} onChange={(e) => patch({ currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} ({currencySymbol(c.code)}) — {c.name}</option>)}
            </select>
            <span className="block text-[12px] t-label-3 mt-1.5 px-1">Changes how amounts are displayed. Stored values are not converted.</span>
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <SectionTitle
          title="Target Allocation"
          subtitle="Used for drift tracking on the Dashboard"
          action={<span className={`text-[14px] font-semibold num ${balanced ? 'text-apple-green' : 'text-apple-red'}`}>{totalTarget}% / 100%</span>}
        />
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
          {Object.entries(ASSET_CLASSES).map(([k, c]) => (
            <Slider key={k} label={c.label} value={settings.target[k]} min={0} max={100} step={1} accent={c.color} onChange={(v) => setWeight(k, v)} format={(v) => `${v}%`} />
          ))}
        </div>
        <div className="flex h-3 rounded-full overflow-hidden mt-3 gap-0.5 bg-fill" aria-hidden>
          {Object.entries(ASSET_CLASSES).map(([k, c]) => <div key={k} className="transition-all duration-500 ease-apple" style={{ width: `${settings.target[k]}%`, background: c.color }} />)}
        </div>
        <p className="text-[12px] t-label-3 mt-2 px-1">Moving one slider rebalances the others proportionally so the total stays at 100%.</p>
      </Card>

      <Card className="p-5 sm:p-6">
        <SectionTitle title="Monthly Budgets" subtitle={`Spending thresholds per category (${f.code})`} />
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {budgetCats.map((c) => (
            <label key={c} className="flex items-center gap-3">
              <span className="flex-1 text-[15px] t-label">{c}</span>
              <input
                className="field !w-[130px] text-right num"
                type="number" inputMode="decimal" min="0" step="10"
                aria-label={`${c} monthly budget`}
                value={settings.budgets[c] ?? ''}
                placeholder="0"
                onChange={(e) => patch({ budgets: { ...settings.budgets, [c]: Math.max(0, Number(e.target.value) || 0) } })}
              />
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <SectionTitle title="Your Data" subtitle="Everything lives in this browser’s local storage" />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={Download} onClick={exportData}>Export JSON</Button>
          <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>Import JSON</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
          {confirmReset ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] text-apple-red flex items-center gap-1.5"><AlertTriangle size={16} />Erase everything?</span>
              <Button variant="danger" onClick={() => { dispatch({ type: 'reset' }); setConfirmReset(false); setMsg({ ok: true, text: 'Demo data restored.' }) }}>Yes, reset</Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="danger" icon={RotateCcw} onClick={() => setConfirmReset(true)}>Reset to demo data</Button>
          )}
        </div>
        {msg && <p role="status" className={`text-[14px] mt-3 px-1 ${msg.ok ? 'text-apple-green' : 'text-apple-red'}`}>{msg.text}</p>}
      </Card>
    </div>
  )
}
