import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { seedState } from './seed'
import { uid } from './format'

const KEY = 'aura-wealth:v1'

function load() {
  const fresh = seedState()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fresh
    const s = JSON.parse(raw)
    if (!Array.isArray(s.holdings) || !Array.isArray(s.transactions)) return fresh
    return {
      holdings: s.holdings,
      transactions: s.transactions,
      settings: {
        ...fresh.settings,
        ...s.settings,
        target: { ...fresh.settings.target, ...s.settings?.target },
        budgets: { ...fresh.settings.budgets, ...s.settings?.budgets },
        projection: { ...fresh.settings.projection, ...s.settings?.projection },
      },
    }
  } catch {
    return fresh
  }
}

function reducer(state, a) {
  switch (a.type) {
    case 'tx/save': {
      const exists = state.transactions.some((t) => t.id === a.tx.id)
      const transactions = exists
        ? state.transactions.map((t) => (t.id === a.tx.id ? a.tx : t))
        : [{ ...a.tx, id: uid() }, ...state.transactions]
      return { ...state, transactions }
    }
    case 'tx/delete':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== a.id) }
    case 'holding/save': {
      const exists = state.holdings.some((h) => h.id === a.holding.id)
      const holdings = exists
        ? state.holdings.map((h) => (h.id === a.holding.id ? a.holding : h))
        : [...state.holdings, { ...a.holding, id: uid() }]
      return { ...state, holdings }
    }
    case 'holding/delete':
      return { ...state, holdings: state.holdings.filter((h) => h.id !== a.id) }
    case 'settings/patch':
      return { ...state, settings: { ...state.settings, ...a.patch } }
    case 'projection/patch':
      return { ...state, settings: { ...state.settings, projection: { ...state.settings.projection, ...a.patch } } }
    case 'replace':
      return a.state
    case 'reset':
      return seedState()
    default:
      return state
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage full or blocked – app keeps working in memory */
    }
  }, [state])

  // Theme: class on <html>, follows the OS when set to "system".
  const theme = state.settings.theme
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => setSystemDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const dark = theme === 'dark' || (theme === 'system' && systemDark)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const value = useMemo(() => ({ state, dispatch, dark }), [state, dark])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
