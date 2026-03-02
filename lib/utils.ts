import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function formatTaka(amount: string | null): string {
  if (!amount) return 'Negotiable'
  // If already has ৳ sign return as is
  if (amount.includes('৳')) return amount
  // If has $ replace with ৳
  return amount.replace('$', '৳')
}

/** Format a numeric amount to BDT: 10000 → ৳10,000 */
export function formatBDT(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return 'Negotiable'
  return '৳' + amount.toLocaleString('en-BD')
}

/** Parse raw number input → formatted BDT display + numeric amount */
export function parseBDTInput(raw: string): { display: string; amount: number } {
  const digits = raw.replace(/[^0-9]/g, '')
  const amount = parseInt(digits) || 0
  const display = amount > 0 ? '৳' + amount.toLocaleString('en-BD') : ''
  return { display, amount }
}
