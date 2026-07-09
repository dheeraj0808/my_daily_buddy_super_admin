import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/plans': 'Plans',
  '/subscriptions': 'Subscriptions',
  '/users': 'Users',
  '/notifications': 'Notifications',
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  badge?: string
}

export default function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  const location = useLocation()
  const current = ROUTE_LABELS[location.pathname] ?? title

  return (
    <div className="relative mb-8">
      <div className="absolute -left-4 top-0 h-full w-1 rounded-full bg-gradient-to-b from-brand-500 to-violet-500 opacity-80" />
      <nav className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Link to="/" className="transition hover:text-brand-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-600">{current}</span>
      </nav>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            {badge && (
              <span className="rounded-full bg-gradient-to-r from-brand-50 to-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200/60">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </div>
  )
}

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('animate-slide-up', className)}>
      {children}
    </div>
  )
}
