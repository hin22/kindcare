import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, BookOpen, Pill, Bell, Info, Wrench } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import ChildList from './components/ChildList'
import AddChildModal from './components/AddChildModal'
import CalendarWidget from './components/CalendarWidget'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import NotesPage from './pages/NotesPage'
import MedicationPage from './pages/MedicationPage'
import MyPage from './pages/MyPage'

const PAGE_META = {
  dashboard:  { title: '대시보드',   subtitle: '오늘의 현황을 한눈에 확인하세요.' },
  children:   { title: '원생 관리',  subtitle: '등록된 원생 목록을 관리합니다.' },
  notes:      { title: '알림장',     subtitle: '원생별 일일 알림장을 작성하고 조회합니다.' },
  medication: { title: '투약 관리',  subtitle: '원생의 투약 기록을 관리합니다.' },
  mypage:     { title: '마이페이지', subtitle: '계정 정보와 설정을 관리합니다.' },
}

function ComingSoon({ page }) {
  const meta = PAGE_META[page]
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Wrench size={24} className="text-slate-400" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-slate-500">{meta.title} 준비 중</p>
      <p className="text-sm text-slate-400">{meta.subtitle}</p>
    </div>
  )
}

function ChildrenPage({ onNotesClick }) {
  const { auth } = useAuth()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchChildren = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('/api/children', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      })
      setChildren(res.data)
    } catch {
      setError('원생 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchChildren() }, [])

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">원생 관리</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            총 <span className="text-indigo-600 font-semibold">{children.length}</span>명 등록됨
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <span>+</span> 원생 등록
        </button>
      </div>
      <ChildList children={children} loading={loading} error={error} onRefresh={fetchChildren} onNotesClick={onNotesClick} />
      {showModal && (
        <AddChildModal onClose={() => setShowModal(false)} onAdded={fetchChildren} />
      )}
    </>
  )
}

function DashboardPage() {
  const { auth } = useAuth()
  const isTeacher = auth?.role === 'TEACHER'
  const [stats, setStats] = useState({ totalChildren: null, todayNotes: null, pendingMedication: null })

  useEffect(() => {
    axios.get('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${auth?.token}` },
    })
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error('[Dashboard] stats API 오류:', err?.response?.status, err?.response?.data ?? err?.message)
      })
  }, [])

  const cards = isTeacher
    ? [
        {
          label: '총 원생 수',
          value: stats.totalChildren ?? '-',
          sub: stats.totalChildren != null ? `${stats.totalChildren}명 등록됨` : null,
          iconColor: 'text-blue-500', bg: 'bg-blue-50', Icon: Users,
        },
        {
          label: '오늘 알림장',
          value: stats.todayNotes ?? '-',
          sub: stats.totalChildren != null ? `전체 ${stats.totalChildren}명 중` : null,
          iconColor: 'text-emerald-500', bg: 'bg-emerald-50', Icon: BookOpen,
        },
        {
          label: '투약 의뢰',
          value: stats.pendingMedication ?? '-',
          sub: stats.pendingMedication != null ? `오늘 미처리 ${stats.pendingMedication}건` : null,
          iconColor: 'text-violet-500', bg: 'bg-violet-50', Icon: Pill,
        },
      ]
    : [
        {
          label: '연결된 자녀',
          value: stats.totalChildren ?? '-',
          sub: stats.totalChildren != null ? `${stats.totalChildren}명` : null,
          iconColor: 'text-blue-500', bg: 'bg-blue-50', Icon: Users,
        },
        {
          label: '오늘 알림장',
          value: stats.todayNotes != null ? (stats.todayNotes > 0 ? '작성됨' : '미작성') : '-',
          sub: null,
          iconColor: 'text-emerald-500', bg: 'bg-emerald-50', Icon: BookOpen,
        },
        {
          label: '투약 의뢰',
          value: stats.pendingMedication ?? '-',
          sub: stats.pendingMedication != null ? `오늘 대기 ${stats.pendingMedication}건` : null,
          iconColor: 'text-violet-500', bg: 'bg-violet-50', Icon: Pill,
        },
      ]

  return (
    <div>
      {/* 인사 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          안녕하세요, {auth?.name} {isTeacher ? '선생님' : '학부모님'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">오늘도 좋은 하루 되세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map(({ label, value, sub, iconColor, bg, Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={iconColor} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub ?? label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 안내 */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-sm text-emerald-700 flex items-start gap-3 mb-6">
        <Info size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
        <p>
          {isTeacher
            ? '원생 관리 메뉴에서 원생을 등록하고 초대 코드를 학부모에게 전달해 보세요.'
            : '선생님께 받은 초대 코드로 자녀를 연결하면 알림장을 확인할 수 있어요.'}
        </p>
      </div>

      {/* 달력 */}
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-slate-500 mb-3">
          {isTeacher ? '일정 및 특이사항 현황' : '일정 및 특이사항'}
        </h2>
        <CalendarWidget />
      </div>
    </div>
  )
}

/* 로그인 후 메인 앱 */
function MainApp() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [notesChildId, setNotesChildId] = useState(null)

  const navigateToNotes = (childId) => {
    setNotesChildId(childId)
    setCurrentPage('notes')
  }

  const renderPage = () => {
    if (currentPage === 'dashboard') return <DashboardPage />
    if (currentPage === 'children') return <ChildrenPage onNotesClick={navigateToNotes} />
    if (currentPage === 'notes') return <NotesPage key={notesChildId} initialChildId={notesChildId} />
    if (currentPage === 'medication') return <MedicationPage />
    if (currentPage === 'mypage') return <MyPage />
    return <ComingSoon page={currentPage} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar selected={currentPage} onSelect={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="font-semibold text-slate-800">{PAGE_META[currentPage]?.title}</p>
            <p className="text-xs text-slate-400">{PAGE_META[currentPage]?.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <Bell size={15} strokeWidth={2} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

/* 인증 라우터: 로그인 여부에 따라 화면 분기 */
function AuthRouter() {
  const { auth } = useAuth()
  const [page, setPage] = useState('login') // 'login' | 'signup'

  if (auth) return <MainApp />

  if (page === 'signup') {
    return <SignupPage onGoLogin={() => setPage('login')} />
  }

  return <LoginPage onGoSignup={() => setPage('signup')} />
}

export default function App() {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  )
}
