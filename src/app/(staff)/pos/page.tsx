'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus, PaymentMethod } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Bell, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const ACTIVE_STATUSES: OrderStatus[] = ['ready', 'served', 'pending', 'confirmed', 'preparing']

export default function POSPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [staffCalls, setStaffCalls] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()

    async function fetch() {
      const [{ data: orderData }, { data: callData }] = await Promise.all([
        supabase
          .from('orders')
          .select('*, table:tables(name), items:order_items(*, menu_item:menu_items(name))')
          .in('status', ACTIVE_STATUSES)
          .eq('payment_status', 'unpaid')
          .order('created_at'),
        supabase
          .from('staff_calls')
          .select('*, table:tables(name)')
          .eq('is_resolved', false)
          .order('created_at', { ascending: false }),
      ])
      setOrders(orderData ?? [])
      setStaffCalls(callData ?? [])
    }

    fetch()

    const supabase2 = createClient()
    const channel = supabase2.channel('pos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetch)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'staff_calls' }, () => {
        fetch()
        toast('Bàn cần hỗ trợ!', { icon: '🔔' })
      })
      .subscribe()

    return () => { supabase2.removeChannel(channel) }
  }, [])

  async function markPaid(method: PaymentMethod) {
    if (selectedIds.size === 0) { toast.error('Chọn order cần thanh toán'); return }
    const supabase = createClient()
    await supabase.from('orders').update({
      payment_status: 'paid',
      payment_method: method,
      status: 'paid',
    }).in('id', Array.from(selectedIds))
    setSelectedIds(new Set())
    toast.success('Đã xác nhận thanh toán')
  }

  async function resolveCall(id: string) {
    const supabase = createClient()
    await supabase.from('staff_calls').update({ is_resolved: true }).eq('id', id)
    setStaffCalls(prev => prev.filter(c => c.id !== id))
  }

  const toggle = (id: string) => setSelectedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const selectedTotal = orders
    .filter(o => selectedIds.has(o.id))
    .reduce((s, o) => s + o.total_amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex gap-4 p-4">
      {/* Left: Orders */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-xl text-gray-900">POS Thu ngân</h1>
        </div>

        {staffCalls.length > 0 && (
          <div className="space-y-2">
            {staffCalls.map(call => (
              <div key={call.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-yellow-600" />
                  <span className="font-medium text-yellow-800">Bàn {call.table?.name} cần hỗ trợ</span>
                </div>
                <Button size="sm" variant="secondary" onClick={() => resolveCall(call.id)}>Xong</Button>
              </div>
            ))}
          </div>
        )}

        {orders.map(order => (
          <div
            key={order.id}
            onClick={() => toggle(order.id)}
            className={`bg-white rounded-2xl p-4 border-2 cursor-pointer transition-colors ${
              selectedIds.has(order.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-100'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-gray-900">Bàn {order.table?.name}</span>
                <span className="ml-2 text-xs text-gray-400">#{order.id.slice(-4).toUpperCase()}</span>
              </div>
              <span className="font-bold text-orange-500">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="space-y-0.5">
              {order.items?.map(item => (
                <p key={item.id} className="text-sm text-gray-600">
                  {item.menu_item?.name} × {item.quantity}
                </p>
              ))}
            </div>
            {selectedIds.has(order.id) && (
              <div className="mt-2 flex items-center gap-1 text-orange-600 text-sm font-medium">
                <CheckCircle size={14} /> Đã chọn
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400">Không có order chờ thanh toán</div>
        )}
      </div>

      {/* Right: Payment panel */}
      <div className="w-72 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-fit sticky top-4">
        <h2 className="font-bold text-gray-800 mb-4">Thanh toán</h2>
        <div className="text-center mb-4">
          <p className="text-gray-500 text-sm">Tổng chọn ({selectedIds.size} order)</p>
          <p className="text-3xl font-bold text-orange-500">{formatCurrency(selectedTotal)}</p>
        </div>
        <div className="space-y-2">
          <Button className="w-full" onClick={() => markPaid('cash')}>💵 Tiền mặt</Button>
          <Button className="w-full" variant="secondary" onClick={() => markPaid('vietqr')}>🏦 QR Bank</Button>
          <Button className="w-full" variant="secondary" onClick={() => markPaid('momo')}>🟣 MoMo</Button>
        </div>
      </div>
    </div>
  )
}
