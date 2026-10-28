import { DEFAULT_BUDGETS, DEFAULT_TARGET } from './constants'
import { addDays, iso, uid } from './format'

// Deterministic PRNG so seed data is stable across a first load.
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export function seedHoldings() {
  const h = (kind, cls, name, value, acquired, growth) => ({ id: uid(), kind, class: cls, name, value, acquired, growth })
  return [
    h('asset', 'cash', 'Premier Checking', 18500, '2016-03-01', 0.5),
    h('asset', 'cash', 'High-Yield Savings (Emergency Fund)', 62000, '2018-06-15', 4.2),
    h('asset', 'stocks', 'Brokerage – Global Index ETFs', 285000, '2015-09-01', 8),
    h('asset', 'stocks', '401(k) – Target Date 2050', 214000, '2013-02-01', 7.5),
    h('asset', 'stocks', 'Roth IRA – US Equity', 96000, '2016-01-10', 8.5),
    h('asset', 'realEstate', 'Primary Residence', 720000, '2019-05-20', 3.8),
    h('asset', 'alternatives', 'Digital Assets (BTC / ETH)', 38000, '2021-02-14', 10),
    h('asset', 'alternatives', 'Physical Gold & Silver', 45000, '2020-04-02', 4),
    h('asset', 'alternatives', 'Venture Fund LP Stake', 25000, '2022-08-01', 12),
    h('liability', 'mortgage', 'Home Mortgage (3.1% fixed)', 268000, '2019-05-20', -4.5),
    h('liability', 'loan', 'Auto Loan', 14500, '2023-01-12', -22),
    h('liability', 'loan', 'Student Loan', 12000, '2014-09-01', -9),
    h('liability', 'creditCard', 'Rewards Credit Card', 4200, '2020-01-01', 0),
  ]
}

export function seedTransactions(today = new Date()) {
  const r = rng(20240607)
  const tx = []
  const add = (date, type, category, amount, note) =>
    tx.push({ id: uid(), date: iso(date), type, category, amount: Math.round(amount * 100) / 100, note })

  const start = new Date(today.getFullYear(), today.getMonth() - 5, 1)
  for (let m = 0; m < 6; m++) {
    const first = new Date(start.getFullYear(), start.getMonth() + m, 1)
    const day = (n) => new Date(first.getFullYear(), first.getMonth(), n)
    const valid = (d) => d <= today

    const push = (d, ...args) => valid(d) && add(d, ...args)

    // Income
    push(day(1), 'income', 'Salary', 7100, 'Paycheck – Northwind Corp')
    push(day(15), 'income', 'Salary', 7100, 'Paycheck – Northwind Corp')
    if (m % 2 === 1) push(day(21), 'income', 'Freelance', 1200 + Math.round(r() * 1400), 'Consulting invoice')
    push(day(28), 'income', 'Dividends', 520 + Math.round(r() * 160), 'Brokerage dividends')
    if (m === 2) push(day(10), 'income', 'Bonus', 9000, 'Annual performance bonus')

    // Fixed expenses
    push(day(2), 'expense', 'Housing', 2640, 'Mortgage payment')
    push(day(3), 'expense', 'Insurance', 385, 'Home & auto insurance')
    push(day(5), 'expense', 'Utilities', 160 + Math.round(r() * 70), 'Electric & water')
    push(day(6), 'expense', 'Utilities', 89, 'Internet & mobile')
    push(day(8), 'expense', 'Subscriptions', 17.99, 'Streaming')
    push(day(9), 'expense', 'Subscriptions', 12.99, 'Music & cloud storage')
    push(day(11), 'expense', 'Subscriptions', 49, 'Gym membership')
    push(day(12), 'expense', 'Education', 180, 'Online courses')

    // Variable expenses
    for (let w = 0; w < 4; w++)
      push(day(3 + w * 7), 'expense', 'Groceries', 120 + r() * 85, w % 2 ? 'Whole Foods' : 'Trader Joe\'s')
    const dining = ['Sushi Nakazawa', 'Café Luna', 'The Smith', 'Blue Hill', 'Taco Tuesday', 'Brunch – Sunday Cafe']
    for (let i = 0; i < 5; i++) push(day(4 + i * 5), 'expense', 'Dining', 38 + r() * 120, dining[Math.floor(r() * dining.length)])
    push(day(7), 'expense', 'Transport', 65 + r() * 20, 'Fuel')
    push(day(19), 'expense', 'Transport', 58 + r() * 25, 'Fuel')
    push(day(14), 'expense', 'Transport', 95, 'Auto loan insurance rider')
    push(day(13), 'expense', 'Health', 40 + r() * 140, 'Pharmacy & copays')
    push(day(17), 'expense', 'Shopping', 90 + r() * 420, 'Apple Store / online order')
    push(day(24), 'expense', 'Shopping', 60 + r() * 180, 'Clothing')
    push(day(22), 'expense', 'Entertainment', 45 + r() * 150, 'Concert / cinema')
    if (m === 1) push(day(16), 'expense', 'Travel', 2450, 'Flights & hotel – Lisbon')
    if (m === 4) push(day(18), 'expense', 'Travel', 1680, 'Weekend getaway – Napa')
    if (m === 3) push(day(20), 'expense', 'Health', 1150, 'Dental procedure')
    if (m === 5) push(day(9), 'expense', 'Shopping', 1899, 'New laptop')

    // Investments
    push(day(2), 'investment', 'Retirement', 1900, '401(k) + Roth IRA contribution')
    push(day(16), 'investment', 'Stocks / ETFs', 1500, 'Auto-invest – Global ETF')
    if (m % 3 === 0) push(day(20), 'investment', 'Crypto', 400, 'BTC DCA')
  }
  return tx.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function seedState() {
  return {
    settings: {
      currency: 'USD',
      target: { ...DEFAULT_TARGET },
      budgets: { ...DEFAULT_BUDGETS },
      projection: { currentAge: 35, retireAge: 60, monthlySavings: 3800, annualReturn: 7, inflation: 2.8, shockPct: 0, shockYear: 10, useHoldings: true, startingBalance: 0 },
    },
    holdings: seedHoldings(),
    transactions: seedTransactions(),
  }
}

/** A brand-new account: defaults only, no holdings or transactions. */
export function blankState() {
  const s = seedState()
  return { ...s, holdings: [], transactions: [] }
}
