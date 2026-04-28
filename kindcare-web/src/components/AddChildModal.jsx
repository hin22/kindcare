import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const INITIAL_FORM = { name: '', age: '', className: '', gender: 'MALE', allergies: '' }

export default function AddChildModal({ onClose, onAdded }) {
  const { auth } = useAuth()
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteCode, setInviteCode] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return }
    if (!form.age) { setError('나이를 입력해주세요.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(
        '/api/children',
        { ...form, age: Number(form.age) },
        { headers: { Authorization: `Bearer ${auth?.token}` } },
      )
      onAdded()
      setInviteCode(res.data.inviteCode)
    } catch {
      setError('등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  /* 초대 코드 발급 완료 화면 */
  if (inviteCode) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center text-3xl">✅</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">원생 등록 완료!</h2>
            <p className="text-sm text-slate-400 mt-1">학부모에게 아래 초대 코드를 전달해주세요.</p>
          </div>
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <p className="text-xs text-emerald-400 mb-1">초대 코드</p>
            <p className="text-3xl font-bold tracking-widest text-emerald-600">{inviteCode}</p>
          </div>
          <button
            onClick={handleCopy}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
          >
            {copied ? '복사됨 ✓' : '코드 복사하기'}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            닫기
          </button>
        </div>
      </div>
    )
  }

  return (
    /* 모달 오버레이 */
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">원생 등록</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">이름 *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="홍길동"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">나이 *</label>
              <input
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                placeholder="5"
                min="1"
                max="10"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">반</label>
              <input
                name="className"
                value={form.className}
                onChange={handleChange}
                placeholder="꽃잎반"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">성별</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="MALE">남아</option>
                <option value="FEMALE">여아</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">알레르기 (선택)</label>
            <input
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder="견과류, 유제품 등"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
            >
              {loading ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
