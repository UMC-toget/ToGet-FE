import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/common/BottomNav'
import MenuRow from '../../components/common/MenuRow'
import Toast from '../../components/common/Toast'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import { useAuth } from '../../hooks/useAuth'
import { useMyProfile } from '../../hooks/useMyProfile'
import { OAUTH_PROVIDER_LABELS } from '../../api/users'
import { isAdminProfile } from '../../lib/admin'

const TOAST_DURATION_MS = 2000
const IN_DEVELOPMENT_MESSAGE = '아직 개발 중인 기능이에요'
// 홈 화면 문의하기(HomeFooter)와 동일한 문의처
const CONTACT_EMAIL = 'hello.toget.team@gmail.com'

const MENU_SECTIONS: { title: string; items: { label: string; path?: string; mailto?: string }[] }[] = [
  {
    title: '선물 페이지',
    items: [
      { label: '내 선물 페이지', path: '/my/fundings/my' },
      { label: '함께 선물 페이지', path: '/my/fundings/together' },
    ],
  },
  { title: '계좌', items: [{ label: '등록된 나의 계좌', path: '/my/accounts' }] },
  {
    title: '설정',
    items: [
      { label: '고객 문의', mailto: CONTACT_EMAIL },
      { label: '이용약관', path: '/terms' },
      { label: '개인정보 처리 방침', path: '/privacy-policy' },
    ],
  },
]

// 비로그인 상태에서는 설정 섹션만 노출됩니다 (피그마 기준)
const GUEST_MENU_SECTIONS = MENU_SECTIONS.filter((s) => s.title === '설정')

// 관리자 계정 전용 메뉴 (피그마 "마이 - 관리자" 화면 기준) — 일반 사용자 메뉴와 구성이 다름
const ADMIN_MENU_SECTIONS: { title: string; items: { label: string; path?: string; mailto?: string }[] }[] = [
  {
    title: '관리',
    items: [
      { label: '초대장 관리', path: '/admin/invitation-themes' },
      { label: '선물 관리', path: '/admin/products' },
    ],
  },
  { title: '설정', items: [{ label: '이용약관' }, { label: '개인정보 처리 방침' }] },
]

/** 마이페이지 (I. 마이) */
export default function MyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()
  const { data: profile } = useMyProfile()
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

  const isAdmin = isLoggedIn && isAdminProfile(profile)
  const sections = isAdmin ? ADMIN_MENU_SECTIONS : isLoggedIn ? MENU_SECTIONS : GUEST_MENU_SECTIONS

  const handleMenuClick = (item: { path?: string; mailto?: string }) => {
    if (item.mailto) return
    if (item.path) {
      navigate(item.path)
      return
    }
    setToastMessage(IN_DEVELOPMENT_MESSAGE)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32">
      <header className="flex h-[50px] shrink-0 items-center px-[18px]">
        <h1 className="text-h1-sb text-black">마이</h1>
      </header>

      <button
        type="button"
        onClick={() => navigate(isLoggedIn ? '/my/profile' : '/login')}
        className="flex w-full items-center justify-between px-[18px] py-6"
      >
        <div className="flex items-center gap-3">
          {!isAdmin && isLoggedIn && profile?.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt=""
              className="size-[52px] rounded-full object-cover"
            />
          ) : (
            <DefaultAvatar className="size-[52px]" />
          )}
          <span className="flex flex-col items-start gap-2 text-left">
            <span className="text-b1-m text-black">
              {isAdmin ? '투겟/관리자' : isLoggedIn ? (profile?.nickname ?? '회원') : '로그인 및 회원가입'}
            </span>
            <span className="text-caption1-r text-gray-600">
              {isLoggedIn
                ? `${OAUTH_PROVIDER_LABELS[profile?.oauthProvider ?? ''] ?? '소셜'}${profile?.oauthProvider === 'GOOGLE' ? '로' : '으로'} 로그인 중이에요`
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
                <MenuRow
                  key={item.label}
                  label={item.label}
                  href={item.mailto ? `mailto:${item.mailto}` : undefined}
                  onClick={() => handleMenuClick(item)}
                />
              ))}
            </div>
          </section>
        ))}
        <p className="text-caption1-r text-gray-600">투겟(ToGet) v1.0.0</p>
      </div>

      <Toast open={toastMessage !== null} message={toastMessage ?? ''} bottomClass="bottom-[110px]" />
      <BottomNav active="my" />
    </div>
  )
}
