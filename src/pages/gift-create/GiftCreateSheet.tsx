import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../components/common/BottomSheet'
import ConfirmModal from '../../components/common/ConfirmModal'
import bannerCat from '../../assets/banner-cat.svg'
import togetherCat from '../../assets/together-cat.svg'
import { GIFT_CREATE_CARDS } from './giftTypes'
import type { GiftPageType } from './giftTypes'
import { useIndividualDraft } from './useIndividualDraft'
import { useTogetherDraft } from './useTogetherDraft'
import { useAuth } from '../../hooks/useAuth'

const CARD_ICONS: Record<GiftPageType, string> = {
  my: bannerCat,
  together: togetherCat,
}

const resolveCreatePath = (type: GiftPageType) => `/gift/create/${type}`

interface GiftCreateSheetProps {
  open: boolean
  onClose: () => void
}

/** 선물 페이지 만들기 바텀시트 (C01: 홈의 + 버튼을 누르면 열림) */
export default function GiftCreateSheet({ open, onClose }: GiftCreateSheetProps) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [draftModalType, setDraftModalType] = useState<GiftPageType | null>(null)
  // '내 선물 페이지'(individual)는 실제 임시저장 API로 draft 여부를 확인
  const individualDraftQuery = useIndividualDraft()
  // '함께 선물 페이지'(together)도 실제 임시저장 API로 draft 여부를 확인
  const togetherDraftQuery = useTogetherDraft()

  const handleSelectCard = (type: GiftPageType) => {
    if (type === 'my') {
      if (individualDraftQuery.isLoading) return
      if (individualDraftQuery.data) {
        setDraftModalType(type)
        return
      }
      onClose()
      navigate(isLoggedIn ? resolveCreatePath(type) : '/login')
      return
    }

    if (togetherDraftQuery.isLoading) return
    if (togetherDraftQuery.data) {
      setDraftModalType(type)
      return
    }
    onClose()
    navigate(isLoggedIn ? resolveCreatePath(type) : '/login')
  }

  const handleStartNew = () => {
    const type = draftModalType
    setDraftModalType(null)
    onClose()
    if (type) navigate(isLoggedIn ? resolveCreatePath(type) : '/login')
  }

  const handleContinueDraft = () => {
    const type = draftModalType
    setDraftModalType(null)
    onClose()
    if (type) navigate(isLoggedIn ? resolveCreatePath(type) : '/login', { state: { continueDraft: true } })
  }

  const handleGuideClick = () => {
    onClose()
    navigate('/gift/about')
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose}>
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-h3-sb text-[#121212]">내 선물 페이지 만들기</p>
            <p className="text-caption1-r text-gray-600">상황에 맞는 방식을 선택해 주세요.</p>
          </div>

          <div className="flex flex-col gap-4">
            {GIFT_CREATE_CARDS.map((card) => {
              const disabled =
                (card.type === 'my' && individualDraftQuery.isLoading) ||
                (card.type === 'together' && togetherDraftQuery.isLoading)
              return (
                <button
                  key={card.type}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectCard(card.type)}
                  className={`flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3 text-left ${disabled ? 'opacity-50' : ''}`}
                >
                  <span className="flex size-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[5.8px] bg-background">
                    <img src={CARD_ICONS[card.type]} alt="" className="size-[52px] object-cover" />
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <span className="text-b2-m text-black">{card.title}</span>
                    <span className="whitespace-pre-line text-caption1-r text-gray-600">{card.description}</span>
                    <span className="mt-0.5 flex flex-wrap gap-1.5">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2.5 py-1.5 text-caption2-r text-gray-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <button type="button" onClick={handleGuideClick} className="text-center text-caption1-r text-gray-700">
            투겟이 처음이신가요? 이용 방법 보러가기 {'>'}
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
