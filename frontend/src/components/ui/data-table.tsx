import { useMemo, useState } from 'react'
import { Search, ArrowUpRight } from 'lucide-react'
import EmptyState from './empty-state'
import { TableSkeleton } from './skeleton'

export interface Column<T> {
  header: string
  className?: string
  render: (row: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchPlaceholder?: string
  searchKeys?: string[]
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  onRowClick?: (row: T) => void
  source?: 'api' | 'fallback'
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading,
  searchPlaceholder = 'Search...',
  searchKeys,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or create a new record.',
  emptyAction,
  onRowClick,
  source = 'api',
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return data
    return data.filter((row) => {
      if (searchKeys?.length) {
        return searchKeys.some((key) => String(row[key] || '').toLowerCase().includes(q))
      }
      return JSON.stringify(row).toLowerCase().includes(q)
    })
  }, [query, data, searchKeys])

  if (loading) return <TableSkeleton rows={5} columns={columns.length} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-[#dfe8ec] bg-[#fbfcfb] pl-9 pr-3 text-sm outline-none focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#dfe8ec] bg-white shadow-[0_2px_8px_rgba(26,43,76,.035)]">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-[#e7eef2] bg-[#fbfcfc] text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">
              <tr>
                {columns.map((col) => (
                  <th key={col.header} className={`px-5 py-3 ${col.className || ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f4]">
              {filtered.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-[#fbfcfb] ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.header} className={`px-5 py-4 text-sm text-slate-700 ${col.className || ''}`}>
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
