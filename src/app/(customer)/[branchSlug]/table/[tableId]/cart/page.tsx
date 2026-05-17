'use client'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, total, sessionId } = useCartStore()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  const branchSlug = params.branchSlug as string
  const tableId = params.tableId as string

  async function submitOrder() {
    if (items.length === 0) return
    setLoading(true)
    const supabase = createClient()

    const { data: branch } = await supabase
      .from('branches').select('id').eq('slug', branchSlug).single()

    if (!branch) { toast.error('Lỗi quán'); setLoading(false); return }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        branch_id: branch.id,
        table_id: tableId,
        session_id: sessionId,
        status: 'pending',
        payment_status: 'unpaid',
        total_amount: total(),
        note,
      })
      .select()
      .single()

    if (error || !order) { toast.error('Gửi order thất bại!'); setLoading(false); return }

    await supabase.from('order_items').insert(
      items.map(i => ({
        order_id: order.id,
        menu_item_id: i.menu_item.id,
        quantity: i.quantity,
        unit_price: i.menu_item.price,
        subtotal: i.menu_item.price * i.quantity,
        note: i.note,
      }))
    )

    clearCart()
    toast.success('Đã gửi order! Bếp đang chuẩn bị.')
    router.push(`/${branchSlug}/table/${tableId}/orders`)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Giỏ hàng trống</p>
        <Button onClick={() => router.back()}>Quay lại menu</Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white sticky top-0 z-40 shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">Giỏ hàng</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {items.map(item => (
          <div key={item.menu_item.id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm border border-gray-100">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.menu_item.name}</p>
              <p className="text-orange-500 font-bold mt-1">{formatCurrency(item.menu_item.price)}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeItem(item.menu_item.id)} className="text-red-400">
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.menu_item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.menu_item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <label className="text-sm font-medium text-gray-700">Ghi chú cho bếp</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ít đường, không hành..."
            className="w-full mt-2 text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={2}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 space-y-3">
        <div className="flex justify-between text-base font-bold">
          <span>Tổng cộng</span>
          <span className="text-orange-500">{formatCurrency(total())}</span>
        </div>
        <Button size="lg" className="w-full" onClick={submitOrder} loading={loading}>
          Gửi order cho bếp
        </Button>
      </div>
    </main>
  )
}
