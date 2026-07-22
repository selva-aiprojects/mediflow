import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { invoicesApi, suppliersApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect } from '@/components/ui/form-field'
import { showToast } from '@/components/ui/toast'

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [modalOpen, setModalOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [form, setForm] = useState({ supplierId: '', invoiceNo: '', invoiceDate: '', dueDate: '', totalAmount: '', paidAmount: '' })
  const [saving, setSaving] = useState(false)

  const load = () => invoicesApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ supplierId: '', invoiceNo: '', invoiceDate: '', dueDate: '', totalAmount: '', paidAmount: '' }); setModalOpen(true)
    suppliersApi.getAll().then(({ data }) => setSuppliers(Array.isArray(data) ? data : [])).catch(() => setSuppliers([]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.supplierId || !form.invoiceNo || !form.invoiceDate || !form.totalAmount) return showToast('error', 'Required fields are missing')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setSaving(true)
    try {
      await invoicesApi.create({ ...form, totalAmount: Number(form.totalAmount), paidAmount: Number(form.paidAmount || 0), createdBy: user.id })
      showToast('success', 'Invoice created'); setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const columns: Column<any>[] = [
    { header: 'Invoice', render: (r) => <span className="font-semibold text-[#1A2B4C]">{r.invoiceNo}</span> },
    { header: 'Supplier', render: (r) => r.supplier?.companyName || '—' },
    { header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${(r.paymentStatus || r.status) === 'paid' ? 'bg-[#eefbf7] text-[#1f7f62]' : (r.paymentStatus || r.status) === 'unpaid' ? 'bg-[#fff1f2] text-[#a0162d]' : 'bg-[#fff8e6] text-[#8a5f0a]'}`}>{r.paymentStatus || r.status}</span> },
    { header: 'Due date', render: (r) => r.dueDate ? formatDate(r.dueDate) : '—' },
    { header: 'Amount', render: (r) => <span className="font-bold">{formatCurrency(Number(r.totalAmount || 0))}</span> },
    { header: 'Balance', render: (r) => formatCurrency(Number(r.balanceAmount || r.totalAmount || 0)) },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Supplier billing</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Invoices</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Track purchase invoices, due dates, and payment status.</p></div>
      <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Record invoice</button>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search invoice, supplier, status..." searchKeys={['invoiceNo', 'paymentStatus']} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record purchase invoice" description="Enter supplier invoice details." size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect label="Supplier" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} options={suppliers.map((s) => ({ value: s.id, label: s.companyName }))} placeholder="Select..." />
        <FormField label="Invoice number" value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Invoice date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} type="date" required />
          <FormField label="Due date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} type="date" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Total amount" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} type="number" required />
          <FormField label="Paid amount" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} type="number" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  </div>
}
