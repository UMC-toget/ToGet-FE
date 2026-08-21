import { useEffect, useRef } from 'react'
import BottomSheet from '../../components/common/BottomSheet'
import CheckIcon from '../../components/icons/CheckIcon'
import type { WishType } from '../../store/wishStore'

interface WishTypeSheetProps {
  open: boolean
  /** 이 상품에 현재 등록된 위시 유형 목록 (0~2개) */
  selected: WishType[]
  onClose: () => void
  /** 유형을 누르면 그 유형만 켜짐/꺼짐이 토글됩니다. 둘 다 켤 수 있습니다 */
  onToggle: (type: WishType) => void
}

const AUTO_CLOSE_DELAY_MS = 500

const OPTIONS: { type: WishType; label: string }[] = [
  { type: 'receive', label: '받고 싶은' },
  { type: 'give', label: '주고 싶은' },
]

/** 상품 카드에서 위시 등록 시 유형(받고 싶은/주고 싶은)을 고르는 바텀시트 (피그마 기준). 둘 다 선택 가능합니다 */
export default function WishTypeSheet({ open, selected, onClose, onToggle }: WishTypeSheetProps) {
  const closeTimerRef = useRef<number | null>(null)

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  // 시트가 닫힌 뒤(외부 클릭 등)까지 타이머가 살아있지 않도록, 언마운트 시에도 정리합니다.
  useEffect(() => {
    if (!open) clearCloseTimer()
    return clearCloseTimer
  }, [open])

  const handleToggle = (type: WishType) => {
    onToggle(type)
    // 선택할 때마다 타이머를 새로 시작 - 연속으로 받고 싶은/주고 싶은을 모두 고를 시간을 줍니다.
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(onClose, AUTO_CLOSE_DELAY_MS)
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
                onClick={() => handleToggle(option.type)}
                className="flex w-full items-center justify-between py-2"
              >
                <span
                  className={`text-b1-m ${selected.includes(option.type) ? 'text-black' : 'text-gray-600'}`}
                >
                  {option.label}
                </span>
                {/* 체크 표시 유무와 무관하게 항상 같은 자리를 차지해야 텍스트 위치가 흔들리지 않습니다 */}
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-black text-white ${
                    selected.includes(option.type) ? 'opacity-100' : 'opacity-0'
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
