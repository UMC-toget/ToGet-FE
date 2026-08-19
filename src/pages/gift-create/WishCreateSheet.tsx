import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../components/common/BottomSheet'
import ConfirmModal from '../../components/common/ConfirmModal'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import bannerCat from '../../assets/banner-cat.svg'
import togetherCat from '../../assets/together-cat.svg'
import wishGift from '../../assets/wish-gift.svg'
import { useAuth } from '../../hooks/useAuth'
import type { GiftPageType } from './giftTypes'
import { useDeleteIndividualDraft, useIndividualDraft } from './useIndividualDraft'
import { useDeleteTogetherDraft, useTogetherDraft } from './useTogetherDraft'
import { trackEvent } from '../../lib/analytics'

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

interface GiftCreateCardInfo extends WishCreateCardInfo {
  type: GiftPageType
}

const GIFT_PAGE_CARDS: GiftCreateCardInfo[] = [
  {
    type: 'my',
    icon: bannerCat,
    title: '내 선물 페이지 만들기',
    description: '내가 받고 싶은 선물을 담아,\n친구들에게 공유할 수 있어요.',
    path: '/gift/create/my',
  },
  {
    type: 'together',
    icon: togetherCat,
    title: '함께 선물 페이지 만들기',
    description: '친구들과 함께 한 사람을 위한\n선물을 고르고 준비할 수 있어요.',
    path: '/gift/create/together',
  },
]

const trackCreateStart = (type: GiftPageType) => trackEvent('funding_create_start', { funding_type: type })

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
        <span className="whitespace-pre-line text-caption1-r leading-normal text-gray-600">{description}</span>
      </span>
      <ChevronRightIcon className="size-6 shrink-0 text-gray-700" />
    </button>
  )
}

/** 위시 등록 포함 바텀시트 (하단 탭바 + 버튼을 누르면 열림) */
export default function WishCreateSheet({ open, onClose }: WishCreateSheetProps) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [draftModalType, setDraftModalType] = useState<GiftPageType | null>(null)

  // '내 선물'/'함께 선물' 카드는 임시저장 여부를 확인해야 하므로 시트가 열렸을 때만 조회
  const individualDraftQuery = useIndividualDraft(open)
  const togetherDraftQuery = useTogetherDraft(open)
  const deleteIndividualDraft = useDeleteIndividualDraft()
  const deleteTogetherDraft = useDeleteTogetherDraft()

  const draftQueryFor = (type: GiftPageType) => (type === 'my' ? individualDraftQuery : togetherDraftQuery)

  const handleSelectWish = () => {
    onClose()
    navigate(isLoggedIn ? WISH_CARD.path : '/login')
  }

  const handleSelectGiftCard = useCallback(
    (card: GiftCreateCardInfo) => {
      const draftQuery = draftQueryFor(card.type)
      if (draftQuery.isLoading) return
      if (draftQuery.data) {
        setDraftModalType(card.type)
        return
      }
      onClose()
      trackCreateStart(card.type)
      navigate(isLoggedIn ? card.path : '/login')
    },
    [individualDraftQuery, togetherDraftQuery, isLoggedIn, onClose, navigate],
  )

  const handleStartNew = useCallback(async () => {
    const type = draftModalType
    setDraftModalType(null)
    if (type === 'my') {
      const draftId = individualDraftQuery.data?.id
      if (draftId != null) {
        await deleteIndividualDraft.mutateAsync(draftId).catch(() => undefined)
      }
      localStorage.removeItem('toget:individual-draft-meta')
    }
    if (type === 'together') {
      const draftId = togetherDraftQuery.data?.togetherDraftsGiftId
      if (draftId != null) {
        await deleteTogetherDraft.mutateAsync(draftId).catch(() => undefined)
      }
      localStorage.removeItem('toget:together-draft-meta')
    }
    onClose()
    if (type) {
      trackCreateStart(type)
      navigate(isLoggedIn ? `/gift/create/${type}` : '/login')
    }
  }, [draftModalType, individualDraftQuery.data, togetherDraftQuery.data, deleteIndividualDraft, deleteTogetherDraft, isLoggedIn, onClose, navigate])

  const handleContinueDraft = useCallback(() => {
    const type = draftModalType
    setDraftModalType(null)
    onClose()
    if (type) {
      trackCreateStart(type)
      navigate(isLoggedIn ? `/gift/create/${type}` : '/login', { state: { continueDraft: true } })
    }
  }, [draftModalType, isLoggedIn, onClose, navigate])

  const handleGuideClick = () => {
    onClose()
    navigate('/gift/about')
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose}>
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col gap-8">
            <div className="flex w-full flex-col gap-5">
              <p className="text-h3-sb text-[#121212]">선물 담기</p>
              <div className="flex w-full flex-col gap-4">
                <WishCreateCard {...WISH_CARD} onClick={handleSelectWish} />
              </div>
            </div>

            <div className="flex w-full flex-col gap-5">
              <p className="text-h3-sb text-[#121212]">선물 페이지 만들기</p>
              <div className="flex w-full flex-col gap-4">
                {GIFT_PAGE_CARDS.map((card) => {
                  const disabled = draftQueryFor(card.type).isLoading
                  return (
                    <button
                      key={card.path}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectGiftCard(card)}
                      className={`flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white px-3.5 py-3 text-left ${
                        disabled ? 'opacity-50' : ''
                      }`}
                    >
                      <span className="flex size-[58px] shrink-0 items-center justify-center rounded-[5.8px] bg-background">
                        <img src={card.icon} alt="" className="size-[52px] object-contain" />
                      </span>
                      <span className="flex flex-1 flex-col gap-1">
                        <span className="text-b2-m text-black">{card.title}</span>
                        <span className="whitespace-pre-line text-caption1-r leading-normal text-gray-600">
                          {card.description}
                        </span>
                      </span>
                      <ChevronRightIcon className="size-6 shrink-0 text-gray-700" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <button type="button" onClick={handleGuideClick} className="text-center text-gray-700">
            <span className="text-caption1-r">투겟이 처음이신가요? </span>
            <span className="text-caption1-m">이용 방법 보러가기 {'>'}</span>
          </button>
        </div>
      </BottomSheet>

      <ConfirmModal
        open={draftModalType !== null}
        title="작성 중인 페이지가 있어요"
        description={'새로 만들면 기존에 작성하던\n내용은 사라져요'}
        cancelText="새로 만들기"
        confirmText="이어서 만들기"
        onCancel={handleStartNew}
        onConfirm={handleContinueDraft}
      />
    </>
  )
}
