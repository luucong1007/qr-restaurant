'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuItem, Category } from '@/types'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'
import toast from 'react-hot-toast'

interface Props {
  item?: MenuItem
  categories: Category[]
  branchId: string
  onDone: () => void
  onCancel: () => void
}

export function MenuForm({ item, categories, branchId, onDone, onCancel }: Props) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [price, setPrice] = useState(item?.price?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(item?.category_id ?? categories[0]?.id ?? '')
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '')
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !price || !categoryId) { toast.error('Vui lòng điền đầy đủ'); return }
    setLoading(true)
    const supabase = createClient()

    const payload = {
      branch_id: branchId,
      category_id: categoryId,
      name,
      description: description || null,
      price: Number(price),
      image_url: imageUrl || null,
      is_available: isAvailable,
    }

    const { error } = item
      ? await supabase.from('menu_items').update(payload).eq('id', item.id)
      : await supabase.from('menu_items').insert(payload)

    setLoading(false)
    if (error) { toast.error('Lưu thất bại: ' + error.message); return }
    toast.success(item ? 'Đã cập nhật!' : 'Đã thêm món!')
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        onRemove={() => setImageUrl('')}
      />

      <div>
        <label className="text-sm font-medium text-gray-700">Tên món *</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="Phở bò tái nạm"
          className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Nước dùng hầm xương 12 tiếng..."
          rows={2}
          className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700">Giá (VND) *</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            min={0}
            placeholder="75000"
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Danh mục *</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={e => setIsAvailable(e.target.checked)}
          className="w-4 h-4 accent-orange-500"
        />
        <span className="text-sm text-gray-700">Đang bán</span>
      </label>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          {item ? 'Cập nhật' : 'Thêm món'}
        </Button>
      </div>
    </form>
  )
}
