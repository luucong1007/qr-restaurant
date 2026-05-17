import { createClient } from '@/lib/supabase/server'
import { QRTableCard } from './QRTableCard'

export default async function TablesPage() {
  const supabase = await createClient()

  const [{ data: branches }, { data: tables }] = await Promise.all([
    supabase.from('branches').select('*').eq('is_active', true),
    supabase.from('tables').select('*, branch:branches(name, slug)').order('number'),
  ])

  const tablesByBranch = (branches ?? []).map(branch => ({
    branch,
    tables: (tables ?? []).filter(t => t.branch_id === branch.id),
  }))

  return (
    <main className="min-h-screen bg-gray-50 p-6">
<h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Bàn & QR</h1>
      <div className="space-y-8">
        {tablesByBranch.map(({ branch, tables }) => (
          <section key={branch.id}>
            <h2 className="font-bold text-gray-700 mb-3">🏪 {branch.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tables.map(table => (
                <QRTableCard key={table.id} table={table} branchSlug={branch.slug} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
