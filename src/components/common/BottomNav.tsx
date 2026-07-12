import { useNavigate } from 'react-router-dom'
import HomeIcon from '../icons/HomeIcon'
import GiftIcon from '../icons/GiftIcon'
import ProfileIcon from '../icons/ProfileIcon'
import PlusIcon from '../icons/PlusIcon'

type Tab = 'home' | 'gift' | 'my'

const TABS: { id: Tab; label: string; path: string | null; Icon: typeof HomeIcon }[] = [
  { id: 'home', label: '홈', path: '/home', Icon: HomeIcon },
  /* TODO: 선물(위시) 페이지 구현 후 path 연결 */
  { id: 'gift', label: '선물', path: null, Icon: GiftIcon },
  { id: 'my', label: '마이', path: '/my', Icon: ProfileIcon },
]

interface BottomNavProps {
  active: Tab
  /** 플로팅(+) 버튼 클릭 시 호출 */
  onFabClick?: () => void
}

/** 하단 네비게이션 바 + 플로팅 버튼 (피그마 하단 탭 컴포넌트 기준) */
export default function BottomNav({ active, onFabClick }: BottomNavProps) {
  const navigate = useNavigate()

  // 활성 탭(검정 필)이 양 끝일 때 해당 쪽 패딩이 좁아집니다 (피그마 기준)
  const pillPadding = `${active === 'home' ? 'pl-1' : 'pl-5'} ${active === 'my' ? 'pr-1' : 'pr-5'}`

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 flex w-full max-w-[402px] -translate-x-1/2 items-center justify-between px-[18px]">
      <div
        className={`flex items-center gap-5 rounded-full border border-gray-200 bg-gray-100/80 py-1 shadow-[0px_20px_250px_0px_rgba(0,0,0,0.04)] backdrop-blur-[30px] ${pillPadding}`}
      >
        {TABS.map(({ id, label, path, Icon }) =>
          id === active ? (
            <div key={id} className="flex items-center gap-2 rounded-full bg-gray-900 px-[18px] py-3 text-white">
              <Icon className="size-6" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ) : (
            <button
              key={id}
              type="button"
              aria-label={label}
              onClick={() => path && navigate(path)}
              className="p-0.5 text-gray-400"
            >
              <Icon className="size-6" />
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        aria-label="선물 페이지 만들기"
        onClick={onFabClick}
        className="flex size-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)]"
      >
        <PlusIcon className="size-6" />
      </button>
    </nav>
  )
}
