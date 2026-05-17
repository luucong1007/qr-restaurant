'use client'
import { useState } from 'react'
import { Category } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, GripVertical, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function CategoryClient({ categories: initial, branchId }: { categories: Category[], branchId: string }) {
  const [categories, setCategories] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const router = useRouter()

  async function addCategory() {
    if (!newName.trim()) return
    const supabase = createClient()
    const maxOrder = Math.max(0, ...categories.map(c => c.sort_order))
    const { data, error } = await supabase
      .from('categories')
      .insert({ branch_id: branchId, name: newName.trim(), sort_order: maxOrder + 1, is_active: true })
      .select()
      .single()
    if (error) { toast.error('Thêm thất bại'); return }
    setCategories(prev => [...prev, data])
    setNewName('')
    setAdding(false)
    toast.success('Đã thêm danh mục!')
    router.refresh()
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').update({ name: editName.trim() }).eq('id', id)
    if (error) { toast.error('Lưu thất bại'); return }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c))
    setEditingId(null)
    toast.success('Đã cập nhật!')
    router.refresh()
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`Xoá danh mục "${cat.name}"? Các món thuộc danh mục này sẽ không có danh mục.`)) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (error) { toast.error('Xoá thất bại'); return }
    setCategories(prev => prev.filter(c => c.id !== cat.id))
    toast.success('Đã xoá!')
    router.refresh()
  }

  async function toggleActive(cat: Category) {
    const supabase = createClient()
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
  }

  async function moveOrder(cat: Category, dir: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(c => c.id === cat.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const supabase = createClient()
    const a = sorted[idx], b = sorted[swapIdx]
    await Promise.all([
      supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id),
    ])
    setCategories(prev => prev.map(c => {
      if (c.id === a.id) return { ...c, sort_order: b.sort_order }
      if (c.id === b.id) return { ...c, sort_order: a.sort_order }
      return c
    }))
  }

  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Danh mục món</h2>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} className="mr-1" /> Thêm danh mục
        </Button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="flex gap-2 bg-orange-50 border border-orange-200 rounded-2xl p-3">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Tên danh mục mới..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button onClick={addCategory} className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
            <Check size={16} />
          </button>
          <button onClick={() => { setAdding(false); setNewName('') }} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Category list */}
      <div className="space-y-2">
        {sorted.map((cat, idx) => (
          <div
            key={cat.id}
            className={`bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm ${!cat.is_active ? 'opacity-50' : ''}`}
          >
            {/* Reorder */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveOrder(cat, -1)}
                disabled={idx === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
              >
                <GripVertical size={14} />
              </button>
            </div>

            {/* Name / edit inline */}
            {editingId === cat.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 border border-orange-300 rounded-xl px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button onClick={() => saveEdit(cat.id)} className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  <Check size={14} />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 font-medium text-gray-900">{cat.name}</span>
                <span className="text-xs text-gray-500">#{idx + 1}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => toggleActive(cat)}
                    className={`px-2 py-1 rounded-xl text-xs font-medium transition-colors ${
                      cat.is_active
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {cat.is_active ? 'Hiện' : 'Ẩn'}
                  </button>
                  <button
                    onClick={() => deleteCategory(cat)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">Chưa có danh mục nào</p>
        )}
      </div>
    </div>
  )
}
