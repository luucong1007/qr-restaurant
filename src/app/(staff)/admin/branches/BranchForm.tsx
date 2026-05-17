'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Branch } from '@/types'
import { Button } from '@/components/ui/button'
import { MapEmbed } from '@/components/ui/map-embed'
import { MapPin, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  branch?: Branch
  onDone: () => void
  onCancel: () => void
}

export function BranchForm({ branch, onDone, onCancel }: Props) {
  const [name, setName] = useState(branch?.name ?? '')
  const [slug, setSlug] = useState(branch?.slug ?? '')
  const [address, setAddress] = useState(branch?.address ?? '')
  const [phone, setPhone] = useState(branch?.phone ?? '')
  const [lat, setLat] = useState<number | null>(branch?.latitude ?? null)
  const [lng, setLng] = useState<number | null>(branch?.longitude ?? null)
  const [geocoding, setGeocoding] = useState(false)
  const [loading, setLoading] = useState(false)

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  async function geocode() {
    if (!address) { toast.error('Nhập địa chỉ trước'); return }
    setGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'vi' } }
      )
      const data = await res.json()
      if (!data.length) { toast.error('Không tìm thấy địa chỉ, thử nhập rõ hơn'); return }
      setLat(parseFloat(data[0].lat))
      setLng(parseFloat(data[0].lon))
      toast.success('Đã tìm thấy vị trí!')
    } catch {
      toast.error('Lỗi kết nối, thử lại')
    } finally {
      setGeocoding(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !slug) { toast.error('Vui lòng điền tên và slug'); return }
    setLoading(true)
    const supabase = createClient()

    const payload = {
      name, slug,
      address: address || null,
      phone: phone || null,
      latitude: lat,
      longitude: lng,
    }

    const { error } = branch
      ? await supabase.from('branches').update(payload).eq('id', branch.id)
      : await supabase.from('branches').insert({ ...payload, is_active: true })

    setLoading(false)
    if (error) {
      toast.error(error.message.includes('unique') ? 'Slug đã tồn tại, hãy dùng slug khác' : 'Lưu thất bại')
      return
    }
    toast.success(branch ? 'Đã cập nhật!' : 'Đã thêm chi nhánh!')
    onDone()
  }

  const inputCls = 'mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Tên chi nhánh *</label>
        <input
          value={name}
          onChange={e => { setName(e.target.value); if (!branch) setSlug(autoSlug(e.target.value)) }}
          required placeholder="Quán Ngon Quận 1"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Slug * <span className="text-gray-400 font-normal">(dùng trong URL)</span>
        </label>
        <div className="mt-1 flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-orange-300">
          <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none">site/</span>
          <input
            value={slug}
            onChange={e => setSlug(autoSlug(e.target.value))}
            required placeholder="quan-ngon-q1"
            className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
        <div className="flex gap-2 mt-1">
          <input
            value={address}
            onChange={e => { setAddress(e.target.value); setLat(null); setLng(null) }}
            placeholder="123 Nguyễn Huệ, Q1, TP.HCM"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            type="button"
            onClick={geocode}
            disabled={geocoding || !address}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 disabled:opacity-50 transition-colors"
          >
            {geocoding ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
            {geocoding ? 'Đang tìm...' : 'Lấy vị trí'}
          </button>
        </div>
      </div>

      {/* Map preview */}
      {(name || address) && (
        <MapEmbed lat={lat} lng={lng} name={name} address={address} className="w-full h-44 rounded-xl border border-gray-200" />
      )}

      <div>
        <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="028-1234-5678" className={inputCls} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" className="flex-1" loading={loading}>
          {branch ? 'Cập nhật' : 'Thêm chi nhánh'}
        </Button>
      </div>
    </form>
  )
}
