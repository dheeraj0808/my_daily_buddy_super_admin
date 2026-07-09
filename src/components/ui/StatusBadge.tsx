import React from 'react'
import { cn } from '../../lib/utils'

interface StatusBadgeProps {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
  variant?: 'default' | 'purple' | 'blue'
}

export default function StatusBadge({
  active,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  variant = 'default',
}: StatusBadgeProps) {
  const inactiveColors = 'bg-slate-100 text-slate-600 ring-slate-500/10'
  const activeColors = {
    default: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        active ? activeColors[variant] : inactiveColors,
      )}
    >
      <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', active ? 'bg-current' : 'bg-slate-400')} />
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

export function RoleBadge({ roleId }: { roleId: number }) {
  const map: Record<number, { label: string; className: string }> = {
    0: { label: 'Super Admin', className: 'bg-violet-50 text-violet-700 ring-violet-600/20' },
    1: { label: 'Admin', className: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    2: { label: 'User', className: 'bg-slate-100 text-slate-600 ring-slate-500/10' },
  }
  const item = map[roleId] ?? { label: `Role ${roleId}`, className: 'bg-slate-100 text-slate-600' }
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', item.className)}>
      {item.label}
    </span>
  )
}
