import { useState } from 'react'
import BottomSheet from '../../components/common/BottomSheet'
import CheckIcon from '../../components/icons/CheckIcon'
import type { WishType } from '../../store/wishStore'

interface WishTypeSheetProps {
  open: boolean
  onClose: () => void
  onSelect: (type: WishType) => void
}

const OPTIONS: { type: WishType; label: string }[] = [
  { type: 'receive', label: '받고 싶은' },
  { type: 'give', label: '주고 싶은' },
]

// 체크 표시가 눈에 보일 정도로 유지된 뒤 시트가 닫히도록 주는 지연 시간
const SELECT_CLOSE_DELAY_MS = 350

/** 상품 카드에서 위시 등록 시 유형(받고 싶은/주고 싶은)을 고르는 바텀시트 (피그마 기준) */
export default function WishTypeSheet({ open, onClose, onSelect }: WishTypeSheetProps) {
  // BottomSheet는 open=false일 때 children을 언마운트하므로, 다시 열릴 때마다
  // 이 state는 초기값으로 새로 시작됩니다 (이전 선택 표시가 남지 않음).
  const [picked, setPicked] = useState<WishType | null>(null)

  const handlePick = (type: WishType) => {
    setPicked(type)
    setTimeout(() => onSelect(type), SELECT_CLOSE_DELAY_MS)
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-start gap-6">
        <p className="text-h3-sb text-black">위시 유형</p>
        <ul className="flex w-full flex-col">
          {OPTIONS.map((option) => (
            <li key={option.type} className="w-full">
              <button
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
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  )
}
