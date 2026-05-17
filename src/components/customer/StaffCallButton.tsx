'use client'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface Props {
  branchId: string
  tableId: string
  sessionId: string
}

export function StaffCallButton({ branchId, tableId, sessionId }: Props) {
  const [loading, setLoading] = useState(false)

  async function callStaff() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('staff_calls').insert({
      branch_id: branchId,
      table_id: tableId,
      session_id: sessionId,
      message: 'Khách cần hỗ trợ',
    })
    setLoading(false)
    if (error) {
      toast.error('Gọi thất bại, thử lại!')
    } else {
      toast.success('Đã gọi nhân viên! Vui lòng chờ.')
    }
  }

  return (
    <button
      onClick={callStaff}
      disabled={loading}
      className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 active:scale-95 transition-transform shadow-sm disabled:opacity-50"
    >
      <Bell size={16} className="text-orange-500" />
      Gọi nhân viên
    </button>
  )
}
