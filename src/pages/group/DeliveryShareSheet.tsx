import { useNavigate, useParams } from 'react-router-dom'
import BottomSheet from '../../components/common/BottomSheet'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import shareNews from '../../assets/share-news.svg'
import shareHeartfelt from '../../assets/share-heartfelt.svg'

interface ShareCardInfo {
  /** 이동할 후기 작성 유형 (ReviewWriteType) */
  type: 'news' | 'message'
  icon: string
  title: string
  description: string
}

const SHARE_CARDS: ShareCardInfo[] = [
  {
    type: 'news',
    icon: shareNews,
    title: '함께 선물한 친구들에게 소식남기기',
    description: '함께 모아 준비한 선물에 대한,\n전달 완료 소식을 전할 수 있어요.',
  },
  {
    type: 'message',
    icon: shareHeartfelt,
    title: '선물과 함께 마음전하기',
    description: '친구들과 함께 준비한 과정과 마음을\n선물을 받을 친구에게 전달할 수 있어요.',
  },
]

interface DeliveryShareSheetProps {
  open: boolean
  onClose: () => void
}

/**
 * 전달 완료 소식/마음 공유 진입 바텀시트 (피그마 #3440:120888 "위시 등록 포함 바텀 시트")
 *
 * ENDED 상태에서 개설자가 "전달 완료 소식 남기기"를 누르면 열린다.
 * 소식남기기(news)·마음전하기(message) 두 유형으로 J파트 작성 화면(/gift/review/write/:type)에 연결.
 */
export default function DeliveryShareSheet({ open, onClose }: DeliveryShareSheetProps) {
  const { id } = useParams()
  const navigate = useNavigate()

  const handleSelect = (type: ShareCardInfo['type']) => {
    onClose()
    navigate(`/gift/review/write/${type}/${id}`)
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full flex-col gap-5">
        <p className="text-h3-sb text-[#121212]">선물 후기 남기기</p>
        <div className="flex w-full flex-col gap-4">
          {SHARE_CARDS.map((card) => (
            <button
              key={card.type}
              type="button"
              onClick={() => handleSelect(card.type)}
              className="flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white px-3.5 py-3 text-left"
            >
              <span className="flex size-[58px] shrink-0 items-center justify-center rounded-[5.8px] bg-background">
                <img src={card.icon} alt="" className="size-[52px] object-contain" />
              </span>
              <span className="flex flex-1 flex-col gap-1">
                <span className="text-b2-m text-black">{card.title}</span>
                <span className="whitespace-pre-line text-caption1-r text-gray-600">
                  {card.description}
                </span>
              </span>
              <ChevronRightIcon className="size-6 shrink-0 text-gray-700" />
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}
