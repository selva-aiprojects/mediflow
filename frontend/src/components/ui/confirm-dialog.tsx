import Modal from './modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-[#1A2B4C]">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <div className="mt-6 flex w-full gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-[#dbe5ea] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60">
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
