import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { customersApi } from '@/lib/api'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect } from '@/components/ui/form-field'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { showToast } from '@/components/ui/toast'

const formDefaults = { firstName: '', lastName: '', mobile: '', email: '', addressLine1: '', city: '', state: '', gender: '', isCreditAllowed: false }

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [form, setForm] = useState(formDefaults)
  const [editing, setEditing] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = () => customersApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(formDefaults); setEditing(null); setModalOpen(true) }
  const openEdit = (row: any) => { setForm({ firstName: row.firstName || '', lastName: row.lastName || '', mobile: row.mobile || '', email: row.email || '', addressLine1: row.addressLine1 || '', city: row.city || '', state: row.state || '', gender: row.gender || '', isCreditAllowed: row.isCreditAllowed ?? false }); setEditing(row); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.mobile) return showToast('error', 'Name and mobile are required')
    setSaving(true)
    try {
      if (editing) { await customersApi.update(editing.id, form); showToast('success', 'Customer updated') }
      else { await customersApi.create(form); showToast('success', 'Customer created') }
      setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to save') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await customersApi.delete(deleteTarget.id); showToast('success', 'Customer deleted'); load() } catch { showToast('error', 'Failed to delete') }
    setDeleteTarget(null)
  }

  const columns: Column<any>[] = [
    { header: 'Customer', render: (r) => <div><p className="font-semibold text-[#1A2B4C]">{r.firstName} {r.lastName || ''}</p><p className="text-xs text-slate-500">{r.customerCode || '—'}</p></div> },
    { header: 'Mobile', render: (r) => r.mobile || '—' },
    { header: 'City', render: (r) => r.city || '—' },
    { header: 'Loyalty', render: (r) => r.loyaltyPoints || 0 },
    { header: 'Credit', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${r.isCreditAllowed ? 'bg-[#eefbf7] text-[#1f7f62]' : 'bg-slate-100 text-slate-500'}`}>{r.isCreditAllowed ? 'Enabled' : 'Disabled'}</span> },
    { header: '', render: (r) => <div className="flex gap-1"><button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Edit</button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50">Delete</button></div>, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Master data</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Customers</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage patient/customer profiles, loyalty, and credit eligibility.</p></div>
      <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Add customer</button>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search customer, mobile, email..." searchKeys={['firstName', 'lastName', 'mobile', 'email', 'city']} onRowClick={openEdit} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit customer' : 'Add customer'} description="Fill in customer details." size="lg">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        <FormField label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <FormField label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required placeholder="10-digit mobile" />
        <FormField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
        <FormField label="Address" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className="sm:col-span-2" />
        <FormField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <FormField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <FormSelect label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} options={[{ value: '', label: 'Select' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
        <div className="flex items-center pt-6"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isCreditAllowed} onChange={(e) => setForm({ ...form, isCreditAllowed: e.target.checked })} className="h-4 w-4 rounded" /> Allow credit</label></div>
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </Modal>
    <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete customer" description={`Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName || ''}"?`} confirmLabel="Delete" />
  </div>
}
