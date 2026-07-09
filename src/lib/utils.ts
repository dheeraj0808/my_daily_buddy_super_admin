import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(email?: string | null): string {
  if (!email) return 'SA'
  const part = email.split('@')[0] || 'SA'
  return part.slice(0, 2).toUpperCase()
}
