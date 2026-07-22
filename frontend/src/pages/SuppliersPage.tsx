import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { suppliersApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField } from '@/components/ui/form-field'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { showToast } from '@/components/ui/toast'

const formDefaults = { companyName: '', contactPerson: '', gstin: '', drugLicenseNo: '', addressLine1: '', city: '', state: '', phone: '', email: '', creditDays: '0', leadTimeDays: '3' }

export default function SuppliersPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [form, setForm] = useState(formDefaults)
  const [editing, setEditing] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = () => suppliersApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(formDefaults); setEditing(null); setModalOpen(true) }
  const openEdit = (row: any) => { setForm({ companyName: row.companyName || '', contactPerson: row.contactPerson || '', gstin: row.gstin || '', drugLicenseNo: row.drugLicenseNo || '', addressLine1: row.addressLine1 || '', city: row.city || '', state: row.state || '', phone: row.phone || '', email: row.email || '', creditDays: String(row.creditDays || 0), leadTimeDays: String(row.leadTimeDays || 3) }); setEditing(row); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName) return showToast('error', 'Company name is required')
    setSaving(true)
    try {
      const payload = { ...form, creditDays: Number(form.creditDays), leadTimeDays: Number(form.leadTimeDays) }
      if (editing) { await suppliersApi.update(editing.id, payload); showToast('success', 'Supplier updated') }
      else { await suppliersApi.create(payload); showToast('success', 'Supplier created') }
      setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to save') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await suppliersApi.delete(deleteTarget.id); showToast('success', 'Supplier deleted'); load() } catch { showToast('error', 'Failed to delete') }
    setDeleteTarget(null)
  }

  const columns: Column<any>[] = [
    { header: 'Supplier', render: (r) => <div><p className="font-semibold text-[#1A2B4C]">{r.companyName}</p><p className="text-xs text-slate-500">{r.contactPerson || '—'}</p></div> },
    { header: 'GSTIN', render: (r) => r.gstin || '—' },
    { header: 'Phone', render: (r) => r.phone || '—' },
    { header: 'City', render: (r) => r.city || '—' },
    { header: 'Lead time', render: (r) => `${r.leadTimeDays || 0} days` },
    { header: 'Balance', render: (r) => <span className="font-bold">{formatCurrency(Number(r.currentBalance || 0))}</span> },
    { header: '', render: (r) => <div className="flex gap-1"><button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Edit</button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50">Delete</button></div>, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Master data</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Suppliers</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Maintain distributor contacts, GST details, and credit terms.</p></div>
      <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Add supplier</button>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search supplier, GSTIN, phone..." searchKeys={['companyName', 'contactPerson', 'gstin', 'phone', 'city']} onRowClick={openEdit} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit supplier' : 'Add supplier'} description="Fill in supplier details." size="lg">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <FormField label="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required placeholder="e.g., MediSupply" />
        <FormField label="Contact person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="Name" />
        <FormField label="GSTIN" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="15-digit GSTIN" />
        <FormField label="Drug license" value={form.drugLicenseNo} onChange={(e) => setForm({ ...form, drugLicenseNo: e.target.value })} placeholder="License number" />
        <FormField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
        <FormField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="email@supplier.com" />
        <FormField label="Address" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className="sm:col-span-2" placeholder="Street address" />
        <FormField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <FormField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <FormField label="Credit days" value={form.creditDays} onChange={(e) => setForm({ ...form, creditDays: e.target.value })} type="number" />
        <FormField label="Lead time (days)" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} type="number" />
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </Modal>
    <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete supplier" description={`Are you sure you want to delete "${deleteTarget?.companyName}"?`} confirmLabel="Delete" />
  </div>
}
