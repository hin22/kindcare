import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, CheckCircle2, Circle, AlertTriangle, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ChildNoteModal({ childId, childName, date, onClose, onChecked }) {
  const { auth } = useAuth()
  const isTeacher = auth?.role === 'TEACHER'

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = async () => {
    try {
      const res = await axios.get('/api/calendar/special-notes', {
        params: { childId, date },
        headers: { Authorization: `Bearer ${auth?.token}` },
      })
      setNotes(res.data)
    } catch (err) {
      console.error('[ChildNoteModal] fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotes() }, [childId, date])

  const handleToggle = async (noteId) => {
    if (!isTeacher) return
    try {
      await axios.patch(`/api/calendar/special-notes/${noteId}/check`, {}, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      })
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, checked: !n.checked } : n))
      onChecked?.() // 달력 새로고침
    } catch (err) {
      console.error('[ChildNoteModal] toggle error', err)
    }
  }

  const uncheckedCount = notes.filter(n => !n.checked).length
  const allChecked = notes.length > 0 && uncheckedCount === 0

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <User size={18} className="text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">{childName}</h3>
                {!allChecked && notes.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle size={11} />
                    미확인 {uncheckedCount}건
                  </span>
                )}
                {allChecked && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    모두 확인됨
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(date)} 특이사항</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* 체크리스트 */}
        <div className="p-5">
          {loading ? (
            <div className="text-center py-8 text-sm text-slate-400">불러오는 중...</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              등록된 특이사항이 없습니다.
            </div>
          ) : (
            <ul className="space-y-2">
              {notes.map(note => (
                <li
                  key={note.id}
                  onClick={() => handleToggle(note.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors
                    ${isTeacher ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}
                    ${note.checked ? 'opacity-60' : ''}
                  `}
                >
                  {isTeacher ? (
                    note.checked
                      ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      : <Circle size={18} className="text-slate-300 flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${note.checked ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-slate-700 leading-relaxed ${note.checked ? 'line-through text-slate-400' : ''}`}>
                      {note.content}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{note.parentName} 학부모</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 푸터 */}
        {isTeacher && notes.length > 0 && (
          <div className="px-5 pb-5">
            <div className={`text-xs font-medium text-center py-2 rounded-lg
              ${allChecked ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}
            `}>
              {allChecked ? '✓ 모든 특이사항을 확인했습니다' : `${uncheckedCount}건의 특이사항이 아직 확인되지 않았습니다`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
