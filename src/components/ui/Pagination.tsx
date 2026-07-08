import React from 'react'
import type { PaginationMeta } from '../../types'

interface PaginationProps {
  meta: PaginationMeta | null
  onPageChange: (page: number) => void
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.total === 0) return null
  return (
    <div className="pagination">
      <span className="muted">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </span>
      <div className="row">
        <button
          type="button"
          className="btn-secondary"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
