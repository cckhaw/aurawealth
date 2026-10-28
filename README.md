# Aura Wealth

Apple-HIG-styled personal finance & net worth tracker. React 18 + Vite + Tailwind CSS + Recharts + Lucide.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

- **Dashboard** – net worth, 30-day cash flow, savings rate, cash cushion, allocation donut with target drift, high-impact transactions.
- **Net Worth** – assets vs liabilities; add/edit/delete with valuation, acquisition date and growth rate.
- **Cash Flow** – filterable ledger, monthly budget bars, quick-add sheet.
- **Projections** – sliders, three return scenarios, inflation-adjusted value, market-crash stress test.
- **Settings** – theme (light/dark/auto), currency, target allocation, budgets, JSON export/import, reset.

All state persists in `localStorage` (`aura-wealth:v1`); first load is seeded with ~$1.2M net worth demo data.
Net-worth trend is *modeled* from each holding's growth assumption, not historical data. Currency changes display only (no FX conversion).
