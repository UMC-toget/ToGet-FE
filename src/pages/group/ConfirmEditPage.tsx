import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import ConfirmModal from '../../components/common/ConfirmModal'
import type { ConfirmedGift } from './ConfirmPage'
import PlusIcon from '../../components/icons/PlusIcon'
import CloseIcon from '../../components/icons/CloseIcon'

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
      state: {
        ...passedState,
        confirmedGifts: gifts,
      },
    })
  }

  const handleBack = () => {
    setShowExitModal(true)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header
        title="선물 목록 수정하기"
        onBack={handleBack}
        right={
          <button type="button" onClick={handleBack} className="text-b2-m text-black">
            나가기
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-5 px-[18px] py-5">
        {/* 선물 추가 버튼 */}
        <button
          type="button"
          className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 px-4 py-3"
          onClick={() => {
            // TODO: 선물 추가 플로우 연결 (CandidateNewPage 또는 위시 불러오기)
          }}
        >
          <div className="flex items-center gap-2 text-b2-m text-gray-500">
            <PlusIcon className="size-4" />
            선물 추가하기
          </div>
          <svg className="size-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* 등록된 선물 목록 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-b2-m text-gray-700">등록된 {gifts.length}개 선물</p>
            <p className="text-b2-m text-pink-500">총 {totalAmount.toLocaleString()}원</p>
          </div>

          <div className="flex flex-col gap-2">
            {gifts.map(gift => (
              <div
                key={gift.id}
                className="flex items-center gap-3 rounded-xl bg-background px-[14px] py-3"
              >
                <div className="size-[48px] shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.name} className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-gray-100" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-b2-m text-black line-clamp-1">{gift.name}</span>
                  <span className="text-caption1-r text-gray-500">{gift.price.toLocaleString()}원</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(gift.id)}
                  className="shrink-0 p-1"
                >
                  <CloseIcon className="size-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>

          {gifts.length === 0 && (
            <p className="py-6 text-center text-caption1-r text-gray-400">선물을 추가해 주세요</p>
          )}
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="px-[18px] pb-8 pt-4">
        <button
          type="button"
          onClick={handleComplete}
          disabled={gifts.length === 0}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white transition-colors disabled:bg-gray-300"
        >
          수정 완료
        </button>
      </div>

      <ConfirmModal
        open={showExitModal}
        title="수정을 그만 두시겠어요?"
        description="변경 내용이 저장되지 않아요"
        confirmText="나가기"
        cancelText="계속 수정하기"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() =>
          navigate(`/group/${id}/confirm`, {
            state: passedState,
          })
        }
      />
    </div>
  )
}
