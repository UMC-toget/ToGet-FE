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

/** 위시 상품 카드의 "⋮"를 누르면 뜨는 액션 시트 (수정하기/삭제하기 중 선택, 피그마 기준) */
export default function WishEditModeSheet({ open, onClose, onSelectEdit, onSelectDelete }: WishEditModeSheetProps) {
  const [picked, setPicked] = useState<EditModeOption | null>(null)

  const handlePick = (type: EditModeOption) => {
    setPicked(type)
    if (type === 'edit') {
      onSelectEdit()
    } else {
      onSelectDelete()
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-start">
        {OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => handlePick(option.type)}
            className="flex w-full items-center justify-between py-3"
          >
            <span className="text-b1-m text-black">{option.label}</span>
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
