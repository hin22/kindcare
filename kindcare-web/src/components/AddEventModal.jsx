import { useState } from 'react'
import axios from 'axios'
import { X, CalendarDays } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const EVENT_TYPES = [
  { value: 'HOLIDAY', label: '공휴일', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'EVENT',   label: '행사',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'BIRTHDAY',label: '생일',   color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'NOTICE',  label: '공지',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
]

export default function AddEventModal({ initialDate, onClose, onAdded }) {
  const { auth } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: initialDate ?? '',
    type: 'EVENT',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) {
      setError('제목과 날짜는 필수입니다.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/calendar/events', form, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      })
      onAdded?.()
      onClose()
    } catch {
      setError('행사 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <CalendarDays size={15} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800">행사 등록</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 날짜 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">날짜</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          {/* 유형 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">유형</label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all
                    ${form.type === t.value ? t.color + ' ring-2 ring-offset-1 ring-current' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">제목</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="예: 어린이날, 현장학습"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">설명 (선택)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="행사에 대한 간단한 안내를 입력하세요."
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-60"
            >
              {loading ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
