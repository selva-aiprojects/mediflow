import { useEffect, useState, useRef, useCallback } from 'react'
import { Plus, Trash2, ShoppingCart, Search, User, Stethoscope, Printer, X, Pill, ChevronDown, Check, FileText } from 'lucide-react'
import { salesApi, medicinesApi, customersApi, doctorsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { showToast } from '@/components/ui/toast'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'

// ── Types ─────────────────────────────────────────────

interface CartItem {
  id: string
  medicineId: string
  brandName: string
  genericName: string
  strength: string
  form: string
  schedule: string
  hsnCode: string
  batchId: string
  batchNo: string
  expiryDate: string
  mrp: number
  unitPrice: number
  quantity: number
  discountPercent: number
  discountAmount: number
  gstPercent: number
  gstAmount: number
  cgstAmount: number
  sgstAmount: number
  taxableAmount: number
  totalAmount: number
  beforeFood: boolean | null
  frequency: string
  duration: string
  dosageNotes: string
}

interface Customer {
  id: string
  firstName: string
  lastName?: string
  mobile: string
  gender?: string
  dateOfBirth?: string
  creditBalance?: number
  isCreditAllowed?: boolean
}

interface Doctor {
  id: string
  name: string
  speciality?: string
  registrationNo?: string
}

interface Medicine {
  id: string
  brandName: string
  genericName?: string
  strength?: string
  form: string
  schedule?: string
  hsnCode?: string
  gstPercent?: number
  barcode?: string
  unitType: string
  isPrescriptionRequired?: boolean
  isBatchEnabled?: boolean
  batches?: Batch[]
}

interface Batch {
  id: string
  batchNo: string
  mrp: number
  purchasePrice: number
  sellingPrice: number
  gstPercent: number
  quantity: number
  expiryDate: string
  rackId?: string
}

type PaymentMode = 'cash' | 'upi' | 'card' | 'credit'

// ── Helpers ───────────────────────────────────────────

const fmt = (n: number) => formatCurrency(n)
const round2 = (n: number) => Math.round(n * 100) / 100
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

function generateBillNo(): string {
  const d = new Date()
  const prefix = 'PH'
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
  return `${prefix}-${date}-${seq}`
}

const FREQUENCIES = [
  { value: '1-0-0', label: 'Once daily (morning)' },
  { value: '0-1-0', label: 'Once daily (noon)' },
  { value: '0-0-1', label: 'Once daily (night)' },
  { value: '1-0-1', label: 'Twice daily' },
  { value: '1-1-1', label: 'Three times daily' },
  { value: '1-1-1-1', label: 'Four times daily' },
  { value: '5-5-5', label: 'Every 4 hours' },
  { value: 'SOS', label: 'As needed (SOS)' },
  { value: 'STAT', label: 'Immediately (STAT)' },
]

const DURATIONS = [
  '1 day', '2 days', '3 days', '5 days', '7 days', '10 days',
  '14 days', '21 days', '1 month', '2 months', '3 months', '6 months', 'Ongoing',
]

// ── Component ─────────────────────────────────────────

export default function SalesPage() {
  // Bill history
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')

  // POS state
  const [posOpen, setPosOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [saving, setSaving] = useState(false)
  const [billNo] = useState(generateBillNo)

  // Patient info
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState('')
  const [patientMobile, setPatientMobile] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [prescriptionNo, setPrescriptionNo] = useState('')

  // Bill
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent')
  const [billDiscountValue, setBillDiscountValue] = useState(0)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [upiId, setUpiId] = useState('')
  const [cardRef, setCardRef] = useState('')
  const [paidAmount, setPaidAmount] = useState(0)
  const [notes, setNotes] = useState('')

  // Batch selector
  const [batchSelectorFor, setBatchSelectorFor] = useState<string | null>(null)

  // Customer quick-add
  const [showCustomerAdd, setShowCustomerAdd] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerMobile, setNewCustomerMobile] = useState('')

  const searchRef = useRef<HTMLInputElement>(null)

  // ── Load data ─────────────────────────────────────────

  const loadHistory = useCallback(() => {
    salesApi.getAll().then(({ data }) => { setRows(data); setSource('api') }).catch(() => setSource('fallback')).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])

  const openPOS = () => {
    setCart([]); setSearchQuery(''); setSelectedCustomer(''); setPatientName('')
    setPatientAge(''); setPatientGender(''); setPatientMobile('')
    setSelectedDoctor(''); setPrescriptionNo(''); setPaymentMode('cash')
    setBillDiscountValue(0); setUpiId(''); setCardRef(''); setPaidAmount(0)
    setNotes(''); setPosOpen(true)
    medicinesApi.getAll().then(({ data }) => setMedicines(Array.isArray(data) ? data : [])).catch(() => setMedicines([]))
    customersApi.getAll().then(({ data }) => setCustomers(Array.isArray(data) ? data : [])).catch(() => setCustomers([]))
    doctorsApi.getAll().then(({ data }) => setDoctors(Array.isArray(data) ? data : [])).catch(() => setDoctors([]))
    setTimeout(() => searchRef.current?.focus(), 100)
  }

  // ── Customer selection ───────────────────────────────

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c.id)
    setPatientName(`${c.firstName} ${c.lastName || ''}`.trim())
    setPatientMobile(c.mobile)
    if (c.gender) setPatientGender(c.gender)
    if (c.dateOfBirth) {
      const age = Math.floor((Date.now() - new Date(c.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      setPatientAge(String(age))
    }
  }

  const quickAddCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerMobile.trim()) return showToast('error', 'Name and mobile required')
    try {
      const { data } = await customersApi.create({ firstName: newCustomerName, mobile: newCustomerMobile })
      setCustomers((prev) => [...prev, data])
      selectCustomer(data)
      setShowCustomerAdd(false); setNewCustomerName(''); setNewCustomerMobile('')
      showToast('success', 'Customer added')
    } catch { showToast('error', 'Failed to add customer') }
  }

  // ── Medicine search & batch selection ────────────────

  const filteredMeds = medicines.filter((m) => {
    if (!searchQuery) return false
    const q = searchQuery.toLowerCase()
    return (
      m.brandName?.toLowerCase().includes(q) ||
      m.genericName?.toLowerCase().includes(q) ||
      m.barcode?.toLowerCase().includes(q) ||
      m.strength?.toLowerCase().includes(q)
    )
  })

  const addToCart = (med: Medicine, batch?: Batch) => {
    const b = batch || med.batches?.[0]
    if (b && b.quantity <= 0) return showToast('error', `${med.brandName} — out of stock in batch ${b.batchNo}`)
    if (med.isPrescriptionRequired) showToast('info', `${med.brandName} is a prescription medicine`)

    const gstPct = Number(b?.gstPercent || med.gstPercent || 0)
    const mrp = Number(b?.mrp || 0)
    const sellingPrice = Number(b?.sellingPrice || mrp)
    const qty = 1
    const taxableAmount = round2(sellingPrice * qty)
    const gstAmount = round2(taxableAmount * (gstPct / 100))

    setCart((prev) => [
      ...prev,
      {
        id: `${med.id}-${b?.id || 'nb'}-${Date.now()}`,
        medicineId: med.id,
        brandName: med.brandName,
        genericName: med.genericName || '',
        strength: med.strength || '',
        form: med.form,
        schedule: med.schedule || '',
        hsnCode: med.hsnCode || '',
        batchId: b?.id || '',
        batchNo: b?.batchNo || 'N/A',
        expiryDate: b?.expiryDate || '',
        mrp,
        unitPrice: sellingPrice,
        quantity: qty,
        discountPercent: 0,
        discountAmount: 0,
        gstPercent: gstPct,
        gstAmount,
        cgstAmount: round2(gstAmount / 2),
        sgstAmount: round2(gstAmount / 2),
        taxableAmount,
        totalAmount: round2(taxableAmount + gstAmount),
        beforeFood: null,
        frequency: '1-0-1',
        duration: '7 days',
        dosageNotes: '',
      },
    ])
    setSearchQuery('')
    searchRef.current?.focus()
  }

  // Auto-add if exact barcode match
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredMeds.length === 1) {
      addToCart(filteredMeds[0])
    }
  }

  // ── Cart mutations ───────────────────────────────────

  const updateCartItem = (id: string, field: string, value: any) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        // Recalculate line totals
        const base = updated.unitPrice * updated.quantity
        updated.discountAmount = round2(base * (updated.discountPercent / 100))
        updated.taxableAmount = round2(base - updated.discountAmount)
        updated.gstAmount = round2(updated.taxableAmount * (updated.gstPercent / 100))
        updated.cgstAmount = round2(updated.gstAmount / 2)
        updated.sgstAmount = round2(updated.gstAmount / 2)
        updated.totalAmount = round2(updated.taxableAmount + updated.gstAmount)
        return updated
      })
    )
  }

  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id))

  // ── Print any bill (POS cart or saved from history) ───

  const printBill = (bill: any) => {
    const pharmacyName = 'MediFlow Pharmacy'
    const pharmacyAddress = '123 Health Street, Medical District'
    const pharmacyGstin = '27AAACT1234F1Z5'
    const drugLicense = 'MH-12345'

    const items: any[] = bill.items || bill.salesItems || []
    const subtotal = bill.subtotal ?? items.reduce((s: number, it: any) => s + Number(it.unitPrice || 0) * Number(it.quantity || 0), 0)
    const itemDiscount = bill.itemDiscount ?? items.reduce((s: number, it: any) => s + Number(it.discountAmount || 0), 0)
    const totalCgst = bill.cgstAmount ?? items.reduce((s: number, it: any) => s + Number(it.cgstAmount || 0), 0)
    const totalSgst = bill.sgstAmount ?? items.reduce((s: number, it: any) => s + Number(it.sgstAmount || 0), 0)
    const billDiscountAmt = bill.discountAmount || 0
    const billTotal = Number(bill.totalAmount || 0)
    const billNo = bill.billNo || 'N/A'
    const billDate = bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : today()
    const billTime = bill.billTime || nowTime()
    const patientName = bill.patientName || (bill.customer ? `${bill.customer.firstName} ${bill.customer.lastName || ''}`.trim() : '')
    const doctorName = bill.doctor?.name || bill.doctorName || ''
    const paymentMode = bill.paymentMode || 'cash'

    let html = `
      <html><head><style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 11px; width: 300px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .border-top { border-top: 1px dashed #000; padding-top: 4px; }
        .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 1px 2px; }
        .right { text-align: right; }
        .bill-header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
        .item-row { border-bottom: 1px dotted #ccc; padding: 3px 0; }
        .total-row { font-weight: bold; border-top: 2px solid #000; padding-top: 4px; }
        .dosage { font-size: 9px; color: #555; }
      </style></head><body>
      <div class="bill-header center">
        <div class="bold" style="font-size:14px">${pharmacyName}</div>
        <div>${pharmacyAddress}</div>
        <div>GSTIN: ${pharmacyGstin} | DL: ${drugLicense}</div>
        <div class="bold border-top" style="margin-top:4px">TAX INVOICE</div>
      </div>
      <table><tr><td>Bill: ${billNo}</td><td class="right">${billDate} ${billTime}</td></tr></table>
      ${patientName ? `<div>Patient: ${patientName}</div>` : ''}
      ${doctorName ? `<div>Dr: ${doctorName}</div>` : ''}
      <div class="border-top border-bottom" style="margin:6px 0">
    `
    items.forEach((item: any, i: number) => {
      html += `
        <div class="item-row">
          <div class="bold">${i + 1}. ${item.medicineName || item.brandName || ''} ${item.strength || ''} ${item.form || ''}</div>
          <div style="font-size:9px">Batch: ${item.batchNo || '—'} | Exp: ${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: 'numeric' }) : '—'}</div>
          <div>${item.quantity} x ${fmt(Number(item.unitPrice || 0))} = ${fmt(Number(item.totalAmount || 0))}${item.discountPercent > 0 ? ` (${item.discountPercent}% off)` : ''}</div>
          ${item.frequency ? `<div class="dosage">${item.frequency}${item.beforeFood === true ? ' · Before food' : item.beforeFood === false ? ' · After food' : ''} · ${item.duration || ''}</div>` : ''}
        </div>
      `
    })
    html += `</div><table style="margin-top:6px">
      <tr><td>Subtotal</td><td class="right">${fmt(subtotal)}</td></tr>
      ${itemDiscount > 0 ? `<tr><td>Item Discount</td><td class="right">-${fmt(itemDiscount)}</td></tr>` : ''}
      ${billDiscountAmt > 0 ? `<tr><td>Bill Discount</td><td class="right">-${fmt(billDiscountAmt)}</td></tr>` : ''}
      <tr><td>CGST</td><td class="right">${fmt(totalCgst)}</td></tr>
      <tr><td>SGST</td><td class="right">${fmt(totalSgst)}</td></tr>
      <tr class="total-row"><td>TOTAL</td><td class="right">${fmt(billTotal)}</td></tr>
      <tr><td>Payment (${paymentMode.toUpperCase()})</td><td class="right">${fmt(billTotal)}</td></tr>
    </table>
    <div class="center" style="margin-top:10px; font-size:9px">Thank you! Get well soon.</div>
    </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); w.print() }
  }

  const printReceipt = () => {
    printBill({
      billNo, patientName, doctorId: selectedDoctor, doctorName: doctors.find((d) => d.id === selectedDoctor)?.name,
      paymentMode, totalAmount: billTotal, subtotal: billSubtotal, discountAmount: billDiscountAmt, cgstAmount: totalCgst, sgstAmount: totalSgst,
      items: cart.map((c) => ({
        medicineName: c.brandName, genericName: c.genericName, strength: c.strength, form: c.form, batchNo: c.batchNo, expiryDate: c.expiryDate,
        quantity: c.quantity, unitPrice: c.unitPrice, discountPercent: c.discountPercent, discountAmount: c.discountAmount, totalAmount: c.totalAmount,
        cgstAmount: c.cgstAmount, sgstAmount: c.sgstAmount, frequency: c.frequency, duration: c.duration, beforeFood: c.beforeFood,
      })),
    })
  }

  // ── Load a saved bill into POS for editing ────────────

  const editBill = (bill: any) => {
    const items: any[] = bill.salesItems || []
    setCart(items.map((it: any, i: number) => ({
      id: `edit-${it.id || i}-${Date.now()}`,
      medicineId: it.medicineId || '',
      brandName: it.medicineName || '',
      genericName: it.genericName || '',
      strength: it.strength || '',
      form: it.form || '',
      schedule: '',
      hsnCode: it.hsnCode || '',
      batchId: it.batchId || '',
      batchNo: it.batchNo || 'N/A',
      expiryDate: it.expiryDate || '',
      mrp: Number(it.mrp || 0),
      unitPrice: Number(it.unitPrice || 0),
      quantity: Number(it.quantity || 1),
      discountPercent: Number(it.discountPercent || 0),
      discountAmount: Number(it.discountAmount || 0),
      gstPercent: Number(it.gstPercent || 0),
      gstAmount: Number(it.gstAmount || 0),
      cgstAmount: Number(it.cgstAmount || 0),
      sgstAmount: Number(it.sgstAmount || 0),
      taxableAmount: Number(it.taxableAmount || 0),
      totalAmount: Number(it.totalAmount || 0),
      beforeFood: it.beforeFood ?? null,
      frequency: it.frequency || '1-0-1',
      duration: it.duration || '7 days',
      dosageNotes: it.dosageNotes || '',
    })))
    setSelectedCustomer(bill.customerId || '')
    setPatientName(bill.patientName || (bill.customer ? `${bill.customer.firstName} ${bill.customer.lastName || ''}`.trim() : ''))
    setSelectedDoctor(bill.doctorId || '')
    setPrescriptionNo(bill.prescriptionNo || '')
    setPaymentMode(bill.paymentMode || 'cash')
    setBillDiscountValue(Number(bill.discountAmount || 0))
    setDiscountType(bill.discountAmount > 0 ? 'amount' : 'percent')
    setPosOpen(true)
    showToast('info', `Editing bill ${bill.billNo}`)
  }

  // ── Bill calculations ────────────────────────────────

  const billSubtotal = round2(cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0))
  const billItemDiscount = round2(cart.reduce((s, c) => s + c.discountAmount, 0))
  const billTaxable = round2(billSubtotal - billItemDiscount)

  let billDiscountAmt = 0
  if (discountType === 'percent') {
    billDiscountAmt = round2(billTaxable * (billDiscountValue / 100))
  } else {
    billDiscountAmt = round2(Math.min(billDiscountValue, billTaxable))
  }

  const billNetTaxable = round2(billTaxable - billDiscountAmt)
  const billCgst = round2(billNetTaxable * 0.06) // Assuming 12% GST split
  const billSgst = round2(billNetTaxable * 0.06)
  // Calculate from actual items
  const totalCgst = round2(cart.reduce((s, c) => s + c.cgstAmount, 0))
  const totalSgst = round2(cart.reduce((s, c) => s + c.sgstAmount, 0))
  const totalGst = round2(totalCgst + totalSgst)
  const billPreRound = round2(billNetTaxable + totalGst)
  const roundOff = round2(Math.round(billPreRound) - billPreRound)
  const billTotal = Math.round(billPreRound)

  // ── Checkout ─────────────────────────────────────────

  const handleCheckout = async () => {
    if (!cart.length) return showToast('error', 'Cart is empty')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setSaving(true)
    try {
      await salesApi.create({
        billNo,
        customerId: selectedCustomer || undefined,
        doctorId: selectedDoctor || undefined,
        prescriptionNo: prescriptionNo || undefined,
        patientName: patientName || undefined,
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender: patientGender || undefined,
        paymentMode,
        paidAmount: paymentMode === 'credit' ? 0 : billTotal,
        discountPercent: discountType === 'percent' ? billDiscountValue : 0,
        discountAmount: billDiscountAmt,
        roundOff,
        notes: notes || undefined,
        upiId: paymentMode === 'upi' ? upiId : undefined,
        cardRef: paymentMode === 'card' ? cardRef : undefined,
        createdBy: user.id,
        items: cart.map((c, i) => ({
          itemNo: i + 1,
          medicineId: c.medicineId,
          batchId: c.batchId || undefined,
          batchNo: c.batchNo,
          medicineName: c.brandName,
          genericName: c.genericName,
          strength: c.strength,
          form: c.form,
          hsnCode: c.hsnCode,
          quantity: c.quantity,
          unitType: 'strip',
          mrp: c.mrp,
          unitPrice: c.unitPrice,
          discountPercent: c.discountPercent,
          discountAmount: c.discountAmount,
          gstPercent: c.gstPercent,
          expiryDate: c.expiryDate || undefined,
          beforeFood: c.beforeFood,
          frequency: c.frequency,
          duration: c.duration,
          dosageNotes: c.dosageNotes || undefined,
          totalAmount: c.totalAmount,
        })),
      })
      showToast('success', `Bill ${billNo} saved`)
      setPosOpen(false); loadHistory()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save bill')
    }
    setSaving(false)
  }

  // ── Bill history table ───────────────────────────────

  const historyColumns: Column<any>[] = [
    { header: 'Bill No', render: (r) => <span className="font-semibold text-[#1A2B4C]">{r.billNo}</span> },
    { header: 'Date', render: (r) => r.billDate ? new Date(r.billDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { header: 'Customer', render: (r) => r.customer ? `${r.customer.firstName} ${r.customer.lastName || ''}` : r.patientName || 'Walk-in' },
    { header: 'Payment', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${r.paymentStatus === 'paid' ? 'bg-[#eefbf7] text-[#1f7f62]' : r.paymentStatus === 'credit' ? 'bg-rose-50 text-rose-600' : 'bg-[#fff8e6] text-[#8a5f0a]'}`}>{r.paymentMode}</span> },
    { header: 'Items', render: (r) => r.salesItems?.length || 0 },
    { header: 'Total', render: (r) => <span className="font-bold">{fmt(Number(r.totalAmount || 0))}</span> },
    { header: 'Action', render: (r) => (
      <div className="flex items-center gap-1">
        <button onClick={() => editBill(r)} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100" title="Edit this bill">Edit</button>
        <button onClick={() => printBill(r)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"><Printer className="inline h-3 w-3 mr-1" />Print</button>
      </div>
    ) },
  ]

  // ── Render ───────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Counter workflow</p>
          <h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Point of sale</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create bills, process payments, and manage prescription sales.</p>
        </div>
        <button onClick={openPOS} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#33CC99] px-4 text-sm font-bold text-[#1A2B4C] shadow-lg shadow-[#33CC99]/20 hover:bg-[#2ab886]">
          <ShoppingCart className="h-4 w-4" /> New sale
        </button>
      </header>

      {/* Bill history */}
      <DataTable data={rows} columns={historyColumns} loading={loading} source={source} searchPlaceholder="Search bill, customer, payment mode..." searchKeys={['billNo', 'paymentMode', 'paymentStatus']} />

      {/* ═══════════════════════════════════════════════════ POS OVERLAY ═══ */}
      {posOpen && (
        <div className="fixed inset-0 z-50 flex bg-[#f0f4f7]">
          {/* ── LEFT: Cart & Patient ───────────────────── */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* POS Header */}
            <div className="flex items-center justify-between border-b border-[#dfe8ec] bg-white px-6 py-3 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#1A2B4C] text-white"><Pill className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-bold text-[#1A2B4C]">MediFlow Pharmacy</p>
                  <p className="text-[10px] text-slate-400">Bill: {billNo} · {today()} · {nowTime()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cart.length > 0 && <span className="rounded-full bg-[#33CC99]/15 px-3 py-1 text-xs font-bold text-[#1f7f62]">{cart.length} item{cart.length !== 1 && 's'}</span>}
                <button onClick={() => setPosOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Patient & Doctor row */}
            <div className="border-b border-[#dfe8ec] bg-white px-6 py-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Customer */}
                <div className="relative">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient / Customer</label>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <select
                        value={selectedCustomer}
                        onChange={(e) => {
                          const c = customers.find((x) => x.id === e.target.value)
                          if (c) selectCustomer(c)
                          else { setSelectedCustomer(''); setPatientName(''); setPatientMobile(''); setPatientAge(''); setPatientGender('') }
                        }}
                        className="w-full rounded-lg border border-[#dbe5ea] bg-white py-2 pl-8 pr-2 text-xs outline-none focus:border-[#007BFF]"
                      >
                        <option value="">Walk-in</option>
                        {customers.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ''} ({c.mobile})</option>)}
                      </select>
                    </div>
                    <button onClick={() => setShowCustomerAdd(true)} title="Quick add customer" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#dbe5ea] bg-white text-slate-400 hover:border-[#007BFF] hover:text-[#007BFF]"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                {/* Patient name (editable) */}
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Name</label>
                  <input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-[#dbe5ea] bg-white px-3 py-2 text-xs outline-none focus:border-[#007BFF]" />
                </div>

                {/* Age & Gender */}
                <div className="flex gap-1.5">
                  <div className="w-16">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Age</label>
                    <input value={patientAge} onChange={(e) => setPatientAge(e.target.value)} placeholder="Yrs" type="number" min="0" max="150" className="w-full rounded-lg border border-[#dbe5ea] bg-white px-2 py-2 text-xs outline-none focus:border-[#007BFF]" />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                    <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} className="w-full rounded-lg border border-[#dbe5ea] bg-white px-2 py-2 text-xs outline-none focus:border-[#007BFF]">
                      <option value="">—</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Doctor & Prescription */}
                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Doctor</label>
                    <div className="relative">
                      <Stethoscope className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="w-full rounded-lg border border-[#dbe5ea] bg-white py-2 pl-8 pr-2 text-xs outline-none focus:border-[#007BFF]">
                        <option value="">Select doctor</option>
                        {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}{d.speciality ? ` (${d.speciality})` : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Rx No.</label>
                    <input value={prescriptionNo} onChange={(e) => setPrescriptionNo(e.target.value)} placeholder="Rx#" className="w-full rounded-lg border border-[#dbe5ea] bg-white px-2 py-2 text-xs outline-none focus:border-[#007BFF]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Medicine search */}
            <div className="border-b border-[#dfe8ec] bg-white px-6 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by name, generic, barcode, or strength..."
                  className="w-full rounded-xl border border-[#dbe5ea] bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#007BFF] focus:bg-white"
                />
                {searchQuery && filteredMeds.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[#dbe5ea] bg-white shadow-xl">
                    {filteredMeds.slice(0, 12).map((m) => {
                      const batch = m.batches?.[0]
                      const stock = m.batches?.reduce((s, b) => s + b.quantity, 0) || 0
                      return (
                        <button key={m.id} onClick={() => {
                          if (m.batches && m.batches.length > 1 && m.isBatchEnabled) {
                            setBatchSelectorFor(m.id)
                          } else {
                            addToCart(m)
                          }
                        }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eaf3ff] text-[10px] font-bold text-[#007BFF]">
                            {m.form?.slice(0, 3).toUpperCase() || 'MED'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#1A2B4C]">{m.brandName}</span>
                              {m.isPrescriptionRequired && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Rx</span>}
                              {m.schedule && <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">Sch {m.schedule}</span>}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {m.genericName && <span>{m.genericName}</span>}
                              {m.strength && <span> · {m.strength}</span>}
                              <span> · {m.form}</span>
                              {batch && <span> · MRP {fmt(Number(batch.mrp))}</span>}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[10px]">
                              {batch && <span className="text-slate-400">Batch: {batch.batchNo}</span>}
                              {batch?.expiryDate && <span className="text-slate-400">Exp: {new Date(batch.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: 'numeric' })}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-bold ${stock > 10 ? 'text-[#1f7f62]' : stock > 0 ? 'text-amber-600' : 'text-rose-500'}`}>
                              {stock > 0 ? `${stock} units` : 'Out of stock'}
                            </p>
                            {batch && <p className="mt-1 text-xs font-bold text-[#1A2B4C]">{fmt(Number(batch.sellingPrice || batch.mrp))}</p>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
                {searchQuery && filteredMeds.length === 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#dbe5ea] bg-white p-6 text-center shadow-xl">
                    <p className="text-sm text-slate-400">No medicines found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart table */}
            <div className="flex-1 overflow-auto bg-[#f0f4f7] px-6 py-3">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                  <ShoppingCart className="mb-3 h-12 w-12 opacity-20" />
                  <p className="text-sm font-medium">Search and add medicines to start billing</p>
                  <p className="mt-1 text-xs text-slate-300">Type medicine name or scan barcode above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, idx) => {
                    const isExpiring = item.expiryDate && (new Date(item.expiryDate).getTime() - Date.now()) < 60 * 24 * 60 * 60 * 1000
                    return (
                      <div key={item.id} className="rounded-xl border border-[#e7eef2] bg-white p-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          {/* Item number & medicine info */}
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{idx + 1}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#1A2B4C]">{item.brandName}</span>
                              <span className="text-[11px] text-slate-400">{item.strength} · {item.form}</span>
                              {item.schedule && <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">Sch {item.schedule}</span>}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                              <span>Generic: {item.genericName || '—'}</span>
                              <span>HSN: {item.hsnCode || '—'}</span>
                              <span>Batch: <span className="font-medium text-slate-500">{item.batchNo}</span></span>
                              <span className={isExpiring ? 'font-bold text-rose-500' : ''}>Exp: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: 'numeric' }) : '—'}</span>
                              <span>MRP: {fmt(item.mrp)}</span>
                            </div>
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateCartItem(item.id, 'quantity', Math.max(1, item.quantity - 1))} className="grid h-7 w-7 place-items-center rounded-lg border border-[#dbe5ea] text-xs font-bold text-slate-500 hover:bg-slate-50">-</button>
                            <input type="number" value={item.quantity} onChange={(e) => updateCartItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))} className="h-7 w-10 rounded-lg border border-[#dbe5ea] text-center text-xs font-bold outline-none focus:border-[#007BFF]" min="1" />
                            <button onClick={() => updateCartItem(item.id, 'quantity', item.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#dbe5ea] text-xs font-bold text-slate-500 hover:bg-slate-50">+</button>
                          </div>

                          {/* Line total */}
                          <div className="w-24 text-right">
                            <p className="text-sm font-bold text-[#1A2B4C]">{fmt(item.totalAmount)}</p>
                            <p className="text-[10px] text-slate-400">{item.unitPrice} x {item.quantity}</p>
                          </div>

                          {/* Remove */}
                          <button onClick={() => removeItem(item.id)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>

                        {/* Discount & dosage row */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2">
                          {/* Per-item discount */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-400">Disc:</span>
                            <input type="number" value={item.discountPercent} onChange={(e) => updateCartItem(item.id, 'discountPercent', Math.max(0, Math.min(100, Number(e.target.value))))} className="h-6 w-12 rounded border border-[#dbe5ea] px-1 text-center text-[10px] outline-none focus:border-[#007BFF]" min="0" max="100" />
                            <span className="text-[10px] text-slate-400">%</span>
                            {item.discountAmount > 0 && <span className="text-[10px] text-rose-500">-{fmt(item.discountAmount)}</span>}
                          </div>

                          <div className="h-3 w-px bg-slate-100" />

                          {/* Before/After food */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-400">Food:</span>
                            <button onClick={() => updateCartItem(item.id, 'beforeFood', item.beforeFood === true ? null : true)} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${item.beforeFood === true ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Before</button>
                            <button onClick={() => updateCartItem(item.id, 'beforeFood', item.beforeFood === false ? null : false)} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${item.beforeFood === false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>After</button>
                          </div>

                          <div className="h-3 w-px bg-slate-100" />

                          {/* Frequency */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-400">Freq:</span>
                            <select value={item.frequency} onChange={(e) => updateCartItem(item.id, 'frequency', e.target.value)} className="h-6 rounded border border-[#dbe5ea] px-1 text-[10px] outline-none focus:border-[#007BFF]">
                              {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.value}</option>)}
                            </select>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-400">Days:</span>
                            <select value={item.duration} onChange={(e) => updateCartItem(item.id, 'duration', e.target.value)} className="h-6 rounded border border-[#dbe5ea] px-1 text-[10px] outline-none focus:border-[#007BFF]">
                              {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>

                          {/* GST badge */}
                          <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">GST {item.gstPercent}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Bill Summary & Payment ──────────── */}
          <div className="flex w-[380px] flex-col border-l border-[#dfe8ec] bg-white shadow-xl">
            {/* Summary header */}
            <div className="border-b border-[#dfe8ec] px-5 py-3">
              <h2 className="text-sm font-bold text-[#1A2B4C]">Bill Summary</h2>
            </div>

            {/* Scrollable summary */}
            <div className="flex-1 overflow-auto px-5 py-4">
              {/* Item-wise breakdown */}
              {cart.length > 0 && (
                <div className="mb-4 rounded-xl border border-[#e7eef2] p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Items ({cart.length})</p>
                  <div className="space-y-1.5">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-[11px]">
                        <span className="min-w-0 flex-1 truncate text-slate-600">{item.brandName} x{item.quantity}</span>
                        <span className="ml-2 shrink-0 font-medium text-[#1A2B4C]">{fmt(item.totalAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtotal & discounts */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-medium">{fmt(billSubtotal)}</span></div>
                {billItemDiscount > 0 && <div className="flex justify-between text-xs"><span className="text-slate-500">Item discounts</span><span className="font-medium text-rose-500">-{fmt(billItemDiscount)}</span></div>}

                {/* Bill-level discount */}
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400">DISCOUNT</span>
                  <div className="flex items-center gap-1">
                    <input type="number" value={billDiscountValue} onChange={(e) => setBillDiscountValue(Math.max(0, Number(e.target.value)))} className="h-6 w-14 rounded border border-[#dbe5ea] px-1.5 text-center text-xs outline-none focus:border-[#007BFF]" min="0" />
                    <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="h-6 rounded border border-[#dbe5ea] px-1 text-[10px] outline-none">
                      <option value="percent">%</option><option value="amount">₹</option>
                    </select>
                  </div>
                  {billDiscountAmt > 0 && <span className="ml-auto text-[10px] text-rose-500">-{fmt(billDiscountAmt)}</span>}
                </div>

                <div className="h-px bg-[#e7eef2]" />

                {/* Tax breakdown */}
                <div className="flex justify-between text-xs"><span className="text-slate-500">Taxable amount</span><span className="font-medium">{fmt(billNetTaxable)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">CGST</span><span className="font-medium">{fmt(totalCgst)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">SGST</span><span className="font-medium">{fmt(totalSgst)}</span></div>
                {roundOff !== 0 && <div className="flex justify-between text-xs"><span className="text-slate-500">Round off</span><span className="font-medium">{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</span></div>}

                <div className="h-px bg-[#1A2B4C]/10" />

                {/* Grand total */}
                <div className="flex justify-between pt-1">
                  <span className="text-sm font-bold text-[#1A2B4C]">Net Payable</span>
                  <span className="text-xl font-bold text-[#1A2B4C]">{fmt(billTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment mode */}
            <div className="border-t border-[#dfe8ec] px-5 py-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Mode</p>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {(['cash', 'upi', 'card', 'credit'] as PaymentMode[]).map((mode) => (
                  <button key={mode} onClick={() => { setPaymentMode(mode); if (mode === 'cash') setPaidAmount(billTotal) }} className={`rounded-lg py-2 text-xs font-bold uppercase transition-all ${paymentMode === mode ? mode === 'cash' ? 'bg-[#33CC99] text-[#1A2B4C] shadow' : mode === 'upi' ? 'bg-violet-500 text-white shadow' : mode === 'card' ? 'bg-[#007BFF] text-white shadow' : 'bg-amber-500 text-white shadow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {mode === 'cash' ? 'Cash' : mode === 'upi' ? 'UPI' : mode === 'card' ? 'Card' : 'Credit'}
                  </button>
                ))}
              </div>

              {/* Payment details */}
              {paymentMode === 'upi' && (
                <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="UPI ID / Ref No." className="mb-2 w-full rounded-lg border border-[#dbe5ea] bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#007BFF]" />
              )}
              {paymentMode === 'card' && (
                <input value={cardRef} onChange={(e) => setCardRef(e.target.value)} placeholder="Card last 4 / Ref No." className="mb-2 w-full rounded-lg border border-[#dbe5ea] bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#007BFF]" />
              )}
              {paymentMode === 'cash' && (
                <div className="mb-2 flex gap-2">
                  <div className="flex-1">
                    <label className="mb-0.5 block text-[10px] text-slate-400">Paid</label>
                    <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} className="w-full rounded-lg border border-[#dbe5ea] bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-[#007BFF]" />
                  </div>
                  {paidAmount > billTotal && (
                    <div className="flex-1">
                      <label className="mb-0.5 block text-[10px] text-slate-400">Change</label>
                      <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600">{fmt(paidAmount - billTotal)}</div>
                    </div>
                  )}
                </div>
              )}
              {paymentMode === 'credit' && (
                <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[10px] text-amber-700">Credit sale — balance will be due from customer.</p>
              )}

              {/* Notes */}
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." className="mb-3 w-full rounded-lg border border-[#dbe5ea] bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#007BFF]" />

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={printReceipt} disabled={cart.length === 0} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#dbe5ea] bg-white py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"><Printer className="h-3.5 w-3.5" /> Print</button>
                <button onClick={handleCheckout} disabled={saving || cart.length === 0} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#33CC99] py-2.5 text-xs font-bold text-[#1A2B4C] shadow-lg shadow-[#33CC99]/20 hover:bg-[#2ab886] disabled:opacity-50">
                  {saving ? 'Saving...' : <><Check className="h-3.5 w-3.5" /> Complete Sale</>}
                </button>
              </div>
            </div>
          </div>

          {/* ── Batch Selector Modal ──────────────────── */}
          {batchSelectorFor && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1A2B4C]">Select Batch</h3>
                  <button onClick={() => setBatchSelectorFor(null)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                </div>
                {(() => {
                  const med = medicines.find((m) => m.id === batchSelectorFor)
                  if (!med) return null
                  return (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">{med.brandName} — {med.genericName} {med.strength}</p>
                      {med.batches?.filter((b) => b.quantity > 0).map((b) => (
                        <button key={b.id} onClick={() => { addToCart(med, b); setBatchSelectorFor(null) }} className="flex w-full items-center justify-between rounded-xl border border-[#e7eef2] px-4 py-3 text-left hover:border-[#007BFF] hover:bg-[#f7fbff]">
                          <div>
                            <p className="text-xs font-bold text-[#1A2B4C]">Batch: {b.batchNo}</p>
                            <div className="mt-1 flex gap-3 text-[10px] text-slate-400">
                              <span>Exp: {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: 'numeric' }) : '—'}</span>
                              <span>MRP: {fmt(Number(b.mrp))}</span>
                              <span>GST: {b.gstPercent}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-bold ${b.quantity > 10 ? 'text-[#1f7f62]' : 'text-amber-600'}`}>{b.quantity} units</p>
                            <p className="mt-0.5 text-xs font-bold text-[#1A2B4C]">{fmt(Number(b.sellingPrice || b.mrp))}</p>
                          </div>
                        </button>
                      ))}
                      {med.batches?.filter((b) => b.quantity > 0).length === 0 && <p className="py-4 text-center text-xs text-slate-400">No batches in stock</p>}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* ── Quick Customer Add Modal ───────────────── */}
          {showCustomerAdd && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1A2B4C]">Quick Add Customer</h3>
                  <button onClick={() => setShowCustomerAdd(false)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Name *</label>
                    <input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Patient name" className="w-full rounded-lg border border-[#dbe5ea] px-3 py-2 text-xs outline-none focus:border-[#007BFF]" autoFocus />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile *</label>
                    <input value={newCustomerMobile} onChange={(e) => setNewCustomerMobile(e.target.value)} placeholder="10-digit mobile" className="w-full rounded-lg border border-[#dbe5ea] px-3 py-2 text-xs outline-none focus:border-[#007BFF]" />
                  </div>
                  <button onClick={quickAddCustomer} className="w-full rounded-xl bg-[#33CC99] py-2.5 text-xs font-bold text-[#1A2B4C] hover:bg-[#2ab886]">Add & Select</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
