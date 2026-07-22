import { useEffect, useState } from 'react'
import { settingsApi } from '@/lib/api'
import { showToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsApi.getAll().then(({ data }) => setRows(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>

  return <div className="space-y-6">
    <header><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">System setup</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Settings</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review business profile, users, permissions, GST mode, and operating controls.</p></header>
    <div className="space-y-3">
      {rows.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[#dfe8ec] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(26,43,76,.035)]">
          <div>
            <p className="text-sm font-bold text-[#1A2B4C]">{item.setting}</p>
            <p className="text-xs text-slate-500 mt-0.5">Owner: {item.owner}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1A2B4C]">{item.value}</span>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.status === 'active' ? 'bg-[#eefbf7] text-[#1f7f62]' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
}
