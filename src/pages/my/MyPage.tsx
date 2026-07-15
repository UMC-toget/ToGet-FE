import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/common/BottomNav'
import MenuRow from '../../components/common/MenuRow'
import Toast from '../../components/common/Toast'
import SearchIcon from '../../components/icons/SearchIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import avatarCat from '../../assets/avatar-cat.svg'
import { useAuth } from '../../hooks/useAuth'
import { MOCK_USER } from './mockUser'

const TOAST_DURATION_MS = 2500

const MENU_SECTIONS: { title: string; items: string[] }[] = [
  { title: '선물 페이지', items: ['내 선물 페이지', '함께 선물 페이지'] },
  { title: '계좌', items: ['등록된 나의 계좌'] },
  { title: '설정', items: ['알림 설정', '고객 문의', '이용약관', '개인정보 처리 방침'] },
]

// 비로그인 상태에서는 설정 섹션만 노출됩니다 (피그마 기준)
const GUEST_MENU_SECTIONS = MENU_SECTIONS.filter((s) => s.title === '설정')

/** 마이페이지 (I. 마이) */
export default function MyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()
  // 다른 페이지에서 navigate state로 전달한 토스트 메시지를 일정 시간 표시
  const [toastMessage, setToastMessage] = useState<string | null>(
    () => (location.state as { toast?: string } | null)?.toast ?? null,
  )

  useEffect(() => {
    if (toastMessage === null) return
    navigate(location.pathname, { replace: true, state: null })
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toastMessage, location.pathname, navigate])

  const sections = isLoggedIn ? MENU_SECTIONS : GUEST_MENU_SECTIONS

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32">
      <header className="flex h-[50px] shrink-0 items-center justify-between px-[18px]">
        <h1 className="text-h1-sb text-black">마이</h1>
        {/* TODO: 검색 화면 구현 후 연결 */}
        <button type="button" aria-label="검색" className="text-gray-900">
          <SearchIcon />
        </button>
      </header>

      <button
        type="button"
        onClick={() => navigate(isLoggedIn ? '/my/profile' : '/login')}
        className="flex w-full items-center justify-between px-[18px] py-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-[52px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-t from-[#1e1d1e] from-[76.6%] to-[#3c393c]">
            <img src={avatarCat} alt="" className="w-9" />
          </span>
          <span className="flex flex-col items-start gap-1 text-left">
            <span className="text-b1-m text-black">{isLoggedIn ? MOCK_USER.name : '로그인 및 회원가입'}</span>
            <span className="text-caption1-r text-gray-600">
              {isLoggedIn
                ? `${MOCK_USER.loginProvider}으로 로그인 중이에요`
                : '소셜 로그인으로 선물 페이지를 모아 볼 수 있어요'}
            </span>
          </span>
        </div>
        <ChevronRightIcon className="size-6 text-black" />
      </button>

      <div className="h-3 w-full shrink-0 bg-background" />

      <div className="mt-7 flex flex-col gap-8 px-[18px]">
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-5">
            <h2 className="text-h3-sb text-black">{section.title}</h2>
            <div className="flex flex-col gap-3">
              {section.items.map((item) => (
                <MenuRow key={item} label={item} />
              ))}
            </div>
          </section>
        ))}
        <p className="text-caption1-r text-gray-600">투겟(ToGet) v1.0.0</p>
      </div>

      <Toast open={toastMessage !== null} message={toastMessage ?? ''} />
      <BottomNav active="my" />
    </div>
  )
}
