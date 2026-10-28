import { useCallback, useState } from 'react'
import { BottomBar, MobileHeader, Sidebar } from '../components/Nav'
import TransactionModal from '../components/TransactionModal'
import HoldingModal from '../components/HoldingModal'
import Dashboard from './Dashboard'
import NetWorth from './NetWorth'
import CashFlow from './CashFlow'
import Projections from './Projections'
import Settings from './Settings'
import { Info, X } from 'lucide-react'
import { useStore } from '../lib/store'

export default function AppShell() {
  const [tab, setTab] = useState('dashboard')
  const [txModal, setTxModal] = useState({ open: false, tx: null })
  const [hModal, setHModal] = useState({ open: false, holding: null, kind: 'asset' })

  const goTab = useCallback((t) => {
    setTab(t)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const openTx = useCallback((tx = null) => setTxModal({ open: true, tx }), [])
  const closeTx = useCallback(() => setTxModal((m) => ({ ...m, open: false })), [])
  const openHolding = useCallback((holding) => setHModal({ open: true, holding, kind: holding.kind }), [])
  const addHolding = useCallback((kind) => setHModal({ open: true, holding: null, kind }), [])
  const closeHolding = useCallback(() => setHModal((m) => ({ ...m, open: false })), [])

  return (
    <div className="min-h-dvh">
      <Sidebar tab={tab} onTab={goTab} />
      <MobileHeader />
      <main className="lg:pl-[304px] px-4 sm:px-6 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-10">
        <div className="mx-auto max-w-[1200px]">
          {tab === 'dashboard' && <Dashboard onTab={goTab} onAddTx={openTx} onAddHolding={addHolding} />}
          {tab === 'networth' && <NetWorth onEdit={openHolding} onAdd={addHolding} />}
          {tab === 'cashflow' && <CashFlow onEdit={openTx} onAdd={openTx} />}
          {tab === 'projections' && <Projections />}
          {tab === 'settings' && <Settings />}
        </div>
      </main>
      <BottomBar tab={tab} onTab={goTab} />
      <Notice />
      <TransactionModal open={txModal.open} tx={txModal.tx} onClose={closeTx} />
      <HoldingModal open={hModal.open} holding={hModal.holding} defaultKind={hModal.kind} onClose={closeHolding} />
    </div>
  )
}

function Notice() {
  const { notice, clearNotice } = useStore()
  if (!notice) return null
  return (
    <div role="status" className="fixed z-[60] left-4 right-4 bottom-[calc(88px+env(safe-area-inset-bottom))] lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-sm glass !rounded-[18px] p-4 flex gap-3 items-start anim-sheet">
      <Info size={20} className="text-apple-blue shrink-0 mt-0.5" />
      <p className="text-[14px] t-label flex-1">{notice}</p>
      <button onClick={clearNotice} aria-label="Dismiss" className="t-label-2"><X size={18} /></button>
    </div>
  )
}
