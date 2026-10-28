import { useMemo, useState } from 'react'
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, Gauge, Landmark, LineChart, Lock, Menu, Moon, PieChart as PieIcon,
  ShieldCheck, Sun, TrendingDown, Wallet, X, KeyRound, Download, EyeOff, PlayCircle,
} from 'lucide-react'
import { LogoMark } from '../components/Brand'
import { Slider } from '../components/ui'
import { Link } from '../lib/router'
import { useTheme } from '../lib/theme'
import { useAuth } from '../lib/auth'
import { money, moneyCompact } from '../lib/format'
import { project } from '../lib/calc'

const NAV = [['Features', '#features'], ['How it works', '#how'], ['Planner', '#planner'], ['Privacy', '#privacy'], ['FAQ', '#faq']]

function Nav() {
  const { dark, toggle } = useTheme()
  const { status } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-xl border-b hairline">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Aura Wealth home">
          <LogoMark size={34} /><span className="text-[17px] font-bold tracking-tight t-label">Aura Wealth</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Sections">
          {NAV.map(([l, h]) => <a key={h} href={h} className="px-3 min-h-[44px] inline-flex items-center rounded-full text-[14px] font-medium t-label-2 hover:t-label hover:bg-fill transition-all duration-300 ease-apple">{l}</a>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle dark mode" className="w-11 h-11 rounded-full flex items-center justify-center t-label-2 hover:bg-fill transition-all duration-300 ease-apple">
            {dark ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          {status === 'authed' ? (
            <Link to="/app" className="inline-flex items-center min-h-[44px] px-5 rounded-full bg-apple-blue text-white text-[14px] font-semibold">Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex items-center min-h-[44px] px-4 rounded-full text-[14px] font-semibold t-label hover:bg-fill">Log in</Link>
              <Link to="/signup" className="inline-flex items-center min-h-[44px] px-5 rounded-full bg-apple-blue text-white text-[14px] font-semibold shadow-[0_6px_16px_rgba(0,122,255,0.3)] hover:brightness-110 transition-all duration-300 ease-apple">Get started</Link>
            </>
          )}
          <button className="md:hidden w-11 h-11 rounded-full flex items-center justify-center t-label hover:bg-fill" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-5 pb-4 anim-fade border-t hairline">
          {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="flex items-center min-h-[48px] text-[16px] font-medium t-label">{l}</a>)}
          <Link to="/login" className="flex items-center min-h-[48px] text-[16px] font-medium text-apple-blue">Log in</Link>
        </div>
      )}
    </header>
  )
}

/* ---------- Hero product mock (illustrative sample numbers) ---------- */
const MOCK_TREND = [
  ['Nov', 1.03], ['Dec', 1.05], ['Jan', 1.06], ['Feb', 1.08], ['Mar', 1.1], ['Apr', 1.11], ['May', 1.13], ['Jun', 1.15], ['Jul', 1.16], ['Aug', 1.18], ['Sep', 1.19], ['Oct', 1.2],
].map(([m, v], i) => ({ m, v: Math.round(v * 1e6 + Math.sin(i * 1.7) * 6000) }))
const MOCK_ALLOC = [['Stocks / ETFs', 40, '#007AFF'], ['Real estate', 48, '#FF9500'], ['Cash', 5, '#30D158'], ['Alternatives', 7, '#5856D6']]

function HeroMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[40px] opacity-60 blur-3xl" style={{ background: 'radial-gradient(60% 60% at 30% 20%,rgba(0,122,255,.35),transparent), radial-gradient(50% 50% at 80% 80%,rgba(88,86,214,.35),transparent)' }} />
      <div className="glass relative p-4 sm:p-6 rotate-0 lg:[transform:perspective(1600px)_rotateY(-6deg)_rotateX(3deg)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[12px] font-medium t-label-2">Total net worth</p>
            <p className="text-[34px] sm:text-[40px] font-bold num t-label leading-tight">$1,204,800</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-apple-green/15 text-apple-green text-[13px] font-semibold px-3 py-1.5"><ArrowUpRight size={15} />+8.9%</span>
        </div>
        <div className="h-[150px] sm:h-[190px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_TREND} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
              <defs><linearGradient id="hm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#007AFF" stopOpacity={0.35} /><stop offset="100%" stopColor="#007AFF" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: 'var(--label-2)', fontSize: 11 }} interval={2} />
              <YAxis hide domain={['dataMin - 30000', 'dataMax + 20000']} />
              <Area type="monotone" dataKey="v" stroke="#007AFF" strokeWidth={3} fill="url(#hm)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          {[['Savings rate', '54.9%', '#5856D6'], ['Cash cushion', '11.1 mo', '#30D158'], ['Net cash flow', '+$9.4K', '#007AFF']].map(([l, v, c]) => (
            <div key={l} className="rounded-[14px] bg-fill px-3 py-2.5"><p className="text-[11px] t-label-2">{l}</p><p className="text-[16px] font-bold num" style={{ color: c }}>{v}</p></div>
          ))}
        </div>
      </div>

      <div className="glass hidden sm:flex items-center gap-4 absolute -bottom-8 -left-6 lg:-left-12 p-4 !rounded-[22px]">
        <div className="w-[84px] h-[84px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={MOCK_ALLOC.map(([n, v, c]) => ({ n, v, c }))} dataKey="v" innerRadius="62%" outerRadius="100%" paddingAngle={3} cornerRadius={5} stroke="none" isAnimationActive={false}>
              {MOCK_ALLOC.map(([n, , c]) => <Cell key={n} fill={c} />)}
            </Pie></PieChart>
          </ResponsiveContainer>
        </div>
        <div><p className="text-[12px] t-label-2">Asset allocation</p><p className="text-[15px] font-semibold t-label">4 asset classes</p><p className="text-[12px] text-apple-orange font-medium">Real estate +7.9 pt vs target</p></div>
      </div>
      <p className="text-right text-[11px] t-label-3 mt-4 sm:mt-6">Illustrative sample data</p>
    </div>
  )
}

function Hero() {
  const { status } = useAuth()
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-10 items-center">
        <div className="anim-view">
          <span className="inline-flex items-center gap-2 rounded-full bg-fill px-3.5 py-1.5 text-[13px] font-medium t-label-2"><span className="w-2 h-2 rounded-full bg-apple-green" /> Personal wealth planning, made calm</span>
          <h1 className="mt-5 text-[44px] sm:text-[64px] leading-[1.03] font-bold tracking-[-0.035em] t-label">
            Your whole financial life.<br />
            <span style={{ background: 'linear-gradient(90deg,#007AFF,#5856D6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>One clear picture.</span>
          </h1>
          <p className="mt-5 text-[18px] sm:text-[20px] leading-relaxed t-label-2 max-w-[34rem]">
            Aura Wealth brings your net worth, spending, investments and retirement plan together — so you always know where you stand and where you’re headed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to={status === 'authed' ? '/app' : '/signup'} className="inline-flex items-center justify-center gap-2 min-h-[54px] px-7 rounded-full bg-apple-blue text-white text-[16px] font-semibold shadow-[0_10px_24px_rgba(0,122,255,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 ease-apple">
              {status === 'authed' ? 'Open your dashboard' : 'Create free account'} <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="inline-flex items-center justify-center gap-2 min-h-[54px] px-7 rounded-full bg-fill t-label text-[16px] font-semibold hover:bg-fill-strong active:scale-[0.98] transition-all duration-300 ease-apple">
              <PlayCircle size={19} /> Try the live demo
            </Link>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[14px] t-label-2">
            {['No bank passwords', 'Your data stays yours', 'Export or delete anytime'].map((t) => <li key={t} className="flex items-center gap-1.5"><Check size={16} className="text-apple-green" />{t}</li>)}
          </ul>
        </div>
        <HeroMock />
      </div>
    </section>
  )
}

/* ---------- Sections ---------- */
const Section = ({ id, eyebrow, title, sub, children, className = '' }) => (
  <section id={id} className={`scroll-mt-20 mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-24 ${className}`}>
    <div className="max-w-2xl mb-12">
      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-apple-blue mb-3">{eyebrow}</p>
      <h2 className="text-[34px] sm:text-[46px] leading-[1.08] font-bold tracking-[-0.03em] t-label">{title}</h2>
      {sub && <p className="mt-4 text-[17px] sm:text-[19px] leading-relaxed t-label-2">{sub}</p>}
    </div>
    {children}
  </section>
)

const FEATURES = [
  [Wallet, '#007AFF', 'Net worth, always current', 'A live balance sheet of every asset and liability — cash, investments, property, loans and cards — with your own growth assumptions.'],
  [LineChart, '#30D158', 'Cash flow & budgets', 'Log income, spending and investing in two taps. See where money goes and which budgets are running hot before the month ends.'],
  [PieIcon, '#FF9500', 'Allocation & drift', 'Set target weights once. Aura Wealth shows how far your real mix has drifted so you know when to rebalance.'],
  [Gauge, '#5856D6', 'Retirement projections', 'Model compound growth with monthly savings, returns and inflation, then compare conservative, base and optimistic paths.'],
  [TrendingDown, '#FF3B30', 'Stress-test your plan', 'Drop a market crash into any year and watch what it costs your final number — before it happens for real.'],
  [Landmark, '#00C7BE', 'Built for how you live', 'Ten currencies, light and dark mode, and a layout that is just as comfortable on your phone as on a desktop.'],
]

function Features() {
  return (
    <Section id="features" eyebrow="Features" title="Everything you need to plan with confidence." sub="Four tools that work together, instead of four apps that don’t.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(([Icon, c, t, d]) => (
          <div key={t} className="glass glass-hover p-6 sm:p-7">
            <span className="w-12 h-12 rounded-[16px] flex items-center justify-center" style={{ background: `${c}1F`, color: c }}><Icon size={24} /></span>
            <h3 className="mt-5 text-[19px] font-semibold tracking-tight t-label">{t}</h3>
            <p className="mt-2 text-[15px] leading-relaxed t-label-2">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function How() {
  const steps = [
    ['1', 'Add what you own and owe', 'Enter accounts, property, investments and debts. Set an expected growth rate for each.'],
    ['2', 'Log your money in motion', 'Quick-add income, spending and investments, with budgets per category.'],
    ['3', 'Plan the future', 'Slide savings, returns and retirement age and watch your trajectory — and your stress tests — update live.'],
  ]
  return (
    <div id="how" className="scroll-mt-20" style={{ background: 'var(--fill)' }}>
      <Section eyebrow="How it works" title="From scattered to clear in three steps.">
        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map(([n, t, d]) => (
            <li key={n} className="relative">
              <span className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#007AFF,#5856D6)' }}>{n}</span>
              <h3 className="mt-4 text-[20px] font-semibold tracking-tight t-label">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed t-label-2">{d}</p>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  )
}

function Planner() {
  const [v, setV] = useState({ monthly: 1500, years: 25, ret: 7 })
  const pts = useMemo(() => project({ start: 0, monthly: v.monthly, annualReturn: v.ret, inflation: 2.5, currentAge: 0, endAge: v.years }).map((p) => ({ y: p.year, balance: Math.round(p.balance), put: Math.round(p.contributed) })), [v])
  const last = pts[pts.length - 1]
  return (
    <Section id="planner" eyebrow="Try it now" title="See what steady saving can become." sub="A taste of the projection tool inside — no sign-up needed. Illustrative only; real returns vary and aren’t guaranteed.">
      <div className="glass p-5 sm:p-8 grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-center">
        <div className="space-y-2">
          <Slider label="Save every month" value={v.monthly} min={100} max={10000} step={100} onChange={(x) => setV({ ...v, monthly: x })} format={(x) => money(x)} accent="#30D158" />
          <Slider label="For how long" value={v.years} min={1} max={45} onChange={(x) => setV({ ...v, years: x })} format={(x) => `${x} years`} accent="#5856D6" />
          <Slider label="Average yearly return" value={v.ret} min={0} max={12} step={0.5} onChange={(x) => setV({ ...v, ret: x })} format={(x) => `${x}%`} accent="#FF9500" />
        </div>
        <div>
          <p className="text-[14px] t-label-2">After {v.years} years you could have</p>
          <p className="text-[44px] sm:text-[56px] font-bold num tracking-tight t-label leading-none mt-1" aria-live="polite">{money(last.balance)}</p>
          <p className="text-[14px] t-label-2 mt-2">from <strong className="t-label num">{money(last.put)}</strong> contributed — <strong className="text-apple-green num">{money(last.balance - last.put)}</strong> from growth.</p>
          <div className="h-[200px] -ml-2 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pts} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#30D158" stopOpacity={0.4} /><stop offset="100%" stopColor="#30D158" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="y" tickLine={false} axisLine={false} tick={{ fill: 'var(--label-2)', fontSize: 11 }} minTickGap={30} />
                <YAxis hide />
                <Tooltip formatter={(x, n) => [moneyCompact(x), n]} labelFormatter={(y) => `Year ${y}`} contentStyle={{ borderRadius: 14, border: '1px solid var(--border)', background: 'var(--card-solid)', color: 'var(--label)' }} />
                <Area dataKey="put" name="Contributed" stroke="#8E8E93" strokeWidth={2} fill="none" dot={false} isAnimationActive={false} />
                <Area dataKey="balance" name="Projected" stroke="#30D158" strokeWidth={3} fill="url(#pl)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Privacy() {
  const items = [
    [KeyRound, 'Passwords are never stored', 'Only a salted scrypt hash of your password is kept — never the password itself.'],
    [Lock, 'Separate, private storage', 'Every account’s data is stored apart and can only be read with that account’s signed-in session.'],
    [EyeOff, 'No bank logins, ever', 'You type in your own numbers. There is nothing to connect and no credentials to leak.'],
    [Download, 'Yours to take or erase', 'Export everything as JSON or permanently delete your account and data from Settings.'],
  ]
  return (
    <div id="privacy" className="scroll-mt-20 text-white" style={{ background: 'linear-gradient(160deg,#101018 0%,#1C1C3A 100%)' }}>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mb-12">
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#64D2FF] mb-3"><ShieldCheck size={16} /> Privacy by design</p>
          <h2 className="text-[34px] sm:text-[46px] leading-[1.08] font-bold tracking-[-0.03em]">Your finances are personal. We treat them that way.</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map(([Icon, t, d]) => (
            <div key={t} className="rounded-[24px] bg-white/[0.06] border border-white/10 p-6 flex gap-4">
              <span className="w-12 h-12 shrink-0 rounded-[16px] bg-white/10 flex items-center justify-center"><Icon size={22} /></span>
              <div><h3 className="font-semibold text-[18px]">{t}</h3><p className="text-white/70 text-[15px] leading-relaxed mt-1">{d}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FAQ = [
  ['Do I need to connect my bank accounts?', 'No. You enter balances and transactions yourself, so there are no bank credentials to share and nothing syncing in the background. The trade-off is that you keep the numbers up to date.'],
  ['Who can see my data?', 'Only you, when signed in to your account. Each account’s data is stored separately and every request is tied to your signed session.'],
  ['Is this financial advice?', 'No. Aura Wealth is a planning and tracking tool. Projections are illustrations based on the assumptions you choose, not predictions or guarantees. Consider speaking with a licensed adviser for personal advice.'],
  ['Can I try it without signing up?', 'Yes — the live demo opens the full app with sample data that stays in your browser. Create an account whenever you want to keep your own numbers.'],
  ['Can I leave and take my data with me?', 'Any time. Export everything as a JSON file or delete your account permanently from Settings.'],
  ['Which currencies are supported?', 'USD, EUR, GBP, JPY, CAD, AUD, CHF, SGD, HKD and CNY. Currency changes how amounts are displayed; values are not converted automatically.'],
]

function Faq() {
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered.">
      <div className="max-w-3xl divide-y hairline glass !rounded-[24px] px-2 sm:px-4">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-1">
            <summary className="flex items-center justify-between gap-4 min-h-[60px] px-3 cursor-pointer list-none font-semibold t-label text-[16px] [&::-webkit-details-marker]:hidden">
              {q}<ChevronDown size={20} className="shrink-0 t-label-2 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="px-3 pb-5 -mt-1 text-[15px] leading-relaxed t-label-2">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}

function Cta() {
  const { status } = useAuth()
  return (
    <section className="mx-auto max-w-[1200px] px-5 sm:px-8 pb-16 sm:pb-24">
      <div className="rounded-[32px] px-6 py-14 sm:py-20 text-center text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0A84FF,#5856D6)' }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <h2 className="relative text-[32px] sm:text-[48px] leading-[1.08] font-bold tracking-[-0.03em] max-w-2xl mx-auto">Start seeing your wealth clearly today.</h2>
        <p className="relative mt-4 text-white/80 text-[17px]">Set up takes a couple of minutes. No bank passwords required.</p>
        <div className="relative mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={status === 'authed' ? '/app' : '/signup'} className="inline-flex items-center justify-center gap-2 min-h-[54px] px-8 rounded-full bg-white text-[#0A4FD6] text-[16px] font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-apple">
            {status === 'authed' ? 'Open dashboard' : 'Create free account'} <ArrowRight size={18} />
          </Link>
          <Link to="/demo" className="inline-flex items-center justify-center min-h-[54px] px-8 rounded-full bg-white/15 text-white text-[16px] font-semibold hover:bg-white/25 transition-all duration-300 ease-apple">Explore the demo</Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10 flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
        <div className="flex items-center gap-2.5"><LogoMark size={30} /><span className="font-bold t-label">Aura Wealth</span></div>
        <p className="text-[12.5px] leading-relaxed t-label-3 max-w-xl">
          Aura Wealth is a personal finance tracking and planning tool and does not provide investment, tax or legal advice. Projections are hypothetical illustrations based on user-supplied assumptions; they are not guarantees of future results and investing involves risk, including loss of principal.
        </p>
        <div className="flex gap-5 text-[14px] font-medium t-label-2">
          <Link to="/login">Log in</Link><Link to="/signup">Sign up</Link><Link to="/demo">Demo</Link>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="anim-fade">
      <Nav />
      <main>
        <Hero />
        <Features />
        <How />
        <Planner />
        <Privacy />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
