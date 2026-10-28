import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, Field, Modal, Segmented } from './ui'
import { ASSET_CLASSES, LIABILITY_CLASSES } from '../lib/constants'
import { iso, currencySymbol } from '../lib/format'
import { useStore } from '../lib/store'

const blank = (kind) => ({
  kind,
  class: kind === 'asset' ? 'cash' : 'mortgage',
  name: '',
  value: '',
  acquired: iso(new Date()),
  growth: kind === 'asset' ? '5' : '-5',
})

export default function HoldingModal({ open, holding, defaultKind = 'asset', onClose }) {
  const { state, dispatch } = useStore()
  const [f, setF] = useState(blank('asset'))
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setF(holding ? { ...holding, value: String(holding.value), growth: String(holding.growth) } : blank(defaultKind))
      setErr('')
    }
  }, [open, holding, defaultKind])

  const set = (patch) => setF((p) => ({ ...p, ...patch }))
  const classes = f.kind === 'asset' ? ASSET_CLASSES : LIABILITY_CLASSES
  const isAsset = f.kind === 'asset'

  const switchKind = (kind) => {
    if (holding) return
    setF({ ...blank(kind), name: f.name, value: f.value })
  }

  const save = () => {
    const value = parseFloat(f.value)
    const growth = parseFloat(f.growth)
    if (!f.name.trim()) return setErr('Give this item a name.')
    if (!(value >= 0)) return setErr('Enter a valuation of zero or more.')
    dispatch({ type: 'holding/save', holding: { ...f, name: f.name.trim(), value, growth: Number.isFinite(growth) ? growth : 0 } })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={holding ? `Edit ${isAsset ? 'Asset' : 'Liability'}` : 'Add Item'}
      footer={
        <div className="flex gap-3">
          {holding && <Button variant="danger" icon={Trash2} aria-label="Delete item" onClick={() => { dispatch({ type: 'holding/delete', id: holding.id }); onClose() }} />}
          <Button className="flex-1" onClick={save}>{holding ? 'Save Changes' : 'Add to Balance Sheet'}</Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {!holding && (
          <Segmented
            value={f.kind}
            onChange={switchKind}
            options={[{ value: 'asset', label: 'Asset', color: '#30D158' }, { value: 'liability', label: 'Liability', color: '#FF3B30' }]}
          />
        )}
        <Field label="Name">
          <input className="field" placeholder={isAsset ? 'e.g. Vanguard Brokerage' : 'e.g. Car Loan'} value={f.name} maxLength={60} onChange={(e) => { set({ name: e.target.value }); setErr('') }} />
        </Field>
        <Field label="Type">
          <select className="field" value={f.class} onChange={(e) => set({ class: e.target.value })}>
            {Object.entries(classes).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
          </select>
        </Field>
        <Field label={isAsset ? 'Current valuation' : 'Outstanding balance'}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 t-label-3 font-medium">{currencySymbol(state.settings.currency)}</span>
            <input className="field !pl-9 num" inputMode="decimal" type="number" min="0" step="any" placeholder="0" value={f.value} onChange={(e) => { set({ value: e.target.value }); setErr('') }} />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Acquisition date">
            <input type="date" className="field" value={f.acquired} onChange={(e) => set({ acquired: e.target.value })} />
          </Field>
          <Field label={isAsset ? 'Growth rate (%/yr)' : 'Paydown (%/yr)'} hint={isAsset ? 'Expected annual appreciation' : 'Negative = balance shrinks'}>
            <input className="field num" inputMode="decimal" type="number" step="0.1" value={f.growth} onChange={(e) => set({ growth: e.target.value })} />
          </Field>
        </div>
        {err && <p role="alert" className="text-[13px] text-apple-red px-1">{err}</p>}
      </div>
    </Modal>
  )
}
