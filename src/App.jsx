import { useEffect } from 'react'
import { useAuth } from './lib/auth'
import { navigate, usePath } from './lib/router'
import { StoreProvider, loadDemo, normalize } from './lib/store'
import { blankState } from './lib/seed'
import Landing from './views/Landing'
import AuthPage from './views/AuthPage'
import AppShell from './views/AppShell'
import { LogoMark } from './components/Brand'

function Splash() {
  return (
    <div className="min-h-dvh flex items-center justify-center" aria-busy="true" aria-label="Loading">
      <div className="animate-pulse"><LogoMark size={56} /></div>
    </div>
  )
}

export default function App() {
  const path = usePath()
  const { status, user, boot, dropSession } = useAuth()

  const protectedRoute = path === '/app'
  const guestRoute = path === '/login' || path === '/signup'

  useEffect(() => {
    if (status === 'anon' && protectedRoute) navigate('/login', { replace: true })
    if (status === 'authed' && guestRoute) navigate('/app', { replace: true })
  }, [status, protectedRoute, guestRoute])

  useEffect(() => {
    const titles = { '/': 'Aura Wealth — Your whole financial life, in focus', '/login': 'Sign in · Aura Wealth', '/signup': 'Create account · Aura Wealth', '/app': 'Aura Wealth', '/demo': 'Demo · Aura Wealth' }
    document.title = titles[path] || 'Aura Wealth'
  }, [path])

  if (path === '/demo')
    return <StoreProvider key="demo" mode="demo" initial={loadDemo()}><AppShell /></StoreProvider>

  if (status === 'loading') return <Splash />

  if (path === '/app') {
    if (status !== 'authed') return <Splash />
    // Keyed by user id: switching accounts always starts from a fresh store, never the previous user's state.
    return (
      <StoreProvider key={user.id} mode="user" initial={normalize(boot.data, blankState())} rev={boot.rev} onSignedOut={dropSession}>
        <AppShell />
      </StoreProvider>
    )
  }

  if (guestRoute) return status === 'authed' ? <Splash /> : <AuthPage key={path} mode={path === '/signup' ? 'signup' : 'login'} />

  return <Landing />
}
