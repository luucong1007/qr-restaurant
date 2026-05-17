'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && !remember && data.session) {
      // Bỏ ghi nhớ: xoá session khỏi storage, chỉ giữ trong memory
      await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: '' })
    }
    setLoading(false)
    if (error) { toast.error('Sai email hoặc mật khẩu'); return }
    router.push('/admin')
  }

  const inputCls = 'mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-500 rounded-2xl w-11 h-11 flex items-center justify-center text-2xl shadow-sm">🍜</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-gray-400 text-xs">Dành cho nhân viên & quản lý</p>
          </div>
        </div>

        <form onSubmit={login} className="space-y-4" autoComplete="on">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="nhanvien@quan.com"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded"
            />
            <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>

          <Button size="lg" className="w-full" type="submit" loading={loading}>
            Đăng nhập
          </Button>
        </form>
        <p className="text-xs text-gray-300 text-center mt-6">© {new Date().getFullYear()} CongLV8</p>
      </div>
    </div>
  )
}
