import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const { data } = await authApi.login({ email, password })
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || "We couldn't sign you in. Please check your details.")
    } finally {
      setLoading(false)
    }
  }

  return <main className="grid min-h-screen bg-[#F4F7F6] lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,.95fr)]">
    <section className="relative hidden overflow-hidden bg-[#1A2B4C] p-12 lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,123,255,.24),transparent_34%),radial-gradient(circle_at_82%_76%,rgba(51,204,153,.22),transparent_32%)]" />
      <div className="relative">
        <div className="inline-flex rounded-[22px] bg-white p-3 shadow-2xl shadow-black/15">
          <img src="/brand/mediflow-logo.png" alt="MediFlow pharmacy management system" className="h-24 w-auto object-contain" />
        </div>
      </div>
      <div className="relative max-w-xl">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-[#33CC99]">Pharmacy management system</p>
        <h1 className="mt-5 text-5xl font-bold leading-[1.08] tracking-[-.045em] text-white">A calmer operating system for every counter.</h1>
        <p className="mt-6 max-w-md text-base leading-7 text-slate-200">Inventory, billing, staff, alerts, and reports stay connected in one focused workspace.</p>
        <div className="mt-10 grid grid-cols-3 gap-3">
          {[
            ['99.9%', 'Uptime'],
            ['24/7', 'Stock view'],
            ['1 place', 'To operate'],
          ].map(([value, label]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-300">{label}</p>
          </div>)}
        </div>
      </div>
      <p className="relative text-xs text-slate-300">Copyright 2026 MediFlow. Built for modern pharmacies.</p>
    </section>

    <section className="flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[410px]">
        <div className="mb-10 flex justify-center lg:hidden">
          <img src="/brand/mediflow-logo.png" alt="MediFlow pharmacy management system" className="h-28 w-auto object-contain" />
        </div>
        <div>
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf3ff] text-[#007BFF]"><LockKeyhole className="h-5 w-5" /></div>
          <h2 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to access your pharmacy workspace.</p>
        </div>

        <form onSubmit={submit} className="mt-9 space-y-5">
          {error && <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#1A2B4C]">Work email</span>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@pharmacy.com" className="w-full rounded-xl border border-[#dbe5ea] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#1A2B4C]">Password</span>
            <span className="relative block">
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full rounded-xl border border-[#dbe5ea] bg-white px-3.5 py-3 pr-11 text-sm outline-none transition focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A2B4C]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </span>
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-500"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#007BFF] focus:ring-[#007BFF]" /> Keep me signed in</label>
            <a className="font-semibold text-[#007BFF] hover:text-[#0053ad]" href="#">Forgot password?</a>
          </div>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#007BFF] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 transition hover:bg-[#0066d6] disabled:opacity-60">{loading ? 'Signing in...' : <>Sign in securely <ArrowRight className="h-4 w-4" /></>}</button>
        </form>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dfe8ec] bg-white px-4 py-3 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#33CC99]" />
          <p>Your session is protected with secure encryption and role-based access.</p>
        </div>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400"><Sparkles className="h-3.5 w-3.5 text-[#33CC99]" /> Powered by MediFlow</p>
      </div>
    </section>
  </main>
}
