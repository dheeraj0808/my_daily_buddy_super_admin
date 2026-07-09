import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  description?: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
  size?: 'md' | 'lg'
}

export default function Modal({ title, description, open, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-md sm:p-8 animate-fade-in"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full animate-slide-up overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'}`}
      >
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}
