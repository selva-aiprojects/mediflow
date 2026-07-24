import { useEffect, useState, useRef } from 'react'
import { Plus, Sparkles, Upload } from 'lucide-react'
import { goodsReceiptApi, suppliersApi, medicinesApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect, FormTextarea } from '@/components/ui/form-field'
import { showToast } from '@/components/ui/toast'

export default function GoodsReceiptPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [modalOpen, setModalOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [form, setForm] = useState({ supplierId: '', invoiceNo: '', notes: '', items: [] as any[] })
  const [saving, setSaving] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => goodsReceiptApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = async () => {
    setForm({ supplierId: '', invoiceNo: '', notes: '', items: [] }); setModalOpen(true)
    if (suppliers.length === 0) {
      suppliersApi.getAll().then(({ data }) => setSuppliers(Array.isArray(data) ? data : [])).catch(() => setSuppliers([]))
      medicinesApi.getAll().then(({ data }) => setMedicines(Array.isArray(data) ? data : [])).catch(() => setMedicines([]))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Make sure we have master data to match against
    if (suppliers.length === 0) {
      try {
        const [s, m] = await Promise.all([suppliersApi.getAll(), medicinesApi.getAll()])
        setSuppliers(Array.isArray(s.data) ? s.data : [])
        setMedicines(Array.isArray(m.data) ? m.data : [])
      } catch (e) {}
    }

    setExtracting(true)
    showToast('info', 'Processing invoice with AI...')
    try {
      const { data } = await goodsReceiptApi.extract(file)
      
      // Try to match supplier
      const sName = data.supplierName?.toLowerCase()
      const matchedSupplier = suppliers.find(s => s.companyName.toLowerCase().includes(sName))
      
      // Format items
      const mappedItems = data.items.map((i: any) => {
        const mName = i.medicineName?.toLowerCase()
        const matchedMed = medicines.find(m => m.brandName.toLowerCase().includes(mName))
        return {
          medicineId: matchedMed?.id || '',
          batchNo: i.batchNo || '',
          expiryDate: i.expiryDate || '',
          mrp: i.mrp || 0,
          unitPrice: i.unitPrice || 0,
          quantity: i.quantity || 1,
          gstPercent: i.taxPercent || 12
        }
      })

      setForm({
        supplierId: matchedSupplier?.id || '',
        invoiceNo: data.invoiceNo || '',
        notes: 'Imported via AI',
        items: mappedItems
      })
      setModalOpen(true)
      showToast('success', 'Invoice extracted successfully! Please review.')
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to extract invoice')
    } finally {
      setExtracting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { medicineId: '', batchNo: '', expiryDate: '', mrp: 0, unitPrice: 0, quantity: 1, gstPercent: 12 }] })
  const updateItem = (i: number, field: string, val: any) => { const items = [...form.items]; items[i] = { ...items[i], [field]: val }; setForm({ ...form, items }) }
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.supplierId || !form.items.length) return showToast('error', 'Supplier and items are required')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setSaving(true)
    try {
      await goodsReceiptApi.create({ ...form, status: 'completed', createdBy: user.id })
      showToast('success', 'Goods receipt created'); setModalOpen(false); load()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to create GRN') }
    setSaving(false)
  }

  const columns: Column<any>[] = [
    { header: 'GRN', render: (r) => <span className="font-semibold text-[#1A2B4C]">{r.grnNo}</span> },
    { header: 'Date', render: (r) => r.grnDate ? formatDate(r.grnDate) : '—' },
    { header: 'Supplier', render: (r) => r.supplier?.companyName || '—' },
    { header: 'Invoice', render: (r) => r.invoiceNo || '—' },
    { header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${r.status === 'completed' ? 'bg-[#eefbf7] text-[#1f7f62]' : 'bg-[#fff8e6] text-[#8a5f0a]'}`}>{r.status}</span> },
    { header: 'Qty', render: (r) => r.totalQuantity || r.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0 },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Receiving</p><h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Goods receipt</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Receive supplier invoices, verify batches, and update stock.</p></div>
      <div className="flex gap-3">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
        <button onClick={() => fileInputRef.current?.click()} disabled={extracting} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors"><Sparkles className="h-4 w-4 text-indigo-500" /> {extracting ? 'Extracting...' : 'AI Import'}</button>
        <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]"><Plus className="h-4 w-4" /> Receive stock</button>
      </div>
    </header>
    <DataTable data={rows} columns={columns} loading={loading} source={source} searchPlaceholder="Search GRN, invoice, supplier..." searchKeys={['grnNo', 'invoiceNo']} />
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Receive stock" description="Enter supplier invoice and batch details." size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="Supplier" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} options={suppliers.map((s) => ({ value: s.id, label: s.companyName }))} placeholder="Select..." />
          <FormField label="Invoice number" value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} placeholder="Supplier invoice #" />
        </div>
        {form.items.map((item, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_100px_120px_100px_100px_100px_40px] items-end">
            <FormSelect label={i === 0 ? 'Medicine' : ''} value={item.medicineId} onChange={(e) => updateItem(i, 'medicineId', e.target.value)} options={medicines.map((m) => ({ value: m.id, label: m.brandName }))} placeholder="Select..." />
            <FormField label={i === 0 ? 'Batch no' : ''} value={item.batchNo} onChange={(e) => updateItem(i, 'batchNo', e.target.value)} />
            <FormField label={i === 0 ? 'Expiry' : ''} value={item.expiryDate} onChange={(e) => updateItem(i, 'expiryDate', e.target.value)} type="date" />
            <FormField label={i === 0 ? 'MRP' : ''} value={item.mrp} onChange={(e) => updateItem(i, 'mrp', Number(e.target.value))} type="number" />
            <FormField label={i === 0 ? 'Cost' : ''} value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} type="number" />
            <FormField label={i === 0 ? 'Qty' : ''} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} type="number" min="1" />
            <button type="button" onClick={() => removeItem(i)} className="text-rose-400 hover:text-rose-600 pt-6">×</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm font-semibold text-[#007BFF] hover:underline">+ Add batch</button>
        <FormTextarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional..." />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0066d6] disabled:opacity-60">{saving ? 'Saving...' : 'Complete receipt'}</button>
        </div>
      </form>
    </Modal>
  </div>
}
