import { useState } from 'react'
import BottomSheet from '../../components/common/BottomSheet'
import CheckIcon from '../../components/icons/CheckIcon'

type EditModeOption = 'edit' | 'delete'

interface WishEditModeSheetProps {
  open: boolean
  onClose: () => void
  onSelectEdit: () => void
  onSelectDelete: () => void
}

const OPTIONS: { type: EditModeOption; label: string }[] = [
  { type: 'edit', label: '수정하기' },
  { type: 'delete', label: '삭제하기' },
]

/** 선택 표시(체크)가 눈에 보인 뒤 실제 동작(라우팅/삭제 확인)으로 넘어가도록 주는 여유 시간 */
const SELECT_FEEDBACK_DELAY_MS = 180

/** 위시 상품 카드의 "⋮"를 누르면 뜨는 액션 시트 (수정하기/삭제하기 중 선택, 피그마 기준) */
export default function WishEditModeSheet({ open, onClose, onSelectEdit, onSelectDelete }: WishEditModeSheetProps) {
  const [picked, setPicked] = useState<EditModeOption | null>(null)

  const handlePick = (type: EditModeOption) => {
    setPicked(type)
    setTimeout(() => {
      if (type === 'edit') {
        onSelectEdit()
      } else {
        onSelectDelete()
      }
    }, SELECT_FEEDBACK_DELAY_MS)
  }

  const handleClose = () => {
    setPicked(null)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex w-full flex-col items-start">
        {OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => handlePick(option.type)}
            className="flex w-full items-center justify-between py-2"
          >
            <span
              className={`text-b1-m ${
                picked !== null && picked !== option.type ? 'text-gray-600' : 'text-black'
              }`}
            >
              {option.label}
            </span>
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-black text-white ${
                picked === option.type ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <CheckIcon className="size-3.5" />
            </span>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
