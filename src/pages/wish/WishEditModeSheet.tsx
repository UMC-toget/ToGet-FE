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

// 체크 표시가 눈에 보일 정도로 유지된 뒤 시트가 닫히도록 주는 지연 시간 (WishTypeSheet과 동일)
const SELECT_CLOSE_DELAY_MS = 350

/** 위시 상품 카드의 "⋮"를 누르면 뜨는 액션 시트 (수정하기/삭제하기 중 선택, 피그마 기준) */
export default function WishEditModeSheet({ open, onClose, onSelectEdit, onSelectDelete }: WishEditModeSheetProps) {
  // BottomSheet는 open=false일 때 children을 언마운트하므로, 다시 열릴 때마다 이 state는 null로 새로 시작됩니다.
  const [picked, setPicked] = useState<EditModeOption | null>(null)

  const handlePick = (type: EditModeOption) => {
    setPicked(type)
    setTimeout(() => (type === 'edit' ? onSelectEdit() : onSelectDelete()), SELECT_CLOSE_DELAY_MS)
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
            {/* 체크 표시 유무와 무관하게 항상 같은 자리를 차지해야 텍스트 위치가 흔들리지 않습니다 */}
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
