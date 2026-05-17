'use client'
import { useState } from 'react'
import { MenuItem, Category } from '@/types'
import { MenuForm } from './MenuForm'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Props {
  items: MenuItem[]
  categories: Category[]
  branchId: string
}

export function MenuClient({ items: initialItems, categories, branchId }: Props) {
  const [items, setItems] = useState(initialItems)
  const [editing, setEditing] = useState<MenuItem | null | 'new'>(null)
  const router = useRouter()

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Xoá "${item.name}"?`)) return
    const supabase = createClient()
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id)
    if (error) { toast.error('Xoá thất bại'); return }
    setItems(prev => prev.filter(i => i.id !== item.id))
    toast.success('Đã xoá')
  }

  function handleDone() {
    setEditing(null)
    router.refresh()
  }

  const grouped = categories.map(cat => ({
    cat,
    items: items.filter(i => i.category_id === cat.id),
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Menu</h1>
        <Button onClick={() => setEditing('new')}>
          <Plus size={16} className="mr-1" /> Thêm món
        </Button>
      </div>

      {/* Modal form */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5">
            <h2 className="font-bold text-lg mb-4">
              {editing === 'new' ? 'Thêm món mới' : `Sửa: ${(editing as MenuItem).name}`}
            </h2>
            <MenuForm
              item={editing === 'new' ? undefined : editing as MenuItem}
              categories={categories}
              branchId={branchId}
              onDone={handleDone}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* Menu list grouped by category */}
      {grouped.map(({ cat, items: catItems }) => (
        <section key={cat.id}>
          <h2 className="font-bold text-gray-800 mb-3">
            {cat.name} <span className="text-gray-500 font-normal text-sm">({catItems.length})</span>
          </h2>
          <div className="space-y-2">
            {catItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-3 flex gap-3 items-center shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {item.image_url ? (
                    <div className="relative w-full h-full">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <ImageOff size={20} className="text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-gray-600 truncate">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-orange-500 font-bold text-sm">{formatCurrency(item.price)}</span>
                    {!item.is_available && <Badge variant="danger">Hết hàng</Badge>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditing(item)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteItem(item)}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {catItems.length === 0 && (
              <p className="text-sm text-gray-400 pl-2">Chưa có món nào</p>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
