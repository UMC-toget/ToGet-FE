import { useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import GiftIcon from '../../components/icons/GiftIcon'
import ShareIcon from '../../components/icons/ShareIcon'
import MessageIcon from '../../components/icons/MessageIcon'
import CircleCheckIcon from '../../components/icons/CircleCheckIcon'
import LockIcon from '../../components/icons/LockIcon'
import ChatIcon from '../../components/icons/ChatIcon'
import StarIcon from '../../components/icons/StarIcon'
import WalletIcon from '../../components/icons/WalletIcon'

type GiftPageType = 'my' | 'together'

interface GuideItem {
  Icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

interface TabContent {
  tabLabel: string
  title: string
  subtitle: string
  createPath: string
  items: GuideItem[]
}

const TAB_CONTENT: Record<GiftPageType, TabContent> = {
  my: {
    tabLabel: '내 선물 페이지',
    title: '내 선물 페이지',
    subtitle: '나를 위한 선물도, 친구를 위한 선물도\n함께 마음을 모아 준비해보세요.',
    createPath: '/gift/create/my',
    items: [
      {
        Icon: GiftIcon,
        title: '받고 싶은 선물을 담아요',
        description: '받고 싶은 선물을 하나 이상 추가하고\n함께 준비할 수 있어요',
      },
      {
        Icon: ShareIcon,
        title: '초대장을 공유해요',
        description: '초대장 링크를 보내 친구들을\n선물 페이지에 초대할 수 있어요',
      },
      {
        Icon: MessageIcon,
        title: '친구들이 축하를 보내요',
        description: '친구들은 축하 메시지를 남기거나\n선물에 함께할 수 있어요',
      },
      {
        Icon: CircleCheckIcon,
        title: '친구들의 참여가 반영돼요',
        description: '참여 내역을 확인하면\n진행 상황에 반영할 수 있어요',
      },
    ],
  },
  together: {
    tabLabel: '함께 선물 페이지',
    title: '함께 선물 페이지',
    subtitle: '초대받은 사람들과 선물 후보를 고르고,\n함께 비용을 모아 준비해보세요',
    createPath: '/gift/create/together',
    items: [
      {
        Icon: LockIcon,
        title: '링크를 받은 사람만 참여할 수 있어요',
        description: '공개 피드에는 노출되지 않고,\n초대받은 사람만 들어올 수 있어요',
      },
      {
        Icon: ChatIcon,
        title: '참여자 모두 후보와 의견을 남길 수 있어요',
        description: '선물 후보를 등록하고 의견을 남기며\n함께 선물을 정할 수 있어요',
      },
      {
        Icon: StarIcon,
        title: '방장만 최종 선물을 확정할 수 있어요',
        description: '후보를 모은 뒤 방장이 최종 선물을 확정하고\n정산을 시작해요',
      },
      {
        Icon: WalletIcon,
        title: '선물이 정해지면 1/N 금액을 확인해요',
        description: '참여 인원 기준으로 금액을 나누고\n방장 계좌로 입금할 수 있어요',
      },
    ],
  },
}

const TABS: GiftPageType[] = ['my', 'together']

/** 선물 만들기 소개 페이지 (C02) - 탭별 이용 방법을 안내하고 페이지 만들기 플로우로 이동 */
export default function GiftAboutPage() {
  const [activeTab, setActiveTab] = useState<GiftPageType>('my')
  const navigate = useNavigate()
  const content = TAB_CONTENT[activeTab]

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="이용 방법 보기" />

      <div className="flex flex-1 flex-col gap-6 px-[18px] pt-5 pb-32">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded px-2.5 py-2 text-b2-m ${
                tab === activeTab ? 'bg-white text-black' : 'bg-transparent text-gray-600'
              }`}
            >
              {TAB_CONTENT[tab].tabLabel}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-h3-sb text-black">{content.title}</h2>
          <p className="text-caption1-r whitespace-pre-line text-gray-600">{content.subtitle}</p>
        </div>

        <div className="flex flex-col gap-3">
          {content.items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white px-3.5 py-3"
            >
              <div className="flex size-[58px] shrink-0 items-center justify-center rounded-md bg-background">
                <item.Icon className="size-8 text-gray-900" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-b2-m text-black">{item.title}</p>
                <p className="text-caption1-r whitespace-pre-line text-gray-700">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-white px-[18px] pt-3 pb-6">
        <Button onClick={() => navigate(content.createPath)}>페이지 만들기</Button>
      </div>
import Header from '../../components/common/Header'

/** 투겟 이용 방법 소개 페이지 (C02, 이번 범위 밖이라 라우트만 연결) */
export default function GiftAboutPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="이용 방법" />
      <p className="mt-10 text-center text-b2-r text-gray-600">준비 중인 화면입니다.</p>
    </div>
  )
}
