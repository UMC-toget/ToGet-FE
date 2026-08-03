import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import PlusIcon from '../../components/icons/PlusIcon'
import type { ConfirmedGift } from './ConfirmPage'

// 접근: 개설자 전용 | 선물 목록 수정하기 — ConfirmPage 3단계에서 "수정하기" 버튼으로 진입
export default function ConfirmEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const passedState = location.state as {
    confirmedGifts: ConfirmedGift[]
    step: number
    selectedGiftId: number | null
    includedMemberIds: number[]
  }

  const [gifts, setGifts] = useState<ConfirmedGift[]>(passedState?.confirmedGifts ?? [])
  const [showExitModal, setShowExitModal] = useState(false)

  const totalAmount = gifts.reduce((sum, g) => sum + g.price, 0)

  const handleRemove = (giftId: number) => {
    setGifts(prev => prev.filter(g => g.id !== giftId))
  }

  const handleComplete = () => {
    navigate(`/group/${id}/confirm`, {
      state: { ...passedState, confirmedGifts: gifts },
    })
  }

  const handleBack = () => {
    setShowExitModal(true)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="선물 목록 수정하기" onBack={handleBack} />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* 헤더 텍스트 */}
        <div className="px-[18px] pt-5">
          <p className="text-h3-sb text-black">기본 정보를 입력해 주세요</p>
          <p className="mt-2 text-caption1-r text-[#797378]">친구들에게 보여질 선물 페이지 정보를 작성해 주세요</p>
        </div>

        {/* 선물 추가하기 카드 */}
        <div className="px-[18px] pt-5 pb-5">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-[14px] py-3"
            onClick={() => {
              // TODO: 선물 추가 플로우 연결
            }}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gray-100">
              <PlusIcon className="size-5 text-black" />
            </div>
            <span className="flex-1 text-left text-b2-m text-black">선물 추가하기</span>
            <ChevronRightIcon className="size-6 shrink-0 text-black" />
          </button>
        </div>

        {/* 선물 목록 */}
        <div className="flex-1 bg-[#F5F4F5] px-[18px] pt-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-b1-m text-black">등록된 {gifts.length}개 상품</span>
            <span className="text-b1-m font-semibold text-pink-500">
              총 {totalAmount.toLocaleString()}원
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {gifts.map(gift => (
              <div
                key={gift.id}
                className="relative flex items-stretch gap-3 rounded-xl border border-gray-100 bg-white px-[14px] py-3"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-md bg-background">
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.name} className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-gray-100" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-[10px]">
                  <span
                    className="line-clamp-1 leading-normal text-[#191919]"
                    style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 500 }}
                  >
                    {gift.name}
                  </span>
                  <span className="text-caption1-r text-[#5B565A]">
                    {gift.price.toLocaleString()}원
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(gift.id)}
                  className="absolute right-[16px] top-[24px] flex size-6 items-center justify-center rounded-full bg-[#EAE9EA] shadow-[0px_8.57px_107.14px_0px_rgba(0,0,0,0.04)]"
                >
                  <CloseIcon className="size-4 text-[#797378]" />
                </button>
              </div>
            ))}

            {gifts.length === 0 && (
              <p className="py-6 text-center text-caption1-r text-gray-400">선물을 추가해 주세요</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-[18px] pb-8 pt-4">
        <Button disabled={gifts.length === 0} onClick={handleComplete}>
          수정 완료
        </Button>
      </div>

      <ConfirmModal
        open={showExitModal}
        title="수정을 그만 두시겠어요?"
        description="변경 내용이 저장되지 않아요"
        confirmText="나가기"
        cancelText="계속 수정하기"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => navigate(`/group/${id}/confirm`, { state: passedState })}
      />
    </div>
  )
}
