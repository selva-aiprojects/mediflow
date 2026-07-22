import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { doctorsApi } from '@/lib/api'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormTextarea } from '@/components/ui/form-field'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { showToast } from '@/components/ui/toast'

const formDefaults = { name: '', speciality: '', clinicHospital: '', registrationNo: '', mobile: '', email: '', address: '' }

export default function DoctorsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [form, setForm] = useState(formDefaults)
  const [editing, setEditing] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = () => doctorsApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(formDefaults); setEditing(null); setModalOpen(true) }
  const openEdit = (row: any) => { setForm({ name: row.name || '', speciality: row.speciality || '', clinicHospital: row.clinicHospital || '', registrationNo: row.registrationNo || '', mobile: row.mobile || '', email: row.email || '', address: row.address || '' }); setEditing(row); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return showToast('error', 'Doctor name is required')
    setSaving(true)
    try {
      if (editing) { await doctorsApi.update(editing.id, form); showToast('success', 'Doctor updated') }
      else { await doctorsApi.create(form); showToast('success', 'Doctor created') }
      setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to save') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await doctorsApi.delete(deleteTarget.id); showToast('success', 'Doctor deleted'); load() } catch { showToast('error', 'Failed to delete') }
    setDeleteTarget(null)
  }

  const columns: Column<any>[] = [
    { header: 'Doctor', render: (r) => <span className="font-semibold text-[#1A2B4C]">{r.name}</span> },
    { header: 'Speciality', render: (r) => r.speciality || '—' },
    { header: 'Clinic/Hospital', render: (r) => r.clinicHospital || '—' },
    { header: 'Registration', render: (r) => r.registrationNo || '—' },
    { header: 'Mobile', render: (r) => r.mobile || '—' },
    { header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${r.isActive ? 'bg-[#eefbf7] text-[#1f7f62]' : 'bg-[#fff1f2] text-[#a0162d]'}`}>{r.isActive ? 'Active' : 'Inactive'}</span> },
    { header: '', render: (r) => <div className="flex gap-1"><button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Edit</button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50">Delete</button></div>, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Prescription network</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Doctors</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Maintain doctor references for prescription billing and audit trails.</p></div>
      <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Add doctor</button>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search doctor, speciality, registration..." searchKeys={['name', 'speciality', 'registrationNo', 'mobile']} onRowClick={openEdit} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit doctor' : 'Add doctor'} description="Fill in doctor details.">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Dr. Name" className="sm:col-span-2" />
        <FormField label="Speciality" value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })} placeholder="e.g., General Physician" />
        <FormField label="Clinic/Hospital" value={form.clinicHospital} onChange={(e) => setForm({ ...form, clinicHospital: e.target.value })} />
        <FormField label="Registration No" value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} />
        <FormField label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        <FormField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="sm:col-span-2" />
        <FormTextarea label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="sm:col-span-2" />
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </Modal>
    <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete doctor" description={`Are you sure you want to delete "${deleteTarget?.name}"?`} confirmLabel="Delete" />
  </div>
}
