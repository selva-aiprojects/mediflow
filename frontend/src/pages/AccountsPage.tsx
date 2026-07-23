import { useEffect, useState } from 'react'
import { Plus, Wallet, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react'
import { transactionsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect, FormTextarea } from '@/components/ui/form-field'
import { showToast } from '@/components/ui/toast'

const transactionDefaults = { category: 'sales', type: 'income', amount: '', date: new Date().toISOString().split('T')[0], reference: '', description: '' }
const categories = [
  { value: 'sales', label: 'Sales' },
  { value: 'sales_returns', label: 'Sales Returns' },
  { value: 'purchases', label: 'Purchases' },
  { value: 'purchases_returns', label: 'Purchases Returns' },
  { value: 'utilities', label: 'Utilities & Bills' },
  { value: 'salary', label: 'Salary & Wages' },
  { value: 'petty_cash', label: 'Petty Cash / Office Expenses' },
  { value: 'rent', label: 'Rent' },
  { value: 'other', label: 'Other' }
]

export default function AccountsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [txForm, setTxForm] = useState(transactionDefaults)
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadTransactions = () => {
    setLoading(true)
    transactionsApi.getAll().then(({ data }) => setTransactions(data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { loadTransactions() }, [])

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txForm.category || !txForm.type || !txForm.amount || !txForm.date) return showToast('error', 'Please fill required fields.')
    try {
      setSaving(true)
      await transactionsApi.create(txForm)
      showToast('success', 'Transaction saved.')
      setTxModalOpen(false)
      loadTransactions()
    } catch {
      showToast('error', 'Failed to save transaction.')
    } finally {
      setSaving(false)
    }
  }

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  const currentBalance = totalIncome - totalExpense

  const txCols: Column<any>[] = [
    { header: 'Date', render: (row: any) => formatDate(row.date) },
    { header: 'Type', render: (row: any) => <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${row.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{row.type === 'income' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {row.type.toUpperCase()}</span> },
    { header: 'Category', render: (row: any) => <span className="font-medium text-[#1A2B4C] capitalize">{row.category.replace('_', ' ')}</span> },
    { header: 'Reference', render: (row: any) => row.reference || '-' },
    { header: 'Description', render: (row: any) => row.description || '-' },
    { header: 'Amount', render: (row: any) => <span className={`font-semibold ${row.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{row.type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}</span> },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Accounts</p>
          <h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Cash Book</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Track all income and expenses in a single ledger.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadTransactions()} className="flex items-center gap-2 rounded-xl border border-[#dfe8ec] bg-white px-4 py-2 text-sm font-semibold text-[#1A2B4C] hover:bg-slate-50">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button onClick={() => { setTxForm(transactionDefaults); setTxModalOpen(true) }} className="flex items-center gap-2 rounded-xl bg-[#007BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0066CC]">
            <Plus className="h-4 w-4" /> Add Transaction
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dfe8ec] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#007BFF]/10 text-[#007BFF]">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Current Balance</p>
              <p className={`text-2xl font-bold tracking-tight ${currentBalance >= 0 ? 'text-[#1A2B4C]' : 'text-rose-600'}`}>{formatCurrency(currentBalance)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#dfe8ec] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Income</p>
              <p className="text-2xl font-bold tracking-tight text-[#1A2B4C]">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#dfe8ec] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expenses</p>
              <p className="text-2xl font-bold tracking-tight text-[#1A2B4C]">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dfe8ec] bg-white shadow-sm">
        <div className="border-b border-[#dfe8ec] p-6">
          <h2 className="text-lg font-bold text-[#1A2B4C]">Transaction Ledger</h2>
        </div>
        <DataTable data={transactions} columns={txCols} loading={loading} />
      </div>

      <Modal open={txModalOpen} title="Record Transaction" onClose={() => setTxModalOpen(false)}>
          <form onSubmit={handleSaveTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormSelect label="Transaction Type" required value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value })} options={[{value: 'income', label: 'Income'}, {value: 'expense', label: 'Expense'}]} />
              <FormSelect label="Category" required value={txForm.category} onChange={(e) => setTxForm({ ...txForm, category: e.target.value })} options={categories} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (₹)" type="number" required min="0" step="0.01" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} />
              <FormField label="Date" type="date" required value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} />
            </div>
            <FormField label="Reference Number" value={txForm.reference} onChange={(e) => setTxForm({ ...txForm, reference: e.target.value })} placeholder="e.g. Receipt No, Bill No" />
            <FormTextarea label="Description" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} placeholder="Enter transaction details..." rows={2} />
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setTxModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#007BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0066CC] disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </Modal>
    </div>
  )
}
