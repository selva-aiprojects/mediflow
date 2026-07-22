import { cn } from '@/lib/utils'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function FormField({ label, error, hint, className, id, ...props }: FormFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-semibold text-[#1A2B4C]">{label}</label>
      <input
        id={inputId}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition',
          error ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-[#dbe5ea] focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function FormSelect({ label, error, options, placeholder, className, id, ...props }: FormSelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-sm font-semibold text-[#1A2B4C]">{label}</label>
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition',
          error ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-[#dbe5ea] focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function FormTextarea({ label, error, className, id, ...props }: FormTextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      <label htmlFor={textareaId} className="block text-sm font-semibold text-[#1A2B4C]">{label}</label>
      <textarea
        id={textareaId}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition resize-none',
          error ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-[#dbe5ea] focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10',
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
