import React from 'react'
import { Card } from './Card'

interface FilterBarProps {
  children: React.ReactNode
}

export default function FilterBar({ children }: FilterBarProps) {
  return (
    <Card className="mb-5 !p-4">
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
