import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../components/common/BottomSheet'
import ConfirmModal from '../../components/common/ConfirmModal'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import bannerCat from '../../assets/banner-cat.svg'
import togetherCat from '../../assets/together-cat.svg'
import type { GiftPageType } from './giftTypes'
import { useDeleteIndividualDraft, useIndividualDraft } from './useIndividualDraft'
import { useDeleteTogetherDraft, useTogetherDraft } from './useTogetherDraft'
import { useAuth } from '../../hooks/useAuth'
import { trackEvent } from '../../lib/analytics'

interface GiftCreateCardInfo {
  type: GiftPageType
  icon: string
  title: string
  description: string
}

const GIFT_PAGE_CARDS: GiftCreateCardInfo[] = [
  {
    type: 'my',
    icon: bannerCat,
    title: '내 선물 페이지 만들기',
    description: '내가 받고 싶은 선물을 담아,\n친구들에게 공유할 수 있어요.',
  },
  {
    type: 'together',
    icon: togetherCat,
    title: '함께 선물 페이지 만들기',
    description: '친구들과 함께 한 사람을 위한\n선물을 고르고 준비할 수 있어요.',
  },
]

const resolveCreatePath = (type: GiftPageType) => `/gift/create/${type}`

const trackCreateStart = (type: GiftPageType) => trackEvent('funding_create_start', { funding_type: type })

interface GiftCreateSheetProps {
  open: boolean
  onClose: () => void
  title?: string
}

/** 선물 페이지 만들기 바텀시트 (WishCreateSheet와 100% 동일한 카드 디자인 및 레이아웃 적용) */
export default function GiftCreateSheet({
  open,
  onClose,
  title = '선물 페이지 만들기',
}: GiftCreateSheetProps) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [draftModalType, setDraftModalType] = useState<GiftPageType | null>(null)
  
  // '내 선물 페이지'(individual)는 실제 임시저장 API로 draft 여부를 확인
  const individualDraftQuery = useIndividualDraft()
  // '함께 선물 페이지'(together)도 실제 임시저장 API로 draft 여부를 확인
  const togetherDraftQuery = useTogetherDraft()
  const deleteIndividualDraft = useDeleteIndividualDraft()
  const deleteTogetherDraft = useDeleteTogetherDraft()

  const handleSelectCard = useCallback(
    (type: GiftPageType) => {
      if (type === 'my') {
        if (individualDraftQuery.isLoading) return
        if (individualDraftQuery.data) {
          setDraftModalType(type)
          return
        }
        onClose()
        trackCreateStart(type)
        navigate(isLoggedIn ? resolveCreatePath(type) : '/login')
        return
      }

      if (togetherDraftQuery.isLoading) return
      if (togetherDraftQuery.data) {
        setDraftModalType(type)
        return
      }
      onClose()
      trackCreateStart(type)
      navigate(isLoggedIn ? resolveCreatePath(type) : '/login')
    },
    [individualDraftQuery.isLoading, individualDraftQuery.data, togetherDraftQuery.isLoading, togetherDraftQuery.data, isLoggedIn, onClose, navigate],
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
      navigate(isLoggedIn ? resolveCreatePath(type) : '/login')
    }
  }, [draftModalType, individualDraftQuery.data, togetherDraftQuery.data, deleteIndividualDraft, deleteTogetherDraft, isLoggedIn, onClose, navigate])

  const handleContinueDraft = useCallback(() => {
    const type = draftModalType
    setDraftModalType(null)
    onClose()
    if (type) {
      trackCreateStart(type)
      navigate(isLoggedIn ? resolveCreatePath(type) : '/login', { state: { continueDraft: true } })
    }
  }, [draftModalType, isLoggedIn, onClose, navigate])

  const handleGuideClick = useCallback(() => {
    onClose()
    navigate('/gift/about')
  }, [onClose, navigate])

  return (
    <>
      <BottomSheet open={open} onClose={onClose}>
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col gap-5">
            <p className="text-h3-sb text-[#121212]">{title}</p>
            <div className="flex w-full flex-col gap-4">
              {GIFT_PAGE_CARDS.map((card) => {
                const disabled =
                  (card.type === 'my' && individualDraftQuery.isLoading) ||
                  (card.type === 'together' && togetherDraftQuery.isLoading)
                return (
                  <button
                    key={card.type}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectCard(card.type)}
                    className={`flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white px-3.5 py-3 text-left ${
                      disabled ? 'opacity-50' : ''
                    }`}
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
                )
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuideClick}
            className="text-center text-gray-700"
          >
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
