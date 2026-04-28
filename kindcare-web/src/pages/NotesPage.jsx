import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

// ── Constants ─────────────────────────────────────────────
const MOOD_OPTIONS = [
  { value: 'GREAT',  label: '매우 좋음', emoji: '😄' },
  { value: 'GOOD',   label: '좋음',      emoji: '🙂' },
  { value: 'NORMAL', label: '보통',      emoji: '😐' },
  { value: 'BAD',    label: '좋지 않음', emoji: '😕' },
  { value: 'SICK',   label: '아픔',      emoji: '🤒' },
]

const HEALTH_OPTIONS = [
  { value: 'HEALTHY', label: '건강',      colorClass: 'text-green-600' },
  { value: 'MILD',    label: '약간 불편', colorClass: 'text-amber-600' },
  { value: 'SICK',    label: '아픔',      colorClass: 'text-red-600'   },
]

const MEAL_OPTIONS = [
  { value: 'GREAT', label: '잘 먹음',      colorClass: 'text-green-600' },
  { value: 'SOME',  label: '조금 먹음',    colorClass: 'text-amber-600' },
  { value: 'POOR',  label: '거의 못 먹음', colorClass: 'text-red-600'   },
]

// ── Helpers ───────────────────────────────────────────────
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + n)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateKo(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${y}년 ${m}월 ${d}일 (${days[date.getDay()]})`
}

function getOption(options, value) {
  return options.find((o) => o.value === value) ?? null
}

// ── WriteNoteModal ────────────────────────────────────────
const INITIAL_FORM = {
  mood: 'GOOD',
  health: 'HEALTHY',
  meals: 'GREAT',
  activities: '',
  content: '',
  specialNotes: '',
}

function SelectRow({ options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
            value === opt.value
              ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
              : 'border-slate-100 text-slate-500 hover:border-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function WriteNoteModal({ child, date, existingNote, onClose, onSaved }) {
  const { auth } = useAuth()
  const [form, setForm] = useState(
    existingNote
      ? {
          mood:         existingNote.mood         ?? 'GOOD',
          health:       existingNote.health        ?? 'HEALTHY',
          meals:        existingNote.meals         ?? 'GREAT',
          activities:   existingNote.activities    ?? '',
          content:      existingNote.content       ?? '',
          specialNotes: existingNote.specialNotes  ?? '',
        }
      : INITIAL_FORM,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) { setError('알림장 내용을 입력해주세요.'); return }
    setError('')
    setLoading(true)
    try {
      if (existingNote) {
        await axios.put(`/api/notes/${existingNote.id}`, form, {
          headers: { Authorization: `Bearer ${auth?.token}` },
        })
      } else {
        await axios.post('/api/notes', { ...form, childId: child.id, date }, {
          headers: { Authorization: `Bearer ${auth?.token}` },
        })
      }
      onSaved()
      onClose()
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-slate-800">
              알림장 {existingNote ? '수정' : '작성'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {child.name} · {formatDateKo(date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* 기분 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">
              오늘의 기분
            </label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, mood: m.value }))}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all text-xs ${
                    form.mood === m.value
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span
                    className={
                      form.mood === m.value
                        ? 'text-emerald-600 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 건강 상태 & 식사 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-2">
                건강 상태
              </label>
              <SelectRow
                options={HEALTH_OPTIONS}
                value={form.health}
                onChange={(v) => setForm((p) => ({ ...p, health: v }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-2">
                식사
              </label>
              <SelectRow
                options={MEAL_OPTIONS}
                value={form.meals}
                onChange={(v) => setForm((p) => ({ ...p, meals: v }))}
              />
            </div>
          </div>

          {/* 활동 내용 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              활동 내용
            </label>
            <textarea
              name="activities"
              value={form.activities}
              onChange={handleChange}
              placeholder="오늘 진행한 활동을 입력해주세요. (예: 블록 쌓기, 그림 그리기)"
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
          </div>

          {/* 알림장 내용 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              알림장 내용 *
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="오늘 하루 아이의 생활에 대해 작성해주세요."
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
          </div>

          {/* 특이사항 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              특이사항
            </label>
            <textarea
              name="specialNotes"
              value={form.specialNotes}
              onChange={handleChange}
              placeholder="특별히 전달할 사항이 있으면 입력해주세요."
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
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
              {loading ? '저장 중...' : existingNote ? '수정하기' : '작성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── ChildPanel ────────────────────────────────────────────
function ChildPanel({ children, loading, error, selectedId, onSelect }) {
  const [search, setSearch] = useState('')
  const filtered = search
    ? children.filter((c) => c.name.includes(search))
    : children

  return (
    <div className="w-64 flex-shrink-0 border-r border-slate-100 flex flex-col bg-white">
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="원생 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-xs text-red-400 text-center py-10 px-4">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">원생이 없습니다.</p>
        ) : (
          <div className="flex flex-col py-1">
            {filtered.map((child) => {
              const isSelected = child.id === selectedId
              const avatarColor =
                child.gender === 'FEMALE'
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-blue-100 text-blue-600'
              return (
                <button
                  key={child.id}
                  onClick={() => onSelect(child)}
                  className={`flex items-center gap-3 px-4 py-3 text-left w-full transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 border-r-2 border-emerald-500'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor}`}
                  >
                    {child.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {child.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {child.className ?? '반 미지정'} · {child.age}세
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── NoteView ──────────────────────────────────────────────
function NoteView({ note, isTeacher, onEdit, onRefresh }) {
  const { auth } = useAuth()
  const [comment, setComment]           = useState(note.parentComment ?? '')
  const [savingComment, setSavingComment] = useState(false)
  const [commentSaved, setCommentSaved]   = useState(false)

  const mood   = getOption(MOOD_OPTIONS,   note.mood)
  const health = getOption(HEALTH_OPTIONS, note.health)
  const meals  = getOption(MEAL_OPTIONS,   note.meals)

  const handleSaveComment = async () => {
    setSavingComment(true)
    setCommentSaved(false)
    try {
      await axios.put(
        `/api/notes/${note.id}/comment`,
        { parentComment: comment },
        { headers: { Authorization: `Bearer ${auth?.token}` } },
      )
      setCommentSaved(true)
      onRefresh()
    } catch {
      // silent – comment section will still show the new text
    } finally {
      setSavingComment(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status badges */}
      <div className="flex flex-wrap gap-3">
        {mood && (
          <div className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-100 px-4 py-3">
            <span className="text-2xl">{mood.emoji}</span>
            <div>
              <p className="text-xs text-slate-400">오늘의 기분</p>
              <p className="text-sm font-semibold text-slate-700">{mood.label}</p>
            </div>
          </div>
        )}
        {health && (
          <div className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-100 px-4 py-3">
            <span className="text-2xl">❤️</span>
            <div>
              <p className="text-xs text-slate-400">건강 상태</p>
              <p className={`text-sm font-semibold ${health.colorClass}`}>
                {health.label}
              </p>
            </div>
          </div>
        )}
        {meals && (
          <div className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-100 px-4 py-3">
            <span className="text-2xl">🍱</span>
            <div>
              <p className="text-xs text-slate-400">식사</p>
              <p className={`text-sm font-semibold ${meals.colorClass}`}>
                {meals.label}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Activities */}
      {note.activities && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            활동 내용
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">{note.activities}</p>
        </div>
      )}

      {/* Main content */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            알림장
          </h3>
          {isTeacher && (
            <button
              onClick={onEdit}
              className="text-xs text-emerald-500 hover:text-emerald-600 font-medium"
            >
              수정
            </button>
          )}
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>
        {note.teacherName && (
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">
            작성: {note.teacherName} 선생님
          </p>
        )}
      </div>

      {/* Special notes */}
      {note.specialNotes && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-amber-600 mb-1.5">
            ⚠️ 특이사항
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">{note.specialNotes}</p>
        </div>
      )}

      {/* Parent comment */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          학부모 답장
        </h3>
        {!isTeacher ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={comment}
              onChange={(e) => { setComment(e.target.value); setCommentSaved(false) }}
              placeholder="선생님께 답장을 남겨보세요..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
            <div className="flex items-center justify-between">
              {commentSaved ? (
                <p className="text-xs text-green-500">전달되었습니다.</p>
              ) : (
                <span />
              )}
              <button
                onClick={handleSaveComment}
                disabled={savingComment || comment === (note.parentComment ?? '')}
                className="text-sm bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg px-4 py-1.5 font-medium transition-colors"
              >
                {savingComment ? '전달 중...' : '전달하기'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">
            {note.parentComment ? (
              <span className="text-slate-700">{note.parentComment}</span>
            ) : (
              <span className="text-slate-300 italic">아직 답장이 없습니다.</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

// ── NotesPage (main) ──────────────────────────────────────
export default function NotesPage({ initialChildId }) {
  const { auth } = useAuth()
  const isTeacher = auth?.role === 'TEACHER'

  const [children, setChildren]             = useState([])
  const [childrenLoading, setChildrenLoading] = useState(true)
  const [childrenError, setChildrenError]     = useState('')

  const [selectedChild, setSelectedChild] = useState(null)
  const [selectedDate, setSelectedDate]   = useState(todayStr())

  const [note, setNote]           = useState(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteError, setNoteError]     = useState('')

  const [showWriteModal, setShowWriteModal] = useState(false)

  // Fetch children
  useEffect(() => {
    const load = async () => {
      setChildrenLoading(true)
      try {
        const res = await axios.get('/api/children', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        })
        const list = res.data
        setChildren(list)
        if (list.length > 0) {
          const initial = initialChildId
            ? list.find((c) => c.id === initialChildId) ?? list[0]
            : list[0]
          setSelectedChild(initial)
        }
      } catch {
        setChildrenError('원생 목록을 불러오지 못했습니다.')
      } finally {
        setChildrenLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch note for selected child + date
  const fetchNote = useCallback(async () => {
    if (!selectedChild) return
    setNoteLoading(true)
    setNoteError('')
    setNote(null)
    try {
      const res = await axios.get('/api/notes', {
        params: { childId: selectedChild.id, date: selectedDate },
        headers: { Authorization: `Bearer ${auth?.token}` },
      })
      setNote(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setNote(null)
      } else {
        setNoteError('알림장을 불러오지 못했습니다.')
      }
    } finally {
      setNoteLoading(false)
    }
  }, [selectedChild, selectedDate, auth?.token])

  useEffect(() => { fetchNote() }, [fetchNote])

  const isToday  = selectedDate === todayStr()
  const isFuture = selectedDate > todayStr()

  return (
    <div className="flex h-full -mx-8 -my-6 overflow-hidden">
      {/* ── Left: child list panel ── */}
      <ChildPanel
        children={children}
        loading={childrenLoading}
        error={childrenError}
        selectedId={selectedChild?.id}
        onSelect={setSelectedChild}
      />

      {/* ── Right: note detail ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!selectedChild ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <span className="text-5xl">📋</span>
            <p className="text-sm">왼쪽에서 원생을 선택하세요.</p>
          </div>
        ) : (
          <>
            {/* Child header + date navigator */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${
                    selectedChild.gender === 'FEMALE'
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {selectedChild.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selectedChild.name}</p>
                  <p className="text-xs text-slate-400">
                    {selectedChild.className ?? '반 미지정'} · {selectedChild.age}세
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate((d) => addDays(d, -1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 font-medium"
                >
                  ‹
                </button>
                <div className="text-sm font-medium text-slate-700 min-w-[170px] text-center">
                  {formatDateKo(selectedDate)}
                  {isToday && (
                    <span className="ml-2 text-xs bg-emerald-100 text-emerald-500 px-2 py-0.5 rounded-full">
                      오늘
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDate((d) => addDays(d, 1))}
                  disabled={isToday}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 font-medium disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Content area */}
            {noteLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">알림장 불러오는 중...</p>
              </div>
            ) : noteError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-4xl">⚠️</span>
                <p className="text-sm text-red-400">{noteError}</p>
                <button
                  onClick={fetchNote}
                  className="text-sm text-emerald-500 hover:underline"
                >
                  다시 시도
                </button>
              </div>
            ) : note ? (
              <NoteView
                key={note.id}
                note={note}
                isTeacher={isTeacher}
                onEdit={() => setShowWriteModal(true)}
                onRefresh={fetchNote}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="text-5xl">📝</span>
                <p className="text-slate-500 font-medium">
                  {formatDateKo(selectedDate)} 알림장이 없습니다.
                </p>
                {isTeacher && !isFuture && (
                  <button
                    onClick={() => setShowWriteModal(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    ✏️ 알림장 작성하기
                  </button>
                )}
                {!isTeacher && (
                  <p className="text-xs text-slate-400">
                    담임 선생님이 아직 알림장을 작성하지 않았습니다.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Write / Edit modal */}
      {showWriteModal && selectedChild && (
        <WriteNoteModal
          child={selectedChild}
          date={selectedDate}
          existingNote={note}
          onClose={() => setShowWriteModal(false)}
          onSaved={fetchNote}
        />
      )}
    </div>
  )
}
