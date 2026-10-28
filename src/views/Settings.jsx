import { useRef, useState } from 'react'
import { AlertTriangle, Download, KeyRound, LogOut, Monitor, Moon, RotateCcw, Sun, Trash2, Upload } from 'lucide-react'
import { Button, Card, SectionTitle, Segmented, Slider } from '../components/ui'
import { useStore } from '../lib/store'
import { useFmt } from '../lib/useFmt'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { api } from '../lib/api'
import { Link } from '../lib/router'
import { normalize } from '../lib/store'
import { ASSET_CLASSES, CATEGORIES, CURRENCIES } from '../lib/constants'
import { currencySymbol } from '../lib/format'

export default function Settings() {
  const { state, dispatch, mode } = useStore()
  const { user, logout, dropSession } = useAuth()
  const { theme, setTheme } = useTheme()
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
        dispatch({ type: 'replace', state: normalize(s, state) })
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

      {mode === 'user' ? <AccountCard user={user} logout={logout} dropSession={dropSession} /> : (
        <Card className="p-5 sm:p-6">
          <SectionTitle title="Demo mode" subtitle="You’re exploring with sample data stored only in this browser" />
          <Link to="/signup" className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-[14px] bg-apple-blue text-white text-[15px] font-semibold">Create a free account</Link>
        </Card>
      )}

      <Card className="p-5 sm:p-6">
        <SectionTitle title="Appearance & Currency" />
        <div className="space-y-5">
          <div>
            <p className="text-[13px] font-medium t-label-2 mb-2 px-1">Theme</p>
            <Segmented
              value={theme}
              onChange={setTheme}
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
        <SectionTitle title="Your Data" subtitle={mode === 'demo' ? 'Demo data lives only in this browser' : 'Stored privately under your account'} />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={Download} onClick={exportData}>Export JSON</Button>
          <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>Import JSON</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
          {confirmReset ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] text-apple-red flex items-center gap-1.5"><AlertTriangle size={16} />Erase all holdings and transactions?</span>
              <Button variant="danger" onClick={() => { dispatch({ type: 'clear' }); setConfirmReset(false); setMsg({ ok: true, text: 'All holdings and transactions cleared.' }) }}>Yes, erase</Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              <Button variant="secondary" icon={RotateCcw} onClick={() => { dispatch({ type: 'sample' }); setMsg({ ok: true, text: 'Sample data loaded.' }) }}>Load sample data</Button>
              <Button variant="danger" icon={Trash2} onClick={() => setConfirmReset(true)}>Clear all data</Button>
            </>
          )}
        </div>
        {msg && <p role="status" className={`text-[14px] mt-3 px-1 ${msg.ok ? 'text-apple-green' : 'text-apple-red'}`}>{msg.text}</p>}
      </Card>
    </div>
  )
}

function AccountCard({ user, logout, dropSession }) {
  const [pw, setPw] = useState({ cur: '', next: '' })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [del, setDel] = useState({ open: false, password: '' })

  const run = async (fn, ok) => {
    setBusy(true)
    setMsg(null)
    try { await fn(); if (ok) setMsg({ ok: true, text: ok }) } catch (e) { setMsg({ ok: false, text: e.message }) } finally { setBusy(false) }
  }

  return (
    <Card className="p-5 sm:p-6">
      <SectionTitle title="Account" subtitle={`${user?.name} · ${user?.email}`} action={<Button variant="secondary" icon={LogOut} onClick={logout}>Sign out</Button>} />
      <form
        className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
        onSubmit={(e) => {
          e.preventDefault()
          run(async () => { await api('account', { method: 'POST', body: { password: pw.cur, newPassword: pw.next } }); setPw({ cur: '', next: '' }) }, 'Password updated. Other devices were signed out.')
        }}
      >
        <label className="block"><span className="block text-[13px] font-medium t-label-2 mb-1.5 px-1">Current password</span>
          <input className="field" type="password" autoComplete="current-password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} required /></label>
        <label className="block"><span className="block text-[13px] font-medium t-label-2 mb-1.5 px-1">New password</span>
          <input className="field" type="password" autoComplete="new-password" minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required /></label>
        <Button type="submit" variant="secondary" icon={KeyRound} disabled={busy}>Change</Button>
      </form>

      <div className="border-t hairline mt-5 pt-4">
        {del.open ? (
          <form
            className="flex flex-col sm:flex-row gap-3 sm:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              run(async () => { await api('account', { method: 'DELETE', body: { password: del.password } }); dropSession() })
            }}
          >
            <label className="block flex-1"><span className="block text-[13px] font-medium text-apple-red mb-1.5 px-1">Enter your password to permanently delete your account and all data</span>
              <input className="field" type="password" autoComplete="current-password" value={del.password} onChange={(e) => setDel({ ...del, password: e.target.value })} required /></label>
            <Button type="submit" variant="danger" icon={Trash2} disabled={busy}>Delete forever</Button>
            <Button type="button" variant="ghost" onClick={() => setDel({ open: false, password: '' })}>Cancel</Button>
          </form>
        ) : (
          <Button variant="danger" icon={Trash2} onClick={() => setDel({ open: true, password: '' })}>Delete account…</Button>
        )}
      </div>
      {msg && <p role="status" className={`text-[14px] mt-3 px-1 ${msg.ok ? 'text-apple-green' : 'text-apple-red'}`}>{msg.text}</p>}
    </Card>
  )
}
