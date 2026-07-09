import React from 'react'
import { Search } from 'lucide-react'
import { Card } from './Card'

interface FilterBarProps {
  children: React.ReactNode
  title?: string
}

export default function FilterBar({ children, title = 'Filters' }: FilterBarProps) {
  return (
    <Card className="mb-6 !p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Search className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {children}
      </div>
    </Card>
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
