import { useEffect, useState } from 'react'
import { notificationsApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import { showToast } from '@/components/ui/toast'

export default function NotificationsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')

  const load = () => notificationsApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const markRead = async (row: any) => {
    if (row.isRead) return
    try { await notificationsApi.markRead(row.id); showToast('success', 'Marked as read'); load() } catch { showToast('error', 'Failed') }
  }

  const columns: Column<any>[] = [
    { header: 'Title', render: (r) => <span className={`font-semibold ${!r.isRead ? 'text-[#1A2B4C]' : 'text-slate-500'}`}>{r.title}</span> },
    { header: 'Type', render: (r) => <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize bg-[#eaf3ff] text-[#0053ad]">{r.type}</span> },
    { header: 'Message', render: (r) => <span className="text-slate-500 truncate max-w-xs block">{r.message || '—'}</span> },
    { header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${r.isRead ? 'bg-slate-100 text-slate-500' : 'bg-[#fff8e6] text-[#8a5f0a]'}`}>{r.isRead ? 'Read' : 'Unread'}</span> },
    { header: 'Created', render: (r) => r.createdAt ? formatDate(r.createdAt) : '—' },
    { header: '', render: (r) => !r.isRead ? <button onClick={(e) => { e.stopPropagation(); markRead(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Mark read</button> : null, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Action center</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Notifications</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">See inventory, expiry, payment, and system alerts in one queue.</p></header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search alerts..." searchKeys={['title', 'type', 'message']} onRowClick={markRead} />
  </div>
}
