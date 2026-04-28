import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ChildNoteModal from './ChildNoteModal'
import AddEventModal from './AddEventModal'
import AddSpecialNoteModal from './AddSpecialNoteModal'

// 행사 타입별 색상
const EVENT_COLORS = {
  HOLIDAY: { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
  EVENT:   { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  BIRTHDAY:{ bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
  NOTICE:  { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay() // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid = []
  let day = 1
  for (let row = 0; row < 6; row++) {
    const week = []
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col
      if (cellIndex < firstDay || day > daysInMonth) {
        week.push(null)
      } else {
        week.push(day++)
      }
    }
    grid.push(week)
    if (day > daysInMonth) break
  }
  return grid
}

export default function CalendarWidget() {
  const { auth } = useAuth()
  const isTeacher = auth?.role === 'TEACHER'

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed

  const [calData, setCalData] = useState({}) // { "2026-04-15": CalendarDayDto }
  const [loading, setLoading] = useState(false)

  // 모달 상태
  const [selectedChild, setSelectedChild] = useState(null) // { childId, childName, date }
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [addEventDate, setAddEventDate] = useState(null)
  const [showAddSpecialNote, setShowAddSpecialNote] = useState(false)
  const [specialNoteDate, setSpecialNoteDate] = useState(null)

  const yearMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/calendar/summary', {
        params: { yearMonth: yearMonthStr },
        headers: { Authorization: `Bearer ${auth?.token}` },
      })
      setCalData(res.data)
    } catch (err) {
      console.error('[Calendar] fetch error', err?.response?.status)
    } finally {
      setLoading(false)
    }
  }, [yearMonthStr, auth?.token])

  useEffect(() => { fetchCalendar() }, [fetchCalendar])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const grid = buildCalendarGrid(year, month)

  const getDayData = (day) => {
    if (!day) return null
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calData[key] ?? null
  }

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const handleDayClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (isTeacher) {
      setAddEventDate(dateStr)
      setShowAddEvent(true)
    } else {
      setSpecialNoteDate(dateStr)
      setShowAddSpecialNote(true)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
          <h2 className="text-base font-bold text-slate-800 min-w-[100px] text-center">
            {year}년 {month + 1}월
          </h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronRight size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* 범례 */}
          {['HOLIDAY', 'EVENT', 'BIRTHDAY'].map(t => (
            <span key={t} className={`hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${EVENT_COLORS[t].bg} ${EVENT_COLORS[t].text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS[t].dot}`} />
              {{ HOLIDAY: '공휴일', EVENT: '행사', BIRTHDAY: '생일' }[t]}
            </span>
          ))}
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {WEEKDAYS.map((wd, i) => (
          <div key={wd} className={`py-2 text-center text-xs font-semibold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
            {wd}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-400">불러오는 중...</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 divide-x divide-slate-50">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="min-h-[90px] bg-slate-50/30" />

                const data = getDayData(day)
                const isTd = isToday(day)
                const isSun = di === 0
                const isSat = di === 6

                return (
                  <div
                    key={di}
                    className="min-h-[90px] p-1.5 cursor-pointer hover:bg-emerald-50/40 transition-colors group relative"
                    onClick={() => handleDayClick(day)}
                  >
                    {/* 날짜 숫자 */}
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1
                      ${isTd ? 'bg-emerald-500 text-white' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-slate-600'}
                    `}>
                      {day}
                    </div>

                    {/* 행사 배지 */}
                    {data?.events?.slice(0, 2).map(ev => (
                      <div key={ev.id} className={`text-[10px] font-medium px-1 py-0.5 rounded mb-0.5 truncate leading-tight ${EVENT_COLORS[ev.type]?.bg} ${EVENT_COLORS[ev.type]?.text}`}>
                        {ev.title}
                      </div>
                    ))}
                    {data?.events?.length > 2 && (
                      <div className="text-[10px] text-slate-400">+{data.events.length - 2}</div>
                    )}

                    {/* 원아 특이사항 칩 */}
                    {data?.children?.slice(0, 2).map(chip => (
                      <button
                        key={chip.childId}
                        onClick={(e) => {
                          e.stopPropagation()
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          setSelectedChild({ childId: chip.childId, childName: chip.childName, date: dateStr })
                        }}
                        className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 mb-0.5 max-w-full transition-colors"
                      >
                        {chip.hasUnchecked && (
                          <AlertTriangle size={9} className="text-amber-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{chip.childName}</span>
                      </button>
                    ))}
                    {data?.children?.length > 2 && (
                      <div className="text-[10px] text-slate-400">+{data.children.length - 2}명</div>
                    )}

                    {/* hover 시 + 버튼 */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={12} className="text-slate-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* 모달들 */}
      {selectedChild && (
        <ChildNoteModal
          childId={selectedChild.childId}
          childName={selectedChild.childName}
          date={selectedChild.date}
          onClose={() => setSelectedChild(null)}
          onChecked={fetchCalendar}
        />
      )}
      {showAddEvent && isTeacher && (
        <AddEventModal
          initialDate={addEventDate}
          onClose={() => setShowAddEvent(false)}
          onAdded={fetchCalendar}
        />
      )}
      {showAddSpecialNote && !isTeacher && (
        <AddSpecialNoteModal
          date={specialNoteDate}
          onClose={() => setShowAddSpecialNote(false)}
          onAdded={fetchCalendar}
        />
      )}
    </div>
  )
}
