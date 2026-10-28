import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'aura-theme'
const Ctx = createContext(null)

const read = () => {
  try { return localStorage.getItem(KEY) || 'system' } catch { return 'system' }
}

/** Device-level theme (light / dark / system). Independent of who is signed in. */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(read)
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

  const value = useMemo(
    () => ({
      theme,
      dark,
      setTheme: (t) => {
        setThemeState(t)
        try { localStorage.setItem(KEY, t) } catch { /* private mode */ }
      },
      toggle: () => {
        const t = dark ? 'light' : 'dark'
        setThemeState(t)
        try { localStorage.setItem(KEY, t) } catch { /* private mode */ }
      },
    }),
    [theme, dark],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
