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

const OPTIONS: { type: WishType; label: string }[] = [
  { type: 'receive', label: '받고 싶은' },
  { type: 'give', label: '주고 싶은' },
]

/** 상품 카드에서 위시 등록 시 유형(받고 싶은/주고 싶은)을 고르는 바텀시트 (피그마 기준). 둘 다 선택 가능합니다 */
export default function WishTypeSheet({ open, selected, onClose, onToggle }: WishTypeSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-start gap-6">
        <p className="text-h3-sb text-black">위시 유형</p>
        <ul className="flex w-full flex-col">
          {OPTIONS.map((option) => (
            <li key={option.type} className="w-full">
              <button
                type="button"
                onClick={() => onToggle(option.type)}
                className="flex w-full items-center justify-between py-3"
              >
                <span className="text-b1-m text-black">{option.label}</span>
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
