import { CURRENCIES } from './constants'

const cache = new Map()
function nf(code, opts) {
  const key = code + JSON.stringify(opts)
  if (!cache.has(key)) {
    const c = CURRENCIES.find((x) => x.code === code) || CURRENCIES[0]
    cache.set(key, new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.code, ...opts }))
  }
  return cache.get(key)
}

export const money = (n, code = 'USD', opts = {}) =>
  nf(code, { maximumFractionDigits: 0, ...opts }).format(Number.isFinite(n) ? n : 0)

export const moneyExact = (n, code = 'USD') =>
  nf(code, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0)

export const moneyCompact = (n, code = 'USD') =>
  nf(code, { notation: 'compact', maximumFractionDigits: 1 }).format(Number.isFinite(n) ? n : 0)

export const pct = (n, digits = 1) => `${(Number.isFinite(n) ? n : 0).toFixed(digits)}%`

export const currencySymbol = (code) =>
  nf(code, {}).formatToParts(0).find((p) => p.type === 'currency')?.value ?? '$'

export const iso = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const fmtDate = (s, opts = { month: 'short', day: 'numeric' }) =>
  parseISO(s).toLocaleDateString(undefined, opts)

export const fmtDateLong = (s) => fmtDate(s, { year: 'numeric', month: 'short', day: 'numeric' })

export const monthKey = (s) => s.slice(0, 7)

export const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export const shiftMonth = (key, delta) => {
  const [y, m] = key.split('-').map(Number)
  return iso(new Date(y, m - 1 + delta, 1)).slice(0, 7)
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
