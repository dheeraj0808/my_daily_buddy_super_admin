import React from 'react'
import EmptyState, { TableSkeleton } from './EmptyState'

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
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${col.className || ''}`}
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
            {!loading && rows.map(row => (
              <tr key={rowKey(row)} className="transition hover:bg-slate-50/60">
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3.5 text-slate-700 ${col.className || ''}`}>
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
