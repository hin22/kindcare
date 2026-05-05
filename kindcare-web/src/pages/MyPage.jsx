import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Loader2, Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function MyPage() {
  const { auth, refreshProfile } = useAuth()
  const headers = { Authorization: `Bearer ${auth?.token}` }

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [avatarBroken, setAvatarBroken] = useState(false)
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    role: '',
    avatarUrl: '',
  })

  const displayInitial = useMemo(
    () => form.name?.trim()?.charAt(0) || auth?.name?.charAt(0) || '?',
    [form.name, auth?.name]
  )

  useEffect(() => {
    setAvatarBroken(false)
  }, [form.avatarUrl])

  useEffect(() => {
    axios
      .get('/api/me', { headers })
      .then((res) => {
        setForm({
          email: res.data.email,
          name: res.data.name,
          phone: res.data.phone ?? '',
          role: res.data.role,
          avatarUrl: res.data.avatarUrl ?? '',
        })
      })
      .catch(() => setError('프로필을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [auth?.token])

  const previewUrl = form.avatarUrl?.trim() && !avatarBroken ? form.avatarUrl.trim() : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setOk('')
    try {
      await axios.put(
        '/api/me',
        {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
        },
        { headers }
      )
      setOk('저장되었습니다.')
      await refreshProfile()
    } catch {
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full min-h-[min(70vh,calc(100vh-8rem))] flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">마이페이지</h1>
          <p className="text-sm text-slate-400 mt-1.5">프로필과 연락처를 관리하세요</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 text-slate-400 text-sm py-16">
            <Loader2 size={22} className="animate-spin" />
            불러오는 중…
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/80 overflow-hidden"
          >
            {/* 프로필 헤더 */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-slate-50/90 to-white border-b border-slate-100">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-emerald-500/25 overflow-hidden ring-4 ring-white">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setAvatarBroken(true)}
                      />
                    ) : (
                      displayInitial
                    )}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                    aria-hidden
                  >
                    <Camera size={16} className="text-slate-500" strokeWidth={2} />
                  </div>
                </div>
                <p className="mt-4 font-semibold text-slate-800">{form.name || '이름'}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {form.role === 'TEACHER' ? '교사' : '학부모'}
                </p>
              </div>
            </div>

            <div className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">
                  프로필 사진 URL
                </label>
                <input
                  type="url"
                  value={form.avatarUrl}
                  onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                  placeholder="https://… (이미지 주소)"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/80 focus:border-emerald-300"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  공개된 이미지 URL을 넣으면 미리보기에 반영됩니다. 서버에 파일을 올리는 방식은 나중에 붙일 수 있어요.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">이름</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">연락처</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="010-0000-0000"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                />
              </div>
            </div>

            <div className="px-8 pb-8 space-y-3">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
              )}
              {ok && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  {ok}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20"
              >
                {saving ? '저장 중…' : '변경 사항 저장'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
