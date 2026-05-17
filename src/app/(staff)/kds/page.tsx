'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const KDS_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing']

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
}

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Chờ',
  confirmed: 'Xác nhận',
  preparing: 'Đang làm',
  ready: 'Xong',
  served: 'Đã phục vụ',
  paid: 'Đã TT',
  cancelled: 'Huỷ',
}

const columnColor: Record<string, string> = {
  pending: 'bg-yellow-50 border-yellow-200',
  confirmed: 'bg-blue-50 border-blue-200',
  preparing: 'bg-orange-50 border-orange-200',
}

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const supabase = createClient()

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, table:tables(name), items:order_items(*, menu_item:menu_items(name))')
        .in('status', KDS_STATUSES)
        .order('created_at')
      setOrders(data ?? [])
    }

    fetchOrders()

    const channel = supabase
      .channel('kds-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function advance(order: Order) {
    const next = nextStatus[order.status]
    if (!next) return
    const supabase = createClient()
    await supabase.from('orders').update({ status: next }).eq('id', order.id)
  }

  const columns = KDS_STATUSES.map(status => ({
    status,
    orders: orders.filter(o => o.status === status),
  }))

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white font-bold text-2xl">Kitchen Display</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-6rem)]">
        {columns.map(col => (
          <div key={col.status} className="flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-gray-900 pb-2">
              <h2 className="text-white font-semibold">{statusLabel[col.status]}</h2>
              <span className="bg-gray-700 text-white text-xs rounded-full px-2 py-0.5">
                {col.orders.length}
              </span>
            </div>

            {col.orders.map(order => (
              <div
                key={order.id}
                className={`rounded-2xl border p-3 ${columnColor[order.status]}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-gray-800 text-lg">
                      Bàn {order.table?.name}
                    </span>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-gray-500">#{order.id.slice(-4).toUpperCase()}</span>
                </div>

                <ul className="space-y-1 mb-3">
                  {order.items?.map(item => (
                    <li key={item.id} className="flex justify-between text-sm text-gray-700">
                      <span>{item.menu_item?.name}</span>
                      <span className="font-bold">×{item.quantity}</span>
                    </li>
                  ))}
                </ul>

                {order.note && (
                  <p className="text-xs bg-yellow-100 text-yellow-800 rounded-lg px-2 py-1 mb-2">
                    📝 {order.note}
                  </p>
                )}

                {nextStatus[order.status] && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => advance(order)}
                  >
                    {order.status === 'pending' && '✓ Xác nhận'}
                    {order.status === 'confirmed' && '👨‍🍳 Bắt đầu làm'}
                    {order.status === 'preparing' && '🍽️ Xong! Phục vụ'}
                  </Button>
                )}
              </div>
            ))}

            {col.orders.length === 0 && (
              <div className="text-center py-8 text-gray-600 text-sm">Không có order</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
