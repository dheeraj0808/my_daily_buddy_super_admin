import React from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyMessage?: string
}

export default function DataTable<T>({ columns, rows, rowKey, loading, emptyMessage = 'No records found.' }: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={columns.length} className="table-state">Loading…</td></tr>
          )}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={columns.length} className="table-state">{emptyMessage}</td></tr>
          )}
          {!loading && rows.map(row => (
            <tr key={rowKey(row)}>
              {columns.map(col => <td key={col.key}>{col.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
