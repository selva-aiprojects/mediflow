import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { storesApi } from '@/lib/api'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField } from '@/components/ui/form-field'
import { showToast } from '@/components/ui/toast'

const formDefaults = { code: '', name: '', addressLine1: '', city: '', state: '', phone: '', email: '', gstin: '', drugLicenseNo: '' }

export default function StoresPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [form, setForm] = useState(formDefaults)
  const [editing, setEditing] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => storesApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(formDefaults); setEditing(null); setModalOpen(true) }
  const openEdit = (row: any) => { setForm({ code: row.code || '', name: row.name || '', addressLine1: row.addressLine1 || '', city: row.city || '', state: row.state || '', phone: row.phone || '', email: row.email || '', gstin: row.gstin || '', drugLicenseNo: row.drugLicenseNo || '' }); setEditing(row); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.name) return showToast('error', 'Code and name are required')
    setSaving(true)
    try {
      if (editing) { await storesApi.update(editing.id, form); showToast('success', 'Store updated') }
      else { await storesApi.create(form); showToast('success', 'Store created') }
      setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const columns: Column<any>[] = [
    { header: 'Store', render: (r) => <div><p className="font-semibold text-[#1A2B4C]">{r.name}</p><p className="text-xs text-slate-500">{r.code}</p></div> },
    { header: 'City', render: (r) => r.city || '—' },
    { header: 'Phone', render: (r) => r.phone || '—' },
    { header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${r.isActive ? 'bg-[#eefbf7] text-[#1f7f62]' : 'bg-[#fff1f2] text-[#a0162d]'}`}>{r.isActive ? 'Active' : 'Inactive'}</span> },
    { header: 'Users', render: (r) => r._count?.users || 0 },
    { header: '', render: (r) => <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Edit</button>, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Multi-store</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Stores</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage branches, GST/drug licenses, and stock ownership.</p></div>
      <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Add store</button>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search store, city, code..." searchKeys={['name', 'code', 'city']} onRowClick={openEdit} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit store' : 'Add store'} description="Store details." size="lg">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <FormField label="Store code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required placeholder="e.g., HQ" />
        <FormField label="Store name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <FormField label="Address" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className="sm:col-span-2" />
        <FormField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <FormField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <FormField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <FormField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
        <FormField label="GSTIN" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
        <FormField label="Drug license" value={form.drugLicenseNo} onChange={(e) => setForm({ ...form, drugLicenseNo: e.target.value })} />
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  </div>
}
