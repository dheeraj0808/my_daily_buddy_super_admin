import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '../../types'
import Button from './Button'
import { cn } from '../../lib/utils'

interface PaginationProps {
  meta: PaginationMeta | null
  onPageChange: (page: number) => void
}

function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.total === 0) return null

  const pages = pageRange(meta.page, meta.totalPages)

  return (
    <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/80 px-5 py-4 shadow-card backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-800">{meta.page}</span> of{' '}
        <span className="font-semibold text-slate-800">{meta.totalPages}</span>
        <span className="mx-2 text-slate-300">|</span>
        <span className="font-semibold text-slate-800">{meta.total.toLocaleString()}</span> total
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                'flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all',
                p === meta.page
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {p}
            </button>
          ),
        )}
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
