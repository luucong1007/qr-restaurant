'use client'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface CartBarProps {
  branchSlug: string
  tableId: string
}

export function CartBar({ branchSlug, tableId }: CartBarProps) {
  const { items, total } = useCartStore()
  const router = useRouter()
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <button
        onClick={() => router.push(`/${branchSlug}/table/${tableId}/cart`)}
        className="w-full bg-orange-500 text-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-lg active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center">
            <span className="text-xs font-bold">{totalItems}</span>
          </div>
          <span className="font-medium">Xem giỏ hàng</span>
        </div>
        <span className="font-bold">{formatCurrency(total())}</span>
      </button>
    </div>
  )
}
