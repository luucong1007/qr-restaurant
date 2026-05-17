'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh tối đa 2MB')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `menu/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

    const { error } = await supabase.storage.from('menu-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      toast.error('Upload thất bại: ' + error.message)
      setLoading(false)
      return
    }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(path)
    onChange(data.publicUrl)
    setLoading(false)
  }

  if (value) {
    return (
      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 group">
        <Image src={value} alt="Ảnh món" fill className="object-cover" unoptimized />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={loading}
      className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={24} className="animate-spin" />
      ) : (
        <Upload size={24} />
      )}
      <span className="text-sm">{loading ? 'Đang upload...' : 'Chọn ảnh (tối đa 2MB)'}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  )
}
