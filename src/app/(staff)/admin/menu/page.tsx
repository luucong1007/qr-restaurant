import { createClient } from '@/lib/supabase/server'
import { MenuClient } from './MenuClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ branch?: string }>
}

export default async function MenuPage({ searchParams }: PageProps) {
  const { branch: branchId } = await searchParams
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
      .eq('is_active', true)
      .order('sort_order'),
  ])

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-4 text-sm">
        <ArrowLeft size={16} /> Quay lại
      </Link>
      {/* Branch switcher */}
      {branches.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {branches.map(b => (
            <a
              key={b.id}
              href={`/admin/menu?branch=${b.id}`}
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

      <MenuClient
        items={items ?? []}
        categories={categories ?? []}
        branchId={activeBranchId}
      />
    </main>
  )
}
