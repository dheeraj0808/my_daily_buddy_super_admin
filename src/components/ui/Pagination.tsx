import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '../../types'
import Button from './Button'

interface PaginationProps {
  meta: PaginationMeta | null
  onPageChange: (page: number) => void
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.total === 0) return null
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing page <span className="font-medium text-slate-700">{meta.page}</span> of{' '}
        <span className="font-medium text-slate-700">{meta.totalPages}</span>
        <span className="mx-1.5 text-slate-300">·</span>
        <span className="font-medium text-slate-700">{meta.total}</span> total records
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
