import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AddSpecialNoteModal({ date, onClose, onAdded }) {
  const { auth } = useAuth()
  const [children, setChildren] = useState([])
  const [form, setForm] = useState({ childId: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/children', {
      headers: { Authorization: `Bearer ${auth?.token}` },
    }).then(res => {
      setChildren(res.data)
      if (res.data.length === 1) setForm(f => ({ ...f, childId: String(res.data[0].id) }))
    }).catch(() => {})
  }, [])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.childId || !form.content.trim()) {
      setError('자녀 선택과 내용을 모두 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/calendar/special-notes', {
        childId: Number(form.childId),
        content: form.content,
        date,
      }, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      })
      onAdded?.()
      onClose()
    } catch {
      setError('특이사항 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <FileText size={15} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">특이사항 등록</h3>
              <p className="text-xs text-slate-400">{formatDate(date)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 자녀 선택 */}
          {children.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">자녀 선택</label>
              <select
                value={form.childId}
                onChange={e => setForm(f => ({ ...f, childId: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              >
                <option value="">자녀를 선택하세요</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 내용 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">특이사항 내용</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder={`예:\n• 오늘 열이 조금 있어요 (37.5°)\n• 점심 약 1회 복용 필요합니다\n• 오후 4시 조기 하원 예정입니다`}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none leading-relaxed"
              required
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700">
            등록하신 특이사항은 선생님이 확인 후 체크 처리합니다.
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-60"
            >
              {loading ? '등록 중...' : '선생님께 전달'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
