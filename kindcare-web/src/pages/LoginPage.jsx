import { useState } from 'react'
import axios from 'axios'
import { Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage({ onGoSignup }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('이메일과 비밀번호를 입력해주세요.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', form)
      login(res.data)
    } catch (err) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
            <Leaf size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">KindCare</h1>
            <p className="text-slate-400 text-sm mt-0.5">원과 가정을 잇다</p>
          </div>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-5">로그인</h2>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">이메일</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="hello@kindcare.com"
                className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">비밀번호</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            계정이 없으신가요?{' '}
            <button onClick={onGoSignup} className="text-emerald-600 font-semibold hover:underline">
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
