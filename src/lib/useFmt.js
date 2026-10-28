import { useMemo } from 'react'
import { useStore } from './store'
import { money, moneyCompact, moneyExact } from './format'

export function useFmt() {
  const { state } = useStore()
  const c = state.settings.currency
  return useMemo(
    () => ({
      code: c,
      m: (n, o) => money(n, c, o),
      exact: (n) => moneyExact(n, c),
      compact: (n) => moneyCompact(n, c),
    }),
    [c],
  )
}
