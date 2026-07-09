import React from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type AlertVariant = 'success' | 'error' | 'info'

interface AlertProps {
  variant?: AlertVariant
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

const styles: Record<AlertVariant, { wrap: string; icon: React.ReactNode }> = {
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />,
  },
  error: {
    wrap: 'border-red-200 bg-red-50 text-red-800',
    icon: <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />,
  },
  info: {
    wrap: 'border-brand-200 bg-brand-50 text-brand-800',
    icon: <Info className="h-5 w-5 shrink-0 text-brand-600" />,
  },
}

export default function Alert({ variant = 'info', children, onDismiss, className }: AlertProps) {
  const s = styles[variant]
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-fade-in', s.wrap, className)} role="alert">
      {s.icon}
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
