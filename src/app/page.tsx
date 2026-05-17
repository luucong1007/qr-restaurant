import Link from 'next/link'
import { QrCode, ChefHat, MonitorSmartphone, BarChart3, MapPin } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-orange-500 text-white rounded-3xl p-4 shadow-lg">
            <QrCode size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">QR Menu</h1>
          <p className="text-gray-500">Hệ thống đặt món & thanh toán qua QR</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: QrCode, label: 'Quét QR đặt món' },
            { icon: ChefHat, label: 'Bếp nhận ngay' },
            { icon: MonitorSmartphone, label: 'Thanh toán dễ' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2">
              <Icon size={24} className="text-orange-500" />
              <p className="text-xs text-gray-600 font-medium text-center">{label}</p>
            </div>
          ))}
        </div>

        {/* Staff access */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-4">Dành cho nhân viên</p>
          <Link
            href="/auth/login"
            className="block w-full bg-orange-500 text-white rounded-xl py-3 font-medium text-center hover:bg-orange-600 transition-colors"
          >
            Đăng nhập quản lý
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/kds"
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <ChefHat size={16} /> Màn hình bếp
            </Link>
            <Link
              href="/pos"
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <BarChart3 size={16} /> Thu ngân
            </Link>
          </div>
        </div>

        {/* Table list shortcut */}
        <Link
          href="/tables"
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5 font-medium hover:bg-gray-50 hover:border-orange-300 transition-colors shadow-sm"
        >
          <MapPin size={18} className="text-orange-500" />
          Xem danh sách tất cả bàn
        </Link>

        <p className="text-xs text-gray-400">
          Khách hàng truy cập bằng cách quét QR trên bàn
        </p>

        <p className="text-xs text-gray-300">© {new Date().getFullYear()} CongLV8. All rights reserved.</p>
      </div>
    </main>
  )
}
