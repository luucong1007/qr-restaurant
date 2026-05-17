'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, PaymentMethod } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { buildVietQRUrl } from '@/lib/payments/vietqr'
import Image from 'next/image'
import toast from 'react-hot-toast'

const BANK_CONFIG = {
  bankId: process.env.NEXT_PUBLIC_BANK_ID ?? '970436',
  accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? '',
  accountName: process.env.NEXT_PUBLIC_BANK_NAME ?? 'QUAN AN',
}

const methods: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'vietqr', label: 'QR Ngân hàng', icon: '🏦' },
  { id: 'momo', label: 'MoMo', icon: '🟣' },
  { id: 'cash', label: 'Tiền mặt', icon: '💵' },
]

export default function PaymentPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [method, setMethod] = useState<PaymentMethod>('vietqr')
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { sessionId } = useCartStore()

  const tableId = params.tableId as string

  const totalAmount = orders
    .filter(o => o.payment_status === 'unpaid' && o.status !== 'cancelled')
    .reduce((s, o) => s + o.total_amount, 0)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('orders')
      .select('*')
      .eq('table_id', tableId)
      .eq('session_id', sessionId)
      .neq('status', 'cancelled')
      .then(({ data }) => setOrders(data ?? []))
  }, [tableId, sessionId])

  async function confirmCashPayment() {
    if (method !== 'cash') return
    setLoading(true)
    const supabase = createClient()
    const ids = orders.filter(o => o.payment_status === 'unpaid').map(o => o.id)
    await supabase.from('orders').update({ payment_method: 'cash', payment_status: 'pending' }).in('id', ids)
    toast.success('Đã gửi yêu cầu thanh toán tiền mặt!')
    setLoading(false)
    setPaid(true)
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <CheckCircle size={64} className="text-green-500" />
        <h2 className="text-xl font-bold">Cảm ơn bạn!</h2>
        <p className="text-gray-500">Nhân viên sẽ đến xác nhận thanh toán.</p>
      </div>
    )
  }

  const qrUrl = method === 'vietqr' ? buildVietQRUrl({
    ...BANK_CONFIG,
    amount: totalAmount,
    description: `${tableId.slice(-4)} QR TABLE`,
  }) : ''

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white sticky top-0 z-40 shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">Thanh toán</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">Tổng thanh toán</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{formatCurrency(totalAmount)}</p>
        </div>

        {/* Method select */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="font-semibold text-gray-800 mb-3">Chọn phương thức</p>
          <div className="space-y-2">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                  method === m.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className="font-medium text-gray-800">{m.label}</span>
                {method === m.id && <CheckCircle size={18} className="ml-auto text-orange-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* VietQR */}
        {method === 'vietqr' && qrUrl && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-3">Quét QR để chuyển khoản</p>
            <div className="relative w-56 h-56">
              <Image src={qrUrl} alt="VietQR" fill className="object-contain" unoptimized />
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Nội dung: <span className="font-mono font-bold">{tableId.slice(-4)} QR TABLE</span>
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Sau khi chuyển khoản, nhân viên sẽ xác nhận
            </p>
          </div>
        )}

        {/* MoMo */}
        {method === 'momo' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center text-gray-500 text-sm">
            <p className="text-4xl mb-2">🟣</p>
            <p>Chuyển <strong>{formatCurrency(totalAmount)}</strong> đến số MoMo của quán</p>
            <p className="font-mono font-bold text-lg mt-2">{process.env.NEXT_PUBLIC_MOMO_PHONE ?? '0909xxxxxx'}</p>
            <p className="text-xs mt-2">Nội dung: <span className="font-bold">BAN {tableId.slice(-4)}</span></p>
          </div>
        )}

        {/* Cash */}
        {method === 'cash' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Button size="lg" className="w-full" onClick={confirmCashPayment} loading={loading}>
              Gọi nhân viên thanh toán tiền mặt
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
