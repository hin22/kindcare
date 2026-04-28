const GENDER_LABEL = { MALE: '남아', FEMALE: '여아' }

function ChildCard({ child, onNotesClick }) {
  const initials = child.name?.charAt(0) ?? '?'
  const genderColor = child.gender === 'FEMALE'
    ? 'bg-pink-100 text-pink-600'
    : 'bg-blue-100 text-blue-600'

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md hover:border-emerald-100 transition-all group">
      {/* 아바타 */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${genderColor}`}>
        {initials}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800">{child.name}</span>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {child.className ?? '반 미지정'}
          </span>
          <span className="text-xs text-slate-400">
            {GENDER_LABEL[child.gender] ?? '-'} · {child.age}세
          </span>
        </div>
        {child.allergies && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <span>⚠️</span> 알레르기: {child.allergies}
          </p>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={() => onNotesClick?.(child.id)}
          className="text-xs text-emerald-500 hover:text-emerald-600 font-medium"
        >
          알림장
        </button>
      </div>
    </div>
  )
}

export default function ChildList({ children, loading, error, onRefresh, onNotesClick }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm">원생 목록 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm text-red-500 text-center">{error}</p>
        <button
          onClick={onRefresh}
          className="text-sm text-emerald-500 hover:underline"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <span className="text-5xl">👶</span>
        <p className="text-sm">등록된 원생이 없습니다.</p>
        <p className="text-xs">오른쪽 상단 버튼으로 원생을 등록해보세요.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {children.map((child) => (
        <ChildCard key={child.id} child={child} onNotesClick={onNotesClick} />
      ))}
    </div>
  )
}
