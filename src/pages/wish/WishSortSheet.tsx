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

/** 위시 정렬 선택 바텀시트 (피그마 1716:104259 기준) */
export default function WishSortSheet({
  open,
  selected,
  onClose,
  onSelect,
}: WishSortSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full flex-col gap-1 pb-4">
        {SORT_OPTIONS.map((option) => {
          const isSelected = option.id === selected
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onSelect(option.id)
                onClose()
              }}
              className="flex h-12 w-full items-center justify-between px-2 text-left transition-colors hover:bg-gray-50 rounded-xl"
            >
              <span
                className={`text-b1-m ${
                  isSelected ? 'font-semibold text-black' : 'text-gray-700'
                }`}
              >
                {option.label}
              </span>
              {isSelected && <CheckIcon className="size-5 text-pink-500 stroke-[2.5]" />}
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}
