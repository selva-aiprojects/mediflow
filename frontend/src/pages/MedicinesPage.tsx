import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { medicinesApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect, FormTextarea } from '@/components/ui/form-field'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { showToast } from '@/components/ui/toast'

const formDefaults = { brandName: '', genericName: '', strength: '', form: 'tablet', schedule: '', gstPercent: '12', hsnCode: '', barcode: '', unitType: 'strip', rackNumber: '', isBatchEnabled: true, isExpiryEnabled: true, isPrescriptionRequired: false }
const formOptions = { form: [{ value: 'tablet', label: 'Tablet' }, { value: 'capsule', label: 'Capsule' }, { value: 'syrup', label: 'Syrup' }, { value: 'injection', label: 'Injection' }, { value: 'cream', label: 'Cream' }, { value: 'ointment', label: 'Ointment' }, { value: 'drops', label: 'Drops' }, { value: 'inhaler', label: 'Inhaler' }, { value: 'powder', label: 'Powder' }, { value: 'gel', label: 'Gel' }], schedule: [{ value: '', label: 'General' }, { value: 'H', label: 'Schedule H' }, { value: 'H1', label: 'Schedule H1' }, { value: 'X', label: 'Schedule X' }], unitType: [{ value: 'strip', label: 'Strip' }, { value: 'bottle', label: 'Bottle' }, { value: 'vial', label: 'Vial' }, { value: 'tube', label: 'Tube' }, { value: 'box', label: 'Box' }, { value: 'piece', label: 'Piece' }] }

export default function MedicinesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [form, setForm] = useState(formDefaults)
  const [editing, setEditing] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = () => medicinesApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(formDefaults); setEditing(null); setModalOpen(true) }
  const openEdit = (row: any) => { setForm({ brandName: row.brandName || '', genericName: row.genericName || '', strength: row.strength || '', form: row.form || 'tablet', schedule: row.schedule || '', gstPercent: String(row.gstPercent || 12), hsnCode: row.hsnCode || '', barcode: row.barcode || '', unitType: row.unitType || 'strip', rackNumber: row.rackNumber || '', isBatchEnabled: row.isBatchEnabled ?? true, isExpiryEnabled: row.isExpiryEnabled ?? true, isPrescriptionRequired: row.isPrescriptionRequired ?? false }); setEditing(row); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brandName) return showToast('error', 'Brand name is required')
    setSaving(true)
    try {
      const payload = { ...form, gstPercent: Number(form.gstPercent) }
      if (editing) { await medicinesApi.update(editing.id, payload); showToast('success', 'Medicine updated') }
      else { await medicinesApi.create(payload); showToast('success', 'Medicine created') }
      setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to save') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await medicinesApi.delete(deleteTarget.id); showToast('success', 'Medicine deleted'); load() } catch { showToast('error', 'Failed to delete') }
    setDeleteTarget(null)
  }

  const columns: Column<any>[] = [
    { header: 'Medicine', render: (r) => <div><p className="font-semibold text-[#1A2B4C]">{r.brandName}</p><p className="text-xs text-slate-500">{r.genericName || '—'}</p></div> },
    { header: 'Form', render: (r) => <span className="capitalize">{r.form}</span> },
    { header: 'Schedule', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${r.schedule === 'H' || r.schedule === 'H1' ? 'bg-[#fff8e6] text-[#8a5f0a]' : r.schedule === 'X' ? 'bg-[#fff1f2] text-[#a0162d]' : 'bg-[#eefbf7] text-[#1f7f62]'}`}>{r.schedule || 'General'}</span> },
    { header: 'GST', render: (r) => `${r.gstPercent || 0}%` },
    { header: 'MRP', render: (r) => r.batches?.length ? formatCurrency(Number(r.batches[0].mrp)) : '—' },
    { header: 'Stock', render: (r) => <span className="font-bold">{r.batches?.reduce((s: number, b: any) => s + b.quantity, 0) || 0}</span> },
    { header: 'Rack No.', render: (r) => r.rackNumber || '—' },
    { header: '', render: (r) => <div className="flex gap-1"><button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Edit</button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50">Delete</button></div>, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Master data</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Medicines</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage your medicine catalog, GST, schedule, and stock rules.</p></div>
      <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Add medicine</button>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search brand, generic, barcode..." searchKeys={['brandName', 'genericName', 'barcode', 'strength']} onRowClick={openEdit} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit medicine' : 'Add medicine'} description="Fill in the medicine details." size="lg">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <FormField label="Brand name" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} required placeholder="e.g., Crocin" />
        <FormField label="Generic name" value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} placeholder="e.g., Paracetamol" />
        <FormField label="Strength" value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value })} placeholder="e.g., 650 mg" />
        <FormSelect label="Form" value={form.form} onChange={(e) => setForm({ ...form, form: e.target.value })} options={formOptions.form} />
        <FormSelect label="Schedule" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} options={formOptions.schedule} />
        <FormField label="GST %" value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })} type="number" />
        <FormField label="HSN Code" value={form.hsnCode} onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} placeholder="e.g., 3004" />
        <FormField label="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Scan or type barcode" />
        <FormSelect label="Unit type" value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })} options={formOptions.unitType} />
        <FormField label="Rack number" value={form.rackNumber} onChange={(e) => setForm({ ...form, rackNumber: e.target.value })} placeholder="e.g., A1-04" />
        <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isBatchEnabled} onChange={(e) => setForm({ ...form, isBatchEnabled: e.target.checked })} className="h-4 w-4 rounded" /> Batch tracking</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isExpiryEnabled} onChange={(e) => setForm({ ...form, isExpiryEnabled: e.target.checked })} className="h-4 w-4 rounded" /> Expiry tracking</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPrescriptionRequired} onChange={(e) => setForm({ ...form, isPrescriptionRequired: e.target.checked })} className="h-4 w-4 rounded" /> Prescription required</label>
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </Modal>
    <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete medicine" description={`Are you sure you want to delete "${deleteTarget?.brandName}"? This action cannot be undone.`} confirmLabel="Delete" />
  </div>
}
