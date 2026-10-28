import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { blankState, seedState } from './seed'
import { api, ApiError } from './api'
import { uid } from './format'

const DEMO_KEY = 'aura-wealth:v1'

/** Merge saved data over defaults so older/partial saves never crash the UI. */
export function normalize(s, base = blankState()) {
  if (!s || !Array.isArray(s.holdings) || !Array.isArray(s.transactions)) return base
  const { theme, ...settings } = s.settings || {} // theme is a per-device preference now
  return {
    holdings: s.holdings,
    transactions: s.transactions,
    settings: {
      ...base.settings,
      ...settings,
      target: { ...base.settings.target, ...settings.target },
      budgets: { ...base.settings.budgets, ...settings.budgets },
      projection: { ...base.settings.projection, ...settings.projection },
    },
  }
}

export function loadDemo() {
  try {
    const raw = localStorage.getItem(DEMO_KEY)
    if (raw) return normalize(JSON.parse(raw), seedState())
  } catch { /* corrupt or blocked storage */ }
  return seedState()
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
    case 'sample':
      return { ...seedState(), settings: state.settings }
    case 'clear':
      return { ...state, holdings: [], transactions: [] }
    default:
      return state
  }
}

const Ctx = createContext(null)

/**
 * mode "demo": state lives in this browser's localStorage (nothing leaves the device).
 * mode "user": state lives on the server under the signed-in account; nothing is cached locally,
 * so another person on the same browser can never see it.
 */
export function StoreProvider({ mode, initial, rev: initialRev, onSignedOut, children }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const [sync, setSync] = useState('saved') // saved | saving | error
  const [notice, setNotice] = useState(null)
  const rev = useRef(initialRev ?? null)
  const first = useRef(true)
  const latest = useRef(state)
  latest.current = state
  const saving = useRef(false)
  const dirty = useRef(false)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (mode === 'demo') {
      try { localStorage.setItem(DEMO_KEY, JSON.stringify(state)) } catch { /* storage full */ }
      return
    }
    dirty.current = true
    setSync('saving')
    const t = setTimeout(flush, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  async function flush() {
    if (saving.current) return // the running save re-checks `dirty` when it finishes
    saving.current = true
    try {
      while (dirty.current) {
        dirty.current = false
        const snapshot = latest.current
        try {
          const r = await api('data', { method: 'PUT', body: { data: snapshot, rev: rev.current } })
          rev.current = r.rev
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) return onSignedOut?.()
          if (e instanceof ApiError && e.status === 409) {
            rev.current = e.payload?.rev ?? null
            dirty.current = false
            first.current = true // don't echo the reload back to the server
            dispatch({ type: 'replace', state: normalize(e.payload?.data) })
            setNotice('Your data was updated on another device, so we loaded the latest version.')
            setSync('saved')
            return
          }
          dirty.current = true
          setSync('error')
          return
        }
      }
      setSync('saved')
    } finally {
      saving.current = false
    }
  }

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (mode !== 'user') return
    const on = (e) => { if (dirty.current || saving.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', on)
    return () => window.removeEventListener('beforeunload', on)
  }, [mode])

  const value = useMemo(
    () => ({ state, dispatch, mode, sync, retry: flush, notice, clearNotice: () => setNotice(null) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, mode, sync, notice],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
