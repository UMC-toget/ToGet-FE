interface CategoryChipsProps {
  categories: readonly string[]
  /** 단일 선택이면 string, 다중 선택(체크박스처럼 여러 개 동시 선택)이면 string[] */
  selected: string | readonly string[]
  /** 칩 하나를 눌렀을 때 호출됩니다. 다중 선택의 경우 추가/해제 토글 로직은 호출부에서 처리합니다. */
  onSelect: (category: string) => void
}

/**
 * 카테고리 필터/선택 칩 목록 (홈 화면 기준: rounded-full px-4 py-3).
 * 선택 여부와 상관없이 항상 border를 유지하고 border-color만 바꿔서, 선택 시 옆 칩이 밀리는 문제를 방지합니다.
 */
export default function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  const isSelected = (c: string) => (Array.isArray(selected) ? selected.includes(c) : c === selected)

  return (
    <div className="flex items-center gap-2">
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={`rounded-full border px-4 py-3 text-b2-m ${
            isSelected(c) ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
