import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Pill, Calendar, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function MedicationPage() {
  const { auth } = useAuth()
  const isTeacher = auth?.role === 'TEACHER'
  const headers = { Authorization: `Bearer ${auth?.token}` }

  const [date, setDate] = useState(todayStr)
  const [items, setItems] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    childId: '',
    serviceDate: todayStr(),
    medicineName: '',
    dosage: '',
    timeNote: '',
    memo: '',
  })

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = isTeacher ? { date } : {}
      const res = await axios.get('/api/medication', { params, headers })
      setItems(res.data)
    } catch {
      setError('목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [isTeacher, date, auth?.token])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    if (!isTeacher) {
      axios
        .get('/api/children', { headers: { Authorization: `Bearer ${auth?.token}` } })
        .then((r) => {
          setChildren(r.data)
          if (r.data.length === 1) {
            setForm((f) => ({ ...f, childId: String(r.data[0].id) }))
          }
        })
        .catch(() => {})
    }
  }, [isTeacher, auth?.token])

  const complete = async (id) => {
    try {
      await axios.patch(`/api/medication/${id}/complete`, {}, { headers })
      fetchList()
    } catch {
      setError('처리에 실패했습니다.')
    }
  }

  const submitParent = async (e) => {
    e.preventDefault()
    if (!form.childId || !form.medicineName.trim() || !form.dosage.trim()) {
      setError('자녀, 약 이름, 용량은 필수입니다.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await axios.post(
        '/api/medication',
        {
          childId: Number(form.childId),
          serviceDate: form.serviceDate,
          medicineName: form.medicineName.trim(),
          dosage: form.dosage.trim(),
          timeNote: form.timeNote.trim() || undefined,
          memo: form.memo.trim() || undefined,
        },
        { headers }
      )
      setForm((f) => ({
        ...f,
        medicineName: '',
        dosage: '',
        timeNote: '',
        memo: '',
      }))
      fetchList()
    } catch (err) {
      setError(err.response?.data?.message || '등록에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const pending = items.filter((i) => i.status === 'PENDING')

  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
          <Pill size={22} className="text-violet-600" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">투약 관리</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isTeacher
              ? '학부모가 의뢰한 투약을 확인하고 원에서 처리 후 완료 표시하세요.'
              : '원에서 맡길 투약 정보를 등록하면 선생님께 전달됩니다.'}
          </p>
        </div>
      </div>

      {isTeacher && (
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={16} className="text-slate-400" />
          <label className="text-sm text-slate-600">조회일</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <span className="text-xs text-slate-400">
            대기 {pending.length}건 / 전체 {items.length}건
          </span>
        </div>
      )}

      {!isTeacher && (
        <form
          onSubmit={submitParent}
          className="bg-white rounded-xl border border-slate-100 p-5 mb-6 space-y-3"
        >
          <p className="text-sm font-semibold text-slate-700">새 투약 의뢰</p>
          {children.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">자녀</label>
              <select
                required
                value={form.childId}
                onChange={(e) => setForm((f) => ({ ...f, childId: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">선택</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">투약일 (원에서 처리할 날)</label>
              <input
                type="date"
                required
                value={form.serviceDate}
                onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">약 이름</label>
              <input
                value={form.medicineName}
                onChange={(e) => setForm((f) => ({ ...f, medicineName: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="예: 해열제"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">용량·방법</label>
              <input
                value={form.dosage}
                onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="예: 시럽 5ml"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">복용 시각 안내</label>
              <input
                value={form.timeNote}
                onChange={(e) => setForm((f) => ({ ...f, timeNote: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="예: 점심 직후"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">추가 메모</label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="주의사항 등"
            />
          </div>
          <button
            type="submit"
            disabled={saving || children.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? '등록 중…' : '의뢰 등록'}
          </button>
          {children.length === 0 && (
            <p className="text-xs text-amber-600">연결된 자녀가 없습니다. 초대 코드로 먼저 연결해 주세요.</p>
          )}
        </form>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
            <Loader2 size={18} className="animate-spin" /> 불러오는 중…
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
            등록된 투약 의뢰가 없습니다.
          </p>
        ) : (
          items.map((row) => (
            <div
              key={row.id}
              className={`bg-white rounded-xl border p-4 ${
                row.status === 'PENDING' ? 'border-amber-100' : 'border-slate-100 opacity-80'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">
                    {row.childName}
                    <span className="text-slate-400 font-normal text-sm ml-2">
                      {row.serviceDate}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {row.medicineName} · {row.dosage}
                    {row.timeNote && (
                      <span className="text-slate-400"> · {row.timeNote}</span>
                    )}
                  </p>
                  {row.memo && (
                    <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{row.memo}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">의뢰: {row.parentName}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {row.status === 'COMPLETED' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <CheckCircle2 size={14} /> 완료
                      {row.completedByName && ` · ${row.completedByName}`}
                    </span>
                  ) : isTeacher ? (
                    <button
                      type="button"
                      onClick={() => complete(row.id)}
                      className="text-xs font-semibold text-white bg-violet-500 hover:bg-violet-600 px-3 py-1.5 rounded-lg"
                    >
                      투약 완료 처리
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                      처리 대기
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
