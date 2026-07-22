import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

let toastListeners: ((toast: Toast) => void)[] = []

export function showToast(type: Toast['type'], message: string) {
  const toast: Toast = { id: Date.now().toString(), type, message }
  toastListeners.forEach((listener) => listener(toast))
}

const icons = { success: CheckCircle, error: XCircle, info: Info }
const styles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = icons[toast.type]
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className={cn('pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg', styles[toast.type])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={onDismiss} className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
    </div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => setToasts((prev) => [...prev, toast])
    toastListeners.push(listener)
    return () => { toastListeners = toastListeners.filter((l) => l !== listener) }
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}
