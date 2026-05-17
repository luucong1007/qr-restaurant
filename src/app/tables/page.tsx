import { createClient } from '@/lib/supabase/server'
import { Table } from '@/types'
import Link from 'next/link'
import { ArrowLeft, MapPin, Utensils } from 'lucide-react'

export default async function TablesListPage() {
  const supabase = await createClient()

  const [{ data: branches }, { data: tables }] = await Promise.all([
    supabase.from('branches').select('*').eq('is_active', true).order('name'),
    supabase.from('tables').select('*').eq('is_active', true),
  ])

  const branchesWithTables = (branches ?? []).map(branch => ({
    ...branch,
    tables: (tables ?? [])
      .filter((t: Table) => t.branch_id === branch.id)
      .sort((a: Table, b: Table) => parseInt(a.number) - parseInt(b.number)),
  }))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-10">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 rounded-xl w-8 h-8 flex items-center justify-center text-lg">🍜</div>
            <span className="font-bold text-gray-900">Danh sách bàn</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {branchesWithTables.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Utensils size={40} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có chi nhánh nào</p>
          </div>
        )}

        {branchesWithTables.map(branch => (
          <section key={branch.id}>
            {/* Branch header */}
            <div className="flex items-start gap-2 mb-3">
              <div className="bg-orange-100 rounded-xl p-2 mt-0.5">
                <MapPin size={16} className="text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{branch.name}</h2>
                {branch.address && (
                  <p className="text-sm text-gray-500">{branch.address}</p>
                )}
              </div>
            </div>

            {/* Tables grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {branch.tables.map((table: Table) => (
                <Link
                  key={table.id}
                  href={`/${branch.slug}/table/${table.id}`}
                  className="bg-white rounded-2xl border-2 border-gray-100 p-3 flex flex-col items-center gap-1 shadow-sm hover:border-orange-400 hover:shadow-md active:scale-95 transition-all"
                >
                  <span className="text-2xl">🪑</span>
                  <span className="font-semibold text-gray-800 text-sm">{table.name}</span>
                  <span className="text-xs text-gray-400">{table.capacity} người</span>
                </Link>
              ))}

              {branch.tables.length === 0 && (
                <p className="col-span-full text-sm text-gray-400 pl-1">Chưa có bàn nào</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
