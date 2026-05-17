import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ShoppingBag, Store, Users, TrendingUp } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { data: todayOrders },
    { data: branches },
    { data: pendingOrders },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', today.toISOString()),
    supabase.from('branches').select('id, name, is_active'),
    supabase.from('orders').select('id').in('status', ['pending', 'confirmed', 'preparing']),
  ])

  const todayRevenue = (todayOrders ?? []).reduce((s, o) => s + o.total_amount, 0)
  const totalOrders = todayOrders?.length ?? 0
  const activeBranches = branches?.filter(b => b.is_active).length ?? 0
  const pendingCount = pendingOrders?.length ?? 0

  const stats = [
    { label: 'Doanh thu hôm nay', value: formatCurrency(todayRevenue), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'Order đã TT', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Order đang xử lý', value: pendingCount, icon: ShoppingBag, color: 'text-orange-600 bg-orange-50' },
    { label: 'Chi nhánh đang mở', value: activeBranches, icon: Store, color: 'text-purple-600 bg-purple-50' },
  ]

  const quickLinks = [
    { href: '/admin/menu', label: 'Quản lý Menu', icon: '🍜' },
    { href: '/admin/tables', label: 'Quản lý Bàn & QR', icon: '🪑' },
    { href: '/admin/branches', label: 'Chi nhánh', icon: '🏪' },
    { href: '/admin/reports', label: 'Báo cáo', icon: '📊' },
    { href: '/kds', label: 'Màn hình bếp', icon: '👨‍🍳' },
    { href: '/pos', label: 'POS Thu ngân', icon: '💰' },
  ]

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Card key={stat.label} className="p-4">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <h2 className="font-bold text-gray-800 mb-3">Truy cập nhanh</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickLinks.map(link => (
          <Link key={link.href} href={link.href}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <span className="text-3xl">{link.icon}</span>
              <p className="font-semibold text-gray-800 mt-2">{link.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
