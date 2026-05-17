'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Link } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Ảnh tối đa 2MB'); return }

    setLoading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `menu/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

    const { error } = await supabase.storage.from('menu-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) { toast.error('Upload thất bại: ' + error.message); setLoading(false); return }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(path)
    onChange(data.publicUrl)
    setLoading(false)
  }

  function applyUrl() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    try { new URL(trimmed) } catch { toast.error('URL không hợp lệ'); return }
    onChange(trimmed)
    setUrlInput('')
  }

  // Preview when value is set
  if (value) {
    return (
      <div className="space-y-2">
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
        <p className="text-xs text-gray-500 truncate px-1">{value}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Tab toggle */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
            mode === 'upload' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Upload size={14} /> Tải lên
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
            mode === 'url' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Link size={14} /> Dán link
        </button>
      </div>

      {mode === 'upload' ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="w-full h-36 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          <span className="text-sm">{loading ? 'Đang upload...' : 'Chọn ảnh (tối đa 2MB)'}</span>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyUrl())}
              placeholder="https://example.com/image.jpg"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="button"
              onClick={applyUrl}
              disabled={!urlInput.trim()}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-40 transition-colors"
            >
              Dùng
            </button>
          </div>
          {/* Live preview */}
          {urlInput.trim() && (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <Image src={urlInput.trim()} alt="Preview" fill className="object-cover" unoptimized onError={() => {}} />
            </div>
          )}
          <p className="text-xs text-gray-500">Kéo link ảnh từ Google, website... dán vào đây</p>
        </div>
      )}
    </div>
  )
}
