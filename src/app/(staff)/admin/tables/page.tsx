import { createClient } from '@/lib/supabase/server'
import { TablesClient } from './TablesClient'

export default async function TablesPage() {
  const supabase = await createClient()

  const [{ data: branches }, { data: tables }] = await Promise.all([
    supabase.from('branches').select('*').eq('is_active', true),
    supabase.from('tables').select('*, branch:branches(name, slug)'),
  ])

  const sections = (branches ?? []).map(branch => ({
    branch,
    tables: (tables ?? [])
      .filter(t => t.branch_id === branch.id)
      .sort((a, b) => parseInt(a.number) - parseInt(b.number)),
  }))

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Bàn & QR</h1>
      <TablesClient sections={sections} />
    </main>
  )
}
