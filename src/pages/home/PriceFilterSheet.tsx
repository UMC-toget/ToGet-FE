import BottomSheet from '../../components/common/BottomSheet'
import { PRICE_FILTERS } from './products'
import type { PriceFilter } from './products'

interface PriceFilterSheetProps {
  open: boolean
  selected: PriceFilter
  onClose: () => void
  onSelect: (filter: PriceFilter) => void
}

/** 선물 둘러보기 가격대 선택 바텀시트 */
export default function PriceFilterSheet({ open, selected, onClose, onSelect }: PriceFilterSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} radius="lg">
      <div className="flex w-full flex-wrap gap-x-2 gap-y-4 pb-4 pt-2">
        {PRICE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => {
              onSelect(filter)
              onClose()
            }}
            className={`rounded-lg px-4 py-2 text-b2-m ${
              filter.id === selected.id ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
