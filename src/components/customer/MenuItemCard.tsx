'use client'
import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'
import { MenuItem } from '@/types'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQty } = useCartStore()
  const cartItem = items.find(i => i.menu_item.id === item.id)
  const qty = cartItem?.quantity ?? 0

  return (
    <div className="flex gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
      {item.image_url && (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-orange-500">{formatCurrency(item.price)}</span>
          {qty === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="flex items-center gap-1 bg-orange-500 text-white rounded-full px-3 py-1 text-sm font-medium active:scale-95 transition-transform"
            >
              <Plus size={14} /> Thêm
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.id, qty - 1)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-95"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center font-bold text-sm">{qty}</span>
              <button
                onClick={() => addItem(item)}
                className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center active:scale-95"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
