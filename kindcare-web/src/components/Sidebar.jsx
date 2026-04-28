import { LayoutDashboard, Users, BookOpen, Pill, UserCircle, LogOut, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TEACHER_NAV = [
  { id: 'dashboard',  label: '대시보드',   Icon: LayoutDashboard },
  { id: 'children',   label: '원생 관리',  Icon: Users },
  { id: 'notes',      label: '알림장',     Icon: BookOpen },
  { id: 'medication', label: '투약 관리',  Icon: Pill },
  { id: 'mypage',     label: '마이페이지', Icon: UserCircle },
]

const PARENT_NAV = [
  { id: 'dashboard',  label: '대시보드',   Icon: LayoutDashboard },
  { id: 'notes',      label: '알림장',     Icon: BookOpen },
  { id: 'medication', label: '투약 관리',  Icon: Pill },
  { id: 'mypage',     label: '마이페이지', Icon: UserCircle },
]

export default function Sidebar({ selected, onSelect }) {
  const { auth, logout } = useAuth()
  const isTeacher = auth?.role === 'TEACHER'
  const navItems  = isTeacher ? TEACHER_NAV : PARENT_NAV
  const initials  = auth?.name?.charAt(0) ?? '?'

  return (
    <aside className="w-60 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-base tracking-tight">KindCare</span>
        </div>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4">
        {navItems.map(({ id, label, Icon }) => {
          const isActive = selected === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-emerald-400' : 'text-slate-500'}
              />
              {label}
            </button>
          )
        })}
      </nav>

      {/* 하단 사용자 */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{auth?.name ?? '-'}</p>
            <p className="text-slate-400 text-xs">{isTeacher ? '교사' : '학부모'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg py-2 transition-colors"
        >
          <LogOut size={13} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
