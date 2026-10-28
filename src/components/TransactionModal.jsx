import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, Field, Modal, Segmented } from './ui'
import { CATEGORIES, CATEGORY_COLORS, TX_TYPES } from '../lib/constants'
import { addDays, iso, currencySymbol } from '../lib/format'
import { useStore } from '../lib/store'

const blank = () => ({ type: 'expense', category: 'Groceries', amount: '', date: iso(new Date()), note: '' })

export default function TransactionModal({ open, tx, onClose }) {
  const { state, dispatch } = useStore()
  const [f, setF] = useState(blank)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setF(tx ? { ...tx, amount: String(tx.amount) } : blank())
      setErr('')
    }
  }, [open, tx])

  const set = (patch) => setF((p) => ({ ...p, ...patch }))
  const setType = (type) => set({ type, category: CATEGORIES[type].includes(f.category) ? f.category : CATEGORIES[type][0] })
  const today = iso(new Date())
  const yesterday = iso(addDays(new Date(), -1))

  const save = () => {
    const amount = parseFloat(f.amount)
    if (!(amount > 0)) return setErr('Enter an amount greater than zero.')
    if (!f.date) return setErr('Pick a date.')
    dispatch({ type: 'tx/save', tx: { ...f, amount, note: f.note.trim() } })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tx ? 'Edit Transaction' : 'Add Transaction'}
      footer={
        <div className="flex gap-3">
          {tx && (
            <Button variant="danger" icon={Trash2} aria-label="Delete transaction" onClick={() => { dispatch({ type: 'tx/delete', id: tx.id }); onClose() }} />
          )}
          <Button className="flex-1" onClick={save}>{tx ? 'Save Changes' : 'Add Transaction'}</Button>
        </div>
      }
    >
      <div className="space-y-5 pt-1">
        <Segmented
          value={f.type}
          onChange={setType}
          options={Object.entries(TX_TYPES).map(([value, t]) => ({ value, label: t.label, color: t.color }))}
        />

        <div className="text-center py-2">
          <div className="inline-flex items-baseline justify-center gap-1">
            <span className="text-[28px] font-semibold t-label-3">{currencySymbol(state.settings.currency)}</span>
            <input
              autoFocus
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              aria-label="Amount"
              value={f.amount}
              onChange={(e) => { set({ amount: e.target.value }); setErr('') }}
              className="w-[10ch] max-w-[60vw] bg-transparent text-center text-[46px] font-bold tracking-tight num t-label outline-none placeholder:text-[var(--label-3)]"
            />
          </div>
          {err && <p role="alert" className="text-[13px] text-apple-red mt-1">{err}</p>}
        </div>

        <div>
          <p className="text-[13px] font-medium t-label-2 mb-2 px-1">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES[f.type].map((c) => {
              const active = f.category === c
              const color = CATEGORY_COLORS[c] || '#8E8E93'
              return (
                <button
                  key={c}
                  onClick={() => set({ category: c })}
                  aria-pressed={active}
                  className="min-h-[44px] px-4 rounded-full text-[14px] font-semibold transition-all duration-300 ease-apple active:scale-95"
                  style={active ? { background: color, color: '#fff', boxShadow: `0 6px 14px ${color}55` } : { background: 'var(--fill)', color: 'var(--label)' }}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-[13px] font-medium t-label-2 mb-2 px-1">Date</p>
          <div className="flex gap-2 items-center">
            {[['Today', today], ['Yesterday', yesterday]].map(([l, v]) => (
              <button
                key={l}
                onClick={() => set({ date: v })}
                className={`min-h-[44px] px-4 rounded-[14px] text-[14px] font-semibold transition-all duration-300 ease-apple active:scale-95 ${f.date === v ? 'bg-apple-blue text-white' : 'bg-fill t-label'}`}
              >
                {l}
              </button>
            ))}
            <input type="date" className="field flex-1 min-w-0" value={f.date} max="2100-12-31" onChange={(e) => set({ date: e.target.value })} aria-label="Date" />
          </div>
        </div>

        <Field label="Note (optional)">
          <input className="field" placeholder="e.g. Whole Foods" value={f.note} maxLength={80} onChange={(e) => set({ note: e.target.value })} />
        </Field>
      </div>
    </Modal>
  )
}
