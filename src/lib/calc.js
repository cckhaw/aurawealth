import { ASSET_CLASSES } from './constants'
import { addDays, iso, monthKey, parseISO } from './format'

export function totals(holdings) {
  const byClass = Object.fromEntries(Object.keys(ASSET_CLASSES).map((k) => [k, 0]))
  let assets = 0
  let liabilities = 0
  for (const h of holdings) {
    if (h.kind === 'asset') {
      assets += h.value
      byClass[h.class] = (byClass[h.class] || 0) + h.value
    } else liabilities += h.value
  }
  return { assets, liabilities, netWorth: assets - liabilities, byClass }
}

/** Sum of transactions of a type inside [from, to] inclusive ISO dates. */
export function sumRange(tx, type, from, to) {
  return tx.reduce((s, t) => (t.type === type && t.date >= from && t.date <= to ? s + t.amount : s), 0)
}

/** Trailing-30-day cash flow metrics used by the KPI cards. */
export function cashMetrics(tx, holdings, today = new Date()) {
  const to = iso(today)
  const from = iso(addDays(today, -29))
  const prevFrom = iso(addDays(today, -59))
  const prevTo = iso(addDays(today, -30))
  const income = sumRange(tx, 'income', from, to)
  const expense = sumRange(tx, 'expense', from, to)
  const invested = sumRange(tx, 'investment', from, to)
  const pIncome = sumRange(tx, 'income', prevFrom, prevTo)
  const pExpense = sumRange(tx, 'expense', prevFrom, prevTo)
  const net = income - expense
  const pNet = pIncome - pExpense

  // Burn rate: average monthly expense across the last 90 days (smooths one-off spend).
  const burn = sumRange(tx, 'expense', iso(addDays(today, -89)), to) / 3
  const cash = holdings.filter((h) => h.kind === 'asset' && h.class === 'cash').reduce((s, h) => s + h.value, 0)
  return {
    income, expense, invested, net, pNet,
    savingsRate: income > 0 ? (net / income) * 100 : 0,
    pSavingsRate: pIncome > 0 ? ((pIncome - pExpense) / pIncome) * 100 : 0,
    burn,
    cushion: burn > 0 ? cash / burn : 0,
    cash,
  }
}

/** Expense totals per category for a given YYYY-MM month. */
export function monthlyExpenseByCategory(tx, month) {
  const out = {}
  for (const t of tx) if (t.type === 'expense' && monthKey(t.date) === month) out[t.category] = (out[t.category] || 0) + t.amount
  return out
}

/**
 * Back-cast a 12-month net-worth curve from current holdings and their growth
 * assumptions. Assets are discounted at their growth rate; liabilities use the
 * (negative) growth rate as an annual paydown rate. This is a model, not history.
 */
export function netWorthTrend(holdings, months = 12, today = new Date()) {
  const pts = []
  for (let i = months; i >= 0; i--) {
    let nw = 0
    for (const h of holdings) {
      const f = Math.pow(1 + h.growth / 100, -i / 12)
      nw += (h.kind === 'asset' ? 1 : -1) * h.value * f
    }
    const d = new Date(today.getFullYear(), today.getMonth() - i, today.getDate())
    pts.push({ label: d.toLocaleDateString(undefined, { month: 'short' }), full: d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }), value: Math.round(nw) })
  }
  return pts
}

/**
 * Monthly-compounded projection. Returns one point per year from currentAge
 * to horizon age. `shock` applies a one-time market drop (percent) at shockYear.
 */
export function project({ start, monthly, annualReturn, inflation, currentAge, endAge, shockPct = 0, shockYear = 0 }) {
  const years = Math.max(0, Math.round(endAge - currentAge))
  const mr = Math.pow(1 + annualReturn / 100, 1 / 12) - 1
  const out = []
  let bal = start
  let contributed = start
  for (let y = 0; y <= years; y++) {
    const real = bal / Math.pow(1 + inflation / 100, y)
    out.push({ age: currentAge + y, year: y, balance: bal, real, contributed })
    if (y === years) break
    for (let m = 0; m < 12; m++) {
      bal = bal * (1 + mr) + monthly
      contributed += monthly
    }
    if (shockPct > 0 && y + 1 === Math.round(shockYear)) bal *= 1 - shockPct / 100
  }
  return out
}
