import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { purchaseOrdersApi, suppliersApi, medicinesApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect, FormTextarea } from '@/components/ui/form-field'
import { showToast } from '@/components/ui/toast'

export default function PurchaseOrdersPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [modalOpen, setModalOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [form, setForm] = useState({ supplierId: '', notes: '', items: [] as any[] })
  const [saving, setSaving] = useState(false)

  const load = () => purchaseOrdersApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ supplierId: '', notes: '', items: [] }); setModalOpen(true)
    suppliersApi.getAll().then(({ data }) => setSuppliers(Array.isArray(data) ? data : [])).catch(() => setSuppliers([]))
    medicinesApi.getAll().then(({ data }) => setMedicines(Array.isArray(data) ? data : [])).catch(() => setMedicines([]))
  }

  const addItem = () => { setForm({ ...form, items: [...form.items, { medicineId: '', quantity: 1, unitPrice: 0, mrp: 0, gstPercent: 12 }] }) }
  const updateItem = (index: number, field: string, value: any) => { const items = [...form.items]; items[index] = { ...items[index], [field]: value }; setForm({ ...form, items }) }
  const removeItem = (index: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.supplierId) return showToast('error', 'Select a supplier')
    if (!form.items.length) return showToast('error', 'Add at least one item')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setSaving(true)
    try {
      await purchaseOrdersApi.create({ ...form, createdBy: user.id })
      showToast('success', 'Purchase order created'); setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to create PO') }
    setSaving(false)
  }

  const columns: Column<any>[] = [
    { header: 'PO No', render: (r) => <span className="font-semibold text-[#1A2B4C]">{r.poNo}</span> },
    { header: 'Date', render: (r) => r.poDate ? formatDate(r.poDate) : '—' },
    { header: 'Supplier', render: (r) => r.supplier?.companyName || '—' },
    { header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${r.status === 'received' ? 'bg-[#eefbf7] text-[#1f7f62]' : r.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-[#fff8e6] text-[#8a5f0a]'}`}>{r.status}</span> },
    { header: 'Items', render: (r) => r.items?.length || 0 },
    { header: 'Total', render: (r) => <span className="font-bold">{formatCurrency(Number(r.totalAmount || 0))}</span> },
    { header: '', render: (r) => r.status === 'draft' ? <button onClick={(e) => { e.stopPropagation(); purchaseOrdersApi.update(r.id, { status: 'submitted' }).then(() => { showToast('success', 'PO submitted'); load() }) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Submit</button> : null, className: 'text-right' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Procurement</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Purchase orders</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create and track supplier purchase orders before receiving stock.</p></div>
      <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Create PO</button>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search PO, supplier, status..." searchKeys={['poNo', 'status']} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create purchase order" description="Select supplier and add medicine items." size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect label="Supplier" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} options={suppliers.map((s) => ({ value: s.id, label: s.companyName }))} placeholder="Select supplier..." />
        {form.items.map((item, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_100px_100px_100px_40px] items-end">
            <FormSelect label={i === 0 ? 'Medicine' : ''} value={item.medicineId} onChange={(e) => updateItem(i, 'medicineId', e.target.value)} options={medicines.map((m) => ({ value: m.id, label: m.brandName }))} placeholder="Select..." />
            <FormField label={i === 0 ? 'Qty' : ''} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} type="number" min="1" />
            <FormField label={i === 0 ? 'Unit price' : ''} value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} type="number" />
            <FormField label={i === 0 ? 'GST %' : ''} value={item.gstPercent} onChange={(e) => updateItem(i, 'gstPercent', Number(e.target.value))} type="number" />
            <button type="button" onClick={() => removeItem(i)} className="text-rose-400 hover:text-rose-600 pt-6">{i === 0 ? 'Remove' : '×'}</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm font-semibold text-[#007BFF] hover:underline">+ Add item</button>
        <FormTextarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Creating...' : 'Create PO'}</button>
        </div>
      </form>
    </Modal>
  </div>
}
