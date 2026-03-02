'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  icon?: string
  visible: boolean
  onHide: () => void
}

export default function Toast({ message, icon = '✅', visible, onHide }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 3200)
      return () => clearTimeout(t)
    }
  }, [visible, onHide])

  return (
    <div className={cn(
      'fixed bottom-8 right-8 z-50 flex items-center gap-3',
      'bg-gradient-to-r from-[#1a3a1a] to-[#2d5a2d] border border-green-500/20',
      'rounded-xl px-6 py-4 shadow-2xl',
      'transition-all duration-500',
      visible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-20 opacity-0 pointer-events-none'
    )}>
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-semibold text-green-300">{message}</span>
    </div>
  )
}
