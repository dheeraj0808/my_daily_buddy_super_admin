import React from 'react'
import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}

export function Card({ children, className, hover, glass }: CardProps) {
  return (
    <div className={cn(
      'rounded-2xl border border-slate-200/60 bg-white p-6 shadow-card',
      glass && 'glass-card',
      hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/50 hover:shadow-card-hover',
      className,
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: React.ReactNode
  sub?: string
  icon: LucideIcon
  gradient: string
  loading?: boolean
  onClick?: () => void
}

export function StatCard({ label, value, sub, icon: Icon, gradient, loading, onClick }: StatCardProps) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 text-left shadow-card transition-all duration-300',
        onClick && 'hover:-translate-y-1 hover:border-brand-200/60 hover:shadow-card-hover cursor-pointer',
      )}
    >
      <div className={cn('absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl transition group-hover:opacity-30', gradient)} />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? <div className="stat-shimmer h-9 w-20" /> : value}
          </div>
          {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg', gradient)}>
          <Icon className="h-6 w-6" strokeWidth={2} />
        </div>
      </div>
    </Wrapper>
  )
}
