import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount) + 'đ'
}

export function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
