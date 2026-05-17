'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Branch, Table } from '@/types'
import { QRTableCard } from './QRTableCard'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface BranchWithTables {
  branch: Branch
  tables: (Table & { branch: { name: string; slug: string } })[]
}

interface AddFormState {
  number: string
  name: string
  capacity: string
}

export function TablesClient({ sections }: { sections: BranchWithTables[] }) {
  const [adding, setAdding] = useState<string | null>(null) // branchId
  const [form, setForm] = useState<AddFormState>({ number: '', name: '', capacity: '4' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  function openAdd(branchId: string, existingTables: Table[]) {
    const maxNum = existingTables.reduce((m, t) => Math.max(m, parseInt(t.number) || 0), 0)
    const next = String(maxNum + 1)
    setForm({ number: next, name: `Bàn ${next}`, capacity: '4' })
    setAdding(branchId)
  }

  async function handleAdd(branchId: string) {
    if (!form.number || !form.name) { toast.error('Nhập số bàn và tên bàn'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('tables').insert({
      branch_id: branchId,
      number: form.number,
      name: form.name,
      capacity: parseInt(form.capacity) || 4,
      is_active: true,
    })
    setSaving(false)
    if (error) { toast.error('Thêm bàn thất bại'); return }
    toast.success('Đã thêm bàn!')
    setAdding(null)
    router.refresh()
  }

  async function handleDelete(tableId: string, tableName: string) {
    if (!confirm(`Xoá ${tableName}? Hành động này không thể hoàn tác.`)) return
    setDeletingId(tableId)
    const supabase = createClient()
    const { error } = await supabase.from('tables').delete().eq('id', tableId)
    setDeletingId(null)
    if (error) { toast.error('Xoá thất bại'); return }
    toast.success('Đã xoá bàn')
    router.refresh()
  }

  const inputCls = 'border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300'

  return (
    <div className="space-y-8">
      {sections.map(({ branch, tables }) => (
        <section key={branch.id}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-700">🏪 {branch.name}</h2>
            <button
              onClick={() => openAdd(branch.id, tables)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 active:scale-95 transition-all"
            >
              <Plus size={15} /> Thêm bàn
            </button>
          </div>

          {/* Add form */}
          {adding === branch.id && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <p className="font-semibold text-gray-800 text-sm mb-3">Thêm bàn mới</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">Số bàn</label>
                  <input
                    value={form.number}
                    onChange={e => setForm(f => ({ ...f, number: e.target.value, name: `Bàn ${e.target.value}` }))}
                    placeholder="1"
                    className={inputCls + ' w-full'}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">Tên bàn</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Bàn 1"
                    className={inputCls + ' w-full'}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">Sức chứa</label>
                  <input
                    value={form.capacity}
                    onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                    placeholder="4"
                    type="number"
                    min="1"
                    className={inputCls + ' w-full'}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAdding(null)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={() => handleAdd(branch.id)}
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Thêm
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tables.map(table => (
              <div key={table.id} className="relative group">
                <QRTableCard table={table} branchSlug={table.branch.slug} />
                <button
                  onClick={() => handleDelete(table.id, table.name)}
                  disabled={deletingId === table.id}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                  title="Xoá bàn"
                >
                  {deletingId === table.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                </button>
              </div>
            ))}

            {tables.length === 0 && adding !== branch.id && (
              <p className="col-span-full text-sm text-gray-500">Chưa có bàn nào — bấm Thêm bàn để tạo</p>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
