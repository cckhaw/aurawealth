import { useCallback, useState } from 'react'
import { BottomBar, MobileHeader, Sidebar } from './components/Nav'
import TransactionModal from './components/TransactionModal'
import HoldingModal from './components/HoldingModal'
import Dashboard from './views/Dashboard'
import NetWorth from './views/NetWorth'
import CashFlow from './views/CashFlow'
import Projections from './views/Projections'
import Settings from './views/Settings'
import { useStore } from './lib/store'

export default function App() {
  const { dispatch, dark } = useStore()
  const [tab, setTab] = useState('dashboard')
  const [txModal, setTxModal] = useState({ open: false, tx: null })
  const [hModal, setHModal] = useState({ open: false, holding: null, kind: 'asset' })

  const toggleDark = () => dispatch({ type: 'settings/patch', patch: { theme: dark ? 'light' : 'dark' } })

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
      <Sidebar tab={tab} onTab={goTab} dark={dark} onToggleDark={toggleDark} />
      <MobileHeader dark={dark} onToggleDark={toggleDark} />
      <main className="lg:pl-[304px] px-4 sm:px-6 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-10">
        <div className="mx-auto max-w-[1200px]">
          {tab === 'dashboard' && <Dashboard onTab={goTab} onAddTx={openTx} />}
          {tab === 'networth' && <NetWorth onEdit={openHolding} onAdd={addHolding} />}
          {tab === 'cashflow' && <CashFlow onEdit={openTx} onAdd={openTx} />}
          {tab === 'projections' && <Projections />}
          {tab === 'settings' && <Settings />}
        </div>
      </main>
      <BottomBar tab={tab} onTab={goTab} />
      <TransactionModal open={txModal.open} tx={txModal.tx} onClose={closeTx} />
      <HoldingModal open={hModal.open} holding={hModal.holding} defaultKind={hModal.kind} onClose={closeHolding} />
    </div>
  )
}
