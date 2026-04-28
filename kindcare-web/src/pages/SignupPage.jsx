import { useState } from 'react'
import axios from 'axios'
import { Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignupPage({ onGoLogin }) {
  const { login } = useAuth()
  const [form, setForm] = useState({
    email: '', password: '', name: '', role: 'TEACHER', phone: '', inviteCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.name) { setError('이메일, 비밀번호, 이름은 필수입니다.'); return }
    if (form.password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/signup', form)
      if (form.role === 'PARENT' && form.inviteCode.trim()) {
        try {
          await axios.post(
            `/api/children/link?code=${form.inviteCode.trim()}`,
            {},
            { headers: { Authorization: `Bearer ${res.data.token}` } },
          )
        } catch { /* 코드 오류 시 가입 유지 */ }
      }
      login(res.data)
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition w-full'

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
          <h2 className="text-base font-bold text-slate-800 mb-5">회원가입</h2>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* 역할 선택 */}
            <div className="flex gap-2">
              {[{ value: 'TEACHER', label: '교사' }, { value: 'PARENT', label: '학부모' }].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: opt.value }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    form.role === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">이름 *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="홍길동" className={inputCls} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">이메일 *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="hello@kindcare.com" className={inputCls} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">비밀번호 * (8자 이상)</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className={inputCls} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">연락처 (선택)</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" className={inputCls} />
            </div>

            {form.role === 'PARENT' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">자녀 초대 코드 (선택)</label>
                <input
                  name="inviteCode"
                  value={form.inviteCode}
                  onChange={handleChange}
                  placeholder="6자리 코드 (예: A3F9B2)"
                  className={`${inputCls} font-mono tracking-widest uppercase`}
                />
                <p className="text-xs text-slate-400">나중에 마이페이지에서도 연결할 수 있습니다.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            이미 계정이 있으신가요?{' '}
            <button onClick={onGoLogin} className="text-emerald-600 font-semibold hover:underline">
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
