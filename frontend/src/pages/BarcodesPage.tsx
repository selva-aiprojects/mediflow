import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { barcodesApi, medicinesApi } from '@/lib/api'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect } from '@/components/ui/form-field'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { showToast } from '@/components/ui/toast'

export default function BarcodesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [modalOpen, setModalOpen] = useState(false)
  const [medicines, setMedicines] = useState<any[]>([])
  const [form, setForm] = useState({ medicineId: '', labelType: 'medicine', barcodeData: '', barcodeFormat: 'CODE128' })
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = () => barcodesApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ medicineId: '', labelType: 'medicine', barcodeData: '', barcodeFormat: 'CODE128' }); setModalOpen(true)
    medicinesApi.getAll().then(({ data }) => setMedicines(Array.isArray(data) ? data : [])).catch(() => setMedicines([]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.medicineId || !form.barcodeData) return showToast('error', 'Medicine and barcode data are required')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setSaving(true)
    try {
      await barcodesApi.create({ ...form, createdBy: user.id })
      showToast('success', 'Barcode label created'); setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await barcodesApi.delete(deleteTarget.id); showToast('success', 'Deleted'); load() } catch { showToast('error', 'Failed') }
    setDeleteTarget(null)
  }

  const columns: Column<any>[] = [
    { header: 'Barcode', render: (r) => <span className="font-semibold text-[#1A2B4C]">{r.barcodeData}</span> },
    { header: 'Medicine', render: (r) => r.medicine?.brandName || '—' },
    { header: 'Type', render: (r) => <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize bg-[#eaf3ff] text-[#0053ad]">{r.labelType}</span> },
    { header: 'Printed', render: (r) => r.printCount || 0 },
    { header: 'Format', render: (r) => r.barcodeFormat || 'CODE128' },
    { header: '', render: (r) => <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50">Delete</button>, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Label printing</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Barcode labels</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Generate, preview, and track printable medicine barcode labels.</p></div>
      <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Generate label</button>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search barcode, medicine..." searchKeys={['barcodeData']} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate barcode label" description="Select medicine and enter barcode data." size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect label="Medicine" value={form.medicineId} onChange={(e) => setForm({ ...form, medicineId: e.target.value })} options={medicines.map((m) => ({ value: m.id, label: m.brandName }))} placeholder="Select..." />
        <FormSelect label="Label type" value={form.labelType} onChange={(e) => setForm({ ...form, labelType: e.target.value })} options={[{ value: 'medicine', label: 'Medicine label' }, { value: 'batch', label: 'Batch label' }, { value: 'shelf', label: 'Shelf label' }]} />
        <FormField label="Barcode data" value={form.barcodeData} onChange={(e) => setForm({ ...form, barcodeData: e.target.value })} placeholder="Enter or scan barcode" />
        <FormSelect label="Format" value={form.barcodeFormat} onChange={(e) => setForm({ ...form, barcodeFormat: e.target.value })} options={[{ value: 'CODE128', label: 'CODE128' }, { value: 'EAN13', label: 'EAN-13' }, { value: 'QR', label: 'QR Code' }]} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Creating...' : 'Generate'}</button>
        </div>
      </form>
    </Modal>
    <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete barcode label" description="Are you sure?" confirmLabel="Delete" />
  </div>
}
