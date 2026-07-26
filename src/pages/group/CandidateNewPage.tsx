import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import BottomSheet from '../../components/common/BottomSheet'
import TextField from '../../components/common/TextField'
import ConfirmModal from '../../components/common/ConfirmModal'
import PlusIcon from '../../components/icons/PlusIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import { postGiftCandidate } from '../../api/groupFundings'

const MEMO_MAX_LENGTH = 60

interface SelectedGift {
  name: string
  price: number
}

export default function CandidateNewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [selectedGift, setSelectedGift] = useState<SelectedGift | null>(null)
  const [memo, setMemo] = useState('')

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showInputSheet, setShowInputSheet] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const [inputName, setInputName] = useState('')
  const [inputPrice, setInputPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const hasChanges = selectedGift !== null || memo.trim().length > 0
  const canSubmit = selectedGift !== null && memo.trim().length > 0

  const handleLeave = () => {
    if (hasChanges) {
      setShowLeaveModal(true)
    } else {
      navigate(-1)
    }
  }

  const openDirectInput = () => {
    setShowAddSheet(false)
    setShowInputSheet(true)
  }

  const handleConfirmInput = () => {
    const price = parseInt(inputPrice.replace(/[^0-9]/g, ''), 10)
    if (!inputName.trim() || isNaN(price) || price <= 0) return
    setSelectedGift({ name: inputName.trim(), price })
    setInputName('')
    setInputPrice('')
    setShowInputSheet(false)
  }

  const handleSubmit = async () => {
    if (!selectedGift || submitting) return
    setSubmitting(true)
    try {
      await postGiftCandidate(id!, {
        giftName: selectedGift.name,
        giftPrice: selectedGift.price,
        note: memo.trim(),
      })
      navigate(`/group/${id}/candidates`)
    } catch (e) {
      console.error('후보 등록 실패', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header
        title="선물 후보 등록하기"
        onBack={handleLeave}
        right={
          <button type="button" onClick={handleLeave} className="text-b2-m text-gray-600">
            나가기
          </button>
        }
      />

      <div className="flex flex-col gap-5 px-[18px] py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3-sb text-black">후보 선물을 등록해주세요</h2>
          <p className="text-caption1-r text-gray-600">등록자 이름이 함께 표시돼요</p>
        </div>

        <div className="flex flex-col gap-4">
          {selectedGift ? (
            <div className="relative flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3">
              <div className="size-12 shrink-0 rounded-[6px] bg-background" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-b2-m text-black">{selectedGift.name}</span>
                <span className="text-caption1-r text-gray-600">
                  {selectedGift.price.toLocaleString()}원
                </span>
              </div>
              <button
                type="button"
                aria-label="선물 제거"
                onClick={() => setSelectedGift(null)}
                className="absolute right-[14px] top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100"
              >
                <CloseIcon className="size-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddSheet(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-5 text-b2-m text-gray-500"
            >
              <PlusIcon className="size-5" />
              선물 추가하기
            </button>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-b1-m text-black">
              소개글 또는 메모 <span className="text-pink-500">*</span>
            </p>
            <div className="rounded-lg bg-background px-4 py-3">
              <textarea
                value={memo}
                onChange={e => {
                  if (e.target.value.length <= MEMO_MAX_LENGTH) setMemo(e.target.value)
                }}
                placeholder="이 선물을 추천하는 이유를 적어주세요"
                rows={3}
                className="w-full resize-none bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
              />
              <p className="text-right text-b2-r text-gray-400">
                ({memo.length}/{MEMO_MAX_LENGTH})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        <Button className="pointer-events-auto" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          후보 등록하기
        </Button>
      </div>

      {/* 선물 추가 방법 선택 */}
      <BottomSheet open={showAddSheet} onClose={() => setShowAddSheet(false)}>
        <div className="flex flex-col gap-3 pb-8 pt-2">
          <p className="text-h3-sb text-black">선물을 어떻게 추가할까요?</p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={openDirectInput}
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-gray-900 text-b1-m text-white"
            >
              직접 입력하기
            </button>
            <button
              type="button"
              onClick={() => setShowAddSheet(false)}
              className="flex h-[52px] w-full items-center justify-center rounded-xl border border-gray-200 text-b1-m text-gray-700"
            >
              위시에서 불러오기
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* 직접 입력 바텀시트 */}
      <BottomSheet open={showInputSheet} onClose={() => setShowInputSheet(false)}>
        <div className="flex flex-col gap-4 pb-8 pt-2">
          <p className="text-h3-sb text-black">선물 정보를 입력해주세요</p>
          <TextField
            label="상품명"
            value={inputName}
            maxLength={40}
            placeholder="상품명을 입력해주세요"
            onChange={e => setInputName(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-b2-m text-black">가격</label>
            <div className="flex h-12 items-center rounded-lg bg-background px-4">
              <input
                type="number"
                value={inputPrice}
                onChange={e => setInputPrice(e.target.value)}
                placeholder="0"
                min={0}
                className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
              />
              <span className="ml-1 text-b1-r text-gray-500">원</span>
            </div>
          </div>
          <Button
            disabled={!inputName.trim() || !inputPrice || parseInt(inputPrice, 10) <= 0}
            onClick={handleConfirmInput}
          >
            확인
          </Button>
        </div>
      </BottomSheet>

      <ConfirmModal
        open={showLeaveModal}
        title="등록을 그만 두시겠어요?"
        description="작성 중인 내용은 저장되지 않아요"
        confirmText="나가기"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => navigate(-1)}
      />
    </div>
  )
}
