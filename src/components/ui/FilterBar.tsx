import React from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FilterBarProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export default function FilterBar({ children, title = 'Filters', className }: FilterBarProps) {
  return (
    <div className={cn('mb-6 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-card backdrop-blur-sm', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="text-xs text-slate-400">Refine results with the options below</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {children}
      </div>
    </div>
  )
}

export function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-field">{label}</label>
      {children}
    </div>
  )
}
