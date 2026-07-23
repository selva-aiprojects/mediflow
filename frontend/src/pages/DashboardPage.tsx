// @ts-nocheck
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Bell, ChevronDown, Package, Plus, ShoppingBag, Users, WalletCards, TrendingUp, TrendingDown, Clock, RefreshCw, Sparkles } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { dashboardApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { DashboardStats, SalesChartData } from '@/types'

const fallbackStats: DashboardStats = { totalSales: 0, totalPurchases: 0, totalProfit: 0, totalBills: 0, totalItemsSold: 0, totalCustomers: 0, totalMedicines: 0, lowStockItems: 0, expiringItems: 0, pendingOrders: 0, todaySales: 0, todayBills: 0 }
const fallbackChart: SalesChartData[] = []

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#dfe8ec] bg-white text-[#1A2B4C] shadow-[0_2px_8px_rgba(26,43,76,.035)] ${className}`}>{children}</section>
}

export default function DashboardPage() {
  const [stats, setStats] = useState(fallbackStats)
  const [chart, setChart] = useState(fallbackChart)
  const [products, setProducts] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const loadData = () => {
    dashboardApi.getStats().then(({ data }) => { setStats(data); setLoading(false) }).catch(() => setLoading(false))
    dashboardApi.getSalesChart(7).then(({ data }) => {
      if (Array.isArray(data) && data.some((item: any) => item.sales || item.profit || item.bills)) {
        setChart(data.map((item: any) => ({ ...item, date: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }) })))
      }
    }).catch(() => undefined)
    dashboardApi.getTopMedicines().then(({ data }) => { if (Array.isArray(data) && data.length) setProducts(data) }).catch(() => undefined)
    dashboardApi.getRecentActivity().then(({ data }) => { if (Array.isArray(data)) setRecentActivity(data.slice(0, 6)) }).catch(() => undefined)
    setLastRefresh(new Date())
  }

  useEffect(() => {
    loadData()
    intervalRef.current = setInterval(loadData, 30000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const salesDelta = stats.salesDeltaPercent || 0
  const isUp = salesDelta >= 0

  const summary = [
    { label: "Today's sales", value: formatCurrency(stats.todaySales), note: isUp ? `+${salesDelta}% from yesterday` : `${salesDelta}% from yesterday`, icon: WalletCards, iconClass: 'bg-[#eaf3ff] text-[#007BFF]', trend: isUp },
    { label: 'Bills today', value: String(stats.todayBills), note: `${stats.yesterdayBills || 0} yesterday`, icon: ShoppingBag, iconClass: 'bg-sky-50 text-sky-600', trend: null },
    { label: 'Total customers', value: String(stats.totalCustomers), note: `${stats.totalMedicines} medicines in catalog`, icon: Users, iconClass: 'bg-violet-50 text-violet-600', trend: null },
    { label: 'Inventory alerts', value: String(stats.lowStockItems + stats.expiringItems), note: `${stats.lowStockItems} low stock · ${stats.expiringItems} expiring`, icon: Package, iconClass: stats.lowStockItems > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600', trend: null },
  ]

  return <div className="space-y-6">
    {/* Header with greeting and refresh */}
    <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Pharmacy workspace</p>
        <h1 className="text-3xl font-bold tracking-[-.045em] text-[#1A2B4C] sm:text-[34px]">{getGreeting()}</h1>
        <p className="mt-2 text-sm text-slate-500">
          <Clock className="inline h-3.5 w-3.5 mr-1" />
          Last updated: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={loadData} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe8ec] bg-white text-slate-500 hover:bg-slate-50" title="Refresh"><RefreshCw className="h-4 w-4" /></button>
        <Link to="/notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#dfe8ec] bg-white text-slate-500 hover:bg-slate-50"><Bell className="h-4 w-4" /><i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" /></Link>
        <Link to="/sales" className="flex h-10 items-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-semibold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> New sale</Link>
      </div>
    </header>

    {/* Summary cards */}
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {summary.map((item) => <SectionCard key={item.label} className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-[-.04em]">{loading ? '—' : item.value}</p>
          </div>
          <div className={`grid h-10 w-10 place-items-center rounded-xl ${item.iconClass}`}><item.icon className="h-5 w-5" /></div>
        </div>
        <p className={`mt-4 flex items-center gap-1 text-xs font-medium ${item.trend === true ? 'text-[#24a87d]' : item.trend === false ? 'text-rose-500' : 'text-slate-500'}`}>
          {item.trend === true && <TrendingUp className="h-3.5 w-3.5" />}
          {item.trend === false && <TrendingDown className="h-3.5 w-3.5" />}
          {item.note}
        </p>
      </SectionCard>)}
    </div>

    {/* Chart + Inventory alerts */}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.85fr)]">
      <SectionCard className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#e7eef2] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold">Revenue performance</h2>
            <p className="mt-1 text-sm text-slate-500">Sales and profit for the last 7 days</p>
          </div>
          <div className="flex gap-4 text-xs font-semibold text-slate-600"><span>● Sales</span><span className="text-[#24a87d]">● Profit</span></div>
        </div>
        <div className="h-[310px] px-3 pb-4 pt-6">
          {chart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barGap={5}>
                <CartesianGrid vertical={false} stroke="#e7eef2" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#748395' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#748395' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="sales" fill="#007BFF" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="profit" fill="#33CC99" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {loading ? 'Loading chart data...' : 'No sales data for the last 7 days'}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <h2 className="text-base font-bold">Inventory alerts</h2>
        <p className="mt-1 text-sm text-slate-500">Attention needed today</p>
        <div className="mt-5 space-y-3">
          <Link to="/inventory" className="block rounded-xl border border-amber-200 bg-amber-50 p-3 hover:bg-amber-100 transition-colors">
            <p className="text-sm font-semibold">Low stock</p>
            <p className="text-xs text-slate-500">{stats.lowStockItems} items below reorder level</p>
          </Link>
          <Link to="/inventory" className="block rounded-xl border border-rose-200 bg-rose-50 p-3 hover:bg-rose-100 transition-colors">
            <p className="text-sm font-semibold">Expiry review</p>
            <p className="text-xs text-slate-500">{stats.expiringItems} batches expiring within 60 days</p>
          </Link>
          {stats.pendingOrders > 0 && (
            <Link to="/purchase-orders" className="block rounded-xl border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100 transition-colors">
              <p className="text-sm font-semibold">Pending purchase orders</p>
              <p className="text-xs text-slate-500">{stats.pendingOrders} orders awaiting action</p>
            </Link>
          )}
        </div>
      </SectionCard>
    </div>

    {/* Best sellers + Recent activity + CTA */}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(350px,.75fr)]">
      <SectionCard>
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-base font-bold">Best sellers</h2>
            <p className="mt-1 text-sm text-slate-500">Most dispensed medicines this week</p>
          </div>
          <Link to="/inventory" className="text-sm font-semibold text-[#007BFF]">View inventory</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left">
            <thead className="border-y border-[#e7eef2] bg-[#fbfcfb] text-[11px] font-bold uppercase tracking-[.08em] text-slate-400">
              <tr><th className="px-6 py-3">Medicine</th><th className="px-5 py-3">Units sold</th><th className="px-6 py-3 text-right">Revenue</th></tr>
            </thead>
            <tbody>
              {products.length > 0 ? products.map((product: any, index: number) => (
                <tr key={product.id || product.name} className="border-b border-[#eef2f4] last:border-0">
                  <td className="px-6 py-4"><p className="text-sm font-semibold">{index + 1}. {product.name}</p><p className="text-xs text-slate-500">{product.category}</p></td>
                  <td className="px-5 text-sm text-slate-600">{product.quantity}</td>
                  <td className="px-6 text-right text-sm font-bold">{formatCurrency(product.amount)}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-400">{loading ? 'Loading...' : 'No sales data yet'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex flex-col gap-6">
        {/* Recent activity */}
        <SectionCard className="flex-1 p-6">
          <h2 className="text-base font-bold">Recent activity</h2>
          <p className="mt-1 text-sm text-slate-500">Latest actions across the pharmacy</p>
          <div className="mt-4 space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#007BFF]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#1A2B4C]">{activity.action} — {activity.entityType || 'System'}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System'} · {new Date(activity.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-4">{loading ? 'Loading...' : 'No recent activity'}</p>
            )}
          </div>
        </SectionCard>

        {/* AI Predictions */}
        <SectionCard className="bg-[#1A2B4C] p-6 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/0 blur-2xl"></div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">Cognivectra AI</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-300">Predictive analytics & insights for your store.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Sales Forecast</p>
              <p className="mt-1 text-sm text-white">Expected revenue today: <b>₹1,45,000</b> <span className="text-emerald-400 font-medium text-xs ml-1">↑ 12%</span></p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">Stockout Risk</p>
              <p className="mt-1 text-sm text-white">High risk for <b>Paracetamol 500mg</b> by tomorrow evening.</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">Demand Surge</p>
              <p className="mt-1 text-sm text-white">Anticipating 25% increase in <b>Cough Syrups</b> this weekend due to weather.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  </div>
}
