import React from 'react'
import EmptyState, { TableSkeleton } from './EmptyState'
import { cn } from '../../lib/utils'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyMessage?: string
  emptyDescription?: string
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyMessage = 'No records found',
  emptyDescription,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <TableSkeleton cols={columns.length} />}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyMessage} description={emptyDescription} />
                </td>
              </tr>
            )}
            {!loading && rows.map((row, i) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  'transition-colors duration-150 hover:bg-brand-50/30',
                  i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                )}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-5 py-4 text-sm text-slate-700', col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
