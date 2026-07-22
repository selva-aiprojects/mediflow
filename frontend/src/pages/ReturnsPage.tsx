import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { returnsApi, salesApi, medicinesApi, suppliersApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect, FormTextarea } from '@/components/ui/form-field'
import { showToast } from '@/components/ui/toast'

export default function ReturnsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [modalOpen, setModalOpen] = useState(false)
  const [returnType, setReturnType] = useState<'customer' | 'supplier'>('customer')
  const [bills, setBills] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [suppliersList, setSuppliersList] = useState<any[]>([])
  const [form, setForm] = useState({ billId: '', supplierId: '', reason: '', items: [] as any[] })
  const [saving, setSaving] = useState(false)

  const load = () => returnsApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = (type: 'customer' | 'supplier') => {
    setReturnType(type); setForm({ billId: '', supplierId: '', reason: '', items: [] }); setModalOpen(true)
    medicinesApi.getAll().then(({ data }) => setMedicines(Array.isArray(data) ? data : [])).catch(() => setMedicines([]))
    if (type === 'customer') salesApi.getAll().then(({ data }) => setBills(Array.isArray(data) ? data : [])).catch(() => setBills([]))
    else suppliersApi.getAll().then(({ data }) => setSuppliersList(Array.isArray(data) ? data : [])).catch(() => setSuppliersList([]))
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { medicineId: '', quantity: 1, unitPrice: 0 }] })
  const updateItem = (i: number, field: string, val: any) => { const items = [...form.items]; items[i] = { ...items[i], [field]: val }; setForm({ ...form, items }) }
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.reason || !form.items.length) return showToast('error', 'Reason and items are required')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setSaving(true)
    try {
      const payload = { ...form, createdBy: user.id, items: form.items.map((i) => ({ ...i, totalAmount: i.quantity * i.unitPrice })) }
      if (returnType === 'customer') await returnsApi.createCustomerReturn(payload)
      else await returnsApi.createSupplierReturn(payload)
      showToast('success', 'Return created'); setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const columns: Column<any>[] = [
    { header: 'Return No', render: (r) => <span className="font-semibold text-[#1A2B4C]">{r.returnNo}</span> },
    { header: 'Type', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${r.returnType === 'customer' ? 'bg-[#eaf3ff] text-[#0053ad]' : 'bg-[#fff8e6] text-[#8a5f0a]'}`}>{r.returnType}</span> },
    { header: 'Reason', render: (r) => r.reason || '—' },
    { header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${r.status === 'approved' ? 'bg-[#eefbf7] text-[#1f7f62]' : 'bg-[#fff8e6] text-[#8a5f0a]'}`}>{r.status}</span> },
    { header: 'Amount', render: (r) => <span className="font-bold">{formatCurrency(Number(r.refundAmount || r.creditAmount || 0))}</span> },
    { header: 'Date', render: (r) => r.returnDate ? formatDate(r.returnDate) : '—' },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Reverse flow</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Returns</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Handle customer returns, supplier returns, and credit notes.</p></div>
      <div className="flex gap-2">
        <button onClick={() => openCreate('customer')} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Customer return</button>
        <button onClick={() => openCreate('supplier')} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dbe5ea] bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" /> Supplier return</button>
      </div>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search return, reason, status..." searchKeys={['returnNo', 'reason', 'status', 'returnType']} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${returnType === 'customer' ? 'Customer' : 'Supplier'} return`} description="Enter return details." size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {returnType === 'customer' ? (
          <FormSelect label="Original bill" value={form.billId} onChange={(e) => setForm({ ...form, billId: e.target.value })} options={bills.map((b) => ({ value: b.id, label: `${b.billNo} — ${formatCurrency(Number(b.totalAmount))}` }))} placeholder="Select bill..." />
        ) : (
          <FormSelect label="Supplier" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} options={suppliersList.map((s) => ({ value: s.id, label: s.companyName }))} placeholder="Select supplier..." />
        )}
        {form.items.map((item, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_80px_100px_40px] items-end">
            <FormSelect label={i === 0 ? 'Medicine' : ''} value={item.medicineId} onChange={(e) => updateItem(i, 'medicineId', e.target.value)} options={medicines.map((m) => ({ value: m.id, label: m.brandName }))} placeholder="Select..." />
            <FormField label={i === 0 ? 'Qty' : ''} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} type="number" min="1" />
            <FormField label={i === 0 ? 'Unit price' : ''} value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} type="number" />
            <button type="button" onClick={() => removeItem(i)} className="text-rose-400 hover:text-rose-600 pt-6">×</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm font-semibold text-[#007BFF] hover:underline">+ Add item</button>
        <FormTextarea label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g., Wrong item, Expired, Damaged..." />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : 'Create return'}</button>
        </div>
      </form>
    </Modal>
  </div>
}
