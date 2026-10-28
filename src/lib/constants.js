export const ASSET_CLASSES = {
  cash: { label: 'Cash', color: '#30D158', icon: 'Wallet' },
  stocks: { label: 'Stocks / ETFs', color: '#007AFF', icon: 'TrendingUp' },
  realEstate: { label: 'Real Estate', color: '#FF9500', icon: 'Home' },
  alternatives: { label: 'Alternatives', color: '#5856D6', icon: 'Gem' },
}

export const LIABILITY_CLASSES = {
  mortgage: { label: 'Mortgage', color: '#FF3B30', icon: 'Home' },
  loan: { label: 'Loans', color: '#FF9500', icon: 'Landmark' },
  creditCard: { label: 'Credit Cards', color: '#AF52DE', icon: 'CreditCard' },
}

export const TX_TYPES = {
  income: { label: 'Income', color: '#30D158' },
  expense: { label: 'Expense', color: '#FF3B30' },
  investment: { label: 'Investment', color: '#007AFF' },
}

export const CATEGORIES = {
  income: ['Salary', 'Bonus', 'Freelance', 'Dividends', 'Rental Income', 'Other Income'],
  expense: ['Housing', 'Groceries', 'Dining', 'Transport', 'Utilities', 'Health', 'Shopping', 'Travel', 'Entertainment', 'Subscriptions', 'Education', 'Insurance', 'Other'],
  investment: ['Stocks / ETFs', 'Retirement', 'Crypto', 'Real Estate', 'Alternatives'],
}

export const CATEGORY_COLORS = {
  Salary: '#30D158', Bonus: '#34C759', Freelance: '#64D2FF', Dividends: '#00C7BE', 'Rental Income': '#A2845E', 'Other Income': '#8E8E93',
  Housing: '#FF9500', Groceries: '#30D158', Dining: '#FF6482', Transport: '#64D2FF', Utilities: '#FFD60A',
  Health: '#FF3B30', Shopping: '#BF5AF2', Travel: '#5E5CE6', Entertainment: '#FF2D55', Subscriptions: '#0A84FF',
  Education: '#AC8E68', Insurance: '#32ADE6', Other: '#8E8E93',
  'Stocks / ETFs': '#007AFF', Retirement: '#5856D6', Crypto: '#FF9F0A', 'Real Estate': '#FF9500', Alternatives: '#AF52DE',
}

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'SGD', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'HKD', name: 'Hong Kong Dollar', locale: 'en-HK' },
  { code: 'CNY', name: 'Chinese Yuan', locale: 'zh-CN' },
]

export const DEFAULT_BUDGETS = {
  Housing: 3200, Groceries: 900, Dining: 600, Transport: 450, Utilities: 380,
  Health: 300, Shopping: 700, Travel: 800, Entertainment: 300, Subscriptions: 120,
  Education: 250, Insurance: 400, Other: 300,
}

export const DEFAULT_TARGET = { cash: 8, stocks: 42, realEstate: 40, alternatives: 10 }
