import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MenuItemCard } from '@/components/customer/MenuItemCard'
import { CartBar } from '@/components/customer/CartBar'
import { StaffCallButton } from '@/components/customer/StaffCallButton'
import { MenuItem, Category } from '@/types'

interface PageProps {
  params: Promise<{ branchSlug: string; tableId: string }>
}

export default async function MenuPage({ params }: PageProps) {
  const { branchSlug, tableId } = await params
  const supabase = await createClient()

  const [{ data: branch }, { data: table }] = await Promise.all([
    supabase.from('branches').select('*').eq('slug', branchSlug).eq('is_active', true).single(),
    supabase.from('tables').select('*').eq('id', tableId).eq('is_active', true).single(),
  ])

  if (!branch || !table) notFound()

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*, category:categories(*)')
    .eq('branch_id', branch.id)
    .eq('is_available', true)
    .order('sort_order')

  const categories = Array.from(
    new Map((menuItems ?? []).map(i => [i.category_id, i.category as Category])).values()
  ).sort((a, b) => a.sort_order - b.sort_order)

  const itemsByCategory = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat.id] = (menuItems ?? []).filter(i => i.category_id === cat.id)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="bg-orange-500 rounded-xl w-9 h-9 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
            🍜
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">{branch.name}</h1>
            <p className="text-sm text-gray-500">Bàn {table.name}</p>
          </div>
        </div>
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {categories.map(cat => (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-orange-500 hover:text-white transition-colors"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-4 space-y-6">
        {categories.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <h2 className="font-bold text-gray-800 mb-3">{cat.name}</h2>
            <div className="space-y-3">
              {itemsByCategory[cat.id]?.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Staff call */}
      <div className="fixed bottom-20 right-4 z-40">
        <StaffCallButton
          branchId={branch.id}
          tableId={tableId}
          sessionId="session-placeholder"
        />
      </div>

      <CartBar branchSlug={branchSlug} tableId={tableId} />
    </main>
  )
}
