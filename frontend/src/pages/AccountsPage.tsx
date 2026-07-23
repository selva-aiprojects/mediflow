import { useEffect, useState } from 'react'
import { Plus, Wallet, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { accountsApi, transactionsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import Modal from '@/components/ui/modal'
import { FormField, FormSelect, FormTextarea } from '@/components/ui/form-field'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { showToast } from '@/components/ui/toast'

const accountDefaults = { name: '', type: 'expense', description: '', balance: 0, isActive: true }
const transactionDefaults = { accountId: '', type: 'debit', amount: '', date: new Date().toISOString().split('T')[0], reference: '', description: '' }
const accountTypes = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' }
]
const transactionTypes = [
  { value: 'debit', label: 'Debit (Dr)' },
  { value: 'credit', label: 'Credit (Cr)' }
]

export default function AccountsPage() {
  const [tab, setTab] = useState<'accounts' | 'transactions'>('accounts')
  
  const [accounts, setAccounts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [accForm, setAccForm] = useState(accountDefaults)
  const [accEditing, setAccEditing] = useState<any>(null)
  const [accModalOpen, setAccModalOpen] = useState(false)
  const [accDeleteTarget, setAccDeleteTarget] = useState<any>(null)
  
  const [txForm, setTxForm] = useState(transactionDefaults)
  const [txModalOpen, setTxModalOpen] = useState(false)
  
  const [saving, setSaving] = useState(false)

  const loadAccounts = () => accountsApi.getAll().then(({ data }) => setAccounts(data)).catch(() => {})
  const loadTransactions = () => transactionsApi.getAll().then(({ data }) => setTransactions(data)).catch(() => {})
  
  const loadAll = () => {
    setLoading(true)
    Promise.all([loadAccounts(), loadTransactions()]).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  // Accounts Handlers
  const openAccCreate = () => { setAccForm(accountDefaults); setAccEditing(null); setAccModalOpen(true) }
  const openAccEdit = (row: any) => { setAccForm({ ...row }); setAccEditing(row); setAccModalOpen(true) }
  
  const handleAccSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accForm.name) return showToast('error', 'Name is required')
    setSaving(true)
    try {
      if (accEditing) { await accountsApi.update(accEditing.id, accForm); showToast('success', 'Account updated') }
      else { await accountsApi.create(accForm); showToast('success', 'Account created') }
      setAccModalOpen(false); loadAll()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to save account') }
    setSaving(false)
  }

  const handleAccDelete = async () => {
    if (!accDeleteTarget) return
    try { await accountsApi.delete(accDeleteTarget.id); showToast('success', 'Account deleted'); loadAll() } catch { showToast('error', 'Failed to delete account') }
    setAccDeleteTarget(null)
  }

  // Transaction Handlers
  const openTxCreate = () => { setTxForm(transactionDefaults); setTxModalOpen(true) }
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txForm.accountId || !txForm.amount) return showToast('error', 'Account and Amount are required')
    setSaving(true)
    try {
      const payload = { ...txForm, amount: Number(txForm.amount) }
      await transactionsApi.create(payload);
      showToast('success', 'Transaction recorded')
      setTxModalOpen(false); loadAll()
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Failed to record transaction') }
    setSaving(false)
  }

  const accColumns: Column<any>[] = [
    { header: 'Account Name', render: (r) => <div className="font-semibold text-[#1A2B4C]">{r.name}</div> },
    { header: 'Type', render: (r) => <span className="capitalize text-xs font-bold text-slate-500">{r.type}</span> },
    { header: 'Balance', render: (r) => <span className={`font-bold ${r.balance < 0 ? 'text-rose-500' : 'text-[#1A2B4C]'}`}>{formatCurrency(Number(r.balance))}</span> },
    { header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${r.isActive ? 'bg-[#eefbf7] text-[#1f7f62]' : 'bg-[#fff1f2] text-[#a0162d]'}`}>{r.isActive ? 'Active' : 'Inactive'}</span> },
    { header: '', render: (r) => <div className="flex gap-1"><button onClick={(e) => { e.stopPropagation(); openAccEdit(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#007BFF] hover:bg-[#eaf3ff]">Edit</button><button onClick={(e) => { e.stopPropagation(); setAccDeleteTarget(r) }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50">Delete</button></div>, className: 'text-right' },
  ]

  const txColumns: Column<any>[] = [
    { header: 'Date', render: (r) => formatDate(r.date) },
    { header: 'Account', render: (r) => <span className="font-semibold">{r.account?.name || '—'}</span> },
    { header: 'Reference', render: (r) => <span className="text-slate-500">{r.reference || '—'}</span> },
    { header: 'Description', render: (r) => <span className="text-sm">{r.description || '—'}</span> },
    { header: 'Type', render: (r) => r.type === 'credit' ? <span className="inline-flex items-center gap-1 text-emerald-600 font-medium"><TrendingUp className="h-3 w-3" /> Credit</span> : <span className="inline-flex items-center gap-1 text-rose-600 font-medium"><TrendingDown className="h-3 w-3" /> Debit</span> },
    { header: 'Amount', render: (r) => <span className="font-bold">{formatCurrency(Number(r.amount))}</span>, className: 'text-right' },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#007BFF]">Finance</p>
          <h1 className="text-3xl font-bold tracking-[-.04em] text-[#1A2B4C]">Accounts & Ledger</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage chart of accounts and record store-level financial transactions.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button onClick={() => setTab('accounts')} className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${tab === 'accounts' ? 'bg-white text-[#1A2B4C] shadow-sm' : 'text-slate-500 hover:text-[#1A2B4C]'}`}>Chart of Accounts</button>
            <button onClick={() => setTab('transactions')} className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${tab === 'transactions' ? 'bg-white text-[#1A2B4C] shadow-sm' : 'text-slate-500 hover:text-[#1A2B4C]'}`}>Transactions</button>
          </div>
          <button onClick={tab === 'accounts' ? openAccCreate : openTxCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#007BFF] px-4 text-sm font-bold text-white shadow-lg shadow-[#007BFF]/20 hover:bg-[#0066d6]">
            <Plus className="h-4 w-4" /> {tab === 'accounts' ? 'New account' : 'Record transaction'}
          </button>
        </div>
      </header>

      {tab === 'accounts' ? (
        <DataTable data={accounts} columns={accColumns} loading={loading} source="api" searchPlaceholder="Search accounts..." searchKeys={['name', 'type']} onRowClick={openAccEdit} />
      ) : (
        <DataTable data={transactions} columns={txColumns} loading={loading} source="api" searchPlaceholder="Search transactions..." searchKeys={['reference', 'description', 'account.name']} />
      )}

      {/* Account Modal */}
      <Modal open={accModalOpen} onClose={() => setAccModalOpen(false)} title={accEditing ? 'Edit account' : 'New account'} description="Configure a ledger account.">
        <form onSubmit={handleAccSubmit} className="space-y-4">
          <FormField label="Account name" value={accForm.name} onChange={(e) => setAccForm({ ...accForm, name: e.target.value })} required placeholder="e.g., Petty Cash, Rent Expense" />
          <FormSelect label="Account type" value={accForm.type} onChange={(e) => setAccForm({ ...accForm, type: e.target.value })} options={accountTypes} />
          {!accEditing && <FormField label="Opening balance" type="number" value={accForm.balance} onChange={(e) => setAccForm({ ...accForm, balance: Number(e.target.value) })} />}
          <FormTextarea label="Description" value={accForm.description} onChange={(e) => setAccForm({ ...accForm, description: e.target.value })} rows={2} />
          <div className="pt-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={accForm.isActive} onChange={(e) => setAccForm({ ...accForm, isActive: e.target.checked })} className="h-4 w-4 rounded" /> Account is active</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setAccModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#007BFF] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#0066d6] disabled:opacity-50">Save account</button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Confirm */}
      <ConfirmDialog open={!!accDeleteTarget} onClose={() => setAccDeleteTarget(null)} onConfirm={handleAccDelete} title="Delete account" description={`Are you sure you want to delete "${accDeleteTarget?.name}"?`} confirmLabel="Delete" />

      {/* Transaction Modal */}
      <Modal open={txModalOpen} onClose={() => setTxModalOpen(false)} title="Record transaction" description="Log a debit or credit against an account.">
        <form onSubmit={handleTxSubmit} className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="Account" value={txForm.accountId} onChange={(e) => setTxForm({ ...txForm, accountId: e.target.value })} options={accounts.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))} required className="sm:col-span-2" />
          <FormSelect label="Type" value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value })} options={transactionTypes} required />
          <FormField label="Amount" type="number" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} required />
          <FormField label="Date" type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} required />
          <FormField label="Reference No" value={txForm.reference} onChange={(e) => setTxForm({ ...txForm, reference: e.target.value })} placeholder="e.g., CHQ-123" />
          <FormTextarea label="Description" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} rows={2} className="sm:col-span-2" />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sm:col-span-2">
            <button type="button" onClick={() => setTxModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#007BFF] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#0066d6] disabled:opacity-50">Record transaction</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
