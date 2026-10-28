import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, LineChart, ShieldCheck, Sun, Moon } from 'lucide-react'
import { LogoMark } from '../components/Brand'
import { Button, Field } from '../components/ui'
import { Link, navigate } from '../lib/router'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'

const PERKS = [
  [LineChart, 'See your full picture', 'Net worth, cash flow, allocation and retirement projections in one calm dashboard.'],
  [ShieldCheck, 'Private to you', 'Each account’s data is stored separately and only readable with your sign-in.'],
  [Lock, 'No bank passwords', 'You enter your own numbers. Aura Wealth never asks to connect your bank.'],
]

export default function AuthPage({ mode }) {
  const signup = mode === 'signup'
  const { login, signup: doSignup } = useAuth()
  const { dark, toggle } = useTheme()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await (signup ? doSignup(f) : login(f))
      navigate('/app', { replace: true })
    } catch (e2) {
      setErr(e2.message)
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      <div className="flex flex-col px-5 sm:px-10 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Aura Wealth home">
            <LogoMark /> <span className="text-[17px] font-bold tracking-tight t-label">Aura Wealth</span>
          </Link>
          <button onClick={toggle} aria-label="Toggle dark mode" className="w-11 h-11 rounded-full bg-fill flex items-center justify-center t-label">
            {dark ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <form onSubmit={submit} className="w-full max-w-[400px] anim-view" noValidate>
            <h1 className="text-[32px] font-bold tracking-tight t-label">{signup ? 'Create your account' : 'Welcome back'}</h1>
            <p className="t-label-2 mt-1 mb-7">{signup ? 'Start tracking your net worth in minutes.' : 'Sign in to see your wealth.'}</p>

            <div className="space-y-4">
              {signup && (
                <Field label="Name">
                  <input className="field" autoComplete="name" autoFocus value={f.name} maxLength={60} onChange={(e) => setF({ ...f, name: e.target.value })} required />
                </Field>
              )}
              <Field label="Email">
                <input className="field" type="email" inputMode="email" autoComplete="email" autoFocus={!signup} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
              </Field>
              <Field label="Password" hint={signup ? 'At least 8 characters.' : undefined}>
                <div className="relative">
                  <input
                    className="field !pr-12"
                    type={show ? 'text' : 'password'}
                    autoComplete={signup ? 'new-password' : 'current-password'}
                    minLength={signup ? 8 : undefined}
                    value={f.password}
                    onChange={(e) => setF({ ...f, password: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center t-label-2">
                    {show ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </Field>
            </div>

            {err && <p role="alert" className="mt-4 text-[14px] text-apple-red bg-apple-red/10 rounded-[14px] px-4 py-3">{err}</p>}

            <Button type="submit" className="w-full mt-6 !min-h-[50px]" disabled={busy}>
              {busy ? 'One moment…' : signup ? 'Create account' : 'Sign in'} {!busy && <ArrowRight size={18} />}
            </Button>

            <p className="text-center text-[14px] t-label-2 mt-5">
              {signup ? 'Already have an account? ' : 'New to Aura Wealth? '}
              <Link to={signup ? '/login' : '/signup'} className="text-apple-blue font-semibold">{signup ? 'Sign in' : 'Create an account'}</Link>
            </p>
            <p className="text-center text-[13px] t-label-3 mt-3">
              or <Link to="/demo" className="text-apple-blue">explore the live demo</Link> without an account
            </p>
          </form>
        </div>
      </div>

      <aside className="hidden lg:flex items-center justify-center p-12 text-white relative overflow-hidden" style={{ background: 'linear-gradient(145deg,#0A84FF 0%,#5856D6 55%,#2C1E6B 100%)' }}>
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-[380px] h-[380px] rounded-full bg-apple-green/20 blur-3xl" />
        <div className="relative max-w-md">
          <h2 className="text-[40px] leading-[1.1] font-bold tracking-tight">Know where you stand. Plan where you’re going.</h2>
          <ul className="mt-10 space-y-6">
            {PERKS.map(([Icon, t, d]) => (
              <li key={t} className="flex gap-4">
                <span className="w-11 h-11 rounded-[14px] bg-white/15 backdrop-blur flex items-center justify-center shrink-0"><Icon size={20} /></span>
                <div><p className="font-semibold">{t}</p><p className="text-white/75 text-[14px] mt-0.5">{d}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
