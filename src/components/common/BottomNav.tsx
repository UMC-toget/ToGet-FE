import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeIcon from '../icons/HomeIcon'
import HomeIconBold from '../icons/HomeIconBold'
import GiftIcon from '../icons/GiftIcon'
import GiftIconBold from '../icons/GiftIconBold'
import ProfileIcon from '../icons/ProfileIcon'
import ProfileIconBold from '../icons/ProfileIconBold'
import PlusIcon from '../icons/PlusIcon'
import WishCreateSheet from '../../pages/gift-create/WishCreateSheet'

type Tab = 'home' | 'gift' | 'my'

// 선택된 탭은 채워진(bold) 아이콘, 선택 안 된 탭은 outline 아이콘을 씁니다 (피그마 기준).
const TABS: { id: Tab; label: string; path: string | null; Icon: typeof HomeIcon; ActiveIcon: typeof HomeIcon }[] = [
  { id: 'home', label: '홈', path: '/home', Icon: HomeIcon, ActiveIcon: HomeIconBold },
  { id: 'gift', label: '위시', path: '/wish', Icon: GiftIcon, ActiveIcon: GiftIconBold },
  { id: 'my', label: '마이', path: '/my', Icon: ProfileIcon, ActiveIcon: ProfileIconBold },
]

interface BottomNavProps {
  active: Tab
}

/** 하단 네비게이션 바 + 플로팅 버튼 (피그마 하단 탭 컴포넌트 기준) */
export default function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate()
  const [wishSheetOpen, setWishSheetOpen] = useState(false)

  // 활성 탭(검정 필)이 양 끝일 때 해당 쪽 패딩이 좁아집니다 (피그마 기준)
  const pillPadding = `${active === 'home' ? 'pl-1' : 'pl-5'} ${active === 'my' ? 'pr-1' : 'pr-5'}`

  return (
    <>
      <nav className="fixed bottom-8 left-1/2 z-40 flex w-full max-w-[402px] -translate-x-1/2 items-center justify-between px-[18px]">
        <div
          className={`flex items-center gap-5 rounded-full border border-gray-200 bg-gray-100/80 py-1 shadow-[0px_20px_250px_0px_rgba(0,0,0,0.04)] backdrop-blur-[30px] ${pillPadding}`}
        >
          {TABS.map(({ id, label, path, Icon, ActiveIcon }) =>
            id === active ? (
              <div key={id} className="flex items-center gap-2 rounded-full bg-gray-900 px-[18px] py-3 text-white">
                <ActiveIcon className="size-6" />
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
          onClick={() => setWishSheetOpen(true)}
          className="flex size-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)]"
        >
          <PlusIcon className="size-6" />
        </button>
      </nav>
      {/* nav는 translate로 인해 position:fixed 자손의 containing block이 되어버리므로,
          시트는 nav 밖 형제로 렌더링해 뷰포트 기준으로 붙게 한다 */}
      <WishCreateSheet open={wishSheetOpen} onClose={() => setWishSheetOpen(false)} />
    </>
  )
}
