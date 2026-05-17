import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md'
  className?: string
}

export function Logo({ href = '/admin', size = 'md', className }: LogoProps) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2 group', className)}>
      <div className={cn(
        'bg-orange-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors',
        size === 'sm' ? 'w-7 h-7 text-base' : 'w-9 h-9 text-xl'
      )}>
        🍜
      </div>
      <span className={cn(
        'font-bold text-gray-900',
        size === 'sm' ? 'text-base' : 'text-lg'
      )}>
        QR Menu
      </span>
    </Link>
  )
}
