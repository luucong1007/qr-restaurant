import { createClient } from '@/lib/supabase/server'
import { MenuClient } from './MenuClient'
import { CategoryClient } from './CategoryClient'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ branch?: string; tab?: string }>
}

export default async function MenuPage({ searchParams }: PageProps) {
  const { branch: branchId, tab = 'items' } = await searchParams
  const supabase = await createClient()

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  if (!branches?.length) return <div className="p-6 text-gray-500">Chưa có chi nhánh nào.</div>

  const activeBranchId = branchId ?? branches[0].id

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from('menu_items')
      .select('*, category:categories(id, name, sort_order, branch_id, is_active)')
      .eq('branch_id', activeBranchId)
      .order('sort_order'),
    supabase
      .from('categories')
      .select('*')
      .eq('branch_id', activeBranchId)
      .order('sort_order'),
  ])

  const branchQuery = `branch=${activeBranchId}`

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Branch switcher */}
      {branches.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {branches.map(b => (
            <a
              key={b.id}
              href={`/admin/menu?branch=${b.id}&tab=${tab}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                b.id === activeBranchId
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {b.name}
            </a>
          ))}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
        <Link
          href={`/admin/menu?${branchQuery}&tab=items`}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'items' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🍜 Món ăn
        </Link>
        <Link
          href={`/admin/menu?${branchQuery}&tab=categories`}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'categories' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📂 Danh mục
        </Link>
      </div>

      {tab === 'items' ? (
        <MenuClient
          items={items ?? []}
          categories={(categories ?? []).filter(c => c.is_active)}
          branchId={activeBranchId}
        />
      ) : (
        <CategoryClient categories={categories ?? []} branchId={activeBranchId} />
      )}
    </main>
  )
}
