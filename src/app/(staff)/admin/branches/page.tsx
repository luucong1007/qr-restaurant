import { createClient } from '@/lib/supabase/server'
import { BranchClient } from './BranchClient'

export default async function BranchesPage() {
  const supabase = await createClient()
  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .order('created_at')

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <BranchClient branches={branches ?? []} />
    </main>
  )
}
