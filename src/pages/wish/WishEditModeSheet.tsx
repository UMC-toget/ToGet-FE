import BottomSheet from '../../components/common/BottomSheet'

interface WishEditModeSheetProps {
  open: boolean
  onClose: () => void
  onSelectEdit: () => void
  onSelectDelete: () => void
}

/** 위시 상품 카드를 누르면 뜨는 액션 시트 (수정하기/삭제하기 중 선택, 피그마 기준) */
export default function WishEditModeSheet({ open, onClose, onSelectEdit, onSelectDelete }: WishEditModeSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-start">
        <button type="button" onClick={onSelectEdit} className="w-full py-3 text-left text-b1-m text-black">
          수정하기
        </button>
        <button type="button" onClick={onSelectDelete} className="w-full py-3 text-left text-b1-m text-black">
          삭제하기
        </button>
      </div>
    </BottomSheet>
  )
}
