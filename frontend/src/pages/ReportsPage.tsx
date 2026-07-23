import { useEffect, useState } from 'react'
import { reportsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

type Tab = 'daily' | 'audit' | 'suggestions'

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('daily')
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportsApi.getAll().then(({ data }) => setData(data || {})).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>

  const tabs: { key: Tab; label: string }[] = [{ key: 'daily', label: 'Daily summaries' }, { key: 'audit', label: 'Audit log' }, { key: 'suggestions', label: 'Purchase suggestions' }]

  // Format data for charts
  const chartData = [...(data.dailySummaries || [])]
    .sort((a, b) => new Date(a.summaryDate).getTime() - new Date(b.summaryDate).getTime())
    .map((s) => ({
      date: new Date(s.summaryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: Number(s.totalSales),
      profit: Number(s.totalProfit),
      bills: s.totalBills
    }));

  return <div className="space-y-6">
    <header><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Financial control</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Reports</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review sales, purchases, audit movement, and purchase suggestions.</p></header>
    <div className="flex gap-1 rounded-xl border border-[#dfe8ec] bg-white p-1">
      {tabs.map((t) => <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t.key ? 'bg-[#007BFF] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{t.label}</button>)}
    </div>
    
    {tab === 'daily' && (
      <div className="space-y-6">
        {chartData.length === 0 ? <p className="text-sm text-slate-500 py-8 text-center">No daily summaries yet.</p> : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#dfe8ec] bg-white p-6 shadow-[0_2px_8px_rgba(26,43,76,.035)]">
                <h3 className="text-sm font-bold text-[#1A2B4C] mb-6">Revenue & Profit Trend</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#007BFF" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f4" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `$${value}`} width={60} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} formatter={(value: any) => formatCurrency(Number(value))} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      <Area type="monotone" dataKey="sales" name="Total Sales" stroke="#007BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-[#dfe8ec] bg-white p-6 shadow-[0_2px_8px_rgba(26,43,76,.035)]">
                <h3 className="text-sm font-bold text-[#1A2B4C] mb-6">Daily Transactions (Bills)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f4" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={40} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      <Bar dataKey="bills" name="Bills Generated" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#1A2B4C] mt-8 mb-4">Detailed Breakdown</h3>
            <div className="space-y-3">
              {(data.dailySummaries || []).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-2xl border border-[#dfe8ec] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(26,43,76,.035)]">
                  <div><p className="text-sm font-bold text-[#1A2B4C]">{formatDate(s.summaryDate)}</p><p className="text-xs text-slate-500">{s.store?.name || 'All stores'}</p></div>
                  <div className="flex gap-6 text-sm"><span>Sales: <b>{formatCurrency(Number(s.totalSales))}</b></span><span className="text-[#1f7f62]">Profit: <b>{formatCurrency(Number(s.totalProfit))}</b></span><span>Bills: <b>{s.totalBills}</b></span></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )}
    
    {tab === 'audit' && (
      <div className="rounded-2xl border border-[#dfe8ec] bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fbfcfb] text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">
            <tr><th className="px-5 py-3">Action</th><th className="px-5 py-3">Entity</th><th className="px-5 py-3">User</th><th className="px-5 py-3">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-[#eef2f4]">
            {(data.auditLogs || []).length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No audit records.</td></tr> : (data.auditLogs || []).map((log: any) => (
              <tr key={log.id}><td className="px-5 py-3 text-sm font-medium">{log.action}</td><td className="px-5 py-3 text-sm text-slate-500">{log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)})` : ''}</td><td className="px-5 py-3 text-sm">{log.user ? `${log.user.firstName} ${log.user.lastName || ''}` : 'System'}</td><td className="px-5 py-3 text-sm text-slate-500">{log.createdAt ? formatDate(log.createdAt) : '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    
    {tab === 'suggestions' && (
      <div className="space-y-3">
        {(data.suggestions || []).length === 0 ? <p className="text-sm text-slate-500 py-8 text-center">No purchase suggestions yet.</p> : (data.suggestions || []).map((s: any) => (
          <div key={s.id} className="flex items-center justify-between rounded-2xl border border-[#dfe8ec] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(26,43,76,.035)]">
            <div><p className="text-sm font-bold text-[#1A2B4C]">{s.medicine?.brandName || 'Unknown'}</p><p className="text-xs text-slate-500">Current stock: {s.currentStock} | Suggested: {s.suggestedQuantity}</p></div>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${s.priority === 'critical' ? 'bg-[#fff1f2] text-[#a0162d]' : s.priority === 'high' ? 'bg-[#fff8e6] text-[#8a5f0a]' : 'bg-[#eaf3ff] text-[#0053ad]'}`}>{s.priority}</span>
          </div>
        ))}
      </div>
    )}
  </div>
}
