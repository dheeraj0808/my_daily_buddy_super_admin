import React from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 hover:shadow-lg hover:shadow-brand-500/30 focus:ring-brand-500/30',
  secondary: 'bg-white text-slate-700 border border-slate-200/80 shadow-sm hover:bg-slate-50 hover:border-slate-300',
  danger: 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-500/20 hover:from-red-600 hover:to-red-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
  outline: 'border-2 border-brand-200 bg-brand-50/50 text-brand-700 hover:bg-brand-50 hover:border-brand-300',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
