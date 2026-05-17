'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  ready: 'Sẵn sàng phục vụ',
  served: 'Đã phục vụ',
  paid: 'Đã thanh toán',
  cancelled: 'Đã huỷ',
}

const statusVariant: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  pending: 'default',
  confirmed: 'info',
  preparing: 'warning',
  ready: 'success',
  served: 'success',
  paid: 'success',
  cancelled: 'danger',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const router = useRouter()
  const params = useParams()
  const { sessionId } = useCartStore()

  const branchSlug = params.branchSlug as string
  const tableId = params.tableId as string

  useEffect(() => {
    const supabase = createClient()

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*, menu_item:menu_items(name, price))')
        .eq('table_id', tableId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
    }

    fetchOrders()

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `table_id=eq.${tableId}` }, fetchOrders)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tableId, sessionId])

  const totalAmount = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0)
  const allPaid = orders.length > 0 && orders.every(o => o.payment_status === 'paid' || o.status === 'cancelled')

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white sticky top-0 z-40 shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">Lịch sử order</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có order nào</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-400">#{order.id.slice(-6).toUpperCase()}</p>
                  <Badge variant={statusVariant[order.status]} className="mt-1">
                    {statusLabel[order.status]}
                  </Badge>
                </div>
                <span className="font-bold text-orange-500">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="space-y-1">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>{item.menu_item?.name} × {item.quantity}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {orders.length > 0 && !allPaid && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <div className="flex justify-between font-bold text-base">
            <span>Tổng bill</span>
            <span className="text-orange-500">{formatCurrency(totalAmount)}</span>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(`/${branchSlug}/table/${tableId}/payment`)}
          >
            Thanh toán
          </Button>
        </div>
      )}
    </main>
  )
}
