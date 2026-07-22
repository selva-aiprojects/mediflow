import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { inventoryApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect, FormTextarea } from '@/components/ui/form-field'
import { showToast } from '@/components/ui/toast'

export default function InventoryPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [modalOpen, setModalOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState<any>(null)
  const [adjustQty, setAdjustQty] = useState('0')
  const [adjustReason, setAdjustReason] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => inventoryApi.getAll().then(({ data }) => { setRows(data.map((r: any) => ({ ...r, medicineName: r.medicine?.brandName || '', supplierCompanyName: r.supplier?.companyName || '' }))); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAdjust = (row: any) => { setAdjustTarget(row); setAdjustQty('0'); setAdjustReason(''); setModalOpen(true) }

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustReason) return showToast('error', 'Reason is required')
    setSaving(true)
    try {
      await inventoryApi.adjustStock({ batchId: adjustTarget.id, quantity: Number(adjustQty), reason: adjustReason })
      showToast('success', 'Stock adjusted'); setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to adjust') }
    setSaving(false)
  }

  const isExpiringSoon = (date: string) => { if (!date) return false; const d = new Date(date); const now = new Date(); return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 60 }
  const isExpired = (date: string) => { if (!date) return false; return new Date(date) < new Date() }

  const columns: Column<any>[] = [
    { header: 'Medicine', render: (r) => <div><p className="font-semibold text-[#1A2B4C]">{r.medicine?.brandName || '—'}</p><p className="text-xs text-slate-500">{r.batchNo}</p></div> },
    { header: 'Store', render: (r) => r.store?.name || '—' },
    { header: 'Supplier', render: (r) => r.supplier?.companyName || '—' },
    { header: 'Qty', render: (r) => <span className={`font-bold ${r.quantity <= 10 ? 'text-rose-500' : ''}`}>{r.quantity}</span> },
    { header: 'Expiry', render: (r) => r.expiryDate ? <span className={isExpired(r.expiryDate) ? 'text-rose-500 font-bold' : isExpiringSoon(r.expiryDate) ? 'text-amber-500 font-semibold' : ''}>{formatDate(r.expiryDate)}</span> : '—' },
    { header: 'MRP', render: (r) => formatCurrency(Number(r.mrp || 0)) },
    { header: 'Purchase', render: (r) => formatCurrency(Number(r.purchasePrice || 0)) },
    { header: '', render: (r) => <button onClick={(e) => { e.stopPropagation(); openAdjust(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Adjust</button>, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Stock control</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Inventory</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Track batches, expiry, quantity, rack placement, and supplier source.</p></div>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search medicine, batch, supplier..." searchKeys={['batchNo', 'medicineName', 'supplierCompanyName']} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Adjust stock" description={`Adjusting stock for ${adjustTarget?.medicine?.brandName || ''} (Batch: ${adjustTarget?.batchNo || ''})`} size="sm">
      <form onSubmit={handleAdjust} className="space-y-4">
        <p className="text-sm text-slate-500">Current quantity: <span className="font-bold">{adjustTarget?.quantity || 0}</span></p>
        <FormField label="Adjustment quantity" hint="Use negative for reduction" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} type="number" />
        <FormTextarea label="Reason" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="e.g., Expired items, Physical count correction..." />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : 'Apply adjustment'}</button>
        </div>
      </form>
    </Modal>
  </div>
}
