'use client'
import { useState } from 'react'
import { Branch } from '@/types'
import { BranchForm } from './BranchForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus, Pencil, MapPin, Phone, Link2, ToggleLeft, ToggleRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function BranchClient({ branches: initial }: { branches: Branch[] }) {
  const [branches, setBranches] = useState(initial)
  const [editing, setEditing] = useState<Branch | null | 'new'>(null)
  const router = useRouter()

  async function toggleActive(branch: Branch) {
    const supabase = createClient()
    const { error } = await supabase
      .from('branches')
      .update({ is_active: !branch.is_active })
      .eq('id', branch.id)
    if (error) { toast.error('Cập nhật thất bại'); return }
    setBranches(prev => prev.map(b => b.id === branch.id ? { ...b, is_active: !b.is_active } : b))
    toast.success(branch.is_active ? 'Đã tắt chi nhánh' : 'Đã bật chi nhánh')
  }

  function handleDone() {
    setEditing(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Chi nhánh</h1>
        <Button onClick={() => setEditing('new')}>
          <Plus size={16} className="mr-1" /> Thêm chi nhánh
        </Button>
      </div>

      {/* Modal */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <h2 className="font-bold text-lg mb-4">
              {editing === 'new' ? 'Thêm chi nhánh mới' : `Sửa: ${(editing as Branch).name}`}
            </h2>
            <BranchForm
              branch={editing === 'new' ? undefined : editing as Branch}
              onDone={handleDone}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* Branch list */}
      <div className="space-y-3">
        {branches.map(branch => (
          <Card key={branch.id} className={`p-4 ${!branch.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-lg">{branch.name}</h3>
                  <Badge variant={branch.is_active ? 'success' : 'default'}>
                    {branch.is_active ? 'Đang mở' : 'Đã tắt'}
                  </Badge>
                </div>

                <div className="mt-2 space-y-1">
                  {branch.address && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <MapPin size={13} className="flex-shrink-0" /> {branch.address}
                    </p>
                  )}
                  {branch.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Phone size={13} className="flex-shrink-0" /> {branch.phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Link2 size={13} className="flex-shrink-0" />
                    <span className="font-mono">{branch.slug}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button size="sm" variant="secondary" onClick={() => setEditing(branch)}>
                  <Pencil size={14} className="mr-1" /> Sửa
                </Button>
                <button
                  onClick={() => toggleActive(branch)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    branch.is_active
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {branch.is_active
                    ? <><ToggleRight size={16} /> Tắt</>
                    : <><ToggleLeft size={16} /> Bật</>
                  }
                </button>
              </div>
            </div>
          </Card>
        ))}

        {branches.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>Chưa có chi nhánh nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
