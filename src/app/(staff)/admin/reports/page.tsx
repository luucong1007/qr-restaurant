import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export default async function ReportsPage() {
  const supabase = await createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, total_amount, branch_id, created_at, payment_method, session_id,
      branch:branches(name),
      table:tables(name)
    `)
    .eq('payment_status', 'paid')
    .gte('created_at', startOfMonth.toISOString())
    .order('created_at', { ascending: false })

  const byBranch = (orders ?? []).reduce<Record<string, { name: string; total: number; count: number }>>(
    (acc, o) => {
      const branchName = (o.branch as any)?.name ?? o.branch_id
      if (!acc[o.branch_id]) acc[o.branch_id] = { name: branchName, total: 0, count: 0 }
      acc[o.branch_id].total += o.total_amount
      acc[o.branch_id].count++
      return acc
    },
    {}
  )

  const totalRevenue = (orders ?? []).reduce((s, o) => s + o.total_amount, 0)
  const totalCount = orders?.length ?? 0

  const paymentLabel: Record<string, string> = {
    cash: 'Tiền mặt',
    vietqr: 'VietQR',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    stripe: 'Stripe',
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Báo cáo</h1>
      <p className="text-gray-500 text-sm mb-6">Tháng này ({startOfMonth.toLocaleDateString('vi-VN')} - hôm nay)</p>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-gray-500 text-sm">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-gray-500 text-sm">Số order đã TT</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalCount}</p>
        </Card>
      </div>

      {/* By branch */}
      <h2 className="font-bold text-gray-800 mb-3">Theo chi nhánh</h2>
      <div className="space-y-3 mb-8">
        {Object.values(byBranch)
          .sort((a, b) => b.total - a.total)
          .map(branch => (
            <Card key={branch.name} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{branch.name}</p>
                <p className="text-sm text-gray-500">{branch.count} orders</p>
              </div>
              <p className="font-bold text-green-600">{formatCurrency(branch.total)}</p>
            </Card>
          ))}
        {Object.keys(byBranch).length === 0 && (
          <p className="text-sm text-gray-400">Chưa có doanh thu tháng này</p>
        )}
      </div>

      {/* All bills */}
      <h2 className="font-bold text-gray-800 mb-3">Tất cả hoá đơn</h2>
      <div className="space-y-2">
        {(orders ?? []).map(order => {
          const d = new Date(order.created_at)
          const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
          const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          return (
            <Card key={order.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">
                    {(order.table as any)?.name ?? 'Bàn ?'}
                  </span>
                  <span className="text-xs text-gray-400">—</span>
                  <span className="text-xs text-gray-500">{(order.branch as any)?.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{dateStr} {timeStr}</span>
                  {order.payment_method && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {paymentLabel[order.payment_method] ?? order.payment_method}
                    </span>
                  )}
                </div>
              </div>
              <p className="font-bold text-green-600 text-sm flex-shrink-0">{formatCurrency(order.total_amount)}</p>
            </Card>
          )
        })}
        {(orders ?? []).length === 0 && (
          <p className="text-sm text-gray-400">Chưa có hoá đơn nào tháng này</p>
        )}
      </div>
    </main>
  )
}
