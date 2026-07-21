import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../components/common/BottomSheet'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import bannerCat from '../../assets/banner-cat.svg'
import togetherCat from '../../assets/together-cat.svg'
import wishGift from '../../assets/wish-gift.png'

interface WishCreateSheetProps {
  open: boolean
  onClose: () => void
}

interface WishCreateCardInfo {
  icon: string
  title: string
  description: string
  path: string
}

const WISH_CARD: WishCreateCardInfo = {
  icon: wishGift,
  title: '위시 등록하기',
  description: '받고 싶은 선물 또는 주고 싶은 선물을\n위시로 등록할 수 있어요.',
  path: '/wish/create',
}

const GIFT_PAGE_CARDS: WishCreateCardInfo[] = [
  {
    icon: bannerCat,
    title: '내 선물 페이지 만들기',
    description: '내가 받고 싶은 선물을 담아,\n친구들에게 공유할 수 있어요.',
    path: '/gift/create/my',
  },
  {
    icon: togetherCat,
    title: '함께 선물 페이지 만들기',
    description: '친구들과 함께 한 사람을 위한\n선물을 고르고 준비할 수 있어요.',
    path: '/gift/create/together',
  },
]

function WishCreateCard({ icon, title, description, onClick }: WishCreateCardInfo & { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white px-3.5 py-3 text-left"
    >
      <span className="flex size-[58px] shrink-0 items-center justify-center rounded-[5.8px] bg-background">
        <img src={icon} alt="" className="size-[52px] object-contain" />
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-b2-m text-black">{title}</span>
        <span className="whitespace-pre-line text-caption1-r text-gray-600">{description}</span>
      </span>
      <ChevronRightIcon className="size-6 shrink-0 text-gray-700" />
    </button>
  )
}

/** 위시 등록 포함 바텀시트 (하단 탭바 + 버튼을 누르면 열림) */
export default function WishCreateSheet({ open, onClose }: WishCreateSheetProps) {
  const navigate = useNavigate()

  const handleSelectCard = (path: string) => {
    onClose()
    navigate(path)
  }

  const handleGuideClick = () => {
    onClose()
    navigate('/gift/about')
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-5">
            <p className="text-h3-sb text-[#121212]">선물 담기</p>
            <div className="flex w-full flex-col gap-4">
              <WishCreateCard {...WISH_CARD} onClick={() => handleSelectCard(WISH_CARD.path)} />
            </div>
          </div>

          <div className="flex w-full flex-col gap-5">
            <p className="text-h3-sb text-[#121212]">선물 페이지 만들기</p>
            <div className="flex w-full flex-col gap-4">
              {GIFT_PAGE_CARDS.map((card) => (
                <WishCreateCard key={card.path} {...card} onClick={() => handleSelectCard(card.path)} />
              ))}
            </div>
          </div>
        </div>

        <button type="button" onClick={handleGuideClick} className="text-center text-gray-700">
          <span className="text-caption1-r">투겟이 처음이신가요? </span>
          <span className="text-caption1-m">이용 방법 보러가기 {'>'}</span>
        </button>
      </div>
    </BottomSheet>
  )
}
