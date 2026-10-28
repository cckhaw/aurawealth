import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

const Ctx = createContext(null)

/**
 * Holds the signed-in user plus their server-side data (loaded once, in the same
 * request that confirms the session) so the app never renders someone else's data.
 */
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading') // loading | anon | authed
  const [user, setUser] = useState(null)
  const [boot, setBoot] = useState(null) // { data, rev }

  useEffect(() => {
    let alive = true
    api('me')
      .then((r) => {
        if (!alive) return
        if (!r.user) return setStatus('anon')
        setUser(r.user)
        setBoot({ data: r.data, rev: r.rev })
        setStatus('authed')
      })
      .catch(() => alive && setStatus('anon'))
    return () => { alive = false }
  }, [])

  const enter = useCallback(async (path, payload) => {
    const r = await api(path, { method: 'POST', body: payload })
    // Always re-read from the server so the data matches the session that was just created.
    const me = await api('me')
    setUser(r.user)
    setBoot({ data: me.data, rev: me.rev })
    setStatus('authed')
  }, [])

  const logout = useCallback(async () => {
    await api('logout', { method: 'POST', body: {} }).catch(() => {})
    setUser(null)
    setBoot(null)
    setStatus('anon')
  }, [])

  const dropSession = useCallback(() => {
    setUser(null)
    setBoot(null)
    setStatus('anon')
  }, [])

  const value = useMemo(
    () => ({ status, user, boot, login: (b) => enter('login', b), signup: (b) => enter('signup', b), logout, dropSession }),
    [status, user, boot, enter, logout, dropSession],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
