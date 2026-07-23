import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Activity, ShieldCheck, Zap, Database, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white selection:bg-[#33CC99] selection:text-[#0a0f1c]">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#007BFF]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#33CC99]/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#007BFF] to-[#33CC99] text-white shadow-[0_0_20px_rgba(51,204,153,0.3)]">
            <Activity className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">Cybelinx</p>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/login" className="hidden sm:flex h-10 items-center justify-center rounded-xl bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 border border-white/10">
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32 lg:pt-32">
        {/* Badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#33CC99]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Introducing Cybelinx AI 2.0</span>
        </div>

        {/* Hero Text */}
        <h1 className="max-w-4xl text-center text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
          The operating system for <span className="bg-gradient-to-r from-[#007BFF] to-[#33CC99] bg-clip-text text-transparent">modern pharmacies.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-400">
          Supercharge your pharmacy operations with predictive AI, seamless POS, and automated inventory management. Cybelinx handles the complexity so you can focus on patient care.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link to="/login" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#007BFF] to-[#33CC99] px-8 text-base font-bold text-white shadow-[0_0_40px_rgba(51,204,153,0.4)] transition-all hover:shadow-[0_0_60px_rgba(51,204,153,0.6)] hover:scale-105 active:scale-95">
            Launch Workspace <ArrowRight className="h-5 w-5" />
          </Link>
          <a href="#features" className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10">
            Explore Features
          </a>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#121c2d]/80 p-2 shadow-2xl backdrop-blur-xl sm:p-4 relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-transparent to-transparent z-10 top-1/2"></div>
          <div className="relative rounded-[1.5rem] overflow-hidden border border-white/5 bg-[#0a0f1c]">
            {/* Mock Toolbar */}
            <div className="flex h-12 items-center gap-2 border-b border-white/5 bg-white/5 px-4 backdrop-blur-md">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="mx-auto flex h-6 w-1/3 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-500">cybelinx.app</div>
            </div>
            {/* Image mock or grid */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70 transition-opacity duration-700 group-hover:opacity-100">
              <div className="col-span-2 space-y-6">
                <div className="h-40 rounded-2xl border border-white/10 bg-white/5"></div>
                <div className="h-64 rounded-2xl border border-white/10 bg-white/5"></div>
              </div>
              <div className="space-y-6">
                <div className="h-24 rounded-2xl border border-white/10 bg-white/5"></div>
                <div className="h-40 rounded-2xl border border-white/10 bg-[#33CC99]/10 border-[#33CC99]/20"></div>
                <div className="h-32 rounded-2xl border border-white/10 bg-white/5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="mt-32 w-full max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white mb-12">Built for high-volume environments</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]">
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#007BFF]/20 text-[#007BFF]"><Zap className="h-6 w-6" /></div>
              <h3 className="text-lg font-bold text-white">Lightning Fast POS</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">Process prescriptions and OTC sales in seconds with our optimized keyboard-first point of sale interface.</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]">
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#33CC99]/20 text-[#33CC99]"><ShieldCheck className="h-6 w-6" /></div>
              <h3 className="text-lg font-bold text-white">Enterprise Security</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">Bank-grade encryption, role-based access control, and comprehensive audit logs protect your pharmacy data.</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]">
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-400"><Database className="h-6 w-6" /></div>
              <h3 className="text-lg font-bold text-white">Smart Inventory</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">AI-powered restock suggestions, automated expiry tracking, and real-time multi-store sync.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 w-full max-w-6xl border-t border-white/10 pt-10 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
          <p>© 2026 Cybelinx Inc. All rights reserved.</p>
          <div className="mt-4 flex gap-6 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
