import BottomSheet from '../../components/common/BottomSheet'
import CheckIcon from '../../components/icons/CheckIcon'

export type SortOrder = 'latest' | 'oldest'

interface WishSortSheetProps {
  open: boolean
  selected: SortOrder
  onClose: () => void
  onSelect: (sortOrder: SortOrder) => void
}

const SORT_OPTIONS: { id: SortOrder; label: string }[] = [
  { id: 'latest', label: '최신순' },
  { id: 'oldest', label: '오래된순' },
]

/**
 * 위시 정렬 선택 바텀시트 (피그마 1716:103965 / 1716:104129 기준).
 * 선택 표시는 WishTypeSheet(위시 유형 선택)와 동일하게 검정 원 + 흰 체크 아이콘을 씁니다.
 */
export default function WishSortSheet({
  open,
  selected,
  onClose,
  onSelect,
}: WishSortSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <ul className="flex w-full flex-col">
        {SORT_OPTIONS.map((option) => {
          const isSelected = option.id === selected
          return (
            <li key={option.id} className="w-full">
              <button
                type="button"
                onClick={() => {
                  onSelect(option.id)
                  onClose()
                }}
                className="flex w-full items-center justify-between py-2"
              >
                <span className={`text-b1-m ${isSelected ? 'text-black' : 'text-gray-600'}`}>
                  {option.label}
                </span>
                {/* 체크 표시 유무와 무관하게 항상 같은 자리를 차지해야 텍스트 위치가 흔들리지 않습니다 */}
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-black text-white ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <CheckIcon className="size-3.5" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}
