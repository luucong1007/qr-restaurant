import { Logo } from '@/components/ui/logo'
import Link from 'next/link'
import { LayoutDashboard, ChefHat, CreditCard, UtensilsCrossed } from 'lucide-react'

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/kds', label: 'Bếp', icon: ChefHat },
  { href: '/pos', label: 'Thu ngân', icon: CreditCard },
]

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="px-4 h-14 flex items-center justify-between max-w-screen-2xl mx-auto">
          <Logo href="/admin" size="sm" />
          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
