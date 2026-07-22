import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Barcode, Boxes, Building2, ClipboardList, FileText, PackagePlus, Plus, ReceiptText, RotateCcw, Search, Settings, Store, Stethoscope, Truck, Users } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

type Column = {
  header: string
  value: (row: any) => React.ReactNode
}

type ModuleConfig = {
  title: string
  eyebrow: string
  description: string
  endpoint: string
  icon: React.ComponentType<{ className?: string }>
  action: string
  searchPlaceholder: string
  columns: Column[]
  fallback: any[]
}

const text = (value: unknown, fallback: React.ReactNode = '-') => value === null || value === undefined || value === '' ? fallback : String(value)
const money = (value: unknown) => formatCurrency(Number(value || 0))
const statusClass = (value: unknown) => {
  const status = String(value || '').toLowerCase()
  if (['active', 'paid', 'completed', 'approved', 'received'].includes(status)) return 'bg-[#eefbf7] text-[#1f7f62]'
  if (['draft', 'pending', 'submitted', 'partial'].includes(status)) return 'bg-[#fff8e6] text-[#8a5f0a]'
  if (['cancelled', 'inactive', 'expired', 'rejected'].includes(status)) return 'bg-[#fff1f2] text-[#a0162d]'
  return 'bg-[#eaf3ff] text-[#0053ad]'
}

function Status({ value }: { value: unknown }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(value)}`}>{text(value, 'open')}</span>
}

function flattenSearch(row: any) {
  return JSON.stringify(row).toLowerCase()
}

const configs: Record<string, ModuleConfig> = {
  sales: {
    title: 'Point of sale',
    eyebrow: 'Counter workflow',
    description: 'Create bills, review payments, and keep prescription sale context close to inventory.',
    endpoint: '/sales',
    icon: ReceiptText,
    action: 'New sale',
    searchPlaceholder: 'Search bill, customer, payment mode...',
    columns: [
      { header: 'Bill', value: (r) => <div><p className="font-semibold text-[#1A2B4C]">{text(r.billNo, 'Draft bill')}</p><p className="text-xs text-slate-500">{r.billDate ? formatDate(r.billDate) : 'Today'}</p></div> },
      { header: 'Customer', value: (r) => text(r.customer ? `${r.customer.firstName} ${r.customer.lastName || ''}` : r.customerName, 'Walk-in customer') },
      { header: 'Payment', value: (r) => <Status value={r.paymentStatus || r.paymentMode} /> },
      { header: 'Items', value: (r) => text(r.salesItems?.length || r.itemCount || 0) },
      { header: 'Total', value: (r) => <span className="font-bold">{money(r.totalAmount)}</span> },
    ],
    fallback: [
      { billNo: 'BILL-1042', customerName: 'Walk-in customer', paymentMode: 'upi', paymentStatus: 'paid', itemCount: 4, totalAmount: 1284, billDate: new Date().toISOString() },
      { billNo: 'BILL-1041', customerName: 'Ravi Kumar', paymentMode: 'cash', paymentStatus: 'paid', itemCount: 2, totalAmount: 428, billDate: new Date().toISOString() },
    ],
  },
  inventory: {
    title: 'Inventory',
    eyebrow: 'Stock control',
    description: 'Track batches, expiry, quantity, rack placement, and supplier source from one view.',
    endpoint: '/inventory',
    icon: Boxes,
    action: 'Adjust stock',
    searchPlaceholder: 'Search medicine, batch, supplier, rack...',
    columns: [
      { header: 'Medicine', value: (r) => <div><p className="font-semibold text-[#1A2B4C]">{text(r.medicine?.brandName || r.medicineName)}</p><p className="text-xs text-slate-500">{text(r.batchNo)}</p></div> },
      { header: 'Store', value: (r) => text(r.store?.name || r.storeName, 'Main store') },
      { header: 'Qty', value: (r) => <span className="font-bold">{text(r.quantity, 0)}</span> },
      { header: 'Expiry', value: (r) => r.expiryDate ? formatDate(r.expiryDate) : '-' },
      { header: 'MRP', value: (r) => money(r.mrp) },
    ],
    fallback: [
      { medicineName: 'Dolo 650mg', batchNo: 'DL650-A1', storeName: 'Head Office', quantity: 8, expiryDate: '2026-09-12', mrp: 34 },
      { medicineName: 'Azithral 500', batchNo: 'AZ500-B2', storeName: 'Head Office', quantity: 42, expiryDate: '2027-01-08', mrp: 120 },
    ],
  },
  medicines: {
    title: 'Medicines',
    eyebrow: 'Master data',
    description: 'Manage medicine catalog, GST, schedule, barcode, stock rules, and manufacturer links.',
    endpoint: '/medicines',
    icon: PackagePlus,
    action: 'Add medicine',
    searchPlaceholder: 'Search brand, generic, barcode...',
    columns: [
      { header: 'Brand', value: (r) => <div><p className="font-semibold text-[#1A2B4C]">{text(r.brandName)}</p><p className="text-xs text-slate-500">{text(r.genericName)}</p></div> },
      { header: 'Form', value: (r) => text(r.form) },
      { header: 'GST', value: (r) => `${text(r.gstPercent, 0)}%` },
      { header: 'Schedule', value: (r) => <Status value={r.schedule || 'general'} /> },
      { header: 'Batches', value: (r) => text(r.batches?.length || 0) },
    ],
    fallback: [
      { brandName: 'Crocin Advance', genericName: 'Paracetamol', form: 'tablet', gstPercent: 12, schedule: 'general', batches: [] },
      { brandName: 'Azithral 500', genericName: 'Azithromycin', form: 'tablet', gstPercent: 12, schedule: 'H', batches: [] },
    ],
  },
  suppliers: {
    title: 'Suppliers',
    eyebrow: 'Master data',
    description: 'Maintain distributor contacts, GST details, credit terms, lead time, and supplier balances.',
    endpoint: '/suppliers',
    icon: Building2,
    action: 'Add supplier',
    searchPlaceholder: 'Search supplier, GSTIN, phone, city...',
    columns: [
      { header: 'Supplier', value: (r) => <div><p className="font-semibold text-[#1A2B4C]">{text(r.companyName)}</p><p className="text-xs text-slate-500">{text(r.contactPerson)}</p></div> },
      { header: 'GSTIN', value: (r) => text(r.gstin) },
      { header: 'Phone', value: (r) => text(r.phone) },
      { header: 'Lead time', value: (r) => `${text(r.leadTimeDays, 0)} days` },
      { header: 'Balance', value: (r) => money(r.currentBalance) },
    ],
    fallback: [
      { companyName: 'MediSupply Distributors', contactPerson: 'Account desk', gstin: '27AAACM0000A1Z5', phone: '8888888888', leadTimeDays: 3, currentBalance: 0 },
    ],
  },
  customers: {
    title: 'Customers',
    eyebrow: 'Master data',
    description: 'Manage patient/customer profiles, loyalty, credit eligibility, and contact history.',
    endpoint: '/customers',
    icon: Users,
    action: 'Add customer',
    searchPlaceholder: 'Search customer, mobile, email...',
    columns: [
      { header: 'Customer', value: (r) => <div><p className="font-semibold text-[#1A2B4C]">{text(`${r.firstName || ''} ${r.lastName || ''}`.trim(), r.customerName)}</p><p className="text-xs text-slate-500">{text(r.customerCode)}</p></div> },
      { header: 'Mobile', value: (r) => text(r.mobile) },
      { header: 'Loyalty', value: (r) => text(r.loyaltyPoints, 0) },
      { header: 'Credit', value: (r) => <Status value={r.isCreditAllowed ? 'enabled' : 'disabled'} /> },
      { header: 'Purchases', value: (r) => money(r.totalPurchases) },
    ],
    fallback: [
      { customerCode: 'CUST001', firstName: 'John', lastName: 'Doe', mobile: '7777777777', loyaltyPoints: 120, isCreditAllowed: false, totalPurchases: 4280 },
    ],
  },
  doctors: {
    title: 'Doctors',
    eyebrow: 'Prescription network',
    description: 'Maintain doctor references for prescription billing, verification, and audit trails.',
    endpoint: '/doctors',
    icon: Stethoscope,
    action: 'Add doctor',
    searchPlaceholder: 'Search doctor, speciality, registration...',
    columns: [
      { header: 'Doctor', value: (r) => <span className="font-semibold">{text(r.name)}</span> },
      { header: 'Speciality', value: (r) => text(r.speciality) },
      { header: 'Registration', value: (r) => text(r.registrationNo) },
      { header: 'Mobile', value: (r) => text(r.mobile) },
      { header: 'Status', value: (r) => <Status value={r.isActive ? 'active' : 'inactive'} /> },
    ],
    fallback: [
      { name: 'Dr. Sharma', speciality: 'General Physician', registrationNo: 'MH-REG-1042', mobile: '6666666666', isActive: true },
    ],
  },
  'purchase-orders': {
    title: 'Purchase orders',
    eyebrow: 'Procurement',
    description: 'Create and track supplier purchase orders before receiving stock into batches.',
    endpoint: '/purchase-orders',
    icon: ClipboardList,
    action: 'Create PO',
    searchPlaceholder: 'Search PO, supplier, status...',
    columns: [
      { header: 'PO No', value: (r) => <span className="font-semibold">{text(r.poNo)}</span> },
      { header: 'Supplier', value: (r) => text(r.supplier?.companyName || r.supplierName) },
      { header: 'Status', value: (r) => <Status value={r.status} /> },
      { header: 'Items', value: (r) => text(r.items?.length || r.itemCount || 0) },
      { header: 'Total', value: (r) => money(r.totalAmount) },
    ],
    fallback: [
      { poNo: 'PO-1008', supplierName: 'MediSupply Distributors', status: 'submitted', itemCount: 12, totalAmount: 45620 },
      { poNo: 'PO-1007', supplierName: 'CarePlus Wholesale', status: 'draft', itemCount: 6, totalAmount: 18400 },
    ],
  },
  'goods-receipt': {
    title: 'Goods receipt',
    eyebrow: 'Receiving',
    description: 'Receive supplier invoices, verify batches, expiry, pricing, and update stock intake status.',
    endpoint: '/goods-receipt',
    icon: Truck,
    action: 'Receive stock',
    searchPlaceholder: 'Search GRN, invoice, supplier...',
    columns: [
      { header: 'GRN', value: (r) => <span className="font-semibold">{text(r.grnNo)}</span> },
      { header: 'Supplier', value: (r) => text(r.supplier?.companyName || r.supplierName) },
      { header: 'Invoice', value: (r) => text(r.invoiceNo) },
      { header: 'Status', value: (r) => <Status value={r.status} /> },
      { header: 'Qty', value: (r) => text(r.totalQuantity, 0) },
    ],
    fallback: [
      { grnNo: 'GRN-405', supplierName: 'MediSupply Distributors', invoiceNo: 'INV-MS-884', status: 'pending', totalQuantity: 240 },
    ],
  },
  returns: {
    title: 'Returns',
    eyebrow: 'Reverse flow',
    description: 'Handle customer returns, supplier returns, credit notes, and stock restoration decisions.',
    endpoint: '/returns',
    icon: RotateCcw,
    action: 'Create return',
    searchPlaceholder: 'Search return, reason, status...',
    columns: [
      { header: 'Return No', value: (r) => <span className="font-semibold">{text(r.returnNo)}</span> },
      { header: 'Type', value: (r) => <Status value={r.returnType || 'customer'} /> },
      { header: 'Reason', value: (r) => text(r.reason) },
      { header: 'Status', value: (r) => <Status value={r.status} /> },
      { header: 'Amount', value: (r) => money(r.refundAmount || r.creditAmount) },
    ],
    fallback: [
      { returnNo: 'RET-209', returnType: 'customer', reason: 'Wrong item', status: 'approved', refundAmount: 220 },
    ],
  },
  stores: {
    title: 'Stores',
    eyebrow: 'Multi-store',
    description: 'Manage branches, GST/drug licenses, users, stock ownership, and transfer readiness.',
    endpoint: '/stores',
    icon: Store,
    action: 'Add store',
    searchPlaceholder: 'Search store, city, code...',
    columns: [
      { header: 'Store', value: (r) => <div><p className="font-semibold">{text(r.name)}</p><p className="text-xs text-slate-500">{text(r.code)}</p></div> },
      { header: 'City', value: (r) => text(r.city) },
      { header: 'Phone', value: (r) => text(r.phone) },
      { header: 'Status', value: (r) => <Status value={r.isActive ? 'active' : 'inactive'} /> },
      { header: 'Users', value: (r) => text(r._count?.users || 0) },
    ],
    fallback: [
      { code: 'HQ', name: 'Head Office', city: 'Mumbai', phone: '9999999999', isActive: true, _count: { users: 2 } },
    ],
  },
  reports: {
    title: 'Reports',
    eyebrow: 'Financial control',
    description: 'Review sales, purchases, GST, audit movement, and purchase suggestions.',
    endpoint: '/reports',
    icon: FileText,
    action: 'Export report',
    searchPlaceholder: 'Search report rows...',
    columns: [
      { header: 'Report', value: (r) => <span className="font-semibold">{text(r.reportName || r.action || 'Daily summary')}</span> },
      { header: 'Store', value: (r) => text(r.store?.name || r.storeName) },
      { header: 'Date', value: (r) => r.summaryDate || r.createdAt ? formatDate(r.summaryDate || r.createdAt) : '-' },
      { header: 'Sales', value: (r) => money(r.totalSales) },
      { header: 'Profit', value: (r) => money(r.totalProfit || r.netProfit) },
    ],
    fallback: [
      { reportName: 'Today summary', storeName: 'Head Office', summaryDate: new Date().toISOString(), totalSales: 12350, totalProfit: 4250 },
    ],
  },
  barcodes: {
    title: 'Barcode labels',
    eyebrow: 'Label printing',
    description: 'Generate, preview, and track printable medicine and batch barcode labels.',
    endpoint: '/barcodes',
    icon: Barcode,
    action: 'Generate labels',
    searchPlaceholder: 'Search barcode, medicine, batch...',
    columns: [
      { header: 'Barcode', value: (r) => <span className="font-semibold">{text(r.barcodeData)}</span> },
      { header: 'Medicine', value: (r) => text(r.medicine?.brandName || r.medicineName) },
      { header: 'Type', value: (r) => <Status value={r.labelType} /> },
      { header: 'Printed', value: (r) => text(r.printCount, 0) },
      { header: 'Format', value: (r) => text(r.barcodeFormat, 'CODE128') },
    ],
    fallback: [
      { barcodeData: '8901234567890', medicineName: 'Dolo 650mg', labelType: 'batch', printCount: 2, barcodeFormat: 'CODE128' },
    ],
  },
  invoices: {
    title: 'Invoices',
    eyebrow: 'Supplier billing',
    description: 'Track purchase invoices, due dates, payment status, and supplier balances.',
    endpoint: '/invoices',
    icon: FileText,
    action: 'Record invoice',
    searchPlaceholder: 'Search invoice, supplier, status...',
    columns: [
      { header: 'Invoice', value: (r) => <span className="font-semibold">{text(r.invoiceNo)}</span> },
      { header: 'Supplier', value: (r) => text(r.supplier?.companyName || r.supplierName) },
      { header: 'Status', value: (r) => <Status value={r.paymentStatus || r.status} /> },
      { header: 'Due', value: (r) => r.dueDate ? formatDate(r.dueDate) : '-' },
      { header: 'Balance', value: (r) => money(r.balanceAmount || r.totalAmount) },
    ],
    fallback: [
      { invoiceNo: 'INV-MS-884', supplierName: 'MediSupply Distributors', paymentStatus: 'unpaid', dueDate: '2026-08-05', balanceAmount: 45620 },
    ],
  },
  notifications: {
    title: 'Notifications',
    eyebrow: 'Action center',
    description: 'See inventory, expiry, payment, approval, and system alerts in one queue.',
    endpoint: '/notifications',
    icon: Users,
    action: 'Mark reviewed',
    searchPlaceholder: 'Search alerts...',
    columns: [
      { header: 'Title', value: (r) => <span className="font-semibold">{text(r.title)}</span> },
      { header: 'Type', value: (r) => <Status value={r.type} /> },
      { header: 'Message', value: (r) => text(r.message) },
      { header: 'Read', value: (r) => <Status value={r.isRead ? 'read' : 'pending'} /> },
      { header: 'Created', value: (r) => r.createdAt ? formatDate(r.createdAt) : '-' },
    ],
    fallback: [
      { title: 'Low stock', type: 'inventory', message: 'Dolo 650mg has 8 units left', isRead: false, createdAt: new Date().toISOString() },
    ],
  },
  settings: {
    title: 'Settings',
    eyebrow: 'System setup',
    description: 'Review business profile, branch setup, users, permissions, GST mode, and operating controls.',
    endpoint: '/settings',
    icon: Settings,
    action: 'Update settings',
    searchPlaceholder: 'Search settings...',
    columns: [
      { header: 'Setting', value: (r) => <span className="font-semibold">{text(r.setting)}</span> },
      { header: 'Value', value: (r) => text(r.value) },
      { header: 'Owner', value: (r) => text(r.owner) },
      { header: 'Status', value: (r) => <Status value={r.status} /> },
      { header: 'Updated', value: (r) => r.updatedAt ? formatDate(r.updatedAt) : 'Recently' },
    ],
    fallback: [
      { setting: 'Business profile', value: 'Head Office', owner: 'Admin', status: 'active' },
      { setting: 'GST billing', value: 'Enabled', owner: 'Finance', status: 'active' },
    ],
  },
}

export default function ModulePage({ module }: { module: keyof typeof configs }) {
  const config = configs[module]
  const [rows, setRows] = useState<any[]>(config.fallback)
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const Icon = config.icon

  useEffect(() => {
    let mounted = true
    api.get(config.endpoint).then(({ data }) => {
      if (!mounted) return
      const normalized = Array.isArray(data) ? data : (data.dailySummaries || data.auditLogs || data.suggestions || [])
      setRows(normalized.length ? normalized : config.fallback)
      setSource(normalized.length ? 'api' : 'fallback')
    }).catch(() => {
      if (!mounted) return
      setRows(config.fallback)
      setSource('fallback')
    })
    return () => { mounted = false }
  }, [config])

  const filteredRows = useMemo(() => {
    const value = query.toLowerCase().trim()
    if (!value) return rows
    return rows.filter((row) => flattenSearch(row).includes(value))
  }, [query, rows])

  const totals = [
    { label: 'Records', value: filteredRows.length },
    { label: 'API status', value: source === 'api' ? 'Live' : 'Demo' },
    { label: 'Open work', value: filteredRows.filter((row) => ['draft', 'pending', 'submitted', 'unpaid'].includes(String(row.status || row.paymentStatus || '').toLowerCase())).length },
  ]

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">{config.eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">{config.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
      </div>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]">
        <Plus className="h-4 w-4" />
        {config.action}
      </button>
    </header>

    <div className="grid gap-4 md:grid-cols-3">
      {totals.map((item) => <section key={item.label} className="rounded-2xl border border-[#dfe8ec] bg-white p-5 text-[#1A2B4C] shadow-[0_2px_8px_rgba(26,43,76,.035)]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500">{item.label}</p>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf3ff] text-[#007BFF]"><Icon className="h-5 w-5" /></div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-[-.035em]">{item.value}</p>
      </section>)}
    </div>

    <section className="rounded-2xl border border-[#dfe8ec] bg-white text-[#1A2B4C] shadow-[0_2px_8px_rgba(26,43,76,.035)]">
      <div className="flex flex-col gap-3 border-b border-[#e7eef2] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.searchPlaceholder} className="h-10 w-full rounded-xl border border-[#dfe8ec] bg-[#fbfcfb] pl-9 pr-3 text-sm outline-none focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10" />
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <ArrowUpRight className="h-3.5 w-3.5 text-[#33CC99]" />
          {source === 'api' ? 'Connected to backend' : 'Showing fallback workflow data'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-[#e7eef2] bg-[#fbfcfb] text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">
            <tr>{config.columns.map((column) => <th key={column.header} className="px-5 py-3">{column.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#eef2f4]">
            {filteredRows.map((row, index) => <tr key={row.id || row.billNo || row.poNo || row.grnNo || row.invoiceNo || row.returnNo || index} className="hover:bg-[#fbfcfb]">
              {config.columns.map((column) => <td key={column.header} className="px-5 py-4 text-sm text-slate-700">{column.value(row)}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </div>
}
